import cors from "cors";

/**
 * Middleware function to handle CORS (Cross-Origin Resource Sharing).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const corsMiddleware = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  cors({ credentials: true, origin: true })(req, res, next);
};
