import { generateAuthHeaders, generateJSONHeaders } from "@/api/gateway";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Question } from "@/api/structs";

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NGINX}/${process.env.NEXT_PUBLIC_QUESTION_SERVICE}/questions`,
      {
        method: "GET",
        headers: generateAuthHeaders(),
      },
    );
    if (!response.ok) {
      return NextResponse.json(
        {
          error: await response.text(),
          status: response.status,
        },
        { status: response.status },
      );
    }
    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, status: 400 },
      { status: 400 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const body = (await request.json()) as Question;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NGINX}/${process.env.NEXT_PUBLIC_QUESTION_SERVICE}/questions/replace/${body.id}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
        headers: generateJSONHeaders(),
      },
    );
    if (response.ok) {
      revalidatePath("/questions");
      revalidatePath(`/questions/${body.id}`);
      revalidatePath(`/questions/edit/${body.title}`);
      return NextResponse.json(
        { status: response.status },
        { status: response.status },
      );
    }
    return NextResponse.json(
      {
        error: (await response.json())["Error adding question: "],
        status: response.status,
      },
      { status: response.status },
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, status: 400 },
      { status: 400 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NGINX}/${process.env.NEXT_PUBLIC_QUESTION_SERVICE}/questions`,
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: generateJSONHeaders(),
      },
    );
    if (response.ok) {
      revalidatePath("/questions");
      return NextResponse.json(
        { status: response.status },
        { status: response.status },
      );
    }
    return NextResponse.json(
      {
        error: (await response.json())["Error adding question: "],
        status: response.status,
      },
      { status: response.status },
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, status: 400 },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  if (body.qid === undefined) {
    return NextResponse.json(
      { error: "No ID specified.", status: 400 },
      { status: 400 },
    );
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NGINX}/${process.env.NEXT_PUBLIC_QUESTION_SERVICE}/questions/delete/${body.qid}`,
      {
        method: "DELETE",
        headers: generateAuthHeaders(),
      },
    );
    if (response.ok) {
      // NextResponse doesn't support 204.
      revalidatePath("/questions");
      return new Response(null, { status: response.status });
    }
    return NextResponse.json(
      {
        error: (await response.json())["Error deleting question: "],
        status: response.status,
      },
      { status: response.status },
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Bad request: ${err.message}`, status: 400 },
      { status: 400 },
    );
  }
}
