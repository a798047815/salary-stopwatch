# 赚钱秒表桌面小部件插件

## 功能说明
为赚钱秒表APP提供Android桌面小部件支持

## 特性
- 📊 实时显示当前已赚工资
- ⏱️ 显示工作时长和运行状态
- 🎮 点击按钮可快速启动/暂停计时
- 🔄 数据与主应用实时同步
- 🎨 深色主题设计，与APP风格统一

## 安装步骤
1. 先安装广播插件依赖：
```bash
cordova plugin add cordova-plugin-broadcaster
```

2. 安装本插件：
```bash
cordova plugin add ./cordova-plugin-widget
```

3. 构建APK：
```bash
cordova build android --release
```

## 使用说明
1. 安装APP后，长按桌面空白处，选择"添加小部件"
2. 找到"赚钱秒表"小部件，添加到桌面
3. 小部件会自动同步APP中的计时数据
4. 点击小部件上的播放/暂停按钮可以直接控制计时
5. 点击小部件文字区域可以打开主APP

## 小部件参数
- 尺寸：默认2x1，支持调整大小
- 更新频率：1秒
- 权限：不需要额外权限，自动使用主APP配置