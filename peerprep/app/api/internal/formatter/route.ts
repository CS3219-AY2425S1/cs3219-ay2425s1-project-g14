import { NextRequest, NextResponse } from "next/server";
import { FormatResponse, Language } from "@/api/structs";

export async function POST(req: NextRequest) {
  const { code, language }: { code: string; language: Language } =
    await req.json();

  let endpoint: string;

  switch (language) {
    case "javascript":
      endpoint = "javascript";
      break;
    case "python":
      endpoint = "python";
      break;
    case "c_cpp":
      endpoint = "cpp";
      break;
    default:
      return NextResponse.json(
        { error: "Unsupported language type" },
        { status: 400 },
      );
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NGINX}/${process.env.NEXT_PUBLIC_FORMATTER}/format/${endpoint}`,
      {
        method: "POST",
        body: JSON.stringify({ code }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.log("Formatter: ", errorData);
      throw new Error(`Failed to format code: ${response.statusText}`);
    }

    const formattedCode = (await response.json()) as FormatResponse;
    return NextResponse.json(formattedCode);
  } catch (error: any) {
    return NextResponse.json(
      { error: `Formatting failed: ${error.message}` },
      { status: 500 },
    );
  }
}
