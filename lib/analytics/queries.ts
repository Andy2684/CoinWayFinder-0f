// lib/analytics/queries.ts

import { sql } from "../db";  // <- относительный путь к lib/db.ts

export interface PlanCount { plan: string; count: number; }
export interface RoleCount { role: string; count: number; }

export interface AnalyticsResult {
  newUsers: number;
  userGrowthRate: number;
  usersByPlan: PlanCount[];
  usersByRole: RoleCount[];
  verificationRate: number;
}

export async function getAnalytics(): Promise<AnalyticsResult> {
  // Поскольку stub sql всегда возвращает [], заполняем нулями и пустыми массивами
  return {
    newUsers: 0,
    userGrowthRate: 0,
    verificationRate: 0,
    usersByPlan: [],
    usersByRole: [],
  };
}
