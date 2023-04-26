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
}, {
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
})

export default mongoose.model<User>('User', UserSchema)
