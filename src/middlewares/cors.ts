import type { NextFunction } from 'express'
import type { Req, Res } from '~/types'

/**
 * 跨域资源共享（CORS）中间件。
 * 该函数用于设置响应头，以允许来自任何来源的跨域请求，并定义了允许的方法和头部。
 *
 * @param req 代表客户端请求的对象。
 * @param res 代表服务器响应的对象，用于设置响应头。
 * @param next 中间件调用链的下一个函数。
 */
export default (req: Req, res: Res, next: NextFunction) => {
    // 设置允许跨域请求的来源为所有来源
    res.header('Access-Control-Allow-Origin', '*')
    // 设置允许的请求方法
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
    // 设置允许的请求头部
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, user, userid, useremail, username')
    // 继续处理请求链
    next()
}
