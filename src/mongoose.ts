import process from 'node:process'
import mongoose from 'mongoose'

const mongoUrl = process.env.DATABASE_URL || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017'
mongoose.set('strictQuery', false)
mongoose.connect(`${mongoUrl}/mmfblog_v2`, { })
mongoose.Promise = globalThis.Promise

mongoose.connection.on('error', (err) => {
    console.error('mongoose连接出错', err)
})

export default mongoose
