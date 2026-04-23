const express = require("express");

const authService = require("./services/authService");
const routes = require("./routes");
const { AppError } = require("./utils/errors");

function getBearerToken(req) {
  const authorizationHeader = req.headers.authorization || "";

  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice("Bearer ".length).trim();
}

function applyRoute(app, route) {
  app[route.method.toLowerCase()](route.path, async (req, res, next) => {
    try {
      let authUser = null;
      const token = getBearerToken(req);

      if (route.roles && route.roles.length > 0) {
        authUser = await authService.getAuthenticatedUser(token, route.roles);
      }

      const result = await route.handler({
        authUser,
        body: req.body || {},
        params: req.params || {},
        query: req.query || {},
        req,
        res,
        token,
      });

      res.status(result.statusCode || 200).json({
        success: true,
        ...(result.message ? { message: result.message } : {}),
        ...(Object.prototype.hasOwnProperty.call(result, "data")
          ? { data: result.data }
          : {}),
      });
    } catch (error) {
      next(error);
    }
  });
}

function createApp() {
  const app = express();

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }

    next();
  });

  app.use(express.json({ limit: "50mb" }));

  for (const route of routes) {
    applyRoute(app, route);
  }

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found.",
    });
  });

  app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
      res.status(400).json({
        success: false,
        message: "Invalid JSON body.",
      });
      return;
    }

    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message =
      error instanceof AppError
        ? error.message
        : "Something went wrong while processing the request.";

    res.status(statusCode).json({
      success: false,
      message,
      ...(error instanceof AppError && error.details ? { details: error.details } : {}),
    });
  });

  return app;
}

module.exports = {
  createApp,
};
