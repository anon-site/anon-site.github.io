// Navbar scroll effects removed - navbar is now always visible

// AOS
AOS.init({
    duration: 700
});

var TxtType = function(el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = '';
    this.tick();
    this.isDeleting = false;
};

TxtType.prototype.tick = function() {
    var i = this.loopNum % this.toRotate.length;
    var fullTxt = this.toRotate[i];

    if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';

    var that = this;
    // تحسين السرعة لتصبح أكثر سلاسة
    var delta = 80; // سرعة ثابتة للكتابة
    var deleteDelta = 50; // سرعة ثابتة للمسح

    if (this.isDeleting) { 
        delta = deleteDelta; 
    }

    if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 300; // وقت أقصر بين النصوص
    }

    setTimeout(function() {
        that.tick();
    }, delta);
};

window.onload = function() {
    var elements = document.getElementsByClassName('typewrite');
    for (var i=0; i<elements.length; i++) {
        var toRotate = elements[i].getAttribute('data-type');
        var period = elements[i].getAttribute('data-period');
        if (toRotate) {
          new TxtType(elements[i], JSON.parse(toRotate), period);
        }
    }
    // INJECT CSS
    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = `
        .typewrite > .wrap { 
            border-right: 0.08em solid #0dcaf0;
            animation: blink 1s infinite;
            padding-right: 2px;
        }
        @keyframes blink {
            0%, 50% { border-color: #0dcaf0; }
            51%, 100% { border-color: transparent; }
        }
        .dark-theme .typewrite > .wrap {
            border-right-color: #0dcaf0;
        }
    `;
    document.body.appendChild(css);
    
    // إضافة تأثيرات للأزرار عند التحميل
    setTimeout(function() {
        const heroButtons = document.querySelectorAll('#hero .btn');
        heroButtons.forEach((btn, index) => {
            btn.style.opacity = '0';
            btn.style.transform = index === 0 ? 'translateX(100px)' : 'translateX(-100px)';
            
            setTimeout(function() {
                btn.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                btn.style.opacity = '1';
                btn.style.transform = 'translateX(0)';
            }, 500 + (index * 200));
        });
    }, 100);
};

// Close mobile menu after clicking a link
document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse.classList.contains('show')) {
            const bsCollapse = new bootstrap.Collapse(navbarCollapse);
            bsCollapse.hide();
        }
    });
});

// ---------------- Live Info Section ----------------

// Map Open-Meteo weather codes to icon URLs (using minimal set)
function getWeatherIcon(code){
    const map={
        0:'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-day-sunny.svg',
        1:'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-day-sunny.svg',
        2:'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-day-cloudy.svg',
        3:'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-cloudy.svg',
        45:'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-fog.svg',
        48:'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-fog.svg',
        51:'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-sprinkle.svg',
        61:'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-rain.svg',
        71:'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-snow.svg',
        80:'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-showers.svg',
        95:'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-thunderstorm.svg'
    };
    return map[code]||'';
}

// Fetch visitor IP
fetch('https://api.ipify.org?format=json')
  .then(res=>res.json())
  .then(data=>{
      const ipEl = document.getElementById('visitor-ip');
      if(ipEl) ipEl.textContent = data.ip;
      // fetch flag using ipapi
      fetch(`https://ipapi.co/${data.ip}/json/`).then(r=>r.json()).then(info=>{
          const flagEl=document.getElementById('ip-flag');
          if(flagEl && info.country_code){
              flagEl.src=`https://flagcdn.com/48x36/${info.country_code.toLowerCase()}.png`;
              flagEl.style.display='inline-block';
          }
          
          
          // fetch weather now that we have location
          if(info.latitude && info.longitude){
              const lat=info.latitude, lon=info.longitude;
              fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
                .then(r=>r.json()).then(w=>{
                    const weatherEl=document.getElementById('visitor-weather');
                    const iconEl=document.getElementById('weather-icon');
                    if(weatherEl && w.current_weather){
                        const temp=w.current_weather.temperature;
                        const code=w.current_weather.weathercode; // numeric
                        weatherEl.textContent=`${temp}°C`;
                        const cityEl=document.getElementById('visitor-city');
                        if(cityEl && info.city){cityEl.textContent=info.city;}
                        // simple icon mapping using open-meteo description
                        const iconUrl=getWeatherIcon(code);
                        if(iconEl && iconUrl){
                            iconEl.src=iconUrl;
                            iconEl.style.display='inline-block';
                        }
                    }
                }).catch(()=>{
                    const weatherEl=document.getElementById('visitor-weather');
                    if(weatherEl) weatherEl.textContent='Unavailable';
                });
          }
      });
  }).catch(()=>{
      const ipEl = document.getElementById('visitor-ip');
      if(ipEl) ipEl.textContent = 'Unavailable';
  });
// Fetch visitor weather via Open-Meteo based on geolocation
// Weather will be fetched after ipapi provides lat/lon

// ===== SIMPLE SLIDESHOW FUNCTIONALITY =====

let currentSlideIndex = 0;
let slideshowInterval;

// Initialize slideshow when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSlideshow();
});

// Reinitialize slideshow on window resize
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const slideshowContainer = document.querySelector('.slideshow-container');
        if (slideshowContainer) {
            // Reload the page to reinitialize slideshow with new layout
            location.reload();
        }
    }, 500);
});

