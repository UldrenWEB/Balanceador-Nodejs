import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import extractJSON from "../utils/extractJSON.js";
const config = extractJSON({ path: "../configs/grpcConfig.json" });

class GRPCServer {
  constructor({ protoBuffer, host }) {
    this.protoBuffer = protoBuffer;
    this.host = host;
    this.packageDefinition = null;
    this.server = new grpc.Server();
    this.#loadProtos();
  }

  #loadProtos() {
    try {
      this.packageDefinition = protoLoader.loadSync(this.protoBuffer, config);
    } catch (error) {
      console.error(
        `Hubo un error al cargar el archivo .proto ${error.message}`
      );
      throw new Error(`Error al cargar el proto`);
    }
  }

  addService(packageName, serviceName, methods) {
    const packageObject = grpc.loadPackageDefinition(this.packageDefinition)[
      packageName
    ];
    const service = packageObject[serviceName].service;
    this.server.addService(service, methods);
  }

  start() {
    this.server.bindAsync(
      this.host,
      grpc.ServerCredentials.createInsecure(),
      (err, _port) => {
        if (err) {
          console.error(`Failed to start server: ${err.message}`);
          return;
        }
        console.log(`Server running at ${this.host}`);
        this.server.start();
      }
    );
  }
}

export default GRPCServer;
