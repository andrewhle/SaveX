import type { RequestHandler } from "express";
import { healthService } from "../../service/HealthService";

export const getHealth: RequestHandler = (_req, res) => {
  res.json(healthService.getStatus());
};
