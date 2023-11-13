import CategoryM from '../models/category'
import type { Category, CategoryInsert, CategoryModify, Req, Res, ResList } from '@/types'
import { getErrorMessage, getNowTime } from '@/utils'

/**
 * 管理时, 获取分类列表
 * @method
 * @param req Request
 * @param res Response
 */
export async function getList(req: Req, res: Res) {
    try {
        const result = await CategoryM.find().sort('-cate_order').exec().then(data => data.map(item => item.toObject()))
        const json: ResList<Category[]> = {
            code: 200,
            data: {
                list: result,
            },
        }
        res.json(json)
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 管理时, 获取分类详情
 * @method
 * @param req Request
 * @param res Response
 */
export async function getItem(req: Req<{ id: string }>, res: Res) {
    const _id = req.query.id
    if (!_id)
        res.json({ code: -200, message: '参数错误' })

    try {
        const result = await CategoryM.findOne({ _id }).exec().then(data => data?.toObject())
        res.json({ code: 200, data: result })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 管理时, 新增分类
 * @method
 * @param req Request
 * @param res Response
 */
export async function insert(req: Req<object, CategoryInsert>, res: Res) {
    const cate_name = req.body.cate_name
    const cate_order = req.body.cate_order
    if (!cate_name || !cate_order) {
        res.json({ code: -200, message: '请填写分类名称和排序' })
    }
    else {
        try {
            const creatData = {
                cate_name,
                cate_order,
                cate_num: 0,
                creat_date: getNowTime(),
                update_date: getNowTime(),
                is_delete: 0,
                timestamp: getNowTime('X'),
            }
            const result = await CategoryM.create(creatData).then(data => data.toObject())
            res.json({ code: 200, message: '添加成功', data: result })
        }
        catch (err: unknown) {
            res.json({ code: -200, data: null, message: getErrorMessage(err) })
        }
    }
}

/**
 * 管理时, 删除分类
 * @method
 * @param req Request
 * @param res Response
 */
export async function deletes(req: Req<{ id: string }>, res: Res) {
    const _id = req.query.id
    try {
        await CategoryM.updateOne({ _id }, { is_delete: 1 }).exec()
        res.json({ code: 200, message: '更新成功', data: 'success' })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 管理时, 恢复分类
 * @method
 * @param req Request
 * @param res Response
 */
export async function recover(req: Req<{ id: string }>, res: Res) {
    const _id = req.query.id
    try {
        await CategoryM.updateOne({ _id }, { is_delete: 0 }).exec()
        res.json({ code: 200, message: '更新成功', data: 'success' })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 管理时, 编辑分类
 * @method
 * @param req Request
 * @param res Response
 */
export async function modify(req: Req<object, CategoryModify>, res: Res) {
    const id = req.body.id
    const cate_name = req.body.cate_name
    const cate_order = req.body.cate_order
    try {
        const result = await CategoryM.findOneAndUpdate({ _id: id }, {
            cate_name,
            cate_order,
            update_date: getNowTime(),
        }, { new: true }).exec().then(data => data?.toObject())
        res.json({ code: 200, message: '更新成功', data: result })
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}
