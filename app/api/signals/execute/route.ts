import { type NextRequest, NextResponse } from "next/server";

// Mock execution results
const mockExecutions = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signalId, executionConfig } = body;

    if (!signalId) {
      return NextResponse.json(
        { success: false, error: "Signal ID is required" },
        { status: 400 },
      );
    }

    // Simulate execution logic
    const execution = {
      signalId,
      orderId: `order_${Date.now()}`,
      status: "EXECUTED",
      executionPrice: 43250 + Math.random() * 100 - 50,
      executionTime: new Date().toISOString(),
      exchange: "binance",
      quantity: 0.1,
      fees: 4.32,
      slippage: 0.05,
    };

    mockExecutions.set(signalId, execution);

    return NextResponse.json({
      success: true,
      data: execution,
      message: "Signal executed successfully",
    });
  } catch (error) {
    console.error("Error executing signal:", error);
    return NextResponse.json(
      { success: false, error: "Failed to execute signal" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const signalId = searchParams.get("signalId");

    if (signalId) {
      const execution = mockExecutions.get(signalId);
      if (!execution) {
        return NextResponse.json(
          { success: false, error: "Execution not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        data: execution,
      });
    }

    // Return all executions
    const executions = Array.from(mockExecutions.values());
    return NextResponse.json({
      success: true,
      data: executions,
      total: executions.length,
    });
  } catch (error) {
    console.error("Error fetching executions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch executions" },
      { status: 500 },
    );
  }
}
