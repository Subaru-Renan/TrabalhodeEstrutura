import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const style = document.createElement("style");
style.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f172a; }
  @keyframes spin { to { transform: rotate(360deg); } }
  input:focus, select:focus { outline: 2px solid #60a5fa; outline-offset: 2px; }
  button:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
  button:disabled { opacity: 0.4; cursor: not-allowed; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0f172a; }
  ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
