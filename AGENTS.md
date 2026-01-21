# AGENTS.md

本文件用于指导在本仓库工作的智能代理，确保改动小、可审查并符合现有风格。

## 仓库速览
- App: Expo SDK 54 / React Native 0.81 / React 19
- Navigation: React Navigation (native stack)
- 状态管理: Zustand store 在 `src/store/noteStore.ts`
- 入口: `App.tsx`
- 主题/设计令牌: `src/constants/theme.ts`
- 主要页面: Home / Editor / Settings

## 环境与安装
- Node.js 18+
- 安装依赖: `npm install`
- 可选使用 bun 执行脚本: `bun run <script>`

## 运行与构建
- 开发服务器: `npm start`
- iOS: `npm run ios`
- Android: `npm run android`
- Web: `npm run web`
- 构建: 未配置 (Expo 项目，如需请使用 EAS)
- 类型检查(手动): `npx tsc --noEmit`

## Lint / Test
- Lint: `npm run lint`
- Tests: `npm run test`
- Watch: `npm run test:watch`
- Typecheck: `npm run typecheck`

### 单测运行
- 单测命令: `npm run test:single -- <file>`
- 示例: `npm run test:single -- __tests__/contentConverter.test.ts`
- bun 示例: `bun run test:single -- __tests__/contentConverter.test.ts`

## 代码风格与约定
遵循现有代码风格，参考 `App.tsx`、`src/screens/*`、`src/components/*`。

### Imports
- 使用 ES module + 单引号
- 按来源分组:
- 1) React / React Native
- 2) 第三方库 (expo/react-navigation/zustand 等)
- 3) 本地模块 (相对路径)
- 同组保持紧凑，移除未使用 import

### 格式化
- 2 空格缩进
- 语句以分号结尾
- 多行对象/数组使用尾逗号
- 长参数列表换行对齐
- JSX/TSX 中保持一块一语义

### TypeScript
- `tsconfig.json` 启用 `strict: true`
- 组件 props 使用 `interface` + `React.FC<Props>`
- 能推断则不强制显式类型，但回调/事件参数尽量显式
- 字符串联合类型充当枚举 (见 `FormatType`)
- 避免 `any`，导航参数如需临时使用应标注 TODO

### 命名
- 组件/Screen: `PascalCase` (文件与导出一致)
- Hooks/变量: `camelCase`
- 常量: `UPPER_SNAKE_CASE` (主题常量集中在 `src/constants/theme.ts`)
- 工具函数文件: `camelCase.ts`
- 类型: `PascalCase` (放在 `src/types`)

### React/状态模式
- 仅使用函数式组件和 hooks
- Screen 放 `src/screens/`，通用 UI 放 `src/components/`
- 列表渲染避免 inline 匿名函数，必要时抽出渲染器
- 状态更新保持不可变 (spread/map/filter)
- 业务状态与持久化集中在 `src/store/noteStore.ts`
- 初始化数据用 `useEffect`，依赖数组保持准确

### 样式与主题
- 使用 `StyleSheet.create`
- 样式尽量使用 `COLORS`、`SPACING`、`FONT_SIZES`、`BORDER_RADIUS`、`FONTS`
- 不要硬编码颜色，新增主题值放入 `src/constants/theme.ts`
- 布局/文字样式保留在组件同文件
- 拟物风格 UI: 木纹背景、纸张卡片、阴影保持一致
- 常用包裹: `WoodBackground` + `PaperCard`

### 导航
- Stack 定义在 `App.tsx`
- 现有屏幕名称: `Home` / `Editor` / `Settings`
- 新增页面需同步更新导航栈与相关类型

### 错误处理
- 异步逻辑使用 `try/catch`
- 用户可见错误用 `Alert.alert`
- 记录错误使用 `console.error('描述', error)`
- 不要静默失败，提供兜底 UI 或提示

### 存储与安全
- 普通数据: `AsyncStorage`
- 敏感数据: `expo-secure-store`
- 生物识别/密码流程集中在锁屏与设置页面
- 禁止在代码/日志中写入密钥/令牌

### 数据与类型
- 类型集中在 `src/types/index.ts`
- 核心类型: `Note` / `Folder` / `NoteImage` / `FormatType`
- 新字段需同步更新 store 的序列化/反序列化
- 时间字段使用 `Date.now()` (毫秒)

### UI/交互
- 屏幕使用 `SafeAreaView`，默认 `edges={['top']}`
- 列表使用 `FlatList` + `keyExtractor`
- 删除/敏感操作需二次确认 (Alert)
- 图标多用 emoji，与现有风格一致
- 输入框设置 `placeholderTextColor`

### 性能与可维护性
- 避免在渲染周期内创建重型对象/函数
- 长列表优先使用 `FlatList`，避免 `ScrollView` 承载大量条目
- 复用 `PaperCard`、`WoodBackground` 等基础组件

### 文案与注释
- UI 文案为中文，新增文案保持一致
- 新增注释使用中文，避免混合语言

## 新增功能流程
- 在 `src/types/index.ts` 添加类型
- 在 `src/store/noteStore.ts` 添加状态与 action
- 在 `src/screens/` 或 `src/components/` 创建 UI
- 在 `App.tsx` 注册导航路由
- 若新增选项/按钮，更新 `src/constants/theme.ts`

## 项目结构
- `App.tsx` 应用入口与导航
- `src/screens/` 页面
- `src/components/` UI 组件
- `src/components/common/` 通用组件 (背景/卡片/锁屏)
- `src/components/editor/` 编辑器相关
- `src/store/` Zustand store + 持久化
- `src/constants/` 主题与常量
- `src/types/` 共享类型
- `src/utils/` 工具函数
- `assets/` 静态资源

## Cursor / Copilot 规则
- 未发现 `.cursor/rules/`、`.cursorrules` 或 `.github/copilot-instructions.md`

## 给智能代理的提醒
- 先澄清需求再改代码，保持改动小而可审查
- 优先复用现有组件、主题 token、工具函数
- 触及安全/隐私功能时先确认范围
- 新增工具链/测试/脚本时同步更新本文件
- 不要引入新的生产依赖，除非明确需求
