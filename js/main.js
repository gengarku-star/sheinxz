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
    return `
      <div class="card">
        <div class="card-title">${escapeHtml(file.name)}</div>
        ${file.description ? `<p class="card-meta">${escapeHtml(file.description)}</p>` : ''}
        <div class="card-meta">
          ${formatFileSize(file.file_size)} · 上传于 ${formatTime(file.created_at)}
        </div>
        <a href="${urlData.publicUrl}" download class="btn btn-primary btn-sm">下载</a>
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

// ---- 初始化 ----
document.addEventListener('DOMContentLoaded', () => {
  highlightNav();

  // 首页
  if (document.getElementById('page-home')) {
    loadPageContent('home');
  }

  // 资源页
  if (document.getElementById('page-resources')) {
    loadPageContent('resources');
    loadFiles();
  }

  // 留言表单
  const msgForm = document.getElementById('message-form');
  if (msgForm) {
    msgForm.addEventListener('submit', submitMessage);
    loadMessages();
  }
});
