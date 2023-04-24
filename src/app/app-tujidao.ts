import axios from 'axios'
import cheerio from 'cheerio'
import { tujidao } from '../config'
import type { Req, Res } from '@/types'

const baseOptions = {
    method: 'GET',
    url: 'https://www.tujidao.com/',
    headers: {
        'Referer': 'https://www.tujidao.com/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36',
        'upgrade-insecure-requests': 1,
    },
}

interface TujidaoList {
    id: string
    title: string
    img: string
    total: string
}

export async function lists(req: Req<{}, { page: number }>, res: Res) {
    const cookies = tujidao
    const page = req.query.page || 1
    const options = {
        ...baseOptions,
        method: 'GET',
        url: `https://www.tujidao.com/cat/?id=10&page=${page}`,
        headers: {
            ...baseOptions.headers,
            cookie: cookies,
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
                const data: TujidaoList = {
                    id: $(item).attr('id') || '',
                    title: $(item).find('.biaoti').text(),
                    img: $(item).find('img').eq(0).attr('src') || '',
                    total: $(item).find('.shuliang').eq(0).text().replace('P', '').replace('p', ''),
                }
                list.push(data)
            })
        res.json({
            code: 200,
            data: list,
        })
    }
    catch (err: any) {
        res.json({ code: 300, ok: 2, msg: err.toString() })
    }
}
