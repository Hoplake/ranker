import { useCallback, useMemo, useState } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import gamesData from './games.json'
import { Pool } from './components/Pool'
import { TierRow } from './components/TierRow'
import { GameChip } from './components/GameChip'
import { POOL_ID } from './types'
import type { Game, Tier } from './types'

const DEFAULT_TIERS: Omit<Tier, 'gameIds'>[] = [
  { id: 'tier-s', label: 'S-Tier', color: '#eab308' },
  { id: 'tier-keep', label: 'Keep', color: '#22c55e' },
  { id: 'tier-sell', label: 'Sell', color: '#ef4444' },
]

const KEEP_TIER_DEFAULT_MAX = 25

function App() {
  const games = useMemo(() => gamesData as Game[], [])
  const gamesById = useMemo(() => Object.fromEntries(games.map((g) => [g.id, g])), [games])

  const [poolIds, setPoolIds] = useState<string[]>(() => games.map((g) => g.id))
  const [tiers, setTiers] = useState<Tier[]>(() =>
    DEFAULT_TIERS.map((t) => ({ ...t, gameIds: [] }))
  )
  const [keepTierMax, setKeepTierMax] = useState(KEEP_TIER_DEFAULT_MAX)
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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (!over) return

      const gameId = String(active.id)
      const sourceContainer = (active.data.current as { containerId?: string })
        ?.containerId
      const targetContainer = String(over.id)

      if (!sourceContainer || sourceContainer === targetContainer) return

      const targetTier = tiers.find((t) => t.id === targetContainer)
      const isTargetKeep = targetTier?.label === 'Keep'
      const targetCurrentCount = targetTier ? targetTier.gameIds.length : 0
      const wouldExceedKeep =
        isTargetKeep && targetCurrentCount >= keepTierMax

      if (wouldExceedKeep) {
        alert(
          `The "Keep" tier has a maximum of ${keepTierMax} games. You cannot add more.`
        )
        return
      }

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
    },
    [tiers, keepTierMax]
  )

  const activeGame = activeId ? gamesById[activeId] : null

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold">Board Game Tier Maker</h1>
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="keep-max" className="text-white/80">
              Keep tier max:
            </label>
            <input
              id="keep-max"
              type="number"
              min={1}
              max={200}
              value={keepTierMax}
              onChange={(e) =>
                setKeepTierMax(Math.max(1, Math.min(200, Number(e.target.value) || 1)))
              }
              className="w-16 rounded bg-white/10 border border-white/20 px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </header>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Tiers */}
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-white/60">Tiers</h2>
            <div className="space-y-2">
              {tiers.map((tier) => (
                <TierRow
                  key={tier.id}
                  tier={tier}
                  gamesById={gamesById}
                  onLabelChange={handleLabelChange}
                />
              ))}
            </div>
          </section>

          {/* Pool */}
          <section>
            <h2 className="text-sm font-medium text-white/60 mb-2">Pool</h2>
            <Pool games={poolGames} />
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
    </div>
  )
}

export default App
