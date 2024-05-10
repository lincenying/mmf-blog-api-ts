import jwt from 'jsonwebtoken'
import { secretClient, secretServer } from '../config'

/**
 * 检查JWT（JSON Web Token）的有效性。
 * @param token 需要验证的JWT字符串。
 * @param userid 需要验证的用户ID。
 * @param username 需要验证的用户名，将进行解码和比对。
 * @param type 标记JWT的类型，决定使用哪个密钥进行验证，'user' 表示用户类型。
 * @returns 返回一个Promise，解析为一个布尔值，true表示验证成功，false表示验证失败。
 */
export function checkJWT(token: string, userid: string, username: string, type: string): Promise<boolean> {
    return new Promise((resolve) => {
        // 根据JWT类型选择使用的密钥
        const secret = type === 'user' ? secretClient : secretServer
        jwt.verify(token, secret, (err, decoded) => {
            // 验证出现错误，或者解码结果为空或为字符串，认为验证失败
            if (err || !decoded || typeof decoded === 'string') {
                resolve(false)
            }
            // 检查解码后的id和username是否匹配
            else if (decoded.id === userid && (decoded.username === username || decoded.username === encodeURI(username))) {
                resolve(true)
            }
            // 不匹配，验证失败
            else {
                resolve(false)
            }
        })
    })
}
