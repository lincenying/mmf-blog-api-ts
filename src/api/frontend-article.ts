import ArticleM from '../models/article'
import type { Article, ListConfig, Req, ReqQuery, Res } from '@/types'

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
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function getList(req: Req<{}, ReqQuery>, res: Res) {
    const user_id = req.cookies.userid || req.headers.userid
    const { by, id, key } = req.query
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
        const result = await Promise.all([
            ArticleM.find<Article>(payload, filds).sort(sort).skip(skip).limit(limit).exec(),
            ArticleM.countDocuments(payload),
        ])
        let data = result[0]
        const total = result[1]
        const totalPage = Math.ceil(total / limit)
        const json: ListConfig<Article[]> = {
            code: 200,
            data: {
                list: [],
                total,
                hasNext: totalPage > page ? 1 : 0,
                hasPrev: page > 1,
            },
        }
        if (user_id) {
            data = data.map((item) => {
                item._doc.like_status = item.likes && item.likes.includes(user_id)
                item.content = `${replaceHtmlTag(item.content).substring(0, 500)}...`
                item.likes = []
                return item
            })
            json.data.list = data
            res.json(json)
        }
        else {
            data = data.map((item) => {
                item._doc.like_status = false
                item.content = `${replaceHtmlTag(item.content).substring(0, 500)}...`
                item.likes = []
                return item
            })
            json.data.list = data
            res.json(json)
        }
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 前台浏览时, 获取单篇文章
 * @method
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function getItem(req: Req<{}, { id: string }>, res: Res) {
    const _id = req.query.id
    const user_id = req.cookies.userid || req.headers.userid
    if (!_id)
        res.json({ code: -200, message: '参数错误' })

    try {
        const xhr = await Promise.all([
            ArticleM.findOne<Article>({ _id, is_delete: 0 }),
            ArticleM.updateOne<Article>({ _id }, { $inc: { visit: 1 } }),
        ])
        const result = xhr[0]
        let json
        if (!result) {
            json = {
                code: -200,
                message: '没有找到该文章',
            }
        }
        else {
            if (user_id)
                result._doc.like_status = result.likes && result.likes.includes(user_id)
            else result._doc.like_status = false
            result.likes = []
            result.content = replaceHtmlTag(result.content)
            result.html = replaceHtmlTag(result.html)
            json = {
                code: 200,
                data: result,
            }
        }
        res.json(json)
    }
    catch (err: any) {
        res.json({
            code: -200,
            message: err.toString(),
        })
    }
}

/**
 * 前台浏览时, 获取文章推荐列表
 * @method
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function getTrending(req: Req, res: Res) {
    const limit = 5
    const data = { is_delete: 0 }
    const filds = 'title visit like comment_count'
    try {
        const result = await ArticleM.find<Article>(data, filds).sort('-visit').limit(limit).exec()
        res.json({
            code: 200,
            data: {
                list: result,
            },
        })
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}
