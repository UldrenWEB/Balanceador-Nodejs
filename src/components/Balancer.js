class Balancer {
  constructor({ microservices, packageName, serviceName, methodName, props }) {
    this.microservices = microservices;
    this.packageName = packageName;
    this.serviceName = serviceName;
    this.methodName = methodName;
    this.props = props; // Guardar props en la instancia
    this.metrics = new Map();
    this.#initializeMetrics();
  }

  static getInstance(microservices) {
    if (!Balancer.instance) {
      Balancer.instance = new Balancer(microservices);
    }
    return Balancer.instance;
  }

  #initializeMetrics = () => {
    this.microservices.forEach((service) => {
      this.metrics.set(service.host, {
        completedRequests: 0,
        totalRequests: 0,
        activeRequests: 0,
        ...this.props.reduce((acc, prop) => {
          acc[prop.name] = { value: 0, isThan: false };
          return acc;
        }, {}),
      });
    });
  };

  updateMetrics = async () => {
    const updatePromises = this.microservices.map((service) => {
      return new Promise((resolve, reject) => {
        const callback = (error, response) => {
          if (error) {
            console.error(`Error al actualizar: ${error}`);
            return reject(error);
          }
          const serviceMetrics = this.metrics.get(service.host);

          this.props.forEach((prop) => {
            if (response[prop.name].endsWith("%")) {
              serviceMetrics[prop.name] = {
                value: parseFloat(response[prop.name].replace("%", "")) / 100,
                isThan: true,
              };
            } else {
              serviceMetrics[prop.name] = {
                value: parseFloat(response[prop.name]),
                isThan: false,
              };
            }
          });

          this.metrics.set(service.host, serviceMetrics);
          resolve();
        };

        service.executeMethod({
          callback,
          method: this.methodName,
          packageName: this.packageName,
          service: this.serviceName,
          params: {},
        });
      });
    });

    await Promise.all(updatePromises);
  };

  calculateEffectiveness(serviceMetrics) {
    return serviceMetrics.completedRequests / serviceMetrics.totalRequests || 0;
  }

  selectMicroservice = () => {
    let selectedService = null;
    let highestScore = -1;

    for (const [host, metrics] of this.metrics.entries()) {
      const effectiveness = this.calculateEffectiveness(metrics);
      let dynamicScore = 0;

      this.props.forEach((prop) => {
        if (prop.name in metrics) {
          if (metrics[prop.name].isThan) {
            dynamicScore += prop.value * (1 - metrics[prop.name].value);
          } else {
            dynamicScore += prop.value * metrics[prop.name].value;
          }
        }
      });

      const remainingWeight = 0.55;
      const score =
        remainingWeight * dynamicScore +
        0.25 * effectiveness +
        0.2 * (1 - metrics.activeRequests);
      if (score > highestScore && metrics.activeRequests === 0) {
        highestScore = score;
        selectedService = host;
      }
    }

    return selectedService;
  };

  handleRequest = async (method, params, callback) => {
    await this.updateMetrics();
    const selectedService = this.selectMicroservice();
    console.log("Selecciono:", selectedService);
    const service = this.microservices.find((s) => s.host === selectedService);
    const serviceMetrics = this.metrics.get(service.host);
    serviceMetrics.totalRequests += 1;
    serviceMetrics.activeRequests += 1;

    this.metrics.set(service.host, serviceMetrics);
    service.executeMethod({
      callback: (error, response) => {
        if (error) return console.error(`Error ejecutando ${method}: ${error}`);
        serviceMetrics.activeRequests -= 1;
        serviceMetrics.completedRequests += 1;
        this.metrics.set(service.host, serviceMetrics);
        callback(error, response);
      },
      method,
      params,
      packageName: this.packageName,
      service: this.serviceName,
    });
  };
}

export default Balancer;
