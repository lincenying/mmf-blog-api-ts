import type { Req, Res } from '~/types'
import * as helper from './backend-user.helper'

/**
 * 获取管理员列表
 * @method getList
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function getList(req: Req<{ page?: number; limit?: number }>, res: Res) {
    const reqQuery = req.query

    const json = await helper.getList(reqQuery)
    res.json(json)
}

/**
 * 获取单个管理员
 * @method getItem
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function getItem(req: Req<{ id: string }>, res: Res) {
    const reqQuery = req.query

    const json = await helper.getItem(reqQuery)
    res.json(json)
}

/**
 * 管理员登录
 * @method loginAdmin
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function login(req: Req<object, { password: string; username: string }>, res: Res) {
    const reqBody = req.body

    const json = await helper.login(reqBody)
    if (json.data) {
        const remember_me = 30 * 24 * 60 * 60 * 1000 // 30天
        res.cookie('b_user', json.data.user, { maxAge: remember_me })
        res.cookie('b_userid', json.data.userid, { maxAge: remember_me })
        res.cookie('b_username', json.data.username, { maxAge: remember_me })
    }

    res.json(json)
}

/**
 * 管理员编辑
 * @method modifyAdmin
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function modify(req: Req<object, { id: string; email: string; password: string; username: string }>, res: Res) {
    const reqBody = req.body

    const json = await helper.modify(reqBody)
    res.json(json)
}

/**
 * 管理员删除
 * @method deletes
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function deletes(req: Req<{ id: string }>, res: Res) {
    const reqQuery = req.query

    const json = await helper.deletes(reqQuery)
    res.json(json)
}

/**
 * 管理员恢复
 * @method recover
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function recover(req: Req<{ id: string }>, res: Res) {
    const reqQuery = req.query

    const json = await helper.recover(reqQuery)
    res.json(json)
}
