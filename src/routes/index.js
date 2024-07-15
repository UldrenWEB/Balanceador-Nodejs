import ExpressAdapter from "../adapters/ExpressAdapter.js";
import { toProcessRouter } from "./toProcess.js";

const adapter = new ExpressAdapter({});

export const indexRouter = () => {
  const iRouter = adapter.createRouter();

  adapter.setRouter({
    route: "/toProcess",
    router: iRouter,
    callbackRouter: toProcessRouter(),
  });

  return iRouter;
};
