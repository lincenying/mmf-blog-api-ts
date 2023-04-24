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

export function creatSecret() {
    if (!fsExistsSync('./src/config/secret.js')) {
        const secretServer1 = Math.random() * 1000000
        const secretClient1 = Math.random() * 1000000
        const secret1 = `export const secretServer = '${secretServer1}'
export const secretClient = '${secretClient1}'`
        fs.writeFileSync('./src/config/secret.js', secret1)
    }
}

export function creatMpApp() {
    if (!fsExistsSync('./src/config/mpapp.js')) {
        const secret = `export const apiId = ''
export const secret = ''`
        fs.writeFileSync('./src/config/mpapp.js', secret)
    }
}

export function creatShiHua() {
    if (!fsExistsSync('./src/config/shihua.js')) {
        const secret = `export const APP_ID = ''
export const API_KEY = ''
export const SECRET_KEY = ''`
        fs.writeFileSync('./src/config/shihua.js', secret)
    }
}

export function creatQiNiu() {
    if (!fsExistsSync('./src/config/qiniu.js')) {
        const secret = `export const accessKey = ''
export const secretKey = ''
export const bucket = ''`
        fs.writeFileSync('./src/config/qiniu.js', secret)
    }
}

export function creatTuJiDao() {
    if (!fsExistsSync('./src/config/tujidao.js')) {
        const secret = 'export const cookies = \'\''
        fs.writeFileSync('./src/config/tujidao.js', secret)
    }
}
