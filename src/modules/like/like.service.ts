import ArticleM from '../../models/article'
import { getErrorMessage } from '../../utils'
import { fail, success } from '../../utils/response'

/**
 * 文章点赞
 */
export async function like(reqQuery: { id: string }, user_id: string) {
    const { id: article_id } = reqQuery

    try {
        const result = await ArticleM.findOne({ _id: article_id, is_delete: 0 })
            .lean()
            .exec()

        if (result && (!result.likes || !result.likes.includes(user_id))) {
            await ArticleM.updateOne(
                { _id: article_id },
                {
                    $inc: { like: 1 },
                    $push: { likes: user_id },
                },
            ).exec()
        }

        return success('success', '操作成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 取消文章点赞
 */
export async function unlike(reqQuery: { id: string }, user_id: string) {
    const { id: article_id } = reqQuery

    try {
        const result = await ArticleM.findOne({ _id: article_id, is_delete: 0 })
            .lean()
            .exec()

        if (result?.likes?.includes(user_id)) {
            await ArticleM.updateOne(
                { _id: article_id },
                {
                    $inc: { like: -1 },
                    $pullAll: { likes: [user_id] },
                },
            ).exec()
        }

        return success('success', '操作成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 重置文章点赞数量
 */
export async function resetLike() {
    try {
        const articles = await ArticleM.find({}, 'likes').lean().exec()

        await Promise.all(
            articles.map(item => ArticleM.updateOne(
                { _id: item._id },
                { like: item.likes?.length || 0 },
            ).exec()),
        )

        return success('success', '操作成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}
