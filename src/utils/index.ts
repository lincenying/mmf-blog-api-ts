import fs from 'node:fs'

export function fsExistsSync(path: string) {
    try {
        fs.accessSync(path, fs.constants.F_OK)
    }
    catch (e) {
        return false
    }
    return true
}

export function strLen(str: string) {
    let charCode = -1
    let realLength = 0
    const len = str.length
    for (let i = 0; i < len; i++) {
        charCode = str.charCodeAt(i)
        if (charCode >= 0 && charCode <= 128)
            realLength += 1
        else realLength += 2
    }
    return realLength
}

export function getErrorMessage(err: unknown) {
    let message = ''
    if (typeof err === 'string')
        message = err.toUpperCase()
    else if (err instanceof Error)
        message = err.message
    return message
}
