import type { Lists, ResData, User, UserModify } from '~/types'

import fs from 'node:fs'
import jwt from 'jsonwebtoken'
import md5 from 'md5'

import { md5Pre, secretServer as secret } from '../config'
import AdminM from '../models/admin'
import { fsExistsSync, getErrorMessage, getNowTime } from '../utils'

/**
 * 获取管理员列表
 */
export async function getList(reqQuery: { page?: number, limit?: number }) {
    let json: ResData<Nullable<Lists<User[]>>>

    const sort = '-_id'
    const page = Number(reqQuery.page) || 1
    const limit = Number(reqQuery.limit) || 10
    const skip = (page - 1) * limit
    try {
        const [list, total] = await Promise.all([
            AdminM.find()
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec()
                .then(data => data.map(item => item.toObject())),
            AdminM.countDocuments(),
        ])
        const totalPage = Math.ceil(total / limit)
        json = {
            code: 200,
            data: {
                list,
                total,
                hasNext: totalPage > page ? 1 : 0,
                hasPrev: page > 1 ? 1 : 0,
            },
        }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    return json
}

/**
 * 获取单个管理员
 */
export async function getItem(reqQuery: { id: string }) {
    let json: ResData<Nullable<User>>

    const { id: _id } = reqQuery

    if (!_id) {
        json = { code: -200, data: null, message: '参数错误' }
    }
    else {
        try {
            const filter = { _id }
            const result = await AdminM.findOne(filter)
                .exec()
                .then(data => data?.toObject())
            json = { code: 200, data: result, message: 'success' }
        }
        catch (err: unknown) {
            json = { code: -200, data: null, message: getErrorMessage(err) }
        }
    }

    return json
}

/**
 * 管理员登录
 */
export async function login(reqBody: { password: string, username: string }) {
    let json: ResData<{ userid: string, user: string, username: string } | null>

    const { password, username } = reqBody

    if (username === '' || password === '') {
        json = { code: -200, data: null, message: '请输入用户名和密码' }
    }
    else {
        try {
            const filter = {
                username,
                password: md5(md5Pre + password),
                is_delete: 0,
            }
            const result = await AdminM.findOne(filter)
                .exec()
                .then(data => data?.toObject())
            if (result) {
                const _username = encodeURI(username)
                const id = result.id || ''
                const token = jwt.sign({ id, username: _username }, secret, { expiresIn: 60 * 60 * 24 * 30 })

                json = {
                    code: 200,
                    message: '登录成功',
                    data: {
                        user: token,
                        username: _username,
                        userid: id,
                    },
                }
            }
            else {
                json = { code: -200, data: null, message: '用户名或者密码错误' }
            }
        }
        catch (err: unknown) {
            json = { code: -200, data: null, message: getErrorMessage(err) }
        }
    }

    return json
}

/**
 * 初始化时添加管理员
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
            const filter = { username }
            const result = await AdminM.findOne(filter)
                .exec()
                .then(data => data?.toObject())
            if (result) {
                message = `${username}: 已经存在`
            }
            else {
                const body = {
                    username,
                    password: md5(md5Pre + password),
                    email,
                    creat_date: getNowTime(),
                    update_date: getNowTime(),
                    is_delete: 0,
                    timestamp: getNowTime('X'),
                }
                await AdminM.create(body)
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
 */
export async function modify(reqBody: { id: string, email: string, password: string, username: string }) {
    let json: ResData<Nullable<User>>

    const { id: _id, email, password, username } = reqBody

    const body: UserModify = {
        email,
        username,
        update_date: getNowTime(),
    }
    if (password) {
        body.password = md5(md5Pre + password)
    }

    try {
        const filter = { _id }
        const result = await AdminM.findOneAndUpdate(filter, body, { new: true })
            .exec()
            .then(data => data?.toObject())
        json = { code: 200, message: '更新成功', data: result }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    return json
}

/**
 * 管理员删除
 */
export async function deletes(reqQuery: { id: string }) {
    let json: ResData<string | null>

    const { id: _id } = reqQuery

    try {
        const filter = { _id }
        const body = { is_delete: 1 }
        await AdminM.updateOne(filter, body).exec()
        json = { code: 200, message: '删除成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    return json
}

/**
 * 管理员恢复
 */
export async function recover(reqQuery: { id: string }) {
    let json: ResData<string | null>

    const { id: _id } = reqQuery

    try {
        const filter = { _id }
        const body = { is_delete: 0 }
        await AdminM.updateOne(filter, body).exec()
        json = { code: 200, message: '恢复成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    return json
}
