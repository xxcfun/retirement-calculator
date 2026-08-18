# 部署

## 构建

根路径部署运行 `npm run build`。子目录部署设置与最终公开目录一致的基础路径：

```bash
VITE_BASE_URL=/retirement/ npm run build
```

Vue Router、静态资源和分享二维码统一使用 Vite `BASE_URL`。服务器必须把不存在的子路由回退到 `index.html`。

## Nginx / 宝塔

将 `dist/` 上传到站点目录，使用仓库中的 `nginx.conf.example`，把 `root` 改成实际绝对路径。子目录部署可将 `location /` 改为 `location /retirement/`，并使用 `try_files $uri $uri/ /retirement/index.html`。

## Vercel

导入项目，构建命令 `npm run build`、输出目录 `dist`。仓库中的 `vercel.json` 已提供 SPA rewrite。

## Cloudflare Pages

构建命令 `npm run build`，输出目录 `dist`，Node 版本选择当前 LTS。`public/_redirects` 会复制到构建产物并提供 SPA fallback。子目录部署时设置 `VITE_BASE_URL`。

## Netlify

`netlify.toml` 已设置构建、输出目录和 SPA fallback。

## GitHub Pages

设置 Pages 使用 Actions 构建，构建时令 `VITE_BASE_URL=/<仓库名>/`。`public/404.html` 会把直接打开的子路由编码后转回入口，`index.html` 内的恢复脚本随后恢复原路由。若用自定义域名根路径部署，基础路径改回 `/`。

部署后应人工验证 `/dashboard`、`/records`、`/analysis`、`/settings` 的直接刷新，以及分享二维码路径是否指向公开子目录而非域名根目录。
