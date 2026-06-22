import { execSync } from 'node:child_process'
import fs from 'node:fs'

import mongoose from '../src/mongoose'
import { resetTestAgent } from './helpers/app'

vi.mock('../src/utils/markdown', () => ({
    renderArticleContent: (content: string) => ({
        html: content,
        toc: '',
    }),
}))

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}))

const CONNECT_TIMEOUT_MS = 10000

function ensureConfig() {
    if (!fs.existsSync('./src/config/secret.js')) {
        execSync('pnpm init:config', { stdio: 'inherit' })
    }
}

function waitForMongoConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (mongoose.connection.readyState === 1) {
            resolve()
            return
        }

        const timer = setTimeout(() => {
            reject(new Error('MongoDB 连接超时，请先启动本地 Mongo（默认 mongodb://127.0.0.1:27017/mmfblog_v2）'))
        }, CONNECT_TIMEOUT_MS)

        mongoose.connection.once('connected', () => {
            clearTimeout(timer)
            resolve()
        })

        mongoose.connection.once('error', (err) => {
            clearTimeout(timer)
            reject(err)
        })
    })
}

beforeAll(async () => {
    ensureConfig()
    await waitForMongoConnection()
})

afterAll(async () => {
    await mongoose.disconnect()
})

afterEach(() => {
    vi.clearAllMocks()
    resetTestAgent()
})
