export interface Game {
  id: string
  name: string
  image: string
}

export interface Tier {
  id: string
  label: string
  color: string
  gameIds: string[]
}

export const POOL_ID = 'pool'
