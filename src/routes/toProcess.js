import ExpressAdapter from "../adapters/ExpressAdapter.js";
import GrpcClient from "../components/GrpcClient.js";
import BalancerController from "../controllers/BalancerController.js";
import { PROTO_PATH } from "../protos/index.js";
import extractJSON from "../utils/extractJSON.js";

const proto = PROTO_PATH();
const { host_1, host_2, host_3 } = extractJSON({
  path: "../configs/hosts.json",
});

const micro1 = new GrpcClient({ protoBuffer: proto, host: host_1 });
const micro2 = new GrpcClient({ protoBuffer: proto, host: host_2 });
const micro3 = new GrpcClient({ protoBuffer: proto, host: host_3 });

const balancer = BalancerController.getInstance([micro1, micro2, micro3]);
const adapter = new ExpressAdapter({});

export const toProcessRouter = () => {
  const router = adapter.createRouter();

  adapter.setRouteRouter({
    method: "post",
    route: "/",
    router,
    callback: [
      async (req, res) => {
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
          console.log("Aqui error", err);
          res.status(500).json({ error: err.message });
        }
      },
    ],
  });

  adapter.setRouteRouter({
    method: "get",
    route: "/",
    router,
    callback: [
      (_req, res) => {
        res
          .status(404)
          .json({ error: "Este endpoint se debe usar es en post" });
      },
    ],
  });

  return router;
};
