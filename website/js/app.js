(function(){'use strict';
  // === API Helpers ===
  const API_BASE = '';
const MOCK_MODE = false; // 设为 true 强制使用本地数据，不连后端

// 本地回退数据
const MOCK_AUTHORS = [
  {platform:"GPT",name:"GPT-5.3",action:"JumpGPT"},
  {platform:"GPT",name:"GPT-5.5-Thinking",action:"JumpGPT"},
  {platform:"Grok",name:"Grok-4.2",action:"JumpGrok"},
  {platform:"Grok",name:"Grok-4.2 fast",action:"JumpGrok"},
  {platform:"Gemini",name:"Gemini-3.1-Pro",action:"JumpGemini"},
  {platform:"Gemini",name:"Gemini-3.1-Thinking",action:"JumpGemini"},
  {platform:"Gemini",name:"Gemini-3.1-flash",action:"JumpGemini"},
  {platform:"DeepSeek",name:"DeepSeek-V4-flash",action:"JumpSorux"},
  {platform:"DeepSeek",name:"DeepSeek-V4-Pro",action:"JumpSorux"},
  {platform:"Claude",name:"Claude-4.6-sonnet",action:"JumpSorux"},
  {platform:"Claude",name:"Claude-4.6-opus",action:"JumpSorux"},
  {platform:"Claude",name:"Claude-4.7-opus",action:"JumpSorux"}
];

const MOCK_NODES = [
  {action:"AutoVIP",title:"全模型-镜像站",badge:"Hot",subtitle:"全模型镜像站",description:["OpenAi官网原版ChatGPT模型","集成Gemini/Claude/Grok等顶级Ai模型","一站式满足所有Ai需求"],img:"img/platform-sorux.svg",alt:"全模型-镜像站"},
  {action:"AutoVIP",title:"全模型-备用站",badge:"Hot",subtitle:"全模型-备用站",description:["全模型镜像站备用系统","集成Gemini/Claude/Grok等顶级Ai模型","一站式满足所有Ai需求"],img:"img/platform-fake-oai.svg",alt:"全模型-备用站"},
  {action:"AutoVIP",title:"Grok-镜像站",badge:"New",subtitle:"Grok官网镜像站",description:["马斯克公司xAi官网的Grok镜像站","集成Grok-3/Grok-4/Grok-4 Fast等模型","适合小说写作/日常问题/学术创作"],img:"img/platform-grok.svg",alt:"Grok官网镜像站"},
  {action:"AutoVIP",title:"Gemini-镜像站",badge:"New",subtitle:"Gemini官网镜像站",description:["谷歌公司Gemini官网镜像站","集成Gemini-fast/thinking/pro等模型","需要单独选车进行直达跳转"],img:"img/platform-gemini.svg",alt:"Gemini官网镜像站"},
  {action:"AutoVIP",title:"ChatGPT-镜像站",badge:"New",subtitle:"ChatGPT-镜像站",description:["支持自主选号，直登GPT官网","快速响应，满血回答，超多账号可选","适合论文创作等学术研究工作"],img:"img/platform-xy-gpt.svg",alt:"ChatGPT-镜像站"},
  {action:"AutoVIP",title:"Claude-镜像站",badge:"即将上线",subtitle:"Claude-镜像站",description:["Claude官网原版镜像","直登官网使用，无需注册，打开即用","适合编程代码等复杂任务"],img:"img/platform-claude.svg",alt:"Claude-镜像站"},
  {action:"AutoVIP",title:"Midjourney-镜像站",badge:"即将上线",subtitle:"Midjourney-镜像站",description:["Ai绘画一键创作","基于Mj官网轻松完成图生图、文生图","轻松绘画，高效出图"],img:"img/platform-midjourney.svg",alt:"Midjourney-镜像站"},
  {action:"AutoAPI",title:"龙虾计划-API站点",badge:"New",subtitle:"龙虾计划-API站点",description:["API调用全网大模型","支持Claude code，Codex等多平台","需单独充值，按量付费"],img:"img/platform-plan.svg",alt:"龙虾计划-API站点"}
];

function getMockData(type) {
  if (type === 'models') return MOCK_AUTHORS;
  if (type === 'nodes') return MOCK_NODES;
  return [];
}

async function apiFetch(url, options = {}) {
    const config = {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    };
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }
      const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  let res;
  try {
    res = await fetch(API_BASE + url, { ...config, signal: controller.signal });
  } catch(e) {
    clearTimeout(timeout);
    if (/^(GET|get)$/.test((config.method||'GET')) && url.startsWith('/API/Web/AiModel')) {
      return { code:200, data: getMockData('models') };
    }
    if (/^(GET|get)$/.test((config.method||'GET')) && url.startsWith('/API/Web/Node')) {
      return { code:200, data: getMockData('nodes') };
    }
    if (url === '/API/Web/User/Info') return { code:401, msg:'请先登录' };
    return null;
  }
  clearTimeout(timeout);
  const data = await res.json();
    if (data.code === 401) {
      showLoginDialog();
      return null;
    }
    return data;
  }
  function fetchGet(url) { return apiFetch(url); }
  function fetchPost(url, body) { return apiFetch(url, { method: 'POST', body }); }

  // === User State ===
  let currentUser = null;

  // === Dialog System ===
  function showDialog(title, content, options = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'custom-dialog';
    overlay.innerHTML = '<div class="custom-dialog-content" style="background:#fff;border-radius:20px;min-width:350px;max-width:500px;box-shadow:0 10px 40px rgba(0,0,0,.3);">' +
      '<div class="custom-dialog-title" style="padding:15px 20px;border-bottom:1px solid #eee;font-size:18px;font-weight:bold;">' + title + '</div>' +
      '<button class="custom-dialog-close" style="position:absolute;top:13px;right:18px;font-size:22px;cursor:pointer;background:none;border:none;color:#999;">&times;</button>' +
      '<div class="custom-dialog-body" style="padding:20px;">' + content + '</div>' +
      (options.hideFooter ? '' : '<div class="custom-dialog-footer" style="padding:10px 20px 20px;text-align:right;border-top:1px solid #eee;"></div>') +
      '</div>';
    document.body.appendChild(overlay);
    overlay.querySelector('.custom-dialog-close').onclick = () => document.body.removeChild(overlay);
    overlay.onclick = (e) => { if (e.target === overlay) document.body.removeChild(overlay); };
    return overlay;
  }

  function showMessage(msg, type = 'info') {
    const el = document.createElement('div');
    el.className = 'custom-message';
    el.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:' +
      (type === 'success' ? '#10a37f' : type === 'error' ? '#e53e3e' : '#333') +
      ';color:#fff;padding:12px 24px;border-radius:8px;z-index:9999;font-size:15px;box-shadow:0 4px 12px rgba(0,0,0,.2);transition:opacity .3s;';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => document.body.removeChild(el), 300); }, 2500);
  }

