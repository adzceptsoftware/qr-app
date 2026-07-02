import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middleware/errors";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? "*", credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/v1", routes);
app.use(errorHandler);

export default app;
