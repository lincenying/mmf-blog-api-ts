import type { ResData } from '~/types'

import ArticleM from '../models/article'
import { getErrorMessage } from '../utils'

/**
 * 文章点赞
 */
export async function like(reqQuery: { id: string }, user_id: string) {
    let json: ResData<string | null>

    const {
        id: article_id,
    } = reqQuery

    try {
        const filter = {
            _id: article_id,
            is_delete: 0,
        }
        const result = await ArticleM.findOne(filter).exec().then(data => data?.toObject())
        if (result && (!result.likes || result.likes.findIndex(item => item === user_id) === -1)) {
            const search = {
                _id: article_id,
            }
            const body = {
                $inc: {
                    like: 1,
                },
                $push: {
                    likes: user_id,
                },
            }
            await ArticleM.updateOne(search, body).exec()
        }
        json = { code: 200, message: '操作成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    return json
}

/**
 * 取消文章点赞
 */
export async function unlike(reqQuery: { id: string }, user_id: string) {
    let json: ResData<string | null>

    const {
        id: article_id,
    } = reqQuery

    try {
        const filter = {
            _id: article_id,
        }
        const body = {
            $inc: {
                like: -1,
            },
            $pullAll: {
                likes: [user_id],
            },
        }
        await ArticleM.updateOne(filter, body).exec()
        json = { code: 200, message: '操作成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    return json
}

/**
 * 重置文章点赞数量
 */
export async function resetLike() {
    let json: ResData<string | null>

    try {
        const result = await ArticleM.find().exec()
        const length = result.length
        for (let i = 0; i < length; i++) {
            const item = result[i]
            const filter = { _id: item._id }
            const body = { like: item.likes?.length }
            await ArticleM.findOneAndUpdate(filter, body, { new: true }).exec()
        }
        json = { code: 200, message: '操作成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    return json
}
