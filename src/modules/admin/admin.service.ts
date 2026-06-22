import type { User, UserModify } from '~/types'

import fs from 'node:fs'

import jwt from 'jsonwebtoken'
import md5 from 'md5'

import { md5Pre, secretServer as secret } from '../../config'
import AdminM from '../../models/admin'
import { fsExistsSync, getErrorMessage, getNowTime } from '../../utils'
import { fail, paginate, success } from '../../utils/response'

const ADMIN_LIST_FIELDS = '-password'

/**
 * 获取管理员列表
 */
export async function getList(reqQuery: { page?: string | number, limit?: string | number }) {
    const page = Number(reqQuery.page) || 1
    const limit = Number(reqQuery.limit) || 10
    const skip = (page - 1) * limit

    try {
        const [list, total] = await Promise.all([
            AdminM.find({}, ADMIN_LIST_FIELDS)
                .sort('-_id')
                .skip(skip)
                .limit(limit)
                .lean({ virtuals: true })
                .exec(),
            AdminM.countDocuments(),
        ])
        return paginate(list as User[], total, page, limit)
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 获取单个管理员
 */
export async function getItem(reqQuery: { id: string }) {
    const { id: _id } = reqQuery

    try {
        const result = await AdminM.findOne({ _id }, ADMIN_LIST_FIELDS)
            .lean({ virtuals: true })
            .exec()
        return success(result as User | null)
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 管理员登录
 */
export async function login(reqBody: { password: string, username: string }) {
    const { password, username } = reqBody

    try {
        const result = await AdminM.findOne({
            username,
            password: md5(md5Pre + password),
            is_delete: 0,
        })
            .lean({ virtuals: true })
            .exec()

        if (!result) {
            return fail('用户名或者密码错误')
        }

        const _username = encodeURI(username)
        const id = result.id || ''
        const token = jwt.sign({ id, username: _username }, secret, { expiresIn: 60 * 60 * 24 * 30 })

        return success({
            user: token,
            username: _username,
            userid: id,
        }, '登录成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
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
            const existing = await AdminM.findOne({ username }).lean().exec()
            if (existing) {
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
 * 编辑管理员
 */
export async function modify(reqBody: { id: string, email: string, password: string, username: string }) {
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
        const updated = await AdminM.findOneAndUpdate({ _id }, body, { new: true })
            .select(ADMIN_LIST_FIELDS)
            .exec()

        if (!updated) {
            return fail('没有找到该管理员')
        }

        return success(updated.toObject(), '更新成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 软删除管理员
 */
export async function deletes(reqQuery: { id: string }) {
    const { id: _id } = reqQuery

    try {
        const result = await AdminM.updateOne({ _id }, { is_delete: 1 }).exec()
        if (result.matchedCount === 0) {
            return fail('没有找到该管理员')
        }
        return success('success', '删除成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 恢复管理员
 */
export async function recover(reqQuery: { id: string }) {
    const { id: _id } = reqQuery

    try {
        const result = await AdminM.updateOne({ _id }, { is_delete: 0 }).exec()
        if (result.matchedCount === 0) {
            return fail('没有找到该管理员')
        }
        return success('success', '恢复成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}
