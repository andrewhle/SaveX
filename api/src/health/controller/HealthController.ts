import type { ControllerRoute } from "../../types/Route";

export const healthController = {
  getHealth: {
    method: "get",
    path: "/health",
    middlewares: [],
  },
} satisfies Record<string, ControllerRoute>;
