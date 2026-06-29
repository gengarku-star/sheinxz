/**
 * 管理后台逻辑 — 登录、内容管理、文件管理、留言管理
 */

// ---- Toast ----
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

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ============================================
// 登录页
// ============================================
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = e.target.querySelector('button[type="submit"]');

  btn.disabled = true;
  btn.textContent = '登录中…';

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  btn.disabled = false;
  btn.textContent = '登录';

  if (error) {
    showToast('登录失败：' + error.message);
    return;
  }

  window.location.href = 'dashboard.html';
}

// ============================================
// Dashboard
// ============================================
let currentUser = null;

async function checkAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  currentUser = user;
  return user;
}

async function handleLogout() {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
}

// ---- 标签页切换 ----
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

// ============================================
// 内容管理
// ============================================
async function loadPages() {
  const container = document.getElementById('pages-container');
  if (!container) return;

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('slug');

  if (error) {
    container.innerHTML = '<p>加载失败</p>';
    return;
  }

  container.innerHTML = data.map(page => `
    <div class="card" data-page-id="${page.id}">
      <div class="form-group">
        <label class="form-label">标题</label>
        <input type="text" class="form-input page-title-input" value="${escapeHtml(page.title)}" />
      </div>
      <div class="form-group">
        <label class="form-label">内容（纯文本，换行自动保留）</label>
        <textarea class="form-textarea page-content-input" rows="6">${escapeHtml(page.content)}</textarea>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span class="card-meta">slug: ${escapeHtml(page.slug)} · 更新于 ${formatTime(page.updated_at)}</span>
        <button class="btn btn-primary btn-sm" onclick="savePage('${page.id}')">保存</button>
      </div>
    </div>
  `).join('');
}

async function savePage(id) {
  const card = document.querySelector(`[data-page-id="${id}"]`);
  const title = card.querySelector('.page-title-input').value.trim();
  const content = card.querySelector('.page-content-input').value;

  const { error } = await supabase
    .from('pages')
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    showToast('保存失败：' + error.message);
    return;
  }
  showToast('已保存');
}

// ============================================
// 文件管理
// ============================================
async function loadAdminFiles() {
  const container = document.getElementById('files-container');
  if (!container) return;

  container.innerHTML = '<div class="loading">加载中…</div>';

  const { data, error } = await supabase
    .from('files')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>暂无文件</p></div>';
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>文件名</th>
          <th>说明</th>
          <th>大小</th>
          <th>上传时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(f => `
          <tr>
            <td>${escapeHtml(f.name)}</td>
            <td>${escapeHtml(f.description) || '-'}</td>
            <td>${formatFileSize(f.file_size)}</td>
            <td>${formatTime(f.created_at)}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteFile('${f.id}','${escapeHtml(f.file_path)}')">删除</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

async function uploadFile(file) {
  const filePath = `${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('site-files')
    .upload(filePath, file);

  if (uploadError) {
    showToast('上传失败：' + uploadError.message);
    return;
  }

  const description = document.getElementById('file-description').value.trim();

  const { error: insertError } = await supabase.from('files').insert({
    name: file.name,
    description,
    file_path: filePath,
    file_size: file.size,
    file_type: file.type,
  });

  if (insertError) {
    showToast('保存记录失败：' + insertError.message);
    return;
  }

  showToast('上传成功');
  document.getElementById('file-description').value = '';
  document.getElementById('file-input').value = '';
  loadAdminFiles();
}

async function deleteFile(id, filePath) {
  if (!confirm('确定删除此文件？')) return;

  await supabase.storage.from('site-files').remove([filePath]);

  const { error } = await supabase.from('files').delete().eq('id', id);
  if (error) {
    showToast('删除记录失败');
    return;
  }
  showToast('已删除');
  loadAdminFiles();
}

// ============================================
// 留言管理
// ============================================
async function loadAdminMessages() {
  const container = document.getElementById('messages-container');
  if (!container) return;

  container.innerHTML = '<div class="loading">加载中…</div>';

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>暂无留言</p></div>';
    return;
  }

  container.innerHTML = data.map(msg => `
    <div class="message-item">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <span class="message-author">${escapeHtml(msg.name)}</span>
          ${msg.email ? `<span class="card-meta"> · ${escapeHtml(msg.email)}</span>` : ''}
          <span class="message-time">${formatTime(msg.created_at)}</span>
        </div>
        <button class="btn btn-danger btn-sm" onclick="deleteMessage('${msg.id}')">删除</button>
      </div>
      <div class="message-body">${escapeHtml(msg.content)}</div>
    </div>
  `).join('');
}

async function deleteMessage(id) {
  if (!confirm('确定删除此留言？')) return;

  const { error } = await supabase.from('messages').delete().eq('id', id);
  if (error) {
    showToast('删除失败');
    return;
  }
  showToast('已删除');
  loadAdminMessages();
}

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  // 登录页
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
    return;
  }

  // Dashboard
  const dashboard = document.getElementById('admin-dashboard');
  if (!dashboard) return;

  const user = await checkAuth();
  if (!user) return;

  document.getElementById('user-email').textContent = user.email;
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  initTabs();
  loadPages();
  loadAdminFiles();
  loadAdminMessages();

  // 文件上传
  const fileInput = document.getElementById('file-input');
  const uploadBtn = document.getElementById('upload-btn');
  const uploadZone = document.getElementById('upload-zone');

  if (uploadZone) {
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('dragover');
    });
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        uploadZone.querySelector('p').textContent = `已选择: ${e.dataTransfer.files[0].name}`;
      }
    });
  }

  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      const file = fileInput.files[0];
      if (!file) {
        showToast('请先选择文件');
        return;
      }
      uploadBtn.disabled = true;
      uploadBtn.textContent = '上传中…';
      uploadFile(file).finally(() => {
        uploadBtn.disabled = false;
        uploadBtn.textContent = '上传文件';
      });
    });
  }
});
