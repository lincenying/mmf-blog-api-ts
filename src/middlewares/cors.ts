import type { NextFunction } from 'express'
import type { Req, Res } from '@/types'

export default (req: Req, res: Res, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, user, userid, useremail, username')
    next()
}
