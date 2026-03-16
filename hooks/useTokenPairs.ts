"use client"

import { useState, useEffect, useCallback } from "react"

export interface DexPair {
  dexId: string
  dexLabel: string
  pairAddress: string
  quoteToken: { symbol: string; address: string }
  priceUsd: number
  liquidityUsd: number
  volume24h: number
  priceChange24h: number
  buys24h: number
  sells24h: number
  url: string
}

const MAJOR_DEXES = new Set([
  "uniswap",
  "uniswap-v2",
  "uniswap-v3",
  "aerodrome",
  "baseswap",
  "sushiswap",
  "pancakeswap",
  "pancakeswap-v2",
  "pancakeswap-v3",
  "alienbase",
  "swapbased",
])

const DEX_LABELS: Record<string, string> = {
  "uniswap":        "Uniswap V2",
  "uniswap-v2":     "Uniswap V2",
  "uniswap-v3":     "Uniswap V3",
  "aerodrome":      "Aerodrome",
  "baseswap":       "BaseSwap",
  "sushiswap":      "SushiSwap",
  "pancakeswap":    "PancakeSwap",
  "pancakeswap-v2": "PancakeSwap V2",
  "pancakeswap-v3": "PancakeSwap V3",
  "alienbase":      "AlienBase",
  "swapbased":      "SwapBased",
}

interface DexScreenerResponse {
  pairs: Array<{
    chainId: string
    dexId: string
    pairAddress: string
    baseToken: { address: string; symbol: string; name: string }
    quoteToken: { address: string; symbol: string; name: string }
    priceUsd?: string
    liquidity?: { usd?: number }
    volume?: { h24?: number }
    priceChange?: { h24?: number }
    txns?: { h24?: { buys?: number; sells?: number } }
    url: string
  }>
}

export function useTokenPairs(tokenAddress: string, chainId = "base") {
  const [pairs, setPairs] = useState<DexPair[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
      )
      if (!res.ok) throw new Error(`DexScreener error: ${res.status}`)
      const json: DexScreenerResponse = await res.json()

      const filtered = (json.pairs ?? [])
        .filter(p => p.chainId === chainId && MAJOR_DEXES.has(p.dexId))
        .map(p => ({
          dexId: p.dexId,
          dexLabel: DEX_LABELS[p.dexId] ?? p.dexId,
          pairAddress: p.pairAddress,
          quoteToken: { symbol: p.quoteToken.symbol, address: p.quoteToken.address },
          priceUsd: parseFloat(p.priceUsd ?? "0"),
          liquidityUsd: p.liquidity?.usd ?? 0,
          volume24h: p.volume?.h24 ?? 0,
          priceChange24h: p.priceChange?.h24 ?? 0,
          buys24h: p.txns?.h24?.buys ?? 0,
          sells24h: p.txns?.h24?.sells ?? 0,
          url: p.url,
        }))
        .sort((a, b) => b.liquidityUsd - a.liquidityUsd)

      setPairs(filtered)
      setLastUpdated(new Date())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fetch failed")
    } finally {
      setIsLoading(false)
    }
  }, [tokenAddress, chainId])

  useEffect(() => {
    fetch_()
    const interval = setInterval(fetch_, 30_000)
    return () => clearInterval(interval)
  }, [fetch_])

  const totalLiquidity = pairs.reduce((sum, p) => sum + p.liquidityUsd, 0)
  const totalVolume24h = pairs.reduce((sum, p) => sum + p.volume24h, 0)

  return { pairs, totalLiquidity, totalVolume24h, isLoading, error, lastUpdated, refresh: fetch_ }
}
