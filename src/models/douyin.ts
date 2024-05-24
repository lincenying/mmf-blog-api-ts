import mongooseAutopopulate from 'mongoose-autopopulate'

import mongoose from '../mongoose'
import type { DouYin } from '@/types'

const Schema = mongoose.Schema

/**
 * DouYinSchema 定义了抖音视频数据的模式。
 * 包含了用户ID、视频ID、视频描述、视频ID、图片URL、视频URL、创建日期、是否删除标记和时间戳等字段。
 */
const DouYinSchema = new Schema<DouYin>(
    {
        user_id: String, // 用户ID
        aweme_id: String, // 视频ID
        desc: String, // 视频描述
        vid: String, // 视频ID
        image: String, // 图片URL
        video: String, // 视频URL
        creat_date: String, // 创建日期
        is_delete: { type: Number, default: 0 }, // 是否删除标记，默认为0
        timestamp: Number, // 时间戳
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
)

DouYinSchema.virtual('user', { // 键名
    ref: 'DouYinUser', // 目标表
    localField: 'user_id', // 本地表键名
    foreignField: 'user_id', // 目标表键名
    justOne: true,
    autopopulate: { path: 'user', select: '_id user_id user_name user_avatar' },
})

DouYinSchema.plugin(mongooseAutopopulate)

export default mongoose.model<DouYin>('DouYin', DouYinSchema)
