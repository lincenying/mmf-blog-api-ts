import type { Article, ReqListQuery, TrendingData } from '~/types'

import ArticleM from '../../models/article'
import { getErrorMessage } from '../../utils'
import { replaceHtmlTag } from '../../utils/html'
import { fail, paginate, success } from '../../utils/response'

interface ArticleSearch {
    is_delete: number
    category?: string
    title?: {
        $regex: RegExp
    }
}

const LIST_FIELDS = 'title content category category_name visit like likes comment_count creat_date update_date is_delete timestamp'
const TRENDING_FIELDS = 'title visit like comment_count'

function removeFields(fields: string, filter: string) {
    const fieldsArray = fields.split(' ')
    const filterArray = filter.split(',')
    return fieldsArray.filter(field => !filterArray.includes(field)).join(' ')
}

function mapListItem(item: Article, user_id: string): Article {
    return {
        ...item,
        like_status: Boolean(user_id && item.likes?.includes(user_id)),
        content: `${replaceHtmlTag(item.content).substring(0, 500)}...`,
        likes: [],
    }
}

/**
 * 前台获取文章列表
 */
export async function getList(reqQuery: ReqListQuery, user_id: string) {
    const { by, id, key, filter } = reqQuery
    const page = Number(reqQuery.page) || 1
    const limit = Number(reqQuery.limit) || 10
    const skip = (page - 1) * limit

    const payload: ArticleSearch = { is_delete: 0 }
    if (id) {
        payload.category = id
    }
    if (key) {
        payload.title = { $regex: new RegExp(key, 'i') }
    }

    let sort = '-update_date'
    if (by) {
        sort = `-${by}`
    }

    let fields = LIST_FIELDS
    if (filter) {
        fields = removeFields(LIST_FIELDS, filter)
    }

    try {
        const [list, total] = await Promise.all([
            ArticleM.find(payload, fields)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean({ virtuals: true })
                .exec(),
            ArticleM.countDocuments(payload),
        ])

        const mapped = (list as Article[]).map(item => mapListItem(item, user_id))
        return paginate(mapped, total, page, limit)
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 前台获取单篇文章
 */
export async function getItem(reqQuery: { id: string }, user_id: Nullable<string>) {
    const { id: _id } = reqQuery

    if (!_id) {
        return fail('参数错误')
    }

    try {
        const filter = { _id, is_delete: 0 }
        const [result] = await Promise.all([
            ArticleM.findOne(filter).lean({ virtuals: true }).exec(),
            ArticleM.updateOne(filter, { $inc: { visit: 1 } }).exec(),
        ])

        if (!result) {
            return fail('没有找到该文章')
        }

        const article = result as Article
        article.like_status = Boolean(user_id && article.likes?.includes(user_id))
        article.likes = []
        article.content = replaceHtmlTag(article.content)
        article.html = replaceHtmlTag(article.html)

        return success(article)
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 前台获取热门文章
 */
export async function getTrending(reqQuery: { id?: string }) {
    const id = reqQuery.id

    try {
        const filter: { _id?: string, is_delete: number } = { is_delete: 0 }
        if (id) {
            filter._id = id
        }

        const categoryDoc = await ArticleM.findOne(filter, 'category').lean().exec()
        const category = categoryDoc?.category

        const data: TrendingData = { is_delete: 0 }
        if (category) {
            data.category = category
        }

        const list = await ArticleM.find(data, TRENDING_FIELDS)
            .sort('-visit')
            .limit(5)
            .lean({ virtuals: true })
            .exec()

        return success({ list: list as Article[] })
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}
