import axios from 'axios'

import { getTestAgent } from '../helpers/app'
import { loginAsUser } from '../helpers/auth'
import { expectAuthFailUser, expectFail, expectNotFound, expectSuccess } from '../helpers/fixtures'

const mockedAxios = vi.mocked(axios, true)

describe('frontend user API', () => {
    describe('post /api/frontend/user/insert', () => {
        it('缺少必填字段返回 -200', async () => {
            const res = await getTestAgent().post('/api/frontend/user/insert').send({ username: 'test' })
            expectFail(res)
        })
    })

    describe('post /api/frontend/user/login', () => {
        it('缺少用户名返回 -200', async () => {
            const res = await getTestAgent().post('/api/frontend/user/login').send({ password: '123' })
            expectFail(res)
        })

        it('错误凭据返回 -200', async () => {
            const res = await getTestAgent().post('/api/frontend/user/login').send({
                username: '__invalid_user__',
                password: '__invalid_password__',
            })
            expectFail(res, '用户名或者密码错误')
        })

        it('成功登录并设置 Cookie', async () => {
            const username = process.env.TEST_USER_USERNAME
            const password = process.env.TEST_USER_PASSWORD
            if (!username || !password) {
                return
            }
            const res = await getTestAgent().post('/api/frontend/user/login').send({ username, password })
            expectSuccess(res)
            expect(res.headers['set-cookie']).toBeDefined()
        })
    })

    describe('post /api/frontend/user/jscode2session', () => {
        it('缺少 js_code 返回 -200', async () => {
            const res = await getTestAgent().post('/api/frontend/user/jscode2session').send({})
            expectFail(res)
        })

        it('成功换取 session', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { openid: 'test-openid', session_key: 'test-session-key' },
            })
            const res = await getTestAgent().post('/api/frontend/user/jscode2session').send({ js_code: 'test-code' })
            expectSuccess(res)
            expect(res.body.data).toHaveProperty('openid')
        })
    })

    describe('post /api/frontend/user/wxLogin', () => {
        it('缺少必填字段返回 -200', async () => {
            const res = await getTestAgent().post('/api/frontend/user/wxLogin').send({})
            expectFail(res)
        })

        it('成功微信登录', async () => {
            const nickName = `wx_test_${Date.now()}`
            const wxSignature = `sig_${Date.now()}`
            const res = await getTestAgent().post('/api/frontend/user/wxLogin').send({
                nickName,
                wxSignature,
                avatar: 'https://example.com/avatar.png',
            })
            expectSuccess(res)
            expect(res.body.data).toHaveProperty('user')
        })
    })

    describe('post /api/frontend/user/logout', () => {
        it('成功退出登录', async () => {
            const res = await getTestAgent().post('/api/frontend/user/logout')
            expectSuccess(res)
        })
    })

    describe('get /api/frontend/user/account', () => {
        it('未登录返回 -400', async () => {
            const res = await getTestAgent().get('/api/frontend/user/account')
            expectAuthFailUser(res)
        })

        it('成功返回账号信息', async () => {
            const agent = await loginAsUser(getTestAgent())
            const res = await agent.get('/api/frontend/user/account')
            expectSuccess(res)
            expect(res.body.data).toHaveProperty('username')
        })
    })

    describe('post /api/frontend/user/account', () => {
        it('未登录返回 -400', async () => {
            const res = await getTestAgent().post('/api/frontend/user/account').send({ email: 'test@example.com' })
            expectAuthFailUser(res)
        })

        it('邮箱格式错误返回 -200', async () => {
            const agent = await loginAsUser(getTestAgent())
            const res = await agent.post('/api/frontend/user/account').send({ email: 'invalid-email' })
            expectFail(res)
        })
    })

    describe('post /api/frontend/user/password', () => {
        it('未登录返回 -400', async () => {
            const res = await getTestAgent().post('/api/frontend/user/password').send({
                old_password: '1',
                password: '2',
            })
            expectAuthFailUser(res)
        })

        it('缺少原始密码返回 -200', async () => {
            const agent = await loginAsUser(getTestAgent())
            const res = await agent.post('/api/frontend/user/password').send({ password: 'newpass' })
            expectFail(res)
        })
    })

    describe('404', () => {
        it('get /api/frontend/user-not-exist 返回未找到', async () => {
            const res = await getTestAgent().get('/api/frontend/user-not-exist')
            expectNotFound(res)
        })
    })
})
