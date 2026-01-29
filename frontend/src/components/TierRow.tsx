import { useDroppable } from '@dnd-kit/core'
import { useState, useRef, useEffect } from 'react'
import { GameChip } from './GameChip'
import type { Game, Tier } from '../types'

interface TierRowProps {
  tier: Tier
  gamesById: Record<string, Game>
  isOver?: boolean
  onLabelChange: (tierId: string, label: string) => void
  /** Optional: delete tier; games in tier move to pool */
  onDelete?: (tierId: string) => void
  /** When true, delete button is enabled (e.g. only when more than one tier exists) */
  canDelete?: boolean
}

export function TierRow({ tier, gamesById, isOver, onLabelChange, onDelete, canDelete }: TierRowProps) {
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

  const showDelete = onDelete != null && canDelete

  return (
    <div className="flex items-stretch gap-0 rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg">
      {/* Bright tier label - classic TierMaker left block */}
      <div
        className="w-28 shrink-0 flex items-center gap-1 px-3 py-3 font-bold text-base text-white drop-shadow-md"
        style={{ backgroundColor: tier.color }}
      >
        <div className="flex-1 min-w-0">
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
        {showDelete && (
          <button
            type="button"
            onClick={() => onDelete(tier.id)}
            className="rounded p-1 shrink-0 text-white/90 hover:bg-red-500/80 hover:text-white transition-colors"
            title="Delete tier (games move to Unranked)"
            aria-label="Delete tier"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
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
