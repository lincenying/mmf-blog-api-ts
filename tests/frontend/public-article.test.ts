import { getTestAgent } from '../helpers/app'
import { getSampleArticle, hasSampleArticle } from '../helpers/db'
import { expectFail, expectNotFound, expectPaginate, expectSuccess } from '../helpers/fixtures'

describe('frontend public-article API', () => {
    describe('get /api/frontend/article/list', () => {
        it('参数 page 非法返回 -200', async () => {
            const res = await getTestAgent().get('/api/frontend/article/list?page=abc')
            expectFail(res)
        })

        it('成功返回分页列表', async () => {
            const res = await getTestAgent().get('/api/frontend/article/list?page=1&limit=10')
            expectPaginate(res)
        })
    })

    describe('get /api/frontend/article/item', () => {
        it('缺少 id 返回 -200', async () => {
            const res = await getTestAgent().get('/api/frontend/article/item')
            expectFail(res)
        })

        it('成功返回文章详情', async () => {
            if (!await hasSampleArticle()) {
                return
            }
            const article = await getSampleArticle()
            const res = await getTestAgent().get(`/api/frontend/article/item?id=${article.id}`)
            expectSuccess(res)
            expect(res.body.data).toHaveProperty('title')
        })
    })

    describe('get /api/frontend/trending', () => {
        it('成功返回热门文章', async () => {
            const res = await getTestAgent().get('/api/frontend/trending')
            expectSuccess(res)
            expect(res.body.data).toMatchObject({ list: expect.any(Array) })
        })
    })

    describe('404', () => {
        it('get /api/frontend/article-not-exist 返回未找到', async () => {
            const res = await getTestAgent().get('/api/frontend/article-not-exist')
            expectNotFound(res)
        })
    })
})
