import type { AxiosResponse } from 'axios'

import type { DouYinVideo } from './app-douyin.types'
import type { DouYin, DouYinInsert, DouYinUser, DouYinUserInsert, Lists, Req, Res, ResData } from '~/types'

import { Buffer } from 'node:buffer'
import axios from 'axios'
import DouYinM from '../models/douyin'
import DouYinUserM from '../models/douyin-user'
import { getErrorMessage, getNowTime } from '../utils'
import crc32 from '../utils/crc32'
import { douyinCache as lruCache } from '../utils/lru-cache'

export async function insertUser(req: Req<object, DouYinUserInsert>, res: Res) {
    let json: ResData<Nullable<DouYinUser>>
    const reqBody = req.body

    const { user_id, user_name, user_avatar, sec_uid, share_url } = reqBody

    const data = {
        user_id,
        user_name,
        user_avatar,
        sec_uid,
        share_url,
        creat_date: getNowTime(),
        is_delete: 0,
        timestamp: getNowTime('X'),
    }
    try {
        const filter = { user_id }
        const checkRepeat = await DouYinUserM.findOne(filter)
            .exec()
            .then(data => data?.toObject())
        if (checkRepeat) {
            json = { code: 300, data: null, message: '该用户已经存在!' }
        }
        else {
            const result = await DouYinUserM.create(data).then(data => data.toObject())
            json = { code: 200, message: '添加成功', data: result }
        }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}

export async function insert(req: Req<object, DouYinInsert>, res: Res) {
    let json: ResData<Nullable<DouYin>>
    const reqBody = req.body

    const { user_id, aweme_id, desc, vid, image, video } = reqBody

    const data = {
        author: user_id,
        aweme_id,
        desc,
        vid,
        image,
        video,
        creat_date: getNowTime(),
        is_delete: 0,
        timestamp: getNowTime('X'),
    }
    try {
        const filter = { aweme_id }
        const checkRepeat = await DouYinM.findOne(filter).then(data => data?.toObject())
        if (checkRepeat) {
            json = { code: 300, data: null, message: '该视频已经存在!' }
        }
        else {
            const result = await DouYinM.create(data).then(data => data?.toObject())
            json = { code: 200, message: '发布成功', data: result }
        }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}

export async function getList(req: Req<{ user_id: string, limit?: number, page?: number }>, res: Res) {
    let json: ResData<Nullable<Lists<DouYin[]>>>
    const reqQuery = req.query

    let { limit, page } = reqQuery
    const user_id = reqQuery.user_id

    page = Number(page) || 1
    limit = Number(limit) || 10

    const payload: { is_delete: number, user_id: string } = { is_delete: 0, user_id: '' }
    const skip = (page - 1) * limit
    const sort = '-aweme_id'

    const filds = 'user user_id aweme_id desc vid image video creat_date is_delete timestamp'

    if (user_id) {
        payload.user_id = user_id
    }

    try {
        const [list, total] = await Promise.all([
            DouYinM.find(payload, filds)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec()
                .then(data => data.map(item => item.toObject())),
            DouYinM.countDocuments(payload),
        ])
        const totalPage = Math.ceil(total / limit)
        json = {
            code: 200,
            data: {
                list,
                total,
                hasNext: totalPage > page ? 1 : 0,
                hasPrev: page > 1 ? 1 : 0,
            },
        }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}

export async function getItem(req: Req<{ id: string }>, res: Res) {
    let json: ResData<string | null>
    const reqQuery = req.query

    const vid = reqQuery.id
    let main_url: string = lruCache.get(`douyin_${vid}`)
    if (!vid) {
        json = { code: -200, data: null, msg: '参数错误' }
    }
    else if (main_url) {
        json = {
            code: 200,
            data: main_url,
            from: 'lru-cache',
            msg: '',
        }
    }
    else {
        const url = `/video/urls/v/1/toutiao/mp4/${vid}?r=${new Date().getTime()}`
        const crc = crc32(url)
        const fullUrl = `http://i.snssdk.com${url}&s=${crc}`
        const options = {
            method: 'get',
            url: fullUrl,
            headers: {
                'Referer': 'https://www.ixigua.com/',
                'User-Agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36',
                'cookie': 'wafid=b91cc9ea-f8c9-4665-aefd-5eb32504c548; wafid.sig=6RJyXryyR309k1jBSiRHNOIUbWg; xiguavideopcwebid=6779498568983889411; xiguavideopcwebid.sig=thxI4ay_N8VBsX1clmDdpMXPDf8; SLARDAR_WEB_ID=bc0b73ca-1788-4689-b919-05355f8a0021',
                'upgrade-insecure-requests': 1,
            },
        }
        try {
            const xhr = await axios<DouYinVideo, AxiosResponse<DouYinVideo>>(options)
            const video_list = xhr.data && xhr.data.data && xhr.data.data.video_list
            if (video_list) {
                main_url
                    = (video_list.video_3 && video_list.video_3.main_url)
                        || (video_list.video_2 && video_list.video_2.main_url)
                        || (video_list.video_1 && video_list.video_1.main_url)
                        || ''
                if (main_url) {
                    main_url = Buffer.from(main_url, 'base64').toString()
                    lruCache.set(`douyin_${vid}`, main_url)
                }
            }
            json = {
                code: 200,
                data: main_url,
                from: 'douyin',
                msg: main_url ? 'success' : xhr.data.data.message,
            }
        }
        catch (err: unknown) {
            json = { code: -200, data: null, message: getErrorMessage(err) }
        }
    }

    res.json(json)
}
