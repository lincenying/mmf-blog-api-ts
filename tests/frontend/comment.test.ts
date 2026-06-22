import { getTestAgent } from '../helpers/app'
import { loginAsAdmin, loginAsUser } from '../helpers/auth'
import { getSampleArticle, getSampleComment, hasSampleArticle, hasSampleComment } from '../helpers/db'
import { expectAuthFailAdmin, expectAuthFailUser, expectFail, expectNotFound, expectPaginate } from '../helpers/fixtures'

describe('frontend comment API', () => {
    describe('post /api/frontend/comment/insert', () => {
        it('未登录返回 -400', async () => {
            const res = await getTestAgent().post('/api/frontend/comment/insert').send({})
            expectAuthFailUser(res)
        })

        it('缺少评论内容返回 -200', async () => {
            const agent = await loginAsUser(getTestAgent())
            const res = await agent.post('/api/frontend/comment/insert').send({ id: '1' })
            expectFail(res)
        })
    })

    describe('get /api/frontend/comment/list', () => {
        it('缺少文章 id 返回 -200', async () => {
            const res = await getTestAgent().get('/api/frontend/comment/list')
            expectFail(res)
        })

        it('成功返回评论列表', async () => {
            if (!await hasSampleArticle()) {
                return
            }
            const article = await getSampleArticle()
            const res = await getTestAgent().get(`/api/frontend/comment/list?id=${article.id}&page=1&limit=10`)
            expectPaginate(res)
        })
    })

    describe('get /api/frontend/comment/delete', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().get('/api/frontend/comment/delete?id=1')
            expectAuthFailAdmin(res)
        })

        it('缺少 id 返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/frontend/comment/delete')
            expectFail(res)
        })
    })

    describe('get /api/frontend/comment/recover', () => {
        it('未登录返回 -500', async () => {
            const res = await getTestAgent().get('/api/frontend/comment/recover?id=1')
            expectAuthFailAdmin(res)
        })

        it('缺少 id 返回 -200', async () => {
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get('/api/frontend/comment/recover')
            expectFail(res)
        })

        it('成功查询评论存在性（仅校验接口可达）', async () => {
            if (!await hasSampleComment()) {
                return
            }
            const comment = await getSampleComment()
            const agent = await loginAsAdmin(getTestAgent())
            const res = await agent.get(`/api/frontend/comment/recover?id=${comment.id}`)
            expect(res.body.code).toBeDefined()
        })
    })

    describe('404', () => {
        it('get /api/frontend/comment-not-exist 返回未找到', async () => {
            const res = await getTestAgent().get('/api/frontend/comment-not-exist')
            expectNotFound(res)
        })
    })
})
