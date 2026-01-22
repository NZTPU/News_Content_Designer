import type { CSSProperties, ReactElement } from "react";

const containerStyle: CSSProperties = {
  position: "relative",
  width: "1400px",
  height: "1800px",
  overflow: "hidden",
  fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
  color: "#ffffff",
  backgroundColor: "#0a0a0a",
};

const backgroundStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage: "url(https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1400&q=80)",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const overlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(180deg, rgba(3, 8, 20, 0.35) 0%, rgba(3, 8, 20, 0.75) 70%, rgba(3, 8, 20, 0.9) 100%)",
};

const logoStyle: CSSProperties = {
  position: "absolute",
  top: "72px",
  right: "84px",
  width: "220px",
  height: "80px",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  backgroundColor: "rgba(0, 0, 0, 0.35)",
};

const chipStyle: CSSProperties = {
  position: "absolute",
  top: "220px",
  left: "90px",
  padding: "12px 26px",
  borderRadius: "999px",
  backgroundColor: "#ff6a00",
  color: "#ffffff",
  fontSize: "22px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  fontWeight: 700,
};

const headlineWrapperStyle: CSSProperties = {
  position: "absolute",
  top: "380px",
  left: "90px",
  width: "960px",
  display: "flex",
  flexDirection: "column",
  gap: "18px",
};

const headlineShapeStyle: CSSProperties = {
  position: "absolute",
  top: "-26px",
  left: "-32px",
  width: "760px",
  height: "190px",
  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 70%)",
  borderRadius: "26px",
  transform: "skewX(-6deg)",
};

const headlineStyle: CSSProperties = {
  position: "relative",
  fontFamily: '"Roboto Condensed", "Inter", "Helvetica Neue", Arial, sans-serif',
  fontSize: "86px",
  lineHeight: "1.05",
  letterSpacing: "0.02em",
  textTransform: "uppercase",
  fontWeight: 700,
  zIndex: 1,
};

const labelTextStyle: CSSProperties = {
  fontSize: "22px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(255, 255, 255, 0.8)",
};

const bottomRightStyle: CSSProperties = {
  position: "absolute",
  bottom: "110px",
  right: "92px",
  fontWeight: 600,
  ...labelTextStyle,
};

const bottomLeftStyle: CSSProperties = {
  position: "absolute",
  bottom: "110px",
  left: "90px",
  fontWeight: 600,
  ...labelTextStyle,
};

export default function NewsCard(): ReactElement {
  return (
    <div style={containerStyle}>
      <div style={backgroundStyle} aria-hidden="true" />
      <div style={overlayStyle} aria-hidden="true" />

      <div style={logoStyle}>LOGO</div>
      <div style={chipStyle}>Space</div>

      <div style={headlineWrapperStyle}>
        <div style={headlineShapeStyle} aria-hidden="true" />
        <div style={headlineStyle}>
          Cosmic missions fuel
          <br />
          a bold new era
        </div>
      </div>

      <div style={bottomLeftStyle}>SICKNEWS.COM</div>
      <div style={bottomRightStyle}>See the full story</div>
    </div>
  );
}
