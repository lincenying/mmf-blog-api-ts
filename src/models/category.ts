import mongoose from '../mongoose'
import type { Category } from '@/types'

const Schema = mongoose.Schema

const CategorySchema = new Schema<Category>({
    cate_name: String,
    cate_order: String,
    cate_num: Number,
    creat_date: String,
    update_date: String,
    is_delete: Number,
    timestamp: Number,
})

export default mongoose.model<Category>('Category', CategorySchema)
