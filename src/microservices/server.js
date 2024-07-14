//Mi primer microservicio
import GrpcServer from "../components/GrpcServer.js";
import extractJSON from "../utils/extractJSON.js";
import os from "node:os";
import { PROTO_PATH as path } from "../protos/index.js";

const PROTO_PATH = path();
const host = extractJSON({ path: "../configs/hosts.json" }).host_1;

const InsertRegister = async (call, callback) => {};

const Statistics = async (call, callback) => {
  const cpuUsage = os.loadavg()[0] / os.cpus().length;
  const ramUsage = `${(
    ((os.totalmem() - os.freemem()) / os.totalmem()) *
    100
  ).toFixed(2)}%`;

  callback(null, {
    cpuUsage: `${cpuUsage}%`,
    ramUsage: `${ramUsage}`,
  });
};

const init = () => {
  const server = new GrpcServer({
    protoBuffer: PROTO_PATH,
    host,
  });

  server.addService("crud", "Crud", {
    InsertRegister: InsertRegister,
    StatisticsComputer: Statistics,
  });

  server.start();
};

init();
