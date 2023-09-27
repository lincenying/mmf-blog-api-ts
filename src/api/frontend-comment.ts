import moment from 'moment'

import ArticleM from '../models/article'
import CommentM from '../models/comment'
import type { Comment, Req, ReqListQuery, Res, ResLists } from '@/types'
import { getErrorMessage } from '@/utils'

/**
 * 发布评论
 * @method
 * @param req Request
 * @param res Response
 */
export async function insert(req: Req<object, { id: string; content: string }>, res: Res) {
    const userid = req.cookies.userid || req.headers.userid
    const { id, content } = req.body
    const creat_date = moment().format('YYYY-MM-DD HH:mm:ss')
    const timestamp = moment().format('X')
    if (!id) {
        res.json({ code: -200, message: '参数错误' })
        return
    }
    else if (!content) {
        res.json({ code: -200, message: '请输入评论内容' })
        return
    }
    const data: Comment = {
        article_id: id,
        userid,
        content,
        creat_date,
        is_delete: 0,
        timestamp,
    }
    try {
        const result = await CommentM.create(data).then(data => data.toObject())
        await ArticleM.updateOne(
            { _id: id },
            {
                $inc: {
                    comment_count: 1,
                },
            },
        ).exec()
        res.json({ code: 200, data: result, message: '发布成功' })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 前台浏览时, 读取评论列表
 * @method
 * @param req Request
 * @param res Response
 */
export async function getList(req: Req<ReqListQuery>, res: Res) {
    const { all, id } = req.query
    let { limit, page } = req.query
    if (!id) {
        res.json({ code: -200, message: '参数错误' })
    }
    else {
        page = Number(page) || 1
        limit = Number(limit) || 10

        const data: {
            article_id: string
            is_delete?: number
        } = {
            article_id: id,
        }
        const skip = (page - 1) * limit
        if (!all)
            data.is_delete = 0

        try {
            const [list, total] = await Promise.all([
                CommentM.find(data).sort('-_id').skip(skip).limit(limit).exec().then(data => data.map(item => item.toObject())),
                CommentM.countDocuments(data),
            ])
            const totalPage = Math.ceil(total / limit)
            const json: ResLists<Comment[]> = {
                code: 200,
                data: {
                    list,
                    total,
                    hasNext: totalPage > page ? 1 : 0,
                    hasPrev: page > 1 ? 1 : 0,
                },
            }
            res.json(json)
        }
        catch (err: unknown) {
            res.json({ code: -200, data: null, message: getErrorMessage(err) })
        }
    }
}

/**
 * 评论删除
 * @param req Request
 * @param res Response
 */
export async function deletes(req: Req<{ id: string }>, res: Res) {
    const _id = req.query.id
    try {
        await Promise.all([
            CommentM.updateOne({ _id }, { is_delete: 1 }).exec(),
            ArticleM.updateOne({ _id }, { $inc: { comment_count: -1 } }).exec(),
        ])
        res.json({ code: 200, message: '删除成功', data: 'success' })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 评论恢复
 * @param req Request
 * @param res Response
 */
export async function recover(req: Req<{ id: string }>, res: Res) {
    const _id = req.query.id
    try {
        await Promise.all([
            CommentM.updateOne({ _id }, { is_delete: 0 }).exec(),
            ArticleM.updateOne({ _id }, { $inc: { comment_count: 1 } }).exec(),
        ])
        res.json({ code: 200, message: '恢复成功', data: 'success' })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}
