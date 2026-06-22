import { body } from 'express-validator'

import { idQueryValidator, paginationQueryValidator } from '../shared/validators'

export { idQueryValidator }

export const listQueryValidator = paginationQueryValidator

/**
 * 用户登录请求体校验
 */
export const loginBodyValidator = [
    body('username').trim().notEmpty().withMessage('请输入用户名'),
    body('password').notEmpty().withMessage('请输入密码'),
]

/**
 * 用户注册请求体校验
 */
export const registerBodyValidator = [
    body('username').trim().notEmpty().withMessage('请将表单填写完整'),
    body('email').trim().notEmpty().withMessage('请将表单填写完整').isEmail().withMessage('邮箱格式错误'),
    body('password').notEmpty().withMessage('请将表单填写完整'),
]

/**
 * 微信登录请求体校验
 */
export const wxLoginBodyValidator = [
    body('nickName').trim().notEmpty().withMessage('参数有误, 微信登录失败'),
    body('wxSignature').notEmpty().withMessage('参数有误, 微信登录失败'),
    body('avatar').optional().isString(),
]

/**
 * 微信 jscode 请求体校验
 */
export const jscodeBodyValidator = [
    body('js_code').notEmpty().withMessage('参数错误').isString(),
]

/**
 * 后台编辑用户请求体校验
 */
export const modifyBodyValidator = [
    body('id').notEmpty().withMessage('参数错误').isString(),
    body('username').trim().notEmpty().withMessage('请输入用户名'),
    body('email').trim().notEmpty().withMessage('请输入邮箱').isEmail().withMessage('邮箱格式错误'),
    body('password').optional().isString(),
]

/**
 * 账号邮箱修改请求体校验
 */
export const accountBodyValidator = [
    body('email').trim().notEmpty().withMessage('请输入邮箱').isEmail().withMessage('邮箱格式错误'),
]

/**
 * 密码修改请求体校验
 */
export const passwordBodyValidator = [
    body('old_password').notEmpty().withMessage('请输入原始密码'),
    body('password').notEmpty().withMessage('请输入新密码'),
]
