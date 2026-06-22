import type { Category, CategoryInsert, CategoryModify } from '~/types'

import CategoryM from '../../models/category'
import { getErrorMessage, getNowTime } from '../../utils'
import { fail, success } from '../../utils/response'

/**
 * 获取分类列表
 */
export async function getList() {
    try {
        const list = await CategoryM.find()
            .sort('-cate_order')
            .lean({ virtuals: true })
            .exec()
        return success({ list: list as Category[] })
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 获取分类详情
 */
export async function getItem(reqQuery: { id: string }) {
    const { id: _id } = reqQuery

    try {
        const result = await CategoryM.findOne({ _id })
            .lean({ virtuals: true })
            .exec()
        return success(result as Category | null)
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 新增分类
 */
export async function insert(reqBody: CategoryInsert) {
    const { cate_name, cate_order } = reqBody

    try {
        const creatData = {
            cate_name,
            cate_order,
            cate_num: 0,
            creat_date: getNowTime(),
            update_date: getNowTime(),
            is_delete: 0,
            timestamp: Number(getNowTime('X')),
        }
        const created = await CategoryM.create(creatData)
        return success(created.toObject(), '添加成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 软删除分类
 */
export async function deletes(reqQuery: { id: string }) {
    const { id: _id } = reqQuery

    try {
        const result = await CategoryM.updateOne({ _id }, { is_delete: 1 }).exec()
        if (result.matchedCount === 0) {
            return fail('没有找到该分类')
        }
        return success('success', '更新成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 恢复分类
 */
export async function recover(reqQuery: { id: string }) {
    const { id: _id } = reqQuery

    try {
        const result = await CategoryM.updateOne({ _id }, { is_delete: 0 }).exec()
        if (result.matchedCount === 0) {
            return fail('没有找到该分类')
        }
        return success('success', '更新成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}

/**
 * 编辑分类
 */
export async function modify(reqBody: CategoryModify) {
    const { id: _id, cate_name, cate_order } = reqBody

    try {
        const updated = await CategoryM.findOneAndUpdate(
            { _id },
            {
                cate_name,
                cate_order,
                update_date: getNowTime(),
            },
            { new: true },
        ).exec()

        if (!updated) {
            return fail('没有找到该分类')
        }

        return success(updated.toObject(), '更新成功')
    }
    catch (err: unknown) {
        return fail(getErrorMessage(err))
    }
}
