# 2026-06-12 使用说明

## 启动

```bash
npm install
npm run dev
```

在 WSL 中启动时，Windows 浏览器优先打开 Vite 输出的 `Network` 地址，例如 `http://172.20.84.237:5174/`。`localhost` 在部分 WSL/Windows 网络配置下可能无法转发。

## 验证

```bash
npm run test
npm run build
```

## 功能入口

- `听力训练`：音程与和声两个子页签。
- `琶音训练`：根据和弦类型在指板上练习。
- `音阶训练`：根据音阶类型在指板上练习。
- 指板主区域从 `1` 品开始；空弦音在独立列中选择和显示。

## 本地记录

应用会保存：

- 每个模块的答题次数。
- 正确次数。
- 当前连续正确数。
- 历史最佳连续正确数。
- 指板显示设置。

记录保存在浏览器本地；清理浏览器站点数据会清除记录。

页面左侧会显示当前保存位置：

- 自动保存：`Browser localStorage`
- key：`guitar-learning-assistant:progress:v1`
- 迁移设备：点击“导出数据”得到 `guitar-training-progress.json`，在新设备中打开项目后点击“导入数据”。
