import { getTestAgent } from '../helpers/app'
import { loginAsAdmin } from '../helpers/auth'
import { getSampleUser, hasSampleUser } from '../helpers/db'
import { expectAuthFailAdmin, expectFail, expectNotFound, expectPaginate, expectSuccess } from '../helpers/fixtures'

describe('backend user API', () => {
    describe('get /api/backend/user/list', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().get('/api/backend/user/list')
            expectAuthFailAdmin(res)
        })

        it('参数 page 非法返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/backend/user/list?page=abc')
            expectFail(res)
        })

        it('成功返回分页列表', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/backend/user/list?page=1&limit=10')
            expectPaginate(res)
        })
    })

    describe('get /api/backend/user/item', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().get('/api/backend/user/item?id=1')
            expectAuthFailAdmin(res)
        })

        it('缺少 id 返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/backend/user/item')
            expectFail(res)
        })

        it('成功返回用户详情', async () => {
            if (!await hasSampleUser()) {
                return
            }
            const user = await getSampleUser()
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get(`/api/backend/user/item?id=${user.id}`)
            expectSuccess(res)
            expect(res.body.data).toHaveProperty('username')
        })
    })

    describe('post /api/backend/user/modify', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().post('/api/backend/user/modify').send({})
            expectAuthFailAdmin(res)
        })

        it('缺少必填字段返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.post('/api/backend/user/modify').send({ id: '1' })
            expectFail(res)
        })
    })

    describe('get /api/backend/user/delete', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().get('/api/backend/user/delete?id=1')
            expectAuthFailAdmin(res)
        })

        it('缺少 id 返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/backend/user/delete')
            expectFail(res)
        })
    })

    describe('get /api/backend/user/recover', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().get('/api/backend/user/recover?id=1')
            expectAuthFailAdmin(res)
        })

        it('缺少 id 返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/backend/user/recover')
            expectFail(res)
        })
    })

    describe('404', () => {
        it('get /api/backend/user-not-exist 返回未找到', async () => {
            const res = await getTestAgent().get('/api/backend/user-not-exist')
            expectNotFound(res)
        })
    })
})
