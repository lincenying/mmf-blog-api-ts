import type { Article, Category, Comment, User } from '~/types'

import AdminM from '../../src/models/admin'
import ArticleM from '../../src/models/article'
import CategoryM from '../../src/models/category'
import CommentM from '../../src/models/comment'
import UserM from '../../src/models/user'

interface LeanDoc {
    id?: string
    _id?: { toString: () => string } | string
}

export function getDocId(doc: LeanDoc) {
    if (doc.id) {
        return doc.id
    }
    if (doc._id) {
        return String(doc._id)
    }
    return ''
}

export async function getSampleArticle(): Promise<Article & { id: string }> {
    const doc = await ArticleM.findOne({ is_delete: 0 }).lean({ virtuals: true }).exec()
    const id = doc ? getDocId(doc) : ''
    if (!id) {
        throw new Error('dev 库无可用文章')
    }
    return { ...(doc as Article), id }
}

export async function getSampleCategory(): Promise<Category & { id: string }> {
    const doc = await CategoryM.findOne({ is_delete: 0 }).lean({ virtuals: true }).exec()
    const id = doc ? getDocId(doc) : ''
    if (!id) {
        throw new Error('dev 库无可用分类')
    }
    return { ...(doc as Category), id }
}

export async function getSampleAdmin(): Promise<User & { id: string }> {
    const doc = await AdminM.findOne({ is_delete: { $ne: 1 } }).lean({ virtuals: true }).exec()
    const id = doc ? getDocId(doc) : ''
    if (!id) {
        throw new Error('dev 库无可用管理员')
    }
    return { ...(doc as User), id }
}

export async function getSampleUser(): Promise<User & { id: string }> {
    const doc = await UserM.findOne({ is_delete: { $ne: 1 } }).lean({ virtuals: true }).exec()
    const id = doc ? getDocId(doc) : ''
    if (!id) {
        throw new Error('dev 库无可用用户')
    }
    return { ...(doc as User), id }
}

export async function getSampleComment(): Promise<Comment & { id: string }> {
    const doc = await CommentM.findOne({ is_delete: 0 }).lean({ virtuals: true }).exec()
    const id = doc ? getDocId(doc) : ''
    if (!id) {
        throw new Error('dev 库无可用评论')
    }
    return { ...(doc as Comment), id }
}

export async function hasSampleArticle() {
    try {
        await getSampleArticle()
        return true
    }
    catch {
        return false
    }
}

export async function hasSampleCategory() {
    try {
        await getSampleCategory()
        return true
    }
    catch {
        return false
    }
}

export async function hasSampleAdmin() {
    try {
        await getSampleAdmin()
        return true
    }
    catch {
        return false
    }
}

export async function hasSampleUser() {
    try {
        await getSampleUser()
        return true
    }
    catch {
        return false
    }
}

export async function hasSampleComment() {
    try {
        await getSampleComment()
        return true
    }
    catch {
        return false
    }
}
