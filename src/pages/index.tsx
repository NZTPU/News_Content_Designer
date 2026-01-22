import Head from "next/head";
import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";

type CardData = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  category?: string;
  author?: string;
};

type CsvRow = Record<string, string>;

const normalizeHeader = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, "_");

const parseCsvLine = (line: string): string[] => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
};

const parseCsv = (content: string): CsvRow[] => {
  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return [];
  }

  const headerCells = parseCsvLine(lines[0]).map(normalizeHeader);
  const hasNamedHeader = headerCells.some((cell) =>
    ["title", "headline", "image", "image_url"].includes(cell)
  );
  const rows = hasNamedHeader
    ? lines.slice(1).map((line) => parseCsvLine(line))
    : lines.map((line) => parseCsvLine(line));

  const headers = hasNamedHeader
    ? headerCells
    : ["title", "subtitle", "image_url", "category", "author"];

  return rows.map((row) => {
    const record: CsvRow = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });
    return record;
  });
};

const createCard = (row: CsvRow, index: number): CardData => {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `card-${Date.now()}-${index}`;

  const title = row.title || row.headline || `Card ${index + 1}`;
  const subtitle = row.subtitle || row.subheading || row.summary || "";
  const imageUrl = row.image_url || row.image || row.imageurl || "";

  return {
    id,
    title,
    subtitle,
    imageUrl: imageUrl || undefined,
    category: row.category || row.section,
    author: row.author || row.byline,
  };
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const getSheetExportUrl = (input: string) => {
  const match = input.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    return null;
  }

  const url = new URL(input);
  const gid = url.searchParams.get("gid");
  const base = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
  return gid ? `${base}&gid=${gid}` : base;
};

