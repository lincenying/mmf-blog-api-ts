import type { CategoryInsert, CategoryModify, Req, Res } from '~/types'

import * as categoryService from './category.service'

/**
 * 获取分类列表
 */
export async function getList(_req: Req, res: Res) {
    res.json(await categoryService.getList())
}

/**
 * 获取分类详情
 */
export async function getItem(req: Req<{ id: string }>, res: Res) {
    res.json(await categoryService.getItem(req.query))
}

/**
 * 新增分类
 */
export async function insert(req: Req<object, CategoryInsert>, res: Res) {
    res.json(await categoryService.insert(req.body))
}

/**
 * 软删除分类
 */
export async function deletes(req: Req<{ id: string }>, res: Res) {
    res.json(await categoryService.deletes(req.query))
}

/**
 * 恢复分类
 */
export async function recover(req: Req<{ id: string }>, res: Res) {
    res.json(await categoryService.recover(req.query))
}

/**
 * 编辑分类
 */
export async function modify(req: Req<object, CategoryModify>, res: Res) {
    res.json(await categoryService.modify(req.body))
}
