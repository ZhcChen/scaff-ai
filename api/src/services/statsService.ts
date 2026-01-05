import { sql } from "drizzle-orm";
import { db } from "../config";
import { users, roles, requestLogs } from "../models";

export const statsService = {
  // 获取仪表盘统计
  async getDashboardStats() {
    // 用户总数
    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.deletedAt} is null`);

    // 角色总数
    const [roleCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(roles);

    // 今日请求数
    const [todayRequests] = await db
      .select({ count: sql<number>`count(*)` })
      .from(requestLogs)
      .where(sql`date(${requestLogs.createdAt}) = curdate()`);

    // 最近 7 天请求趋势
    const requestTrend = await db
      .select({
        date: sql<string>`date(${requestLogs.createdAt})`.as("date"),
        count: sql<number>`count(*)`.as("count"),
      })
      .from(requestLogs)
      .where(sql`${requestLogs.createdAt} >= date_sub(curdate(), interval 7 day)`)
      .groupBy(sql`date(${requestLogs.createdAt})`)
      .orderBy(sql`date(${requestLogs.createdAt})`);

    return {
      userCount: userCount.count,
      roleCount: roleCount.count,
      todayRequests: todayRequests.count,
      requestTrend,
    };
  },
};
