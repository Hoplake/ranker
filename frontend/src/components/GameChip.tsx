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
        w-30 h-30 shrink-0 rounded-lg overflow-hidden border-2
        cursor-grab active:cursor-grabbing
        transition-all duration-200 ease-out
        ${isDragging
          ? 'opacity-70 shadow-2xl z-50 scale-105 border-amber-400/80'
          : 'border-white/25 hover:scale-110 hover:shadow-xl hover:border-white/60 hover:z-10'}
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
