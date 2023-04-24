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
    is_delete: Number,
    timestamp: Number,
})

export default mongoose.model<DouYinUser>('DouYinUser', DouYinUserSchema)
