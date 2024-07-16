import { PROTO_PATH } from "../protos/index.js";
import extractJSON from "../utils/extractJSON.js";
import GrpcClient from "../components/GrpcClient.js";

const proto = PROTO_PATH();
const { host_1, host_2, host_3 } = extractJSON({
  path: "../configs/hosts.json",
});

export const micro1 = new GrpcClient({ protoBuffer: proto, host: host_1 });
export const micro2 = new GrpcClient({ protoBuffer: proto, host: host_2 });
export const micro3 = new GrpcClient({ protoBuffer: proto, host: host_3 });
