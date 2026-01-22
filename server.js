import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createCanvas } from "canvas";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/render", (req, res) => {
  const payload = req.body ?? {};
  const canvas = createCanvas(1400, 1800);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = payload.backgroundColor || "#0f172a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = payload.accentColor || "#38bdf8";
  ctx.fillRect(100, 140, canvas.width - 200, 12);

  ctx.fillStyle = payload.textColor || "#f8fafc";
  ctx.font = "bold 80px sans-serif";
  ctx.fillText(payload.headline || "News Canvas", 100, 300, canvas.width - 200);

  ctx.font = "32px sans-serif";
  const bodyText = payload.body || "Send a JSON payload to /render to customize this output.";
  wrapText(ctx, bodyText, 100, 380, canvas.width - 200, 48);

  ctx.font = "24px sans-serif";
  ctx.fillText(payload.footer || "1400 x 1800", 100, canvas.height - 120);

  res.setHeader("Content-Type", "image/png");
  canvas.createPNGStream().pipe(res);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let lineY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const { width } = ctx.measureText(testLine);
    if (width > maxWidth && line) {
      ctx.fillText(line, x, lineY);
      line = word;
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line, x, lineY);
  }
}
