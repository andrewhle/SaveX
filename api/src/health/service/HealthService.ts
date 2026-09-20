export type HealthStatus = {
  status: "ok";
  uptime: number;
  timestamp: string;
};

export const healthService = {
  getStatus(): HealthStatus {
    return {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  },
};
