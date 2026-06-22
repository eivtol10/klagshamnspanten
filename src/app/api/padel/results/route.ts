import { NextRequest, NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com";
const FILE_PATH = "data/padel.json";

function requireAuth(req: NextRequest) {
  return req.cookies.get("padel_auth")?.value === "true";
}

async function fetchFromGitHub(): Promise<{ data: unknown; sha: string }> {
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${FILE_PATH}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const json = await res.json();
  const content = Buffer.from(json.content, "base64").toString("utf-8");
  return { data: JSON.parse(content), sha: json.sha };
}

async function saveToGitHub(data: unknown, sha: string): Promise<void> {
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const content = Buffer.from(JSON.stringify(data, null, 2), "utf-8").toString("base64");
  const res = await fetch(`${GITHUB_API}/repos/${repo}/contents/${FILE_PATH}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Update padel data", content, sha }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`GitHub PUT failed: ${res.status} – ${JSON.stringify(err)}`);
  }
}

export async function GET() {
  try {
    const { data } = await fetchFromGitHub();
    return NextResponse.json(data);
  } catch (e) {
    console.error("Fel vid läsning:", e);
    return NextResponse.json({ error: "Kunde inte läsa data" }, { status: 500 });
  }
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
    const { data, sha } = await fetchFromGitHub();
    const d = data as { players: string[]; sessions: unknown[] };
    const session = {
      id: Date.now().toString(),
      date,
      activePlayers,
      restingPlayers: d.players.filter((p: string) => !activePlayers.includes(p)),
      sets,
    };
    d.sessions.push(session);
    await saveToGitHub(d, sha);
    return NextResponse.json({ ok: true, session });
  } catch (e) {
    console.error("Fel vid sparande av session:", e);
    return NextResponse.json({ error: "Serverfel – kunde inte spara" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAuth(req)) return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  try {
    const { id } = await req.json();
    const { data, sha } = await fetchFromGitHub();
    const d = data as { sessions: { id: string }[] };
    d.sessions = d.sessions.filter((s) => s.id !== id);
    await saveToGitHub(d, sha);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Fel vid radering:", e);
    return NextResponse.json({ error: "Serverfel – kunde inte radera" }, { status: 500 });
  }
}
