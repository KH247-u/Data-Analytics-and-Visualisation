document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const slideLinks = document.querySelectorAll('.slide-link-item');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const slideCounter = document.getElementById('hud-slide-counter');
  const progressFill = document.getElementById('hud-progress-fill');
  const fullscreenToggle = document.getElementById('fullscreen-toggle');

  let currentSlide = 0;
  const totalSlides = slides.length;
  let isTransitioning = false;

  // Initialize presentation
  updateSlideView();

  // Slide navigation with premium fluid transitions
  function navigateToSlide(targetIdx) {
    if (isTransitioning || targetIdx === currentSlide || targetIdx < 0 || targetIdx >= totalSlides) return;
    
    isTransitioning = true;
    currentSlide = targetIdx;
    updateSlideView();
    
    // Lock navigation actions during transition sweep
    setTimeout(() => {
      isTransitioning = false;
    }, 600);
  }

  // Slide state manager
  function updateSlideView() {
    slides.forEach((slide, idx) => {
      slide.classList.remove('active', 'past', 'future');
      if (idx === currentSlide) {
        slide.classList.add('active');
      } else if (idx < currentSlide) {
        slide.classList.add('past');
      } else {
        slide.classList.add('future');
      }
    });

    slideLinks.forEach((link, idx) => {
      if (idx === currentSlide) {
        link.classList.add('active');
        // Scroll active link into view if needed
        link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        link.classList.remove('active');
      }
    });

    // Update bottom HUD
    const slideNumberStr = String(currentSlide + 1).padStart(2, '0');
    const totalNumberStr = String(totalSlides).padStart(2, '0');
    slideCounter.textContent = `${slideNumberStr} / ${totalNumberStr}`;

    const progressPercentage = ((currentSlide + 1) / totalSlides) * 100;
    progressFill.style.width = `${progressPercentage}%`;

    // Disable/Enable nav buttons
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === totalSlides - 1;

    // Special slide activations
    handleSlideTransitions(currentSlide);
  }

  function nextSlide() {
    if (currentSlide < totalSlides - 1) {
      navigateToSlide(currentSlide + 1);
    }
  }

  function prevSlide() {
    if (currentSlide > 0) {
      navigateToSlide(currentSlide - 1);
    }
  }

  // Button clicks
  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  // Sidebar link clicks
  slideLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetIdx = parseInt(e.currentTarget.getAttribute('data-slide'), 10);
      navigateToSlide(targetIdx);
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
      e.preventDefault();
      prevSlide();
    }
  });

  // Fullscreen support
  fullscreenToggle.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  });

  // Handle morphing heights/draw triggers on specific slide entry
  function handleSlideTransitions(slideIndex) {
    // Slide 9: Reset Insights Reveal state on entry (0-indexed 8)
    if (slideIndex === 8) { 
      const salesToggle = document.querySelector('.dashboard-toggle-bar .toggle-btn[data-dashboard="sales"]');
      if (salesToggle) {
        salesToggle.click();
      }
      hideInsights();
    }

    // Slide 7: Power BI Engine Draw trigger (0-indexed 6)
    const pbiBars = document.querySelectorAll('[id^="pbi-bar-"]');
    if (slideIndex === 6) { 
      setTimeout(() => {
        // Trigger current region active values
        const activeRegionBtn = document.querySelector('.pbi-filter-bar .filter-btn.active');
        if (activeRegionBtn) {
          triggerPBIRegion(activeRegionBtn.getAttribute('data-region'));
        }
      }, 250);
    } else {
      pbiBars.forEach(bar => {
        bar.style.height = '0%';
      });
    }
  }

  // ----------------------------------------------------
  // Slide 6: Power BI Interactive Filter Engine
  // ----------------------------------------------------
  const pbiRegionData = {
    all: {
      revenue: '$1,420,000',
      revenueTrend: '▲ +12.4% vs last Q',
      revenueTrendClass: 'up',
      accounts: '8,920',
      accountsTrend: '▲ +8.2% monthly',
      accountsTrendClass: 'up',
      bounce: '28.6%',
      bounceTrend: '▼ -1.5% optimized',
      bounceTrendClass: 'up', // green trend because bounce is down
      chartLabel: 'Global (All Regions Selected)',
      heights: ['60%', '80%', '70%', '95%']
    },
    north: {
      revenue: '$850,000',
      revenueTrend: '▲ +15.1% vs last Q',
      revenueTrendClass: 'up',
      accounts: '5,120',
      accountsTrend: '▲ +11.3% monthly',
      accountsTrendClass: 'up',
      bounce: '26.2%',
      bounceTrend: '▼ -3.1% optimized',
      bounceTrendClass: 'up',
      chartLabel: 'North Region Selected',
      heights: ['85%', '90%', '50%', '70%']
    },
    south: {
      revenue: '$570,000',
      revenueTrend: '▲ +8.7% vs last Q',
      revenueTrendClass: 'up',
      accounts: '3,800',
      accountsTrend: '▲ +4.2% monthly',
      accountsTrendClass: 'up',
      bounce: '31.8%',
      bounceTrend: '▲ +0.8% variance',
      bounceTrendClass: 'down', // red trend because bounce is up
      chartLabel: 'South Region Selected',
      heights: ['45%', '65%', '95%', '55%']
    }
  };

  const filterButtons = document.querySelectorAll('.pbi-filter-bar .filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active class
      filterButtons.forEach(b => b.classList.remove('active'));
      // Add active class
      e.target.classList.add('active');
      
      const region = e.target.getAttribute('data-region');
      triggerPBIRegion(region);
    });
  });

  function triggerPBIRegion(region) {
    const data = pbiRegionData[region];
    if (!data) return;

    // Update KPI Card Numbers
    const kpiRevenue = document.getElementById('kpi-revenue');
    const kpiAccounts = document.getElementById('kpi-accounts');
    const kpiBounce = document.getElementById('kpi-bounce');

    kpiRevenue.textContent = data.revenue;
    kpiAccounts.textContent = data.accounts;
    kpiBounce.textContent = data.bounce;

    // Update Trends
    const revTrend = document.getElementById('kpi-revenue-trend');
    const accTrend = document.getElementById('kpi-accounts-trend');
    const bncTrend = document.getElementById('kpi-bounce-trend');

    revTrend.className = `metric-trend ${data.revenueTrendClass}`;
    revTrend.querySelector('span').textContent = data.revenueTrend.startsWith('▲') ? '▲' : '▼';
    revTrend.childNodes[2].textContent = ` ${data.revenueTrend.substring(2)}`;

    accTrend.className = `metric-trend ${data.accountsTrendClass}`;
    accTrend.querySelector('span').textContent = data.accountsTrend.startsWith('▲') ? '▲' : '▼';
    accTrend.childNodes[2].textContent = ` ${data.accountsTrend.substring(2)}`;

    bncTrend.className = `metric-trend ${data.bounceTrendClass}`;
    bncTrend.querySelector('span').textContent = data.bounceTrend.startsWith('▲') ? '▲' : '▼';
    bncTrend.childNodes[2].textContent = ` ${data.bounceTrend.substring(2)}`;

    // Update Chart labels & bars
    document.getElementById('region-chart-label').textContent = data.chartLabel;
    
    document.getElementById('pbi-bar-q1').style.height = data.heights[0];
    document.getElementById('pbi-bar-q2').style.height = data.heights[1];
    document.getElementById('pbi-bar-q3').style.height = data.heights[2];
    document.getElementById('pbi-bar-q4').style.height = data.heights[3];
  }

  // ----------------------------------------------------
  // Slide 8: Interactive Dashboard & Insights Reveal
  // ----------------------------------------------------
  const toggleButtons = document.querySelectorAll('.dashboard-toggle-bar .toggle-btn');
  const imgWrappers = document.querySelectorAll('.dashboard-img-wrapper');
  const insightsGroups = document.querySelectorAll('.insights-group');
  const revealOverlay = document.getElementById('insights-reveal-overlay');
  const revealBtn = document.getElementById('reveal-insights-btn');
  const insightsPanel = document.getElementById('insights-content-panel');

  // Reveal insights action
  function revealInsights() {
    if (revealOverlay) revealOverlay.classList.remove('active');
    if (insightsPanel) insightsPanel.classList.add('active');
  }

  // Hide insights action
  function hideInsights() {
    if (revealOverlay) revealOverlay.classList.add('active');
    if (insightsPanel) insightsPanel.classList.remove('active');
  }

  if (revealBtn && revealOverlay) {
    revealBtn.addEventListener('click', revealInsights);
    revealOverlay.addEventListener('click', (e) => {
      if (e.target === revealOverlay || revealOverlay.contains(e.target)) {
        revealInsights();
      }
    });
  }

  toggleButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active from buttons
      toggleButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      const dashboard = e.target.getAttribute('data-dashboard');

      // Update image
      imgWrappers.forEach(img => {
        img.classList.remove('active');
        if (img.id === `img-${dashboard}`) {
          img.classList.add('active');
        }
      });

      // Update insights content but hide them (reset state)
      hideInsights();

      // Set display: block or none for the groups
      insightsGroups.forEach(group => {
        if (group.id === `insights-${dashboard}`) {
          group.style.display = 'flex';
        } else {
          group.style.display = 'none';
        }
      });
    });
  });
});
