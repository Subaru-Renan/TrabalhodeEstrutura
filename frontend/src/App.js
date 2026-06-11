import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const API = "http://localhost:5000/api";

const SORT_KEYS = [
  { value: "name", label: "🔤 Nome (A-Z)" },
  { value: "population", label: "👥 População" },
  { value: "area", label: "📐 Área" },
  { value: "density", label: "🏙️ Densidade" },
];

const SAMPLE_SIZES = [25, 50, 100];

const PSEUDOCODE = {
  linear: [
    "function buscaLinear(lista, alvo):",
    "  para i de 0 até lista.length-1:",
    "    comparações++",
    "    se lista[i] == alvo:",
    "      retorna i  ← ENCONTRADO ✅",
    "  retorna -1  ← NÃO ENCONTRADO ❌",
  ],
  binary: [
    "function buscaBinaria(lista, alvo):",
    "  low = 0; high = lista.length-1",
    "  enquanto low <= high:",
    "    mid = (low + high) / 2",
    "    comparações++",
    "    se lista[mid] == alvo:",
    "      retorna mid  ← ENCONTRADO ✅",
    "    se lista[mid] < alvo:",
    "      low = mid + 1  →",
    "    senão:",
    "      high = mid - 1  ←",
    "  retorna -1  ← NÃO ENCONTRADO ❌",
  ],
};

function getPseudoLine(type, step) {
  if (!step) return -1;
  if (type === "linear") { if (step.found) return 4; return 3; }
  if (type === "binary") {
    if (step.found) return 6;
    if (step.direction === "right") return 8;
    if (step.direction === "left") return 10;
    return 4;
  }
  return -1;
}

