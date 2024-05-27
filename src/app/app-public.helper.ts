import fs from 'node:fs'
import type { ResData } from '@/types'

export interface AppVersion {
    version: number
    ver: string
    url: string
}

export function checkUpdate() {
    const jsonTxt = fs.readFileSync('./src/config/app.json', 'utf-8')
    const json: ResData<AppVersion | null> = {
        code: 200,
        data: JSON.parse(jsonTxt) as AppVersion,
    }

    return json
}
