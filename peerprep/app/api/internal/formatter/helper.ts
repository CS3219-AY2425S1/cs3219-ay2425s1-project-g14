import { Language, StatusBody } from "@/api/structs";

export type FormatType = {
  code: string;
};

export type FormatResponse = {
  formatted_code: string;
};

export async function callFormatter(
  code: string,
  language: Language,
): Promise<StatusBody | FormatResponse> {
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
      const _exhaustiveCheck: never = language;
      console.error(`Unknown language type: ${_exhaustiveCheck}`);
      throw new Error(`Unhandled language case: ${_exhaustiveCheck}`);
  }

  const toSend: FormatType = {
    code: code,
  };

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NGINX}/${process.env.NEXT_PUBLIC_FORMATTER}/${endpoint}`,
      {
        method: "POST",
        body: JSON.stringify(toSend),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Formatter: ", errorData);
      throw new Error(`${errorData.detail}`);
    }

    const formattedCode = (await response.json()) as FormatResponse;
    console.log(formattedCode);
    return formattedCode;
  } catch (err: any) {
    throw new Error(`Failed to format code: ${err.message}`);
  }
}
