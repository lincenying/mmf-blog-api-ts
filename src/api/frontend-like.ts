import ArticleM from '../models/article'
import type { Req, Res, ResData } from '../types'
import { getErrorMessage } from '../utils'

/**
 * 文章点赞
 * @param req Request
 * @param res Response
 */
export async function like(req: Req<{ id: string }>, res: Res) {
    let json: ResData<string | null>
    const reqQuery = req.query

    const {
        id: article_id,
    } = reqQuery

    const user_id = (req.cookies.userid || req.headers.userid) as string
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

    res.json(json)
}

/**
 * 取消文章点赞
 * @param req Request
 * @param res Response
 */
export async function unlike(req: Req<{ id: string }>, res: Res) {
    let json: ResData<string | null>
    const reqQuery = req.query

    const {
        id: article_id,
    } = reqQuery

    const user_id = (req.cookies.userid || req.headers.userid) as string
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

    res.json(json)
}

/**
 * 重置文章点赞数量
 * @param req Request
 * @param res Response
 */
export async function resetLike(req: Req, res: Res) {
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

    res.json(json)
}
