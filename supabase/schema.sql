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

-- 首页
INSERT INTO pages (slug, title, content) VALUES
('home', 'SHEIN 2027届校园大使工作手册', '<p>欢迎使用 SHEIN 2027届校园大使工作手册。本手册为校园大使提供日常工作指引，包括运营机制、常见问题解答和内推宣传模板。</p><p>请通过顶部导航栏查阅各模块内容。</p>');

-- 资源页
INSERT INTO pages (slug, title, content) VALUES
('resources', '资源下载中心', '<p>这里提供校园大使工作相关的文件下载。</p>');

-- 校园大使运营机制
INSERT INTO pages (slug, title, content) VALUES
('operations', '校园大使运营机制', E'<h2>管理机制（针对校招期）</h2>
<div class="section-card">
<h3>月度总结</h3>
<p>每人填写月报，简单汇报本月开展内推、宣传、社群搭建情况，以便发放薪资核对。</p>
<h3>月报时间</h3>
<p>9月21日、10月21日、11月21日</p>
<h3>赋能培训</h3>
<p>按需开放，可单独联系。</p>
</div>

<h2>工作激励（针对校招期）</h2>

<div class="section-card">
<h3>内推奖励</h3>
<h4>简历内推</h4>
<p>27届国内校招岗位：智能推荐阶段 <strong>5元/人</strong>，面试环节 <strong>20元/人</strong>，接受 offer <strong>500元/人</strong></p>

<h4>排名激励</h4>
<p>月度内推有效简历数前5名 &amp; 内推面试转化率前5名激励（仅限国内校招岗位）：</p>
<ul>
<li>TOP1：500元</li>
<li>TOP2：400元</li>
<li>TOP3：300元</li>
<li>TOP4：200元</li>
<li>TOP5：100元</li>
</ul>
<p><em>*有效简历：智能推荐环节的简历<br>*内推面试转化率 = 初试环节简历数 ÷ 智能推荐简历数，TOP需满足完成智能推荐简历数 ≥ 50，面试数 ≥ 1</em></p>
</div>

<div class="section-card">
<h3>过程激励</h3>

<h4>社群激励</h4>
<p>搭建 SHEIN 专属社群，可根据群聊人数给予激励（仅在秋招首月激励，春招不单独激励）：</p>
<ul>
<li>50 ≤ 社群人数 &lt; 100：100元</li>
<li>100 ≤ 社群人数 &lt; 150：150元</li>
<li>150 ≤ 社群人数 &lt; 200：200元</li>
<li>社群人数 ≥ 200：250元</li>
</ul>
<p><em>*微信、QQ群均可，如若非 SHEIN 专属群，不单独奖励</em></p>

<h4>宣讲激励</h4>
<ul>
<li>到场人数 &lt; 80：100元/4小时</li>
<li>80 ≤ 到场人数 &lt; 100：150元/4小时</li>
<li>100 ≤ 到场人数 &lt; 150：200元/4小时</li>
<li>到场人数 ≥ 150：300元/4小时</li>
</ul>
<p>到场协助超过4小时则超时部分30元/小时。如额外找了其他学生协助（需提前与 Zack 沟通确认），其他协助的学生均按100元/4小时/人。</p>

<h4>宣传激励</h4>
<ul>
<li>牛客/小红书/社群等社区论坛发帖或转发推文：<strong>10元/条</strong>，每月累计10条封顶</li>
<li>公众号推文（SHEIN 专题推文，非多家企业合并推文），每月累计不超过500元：
<ul>
<li>浏览量 &lt; 200：50元/条</li>
<li>200 ≤ 浏览量 &lt; 500：100元/条</li>
<li>500 ≤ 浏览量 &lt; 1000：300元/条</li>
<li>浏览量 ≥ 1000：500元/条</li>
</ul></li>
</ul>
</div>

<h2>工作职责（针对校招期）</h2>

<div class="section-card">
<h3>工作总结</h3>
<p>开通激活内推权限后，通过自建社群、外部平台宣传等渠道，推荐候选人在投递过程中填写个人内推码/内推二维码，完成简历内推。</p>

<h3>简历内推</h3>
<p>校园大使生成内推码后，将内推码发给候选人，候选人在 SHEIN 招聘官网投递校招或实习岗位时填写校园大使内推码，即可进入内推渠道。</p>
<p>候选人扫描校园大使内推二维码，进入 SHEIN 招聘官网进行岗位投递（该图在 个人中心-推荐码记录-推荐码使用 生成，内推码生成1次可长期使用）。</p>
<p><em>*社招职位无法使用校园大使内推码<br>*请务必保存好个人内推码与海报</em></p>

<h3>社群运营</h3>
<p>通过在已有班群、应届生社群、线下粘贴等形式宣传 SHEIN 专属校招内推社群二维码，实现目标人群社群精准集聚，便于后续内推宣传，可提升内推转化数据。</p>
<ol>
<li>异常进度收集跟进 &amp; 日常答疑跟进</li>
<li>内推码 &amp; 招聘信息宣传</li>
<li>【SHEIN招聘】宣传推文日常转发</li>
</ol>

<h3>宣讲支持</h3>
<h4>宣讲前</h4>
<p><strong>【线上】</strong>转发对应社群文案和宣传推文至社群，尽可能覆盖毕业生大群 &amp; 班级群聊，动员毕业生参与入校宣讲（时间节点建议为前1-2天和宣讲当天）</p>
<p><strong>【线下】</strong>提前了解学校是否能摆放易拉宝、海报等宣传物资，提前1-2天进行粘贴摆放并拍照存档，或在人流量大的区域（食堂/招聘会现场）引流入群与内推</p>

<h4>宣讲当天</h4>
<p>到场时间：宣讲会前1个半小时到达现场</p>
<p><strong>前期准备：</strong></p>
<ol>
<li>张贴海报（粘贴在宣讲会教室周围或楼梯、路口等人流量较大的区域）</li>
<li>投放易拉宝（下课前投放在宣讲会教室周围 &amp; 学校内能摆放易拉宝的人流量大的区域）</li>
<li>布置签到台（2个签到水牌、两个有签到码的桌牌、抽奖券、抽奖箱）</li>
<li>礼物装盒摆放</li>
</ol>
<p><strong>开场前准备：</strong></p>
<ol>
<li>场外人员引导（发三折页、引导同学至宣讲会现场、简历上写好意向岗位）</li>
<li>引导签到（扫描签到二维码、每人分发一份三折页和一张已撕下票根的抽奖券）</li>
<li>场内引导（引导同学入座、关注【SHEIN招聘】公众号、暖场）</li>
</ol>
<p><strong>开场后工作：</strong></p>
<ol>
<li>整理简历（整理简历顺序并协助做好分类）</li>
<li>内场维护（内场递麦、递奖品）</li>
<li>现场拍摄</li>
<li>面试间布场</li>
</ol>
<p><strong>宣讲结束后：</strong></p>
<ol>
<li>外场撤场（回收易拉宝、清理海报）</li>
<li>面试叫号（负责指定 HR 的面试叫号）</li>
</ol>

<h3>外部宣传</h3>
<p>在外部平台（小红书、牛客、公众号等）制作发布或转发 SHEIN 相关的正向校招宣传信息。</p>
<ul>
<li>可带内推码发布，内推码力 up！</li>
<li>个人 ID 不可携带"SHEIN"字段</li>
<li>公众号推文需经审核才可发布</li>
</ul>
<p><em>ps：内容越丰富关注度越高~</em></p>
</div>');

-- 内推常见问题
INSERT INTO pages (slug, title, content) VALUES
('faq', '内推常见问题', E'<h2>校招相关疑问</h2>

<h3>校招启动</h3>

<div class="qa-item">
<div class="qa-q">Q：SHEIN 27届秋季校园招聘什么时候开始/结束？</div>
<div class="qa-a">A：27届秋招计划9月4日正式开启，预计12月中旬正式结束，具体岗位以官网发布为主，所有岗位均为招满即下架，可尽快按需投递岗位。</div>
</div>

<div class="qa-item">
<div class="qa-q">Q：我是XX时间毕业的同学，能否投递此次校园招聘？</div>
<div class="qa-a">A：27届校招面向27届应届毕业生（毕业时间在2026年9月1日-2027年8月31日），符合毕业时间者均可投递。在此时间之前毕业的可以选择合适的社招岗位，在此时间之后毕业的可选择合适的实习岗位投递。</div>
</div>

<div class="qa-item">
<div class="qa-q">Q：此次校招有哪些工作地可以选择？</div>
<div class="qa-a">A：广州、南京、深圳、上海、肇庆等（具体请以官网岗位页面地点为准，*海外岗位申请人必须拥有在当地合法的工作身份）。</div>
</div>

<div class="qa-item">
<div class="qa-q">Q：27届秋招岗位需要测评/笔试吗？</div>
<div class="qa-a">A：SHEIN 2027届校招没有测评，部分岗位有单独笔试安排，具体以收到笔试邮件为准。</div>
</div>

<div class="qa-item">
<div class="qa-q">Q：27届有什么岗位适合我？</div>
<div class="qa-a">A：SHEIN 校园招聘目前开设6大类岗位，分别为全球运营类、信息技术类、服装供应链类、商品平台类、国际物流与仓储类、职能管理类，可根据你的教育背景、实习经历、项目经历等综合判断岗位匹配度。</div>
</div>

<div class="qa-item">
<div class="qa-q">Q：XXX岗位还有hc吗？</div>
<div class="qa-a">A：如果官网该岗位仍在线上招募，则该岗位仍有 hc 哦~</div>
</div>

<h3>校招流程</h3>

<div class="qa-item">
<div class="qa-q">Q：每人可投递几个岗位？</div>
<div class="qa-a">A：每人最多投递3个不同的校招岗位，根据顺序分为第一、第二、第三志愿，我们将按照志愿顺序优先处理靠前的志愿。</div>
</div>

<div class="qa-item">
<div class="qa-q">Q：如何查询自己的应聘进度？</div>
<div class="qa-a">A：在微信公众号【SHEIN招聘】下方【应聘进度】查询。</div>
</div>

<div class="qa-item">
<div class="qa-q">Q：面试有几轮？</div>
<div class="qa-a">A：面试轮次和面试形式（一对多/一对一面试）视不同岗位的招聘需求而定，一般有三轮面试（初试，复试，终试），具体安排请同学们以电话/邮件通知为准。</div>
</div>

<div class="qa-item">
<div class="qa-q">Q：简历筛选一般多久，筛选会看哪些内容？</div>
<div class="qa-a">A：一般筛选需要7-12个工作日内完成，部分岗位简历量较大的话可能适当延长简历筛选流程，只要简历在流程中均会正常处理简历。简历初筛环节主要根据岗位人才画像（教育背景、实习/项目经历、社团经历、工作技能等）进行第一次筛选，会根据候选人与人才画像的匹配度选择推进到下一个环节。</div>
</div>

<div class="qa-item">
<div class="qa-q">Q：简历没过会有通知/拒信吗？</div>
<div class="qa-a">A：应聘流程可通过关注 SHEIN 招聘微信公众号并点击"校园招聘—应聘查询"版块，查看实时应聘进程。我们将按照志愿顺序依次处理，如所有投递岗位均被淘汰，会发送邮件通知。</div>
</div>

<h3>投递异常</h3>

<div class="qa-item">
<div class="qa-q">Q：投递显示"投递失败"如何处理？</div>
<div class="qa-a">A：内推有1个月的保护期，1个月内重复填写内推码则会显示内推异常。如想解决，投递时删除内推码即可，1个月内仍享受内推渠道特权。</div>
</div>

<div class="qa-item">
<div class="qa-q">Q：简历/个人信息有误，能否修改？</div>
<div class="qa-a">A：在简历投递3天内且未被 HR 处理前，可登录 SHEIN 校招官网在"个人中心"修改简历。</div>
</div>

<div class="qa-item">
<div class="qa-q">Q：如何设置岗位志愿顺序？</div>
<div class="qa-a">A：可以登录 SHEIN 校招官网，在"个人中心—投递记录"，设置并修改志愿顺序，第一志愿顺序将优先被 HR 看到及处理。</div>
</div>

<div class="qa-item">
<div class="qa-q">Q：没收到笔试怎么办？</div>
<div class="qa-a">A：仅部分岗位有笔试，请检查简历上邮件是否填写正确 &amp; 查看邮箱垃圾邮件，如仍未收到可到【SHEIN招聘官网】右下角进入人工客服留言姓名+邮箱，我们将有专人处理。</div>
</div>

<div class="qa-item">
<div class="qa-q">Q：笔试无法登陆的情况怎么处理？</div>
<div class="qa-a">A：出现笔试无法登录的情况，请首先检查手机号码和邮箱是否与简历填写一致。如仍无法按界面提示正常登录笔试系统，请留存好笔试异常界面截图，并到【SHEIN招聘官网】右下角进入人工客服留言，我们将有专人为您处理。</div>
</div>

<div class="qa-item">
<div class="qa-q">Q：笔试做不好/错过了，可以申请重做吗？</div>
<div class="qa-a">A：如果不是因为系统问题/网络问题无法完成，其他情况是不能申请重做的哦！在完成过程中如遇到 BUG 异常，请及时留存异常界面截图，可到【SHEIN招聘官网】右下角进入人工客服留言，我们将有专人处理。</div>
</div>');

-- 内推常见模板
INSERT INTO pages (slug, title, content) VALUES
('templates', '内推常见模板', E'<h2>内推相关模板</h2>
<p>以下模板可根据个人风格替换内容，在对应场景中使用。</p>

<div class="template-card">
<h4>校招启动</h4>
<div class="template-scene">适用场景：社群</div>
<pre>SHEIN—全球超级独角兽企业26届秋招岗位大放送
专属内推码【此处替换】，优先筛选简历！

💥全球正式雇员16000+，服务全球超160个国家和地区
💥全球top5独角兽企业
💥满足全球消费者在丰富度、实时性和性价比上的时尚需求
💥校招岗位现已全面开放申请

【面向人群】2027届的海内外应届毕业生
【校招岗位】信息技术类、商品平台类、服装供应链类、全球运营类、国际物流与仓储类、职能管理类等多岗位在招
【工作地】广州、南京、深圳、上海、肇庆等

🚩 更多招聘内容&amp;投递请戳下方
【SHEIN招聘官网】https://careers.shein.cn/Students-&amp;-Graduates
【微信公众号】SHEIN招聘</pre>
</div>

<div class="template-card">
<h4>宣讲宣传</h4>
<div class="template-scene">适用场景：社群/小红书</div>
<pre>🦄全球独角兽SHEIN x 北京服装学院
线下校招宣讲会来袭！
专属内推码【此处替换】，校招快人一步！
🔥【现场面试】应聘特权、【千元豪礼】等你来！

📣宣讲会信息📣
时间：10月31日 15:00
地点：樱花园校区 7号楼508

🔥现场面试🔥
【商品平台类】设计师（女装/童装）、买手（女装/童装）
【服装供应链类】供应商管理专员
以上岗位现场投递简历即可安排初试，校招快人一步‼
其余岗位现场投递可享免优先筛选特权❗

🌟送豪礼🌟
500元购物卡、SHEIN周边等连环好礼

⬇即刻扫码进群了解更多信息</pre>
</div>

<div class="template-card">
<h4>重点岗位</h4>
<div class="template-scene">适用场景：社群/小红书</div>
<pre>🦄全球独角兽SHEIN热招岗位推荐，专属内推码【此处替换】，优先筛选简历！
💥【热招职位】XXXXXX
💥【工作地】广州
💥【岗位要求】XXXXXXXX</pre>
</div>');

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

-- ============================================
-- v2: 新增内推进度 + SHEIN动态功能表
-- ============================================

-- 9. 内推排行榜表
CREATE TABLE referral_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL,
  category TEXT NOT NULL,
  rank_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. 日历事件表
CREATE TABLE calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. 活动看板表
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. 启用 RLS
ALTER TABLE referral_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 13. referral_rankings 策略：所有人可读，认证用户可写
CREATE POLICY "referral_public_read" ON referral_rankings FOR SELECT USING (true);
CREATE POLICY "referral_auth_write" ON referral_rankings FOR ALL USING (auth.role() = 'authenticated');

-- 14. calendar_events 策略：所有人可读，认证用户可写
CREATE POLICY "calendar_public_read" ON calendar_events FOR SELECT USING (true);
CREATE POLICY "calendar_auth_write" ON calendar_events FOR ALL USING (auth.role() = 'authenticated');

-- 15. activities 策略：所有人可读，认证用户可写
CREATE POLICY "activities_public_read" ON activities FOR SELECT USING (true);
CREATE POLICY "activities_auth_write" ON activities FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- v3: 文件预览图 + 日历事件链接
-- ============================================

-- 16. 文件表增加预览图字段
ALTER TABLE files ADD COLUMN IF NOT EXISTS preview_url TEXT DEFAULT '';

-- 17. 日历事件表增加链接字段
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS link_url TEXT DEFAULT '';

-- ============================================
-- v4: 访客记录
-- ============================================

-- 18. 页面访问记录表
CREATE TABLE page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL,
  view_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_slug, view_date, visitor_id)
);

-- 19. 启用 RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- 20. page_views 策略：所有人可插入，认证用户可读取
CREATE POLICY "pageviews_public_insert" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "pageviews_auth_read" ON page_views FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "pageviews_auth_delete" ON page_views FOR DELETE USING (auth.role() = 'authenticated');
