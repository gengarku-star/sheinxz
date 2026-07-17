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
        <label class="form-label">内容（支持 HTML 标签，如 &lt;h2&gt; &lt;p&gt; &lt;ul&gt; &lt;strong&gt; &lt;img&gt; 等）</label>
        <textarea class="form-textarea page-content-input" id="content-${page.id}" rows="16">${escapeHtml(page.content)}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">插入图片</label>
        <div class="image-upload-row">
          <input type="file" accept="image/*" class="form-input page-image-input" id="img-input-${page.id}" />
          <button class="btn btn-sm" onclick="uploadAndInsertImage('${page.id}')">上传图片</button>
        </div>
        <div class="image-preview-area" id="img-preview-${page.id}"></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span class="card-meta">slug: ${escapeHtml(page.slug)} · 更新于 ${formatTime(page.updated_at)}</span>
        <button class="btn btn-primary btn-sm" onclick="savePage('${page.id}')">保存</button>
      </div>
    </div>
  `).join('');
}

// 存储待插入的图片标签
const pendingImages = {};

async function uploadAndInsertImage(pageId) {
  const input = document.getElementById('img-input-' + pageId);
  const preview = document.getElementById('img-preview-' + pageId);
  const file = input.files[0];

  if (!file) {
    showToast('请先选择图片');
    return;
  }

  preview.innerHTML = '<span class="card-meta">上传中…</span>';

  const ext = file.name.split('.').pop().replace(/[^a-zA-Z0-9]/g, '');
  const filePath = `images/${Date.now()}.${ext || 'png'}`;
  const { error: uploadError } = await supabase.storage
    .from('site-files')
    .upload(filePath, file, { upsert: false });

  if (uploadError) {
    preview.innerHTML = '<span style="color:#dc2626;">上传失败：' + escapeHtml(uploadError.message) + '</span>';
    return;
  }

  const { data: urlData } = supabase.storage.from('site-files').getPublicUrl(filePath);
  const imgUrl = urlData.publicUrl;
  const imgTag = '<img src="' + imgUrl + '" alt="' + escapeHtml(file.name) + '" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0;" />';

  pendingImages[pageId] = imgTag;

  preview.innerHTML = '';
  const previewDiv = document.createElement('div');
  previewDiv.style.marginTop = '8px';

  const img = document.createElement('img');
  img.src = imgUrl;
  img.style.cssText = 'max-width:200px;max-height:150px;border-radius:6px;border:1px solid var(--border);';
  previewDiv.appendChild(img);

  const tip = document.createElement('p');
  tip.className = 'card-meta';
  tip.style.marginTop = '6px';
  tip.textContent = '图片已上传，点击下方按钮插入到内容中光标位置';
  previewDiv.appendChild(tip);

  const btn = document.createElement('button');
  btn.className = 'btn btn-sm btn-primary';
  btn.textContent = '插入到内容';
  btn.onclick = function() { insertImageTag(pageId); };
  previewDiv.appendChild(btn);

  preview.appendChild(previewDiv);
}

function insertImageTag(pageId) {
  const imgTag = pendingImages[pageId];
  if (!imgTag) {
    showToast('没有待插入的图片');
    return;
  }
  const textarea = document.getElementById('content-' + pageId);
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  textarea.value = text.substring(0, start) + '\n' + imgTag + '\n' + text.substring(end);
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = start + imgTag.length + 2;
  showToast('图片已插入，记得点保存');
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
          <th style="width:60px">预览</th>
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
            <td>${f.preview_url ? `<img src="${escapeHtml(f.preview_url)}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;" />` : `<div style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;background:#f5f5f5;border-radius:6px;font-size:22px;">${getFileIcon(f.file_type || f.name)}</div>`}</td>
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
  if (!file || !file.name) {
    showToast('请先选择文件');
    return;
  }

  // 检查登录状态
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showToast('登录已过期，请重新登录后再上传');
    return;
  }

  const ext = file.name.split('.').pop().replace(/[^a-zA-Z0-9]/g, '') || 'bin';
  const filePath = `files/${Date.now()}.${ext}`;

  console.log('Uploading file:', { name: file.name, size: file.size, type: file.type, path: filePath });

  try {
    const { data, error: uploadError } = await supabase.storage
      .from('site-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      showToast('上传失败：' + uploadError.message + (uploadError.statusCode ? ` (状态码: ${uploadError.statusCode})` : ''));
      return;
    }

    console.log('Upload success:', data);
  } catch (e) {
    console.error('Upload exception:', e);
    showToast('上传异常：' + e.message);
    return;
  }

  const description = document.getElementById('file-description').value.trim();
  const previewInput = document.getElementById('file-preview-input');
  let preview_url = '';

  // 上传预览图（如果有）
  if (previewInput && previewInput.files[0]) {
    const previewFile = previewInput.files[0];
    const previewExt = previewFile.name.split('.').pop().replace(/[^a-zA-Z0-9]/g, '');
    const previewPath = `images/preview_${Date.now()}.${previewExt || 'png'}`;
    const { error: previewError } = await supabase.storage
      .from('site-files')
      .upload(previewPath, previewFile, { upsert: false });

    if (previewError) {
      showToast('预览图上传失败：' + previewError.message);
      return;
    }

    const { data: urlData } = supabase.storage.from('site-files').getPublicUrl(previewPath);
    preview_url = urlData.publicUrl;
  }

  const { error: insertError } = await supabase.from('files').insert({
    name: file.name,
    description,
    file_path: filePath,
    file_size: file.size,
    file_type: file.type,
    preview_url,
  });

  if (insertError) {
    showToast('保存记录失败：' + insertError.message);
    return;
  }

  showToast('上传成功');
  document.getElementById('file-description').value = '';
  document.getElementById('file-input').value = '';
  if (document.getElementById('file-preview-input')) {
    document.getElementById('file-preview-input').value = '';
  }
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
// 内推管理
// ============================================
const REFERRAL_CATEGORIES = [
  { key: 'resumes', emoji: '🏆', title: '内推简历数 Top 10' },
  { key: 'interviews', emoji: '🎯', title: '内推面试数 Top 10' },
  { key: 'offers', emoji: '🎉', title: '内推 offer 数 Top 10' },
  { key: 'top_positions', emoji: '📋', title: '简历数 Top 10 岗位' },
  { key: 'lacking_positions', emoji: '⚠️', title: '简历欠缺 Top 10 岗位' },
];

