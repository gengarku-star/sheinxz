-- ============================================
-- Supabase 数据库初始化脚本
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- 1. 页面内容表
CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO pages (slug, title, content) VALUES
  ('home', '欢迎来到我们的网站', '这是首页内容，请在后台管理中编辑修改。'),
  ('resources', '资源下载中心', '这里是资源下载页面的介绍文字，可在后台编辑。');

-- 2. 文件/资源表
CREATE TABLE files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  file_path TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  file_type TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 留言表
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 启用 RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. pages 策略：所有人可读，认证用户可写
CREATE POLICY "pages_public_read" ON pages FOR SELECT USING (true);
CREATE POLICY "pages_auth_write" ON pages FOR ALL USING (auth.role() = 'authenticated');

-- 6. files 策略：所有人可读，认证用户可写
CREATE POLICY "files_public_read" ON files FOR SELECT USING (true);
CREATE POLICY "files_auth_write" ON files FOR ALL USING (auth.role() = 'authenticated');

-- 7. messages 策略：所有人可插入，认证用户可读取/删除
CREATE POLICY "messages_public_insert" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "messages_auth_read" ON messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "messages_auth_delete" ON messages FOR DELETE USING (auth.role() = 'authenticated');

-- 8. 创建 Storage bucket（需在 Dashboard → Storage 中手动确认创建）
-- bucket 名称: site-files
-- 设置为 Public bucket
-- 在 Dashboard Storage 页面添加以下策略:
--   - SELECT: 允许所有人
--   - INSERT/UPDATE/DELETE: 仅允许认证用户
