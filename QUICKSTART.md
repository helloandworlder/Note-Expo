# 快速启动指南

## 🚀 立即开始

### 1. 启动开发服务器
\`\`\`bash
npm start
\`\`\`

### 2. 选择运行平台
启动后会出现一个二维码和选项菜单：

- 按 `i` - 在 iOS 模拟器中打开
- 按 `a` - 在 Android 模拟器中打开
- 按 `w` - 在浏览器中打开
- 扫描二维码 - 在真机上使用 Expo Go 应用打开

## 📱 在真机上测试

### iOS
1. 在 App Store 下载 "Expo Go"
2. 运行 `npm start`
3. 使用相机扫描终端中的二维码

### Android
1. 在 Google Play 下载 "Expo Go"
2. 运行 `npm start`
3. 使用 Expo Go 应用扫描二维码

## 🎯 首次使用

1. **创建笔记**：点击右上角的 ✏️ 图标
2. **添加文件夹**：点击 📁+ 图标创建新文件夹
3. **设置安全**：点击 ⚙️ 进入设置，启用 Face ID 或密码保护
4. **编辑笔记**：
   - 点击 AI 按钮切换格式（纯文本/RTF/Markdown）
   - 点击 📷 插入图片
   - 点击 ✓ 保存笔记
5. **导出笔记**：点击 ↗️ 选择导出方式

## 🔧 常见问题

### 依赖安装失败
\`\`\`bash
# 清除缓存并重新安装
rm -rf node_modules package-lock.json
npm install
\`\`\`

### iOS 模拟器无法启动
确保已安装 Xcode 和 iOS 模拟器：
\`\`\`bash
xcode-select --install
\`\`\`

### Android 模拟器无法启动
确保已安装 Android Studio 和配置了 Android SDK。

## 📝 开发提示

- 修改代码后会自动热重载
- 按 `r` 重新加载应用
- 按 `m` 切换开发菜单
- 按 `j` 打开调试器

## 🎨 自定义主题

编辑 `src/constants/theme.ts` 修改颜色和样式：
\`\`\`typescript
export const COLORS = {
  woodBackground: '#D4B896',  // 木纹背景色
  paperYellow: '#FFF9E6',     // 纸张颜色
  accent: '#C9A86A',          // 强调色
  // ...
};
\`\`\`

## 🔐 测试安全功能

### Face ID（仅真机）
1. 进入设置
2. 启用 Face ID
3. 重启应用测试

### 密码锁定
1. 进入设置
2. 点击"设置"密码
3. 输入密码（至少4位）
4. 重启应用测试

## 📦 构建生产版本

### iOS
\`\`\`bash
eas build --platform ios
\`\`\`

### Android
\`\`\`bash
eas build --platform android
\`\`\`

需要先安装 EAS CLI：
\`\`\`bash
npm install -g eas-cli
eas login
\`\`\`

## 🐛 调试

### 查看日志
\`\`\`bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
\`\`\`

### 清除数据
应用数据存储在 AsyncStorage 和 SecureStore 中。
要清除所有数据，可以在设置中添加"清除数据"功能，或重新安装应用。

## 💡 功能演示

### 创建第一条笔记
1. 点击右上角 ✏️
2. 输入标题和内容
3. 点击底部 ✓ 保存

### 使用 Markdown
1. 创建或编辑笔记
2. 点击顶部格式按钮
3. 选择"Markdown 模式"
4. 使用 Markdown 语法编写

### 插入图片
1. 在编辑器中点击 📷
2. 选择图片
3. 图片会显示在笔记中
4. 点击图片右上角 × 可删除

## 🎉 享受使用！

如有问题，请查看 README.md 或提交 Issue。
