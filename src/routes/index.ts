import type { Req } from '~/types'
import express from 'express'
import * as backendUser from '../modules/admin/admin.service'
import { fail } from '../utils/response'

const router = express.Router()

// 添加管理员
router.get('/', (_req, res) => {
    return res.render('index.twig', { title: '添加管理员', message: '' })
})
router.post('/', async (req: Req<object, { email: string, password: string, username: string }>, res) => {
    const { email, password, username } = req.body
    const message = await backendUser.insert(email, password, username)
    return res.render('index.twig', { title: '添加管理员', message })
})

router.get('/{*index}', (_req, res) => {
    res.json(fail('没有找到该页面'))
})

export default router
