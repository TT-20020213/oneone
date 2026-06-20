# ChatOpens AI 服务平台

## 项目结构

├── website/          # 前端静态文件（直接上传到COS/任意静态托管）
│   ├── index.html    # 主页面
│   ├── css/          # 样式文件
│   ├── js/           # JavaScript
│   ├── img/          # SVG图片资源
│   └── font/         # 字体文件
└── server/           # 后端服务（Node.js Express）
    ├── package.json
    └── index.js

## 部署方式

### 方式一：纯静态（无需服务器）

将 `website/` 目录上传到任意静态托管：
- 腾讯云 COS（域名已指向）
- GitHub Pages
- Vercel / Netlify

前端已内置离线回退数据，后端不可用时页面依然完整展示。
登录/节点连接等交互以弹窗提示方式运行。

### 方式二：完整后端（需服务器）

```bash
cd server
npm install
node index.js
```

默认监听 80 端口，可修改 `server/index.js` 中的 `PORT` 变量。

默认账号：demo / 123456

### API 列表

| 端点 | 说明 |
|---|---|
| POST /API/Web/Login | 登录 |
| GET /API/Web/User/Info | 用户信息 |
| GET /API/Web/AiModel/List | AI模型列表 |
| GET /API/Web/Node/List | 节点列表 |
| POST /API/Web/Node/Connect | 连接节点（需VIP） |
| POST /API/Web/Param/GetParamList | 获取公告/配置 |

## DNS 配置

当前域名 `ok1333.cn` CNAME 指向腾讯云 COS。
如要使用后端服务，需将 DNS 改为 A 记录指向服务器 IP。

## 技术栈

- 前端：原生 HTML + CSS + JavaScript（零依赖）
- 后端：Node.js + Express
- 图片：SVG 矢量图（16个占位资源）
