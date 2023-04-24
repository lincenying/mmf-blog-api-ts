import mongoose from '../mongoose'
import type { User } from '@/types'

const Schema = mongoose.Schema

const UserSchema = new Schema<User>({
    username: String,
    email: String,
    password: String,
    creat_date: String,
    update_date: String,
    is_delete: Number,
    timestamp: Number,
    wx_avatar: String,
    wx_signature: String,
})

export default mongoose.model<User>('User', UserSchema)
