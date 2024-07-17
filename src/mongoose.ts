import process from 'node:process'
import mongoose from 'mongoose'

const mongoUrl = process.env.DATABASE_URL || '127.0.0.1'
mongoose.set('strictQuery', false)
mongoose.connect(`mongodb://${mongoUrl}/mmfblog_v2`, { })
mongoose.Promise = globalThis.Promise

export default mongoose
