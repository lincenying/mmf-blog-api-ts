import fs from 'node:fs'
import type { Req, Res } from '@/types'

export function checkUpdate(req: Req, res: Res) {
    const jsonTxt = fs.readFileSync('./src/config/app.json', 'utf-8')
    const json = JSON.parse(jsonTxt)
    res.json({ code: 200, data: json })
}
