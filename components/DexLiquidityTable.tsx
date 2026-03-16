"use client"

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
}

export function DexLiquidityTable({ pairs, isLoading }: Props) {
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

  const cols = ["DEX", "Paire", "Prix", "Liquidité", "Volume 24h", "Δ 24h", "Txns 24h", ""]

  return (
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
            {pairs.map((pair, idx) => (
              <tr
                key={pair.pairAddress}
                style={{
                  borderBottom: idx < pairs.length - 1 ? "1px solid var(--border)" : "none",
                  transition: "background 0.1s",
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
                    cbDOGE/{pair.quoteToken.symbol}
                  </span>
                </td>

                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                    {pair.priceUsd > 0 ? `$${pair.priceUsd.toFixed(6)}` : "—"}
                  </span>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