async function loadReferralMonths() {
  const select = document.getElementById('referral-month-select');
  if (!select) return;

  const { data } = await supabase
    .from('referral_rankings')
    .select('month')
    .order('month', { ascending: false });

  const months = [...new Set((data || []).map(r => r.month))].sort().reverse();

  select.innerHTML = months.length > 0
    ? months.map(m => `<option value="${m}">${m}</option>`).join('')
    : '<option value="">暂无月份</option>';

  if (months.length > 0) {
    loadReferralEditor(months[0]);
  } else {
    document.getElementById('referral-editor').innerHTML = '<div class="empty-state"><p>暂无数据，请点击"新增月份"创建</p></div>';
  }
}

async function addReferralMonth() {
  const month = prompt('请输入月份（格式：YYYY-MM，如 2026-07）：');
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    showToast('格式不正确，请输入 YYYY-MM 格式');
    return;
  }

  // 检查是否已存在
  const { data: existing } = await supabase
    .from('referral_rankings')
    .select('id')
    .eq('month', month)
    .limit(1);

  if (existing && existing.length > 0) {
    showToast('该月份已存在');
    document.getElementById('referral-month-select').value = month;
    loadReferralEditor(month);
    return;
  }

  // 创建空记录
  const records = [];
  REFERRAL_CATEGORIES.forEach(cat => {
    for (let i = 1; i <= 10; i++) {
      records.push({ month, category: cat.key, rank_order: i, name: '', count: 0 });
    }
  });

  const { error } = await supabase.from('referral_rankings').insert(records);
  if (error) {
    showToast('创建失败：' + error.message);
    return;
  }

  showToast('已创建 ' + month);
  loadReferralMonths();
}