export default function HomePage() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [csvName, setCsvName] = useState<string>("");
  const [sheetUrl, setSheetUrl] = useState("");
  const [status, setStatus] = useState("");
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleCsvUpload = async (file: File) => {
    const text = await file.text();
    const rows = parseCsv(text);
    const nextCards = rows.map(createCard);
    setCards(nextCards);
    setCsvName(file.name);
    setStatus(
      nextCards.length
        ? `Loaded ${nextCards.length} cards from ${file.name}.`
        : "No cards found in the CSV."
    );
  };

  const handleSheetLoad = async () => {
    const exportUrl = getSheetExportUrl(sheetUrl);
    if (!exportUrl) {
      setStatus("Enter a valid Google Sheets URL.");
      return;
    }

    setStatus("Loading Google Sheet…");
    const response = await fetch(exportUrl);
    if (!response.ok) {
      setStatus("Unable to load the sheet. Make sure it is shared publicly.");
      return;
    }

    const text = await response.text();
    const rows = parseCsv(text);
    const nextCards = rows.map(createCard);
    setCards(nextCards);
    setCsvName("Google Sheet");
    setStatus(
      nextCards.length
        ? `Loaded ${nextCards.length} cards from the sheet.`
        : "No cards found in the sheet."
    );
  };

  const handleDownloadCard = async (cardId: string, index: number) => {
    const node = cardRefs.current[cardId];
    if (!node) {
      return;
    }

    const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
    const blob = await fetch(dataUrl).then((res) => res.blob());
    downloadBlob(blob, `news-card-${index + 1}.png`);
  };

  const handleDownloadAll = async () => {
    if (cards.length === 0) {
      return;
    }

    setIsDownloadingAll(true);
    try {
      const zip = new JSZip();

      for (let i = 0; i < cards.length; i += 1) {
        const card = cards[i];
        const node = cardRefs.current[card.id];
        if (!node) {
          continue;
        }

        const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
        const blob = await fetch(dataUrl).then((res) => res.blob());
        zip.file(`news-card-${i + 1}.png`, blob);
      }

      const archive = await zip.generateAsync({ type: "blob" });
      downloadBlob(archive, "news-cards.zip");
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const helpText = useMemo(
    () =>
      "CSV headers supported: title, subtitle, image_url, category, author. If no header, the first three columns map to title, subtitle, and image URL.",
    []
  );

  return (
    <>
      <Head>
        <title>News Content Designer</title>
      </Head>
      <main className="page">
        <header className="hero">
          <div>
            <p className="eyebrow">News Content Designer</p>
            <h1>Generate social-ready news cards in minutes.</h1>
            <p className="subhead">{helpText}</p>
          </div>
          <div className="actions">
            <button
              className="primary"
              type="button"
              onClick={handleDownloadAll}
              disabled={cards.length === 0 || isDownloadingAll}
            >
              {isDownloadingAll ? "Preparing zip…" : "Download all"}
            </button>
            <span className="status">{status}</span>
          </div>
        </header>

        <section className="inputs">
          <label className="card">
            <span className="label">Upload CSV</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleCsvUpload(file);
                }
              }}
            />
            <span className="hint">
              {csvName ? `Loaded: ${csvName}` : "Drop or browse a CSV file."}
            </span>
          </label>

          <div className="card">
            <span className="label">Google Sheets URL</span>
            <div className="sheet-input">
              <input
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={sheetUrl}
                onChange={(event) => setSheetUrl(event.target.value)}
              />
              <button type="button" onClick={handleSheetLoad}>
                Load sheet
              </button>
            </div>
            <span className="hint">
              Ensure the sheet is shared publicly or published to the web.
            </span>
          </div>
        </section>

        <section className="preview">
          <div className="preview-header">
            <h2>Preview</h2>
            <p>
              {cards.length
                ? `${cards.length} cards ready for export.`
                : "Upload a CSV or sheet to preview cards."}
            </p>
          </div>
          <div className="grid">
            {cards.map((card, index) => (
              <article key={card.id} className="preview-card">
                <div
                  className="card-frame"
                  ref={(node) => {
                    cardRefs.current[card.id] = node;
                  }}
                >
                  <div className="card-image">
                    {card.imageUrl ? (
                      <img src={card.imageUrl} alt={card.title} />
                    ) : (
                      <div className="image-placeholder">
                        <span>Image placeholder</span>
                      </div>
                    )}
                  </div>
                  <div className="card-content">
                    {card.category ? (
                      <span className="category">{card.category}</span>
                    ) : null}
                    <h3>{card.title}</h3>
                    {card.subtitle ? <p>{card.subtitle}</p> : null}
                    <div className="meta">
                      <span>Newsroom Studio</span>
                      {card.author ? <span>{card.author}</span> : null}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDownloadCard(card.id, index)}
                >
                  Download PNG
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>

      <style jsx>{`
        :global(body) {
          margin: 0;
          font-family: "Inter", "Segoe UI", sans-serif;
          background: #f6f7fb;
          color: #1c1f2a;
        }

        .page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 24px 72px;
        }

        .hero {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 24px;
          background: #ffffff;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 60px rgba(22, 28, 45, 0.08);
        }

        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 12px;
          color: #6b7280;
          margin: 0 0 8px;
        }

        h1 {
          font-size: 32px;
          margin: 0 0 12px;
        }

        .subhead {
          margin: 0;
          color: #4b5563;
        }

        .actions {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }

        .primary {
          border: none;
          background: #1d4ed8;
          color: #fff;
          padding: 12px 20px;
          border-radius: 999px;
          font-weight: 600;
          cursor: pointer;
        }

        .primary:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        .status {
          font-size: 14px;
          color: #475569;
        }

        .inputs {
          margin-top: 32px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .card {
          background: #ffffff;
          padding: 20px;
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
        }

        .label {
          font-weight: 600;
        }

        input[type="file"] {
          padding: 10px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .sheet-input {
          display: flex;
          gap: 8px;
        }

        .sheet-input input {
          flex: 1;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 12px;
        }

        .sheet-input button {
          border: none;
          background: #0f172a;
          color: #fff;
          padding: 10px 16px;
          border-radius: 12px;
          cursor: pointer;
        }

        .hint {
          font-size: 13px;
          color: #6b7280;
        }

        .preview {
          margin-top: 40px;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
        }

        .preview-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .preview-card button {
          border: none;
          background: #e2e8f0;
          padding: 10px 12px;
          border-radius: 12px;
          cursor: pointer;
        }

        .card-frame {
          width: 100%;
          aspect-ratio: 4 / 5;
          background: #ffffff;
          border-radius: 18px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 1px solid #e2e8f0;
        }

        .card-image {
          height: 52%;
          position: relative;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #e2e8f0, #c7d2fe);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          font-size: 14px;
        }

        .card-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .category {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6366f1;
        }

        .card-content h3 {
          margin: 0;
          font-size: 18px;
        }

        .card-content p {
          margin: 0;
          color: #475569;
          font-size: 14px;
        }

        .meta {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #94a3b8;
        }

        @media (max-width: 720px) {
          .hero {
            padding: 24px;
          }

          h1 {
            font-size: 26px;
          }

          .actions {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
