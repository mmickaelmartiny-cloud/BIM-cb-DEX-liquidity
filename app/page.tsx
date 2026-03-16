"use client"

import { useState } from "react"
import Image from "next/image"
import { useTokenPairs } from "@/hooks/useTokenPairs"
import { DexLiquidityTable } from "@/components/DexLiquidityTable"

const TOKENS = [
  { symbol: "cbBTC",  address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", icon: "₿" },
  { symbol: "cbETH",  address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22", icon: "Ξ" },
  { symbol: "cbDOGE", address: "0xcbd06e5a2b0c65597161de254aa074e489deb510", icon: "Ð" },
  { symbol: "cbADA",  address: "0xcbADA732173e39521CDBE8bf59a6Dc85A9fc7b8c", icon: "₳" },
  { symbol: "cbXRP",  address: "0xcb585250f852c6c6bf90434ab21a00f02833a4af", icon: "✕" },
  { symbol: "cbLTC",  address: "0xcb17C9Db87B595717C857a08468793f5bAb6445F", icon: "Ł" },
]

function fmtUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(2)}`
}

function TokenPanel({ token }: { token: typeof TOKENS[0] }) {
  const { pairs, totalVolume24h, isLoading, error, lastUpdated, refresh } =
    useTokenPairs(token.address)

  const pricePrecision = ["cbBTC", "cbETH", "cbLTC"].includes(token.symbol) ? 2 : 6

  // Only use pairs with known price
  const knownPairs = pairs.filter(p => p.priceUsd > 0)

  // Liquidity = base token side only (liquidityBase * priceUsd)
  const totalBaseUsd = knownPairs.reduce((s, p) => s + p.liquidityBase * p.priceUsd, 0)

  // Weighted avg price by base-side liquidity
  const avgPrice = totalBaseUsd > 0
    ? knownPairs.reduce((s, p) => s + p.priceUsd * (p.liquidityBase * p.priceUsd), 0) / totalBaseUsd
    : 0

  const stats = [
    { label: "Liquidité totale", value: isLoading ? "…" : fmtUsd(totalBaseUsd) },
    { label: "Volume 24h", value: isLoading ? "…" : fmtUsd(totalVolume24h) },
    { label: "Prix moyen pondéré", value: isLoading ? "…" : avgPrice > 0 ? `$${avgPrice.toFixed(pricePrecision)}` : "—" },
  ]

  return (
    <div>
      {/* Address + refresh row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <p style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "monospace" }}>
          {token.address}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {lastUpdated && (
            <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
              fontSize: 11,
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
          marginBottom: 24,
        }}
      >
        {stats.map((item, i) => (
          <div
            key={item.label}
            style={{
              padding: "18px 22px",
              background: "var(--surface)",
              borderRight: i < 2 ? "1px solid var(--border)" : "none",
            }}
          >
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {item.label}
            </p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "10px 18px",
            borderRadius: 6,
            background: "rgba(255,80,80,0.08)",
            border: "1px solid rgba(255,80,80,0.2)",
            color: "var(--danger)",
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* Table header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
          Paires actives · Base Mainnet
        </p>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
          {pairs.length} paire{pairs.length !== 1 ? "s" : ""} · refresh auto 30s
        </span>
      </div>
      <DexLiquidityTable pairs={pairs} isLoading={isLoading} tokenSymbol={token.symbol} pricePrecision={pricePrecision} />
    </div>
  )
}

export default function HomePage() {
  const [activeIdx, setActiveIdx] = useState(0)
  const active = TOKENS[activeIdx]

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
        <Image
          src="/bim-logo.png"
          alt="BIM Exchange"
          width={140}
          height={36}
          priority
          style={{ objectFit: "contain" }}
        />
        <div style={{ width: "1px", height: 32, background: "var(--border)" }} />
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
            Coinbase Wrapped Assets — Liquidité DEX
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Base Mainnet · Données DexScreener
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 2,
          marginBottom: 28,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 4,
        }}
      >
        {TOKENS.map((token, i) => (
          <button
            key={token.symbol}
            onClick={() => setActiveIdx(i)}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 6,
              border: "none",
              background: activeIdx === i ? "var(--surface-2)" : "transparent",
              color: activeIdx === i ? "var(--text)" : "var(--text-muted)",
              fontSize: 13,
              fontWeight: activeIdx === i ? 700 : 500,
              cursor: "pointer",
              transition: "all 0.15s",
              outline: activeIdx === i ? "1px solid var(--border)" : "none",
            }}
            onMouseEnter={e => {
              if (activeIdx !== i) (e.currentTarget as HTMLElement).style.color = "var(--text)"
            }}
            onMouseLeave={e => {
              if (activeIdx !== i) (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"
            }}
          >
            <span style={{ marginRight: 6, opacity: 0.7 }}>{token.icon}</span>
            {token.symbol}
          </button>
        ))}
      </div>

      {/* Panel */}
      <TokenPanel key={active.address} token={active} />
    </div>
  )
}
