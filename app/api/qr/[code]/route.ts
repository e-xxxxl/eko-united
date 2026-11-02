import QRCode from "qrcode";

export const runtime = "nodejs";

// A ticket's QR code as a PNG, drawn from the code in the URL. Used on the
// "your tickets" page and in the confirmation email (an email cannot run
// scripts, so it needs a real image). The code is the only thing encoded, and
// anyone can draw a QR for a string, so nothing secret is exposed here: the
// QR is only useful to someone who already holds the ticket code.
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const clean = code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (clean.length < 4 || clean.length > 16) {
    return new Response("Not found", { status: 404 });
  }

  const png = await QRCode.toBuffer(clean, {
    type: "png",
    width: 360,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#061733", light: "#FFFFFF" },
  });

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
