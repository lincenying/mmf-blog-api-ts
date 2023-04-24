import type { NextFunction } from 'express'
import { checkJWT } from '../utils/check-jwt'
import type { Req, Res } from '@/types'

export default async (req: Req, res: Res, next: NextFunction) => {
    const token = req.cookies.user || req.headers.user
    const userid = req.cookies.userid || req.headers.userid
    const username = req.cookies.username || req.headers.username
    if (token) {
        const check = await checkJWT(token, userid, username, 'user')
        if (check) {
            next()
        }
        else {
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
        return res.json({
            code: -400,
            message: '请先登录',
            data: '',
        })
    }
}
