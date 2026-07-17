/**
 * 前台页面逻辑 — 内容展示、文件下载、留言提交
 */

// ---- Toast 提示 ----
function showToast(message, duration = 3000) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ---- 格式化文件大小 ----
function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ---- 文件类型图标 ----
function getFileIcon(typeOrName) {
  const t = (typeOrName || '').toLowerCase();
  if (t.includes('pdf') || t.endsWith('.pdf')) return '📕';
  if (t.includes('word') || t.includes('document') || t.endsWith('.doc') || t.endsWith('.docx')) return '📘';
  if (t.includes('excel') || t.includes('sheet') || t.endsWith('.xls') || t.endsWith('.xlsx') || t.endsWith('.csv')) return '📗';
  if (t.includes('powerpoint') || t.includes('presentation') || t.endsWith('.ppt') || t.endsWith('.pptx')) return '📙';
  if (t.includes('image') || /\.(png|jpe?g|gif|svg|webp|bmp)$/.test(t)) return '🖼️';
  if (t.includes('video') || /\.(mp4|avi|mov|wmv|mkv)$/.test(t)) return '🎬';
  if (t.includes('audio') || /\.(mp3|wav|ogg|flac|aac)$/.test(t)) return '🎵';
  if (t.includes('zip') || t.includes('rar') || t.includes('7z') || t.includes('tar') || t.includes('gz')) return '📦';
  return '📄';
}

// ---- 格式化时间 ----
function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

// ---- 加载页面内容 ----
async function loadPageContent(slug) {
  const titleEl = document.getElementById('page-title');
  const contentEl = document.getElementById('page-content');
  if (!titleEl || !contentEl) return;

  const { data, error } = await supabase
    .from('pages')
    .select('title, content')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    titleEl.textContent = '页面加载中…';
    contentEl.innerHTML = '<div class="loading">内容暂时无法加载</div>';
    return;
  }

  titleEl.textContent = data.title;
  contentEl.innerHTML = data.content.replace(/\n/g, '<br>');
}

// ---- 加载文件列表 ----
async function loadFiles() {
  const container = document.getElementById('file-list');
  if (!container) return;

  container.innerHTML = '<div class="loading">加载中…</div>';

  const { data, error } = await supabase
    .from('files')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📂</div>
        <p>暂无可下载的资源</p>
      </div>`;
    return;
  }

  container.innerHTML = data.map(file => {
    const { data: urlData } = supabase.storage.from('site-files').getPublicUrl(file.file_path);
    const previewHtml = file.preview_url
      ? `<div class="file-preview"><img src="${escapeHtml(file.preview_url)}" alt="${escapeHtml(file.name)}" /></div>`
      : `<div class="file-preview file-icon-preview"><span>${getFileIcon(file.file_type || file.name)}</span></div>`;
    return `
      <div class="card file-card">
        ${previewHtml}
        <div class="file-card-body">
          <div class="card-title">${escapeHtml(file.name)}</div>
          ${file.description ? `<p class="card-meta">${escapeHtml(file.description)}</p>` : ''}
          <div class="card-meta">
            ${formatFileSize(file.file_size)} · 上传于 ${formatTime(file.created_at)}
          </div>
          <a href="${urlData.publicUrl}" download class="btn btn-primary btn-sm">下载</a>
        </div>
      </div>`;
  }).join('');
}

// ---- 加载留言 ----
async function loadMessages() {
  const container = document.getElementById('message-list');
  if (!container) return;

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💬</div>
        <p>还没有留言，来做第一个吧</p>
      </div>`;
    return;
  }

  container.innerHTML = data.map(msg => `
    <div class="message-item">
      <span class="message-author">${escapeHtml(msg.name)}</span>
      <span class="message-time">${formatTime(msg.created_at)}</span>
      <div class="message-body">${escapeHtml(msg.content)}</div>
    </div>
  `).join('');
}

// ---- 提交留言 ----
async function submitMessage(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.querySelector('[name="name"]').value.trim();
  const email = form.querySelector('[name="email"]').value.trim();
  const content = form.querySelector('[name="content"]').value.trim();

  if (!name || !content) {
    showToast('请填写姓名和留言内容');
    return;
  }

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = '提交中…';

  const { error } = await supabase.from('messages').insert({ name, email, content });

  btn.disabled = false;
  btn.textContent = '提交留言';

  if (error) {
    showToast('提交失败，请稍后重试');
    return;
  }

  showToast('留言已提交，感谢！');
  form.reset();
  loadMessages();
}

// ---- HTML 转义 ----
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- 导航高亮 ----
function highlightNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.navbar-links a').forEach(link => {
    if (link.getAttribute('href') && path.endsWith(link.getAttribute('href'))) {
      link.classList.add('active');
    }
  });
}

