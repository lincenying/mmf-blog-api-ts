import express from 'express'

import cors from '../middlewares/cors'
import isAdmin from '../middlewares/is-admin'
import { validate } from '../middlewares/validate'

import * as adminController from '../modules/admin/admin.controller'
import {
    idQueryValidator as adminIdQueryValidator,
    listQueryValidator as adminListQueryValidator,
    loginBodyValidator as adminLoginBodyValidator,
    modifyBodyValidator as adminModifyBodyValidator,
} from '../modules/admin/admin.validator'
import * as articleController from '../modules/article/article.controller'
import {
    idQueryValidator as articleIdQueryValidator,
    insertBodyValidator as articleInsertBodyValidator,
    listQueryValidator as articleListQueryValidator,
    modifyBodyValidator as articleModifyBodyValidator,
} from '../modules/article/article.validator'
import * as categoryController from '../modules/category/category.controller'
import {
    idQueryValidator as categoryIdQueryValidator,
    insertBodyValidator as categoryInsertBodyValidator,
    modifyBodyValidator as categoryModifyBodyValidator,
} from '../modules/category/category.validator'
import * as userController from '../modules/user/user.controller'
import {
    idQueryValidator as userIdQueryValidator,
    listQueryValidator as userListQueryValidator,
    modifyBodyValidator as userModifyBodyValidator,
} from '../modules/user/user.validator'
import { fail } from '../utils/response'

const router = express.Router()

router.options('/{*backend}', cors)

// API
// ================ 后台 ================
// ------- 文章 -------
router.get('/article/list', isAdmin, validate(articleListQueryValidator), articleController.getList)
router.get('/article/item', isAdmin, validate(articleIdQueryValidator), articleController.getItem)
router.post('/article/insert', isAdmin, validate(articleInsertBodyValidator), articleController.insert)
router.get('/article/delete', isAdmin, validate(articleIdQueryValidator), articleController.deletes)
router.get('/article/recover', isAdmin, validate(articleIdQueryValidator), articleController.recover)
router.post('/article/modify', isAdmin, validate(articleModifyBodyValidator), articleController.modify)
// ------- 分类 -------
router.get('/category/list', categoryController.getList)
router.get('/category/item', validate(categoryIdQueryValidator), categoryController.getItem)
router.post('/category/insert', isAdmin, validate(categoryInsertBodyValidator), categoryController.insert)
router.get('/category/delete', isAdmin, validate(categoryIdQueryValidator), categoryController.deletes)
router.get('/category/recover', isAdmin, validate(categoryIdQueryValidator), categoryController.recover)
router.post('/category/modify', isAdmin, validate(categoryModifyBodyValidator), categoryController.modify)
// ------- 管理 -------
router.post('/admin/login', validate(adminLoginBodyValidator), adminController.login)
router.get('/admin/list', isAdmin, validate(adminListQueryValidator), adminController.getList)
router.get('/admin/item', isAdmin, validate(adminIdQueryValidator), adminController.getItem)
router.post('/admin/modify', isAdmin, validate(adminModifyBodyValidator), adminController.modify)
router.get('/admin/delete', isAdmin, validate(adminIdQueryValidator), adminController.deletes)
router.get('/admin/recover', isAdmin, validate(adminIdQueryValidator), adminController.recover)
// ------- 用户管理 -------
router.get('/user/list', isAdmin, validate(userListQueryValidator), userController.getList)
router.get('/user/item', isAdmin, validate(userIdQueryValidator), userController.getItem)
router.post('/user/modify', isAdmin, validate(userModifyBodyValidator), userController.modify)
router.get('/user/delete', isAdmin, validate(userIdQueryValidator), userController.deletes)
router.get('/user/recover', isAdmin, validate(userIdQueryValidator), userController.recover)

router.get('/{*backend}', (_req, res) => {
    res.json(fail('没有找到该页面'))
})

export default router
