## 2026-06-22 12:15:00

### 修复 supertest TestAgent 类型导入错误

- `tests/helpers/app.ts` 使用 `supertest.Agent` 定义并导出 `TestAgent` 类型别名
- `tests/helpers/auth.ts` 改为从 `./app` 导入 `TestAgent`

**Commit message:**

```
fix: 修复 supertest TestAgent 类型导入错误
```

## 2026-06-22 12:02:24

### Vitest 接口测试（直连本地 MongoDB）

- 新增 Vitest + Supertest 测试基础设施（`vitest.config.ts`、`tests/setup.ts`）
- 重构 `src/app.ts` 导出 `createApp()`，测试环境跳过 HTTP listen
- 新增 `tests/helpers/`（app、auth、db、fixtures）与 8 个测试文件，覆盖 41 个 JSON API
- 测试直连本地 `mmfblog_v2` 开发库，读接口基于库内数据断言，写接口以鉴权/校验为主
- 微信 `jscode2session` 使用 mock axios，markdown 渲染在测试中 mock 以避免依赖冲突
- `package.json` 新增 `test` / `test:watch` / `test:coverage` 脚本

**Commit message:**

```
test: 新增 Vitest 接口测试直连本地 MongoDB

- 搭建 Supertest 测试基础设施与 helpers
- 覆盖 backend/frontend 共 41 个 JSON API
- createApp 导出支持测试环境复用
```

## 2026-06-22 11:18:30

### 审查问题修复

- 文章/评论软删除与恢复增加幂等保护，避免重复操作导致计数错误
- 评论发布前校验文章是否存在
- 取消点赞前校验用户是否已点赞
- 新增 `utils/transaction.ts`，单机 MongoDB 不支持事务时自动降级
- 新增 `failWithCode()`，鉴权中间件统一响应结构（保留 -400/-500 错误码）
- `app.ts`、`routes/index.ts` 404 响应统一使用 `fail()`
- 更新 `docs/change.md`，移除已删除 `src/api/` 的过时描述

**Commit message:**

```
fix: 修复软删除幂等性并统一错误响应格式

- 文章/评论删恢复幂等保护，评论发布校验文章存在
- 点赞取消前校验状态，事务不支持时自动降级
- 鉴权与 404 响应统一使用 response 工具
```

## 2026-06-22 10:58:29

### 前台剩余模块规范对齐

- 迁移前台文章至 `src/modules/public-article/`
- 迁移用户模块至 `src/modules/user/`（含前台与后台用户管理）
- 迁移评论模块至 `src/modules/comment/`
- 迁移点赞模块至 `src/modules/like/`
- 新建 `src/utils/html.ts` 抽取 HTML 转义工具
- 前台/后台路由全面接入 `express-validator` 校验
- 404 响应统一使用 `fail()` 工具
- 修复评论删除/恢复使用评论 ID 更新文章计数的 Bug
- 修复评论删除时 `is_delete` 赋值错误（原为 0，应为 1）
- 评论发布、删除、恢复使用 Mongoose 事务
- 用户/评论列表排除 `password` 字段，查询改用 `.lean()`
- `User`/`Comment` 模型补充索引
- 移除 `src/api/` 兼容层，路由直接引用 `modules/`

**Commit message:**

```
refactor: 前台用户文章评论点赞模块对齐 Express 规范

- 迁移 public-article/user/comment/like 至 modules 分层
- 修复评论删除恢复计数 Bug 并接入路由校验与事务
- 用户接口排除密码字段，统一响应与查询优化
```

## 2026-06-22 10:52:50

### 后台分类与管理员模块规范对齐

- 迁移分类模块至 `src/modules/category/`（controller / service / validator）
- 迁移管理员模块至 `src/modules/admin/`（controller / service / validator）
- 抽取 `src/modules/shared/validators.ts` 通用 `idQueryValidator` 与 `paginationQueryValidator`
- 文章校验器复用共享分页校验规则
- 分类 `getItem` 修复缺少 `id` 时仍执行查询的逻辑问题
- 分类/管理员删除恢复增加「未找到记录」校验
- 管理员列表与详情接口排除 `password` 字段返回
- `Category`/`Admin` 模型补充索引
- 移除 `src/api/` 兼容层，路由直接引用 `modules/`

**Commit message:**

```
refactor: 后台分类与管理员模块对齐 Express 规范

- 迁移 category/admin 至 modules 分层并接入路由校验
- 抽取共享校验器，修复分类 getItem 逻辑 Bug
- 管理员接口排除密码字段，补充模型索引
```

## 2026-06-22 10:43:39

### 后台文章模块规范对齐优化

- 新建 `src/utils/response.ts`，提供 `success`/`fail`/`paginate` 统一响应工具
- 接入 `express-validator`，新增 `middlewares/validate.ts` 与 `modules/article/article.validator.ts`
- 迁移文章模块至 `src/modules/article/`（controller / service / validator 分层）
- 移除 `src/api/` 兼容层，路由直接引用 `modules/`
- 文章列表查询增加字段投影，排除 `content`/`html`/`toc` 大字段
- `Article` 模型补充 `title`、`category+is_delete`、`update_date`、`is_delete` 索引

**Commit message:**

```
refactor: 后台文章模块对齐 Express 规范分层与校验

- 新增统一响应工具与 express-validator 路由校验
- 迁移文章模块至 modules/article 分层结构
- 列表接口字段投影与 Article 模型索引优化
```

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
