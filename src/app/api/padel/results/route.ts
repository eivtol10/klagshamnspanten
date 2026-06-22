import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "padel.json");

function requireAuth(req: NextRequest) {
  return req.cookies.get("padel_auth")?.value === "true";
}
function readData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}
function writeData(data: unknown) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  return NextResponse.json(readData());
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  try {
    const { date, activePlayers, sets } = await req.json();
    if (!date || !activePlayers || activePlayers.length !== 4 || !sets || sets.length !== 3)
      return NextResponse.json({ error: "Ogiltig data" }, { status: 400 });
    for (const set of sets) {
      if (!set.team1 || !set.team2 || set.team1.length !== 2 || set.team2.length !== 2)
        return NextResponse.json({ error: "Ogiltig matchdata" }, { status: 400 });
      if (typeof set.score1 !== "number" || typeof set.score2 !== "number" || set.score1 < 0 || set.score2 < 0)
        return NextResponse.json({ error: "Ogiltiga poäng" }, { status: 400 });
    }
    const data = readData();
    const session = {
      id: Date.now().toString(),
      date,
      activePlayers,
      restingPlayers: data.players.filter((p: string) => !activePlayers.includes(p)),
      sets,
    };
    data.sessions.push(session);
    writeData(data);
    return NextResponse.json({ ok: true, session });
  } catch (e) {
    console.error("Fel vid sparande av session:", e);
    return NextResponse.json({ error: "Serverfel – kunde inte spara" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAuth(req)) return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  const { id } = await req.json();
  const data = readData();
  data.sessions = data.sessions.filter((s: { id: string }) => s.id !== id);
  writeData(data);
  return NextResponse.json({ ok: true });
}
