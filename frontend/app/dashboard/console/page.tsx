"use client";

import { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

type Tab = "encode" | "transcode" | "analyze" | "stats";

export default function ConsolePage() {
  const [tab, setTab] = useState<Tab>("encode");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // encode tab
  const [encodePayload, setEncodePayload] = useState(
    JSON.stringify(
      { data: "SGVsbG8gV29ybGQ=", codec: "wavelet_rans", quality: 90 },
      null,
      2
    )
  );

  // transcode tab
  const [transcodePayload, setTranscodePayload] = useState(
    JSON.stringify(
      {
        input_codec: "h264",
        output_codec: "wavelet_rans",
        bitrate: 4000,
        resolution: "1920x1080",
      },
      null,
      2
    )
  );

  // analyze tab
  const [analyzePayload, setAnalyzePayload] = useState(
    JSON.stringify(
      { data: "SGVsbG8gV29ybGQ=", metrics: ["psnr", "ssim", "bitrate"] },
      null,
      2
    )
  );

  async function post(path: string, body: string) {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (e) {
      setResult(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  async function get(path: string) {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(`${API_BASE}${path}`);
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (e) {
      setResult(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  const tabs: Tab[] = ["encode", "transcode", "analyze", "stats"];

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 p-6 font-mono">
      <h1 className="text-2xl font-bold mb-6 text-green-300">
        ALICE-Codec-Cloud / Console
      </h1>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setResult(""); }}
            className={`px-4 py-2 rounded text-sm font-semibold uppercase tracking-wide transition-colors ${
              tab === t
                ? "bg-green-700 text-white"
                : "bg-gray-800 text-green-400 hover:bg-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* encode */}
      {tab === "encode" && (
        <div className="space-y-4">
          <p className="text-green-500 text-sm">
            POST /api/v1/codec/encode — encode raw data with 3D Wavelet + rANS codec
          </p>
          <textarea
            className="w-full h-40 bg-gray-800 border border-gray-700 rounded p-3 text-green-400 text-sm resize-y focus:outline-none focus:border-green-500"
            value={encodePayload}
            onChange={(e) => setEncodePayload(e.target.value)}
          />
          <div className="flex gap-3">
            <button
              onClick={() => post("/api/v1/codec/encode", encodePayload)}
              disabled={loading}
              className="px-5 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 rounded text-white text-sm font-semibold"
            >
              {loading ? "Encoding..." : "Encode"}
            </button>
            <button
              onClick={() => post("/api/v1/codec/decode", encodePayload)}
              disabled={loading}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded text-green-300 text-sm font-semibold"
            >
              {loading ? "Decoding..." : "Decode"}
            </button>
            <button
              onClick={() => get("/api/v1/codec/codecs")}
              disabled={loading}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded text-green-300 text-sm font-semibold"
            >
              List Codecs
            </button>
          </div>
        </div>
      )}

      {/* transcode */}
      {tab === "transcode" && (
        <div className="space-y-4">
          <p className="text-green-500 text-sm">
            POST /api/v1/codec/transcode — convert between codec formats
          </p>
          <textarea
            className="w-full h-40 bg-gray-800 border border-gray-700 rounded p-3 text-green-400 text-sm resize-y focus:outline-none focus:border-green-500"
            value={transcodePayload}
            onChange={(e) => setTranscodePayload(e.target.value)}
          />
          <button
            onClick={() => post("/api/v1/codec/transcode", transcodePayload)}
            disabled={loading}
            className="px-5 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 rounded text-white text-sm font-semibold"
          >
            {loading ? "Transcoding..." : "Transcode"}
          </button>
        </div>
      )}

      {/* analyze */}
      {tab === "analyze" && (
        <div className="space-y-4">
          <p className="text-green-500 text-sm">
            POST /api/v1/codec/analyze — compute PSNR / SSIM / bitrate metrics
          </p>
          <textarea
            className="w-full h-40 bg-gray-800 border border-gray-700 rounded p-3 text-green-400 text-sm resize-y focus:outline-none focus:border-green-500"
            value={analyzePayload}
            onChange={(e) => setAnalyzePayload(e.target.value)}
          />
          <button
            onClick={() => post("/api/v1/codec/analyze", analyzePayload)}
            disabled={loading}
            className="px-5 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 rounded text-white text-sm font-semibold"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      )}

      {/* stats */}
      {tab === "stats" && (
        <div className="space-y-4">
          <p className="text-green-500 text-sm">
            GET /api/v1/codec/stats — service throughput and codec performance metrics
          </p>
          <button
            onClick={() => get("/api/v1/codec/stats")}
            disabled={loading}
            className="px-5 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 rounded text-white text-sm font-semibold"
          >
            {loading ? "Loading..." : "Fetch Stats"}
          </button>
        </div>
      )}

      {/* result */}
      {result && (
        <div className="mt-6">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest">Response</p>
          <pre className="bg-gray-800 border border-gray-700 rounded p-4 text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
