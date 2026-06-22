## 2026-06-22 10:36:36

### 后台文章模块优化

- 修复 `deletes`/`recover` 使用文章 ID 更新分类 `cate_num` 的错误，改为使用 `result.category`
- 新建 `src/utils/markdown.ts`，单例 `markdownIt` 并接入 `markdown-it-toc-and-anchor` 生成 TOC
- 抽取 `renderArticleContent`、`changeCategoryCount`、`parseCategory`，消除重复逻辑
- `insert`/`deletes`/`recover`/`modify` 写操作使用 Mongoose 事务保证数据一致性
- 补充 `insert`/`modify`/`deletes`/`recover` 入参防御性校验
- `getList`/`getItem` 只读查询改用 `.lean({ virtuals: true })`
- 精简 `backend-article.ts` 冗余行内注释

**Commit message:**

```
fix: 修复后台文章删除恢复时分类计数错误并优化模块结构

- 修复 deletes/recover 使用文章 ID 更新分类计数的 Bug
- 接入 markdown-it-toc-and-anchor 生成文章目录
- 抽取 Markdown 渲染与分类计数更新逻辑
- 写操作增加 Mongoose 事务与入参校验
```
