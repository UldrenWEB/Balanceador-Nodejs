import ExpressAdapter from "./src/adapters/ExpressAdapter.js";
import { corsMiddleware } from "./src/middlewares/cors.js";
import { indexRouter } from "./src/routes/index.js";

const adapter = new ExpressAdapter({});

adapter.middlewareJSON();
adapter.middlewareURLEncoded();
adapter.middlewarePersonalized({ middleware: corsMiddleware });

adapter.setRouteApp({
  route: "/api",
  callbackRouter: indexRouter(),
});

adapter.startServer(() => {
  console.log(`Server started at http://localhost:${adapter.port}`);
});
