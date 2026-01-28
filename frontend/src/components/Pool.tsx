import { useDroppable } from '@dnd-kit/core'
import { GameChip } from './GameChip'
import { POOL_ID } from '../types'
import type { Game } from '../types'

interface PoolProps {
  games: Game[]
  isOver?: boolean
}

export function Pool({ games, isOver }: PoolProps) {
  const { setNodeRef, isOver: isOverDroppable } = useDroppable({
    id: POOL_ID,
    data: { containerId: POOL_ID },
  })

  const activeOver = isOver ?? isOverDroppable

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-xl border-2 border-dashed p-4 min-h-[6rem]
        transition-colors duration-200
        ${activeOver ? 'border-amber-400/60 bg-amber-500/10' : 'border-white/20 bg-gray-900'}
      `}
    >
      <div className="text-xs font-medium text-white/50 mb-3 px-0.5">
        Pool — drag games here or to tiers
      </div>
      <div className="columns-3 sm:columns-4 md:columns-5 lg:columns-6 gap-3 space-y-3">
        {games.map((game) => (
          <div key={game.id} className="break-inside-avoid mb-2">
            <GameChip game={game} containerId={POOL_ID} />
          </div>
        ))}
      </div>
    </div>
  )
}
