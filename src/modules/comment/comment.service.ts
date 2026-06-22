import type { Comment, ReqListQuery } from '~/types'

import ArticleM from '../../models/article'
import CommentM from '../../models/comment'
import { getErrorMessage, getNowTime } from '../../utils'
import { fail, paginate, success } from '../../utils/response'
import { runTransaction, withSession } from '../../utils/transaction'

/**
 * 发布评论
 */
export async function insert(reqBody: { id: string, content: string }, userid: string) {
    const { id: articleId, content } = reqBody

    if (!userid) {
        return fail('请先登录')
    }

    const data: Comment = {
        article_id: articleId,
        userid,
        content,
        creat_date: getNowTime(),
        is_delete: 0,
        timestamp: getNowTime('X'),
    }

    try {
        let result!: Comment
        await runTransaction(async (session) => {
            const article = await withSession(ArticleM.findOne({ _id: articleId, is_delete: 0 }), session).lean().exec()
            if (!article) {
                throw new Error('没有找到该文章')
            }

            const created = await CommentM.create([data], { session })
            result = created[0].toObject()
            await ArticleM.updateOne(
                { _id: articleId },
                { $inc: { comment_count: 1 } },
                { session },
            ).exec()
        })
        return success(result, '发布成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 获取评论列表
 */
export async function getList(reqQuery: ReqListQuery) {
    const { all, id: article_id } = reqQuery

    const page = Number(reqQuery.page) || 1
    const limit = Number(reqQuery.limit) || 10
    const skip = (page - 1) * limit

    const data: { article_id: string, is_delete?: number } = { article_id: article_id! }
    if (!all) {
        data.is_delete = 0
    }

    try {
        const [list, total] = await Promise.all([
            CommentM.find(data)
                .sort('-_id')
                .skip(skip)
                .limit(limit)
                .lean({ virtuals: true })
                .exec(),
            CommentM.countDocuments(data),
        ])
        return paginate(list as Comment[], total, page, limit)
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 软删除评论
 */
export async function deletes(reqQuery: { id: string }) {
    const { id: _id } = reqQuery

    try {
        await runTransaction(async (session) => {
            const updated = await CommentM.findOneAndUpdate(
                { _id, is_delete: 0 },
                { is_delete: 1 },
                { new: true, session },
            ).exec()

            if (updated) {
                await ArticleM.updateOne(
                    { _id: updated.article_id },
                    { $inc: { comment_count: -1 } },
                    { session },
                ).exec()
                return
            }

            const existing = await withSession(CommentM.findById(_id), session).lean().exec()
            if (!existing) {
                throw new Error('没有找到该评论')
            }
        })
        return success('success', '删除成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 恢复评论
 */
export async function recover(reqQuery: { id: string }) {
    const { id: _id } = reqQuery

    try {
        await runTransaction(async (session) => {
            const updated = await CommentM.findOneAndUpdate(
                { _id, is_delete: 1 },
                { is_delete: 0 },
                { new: true, session },
            ).exec()

            if (updated) {
                await ArticleM.updateOne(
                    { _id: updated.article_id },
                    { $inc: { comment_count: 1 } },
                    { session },
                ).exec()
                return
            }

            const existing = await withSession(CommentM.findById(_id), session).lean().exec()
            if (!existing) {
                throw new Error('没有找到该评论')
            }
        })
        return success('success', '恢复成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}
