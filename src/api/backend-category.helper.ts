import CategoryM from '../models/category'
import { getErrorMessage, getNowTime } from '../utils'
import type { Category, CategoryInsert, CategoryModify, ResData } from '@/types'

/**
 * 管理时, 获取分类列表
 */
export async function getList() {
    let json: ResData<Nullable<{ list: Category[] }>>

    try {
        const result = await CategoryM.find().sort('-cate_order').exec().then(data => data.map(item => item.toObject()))
        json = {
            code: 200,
            data: {
                list: result,
            },
        }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    return json
}

/**
 * 管理时, 获取分类详情
 */
export async function getItem(reqQuery: { id: string }) {
    let json: ResData<Nullable<Category>>

    const {
        id: _id,
    } = reqQuery

    if (!_id) {
        json = { code: -200, data: null, message: '参数错误' }
    }

    try {
        const filter = { _id }
        const result = await CategoryM.findOne(filter).exec().then(data => data?.toObject())
        json = { code: 200, data: result }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    return json
}

/**
 * 管理时, 新增分类
 */
export async function insert(reqBody: CategoryInsert) {
    let json: ResData<Nullable<Category>>

    const {
        cate_name,
        cate_order,
    } = reqBody

    if (!cate_name || !cate_order) {
        json = { code: -200, data: null, message: '请填写分类名称和排序' }
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
            json = { code: 200, message: '添加成功', data: result }
        }
        catch (err: unknown) {
            json = { code: -200, data: null, message: getErrorMessage(err) }
        }
    }

    return json
}

/**
 * 管理时, 删除分类
 */
export async function deletes(reqQuery: { id: string }) {
    let json: ResData<Nullable<string>>

    const {
        id: _id,
    } = reqQuery

    try {
        const filter = { _id }
        const body = { is_delete: 1 }
        await CategoryM.updateOne(filter, body).exec()
        json = { code: 200, message: '更新成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    return json
}

/**
 * 管理时, 恢复分类
 */
export async function recover(reqQuery: { id: string }) {
    let json: ResData<Nullable<string>>

    const {
        id: _id,
    } = reqQuery

    try {
        const filter = { _id }
        const body = { is_delete: 0 }
        await CategoryM.updateOne(filter, body).exec()
        json = { code: 200, message: '更新成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    return json
}

/**
 * 管理时, 编辑分类
 */
export async function modify(reqBody: CategoryModify) {
    let json: ResData<Nullable<Category>>

    const {
        id: _id,
        cate_name,
        cate_order,
    } = reqBody

    try {
        const filter = { _id }
        const body = {
            cate_name,
            cate_order,
            update_date: getNowTime(),
        }
        const result = await CategoryM.findOneAndUpdate(filter, body, { new: true }).exec().then(data => data?.toObject())
        json = { code: 200, message: '更新成功', data: result }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    return json
}
