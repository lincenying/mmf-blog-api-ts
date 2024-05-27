import markdownIt from 'markdown-it'
import hljs from 'highlight.js'

import ArticleM from '../models/article'
import CategoryM from '../models/category'
import { getErrorMessage, getNowTime } from '../utils'
import type { Article, ArticleInsert, ArticleModify, Lists, ResData } from '@/types'

/**
 * 将 Markdown 格式的内容转换成 HTML 格式，并生成目录（TOC）。
 * @param content Markdown格式的字符串。
 * @returns 返回一个对象，包含生成的 HTML 和 TOC。
 */
function marked(content: string) {
    // 初始化返回对象，包含 html 和 toc 两个属性
    const $return = {
        html: '',
        toc: '',
    }

    // 使用 markdownIt 库将 Markdown 内容渲染为 HTML
    const html = markdownIt({
        breaks: true, // 启用换行符转换
        html: true, // 允许 HTML 标签
        linkify: true, // 自动转换 URL 为链接
        typographer: true, // 启用更美观的排版
        highlight(str, lang) {
            // 高亮代码块
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, str).value
                }
                catch (error) {} // 捕获并忽略高亮过程中的错误
            }
            return ''
        },
    }).render(content)

    // 将渲染后的 HTML 存储到返回对象中
    $return.html = html

    // 返回包含 HTML 和 TOC 的对象
    return $return
}

/**
 * 获取文章列表的异步函数。
 */
