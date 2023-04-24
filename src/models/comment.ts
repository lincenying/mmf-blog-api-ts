import mongooseAutopopulate from 'mongoose-autopopulate'

import mongoose from '../mongoose'
import type { Comment } from '@/types'

const Schema = mongoose.Schema

const CommentSchema = new Schema<Comment>({
    article_id: String,
    userid: { type: Schema.Types.ObjectId, ref: 'User', autopopulate: { select: '_id email username' } },
    content: String,
    creat_date: String,
    is_delete: Number,
    timestamp: Number,
})

CommentSchema.plugin(mongooseAutopopulate)
export default mongoose.model<Comment>('Comment', CommentSchema)
