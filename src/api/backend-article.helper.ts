import type { ClientSession } from 'mongoose'

import type { Article, ArticleInsert, ArticleModify, Lists, ResData } from '~/types'

import ArticleM from '../models/article'
import CategoryM from '../models/category'
import mongoose from '../mongoose'
import { getErrorMessage, getNowTime } from '../utils'
import { renderArticleContent } from '../utils/markdown'

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
export async function getList(reqQuery: { page: string, limit: string, sort: string, key: string }) {
    let json: ResData<Nullable<Lists<Article[]>>>

    const sort = reqQuery.sort || '-update_date'
    const page = Number(reqQuery.page) || 1
    const limit = Number(reqQuery.limit) || 15
    const skip = (page - 1) * limit
    const key = reqQuery.key || ''

    const payload: ArticleSearch = {}

    if (key) {
        const reg = new RegExp(key, 'i')
        payload.title = { $regex: reg }
    }

    try {
        const [list, total] = await Promise.all([
            ArticleM.find(payload)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean({ virtuals: true })
                .exec(),
            ArticleM.countDocuments(payload),
        ])
        const totalPage = Math.ceil(total / limit)
        json = {
            code: 200,
            data: {
                list: list as Article[],
                total,
                hasNext: totalPage > page ? 1 : 0,
                hasPrev: page > 1 ? 1 : 0,
            },
            message: 'success',
        }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    return json
}

/**
 * 获取指定 ID 的文章项
 */
export async function getItem(reqQuery: { id: string }) {
    let json: ResData<Nullable<Article>>

    const { id: _id } = reqQuery

    if (!_id) {
        json = { code: -200, data: null, message: '参数错误' }
    }
    else {
        try {
            const filter = { _id }
            const result = await ArticleM.findOne(filter)
                .lean({ virtuals: true })
                .exec()
            json = { code: 200, message: 'success', data: result as Article | null }
        }
        catch (err: unknown) {
            json = { code: -200, data: null, message: getErrorMessage(err) }
        }
    }

    return json
}

/**
 * 发布文章
 */
export async function insert(reqBody: ArticleInsert) {
    let json: ResData<Nullable<Article>>

    const { category, content, title, html } = reqBody

    if (!title?.trim()) {
        return { code: -200, data: null, message: '请填写文章标题' }
    }

    const parsedCategory = parseCategory(category)
    if (!parsedCategory) {
        return { code: -200, data: null, message: '分类参数错误' }
    }

    if (!html && !content?.trim()) {
        return { code: -200, data: null, message: '请填写文章内容' }
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

    const session = await mongoose.startSession()
    try {
        let result: Article | undefined
        await session.withTransaction(async () => {
            const [created] = await ArticleM.create([data], { session })
            result = created.toObject()
            await changeCategoryCount(parsedCategory.id, 1, session)
        })
        json = { code: 200, message: '发布成功', data: result! }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }
    finally {
        await session.endSession()
    }

    return json
}

/**
 * 软删除文章并减少分类计数
 */
export async function deletes(reqQuery: { id: string }) {
    let json: ResData<Nullable<Article>>

    const { id: _id } = reqQuery

    if (!_id) {
        return { code: -200, data: null, message: '参数错误' }
    }

    const session = await mongoose.startSession()
    try {
        let result: Article | undefined
        await session.withTransaction(async () => {
            const updated = await ArticleM.findOneAndUpdate(
                { _id },
                { is_delete: 1 },
                { new: true, session },
            ).exec()

            if (!updated) {
                throw new Error('没有找到该文章')
            }

            result = updated.toObject()
            await changeCategoryCount(updated.category, -1, session)
        })
        json = { code: 200, message: '更新成功', data: result! }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }
    finally {
        await session.endSession()
    }

    return json
}

/**
 * 恢复已删除文章并增加分类计数
 */
export async function recover(reqQuery: { id: string }) {
    let json: ResData<Nullable<Article>>

    const { id: _id } = reqQuery

    if (!_id) {
        return { code: -200, data: null, message: '参数错误' }
    }

    const session = await mongoose.startSession()
    try {
        let result: Article | undefined
        await session.withTransaction(async () => {
            const updated = await ArticleM.findOneAndUpdate(
                { _id },
                { is_delete: 0 },
                { new: true, session },
            ).exec()

            if (!updated) {
                throw new Error('没有找到该文章')
            }

            result = updated.toObject()
            await changeCategoryCount(updated.category, 1, session)
        })
        json = { code: 200, message: '更新成功', data: result! }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }
    finally {
        await session.endSession()
    }

    return json
}

/**
 * 修改文章信息
 */
export async function modify(reqBody: ArticleModify) {
    let json: ResData<Nullable<Article>>

    const { id: _id, category, category_old, content, title, html, category_name } = reqBody

    if (!_id) {
        return { code: -200, data: null, message: '参数错误' }
    }

    if (category !== category_old && !category_old) {
        return { code: -200, data: null, message: '分类参数错误' }
    }

    const { html: mdHtml, toc: mdToc } = renderArticleContent(content, html)

    const filter = { _id }
    const body = {
        title,
        category,
        category_name,
        content,
        html: mdHtml,
        toc: mdToc,
        update_date: getNowTime(),
    }

    const session = await mongoose.startSession()
    try {
        let result: Article | undefined
        await session.withTransaction(async () => {
            const updated = await ArticleM.findOneAndUpdate(filter, body, { new: true, session }).exec()

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
        json = { code: 200, message: '更新成功', data: result! }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }
    finally {
        await session.endSession()
    }

    return json
}
