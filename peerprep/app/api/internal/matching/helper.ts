import {
  MatchData,
  MatchRequest,
  MatchResponse,
  StatusBody,
} from "@/api/structs";

// helper to be called from client to check storage blob
export async function checkMatchStatus(
  userId: string
): Promise<MatchResponse | StatusBody> {
  console.debug("In matching helper, checking storage blob:", userId);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_NGINX}/api/internal/matching?uid=${userId}`,
    {
      method: "GET",
    }
  );
  if (!res.ok) {
    return {
      error: await res.text(),
      status: res.status,
    };
  }
  const json = (await res.json()) as MatchData;
  const isMatchFound = true; // TODO differntiate??

  return {
    isMatchFound,
    data: json,
  } as MatchResponse;
}

export async function findMatch(
  matchRequest: MatchRequest
): Promise<StatusBody> {
  console.debug(
    "In matching helper, posting match request",
    JSON.stringify(matchRequest)
  );
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_NGINX}/api/internal/matching`,
    {
      method: "POST",
      body: JSON.stringify(matchRequest),
    }
  );
  if (!res.ok) {
    return {
      error: await res.text(),
      status: res.status,
    };
  }
  const json = await res.json();
  return json as StatusBody;
}