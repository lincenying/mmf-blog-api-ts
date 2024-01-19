import markdownIt from 'markdown-it'
import markdownItTocAndAnchor from 'markdown-it-toc-and-anchor'
import hljs from 'highlight.js'

import ArticleM from '../models/article'
import CategoryM from '../models/category'
import { getErrorMessage, getNowTime } from '../utils'
import type { Article, ArticleInsert, ArticleModify, Req, Res, ResLists } from '@/types'

function marked(content: string) {
    const $return = {
        html: '',
        toc: '',
    }
    const html = markdownIt({
        breaks: true,
        html: true,
        linkify: true,
        typographer: true,
        highlight(str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, str).value
                }
                catch (error) {}
            }
            return ''
        },
    })
        .use(markdownItTocAndAnchor, {
            tocCallback(tocMarkdown: string, tocArray: string[], tocHtml: string) {
                $return.toc = tocHtml
            },
        })
        .render(content)
    $return.html = html
    return $return
}

/**
 * 管理时, 获取文章列表
 * @method
 * @param req Request
 * @param res Response
 */
export async function getList(req: Req<{ page: string; limit: string }>, res: Res) {
    const sort = '-_id'
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit
    try {
        const [list, total] = await Promise.all([
            ArticleM.find().sort(sort).skip(skip).limit(limit).exec().then(data => data.map(item => item.toObject())),
            ArticleM.countDocuments(),
        ])
        const totalPage = Math.ceil(total / limit)
        const json: ResLists<Article[]> = {
            code: 200,
            data: {
                list,
                total,
                hasNext: totalPage > page ? 1 : 0,
                hasPrev: page > 1 ? 1 : 0,
            },
            message: 'success',
        }
        res.json(json)
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 管理时, 获取单篇文章
 * @method
 * @param req Request
 * @param res Response
 */
export async function getItem(req: Req<{ id: string }>, res: Res) {
    const {
        id: _id,
    } = req.query

    if (!_id)
        res.json({ code: -200, message: '参数错误' })

    try {
        const result = await ArticleM.findOne({ _id }).exec().then(data => data?.toObject())
        res.json({ code: 200, message: 'success', data: result })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 发布文章
 * @method
 * @param req Request
 * @param res Response
 */
export async function insert(req: Req<object, ArticleInsert>, res: Res) {
    const {
        category,
        content,
        title,
        html,
    } = req.body

    let mdHtml: string, mdToc: string
    if (html) {
        mdHtml = html
        mdToc = ''
    }
    else {
        const md = marked(content)
        mdToc = md.toc
        mdHtml = md.html
    }

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
        const result = await ArticleM.create(data).then(data => data.toObject())
        await CategoryM.updateOne({ _id: arr_category[0] }, { $inc: { cate_num: 1 } }).exec()
        res.json({ code: 200, message: '发布成功', data: result })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 管理时, 删除文章
 * @method
 * @param req Request
 * @param res Response
 */
export async function deletes(req: Req<{ id: string }>, res: Res) {
    const {
        id: _id,
    } = req.query

    try {
        const result = await ArticleM.updateOne({ _id }, { is_delete: 1 }).exec()
        await CategoryM.updateOne({ _id }, { $inc: { cate_num: -1 } }).exec()
        res.json({ code: 200, message: '更新成功', data: result })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 管理时, 恢复文章
 * @method
 * @param req Request
 * @param res Response
 */
export async function recover(req: Req<{ id: string }>, res: Res) {
    const {
        id: _id,
    } = req.query

    try {
        const result = await ArticleM.updateOne({ _id }, { is_delete: 0 }).exec()
        await CategoryM.updateOne({ _id }, { $inc: { cate_num: 1 } }).exec()
        res.json({ code: 200, message: '更新成功', data: result })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 管理时, 编辑文章
 * @method
 * @param req Request
 * @param res Response
 */
export async function modify(req: Req<object, ArticleModify>, res: Res) {
    const {
        id: _id,
        category,
        category_old,
        content,
        title,
        html,
        category_name,
    } = req.body

    let mdHtml: string, mdToc: string
    if (html) {
        mdHtml = html
        mdToc = ''
    }
    else {
        const md = marked(content)
        mdHtml = md.html
        mdToc = md.toc
    }

    const data = {
        title,
        category,
        category_name,
        content,
        html: mdHtml,
        toc: mdToc,
        update_date: getNowTime(),
    }
    try {
        const result = await ArticleM.findOneAndUpdate({ _id }, data, { new: true }).exec().then(data => data?.toObject())
        if (result && category !== category_old) {
            await Promise.all([
                CategoryM.updateOne({ _id: category }, { $inc: { cate_num: 1 } }).exec(),
                CategoryM.updateOne({ _id: category_old }, { $inc: { cate_num: -1 } }).exec(),
            ])
        }
        res.json({ code: 200, message: '更新成功', data: result })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}
