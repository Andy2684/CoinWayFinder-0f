// app/api/analytics/cohort/route.ts

import { NextResponse } from "next/server";

// Временная замена реальной выборки из БД.
// Возвращаем пустой массив когорты, пока нет реального клиента.
export async function GET() {
  try {
    const cohortData: { month: string; count: number }[] = []; 

    console.log("→ [Cohort] Returning stub data:", cohortData);

    return NextResponse.json({ success: true, cohort: cohortData });
  } catch (error) {
    console.error("Cohort analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load cohort analytics" },
      { status: 500 }
    );
  }
}
