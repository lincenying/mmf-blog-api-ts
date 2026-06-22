import type { Lists, ResData } from '~/types'

/**
 * 成功响应
 */
export function success<T>(data: T, message = 'success'): ResData<T> {
    return { code: 200, data, message }
}

/**
 * 失败响应（保持现有 -200 错误码，兼容前端）
 */
export function fail<T = null>(message: string, data: T = null as T): ResData<T> {
    return { code: -200, data, message }
}

/**
 * 指定错误码的失败响应（用于鉴权等场景）
 */
export function failWithCode<T = null>(code: number, message: string, data: T = null as T): ResData<T> {
    return { code, data, message }
}

/**
 * 分页列表响应
 */
export function paginate<T>(list: T[], total: number, page: number, limit: number, message = 'success'): ResData<Lists<T[]>> {
    const totalPage = Math.ceil(total / limit)
    return {
        code: 200,
        data: {
            list,
            total,
            hasNext: totalPage > page ? 1 : 0,
            hasPrev: page > 1 ? 1 : 0,
        },
        message,
    }
}
