import type { CategoryInsert, CategoryModify, Req, Res } from '~/types'
import * as helper from './backend-category.helper'

/**
 * 管理时, 获取分类列表
 * @method
 * @param _req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function getList(_req: Req, res: Res) {
    const json = await helper.getList()
    res.json(json)
}

/**
 * 管理时, 获取分类详情
 * @method
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function getItem(req: Req<{ id: string }>, res: Res) {
    const reqQuery = req.query

    const json = await helper.getItem(reqQuery)
    res.json(json)
}

/**
 * 管理时, 新增分类
 * @method
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function insert(req: Req<object, CategoryInsert>, res: Res) {
    const reqBody = req.body

    const json = await helper.insert(reqBody)
    res.json(json)
}

/**
 * 管理时, 删除分类
 * @method
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function deletes(req: Req<{ id: string }>, res: Res) {
    const reqQuery = req.query

    const json = await helper.deletes(reqQuery)
    res.json(json)
}

/**
 * 管理时, 恢复分类
 * @method
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function recover(req: Req<{ id: string }>, res: Res) {
    const reqQuery = req.query

    const json = await helper.recover(reqQuery)
    res.json(json)
}

/**
 * 管理时, 编辑分类
 * @method
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function modify(req: Req<object, CategoryModify>, res: Res) {
    const reqBody = req.body

    const json = await helper.modify(reqBody)
    res.json(json)
}
