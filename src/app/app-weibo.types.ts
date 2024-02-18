import type { WeiBoBlogItem2 } from './app-weibo'

export interface Visible {
    type: number
    list_id: number
}

export interface Focus_point {
    left: number
    top: number
    width: number
    height: number
}

export interface Pic_focus_point {
    focus_point: Focus_point
    pic_id: string
}

export interface Badge {
    bind_taobao: number
    user_name_certificate: number
    wenda_v2: number
    weibo_display_fans: number
    relation_display: number
    status_visible: number
    hongbao_2020: number
    pc_new: number
    vpick_2020: number
    hongbaofeifuniu_2021: number
    hongbaofeijika_2021: number
    weibozhiyebobao_2021: number
    hongbaofei2022_2021: number
    video_visible: number
    iplocationchange_2022: number
    gaokao_2022: number
    hongrenjie_2022: number
    ranghongbaofei_2023: number
    chunjiesheyingdasai_2023: number
    muqinjie_2023: number
    gaokao_2023: number
}

export interface User {
    id: number
    screen_name: string
    profile_image_url: string
    profile_url: string
    statuses_count: number
    verified: boolean
    verified_type: number
    verified_type_ext: number
    verified_reason: string
    close_blue_v: boolean
    description: string
    gender: string
    mbtype: number
    svip: number
    urank: number
    mbrank: number
    follow_me: boolean
    following: boolean
    follow_count: number
    followers_count: string
    followers_count_str: string
    cover_image_phone: string
    avatar_hd: string
    like: boolean
    like_me: boolean
    badge: Badge
}

export interface Number_display_strategy {
    apply_scenario_flag: number
    display_text_min_number: number
    display_text: string
}

export interface Comment_manage_info {
    comment_permission_type: number
    approval_comment_type: number
    comment_sort_type: number
}

export interface Hot_page {
    fid: string
    feed_detail_type: number
}

export interface Page_pic {
    url: string
}

export interface Page_info_url {
    mp4_720p_mp4: string
    mp4_hd_mp4: string
    mp4_ld_mp4: string
}

export interface Page_info {
    type: string
    object_type: number
    page_pic: Page_pic
    page_url: string
    page_title: string
    content1: string
    content2: string
    video_orientation: string
    play_count: string
    media_info: {
        stream_url: string
        stream_url_hd: string
        mp4_720p_mp4?: string
        mp4_hd_url?: string
        mp4_sd_url?: string
        duration: number
    }
    urls: Page_info_url
}

export interface Geo {
    width: number
    height: number
    croped: boolean
}

export interface Large {
    size: string
    url: string
    geo: Geo
}

export interface Pic {
    pid: string
    url: string
    size: string
    geo: Geo
    large: Large
}

export interface Mblog {
    visible: Visible
    created_at: string
    id: string
    mid: string
    edit_count: number
    can_edit: boolean
    edit_at: string
    show_additional_indication: number
    text: string
    textLength: number
    source: string
    favorited: boolean
    pic_ids: string[]
    pic_focus_point: Pic_focus_point[]
    falls_pic_focus_point: any[]
    pic_rectangle_object: any[]
    pic_flag: number
    thumbnail_pic: string
    bmiddle_pic: string
    original_pic: string
    is_paid: boolean
    mblog_vip_type: number
    user: User
    picStatus: string
    reposts_count: number
    comments_count: number
    reprint_cmt_count: number
    attitudes_count: number
    pending_approval_count: number
    isLongText: boolean
    show_mlevel: number
    darwin_tags: any[]
    ad_marked: boolean
    mblogtype: number
    rid: string
    cardid: string
    number_display_strategy: Number_display_strategy
    content_auth: number
    safe_tags: number
    comment_manage_info: Comment_manage_info
    pic_num: number
    hot_page: Hot_page
    new_comment_style: number
    ab_switcher: number
    mlevel: number
    region_name: string
    region_opt: number
    page_info: Page_info
    pics: Pic[]
    bid: string
    retweeted_status: Mblog
}

export interface Actionlog {
    source: string
    act_code: string
    act_type: string
    fid: string
    lfid: string
    oid: string
    uicode: string
    ext: string
}

export interface Mblog_button {
    type: string
    name: string
    pic: string
    actionlog: Actionlog
}

export interface Cardlist_head_card {
    channel_list?: any
}

export interface CardlistInfo {
    v_p: string
    statistics_from: string
    containerid: string
    title_top: string
    show_style: number
    total: number
    can_shared: number
    since_id: number
    cardlist_title: string
    desc: string
    hot_request_id: string
    focus_model_id: string
    cardlist_head_cards: Cardlist_head_card[]
}

export interface Pic_item {
    pic: string
    scheme: string
    pic_big: string
    banner_id: string
    actionlog: Actionlog
}

export interface Card_group {
    card_type: string
    itemid: string
    oid: string
    width: number
    height: number
    card_ad_style: number
    is_show_corner_radius: number
    pic_h_w_scale: number
    pic_bgcolor_type: number
    card_type_name: string
    force_need_seperator: string
    position: string
    trend_ext: string
    pic_items: Pic_item[]
    auto_flow: number
    flow_gap: number
    mblog: Mblog
}

export interface Card {
    card_type: number
    title: string
    itemid: string
    card_group: Card_group[]
    buttontitle: string
    show_type: string
    is_unite: string
    title_pos: string
    unlike: string
    scheme: string
    weibo_need: string
    mblog: Mblog
    mblog_buttons: Mblog_button[]
    hot_request_id: string
}

export interface Data1 {
    cardlistInfo: CardlistInfo
    cards: Card[]
    scheme: string
    pageInfo: any
    showAppTips: number
    openApp: number
}

export interface WeiboObject {
    ok: number
    data: Data1
}

export interface Video {
    mp4_hd_mp4: string
    mp4_ld_mp4: string
    mp4_720p_mp4: string
}

export interface Content2 {
    id: string
    pics?: Pic[]
    text: string
    video: Video
    video_img: string
}

export interface Data2 {
    id: number
    card_id: number
    content: WeiBoBlogItem2[]
    total: number
}

export interface CardReturn {
    data: Data2
    ok: number
    http_code: number
    code: number
    total: number
}
