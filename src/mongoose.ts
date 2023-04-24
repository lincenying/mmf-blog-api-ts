import mongoose from 'mongoose'

const mongoUrl = 'localhost'
mongoose.set('strictQuery', false)
mongoose.connect(`mongodb://${mongoUrl}/mmfblog_v2`, { })
mongoose.Promise = global.Promise

export default mongoose
