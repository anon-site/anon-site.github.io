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
    
    // إعادة تهيئة أحداث الصور للتأكد من عملها على الهاتف
    setTimeout(function() {
        initializeImageModal();
    }, 200);
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
let currentWebSlideIndex = 0;

// Simplified Animation types for slideshow - only practical animations
const animationTypes = [
    'slide-fade',
    'slide-slide-left',
    'slide-slide-right'
];

let currentAnimationType = 0;
let currentWebAnimationType = 0;

// Initialize slideshow when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSlideshow();
    initializeWebSlideshow();
});

// Reinitialize slideshow on window resize
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Reinitialize slideshow without reloading the page
        initializeSlideshow();
        initializeWebSlideshow();
        // Reinitialize image modal events for mobile
        initializeImageModal();
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
    
    // Auto-play removed - slideshow now manual only
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
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Show current slide with simple fade animation
    currentSlideIndex = index;
    const currentSlide = slides[currentSlideIndex];
    
    currentSlide.classList.add('slide-fade');
    currentSlide.classList.add('active');
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
}

function currentSlide(index) {
    showSlide(index - 1);
}

// Auto-play functions removed - slideshow is now manual only

// ===== DESIGN WEB SLIDESHOW FUNCTIONALITY =====

function initializeWebSlideshow() {
    const slideshowContainer = document.querySelector('.web-slideshow');
    if (!slideshowContainer) return;
    
    // Check if mobile device
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Create individual slides for each card on mobile
        createWebMobileSlides(slideshowContainer);
    }
    
    const slides = slideshowContainer.querySelectorAll('.slide');
    if (slides.length === 0) return;
    
    // Set initial state
    showWebSlide(0);
    
    // Auto-play removed - slideshow now manual only
}

function createWebMobileSlides(container) {
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
    updateWebMobileDots(container, allCards.length);
}

function updateWebMobileDots(container, totalSlides) {
    const dotsContainer = container.querySelector('.slideshow-dots');
    if (!dotsContainer) return;
    
    // Clear existing dots
    dotsContainer.innerHTML = '';
    
    // Create new dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot';
        if (i === 0) dot.classList.add('active');
        dot.onclick = () => currentWebSlide(i + 1);
        dotsContainer.appendChild(dot);
    }
}

function showWebSlide(index) {
    const slideshowContainer = document.querySelector('.web-slideshow');
    if (!slideshowContainer) return;
    
    const slides = slideshowContainer.querySelectorAll('.slide');
    const dots = slideshowContainer.querySelectorAll('.dot');
    
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    
    // Hide all slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Show current slide with simple fade animation
    currentWebSlideIndex = index;
    const currentSlide = slides[currentWebSlideIndex];
    
    currentSlide.classList.add('slide-fade');
    currentSlide.classList.add('active');
    dots[currentWebSlideIndex].classList.add('active');
}

function changeWebSlide(direction) {
    const slideshowContainer = document.querySelector('.web-slideshow');
    if (!slideshowContainer) return;
    
    const slides = slideshowContainer.querySelectorAll('.slide');
    let newIndex = currentWebSlideIndex + direction;
    
    if (newIndex >= slides.length) newIndex = 0;
    if (newIndex < 0) newIndex = slides.length - 1;
    
    showWebSlide(newIndex);
}

function currentWebSlide(index) {
    showWebSlide(index - 1);
}

// Web slideshow auto-play functions removed - slideshow is now manual only


// ===== GALLERY FUNCTIONALITY =====

