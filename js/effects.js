/**
 * SHEIN 校园大使 — 视觉效果引擎
 * 粒子系统 · 滚动揭示 · 玻璃导航 · 进度条 · 波纹 · 倾斜
 */

(function () {
  'use strict';

  // ============================================================
  // 1. 页面加载淡入
  // ============================================================
  function initPageFadeIn() {
    // 延迟一帧确保初始状态被渲染
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.add('loaded');
      });
    });
  }

  // ============================================================
  // 2. 滚动进度条
  // ============================================================
  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.prepend(bar);

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrollTop = window.scrollY || document.documentElement.scrollTop;
          var docHeight = document.documentElement.scrollHeight - window.innerHeight;
          var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          bar.style.width = Math.min(progress, 100) + '%';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ============================================================
  // 3. 导航栏玻璃效果
  // ============================================================
  function initGlassNavbar() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          if (window.scrollY > 50) {
            navbar.classList.add('glass');
          } else {
            navbar.classList.remove('glass');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ============================================================
  // 4. 粒子背景系统
  // ============================================================
  function initParticles() {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var isMobile = window.innerWidth < 768;
    var particleCount = isMobile ? 25 : 60;
    var particles = [];
    var animationId;
    var mouseX = -1000;
    var mouseY = -1000;

    // 颜色：SHEIN 品牌色
    var colors = [
      'rgba(0, 0, 0, 0.5)',
      'rgba(0, 0, 0, 0.35)',
      'rgba(0, 0, 0, 0.2)',
      'rgba(255, 45, 85, 0.45)',
      'rgba(255, 45, 85, 0.25)',
      'rgba(80, 80, 80, 0.3)'
    ];

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        originalColor: colors[Math.floor(Math.random() * colors.length)]
      };
    }

    function initParticlesArray() {
      particles.length = 0;
      for (var i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    }

    function connectParticles() {
      var maxDist = isMobile ? 80 : 130;
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            var alpha = (1 - dist / maxDist) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(0, 0, 0, ' + alpha + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        // 鼠标交互
        var dx = mouseX - p.x;
        var dy = mouseY - p.y;
        var distToMouse = Math.sqrt(dx * dx + dy * dy);
        if (distToMouse < 120) {
          var force = (1 - distToMouse / 120) * 0.8;
          p.vx -= (dx / distToMouse) * force * 0.1;
          p.vy -= (dy / distToMouse) * force * 0.1;
        }

        // 移动
        p.x += p.vx;
        p.y += p.vy;

        // 边界检测
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // 阻尼
        p.vx *= 0.999;
        p.vy *= 0.999;

        // 最小速度
        var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed < 0.1) {
          p.vx += (Math.random() - 0.5) * 0.2;
          p.vy += (Math.random() - 0.5) * 0.2;
        }

        // 绘制粒子
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // 光晕
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, '0.08)');
        ctx.fill();
      }

      connectParticles();
      animationId = requestAnimationFrame(animate);
    }

    // 鼠标跟踪
    canvas.parentElement.addEventListener('mousemove', function (e) {
      var rect = canvas.parentElement.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    canvas.parentElement.addEventListener('mouseleave', function () {
      mouseX = -1000;
      mouseY = -1000;
    });

    resize();
    initParticlesArray();
    animate();

    // 窗口大小变化时重建
    var resizeTimeout;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function () {
        resize();
        initParticlesArray();
      }, 250);
    });
  }

  // ============================================================
  // 5. 滚动揭示 (Intersection Observer)
  // ============================================================
  function initScrollReveal() {
    var revealElements = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-scale'
    );
    if (revealElements.length === 0) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ============================================================
  // 6. 按钮波纹效果
  // ============================================================
  function initButtonRipple() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn-ripple');
      if (!btn) return;

      var ripple = document.createElement('span');
      ripple.className = 'ripple-effect';

      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      ripple.style.width = size + 'px';
      ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

      btn.appendChild(ripple);

      ripple.addEventListener('animationend', function () {
        ripple.remove();
      });
    });
  }

  // ============================================================
  // 7. 卡片倾斜效果
  // ============================================================
  function initCardTilt() {
    // 只在非触屏设备启用
    if (window.matchMedia('(pointer: coarse)').matches) return;

    var cards = document.querySelectorAll('.tilt-card');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = ((y - centerY) / centerY) * -6;
        var rotateY = ((x - centerX) / centerX) * 6;
        card.style.transform =
          'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02, 1.02, 1.02)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform =
          'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });
  }

  // ============================================================
  // 8. 骨架屏辅助函数
  // ============================================================
  window.SkeletonHelper = {
    /**
     * 生成骨架屏 HTML
     * @param {'text'|'card'|'message'|'heading'} type
     * @param {number} count
     */
    render: function (type, count) {
      count = count || 3;
      var html = '';
      if (type === 'text') {
        for (var i = 0; i < count; i++) {
          html += '<div class="skeleton skeleton-text"></div>';
        }
      } else if (type === 'card') {
        for (var i = 0; i < count; i++) {
          html += '<div class="skeleton skeleton-card"></div>';
        }
      } else if (type === 'message') {
        for (var i = 0; i < count; i++) {
          html +=
            '<div class="skeleton-message">' +
            '<div class="skeleton skeleton-text" style="width:30%"></div>' +
            '<div class="skeleton skeleton-text" style="width:85%"></div>' +
            '<div class="skeleton skeleton-text" style="width:60%"></div>' +
            '</div>';
        }
      } else if (type === 'heading') {
        html = '<div class="skeleton skeleton-heading"></div>';
        for (var j = 0; j < (count || 2); j++) {
          html += '<div class="skeleton skeleton-text"></div>';
        }
      }
      return html;
    },

    /** 替换容器内容为骨架屏 */
    show: function (container, type, count) {
      if (!container) return;
      container.innerHTML = this.render(type, count);
    }
  };

  // ============================================================
  // 9. 初始化
  // ============================================================
  function init() {
    initPageFadeIn();
    initScrollProgress();
    initGlassNavbar();
    initParticles();
    initScrollReveal();
    initButtonRipple();
    initCardTilt();

    // 为所有按钮添加波纹类（如未手动添加）
    document.querySelectorAll('.btn').forEach(function (btn) {
      if (!btn.classList.contains('btn-ripple')) {
        btn.classList.add('btn-ripple');
      }
    });
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
