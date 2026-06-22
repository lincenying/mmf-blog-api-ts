import type { Req, Res } from '~/types'

import * as adminService from './admin.service'

/**
 * 获取管理员列表
 */
export async function getList(req: Req<{ page?: number, limit?: number }>, res: Res) {
    res.json(await adminService.getList(req.query))
}

/**
 * 获取单个管理员
 */
export async function getItem(req: Req<{ id: string }>, res: Res) {
    res.json(await adminService.getItem(req.query))
}

/**
 * 管理员登录
 */
export async function login(req: Req<object, { password: string, username: string }>, res: Res) {
    const json = await adminService.login(req.body)
    if (json.data) {
        const remember_me = 30 * 24 * 60 * 60 * 1000
        res.cookie('b_user', json.data.user, { maxAge: remember_me })
        res.cookie('b_userid', json.data.userid, { maxAge: remember_me })
        res.cookie('b_username', json.data.username, { maxAge: remember_me })
    }

    res.json(json)
}

/**
 * 编辑管理员
 */
export async function modify(req: Req<object, { id: string, email: string, password: string, username: string }>, res: Res) {
    res.json(await adminService.modify(req.body))
}

/**
 * 软删除管理员
 */
export async function deletes(req: Req<{ id: string }>, res: Res) {
    res.json(await adminService.deletes(req.query))
}

/**
 * 恢复管理员
 */
export async function recover(req: Req<{ id: string }>, res: Res) {
    res.json(await adminService.recover(req.query))
}
