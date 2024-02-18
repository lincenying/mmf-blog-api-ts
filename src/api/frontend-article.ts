import ArticleM from '../models/article'
import { getErrorMessage } from '../utils'
import type { Article, Lists, Req, ReqListQuery, Res, ResData } from '@/types'

function replaceHtmlTag(html: string) {
    return html
        .replace(/<script(.*?)>/gi, '＜script$1＞')
        .replace(/<\/script>/g, '＜/script＞')
        .replace(/\$'/g, '$ \'')
        .replace(/\$`/g, '$ `')
}

interface ArticleSearch {
    is_delete: number
    category?: string
    title?: {
        $regex: RegExp
    }
}

/**
 * 前台浏览时, 获取文章列表
 * @method
 * @param req Request
 * @param res Response
 */
export async function getList(req: Req<ReqListQuery>, res: Res) {
    let json: ResData<Nullable<Lists<Article[]>>>

    const user_id = req.cookies.userid || req.headers.userid
    const {
        by,
        id,
        key,
    } = req.query

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10

    const payload: ArticleSearch = {
        is_delete: 0,
    }
    const skip = (page - 1) * limit
    if (id)
        payload.category = id

    if (key) {
        const reg = new RegExp(key, 'i')
        payload.title = { $regex: reg }
    }
    let sort = '-update_date'
    if (by)
        sort = `-${by}`

    const filds = 'title content category category_name visit like likes comment_count creat_date update_date is_delete timestamp'

    try {
        const [list, total] = await Promise.all([
            ArticleM.find(payload, filds).sort(sort).skip(skip).limit(limit).exec().then(data => data.map(item => item.toObject())),
            ArticleM.countDocuments(payload),
        ])
        const totalPage = Math.ceil(total / limit)
        json = {
            code: 200,
            data: {
                list: [],
                total,
                hasNext: totalPage > page ? 1 : 0,
                hasPrev: page > 1 ? 1 : 0,
            },
            message: 'success',
        }
        if (user_id) {
            json.data!.list = list.map((item): Article => ({
                ...item,
                like_status: item.likes && item.likes.includes(user_id),
                content: `${replaceHtmlTag(item.content).substring(0, 500)}...`,
                likes: [],
            }))
        }
        else {
            json.data!.list = list.map((item): Article => ({
                ...item,
                like_status: false,
                content: `${replaceHtmlTag(item.content).substring(0, 500)}...`,
                likes: [],
            }))
        }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}

/**
 * 前台浏览时, 获取单篇文章
 * @method
 * @param req Request
 * @param res Response
 */
export async function getItem(req: Req<{ id: string }>, res: Res) {
    let json: ResData<Nullable<Article>>

    const {
        id: _id,
    } = req.query

    const user_id = req.cookies.userid || req.headers.userid
    if (!_id)
        json = { code: -200, data: null, message: '参数错误' }

    try {
        const filter = { _id, is_delete: 0 }
        const body = { $inc: { visit: 1 } }
        const [result, _] = await Promise.all([
            ArticleM.findOne(filter).exec().then(data => data?.toObject()),
            ArticleM.updateOne(filter, body).exec(),
        ])
        if (!result) {
            json = {
                code: -200,
                data: null,
                message: '没有找到该文章',
            }
        }
        else {
            if (user_id)
                result.like_status = result.likes && result.likes.includes(user_id)
            else
                result.like_status = false
            result.likes = []
            result.content = replaceHtmlTag(result.content)
            result.html = replaceHtmlTag(result.html)
            json = {
                code: 200,
                data: result,
                message: 'success',
            }
        }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}

/**
 * 前台浏览时, 获取文章推荐列表
 * @method
 * @param req Request
 * @param res Response
 */
export async function getTrending(req: Req, res: Res) {
    let json: ResData<Nullable<{ list: Article[] }>>

    const limit = 5
    const data = { is_delete: 0 }
    const filds = 'title visit like comment_count'
    try {
        const result = await ArticleM.find(data, filds).sort('-visit').limit(limit).exec().then(data => data.map(item => item.toObject()))
        json = {
            code: 200,
            data: {
                list: result,
            },
            message: 'success',
        }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}
