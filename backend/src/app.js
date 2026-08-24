import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import  healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import organizationRoutes from "./routes/organization.routes.js";
import projectRoutes from "./routes/project.routes.js";
import queueRoutes from "./routes/queue.routes.js";
import jobRoutes from "./routes/job.routes.js";
import scheduledJobRoutes from "./routes/scheduled-job.routes.js";
import deadLetterRoutes from "./routes/dead-letter.routes.js";
import workerMonitoringRoutes from "./routes/worker-monitoring.routes.js";
import metricsRoutes from "./routes/metrics.routes.js";

import {
  notFoundHandler,
  errorHandler,
} from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/health",healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1", projectRoutes);
app.use("/api/v1", queueRoutes);
app.use("/api/v1", jobRoutes);
app.use("/api/v1", scheduledJobRoutes);
app.use("/api/v1", deadLetterRoutes);
app.use("/api/v1", workerMonitoringRoutes);
app.use("/api/v1", metricsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
