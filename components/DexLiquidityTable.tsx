"use client"

import { useState } from "react"
import { type DexPair } from "@/hooks/useTokenPairs"

function fmtUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(2)}`
}

function fmt(n: number) {
  return n.toLocaleString("en-US")
}

function liquidityColor(usd: number) {
  if (usd >= 500_000) return "var(--positive)"
  if (usd >= 50_000)  return "var(--accent)"
  if (usd >= 5_000)   return "var(--warning)"
  return "var(--danger)"
}

interface Props {
  pairs: DexPair[]
  isLoading: boolean
  tokenSymbol?: string
  pricePrecision?: number
}

export function DexLiquidityTable({ pairs, isLoading, tokenSymbol = "cbX", pricePrecision = 6 }: Props) {
  const [showOutliers, setShowOutliers] = useState(false)

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              height: 48,
              borderRadius: 6,
              background: "var(--surface-2)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    )
  }

  if (pairs.length === 0) {
    return (
      <div
        style={{
          padding: "48px 0",
          textAlign: "center",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        Aucune paire trouvée sur les DEX majeurs de Base
      </div>
    )
  }

  // Weighted average price by liquidity
  const totalLiq = pairs.reduce((s, p) => s + p.liquidityUsd, 0)
  const avgPrice = totalLiq > 0
    ? pairs.reduce((s, p) => s + p.priceUsd * p.liquidityUsd, 0) / totalLiq
    : 0

  const isOutlier = (p: DexPair) =>
    avgPrice > 0 && p.priceUsd > 0 && Math.abs(p.priceUsd - avgPrice) / avgPrice > 0.05

  const displayed = showOutliers ? pairs : pairs.filter(p => !isOutlier(p))
  const hiddenCount = pairs.length - displayed.length

  const cols = ["DEX", "Paire", "Prix", "Δ vs moy.", "Liquidité", "Volume 24h", "Δ 24h", "Txns 24h", ""]

  return (
    <div>
      {/* Filter toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 8, gap: 10 }}>
        {hiddenCount > 0 && !showOutliers && (
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
            {hiddenCount} pool{hiddenCount > 1 ? "s" : ""} masqué{hiddenCount > 1 ? "s" : ""} (prix hors ±5%)
          </span>
        )}
        <button
          onClick={() => setShowOutliers(v => !v)}
          style={{
            padding: "4px 10px",
            borderRadius: 5,
            border: "1px solid var(--border)",
            background: showOutliers ? "var(--surface-2)" : "transparent",
            color: showOutliers ? "var(--text)" : "var(--text-muted)",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {showOutliers ? "Masquer outliers" : "Afficher tous"}
        </button>
      </div>

      <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", background: "var(--surface)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {cols.map((col, i) => (
                  <th
                    key={col}
                    style={{
                      padding: "12px 16px",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-dim)",
                      textAlign: i === 0 ? "left" : "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((pair, idx) => {
                const deviation = avgPrice > 0 && pair.priceUsd > 0
                  ? (pair.priceUsd - avgPrice) / avgPrice * 100
                  : null
                const outlier = isOutlier(pair)

                return (
                  <tr
                    key={pair.pairAddress}
                    style={{
                      borderBottom: idx < displayed.length - 1 ? "1px solid var(--border)" : "none",
                      transition: "background 0.1s",
                      opacity: outlier ? 0.55 : 1,
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                        {pair.dexLabel}
                      </span>
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {tokenSymbol}/{pair.quoteToken.symbol}
                      </span>
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                        {pair.priceUsd > 0 ? `$${pair.priceUsd.toFixed(pricePrecision)}` : "—"}
                      </span>
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      {deviation !== null ? (
                        <span style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: Math.abs(deviation) > 5
                            ? "var(--danger)"
                            : Math.abs(deviation) > 2
                            ? "var(--warning)"
                            : "var(--text-dim)",
                        }}>
                          {deviation > 0 ? "+" : ""}{deviation.toFixed(2)}%
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: liquidityColor(pair.liquidityUsd) }}>
                        {fmtUsd(pair.liquidityUsd)}
                      </span>
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {fmtUsd(pair.volume24h)}
                      </span>
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: pair.priceChange24h > 0
                          ? "var(--positive)"
                          : pair.priceChange24h < 0
                          ? "var(--danger)"
                          : "var(--text-dim)",
                      }}>
                        {pair.priceChange24h > 0 ? "+" : ""}{pair.priceChange24h.toFixed(2)}%
                      </span>
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                        <span style={{ color: "var(--positive)" }}>{fmt(pair.buys24h)}↑</span>
                        {" / "}
                        <span style={{ color: "var(--danger)" }}>{fmt(pair.sells24h)}↓</span>
                      </span>
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <a
                        href={pair.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, color: "var(--text-dim)", textDecoration: "none" }}
                      >
                        ↗
                      </a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
