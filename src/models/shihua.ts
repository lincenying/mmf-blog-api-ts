import mongoose from '../mongoose'
import type { ShiHua } from '@/types'

const Schema = mongoose.Schema

const ShihuaSchema = new Schema<ShiHua>({
    user_id: String,
    img_id: String,
    name: String,
    img: String,
    result: String,
    creat_date: String,
    is_delete: { type: Number, default: 0 },
    timestamp: Number,
}, {
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
})

export default mongoose.model<ShiHua>('Shihua', ShihuaSchema)