async function loadReferralEditor(month) {
  const editor = document.getElementById('referral-editor');
  if (!editor) return;

  editor.innerHTML = '<div class="loading">加载中…</div>';

  const { data, error } = await supabase
    .from('referral_rankings')
    .select('*')
    .eq('month', month)
    .order('category')
    .order('rank_order');

  if (error || !data) {
    editor.innerHTML = '<p>加载失败</p>';
    return;
  }

  editor.innerHTML = REFERRAL_CATEGORIES.map(cat => {
    const items = data.filter(d => d.category === cat.key);
    const isPosition = cat.key.includes('position');
    const linkTh = isPosition ? '<th style="width:200px">跳转链接</th>' : '';
    return `
      <div class="card" style="margin-bottom:16px;">
        <h4 style="margin:0 0 12px;font-size:15px;">${cat.emoji} ${cat.title}</h4>
        <table class="admin-table referral-table">
          <thead>
            <tr><th style="width:50px">#</th><th>${isPosition ? '岗位名称' : '姓名'}</th><th style="width:100px">数量</th>${linkTh}<th style="width:60px">操作</th></tr>
          </thead>
          <tbody>
            ${items.map((item, idx) => `
              <tr data-id="${item.id}">
                <td>${idx + 1}</td>
                <td><input type="text" class="form-input rank-name-input" value="${escapeHtml(item.name)}" placeholder="${isPosition ? '岗位名称' : '姓名'}" /></td>
                <td><input type="number" class="form-input rank-count-input" value="${item.count}" min="0" /></td>
                ${isPosition ? `<td><input type="url" class="form-input rank-link-input" value="${escapeHtml(item.link_url || '')}" placeholder="https://..." /></td>` : ''}
                <td><button class="btn btn-danger btn-sm" onclick="deleteReferralRow('${item.id}','${month}')">删除</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <button class="btn btn-sm" onclick="addReferralRow('${month}','${cat.key}')">+ 添加行</button>
          <button class="btn btn-primary btn-sm" onclick="saveReferralCategory('${month}','${cat.key}')">保存</button>
        </div>
      </div>
    `;
  }).join('');
}

async function addReferralRow(month, category) {
  const { data: maxRows } = await supabase
    .from('referral_rankings')
    .select('rank_order')
    .eq('month', month)
    .eq('category', category)
    .order('rank_order', { ascending: false })
    .limit(1);

  const nextRank = (maxRows && maxRows.length > 0) ? maxRows[0].rank_order + 1 : 1;

  const { error } = await supabase.from('referral_rankings').insert({
    month, category, rank_order: nextRank, name: '', count: 0
  });

  if (error) {
    showToast('添加失败：' + error.message);
    return;
  }
  loadReferralEditor(month);
}

async function deleteReferralRow(id, month) {
  const { error } = await supabase.from('referral_rankings').delete().eq('id', id);
  if (error) {
    showToast('删除失败');
    return;
  }
  loadReferralEditor(month);
}

async function saveReferralCategory(month, category) {
  const isPosition = category.includes('position');
  const rows = document.querySelectorAll(`[data-id]`);
  const updates = [];

  rows.forEach(row => {
    const id = row.dataset.id;
    const name = row.querySelector('.rank-name-input').value.trim();
    const count = parseInt(row.querySelector('.rank-count-input').value) || 0;
    const update = { id, name, count };
    if (isPosition) {
      const linkInput = row.querySelector('.rank-link-input');
      update.link_url = linkInput ? linkInput.value.trim() : '';
    }
    updates.push(update);
  });

  // Filter only rows for this category (we need to check by querying)
  const { data: allRows } = await supabase
    .from('referral_rankings')
    .select('id')
    .eq('month', month)
    .eq('category', category);

  const categoryIds = new Set((allRows || []).map(r => r.id));
  const categoryUpdates = updates.filter(u => categoryIds.has(u.id));

  for (const u of categoryUpdates) {
    const updateData = { name: u.name, count: u.count };
    if (isPosition) updateData.link_url = u.link_url || '';
    const { error } = await supabase
      .from('referral_rankings')
      .update(updateData)
      .eq('id', u.id);

    if (error) {
      showToast('保存失败：' + error.message);
      return;
    }
  }

  showToast(category + ' 已保存');
}

// ============================================
// 动态管理 — 日历事件
// ============================================
let editingEventId = null;

async function loadCalendarEvents() {
  const container = document.getElementById('events-container');
  if (!container) return;

  container.innerHTML = '<div class="loading">加载中…</div>';

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .order('event_date', { ascending: false });

  if (error || !data || data.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>暂无日历事件</p></div>';
    return;
  }

  container.innerHTML = '<table class="admin-table"><thead><tr><th>日期</th><th>标题</th><th>描述</th><th>链接</th><th>操作</th></tr></thead><tbody>' +
    data.map(ev => `
      <tr>
        <td>${ev.event_date}</td>
        <td>${escapeHtml(ev.title)}</td>
        <td>${escapeHtml(ev.description) || '-'}</td>
        <td>${ev.link_url ? `<a href="${escapeHtml(ev.link_url)}" target="_blank" style="color:var(--accent);font-size:12px;">打开</a>` : '-'}</td>
        <td>
          <button class="btn btn-sm" onclick="editCalendarEvent('${ev.id}','${ev.event_date}',${JSON.stringify(ev.title).replace(/"/g, '&quot;')},${JSON.stringify(ev.description || '').replace(/"/g, '&quot;')},${JSON.stringify(ev.link_url || '').replace(/"/g, '&quot;')})" style="margin-right:4px;">编辑</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCalendarEvent('${ev.id}')">删除</button>
        </td>
      </tr>
    `).join('') + '</tbody></table>';
}

function editCalendarEvent(id, date, title, description, linkUrl) {
  editingEventId = id;
  document.getElementById('event-date').value = date;
  document.getElementById('event-title').value = title;
  document.getElementById('event-desc').value = description;
  document.getElementById('event-link').value = linkUrl || '';
  document.getElementById('add-event-btn').textContent = '更新';
}

function resetEventForm() {
  editingEventId = null;
  document.getElementById('event-date').value = '';
  document.getElementById('event-title').value = '';
  document.getElementById('event-desc').value = '';
  document.getElementById('event-link').value = '';
  document.getElementById('add-event-btn').textContent = '添加';
}

async function addCalendarEvent() {
  const date = document.getElementById('event-date').value;
  const title = document.getElementById('event-title').value.trim();
  const description = document.getElementById('event-desc').value.trim();
  const link_url = document.getElementById('event-link').value.trim();

  if (!date || !title) {
    showToast('请填写日期和标题');
    return;
  }

  if (editingEventId) {
    // 更新模式
    const { error } = await supabase.from('calendar_events').update({
      event_date: date, title, description, link_url
    }).eq('id', editingEventId);

    if (error) {
      showToast('更新失败：' + error.message);
      return;
    }
    showToast('事件已更新');
    resetEventForm();
  } else {
    // 新增模式
    const { error } = await supabase.from('calendar_events').insert({
      event_date: date, title, description, link_url
    });

    if (error) {
      showToast('添加失败：' + error.message);
      return;
    }
    showToast('事件已添加');
    document.getElementById('event-title').value = '';
    document.getElementById('event-desc').value = '';
    document.getElementById('event-link').value = '';
  }
  loadCalendarEvents();
}

async function deleteCalendarEvent(id) {
  if (!confirm('确定删除此事件？')) return;

  const { error } = await supabase.from('calendar_events').delete().eq('id', id);
  if (error) {
    showToast('删除失败');
    return;
  }
  if (editingEventId === id) resetEventForm();
  showToast('已删除');
  loadCalendarEvents();
}

// ============================================
// 动态管理 — 活动看板
// ============================================
let editingActivityId = null;

async function loadActivitiesAdmin() {
  const container = document.getElementById('activities-container');
  if (!container) return;

  container.innerHTML = '<div class="loading">加载中…</div>';

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('sort_order')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>暂无活动</p></div>';
    return;
  }

  container.innerHTML = '<table class="admin-table"><thead><tr><th>封面</th><th>标题</th><th>描述</th><th>链接</th><th>排序</th><th>操作</th></tr></thead><tbody>' +
    data.map(act => `
      <tr>
        <td>${act.image_url ? `<img src="${escapeHtml(act.image_url)}" style="width:60px;height:40px;object-fit:cover;border-radius:4px;" />` : '📢'}</td>
        <td>${escapeHtml(act.title)}</td>
        <td>${escapeHtml(act.description) || '-'}</td>
        <td><a href="${escapeHtml(act.link_url || '#')}" target="_blank" style="color:var(--accent);font-size:12px;">打开</a></td>
        <td>${act.sort_order}</td>
        <td>
          <button class="btn btn-sm" onclick="editActivity('${act.id}',${JSON.stringify(act.title).replace(/"/g, '&quot;')},${JSON.stringify(act.description || '').replace(/"/g, '&quot;')},${JSON.stringify(act.link_url || '').replace(/"/g, '&quot;')},${act.sort_order})" style="margin-right:4px;">编辑</button>
          <button class="btn btn-danger btn-sm" onclick="deleteActivity('${act.id}')">删除</button>
        </td>
      </tr>
    `).join('') + '</tbody></table>';
}

function editActivity(id, title, description, linkUrl, sortOrder) {
  editingActivityId = id;
  document.getElementById('act-title').value = title;
  document.getElementById('act-desc').value = description;
  document.getElementById('act-link').value = linkUrl;
  document.getElementById('act-order').value = sortOrder;
  document.getElementById('act-image').value = '';
  document.getElementById('add-activity-btn').textContent = '更新';
}

function resetActivityForm() {
  editingActivityId = null;
  document.getElementById('act-title').value = '';
  document.getElementById('act-desc').value = '';
  document.getElementById('act-link').value = '';
  document.getElementById('act-order').value = '0';
  document.getElementById('act-image').value = '';
  document.getElementById('add-activity-btn').textContent = '添加';
}

async function addActivity() {
  const title = document.getElementById('act-title').value.trim();
  const link_url = document.getElementById('act-link').value.trim();
  const description = document.getElementById('act-desc').value.trim();
  const sort_order = parseInt(document.getElementById('act-order').value) || 0;
  const imageFile = document.getElementById('act-image').files[0];

  if (!title) {
    showToast('请填写活动标题');
    return;
  }

  let image_url = '';

  if (imageFile) {
    const ext = imageFile.name.split('.').pop().replace(/[^a-zA-Z0-9]/g, '');
    const filePath = `images/activity_${Date.now()}.${ext || 'png'}`;
    const { error: uploadError } = await supabase.storage
      .from('site-files')
      .upload(filePath, imageFile, { upsert: false });

    if (uploadError) {
      showToast('图片上传失败：' + uploadError.message);
      return;
    }

    const { data: urlData } = supabase.storage.from('site-files').getPublicUrl(filePath);
    image_url = urlData.publicUrl;
  }

  if (editingActivityId) {
    // 更新模式
    const updateData = { title, description, link_url, sort_order };
    if (image_url) updateData.image_url = image_url; // 只有选了新图片才更新封面

    const { error } = await supabase.from('activities').update(updateData).eq('id', editingActivityId);
    if (error) {
      showToast('更新失败：' + error.message);
      return;
    }
    showToast('活动已更新');
    resetActivityForm();
  } else {
    // 新增模式
    const { error } = await supabase.from('activities').insert({
      title, description, image_url, link_url, sort_order
    });

    if (error) {
      showToast('添加失败：' + error.message);
      return;
    }
    showToast('活动已添加');
  }

  resetActivityForm();
  loadActivitiesAdmin();
}

async function deleteActivity(id) {
  if (!confirm('确定删除此活动？')) return;

  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) {
    showToast('删除失败');
    return;
  }
  if (editingActivityId === id) resetActivityForm();
  showToast('已删除');
  loadActivitiesAdmin();
}

// ============================================
// 访问统计
// ============================================
const PAGE_NAMES = {
  'home': '首页',
  'resources': '资源下载',
  'operations': '运营机制',
  'faq': '常见问题',
  'templates': '内推模板',
  'referral': '内推进度',
  'news': 'SHEIN动态',
};

async function loadAnalyticsOverview() {
  const container = document.getElementById('analytics-cards');
  if (!container) return;

  const today = new Date().toISOString().split('T')[0];

  // 并行查询
  const [totalRes, todayRes, uniqueRes] = await Promise.all([
    supabase.from('page_views').select('id', { count: 'exact', head: true }),
    supabase.from('page_views').select('id', { count: 'exact', head: true }).eq('view_date', today),
    supabase.from('page_views').select('visitor_id', { count: 'exact', head: true }),
  ]);

  const totalViews = totalRes.count || 0;
  const todayViews = todayRes.count || 0;

  // 获取独立访客数
  const { data: visitors } = await supabase.from('page_views').select('visitor_id');
  const uniqueVisitors = new Set((visitors || []).map(v => v.visitor_id)).size;

  container.innerHTML = `
    <div class="stats-card">
      <div class="stats-number">${totalViews}</div>
      <div class="stats-label">总浏览量</div>
    </div>
    <div class="stats-card">
      <div class="stats-number">${todayViews}</div>
      <div class="stats-label">今日浏览</div>
    </div>
    <div class="stats-card">
      <div class="stats-number">${uniqueVisitors}</div>
      <div class="stats-label">独立访客</div>
    </div>
  `;
}

async function loadAnalyticsDaily() {
  const container = document.getElementById('analytics-daily');
  if (!container) return;

  container.innerHTML = '<div class="loading">加载中…</div>';

  // 获取最近30天的数据
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('page_views')
    .select('view_date, page_slug')
    .gte('view_date', startDate)
    .order('view_date', { ascending: false });

  if (error || !data || data.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>近 30 天暂无访问数据</p></div>';
    return;
  }

  // 按日期聚合
  const dailyMap = {};
  data.forEach(row => {
    if (!dailyMap[row.view_date]) dailyMap[row.view_date] = { total: 0, pages: {} };
    dailyMap[row.view_date].total++;
    if (!dailyMap[row.view_date].pages[row.page_slug]) dailyMap[row.view_date].pages[row.page_slug] = 0;
    dailyMap[row.view_date].pages[row.page_slug]++;
  });

  const dates = Object.keys(dailyMap).sort().reverse();

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>日期</th>
          <th>浏览量</th>
          ${Object.keys(PAGE_NAMES).map(k => `<th style="font-size:11px;">${PAGE_NAMES[k]}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${dates.map(date => {
          const d = dailyMap[date];
          return `<tr>
            <td><strong>${date}</strong></td>
            <td><strong>${d.total}</strong></td>
            ${Object.keys(PAGE_NAMES).map(k => `<td>${d.pages[k] || '-'}</td>`).join('')}
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;
}

async function queryAnalyticsDate() {
  const dateInput = document.getElementById('analytics-date');
  const container = document.getElementById('analytics-date-detail');
  if (!dateInput || !container) return;

  const date = dateInput.value;
  if (!date) {
    showToast('请选择日期');
    return;
  }

  container.innerHTML = '<div class="loading">查询中…</div>';

  const { data, error } = await supabase
    .from('page_views')
    .select('page_slug, visitor_id')
    .eq('view_date', date);

  if (error) {
    container.innerHTML = '<div class="empty-state"><p>查询失败</p></div>';
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = `<div class="empty-state"><p>${date} 没有访问记录</p></div>`;
    return;
  }

  // 按页面聚合
  const pageMap = {};
  data.forEach(row => {
    if (!pageMap[row.page_slug]) pageMap[row.page_slug] = { views: 0, visitors: new Set() };
    pageMap[row.page_slug].views++;
    pageMap[row.page_slug].visitors.add(row.visitor_id);
  });

  const totalPages = data.length;
  const totalVisitors = new Set(data.map(r => r.visitor_id)).size;

  const rows = Object.keys(pageMap)
    .map(slug => ({
      name: PAGE_NAMES[slug] || slug,
      views: pageMap[slug].views,
      visitors: pageMap[slug].visitors.size,
    }))
    .sort((a, b) => b.views - a.views);

  container.innerHTML = `
    <div class="stats-cards" style="margin-bottom:16px;">
      <div class="stats-card stats-card-sm">
        <div class="stats-number">${totalPages}</div>
        <div class="stats-label">当日浏览量</div>
      </div>
      <div class="stats-card stats-card-sm">
        <div class="stats-number">${totalVisitors}</div>
        <div class="stats-label">当日访客</div>
      </div>
    </div>
    <table class="admin-table">
      <thead>
        <tr><th>页面</th><th>浏览量</th><th>独立访客</th></tr>
      </thead>
      <tbody>
        ${rows.map(r => `<tr><td>${escapeHtml(r.name)}</td><td>${r.views}</td><td>${r.visitors}</td></tr>`).join('')}
      </tbody>
    </table>
  `;
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
  loadReferralMonths();
  loadCalendarEvents();
  loadActivitiesAdmin();
  loadAnalyticsOverview();
  loadAnalyticsDaily();

  // 设置默认日期为今天
  const analyticsDateInput = document.getElementById('analytics-date');
  if (analyticsDateInput) {
    analyticsDateInput.value = new Date().toISOString().split('T')[0];
  }

  // 访问统计查询按钮
  const analyticsQueryBtn = document.getElementById('analytics-query-btn');
  if (analyticsQueryBtn) {
    analyticsQueryBtn.addEventListener('click', queryAnalyticsDate);
  }

  // 内推管理事件
  const referralSelect = document.getElementById('referral-month-select');
  if (referralSelect) {
    referralSelect.addEventListener('change', (e) => {
      if (e.target.value) loadReferralEditor(e.target.value);
    });
  }

  const addMonthBtn = document.getElementById('add-referral-month-btn');
  if (addMonthBtn) {
    addMonthBtn.addEventListener('click', addReferralMonth);
  }

  // 日历事件
  const addEventBtn = document.getElementById('add-event-btn');
  if (addEventBtn) {
    addEventBtn.addEventListener('click', addCalendarEvent);
  }

  // 活动看板
  const addActBtn = document.getElementById('add-activity-btn');
  if (addActBtn) {
    addActBtn.addEventListener('click', addActivity);
  }

  // 文件上传
  const fileInput = document.getElementById('file-input');
  const uploadBtn = document.getElementById('upload-btn');
  const uploadZone = document.getElementById('upload-zone');
  let pendingFile = null; // 拖拽上传的文件暂存

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
        pendingFile = e.dataTransfer.files[0];
        fileInput.value = ''; // 清空 input，优先使用拖拽文件
        uploadZone.querySelector('p').textContent = `已选择: ${pendingFile.name}`;
      }
    });
  }

  // 点击选择文件时同步到 pendingFile
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        pendingFile = fileInput.files[0];
        uploadZone.querySelector('p').textContent = `已选择: ${pendingFile.name}`;
      }
    });
  }

  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      const file = pendingFile || fileInput.files[0];
      if (!file) {
        showToast('请先选择文件');
        return;
      }
      uploadBtn.disabled = true;
      uploadBtn.textContent = '上传中…';
      uploadFile(file).finally(() => {
        uploadBtn.disabled = false;
        uploadBtn.textContent = '上传文件';
        pendingFile = null;
      });
    });
  }
});
