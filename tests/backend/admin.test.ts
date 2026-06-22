import { getTestAgent } from '../helpers/app'
import { loginAsAdmin } from '../helpers/auth'
import { getSampleAdmin, hasSampleAdmin } from '../helpers/db'
import { expectAuthFailAdmin, expectFail, expectNotFound, expectPaginate, expectSuccess } from '../helpers/fixtures'

describe('backend admin API', () => {
    describe('post /api/backend/admin/login', () => {
        it('缺少用户名返回 -200', async () => {
            const res = await getTestAgent().post('/api/backend/admin/login').send({ password: '123' })
            expectFail(res)
        })

        it('缺少密码返回 -200', async () => {
            const res = await getTestAgent().post('/api/backend/admin/login').send({ username: 'admin' })
            expectFail(res)
        })

        it('错误凭据返回 -200', async () => {
            const res = await getTestAgent().post('/api/backend/admin/login').send({
                username: '__invalid_admin__',
                password: '__invalid_password__',
            })
            expectFail(res, '用户名或者密码错误')
        })

        it('成功登录并设置 Cookie', async () => {
            const username = process.env.TEST_ADMIN_USERNAME
            const password = process.env.TEST_ADMIN_PASSWORD
            if (!username || !password) {
                return
            }
            const res = await getTestAgent().post('/api/backend/admin/login').send({ username, password })
            expectSuccess(res)
            expect(res.headers['set-cookie']).toBeDefined()
        })
    })

    describe('get /api/backend/admin/list', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().get('/api/backend/admin/list')
            expectAuthFailAdmin(res)
        })

        it('参数 page 非法返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/backend/admin/list?page=abc')
            expectFail(res)
        })

        it('成功返回分页列表', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/backend/admin/list?page=1&limit=10')
            expectPaginate(res)
        })
    })

    describe('get /api/backend/admin/item', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().get('/api/backend/admin/item?id=1')
            expectAuthFailAdmin(res)
        })

        it('缺少 id 返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/backend/admin/item')
            expectFail(res)
        })

        it('成功返回管理员详情', async () => {
            if (!await hasSampleAdmin()) {
                return
            }
            const admin = await getSampleAdmin()
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get(`/api/backend/admin/item?id=${admin.id}`)
            expectSuccess(res)
            expect(res.body.data).toHaveProperty('username')
            expect(res.body.data).not.toHaveProperty('password')
        })
    })

    describe('post /api/backend/admin/modify', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().post('/api/backend/admin/modify').send({})
            expectAuthFailAdmin(res)
        })

        it('缺少必填字段返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.post('/api/backend/admin/modify').send({ id: '1' })
            expectFail(res)
        })
    })

    describe('get /api/backend/admin/delete', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().get('/api/backend/admin/delete?id=1')
            expectAuthFailAdmin(res)
        })

        it('缺少 id 返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/backend/admin/delete')
            expectFail(res)
        })
    })

    describe('get /api/backend/admin/recover', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().get('/api/backend/admin/recover?id=1')
            expectAuthFailAdmin(res)
        })

        it('缺少 id 返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/backend/admin/recover')
            expectFail(res)
        })
    })

    describe('404', () => {
        it('get /api/backend/admin-not-exist 返回未找到', async () => {
            const res = await getTestAgent().get('/api/backend/admin-not-exist')
            expectNotFound(res)
        })
    })
})
