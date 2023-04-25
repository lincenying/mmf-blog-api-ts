import fs from 'node:fs'
import md5 from 'md5'
import moment from 'moment'
import jwt from 'jsonwebtoken'

import { fsExistsSync } from '../utils'
import { md5Pre, secretServer as secret } from '../config'
import AdminM from '../models/admin'
import type { Req, Res, UserModify } from '@/types'

/**
 * 获取管理员列表
 * @method getList
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function getList(req: Req<{}, { page: string; limit: string }>, res: Res) {
    const sort = '-_id'
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit
    try {
        const result = await Promise.all([
            AdminM.find().sort(sort).skip(skip).limit(limit).exec(),
            AdminM.countDocuments(),
        ])
        const total = result[1]
        const totalPage = Math.ceil(total / limit)
        const json = {
            code: 200,
            data: {
                list: result[0],
                total,
                hasNext: totalPage > page ? 1 : 0,
                hasPrev: page > 1 ? 1 : 0,
            },
        }
        res.json(json)
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 获取单个管理员
 * @method getItem
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function getItem(req: Req<{}, { id: string }>, res: Res) {
    const _id = req.query.id
    if (!_id)
        res.json({ code: -200, message: '参数错误' })

    try {
        const result = (await AdminM.findOne({ _id }).exec())?.toObject()
        res.json({ code: 200, data: result })
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 管理员登录
 * @method loginAdmin
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function login(req: Req<{ password: string; username: string }, { }>, res: Res) {
    const { password, username } = req.body
    if (username === '' || password === '')
        return res.json({ code: -200, message: '请输入用户名和密码' })

    try {
        const result = (await AdminM.findOne({
            username,
            password: md5(md5Pre + password),
            is_delete: 0,
        }).exec())?.toObject()
        if (result) {
            const _username = encodeURI(username)
            const id = result._id
            const remember_me = 2592000000
            const token = jwt.sign({ id, username: _username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
            res.cookie('b_user', token, { maxAge: remember_me })
            res.cookie('b_userid', id, { maxAge: remember_me })
            res.cookie('b_username', _username, { maxAge: remember_me })
            return res.json({ code: 200, message: '登录成功', data: token })
        }
        return res.json({ code: -200, message: '用户名或者密码错误' })
    }
    catch (error: any) {
        res.json({ code: -200, message: error.toString() })
    }
}

/**
 * 初始化时添加管理员
 * @param {string} email 邮箱
 * @param {string} password 密码
 * @param {string} username 用户名
 */
export async function insert(email: string, password: string, username: string) {
    let message = ''

    if (fsExistsSync('./admin.lock')) {
        message = '请先把项目根目录的 admin.lock 文件删除'
    }
    else if (!username || !password || !email) {
        message = '请将表单填写完整'
    }
    else {
        try {
            const result = await AdminM.findOne({ username }).exec()
            if (result) {
                message = `${username}: 已经存在`
            }
            else {
                await AdminM.create({
                    username,
                    password: md5(md5Pre + password),
                    email,
                    creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    is_delete: 0,
                    timestamp: moment().format('X'),
                })
                fs.writeFileSync('./admin.lock', username)
                message = `添加用户成功: ${username}, 密码: ${password}`
            }
        }
        catch (error: any) {
            message = error.toString()
        }
    }
    return message
}

/**
 * 管理员编辑
 * @method modifyAdmin
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function modify(req: Req<{ id: string; email: string; password: string; username: string }, { }>, res: Res) {
    const { id, email, password, username } = req.body
    const data: UserModify = {
        email,
        username,
        update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
    }
    if (password)
        data.password = md5(md5Pre + password)

    try {
        const result = await AdminM.findOneAndUpdate({ _id: id }, data, { new: true }).exec()
        res.json({ code: 200, message: '更新成功', data: result })
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 管理员删除
 * @method deletes
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function deletes(req: Req<{}, { id: string }>, res: Res) {
    const _id = req.query.id
    try {
        await AdminM.updateOne({ _id }, { is_delete: 1 }).exec()
        res.json({ code: 200, message: '删除成功', data: 'success' })
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 管理员恢复
 * @method recover
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function recover(req: Req<{}, { id: string }>, res: Res) {
    const _id = req.query.id
    try {
        await AdminM.updateOne({ _id }, { is_delete: 0 }).exec()
        res.json({ code: 200, message: '恢复成功', data: 'success' })
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}
