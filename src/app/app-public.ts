import type { Req, Res } from '~/types'
import * as helper from './app-public.helper'

export interface AppVersion {
    version: number
    ver: string
    url: string
}

export function checkUpdate(_req: Req, res: Res) {
    const json = helper.checkUpdate()
    res.json(json)
}
