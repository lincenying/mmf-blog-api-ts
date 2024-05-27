import * as helper from './app-public.helper'
import type { Req, Res } from '@/types'

export interface AppVersion {
    version: number
    ver: string
    url: string
}

export function checkUpdate(req: Req, res: Res) {
    const json = helper.checkUpdate()
    res.json(json)
}
