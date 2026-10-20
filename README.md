# Revia

每天记录日语句子，用固定间隔复习。基于 Expo SDK 57、React Native、Expo Router、TypeScript 和 SQLite。

## 开始开发

使用 Node.js 22 LTS（至少 22.13，推荐通过 nvm 管理）：

```sh
nvm install
nvm use
npm install
npx expo login --browser
npm start
```

手机安装支持 SDK 57 的 Expo Go，并与电脑登录同一个 Expo 账号。连接相同 Wi-Fi，扫描开发服务器二维码。也可用 `npm run ios` / `npm run android` 启动已配置的模拟器。

## 使用

- 日历：切换月份，点击日期进入当天详情；绿色点表示当天有新增句子，灰色点表示有复习；进入日期后，以绿色卡片展示当天新增、灰色卡片展示复习，不显示类型标签。
- 添加：输入日语句子、可选中文释义和学习日期，支持补录其他日期。
- 复习：以学习日期为基准，共 15 次：第 1、3、7、14、30 天，之后从第 5 次日期起每隔一个日历月再复习一次，共 10 次。月末无对应日期时取当月最后一天，之后仍按第 5 次日期的日号计算。已有句子会自动补齐日程。没有打卡、完成状态或动态延期。
- 删除：从任意卡片删除后，原句和全部复习日程一起删除。
- 句子 Tab：浏览全部原句。

数据保存在当前设备的 SQLite 数据库 `revia.db` 中。当前版本没有云同步或备份导入导出；卸载 Expo Go、清除其数据或迁移到独立 App 前需另行备份，Expo 账号登录不会同步这些句子。

## 项目结构

- `src/app/`：Tab、日历、日期详情、添加页面。
- `src/data/`：数据库结构和句子操作。
- `src/lib/dates.ts`：本地日历日期运算和固定复习间隔。
- `src/components/`：句子卡片和共享样式。

## 检查

```sh
npm run lint
npm run typecheck
```

Node.js 22.18+ 或 24 可运行数据库和日期测试：

```sh
node --test tests/schedule.test.mjs
```

## iPhone / Xcode 调试

原生工程由 Expo 配置生成，应用标识为 `com.jeffkann.revia`，URL scheme 为 `revia`。SDK 57 要求 Xcode 26.4+；生成目录 `ios/` 按 Expo 惯例不提交 Git。

```sh
nvm use
npx expo prebuild --platform ios
open ios/Revia.xcworkspace
```

在 Xcode 的 Revia target → Signing & Capabilities 中选择自己的 Team，并确认 Bundle Identifier 唯一。连接 iPhone、启用开发者模式，选择手机作为运行目标，使用 Debug 配置运行。

iOS Debug 通过 `plugins/with-offline-debug.cjs` 内置 JavaScript 和资源，并直接从安装包加载，无需运行 Metro。修改代码后需要在 Xcode 中重新 Build / Run 安装才能更新，不能通过热更新刷新。仍可使用 Xcode 调试原生代码；内置 JS 使用 `--dev false --minify false`，禁用依赖 Metro 的 JS 开发工具以避免离线启动报错。React Native DevTools、开发模式检查和热更新不属于此离线模式。重新 prebuild 时会自动保留这套配置。

Expo Go 和独立安装的 Revia 使用不同的应用沙盒，原有本地句子不会自动迁移。
