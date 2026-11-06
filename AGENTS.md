1. 主应用入口为 src/App.vue
2. 组件vue版本为vue2.6，创建组件需要支持vue2.6以上
3. AntV 测试页可通过 ？page=antv 访问
4. 保持 RelationshipTree 与数据源解耦
5. 不要手动编辑生成的 dist 文件,不要编辑和用户指令无关的租金按
6. 源码使用 UTF-8 无 BOM 编码
7. 优先小范围修改，避免大范围重构
8. 组件 demo 页面必须左右结构：左预览/展示、右配置面板（约 420px），并且每次创建新组件都需要生成
9. demo 页面禁止 `position: fixed` 全屏覆盖，须渲染在 ComponentHome 外壳内
10. 新增组件 demo 三步：注册路由 + ComponentHome 加导航项 + 创建 demo 页面
11. demo页面分为左侧栏目区和右侧工作区，工作区展示组件示例的演示，如果组件演示需要动态修改，工作区分为左右两个区域，左侧负责预览展示，右侧进行配置编辑
12. 组件 demo 的"示例代码"必须使用 CodeViewer 代码可视化组件展示，并放在左侧预览/展示区下方，不要放在右侧配置面板；生成代码需随配置、数据实时更新，统一用 src/utils/sampleCode.js 的 buildSfcCode 生成
