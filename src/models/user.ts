import mongoose from '../mongoose'
import type { User } from '@/types'

const Schema = mongoose.Schema

/**
 * 用户模型
 * @typedef {object} UserSchema
 * @property {string} username - 用户名
 * @property {string} email - 用户邮箱
 * @property {string} password - 用户密码
 * @property {string} creat_date - 创建日期
 * @property {string} update_date - 更新日期
 * @property {number} is_delete - 是否删除标记
 * @property {number} timestamp - 时间戳
 * @property {string} wx_avatar - 微信头像
 * @property {string} wx_signature - 微信签名
 */
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
    toJSON: {
        virtuals: true,
    }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
})

UserSchema.virtual('id').get(function () {
    return this._id.toString()
})

export default mongoose.model<User>('User', UserSchema)
