/**
 * Supabase 客户端初始化
 *
 * 使用前请替换为你的 Supabase 项目信息：
 * - SUPABASE_URL: 在 Dashboard → Settings → API → Project URL
 * - SUPABASE_ANON_KEY: 在 Dashboard → Settings → API → anon public
 */

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const { createClient } = window.supabase;
// 用 client 实例覆盖全局，后续代码直接使用 window.supabase 即可
window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
