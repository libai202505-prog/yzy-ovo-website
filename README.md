# yzy-ovo personal website

这是一个浅蓝渐变风格的双语个人网站第一版，适合作为个人 Wiki、博客、项目展示和友链页面的起点。

## 技术栈

- Next.js
- React
- Tailwind CSS
- Vercel 免费 Hobby 部署

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开：

```bash
http://localhost:3000
```

## 修改头像

头像文件在：

```bash
public/avatar.webp
```

你也可以替换成自己的图片，只要文件名仍然是 `avatar.webp`，页面就会自动使用新头像。

## 修改网站内容

主要内容在：

```bash
app/page.tsx
```

你可以修改：

- 网站名称：`yzy-ovo`
- 中英文文案：`copy.zh` 和 `copy.en`
- 导航栏栏目
- 文章列表
- 项目卡片
- 友链列表

## 推荐部署方式

我建议用 Vercel：

1. 把这个文件夹上传到 GitHub 仓库
2. 登录 Vercel
3. Import Git Repository
4. 选择这个仓库
5. Framework Preset 选 Next.js
6. Deploy
7. 在 Vercel Project Settings → Domains 里绑定你的 `.com` 域名
8. 按 Vercel 提示去你的域名商那里添加 DNS 记录

## 为什么先不用 GitHub Pages

GitHub Pages 也免费，也能绑定自定义域名；但它更适合纯静态 HTML/CSS/JS。这个项目用 Next.js，放 Vercel 更省心，之后加博客、搜索、MDX、图片优化也更方便。

如果你未来只想要一个非常简单的静态首页，再考虑 GitHub Pages。
