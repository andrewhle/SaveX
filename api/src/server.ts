import "dotenv/config";
import cors from "cors";
import express, { Router } from "express";
import { routes } from "./routes";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.disable("x-powered-by");
app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:3000" }));
app.use(express.json());

const router = Router();

for (const route of routes) {
  router[route.method](route.path, ...route.middlewares, route.handler);
}

app.use(router);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
