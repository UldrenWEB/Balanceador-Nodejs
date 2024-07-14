class BalancerController {
  constructor(microservices) {
    this.microservices = microservices;
    this.metrics = new Map();
    this.#initializeMetrics();
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
    for (const service of this.microservices) {
      const callback = (error, response) => {
        if (error) return console.error(`Ha salido de actualizar ${error}`);
        const serviceMetrics = this.metrics.get(service.host);
        serviceMetrics.cpuUsage = response.cpuUsage;
        serviceMetrics.ramUsage = response.ramUsage;
        this.metrics.set(service.host, serviceMetrics);
      };

      await service.executeMethod({
        callback,
        method: "StatisticsComputer",
        packageName: "crud",
        service: "Crud",
        params: {},
      });
    }
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

      if (score > highestScore) {
        highestScore = score;
        selectedService = host;
      }
    }

    return selectedService;
  };

  handleRequest = async (method, params, callback) => {
    await this.updateMetrics();
    const selectedService = this.selectMicroservice();
    const service = this.microservices.find((s) => s.host === selectedService);
    const serviceMetrics = this.metrics.get(service.host);
    serviceMetrics.totalRequests += 1;
    serviceMetrics.activeRequests += 1;
    service.executeMethod({
      callback,
      method,
      params,
      packageName: "crud",
      service: "Crud",
    });
    serviceMetrics.activeRequests -= 1;
    serviceMetrics.completedRequests += 1;
  };
}
