import type { ErrorRequestHandler, RequestHandler } from "express";

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export type RouteDefinition = {
  method: HttpMethod;
  path: string;
  middlewares: (RequestHandler | ErrorRequestHandler)[];
  handler: RequestHandler;
};

/** What a controller declares; the handler comes from its action. */
export type ControllerRoute = Pick<
  RouteDefinition,
  "method" | "path" | "middlewares"
>;
