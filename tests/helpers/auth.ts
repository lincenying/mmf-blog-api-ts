import type { TestAgent } from './app'
import process from 'node:process'
import jwt from 'jsonwebtoken'

import { secretClient, secretServer } from '../../src/config'
import { getSampleAdmin, getSampleUser } from './db'

interface AuthUser {
    id: string
    username: string
    email?: string
}

export function signAdminToken(admin: AuthUser) {
    return jwt.sign(
        { id: admin.id, username: encodeURI(admin.username) },
        secretServer,
        { expiresIn: 60 * 60 * 24 * 30 },
    )
}

export function signUserToken(user: AuthUser) {
    return jwt.sign(
        { id: user.id, username: encodeURI(user.username) },
        secretClient,
        { expiresIn: 60 * 60 * 24 * 30 },
    )
}

export function withAdminAuth(agent: TestAgent, admin: AuthUser) {
    const token = signAdminToken(admin)
    agent.set('Cookie', [
        `b_user=${token}`,
        `b_userid=${admin.id}`,
        `b_username=${encodeURI(admin.username)}`,
    ].join('; '))
    return agent
}

export function withUserAuth(agent: TestAgent, user: AuthUser) {
    const token = signUserToken(user)
    const cookies = [
        `user=${token}`,
        `userid=${user.id}`,
        `username=${encodeURI(user.username)}`,
    ]
    if (user.email) {
        cookies.push(`useremail=${encodeURI(user.email)}`)
    }
    agent.set('Cookie', cookies.join('; '))
    return agent
}

export async function loginAsAdmin(agent: TestAgent) {
    const username = process.env.TEST_ADMIN_USERNAME
    const password = process.env.TEST_ADMIN_PASSWORD

    if (username && password) {
        const res = await agent.post('/api/backend/admin/login').send({ username, password })
        expect(res.body.code).toBe(200)
        return agent
    }

    const admin = await getSampleAdmin()
    return withAdminAuth(agent, { id: admin.id, username: admin.username! })
}

export async function loginAsUser(agent: TestAgent) {
    const username = process.env.TEST_USER_USERNAME
    const password = process.env.TEST_USER_PASSWORD

    if (username && password) {
        const res = await agent.post('/api/frontend/user/login').send({ username, password })
        expect(res.body.code).toBe(200)
        return agent
    }

    const user = await getSampleUser()
    return withUserAuth(agent, {
        id: user.id,
        username: user.username!,
        email: user.email,
    })
}
