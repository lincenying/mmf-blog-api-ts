import { getTestAgent } from '../helpers/app'
import { loginAsAdmin } from '../helpers/auth'
import { getSampleArticle, hasSampleArticle } from '../helpers/db'
import { expectAuthFailAdmin, expectFail, expectNotFound, expectPaginate, expectSuccess } from '../helpers/fixtures'

describe('backend article API', () => {
    describe('get /api/backend/article/list', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().get('/api/backend/article/list')
            expectAuthFailAdmin(res)
        })

        it('参数 page 非法返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/backend/article/list?page=abc')
            expectFail(res)
        })

        it('成功返回分页列表', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/backend/article/list?page=1&limit=10')
            expectPaginate(res)
        })
    })

    describe('get /api/backend/article/item', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().get('/api/backend/article/item?id=1')
            expectAuthFailAdmin(res)
        })

        it('缺少 id 返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/backend/article/item')
            expectFail(res)
        })

        it('成功返回文章详情', async () => {
            if (!await hasSampleArticle()) {
                return
            }
            const article = await getSampleArticle()
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get(`/api/backend/article/item?id=${article.id}`)
            expectSuccess(res)
            expect(res.body.data).toHaveProperty('title')
        })
    })

    describe('post /api/backend/article/insert', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().post('/api/backend/article/insert').send({})
            expectAuthFailAdmin(res)
        })

        it('缺少标题返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.post('/api/backend/article/insert').send({
                category: '1|test',
                content: 'test content',
            })
            expectFail(res)
        })
    })

    describe('get /api/backend/article/delete', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().get('/api/backend/article/delete?id=1')
            expectAuthFailAdmin(res)
        })

        it('缺少 id 返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/backend/article/delete')
            expectFail(res)
        })
    })

    describe('get /api/backend/article/recover', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().get('/api/backend/article/recover?id=1')
            expectAuthFailAdmin(res)
        })

        it('缺少 id 返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/backend/article/recover')
            expectFail(res)
        })
    })

    describe('post /api/backend/article/modify', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().post('/api/backend/article/modify').send({})
            expectAuthFailAdmin(res)
        })

        it('缺少必填字段返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.post('/api/backend/article/modify').send({ id: '1' })
            expectFail(res)
        })
    })

    describe('404', () => {
        it('get /api/backend/article-not-exist 返回未找到', async () => {
            const res = await getTestAgent().get('/api/backend/article-not-exist')
            expectNotFound(res)
        })
    })
})
