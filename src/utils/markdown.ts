import hljs from 'highlight.js'
import markdownIt from 'markdown-it'
import markdownItTocAndAnchor from 'markdown-it-toc-and-anchor'

const md = markdownIt({
    breaks: true,
    html: true,
    linkify: true,
    typographer: true,
    highlight(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, { language: lang }).value
            }
            catch (_error) {}
        }
        return ''
    },
}).use(markdownItTocAndAnchor, {
    toc: false,
    anchorLink: true,
})

/**
 * 将 Markdown 渲染为 HTML，并通过回调获取 TOC。
 * @param content Markdown 内容
 * @param html 若已提供 HTML 则跳过 Markdown 渲染
 */
export function renderArticleContent(content: string, html?: string): { html: string, toc: string } {
    if (html) {
        return { html, toc: '' }
    }

    let toc = ''
    const renderedHtml = md.render(content, {
        tocCallback(_tocMarkdown: string, _tocArray: unknown[], tocHtml: string) {
            toc = tocHtml
        },
    })

    return { html: renderedHtml, toc }
}
