import { query } from 'express-validator'

/**
 * ID 查询参数校验（通用）
 */
export const idQueryValidator = [
    query('id').notEmpty().withMessage('参数错误').isString(),
]

/**
 * 分页查询参数校验（通用）
 */
export const paginationQueryValidator = [
    query('page').optional().isInt({ min: 1 }).withMessage('页码参数错误').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量参数错误').toInt(),
]
