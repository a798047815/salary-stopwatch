# 赚钱秒表安卓APP

基于原有Web版本打包的安卓应用，100%兼容原有功能，同时支持原生扩展。

## 功能特性
✅ 完全复用原有Web版所有功能：
- 实时收入计算
- 工作时长统计
- 健康提醒（喝水、伸懒腰、活动、护眼）
- 摸鱼游戏厅
- 高薪岗位推荐

✅ 安卓原生增强功能：
- 后台常驻运行，不会被系统杀掉
- 本地通知推送，锁屏也能收到提醒
- 开机自动启动
- 桌面小部件（开发中）

## 编译说明
### 环境要求
- Node.js 16+
- Cordova 12+
- Android SDK 33+
- JDK 11+

### 编译命令
```bash
# 安装依赖
npm install -g cordova

# 添加安卓平台
cordova platform add android

# 构建debug版本APK
cordova build android

# 构建release版本APK
cordova build android --release
```

### 输出位置
编译完成后APK文件在：`platforms/android/app/build/outputs/apk/debug/app-debug.apk`

## 桌面小部件功能（开发中）
计划支持两种尺寸的桌面插件：
- 2x1小部件：显示当前收入 + 已工作时长
- 4x2中部件：显示收入、时长、下班倒计时、进度条

## 项目结构
```
├── www/                  # Web前端代码（和原有版本一致）
├── platforms/            # 原生平台代码
├── plugins/              # Cordova插件
├── config.xml            # APP配置文件
└── package.json          # 项目依赖
```