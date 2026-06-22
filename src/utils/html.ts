/**
 * 转义 HTML 中可能造成 XSS 的片段
 */
export function replaceHtmlTag(html: string) {
    return html
        .replace(/<script(.*?)>/gi, '＜script$1＞')
        .replace(/<\/script>/g, '＜/script＞')
        .replace(/\$'/g, '$ \'')
        .replace(/\$`/g, '$ `')
}
