import type { NextFunction } from 'express'
import { checkJWT } from '../utils/check-jwt'
import type { Req, Res } from '@/types'

export default async (req: Req, res: Res, next: NextFunction) => {
    const b_user: string = req.cookies.b_user || req.headers.buser || ''
    const b_userid: string = req.cookies.b_userid || req.headers.buserid || ''
    const b_username: string = req.cookies.b_username || req.headers.busername || ''
    if (b_user) {
        const check = await checkJWT(b_user, b_userid, b_username, 'admin')
        if (check) {
            next()
        }
        else {
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
        return res.json({
            code: -500,
            message: '请先登录',
            data: '',
        })
    }
}
