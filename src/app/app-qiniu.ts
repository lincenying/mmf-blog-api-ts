// const qiniu = require('qiniu')
// const config = require('../config')

import type { Req, Res, ResData } from '@/types'

// const accessKey = config.qiniu.accessKey
// const secretKey = config.qiniu.secretKey
// const bucket = config.qiniu.bucket

export function token(req: Req, res: Res) {
    const json: ResData<string | null> = { code: -200, data: '', message: '' }

    // const options = {
    //     scope: bucket,
    //     expires: 60 * 60 * 24 * 1
    // }
    // try {
    //     const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
    //     const putPolicy = new qiniu.rs.PutPolicy(options)
    //     const uploadToken = putPolicy.uploadToken(mac)
    //     res.json({ code: 200, data: uploadToken, uptoken: uploadToken })
    // } catch (error) {
    //     res.json({ code: -200, data: '', uptoken: '', message: error.message })
    // }
    res.json(json)
}