const ALL_DEMO = [
  { name: "Afghanistan", population: 40218234, area: 652230, density: 61.66, flag: "https://flagcdn.com/w320/af.png", code: "AF", region: "Asia" },
  { name: "Argentina", population: 45376763, area: 2780400, density: 16.32, flag: "https://flagcdn.com/w320/ar.png", code: "AR", region: "Americas" },
  { name: "Australia", population: 25687041, area: 7692024, density: 3.34, flag: "https://flagcdn.com/w320/au.png", code: "AU", region: "Oceania" },
  { name: "Austria", population: 9006398, area: 83871, density: 107.38, flag: "https://flagcdn.com/w320/at.png", code: "AT", region: "Europe" },
  { name: "Bangladesh", population: 166303498, area: 147570, density: 1127.05, flag: "https://flagcdn.com/w320/bd.png", code: "BD", region: "Asia" },
  { name: "Belgium", population: 11555997, area: 30528, density: 378.37, flag: "https://flagcdn.com/w320/be.png", code: "BE", region: "Europe" },
  { name: "Bolivia", population: 11673029, area: 1098581, density: 10.63, flag: "https://flagcdn.com/w320/bo.png", code: "BO", region: "Americas" },
  { name: "Brazil", population: 214326223, area: 8515767, density: 25.17, flag: "https://flagcdn.com/w320/br.png", code: "BR", region: "Americas" },
  { name: "Canada", population: 38246108, area: 9984670, density: 3.83, flag: "https://flagcdn.com/w320/ca.png", code: "CA", region: "Americas" },
  { name: "Chile", population: 19116201, area: 756102, density: 25.28, flag: "https://flagcdn.com/w320/cl.png", code: "CL", region: "Americas" },
  { name: "China", population: 1412600000, area: 9706961, density: 145.54, flag: "https://flagcdn.com/w320/cn.png", code: "CN", region: "Asia" },
  { name: "Colombia", population: 51265844, area: 1141748, density: 44.9, flag: "https://flagcdn.com/w320/co.png", code: "CO", region: "Americas" },
  { name: "Cuba", population: 11326616, area: 109884, density: 103.08, flag: "https://flagcdn.com/w320/cu.png", code: "CU", region: "Americas" },
  { name: "Czech Republic", population: 10724558, area: 78867, density: 135.99, flag: "https://flagcdn.com/w320/cz.png", code: "CZ", region: "Europe" },
  { name: "Denmark", population: 5831404, area: 43094, density: 135.31, flag: "https://flagcdn.com/w320/dk.png", code: "DK", region: "Europe" },
  { name: "Ecuador", population: 17643060, area: 283561, density: 62.22, flag: "https://flagcdn.com/w320/ec.png", code: "EC", region: "Americas" },
  { name: "Egypt", population: 102334404, area: 1002450, density: 102.08, flag: "https://flagcdn.com/w320/eg.png", code: "EG", region: "Africa" },
  { name: "Ethiopia", population: 120283026, area: 1104300, density: 108.92, flag: "https://flagcdn.com/w320/et.png", code: "ET", region: "Africa" },
  { name: "Finland", population: 5530719, area: 338424, density: 16.34, flag: "https://flagcdn.com/w320/fi.png", code: "FI", region: "Europe" },
  { name: "France", population: 67391582, area: 551695, density: 122.15, flag: "https://flagcdn.com/w320/fr.png", code: "FR", region: "Europe" },
  { name: "Germany", population: 83240525, area: 357114, density: 233.09, flag: "https://flagcdn.com/w320/de.png", code: "DE", region: "Europe" },
  { name: "Ghana", population: 31072940, area: 238533, density: 130.27, flag: "https://flagcdn.com/w320/gh.png", code: "GH", region: "Africa" },
  { name: "Greece", population: 10718565, area: 131990, density: 81.21, flag: "https://flagcdn.com/w320/gr.png", code: "GR", region: "Europe" },
  { name: "Hungary", population: 9749763, area: 93028, density: 104.81, flag: "https://flagcdn.com/w320/hu.png", code: "HU", region: "Europe" },
  { name: "India", population: 1380004385, area: 3287590, density: 419.9, flag: "https://flagcdn.com/w320/in.png", code: "IN", region: "Asia" },
  { name: "Indonesia", population: 273523621, area: 1904569, density: 143.63, flag: "https://flagcdn.com/w320/id.png", code: "ID", region: "Asia" },
  { name: "Iran", population: 85028759, area: 1648195, density: 51.59, flag: "https://flagcdn.com/w320/ir.png", code: "IR", region: "Asia" },
  { name: "Iraq", population: 40222493, area: 438317, density: 91.77, flag: "https://flagcdn.com/w320/iq.png", code: "IQ", region: "Asia" },
  { name: "Ireland", population: 4994724, area: 70273, density: 71.08, flag: "https://flagcdn.com/w320/ie.png", code: "IE", region: "Europe" },
  { name: "Israel", population: 9216900, area: 20770, density: 443.77, flag: "https://flagcdn.com/w320/il.png", code: "IL", region: "Asia" },
  { name: "Italy", population: 60461826, area: 301336, density: 200.64, flag: "https://flagcdn.com/w320/it.png", code: "IT", region: "Europe" },
  { name: "Japan", population: 125836021, area: 377930, density: 332.95, flag: "https://flagcdn.com/w320/jp.png", code: "JP", region: "Asia" },
  { name: "Jordan", population: 10203140, area: 89342, density: 114.20, flag: "https://flagcdn.com/w320/jo.png", code: "JO", region: "Asia" },
  { name: "Kenya", population: 53771296, area: 580367, density: 92.65, flag: "https://flagcdn.com/w320/ke.png", code: "KE", region: "Africa" },
  { name: "Malaysia", population: 32365999, area: 329847, density: 98.12, flag: "https://flagcdn.com/w320/my.png", code: "MY", region: "Asia" },
  { name: "Mexico", population: 128932753, area: 1964375, density: 65.64, flag: "https://flagcdn.com/w320/mx.png", code: "MX", region: "Americas" },
  { name: "Morocco", population: 36910558, area: 446550, density: 82.67, flag: "https://flagcdn.com/w320/ma.png", code: "MA", region: "Africa" },
  { name: "Mozambique", population: 32163047, area: 801590, density: 40.12, flag: "https://flagcdn.com/w320/mz.png", code: "MZ", region: "Africa" },
  { name: "Netherlands", population: 17441139, area: 41543, density: 419.97, flag: "https://flagcdn.com/w320/nl.png", code: "NL", region: "Europe" },
  { name: "New Zealand", population: 5122600, area: 270467, density: 18.94, flag: "https://flagcdn.com/w320/nz.png", code: "NZ", region: "Oceania" },
  { name: "Nigeria", population: 206139587, area: 923768, density: 223.18, flag: "https://flagcdn.com/w320/ng.png", code: "NG", region: "Africa" },
  { name: "Norway", population: 5379475, area: 323802, density: 16.61, flag: "https://flagcdn.com/w320/no.png", code: "NO", region: "Europe" },
  { name: "Pakistan", population: 220892331, area: 881913, density: 250.48, flag: "https://flagcdn.com/w320/pk.png", code: "PK", region: "Asia" },
  { name: "Paraguay", population: 7132538, area: 406752, density: 17.53, flag: "https://flagcdn.com/w320/py.png", code: "PY", region: "Americas" },
  { name: "Peru", population: 32971846, area: 1285216, density: 25.65, flag: "https://flagcdn.com/w320/pe.png", code: "PE", region: "Americas" },
  { name: "Philippines", population: 109581085, area: 342353, density: 320.09, flag: "https://flagcdn.com/w320/ph.png", code: "PH", region: "Asia" },
  { name: "Poland", population: 37950802, area: 312679, density: 121.37, flag: "https://flagcdn.com/w320/pl.png", code: "PL", region: "Europe" },
  { name: "Portugal", population: 10305564, area: 92090, density: 111.91, flag: "https://flagcdn.com/w320/pt.png", code: "PT", region: "Europe" },
  { name: "Romania", population: 19286123, area: 238397, density: 80.89, flag: "https://flagcdn.com/w320/ro.png", code: "RO", region: "Europe" },
  { name: "Russia", population: 144104080, area: 17098242, density: 8.43, flag: "https://flagcdn.com/w320/ru.png", code: "RU", region: "Europe" },
  { name: "Saudi Arabia", population: 34813867, area: 2149690, density: 16.19, flag: "https://flagcdn.com/w320/sa.png", code: "SA", region: "Asia" },
  { name: "Senegal", population: 17196301, area: 196722, density: 87.41, flag: "https://flagcdn.com/w320/sn.png", code: "SN", region: "Africa" },
  { name: "South Africa", population: 59308690, area: 1221037, density: 48.57, flag: "https://flagcdn.com/w320/za.png", code: "ZA", region: "Africa" },
  { name: "South Korea", population: 51780579, area: 100210, density: 516.73, flag: "https://flagcdn.com/w320/kr.png", code: "KR", region: "Asia" },
  { name: "Spain", population: 46754783, area: 505990, density: 92.42, flag: "https://flagcdn.com/w320/es.png", code: "ES", region: "Europe" },
  { name: "Sudan", population: 43849260, area: 1886068, density: 23.25, flag: "https://flagcdn.com/w320/sd.png", code: "SD", region: "Africa" },
  { name: "Sweden", population: 10353442, area: 450295, density: 22.99, flag: "https://flagcdn.com/w320/se.png", code: "SE", region: "Europe" },
  { name: "Switzerland", population: 8654622, area: 41285, density: 209.63, flag: "https://flagcdn.com/w320/ch.png", code: "CH", region: "Europe" },
  { name: "Syria", population: 21324367, area: 185180, density: 115.16, flag: "https://flagcdn.com/w320/sy.png", code: "SY", region: "Asia" },
  { name: "Tanzania", population: 61498437, area: 945087, density: 65.07, flag: "https://flagcdn.com/w320/tz.png", code: "TZ", region: "Africa" },
  { name: "Thailand", population: 69950807, area: 513120, density: 136.32, flag: "https://flagcdn.com/w320/th.png", code: "TH", region: "Asia" },
  { name: "Turkey", population: 84339067, area: 783562, density: 107.64, flag: "https://flagcdn.com/w320/tr.png", code: "TR", region: "Asia" },
  { name: "Uganda", population: 47123531, area: 241550, density: 195.09, flag: "https://flagcdn.com/w320/ug.png", code: "UG", region: "Africa" },
  { name: "Ukraine", population: 43733762, area: 603550, density: 72.46, flag: "https://flagcdn.com/w320/ua.png", code: "UA", region: "Europe" },
  { name: "United Arab Emirates", population: 9890402, area: 83600, density: 118.31, flag: "https://flagcdn.com/w320/ae.png", code: "AE", region: "Asia" },
  { name: "United Kingdom", population: 67215293, area: 242900, density: 276.72, flag: "https://flagcdn.com/w320/gb.png", code: "GB", region: "Europe" },
  { name: "United States", population: 329484123, area: 9372610, density: 35.16, flag: "https://flagcdn.com/w320/us.png", code: "US", region: "Americas" },
  { name: "Uruguay", population: 3473727, area: 176215, density: 19.71, flag: "https://flagcdn.com/w320/uy.png", code: "UY", region: "Americas" },
  { name: "Venezuela", population: 28435943, area: 916445, density: 31.03, flag: "https://flagcdn.com/w320/ve.png", code: "VE", region: "Americas" },
  { name: "Vietnam", population: 97338583, area: 331212, density: 293.89, flag: "https://flagcdn.com/w320/vn.png", code: "VN", region: "Asia" },
  { name: "Yemen", population: 33696614, area: 527968, density: 63.82, flag: "https://flagcdn.com/w320/ye.png", code: "YE", region: "Asia" },
  { name: "Zambia", population: 18383956, area: 752612, density: 24.43, flag: "https://flagcdn.com/w320/zm.png", code: "ZM", region: "Africa" },
  { name: "Zimbabwe", population: 14862927, area: 390757, density: 38.04, flag: "https://flagcdn.com/w320/zw.png", code: "ZW", region: "Africa" },
];

