import type { Pic } from './app-weibo.types'

export interface Page_pic {
    url: string
    height: string
    width: string
    pid: string
    source: string
    is_self_cover: string
    type: string
}

export interface Media_info {
    stream_url: string
    stream_url_hd: string
    duration: string
}

export interface Url {
    mp4_hd_mp4: string
    mp4_ld_mp4: string
    mp4_720p_mp4: string
}

export interface Page_info {
    type: string
    object_type: number
    url_ori: string
    page_pic: Page_pic
    page_url: string
    object_id: string
    page_title: string
    title: string
    content1: string
    content2: string
    video_orientation: string
    play_count: string
    media_info: Media_info
    urls: Url
}

export interface Data {
    darwin_tags: any[]
    item_category: string
    region_opt: string
    show_additional_indication: string
    text: string
    mblogtype: string
    created_at: string
    safe_tags: string
    mblog_vip_type: string
    show_mlevel: string
    source: string
    interactions: any[]
    mid: string
    can_edit: boolean
    mlevel: string
    reward_scheme: string
    pic_num: string
    new_comment_style: string
    pic_ids: any[]
    rid: string
    textLength: string
    attitudes_count: number
    isLongText: boolean
    id: string
    fid: string
    region_name: string
    reposts_count: number
    ad_marked: boolean
    pending_approval_count: string
    cardid: string
    ab_switcher: string
    is_paid: boolean
    reprint_cmt_count: string
    favorited: boolean
    comments_count: number
    content_auth: string
    page_info: Page_info
    bid: string
    pics: Pic[]
}

export interface Content1 {
    type: string
    data: Data
    mid: string
}

export interface CardObject {
    data: {
        id: number
        card_id: number
        content: Content1[]
        total: number
    }
    ok: number
    http_code: number
}
