import md5 from 'md5'
import moment from 'moment'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { md5Pre, mpappApiId, mpappSecret, secretClient as secret } from '../config'
import { strLen } from '../utils'

import UserM from '../models/user'
import type { ListConfig, Req, Res, User, UserModify } from '@/types'

/**
 * 用户列表
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function getList(req: Req<{ page: string; limit: string }>, res: Res) {
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
        const json: ListConfig<User[]> = {
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
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 用户登录
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function login(req: Req<{}, { username: string; password: string }>, res: Res) {
    let { username } = req.body
    const { password } = req.body
    if (username === '' || password === '')
        res.json({ code: -200, message: '请输入用户名和密码' })

    try {
        let json = {}
        const findData = {
            username,
            password: md5(md5Pre + password),
            is_delete: 0,
        }
        const result = await UserM.findOne(findData).exec().then(data => data?.toObject())
        if (result) {
            username = encodeURI(username)
            const id = result._id
            const email = result.email
            const remember_me = 2592000000
            const token = jwt.sign({ id, username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
            res.cookie('user', token, { maxAge: remember_me })
            res.cookie('userid', id, { maxAge: remember_me })
            res.cookie('username', username, { maxAge: remember_me })
            res.cookie('useremail', email, { maxAge: remember_me })
            json = {
                code: 200,
                message: '登录成功',
                data: {
                    user: token,
                    userid: id,
                    username,
                    email,
                },
            }
        }
        else {
            json = {
                code: -200,
                message: '用户名或者密码错误',
            }
        }
        res.json(json)
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 微信登录
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function jscodeToSession(req: Req<{}, { js_code: string }>, res: Res) {
    const { js_code } = req.body
    const xhr = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
        params: {
            appid: mpappApiId,
            secret: mpappSecret,
            js_code,
            grant_type: 'authorization_code',
        },
    })
    res.json({ code: 200, message: '登录成功', data: xhr.data })
}
/**
 * 微信登录
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function wxLogin(req: Req<{}, { nickName: string; wxSignature: string; avatar: string }>, res: Res) {
    const { nickName, wxSignature, avatar } = req.body

    let id, token, username
    if (!nickName || !wxSignature) {
        res.json({ code: -200, message: '参数有误, 微信登录失败' })
    }
    else {
        try {
            let json = {}
            const result = await UserM.findOne({ username: nickName, wx_signature: wxSignature, is_delete: 0 }).exec().then(data => data?.toObject())
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
                res.json(json)
            }
            else {
                const creatData = {
                    username: nickName,
                    password: '',
                    email: '',
                    creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    is_delete: 0,
                    timestamp: moment().format('X'),
                    wx_avatar: avatar,
                    wx_signature: wxSignature,
                }
                const _result = await UserM.create(creatData).then(data => data?.toObject())
                id = _result._id
                username = encodeURI(nickName)
                token = jwt.sign({ id, username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
                res.json({
                    code: 200,
                    message: '注册成功!',
                    data: {
                        user: token,
                        userid: id,
                        username,
                    },
                })
            }
        }
        catch (err: any) {
            res.json({ code: -200, message: err.toString() })
        }
    }
}

/**
 * 用户退出
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export function logout(req: Req, res: Res) {
    res.cookie('user', '', { maxAge: -1 })
    res.cookie('userid', '', { maxAge: -1 })
    res.cookie('username', '', { maxAge: -1 })
    res.cookie('useremail', '', { maxAge: -1 })
    res.json({ code: 200, message: '退出成功', data: '' })
}

/**
 * 用户注册
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function insert(req: Req<{}, { email: string; password: string; username: string }>, res: Res) {
    const { email, password, username } = req.body
    if (!username || !password || !email) {
        res.json({ code: -200, message: '请将表单填写完整' })
    }
    else if (strLen(username) < 4) {
        res.json({ code: -200, message: '用户长度至少 2 个中文或 4 个英文' })
    }
    else if (strLen(password) < 8) {
        res.json({ code: -200, message: '密码长度至少 8 位' })
    }
    else {
        try {
            const result = await UserM.findOne({ username }).exec().then(data => data?.toObject())
            if (result) {
                res.json({ code: -200, message: '该用户名已经存在!' })
            }
            else {
                await UserM.create({
                    username,
                    password: md5(md5Pre + password),
                    email,
                    creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    is_delete: 0,
                    timestamp: moment().format('X'),
                })
                res.json({ code: 200, message: '注册成功!', data: 'success' })
            }
        }
        catch (err: any) {
            res.json({ code: -200, message: err.toString() })
        }
    }
}

/**
 * 获取用户信息
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function getItem(req: Req, res: Res) {
    const userid = req.query.id || req.cookies.userid || req.headers.userid
    try {
        let json
        const result = await UserM.findOne({ _id: userid, is_delete: 0 }).exec().then(data => data?.toObject())
        if (result)
            json = { code: 200, data: result }
        else
            json = { code: -200, message: '请先登录, 或者数据错误' }

        res.json(json)
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 用户编辑
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function modify(req: Req<{}, { id: string; email: string; password: string; username: string }>, res: Res) {
    const { id, email, password, username } = req.body
    const data: UserModify = {
        email,
        username,
        update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
    }
    if (password)
        data.password = md5(md5Pre + password)

    try {
        const result = await UserM.findOneAndUpdate({ _id: id }, data, { new: true }).exec().then(data => data?.toObject())
        res.json({ code: 200, message: '更新成功', data: result })
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 账号编辑
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function account(req: Req<{}, { email: string }>, res: Res) {
    const { email } = req.body
    const user_id = req.cookies.userid || req.headers.userid
    try {
        await UserM.updateOne<User>({ _id: user_id }, { $set: { email } }).exec()
        res.cookie('useremail', email, { maxAge: 2592000000 })
        res.json({ code: 200, message: '更新成功', data: 'success' })
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 密码编辑
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function password(req: Req<{}, { old_password: string; password: string }>, res: Res) {
    const { old_password, password } = req.body
    const user_id = req.cookies.userid || req.headers.userid
    try {
        const result = await UserM.findOne({ _id: user_id, password: md5(md5Pre + old_password), is_delete: 0 }).exec().then(data => data?.toObject())
        if (result) {
            await UserM.updateOne({ _id: user_id }, { $set: { password: md5(md5Pre + password) } })
            res.json({ code: 200, message: '更新成功', data: 'success' })
        }
        else {
            res.json({ code: -200, message: '原始密码错误' })
        }
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 用户删除
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function deletes(req: Req<{ id: string }>, res: Res) {
    const _id = req.query.id
    try {
        await UserM.updateOne({ _id }, { is_delete: 1 }).exec()
        res.json({ code: 200, message: '更新成功', data: 'success' })
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 用户恢复
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function recover(req: Req<{ id: string }>, res: Res) {
    const _id = req.query.id
    try {
        await UserM.updateOne({ _id }, { is_delete: 0 }).exec()
        res.json({ code: 200, message: '更新成功', data: 'success' })
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}
