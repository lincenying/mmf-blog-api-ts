import mongoose from '../mongoose'
import type { ShiHua } from '@/types'

const Schema = mongoose.Schema

/**
 * ShihuaSchema 定义了一个用于表示 ShiHua 数据模型的 Mongoose Schema。
 * ShiHua 是一个包含用户ID、图片ID、名称、图片、结果、创建日期、是否删除和时间戳的对象。
 */
const ShihuaSchema = new Schema<ShiHua>({
    user_id: { type: String, description: '用户ID' },
    img_id: { type: String, description: '图片ID' },
    name: { type: String, description: '名称' },
    img: { type: String, description: '图片' },
    result: { type: String, description: '结果' },
    creat_date: { type: String, description: '创建日期' },
    is_delete: { type: Number, default: 0, description: '是否删除标志，0表示未删除，1表示已删除' },
    timestamp: { type: Number, description: '时间戳' },
}, {
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
})

ShihuaSchema.virtual('id').get(function () {
    return this._id.toString()
})

export default mongoose.model<ShiHua>('Shihua', ShihuaSchema)
