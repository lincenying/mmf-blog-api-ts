import http from 'node:http'
import path from 'node:path'
import process from 'node:process'

import { UTC2Date } from '@lincy/utils'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import express from 'express'
import logger from 'morgan'
import requestIp from 'request-ip'
import favicon from 'serve-favicon'

// 引入 api  路由
import mockjs from './mockjs/index'
import appRoutes from './routes/app'
import backendRoutes from './routes/backend'
import frontendRoutes from './routes/frontend'
import routes from './routes/index'

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     const err = new Error('Not Found')
//     err.status = 404
//     next(err)
// })

// app.use(function(err, req, res) {
//     res.status(err.status || 500)
//     res.send(err.message)
// })

// 引入 mock 路由

const app = express()

// const __dirname = path.dirname(fileURLToPath(import.meta.url))

const resolve = (file: string) => path.resolve(file)
const isProd = process.env.NODE_ENV === 'production'
/**
 * 配置并返回一个静态文件服务器。
 * @param path 指定静态文件所在的路径。
 * @param cache 是否启用缓存。在生产环境且启用缓存时，将设置文件的最大缓存时间。为一个月。
 * @returns 返回一个配置好的静态文件服务器实例。
 */
function serve(path: string, cache: boolean) {
    // 根据是否启用缓存以及当前环境（是否是生产环境），设置文件的最大缓存时间。
    return express.static(resolve(path), {
        maxAge: (cache && isProd) ? 1000 * 60 * 60 * 24 * 30 : 0,
    })
}

// view engine setup
app.set('views', resolve('./views'))// twig
app.set('twig options', {
    allow_async: true,
    strict_variables: false,
})

app.use(compression())
app.use(favicon(`${resolve('./public')}/favicon.ico`))

logger.token('remote-addr', (req) => {
    return requestIp.getClientIp(req) || 'unknown'
})
logger.token('date', () => {
    return UTC2Date(undefined, 'yyyy-mm-dd hh:ii:ss.SSS')
})

app.use(
    logger('[:remote-addr] [:date] ":method :url" :status :res[content-length] ":referrer"', {
        skip(req) {
            const skipExt = ['.webmanifes', '.php', '.txt', '.map', '.js', '.css', '.png', 'jpg', '.jpeg', '.gif', '.ttf', '.woff2', '.ico']
            return skipExt.some((ext) => {
                return req.url.includes(ext)
            })
        },
    }),
)
/**
 * 使用express.json中间件来解析请求体中的JSON数据。
 * 该中间件会将请求体中的JSON数据解析为JavaScript对象。
 * 限制了解析的JSON数据的大小为50mb，超过此限制的请求将被拒绝。
 *
 * @param {object} options 配置项对象，用于配置中间件的行为。
 *        limit: 设置请求体的最大大小，此处为'50mb'。
 * @returns 无返回值。
 */
app.use(express.json({ limit: '50mb' }))
// 解析 application/x-www-form-urlencoded 中间件
// 使用express.urlencoded中间件来解析URL编码的请求体
// 参数配置对象包括：
// limit: 指定请求体的最大大小，此处为50mb
// extended: 允许使用扩展的提交类型，true表示支持
app.use(express.urlencoded({ limit: '50mb', extended: true }))
/**
 * 使用cookieParser中间件来解析cookie。
 * 该函数不接受参数，也没有返回值。
 * 它会将请求对象(req)上的cookie解析为一个对象，方便后续处理。
 */
app.use(cookieParser())
// app.use(express.static(path.join(__dirname, 'public')))

app.use('/static', serve('./public', true))
app.use('/api/app', appRoutes)
app.use('/api/frontend', frontendRoutes)
app.use('/api/backend', backendRoutes)
app.use('/backend', routes)
app.use('/mockjs', mockjs)

app.get('*', (_req, res) => {
    res.json({
        code: -200,
        message: '没有找到该页面',
    })
})

const port = process.env.PORT || '4000'
app.set('port', port)

const server = http.createServer(app)

server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

interface Errors extends Error {
    syscall: string
    code: string
}

/**
 * 处理监听错误的函数。
 * @param error 错误对象，预期为Errors类型，包含错误的详细信息。
 * 该函数不返回任何内容，但可能会因错误而使进程退出。
 */
function onError(error: Errors) {
    // 如果错误不是监听相关的，则直接抛出错误
    if (error.syscall !== 'listen') {
        throw error
    }

    // 根据端口类型（字符串或数字），生成相应的绑定信息
    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`

    // 根据错误代码，提供友好的错误消息并处理
    switch (error.code) {
        case 'EACCES':
            // 如果是权限错误，输出错误信息并退出进程
            console.error(`${bind} requires elevated privileges`)
            process.exit(1)
            break
        case 'EADDRINUSE':
            // 如果端口已被占用，输出错误信息并退出进程
            console.error(`${bind} is already in use`)
            process.exit(1)
            break
        default:
            // 对于其他错误，抛出错误
            throw error
    }
}

/**
 * 当服务器开始监听时调用的函数。
 * 该函数没有参数和返回值。
 * 主要用于输出服务器监听的地址和端口信息。
 */
function onListening() {
    // 获取服务器监听的地址信息
    const addr = server.address()!
    const bind = typeof addr === 'string' ? `${addr}` : `${addr.port}`
    // 打印监听的地址和端口信息
    console.log(`Listening on: http://localhost:${bind}`)
}
