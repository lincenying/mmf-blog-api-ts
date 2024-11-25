import type { Req, Res } from '~/types'

import * as helper from './frontend-user.helper'

/**
 * 用户列表
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function getList(req: Req<{ page?: number, limit?: number }>, res: Res) {
    res.json(await helper.getList(req.query))
}

/**
 * 用户登录
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function login(req: Req<object, { username: string, password: string }>, res: Res) {
    const json = await helper.login(req.body)

    const remember_me = 30 * 24 * 60 * 60 * 1000 // 30天
    res.cookie('user', json.data?.user, { maxAge: remember_me })
    res.cookie('userid', json.data?.userid, { maxAge: remember_me })
    res.cookie('username', json.data?.username, { maxAge: remember_me })
    res.cookie('useremail', json.data?.useremail, { maxAge: remember_me })

    res.json(json)
}

/**
 * 微信登录
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function jscodeToSession(req: Req<object, { js_code: string }>, res: Res) {
    const reqBody = req.body
    res.json(await helper.jscodeToSession(reqBody))
}
/**
 * 微信登录
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function wxLogin(req: Req<object, { nickName: string, wxSignature: string, avatar: string }>, res: Res) {
    const reqBody = req.body
    res.json(await helper.wxLogin(reqBody))
}

/**
 * 用户退出
 * @param _req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export function logout(_req: Req, res: Res) {
    const json = helper.logout()

    res.cookie('user', '', { maxAge: -1 })
    res.cookie('userid', '', { maxAge: -1 })
    res.cookie('username', '', { maxAge: -1 })
    res.cookie('useremail', '', { maxAge: -1 })

    res.json(json)
}

/**
 * 用户注册
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function insert(req: Req<object, { email: string, password: string, username: string }>, res: Res) {
    const reqBody = req.body
    res.json(await helper.insert(reqBody))
}

/**
 * 获取用户信息
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function getItem(req: Req, res: Res) {
    const reqQuery = req.query
    const userid = (reqQuery.id || req.cookies.userid || req.headers.userid) as string

    res.json(await helper.getItem(userid))
}

/**
 * 用户编辑
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function modify(req: Req<object, { id: string, email: string, password: string, username: string }>, res: Res) {
    const reqBody = req.body
    res.json(await helper.modify(reqBody))
}

/**
 * 账号编辑
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function account(req: Req<object, { email: string }>, res: Res) {
    const reqBody = req.body
    const user_id = (req.cookies.userid || req.headers.userid) as string

    res.json(await helper.account(reqBody, user_id))
}

/**
 * 密码编辑
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function password(req: Req<object, { old_password: string, password: string }>, res: Res) {
    const reqBody = req.body
    const user_id = (req.cookies.userid || req.headers.userid) as string

    res.json(await helper.password(reqBody, user_id))
}

/**
 * 用户删除
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function deletes(req: Req<{ id: string }>, res: Res) {
    const reqQuery = req.query

    res.json(await helper.deletes(reqQuery))
}

/**
 * 用户恢复
 * @param req - 请求对象，包含查询参数和请求头
 * @param res - 响应对象，用于返回操作结果
 */
export async function recover(req: Req<{ id: string }>, res: Res) {
    const reqQuery = req.query

    res.json(await helper.recover(reqQuery))
}
