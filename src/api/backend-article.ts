import moment from 'moment'
import markdownIt from 'markdown-it'
import markdownItTocAndAnchor from 'markdown-it-toc-and-anchor'
import hljs from 'highlight.js'

import ArticleM from '../models/article'
import CategoryM from '../models/category'
import type { Article, ArticleInsert, ArticleModify, Req, Res } from '@/types'

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
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function getList(req: Req<{}, { page: string; limit: string }>, res: Res) {
    const sort = '-_id'
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit
    try {
        const result = await Promise.all([
            ArticleM.find().sort(sort).skip(skip).limit(limit).exec(),
            ArticleM.countDocuments(),
        ])
        const total = result[1]
        const totalPage = Math.ceil(total / limit)
        const json = {
            code: 200,
            data: {
                list: result[0],
                total,
                hasNext: totalPage > page ? 1 : 0,
                hasPrev: page > 1 ? 1 : 0,
            },
        }
        res.json(json)
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 管理时, 获取单篇文章
 * @method
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function getItem(req: Req<{}, { id: string }>, res: Res) {
    const _id = req.query.id
    if (!_id)
        res.json({ code: -200, message: '参数错误' })

    try {
        const result = await ArticleM.findOne({ _id })
        res.json({ code: 200, data: result })
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 发布文章
 * @method
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function insert(req: Req<ArticleInsert, {}>, res: Res) {
    const { category, content, title } = req.body
    const md = marked(content)
    const html = md.html
    const toc = md.toc
    const arr_category = category.split('|')
    const data: Article = {
        title,
        category: arr_category[0],
        category_name: arr_category[1],
        content,
        html,
        toc,
        visit: 0,
        like: 0,
        comment_count: 0,
        creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        is_delete: 0,
        timestamp: moment().format('X'),
    }
    try {
        const result = await ArticleM.create(data)
        await CategoryM.updateOne({ _id: arr_category[0] }, { $inc: { cate_num: 1 } })
        res.json({ code: 200, message: '发布成功', data: result })
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 管理时, 删除文章
 * @method
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function deletes(req: Req<{}, { id: string }>, res: Res) {
    const _id = req.query.id
    try {
        const result = await ArticleM.updateOne({ _id }, { is_delete: 1 })
        await CategoryM.updateOne({ _id }, { $inc: { cate_num: -1 } })
        res.json({ code: 200, message: '更新成功', data: result })
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 管理时, 恢复文章
 * @method
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function recover(req: Req<{}, { id: string }>, res: Res) {
    const _id = req.query.id
    try {
        const result = await ArticleM.updateOne({ _id }, { is_delete: 0 })
        await CategoryM.updateOne({ _id }, { $inc: { cate_num: 1 } })
        res.json({ code: 200, message: '更新成功', data: result })
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 管理时, 编辑文章
 * @method
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function modify(req: Req<ArticleModify, {}>, res: Res) {
    const { id, category, category_old, content, title, category_name } = req.body
    const md = marked(content)
    const html = md.html
    const toc = md.toc
    const data = {
        title,
        category,
        category_name,
        content,
        html,
        toc,
        update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
    }
    try {
        const result = await ArticleM.findOneAndUpdate({ _id: id }, data, { new: true })
        if (category !== category_old) {
            await Promise.all([
                CategoryM.updateOne({ _id: category }, { $inc: { cate_num: 1 } }),
                CategoryM.updateOne({ _id: category_old }, { $inc: { cate_num: -1 } }),
            ])
        }
        res.json({ code: 200, message: '更新成功', data: result })
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}
