# Codex Web Local 安全审计报告

**审计日期：** 2026-09-09
**审计范围：** 当前工作区源码、构建配置、发布包内容、依赖锁文件及运行验证结果

## 一、结论摘要

本次静态审查未发现以下恶意行为证据：

- 恶意端口扫描或局域网探测；
- 隐蔽收集用户隐私并外传；
- 恶意上传任意文件；
- 恶意下载远程代码并自动执行；
- 通过 `eval`、`new Function`、动态 shell 拼接等方式植入隐藏执行后门；
- 发布包中存在与项目用途无关的可疑脚本或二进制内容。

但是，本项目本身是 Codex `app-server` 的 Web 客户端，具有明确的高权限业务能力。经过认证的请求可以通过 Codex 正常流程执行命令、修改工作区文件和处理审批请求。这是项目设计，不是隐藏恶意行为。

## 二、审查范围与方法

- 检查 `src/`、`scripts/`、`vite.config.ts`、`package.json` 和发布包清单；
- 搜索网络请求、子进程、文件读写、动态代码执行、端口监听、上传下载和混淆代码；
- 检查 Markdown、代码高亮、图片渲染和外部链接处理；
- 使用 `npm ci --ignore-scripts` 验证锁文件安装路径，避免安装阶段执行第三方脚本；
- 执行构建、测试、依赖审计和临时端口监听验证。

## 三、已确认的正常外联行为

### 3.1 npm 版本检查

`src/cli/index.ts` 会最多每 12 小时访问一次 npm registry 的包版本接口。

该逻辑只读取最新版本号并写入本地缓存，不会自动下载升级包、自动执行 npm 命令或上传项目文件。

### 3.2 图片输入

`src/components/content/ThreadComposer.vue` 只接受浏览器选择或剪贴板中的图片，使用 `FileReader.readAsDataURL()` 转换为数据 URI，再作为 Codex 输入发送。

未发现独立的任意文件上传接口或服务端文件上传落盘逻辑。

## 四、需要明确告知用户的高风险能力

### 4.1 Codex 命令和文件操作

`src/server/codexAppServerBridge.ts` 会启动：

```ts
spawn('codex', ['app-server'])
```

`/codex-api/rpc` 会将请求转发到 Codex app-server。因此，认证用户可以调用 Codex 支持的功能，包括命令执行、文件修改和审批响应。

项目还会通过 `execFile('git', args, ...)` 执行受参数校验保护的 Git 状态查询、差异查询和分支操作。

### 4.2 文件预览范围

`/codex-api/file-preview` 接受绝对文件路径并读取不超过 1 MB 的文本文件。当前实现没有将路径限制在工作区目录内。

在关闭密码保护或认证失效的情况下，这可能暴露主目录中的配置、凭据或其他文本文件。

### 4.3 网络监听

生产 CLI 现在将未指定 `--host` 的默认值明确设置为 `127.0.0.1`。只有显式使用非回环地址时才会对外监听。

对外访问必须保留密码保护，并优先通过 HTTPS 或安全隧道提供服务。Vite 开发服务器不使用生产 CLI 的密码中间件，不要使用 `npm run dev -- --host 0.0.0.0` 对不可信网络开放。

## 五、前端内容安全检查

- Vue 模板中的普通消息文本使用插值渲染，默认 HTML 转义；
- Markdown 外部链接通过 `window.open(..., '_blank', 'noopener,noreferrer')` 打开；
- 代码高亮使用 Highlight.js，测试确认 `<script>` 和事件属性会被转义；
- 未发现 `eval`、`new Function`、`document.write` 或可疑 Base64 混淆逻辑。

## 六、依赖与验证结果

### 6.1 依赖审计

`npm audit --omit=dev --audit-level=moderate` 报告了 3 个依赖 DoS 风险，涉及：

- `body-parser`
- `path-to-regexp`
- `qs`

这些是依赖漏洞，不是本项目主动植入的恶意行为，也未在本次审计中发现任意代码执行漏洞证据。建议后续单独升级依赖并重新验证兼容性。

### 6.2 构建与测试

本次执行结果如下：

- `npm run build`：通过；
- `npm run build:cli`：通过；
- `npx vite build`：通过，并生成 PWA Service Worker；
- `node --test tests/*.test.mjs`：当前执行为 64 项通过、1 项失败。失败用例为
  `resolvePendingServerRequest waits for persisted fallback conversion before recording resolution`，
  原因是测试临时目录中的 `persisted-server-requests.json` 未生成（`ENOENT`）；该失败涉及既有
  持久化测试的时序问题，不是本次默认 host 或 Node.js 基线改动引入的编译错误；
- 默认监听验证：未指定 `--host` 时实际 socket 绑定为 `127.0.0.1:<port>`；
- `npm audit --omit=dev --audit-level=moderate`：报告 3 个依赖层面的 DoS 风险，涉及
  `body-parser`、`path-to-regexp` 和 `qs`；
- `npm ci --ignore-scripts`：未通过。当前工作区的 `package.json` 与
  `package-lock.json` 存在并发变更不同步，lock 文件缺少多个
  `@esbuild/*@0.28.2` 条目；本次未为此重写无关依赖锁文件。

上述依赖审计和安装失败结果不改变“未发现项目主动植入恶意行为”的结论，但应在后续依赖维护任务中单独处理。

## 七、审计限制

本报告基于当前工作区源码和有限运行验证，不能替代依赖包逐包供应链审计、运行时完整网络抓包、宿主机进程与防火墙审计，以及生产环境反向代理、Tailscale 或 HTTPS 配置审计。

最终判断是：**未发现恶意下载、恶意扫描、隐私外传、恶意上传或隐藏任意代码执行后门；但项目仍具有其业务所需的高权限 Codex 操作能力，必须正确配置监听地址、密码和网络边界。**
