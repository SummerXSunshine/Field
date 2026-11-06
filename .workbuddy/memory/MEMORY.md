# 项目长期记忆

## 组件 Demo 布局规范（用户明确要求，必须严格遵守）

1. 所有组件 demo 页面统一采用**左右结构**：左侧预览/展示区，右侧配置区（约 420px 固定宽）。
2. demo 页面避免使用 `position: fixed` 全屏覆盖，应渲染在 ComponentHome 外壳内，保证左侧分类导航可见。
3. 新增组件 demo 固定三步：`src/router.js` 注册路由 + `src/views/ComponentHome.vue` 的 `categories` 加入导航项 + `src/views/` 下新建 demo 页面。
4. 组件 demo 的“示例代码”必须用 CodeViewer 展示，且放在**左侧预览区下方**，不要放在右侧配置面板；代码随配置/数据实时生成。
5. 以上规则同步维护在根目录 `AGENTS.md`（用户会自行增删条目，编辑时先读取最新内容，不要覆盖其改动）。

注：右侧工作区的常驻组件切换 tab 栏曾实现过，用户明确要求删除，不要再加回来。

## 组件现状

- `src/components/BaseForm/BaseForm.vue`：原 `ConfigurableElementForm` 重命名而来，可配置表单。
- `src/components/ViewForm/ViewForm.vue`：原 `ConfigurableInfoDisplay` 重命名而来（2026-11-06 用户要求），纯文本信息展示组件，接收 data + config（fields/labelWidth/emptyText/gutter/bordered），支持嵌套路径取值、formatter、field-click 事件。早先那个"与 BaseForm 同配置的只读表单组件 ViewForm"已被删除，勿混淆。
- `src/components/CodeViewer/CodeViewer.vue`：基于 highlight.js 10.7.3 的代码可视化组件（行号 + 高亮 + 复制），用于 demo 的示例代码展示。
- `src/views/ViewFormDemo.vue`：ViewForm 的 demo，左右结构（左预览、右配置）；左侧预览下方用 CodeViewer 展示实时生成的示例代码，右侧通过表单填写展示项（label/prop/key/span）、全局配置与 data JSON，实时生成 config JSON 并支持修改、复制。
