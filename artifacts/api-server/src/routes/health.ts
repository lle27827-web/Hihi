import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", async (req, res) => {
  try {
    await pool.query("select 1");
    res.json(HealthCheckResponse.parse({ status: "ok" }));
  } catch (error) {
    req.log.error(
      { errorType: error instanceof Error ? error.name : "unknown" },
      "Database health check failed",
    );
    res
      .status(503)
      .json(HealthCheckResponse.parse({ status: "database_unavailable" }));
  }
});

export default router;
