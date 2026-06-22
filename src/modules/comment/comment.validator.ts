import { body, query } from 'express-validator'

import { idQueryValidator, paginationQueryValidator } from '../shared/validators'

export { idQueryValidator }

/**
 * 评论列表查询参数校验
 */
export const listQueryValidator = [
    ...paginationQueryValidator,
    query('id').notEmpty().withMessage('参数错误').isString(),
    query('all').optional().isInt({ min: 0, max: 1 }).withMessage('参数错误'),
]

/**
 * 发布评论请求体校验
 */
export const insertBodyValidator = [
    body('id').notEmpty().withMessage('参数错误').isString(),
    body('content').trim().notEmpty().withMessage('请输入评论内容'),
]
