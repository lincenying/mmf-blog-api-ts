import mongoose from '../mongoose'
import type { Category } from '@/types'

const Schema = mongoose.Schema

/**
 * 定义分类模型的Schema。
 * @typedef {object} CategorySchema
 * @property {string} cate_name - 分类名称。
 * @property {string} cate_order - 分类排序。
 * @property {number} cate_num - 分类数量。
 * @property {string} creat_date - 创建日期。
 * @property {string} update_date - 更新日期。
 * @property {number} is_delete - 是否删除标记，0表示未删除，1表示已删除。
 * @property {number} timestamp - 时间戳。
 */
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

CategorySchema.virtual('id').get(function () {
    return this._id.toString()
})

export default mongoose.model<Category>('Category', CategorySchema)
