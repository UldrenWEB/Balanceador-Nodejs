import ExpressAdapter from "../adapters/ExpressAdapter.js";

const adapter = new ExpressAdapter({});

export const pruebaRouter = () => {
  const router = adapter.createRouter();

  adapter.setRouteRouter({
    method: "get",
    route: "/",
    router,
    callback: [
      (_req, res) => {
        res.status(201).json({
          message: "Prueba de este router, aqui iria el controller",
        });
      },
    ],
  });

  return router;
};
