import { body, query } from 'express-validator'

import { idQueryValidator, paginationQueryValidator } from '../shared/validators'

const categoryPattern = /^[^|]+\|[^|]+$/

/**
 * 文章列表查询参数校验
 */
export const listQueryValidator = [
    ...paginationQueryValidator,
    query('sort').optional().isString().withMessage('排序参数错误'),
    query('key').optional().isString().withMessage('搜索关键词参数错误'),
]

export { idQueryValidator }

/**
 * 发布文章请求体校验
 */
export const insertBodyValidator = [
    body('title').trim().notEmpty().withMessage('请填写文章标题'),
    body('category').matches(categoryPattern).withMessage('分类参数错误'),
    body('content').custom((value, { req }) => {
        if (req.body?.html) {
            return true
        }
        if (typeof value !== 'string' || !value.trim()) {
            throw new Error('请填写文章内容')
        }
        return true
    }),
]

/**
 * 编辑文章请求体校验
 */
export const modifyBodyValidator = [
    body('id').notEmpty().withMessage('参数错误').isString(),
    body('title').trim().notEmpty().withMessage('请填写文章标题'),
    body('category').notEmpty().withMessage('分类参数错误').isString(),
    body('category_name').notEmpty().withMessage('分类参数错误').isString(),
    body('category_old').custom((value, { req }) => {
        if (req.body?.category !== value && !value) {
            throw new Error('分类参数错误')
        }
        return true
    }),
    body('content').custom((value, { req }) => {
        if (req.body?.html) {
            return true
        }
        if (typeof value !== 'string' || !value.trim()) {
            throw new Error('请填写文章内容')
        }
        return true
    }),
]
