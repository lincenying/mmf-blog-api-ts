import md5 from 'md5'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { md5Pre, mpappApiId, mpappSecret, secretClient as secret } from '../config'
import { getErrorMessage, getNowTime, strLen } from '../utils'

import UserM from '../models/user'
import type { Lists, Req, Res, ResData, User, UserCookies, UserModify } from '@/types'

/**
 * 用户列表
 * @param req Request
 * @param res Response
 */
export async function getList(req: Req<{ page?: number; limit?: number }>, res: Res) {
    let json: ResData<Nullable<Lists<User[]>>>

    const sort = '-_id'
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    try {
        const [list, total] = await Promise.all([
            UserM.find().sort(sort).skip(skip).limit(limit).exec().then(data => data.map(item => item.toObject())),
            UserM.countDocuments(),
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
    res.json(json)
}

/**
 * 用户登录
 * @param req Request
 * @param res Response
 */
export async function login(req: Req<object, { username: string; password: string }>, res: Res) {
    let json: ResData<Nullable<UserCookies>>

    let {
        username,
    } = req.body

    const {
        password,
    } = req.body

    if (username === '' || password === '') {
        json = { code: -200, data: null, message: '请输入用户名和密码' }
    }

    try {
        const filter = {
            username,
            password: md5(md5Pre + password),
            is_delete: 0,
        }
        const result = await UserM.findOne(filter).exec().then(data => data?.toObject())
        if (result) {
            username = encodeURI(username)
            const {
                _id: id,
                email: useremail,
            } = result

            const remember_me = 30 * 24 * 60 * 60 * 1000 // 30天
            const token = jwt.sign({ id, username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
            res.cookie('user', token, { maxAge: remember_me })
            res.cookie('userid', id, { maxAge: remember_me })
            res.cookie('username', username, { maxAge: remember_me })
            res.cookie('useremail', useremail, { maxAge: remember_me })
            json = {
                code: 200,
                message: '登录成功',
                data: {
                    user: token,
                    userid: id,
                    username,
                    useremail,
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
    res.json(json)
}

/**
 * 微信登录
 * @param req Request
 * @param res Response
 */
export async function jscodeToSession(req: Req<object, { js_code: string }>, res: Res) {
    const {
        js_code,
    } = req.body

    const xhr = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
        params: {
            appid: mpappApiId,
            secret: mpappSecret,
            js_code,
            grant_type: 'authorization_code',
        },
    })

    const json: ResData<any> = { code: 200, message: '登录成功', data: xhr.data }

    res.json(json)
}
/**
 * 微信登录
 * @param req Request
 * @param res Response
 */
export async function wxLogin(req: Req<object, { nickName: string; wxSignature: string; avatar: string }>, res: Res) {
    let json: ResData<Nullable<UserCookies>>

    const {
        nickName,
        wxSignature,
        avatar,
    } = req.body

    let id, token, username
    if (!nickName || !wxSignature) {
        json = { code: -200, data: null, message: '参数有误, 微信登录失败' }
    }
    else {
        try {
            const filter = {
                username: nickName,
                wx_signature: wxSignature,
                is_delete: 0,
            }
            const result = await UserM.findOne(filter).exec().then(data => data?.toObject())
            if (result) {
                id = result._id
                username = encodeURI(nickName)
                token = jwt.sign({ id, username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
                json = {
                    code: 200,
                    message: '登录成功',
                    data: {
                        user: token,
                        userid: id,
                        username,
                    },
                }
            }
            else {
                const creatData = {
                    username: nickName,
                    password: '',
                    email: '',
                    creat_date: getNowTime(),
                    update_date: getNowTime(),
                    is_delete: 0,
                    timestamp: getNowTime('X'),
                    wx_avatar: avatar,
                    wx_signature: wxSignature,
                }
                const _result = await UserM.create(creatData).then(data => data?.toObject())
                id = _result._id
                username = encodeURI(nickName)
                token = jwt.sign({ id, username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
                json = {
                    code: 200,
                    message: '注册成功!',
                    data: {
                        user: token,
                        userid: id,
                        username,
                    },
                }
            }
        }
        catch (err: unknown) {
            json = { code: -200, data: null, message: getErrorMessage(err) }
        }
    }
    res.json(json)
}

/**
 * 用户退出
 * @param req Request
 * @param res Response
 */
export function logout(req: Req, res: Res) {
    res.cookie('user', '', { maxAge: -1 })
    res.cookie('userid', '', { maxAge: -1 })
    res.cookie('username', '', { maxAge: -1 })
    res.cookie('useremail', '', { maxAge: -1 })

    const json: ResData<string> = { code: 200, message: '退出成功', data: 'success' }

    res.json(json)
}

/**
 * 用户注册
 * @param req Request
 * @param res Response
 */
export async function insert(req: Req<object, { email: string; password: string; username: string }>, res: Res) {
    let json: ResData<string | null>

    const {
        email,
        password,
        username,
    } = req.body

    if (!username || !password || !email) {
        json = { code: -200, data: null, message: '请将表单填写完整' }
    }
    else if (strLen(username) < 4) {
        json = { code: -200, data: null, message: '用户长度至少 2 个中文或 4 个英文' }
    }
    else if (strLen(password) < 8) {
        json = { code: -200, data: null, message: '密码长度至少 8 位' }
    }
    else {
        try {
            const result = await UserM.findOne({ username }).exec().then(data => data?.toObject())
            if (result) {
                json = { code: -200, message: '该用户名已经存在!', data: 'error' }
            }
            else {
                await UserM.create({
                    username,
                    password: md5(md5Pre + password),
                    email,
                    creat_date: getNowTime(),
                    update_date: getNowTime(),
                    is_delete: 0,
                    timestamp: getNowTime('X'),
                })
                json = { code: 200, message: '注册成功!', data: 'success' }
            }
        }
        catch (err: unknown) {
            json = { code: -200, data: null, message: getErrorMessage(err) }
        }
    }
    res.json(json)
}

/**
 * 获取用户信息
 * @param req Request
 * @param res Response
 */
export async function getItem(req: Req, res: Res) {
    let json: ResData<Nullable<User>>

    const userid = req.query.id || req.cookies.userid || req.headers.userid

    try {
        const filter = { _id: userid, is_delete: 0 }
        const result = await UserM.findOne(filter).exec().then(data => data?.toObject())
        if (result) {
            json = { code: 200, data: result, message: 'success' }
        }
        else { json = { code: -200, data: null, message: '请先登录, 或者数据错误' } }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}

/**
 * 用户编辑
 * @param req Request
 * @param res Response
 */
export async function modify(req: Req<object, { id: string; email: string; password: string; username: string }>, res: Res) {
    let json: ResData<Nullable<User>>

    const {
        id,
        email,
        password,
        username,
    } = req.body

    const body: UserModify = {
        email,
        username,
        update_date: getNowTime(),
    }
    if (password) {
        body.password = md5(md5Pre + password)
    }

    try {
        const filter = { _id: id }
        const result = await UserM.findOneAndUpdate(filter, body, { new: true }).exec().then(data => data?.toObject())
        json = { code: 200, message: '更新成功', data: result }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }
    res.json(json)
}

/**
 * 账号编辑
 * @param req Request
 * @param res Response
 */
export async function account(req: Req<object, { email: string }>, res: Res) {
    let json: ResData<string | null>

    const {
        email,
    } = req.body

    const user_id = req.cookies.userid || req.headers.userid
    try {
        await UserM.updateOne<User>({ _id: user_id }, { $set: { email } }).exec()
        res.cookie('useremail', email, { maxAge: 2592000000 })
        json = { code: 200, message: '更新成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }
    res.json(json)
}

/**
 * 密码编辑
 * @param req Request
 * @param res Response
 */
export async function password(req: Req<object, { old_password: string; password: string }>, res: Res) {
    let json: ResData<string | null>

    const {
        old_password,
        password,
    } = req.body

    const user_id = req.cookies.userid || req.headers.userid
    try {
        const filter = {
            _id: user_id,
            password: md5(md5Pre + old_password),
            is_delete: 0,
        }

        const result = await UserM.findOne(filter).exec().then(data => data?.toObject())
        if (result) {
            const filter = {
                _id: user_id,
            }
            const body = {
                $set: {
                    password: md5(md5Pre + password),
                },
            }
            await UserM.updateOne(filter, body)
            json = { code: 200, message: '更新成功', data: 'success' }
        }
        else {
            json = { code: -200, message: '原始密码错误', data: 'error' }
        }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }
    res.json(json)
}

/**
 * 用户删除
 * @param req Request
 * @param res Response
 */
export async function deletes(req: Req<{ id: string }>, res: Res) {
    let json: ResData<string | null>

    const {
        id: _id,
    } = req.query

    try {
        const filter = { _id }
        const body = {
            is_delete: 1,
        }
        await UserM.updateOne(filter, body).exec()
        json = { code: 200, message: '更新成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}

/**
 * 用户恢复
 * @param req Request
 * @param res Response
 */
export async function recover(req: Req<{ id: string }>, res: Res) {
    let json: ResData<string | null>

    const {
        id: _id,
    } = req.query

    try {
        const filter = { _id }
        const body = {
            is_delete: 0,
        }
        await UserM.updateOne(filter, body).exec()
        json = { code: 200, message: '更新成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}
