"use client";

import { useEffect, useState } from "react";
import { PadelData, PlayerStats, computeStats, getFormPlayer, Session } from "./padelUtils";
import Link from "next/link";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex flex-col gap-1">
      <span className="text-xs text-green-300/70 uppercase tracking-widest font-medium">{label}</span>
      <span className="text-3xl font-black text-white tabular-nums">{value}</span>
      {sub && <span className="text-xs text-white/40">{sub}</span>}
    </div>
  );
}

export default function PadelPage() {
  const [data, setData] = useState<PadelData | null>(null);
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [formPlayer, setFormPlayer] = useState<{ name: string; formPct: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/padel/results")
      .then((r) => r.json())
      .then((d: PadelData) => { setData(d); setStats(computeStats(d)); setFormPlayer(getFormPlayer(d)); setLoading(false); });
  }, []);

  const totalSessions = data?.sessions.length ?? 0;
  const lastSession: Session | null = data?.sessions.at(-1) ?? null;

  return (
    <div className="min-h-screen bg-[#0d1525] text-white font-sans">
      <header className="border-b border-white/10 px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center">
            <img src="/fairplay-logo.jpg" alt="Fair Play" className="h-10 w-10 object-contain rounded-full" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight tracking-tight">Torsdagspadelgänget</h1>
            <p className="text-xs text-white/40">Säsong {data?.season ?? "—"}</p>
          </div>
        </div>
        <Link href="/padel/admin" className="text-xs text-white/30 hover:text-yellow-400 transition-colors">Admin →</Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {loading ? (
          <div className="text-center text-white/40 py-20">Laddar statistik…</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Spelveckor" value={totalSessions} />
              <StatCard label="Formspelaren 🔥" value={formPlayer ? formPlayer.name : "—"} sub={formPlayer ? `${formPlayer.formPct}% game senaste 3 v` : "Inga resultat än"} />
              <StatCard label="Senaste torsdagen" value={lastSession ? new Date(lastSession.date).toLocaleDateString("sv-SE", { day: "numeric", month: "short" }) : "—"} />
              <StatCard label="Totala set" value={totalSessions * 3} />
            </div>

            <section className="border border-white/10 rounded-2xl p-6">
                <h2 className="text-xs uppercase tracking-widest text-green-300/60 mb-4 font-semibold">Säsongsställning</h2>
                {stats.length === 0 ? (
                  <div className="text-center text-white/30 py-16 border border-white/10 rounded-2xl">Inga resultat inlagda ännu. Spela på!</div>
                ) : (
                  <div className="space-y-3">
                    {stats.map((player, i) => (
                      <div key={player.name} className={`relative flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all ${i === 0 ? "bg-yellow-400/10 border-yellow-400/40" : "bg-white/5 border-white/10"}`}>
                        <div className="w-8 text-center text-xl shrink-0">
                          {i === 0 ? <span className="text-yellow-400">♛</span> : <span className="text-white/30 text-sm font-bold">{i + 1}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-base truncate ${i === 0 ? "text-yellow-400" : "text-white"}`}>
                            {player.name}
                            {i === 0 && <span className="ml-2 text-xs font-normal text-yellow-400/60 uppercase tracking-wider">Padelkung</span>}
                          </p>
                          <p className="text-xs text-white/40 mt-0.5">{player.sessionsPlayed} speldagar · {player.sessionsRested} vilor</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-6 text-right">
                          <div><p className="text-xs text-white/40 uppercase tracking-wide">Set</p><p className="text-sm font-bold tabular-nums">{player.setsWon}–{player.setsLost}</p></div>
                          <div><p className="text-xs text-white/40 uppercase tracking-wide">Games</p><p className="text-sm font-bold tabular-nums">{player.gamesWon}–{player.gamesLost}</p></div>
                          <div className="w-20">
                            <p className="text-xs text-white/40 uppercase tracking-wide">Set%</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden"><div className={`h-full rounded-full ${i === 0 ? "bg-yellow-400" : "bg-green-400"}`} style={{ width: `${player.setWinPct}%` }} /></div>
                              <span className="text-xs font-bold tabular-nums w-8 text-right">{player.setWinPct}%</span>
                            </div>
                          </div>
                          <div className="w-20">
                            <p className="text-xs text-white/40 uppercase tracking-wide">Game%</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden"><div className={`h-full rounded-full ${i === 0 ? "bg-yellow-400" : "bg-green-400"}`} style={{ width: `${player.gameWinPct}%` }} /></div>
                              <span className="text-xs font-bold tabular-nums w-8 text-right">{player.gameWinPct}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="sm:hidden text-right">
                          <p className="text-xs text-white/40">Set%</p>
                          <p className="text-base font-black tabular-nums">{player.setWinPct}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </section>

            <section className="border border-white/10 rounded-2xl p-6">
              <h2 className="text-xs uppercase tracking-widest text-green-300/60 mb-6 font-semibold">Sponsorer</h2>
              <div className="flex flex-wrap items-center justify-center gap-6">
                {[
                  { src: "/fairplay-logo.jpg", alt: "Fair Play Tennisklubb" },
                  { src: "/pizza.png", alt: "Pizza" },
                  { src: "/Birra_Moretti_Logo.png", alt: "Birra Moretti" },
                  { src: "/babolat.jpg", alt: "Babolat" },
                  { src: "/bullpadel.png", alt: "Bullpadel" },
      { src: "/voltaren.avif", alt: "Voltaren" },
                ].map((sponsor) => (
                  <div
                    key={sponsor.alt}
                    className="bg-white rounded-xl p-3 flex items-center justify-center"
                    style={{ width: 120, height: 80 }}
                  >
                    <img
                      src={sponsor.src}
                      alt={sponsor.alt}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-white/10 rounded-2xl p-6">
                <h2 className="text-xs uppercase tracking-widest text-green-300/60 mb-4 font-semibold">Ölkungen 🍺</h2>
                {stats.length === 0 ? (
                  <div className="text-center text-white/30 py-16 border border-white/10 rounded-2xl">
                    Inga nollor ännu. Spela på!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...stats]
                      .sort((a, b) => b.zeroLosses - a.zeroLosses)
                      .map((player, i) => (
                        <div
                          key={player.name}
                          className={`flex items-center gap-4 rounded-2xl border px-5 py-2 ${
                            i === 0 && player.zeroLosses > 0
                              ? "bg-yellow-900/20 border-yellow-700/40"
                              : "bg-white/5 border-white/10"
                          }`}
                        >
                          <div className="w-8 text-center shrink-0">
                            <span className={`text-sm font-bold ${i === 0 && player.zeroLosses > 0 ? "text-yellow-400" : "text-white/30"}`}>{i + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${i === 0 && player.zeroLosses > 0 ? "text-yellow-400" : "text-white/60"}`}>
                              {player.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-white/40 uppercase tracking-wide">Rundor</p>
                            <p className={`text-base font-black tabular-nums ${player.zeroLosses > 0 ? "text-yellow-400" : "text-white/20"}`}>
                              {player.zeroLosses}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
            </section>

            {data && data.sessions.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-green-300/60 mb-4 font-semibold">Resultatlogg</h2>
                <div className="space-y-3">
                  {[...data.sessions].reverse().map((session) => (
                    <div key={session.id} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold">{new Date(session.date).toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" })}</p>
                        <p className="text-xs text-white/40">Vilar: {session.restingPlayers.join(" & ")}</p>
                      </div>
                      <div className="space-y-1.5">
                        {session.sets.map((set, i) => {
                          const team1Won = set.score1 > set.score2;
                          return (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className={team1Won ? "text-white font-semibold" : "text-white/40"}>{set.team1.join(" & ")}</span>
                              <span className="font-black tabular-nums mx-3 text-white">{set.score1}–{set.score2}</span>
                              <span className={!team1Won ? "text-white font-semibold" : "text-white/40"}>{set.team2.join(" & ")}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <footer className="text-center text-white/20 text-xs py-8 border-t border-white/10 mt-10">Torsdagspadelgänget · Klagshamn</footer>
    </div>
  );
}
