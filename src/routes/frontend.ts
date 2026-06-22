import express from 'express'

import cors from '../middlewares/cors'
import isAdmin from '../middlewares/is-admin'
import isUser from '../middlewares/is-user'
import { validate } from '../middlewares/validate'

import * as commentController from '../modules/comment/comment.controller'
import {
    idQueryValidator as commentIdQueryValidator,
    insertBodyValidator as commentInsertBodyValidator,
    listQueryValidator as commentListQueryValidator,
} from '../modules/comment/comment.validator'
import * as likeController from '../modules/like/like.controller'
import { idQueryValidator as likeIdQueryValidator } from '../modules/like/like.validator'
import * as publicArticleController from '../modules/public-article/public-article.controller'
import {
    idQueryValidator as publicArticleIdQueryValidator,
    listQueryValidator as publicArticleListQueryValidator,
    trendingQueryValidator,
} from '../modules/public-article/public-article.validator'
import * as userController from '../modules/user/user.controller'
import {
    accountBodyValidator,
    jscodeBodyValidator,
    loginBodyValidator,
    passwordBodyValidator,
    registerBodyValidator,
    wxLoginBodyValidator,
} from '../modules/user/user.validator'
import { fail } from '../utils/response'

const router = express.Router()

router.options('/{*frotend}', cors)

// ------ 评论管理（后台）------
router.get('/comment/delete', isAdmin, validate(commentIdQueryValidator), commentController.deletes)
router.get('/comment/recover', isAdmin, validate(commentIdQueryValidator), commentController.recover)

// ================= 前台 =================
// ------ 文章 ------
router.get('/article/list', validate(publicArticleListQueryValidator), publicArticleController.getList)
router.get('/article/item', validate(publicArticleIdQueryValidator), publicArticleController.getItem)
router.get('/trending', validate(trendingQueryValidator), publicArticleController.getTrending)
// ------ 评论 ------
router.post('/comment/insert', isUser, validate(commentInsertBodyValidator), commentController.insert)
router.get('/comment/list', validate(commentListQueryValidator), commentController.getList)
// ------ 用户 ------
router.post('/user/insert', validate(registerBodyValidator), userController.insert)
router.post('/user/login', validate(loginBodyValidator), userController.login)
router.post('/user/wxLogin', validate(wxLoginBodyValidator), userController.wxLogin)
router.post('/user/jscode2session', validate(jscodeBodyValidator), userController.jscodeToSession)
router.post('/user/logout', userController.logout)
router.get('/user/account', isUser, userController.getItem)
router.post('/user/account', isUser, validate(accountBodyValidator), userController.account)
router.post('/user/password', isUser, validate(passwordBodyValidator), userController.password)
// ------ 喜欢 ------
router.get('/like', isUser, validate(likeIdQueryValidator), likeController.like)
router.get('/unlike', isUser, validate(likeIdQueryValidator), likeController.unlike)
router.get('/reset/like', isUser, likeController.resetLike)

router.get('/{*frotend}', (_req, res) => {
    res.json(fail('没有找到该页面'))
})

export default router
