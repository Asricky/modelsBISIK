import { NextResponse as Response } from "next/server"

export async function POST(request: Request) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "JSON tidak valid" }, { status: 400 })
  }

  if (!body || !Array.isArray(body.contents) || body.contents.length === 0) {
    return Response.json({ error: "Konten gambar diperlukan" }, { status: 400 })
  }

  const key = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL
  if (!key || !model) {
    return Response.json({ error: "GEMINI_API_KEY dan GEMINI_MODEL belum dikonfigurasi" }, { status: 503 })
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ contents: body.contents }),
        signal: AbortSignal.timeout(60_000),
      },
    )
    if (!response.ok) {
      return Response.json({ error: "Layanan analisis gambar tidak tersedia" }, { status: 502 })
    }
    return Response.json(await response.json())
  } catch {
    return Response.json({ error: "Tidak dapat menghubungi layanan analisis gambar" }, { status: 502 })
  }
}
