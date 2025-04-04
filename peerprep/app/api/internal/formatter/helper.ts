import { FormatResponse, Language, StatusBody } from "@/api/structs";

export async function callFormatter(
  code: string,
  language: Language,
): Promise<StatusBody | FormatResponse> {
  try {
    const response = await fetch("/api/internal/formatter", {
      method: "POST",
      body: JSON.stringify({ code, language }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = (await response.json()) as StatusBody;
      console.error("FormatterHelper: ", errorData);
      throw new Error(`${errorData.error}`);
    }

    const formattedCode = (await response.json()) as FormatResponse;
    console.log(formattedCode);
    return formattedCode;
  } catch (err: any) {
    throw new Error(`${err.message}`);
  }
}