// Gallery data
const galleryData = {
    'design-print': {
        title: 'Print Design Gallery',
        items: [
            {
                image: './assets/images/project-01.webp',
                title: 'Business Card',
                badge: 'Photoshop',
                badgeClass: 'bg-info',
                description: 'Professional business card design with attractive colors and refined layout'
            },
            {
                image: './assets/images/project-02.webp',
                title: 'Business Card',
                badge: 'Photoshop',
                badgeClass: 'bg-info',
                description: 'Elegant business card design with distinctive visual effects'
            },
            {
                image: './assets/images/project-03.webp',
                title: 'Business Card',
                badge: 'Photoshop',
                badgeClass: 'bg-info',
                description: 'Modern business card design with elegant minimalist style'
            },
            {
                image: './assets/images/project-04.webp',
                title: 'Business Card',
                badge: 'Photoshop',
                badgeClass: 'bg-info',
                description: 'Classic business card design with modern touches'
            },
            {
                image: './assets/images/project-05.webp',
                title: 'Menu Card',
                badge: 'Photoshop',
                badgeClass: 'bg-info',
                description: 'Attractive menu design with appetizing images and excellent organization'
            },
            {
                image: './assets/images/project-06.webp',
                title: 'Restaurant Menu',
                badge: 'Corel Draw',
                badgeClass: 'bg-info',
                description: 'Professional restaurant menu design with warm colors and organized layout'
            }
        ]
    },
    'design-web': {
        title: 'Web Design Gallery',
        items: [
            {
                image: './assets/images/yemen.webp',
                title: 'الحياة في اليونان',
                badge: 'Animation',
                badgeClass: 'bg-info',
                description: 'Life in Greece - A free service website about everything related to Greece in a simple and easy way',
                websiteUrl: 'https://anon-site.github.io/greece/'
            },
            {
                image: './assets/images/q1.webp',
                title: 'TV Player',
                badge: 'Animation',
                badgeClass: 'bg-info',
                description: 'Electronic TV player with modern interface and advanced features',
                websiteUrl: 'https://anon-site.github.io/noon.tv'
            },
            {
                image: './assets/images/IslamTime.webp',
                title: 'Islam Time',
                badge: 'Islamic App',
                badgeClass: 'bg-info',
                description: 'Islamic prayer times app with Hijri calendar, Quran, supplications, and customizable settings for Muslims worldwide',
                websiteUrl: 'https://anon-site.github.io/Islam/'
            },
            {
                image: './assets/images/w1.webp',
                title: 'Animation Website',
                badge: 'Animation',
                badgeClass: 'bg-info',
                description: 'Interactive animation website with modern technologies and stunning visual effects',
                websiteUrl: 'https://anon-site.github.io/animation/'
            },
            {
                image: './assets/images/t1.webp',
                title: 'Data List',
                badge: 'Animation',
                badgeClass: 'bg-info',
                description: 'Interactive data list with advanced search and filtering capabilities',
                websiteUrl: 'https://anon-site.github.io/data-table/'
            },
            {
                image: './assets/images/b1.webp',
                title: 'Work Manager',
                badge: 'Data Entry',
                badgeClass: 'bg-info',
                description: 'Advanced work management system with comprehensive database and easy interface',
                websiteUrl: 'https://anon-site.github.io/Work-Manager/'
            }
        ]
    }
};

