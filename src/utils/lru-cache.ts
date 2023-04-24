import { LRUCache } from 'lru-cache'

export const meizituCache = new LRUCache({
    max: 1000,
    ttl: 1000 * 60 * 60 * 24 * 7,
})

export const douyinCache = new LRUCache({
    max: 1000,
    ttl: 1000 * 60 * 60 * 1,
})
