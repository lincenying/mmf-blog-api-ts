import axios from 'axios'
import * as cheerio from 'cheerio'
import { tujidao } from '../config'
import { getErrorMessage } from '../utils'
import type { Req, Res } from '@/types'

const baseOptions = {
    method: 'GET',
    url: 'https://www.jimeilu.com/',
    headers: {
        'Referer': 'https://www.jimeilu.com/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36',
        'upgrade-insecure-requests': 1,
    },
}

interface TujidaoList {
    id: string
    title: string
    img: string
    total: string
    img_domain: string
    img_key: string
}

export async function lists(req: Req<{ page: number }>, res: Res) {
    const reqQuery = req.query

    const cookie = tujidao
    const page = reqQuery.page || 1
    const options = {
        ...baseOptions,
        method: 'GET',
        url: `https://www.jimeilu.com/cat/?id=10&page=${page}`,
        headers: {
            ...baseOptions.headers,
            cookie,
        },
    }
    try {
        const xhr = await axios(options)
        const body = xhr.data
        const $ = cheerio.load(body)
        const list: TujidaoList[] = []
        $('.hezi')
            .find('li')
            .each((index, item) => {
                const img = $(item).find('img').eq(0).attr('src') || ''
                const imgURL = new URL(img)
                const data: TujidaoList = {
                    id: $(item).attr('id') || '',
                    title: $(item).find('.biaoti').text(),
                    img: $(item).find('img').eq(0).attr('src') || '',
                    img_domain: imgURL.origin,
                    img_key: imgURL.pathname.replace('0.jpg', ''),
                    total: $(item).find('.shuliang').eq(0).text().replace('P', '').replace('p', ''),
                }
                list.push(data)
            })
        res.json({ code: 200, data: list, message: 'success' })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, ok: 2, msg: getErrorMessage(err) })
    }
}
