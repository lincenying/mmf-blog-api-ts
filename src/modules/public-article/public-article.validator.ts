import { query } from 'express-validator'

import { idQueryValidator, paginationQueryValidator } from '../shared/validators'

export { idQueryValidator }

/**
 * 前台文章列表查询参数校验
 */
export const listQueryValidator = [
    ...paginationQueryValidator,
    query('id').optional().isString().withMessage('分类参数错误'),
    query('key').optional().isString().withMessage('搜索关键词参数错误'),
    query('by').optional().isString().withMessage('排序参数错误'),
    query('filter').optional().isString().withMessage('字段过滤参数错误'),
]

/**
 * 热门文章查询参数校验
 */
export const trendingQueryValidator = [
    query('id').optional().isString(),
]
