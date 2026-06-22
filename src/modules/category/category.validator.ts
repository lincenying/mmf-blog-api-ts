import { body } from 'express-validator'

import { idQueryValidator } from '../shared/validators'

export { idQueryValidator }

/**
 * 新增分类请求体校验
 */
export const insertBodyValidator = [
    body('cate_name').trim().notEmpty().withMessage('请填写分类名称'),
    body('cate_order').trim().notEmpty().withMessage('请填写分类排序'),
]

/**
 * 编辑分类请求体校验
 */
export const modifyBodyValidator = [
    body('id').notEmpty().withMessage('参数错误').isString(),
    body('cate_name').trim().notEmpty().withMessage('请填写分类名称'),
    body('cate_order').trim().notEmpty().withMessage('请填写分类排序'),
]
