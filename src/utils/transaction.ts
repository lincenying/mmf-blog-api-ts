import type { ClientSession, Query } from 'mongoose'
import mongoose from '../mongoose'

function isTransactionUnsupported(err: unknown) {
    if (!(err instanceof Error)) {
        return false
    }
    const message = err.message.toLowerCase()
    return message.includes('replica set') || (message.includes('transaction') && message.includes('not supported'))
}

/**
 * 可选绑定 Mongoose session
 */
export function withSession<T, D>(query: Query<T, D>, session?: ClientSession) {
    return session ? query.session(session) : query
}

/**
 * 执行 Mongoose 事务；单机 MongoDB 不支持事务时自动降级为无 session 执行
 */
export async function runTransaction<T>(handler: (session?: ClientSession) => Promise<T>): Promise<T> {
    const session = await mongoose.startSession()

    try {
        try {
            let result!: T
            await session.withTransaction(async () => {
                result = await handler(session)
            })
            return result
        }
        catch (err) {
            if (isTransactionUnsupported(err)) {
                return await handler(undefined)
            }
            throw err
        }
    }
    finally {
        await session.endSession()
    }
}
