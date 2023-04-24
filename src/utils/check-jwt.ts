import jwt from 'jsonwebtoken'
import { secretClient, secretServer } from '@/config'

export function checkJWT(token: string, userid: string, username: string, type: string) {
    return new Promise((resolve) => {
        const secret = type === 'user' ? secretClient : secretServer
        jwt.verify(token, secret, (err, decoded) => {
            if (err || !decoded || typeof decoded === 'string')
                resolve(false)
            else if (decoded.id === userid && (decoded.username === username || decoded.username === encodeURI(username)))
                resolve(decoded)
            else
                resolve(false)
        })
    })
}
