import { getTestAgent } from '../helpers/app'
import { loginAsUser } from '../helpers/auth'
import { getSampleArticle, hasSampleArticle } from '../helpers/db'
import { expectAuthFailUser, expectFail, expectNotFound, expectSuccess } from '../helpers/fixtures'

describe('frontend like API', () => {
    describe('get /api/frontend/like', () => {
        it('未登录返回 -400', async () => {
            const res = await getTestAgent().get('/api/frontend/like?id=1')
            expectAuthFailUser(res)
        })

        it('缺少 id 返回 -200', async () => {
            const agent = await loginAsUser(getTestAgent())
            const res = await agent.get('/api/frontend/like')
            expectFail(res)
        })

        it('成功点赞', async () => {
            if (!await hasSampleArticle()) {
                return
            }
            const article = await getSampleArticle()
            const agent = await loginAsUser(getTestAgent())
            const res = await agent.get(`/api/frontend/like?id=${article.id}`)
            expectSuccess(res)
        })
    })

    describe('get /api/frontend/unlike', () => {
        it('未登录返回 -400', async () => {
            const res = await getTestAgent().get('/api/frontend/unlike?id=1')
            expectAuthFailUser(res)
        })

        it('缺少 id 返回 -200', async () => {
            const agent = await loginAsUser(getTestAgent())
            const res = await agent.get('/api/frontend/unlike')
            expectFail(res)
        })

        it('成功取消点赞', async () => {
            if (!await hasSampleArticle()) {
                return
            }
            const article = await getSampleArticle()
            const agent = await loginAsUser(getTestAgent())
            const res = await agent.get(`/api/frontend/unlike?id=${article.id}`)
            expectSuccess(res)
        })
    })

    describe('get /api/frontend/reset/like', () => {
        it('未登录返回 -400', async () => {
            const res = await getTestAgent().get('/api/frontend/reset/like')
            expectAuthFailUser(res)
        })
    })

    describe('404', () => {
        it('get /api/frontend/like-not-exist 返回未找到', async () => {
            const res = await getTestAgent().get('/api/frontend/like-not-exist')
            expectNotFound(res)
        })
    })
})
