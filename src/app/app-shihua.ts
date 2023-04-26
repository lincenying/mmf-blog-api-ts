import fs from 'node:fs'
import multer from 'multer'
import moment from 'moment'
import base64Img from 'base64-img'
import pkg from 'baidu-aip-sdk'

import { cdnDomain, domain, shihua as shihuaConfig } from '../config'
import { checkJWT } from '../utils/check-jwt'
import ShiHuaM from '../models/shihua'
import type { ListConfig, Req, Res, ShiHua } from '@/types'

const { imageClassify: AipImageClassifyClient } = pkg

const storage = multer.diskStorage({
    destination(_req, _file, cb) {
        cb(null, './uploads')
    },
    filename(_req, file, cb) {
        const ext = file.originalname.split('.').pop()
        cb(null, `shihua-${Date.now()}.${ext}`)
    },
})
const Upload = multer({ storage }).single('file')

export async function upload(req: Req, res: Res) {
    Upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            res.json({ code: '-200', msg: err.toString() })
        }
        else if (err) {
            res.json({ code: '-200', msg: err.toString() })
        }
        else {
            const file = req.file
            res.json({ code: '200', url: file?.path })
        }
    })
}

function getBase64(img_id: string, cdn: string) {
    if (cdn === 'qiniu') {
        return new Promise((resolve) => {
            const url = `${cdnDomain}app/${img_id}/800x800`
            base64Img.requestBase64(url, (_err: any, _res: any, body: string) => {
                if (body) {
                    body = body.split(',')[1]
                    resolve(body)
                }
                else {
                    resolve('')
                }
            })
        })
    }
    return fs.readFileSync(`./uploads/${img_id}`).toString('base64')
}

export async function shihua(req: Req<{}, { id: string; cdn: string }>, res: Res) {
    const img_id = req.query.id
    const cdn = req.query.cdn
    const token = req.cookies.user || req.headers.user
    const userid = req.cookies.userid || req.headers.userid
    const username = req.cookies.username || req.headers.username
    const isLogin = await checkJWT(token, userid, username, 'user')
    const getData = async () => {
        const client = new AipImageClassifyClient(shihuaConfig.APP_ID, shihuaConfig.API_KEY, shihuaConfig.SECRET_KEY)
        try {
            console.log(`七牛图片开始时间:${new Date().getTime()}`)
            const image = await getBase64(img_id, cdn)
            console.log(`七牛图片结束时间:${new Date().getTime()}`)
            if (image) {
                const options: Obj = {}
                options.baike_num = '5'
                // 带参数调用植物识别
                console.log(`识图开始时间:${new Date().getTime()}`)
                const shihuaResult = await client.plantDetect(image, options)
                console.log(`识图结束时间:${new Date().getTime()}`)
                if (shihuaResult.result) {
                    if (isLogin) {
                        const length = shihuaResult.result.length
                        let img, name
                        for (let i = 0; i < length; i++) {
                            const item = shihuaResult.result[i]

                            if (item.baike_info && item.baike_info.image_url) {
                                name = item.name
                                img = item.baike_info.image_url
                                break
                            }
                        }
                        if (cdn === 'qiniu')
                            img = `${cdnDomain}app/${img_id}`
                        else
                            img = `${domain}uploads/${img_id}`

                        if (img && name) {
                            await ShiHuaM.create({
                                user_id: userid,
                                img_id,
                                name,
                                img,
                                result: JSON.stringify(shihuaResult.result),
                                creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                                is_delete: 0,
                                timestamp: moment().format('X'),
                            })
                            // fs.unlinkSync('./uploads/' + img_id)
                        }
                    }
                    return {
                        success: true,
                        data: shihuaResult,
                    }
                }
                return {
                    success: false,
                    err: 'shitu',
                    message: shihuaResult.error_msg,
                }
            }
            return {
                success: false,
                err: 'down-img',
                message: '图片读取失败',
            }
        }
        catch (err: any) {
            return {
                success: false,
                err: 'unknow',
                message: err.message,
            }
        }
    }

    try {
        const result = await ShiHuaM.findOne({ img_id }).then(data => data?.toObject())
        if (result) {
            res.json({
                code: 200,
                from: 'db',
                userid,
                result: JSON.parse(result.result),
            })
        }
        else {
            let data = await getData()
            if (!data.success && data.err === 'unknow')
                data = await getData()
            if (!data.success && data.err === 'unknow')
                data = await getData()
            if (data.success)
                res.json({ code: 200, from: 'api', userid, ...data.data })
            else
                res.json({ code: -200, userid, message: data.message || '读取数据失败' })
        }
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 获取识花历史列表
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function getHistory(req: Req<{}, { page: string; limit: string }>, res: Res) {
    const userid = req.cookies.userid || req.headers.userid
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10

    const payload = {
        is_delete: 0,
        user_id: userid,
    }
    const skip = (page - 1) * limit
    const sort = '-creat_date'

    try {
        const [data, total] = await Promise.all([
            ShiHuaM.find(payload).sort(sort).skip(skip).limit(limit).exec().then(data => data.map(item => item.toObject())),
            ShiHuaM.countDocuments(payload),
        ])
        const totalPage = Math.ceil(total / limit)
        const json: ListConfig<ShiHua[]> = {
            code: 200,
            data: {
                list: data.map((item) => {
                    item.result = ''
                    return item
                }),
                total,
                hasNext: totalPage > page ? 1 : 0,
                hasPrev: page > 1 ? 1 : 0,
            },
        }
        res.json(json)
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}

/**
 * 删除识花历史列表
 * @method delHistory
 * @param  {Request} req Request
 * @param  {Response} res Response
 */
export async function delHistory(req: Req<{}, { img_id: string }>, res: Res) {
    const userid = req.cookies.userid || req.headers.userid
    const { img_id } = req.query

    try {
        await ShiHuaM.deleteOne({ img_id, user_id: userid })
        fs.unlinkSync(`./uploads/${img_id}`)
        res.json({ code: 200, message: '删除成功' })
    }
    catch (err: any) {
        res.json({ code: -200, message: err.toString() })
    }
}
