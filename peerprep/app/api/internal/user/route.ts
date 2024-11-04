import { NextRequest } from "next/server";
import { generateAuthHeaders } from "@/api/gateway";

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NGINX}/${process.env.NEXT_PUBLIC_HISTORY_SERVICE}/ping`,
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: generateAuthHeaders()
      }
    );
    if (response.ok) {
      return { status: response.status };
    }
    return {
      error: (await response.json())["Error pinging"],
      status: response.status,
    };
  }
}