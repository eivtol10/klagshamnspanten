"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const form = e.currentTarget;

  setLoading(true);
  setMessage("");

  const formData = new FormData(form);

  const payload = {
    name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    amount: formData.get("amount"),
    comment: formData.get("comment"),
    website: formData.get("website"),
  };

  try {
    const res = await fetch("/api/pickup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorMessage = "Något gick fel.";

      try {
        const data = await res.json();
        errorMessage = data.error || errorMessage;
      } catch {
        errorMessage = `Något gick fel. Status: ${res.status}`;
      }

      setMessage(errorMessage);
      return;
    }

setMessage("Tack! Vi kommer springande och hämtar din pant.");
    form.reset();
  } catch (error) {
    console.error("Submit error:", error);
    setMessage("Något gick fel. Försök igen.");
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="min-h-screen overflow-hidden bg-[#FDC909] text-[#2D3091]">
      <section className="relative mx-auto max-w-md px-4 pb-10 pt-6 sm:max-w-xl sm:px-6 lg:max-w-6xl lg:px-8">
        <div className="pointer-events-none absolute -left-8 top-10 h-24 w-24 rounded-full bg-white/20 blur-xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[#2D3091]/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-24 left-8 h-20 w-20 rounded-full bg-white/15 blur-lg" />

        <header className="relative z-10 flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="IFK Klagshamn"
            width={120}
            height={120}
            className="h-auto w-[88px] sm:w-[108px]"
            priority
          />

          <div className="mt-4 inline-flex rotate-[-2deg] rounded-full bg-[#2D3091] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#FDC909] shadow-lg">
            Pant som blir till cup
          </div>

          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.05] sm:text-5xl lg:text-6xl">
            Skänk din pant och stötta IFK Klagshamns u16-tjejer
          </h1>

          <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-[#2D3091]/90 sm:text-lg">
            Bor du i Klagshamn, Tygelsjö, Bunkeflostrand, Limhamn eller däremellan? Säg till
            att du har pant, så kommer vi och hämtar.
          </p>

          <a
            href="#form"
            className="mt-6 inline-flex rounded-full bg-[#2D3091] px-7 py-3.5 text-base font-black text-[#FDC909] shadow-xl transition hover:scale-[1.02]"
          >
            Jag har pant
          </a>

          <div className="relative mt-8 w-full max-w-xs rotate-[-3deg] sm:max-w-sm">
            <div className="absolute -right-3 -top-4 z-20 rotate-[10deg] rounded-full bg-white px-4 py-2 text-sm font-black text-[#2D3091] shadow-xl sm:text-base">
              Vi kommer och hämtar!
            </div>

            <div className="overflow-hidden rounded-[28px] border-[6px] border-white shadow-2xl">
              <Image
                src="/team-1.jpeg"
                alt="IFK Klagshamns tjejer"
                width={1000}
                height={800}
                className="h-[230px] w-full object-cover sm:h-[280px]"
                priority
              />
            </div>
          </div>
        </header>

        <section className="relative z-10 mt-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-4">
            <div className="rotate-[-1deg] rounded-[32px] bg-white px-6 py-6 shadow-xl">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#2D3091]">
                Varför vi gör det här
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-[#2D3091]">
                Din pant hjälper tjejerna att göra mer tillsammans
              </h2>
              <p className="mt-3 text-base leading-7 text-[#2D3091]/85">
                Varje kasse och varje säck hjälper laget till fler cuper,
                gemenskap, resor och upplevelser som spelarna minns länge.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[26px] bg-[#2D3091] p-5 text-white shadow-lg">
                <div className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#FDC909]">
                  Område
                </div>
                <p className="mt-2 text-base font-bold leading-6">
                  Klagshamn
                  <br />
                  Tygelsjö
                  <br />
                  Bunkeflostrand
                  <br />
                  Limhamn
                </p>
              </div>

              <div className="rounded-[26px] bg-white p-5 shadow-lg">
                <div className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#2D3091]">
                  Så enkelt
                </div>
                <p className="mt-2 text-base font-bold leading-6 text-[#2D3091]">
                  Du säger till
                  <br />
                  Vi hämtar
                  <br />
                  Laget tjänar
                </p>
              </div>

              <div className="rounded-[26px] bg-[#FFF4C7] p-5 shadow-lg">
                <div className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#2D3091]">
                  Ingen stress
                </div>
                <p className="mt-2 text-base font-bold leading-6 text-[#2D3091]">
                  Du behöver inte
                  <br />
                  räkna exakt
                  <br />
                  mängd pant
                </p>
              </div>
            </div>
          </div>

          <section
            id="form"
            className="rounded-[36px] bg-[#2D3091] p-4 shadow-2xl sm:p-5"
          >
            <div className="rounded-[28px] bg-white p-5 sm:p-6">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#2D3091]">
                Jag har pant
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-[#2D3091]">
                Berätta var den finns
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Fyll i dina uppgifter så hör vi av oss vid behov och hämtar
                panten.
              </p>

              <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                <div className="hidden">
  <label htmlFor="website">Website</label>
  <input
    id="website"
    name="website"
    type="text"
    tabIndex={-1}
    autoComplete="off"
  />
</div>

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-bold text-[#2D3091]"
                  >
                    Namn
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full rounded-2xl border-2 border-[#2D3091]/15 bg-[#FFFBEA] px-4 py-3.5 text-slate-900 outline-none transition focus:border-[#2D3091]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-bold text-[#2D3091]"
                  >
                    Adress
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    className="w-full rounded-2xl border-2 border-[#2D3091]/15 bg-[#FFFBEA] px-4 py-3.5 text-slate-900 outline-none transition focus:border-[#2D3091]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-bold text-[#2D3091]"
                  >
                    Telefonnummer
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="w-full rounded-2xl border-2 border-[#2D3091]/15 bg-[#FFFBEA] px-4 py-3.5 text-slate-900 outline-none transition focus:border-[#2D3091]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="amount"
                    className="mb-2 block text-sm font-bold text-[#2D3091]"
                  >
                    Ungefärlig mängd pant
                  </label>
                  <input
                    id="amount"
                    name="amount"
                    type="text"
                    required
                    placeholder="Till exempel 2 kassar"
                    className="w-full rounded-2xl border-2 border-[#2D3091]/15 bg-[#FFFBEA] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2D3091]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="comment"
                    className="mb-2 block text-sm font-bold text-[#2D3091]"
                  >
                    Kommentar
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    rows={4}
                    placeholder="Till exempel portkod eller var panten står"
                    className="w-full rounded-2xl border-2 border-[#2D3091]/15 bg-[#FFFBEA] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2D3091]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#FDC909] px-6 py-4 text-base font-black text-[#2D3091] shadow-lg transition hover:scale-[1.01] disabled:opacity-70"
                >
                  {loading ? "Skickar..." : "Jag har pant"}
                </button>
              </form>

              {message ? (
  <div className="mt-4 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-left">
    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
      ✓
    </div>
    <div>
      <p className="text-sm font-bold text-green-800">{message}</p>
      <p className="mt-1 text-sm text-green-700">
        Vi hör av oss vid behov och planerar upphämtning.
      </p>
    </div>
  </div>
) : null}

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Vi använder bara dina uppgifter för att kunna hämta din pant.
              </p>
              <div className="mt-4">
  <a
    href="https://www.instagram.com/ifkklagshamnf1011/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Följ oss på Instagram"
    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#2D3091] text-[#FDC909] transition hover:scale-[1.05]"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm8.88 1.12a1.13 1.13 0 1 1 0 2.26 1.13 1.13 0 0 1 0-2.26ZM12 6.5A5.5 5.5 0 1 1 6.5 12 5.5 5.5 0 0 1 12 6.5Zm0 1.5A4 4 0 1 0 16 12a4 4 0 0 0-4-4Z" />
    </svg>
  </a>
</div>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}