export interface VideoItem {
    definition: string
    quality: string
    vtype: string
    vwidth: number
    vheight: number
    bitrate: number
    real_bitrate: number
    fps: number
    codec_type: string
    size: number
    main_url: string
    backup_url_1: string
    file_id: string
    quality_type: number
    encryption_method: string
    logo_type: string
    url_expire: number
    user_video_proxy: number
    socket_buffer: number
    preload_size: number
    preload_interval: number
    preload_min_step: number
    preload_max_step: number
    file_hash: string
    p2p_verify_url: string
    check_info: string
    encrypt: boolean
    spade_a: string
    kid: string
    barrage_mask_url: string
    barrage_mask_offset: string
}

export interface Volume {
    loudness: number
    peak: number
    maximum_momentary_loudness: number
    maximum_short_term_loudness: number
    loudness_range_start: number
    loudness_range_end: number
    loudness_range: number
    version: number
    volume_info_json: string
}

export interface DouYinVideoData {
    status: number
    message: string
    enable_ssl: boolean
    auto_definition: string
    enable_adaptive: boolean
    video_id: string
    video_duration: number
    media_type: string
    video_list: Obj<VideoItem>
    volume: Volume
    popularity_level: number
    has_embedded_subtitle: boolean
    user_id: string
    validate: string
    poster_url: string
    key_seed: string
    optimal_decoding_mode: string
}

export interface DouYinVideo {
    data: DouYinVideoData
    message: string
    code: number
    total: number
}
