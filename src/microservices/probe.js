import GrpcClient from "../components/GrpcClient.js";
import path from "node:path";

const PROTO_PATH = path.join(
  process.cwd(),
  "protos",
  "proto_microservice.proto"
);

const service = new GrpcClient({
  protoBuffer: PROTO_PATH,
  host: "127.0.0.1:50051",
});

const callback = (error, response) => {
  if (error) return console.error(`Ha salido de actualizar ${error}`);

  console.log(response);
  const cpu = response.cpuUsage;
  const ram = response.ramUsage;
  console.log(`Aqui cpu -> ${cpu} | Aqui ram -> ${ram}`);
};

(async () => {
  await service.executeMethod({
    callback,
    method: "StatisticsComputer",
    packageName: "crud",
    service: "Crud",
    params: {},
  });
})();
