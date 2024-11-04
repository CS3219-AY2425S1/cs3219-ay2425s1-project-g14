import {
  MatchData,
  MatchRequest,
  MatchResponse,
  StatusBody,
  MatchReqInitRes
} from "@/api/structs";

// helper to be called from client to check storage blob
export async function checkMatchStatus(
  matchHash: string
): Promise<MatchResponse | StatusBody> {
  console.debug("In matching helper, checking storage blob:", matchHash);
  const res = await fetch(
    `/api/internal/matching?matchHash=${matchHash}`,
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
): Promise<StatusBody|MatchReqInitRes> {
  console.debug(
    "In matching helper, posting match request",
    JSON.stringify(matchRequest)
  );
  const res = await fetch(`/api/internal/matching`, {
    method: "POST",
    body: JSON.stringify(matchRequest),
  });
  if (!res.ok) {
    return {
      error: await res.text(),
      status: res.status,
    } as StatusBody;
  }
  const json = await res.json();
  return json as MatchReqInitRes;
}
