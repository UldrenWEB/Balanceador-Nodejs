import express from "express";
import dotenv from "dotenv";

dotenv.config();

/**
 * Adapter class for Express server.
 */
class ExpressAdapter {
  /**
   * Creates an instance of ExpressAdapter.
   * @param {number} portDefault - The default port number.
   */
  constructor({ portDefault = 8080 }) {
    this.app = express();
    this.port = process.env.PORT ?? portDefault;
  }

  /**
   * Returns the specified type from the Express namespace.
   * @param {string} typeName - The name of the type to retrieve.
   * @returns {express.Type} - The specified type from the Express namespace.
   */

  /**
   * Starts the Express server.
   * @param {() => void} callback - The callback function to be executed after the server starts.
   */
  startServer = (callback) => {
    this.app.listen(this.port, callback);
  };

  /**
   * Sets a route in the Express application with the provided callback router.
   *
   * @param {string} route - The route path.
   * @param {express.Router} callbackRouter - The callback router to be used for the route.
   */
  setRouteApp = ({ route, callbackRouter }) => {
    this.app.use(route, callbackRouter);
  };

  /**
   * Sets the callback router for the given router.
   *
   * @param {string} route - The route path.
   * @param {express.Router} router - The main router.
   * @param {express.Router} callbackRouter - The callback router to be set.
   */
  setRouter = ({ route, router, callbackRouter }) => {
    router.use(route, callbackRouter);
  };

  /**
   * Sets a route on the provided Express router with the specified method and callback.
   *
   * @param {object} options - The options for setting the route.
   * @param {string} options.method - The HTTP method for the route (e.g., 'get', 'post', 'put', 'delete').
   * @param {express.Router} options.router - The Express router on which to set the route.
   * @param {string} options.route - The route path.
   * @param {express.RequestHandler} options.callback - The callback function to handle the route.
   */
  setRouteRouter = ({ method, route, router, callback }) => {
    router[method](route, ...callback);
  };

  /**
   * Creates an instance of Express Router.
   * @returns {express.Router} - The Express Router instance.
   */
  createRouter = () => {
    return express.Router();
  };

  /**
   * Adds a personalized middleware to the Express app.
   * @param middleware - The middleware function to be added.
   */
  middlewarePersonalized = ({ middleware, router = null }) => {
    !router ? this.app.use(middleware) : router.use(middleware);
  };

  /**
   * Adds JSON middleware to the Express server.
   */
  middlewareJSON = () => {
    this.app.use(express.json());
  };

  /**
   * Configures the Express application to use the URL-encoded middleware.
   * This middleware parses incoming requests with URL-encoded payloads.
   */
  middlewareURLEncoded = () => {
    this.app.use(express.urlencoded({ extended: true }));
  };
}

export default ExpressAdapter;
