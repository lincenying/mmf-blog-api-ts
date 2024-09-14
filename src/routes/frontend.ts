import multipart from 'connect-multiparty'
import express from 'express'

import * as frontendArticle from '../api/frontend-article'
import * as frontendComment from '../api/frontend-comment'
import * as frontendLike from '../api/frontend-like'
import * as frontendUser from '../api/frontend-user'

import cors from '../middlewares/cors'
import isAdmin from '../middlewares/is-admin'
import isUser from '../middlewares/is-user'

const router = express.Router()

const multipartMiddleware = multipart()

router.options('*', cors)

// API

// ------ 评论 ------
// 删除评论
router.get('/comment/delete', isAdmin, frontendComment.deletes)
// 恢复评论
router.get('/comment/recover', isAdmin, frontendComment.recover)
// ================= 前台 =================
// ------ 文章 ------
// 前台浏览时, 获取文章列表
router.get('/article/list', frontendArticle.getList)
// 前台浏览时, 获取单篇文章
router.get('/article/item', frontendArticle.getItem)
// 前台浏览时, 热门文章
router.get('/trending', frontendArticle.getTrending)
// ------ 评论 ------
// 发布评论
router.post('/comment/insert', isUser, multipartMiddleware, frontendComment.insert)
// 读取评论列表
router.get('/comment/list', frontendComment.getList)
// ------ 用户 ------
// 前台注册
router.post('/user/insert', multipartMiddleware, frontendUser.insert)
// 前台登录
router.post('/user/login', multipartMiddleware, frontendUser.login)
// 微信登录
router.post('/user/wxLogin', multipartMiddleware, frontendUser.wxLogin)
router.post('/user/jscode2session', multipartMiddleware, frontendUser.jscodeToSession)
// 前台退出
router.post('/user/logout', frontendUser.logout)
// 前台账号读取
router.get('/user/account', isUser, frontendUser.getItem)
// 前台账号修改
router.post('/user/account', isUser, multipartMiddleware, frontendUser.account)
// 前台密码修改
router.post('/user/password', isUser, multipartMiddleware, frontendUser.password)
// ------ 喜欢 ------
// 喜欢
router.get('/like', isUser, frontendLike.like)
// 取消喜欢
router.get('/unlike', isUser, frontendLike.unlike)
// 重置喜欢
router.get('/reset/like', isUser, frontendLike.resetLike)

router.get('*', (req, res) => {
    res.json({
        code: -200,
        message: '没有找到该页面',
    })
})

export default router
