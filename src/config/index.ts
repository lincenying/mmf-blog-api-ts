import { secretClient as _secretClient, secretServer as _secretServer } from './secret.js'
import { apiId as _apiId, secret as _secret } from './mpapp.js'
import { API_KEY, APP_ID, SECRET_KEY } from './shihua.js'
import * as _qiniu from './qiniu.js'
import { cookies } from './tujidao.js'

// MD5 加密前缀, 如用户的密码是 123456, 存到数据库将会变成 md5('!@#$%(*&^)' + '123456')
export const md5Pre = '!@#$%(*&^)'

export const secretServer = _secretServer
export const secretClient = _secretClient

export const mpappApiId = _apiId
export const mpappSecret = _secret

export const shihua = {
    APP_ID,
    API_KEY,
    SECRET_KEY,
}
export const qiniu = _qiniu
export const tujidao = cookies
// API域名
export const domain = 'https://api.mmxiaowu.com/'
export const cdnDomain = 'http://cdn.mmxiaowu.com/'
