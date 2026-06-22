import type { Req, Res } from '~/types'

import * as likeService from './like.service'

function getUserId(req: Req) {
    return (req.cookies.userid || req.headers.userid) as string
}

/**
 * 文章点赞
 */
export async function like(req: Req<{ id: string }>, res: Res) {
    res.json(await likeService.like(req.query, getUserId(req)))
}

/**
 * 取消文章点赞
 */
export async function unlike(req: Req<{ id: string }>, res: Res) {
    res.json(await likeService.unlike(req.query, getUserId(req)))
}

/**
 * 重置文章点赞数量
 */
export async function resetLike(_req: Req, res: Res) {
    res.json(await likeService.resetLike())
}
