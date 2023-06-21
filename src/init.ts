import fs from 'node:fs'

function fsExistsSync(path: string) {
    try {
        fs.accessSync(path, fs.constants.F_OK)
    }
    catch (e) {
        return false
    }
    return true
}
function creatSecret() {
    if (!fsExistsSync('./src/config/secret.js')) {
        const secretServer1 = Math.random() * 1000000
        const secretClient1 = Math.random() * 1000000
        const secret1 = `export const secretServer = '${secretServer1}'
export const secretClient = '${secretClient1}'`
        fs.writeFileSync('./src/config/secret.js', secret1)
        console.log('./src/config/secret.js: 生成成功')
    }
    else {
        console.log('./src/config/secret.js: 已存在')
    }
}

function creatMpApp() {
    if (!fsExistsSync('./src/config/mpapp.js')) {
        const secret = `export const apiId = ''
export const secret = ''`
        fs.writeFileSync('./src/config/mpapp.js', secret)
        console.log('./src/config/mpapp.js: 生成成功')
    }
    else {
        console.log('./src/config/mpapp.js: 已存在')
    }
}

function creatShiHua() {
    if (!fsExistsSync('./src/config/shihua.js')) {
        const secret = `export const APP_ID = ''
export const API_KEY = ''
export const SECRET_KEY = ''`
        fs.writeFileSync('./src/config/shihua.js', secret)
        console.log('./src/config/shihua.js: 生成成功')
    }
    else {
        console.log('./src/config/shihua.js: 已存在')
    }
}

function creatQiNiu() {
    if (!fsExistsSync('./src/config/qiniu.js')) {
        const secret = `export const accessKey = ''
export const secretKey = ''
export const bucket = ''`
        fs.writeFileSync('./src/config/qiniu.js', secret)
        console.log('./src/config/qiniu.js: 生成成功')
    }
    else {
        console.log('./src/config/qiniu.js: 已存在')
    }
}

function creatTuJiDao() {
    if (!fsExistsSync('./src/config/tujidao.js')) {
        const secret = 'export const cookies = \'\''
        fs.writeFileSync('./src/config/tujidao.js', secret)
        console.log('./src/config/tujidao.js: 生成成功')
    }
    else {
        console.log('./src/config/tujidao.js: 已存在')
    }
}

creatSecret()
creatMpApp()
creatShiHua()
creatQiNiu()
creatTuJiDao()
