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
    is_delete: Number,
    timestamp: Number,
})

export default mongoose.model<ShiHua>('Shihua', ShihuaSchema)
