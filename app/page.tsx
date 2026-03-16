"use client"

import { useTokenPairs } from "@/hooks/useTokenPairs"
import { DexLiquidityTable } from "@/components/DexLiquidityTable"

const CBDOGE_ADDRESS = "0xcbd06e5a2b0c65597161de254aa074e489deb510"

function fmtUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(2)}`
}

export default function HomePage() {
  const { pairs, totalLiquidity, totalVolume24h, isLoading, error, lastUpdated, refresh } =
    useTokenPairs(CBDOGE_ADDRESS)

  const avgPrice = pairs.length > 0
    ? pairs.reduce((sum, p) => sum + p.priceUsd * p.liquidityUsd, 0) / Math.max(totalLiquidity, 1)
    : 0

  const stats = [
    { label: "Liquidité totale", value: isLoading ? "…" : fmtUsd(totalLiquidity) },
    { label: "Volume 24h", value: isLoading ? "…" : fmtUsd(totalVolume24h) },
    { label: "Prix moyen pondéré", value: isLoading ? "…" : avgPrice > 0 ? `$${avgPrice.toFixed(6)}` : "—" },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
            cbDOGE — Liquidité DEX
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "monospace" }}>
            {CBDOGE_ADDRESS}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            Base Mainnet · Mise à jour auto toutes les 30s
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {lastUpdated && (
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ↺ Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid var(--border)",
          marginBottom: 32,
        }}
      >
        {stats.map((item, i) => (
          <div
            key={item.label}
            style={{
              padding: "20px 24px",
              background: "var(--surface)",
              borderRight: i < 2 ? "1px solid var(--border)" : "none",
            }}
          >
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {item.label}
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "12px 20px",
            borderRadius: 6,
            background: "rgba(255,80,80,0.08)",
            border: "1px solid rgba(255,80,80,0.2)",
            color: "var(--danger)",
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          {error}
        </div>
      )}

      {/* Table */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
          Paires actives · Base Mainnet
        </p>
        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
          {pairs.length} paire{pairs.length !== 1 ? "s" : ""}
        </span>
      </div>
      <DexLiquidityTable pairs={pairs} isLoading={isLoading} />
    </div>
  )
}