+  // === Login Dialog ===
  function showLoginDialog() {
    const content = '<div style="margin:10px 0;">' +
      '<input id="loginUsername" type="text" placeholder="鐢ㄦ埛鍚? style="width:100%;padding:12px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:15px;margin-bottom:12px;box-sizing:border-box;" />' +
      '<input id="loginPassword" type="password" placeholder="瀵嗙爜" style="width:100%;padding:12px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:15px;margin-bottom:12px;box-sizing:border-box;" />' +
      '<p style="color:#888;font-size:13px;margin:5px 0;">浣撻獙璐﹀彿: demo / 123456</p>' +
      '</div>';
    const dialog = showDialog('鐧诲綍', content);
    const footer = dialog.querySelector('.custom-dialog-footer');
    footer.innerHTML = '<button class="login-btn" style="padding:10px 32px;border:none;border-radius:12px;font-size:15px;cursor:pointer;background:#10a37f;color:#fff;font-weight:bold;">鐧诲綍</button>';
    footer.querySelector('.login-btn').onclick = async function() {
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value.trim();
      if (!username) { showMessage('璇疯緭鍏ョ敤鎴峰悕', 'error'); return; }
      const res = await fetchPost('/API/Web/Login', { username, password });
      if (res && res.code === 200) {
        currentUser = res.data;
        document.body.removeChild(dialog);
        updateUserUI();
        showMessage('鐧诲綍鎴愬姛', 'success');
      } else if (res) {
        showMessage(res.msg || '鐧诲綍澶辫触', 'error');
      }
    };
  }

  function showSubscribeDialog() {
    const content = '<div style="text-align:center;padding:10px;">' +
      '<div style="font-size:24px;font-weight:bold;color:#10a37f;margin-bottom:10px;">寮€閫氫細鍛?/div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0;">' +
      '  <div style="border:2px solid #e2e8f0;border-radius:12px;padding:15px;text-align:center;"><div style="font-size:16px;font-weight:bold;">鏈堝崱</div><div style="font-size:22px;color:#10a37f;font-weight:bold;margin:8px 0;">30鍏?/div><div style="font-size:13px;color:#888;">30澶?/div></div>' +
      '  <div style="border:2px solid #10a37f;border-radius:12px;padding:15px;text-align:center;background:#f0fdf4;"><div style="font-size:16px;font-weight:bold;">瀛ｅ崱</div><div style="font-size:22px;color:#10a37f;font-weight:bold;margin:8px 0;">78鍏?/div><div style="font-size:13px;color:#888;">90澶?鎺ㄨ崘</div></div>' +
      '  <div style="border:2px solid #e2e8f0;border-radius:12px;padding:15px;text-align:center;"><div style="font-size:16px;font-weight:bold;">骞村崱</div><div style="font-size:22px;color:#10a37f;font-weight:bold;margin:8px 0;">288鍏?/div><div style="font-size:13px;color:#888;">365澶?/div></div>' +
      '</div>' +
      '<p style="color:#888;font-size:14px;margin-top:10px;">瑙ｉ攣鍏ㄩ儴GPT妯″瀷涓庨珮棰濅娇鐢ㄦ鏁?/p>' +
      '</div>';
    showDialog('浼氬憳寮€閫?, content);
  }

  function showNoticeDialog() {
    const content = '<div style="margin:15px 0;">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg><span style="font-size:16px;font-weight:bold;">绯荤粺閫氱煡</span></div>' +
      '<div style="background:#f8fafc;border-radius:12px;padding:15px;margin-bottom:10px;"><div style="font-weight:bold;color:#333;margin-bottom:5px;">绯荤粺缁存姢閫氱煡</div><div style="color:#666;font-size:14px;">姣忓懆涓夊噷鏅?:00-5:00杩涜绯荤粺缁存姢</div></div>' +
      '<div style="background:#f8fafc;border-radius:12px;padding:15px;margin-bottom:10px;"><div style="font-weight:bold;color:#333;margin-bottom:5px;">鏂版ā鍨嬩笂绾?/div><div style="color:#666;font-size:14px;">GPT-5.5 Thinking妯″瀷宸蹭笂绾匡紝娆㈣繋浣撻獙</div></div>' +
      '<div style="background:#f8fafc;border-radius:12px;padding:15px;"><div style="font-weight:bold;color:#333;margin-bottom:5px;">浼氬憳浼樻儬</div><div style="color:#666;font-size:14px;">鏂扮敤鎴烽鏈堜細鍛樹粎闇€1鍏?/div></div>' +
      '</div>';
    showDialog('閫氱煡', content);
  }

  // === UI Update ===
  function updateUserUI() {
    const anonymous = document.querySelectorAll('[data-anonymous]');
    const userEls = document.querySelectorAll('[data-user]');
    const nickName = document.querySelector('[data-nick-name]');
    const expTime = document.querySelector('[data-exp-time]');
    if (currentUser) {
      anonymous.forEach(el => el.classList.add('layui-hide'));
      userEls.forEach(el => el.classList.remove('layui-hide'));
      if (nickName) nickName.textContent = currentUser.nickname || currentUser.username;
      if (expTime) {
        if (currentUser.isVip && currentUser.expireTime) {
          expTime.innerHTML = '浼氬憳鍒版湡锛?span>' + currentUser.expireTime + '</span>';
        } else {
          expTime.innerHTML = '浼氬憳鍒版湡锛?span>杩樻湭寮€閫氫細鍛?/span>';
        }
      }
    } else {
      anonymous.forEach(el => el.classList.remove('layui-hide'));
      userEls.forEach(el => el.classList.add('layui-hide'));
    }
  }

  // === Tab switching ===
  function initTabs() {
    var tabTitles = document.querySelectorAll('.layui-tab-title li');
    tabTitles.forEach(function(tab, index) {
      tab.addEventListener('click', function() {
        var parent = this.closest('.layui-tab');
        if (!parent) return;
        parent.querySelectorAll('.layui-tab-title li').forEach(function(t){t.classList.remove('layui-this')});
        this.classList.add('layui-this');
        var items = parent.querySelectorAll('.layui-tab-content .layui-tab-item');
        items.forEach(function(item){item.classList.remove('layui-show')});
        if (items[index]) items[index].classList.add('layui-show');
      });
    });
  }

  // === Carousel ===
  function initCarousel(selector) {
    var el = document.querySelector(selector);
    if (!el) return;
    var items = el.querySelectorAll('[carousel-item] > *');
    if (items.length < 2) return;
    var current = 0;
    setInterval(function() {
      items.forEach(function(item){item.style.display='none'});
      current = (current + 1) % items.length;
      items[current].style.display = 'block';
    }, 3000);
  }

  // === Render AI Model List (from API) ===
  async function renderAiModelList() {
    const res = await fetchGet('/API/Web/AiModel/List');
    const aiModels = (res && res.code === 200) ? res.data : getMockData("models");
    var scrollingContent = document.getElementById("scrolling-content");
    if (!scrollingContent) return;
    var html = '';
    aiModels.forEach(function(item) {
      var svgIcon = '';
      switch(item.platform) {
        case 'GPT': svgIcon = '<svg viewBox="0 0 1024 1024" width="24" height="24"><path d="M432.694 74.059c-20.045 3.277-45.487 11.372-65.725 21.202-50.306 24.478-88.854 66.303-109.478 119.308l-4.048 10.215-16.383 4.819C120.644 263.14 52.606 386.688 86.143 503.875c6.361 22.551 21.395 52.619 35.658 71.7l12.143 15.998-4.433 17.347c-5.59 21.973-7.517 55.895-4.433 78.639 12.143 90.204 77.483 164.409 164.988 187.346 23.707 6.36 61.485 8.48 85.578 5.011l15.805-2.313 14.07 13.299c17.732 16.769 32.766 27.177 55.703 37.97 81.145 38.934 178.48 24.478 245.554-36.428 22.551-20.624 44.909-53.004 55.317-80.374l5.59-14.263 15.612-4.433c20.238-5.59 54.546-22.358 71.508-35.272 50.113-37.97 81.145-93.673 87.89-158.049 5.782-55.317-12.914-116.031-49.535-160.747l-6.36-7.71 3.855-13.492c12.528-45.295 8.288-98.684-11.565-143.786C843.622 193.56 764.597 141.519 677.092 141.519c-12.528 0-28.333.964-34.886 1.927l-12.336 2.12-14.07-13.299C586.31 104.127 551.231 85.624 510.177 76.758c-16.576-3.662-61.292-5.204-77.483-2.699z"></path></svg>'; break;
        case 'Claude': svgIcon = '<svg viewBox="0 0 1472 1024" width="24" height="24"><path d="M1047.36 0h-222.24L1230.4 1024h222.24L1047.36 0zM405.28 0L0 1024h226.624l82.88-215.04h424l82.88 215.04h226.624L637.728 0h-232.448z m-22.464 618.784l138.688-359.872 138.688 359.872h-277.376z"></path></svg>'; break;
        case 'Gemini': svgIcon = '<svg viewBox="0 0 1024 1024" width="24" height="24"><path d="M746.667 597.333a235.093 235.093 0 0 1-192 167.68 262.4 262.4 0 0 1-298.667-232.533A256 256 0 0 1 512 256a261.12 261.12 0 0 1 96.853 18.773 21.333 21.333 0 0 0 27.307-8.96l61.44-113.066a22.187 22.187 0 0 0-9.813-29.867A426.667 426.667 0 0 0 85.333 524.373 431.787 431.787 0 0 0 493.653 938.667 426.667 426.667 0 0 0 938.667 534.187v-85.334a21.76 21.76 0 0 0-21.334-21.333h-384a21.333 21.333 0 0 0-21.333 21.333v128a21.333 21.333 0 0 0 21.333 21.334h213.334"></path></svg>'; break;
        case 'Grok': svgIcon = '<svg viewBox="0 0 1086 1024" width="24" height="24"><path d="M410.748 652.878l343.878-254.138c16.849-12.412 40.96-7.571 48.966 11.792 42.294 102.028 23.397 224.69-60.726 308.907-84.092 84.216-201.138 102.71-308.131 60.633l-116.829 54.148c167.595 114.719 371.122 86.326 498.316-41.084 100.88-101.004 132.127-238.685 102.928-362.837l.248.279c-42.356-182.396 10.426-255.286 118.536-404.356 2.544-3.537 5.12-7.075 7.664-10.705l-142.274 142.429v-.434L410.655 653.002M339.782 714.659c-120.304-115.06-99.545-293.112 3.103-395.792 75.9-75.993 200.27-106.993 308.814-61.409l76.611-53.898c-21.008-15.205-47.942-31.558-78.817-43.039A386.793 386.793 0 0 0 269.188 245.17c-109.196 109.32-143.515 277.411-84.558 420.802 44.063 107.179-28.144 183.017-100.88 259.537-25.755 27.12-51.634 54.241-72.456 82.975l328.394-293.733"></path></svg>'; break;
        case 'DeepSeek': svgIcon = '<svg viewBox="0 0 1024 1024" width="24" height="24"><path d="M887.96 279.264c-8.144-3.96-11.648 3.584-16.416 7.424-1.608 1.256-3 2.888-4.36 4.336-11.904 12.696-25.8 20.992-43.928 19.984-26.56-1.44-49.2 6.856-69.224 27.096-4.264-24.96-18.408-39.856-39.92-49.408-11.264-4.96-22.672-9.928-30.528-20.744-5.528-7.664-7.016-16.216-9.792-24.64-1.736-5.088-3.512-10.312-9.384-11.192-6.376-1-8.872 4.344-11.36 8.8-10.048 18.24-13.904 38.344-13.552 58.72 0.88 45.76 20.304 82.208 58.832 108.176 4.392 2.952 5.52 5.968 4.136 10.304-2.624 8.928-5.744 17.6-8.528 26.528-1.736 5.72-4.36 6.976-10.48 4.464-21.16-8.8-39.44-21.808-55.584-37.592-27.408-26.4-52.2-55.568-83.12-78.384a356.832 356.832 0 0 0-22.008-15.024c-31.552-30.544 4.136-55.624 12.376-58.584 8.656-3.08 3-13.76-24.912-13.64-27.888 0.128-53.44 9.432-85.96 21.816-4.768 1.88-9.76 3.264-14.904 4.336-29.528-5.536-60.192-6.792-92.24-3.2-60.32 6.72-108.512 35.128-143.944 83.656-42.544 58.272-52.552 124.528-40.296 193.672 12.88 72.784 50.176 133.128 107.52 180.28 59.44 48.84 127.904 72.784 206 68.2 47.44-2.704 100.264-9.056 159.824-59.28 15.032 7.416 30.792 10.376 56.968 12.64 20.16 1.88 39.544-1.008 54.576-4.088 23.52-4.96 21.88-26.656 13.384-30.68-68.96-31.992-53.84-18.976-67.608-29.48 35.048-41.36 87.88-84.288 108.536-223.336 1.616-11.064 0.224-17.976 0-26.96-0.128-5.408 1.104-7.544 7.36-8.176 17.28-1.952 34.04-6.664 49.456-15.144 44.68-24.328 62.68-64.24 66.944-112.144 0.64-7.296-0.128-14.896-7.864-18.736zM498.584 710.288c-66.848-52.36-99.256-69.584-112.64-68.824-12.512 0.688-10.264 14.96-7.52 24.256 2.88 9.176 6.64 15.528 11.904 23.576 3.632 5.344 6.128 13.32-3.632 19.232-21.536 13.328-58.96-4.464-60.72-5.344-43.552-25.52-79.968-59.28-105.64-105.416-24.76-44.44-39.16-92.08-41.52-142.936-0.64-12.32 2.992-16.656 15.248-18.856 16.136-2.96 32.808-3.584 48.944-1.264 68.216 9.936 126.288 40.36 174.96 88.448 27.784 27.472 48.816 60.216 70.48 92.216 23.024 34 47.816 66.376 79.36 92.904 11.12 9.304 20.024 16.4 28.52 21.624-25.648 2.824-68.472 3.456-97.744-19.616z"></path></svg>'; break;
      }
      html += '<a href="javascript:void(0);" class="layui-font-18 link" data-action="' + item.action + '">' + svgIcon + '<span>' + item.name + '</span></a>';
    });
    scrollingContent.innerHTML = html;
    var container = document.getElementById('scrolling-container');
    if (!container) return;
    var scrollSpeed = 1, scrollInterval;
    function startScroll() {
      scrollInterval = setInterval(function() {
        container.scrollLeft += scrollSpeed;
        if (container.scrollLeft >= scrollingContent.scrollWidth - container.clientWidth) {
          container.scrollLeft = 0;
        }
      }, 20);
    }
    function stopScroll() { clearInterval(scrollInterval); }
    startScroll();
    container.addEventListener('mouseenter', stopScroll);
    container.addEventListener('mouseleave', startScroll);
  }

  // === Render Card List (from API) ===
  async function renderCardList() {
    const res = await fetchGet('/API/Web/Node/List');
    const cardData = (res && res.code === 200) ? res.data : getMockData("nodes");

    function renderCards(containerClass, data) {
      var container = document.querySelector('.ai-tools-container.' + containerClass);
      if (!container) return;
      var html = '';
      data.forEach(function(item) {
        html += '<div class="ai-tool-card" data-action="' + item.action + '">';
        html += '<div class="card-top"><div class="card-main-title">' + item.title + '</div><div class="card-arrow"></div></div>';
        html += '<div class="card-wrapper"><div class="card-content">';
        html += '<div class="card-row-1"><div class="card-left">';
        html += '<div class="card-badge">' + item.badge + '</div>';
        html += '<div class="card-subtitle">' + item.subtitle + '</div>';
        html += '<div class="card-description">' + item.description.join('<br />') + '</div>';
        html += '</div></div>';
        html += '<div class="card-row-3"><div class="card-image">';
        html += '<img src="' + item.img + '" alt="' + item.alt + '" />';
        html += '</div></div></div></div></div>';
      });
      container.innerHTML = html;
    }
    renderCards('vip', cardData);
    renderCards('free', cardData);
  }

  // === Param init (notices, QQ) ===
  async function initParamData() {
    const res = await fetchPost('/API/Web/Param/GetParamList', [{ KeyName: 'ListNotice' }, { KeyName: 'QQ' }]);
    if (res && res.code === 200) {
      res.data.forEach(function(param) {
        if (param.keyName === 'ListNotice') {
          const el = document.getElementById('div' + param.keyName);
          if (el) el.innerHTML = param.data;
        } else if (param.keyName === 'QQ') {
          const el = document.getElementById('span' + param.keyName);
          if (el) el.innerHTML = param.data;
        }
      });
    }
  }

  // === Action Handler ===
  async function actionHandler(action) {
    switch(action) {
      case 'Login':
      case 'qrCodeLogin':
        showLoginDialog();
        break;

      case 'Subscribe':
        showSubscribeDialog();
        break;

      case 'Notice':
        showNoticeDialog();
        break;

      case 'AutoCar':
        if (!currentUser) { showLoginDialog(); return; }
        showMessage('姝ｅ湪涓烘偍鍒嗛厤鏈€浣宠妭鐐?..', 'info');
        const carRes = await fetchPost('/API/Web/AutoCar', { action: 'AutoVIP' });
        if (carRes && carRes.code === 200 && carRes.data.redirectUrl) {
          showMessage('杩炴帴鎴愬姛锛屾鍦ㄨ烦杞?..', 'success');
          setTimeout(() => { window.open(carRes.data.redirectUrl, '_blank'); }, 500);
        } else if (carRes && carRes.msg) {
          showMessage(carRes.msg, 'error');
        }
        break;

      case 'AutoVIP':
      case 'AutoFree':
        if (!currentUser) { showLoginDialog(); return; }
        showMessage('姝ｅ湪杩炴帴鑺傜偣...', 'info');
        const nodeRes = await fetchPost('/API/Web/Node/Connect', { action });
        if (nodeRes && nodeRes.code === 200 && nodeRes.data.redirectUrl) {
          showMessage('杩炴帴鎴愬姛锛?, 'success');
          setTimeout(() => { window.open(nodeRes.data.redirectUrl, '_blank'); }, 500);
        } else if (nodeRes && nodeRes.msg) {
          showMessage(nodeRes.msg, 'error');
        }
        break;

      case 'Guide':
        showMessage('浣跨敤鏁欑▼锛氶€夋嫨妯″瀷鍚庣偣鍑?寮€濮嬪璇?鍗冲彲浣跨敤', 'info');
        break;

      case 'Agent':
        showMessage('鍒嗙珯鍚堜綔璇疯仈绯诲鏈嶏紝QQ缇わ細123456789', 'info');
        break;

      default:
        if (action.startsWith('Jump')) {
          if (!currentUser) { showLoginDialog(); return; }
          showMessage('姝ｅ湪璺宠浆鑷?' + action.replace('Jump', '') + ' 闀滃儚鑺傜偣...', 'info');
        } else if (action === 'AutoAPI') {
          showMessage('API鍔熻兘寮€鍙戜腑锛屾暚璇锋湡寰?, 'info');
        }
    }
  }

  // === Event Delegation ===
  document.addEventListener('click', function(e) {
    var target = e.target.closest('[data-action]');
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    var action = target.getAttribute('data-action');
    actionHandler(action);
  });

  // === Init ===
  document.addEventListener('DOMContentLoaded', async function() {
    initTabs();
    initCarousel('#ID-carousel-demo-image');
    await initParamData();
    await renderAiModelList();
    await renderCardList();
    // Check login state
    const res = await fetchGet('/API/Web/User/Info');
    if (res && res.code === 200) {
      currentUser = res.data;
      updateUserUI();
    }
    updateUserUI();
  });

})();
  // === Tab switching ===
  function initTabs() {
    var tabTitles = document.querySelectorAll('.layui-tab-title li');
    tabTitles.forEach(function(tab, index) {
      tab.addEventListener('click', function() {
        var parent = this.closest('.layui-tab');
        if (!parent) return;
        parent.querySelectorAll('.layui-tab-title li').forEach(function(t){t.classList.remove('layui-this')});
        this.classList.add('layui-this');
        var items = parent.querySelectorAll('.layui-tab-content .layui-tab-item');
        items.forEach(function(item){item.classList.remove('layui-show')});
        if (items[index]) items[index].classList.add('layui-show');
      });
    });
  }

  // === Carousel ===
  function initCarousel(selector) {
    var el = document.querySelector(selector);
    if (!el) return;
    var items = el.querySelectorAll('[carousel-item] > *');
    if (items.length < 2) return;
    var current = 0;
    setInterval(function() {
      items.forEach(function(item){item.style.display='none'});
      current = (current + 1) % items.length;
      items[current].style.display = 'block';
    }, 3000);
  }

  // === Render AI Model List ===
  function renderAiModelList() {
    var aiModels = [
      {platform:"GPT",name:"GPT-5.3",action:"JumpGPT"},
      {platform:"GPT",name:"GPT-5.5-Thinking",action:"JumpGPT"},
      {platform:"Grok",name:"Grok-4.2",action:"JumpGrok"},
      {platform:"Grok",name:"Grok-4.2 fast",action:"JumpGrok"},
      {platform:"Gemini",name:"Gemini-3.1-Pro",action:"JumpGemini"},
      {platform:"Gemini",name:"Gemini-3.1-Thinking",action:"JumpGemini"},
      {platform:"Gemini",name:"Gemini-3.1-flash",action:"JumpGemini"},
      {platform:"DeepSeek",name:"DeepSeek-V4-flash",action:"JumpSorux"},
      {platform:"DeepSeek",name:"DeepSeek-V4-Pro",action:"JumpSorux"},
      {platform:"Claude",name:"Claude-4.6-sonnet",action:"JumpSorux"},
      {platform:"Claude",name:"Claude-4.6-opus",action:"JumpSorux"},
      {platform:"Claude",name:"Claude-4.7-opus",action:"JumpSorux"}
    ];

    var scrollingContent = document.getElementById("scrolling-content");
    if (!scrollingContent) return;

    var html = '';
    aiModels.forEach(function(item) {
      var svgIcon = '';
      switch(item.platform) {
        case 'GPT': svgIcon = '<svg viewBox="0 0 1024 1024" width="24" height="24"><path d="M432.694 74.059c-20.045 3.277-45.487 11.372-65.725 21.202-50.306 24.478-88.854 66.303-109.478 119.308l-4.048 10.215-16.383 4.819C120.644 263.14 52.606 386.688 86.143 503.875c6.361 22.551 21.395 52.619 35.658 71.7l12.143 15.998-4.433 17.347c-5.59 21.973-7.517 55.895-4.433 78.639 12.143 90.204 77.483 164.409 164.988 187.346 23.707 6.36 61.485 8.48 85.578 5.011l15.805-2.313 14.07 13.299c17.732 16.769 32.766 27.177 55.703 37.97 81.145 38.934 178.48 24.478 245.554-36.428 22.551-20.624 44.909-53.004 55.317-80.374l5.59-14.263 15.612-4.433c20.238-5.59 54.546-22.358 71.508-35.272 50.113-37.97 81.145-93.673 87.89-158.049 5.782-55.317-12.914-116.031-49.535-160.747l-6.36-7.71 3.855-13.492c12.528-45.295 8.288-98.684-11.565-143.786C843.622 193.56 764.597 141.519 677.092 141.519c-12.528 0-28.333.964-34.886 1.927l-12.336 2.12-14.07-13.299C586.31 104.127 551.231 85.624 510.177 76.758c-16.576-3.662-61.292-5.204-77.483-2.699z"></path></svg>'; break;
        case 'Claude': svgIcon = '<svg viewBox="0 0 1472 1024" width="24" height="24"><path d="M1047.36 0h-222.24L1230.4 1024h222.24L1047.36 0zM405.28 0L0 1024h226.624l82.88-215.04h424l82.88 215.04h226.624L637.728 0h-232.448z m-22.464 618.784l138.688-359.872 138.688 359.872h-277.376z"></path></svg>'; break;
        case 'Gemini': svgIcon = '<svg viewBox="0 0 1024 1024" width="24" height="24"><path d="M746.667 597.333a235.093 235.093 0 0 1-192 167.68 262.4 262.4 0 0 1-298.667-232.533A256 256 0 0 1 512 256a261.12 261.12 0 0 1 96.853 18.773 21.333 21.333 0 0 0 27.307-8.96l61.44-113.066a22.187 22.187 0 0 0-9.813-29.867A426.667 426.667 0 0 0 85.333 524.373 431.787 431.787 0 0 0 493.653 938.667 426.667 426.667 0 0 0 938.667 534.187v-85.334a21.76 21.76 0 0 0-21.334-21.333h-384a21.333 21.333 0 0 0-21.333 21.333v128a21.333 21.333 0 0 0 21.333 21.334h213.334"></path></svg>'; break;
        case 'Grok': svgIcon = '<svg viewBox="0 0 1086 1024" width="24" height="24"><path d="M410.748 652.878l343.878-254.138c16.849-12.412 40.96-7.571 48.966 11.792 42.294 102.028 23.397 224.69-60.726 308.907-84.092 84.216-201.138 102.71-308.131 60.633l-116.829 54.148c167.595 114.719 371.122 86.326 498.316-41.084 100.88-101.004 132.127-238.685 102.928-362.837l.248.279c-42.356-182.396 10.426-255.286 118.536-404.356 2.544-3.537 5.12-7.075 7.664-10.705l-142.274 142.429v-.434L410.655 653.002M339.782 714.659c-120.304-115.06-99.545-293.112 3.103-395.792 75.9-75.993 200.27-106.993 308.814-61.409l76.611-53.898c-21.008-15.205-47.942-31.558-78.817-43.039A386.793 386.793 0 0 0 269.188 245.17c-109.196 109.32-143.515 277.411-84.558 420.802 44.063 107.179-28.144 183.017-100.88 259.537-25.755 27.12-51.634 54.241-72.456 82.975l328.394-293.733"></path></svg>'; break;
        case 'DeepSeek': svgIcon = '<svg viewBox="0 0 1024 1024" width="24" height="24"><path d="M887.96 279.264c-8.144-3.96-11.648 3.584-16.416 7.424-1.608 1.256-3 2.888-4.36 4.336-11.904 12.696-25.8 20.992-43.928 19.984-26.56-1.44-49.2 6.856-69.224 27.096-4.264-24.96-18.408-39.856-39.92-49.408-11.264-4.96-22.672-9.928-30.528-20.744-5.528-7.664-7.016-16.216-9.792-24.64-1.736-5.088-3.512-10.312-9.384-11.192-6.376-1-8.872 4.344-11.36 8.8-10.048 18.24-13.904 38.344-13.552 58.72 0.88 45.76 20.304 82.208 58.832 108.176 4.392 2.952 5.52 5.968 4.136 10.304-2.624 8.928-5.744 17.6-8.528 26.528-1.736 5.72-4.36 6.976-10.48 4.464-21.16-8.8-39.44-21.808-55.584-37.592-27.408-26.4-52.2-55.568-83.12-78.384a356.832 356.832 0 0 0-22.008-15.024c-31.552-30.544 4.136-55.624 12.376-58.584 8.656-3.08 3-13.76-24.912-13.64-27.888 0.128-53.44 9.432-85.96 21.816-4.768 1.88-9.76 3.264-14.904 4.336-29.528-5.536-60.192-6.792-92.24-3.2-60.32 6.72-108.512 35.128-143.944 83.656-42.544 58.272-52.552 124.528-40.296 193.672 12.88 72.784 50.176 133.128 107.52 180.28 59.44 48.84 127.904 72.784 206 68.2 47.44-2.704 100.264-9.056 159.824-59.28 15.032 7.416 30.792 10.376 56.968 12.64 20.16 1.88 39.544-1.008 54.576-4.088 23.52-4.96 21.88-26.656 13.384-30.68-68.96-31.992-53.84-18.976-67.608-29.48 35.048-41.36 87.88-84.288 108.536-223.336 1.616-11.064 0.224-17.976 0-26.96-0.128-5.408 1.104-7.544 7.36-8.176 17.28-1.952 34.04-6.664 49.456-15.144 44.68-24.328 62.68-64.24 66.944-112.144 0.64-7.296-0.128-14.896-7.864-18.736zM498.584 710.288c-66.848-52.36-99.256-69.584-112.64-68.824-12.512 0.688-10.264 14.96-7.52 24.256 2.88 9.176 6.64 15.528 11.904 23.576 3.632 5.344 6.128 13.32-3.632 19.232-21.536 13.328-58.96-4.464-60.72-5.344-43.552-25.52-79.968-59.28-105.64-105.416-24.76-44.44-39.16-92.08-41.52-142.936-0.64-12.32 2.992-16.656 15.248-18.856 16.136-2.96 32.808-3.584 48.944-1.264 68.216 9.936 126.288 40.36 174.96 88.448 27.784 27.472 48.816 60.216 70.48 92.216 23.024 34 47.816 66.376 79.36 92.904 11.12 9.304 20.024 16.4 28.52 21.624-25.648 2.824-68.472 3.456-97.744-19.616z"></path></svg>'; break;
      }
      html += '<a href="javascript:void(0);" class="layui-font-18 link" data-action="' + item.action + '">' + svgIcon + '<span>' + item.name + '</span></a>';
    });
    scrollingContent.innerHTML = html;

    // Start scrolling animation
    var container = document.getElementById('scrolling-container');
    if (!container) return;
    var scrollSpeed = 1;
    var scrollInterval;
    function startScroll() {
      scrollInterval = setInterval(function() {
        container.scrollLeft += scrollSpeed;
        if (container.scrollLeft >= scrollingContent.scrollWidth - container.clientWidth) {
          container.scrollLeft = 0;
        }
      }, 20);
    }
    function stopScroll() { clearInterval(scrollInterval); }
    startScroll();
    container.addEventListener('mouseenter', stopScroll);
    container.addEventListener('mouseleave', startScroll);
  }

  // === Render Card List ===
  function renderCardList() {
    var cardData = [
      {action:"AutoVIP",title:"鍏ㄦā鍨?闀滃儚绔?,badge:"Hot",subtitle:"鍏ㄦā鍨嬮暅鍍忕珯",description:["OpenAi瀹樼綉鍘熺増ChatGPT妯″瀷","闆嗘垚Gemini/Claude/Grok绛夐《绾i妯″瀷","涓€绔欏紡婊¤冻鎵€鏈堿i闇€姹?],img:"img/platform-sorux.svg",alt:"鍏ㄦā鍨?闀滃儚绔?},
      {action:"AutoVIP",title:"鍏ㄦā鍨?澶囩敤绔?,badge:"Hot",subtitle:"鍏ㄦā鍨?澶囩敤绔?,description:["鍏ㄦā鍨嬮暅鍍忕珯澶囩敤绯荤粺","闆嗘垚Gemini/Claude/Grok绛夐《绾i妯″瀷","涓€绔欏紡婊¤冻鎵€鏈堿i闇€姹?],img:"img/platform-fake-oai.svg",alt:"鍏ㄦā鍨?澶囩敤绔?},
      {action:"AutoVIP",title:"Grok-闀滃儚绔?,badge:"New",subtitle:"Grok瀹樼綉闀滃儚绔?,description:["椹柉鍏嬪叕鍙竫Ai瀹樼綉鐨凣rok闀滃儚绔?,"闆嗘垚Grok-3/Grok-4/Grok-4 Fast绛夋ā鍨?,"閫傚悎灏忚鍐欎綔/鏃ュ父闂/瀛︽湳鍒涗綔"],img:"img/platform-grok.svg",alt:"Grok瀹樼綉闀滃儚绔?},
      {action:"AutoVIP",title:"Gemini-闀滃儚绔?,badge:"New",subtitle:"Gemini瀹樼綉闀滃儚绔?,description:["璋锋瓕鍏徃Gemini瀹樼綉闀滃儚绔?,"闆嗘垚Gemini-fast/thinking/pro绛夋ā鍨?,"闇€瑕佸崟鐙€夎溅杩涜鐩磋揪璺宠浆"],img:"img/platform-gemini.svg",alt:"Gemini瀹樼綉闀滃儚绔?},
      {action:"AutoVIP",title:"ChatGPT-闀滃儚绔?,badge:"New",subtitle:"ChatGPT-闀滃儚绔?,description:["鏀寔鑷富閫夊彿锛岀洿鐧籊PT瀹樼綉","蹇€熷搷搴旓紝婊¤鍥炵瓟锛岃秴澶氳处鍙峰彲閫?,"閫傚悎璁烘枃鍒涗綔绛夊鏈爺绌跺伐浣?],img:"img/platform-xy-gpt.svg",alt:"ChatGPT-闀滃儚绔?},
      {action:"AutoVIP",title:"Claude-闀滃儚绔?,badge:"鍗冲皢涓婄嚎",subtitle:"Claude-闀滃儚绔?,description:["Claude瀹樼綉鍘熺増闀滃儚","鐩寸櫥瀹樼綉浣跨敤锛屾棤闇€娉ㄥ唽锛屾墦寮€鍗崇敤","閫傚悎缂栫▼浠ｇ爜绛夊鏉備换鍔?],img:"img/platform-claude.svg",alt:"Claude-闀滃儚绔?},
      {action:"AutoVIP",title:"Midjourney-闀滃儚绔?,badge:"鍗冲皢涓婄嚎",subtitle:"Midjourney-闀滃儚绔?,description:["Ai缁樼敾涓€閿垱浣?,"鍩轰簬Mj瀹樼綉杞绘澗瀹屾垚鍥剧敓鍥俱€佹枃鐢熷浘","杞绘澗缁樼敾锛岄珮鏁堝嚭鍥?],img:"img/platform-midjourney.svg",alt:"Midjourney-闀滃儚绔?},
      {action:"AutoAPI",title:"榫欒櫨璁″垝-API绔欑偣",badge:"New",subtitle:"榫欒櫨璁″垝-API绔欑偣",description:["API璋冪敤鍏ㄧ綉澶фā鍨?,"鏀寔Claude code锛孋odex绛夊骞冲彴","闇€鍗曠嫭鍏呭€硷紝鎸夐噺浠樿垂"],img:"img/platform-plan.svg",alt:"榫欒櫨璁″垝-API绔欑偣"}
    ];

    function renderCards(containerClass, data) {
      var container = document.querySelector('.ai-tools-container.' + containerClass);
      if (!container) return;
      var html = '';
      data.forEach(function(item) {
        html += '<div class="ai-tool-card" data-action="' + item.action + '">';
        html += '<div class="card-top"><div class="card-main-title">' + item.title + '</div><div class="card-arrow"></div></div>';
        html += '<div class="card-wrapper"><div class="card-content">';
        html += '<div class="card-row-1"><div class="card-left">';
        html += '<div class="card-badge">' + item.badge + '</div>';
        html += '<div class="card-subtitle">' + item.subtitle + '</div>';
        html += '<div class="card-description">' + item.description.join('<br />') + '</div>';
        html += '</div></div>';
        html += '<div class="card-row-3"><div class="card-image">';
        html += '<img src="' + item.img + '" alt="' + item.alt + '" />';
        html += '</div></div></div></div></div>';
      });
      container.innerHTML = html;
    }

    renderCards('vip', cardData);
    renderCards('free', cardData);
  }

  // === Click handler ===
  document.addEventListener('click', function(e) {
    var target = e.target.closest('[data-action]');
    if (!target) return;
    var action = target.getAttribute('data-action');
    switch(action) {
      case 'Login': alert('璇风櫥褰曞悗浣跨敤'); break;
      case 'AutoCar': case 'Subscribe': case 'Agent':
      case 'AutoVIP': case 'AutoFree':
        alert('鍔熻兘寮€鍙戜腑锛屾暚璇锋湡寰?); break;
      case 'Guide': alert('浣跨敤鏁欑▼锛氶€夋嫨妯″瀷鍚庣偣鍑诲紑濮嬪璇濆嵆鍙?); break;
      case 'Notice': alert('鏆傛棤鏂伴€氱煡'); break;
      default:
        if (action.startsWith('Jump') || action === 'AutoAPI') {
          alert('姝ｅ湪璺宠浆鑷?' + action + ' 鏈嶅姟...');
        }
    }
  });

  // === Init ===
  document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    initCarousel('#ID-carousel-demo-image');
    renderAiModelList();
    renderCardList();
  });
})();
/* Fallback inline icon font definitions for the treeware icons */
(function(){
  var style = document.createElement('style');
  style.textContent = '.layui-icon{font-family:layui-icon!important;font-size:16px;font-style:normal}';
  document.head.appendChild(style);
})();

/* AI Chat Platform - Main Application */
(function(){'use strict';
  const API_BASE = '';

  // ====== Fallback Data (当后端不可用时使用) ======
  const FALLBACK_MODELS = [
    {platform:"GPT",name:"GPT-5.3",action:"JumpGPT"},
    {platform:"GPT",name:"GPT-5.5-Thinking",action:"JumpGPT"},
    {platform:"Grok",name:"Grok-4.2",action:"JumpGrok"},
    {platform:"Grok",name:"Grok-4.2 fast",action:"JumpGrok"},
    {platform:"Gemini",name:"Gemini-3.1-Pro",action:"JumpGemini"},
    {platform:"Gemini",name:"Gemini-3.1-Thinking",action:"JumpGemini"},
    {platform:"Gemini",name:"Gemini-3.1-flash",action:"JumpGemini"},
    {platform:"DeepSeek",name:"DeepSeek-V4-flash",action:"JumpSorux"},
    {platform:"DeepSeek",name:"DeepSeek-V4-Pro",action:"JumpSorux"},
    {platform:"Claude",name:"Claude-4.6-sonnet",action:"JumpSorux"},
    {platform:"Claude",name:"Claude-4.6-opus",action:"JumpSorux"},
    {platform:"Claude",name:"Claude-4.7-opus",action:"JumpSorux"}
  ];
  const FALLBACK_NODES = [
    {action:"AutoVIP",title:"\u5168\u6a21\u578b-\u955c\u50cf\u7ad9",badge:"Hot",subtitle:"\u5168\u6a21\u578b\u955c\u50cf\u7ad9",description:["OpenAi\u5b98\u7f51\u539f\u7248ChatGPT\u6a21\u578b","\u96c6\u6210Gemini/Claude/Grok\u7b49\u9876\u7ea7Ai\u6a21\u578b","\u4e00\u7ad9\u5f0f\u6ee1\u8db3\u6240\u6709Ai\u9700\u6c42"],img:"img/platform-sorux.svg",alt:"\u5168\u6a21\u578b-\u955c\u50cf\u7ad9"},
    {action:"AutoVIP",title:"\u5168\u6a21\u578b-\u5907\u7528\u7ad9",badge:"Hot",subtitle:"\u5168\u6a21\u578b-\u5907\u7528\u7ad9",description:["\u5168\u6a21\u578b\u955c\u50cf\u7ad9\u5907\u7528\u7cfb\u7edf","\u96c6\u6210Gemini/Claude/Grok\u7b49\u9876\u7ea7Ai\u6a21\u578b","\u4e00\u7ad9\u5f0f\u6ee1\u8db3\u6240\u6709Ai\u9700\u6c42"],img:"img/platform-fake-oai.svg",alt:"\u5168\u6a21\u578b-\u5907\u7528\u7ad9"},
    {action:"AutoVIP",title:"Grok-\u955c\u50cf\u7ad9",badge:"New",subtitle:"Grok\u5b98\u7f51\u955c\u50cf\u7ad9",description:["\u9a6c\u65af\u514b\u516c\u53f8xAi\u5b98\u7f51\u7684Grok\u955c\u50cf\u7ad9","\u96c6\u6210Grok-3/Grok-4/Grok-4 Fast\u7b49\u6a21\u578b","\u9002\u5408\u5c0f\u8bf4\u5199\u4f5c/\u65e5\u5e38\u95ee\u9898/\u5b66\u672f\u521b\u4f5c"],img:"img/platform-grok.svg",alt:"Grok\u5b98\u7f51\u955c\u50cf\u7ad9"},
    {action:"AutoVIP",title:"Gemini-\u955c\u50cf\u7ad9",badge:"New",subtitle:"Gemini\u5b98\u7f51\u955c\u50cf\u7ad9",description:["\u8c37\u6b4c\u516c\u53f8Gemini\u5b98\u7f51\u955c\u50cf\u7ad9","\u96c6\u6210Gemini-fast/thinking/pro\u7b49\u6a21\u578b","\u9700\u8981\u5355\u72ec\u9009\u8f66\u8fdb\u884c\u76f4\u8fbe\u8df3\u8f6c"],img:"img/platform-gemini.svg",alt:"Gemini\u5b98\u7f51\u955c\u50cf\u7ad9"},
    {action:"AutoVIP",title:"ChatGPT-\u955c\u50cf\u7ad9",badge:"New",subtitle:"ChatGPT-\u955c\u50cf\u7ad9",description:["\u652f\u6301\u81ea\u4e3b\u9009\u53f7\uff0c\u76f4\u767bGPT\u5b98\u7f51","\u5feb\u901f\u54cd\u5e94\uff0c\u6ee1\u8840\u56de\u7b54\uff0c\u8d85\u591a\u8d26\u53f7\u53ef\u9009","\u9002\u5408\u8bba\u6587\u521b\u4f5c\u7b49\u5b66\u672f\u7814\u7a76\u5de5\u4f5c"],img:"img/platform-xy-gpt.svg",alt:"ChatGPT-\u955c\u50cf\u7ad9"},
    {action:"AutoVIP",title:"Claude-\u955c\u50cf\u7ad9",badge:"\u5373\u5c06\u4e0a\u7ebf",subtitle:"Claude-\u955c\u50cf\u7ad9",description:["Claude\u5b98\u7f51\u539f\u7248\u955c\u50cf","\u76f4\u767b\u5b98\u7f51\u4f7f\u7528\uff0c\u65e0\u9700\u6ce8\u518c\uff0c\u6253\u5f00\u5373\u7528","\u9002\u5408\u7f16\u7a0b\u4ee3\u7801\u7b49\u590d\u6742\u4efb\u52a1"],img:"img/platform-claude.svg",alt:"Claude-\u955c\u50cf\u7ad9"},
    {action:"AutoVIP",title:"Midjourney-\u955c\u50cf\u7ad9",badge:"\u5373\u5c06\u4e0a\u7ebf",subtitle:"Midjourney-\u955c\u50cf\u7ad9",description:["Ai\u7ed8\u753b\u4e00\u952e\u521b\u4f5c","\u57fa\u4e8eMj\u5b98\u7f51\u8f7b\u677e\u5b8c\u6210\u56fe\u751f\u56fe\u3001\u6587\u751f\u56fe","\u8f7b\u677e\u7ed8\u753b\uff0c\u9ad8\u6548\u51fa\u56fe"],img:"img/platform-midjourney.svg",alt:"Midjourney-\u955c\u50cf\u7ad9"},
    {action:"AutoAPI",title:"\u9f99\u867e\u8ba1\u5212-API\u7ad9\u70b9",badge:"New",subtitle:"\u9f99\u867e\u8ba1\u5212-API\u7ad9\u70b9",description:["API\u8c03\u7528\u5168\u7f51\u5927\u6a21\u578b","\u652f\u6301Claude code\uff0cCodex\u7b49\u591a\u5e73\u53f0","\u9700\u5355\u72ec\u5145\u503c\uff0c\u6309\u91cf\u4ed8\u8d39"],img:"img/platform-plan.svg",alt:"\u9f99\u867e\u8ba1\u5212-API\u7ad9\u70b9"}
  ];

  // ====== API Helpers with Fallback ======
  async function apiFetch(url, options = {}) {
    const config = { credentials: 'include', headers: { 'Content-Type': 'application/json', ...options.headers }, ...options };
    if (config.body && typeof config.body === 'object') config.body = JSON.stringify(config.body);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(API_BASE + url, { ...config, signal: controller.signal });
      clearTimeout(timeout);
      const data = await res.json();
      if (data.code === 401) { showLoginDialog(); return null; }
      return data;
    } catch (e) {
      // Backend unavailable - use fallback data
      if (url.includes('/AiModel/List')) return { code: 200, data: FALLBACK_MODELS };
      if (url.includes('/Node/List')) return { code: 200, data: FALLBACK_NODES };
      if (url === '/API/Web/User/Info') return { code: 401, msg: '\u8bf7\u5148\u767b\u5f55' };
      return null;
    }
  }
  function fetchGet(url) { return apiFetch(url); }
  function fetchPost(url, body) { return apiFetch(url, { method: 'POST', body: body || {} }); }

  // ====== User State ======
  let currentUser = null;

  // ====== Dialog / Message System ======
  function showLoginDialog() {
    const overlay = document.createElement('div');
    overlay.className = 'custom-dialog';
    overlay.innerHTML =
      '<div class="custom-dialog-content" style="min-width:360px;"><div class="custom-dialog-title">\u767b\u5f55</div>' +
      '<button class="custom-dialog-close">&times;</button><div class="custom-dialog-body">' +
      '<input id="loginUsername" type="text" placeholder="\u7528\u6237\u540d" class="login-input" />' +
      '<input id="loginPassword" type="password" placeholder="\u5bc6\u7801" class="login-input" />' +
      '<p style="color:#888;font-size:13px;margin:5px 0;">\u4f53\u9a8c\u8d26\u53f7: demo / 123456</p></div>' +
      '<div class="custom-dialog-footer"><button class="login-btn" id="loginBtn">\u767b\u5f55</button></div></div>';
    document.body.appendChild(overlay);
    overlay.querySelector('.custom-dialog-close').onclick = () => document.body.removeChild(overlay);
    overlay.onclick = (e) => { if (e.target === overlay) document.body.removeChild(overlay); };
    document.getElementById('loginBtn').onclick = async function() {
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value.trim();
      if (!username) { showMessage('\u8bf7\u8f93\u5165\u7528\u6237\u540d', 'error'); return; }
      const res = await fetchPost('/API/Web/Login', { username, password: password || '123456' });
      if (res && res.code === 200) {
        currentUser = res.data;
        document.body.removeChild(overlay);
        updateUserUI();
        showMessage('\u767b\u5f55\u6210\u529f', 'success');
      } else if (res) { showMessage(res.msg || '\u767b\u5f55\u5931\u8d25', 'error'); }
      else { currentUser = { nickname: username, isVip: false }; document.body.removeChild(overlay); updateUserUI(); showMessage('\u6e38\u5ba2\u6a21\u5f0f', 'success'); }
    };
  }

  function showMessage(msg, type) {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999;padding:12px 24px;border-radius:8px;font-size:15px;box-shadow:0 4px 12px rgba(0,0,0,.2);color:#fff;background:'+(type==='success'?'#10a37f':type==='error'?'#e53e3e':'#333')+';transition:opacity .3s;';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity='0'; setTimeout(() => {if(el.parentNode) el.parentNode.removeChild(el);}, 300); }, 2500);
  }

  function showSubscribeDialog() {
    const o = document.createElement('div'); o.className='custom-dialog';
    o.innerHTML = '<div class="custom-dialog-content"><div class="custom-dialog-title">\u4f1a\u5458\u5f00\u901a</div><button class="custom-dialog-close">&times;</button><div class="custom-dialog-body">' +
      '<div style="text-align:center;font-size:24px;font-weight:bold;color:#10a37f;margin-bottom:15px;">\u4f1a\u5458\u5957\u9910</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0;">' +
      '<div style="border:2px solid #e2e8f0;border-radius:12px;padding:15px;text-align:center;"><div style="font-size:15px;font-weight:bold;">\u6708\u5361</div><div style="font-size:22px;color:#10a37f;font-weight:bold;margin:8px 0;">30\u5143</div><div style="color:#888;">30\u5929</div></div>' +
      '<div style="border:2px solid #10a37f;border-radius:12px;padding:15px;text-align:center;background:#f0fdf4;"><div style="font-size:15px;font-weight:bold;">\u5b63\u5361</div><div style="font-size:22px;color:#10a37f;font-weight:bold;margin:8px 0;">78\u5143</div><div style="color:#888;">90\u5929 \u63a8\u8350</div></div>' +
      '<div style="border:2px solid #e2e8f0;border-radius:12px;padding:15px;text-align:center;"><div style="font-size:15px;font-weight:bold;">\u5e74\u5361</div><div style="font-size:22px;color:#10a37f;font-weight:bold;margin:8px 0;">288\u5143</div><div style="color:#888;">365\u5929</div></div></div>' +
      '<p style="color:#888;font-size:14px;text-align:center;">\u89e3\u9501\u5168\u90e8GPT\u6a21\u578b\u4e0e\u9ad8\u989d\u4f7f\u7528\u6b21\u6570</p></div></div>';
    document.body.appendChild(o);
    o.querySelector('.custom-dialog-close').onclick = () => document.body.removeChild(o);
    o.onclick = (e) => { if (e.target === o) document.body.removeChild(o); };
  }

  function showNoticeDialog() {
    const o = document.createElement('div'); o.className='custom-dialog';
    o.innerHTML = '<div class="custom-dialog-content"><div class="custom-dialog-title">\u901a\u77e5</div><button class="custom-dialog-close">&times;</button><div class="custom-dialog-body">' +
      '<div style="background:#f8fafc;border-radius:12px;padding:15px;margin:10px 0;"><div style="font-weight:bold;color:#333;margin-bottom:5px;">\u7cfb\u7edf\u7ef4\u62a4\u901a\u77e5</div><div style="color:#666;">\u6bcf\u5468\u4e09\u51cc\u66682:00-5:00\u8fdb\u884c\u7cfb\u7edf\u7ef4\u62a4</div></div>' +
      '<div style="background:#f8fafc;border-radius:12px;padding:15px;margin:10px 0;"><div style="font-weight:bold;color:#333;margin-bottom:5px;">\u65b0\u6a21\u578b\u4e0a\u7ebf</div><div style="color:#666;">GPT-5.5 Thinking\u6a21\u578b\u5df2\u4e0a\u7ebf\uff0c\u6b22\u8fce\u4f53\u9a8c</div></div>' +
      '<div style="background:#f8fafc;border-radius:12px;padding:15px;"><div style="font-weight:bold;color:#333;margin-bottom:5px;">\u4f1a\u5458\u4f18\u60e0</div><div style="color:#666;">\u65b0\u7528\u6237\u9996\u6708\u4f1a\u5458\u4ec5\u97001\u5143</div></div></div></div>';
    document.body.appendChild(o);
    o.querySelector('.custom-dialog-close').onclick = () => document.body.removeChild(o);
    o.onclick = (e) => { if (e.target === o) document.body.removeChild(o); };
  }

  // ====== UI Update ======
  function updateUserUI() {
    document.querySelectorAll('[data-anonymous]').forEach(el => el.classList.toggle('layui-hide', !!currentUser));
    document.querySelectorAll('[data-user]').forEach(el => el.classList.toggle('layui-hide', !currentUser));
    const nickName = document.querySelector('[data-nick-name]');
    const expTime = document.querySelector('[data-exp-time]');
    if (currentUser && nickName) nickName.textContent = currentUser.nickname || currentUser.username || '\u6e38\u5ba2';
    if (expTime) expTime.innerHTML = '\u4f1a\u5458\u5230\u671f\uff1a<span>' + ((currentUser && currentUser.isVip) ? (currentUser.expireTime || '\u5df2\u5f00\u901a') : '\u8fd8\u672a\u5f00\u901a\u4f1a\u5458') + '</span>';
  }

  // ====== Tab Switching ======
  function initTabs() {
    document.querySelectorAll('.layui-tab-title li').forEach(function(tab, index, arr) {
      tab.addEventListener('click', function() {
        var parent = this.closest('.layui-tab');
        if (!parent) return;
        arr.forEach(function(t){t.classList.remove('layui-this')});
        this.classList.add('layui-this');
        parent.querySelectorAll('.layui-tab-content .layui-tab-item').forEach(function(item, i){item.classList.toggle('layui-show', i === index)});
      });
    });
  }

  // ====== Carousel ======
  function initCarousel(selector) {
    var el = document.querySelector(selector);
    if (!el) return;
    var items = el.querySelectorAll('[carousel-item] > *');
    if (items.length < 2) return;
    var current = 0;
    setInterval(function() {
      items.forEach(function(item){item.style.display='none'});
      items[++current % items.length].style.display = 'block';
    }, 3000);
  }

  // ====== SVG Icons ======
  function getModelSvg(platform) {
    var map = {
      GPT: '<svg viewBox="0 0 1024 1024" width="24" height="24"><path d="M432.694 74.059c-20.045 3.277-45.487 11.372-65.725 21.202-50.306 24.478-88.854 66.303-109.478 119.308l-4.048 10.215-16.383 4.819C120.644 263.14 52.606 386.688 86.143 503.875c6.361 22.551 21.395 52.619 35.658 71.7l12.143 15.998-4.433 17.347c-5.59 21.973-7.517 55.895-4.433 78.639 12.143 90.204 77.483 164.409 164.988 187.346 23.707 6.36 61.485 8.48 85.578 5.011l15.805-2.313 14.07 13.299c17.732 16.769 32.766 27.177 55.703 37.97 81.145 38.934 178.48 24.478 245.554-36.428 22.551-20.624 44.909-53.004 55.317-80.374l5.59-14.263 15.612-4.433c20.238-5.59 54.546-22.358 71.508-35.272 50.113-37.97 81.145-93.673 87.89-158.049 5.782-55.317-12.914-116.031-49.535-160.747l-6.36-7.71 3.855-13.492c12.528-45.295 8.288-98.684-11.565-143.786C843.622 193.56 764.597 141.519 677.092 141.519c-12.528 0-28.333.964-34.886 1.927l-12.336 2.12-14.07-13.299C586.31 104.127 551.231 85.624 510.177 76.758c-16.576-3.662-61.292-5.204-77.483-2.699z"></path></svg>',
      Claude: '<svg viewBox="0 0 1472 1024" width="24" height="24"><path d="M1047.36 0h-222.24L1230.4 1024h222.24L1047.36 0zM405.28 0L0 1024h226.624l82.88-215.04h424l82.88 215.04h226.624L637.728 0h-232.448z m-22.464 618.784l138.688-359.872 138.688 359.872h-277.376z"></path></svg>',
      Gemini: '<svg viewBox="0 0 1024 1024" width="24" height="24"><path d="M746.667 597.333a235.093 235.093 0 0 1-192 167.68 262.4 262.4 0 0 1-298.667-232.533A256 256 0 0 1 512 256a261.12 261.12 0 0 1 96.853 18.773 21.333 21.333 0 0 0 27.307-8.96l61.44-113.066a22.187 22.187 0 0 0-9.813-29.867A426.667 426.667 0 0 0 85.333 524.373 431.787 431.787 0 0 0 493.653 938.667 426.667 426.667 0 0 0 938.667 534.187v-85.334a21.76 21.76 0 0 0-21.334-21.333h-384a21.333 21.333 0 0 0-21.333 21.333v128a21.333 21.333 0 0 0 21.333 21.334h213.334"></path></svg>',
      Grok: '<svg viewBox="0 0 1086 1024" width="24" height="24"><path d="M410.748 652.878l343.878-254.138c16.849-12.412 40.96-7.571 48.966 11.792 42.294 102.028 23.397 224.69-60.726 308.907-84.092 84.216-201.138 102.71-308.131 60.633l-116.829 54.148c167.595 114.719 371.122 86.326 498.316-41.084 100.88-101.004 132.127-238.685 102.928-362.837l.248.279c-42.356-182.396 10.426-255.286 118.536-404.356 2.544-3.537 5.12-7.075 7.664-10.705l-142.274 142.429v-.434L410.655 653.002M339.782 714.659c-120.304-115.06-99.545-293.112 3.103-395.792 75.9-75.993 200.27-106.993 308.814-61.409l76.611-53.898c-21.008-15.205-47.942-31.558-78.817-43.039A386.793 386.793 0 0 0 269.188 245.17c-109.196 109.32-143.515 277.411-84.558 420.802 44.063 107.179-28.144 183.017-100.88 259.537-25.755 27.12-51.634 54.241-72.456 82.975l328.394-293.733"></path></svg>',
      DeepSeek: '<svg viewBox="0 0 1024 1024" width="24" height="24"><path d="M887.96 279.264c-8.144-3.96-11.648 3.584-16.416 7.424-1.608 1.256-3 2.888-4.36 4.336-11.904 12.696-25.8 20.992-43.928 19.984-26.56-1.44-49.2 6.856-69.224 27.096-4.264-24.96-18.408-39.856-39.92-49.408-11.264-4.96-22.672-9.928-30.528-20.744-5.528-7.664-7.016-16.216-9.792-24.64-1.736-5.088-3.512-10.312-9.384-11.192-6.376-1-8.872 4.344-11.36 8.8-10.048 18.24-13.904 38.344-13.552 58.72 0.88 45.76 20.304 82.208 58.832 108.176 4.392 2.952 5.52 5.968 4.136 10.304-2.624 8.928-5.744 17.6-8.528 26.528-1.736 5.72-4.36 6.976-10.48 4.464-21.16-8.8-39.44-21.808-55.584-37.592-27.408-26.4-52.2-55.568-83.12-78.384a356.832 356.832 0 0 0-22.008-15.024c-31.552-30.544 4.136-55.624 12.376-58.584 8.656-3.08 3-13.76-24.912-13.64-27.888 0.128-53.44 9.432-85.96 21.816-4.768 1.88-9.76 3.264-14.904 4.336-29.528-5.536-60.192-6.792-92.24-3.2-60.32 6.72-108.512 35.128-143.944 83.656-42.544 58.272-52.552 124.528-40.296 193.672 12.88 72.784 50.176 133.128 107.52 180.28 59.44 48.84 127.904 72.784 206 68.2 47.44-2.704 100.264-9.056 159.824-59.28 15.032 7.416 30.792 10.376 56.968 12.64 20.16 1.88 39.544-1.008 54.576-4.088 23.52-4.96 21.88-26.656 13.384-30.68-68.96-31.992-53.84-18.976-67.608-29.48 35.048-41.36 87.88-84.288 108.536-223.336 1.616-11.064 0.224-17.976 0-26.96-0.128-5.408 1.104-7.544 7.36-8.176 17.28-1.952 34.04-6.664 49.456-15.144 44.68-24.328 62.68-64.24 66.944-112.144 0.64-7.296-0.128-14.896-7.864-18.736zM498.584 710.288c-66.848-52.36-99.256-69.584-112.64-68.824-12.512 0.688-10.264 14.96-7.52 24.256 2.88 9.176 6.64 15.528 11.904 23.576 3.632 5.344 6.128 13.32-3.632 19.232-21.536 13.328-58.96-4.464-60.72-5.344-43.552-25.52-79.968-59.28-105.64-105.416-24.76-44.44-39.16-92.08-41.52-142.936-0.64-12.32 2.992-16.656 15.248-18.856 16.136-2.96 32.808-3.584 48.944-1.264 68.216 9.936 126.288 40.36 174.96 88.448 27.784 27.472 48.816 60.216 70.48 92.216 23.024 34 47.816 66.376 79.36 92.904 11.12 9.304 20.024 16.4 28.52 21.624-25.648 2.824-68.472 3.456-97.744-19.616z"></path></svg>'
    };
    return map[platform] || '';
  }

  // ====== Render AI Models ======
  async function renderAiModelList() {
    var res = await fetchGet('/API/Web/AiModel/List');
    var models = (res && res.code === 200) ? res.data : FALLBACK_MODELS;
    var container = document.getElementById('scrolling-content');
    if (!container) return;
    var html = '';
    models.forEach(function(m) {
      html += '<a href="javascript:void(0);" class="layui-font-18 link" data-action="' + m.action + '">' + getModelSvg(m.platform) + '<span>' + m.name + '</span></a>';
    });
    container.innerHTML = html;
    var parent = document.getElementById('scrolling-container');
    if (!parent) return;
    var speed = 1, interval;
    function start() { interval = setInterval(function() { parent.scrollLeft += speed; if (parent.scrollLeft >= container.scrollWidth - parent.clientWidth) parent.scrollLeft = 0; }, 20); }
    function stop() { clearInterval(interval); }
    start();
    parent.addEventListener('mouseenter', stop);
    parent.addEventListener('mouseleave', start);
  }

  // ====== Render Card List ======
  async function renderCardList() {
    var res = await fetchGet('/API/Web/Node/List');
    var nodes = (res && res.code === 200) ? res.data : FALLBACK_NODES;
    function render(sel, data) {
      var container = document.querySelector(sel);
      if (!container) return;
      var html = '';
      data.forEach(function(n) {
        html += '<div class="ai-tool-card" data-action="' + n.action + '">' +
          '<div class="card-top"><div class="card-main-title">' + n.title + '</div><div class="card-arrow"></div></div>' +
          '<div class="card-wrapper"><div class="card-content">' +
          '<div class="card-row-1"><div class="card-left">' +
          '<div class="card-badge">' + n.badge + '</div>' +
          '<div class="card-subtitle">' + n.subtitle + '</div>' +
          '<div class="card-description">' + n.description.join('<br />') + '</div></div></div>' +
          '<div class="card-row-3"><div class="card-image"><img src="' + n.img + '" alt="' + n.alt + '" /></div></div></div></div></div>';
      });
      container.innerHTML = html;
    }
    render('.ai-tools-container.vip', nodes);
    render('.ai-tools-container.free', nodes);
  }

  // ====== Init Params ======
  async function initParamData() {
    var res = await fetchPost('/API/Web/Param/GetParamList', [{KeyName:'ListNotice'},{KeyName:'QQ'}]);
    if (res && res.code === 200) {
      res.data.forEach(function(p) {
        if (p.keyName === 'ListNotice') { var el = document.getElementById('divListNotice'); if (el) el.innerHTML = p.data; }
        if (p.keyName === 'QQ') { var el = document.getElementById('spanQQ'); if (el) el.innerHTML = p.data; }
      });
    }
  }

  // ====== Action Handler ======
  async function handleAction(action) {
    switch (action) {
      case 'Login': case 'qrCodeLogin': showLoginDialog(); break;
      case 'Subscribe': showSubscribeDialog(); break;
      case 'Notice': showNoticeDialog(); break;
      case 'Guide': showMessage('\u4f7f\u7528\u6559\u7a0b\uff1a\u9009\u62e9\u6a21\u578b\u540e\u70b9\u51fb\u201c\u5f00\u59cb\u5bf9\u8bdd\u201d\u5373\u53ef\u4f7f\u7528', 'info'); break;
      case 'Agent': showMessage('\u5206\u7ad9\u5408\u4f5c\u8bf7\u8054\u7cfb\u5ba2\u670d\uff0cQQ\u7fa4\uff1a123456789', 'info'); break;
      case 'AutoCar':
      case 'AutoVIP':
      case 'AutoFree':
        if (!currentUser) { showLoginDialog(); return; }
        if (!currentUser.isVip) { showSubscribeDialog(); return; }
        showMessage('\u6b63\u5728\u8fde\u63a5\u8282\u70b9...', 'info');
        var res = await fetchPost('/API/Web/Node/Connect', { action: action });
        if (res && res.code === 200) {
          showMessage('\u8fde\u63a5\u6210\u529f\uff01', 'success');
          if (res.data && res.data.redirectUrl) setTimeout(function(){ window.open(res.data.redirectUrl, '_blank'); }, 500);
        } else if (res && res.msg) { showMessage(res.msg, 'error'); }
        else showMessage('\u6e38\u5ba2\u6a21\u5f0f\uff1a\u8282\u70b9\u8bbf\u95ee\u529f\u80fd\u5c06\u5728\u540e\u7aef\u63a5\u5165\u540e\u751f\u6548', 'info');
        break;
      default:
        if (action.startsWith('Jump')) {
          if (!currentUser) { showLoginDialog(); return; }
          showMessage('\u6b63\u5728\u8df3\u8f6c\u81f3 ' + action.replace('Jump','') + ' \u670d\u52a1...', 'info');
        } else if (action === 'AutoAPI') showMessage('API\u529f\u80fd\u5f00\u53d1\u4e2d\uff0c\u656c\u8bf7\u671f\u5f85', 'info');
    }
  }

  // ====== Event Binding ======
  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-action]');
    if (el) { e.preventDefault(); e.stopPropagation(); handleAction(el.getAttribute('data-action')); }
  });

  // ====== Init ======
  document.addEventListener('DOMContentLoaded', async function() {
    initTabs();
    initCarousel('#ID-carousel-demo-image');
    await initParamData();
    await renderAiModelList();
    await renderCardList();
    var res = await fetchGet('/API/Web/User/Info');
    if (res && res.code === 200) { currentUser = res.data; }
    updateUserUI();
  });
})();
