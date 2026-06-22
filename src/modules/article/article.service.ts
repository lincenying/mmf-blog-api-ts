import type { ClientSession } from 'mongoose'

import type { Article, ArticleInsert, ArticleModify } from '~/types'

import ArticleM from '../../models/article'
import CategoryM from '../../models/category'
import { getErrorMessage, getNowTime } from '../../utils'
import { renderArticleContent } from '../../utils/markdown'
import { fail, paginate, success } from '../../utils/response'
import { runTransaction, withSession } from '../../utils/transaction'

/** 后台列表返回字段（排除大体积正文） */
const ARTICLE_LIST_FIELDS = 'title category category_name visit like comment_count creat_date update_date is_delete timestamp'

type ArticleListItem = Omit<Article, 'content' | 'html' | 'toc'>

interface ArticleSearch {
    title?: {
        $regex: RegExp
    }
}

/**
 * 解析分类参数（格式：id|name）
 */
function parseCategory(category: string): { id: string, name: string } | null {
    const parts = category.split('|')
    if (parts.length < 2 || !parts[0] || !parts[1]) {
        return null
    }
    return { id: parts[0], name: parts[1] }
}

/**
 * 更新分类文章计数
 */
async function changeCategoryCount(categoryId: string, delta: 1 | -1, session?: ClientSession) {
    await CategoryM.updateOne(
        { _id: categoryId },
        { $inc: { cate_num: delta } },
        { session },
    ).exec()
}

/**
 * 获取文章列表
 */
export async function getList(reqQuery: { page?: string | number, limit?: string | number, sort?: string, key?: string }) {
    const sort = reqQuery.sort || '-update_date'
    const page = Number(reqQuery.page) || 1
    const limit = Number(reqQuery.limit) || 15
    const skip = (page - 1) * limit
    const key = reqQuery.key || ''

    const payload: ArticleSearch = {}

    if (key) {
        payload.title = { $regex: new RegExp(key, 'i') }
    }

    try {
        const [list, total] = await Promise.all([
            ArticleM.find(payload, ARTICLE_LIST_FIELDS)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean({ virtuals: true })
                .exec(),
            ArticleM.countDocuments(payload),
        ])
        return paginate(list as ArticleListItem[], total, page, limit)
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 获取指定 ID 的文章项
 */
export async function getItem(reqQuery: { id: string }) {
    const { id: _id } = reqQuery

    try {
        const result = await ArticleM.findOne({ _id })
            .lean({ virtuals: true })
            .exec()
        return success(result as Article | null)
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 发布文章
 */
export async function insert(reqBody: ArticleInsert) {
    const { category, content, title, html } = reqBody

    const parsedCategory = parseCategory(category)
    if (!parsedCategory) {
        return fail('分类参数错误')
    }

    const { html: mdHtml, toc: mdToc } = renderArticleContent(content, html)

    const data: Optional<Article, 'id' | '_doc'> = {
        title,
        category: parsedCategory.id,
        category_name: parsedCategory.name,
        content,
        html: mdHtml,
        toc: mdToc,
        visit: 0,
        like: 0,
        comment_count: 0,
        creat_date: getNowTime(),
        update_date: getNowTime(),
        is_delete: 0,
        timestamp: getNowTime('X'),
    }

    try {
        let result!: Article
        await runTransaction(async (session) => {
            const [created] = await ArticleM.create([data], { session })
            result = created.toObject()
            await changeCategoryCount(parsedCategory.id, 1, session)
        })
        return success(result, '发布成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 软删除文章并减少分类计数
 */
export async function deletes(reqQuery: { id: string }) {
    const { id: _id } = reqQuery

    try {
        let result!: Article
        await runTransaction(async (session) => {
            const updated = await ArticleM.findOneAndUpdate(
                { _id, is_delete: 0 },
                { is_delete: 1 },
                { new: true, session },
            ).exec()

            if (updated) {
                result = updated.toObject()
                await changeCategoryCount(updated.category, -1, session)
                return
            }

            const existing = await withSession(ArticleM.findById(_id), session).exec()
            if (!existing) {
                throw new Error('没有找到该文章')
            }
            result = existing.toObject()
        })
        return success(result, '更新成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 恢复已删除文章并增加分类计数
 */
export async function recover(reqQuery: { id: string }) {
    const { id: _id } = reqQuery

    try {
        let result!: Article
        await runTransaction(async (session) => {
            const updated = await ArticleM.findOneAndUpdate(
                { _id, is_delete: 1 },
                { is_delete: 0 },
                { new: true, session },
            ).exec()

            if (updated) {
                result = updated.toObject()
                await changeCategoryCount(updated.category, 1, session)
                return
            }

            const existing = await withSession(ArticleM.findById(_id), session).exec()
            if (!existing) {
                throw new Error('没有找到该文章')
            }
            result = existing.toObject()
        })
        return success(result, '更新成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 修改文章信息
 */
export async function modify(reqBody: ArticleModify) {
    const { id: _id, category, category_old, content, title, html, category_name } = reqBody

    const { html: mdHtml, toc: mdToc } = renderArticleContent(content, html)

    const body = {
        title,
        category,
        category_name,
        content,
        html: mdHtml,
        toc: mdToc,
        update_date: getNowTime(),
    }

    try {
        let result!: Article
        await runTransaction(async (session) => {
            const updated = await ArticleM.findOneAndUpdate({ _id }, body, { new: true, session }).exec()

            if (!updated) {
                throw new Error('没有找到该文章')
            }

            result = updated.toObject()

            if (category !== category_old) {
                await Promise.all([
                    changeCategoryCount(category, 1, session),
                    changeCategoryCount(category_old, -1, session),
                ])
            }
        })
        return success(result, '更新成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}
