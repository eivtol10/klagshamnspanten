"use client";

import { useEffect, useState, useCallback } from "react";
import { PadelData, Session, generateMatches } from "../padelUtils";

const ALL_PLAYERS = ["Eivind", "Klas", "Marcus", "Jacob", "Stoffe", "Christian"];
type Step = "login" | "select" | "scores" | "done";

interface SetInput { team1: string[]; team2: string[]; score1: string; score2: string; }

function validateScore(s1: number, s2: number): string | null {
  if (s1 === s2) return "Oavgjort är inte tillåtet";
  const max = Math.max(s1, s2);
  const min = Math.min(s1, s2);
  if (max < 6) return "Vinnaren måste ha minst 6 games";
  if (max - min < 2) return "Man måste vinna med minst 2 games";
  return null;
}

export default function AdminPage() {
  const [step, setStep] = useState<Step>("login");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [sets, setSets] = useState<SetInput[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [history, setHistory] = useState<Session[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const checkAuth = useCallback(async () => {
    const r = await fetch("/api/padel/auth");
    const d = await r.json();
    if (d.authenticated) setStep("select");
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    const r = await fetch("/api/padel/results");
    const d: PadelData = await r.json();
    setHistory([...d.sessions].reverse());
    setHistoryLoading(false);
  }, []);

  useEffect(() => { if (step === "select" || step === "done") loadHistory(); }, [step, loadHistory]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setLoginLoading(true); setLoginError("");
    const r = await fetch("/api/padel/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, action: "login" }) });
    const d = await r.json(); setLoginLoading(false);
    if (d.ok) { setStep("select"); } else { setLoginError("Fel lösenord. Försök igen."); }
  }

  async function handleLogout() {
    await fetch("/api/padel/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
    setStep("login"); setPassword(""); setSelectedPlayers([]);
  }

  function togglePlayer(name: string) {
    setSelectedPlayers((prev) => {
      if (prev.includes(name)) return prev.filter((p) => p !== name);
      if (prev.length >= 4) return prev;
      return [...prev, name];
    });
  }

  function handleProceedToScores() {
    const matches = generateMatches(selectedPlayers);
    setSets(matches.map((m) => ({ team1: m.team1, team2: m.team2, score1: "", score2: "" })));
    setStep("scores");
  }

  function updateScore(setIndex: number, which: "score1" | "score2", val: string) {
    setSets((prev) => prev.map((s, i) => (i === setIndex ? { ...s, [which]: val } : s)));
  }

  function scoresValid() {
    return sets.every((s) => {
      const s1 = parseInt(s.score1); const s2 = parseInt(s.score2);
      if (isNaN(s1) || isNaN(s2)) return false;
      return validateScore(s1, s2) === null;
    });
  }

  async function handleSave() {
    setSaving(true); setSaveError("");
    const r = await fetch("/api/padel/results", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, activePlayers: selectedPlayers, sets: sets.map((s) => ({ team1: s.team1, team2: s.team2, score1: parseInt(s.score1), score2: parseInt(s.score2) })) }) });
    setSaving(false);
    if (r.ok) { setStep("done"); setSelectedPlayers([]); setSets([]); }
    else { const d = await r.json(); setSaveError(d.error || "Något gick fel"); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Ta bort detta resultat?")) return;
    await fetch("/api/padel/results", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    loadHistory();
  }

  if (step === "login") {
    return (
      <div className="min-h-screen bg-[#0d1525] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-[#0d1f13] text-2xl font-black mx-auto mb-4">P</div>
            <h1 className="text-xl font-bold text-white">Admin</h1>
            <p className="text-sm text-white/40 mt-1">Torsdagspadelgänget</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Lösenord</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-yellow-400 transition-colors" placeholder="••••••••" autoFocus />
            </div>
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button type="submit" disabled={loginLoading || !password} className="w-full bg-yellow-400 text-[#0d1f13] font-bold py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-40">{loginLoading ? "Loggar in…" : "Logga in"}</button>
          </form>
          <div className="mt-6 text-center"><a href="/padel" className="text-xs text-white/30 hover:text-white/60 transition-colors">← Tillbaka till statistiken</a></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1525] text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-[#0d1f13] font-black text-sm">P</div>
          <span className="font-semibold">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/padel" className="text-xs text-white/40 hover:text-white/70 transition-colors">← Statistik</a>
          <button onClick={handleLogout} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">Logga ut</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-10">
        {(step === "select" || step === "done") && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-green-300/60 mb-1 font-semibold">Lägg in nytt resultat</h2>
            <p className="text-sm text-white/40 mb-5">Välj datum och vilka 4 som spelar den veckan.</p>
            <div className="space-y-5">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Datum</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Välj 4 spelare ({selectedPlayers.length}/4 valda)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_PLAYERS.map((p) => {
                    const selected = selectedPlayers.includes(p);
                    const disabled = !selected && selectedPlayers.length >= 4;
                    return (
                      <button key={p} onClick={() => togglePlayer(p)} disabled={disabled} className={`py-3 px-4 rounded-xl border font-semibold text-sm transition-all ${selected ? "bg-yellow-400 border-yellow-400 text-[#0d1f13]" : disabled ? "bg-white/5 border-white/10 text-white/20 cursor-not-allowed" : "bg-white/5 border-white/20 text-white hover:border-yellow-400/50"}`}>
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
              {selectedPlayers.length === 4 && (
                <div className="bg-green-900/30 border border-green-400/20 rounded-xl px-4 py-3 text-sm text-green-300">
                  Vilar denna veckan: <strong>{ALL_PLAYERS.filter(p => !selectedPlayers.includes(p)).join(" & ")}</strong>
                </div>
              )}
              <button onClick={handleProceedToScores} disabled={selectedPlayers.length !== 4} className="w-full bg-yellow-400 text-[#0d1f13] font-bold py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-30">Fortsätt → Ange resultat</button>
            </div>
            {step === "done" && <div className="mt-4 bg-green-900/30 border border-green-400/30 rounded-xl px-4 py-3 text-green-300 text-sm font-medium">✓ Resultatet sparades!</div>}
          </section>
        )}

        {step === "scores" && (
          <section>
            <button onClick={() => setStep("select")} className="text-xs text-white/40 hover:text-white/70 mb-5 inline-block transition-colors">← Tillbaka</button>
            <h2 className="text-xs uppercase tracking-widest text-green-300/60 mb-1 font-semibold">Ange resultat</h2>
            <p className="text-sm text-white/40 mb-5">{new Date(date).toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" })}</p>
            <div className="space-y-4">
              {sets.map((set, i) => {
                const s1 = parseInt(set.score1); const s2 = parseInt(set.score2);
                const error = (!isNaN(s1) && !isNaN(s2) && set.score1 && set.score2) ? validateScore(s1, s2) : null;
                return (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-5">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-4">Set {i + 1}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 text-right"><p className="text-sm font-semibold text-white/80">{set.team1.join(" & ")}</p></div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <input type="number" min="0" value={set.score1} onChange={(e) => updateScore(i, "score1", e.target.value)} className="w-14 text-center bg-[#0d1525] border border-white/20 rounded-lg py-2 text-xl font-black text-white focus:outline-none focus:border-yellow-400 transition-colors" placeholder="0" />
                        <span className="text-white/30 font-bold">–</span>
                        <input type="number" min="0" value={set.score2} onChange={(e) => updateScore(i, "score2", e.target.value)} className="w-14 text-center bg-[#0d1525] border border-white/20 rounded-lg py-2 text-xl font-black text-white focus:outline-none focus:border-yellow-400 transition-colors" placeholder="0" />
                      </div>
                      <div className="flex-1"><p className="text-sm font-semibold text-white/80">{set.team2.join(" & ")}</p></div>
                    </div>
                    {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
                  </div>
                );
              })}
            </div>
            {saveError && <p className="text-red-400 text-sm mt-4">{saveError}</p>}
            <button onClick={handleSave} disabled={!scoresValid() || saving} className="w-full mt-6 bg-yellow-400 text-[#0d1f13] font-bold py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-30">{saving ? "Sparar…" : "Spara resultat"}</button>
          </section>
        )}

        {(step === "select" || step === "done") && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-green-300/60 mb-4 font-semibold">Sparade resultat</h2>
            {historyLoading ? <p className="text-white/30 text-sm">Laddar…</p> : history.length === 0 ? <p className="text-white/30 text-sm">Inga resultat ännu.</p> : (
              <div className="space-y-3">
                {history.map((session) => (
                  <div key={session.id} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold">{new Date(session.date).toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" })}</p>
                      <button onClick={() => handleDelete(session.id)} className="text-xs text-red-400/50 hover:text-red-400 transition-colors">Ta bort</button>
                    </div>
                    <p className="text-xs text-white/30 mb-2">Spelade: {session.activePlayers.join(", ")} · Vilade: {session.restingPlayers.join(" & ")}</p>
                    <div className="space-y-1">
                      {session.sets.map((set, i) => (
                        <p key={i} className="text-xs text-white/50">{set.team1.join(" & ")} {set.score1}–{set.score2} {set.team2.join(" & ")}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
