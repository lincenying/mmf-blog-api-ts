import mongooseAutopopulate from 'mongoose-autopopulate'
import mongoose from '../mongoose'

const TemplateSchema = new mongoose.Schema({
    string: {
        type: String,
        required: true, // 必填
        trim: true, // 去除前后空格
        lowercase: true, // 转为小写
        uppercase: true, // 转为大写
        minlength: 3, // 最小长度
        maxlength: 50, // 最大长度
        match: /^[a-z]+$/i, // 正则匹配
        default: 'small', // 默认值
        enum: ['small', 'medium', 'large'], // 枚举值
        index: true, // 创建索引
        unique: true, // 唯一索引
        sparse: true, // 稀疏索引
    },

    email: {
        type: String,
        required: [true, '邮箱是必需的'], // 自定义错误消息
        match: [/\S[^\s@]*@\S+\.\S+/, '邮箱格式不正确'], // 正则验证
        index: true, // 创建索引
    },

    number: {
        type: Number,
        min: [0, '年龄不能为负数'],
        max: [150, '年龄不能超过150'],
        validate: {
            validator(v: number) {
                return v % 1 === 0 // 必须是整数
            },
            message: '年龄必须是整数',
        },
        get: (v: number) => Math.round(v * 100) / 100, // getter
        set: (v: number) => Math.round(v * 100) / 100, // setter
    },

    date: {
        type: Date,
        // default: Date.now, // 默认当前时间
        min: '2020-01-01', // 最小日期
        max: '2030-12-31', // 最大日期
        default() {
            return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        },
    },
}, {
    // 自动创建索引
    autoIndex: true,
    // 缓冲命令
    bufferCommands: true,
    // 上限集合
    capped: { size: 1024, max: 1000 },
    // 类型转换
    typecast: true,
    // 严格查询
    strictQuery: true,
    // 自动添加 createdAt 和 updatedAt
    timestamps: true,
    // 版本控制
    versionKey: false, // 禁用 __v 字段
    // 集合名称
    collection: 'users',
    // 严格模式
    strict: true,
    // 转换选项, 在 JSON 中包含虚拟属性
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

// 虚拟属性 - 不存储在数据库中
TemplateSchema.virtual('id').get(function () {
    return this._id.toString()
})

TemplateSchema.virtual('fullName').get(function () {
    return `${this.string} ${this.email}`
})

TemplateSchema.alias('string', 'str')

// 多表关联
TemplateSchema.virtual('user', {
    ref: 'User', // model name
    localField: 'userid', // 本地字段
    foreignField: '_id', // 跨表字段
    justOne: true, // 默认情况下，填充的虚拟对象是一个数组。如果设置了 `justOne`，则填充的虚拟对象将是单个文档或 `null`。
    autopopulate: { path: 'user', select: '_id email username' },
})

// 在 JSON 中包含虚拟属性
TemplateSchema.set('toJSON', { virtuals: true })
TemplateSchema.set('toObject', { virtuals: true })

TemplateSchema.plugin(mongooseAutopopulate)

export default mongoose.model('Template', TemplateSchema)
