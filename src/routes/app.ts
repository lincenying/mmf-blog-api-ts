import express from 'express'

import * as appDouYin from '../app/app-douyin'
import * as appPublic from '../app/app-public'
import * as appQiniu from '../app/app-qiniu'
import * as appShihua from '../app/app-shihua'
import * as appTujidao from '../app/app-tujidao'
import * as appWeiBo from '../app/app-weibo'

import cors from '../middlewares/cors'
import isUser from '../middlewares/is-user'

const router = express.Router()

router.options('/{*app}', cors)

// API
// ================= APP =================
// ------- 检测版本更新 ------
router.get('/check', cors, appPublic.checkUpdate)

// ------ 识花 ------
router.post('/shihua/upload', cors, appShihua.upload)
router.get('/shihua/get', cors, appShihua.shihua)
router.get('/shihua/history/list', cors, isUser, appShihua.getHistory)
router.get('/shihua/history/delete', cors, isUser, appShihua.delHistory)
// ------ 微博 ------
router.get('/weibo/list', cors, appWeiBo.list)
router.get('/weibo/get', cors, appWeiBo.get)
router.get('/weibo/user', cors, appWeiBo.user)
router.get('/weibo/card', cors, appWeiBo.card)
router.get('/weibo/video', cors, appWeiBo.video)
router.get('/weibo/beauty-video', cors, appWeiBo.beautyVideo)
router.get('/weibo/detail', cors, appWeiBo.detail)
// ------ 图集岛 ------
router.get('/tujidao/lists', cors, appTujidao.lists)
// ------ 七牛 token -----
router.get('/qiniu/token', cors, appQiniu.token)
// ------ 抖音视频 -------
router.post('/douyin/user/insert', cors, appDouYin.insertUser)
router.post('/douyin/insert', cors, appDouYin.insert)
router.get('/douyin/list', cors, appDouYin.getList)
router.get('/douyin/item', cors, appDouYin.getItem)

router.get('/{*app}', (_req, res) => {
    res.json({
        code: -200,
        message: '没有找到该页面',
    })
})

export default router
