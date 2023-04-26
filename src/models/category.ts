import mongoose from '../mongoose'
import type { Category } from '@/types'

const Schema = mongoose.Schema

const CategorySchema = new Schema<Category>({
    cate_name: String,
    cate_order: String,
    cate_num: Number,
    creat_date: String,
    update_date: String,
    is_delete: { type: Number, default: 0 },
    timestamp: Number,
}, {
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
})

export default mongoose.model<Category>('Category', CategorySchema)
