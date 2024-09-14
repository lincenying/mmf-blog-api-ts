import type { Req, Res } from '~/types'

import * as helper from './frontend-like.helper'

/**
 * 文章点赞
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function like(req: Req<{ id: string }>, res: Res) {
    const user_id = (req.cookies.userid || req.headers.userid) as string

    res.json(await helper.like(req.query, user_id))
}

/**
 * 取消文章点赞
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function unlike(req: Req<{ id: string }>, res: Res) {
    const reqQuery = req.query
    const user_id = (req.cookies.userid || req.headers.userid) as string

    res.json(await helper.unlike(reqQuery, user_id))
}

/**
 * 重置文章点赞数量
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function resetLike(req: Req, res: Res) {
    res.json(await helper.resetLike())
}
