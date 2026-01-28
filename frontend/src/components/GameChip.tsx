import { useDraggable } from '@dnd-kit/core'
import type { Game } from '../types'

interface GameChipProps {
  game: Game
  containerId: string
}

export function GameChip({ game, containerId }: GameChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: game.id,
    data: { gameId: game.id, containerId },
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 border-white/20
        cursor-grab active:cursor-grabbing
        transition-shadow
        ${isDragging ? 'opacity-50 shadow-xl z-50' : 'hover:border-white/40'}
      `}
      title={game.name}
    >
      <img
        src={game.image}
        alt={game.name}
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
    </div>
  )
}
