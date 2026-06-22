import type { Response } from 'supertest'

export function expectSuccess(res: Response) {
    expect(res.body.code).toBe(200)
}

export function expectFail(res: Response, message?: string) {
    expect(res.body.code).toBe(-200)
    if (message) {
        expect(res.body.message).toBe(message)
    }
}

export function expectAuthFailAdmin(res: Response) {
    expect(res.body.code).toBe(-500)
}

export function expectAuthFailUser(res: Response) {
    expect(res.body.code).toBe(-400)
}

export function expectPaginate(res: Response) {
    expectSuccess(res)
    expect(res.body.data).toMatchObject({
        list: expect.any(Array),
        total: expect.any(Number),
        hasNext: expect.any(Number),
        hasPrev: expect.any(Number),
    })
}

export function expectNotFound(res: Response) {
    expectFail(res, '没有找到该页面')
}
