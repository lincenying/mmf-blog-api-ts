import * as helper from './frontend-article.helper'
import type { Req, ReqListQuery, Res } from '@/types'

/**
 * 前台浏览时, 获取文章列表
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function getList(req: Req<ReqListQuery>, res: Res) {
    const reqQuery = req.query
    const user_id = (req.cookies.userid || req.headers.userid) as string

    const json = await helper.getList(reqQuery, user_id)
    res.json(json)
}

/**
 * 前台浏览时, 获取单篇文章
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function getItem(req: Req<{ id: string }>, res: Res) {
    const reqQuery = req.query
    const user_id = (req.cookies.userid || req.headers.userid) as Nullable<string>

    const json = await helper.getItem(reqQuery, user_id)
    res.json(json)
}

/**
 * 前台浏览时, 获取文章推荐列表
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function getTrending(req: Req<{ id: string }>, res: Res) {
    const reqQuery = req.query

    const json = await helper.getTrending(reqQuery)
    res.json(json)
}
