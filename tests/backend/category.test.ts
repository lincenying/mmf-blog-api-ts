import { getTestAgent } from '../helpers/app'
import { loginAsAdmin } from '../helpers/auth'
import { getSampleCategory, hasSampleCategory } from '../helpers/db'
import { expectAuthFailAdmin, expectFail, expectNotFound, expectSuccess } from '../helpers/fixtures'

describe('backend category API', () => {
    describe('get /api/backend/category/list', () => {
        it('成功返回分类列表', async () => {
            const res = await getTestAgent().get('/api/backend/category/list')
            expectSuccess(res)
            expect(res.body.data).toMatchObject({ list: expect.any(Array) })
        })
    })

    describe('get /api/backend/category/item', () => {
        it('缺少 id 返回 -200', async () => {
            const res = await getTestAgent().get('/api/backend/category/item')
            expectFail(res)
        })

        it('成功返回分类详情', async () => {
            if (!await hasSampleCategory()) {
                return
            }
            const category = await getSampleCategory()
            const res = await getTestAgent().get(`/api/backend/category/item?id=${category.id}`)
            expectSuccess(res)
            expect(res.body.data).toHaveProperty('cate_name')
        })
    })

    describe('post /api/backend/category/insert', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().post('/api/backend/category/insert').send({})
            expectAuthFailAdmin(res)
        })

        it('缺少分类名称返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.post('/api/backend/category/insert').send({ cate_order: '1' })
            expectFail(res)
        })
    })

    describe('get /api/backend/category/delete', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().get('/api/backend/category/delete?id=1')
            expectAuthFailAdmin(res)
        })

        it('缺少 id 返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/backend/category/delete')
            expectFail(res)
        })
    })

    describe('get /api/backend/category/recover', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().get('/api/backend/category/recover?id=1')
            expectAuthFailAdmin(res)
        })

        it('缺少 id 返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/backend/category/recover')
            expectFail(res)
        })
    })

    describe('post /api/backend/category/modify', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().post('/api/backend/category/modify').send({})
            expectAuthFailAdmin(res)
        })

        it('缺少必填字段返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.post('/api/backend/category/modify').send({ id: '1' })
            expectFail(res)
        })
    })

    describe('404', () => {
        it('get /api/backend/category-not-exist 返回未找到', async () => {
            const res = await getTestAgent().get('/api/backend/category-not-exist')
            expectNotFound(res)
        })
    })
})
