import { Elysia } from "elysia";
import { statsService } from "../services";
import { ok } from "../utils";
import { authPlugin } from "../plugins";

export const statsRoutes = new Elysia({ prefix: "/stats" })
  .use(authPlugin)

  // 获取仪表盘统计
  .get(
    "/dashboard",
    async () => {
      const data = await statsService.getDashboardStats();
      return ok(data);
    },
    { requireAuth: true }
  );
