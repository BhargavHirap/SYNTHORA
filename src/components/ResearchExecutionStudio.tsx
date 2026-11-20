"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Download, ExternalLink, Globe2, Loader2, Play, Search, ShieldAlert, Trash2 } from "lucide-react";

type SearchResult = { title: string; url: string; snippet: string; score: number; publishedDate: string };
type SourceResult = { url: string; title?: string; status: string; text?: string; characters?: number; error?: string; collectedAt?: string };
type Run = { id: string; query: string; createdAt: string; results: SourceResult[]; status: "completed" | "partial" };
const KEY = "synthora-v17-research-execution-history";

export default function ResearchExecutionStudio() {
  const [query, setQuery] = useState("What independent evidence supports or challenges this research hypothesis?");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState<Run[]>([]);
  const [active, setActive] = useState<Run | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (Array.isArray(saved)) setHistory(saved.slice(0, 20));
    } catch { setError("Could not load local execution history."); }
  }, []);

  async function searchSources() {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/research-execution", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search", query }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search failed.");
      setResults(data.results || []); setSelected([]); setNotice(data.notice || "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Search failed.");
    } finally { setBusy(false); }
  }

  async function collectSources() {
    const urls = [...new Set([...selected, ...manual.split(/\n|,/).map((item) => item.trim()).filter(Boolean)])].slice(0, 5);
    if (!urls.length) { setError("Select search results or paste public URLs first."); return; }
    if (!window.confirm("Approve retrieval of up to five selected public URLs? SYNTHORA will request these pages from its server.")) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/research-execution", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "collect", urls }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Collection failed.");
      const sourceResults: SourceResult[] = data.results || [];
      const run: Run = {
        id: crypto.randomUUID(), query, createdAt: new Date().toISOString(), results: sourceResults,
        status: sourceResults.length > 0 && sourceResults.every((item) => item.status === "collected") ? "completed" : "partial",
      };
      const next = [run, ...history].slice(0, 20);
      setHistory(next);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { setNotice("Run completed, but browser storage was unavailable."); }
      setActive(run); setNotice(data.notice || "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Collection failed.");
    } finally { setBusy(false); }
  }

  function exportRun(run: Run) {
    const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(run, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = objectUrl; anchor.download = "synthora-research-run-" + run.id + ".json"; anchor.click();
    URL.revokeObjectURL(objectUrl);
  }

  function clearHistory() {
    if (!window.confirm("Delete this browser's saved research execution history?")) return;
    setHistory([]); setActive(null); localStorage.removeItem(KEY);
  }

  return (
    <section id="research-execution" className="mt-12 space-y-5">
      <header>
        <div className="eyebrow flex items-center gap-2"><Globe2 size={13} /> V1.7 / Autonomous research execution</div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">From research question to source-backed evidence intake.</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Discover public sources, approve exactly what SYNTHORA retrieves, inspect provenance and keep an execution record. Search requires a server-side Tavily key; manual public URL intake works without a search key.</p>
      </header>

      <div className="panel space-y-4 rounded-2xl p-5">
        <label className="block text-xs text-slate-300">Research question
          <input value={query} onChange={(event) => setQuery(event.target.value)} maxLength={400} className="field mt-2" />
        </label>
        <button onClick={searchSources} disabled={busy || query.trim().length < 4} className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/30 px-4 py-2.5 text-xs text-emerald-100 disabled:opacity-50">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Search public sources
        </button>

        {results.length > 0 && <div className="space-y-3">
          <div className="eyebrow">Discovery results · select sources to approve</div>
          {results.map((result) => (
            <label key={result.url} className="flex gap-3 rounded-xl border border-white/[.08] p-3">
              <input type="checkbox" checked={selected.includes(result.url)}
                onChange={(event) => setSelected((current) => event.target.checked ? [...current, result.url].slice(0, 5) : current.filter((url) => url !== result.url))}
                className="mt-1 accent-emerald-300" />
              <span className="min-w-0">
                <span className="block text-sm text-slate-200">{result.title || result.url}</span>
                <span className="mt-1 block break-all text-[10px] text-emerald-200">{result.url}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-400">{result.snippet}</span>
                {result.publishedDate && <span className="mt-1 block text-[10px] text-slate-500">Published: {result.publishedDate}</span>}
              </span>
              <ExternalLink size={13} className="shrink-0 text-slate-500" />
            </label>
          ))}
        </div>}

        <label className="block text-xs text-slate-300">Manual source URLs <span className="text-slate-500">(one per line, max 5 total)</span>
          <textarea value={manual} onChange={(event) => setManual(event.target.value)} placeholder="https://example.org/research-report" className="field mt-2 min-h-20" />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={collectSources} disabled={busy || (!selected.length && !manual.trim())} className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2.5 text-xs font-semibold text-[#07110e] disabled:opacity-50">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Approve & collect selected sources
          </button>
          <span className="text-[10px] text-slate-500">{selected.length} search result(s) selected · maximum 5 sources per run</span>
        </div>
        {error && <p className="text-xs text-rose-300">{error}</p>}
        {notice && <p className="text-xs leading-5 text-amber-200/80">{notice}</p>}
        <div className="flex gap-2 rounded-lg border border-amber-300/15 bg-amber-300/[.04] p-3 text-[10px] leading-5 text-amber-100/80">
          <ShieldAlert size={14} className="mt-0.5 shrink-0" />
          Human approval is required before page retrieval. The collector blocks private/local hosts, refuses redirects, limits each page to 1.2 MB and 10 seconds, and never executes page scripts. Retrieved content is untrusted; this is not fact-checking.
        </div>
      </div>

      {active && <div className="panel rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><div className="eyebrow">Execution record · {active.status}</div><h3 className="mt-1 text-lg font-semibold">{active.query}</h3><div className="mt-1 text-[10px] text-slate-500">{new Date(active.createdAt).toLocaleString()}</div></div>
          <button onClick={() => exportRun(active)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs"><Download size={13} /> Export JSON</button>
        </div>
        <div className="mt-4 space-y-3">
          {active.results.map((item, index) => (
            <article key={item.url + index} className="rounded-xl border border-white/[.08] p-3">
              <div className="flex items-center gap-2 text-xs">
                {item.status === "collected" ? <CheckCircle2 size={14} className="text-emerald-300" /> : <ShieldAlert size={14} className="text-amber-300" />}
                <span>{item.status === "collected" ? "Collected" : "Failed"}</span>
                <span className="text-slate-500">{item.characters ? item.characters.toLocaleString() + " characters" : ""}</span>
              </div>
              <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 block break-all text-[11px] text-emerald-200">{item.url}</a>
              {item.error && <p className="mt-2 text-xs text-rose-300">{item.error}</p>}
              {item.text && <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-slate-400">{item.text.slice(0, 3000)}{item.text.length > 3000 ? "…" : ""}</p>}
            </article>
          ))}
        </div>
      </div>}

      <div className="panel rounded-2xl p-5">
        <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Research execution history</h3><button onClick={clearHistory} disabled={!history.length} className="text-[10px] text-slate-500 disabled:opacity-30"><Trash2 size={12} className="mr-1 inline" /> Clear</button></div>
        {history.length ? <div className="mt-3 space-y-2">
          {history.map((run) => (
            <button key={run.id} onClick={() => setActive(run)} className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/[.07] p-3 text-left hover:border-emerald-300/30">
              <span className="min-w-0"><span className="block truncate text-xs">{run.query}</span><span className="mt-1 block text-[10px] text-slate-500">{run.results.length} sources · {run.status} · {new Date(run.createdAt).toLocaleDateString()}</span></span>
              <Clock3 size={13} className="shrink-0 text-slate-500" />
            </button>
          ))}
        </div> : <p className="mt-3 text-xs text-slate-500">No execution runs saved in this browser yet.</p>}
      </div>
    </section>
  );
}
