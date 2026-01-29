import { useCallback, useMemo, useState } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import gamesData from '../games.json'
import { Pool } from '../components/Pool'
import { TierRow } from '../components/TierRow'
import { GameChip } from '../components/GameChip'
import { POOL_ID } from '../types'
import type { Game, Tier } from '../types'

/** Colors assigned by tier order (first tier = first color, etc.) */
const TIER_COLORS = [
  '#eab308', // S - gold
  '#22c55e', // A - green
  '#3b82f6', // B - blue
  '#f97316', // C - orange
  '#ef4444', // D - red
  '#a855f7', // E - purple
  '#64748b', // F - slate
]

const DEFAULT_TIERS: Omit<Tier, 'gameIds'>[] = [
  { id: 'tier-s', label: 'S', color: TIER_COLORS[0]! },
  { id: 'tier-a', label: 'A', color: TIER_COLORS[1]! },
  { id: 'tier-b', label: 'B', color: TIER_COLORS[2]! },
  { id: 'tier-c', label: 'C', color: TIER_COLORS[3]! },
  { id: 'tier-d', label: 'D', color: TIER_COLORS[4]! },
  { id: 'tier-e', label: 'E', color: TIER_COLORS[5]! },
  { id: 'tier-f', label: 'F', color: TIER_COLORS[6]! },
]

export function TierListPage() {
  const games = useMemo(() => gamesData as Game[], [])
  const gamesById = useMemo(() => Object.fromEntries(games.map((g) => [g.id, g])), [games])

  const [poolIds, setPoolIds] = useState<string[]>(() => games.map((g) => g.id))
  const [tiers, setTiers] = useState<Tier[]>(() =>
    DEFAULT_TIERS.map((t) => ({ ...t, gameIds: [] }))
  )
  const [activeId, setActiveId] = useState<string | null>(null)

  const poolGames = useMemo(
    () => poolIds.map((id) => gamesById[id]).filter(Boolean) as Game[],
    [poolIds, gamesById]
  )

  const handleLabelChange = useCallback((tierId: string, label: string) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === tierId ? { ...t, label } : t))
    )
  }, [])

  const handleDeleteTier = useCallback((tierId: string) => {
    const tier = tiers.find((t) => t.id === tierId)
    if (!tier || tiers.length <= 1) return
    setPoolIds((prev) => [...prev, ...tier.gameIds])
    setTiers((prev) =>
      prev
        .filter((t) => t.id !== tierId)
        .map((t, i) => ({ ...t, color: TIER_COLORS[i] ?? TIER_COLORS[0]! }))
    )
  }, [tiers])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const gameId = String(active.id)
    const sourceContainer = (active.data.current as { containerId?: string })
      ?.containerId
    const targetContainer = String(over.id)

    if (!sourceContainer || sourceContainer === targetContainer) return

    if (sourceContainer === POOL_ID) {
      setPoolIds((prev) => prev.filter((id) => id !== gameId))
      if (targetContainer === POOL_ID) return
      setTiers((prev) =>
        prev.map((t) =>
          t.id === targetContainer
            ? { ...t, gameIds: [...t.gameIds, gameId] }
            : t
        )
      )
    } else {
      setTiers((prev) =>
        prev.map((t) => {
          if (t.id === sourceContainer)
            return { ...t, gameIds: t.gameIds.filter((id) => id !== gameId) }
          if (t.id === targetContainer)
            return { ...t, gameIds: [...t.gameIds, gameId] }
          return t
        })
      )
      if (targetContainer === POOL_ID) {
        setPoolIds((prev) => [...prev, gameId])
      }
    }
  }, [])

  const activeGame = activeId ? gamesById[activeId] : null

  const handleExport = useCallback(() => {
    const state = {
      tiers: tiers.map((t) => ({
        id: t.id,
        label: t.label,
        color: t.color,
        gameIds: t.gameIds,
        count: t.gameIds.length,
      })),
      unranked: { count: poolIds.length, gameIds: poolIds },
    }
    console.log('Tier list state:', state)
  }, [tiers, poolIds])

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Tier list — S / A / B / C / D / E / F</h1>
        <button
          type="button"
          onClick={handleExport}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-900 shadow-md transition-all duration-200 hover:bg-amber-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Export
        </button>
      </header>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-white/60">Tiers</h2>
          <div className="space-y-2">
            {tiers.map((tier) => (
              <TierRow
                key={tier.id}
                tier={tier}
                gamesById={gamesById}
                onLabelChange={handleLabelChange}
                onDelete={handleDeleteTier}
                canDelete={tiers.length > 1}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-white/60 mb-2">Unranked</h2>
          <Pool games={poolGames} poolLabel="Unranked — drag games here or to tiers" />
        </section>

        <DragOverlay>
          {activeGame ? (
            <div className="cursor-grabbing opacity-90 scale-110">
              <GameChip game={activeGame} containerId="" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
