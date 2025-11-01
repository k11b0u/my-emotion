// api/switchbot.js
export const config = { runtime: "edge" };

export default async (req) => {
  const ORIGIN = process.env.CORS_ORIGIN || "*";
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(ORIGIN) });
  }
  if (req.method !== "POST") {
    return json(405, { error: "Method Not Allowed" }, ORIGIN);
  }

  const token = process.env.SWITCHBOT_TOKEN;
  const map = JSON.parse(process.env.DEVICE_MAP_JSON || "{}");
  if (!token) return json(500, { error: "server misconfig: no token" }, ORIGIN);

  const { participantId, commandKey = "press" } = await req.json();
  const deviceId = map[participantId];
  if (!deviceId) return json(400, { error: "unknown participantId" }, ORIGIN);

  const r = await fetch(`https://api.switch-bot.com/v1.1/devices/${deviceId}/commands`, {
    method: "POST",
    headers: { "Authorization": token, "Content-Type": "application/json; charset=utf8" },
    body: JSON.stringify({ command: commandKey, parameter: "default", commandType: "command" })
  });
  const data = await r.json();
  return json(r.status, data, ORIGIN);
};

function cors(origin){
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type,authorization"
  };
}
function json(status, obj, origin){
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type":"application/json", ...cors(origin) } });
}
