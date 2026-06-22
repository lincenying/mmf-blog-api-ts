import { body } from 'express-validator'

import { idQueryValidator, paginationQueryValidator } from '../shared/validators'

export { idQueryValidator }

export const listQueryValidator = paginationQueryValidator

/**
 * 管理员登录请求体校验
 */
export const loginBodyValidator = [
    body('username').trim().notEmpty().withMessage('请输入用户名'),
    body('password').notEmpty().withMessage('请输入密码'),
]

/**
 * 编辑管理员请求体校验
 */
export const modifyBodyValidator = [
    body('id').notEmpty().withMessage('参数错误').isString(),
    body('username').trim().notEmpty().withMessage('请输入用户名'),
    body('email').trim().notEmpty().withMessage('请输入邮箱').isEmail().withMessage('邮箱格式错误'),
    body('password').optional().isString(),
]
