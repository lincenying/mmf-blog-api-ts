import path from 'node:path'
import { fileURLToPath } from 'node:url'
import http from 'node:http'
import express from 'express'
import compression from 'compression'
import favicon from 'serve-favicon'
import logger from 'morgan'
import cookieParser from 'cookie-parser'

// 引入 api  路由
import mockjs from './mockjs/index'
import routes from './routes/index'
import frontendRoutes from './routes/frontend'
import backendRoutes from './routes/backend'
import appRoutes from './routes/app'

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

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const resolve = (file: string) => path.resolve(__dirname, file)
const isProd = process.env.NODE_ENV === 'production'
function serve(path: string, cache: boolean) {
    return express.static(resolve(path), {
        maxAge: (cache && isProd) ? 1000 * 60 * 60 * 24 * 30 : 0,
    })
}

// view engine setup
app.set('views', path.join(__dirname, '../views'))// twig
app.set('twig options', {
    allow_async: true,
    strict_variables: false,
})
// app.set('views', path.join(__dirname, 'views'))
// app.engine('.html', require('ejs').__express)
// app.set('view engine', 'ejs')

app.use(compression())
app.use(favicon(`${path.join(__dirname, '../public')}/favicon.ico`))
app.use(
    logger('dev', {
        skip(req) {
            return req.url.includes('.map')
        },
    }),
)
// parse application/json
app.use(express.json())
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
// app.use(express.static(path.join(__dirname, 'public')))

app.use('/static', serve('../public', true))
app.use('/api/app', appRoutes)
app.use('/api/frontend', frontendRoutes)
app.use('/api/backend', backendRoutes)
app.use('/backend', routes)
app.use('/mockjs', mockjs)

app.get('*', (req, res) => {
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

function onError(error: Errors) {
    if (error.syscall !== 'listen')
        throw error

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`)
            process.exit(1)
            break
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`)
            process.exit(1)
            break
        default:
            throw error
    }
}

function onListening() {
    const addr = server.address() as any
    console.log(`Listening on: http://localhost:${addr.port}`)
}
