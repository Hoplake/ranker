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
    <div className="flex items-stretch gap-0 rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg">
      {/* Bright tier label - classic TierMaker left block */}
      <div
        className="w-28 shrink-0 flex items-center justify-center px-3 py-3 font-bold text-base text-white drop-shadow-md"
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
            className="w-full bg-white/25 text-white placeholder-white/70 rounded px-1.5 py-0.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="Tier name"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="w-full text-left truncate hover:brightness-110 rounded px-1 py-0.5 transition-all duration-150"
            title="Click to edit"
          >
            {tier.label}
          </button>
        )}
      </div>
      {/* Dark gray drop zone - classic TierMaker right area */}
      <div
        ref={setDroppableRef}
        className={`
          min-h-[4.5rem] flex-1 flex flex-wrap items-center gap-2 p-3
          transition-colors duration-200
          ${activeOver ? 'bg-gray-600' : 'bg-gray-800'}
        `}
      >
        {games.map((game) => (
          <GameChip key={game.id} game={game} containerId={tier.id} />
        ))}
      </div>
    </div>
  )
}
