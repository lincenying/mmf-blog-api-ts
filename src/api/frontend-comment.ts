import ArticleM from '../models/article'
import CommentM from '../models/comment'
import { getErrorMessage, getNowTime } from '../utils'
import type { Comment, Lists, Req, ReqListQuery, Res, ResData } from '@/types'

/**
 * 发布评论
 * @method
 * @param req Request
 * @param res Response
 */
export async function insert(req: Req<object, { id: string; content: string }>, res: Res) {
    let json: ResData<Comment | null>

    const userid = req.cookies.userid || req.headers.userid
    const {
        id: _id,
        content,
    } = req.body

    const creat_date = getNowTime()
    const timestamp = getNowTime('X')
    if (!_id) {
        json = { code: -200, data: null, message: '参数错误' }
    }
    else if (!content) {
        json = { code: -200, data: null, message: '请输入评论内容' }
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

    res.json(json)
}

/**
 * 前台浏览时, 读取评论列表
 * @method
 * @param req Request
 * @param res Response
 */
export async function getList(req: Req<ReqListQuery>, res: Res) {
    let json: ResData<Nullable<Lists<Comment[]>>>

    const {
        all,
        id: article_id,
    } = req.query

    let { limit, page } = req.query

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
                CommentM.find(data).sort('-_id').skip(skip).limit(limit).exec().then(data => data.map(item => item.toObject())),
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

    res.json(json)
}

/**
 * 评论删除
 * @param req Request
 * @param res Response
 */
export async function deletes(req: Req<{ id: string }>, res: Res) {
    let json: ResData<string | null>

    const {
        id: _id,
    } = req.query

    try {
        const filter = { _id }
        const commentBody = { is_delete: 0 }
        const ArticleBody = { $inc: { comment_count: -1 } }
        await Promise.all([
            CommentM.updateOne(filter, commentBody).exec(),
            ArticleM.updateOne(filter, ArticleBody).exec(),
        ])
        json = { code: 200, message: '删除成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}

/**
 * 评论恢复
 * @param req Request
 * @param res Response
 */
export async function recover(req: Req<{ id: string }>, res: Res) {
    let json: ResData<string | null>

    const {
        id: _id,
    } = req.query

    try {
        const filter = { _id }
        const commentBody = { is_delete: 0 }
        const ArticleBody = { $inc: { comment_count: 1 } }
        await Promise.all([
            CommentM.updateOne(filter, commentBody).exec(),
            ArticleM.updateOne(filter, ArticleBody).exec(),
        ])
        json = { code: 200, message: '恢复成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}
