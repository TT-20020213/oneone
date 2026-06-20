const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 80;
const HOST = process.env.HOST || '0.0.0.0';
const OUTPUTS_DIR = path.join(__dirname, '..', 'outputs');

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'chatopens-secret-key-2026',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// ====== Mock Data ======

const users = {
  'demo': { password: '123456', nickname: 'Demo用户', isVip: false, expireTime: null, email: 'demo@example.com', bindEmail: false }
};

const aiModels = [
  { platform: "GPT", name: "GPT-5.3", action: "JumpGPT" },
  { platform: "GPT", name: "GPT-5.5-Thinking", action: "JumpGPT" },
  { platform: "Grok", name: "Grok-4.2", action: "JumpGrok" },
  { platform: "Grok", name: "Grok-4.2 fast", action: "JumpGrok" },
  { platform: "Gemini", name: "Gemini-3.1-Pro", action: "JumpGemini" },
  { platform: "Gemini", name: "Gemini-3.1-Thinking", action: "JumpGemini" },
  { platform: "Gemini", name: "Gemini-3.1-flash", action: "JumpGemini" },
  { platform: "DeepSeek", name: "DeepSeek-V4-flash", action: "JumpSorux" },
  { platform: "DeepSeek", name: "DeepSeek-V4-Pro", action: "JumpSorux" },
  { platform: "Claude", name: "Claude-4.6-sonnet", action: "JumpSorux" },
  { platform: "Claude", name: "Claude-4.6-opus", action: "JumpSorux" },
  { platform: "Claude", name: "Claude-4.7-opus", action: "JumpSorux" }
];

const nodes = [
  {
    action: "AutoVIP", title: "全模型-镜像站", badge: "Hot", subtitle: "全模型镜像站",
    description: ["OpenAi官网原版ChatGPT模型", "集成Gemini/Claude/Grok等顶级Ai模型", "一站式满足所有Ai需求"],
    img: "img/platform-sorux.svg", alt: "全模型-镜像站"
  },
  {
    action: "AutoVIP", title: "全模型-备用站", badge: "Hot", subtitle: "全模型-备用站",
    description: ["全模型镜像站备用系统", "集成Gemini/Claude/Grok等顶级Ai模型", "一站式满足所有Ai需求"],
    img: "img/platform-fake-oai.svg", alt: "全模型-备用站"
  },
  {
    action: "AutoVIP", title: "Grok-镜像站", badge: "New", subtitle: "Grok官网镜像站",
    description: ["马斯克公司xAi官网的Grok镜像站", "集成Grok-3/Grok-4/Grok-4 Fast等模型", "适合小说写作/日常问题/学术创作"],
    img: "img/platform-grok.svg", alt: "Grok官网镜像站"
  },
  {
    action: "AutoVIP", title: "Gemini-镜像站", badge: "New", subtitle: "Gemini官网镜像站",
    description: ["谷歌公司Gemini官网镜像站", "集成Gemini-fast/thinking/pro等模型", "需要单独选车进行直达跳转"],
    img: "img/platform-gemini.svg", alt: "Gemini官网镜像站"
  },
  {
    action: "AutoVIP", title: "ChatGPT-镜像站", badge: "New", subtitle: "ChatGPT-镜像站",
    description: ["支持自主选号，直登GPT官网", "快速响应，满血回答，超多账号可选", "适合论文创作等学术研究工作"],
    img: "img/platform-xy-gpt.svg", alt: "ChatGPT-镜像站"
  },
  {
    action: "AutoVIP", title: "Claude-镜像站", badge: "即将上线", subtitle: "Claude-镜像站",
    description: ["Claude官网原版镜像", "直登官网使用，无需注册，打开即用", "适合编程代码等复杂任务"],
    img: "img/platform-claude.svg", alt: "Claude-镜像站"
  },
  {
    action: "AutoVIP", title: "Midjourney-镜像站", badge: "即将上线", subtitle: "Midjourney-镜像站",
    description: ["Ai绘画一键创作", "基于Mj官网轻松完成图生图、文生图", "轻松绘画，高效出图"],
    img: "img/platform-midjourney.svg", alt: "Midjourney-镜像站"
  },
  {
    action: "AutoAPI", title: "龙虾计划-API站点", badge: "New", subtitle: "龙虾计划-API站点",
    description: ["API调用全网大模型", "支持Claude code，Codex等多平台", "需单独充值，按量付费"],
    img: "img/platform-plan.svg", alt: "龙虾计划-API站点"
  }
];

// ====== Helper ======

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.json({ code: 401, msg: '请先登录' });
  }
  next();
}

// ====== API Routes ======

// Login
app.post('/API/Web/Login', (req, res) => {
  const { username, password, code } = req.body;
  // QR code / code login
  if (code) {
    const user = { username: code, nickname: '用户_' + code.slice(-4), isVip: false, expireTime: null, bindEmail: false };
    req.session.user = user;
    return res.json({ code: 200, msg: '登录成功', data: user });
  }
  // Password login
  if (users[username] && users[username].password === password) {
    const user = { ...users[username] };
    delete user.password;
    req.session.user = user;
    return res.json({ code: 200, msg: '登录成功', data: user });
  }
  // Auto-register for demo
  if (username && password) {
    users[username] = { password, nickname: username, isVip: false, expireTime: null, email: '', bindEmail: false };
    const user = { username, nickname: username, isVip: false, expireTime: null, bindEmail: false };
    req.session.user = user;
    return res.json({ code: 200, msg: '注册并登录成功', data: user });
  }
  res.json({ code: 400, msg: '用户名或密码错误' });
});

