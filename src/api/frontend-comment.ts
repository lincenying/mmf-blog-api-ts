import type { Req, ReqListQuery, Res } from '~/types'
import * as helper from './frontend-comment.helper'

/**
 * 发布评论
 * @method
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function insert(req: Req<object, { id: string, content: string }>, res: Res) {
    const reqBody = req.body
    const userid = (req.cookies.userid || req.headers.userid) as string

    const json = await helper.insert(reqBody, userid)
    res.json(json)
}

/**
 * 前台浏览时, 读取评论列表
 * @method
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function getList(req: Req<ReqListQuery>, res: Res) {
    const reqQuery = req.query
    const json = await helper.getList(reqQuery)

    res.json(json)
}

/**
 * 评论删除
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function deletes(req: Req<{ id: string }>, res: Res) {
    const reqQuery = req.query
    const json = await helper.deletes(reqQuery)

    res.json(json)
}

/**
 * 评论恢复
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function recover(req: Req<{ id: string }>, res: Res) {
    const reqQuery = req.query
    const json = await helper.recover(reqQuery)

    res.json(json)
}
