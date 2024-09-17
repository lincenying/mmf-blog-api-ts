import fs from 'node:fs'
import dayjs from 'dayjs'

/**
 * 检查指定路径的文件或目录是否存在。
 * @param path 要检查其存在的文件或目录的路径。
 * @returns {boolean} 如果路径存在，则返回true；如果不存在，则返回false。
 */
export function fsExistsSync(path: string) {
    try {
        // 尝试访问路径，检查其是否存在
        fs.accessSync(path, fs.constants.F_OK)
    }
    catch (_e) {
        // 如果访问时抛出异常，则路径不存在
        return false
    }
    // 无异常抛出，路径存在
    return true
}

/**
 * 获取错误消息
 * @param err 未知类型的错误对象，可以是字符串或者Error实例
 * @returns 返回处理后的错误消息字符串
 */
export function getErrorMessage(err: unknown) {
    let message = ''
    // 如果错误对象是字符串类型，则将其转换为大写并赋值给message
    if (typeof err === 'string') {
        message = err.toUpperCase()
    }
    // 如果错误对象是Error实例，则直接获取其message属性并赋值给message
    else if (err instanceof Error) {
        message = err.message
    }
    // 返回最终处理得到的错误消息
    return message
}

/**
 * 获取当前时间，支持自定义格式。
 *
 * @param format 时间格式，默认为 'YYYY-MM-DD HH:mm:ss'。如果传入 'X' 或 'unix'，则返回 UNIX 时间戳。
 * @returns 格式化后的时间字符串或 UNIX 时间戳字符串。
 */
export function getNowTime(format: string = 'YYYY-MM-DD HH:mm:ss') {
    // 当格式为 'X' 或 'unix' 时，返回当前时间的 UNIX 时间戳
    if (format === 'X' || format === 'unix') {
        return `${dayjs().unix()}`
    }

    // 返回根据指定格式格式化后的时间字符串
    return dayjs().format(format)
}
