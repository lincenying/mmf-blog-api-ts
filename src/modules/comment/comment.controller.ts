import type { Req, ReqListQuery, Res } from '~/types'

import * as commentService from './comment.service'

function getUserId(req: Req) {
    return (req.cookies.userid || req.headers.userid) as string
}

/**
 * 发布评论
 */
export async function insert(req: Req<object, { id: string, content: string }>, res: Res) {
    res.json(await commentService.insert(req.body, getUserId(req)))
}

/**
 * 获取评论列表
 */
export async function getList(req: Req<ReqListQuery>, res: Res) {
    res.json(await commentService.getList(req.query))
}

/**
 * 软删除评论
 */
export async function deletes(req: Req<{ id: string }>, res: Res) {
    res.json(await commentService.deletes(req.query))
}

/**
 * 恢复评论
 */
export async function recover(req: Req<{ id: string }>, res: Res) {
    res.json(await commentService.recover(req.query))
}
