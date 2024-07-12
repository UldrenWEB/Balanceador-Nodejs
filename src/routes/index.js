import ExpressAdapter from "../adapters/ExpressAdapter.js";
import { pruebaRouter } from "./prueba.js";

const adapter = new ExpressAdapter({});

export const indexRouter = () => {
  const iRouter = adapter.createRouter();

  adapter.setRouter({
    route: "/prueba",
    router: iRouter,
    callbackRouter: pruebaRouter(),
  });

  return iRouter;
};
