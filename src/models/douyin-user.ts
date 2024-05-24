import mongoose from '../mongoose'
import type { DouYinUser } from '@/types'

const Schema = mongoose.Schema

/**
 * 定义抖音用户的数据模型。
 * @property {string} user_id - 用户ID。
 * @property {string} user_name - 用户名。
 * @property {string} user_avatar - 用户头像URL。
 * @property {string} sec_uid - 用户的安全ID。
 * @property {string} share_url - 用户分享链接。
 * @property {string} creat_date - 用户创建日期。
 * @property {number} is_delete - 用户是否已删除标志，0表示未删除，1表示已删除。
 * @property {number} timestamp - 用户数据的时间戳。
 */
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