function initializeSlideshow() {
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (!slideshowContainer) return;
    
    // Check if mobile device
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Create individual slides for each card on mobile
        createMobileSlides(slideshowContainer);
    }
    
    const slides = slideshowContainer.querySelectorAll('.slide');
    if (slides.length === 0) return;
    
    // Set initial state
    showSlide(0);
    
    // Start auto-play after 2 seconds
    setTimeout(() => {
        startAutoPlay();
    }, 2000);
    
    // Pause auto-play when user hovers over slideshow
    slideshowContainer.addEventListener('mouseenter', pauseAutoPlay);
    slideshowContainer.addEventListener('mouseleave', startAutoPlay);
}

function createMobileSlides(container) {
    // Get all cards from existing slides
    const allCards = container.querySelectorAll('.border-hover');
    
    if (allCards.length === 0) return;
    
    // Clear existing slides
    const existingSlides = container.querySelectorAll('.slide');
    existingSlides.forEach(slide => slide.remove());
    
    // Create new slides - one for each card
    allCards.forEach((card, index) => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        if (index === 0) slide.classList.add('active');
        
        const row = document.createElement('div');
        row.className = 'row gy-4 justify-content-center';
        
        const col = document.createElement('div');
        col.className = 'col-12';
        
        // Clone the card
        const clonedCard = card.cloneNode(true);
        col.appendChild(clonedCard);
        row.appendChild(col);
        slide.appendChild(row);
        
        container.insertBefore(slide, container.querySelector('.slideshow-nav'));
    });
    
    // Update dots
    updateMobileDots(container, allCards.length);
}

function updateMobileDots(container, totalSlides) {
    const dotsContainer = container.querySelector('.slideshow-dots');
    if (!dotsContainer) return;
    
    // Clear existing dots
    dotsContainer.innerHTML = '';
    
    // Create new dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot';
        if (i === 0) dot.classList.add('active');
        dot.onclick = () => currentSlide(i + 1);
        dotsContainer.appendChild(dot);
    }
}

function showSlide(index) {
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (!slideshowContainer) return;
    
    const slides = slideshowContainer.querySelectorAll('.slide');
    const dots = slideshowContainer.querySelectorAll('.dot');
    
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    
    // Hide all slides
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Show current slide
    currentSlideIndex = index;
    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
}

function changeSlide(direction) {
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (!slideshowContainer) return;
    
    const slides = slideshowContainer.querySelectorAll('.slide');
    let newIndex = currentSlideIndex + direction;
    
    if (newIndex >= slides.length) newIndex = 0;
    if (newIndex < 0) newIndex = slides.length - 1;
    
    showSlide(newIndex);
    
    // Reset auto-play timer
    pauseAutoPlay();
    setTimeout(startAutoPlay, 4000);
}

function currentSlide(index) {
    showSlide(index - 1);
    
    // Reset auto-play timer
    pauseAutoPlay();
    setTimeout(startAutoPlay, 4000);
}

function startAutoPlay() {
    pauseAutoPlay(); // Clear any existing interval
    
    slideshowInterval = setInterval(() => {
        const slideshowContainer = document.querySelector('.slideshow-container');
        if (!slideshowContainer) return;
        
        const slides = slideshowContainer.querySelectorAll('.slide');
        let nextIndex = currentSlideIndex + 1;
        
        if (nextIndex >= slides.length) nextIndex = 0;
        
        showSlide(nextIndex);
    }, 4000); // Change slide every 4 seconds
}

function pauseAutoPlay() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
}

// ===== IMAGE MODAL FUNCTIONALITY =====

// Initialize image modal when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeImageModal();
});

function initializeImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalBadge = document.getElementById('modalBadge');
    const modalClose = document.querySelector('.modal-close');
    
    // Add click event to all images in slideshow, work, and models sections
    const images = document.querySelectorAll('.slideshow-container img, #work .border-hover img, #Models .border-hover img');
    
    images.forEach(img => {
        img.addEventListener('click', function() {
            openImageModal(this);
        });
    });
    
    // Close modal when clicking close button
    modalClose.addEventListener('click', closeImageModal);
    
    // Close modal when clicking outside the image
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeImageModal();
        }
    });
}

function openImageModal(imgElement) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalBadge = document.getElementById('modalBadge');
    
    // Get image source and alt text
    const imgSrc = imgElement.src;
    const imgAlt = imgElement.alt || 'Design Image';
    
    // Find the parent card to get title and badge
    const card = imgElement.closest('.border-hover');
    let title = 'Design Work';
    let badgeText = 'Design';
    let badgeClass = 'bg-info';
    
    if (card) {
        const titleElement = card.querySelector('h5');
        const badgeElement = card.querySelector('.badge');
        
        if (titleElement) {
            title = titleElement.textContent.trim();
        }
        
        if (badgeElement) {
            badgeText = badgeElement.textContent.trim();
            badgeClass = badgeElement.className;
        }
    }
    
    // Set modal content
    modalImage.src = imgSrc;
    modalImage.alt = imgAlt;
    modalTitle.textContent = title;
    modalBadge.textContent = badgeText;
    modalBadge.className = `badge ${badgeClass}`;
    
    // Show modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Pause slideshow when modal is open
    pauseAutoPlay();
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    
    // Hide modal
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Restore scrolling
    
    // Resume slideshow after modal is closed
    setTimeout(() => {
        startAutoPlay();
    }, 1000);
}
