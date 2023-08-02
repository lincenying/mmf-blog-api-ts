import ArticleM from '../models/article'
import { getErrorMessage } from '@/utils'
import type { Req, Res } from '@/types'

/**
 * 文章点赞
 * @param {Request} req Request
 * @param {Response} res Response
 */
export async function like(req: Req<{ id: string }>, res: Res) {
    const article_id = req.query.id
    const user_id = req.cookies.userid || req.headers.userid
    try {
        const result = await ArticleM.findOne({ _id: article_id, is_delete: 0 }).exec().then(data => data?.toObject())
        if (result && (!result.likes || result.likes.findIndex(item => item === user_id) === -1))
            await ArticleM.updateOne({ _id: article_id }, { $inc: { like: 1 }, $push: { likes: user_id } }).exec()

        res.json({ code: 200, message: '操作成功', data: 'success' })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 取消文章点赞
 * @param {Request} req Request
 * @param {Response} res Response
 */
export async function unlike(req: Req<{ id: string }>, res: Res) {
    const article_id = req.query.id
    const user_id = req.cookies.userid || req.headers.userid
    try {
        await ArticleM.updateOne({ _id: article_id }, { $inc: { like: -1 }, $pullAll: { likes: [user_id] } }).exec()
        res.json({ code: 200, message: '操作成功', data: 'success' })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 重置文章点赞数量
 * @param {Request} req Request
 * @param {Response} res Response
 */
export async function resetLike(req: Req, res: Res) {
    try {
        const result = await ArticleM.find().exec()
        const length = result.length
        for (let i = 0; i < length; i++) {
            const item = result[i]
            await ArticleM.findOneAndUpdate({ _id: item._id }, { like: item.likes?.length }, { new: true }).exec()
        }
        res.json({ code: 200, message: '操作成功', data: 'success' })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}