// Logout
app.post('/API/Web/Logout', (req, res) => {
  req.session.destroy();
  res.json({ code: 200, msg: '已退出登录' });
});

// Get current user info
app.get('/API/Web/User/Info', requireLogin, (req, res) => {
  res.json({ code: 200, data: req.session.user });
});

// Check email binding
app.get('/API/Web/User/IsBindEmail', requireLogin, (req, res) => {
  res.json({ code: 200, data: req.session.user.bindEmail || false });
});

// Bind email
app.post('/API/Web/User/BindEmail', requireLogin, (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ code: 400, msg: '邮箱不能为空' });
  req.session.user.bindEmail = true;
  req.session.user.email = email;
  res.json({ code: 200, msg: '绑定成功' });
});

// Get param list (notices, QQ group, etc.)
app.post('/API/Web/Param/GetParamList', (req, res) => {
  const params = req.body || [];
  const data = [];
  params.forEach(p => {
    if (p.KeyName === 'ListNotice') {
      data.push({ keyName: 'ListNotice', data: '欢迎使用ChatOpens AI服务平台！当前系统运行正常。新版GPT-5.5已上线。请在使用前查看使用教程。' });
    } else if (p.KeyName === 'QQ') {
      data.push({ keyName: 'QQ', data: '123456789' });
    }
  });
  res.json({ code: 200, data });
});

// Get AI model list for scrolling
app.get('/API/Web/AiModel/List', (req, res) => {
  res.json({ code: 200, data: aiModels });
});

// Get node list (VIP and Free)
app.get('/API/Web/Node/List', (req, res) => {
  res.json({ code: 200, data: nodes });
});

// Connect to a node (auto-login)
app.post('/API/Web/Node/Connect', requireLogin, (req, res) => {
  const { action, nodeId } = req.body;
  if (!req.session.user.isVip) {
    return res.json({ code: 403, msg: '请先开通会员', data: { redirect: '/#subscribe' } });
  }
  res.json({
    code: 200,
    msg: '连接成功',
    data: {
      redirectUrl: `https://chat.chatopens.vip/chat?token=demo_${Date.now()}`,
      action: action
    }
  });
});

// Subscribe / pricing page
app.get('/API/Web/Subscribe/Info', (req, res) => {
  res.json({
    code: 200,
    data: {
      plans: [
        { name: '月卡', price: '30元', days: 30, features: ['解锁全部模型', '高额使用次数', '优先排队'] },
        { name: '季卡', price: '78元', days: 90, features: ['全部月卡权益', '额外8折优惠', '专属客服'] },
        { name: '年卡', price: '288元', days: 365, features: ['全部季卡权益', '额外7折优惠', 'VIP专属通道'] }
      ]
    }
  });
});

// Notices
app.get('/API/Web/Notice/List', (req, res) => {
  res.json({
    code: 200,
    data: [
      { id: 1, title: '系统维护通知', content: '每周三凌晨2:00-5:00进行系统维护', time: '2026-06-20' },
      { id: 2, title: '新模型上线', content: 'GPT-5.5 Thinking模型已上线，欢迎体验', time: '2026-06-19' },
      { id: 3, title: '会员优惠', content: '新用户首月会员仅需1元', time: '2026-06-18' }
    ]
  });
});

// AutoCar - auto redirect
app.post('/API/Web/AutoCar', requireLogin, (req, res) => {
  const { action } = req.body;
  if (!req.session.user.isVip) {
    return res.json({ code: 403, msg: '请先开通会员', data: { redirect: '/#subscribe' } });
  }
  res.json({
    code: 200,
    msg: '正在为您分配最佳节点...',
    data: {
      redirectUrl: `https://chat.chatopens.vip/chat?node=${action}&t=${Date.now()}`
    }
  });
});

// ====== Serve Static Files ======
app.use(express.static(OUTPUTS_DIR, {
  extensions: ['html', 'htm'],
  index: 'index.html'
}));

// Fallback to index.html for SPA-like routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/API/')) return res.status(404).json({ code: 404, msg: 'Not Found' });
  res.sendFile(path.join(OUTPUTS_DIR, 'index.html'));
});

// ====== Start Server ======
app.listen(PORT, HOST, () => {
  console.log(`=== ChatOpens AI 服务平台 ===`);
  console.log(`服务地址: http://localhost:${PORT}`);
  console.log(`域名访问: http://ok1333.cn (DNS需指向本机IP)`);
  console.log(`本地测试: 已在hosts添加 ok1333.cn -> 127.0.0.1`);
  console.log(`静态文件目录: ${OUTPUTS_DIR}`);
  console.log(`提示: 使用 demo / 123456 登录，或任意账号密码自动注册`);
});
