import fs from 'node:fs'
import md5 from 'md5'
import jwt from 'jsonwebtoken'

import { fsExistsSync, getErrorMessage, getNowTime } from '../utils'
import { md5Pre, secretServer as secret } from '../config'
import AdminM from '../models/admin'
import type { Req, Res, ResLists, User, UserModify } from '@/types'

/**
 * 获取管理员列表
 * @method getList
 * @param req Request
 * @param res Response
 */
export async function getList(req: Req<{ page?: number; limit?: number }>, res: Res) {
    const sort = '-_id'
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit
    try {
        const [list, total] = await Promise.all([
            AdminM.find().sort(sort).skip(skip).limit(limit).exec().then(data => data.map(item => item.toObject())),
            AdminM.countDocuments(),
        ])
        const totalPage = Math.ceil(total / limit)
        const json: ResLists<User[]> = {
            code: 200,
            data: {
                list,
                total,
                hasNext: totalPage > page ? 1 : 0,
                hasPrev: page > 1 ? 1 : 0,
            },
        }
        res.json(json)
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 获取单个管理员
 * @method getItem
 * @param req Request
 * @param res Response
 */
export async function getItem(req: Req<{ id: string }>, res: Res) {
    const {
        id: _id,
    } = req.query

    if (!_id)
        res.json({ code: -200, message: '参数错误' })

    try {
        const result = await AdminM.findOne({ _id }).exec().then(data => data?.toObject())
        res.json({ code: 200, data: result })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 管理员登录
 * @method loginAdmin
 * @param req Request
 * @param res Response
 */
export async function login(req: Req<object, { password: string; username: string }>, res: Res) {
    const {
        password,
        username,
    } = req.body

    if (username === '' || password === '')
        return res.json({ code: -200, message: '请输入用户名和密码' })

    try {
        const result = await AdminM.findOne({
            username,
            password: md5(md5Pre + password),
            is_delete: 0,
        }).exec().then(data => data?.toObject())
        if (result) {
            const _username = encodeURI(username)
            const id = result._id
            const remember_me = 30 * 24 * 60 * 60 * 1000 // 30天
            const token = jwt.sign({ id, username: _username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
            res.cookie('b_user', token, { maxAge: remember_me })
            res.cookie('b_userid', id, { maxAge: remember_me })
            res.cookie('b_username', _username, { maxAge: remember_me })
            return res.json({ code: 200, message: '登录成功', data: token })
        }
        return res.json({ code: -200, message: '用户名或者密码错误' })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 初始化时添加管理员
 * @param email 邮箱
 * @param password 密码
 * @param username 用户名
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
            const result = await AdminM.findOne({ username }).exec().then(data => data?.toObject())
            if (result) {
                message = `${username}: 已经存在`
            }
            else {
                await AdminM.create({
                    username,
                    password: md5(md5Pre + password),
                    email,
                    creat_date: getNowTime(),
                    update_date: getNowTime(),
                    is_delete: 0,
                    timestamp: getNowTime('X'),
                })
                fs.writeFileSync('./admin.lock', username)
                message = `添加用户成功: ${username}, 密码: ${password}`
            }
        }
        catch (err: unknown) {
            message = getErrorMessage(err)
        }
    }
    return message
}

/**
 * 管理员编辑
 * @method modifyAdmin
 * @param req Request
 * @param res Response
 */
export async function modify(req: Req<object, { id: string; email: string; password: string; username: string }>, res: Res) {
    const {
        id: _id,
        email,
        password,
        username,
    } = req.body

    const data: UserModify = {
        email,
        username,
        update_date: getNowTime(),
    }
    if (password)
        data.password = md5(md5Pre + password)

    try {
        const result = await AdminM.findOneAndUpdate({ _id }, data, { new: true }).exec().then(data => data?.toObject())
        res.json({ code: 200, message: '更新成功', data: result })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 管理员删除
 * @method deletes
 * @param req Request
 * @param res Response
 */
export async function deletes(req: Req<{ id: string }>, res: Res) {
    const {
        id: _id,
    } = req.query

    try {
        await AdminM.updateOne({ _id }, { is_delete: 1 }).exec()
        res.json({ code: 200, message: '删除成功', data: 'success' })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 管理员恢复
 * @method recover
 * @param req Request
 * @param res Response
 */
export async function recover(req: Req<{ id: string }>, res: Res) {
    const {
        id: _id,
    } = req.query

    try {
        await AdminM.updateOne({ _id }, { is_delete: 0 }).exec()
        res.json({ code: 200, message: '恢复成功', data: 'success' })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}
