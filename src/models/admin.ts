import mongoose from '../mongoose'
import type { User } from '@/types'

const Schema = mongoose.Schema

/**
 * 管理员模型
 * @typedef {object} AdminSchema
 * @property {string} username - 用户名
 * @property {string} email - 邮箱
 * @property {string} password - 密码
 * @property {string} creat_date - 创建日期
 * @property {string} update_date - 更新日期
 * @property {number} is_delete - 是否删除，0表示未删除，1表示已删除
 * @property {number} timestamp - 时间戳
 */
const AdminSchema = new Schema<User>({
    username: String,
    email: String,
    password: String,
    creat_date: String,
    update_date: String,
    is_delete: { type: Number, default: 0 },
    timestamp: Number,
}, {
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
})

export default mongoose.model<User>('Admin', AdminSchema)
