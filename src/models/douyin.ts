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

DouYinSchema.virtual('user', {
    ref: 'DouYinUser',
    localField: 'user_id',
    foreignField: 'user_id',
    justOne: true,
    autopopulate: { path: 'user', select: '_id user_id user_name user_avatar' },
})

DouYinSchema.plugin(mongooseAutopopulate)

export default mongoose.model<DouYin>('DouYin', DouYinSchema)
