import type { Request, Response } from 'express'
import type { Document } from 'mongoose'

export type Req<ReqQuery = any, ReqBody = any, ReqParams = any> = Request<ReqParams, any, ReqBody, ReqQuery, any>
export type Res = Response

/**
 * 文章详情
 */
export interface Article {
    /** * 文章标题 */
    title: string
    /** * 文章内容: markdown */
    content: string
    /** * 文章内容: html */
    html: string
    /** * 文章导航 */
    toc: string
    /** * 分类ID */
    category: string
    /** * 分类名称 */
    category_name: string
    /** * 访问数 */
    visit: number
    /** * 点赞数 */
    like: number
    /** * 评论数 */
    comment_count: number
    /** * 发布时间 */
    creat_date: string
    /** * 编辑时间 */
    update_date: string
    /** * 是否删除: 0: 正常 | 1: 删除 */
    is_delete: number
    /** * 发布时间戳 */
    timestamp: number | string
    /** * 点赞用户ID列表 */
    likes?: string[]
    /** * 登录用户是否已点赞 */
    like_status?: boolean
    _doc?: any
}

/**
 * 分类详情
 */
export interface Category {
    _id?: string
    /** * 分类名称 */
    cate_name: string
    /** * 分类排序 */
    cate_order: string
    /** * 分类中文章数量 */
    cate_num?: number
    /** * 创建时间 */
    creat_date?: string
    /** * 编辑时间 */
    update_date?: string
    /** * 是否删除: 0: 正常 | 1: 已删除 */
    is_delete?: number
    /** * 发布时间戳 */
    timestamp?: number
}

/**
 * 评论详情
 */
export interface Comment {
    _id?: string
    /** * 评论所属文章ID */
    article_id: string
    /** * 发布评论的用户 */
    userid: Record<string, any>
    /** * 评论内容 */
    content: string
    /** * 创建时间 */
    creat_date: string
    /** * 是否删除: 0: 正常 | 1: 已删除 */
    is_delete: number
    /** * 发布时间戳 */
    timestamp: number | string
    /** * 用户邮箱 */
    email?: string
    /** * 用户名 */
    username?: string
}

/**
 * 用户详情
 */
export interface User extends Document {
    _id?: string
    /** * 用户名 */
    username: string
    /** * 邮箱 */
    email: string
    /** * 密码 */
    password: string
    /** * 创建时间 */
    creat_date: string
    /** * 编辑时间 */
    update_date: string
    /** * 是否删除: 0: 正常 | 1: 已删除 */
    is_delete: number
    /** * 发布时间戳 */
    timestamp: number | string
    wx_avatar?: string
    wx_signature?: string
    userid?: Obj
}

/**
 * 抖音用户详情
 */
export interface DouYinUser {
    _id?: string
    user_id: string
    user_name: string
    user_avatar: string
    sec_uid: string
    share_url: string
    creat_date: string
    is_delete: number
    timestamp: number | string
}

/**
 * 抖音视频详情
 */
export interface DouYin {
    user_id: Obj
    aweme_id: string
    desc: string
    vid: string
    image: string
    video: string
    creat_date: string
    is_delete: number
    timestamp: number | string
}

/**
 * 识花详情
 */
export interface ShiHua {
    user_id: string
    img_id: string
    name: string
    img: string
    result: string
    creat_date: string
    is_delete: number
    timestamp: number | string
}

/**
 * 用户 cookies
 */
export interface UserCookies {
    user?: string
    userid?: string
    username?: string
    useremail?: string
    [propName: string]: any
}

export interface ReqListQuery {
    all?: number
    by?: string
    from?: string
    id?: string
    limit?: number
    page?: number
    path?: string
    key?: string
}

export interface ArticleInsert {
    category: string
    content: string
    title: string
}
export interface ArticleModify extends ArticleInsert {
    id: string
    category_old: string
    category_name: string
}

export interface CategoryInsert {
    cate_name: string
    cate_order: string
}

export interface CategoryModify extends CategoryInsert {
    id: string
}

export interface UserModify {
    email: string
    username: string
    update_date: string
    password?: string
}

export interface DouYinUserInsert {
    user_id: string
    user_name: string
    user_avatar: string
    sec_uid: string
    share_url: string
}

export interface DouYinInsert {
    user_id: string
    aweme_id: string
    desc: string
    vid: string
    image: string
    video: string
}

export interface ListConfig<T> {
    code: number
    data: {
        hasNext?: number | boolean
        hasPrev?: number | boolean
        total: number
        list: T
    }
}
