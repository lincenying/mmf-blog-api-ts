import type { Article } from '~/types'
import mongoose from '../mongoose'

/**
 * 文章模型的Schema定义
 * @property {string} title - 文章标题
 * @property {string} content - 文章内容（Markdown格式）
 * @property {string} html - 文章内容（HTML格式）
 * @property {string} toc - 文章目录
 * @property {string} category - 文章分类ID
 * @property {string} category_name - 文章分类名称
 * @property {number} visit - 文章访问次数
 * @property {number} like - 文章点赞次数
 * @property {number} comment_count - 文章评论数量
 * @property {string} creat_date - 文章创建日期
 * @property {string} update_date - 文章更新日期
 * @property {number} is_delete - 文章是否已删除（0表示未删除，1表示已删除）
 * @property {number} timestamp - 文章时间戳
 * @property {string[]} likes - 点赞用户ID列表
 */
const ArticleSchema = new mongoose.Schema<Article>(
    {
        title: String,
        content: String,
        html: String,
        toc: String,
        category: String,
        category_name: String,
        visit: Number,
        like: Number,
        comment_count: Number,
        creat_date: String,
        update_date: String,
        is_delete: { type: Number, default: 0 },
        timestamp: Number,
        likes: [String],
    },
    {
        // id: true, // 会默认生成一个虚拟值 id，指向文档的 _id 字段
        toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
        toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
    },
)

ArticleSchema.virtual('id').get(function () {
    return this._id.toString()
})

export default mongoose.model<Article>('Article', ArticleSchema)
