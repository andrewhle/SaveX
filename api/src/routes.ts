import type { RequestHandler } from "express";
import { getHealth } from "./health/controller/actions/GetHealthAction";
import { healthController } from "./health/controller/HealthController";
import type { RouteDefinition } from "./types/Route";

function createRoute(
  controllerRoute: Pick<RouteDefinition, "method" | "path" | "middlewares">,
  handler: RequestHandler,
): RouteDefinition {
  return {
    method: controllerRoute.method,
    path: controllerRoute.path,
    middlewares: controllerRoute.middlewares || [],
    handler,
  };
}

export const routes: RouteDefinition[] = [
  createRoute(healthController.getHealth, getHealth),
];
