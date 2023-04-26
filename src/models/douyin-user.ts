import mongoose from '../mongoose'
import type { DouYinUser } from '@/types'

const Schema = mongoose.Schema

const DouYinUserSchema = new Schema<DouYinUser>({
    user_id: String,
    user_name: String,
    user_avatar: String,
    sec_uid: String,
    share_url: String,
    creat_date: String,
    is_delete: { type: Number, default: 0 },
    timestamp: Number,
}, {
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
})

export default mongoose.model<DouYinUser>('DouYinUser', DouYinUserSchema)
