import type { Req, ReqListQuery, Res } from '~/types'

import * as publicArticleService from './public-article.service'

function getUserId(req: Req) {
    return (req.cookies.userid || req.headers.userid) as string
}

/**
 * 前台获取文章列表
 */
export async function getList(req: Req<ReqListQuery>, res: Res) {
    res.json(await publicArticleService.getList(req.query, getUserId(req)))
}

/**
 * 前台获取单篇文章
 */
export async function getItem(req: Req<{ id: string }>, res: Res) {
    const user_id = (req.cookies.userid || req.headers.userid) as Nullable<string>
    res.json(await publicArticleService.getItem(req.query, user_id))
}

/**
 * 前台获取热门文章
 */
export async function getTrending(req: Req<{ id?: string }>, res: Res) {
    res.json(await publicArticleService.getTrending(req.query))
}