export async function getList(reqQuery: { page: string; limit: string; sort: string }) {
    let json: ResData<Nullable<Lists<Article[]>>>

    // 处理查询参数，设定默认值
    const sort = reqQuery.sort || '-update_date'
    const page = Number(reqQuery.page) || 1
    const limit = Number(reqQuery.limit) || 15
    const skip = (page - 1) * limit

    try {
        // 同时查询文章列表和总数，计算总页数
        const [list, total] = await Promise.all([
            ArticleM.find().sort(sort).skip(skip).limit(limit).exec().then(data => data.map(item => item.toObject())),
            ArticleM.countDocuments(),
        ])
        const totalPage = Math.ceil(total / limit)
        // 构建响应数据对象
        json = {
            code: 200,
            data: {
                list,
                total,
                hasNext: totalPage > page ? 1 : 0,
                hasPrev: page > 1 ? 1 : 0,
            },
            message: 'success',
        }
    }
    catch (err: unknown) {
        // 捕获异常，返回错误信息
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    return json
}

/**
 * 获取指定ID的文章项。
 */
export async function getItem(reqQuery: { id: string }) {
    let json: ResData<Nullable<Article>>

    // 从请求中提取文章ID
    const {
        id: _id,
    } = reqQuery

    // 检查ID是否提供
    if (!_id) {
        // 如果没有提供ID，返回错误信息
        json = { code: -200, data: null, message: '参数错误' }
    }
    else {
        try {
            // 构建查询过滤条件
            const filter = { _id }
            // 尝试从数据库中查找文章
            const result = await ArticleM.findOne(filter).exec().then(data => data?.toObject())
            // 查询成功，返回文章详情
            json = { code: 200, message: 'success', data: result }
        }
        catch (err: unknown) {
            // 查询失败，返回错误信息
            json = { code: -200, data: null, message: getErrorMessage(err) }
        }
    }

    // 使用响应对象返回处理结果
    return json
}

/**
 * 异步插入文章。
 */
export async function insert(reqBody: ArticleInsert) {
    let json: ResData<Nullable<Article>>

    // 从请求体中解构文章信息
    const {
        category,
        content,
        title,
        html,
    } = reqBody

    // 根据是否提供html，处理markdown内容
    let mdHtml: string, mdToc: string
    if (html) {
        mdHtml = html
        mdToc = ''
    }
    else {
        // 如果没有提供html，则使用marked库处理markdown内容生成html和toc
        const md = marked(content)
        mdToc = md.toc
        mdHtml = md.html
    }

    // 处理文章分类，将其拆分为id和名称
    const arr_category = category.split('|')
    const data: Article = {
        title,
        category: arr_category[0],
        category_name: arr_category[1],
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
        // 创建文章，并在创建成功后更新分类数量
        const result = await ArticleM.create(data).then(data => data.toObject())

        const filter = { _id: arr_category[0] }
        const body = {
            $inc: {
                cate_num: 1,
            },
        }
        await CategoryM.updateOne(filter, body).exec()
        // 返回成功响应
        json = { code: 200, message: '发布成功', data: result }
    }
    catch (err: unknown) {
        // 捕获错误，返回错误响应
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    return json
}

/**
 * 删除文章记录及其对应分类的数量减一。
 */
export async function deletes(reqQuery: { id: string }) {
    let json: ResData<Nullable<Article>>

    // 从请求中提取文章ID
    const {
        id: _id,
    } = reqQuery

    try {
        // 准备过滤条件和更新内容
        const filter = { _id }
        const body = { is_delete: 1 }
        // 执行查找并更新操作，将文章标记为删除
        const result = await ArticleM.findOneAndUpdate(filter, body, { new: true }).exec()

        // 更新对应分类的文档数量
        const categoryBody = {
            $inc: {
                cate_num: -1,
            },
        }
        await CategoryM.updateOne(filter, categoryBody).exec()
        // 准备并返回成功响应
        json = { code: 200, message: '更新成功', data: result }
    }
    catch (err: unknown) {
        // 捕获并处理错误，返回错误响应
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    // 使用响应对象返回处理结果
    return json
}

/**
 * 恢复文章功能的异步函数。
 */
export async function recover(reqQuery: { id: string }) {
    let json: ResData<Nullable<Article>>

    // 从请求中提取文章ID
    const {
        id: _id,
    } = reqQuery

    try {
        // 构建用于查找和更新的过滤条件和更新内容
        const filter = { _id }
        const body = { is_delete: 1 }

        // 找到并更新文章的删除状态
        const result = await ArticleM.findOneAndUpdate(filter, body).exec()

        // 更新对应分类的文档数量
        const categoryBody = {
            $inc: {
                cate_num: 1,
            },
        }
        await CategoryM.updateOne(filter, categoryBody).exec()

        // 构建并返回成功的响应数据
        json = { code: 200, message: '更新成功', data: result }
    }
    catch (err: unknown) {
        // 捕获并处理错误，构建并返回失败的响应数据
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    // 将响应数据发送回客户端
    return json
}

/**
 * 修改文章信息
 */
export async function modify(reqBody: ArticleModify) {
    let json: ResData<Nullable<Article>>

    // 从请求体中解构需要的字段
    const {
        id: _id,
        category,
        category_old,
        content,
        title,
        html,
        category_name,
    } = reqBody

    let mdHtml: string, mdToc: string
    // 根据是否有html字段来处理markdown内容
    if (html) {
        mdHtml = html
        mdToc = ''
    }
    else {
        // 使用marked库将markdown内容转换为html和toc
        const md = marked(content)
        mdHtml = md.html
        mdToc = md.toc
    }

    try {
        // 准备过滤条件和更新内容
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
        // 使用findOneAndUpdate更新文章信息，并获取更新后的文档对象
        const result = await ArticleM.findOneAndUpdate(filter, body, { new: true }).exec().then(data => data?.toObject())
        if (result && category !== category_old) {
            // 如果分类发生变化，则更新分类计数
            const newCategofyFilter = { _id: category }
            const oldCategoryFilter = { _id: category_old }
            const newCategoryBody = { $inc: { cate_num: 1 } }
            const oldCategoryBody = { $inc: { cate_num: -1 } }
            // 执行分类计数的更新
            await Promise.all([
                CategoryM.updateOne(newCategofyFilter, newCategoryBody).exec(),
                CategoryM.updateOne(oldCategoryFilter, oldCategoryBody).exec(),
            ])
        }
        // 返回成功响应
        json = { code: 200, message: '更新成功', data: result }
    }
    catch (err: unknown) {
        // 返回错误响应
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    return json
}
