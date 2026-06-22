import type { User, UserCookies, UserModify } from '~/types'

import { strLen } from '@lincy/utils'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import md5 from 'md5'

import { md5Pre, mpappApiId, mpappSecret, secretClient as secret } from '../../config'
import UserM from '../../models/user'
import { getErrorMessage, getNowTime } from '../../utils'
import { fail, paginate, success } from '../../utils/response'

const USER_LIST_FIELDS = '-password'

/**
 * 获取用户列表（后台管理）
 */
export async function getList(reqQuery: { page?: string | number, limit?: string | number }) {
    const page = Number(reqQuery.page) || 1
    const limit = Number(reqQuery.limit) || 10
    const skip = (page - 1) * limit

    try {
        const [list, total] = await Promise.all([
            UserM.find({}, USER_LIST_FIELDS)
                .sort('-_id')
                .skip(skip)
                .limit(limit)
                .lean({ virtuals: true })
                .exec(),
            UserM.countDocuments(),
        ])
        return paginate(list as User[], total, page, limit)
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 用户登录
 */
export async function login(reqBody: { username: string, password: string }) {
    let { username } = reqBody
    const { password } = reqBody

    try {
        const result = await UserM.findOne({
            username,
            password: md5(md5Pre + password),
            is_delete: 0,
        })
            .lean({ virtuals: true })
            .exec()

        if (!result) {
            return fail('用户名或者密码错误')
        }

        username = encodeURI(username)
        const { id, email: useremail } = result as User

        const token = jwt.sign({ id, username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
        return success({
            user: token,
            userid: id,
            username,
            useremail,
        } as UserCookies, '登录成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 微信 jscode 换取 session
 */
export async function jscodeToSession(reqBody: { js_code: string }) {
    const { js_code } = reqBody

    try {
        const xhr = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
            params: {
                appid: mpappApiId,
                secret: mpappSecret,
                js_code,
                grant_type: 'authorization_code',
            },
        })
        return success(xhr.data, '登录成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 微信登录
 */
export async function wxLogin(reqBody: { nickName: string, wxSignature: string, avatar: string }) {
    const { nickName, wxSignature, avatar } = reqBody

    try {
        const existing = await UserM.findOne({
            username: nickName,
            wx_signature: wxSignature,
            is_delete: 0,
        })
            .lean({ virtuals: true })
            .exec()

        let id: string
        let message: string

        if (existing) {
            id = existing.id || existing._id?.toString() || ''
            message = '登录成功'
        }
        else {
            const created = await UserM.create({
                username: nickName,
                password: '',
                email: '',
                creat_date: getNowTime(),
                update_date: getNowTime(),
                is_delete: 0,
                timestamp: getNowTime('X'),
                wx_avatar: avatar,
                wx_signature: wxSignature,
            })
            id = created.id || created._id.toString()
            message = '注册成功!'
        }

        const username = encodeURI(nickName)
        const token = jwt.sign({ id, username }, secret, { expiresIn: 60 * 60 * 24 * 30 })

        return success({
            user: token,
            userid: id,
            username,
        } as UserCookies, message)
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 用户退出
 */
export function logout() {
    return success('success', '退出成功')
}

/**
 * 用户注册
 */
export async function insert(reqBody: { email: string, password: string, username: string }) {
    const { email, password, username } = reqBody

    if (strLen(username) < 4) {
        return fail('用户长度至少 2 个中文或 4 个英文')
    }
    if (strLen(password) < 8) {
        return fail('密码长度至少 8 位')
    }

    try {
        const existing = await UserM.findOne({ username }).lean().exec()
        if (existing) {
            return fail('该用户名已经存在!')
        }

        await UserM.create({
            username,
            password: md5(md5Pre + password),
            email,
            creat_date: getNowTime(),
            update_date: getNowTime(),
            is_delete: 0,
            timestamp: getNowTime('X'),
        })
        return success('success', '注册成功!')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 获取当前用户信息
 */
export async function getItem(userid: string) {
    if (!userid) {
        return fail('请先登录, 或者数据错误')
    }

    try {
        const result = await UserM.findOne({ _id: userid, is_delete: 0 }, USER_LIST_FIELDS)
            .lean({ virtuals: true })
            .exec()

        if (!result) {
            return fail('请先登录, 或者数据错误')
        }

        return success(result as User)
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 后台编辑用户
 */
export async function modify(reqBody: { id: string, email: string, password: string, username: string }) {
    const { id, email, password, username } = reqBody

    const body: UserModify = {
        email,
        username,
        update_date: getNowTime(),
    }
    if (password) {
        body.password = md5(md5Pre + password)
    }

    try {
        const updated = await UserM.findOneAndUpdate({ _id: id }, body, { new: true })
            .select(USER_LIST_FIELDS)
            .exec()

        if (!updated) {
            return fail('没有找到该用户')
        }

        return success(updated.toObject(), '更新成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 修改账号邮箱
 */
export async function account(reqBody: { email: string }, user_id: string) {
    const { email } = reqBody

    try {
        const result = await UserM.updateOne({ _id: user_id }, { $set: { email } }).exec()
        if (result.matchedCount === 0) {
            return fail('没有找到该用户')
        }
        return success({ email }, '更新成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 修改密码
 */
export async function password(reqBody: { old_password: string, password: string }, user_id: string) {
    const { old_password, password } = reqBody

    try {
        const result = await UserM.findOne({
            _id: user_id,
            password: md5(md5Pre + old_password),
            is_delete: 0,
        }).lean().exec()

        if (!result) {
            return fail('原始密码错误')
        }

        await UserM.updateOne(
            { _id: user_id },
            { $set: { password: md5(md5Pre + password) } },
        ).exec()
        return success('success', '更新成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 软删除用户
 */
export async function deletes(reqQuery: { id: string }) {
    const { id: _id } = reqQuery

    try {
        const result = await UserM.updateOne({ _id }, { is_delete: 1 }).exec()
        if (result.matchedCount === 0) {
            return fail('没有找到该用户')
        }
        return success('success', '更新成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 恢复用户
 */
export async function recover(reqQuery: { id: string }) {
    const { id: _id } = reqQuery

    try {
        const result = await UserM.updateOne({ _id }, { is_delete: 0 }).exec()
        if (result.matchedCount === 0) {
            return fail('没有找到该用户')
        }
        return success('success', '更新成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}
