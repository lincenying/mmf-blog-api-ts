import type { ArticleInsert, ArticleModify, Req, Res } from '~/types'

import * as helper from './backend-article.helper'

/**
 * 获取文章列表的异步函数。
 * @param req 请求对象，包含页码、每页数量和排序方式等查询参数。
 * @param res 响应对象，用于返回数据或错误信息。
 * @returns 返回一个Promise，解析为一个包含响应数据或错误信息的对象。
 */
export async function getList(req: Req<{ page: string; limit: string; sort: string }>, res: Res) {
    // 发送响应
    res.json(await helper.getList(req.query))
}

/**
 * 获取指定ID的文章项。
 * @param req 请求对象，包含文章的ID。
 * @param res 响应对象，用于返回查询结果。
 */
export async function getItem(req: Req<{ id: string }>, res: Res) {
    res.json(await helper.getItem(req.query))
}

/**
 * 异步插入文章。
 * @param req 包含文章插入信息的请求对象。
 * @param res 用于返回响应数据的对象。
 * @returns 返回一个Promise，解析为响应数据对象。
 */
export async function insert(req: Req<object, ArticleInsert>, res: Res) {
    res.json(await helper.insert(req.body))
}

/**
 * 删除文章记录及其对应分类的数量减一。
 * @param req 请求对象，包含要删除的文章ID。
 * @param res 响应对象，用于返回操作结果。
 * @returns 返回一个Promise，解析为操作结果的JSON对象。
 */
export async function deletes(req: Req<{ id: string }>, res: Res) {
    // 使用响应对象返回处理结果
    res.json(await helper.deletes(req.query))
}

/**
 * 恢复文章功能的异步函数。
 * 该函数接收一个请求和一个响应对象，通过文章ID将文章的状态标记为非删除状态，并更新对应分类的计数。
 *
 * @param req - 请求对象，包含查询参数和请求头，包含文章的ID。
 * @param res - 响应对象，用于返回操作结果。
 */
export async function recover(req: Req<{ id: string }>, res: Res) {
    // 将响应数据发送回客户端
    res.json(await helper.recover(req.query))
}

/**
 * 修改文章信息
 * @param req 包含文章修改数据的请求对象
 * @param res 用于返回处理结果的响应对象
 * @returns 返回一个Promise，解析为响应数据
 */
export async function modify(req: Req<object, ArticleModify>, res: Res) {
    res.json(await helper.modify(req.body))
}
