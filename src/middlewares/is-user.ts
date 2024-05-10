import type { NextFunction } from 'express'
import { checkJWT } from '../utils/check-jwt'
import type { Req, Res } from '@/types'

/**
 * 中间件函数，用于校验用户是否登录。
 * 它首先尝试从cookie或header中读取用户信息，然后通过JWT进行验证。
 * 如果验证失败或没有提供用户信息，则要求用户重新登录。
 *
 * @param req 请求对象，包含用户提交的cookies和headers信息。
 * @param res 响应对象，用于设置cookie或返回响应数据。
 * @param next 用于传递控制权到下一个中间件或路由处理函数。
 * @returns 如果验证成功，则调用next()继续处理请求；否则，返回登录验证失败或请先登录的响应。
 */
export default async (req: Req, res: Res, next: NextFunction) => {
    // 尝试从cookie和header中获取用户信息
    const user: string = req.cookies.user || req.headers.user || ''
    const userid: string = req.cookies.userid || req.headers.userid || ''
    const username: string = req.cookies.username || req.headers.username || ''

    if (user) {
        // 如果存在用户信息，尝试验证JWT
        const check = await checkJWT(user, userid, username, 'user')
        if (check) {
            // 验证通过，继续处理请求
            next()
        }
        else {
            // 验证失败，清除用户cookie并返回错误响应
            res.cookie('user', '', { maxAge: 0 })
            res.cookie('userid', '', { maxAge: 0 })
            res.cookie('username', '', { maxAge: 0 })
            res.cookie('useremail', '', { maxAge: 0 })
            return res.json({
                code: -400,
                message: '登录验证失败',
                data: '',
            })
        }
    }
    else {
        // 未提供用户信息，返回需要登录的响应
        return res.json({
            code: -400,
            message: '请先登录',
            data: '',
        })
    }
}
