import type { Req, Res } from '~/types'

import * as userService from './user.service'

function getUserId(req: Req) {
    return (req.cookies.userid || req.headers.userid) as string
}

/**
 * 获取用户列表（后台管理）
 */
export async function getList(req: Req<{ page?: number, limit?: number }>, res: Res) {
    res.json(await userService.getList(req.query))
}

/**
 * 用户登录
 */
export async function login(req: Req<object, { username: string, password: string }>, res: Res) {
    const json = await userService.login(req.body)
    const remember_me = 30 * 24 * 60 * 60 * 1000

    if (json.data) {
        res.cookie('user', json.data.user, { maxAge: remember_me })
        res.cookie('userid', json.data.userid, { maxAge: remember_me })
        res.cookie('username', json.data.username, { maxAge: remember_me })
        res.cookie('useremail', json.data.useremail, { maxAge: remember_me })
    }

    res.json(json)
}

/**
 * 微信 jscode 换取 session
 */
export async function jscodeToSession(req: Req<object, { js_code: string }>, res: Res) {
    res.json(await userService.jscodeToSession(req.body))
}

/**
 * 微信登录
 */
export async function wxLogin(req: Req<object, { nickName: string, wxSignature: string, avatar: string }>, res: Res) {
    res.json(await userService.wxLogin(req.body))
}

/**
 * 用户退出
 */
export function logout(_req: Req, res: Res) {
    res.cookie('user', '', { maxAge: -1 })
    res.cookie('userid', '', { maxAge: -1 })
    res.cookie('username', '', { maxAge: -1 })
    res.cookie('useremail', '', { maxAge: -1 })
    res.json(userService.logout())
}

/**
 * 用户注册
 */
export async function insert(req: Req<object, { email: string, password: string, username: string }>, res: Res) {
    res.json(await userService.insert(req.body))
}

/**
 * 获取当前用户信息
 */
export async function getItem(req: Req, res: Res) {
    const userid = (req.query.id || req.cookies.userid || req.headers.userid) as string
    res.json(await userService.getItem(userid))
}

/**
 * 后台编辑用户
 */
export async function modify(req: Req<object, { id: string, email: string, password: string, username: string }>, res: Res) {
    res.json(await userService.modify(req.body))
}

/**
 * 修改账号邮箱
 */
export async function account(req: Req<object, { email: string }>, res: Res) {
    res.json(await userService.account(req.body, getUserId(req)))
}

/**
 * 修改密码
 */
export async function password(req: Req<object, { old_password: string, password: string }>, res: Res) {
    res.json(await userService.password(req.body, getUserId(req)))
}

/**
 * 软删除用户
 */
export async function deletes(req: Req<{ id: string }>, res: Res) {
    res.json(await userService.deletes(req.query))
}

/**
 * 恢复用户
 */
export async function recover(req: Req<{ id: string }>, res: Res) {
    res.json(await userService.recover(req.query))
}
