import type { ArticleInsert, ArticleModify, Req, Res } from '~/types'

import * as articleService from './article.service'

/**
 * 获取文章列表
 */
export async function getList(req: Req<{ page?: string, limit?: string, sort?: string, key?: string }>, res: Res) {
    res.json(await articleService.getList(req.query))
}

/**
 * 获取指定 ID 的文章项
 */
export async function getItem(req: Req<{ id: string }>, res: Res) {
    res.json(await articleService.getItem(req.query))
}

/**
 * 发布文章
 */
export async function insert(req: Req<object, ArticleInsert>, res: Res) {
    res.json(await articleService.insert(req.body))
}

/**
 * 软删除文章
 */
export async function deletes(req: Req<{ id: string }>, res: Res) {
    res.json(await articleService.deletes(req.query))
}

/**
 * 恢复已删除文章
 */
export async function recover(req: Req<{ id: string }>, res: Res) {
    res.json(await articleService.recover(req.query))
}

/**
 * 修改文章信息
 */
export async function modify(req: Req<object, ArticleModify>, res: Res) {
    res.json(await articleService.modify(req.body))
}
