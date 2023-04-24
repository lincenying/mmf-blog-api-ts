import type { Request, Response } from 'express'
import type { Document } from 'mongoose'

export type Req<ReqBody = any, ReqQuery = any> = Request<any, any, ReqBody, ReqQuery, any>
export type Res = Response

/**
 * 文章详情
 */
export interface Article {
    _id?: string
    title: string
    content: string
    html: string
    toc: string
    category: string
    category_name: string
    visit: number
    like: number
    comment_count: number
    creat_date: string
    update_date: string
    is_delete: number
    timestamp: number | string
    likes?: string[]
    like_status?: boolean
    _doc?: any
}

/**
 * 分类详情
 */
export interface Category {
    _id?: string
    cate_name: string
    cate_order: string
    cate_num?: number
    creat_date?: string
    update_date?: string
    is_delete?: number
    timestamp?: number
}

/**
 * 评论详情
 */
export interface Comment {
    _id?: string
    article_id: string
    userid: Record<string, any>
    content: string
    creat_date: string
    is_delete: number
    timestamp: number | string
    email?: string
    username?: string
}

/**
 * 用户详情
 */
export interface User extends Document {
    _id?: string
    username: string
    email: string
    password: string
    creat_date: string
    update_date: string
    is_delete: number
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

export interface ReqQuery {
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
export interface ArticleModify {
    id: string
    category: string
    category_old: string
    content: string
    title: string
    category_name: string
}

export interface CategoryInsert {
    cate_name: string
    cate_order: string
}

export interface CategoryModify {
    id: string
    cate_name: string
    cate_order: string
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
