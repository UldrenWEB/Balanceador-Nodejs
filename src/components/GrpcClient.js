import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import extractJSON from "../utils/extractJSON.js";
import createServiceLogger from "../utils/logger.js";

const config = extractJSON({ path: "../configs/grpcConfig.json" });

class GrpcClient {
  constructor({ protoBuffer, host }) {
    this.packageDefinition;
    this.host = host;
    this.protoBuffer = protoBuffer;
    this.logger = createServiceLogger(host);
    this.#loader();
  }

  #loader = () => {
    this.packageDefinition = protoLoader.loadSync(this.protoBuffer, config);
  };

  executeMethod = async ({
    packageName,
    service,
    method,
    params = {},
    callback,
  }) => {
    if (!this.packageDefinition) return false;

    const MyPackage = grpc.loadPackageDefinition(this.packageDefinition)[
      packageName
    ];
    const client = new MyPackage[service](
      this.host,
      grpc.credentials.createInsecure()
    );

    const theCallback = (error, response) => {
      if (error) {
        this.logger.error(`Error executing method ${method}: ${error.message}`);
      } else {
        this.logger.info(
          `Method ${method} executed successfully: ${JSON.stringify(response)}`
        );
      }
      callback(error, response);
    };

    const result = client[method]({ ...params }, theCallback);

    return result;
  };
}

export default GrpcClient;
