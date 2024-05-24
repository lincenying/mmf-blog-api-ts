import mongooseAutopopulate from 'mongoose-autopopulate'

import mongoose from '../mongoose'
import type { Comment } from '@/types'

const Schema = mongoose.Schema

/**
 * 评论模型
 * @typedef {object} CommentSchema
 * @property {string} article_id - 关联的文章ID
 * @property {ObjectId} userid - 用户ID，关联到User模型
 * @property {string} content - 评论内容
 * @property {string} creat_date - 评论创建日期
 * @property {number} is_delete - 是否删除，0表示未删除，1表示已删除
 * @property {number} timestamp - 时间戳
 */
const CommentSchema = new Schema<Comment>({
    article_id: String,
    userid: { type: Schema.Types.ObjectId, ref: 'User', autopopulate: { select: '_id email username' } },
    content: String,
    creat_date: String,
    is_delete: { type: Number, default: 0 },
    timestamp: Number,
}, {
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
})

// 字段别名
// CommentSchema.alias('userid', 'user')

// 多表关联
// CommentSchema.virtual('user', {
//     ref: 'User', // model name
//     localField: 'userid', // 本地字段
//     foreignField: '_id', // 跨表字段
//     justOne: true,
//     autopopulate: { path: 'user', select: '_id email username' },
// })

CommentSchema.plugin(mongooseAutopopulate)
export default mongoose.model<Comment>('Comment', CommentSchema)
