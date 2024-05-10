import type { NextFunction } from 'express'
import { checkJWT } from '../utils/check-jwt'
import type { Req, Res } from '@/types'

/**
 * 中间件函数，用于校验用户是否通过登录验证。
 *
 * @param req 请求对象，包含HTTP请求的相关信息。
 * @param res 响应对象，用于发送HTTP响应。
 * @param next 一个函数，如果用户通过验证，则调用该函数继续处理请求链。
 */
export default async (req: Req, res: Res, next: NextFunction) => {
    // 尝试从cookie和请求头中获取用户信息
    const b_user: string = req.cookies.b_user || req.headers.buser || ''
    const b_userid: string = req.cookies.b_userid || req.headers.buserid || ''
    const b_username: string = req.cookies.b_username || req.headers.busername || ''

    if (b_user) {
        // 如果存在用户信息，尝试验证JWT
        const check = await checkJWT(b_user, b_userid, b_username, 'admin')
        if (check) {
            // 验证通过，继续处理请求
            next()
        }
        else {
            // 验证失败，清除cookie并返回错误信息
            res.cookie('b_user', '', { maxAge: 0 })
            res.cookie('b_userid', '', { maxAge: 0 })
            res.cookie('b_username', '', { maxAge: 0 })

            return res.json({
                code: -500,
                message: '登录验证失败',
                data: '',
            })
        }
    }
    else {
        // 未发现用户信息，直接返回错误信息
        return res.json({
            code: -500,
            message: '请先登录',
            data: '',
        })
    }
}
