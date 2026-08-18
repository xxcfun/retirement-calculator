# 退休攒钱计算器

一个纯前端、纯本地、无需账号的 Vue 3 H5 应用，用收入、消费、负债、复利、工资增长与通胀模型测算距离财务自由退休还有多久。

## 功能

- 静态无复利与动态逐月退休测算，负债偿还和财富积累阶段拆解
- 当前资产、负债、净资产、完成率、预计退休日期与未来十年趋势
- 收入、支出、资产调整台账，筛选、编辑、删除及资产影响回滚
- 临时情景模拟，历史支出分析，逐年预测和金额隐私模式
- JSON 完整备份/恢复，台账及预测 CSV 导出
- 1080×1440 本地分享卡片、仅含网站地址的二维码、原生分享降级
- LocalStorage 配置存储，IndexedDB 台账存储及 LocalStorage 降级

## 技术栈

Vue 3、Vite、JavaScript、`<script setup>`、Composition API、Pinia、Vue Router、ECharts、SCSS、LocalStorage、IndexedDB、Lucide Icons、html-to-image、qrcode、Vitest。

## 安装与运行

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

生产文件生成在 `dist/`。自定义子目录基础路径时使用：

```bash
VITE_BASE_URL=/retirement/ npm run build
```

## 本地数据与备份

配置和应用设置保存在当前站点的 LocalStorage；台账优先保存在 IndexedDB，失败时非阻塞降级到 LocalStorage。应用启动只读取已持久化的当前资产，不会重新累计历史台账。建议定期在设置页导出 JSON 完整备份；恢复会先校验并迁移，成功后原子式替换状态，失败保留原数据。

## 部署

支持 Nginx、Vercel、Cloudflare Pages、Netlify 和 GitHub Pages，配置及 SPA 子路由刷新说明见 [部署文档](docs/deployment.md)。详细计算口径见 [计算文档](docs/calculation.md)，存储结构见 [本地存储文档](docs/local-storage.md)。

## 隐私

应用不包含账号、后端、云同步或第三方财务接口。计算、图表、导出、二维码和分享图片全部在浏览器内完成。二维码仅写入网站地址和 `from=retirement-card` 来源标记；工资、消费、负债、资产和台账不会写入二维码。浏览器清理站点数据会删除数据，请自行保存备份。

## 已知模型限制

- 第一版不计算债务利息，也不拆分多笔贷款，是现金流规划而非贷款摊销计划。
- 通胀只提高退休目标，不重复提高消费；这是一种简化的单一通胀口径。
- 所有资产使用统一的预期收益率，不模拟税费、交易成本、波动路径和不同资产类别。
- 预测最长 1200 个月。预测是参数情景，不构成投资建议。
- 本版未加入离线冷启动所需的 PWA 静态资源预缓存；页面资源加载后核心功能不依赖网络。
