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
        rounded-xl border-2 border-dashed p-4
        min-h-[6rem] flex flex-wrap items-center gap-2
        transition-colors
        ${activeOver ? 'border-amber-400/60 bg-amber-500/10' : 'border-white/20 bg-white/5'}
      `}
    >
      <div className="w-full text-xs font-medium text-white/60 mb-1">Pool — drag games here or to tiers</div>
      {games.map((game) => (
        <GameChip key={game.id} game={game} containerId={POOL_ID} />
      ))}
    </div>
  )
}
