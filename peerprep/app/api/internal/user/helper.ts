import { StatusBody } from "@/api/structs";

export async function pingHistory(
  userId: string,
  roomId: string,
): Promise<StatusBody> {
  // Format looks to be `Mon Nov 04 2024 17:14:57 GMT+0800 (Singapore Standard Time)`
  const now = new Date();

  const res = await fetch(`/api/internal/user/history/ping`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, roomId, now }),
  });

  if (!res.ok) {
    return { status: res.status };
  }
  const json = await res.json();
  return json as StatusBody;
}
