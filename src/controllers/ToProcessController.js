import { micro1, micro2, micro3 } from "../instances/microservice.js";
import Balancer from "../components/Balancer.js";

const balancer = new Balancer({
  microservices: [micro1, micro2, micro3],
  packageName: "crud",
  serviceName: "Crud",
  methodName: "StatisticsComputer",
  props: [
    { name: "cpuUsage", value: 0.55 },
    { name: "ramUsage", value: 0.45 },
  ],
});

class ToProcessController {
  static executeMethod = async (req, res) => {
    const { method, params } = req.body;
    const callback = (err, response) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json(response);
    };

    try {
      await balancer.handleRequest(method, params, callback);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

export default ToProcessController;