const cardColors = {
  idle:      { border: "2px solid #1e3a5f", bg: "#1e293b", shadow: "none", opacity: 1, filter: "none" },
  found:     { border: "3px solid #22c55e", bg: "#052e16", shadow: "0 0 32px #22c55e99", opacity: 1, filter: "none" },
  mid:       { border: "3px solid #fbbf24", bg: "#1c1a00", shadow: "0 0 28px #fbbf2499", opacity: 1, filter: "none" },
  current:   { border: "3px solid #60a5fa", bg: "#0c1e40", shadow: "0 0 28px #60a5fa99", opacity: 1, filter: "none" },
  low:       { border: "2px solid #a78bfa", bg: "#170e2e", shadow: "0 0 14px #a78bfa66", opacity: 1, filter: "none" },
  high:      { border: "2px solid #f472b6", bg: "#1f0a1c", shadow: "0 0 14px #f472b666", opacity: 1, filter: "none" },
  checked:   { border: "2px solid #0f1c2e", bg: "#111827", shadow: "none", opacity: 0.3, filter: "grayscale(0.8)" },
  discarded: { border: "2px solid #0a0f1a", bg: "#0a0f1a", shadow: "none", opacity: 0.12, filter: "grayscale(1)" },
};

function computeLinear(list, q, key) {
  const steps = [];
  for (let i = 0; i < list.length; i++) {
    const val = String(list[i][key] ?? "").toLowerCase();
    const found = val === q || val.includes(q);
    steps.push({ current: i, comparisons: i + 1, found, country: list[i] });
    if (found) return { steps, found: i, totalComparisons: i + 1 };
  }
  return { steps, found: -1, totalComparisons: list.length };
}

