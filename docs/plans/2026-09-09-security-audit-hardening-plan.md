# 安全审计与默认监听地址加固计划

## 背景与目标

基于当前项目安全审计结果，将 CLI 未指定 `--host` 时的默认监听地址明确设置为
`127.0.0.1`，并把审计结论、风险边界和验证结果沉淀到仓库文档，随后提交并推送到
GitHub。

## 范围与非目标

### 范围

- 将生产 CLI 的默认监听地址改为 `127.0.0.1`。
- 更新中英文运行文档，明确默认监听行为及远程访问安全要求。
- 新增安全审计报告，区分“未发现恶意行为”和“项目设计上的高权限能力”。
- 执行构建、测试、依赖审计和基础监听验证。
- 使用中文 Conventional Commit 提交，并推送当前分支到 GitHub。

### 非目标

- 不改变 Codex app-server 的命令执行、文件修改和审批业务能力。
- 不修改 `documentation/app-server-schemas/`。
- 不回退当前工作区已有的其他未提交变更。
- 不在本次任务中升级依赖或修复 PWA 类型依赖问题，除非验证该改动是本任务的直接阻塞项。

## 分步执行清单

1. 修改 CLI 默认 host，并更新相关运行文档。
2. 新增安全审计报告，记录审查范围、结论、已知风险和验证命令。
3. 将新增文档加入 `docs/plans/README.md` 或合适的文档索引，确认链接可达。
4. 执行：
   - `npm run build`
   - `npm run build:cli`
   - `npx vite build`
   - 现有 Node 测试
   - `npm audit --omit=dev --audit-level=moderate`
   - 默认监听地址的实际 socket 验证
5. 检查 diff、未提交并发变更和文档链接，不执行覆盖式回退。
6. 创建中文 Conventional Commit，并推送到当前 GitHub 远程分支。

## 风险与回滚

- 当前工作区已有 PWA、文档和依赖相关未提交变更；提交前只纳入本任务新增或修改的文件。
- 如构建或测试失败，报告中记录失败原因，不用无关格式化或依赖升级掩盖问题。
- 如远程分支状态发生变化，先停止推送并确认，避免覆盖他人提交。
- 回滚仅通过后续反向提交完成，不执行 `reset --hard` 或覆盖他人工作。

## 验收标准

- 未指定 `--host` 时，CLI 传给 `server.listen` 的 host 为 `127.0.0.1`。
- 中英文 README 和运行文档说明一致。
- 安全审计报告可从文档索引访问。
- 不引入恶意下载、隐私收集、任意上传或隐藏代码执行逻辑。
- 提交成功并推送到 GitHub，返回可核验的提交信息和远程分支。

## 实际执行结果

- 已将 `src/cli/index.ts` 中未指定 `--host` 的默认值设置为 `127.0.0.1`。
- 已将 Node.js 24.8.0 写入 `.nvmrc`，并在 `package.json` 的 `engines.node` 与运行文档中声明
  Node.js 24.8.0 基线。
- 已更新中英文 README、`docs/runtime/README.md`，并新增安全审计报告及文档索引链接。
- `npm run build`、`npm run build:cli`、`npx vite build` 均通过。
- `node --test tests/*.test.mjs`：当前执行为 64 项通过、1 项失败；失败用例为
  `resolvePendingServerRequest waits for persisted fallback conversion before recording resolution`，
  原因是测试临时目录中的 `persisted-server-requests.json` 未生成（`ENOENT`），属于既有测试
  持久化时序问题。
- 实际监听验证确认默认 socket 为 `127.0.0.1:<port>`。
- `npm audit --omit=dev --audit-level=moderate` 报告 `body-parser`、`path-to-regexp`、
  `qs` 相关的 3 个依赖 DoS 风险；未发现任意代码执行风险证据。
- `npm ci --ignore-scripts` 因当前并发变更造成 `package.json` 与 `package-lock.json` 不同步而失败，
  本次未覆盖或重写无关锁文件。

## 与原计划的差异

当前工作区同时存在其他未提交的 PWA、构建配置和依赖变更。为避免覆盖或混入他人工作，
提交时仅选择本任务相关的 CLI 默认 host、Node.js 24 基线、运行文档和安全审计文档；
其他变更保留在工作区，不纳入本次提交。