function openGallery(type) {
    const modal = document.getElementById('galleryModal');
    const title = document.getElementById('galleryTitle');
    const grid = document.getElementById('galleryGrid');
    
    if (!modal || !galleryData[type]) return;
    
    // Set title
    title.textContent = galleryData[type].title;
    
    // Clear grid
    grid.innerHTML = '';
    
    // Add items to grid
    galleryData[type].items.forEach((item, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.style.animationDelay = `${index * 0.1}s`;
        
        // Get technologies and date for this item
        const technologies = getTechnologiesForProject(item.title);
        const projectDate = getProjectDate(item.title);
        
        // Create technologies HTML
        const technologiesHTML = technologies.map(tech => 
            `<span class="gallery-tech-tag">${tech}</span>`
        ).join('');
        
        galleryItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}" loading="lazy">
            <div class="gallery-item-content">
                <span class="badge ${item.badgeClass}">${item.badge}</span>
                <h5>${item.title}</h5>
                <p class="gallery-description">${item.description}</p>
                <div class="gallery-technologies">
                    ${technologiesHTML}
                </div>
                <p class="gallery-date">Project Date: ${projectDate}</p>
            </div>
        `;
        
        // Add click event to open image modal
        galleryItem.addEventListener('click', () => {
            openImageModalFromGallery(item);
        });
        
        grid.appendChild(galleryItem);
    });
    
    // Show modal
    modal.style.display = 'block';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Slideshows are now manual only
}

function openImageModalFromGallery(item) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalBadge = document.getElementById('modalBadge');
    const visitBtn = document.getElementById('visitWebsiteBtn');
    
    // Set modal content
    modalImage.src = item.image;
    modalImage.alt = item.title;
    modalTitle.textContent = item.title;
    modalBadge.textContent = item.badge;
    modalBadge.className = `badge ${item.badgeClass}`;
    
    // Get detailed information for gallery item
    const description = item.description || '';
    const technologies = getTechnologiesForProject(item.title);
    const projectDate = getProjectDate(item.title);
    
    // Add detailed information to modal
    setTimeout(() => {
        addModalDetails(description, technologies, projectDate);
    }, 100);
    
    // Check if this is a Design Web item and show visit button
    if (item.websiteUrl) {
        const visitLink = visitBtn.querySelector('a');
        visitLink.href = item.websiteUrl;
        visitLink.target = '_blank';
        visitLink.rel = 'noopener noreferrer';
        visitLink.className = 'visit-link';
        visitBtn.style.display = 'block';
        
        // Add click event to ensure the link works
        visitLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Try to open the link
            try {
                window.open(this.href, '_blank', 'noopener,noreferrer');
            } catch (error) {
                // Fallback: try to navigate directly
                window.location.href = this.href;
            }
        });
    } else {
        visitBtn.style.display = 'none';
    }
    
    // Hide gallery modal instead of closing it completely
    const galleryModal = document.getElementById('galleryModal');
    if (galleryModal) {
        galleryModal.classList.remove('show');
        galleryModal.style.display = 'none';
    }
    
    // Show image modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Store reference to gallery modal for reopening
    modal.dataset.fromGallery = 'true';
}

function closeGallery() {
    const modal = document.getElementById('galleryModal');
    
    // Hide modal
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Clear any gallery flags from image modal
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.dataset.fromGallery = 'false';
    }
    
    // Slideshows are now manual only
}

// Initialize gallery functionality
document.addEventListener('DOMContentLoaded', function() {
    const galleryModal = document.getElementById('galleryModal');
    const galleryClose = document.querySelector('.gallery-close');
    
    if (galleryClose) {
        galleryClose.addEventListener('click', closeGallery);
    }
    
    if (galleryModal) {
        // Close modal when clicking outside
        galleryModal.addEventListener('click', function(e) {
            if (e.target === galleryModal) {
                closeGallery();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && galleryModal.classList.contains('show')) {
                closeGallery();
            }
        });
    }
});

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
    const images = document.querySelectorAll('.slideshow-container img, .web-slideshow img, #work .border-hover img, #Models .border-hover img');
    
    images.forEach(img => {
        // Remove any existing event listeners to prevent duplicates
        img.removeEventListener('click', handleImageClick);
        img.removeEventListener('touchstart', handleImageClick);
        
        // Add click event for desktop
        img.addEventListener('click', handleImageClick);
        
        // Add touchstart event for mobile with better handling
        img.addEventListener('touchstart', handleImageClick, { passive: false });
        
        // Add visual feedback for mobile
        img.style.cursor = 'pointer';
        img.style.userSelect = 'none';
        img.style.webkitUserSelect = 'none';
        img.style.webkitTouchCallout = 'none';
    });
    
    // Close modal when clicking close button
    if (modalClose) {
        modalClose.addEventListener('click', closeImageModal);
    }
    
    // Close modal when clicking outside the image
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeImageModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modal && modal.classList.contains('show')) {
                closeImageModal();
            } else {
                // Check if gallery is open and close it
                const galleryModal = document.getElementById('galleryModal');
                if (galleryModal && galleryModal.classList.contains('show')) {
                    closeGallery();
                }
            }
        }
    });
}

// Separate function to handle image clicks
function handleImageClick(e) {
    // For touch events, use a different approach
    if (e.type === 'touchstart') {
        // Store the touch start info
        const touch = e.touches[0];
        this.touchStartY = touch.clientY;
        this.touchStartX = touch.clientX;
        this.touchStartTime = Date.now();
        this.isScrolling = false;
        
        // Add touch move listener to detect scroll
        const touchMoveHandler = (moveEvent) => {
            const currentTouch = moveEvent.touches[0];
            const deltaY = Math.abs(currentTouch.clientY - this.touchStartY);
            const deltaX = Math.abs(currentTouch.clientX - this.touchStartX);
            
            // If significant movement, it's a scroll
            if (deltaY > 10 || deltaX > 10) {
                this.isScrolling = true;
            }
        };
        
        // Add touch end listener to check if it was a tap
        const touchEndHandler = (endEvent) => {
            // If it was scrolling, don't open modal
            if (this.isScrolling) {
                this.removeEventListener('touchmove', touchMoveHandler);
                this.removeEventListener('touchend', touchEndHandler);
                return;
            }
            
            const touch = endEvent.changedTouches[0];
            const deltaY = Math.abs(touch.clientY - this.touchStartY);
            const deltaX = Math.abs(touch.clientX - this.touchStartX);
            const deltaTime = Date.now() - this.touchStartTime;
            
            // If it's a quick tap (not a scroll), open modal
            if (deltaY < 10 && deltaX < 10 && deltaTime < 300) {
                e.preventDefault();
                e.stopPropagation();
                openImageModal(this);
            }
            
            // Clean up
            this.removeEventListener('touchmove', touchMoveHandler);
            this.removeEventListener('touchend', touchEndHandler);
        };
        
        this.addEventListener('touchmove', touchMoveHandler, { passive: true });
        this.addEventListener('touchend', touchEndHandler);
        return;
    }
    
    // For mouse clicks, open modal directly
    if (e.type === 'click') {
        e.preventDefault();
        e.stopPropagation();
        openImageModal(this);
    }
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
    let description = '';
    let technologies = [];
    let projectDate = '';
    
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
    
    // Get detailed information from gallery data
    const isDesignWeb = imgElement.closest('.web-slideshow') || imgSrc.includes('w1.webp') || imgSrc.includes('n1.webp') || imgSrc.includes('b1.webp') || imgSrc.includes('yemen.webp') || imgSrc.includes('q1.webp') || imgSrc.includes('t1.webp') || imgSrc.includes('IslamTime.webp');
    
    if (isDesignWeb) {
        const webItem = galleryData['design-web'].items.find(item => imgSrc.includes(item.image.split('/').pop()));
        if (webItem) {
            description = webItem.description || '';
            technologies = getTechnologiesForProject(title);
            projectDate = getProjectDate(title);
        }
    } else {
        const printItem = galleryData['design-print'].items.find(item => imgSrc.includes(item.image.split('/').pop()));
        if (printItem) {
            description = printItem.description || '';
            technologies = getTechnologiesForProject(title);
            projectDate = getProjectDate(title);
        }
    }
    
    // Set modal content
    modalImage.src = imgSrc;
    modalImage.alt = imgAlt;
    modalTitle.textContent = title;
    modalBadge.textContent = badgeText;
    modalBadge.className = `badge ${badgeClass}`;
    
    // Add detailed information to modal
    setTimeout(() => {
        addModalDetails(description, technologies, projectDate);
    }, 100);
    
    // Check if this is a Design Web image and show visit button
    const visitBtn = document.getElementById('visitWebsiteBtn');
    
    if (isDesignWeb) {
        const webItem = galleryData['design-web'].items.find(item => imgSrc.includes(item.image.split('/').pop()));
        if (webItem && webItem.websiteUrl) {
            const visitLink = visitBtn.querySelector('a');
            visitLink.href = webItem.websiteUrl;
            visitLink.target = '_blank';
            visitLink.rel = 'noopener noreferrer';
            visitLink.className = 'visit-link';
            visitBtn.style.display = 'block';
            
            // Add click event to ensure the link works
            visitLink.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Try to open the link
                try {
                    window.open(this.href, '_blank', 'noopener,noreferrer');
                } catch (error) {
                    // Fallback: try to navigate directly
                    window.location.href = this.href;
                }
            });
        } else {
            visitBtn.style.display = 'none';
        }
    } else {
        visitBtn.style.display = 'none';
    }
    
    // Show modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Function to get technologies for each project
function getTechnologiesForProject(projectTitle) {
    const techMap = {
        'الحياة في اليونان': ['HTML5', 'CSS3', 'JavaScript', 'Animation'],
        'TV Player': ['HTML5', 'CSS3', 'JavaScript', 'Video API'],
        'Islam Time': ['HTML5', 'CSS3', 'JavaScript', 'Islamic API', 'Geolocation'],
        'Work Manager': ['HTML5', 'CSS3', 'JavaScript', 'PHP', 'Database'],
        'Animation': ['HTML5', 'CSS3', 'JavaScript', 'CSS Animation'],
        'Data List': ['HTML5', 'CSS3', 'JavaScript', 'Data Management'],
        'Business Card': ['Photoshop', 'Design', 'Print Ready'],
        'Menu Card': ['Photoshop', 'Design', 'Print Ready'],
        'Restaurant Menu': ['Corel Draw', 'Design', 'Print Ready']
    };
    
    return techMap[projectTitle] || ['Design', 'Creative'];
}

// Function to get project date
function getProjectDate(projectTitle) {
    const dateMap = {
        'الحياة في اليونان': '2024',
        'TV Player': '2025',
        'Islam Time': '2025',
        'Work Manager': '2023',
        'Animation': '2023',
        'Data List': '2023',
        'Business Card': '2022',
        'Menu Card': '2021',
        'Restaurant Menu': '2023'
    };
    
    return dateMap[projectTitle] || '2024';
}

// Function to add detailed information to modal
function addModalDetails(description, technologies, projectDate) {
    const modalCaption = document.querySelector('.modal-caption');
    
    // Remove existing details if any
    const existingDetails = modalCaption.querySelector('.modal-details');
    if (existingDetails) {
        existingDetails.remove();
    }
    
    // Create details container
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'modal-details';
    
    // Add description if available
    if (description && description.trim() !== '') {
        const descriptionEl = document.createElement('p');
        descriptionEl.className = 'modal-description';
        descriptionEl.textContent = description;
        detailsContainer.appendChild(descriptionEl);
    }
    
    // Add technologies if available
    if (technologies && technologies.length > 0) {
        const techContainer = document.createElement('div');
        techContainer.className = 'modal-technologies';
        
        technologies.forEach(tech => {
            const techTag = document.createElement('span');
            techTag.className = 'modal-tech-tag';
            techTag.textContent = tech;
            techContainer.appendChild(techTag);
        });
        
        detailsContainer.appendChild(techContainer);
    }
    
    // Add project date if available
    if (projectDate && projectDate.trim() !== '') {
        const dateEl = document.createElement('p');
        dateEl.className = 'modal-date';
        dateEl.textContent = `Project Date: ${projectDate}`;
        detailsContainer.appendChild(dateEl);
    }
    
    // Insert details after title row
    const titleRow = modalCaption.querySelector('.modal-title-row');
    if (titleRow && detailsContainer.children.length > 0) {
        titleRow.parentNode.insertBefore(detailsContainer, titleRow.nextSibling);
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    const visitBtn = document.getElementById('visitWebsiteBtn');
    
    // Check if image was opened from gallery
    const fromGallery = modal.dataset.fromGallery === 'true';
    
    // Clean up modal details
    const modalDetails = document.querySelector('.modal-details');
    if (modalDetails) {
        modalDetails.remove();
    }
    
    // Hide modal
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Restore scrolling
    
    // Hide visit button
    visitBtn.style.display = 'none';
    
    // If opened from gallery, reopen gallery modal
    if (fromGallery) {
        const galleryModal = document.getElementById('galleryModal');
        if (galleryModal) {
            galleryModal.style.display = 'block';
            galleryModal.classList.add('show');
        }
        // Clear the flag
        modal.dataset.fromGallery = 'false';
    }
    
    // Slideshow is now manual only
}
