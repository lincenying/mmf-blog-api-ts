import mongooseAutopopulate from 'mongoose-autopopulate'

import mongoose from '../mongoose'
import type { DouYin } from '@/types'

const Schema = mongoose.Schema

const DouYinSchema = new Schema<DouYin>(
    {
        user_id: String,
        aweme_id: String,
        desc: String,
        vid: String,
        image: String,
        video: String,
        creat_date: String,
        is_delete: { type: Number, default: 0 },
        timestamp: Number,
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
