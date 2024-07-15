class BalancerController {
  constructor(microservices) {
    this.microservices = microservices;
    this.metrics = new Map();
    this.#initializeMetrics();
  }

  static getInstance(microservices) {
    if (!BalancerController.instance) {
      BalancerController.instance = new BalancerController(microservices);
    }
    return BalancerController.instance;
  }

  #initializeMetrics = () => {
    this.microservices.forEach((service) => {
      this.metrics.set(service.host, {
        completedRequests: 0,
        totalRequests: 0,
        activeRequests: 0,
        cpuUsage: 0,
        ramUsage: 0,
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

          serviceMetrics.cpuUsage =
            parseFloat(response.cpuUsage.replace("%", "")) / 100;
          serviceMetrics.ramUsage =
            parseFloat(response.ramUsage.replace("%", "")) / 100;

          this.metrics.set(service.host, serviceMetrics);
          resolve();
        };

        service.executeMethod({
          callback,
          method: "StatisticsComputer",
          packageName: "crud",
          service: "Crud",
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
      const score =
        0.25 * (1 - metrics.cpuUsage) +
        0.3 * (1 - metrics.ramUsage) +
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
      packageName: "crud",
      service: "Crud",
    });
  };
}

export default BalancerController;
