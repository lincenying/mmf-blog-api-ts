import type { RequestHandler } from 'express'
import type { ValidationChain } from 'express-validator'

import { validationResult } from 'express-validator'

import { fail } from '../utils/response'

/**
 * 执行 express-validator 校验链，失败时返回统一错误响应
 */
export function validate(validations: ValidationChain[]): RequestHandler {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)))

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0]
            const message = typeof firstError.msg === 'string' ? firstError.msg : '参数错误'
            res.json(fail(message))
            return
        }

        next()
    }
}
