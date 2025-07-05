import type { Comment, Lists, ReqListQuery, ResData } from '~/types'

import ArticleM from '../models/article'
import CommentM from '../models/comment'
import { getErrorMessage, getNowTime } from '../utils'

/**
 * 发布评论
 */
export async function insert(reqBody: { id: string, content: string }, userid: string) {
    let json: ResData<Comment | null>

    const { id: _id, content } = reqBody

    const creat_date = getNowTime()
    const timestamp = getNowTime('X')
    if (!_id) {
        json = { code: -200, data: null, message: '参数错误' }
    }
    else if (!content) {
        json = { code: -200, data: null, message: '请输入评论内容' }
    }
    else if (!userid) {
        json = { code: -200, data: null, message: '请先登录' }
    }
    else {
        const data: Comment = {
            article_id: _id,
            userid,
            content,
            creat_date,
            is_delete: 0,
            timestamp,
        }
        try {
            const result = await CommentM.create(data).then(data => data.toObject())
            const filter = { _id }
            const body = {
                $inc: {
                    comment_count: 1,
                },
            }
            await ArticleM.updateOne(filter, body).exec()
            json = { code: 200, data: result, message: '发布成功' }
        }
        catch (err: unknown) {
            json = { code: -200, data: null, message: getErrorMessage(err) }
        }
    }

    return json
}

/**
 * 前台浏览时, 读取评论列表
 */
export async function getList(reqQuery: ReqListQuery) {
    let json: ResData<Nullable<Lists<Comment[]>>>

    const { all, id: article_id } = reqQuery

    let { limit, page } = reqQuery

    if (!article_id) {
        json = { code: -200, data: null, message: '参数错误' }
    }
    else {
        page = Number(page) || 1
        limit = Number(limit) || 10

        const data: {
            article_id: string
            is_delete?: number
        } = {
            article_id,
        }
        const skip = (page - 1) * limit
        if (!all) {
            data.is_delete = 0
        }

        try {
            const [list, total] = await Promise.all([
                CommentM.find(data)
                    .sort('-_id')
                    .skip(skip)
                    .limit(limit)
                    .exec()
                    .then(data => data.map(item => item.toObject())),
                CommentM.countDocuments(data),
            ])
            const totalPage = Math.ceil(total / limit)
            json = {
                code: 200,
                data: {
                    list,
                    total,
                    hasNext: totalPage > page ? 1 : 0,
                    hasPrev: page > 1 ? 1 : 0,
                },
            }
        }
        catch (err: unknown) {
            json = { code: -200, data: null, message: getErrorMessage(err) }
        }
    }

    return json
}

/**
 * 评论删除
 */
export async function deletes(reqQuery: { id: string }) {
    let json: ResData<string | null>

    const { id: _id } = reqQuery

    try {
        const filter = { _id }
        const commentBody = { is_delete: 0 }
        const ArticleBody = { $inc: { comment_count: -1 } }
        await Promise.all([CommentM.updateOne(filter, commentBody).exec(), ArticleM.updateOne(filter, ArticleBody).exec()])
        json = { code: 200, message: '删除成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    return json
}

/**
 * 评论恢复
 */
export async function recover(reqQuery: { id: string }) {
    let json: ResData<string | null>

    const { id: _id } = reqQuery

    try {
        const filter = { _id }
        const commentBody = { is_delete: 0 }
        const ArticleBody = { $inc: { comment_count: 1 } }
        await Promise.all([CommentM.updateOne(filter, commentBody).exec(), ArticleM.updateOne(filter, ArticleBody).exec()])
        json = { code: 200, message: '恢复成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    return json
}
