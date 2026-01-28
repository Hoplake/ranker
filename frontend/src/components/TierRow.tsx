import { useDroppable } from '@dnd-kit/core'
import { useState, useRef, useEffect } from 'react'
import { GameChip } from './GameChip'
import type { Game, Tier } from '../types'

interface TierRowProps {
  tier: Tier
  gamesById: Record<string, Game>
  isOver?: boolean
  onLabelChange: (tierId: string, label: string) => void
}

export function TierRow({ tier, gamesById, isOver, onLabelChange }: TierRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(tier.label)
  const inputRef = useRef<HTMLInputElement>(null)

  const { setNodeRef: setDroppableRef, isOver: isOverDroppable } = useDroppable({
    id: tier.id,
    data: { tierId: tier.id },
  })

  const activeOver = isOver ?? isOverDroppable

  useEffect(() => {
    setEditValue(tier.label)
  }, [tier.label])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleCommit = () => {
    const trimmed = editValue.trim()
    if (trimmed) onLabelChange(tier.id, trimmed)
    setIsEditing(false)
  }

  const games = tier.gameIds
    .map((id) => gamesById[id])
    .filter(Boolean) as Game[]

  return (
    <div className="flex items-stretch gap-0 rounded-lg overflow-hidden border-2 border-white/10">
      {/* Tier label - editable */}
      <div
        className="w-24 shrink-0 flex items-center justify-center px-2 py-2 font-bold text-sm text-white/95 border-r-2 border-white/10"
        style={{ backgroundColor: tier.color }}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCommit()
              if (e.key === 'Escape') {
                setEditValue(tier.label)
                setIsEditing(false)
              }
            }}
            className="w-full bg-white/20 text-white placeholder-white/60 rounded px-1 py-0.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="Tier name"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="w-full text-left truncate hover:bg-white/10 rounded px-1 py-0.5 transition-colors"
            title="Click to edit"
          >
            {tier.label}
          </button>
        )}
      </div>
      {/* Drop zone */}
      <div
        ref={setDroppableRef}
        className={`
          min-h-[4rem] flex-1 flex flex-wrap items-center gap-2 p-2
          transition-colors
          ${activeOver ? 'bg-white/15' : 'bg-white/5'}
        `}
      >
        {games.map((game) => (
          <GameChip key={game.id} game={game} containerId={tier.id} />
        ))}
      </div>
    </div>
  )
}
