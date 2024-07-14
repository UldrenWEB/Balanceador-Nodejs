import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PROTO_PATH = () => {
  const thepath = path.join(__dirname, "proto_microservice.proto");
  return thepath;
};
