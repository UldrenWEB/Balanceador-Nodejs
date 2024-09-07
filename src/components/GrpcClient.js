import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import extractJSON from "../utils/extractJSON.js";
import createServiceLogger from "../utils/logger.js";

const config = extractJSON({ path: "../configs/grpcConfig.json" });

class GrpcClient {
  constructor({
    protoBuffer,
    host,
    defaultPackageName = "",
    defaultService = "",
  }) {
    this.packageDefinition;
    this.host = host;
    this.protoBuffer = protoBuffer;
    this.defaultPackageName = defaultPackageName;
    this.defaultService = defaultService;
    this.logger = createServiceLogger(host);
    this.#loader();
  }

  #loader = () => {
    this.packageDefinition = protoLoader.loadSync(this.protoBuffer, config);
  };

  setDefaultPackageName = (packageName) => {
    this.defaultPackageName = packageName;
  };

  setDefaultService = (service) => {
    this.defaultService = service;
  };

  executeMethod = ({ method, params = {}, packageName, service, callback }) => {
    const effectivePackageName = packageName || this.defaultPackageName;
    const effectiveService = service || this.defaultService;

    if (!this.packageDefinition) return false;
    if (!effectivePackageName || !effectiveService) {
      throw new Error("PackageName or Service is not set");
    }

    const MyPackage = grpc.loadPackageDefinition(this.packageDefinition)[
      effectivePackageName
    ];
    const client = new MyPackage[effectiveService](
      this.host,
      grpc.credentials.createInsecure()
    );

    const theCallback = (error, response) => {
      callback(error, response);
    };

    const result = client[method]({ ...params }, theCallback);

    return result;
  };

  executeMethodPromise = ({ method, params = {}, packageName, service }) => {
    return new Promise((resolve, reject) => {
      const effectivePackageName = packageName || this.defaultPackageName;
      const effectiveService = service || this.defaultService;

      if (!this.packageDefinition) {
        return reject(new Error("Package definition not loaded"));
      }
      if (!effectivePackageName || !effectiveService) {
        return reject(new Error("PackageName or Service is not set"));
      }

      const MyPackage = grpc.loadPackageDefinition(this.packageDefinition)[
        effectivePackageName
      ];
      const client = new MyPackage[effectiveService](
        this.host,
        grpc.credentials.createInsecure()
      );

      client[method]({ ...params }, (error, response) => {
        if (error) {
          return reject(error);
        }
        resolve(response);
      });
    });
  };
}

export default GrpcClient;
