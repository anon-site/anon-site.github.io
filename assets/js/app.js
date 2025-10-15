// Performance detection for low-end devices
const isLowEndDevice = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return true;
    }
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
        return true;
    }
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        return true;
    }
    return false;
};

// AOS - with performance optimization
const lowEnd = isLowEndDevice();
AOS.init({
    duration: lowEnd ? 400 : 700,
    once: true,
    disable: lowEnd ? 'mobile' : false,
    throttleDelay: 100
});

// Typewriter Effect
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
    var delta = 80;
    var deleteDelta = 50;

    if (this.isDeleting) { 
        delta = deleteDelta; 
    }

    if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 300;
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
    
    // Inject CSS for typewriter
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
    
    // Hero buttons animation
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

// Live Info Section - Weather Icons
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

// Fetch visitor IP and Weather
fetch('https://api.ipify.org?format=json')
  .then(res=>res.json())
  .then(data=>{
      const ipEl = document.getElementById('visitor-ip');
      if(ipEl) ipEl.textContent = data.ip;
      
      fetch(`https://ipapi.co/${data.ip}/json/`).then(r=>r.json()).then(info=>{
          const flagEl=document.getElementById('ip-flag');
          if(flagEl && info.country_code){
              flagEl.src=`https://flagcdn.com/48x36/${info.country_code.toLowerCase()}.png`;
              flagEl.style.display='inline-block';
          }
          
          if(info.latitude && info.longitude){
              const lat=info.latitude, lon=info.longitude;
              fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
                .then(r=>r.json()).then(w=>{
                    const weatherEl=document.getElementById('visitor-weather');
                    const iconEl=document.getElementById('weather-icon');
                    if(weatherEl && w.current_weather){
                        const temp=w.current_weather.temperature;
                        const code=w.current_weather.weathercode;
                        weatherEl.textContent=`${temp}°C`;
                        const cityEl=document.getElementById('visitor-city');
                        if(cityEl && info.city){cityEl.textContent=info.city;}
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

// Gallery Data
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
                description: 'Life in Greece - A free service website about everything related to Greece',
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
                description: 'Islamic prayer times app with Hijri calendar and Quran',
                websiteUrl: 'https://anon-site.github.io/Islam/'
            },
            {
                image: './assets/images/b1.webp',
                title: 'Work Manager',
                badge: 'Data Entry',
                badgeClass: 'bg-info',
                description: 'Advanced work management system with database',
                websiteUrl: 'https://anon-site.github.io/Work-Manager/'
            }
        ]
    }
};

// Helper functions for Gallery
function getTechnologiesForProject(projectTitle) {
    const techMap = {
        'الحياة في اليونان': ['HTML5', 'CSS3', 'JavaScript', 'Animation'],
        'TV Player': ['HTML5', 'CSS3', 'JavaScript', 'Video API'],
        'Islam Time': ['HTML5', 'CSS3', 'JavaScript', 'Islamic API'],
        'Work Manager': ['HTML5', 'CSS3', 'JavaScript', 'PHP', 'Database'],
        'Business Card': ['Photoshop', 'Design', 'Print Ready'],
        'Menu Card': ['Photoshop', 'Design', 'Print Ready'],
        'Restaurant Menu': ['Corel Draw', 'Design', 'Print Ready']
    };
    return techMap[projectTitle] || ['Design', 'Creative'];
}

function getProjectDate(projectTitle) {
    const dateMap = {
        'الحياة في اليونان': '2024',
        'TV Player': '2025',
        'Islam Time': '2025',
        'Work Manager': '2023',
        'Business Card': '2022',
        'Menu Card': '2021',
        'Restaurant Menu': '2023'
    };
    return dateMap[projectTitle] || '2024';
}

// Open Gallery Modal
function openGallery(type) {
    const modal = document.getElementById('galleryModal');
    const title = document.getElementById('galleryTitle');
    const grid = document.getElementById('galleryGrid');
    
    if (!modal || !galleryData[type]) return;
    
    title.textContent = galleryData[type].title;
    grid.innerHTML = '';
    
    galleryData[type].items.forEach((item, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.style.animationDelay = `${index * 0.1}s`;
        
        const technologies = getTechnologiesForProject(item.title);
        const projectDate = getProjectDate(item.title);
        
        const technologiesHTML = technologies.map(tech => 
            `<span class="gallery-tech-tag">${tech}</span>`
        ).join('');
        
        const websiteLink = item.websiteUrl ? 
            `<a href="${item.websiteUrl}" target="_blank" rel="noopener noreferrer" class="gallery-visit-btn">
                <i class="ri-external-link-line"></i> Visit Website
            </a>` : '';
        
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
                ${websiteLink}
            </div>
        `;
        
        grid.appendChild(galleryItem);
    });
    
    modal.style.display = 'block';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Close Gallery Modal
function closeGallery() {
    const modal = document.getElementById('galleryModal');
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// Initialize Gallery functionality
document.addEventListener('DOMContentLoaded', function() {
    const galleryModal = document.getElementById('galleryModal');
    const galleryClose = document.querySelector('.gallery-close');
    
    if (galleryClose) {
        galleryClose.addEventListener('click', closeGallery);
    }
    
    if (galleryModal) {
        galleryModal.addEventListener('click', function(e) {
            if (e.target === galleryModal) {
                closeGallery();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && galleryModal.classList.contains('show')) {
                closeGallery();
            }
        });
    }
});
