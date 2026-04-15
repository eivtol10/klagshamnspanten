import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const address = String(body.address || "").trim();
    const phone = String(body.phone || "").trim();
    const amount = String(body.amount || "").trim();
    const comment = String(body.comment || "").trim();
    const website = String(body.website || "").trim();

    if (website) {
      return NextResponse.json({ ok: true });
    }

    if (!name || !address || !phone || !amount) {
      return NextResponse.json(
        { error: "Fyll i namn, adress, telefon och ungefärlig mängd pant." },
        { status: 400 }
      );
    }

    const { error } = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: process.env.TO_EMAIL!,
      subject: "Ny pantanmälan",
      text: `Ny pantanmälan

Namn: ${name}
Adress: ${address}
Telefon: ${phone}
Mängd pant: ${amount}
Kommentar: ${comment || "-"}`,
    });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Kunde inte skicka mejlet." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Något gick fel på servern." },
      { status: 500 }
    );
  }
}