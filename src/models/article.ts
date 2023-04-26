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
    is_delete: { type: Number, default: 0 },
    timestamp: Number,
    likes: [String],
}, {
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
})

export default mongoose.model<Article>('Article', ArticleSchema)
