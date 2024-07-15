import { parentPort, workerData } from "worker_threads";
import BalancerController from "../controllers/BalancerController.js";
import GrpcClient from "../components/GrpcClient.js";
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

const processRequest = async ({ method, params }) => {
  return new Promise((resolve, reject) => {
    const callback = (err, response) => {
      if (err) return reject(err);
      resolve(response);
    };

    balancer.handleRequest(method, params, callback);
  });
};

processRequest(workerData)
  .then((response) => {
    parentPort.postMessage({ response });
  })
  .catch((error) => {
    parentPort.postMessage({ error: error.message });
  });