function computeBinary(list, q, key) {
  const steps = [];
  let low = 0, high = list.length - 1, comparisons = 0;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const val = String(list[mid][key] ?? "").toLowerCase();
    comparisons++;
    const dl = Array.from({ length: low }, (_, i) => i);
    const dr = Array.from({ length: list.length - high - 1 }, (_, i) => high + 1 + i);
    if (val === q) {
      steps.push({ low, mid, high, comparisons, current: mid, found: true, country: list[mid], discarded_left: dl, discarded_right: dr });
      return { steps, found: mid, totalComparisons: comparisons };
    } else if (val < q) {
      steps.push({ low, mid, high, comparisons, current: mid, found: false, direction: "right", country: list[mid], discarded_left: dl, discarded_right: dr });
      low = mid + 1;
    } else {
      steps.push({ low, mid, high, comparisons, current: mid, found: false, direction: "left", country: list[mid], discarded_left: dl, discarded_right: dr });
      high = mid - 1;
    }
  }
  return { steps, found: -1, totalComparisons: comparisons };
}

export default function App() {
  const [allCountries, setAllCountries] = useState([]);
  const [sampleSize, setSampleSize] = useState(25);
  const [usingDemo, setUsingDemo] = useState(false);
  const [sortKey, setSortKey] = useState("name");
  const [sorted, setSorted] = useState(false);
  const [workingList, setWorkingList] = useState([]);
  const [query, setQuery] = useState("");
  const [speed, setSpeed] = useState(500);
  const [activeAlgo, setActiveAlgo] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [stats, setStats] = useState({ linear: null, binary: null });
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  // Load countries
  useEffect(() => {
    fetch(`${API}/countries`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) throw new Error();
        setAllCountries(data);
        setUsingDemo(false);
        setLoading(false);
      })
      .catch(() => {
        setAllCountries(ALL_DEMO);
        setUsingDemo(true);
        setLoading(false);
      });
  }, []);

  // Rebuild working list when sample size or allCountries changes
  useEffect(() => {
    if (allCountries.length === 0) return;
    const slice = allCountries.slice(0, sampleSize);
    setWorkingList(slice);
    setSorted(false);
    setSteps([]); setCurrentStep(-1); setResult(null); setNotFound(false);
  }, [allCountries, sampleSize]);

  const handleSort = useCallback(() => {
    if (!workingList.length) return;
    const copy = [...workingList].sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      if (va == null) return 1; if (vb == null) return -1;
      if (typeof va === "string") return va.localeCompare(vb);
      return Number(va) - Number(vb);
    });
    setWorkingList(copy);
    setSorted(true);
    setSteps([]); setCurrentStep(-1); setResult(null); setNotFound(false);
  }, [workingList, sortKey]);

  const runSearch = useCallback((algo) => {
    if (!query.trim() || !workingList.length) return;
    clearInterval(intervalRef.current);
    setIsPlaying(false); setSteps([]); setCurrentStep(-1);
    setResult(null); setNotFound(false); setActiveAlgo(algo);

    const q = query.toLowerCase();
    const data = algo === "linear" ? computeLinear(workingList, q, sortKey) : computeBinary(workingList, q, sortKey);
    const safeSteps = Array.isArray(data.steps) ? data.steps : [];
    setSteps(safeSteps);
    setStats(prev => ({ ...prev, [algo]: data.totalComparisons }));
    const foundCountry = data.found >= 0 ? workingList[data.found] : null;

    let i = 0;
    intervalRef.current = setInterval(() => {
      setCurrentStep(i);
      const el = document.getElementById(`card-${i}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      i++;
      if (i >= safeSteps.length) {
        clearInterval(intervalRef.current);
        setIsPlaying(false);
        setResult(foundCountry);
        setNotFound(!foundCountry);
      }
    }, speed);
    setIsPlaying(true);
  }, [query, workingList, sortKey, speed]);

  const pause = () => { clearInterval(intervalRef.current); setIsPlaying(false); };
  const resume = () => {
    if (currentStep >= steps.length - 1) return;
    let i = currentStep + 1;
    intervalRef.current = setInterval(() => {
      setCurrentStep(i); i++;
      if (i >= steps.length) { clearInterval(intervalRef.current); setIsPlaying(false); }
    }, speed);
    setIsPlaying(true);
  };
  const stepFwd = () => { pause(); setCurrentStep(s => Math.min(s + 1, steps.length - 1)); };
  const stepBck = () => { pause(); setCurrentStep(s => Math.max(s - 1, 0)); };

  const generateChart = () => {
    if (!query.trim()) return;
    setLoadingChart(true);
    const q = query.toLowerCase();
    const sizes = [5, 10, 15, 25, 50, Math.min(100, workingList.length)].filter((v, i, a) => a.indexOf(v) === i && v <= workingList.length);
    const data = sizes.map(size => {
      const sample = workingList.slice(0, size);
      return {
        size,
        linear: computeLinear(sample, q, sortKey).totalComparisons,
        binary: computeBinary(sample, q, sortKey).totalComparisons,
      };
    });
    setChartData(data);
    setLoadingChart(false);
  };

  const getCardState = (i) => {
    if (!steps[currentStep] || activeAlgo === null) return "idle";
    const step = steps[currentStep];
    if (activeAlgo === "binary") {
      const { low, high, mid, discarded_left = [], discarded_right = [], found } = step;
      if (found && i === mid) return "found";
      if (i === mid) return "mid";
      if (i === low) return "low";
      if (i === high) return "high";
      if (discarded_left.includes(i) || discarded_right.includes(i)) return "discarded";
    }
    if (activeAlgo === "linear") {
      const { current, found } = step;
      if (found && i === current) return "found";
      if (i === current) return "current";
      if (i < current) return "checked";
    }
    return "idle";
  };

  const step = steps[currentStep] || null;
  const pseudoLine = getPseudoLine(activeAlgo, step);
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a1628", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div style={{ width: 64, height: 64, border: "5px solid #1e3a5f", borderTop: "5px solid #60a5fa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#64748b", fontFamily: "sans-serif", fontSize: 16 }}>Carregando países...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a1628", color: "#e2e8f0", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
        @keyframes popIn { from{transform:scale(0.85);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px #22c55e66} 50%{box-shadow:0 0 40px #22c55ecc} }
        .card { transition: all 0.28s cubic-bezier(.4,0,.2,1); }
        .found-pulse { animation: pulse 0.7s ease infinite, glow 1s ease infinite; }
        .pop { animation: popIn 0.35s ease; }
        button { transition: all 0.15s; }
        button:hover:not(:disabled) { filter: brightness(1.18); transform: translateY(-1px); }
        button:disabled { opacity: 0.35; cursor: not-allowed !important; transform: none !important; filter: none !important; }
        input:focus, select:focus { outline: 2px solid #60a5fa; outline-offset: 2px; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #0a1628; } ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 4px; }
      `}</style>

      {/* HEADER */}
      <header style={{ background: "linear-gradient(135deg,#0d1f3c,#0a1628)", borderBottom: "1px solid #1a3050", padding: "16px 0", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(10px)" }}>
        <div style={{ maxWidth: 1480, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, background: "linear-gradient(90deg,#60a5fa,#34d399,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              🌍 Algoritmos de Busca — Países do Mundo
            </h1>
            <p style={{ color: "#3d5a80", margin: "2px 0 0", fontSize: 12 }}>Visualização interativa · Busca Linear vs Binária · Bandeiras reais</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {usingDemo && <Tag color="#f97316" bg="#1a0a00" border="#7c2d12">⚡ Modo Demo</Tag>}
            {sorted && <Tag color="#22c55e" bg="#031a0e" border="#064e3b">✓ Ordenado</Tag>}
            <Tag color="#60a5fa" bg="#0a1628" border="#1e3a5f">📋 {workingList.length} países</Tag>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1480, margin: "0 auto", padding: "20px 24px" }}>

        {/* CONTROLS */}
        <section style={{ background: "linear-gradient(135deg,#0d1f3c,#0f172a)", border: "1px solid #1a3050", borderRadius: 18, padding: "20px 24px", marginBottom: 18, display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-end" }}>

          {/* Sample size */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={labelStyle}>📊 Quantidade de países</label>
            <div style={{ display: "flex", gap: 6 }}>
              {SAMPLE_SIZES.map(s => (
                <button key={s} onClick={() => { setSampleSize(s); setQuery(""); setSteps([]); setCurrentStep(-1); setResult(null); setNotFound(false); setStats({ linear: null, binary: null }); setChartData([]); }}
                  style={{ padding: "9px 18px", borderRadius: 10, border: s === sampleSize ? "2px solid #60a5fa" : "1px solid #1e3a5f", background: s === sampleSize ? "#0c2a52" : "#0a1628", color: s === sampleSize ? "#60a5fa" : "#64748b", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Sort key */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={labelStyle}>🔑 Chave de busca</label>
            <select style={selectStyle} value={sortKey} onChange={e => { setSortKey(e.target.value); setSorted(false); setWorkingList(allCountries.slice(0, sampleSize)); setSteps([]); setCurrentStep(-1); setResult(null); setNotFound(false); }}>
              {SORT_KEYS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
            </select>
          </div>

          {/* Query */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={labelStyle}>🔍 Termo de busca</label>
            <input style={inputStyle}
              placeholder={sortKey === "name" ? "Ex: brazil, france, japan..." : "Ex: 50000000"}
              value={query}
              onChange={e => { setQuery(e.target.value); setSteps([]); setCurrentStep(-1); setResult(null); setNotFound(false); }}
            />
          </div>

          {/* Speed */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 190 }}>
            <label style={labelStyle}>⚡ Velocidade: <span style={{ color: "#60a5fa", fontWeight: 900 }}>{speed}ms</span>/passo</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, color: "#3d5a80" }}>Rápido</span>
              <input type="range" min={80} max={1600} step={80} value={speed} onChange={e => setSpeed(Number(e.target.value))} style={{ flex: 1, accentColor: "#60a5fa" }} />
              <span style={{ fontSize: 10, color: "#3d5a80" }}>Lento</span>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <button onClick={handleSort} style={{ ...btnBase, background: "#1e3a5f", color: "#93c5fd" }}>⇅ Ordenar</button>

            <button onClick={() => runSearch("linear")} disabled={!query.trim()}
              style={{ ...btnBase, background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "#fff", boxShadow: "0 4px 18px #1d4ed844" }}>
              🔍 Busca Linear
            </button>

            <div style={{ position: "relative" }}>
              <button onClick={() => sorted && runSearch("binary")} disabled={!sorted || !query.trim()}
                style={{ ...btnBase, background: sorted ? "linear-gradient(135deg,#059669,#10b981)" : "#0a1628", color: sorted ? "#fff" : "#1e3a5f", boxShadow: sorted ? "0 4px 18px #05966944" : "none", border: sorted ? "none" : "1px solid #1a3050", cursor: sorted ? "pointer" : "not-allowed" }}>
                🎯 Busca Binária {!sorted && "🔒"}
              </button>
              {!sorted && (
                <div style={{ position: "absolute", bottom: "115%", left: "50%", transform: "translateX(-50%)", background: "#1a0500", border: "1px solid #f97316", color: "#fed7aa", padding: "7px 14px", borderRadius: 8, fontSize: 11, whiteSpace: "nowrap", zIndex: 200, fontWeight: 700, pointerEvents: "none" }}>
                  ⚠️ Clique em "Ordenar" primeiro!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SPOTLIGHT — país sendo comparado agora */}
        {step && (
          <section className="pop" style={{ background: "linear-gradient(135deg,#0d1f3c,#0a1628)", border: "1px solid #1a3050", borderRadius: 16, padding: "16px 24px", marginBottom: 16, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 10, color: "#3d5a80", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>👁️ Comparando agora</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <img src={step.country?.flag} alt="" style={{ height: 60, width: 96, objectFit: "cover", borderRadius: 8, border: "2px solid #1a3050", boxShadow: "0 4px 20px #00000088" }} onError={e => e.target.style.display = "none"} />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#f1f5f9" }}>{step.country?.name}</div>
                  <div style={{ fontSize: 11, color: "#3d5a80", marginTop: 2 }}>índice #{step.current} · {step.country?.region}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", flex: 1 }}>
              {activeAlgo === "binary" && (
                <>
                  <Pill label="LOW" value={step.low} color="#a78bfa" />
                  <Pill label="MID" value={step.mid} color="#fbbf24" />
                  <Pill label="HIGH" value={step.high} color="#f472b6" />
                  {step.direction && (
                    <div style={{ padding: "8px 16px", background: step.direction === "right" ? "#052e16" : "#1a0505", border: `1px solid ${step.direction === "right" ? "#22c55e" : "#ef4444"}`, borderRadius: 10, fontSize: 14, fontWeight: 800, color: step.direction === "right" ? "#22c55e" : "#f87171" }}>
                      {step.direction === "right" ? "→ buscar à direita" : "← buscar à esquerda"}
                    </div>
                  )}
                </>
              )}
              {activeAlgo === "linear" && <Pill label="ÍNDICE i" value={step.current} color="#60a5fa" />}
              <Pill label="COMPARAÇÕES" value={step.comparisons} color="#34d399" />
              {step.found && <div style={{ fontSize: 22, fontWeight: 900, color: "#22c55e", animation: "pulse 0.6s ease infinite" }}>✅ ENCONTRADO!</div>}
            </div>
          </section>
        )}

        {/* RESULT */}
        {result && (
          <section className="pop found-pulse" style={{ background: "linear-gradient(135deg,#031a0e,#052e16)", border: "2px solid #22c55e", borderRadius: 16, padding: "20px 28px", marginBottom: 16, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <img src={result.flag} alt="" style={{ height: 84, width: 136, objectFit: "cover", borderRadius: 10, border: "3px solid #22c55e", boxShadow: "0 0 36px #22c55e88" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5 }}>✅ País encontrado!</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: "4px 0 6px" }}>{result.name}</div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 13, color: "#6ee7b7" }}>
                <span>👥 {result.population?.toLocaleString("pt-BR")}</span>
                <span>📐 {result.area ? result.area.toLocaleString("pt-BR") + " km²" : "—"}</span>
                <span>🏙️ {result.density} hab/km²</span>
                <span>🌍 {result.region}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#3d5a80" }}>Comparações usadas</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: "#22c55e", lineHeight: 1 }}>{stats[activeAlgo]}</div>
            </div>
          </section>
        )}

        {notFound && (
          <div className="pop" style={{ background: "#150505", border: "2px solid #ef4444", borderRadius: 14, padding: "16px 24px", marginBottom: 16, color: "#fca5a5", fontWeight: 700, fontSize: 15 }}>
            ❌ "{query}" não encontrado após <strong>{stats[activeAlgo]}</strong> comparações.
          </div>
        )}

        {/* PLAYBACK */}
        {steps.length > 0 && (
          <section style={{ background: "#0d1f3c", border: "1px solid #1a3050", borderRadius: 14, padding: "14px 20px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button onClick={stepBck} disabled={currentStep <= 0} style={btnPlaySmall}>⏮</button>
            {isPlaying
              ? <button onClick={pause} style={{ ...btnPlaySmall, background: "#7c3aed", color: "#e9d5ff", border: "none" }}>⏸ Pausar</button>
              : <button onClick={resume} disabled={currentStep >= steps.length - 1} style={{ ...btnPlaySmall, background: "#1d4ed8", color: "#fff", border: "none" }}>▶ Continuar</button>
            }
            <button onClick={stepFwd} disabled={currentStep >= steps.length - 1} style={btnPlaySmall}>⏭</button>
            <div style={{ flex: 1, height: 7, background: "#1a3050", borderRadius: 4, overflow: "hidden", minWidth: 100 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#60a5fa,#34d399)", borderRadius: 4, transition: "width 0.3s" }} />
            </div>
            <span style={{ color: "#3d5a80", fontSize: 13, whiteSpace: "nowrap" }}>
              Passo <strong style={{ color: "#e2e8f0" }}>{Math.max(currentStep + 1, 0)}</strong> / {steps.length}
            </span>
          </section>
        )}

        {/* SIDE PANELS: pseudocode + stats + chart */}
        {(steps.length > 0 || stats.linear != null || stats.binary != null || chartData.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, marginBottom: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {steps.length > 0 && (
                <div style={{ background: "#0d1f3c", border: "1px solid #1a3050", borderRadius: 14, padding: 18, fontFamily: "monospace" }}>
                  <div style={sectionLabel}>{activeAlgo === "linear" ? "🔍 Pseudocódigo Linear" : "🎯 Pseudocódigo Binária"}</div>
                  {PSEUDOCODE[activeAlgo].map((line, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, padding: "4px 8px", borderRadius: 6, fontSize: 12, color: i === pseudoLine ? "#fff" : "#3d5a80", background: i === pseudoLine ? "#1d4ed8" : "transparent", fontWeight: i === pseudoLine ? 800 : 400, transition: "all 0.2s", marginBottom: 2 }}>
                      <span style={{ minWidth: 16, color: i === pseudoLine ? "#93c5fd" : "#1a3050" }}>{i + 1}</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              )}
              {(stats.linear != null || stats.binary != null) && (
                <div style={{ background: "#0d1f3c", border: "1px solid #1a3050", borderRadius: 14, padding: 18 }}>
                  <div style={sectionLabel}>📈 Comparações</div>
                  {stats.linear != null && <StatRow label="🔍 Linear" value={stats.linear} color="#60a5fa" />}
                  {stats.binary != null && <StatRow label="🎯 Binária" value={stats.binary} color="#34d399" />}
                  {stats.linear != null && stats.binary != null && (
                    <div style={{ marginTop: 12, padding: "10px 12px", background: "#0a1628", borderRadius: 8, fontSize: 12, color: "#fbbf24" }}>
                      {stats.linear > stats.binary ? `💡 Binária usou ${stats.linear - stats.binary} comparações a menos!`
                        : stats.binary > stats.linear ? `💡 Linear foi mais eficiente aqui.`
                        : "💡 Mesma eficiência neste caso."}
                    </div>
                  )}
                  <button onClick={generateChart} disabled={loadingChart || !query.trim()}
                    style={{ ...btnBase, marginTop: 12, width: "100%", background: "#4c1d95", color: "#e9d5ff", fontSize: 12, padding: "9px" }}>
                    {loadingChart ? "⏳ Calculando..." : "📊 Gerar gráfico comparativo"}
                  </button>
                </div>
              )}
            </div>

            {chartData.length > 0 ? (
              <div style={{ background: "#0d1f3c", border: "1px solid #1a3050", borderRadius: 14, padding: 20 }}>
                <div style={sectionLabel}>📊 Crescimento de Comparações por Tamanho</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData} margin={{ bottom: 24, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a3050" />
                    <XAxis dataKey="size" stroke="#3d5a80" fontSize={12} label={{ value: "N° países", position: "insideBottom", offset: -14, fill: "#3d5a80", fontSize: 11 }} />
                    <YAxis stroke="#3d5a80" fontSize={12} />
                    <Tooltip contentStyle={{ background: "#0d1f3c", border: "1px solid #1a3050", borderRadius: 8, fontSize: 12 }} />
                    <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
                    <Line type="monotone" dataKey="linear" stroke="#60a5fa" strokeWidth={2.5} name="Linear" dot={{ r: 5 }} activeDot={{ r: 7 }} />
                    <Line type="monotone" dataKey="binary" stroke="#34d399" strokeWidth={2.5} name="Binária" dot={{ r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ background: "#0d1f3c", border: "1px dashed #1a3050", borderRadius: 14, padding: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "#1a3050", fontSize: 14 }}>
                Execute uma busca e clique em "Gerar gráfico comparativo"
              </div>
            )}
          </div>
        )}

        {/* LEGEND */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {[
            ["current", "#60a5fa", "Verificando (Linear)"],
            ["mid", "#fbbf24", "MID (Binária)"],
            ["low", "#a78bfa", "LOW"],
            ["high", "#f472b6", "HIGH"],
            ["found", "#22c55e", "ENCONTRADO! ✅"],
            ["checked", "#334155", "Já verificado"],
            ["discarded", "#1e293b", "Descartado"],
          ].map(([key, color, label]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#0d1f3c", border: `1px solid ${color}33`, borderRadius: 20 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: color }} />
              <span style={{ fontSize: 11, color: "#64748b" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* COUNTRY GRID */}
        <section>
          <div style={{ fontSize: 13, color: "#3d5a80", fontWeight: 600, marginBottom: 12 }}>
            Exibindo {workingList.length} países {sorted ? `· ordenados por ${SORT_KEYS.find(k => k.value === sortKey)?.label}` : "· clique em Ordenar para ativar a busca binária"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 10 }}>
            {workingList.map((c, i) => {
              const state = getCardState(i);
              const cs = cardColors[state] || cardColors.idle;
              const isActive = ["found","mid","current","low","high"].includes(state);
              const accentColor = cs.border.split(" ")[2] || "#1e3a5f";
              return (
                <div
                  id={`card-${i}`}
                  key={(c.code || c.name) + i}
                  className={`card ${state === "found" ? "found-pulse" : ""}`}
                  style={{ background: cs.bg, border: cs.border, borderRadius: 14, padding: "10px 8px", boxShadow: cs.shadow, opacity: cs.opacity, filter: cs.filter, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative" }}
                >
                  {/* Index */}
                  <div style={{ position: "absolute", top: 5, left: 7, background: "#0a162899", color: "#3d5a80", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4 }}>#{i}</div>

                  {/* Flag */}
                  <div style={{ width: "100%", height: 82, borderRadius: 8, overflow: "hidden", border: `2px solid ${isActive ? accentColor : "#1a3050"}`, position: "relative", flexShrink: 0 }}>
                    {c.flag
                      ? <img src={c.flag} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
                      : <div style={{ width: "100%", height: "100%", background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🏳️</div>
                    }
                    {isActive && <div style={{ position: "absolute", inset: 0, background: `${accentColor}22`, pointerEvents: "none" }} />}
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 800, color: "#e2e8f0", textAlign: "center", lineHeight: 1.3, width: "100%" }}>{c.name}</div>
                  <div style={{ fontSize: 9, color: "#3d5a80", textAlign: "center" }}>👥 {(c.population || 0).toLocaleString("pt-BR")}</div>
                  <div style={{ fontSize: 9, color: "#3d5a80", textAlign: "center" }}>📐 {c.area ? c.area.toLocaleString("pt-BR") + " km²" : "—"}</div>

                  {/* State badges */}
                  <div style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center", minHeight: 16 }}>
                    {step && activeAlgo === "binary" && step.mid === i && <Badge label="MID" color="#fbbf24" />}
                    {step && activeAlgo === "binary" && step.low === i && <Badge label="LOW" color="#a78bfa" />}
                    {step && activeAlgo === "binary" && step.high === i && <Badge label="HIGH" color="#f472b6" />}
                    {step && activeAlgo === "linear" && step.current === i && !step.found && <Badge label={`i=${i}`} color="#60a5fa" />}
                    {state === "found" && <Badge label="✅ ACHEI!" color="#22c55e" />}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function Tag({ color, bg, border, children }) {
  return <span style={{ background: bg, border: `1px solid ${border}`, color, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{children}</span>;
}
function Pill({ label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: `${color}15`, border: `1px solid ${color}44`, borderRadius: 10, padding: "8px 14px", minWidth: 60 }}>
      <span style={{ fontSize: 9, color, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
      <span style={{ fontSize: 24, fontWeight: 900, color, lineHeight: 1.1 }}>{value}</span>
    </div>
  );
}
function StatRow({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a3050" }}>
      <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
      <strong style={{ fontSize: 22, color }}>{value}</strong>
    </div>
  );
}
function Badge({ label, color }) {
  return <span style={{ background: color, color: "#000", fontSize: 8, padding: "2px 6px", borderRadius: 4, fontWeight: 900, letterSpacing: 0.5 }}>{label}</span>;
}

const labelStyle = { fontSize: 10, color: "#3d5a80", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2 };
const sectionLabel = { fontSize: 10, color: "#3d5a80", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 };
const selectStyle = { background: "#0a1628", border: "1px solid #1a3050", color: "#e2e8f0", padding: "9px 14px", borderRadius: 10, fontSize: 14, minWidth: 175, cursor: "pointer" };
const inputStyle = { background: "#0a1628", border: "1px solid #1a3050", color: "#e2e8f0", padding: "9px 14px", borderRadius: 10, fontSize: 14, minWidth: 220 };
const btnBase = { padding: "10px 20px", borderRadius: 10, border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer" };
const btnPlaySmall = { padding: "8px 14px", borderRadius: 8, border: "1px solid #1a3050", background: "#0a1628", color: "#93c5fd", fontSize: 13, fontWeight: 700, cursor: "pointer" };
