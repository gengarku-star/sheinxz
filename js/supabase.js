/**
 * Supabase 客户端初始化
 *
 * 使用前请替换为你的 Supabase 项目信息：
 * - SUPABASE_URL: 在 Dashboard → Settings → API → Project URL
 * - SUPABASE_ANON_KEY: 在 Dashboard → Settings → API → anon public
 */

const SUPABASE_URL = 'https://iznqrbdsgwsycvpuxktm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6bnFyYmRzZ3dzeWN2cHV4a3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MDk1ODksImV4cCI6MjA5ODI4NTU4OX0.BLyhoIADnIxD8-0EHSM-oL_v3H2moMeKig4EtrPVoGw';

const { createClient } = window.supabase;
// 用 client 实例覆盖全局，后续代码直接使用 window.supabase 即可
window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