// ---- 内推进度页逻辑 ----
async function initReferralPage() {
  const monthsContainer = document.getElementById('referral-months');
  const boardsContainer = document.getElementById('referral-boards');
  if (!monthsContainer || !boardsContainer) return;

  // 获取所有可用月份
  const { data: allRows } = await supabase
    .from('referral_rankings')
    .select('month')
    .order('month', { ascending: false });

  const months = [...new Set((allRows || []).map(r => r.month))].sort().reverse();

  if (months.length === 0) {
    monthsContainer.innerHTML = '<p class="page-subtitle">暂无数据，管理员可在后台添加</p>';
    boardsContainer.innerHTML = '';
    return;
  }

  // 渲染月份按钮
  monthsContainer.innerHTML = months.map((m, i) =>
    `<button class="month-btn ${i === 0 ? 'active' : ''}" data-month="${m}">${formatMonth(m)}</button>`
  ).join('');

  // 默认加载最新月份
  loadReferralBoards(months[0], boardsContainer);

  // 点击切换月份
  monthsContainer.addEventListener('click', (e) => {
    if (!e.target.classList.contains('month-btn')) return;
    monthsContainer.querySelectorAll('.month-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    loadReferralBoards(e.target.dataset.month, boardsContainer);
  });
}

async function loadReferralBoards(month, container) {
  container.innerHTML = '<div class="loading">加载中…</div>';

  const { data, error } = await supabase
    .from('referral_rankings')
    .select('*')
    .eq('month', month)
    .order('category')
    .order('rank_order');

  if (error || !data || data.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>该月份暂无数据</p></div>';
    return;
  }

  const categories = [
    { key: 'resumes', emoji: '🏆', title: '内推简历数 Top 10' },
    { key: 'interviews', emoji: '🎯', title: '内推面试数 Top 10' },
    { key: 'offers', emoji: '🎉', title: '内推 offer 数 Top 10' },
    { key: 'top_positions', emoji: '📋', title: '简历数 Top 10 岗位' },
    { key: 'lacking_positions', emoji: '⚠️', title: '简历欠缺 Top 10 岗位' },
  ];

  const medals = ['🥇', '🥈', '🥉'];

  container.innerHTML = '<div class="rank-grid">' + categories.map(cat => {
    const items = data.filter(d => d.category === cat.key);
    const isPosition = cat.key.includes('position');
    const listHtml = items.length > 0
      ? items.map((item, idx) => {
          const medal = idx < 3 ? `<span class="rank-medal">${medals[idx]}</span>` : `<span class="rank-num">${idx + 1}</span>`;
          const hasLink = isPosition && item.link_url;
          const nameHtml = hasLink
            ? `<a href="${escapeHtml(item.link_url)}" target="_blank" rel="noopener" class="rank-name rank-name-link">${escapeHtml(item.name)} <span class="rank-link-icon">↗</span></a>`
            : `<span class="rank-name">${escapeHtml(item.name)}</span>`;
          return `<div class="rank-item">${medal}${nameHtml}<span class="rank-count">${item.count}</span></div>`;
        }).join('')
      : '<div class="rank-empty">暂无数据</div>';
    return `<div class="rank-board"><div class="rank-header">${cat.emoji} ${cat.title}</div>${listHtml}</div>`;
  }).join('') + '</div>';
}

function formatMonth(m) {
  const [y, mo] = m.split('-');
  return `${y}年${parseInt(mo)}月`;
}

// ---- SHEIN动态页逻辑 ----
async function initNewsPage() {
  const calendarEl = document.getElementById('news-calendar');
  const activitiesEl = document.getElementById('news-activities');

  if (calendarEl) await loadCalendar(calendarEl);
  if (activitiesEl) await loadActivities(activitiesEl);
}

async function loadCalendar(container, year, month) {
  const now = new Date();
  year = year || now.getFullYear();
  month = month || now.getMonth(); // 0-indexed

  container.innerHTML = '<div class="loading">加载日历…</div>';

  // 获取该月事件
  const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
  const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const { data: events } = await supabase
    .from('calendar_events')
    .select('*')
    .gte('event_date', firstDay)
    .lte('event_date', lastDay)
    .order('event_date');

  const eventMap = {};
  (events || []).forEach(ev => {
    if (!eventMap[ev.event_date]) eventMap[ev.event_date] = [];
    eventMap[ev.event_date].push(ev);
  });

  // 构建日历网格
  const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  const dayNames = ['日','一','二','三','四','五','六'];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const isPrev = month === 0;
  const isNext = month === 11;
  const prevMonth = isPrev ? 11 : month - 1;
  const nextMonth = isNext ? 0 : month + 1;
  const prevYear = isPrev ? year - 1 : year;
  const nextYear = isNext ? year + 1 : year;

  let html = `
    <div class="calendar-nav">
      <button class="btn btn-sm" onclick="loadCalendar(document.getElementById('news-calendar'),${prevYear},${prevMonth})">◀</button>
      <span class="calendar-title">${year}年${monthNames[month]}</span>
      <button class="btn btn-sm" onclick="loadCalendar(document.getElementById('news-calendar'),${nextYear},${nextMonth})">▶</button>
    </div>
    <div class="calendar-grid">
      ${dayNames.map(d => `<div class="calendar-day-header">${d}</div>`).join('')}
  `;

  for (let i = 0; i < startDay; i++) {
    html += '<div class="calendar-day empty"></div>';
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayEvents = eventMap[dateStr];
    const hasEvent = dayEvents && dayEvents.length > 0;
    const today = now.getFullYear() === year && now.getMonth() === month && now.getDate() === d;

    html += `<div class="calendar-day${hasEvent ? ' has-event' : ''}${today ? ' today' : ''}" ${hasEvent ? `onclick="showEventPopup(this, ${JSON.stringify(dayEvents.map(e => ({title: e.title, description: e.description, link_url: e.link_url || ''}))).replace(/"/g, '&quot;')})"` : ''}>
      <span class="day-num">${d}</span>
      ${hasEvent ? '<span class="event-dot"></span>' : ''}
    </div>`;
  }

  html += '</div>';
  container.innerHTML = html;
}

function showEventPopup(el, events) {
  // 移除已有弹窗
  document.querySelectorAll('.event-popup').forEach(p => p.remove());

  const popup = document.createElement('div');
  popup.className = 'event-popup';
  popup.innerHTML = events.map(e => {
    const linkHtml = e.link_url
      ? `<a href="${escapeHtml(e.link_url)}" target="_blank" rel="noopener" class="event-popup-link">点击跳转 →</a>`
      : '';
    return `<div class="event-popup-item"><strong>${escapeHtml(e.title)}</strong>${e.description ? `<p>${escapeHtml(e.description)}</p>` : ''}${linkHtml}</div>`;
  }).join('');

  el.style.position = 'relative';
  el.appendChild(popup);

  // 点击外部关闭
  setTimeout(() => {
    document.addEventListener('click', function closePopup(ev) {
      if (!popup.contains(ev.target) && ev.target !== el) {
        popup.remove();
        document.removeEventListener('click', closePopup);
      }
    });
  }, 10);
}

async function loadActivities(container) {
  container.innerHTML = '<div class="loading">加载活动…</div>';

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('sort_order')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📰</div><p>暂无活动动态</p></div>';
    return;
  }

  container.innerHTML = '<div class="activity-grid">' + data.map(act => `
    <a href="${escapeHtml(act.link_url || '#')}" target="_blank" rel="noopener" class="activity-card">
      ${act.image_url ? `<div class="activity-img"><img src="${escapeHtml(act.image_url)}" alt="${escapeHtml(act.title)}" /></div>` : '<div class="activity-img placeholder"><span>📢</span></div>'}
      <div class="activity-body">
        <h3 class="activity-title">${escapeHtml(act.title)}</h3>
        ${act.description ? `<p class="activity-desc">${escapeHtml(act.description)}</p>` : ''}
        <span class="activity-link">了解更多 →</span>
      </div>
    </a>
  `).join('') + '</div>';
}

// ---- 访客记录 ----
function getVisitorId() {
  let vid = localStorage.getItem('shein_visitor_id');
  if (!vid) {
    vid = 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('shein_visitor_id', vid);
  }
  return vid;
}

function getCurrentPageSlug() {
  const path = window.location.pathname;
  if (path.endsWith('referral.html')) return 'referral';
  if (path.endsWith('news.html')) return 'news';
  if (path.endsWith('resources.html')) return 'resources';
  if (path.endsWith('article.html')) {
    const slug = new URLSearchParams(window.location.search).get('slug');
    return slug || 'article';
  }
  return 'home'; // index.html 或根路径
}

async function trackPageView() {
  try {
    const visitor_id = getVisitorId();
    const page_slug = getCurrentPageSlug();
    const view_date = new Date().toISOString().split('T')[0];

    await supabase.from('page_views').insert({
      page_slug, visitor_id, view_date
    });
    // UNIQUE(page_slug, view_date, visitor_id) 会自动去重，重复插入会静默失败
  } catch (e) {
    // 静默忽略埋点错误，不影响用户体验
    console.debug('Page view tracking:', e.message);
  }
}

// ---- 初始化 ----
document.addEventListener('DOMContentLoaded', () => {
  highlightNav();
  trackPageView(); // 记录访问

  // 首页
  if (document.getElementById('page-home')) {
    loadPageContent('home');
  }

  // 资源页
  if (document.getElementById('page-resources')) {
    loadPageContent('resources');
    loadFiles();
  }

  // 留言表单（首页和资源页都可能存在）
  const msgForm = document.getElementById('message-form');
  if (msgForm) {
    msgForm.addEventListener('submit', submitMessage);
    loadMessages();
  }

  // 内推进度页
  if (document.getElementById('page-referral')) {
    initReferralPage();
  }

  // SHEIN动态页
  if (document.getElementById('page-news')) {
    initNewsPage();
  }
});
