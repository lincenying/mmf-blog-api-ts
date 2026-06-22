import fs from 'node:fs'

function fsExistsSync(path: string) {
    try {
        fs.accessSync(path, fs.constants.F_OK)
    }
    catch (_e) {
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
        console.log('./src/config/secret.js: 已存在, 自动跳过')
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
        console.log('./src/config/mpapp.js: 已存在, 自动跳过')
    }
}

creatSecret()
creatMpApp()
