# MySite — 简约个人/团队网站

纯 HTML + JS + Supabase 构建，部署到 GitHub Pages，零费用。

## 项目结构

```
website/
├── index.html              # 首页
├── resources.html          # 资源下载 + 留言板
├── admin/
│   ├── login.html          # 管理员登录
│   └── dashboard.html      # 管理后台
├── css/style.css           # 全站样式
├── js/
│   ├── supabase.js         # Supabase 配置（需填入你的 key）
│   ├── main.js             # 前台逻辑
│   └── admin.js            # 后台逻辑
└── supabase/schema.sql     # 数据库建表脚本
```

## 部署步骤

### 第一步：配置 Supabase

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目（或选择已有项目）
3. **建表**：进入 SQL Editor，粘贴执行 `supabase/schema.sql`
4. **创建 Storage bucket**：
   - 进入 Storage → New bucket
   - 名称填 `site-files`
   - 勾选 **Public bucket**
   - 创建后点击 bucket 右侧 ⚙️ → Policies：
     - 添加 SELECT policy：Target roles = `anon`，Policy = `true`
     - 添加 INSERT policy：Target roles = `authenticated`，Policy = `true`
     - 添加 DELETE policy：Target roles = `authenticated`，Policy = `true`
5. **创建管理员账号**：
   - 进入 Authentication → Users → Add user → Create new user
   - 填入你的邮箱和密码
   - 勾选 **Auto Confirm User**
6. **复制配置**：进入 Settings → API，复制：
   - Project URL（如 `https://xxxx.supabase.co`）
   - anon public key（以 `eyJ...` 开头的长字符串）

### 第二步：配置项目

编辑 `js/supabase.js`，将以下两行替换为你的实际值：

```js
const SUPABASE_URL = 'https://你的项目.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ你的key...';
```

### 第三步：部署到 GitHub Pages

1. 在 GitHub 创建新仓库（如 `my-website`）

2. 推送代码：
   ```bash
   cd website
   git init
   git add .
   git commit -m "init: personal website"
   git branch -M main
   git remote add origin https://github.com/你的用户名/my-website.git
   git push -u origin main
   ```

3. 启用 GitHub Pages：
   - 进入仓库 Settings → Pages
   - Source 选择 **Deploy from a branch**
   - Branch 选择 `main` / `root`
   - 保存

4. 访问 `https://你的用户名.github.io/my-website/`

### 第四步：开始使用

- 前台首页：`https://你的用户名.github.io/my-website/`
- 资源下载页：`https://你的用户名.github.io/my-website/resources.html`
- 管理后台：`https://你的用户名.github.io/my-website/admin/login.html`

登录后可以：
- 编辑首页和资源页的文字内容
- 上传/删除文件
- 查看/删除访客留言

## 自定义

- **网站名称**：修改各 HTML 中的 `<title>` 和 `.navbar-brand` 文字
- **颜色主题**：修改 `css/style.css` 中 `:root` 的 CSS 变量
- **增加页面**：复制 `resources.html` 结构，在 `pages` 表中添加对应 slug 的记录
- **页脚**：修改各 HTML 中的 `<footer>` 内容

## 技术说明

- **前端**：纯 HTML + CSS + JavaScript，零构建步骤
- **后端**：Supabase（PostgreSQL + Storage + Auth）
- **CDN**：Supabase JS Client v2（通过 jsdelivr 引入）
- **部署**：GitHub Pages（静态托管，免费）
- **安全**：RLS 策略确保只有认证管理员能修改数据，访客只能查看内容和提交留言
