/* ==========================================
   ZENIVA TRAVEL — JavaScript
   ========================================== */

// Sticky header shadow on scroll
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
  } else {
    header.style.boxShadow = 'none';
  }
});

// Scroll-based fade-in animations
function initScrollAnimations() {
  const sections = document.querySelectorAll(
    '.stats-section, .destinations-section, .features-section, ' +
    '.featured-trips-section, .lina-section, .process-section, ' +
    '.trust-section, .final-cta-section'
  );

  sections.forEach(section => {
    section.classList.add('fade-in');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(section => observer.observe(section));
}

// Demo chat typing animation
function initDemoChat() {
  const chatBubbles = document.querySelectorAll('.chat-bubble');
  chatBubbles.forEach((bubble, index) => {
    bubble.style.opacity = '0';
    bubble.style.transform = 'translateY(10px)';
    setTimeout(() => {
      bubble.style.transition = 'all 0.5s ease';
      bubble.style.opacity = '1';
      bubble.style.transform = 'translateY(0)';
    }, 500 + index * 800);
  });
}

// Horizontal scroll with mouse drag for carousels
function initDragScroll() {
  const scrollContainers = document.querySelectorAll('.destinations-scroll, .trips-scroll, .service-pills');

  scrollContainers.forEach(container => {
    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', (e) => {
      isDown = true;
      container.style.cursor = 'grabbing';
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
      isDown = false;
      container.style.cursor = 'grab';
    });

    container.addEventListener('mouseup', () => {
      isDown = false;
      container.style.cursor = 'grab';
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    });

    container.style.cursor = 'grab';
  });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// Button click handlers (for demo purposes)
function initButtonHandlers() {
  // CTA buttons - open a chat/contact modal simulation
  const ctaButtons = document.querySelectorAll('.btn-gradient, .btn-white, .btn-secondary-white');
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showNotification('Lina is ready to help you plan your trip! This is a demo.');
    });
  });

  // Call buttons
  const callButtons = document.querySelectorAll('.btn-call, .btn-call-light');
  callButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showNotification('Phone support coming soon! This is a demo.');
    });
  });

  // Login/Signup
  const loginBtn = document.querySelector('.btn-login');
  const signupBtn = document.querySelector('.btn-signup');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      showNotification('Login functionality — Demo mode');
    });
  }
  if (signupBtn) {
    signupBtn.addEventListener('click', () => {
      showNotification('Sign up functionality — Demo mode');
    });
  }
}

// Notification toast
function showNotification(message) {
  // Remove existing notification
  const existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'notification-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: #0f172a;
    color: white;
    padding: 14px 28px;
    border-radius: 12px;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    z-index: 9999;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    opacity: 0;
    transition: all 0.3s ease;
  `;

  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  // Auto-hide after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Service worker registration (PWA)
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker registration failed - not critical
      });
    });
  }
}

// Initialize everything on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initDemoChat();
  initDragScroll();
  initSmoothScroll();
  initButtonHandlers();
});
