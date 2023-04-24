import mongoose from '../mongoose'
import type { Article } from '@/types'

const Schema = mongoose.Schema

const ArticleSchema = new Schema<Article>({
    title: String,
    content: String,
    html: String,
    toc: String,
    category: String,
    category_name: String,
    visit: Number,
    like: Number,
    comment_count: Number,
    creat_date: String,
    update_date: String,
    is_delete: Number,
    timestamp: Number,
    likes: [String],
})

export default mongoose.model<Article>('Article', ArticleSchema)
