const { createElement: h } = React;

function App() {
  return h(
    "div",
    { className: "card" },
    h("h1", null, "News Content Designer"),
    h("p", null, "This 1400x1800 canvas is rendered in the browser."),
    h("canvas", {
      id: "news-canvas",
      width: 1400,
      height: 1800
    }),
    h(
      "div",
      { className: "note" },
      "POST JSON to /render to export the canvas as PNG from the server."
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(h(App));

const canvas = document.getElementById("news-canvas");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#0f172a";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = "#38bdf8";
ctx.fillRect(100, 140, canvas.width - 200, 12);
ctx.fillStyle = "#f8fafc";
ctx.font = "bold 80px sans-serif";
ctx.fillText("Client Preview", 100, 300, canvas.width - 200);
ctx.font = "32px sans-serif";
ctx.fillText("Fixed 1400 x 1800 canvas", 100, 380, canvas.width - 200);
