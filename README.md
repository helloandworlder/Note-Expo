# 轻量笔记 - Note Expo

一个功能完善的拟物风格笔记应用，基于 Expo SDK 54 构建。

## ✨ 功能特性

### 📝 核心功能
- **富文本编辑器**：支持三种模式
  - 纯文本模式
  - 富文本模式（RTF）
  - Markdown 模式

- **文件夹管理**：创建、编辑、删除文件夹，组织笔记
- **收藏功能**：快速标记和访问重要笔记
- **搜索功能**：全文搜索笔记标题和内容

### 🎨 设计特色
- **拟物风格**：木纹背景、纸张质感
- **精美UI**：卡片式设计、阴影效果
- **流畅动画**：自然的交互体验

### 🛠️ 编辑工具
- **快捷按钮**：
  - 标题
  - 居中
  - 列表
  - 粗体
  - 引用
  - 待办事项

### 📷 图片功能
- 插入图片
- 图片编排
- 图片备注

### 📤 导出功能
- 复制文字到剪贴板
- 以图片形式分享
- 导出为 PDF
- 发送邮件
- 分享到社交媒体

### 🔒 安全功能
- **Face ID / Touch ID**：生物识别保护
- **密码锁定**：自定义密码保护
- **数据加密**：使用 SecureStore 存储敏感信息

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Expo CLI
- iOS Simulator 或 Android Emulator（或真机）

### 安装依赖
\`\`\`bash
npm install
\`\`\`

### 运行应用
\`\`\`bash
# 启动开发服务器
npm start

# 在 iOS 上运行
npm run ios

# 在 Android 上运行
npm run android

# 在 Web 上运行
npm run web
\`\`\`

## 📁 项目结构

\`\`\`
Note-Expo/
├── src/
│   ├── components/        # UI 组件
│   │   ├── common/       # 通用组件
│   │   ├── editor/       # 编辑器组件
│   │   ├── folder/       # 文件夹组件
│   │   └── note/         # 笔记组件
│   ├── screens/          # 屏幕页面
│   │   ├── HomeScreen.tsx
│   │   ├── EditorScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── store/            # 状态管理
│   │   └── noteStore.ts
│   ├── types/            # TypeScript 类型
│   │   └── index.ts
│   ├── constants/        # 常量配置
│   │   └── theme.ts
│   └── utils/            # 工具函数
├── assets/               # 静态资源
├── App.tsx              # 应用入口
└── package.json
\`\`\`

## 🎯 核心技术栈

- **框架**：React Native + Expo SDK 54
- **导航**：React Navigation 7
- **状态管理**：Zustand
- **数据持久化**：AsyncStorage + SecureStore
- **Markdown 渲染**：react-native-markdown-display
- **生物识别**：expo-local-authentication
- **图片处理**：expo-image-picker
- **PDF 导出**：expo-print
- **分享功能**：expo-sharing

## 📱 功能演示

### 主屏幕
- 笔记列表展示
- 文件夹切换
- 搜索功能
- 快速创建笔记

### 编辑器
- 实时编辑
- 格式切换（纯文本/RTF/Markdown）
- 工具栏快捷操作
- 图片插入和管理

### 设置
- Face ID 开关
- 密码设置
- 应用信息

## 🔐 安全说明

- 所有敏感数据使用 SecureStore 加密存储
- 支持 Face ID / Touch ID 生物识别
- 支持自定义密码保护
- 应用启动时自动验证身份

## 📝 数据存储

- **笔记数据**：AsyncStorage（JSON 格式）
- **密码**：SecureStore（加密存储）
- **设置**：AsyncStorage

## 🎨 主题配置

应用使用拟物风格设计，主要颜色：
- 木纹背景：#D4B896
- 纸张颜色：#FFFEF7
- 强调色：#C9A86A

可在 `src/constants/theme.ts` 中自定义主题。

## 🛠️ 开发说明

### 添加新功能
1. 在 `src/types/index.ts` 中定义类型
2. 在 `src/store/noteStore.ts` 中添加状态和操作
3. 创建相应的组件和屏幕
4. 更新导航配置

### 自定义主题
编辑 `src/constants/theme.ts` 文件修改颜色、字体大小、间距等。

## 📄 许可证

MIT License

## 👨‍💻 作者

SynexIM Project

---

**享受使用轻量笔记！** 📝✨
