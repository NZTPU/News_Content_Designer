# News Content Designer

Minimal Express + React (CDN) app with a fixed 1400x1800 canvas and a server-side PNG render endpoint.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to view the client preview canvas.

## Render an image

Send JSON to `/render` to get a PNG response:

```bash
curl -X POST http://localhost:3000/render \
  -H "Content-Type: application/json" \
  -d '{"headline":"Breaking News","body":"Payloads become PNGs.","footer":"Rendered server-side"}' \
  --output output.png
```

The endpoint accepts optional `backgroundColor`, `accentColor`, `textColor`, `headline`, `body`, and `footer` fields.
