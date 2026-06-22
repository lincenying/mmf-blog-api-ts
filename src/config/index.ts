export { apiId as mpappApiId, secret as mpappSecret } from './mpapp.js'
export { secretClient, secretServer } from './secret.js'

// MD5 加密前缀, 如用户的密码是 123456, 存到数据库将会变成 md5('!@#$%(*&^)' + '123456')
export const md5Pre = '!@#$%(*&^)'

// API域名
export const domain = 'https://api.mmxiaowu.com/'
export const cdnDomain = 'http://cdn.mmxiaowu.com/'
