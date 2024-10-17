import { generateAuthHeaders, generateJSONHeaders } from "@/api/gateway";
import { QuestionFullBody } from "@/api/structs";
import { NextRequest, NextResponse } from "next/server";

// all get request interpreted as getting from storage blob
export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid"); // Assuming you're passing the userId as a query parameter
  console.log("in route,", uid);
  if (!uid) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STORAGE_BLOB}/request/${uid}`,
      {
        method: "GET",
        headers: generateAuthHeaders(),
      }
    );
    if (!response.ok) {
      return NextResponse.json(
        {
          error: await response.text(),
          status: response.status,
        },
        { status: response.status }
      );
    }
    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, status: 400 },
      { status: 400 }
    );
  }
}

// for matching stuff all post requests interpreted as posting matchmaking request
export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MATCHING_SERVICE}/request`,
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: generateJSONHeaders(),
      }
    );
    if (response.ok) {
      return NextResponse.json(
        { status: response.status },
        { status: response.status }
      );
    }
    return NextResponse.json(
      {
        error: (await response.json())["Error adding question: "],
        status: response.status,
      },
      { status: response.status }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, status: 400 },
      { status: 400 }
    );
  }
}
