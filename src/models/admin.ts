import mongoose from '../mongoose'
import type { User } from '@/types'

const Schema = mongoose.Schema

const AdminSchema = new Schema<User>({
    username: String,
    email: String,
    password: String,
    creat_date: String,
    update_date: String,
    is_delete: Number,
    timestamp: Number,
})

const Admin = mongoose.model<User>('Admin', AdminSchema)

export default Admin
