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
var TxtType = function (el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = '';
    this.tick();
    this.isDeleting = false;
};

TxtType.prototype.tick = function () {
    var i = this.loopNum % this.toRotate.length;
    var fullTxt = this.toRotate[i];

    if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

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

    setTimeout(function () {
        that.tick();
    }, delta);
};

window.onload = function () {
    var elements = document.getElementsByClassName('typewrite');
    for (var i = 0; i < elements.length; i++) {
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
function getWeatherIcon(code) {
    const map = {
        0: 'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-day-sunny.svg',
        1: 'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-day-sunny.svg',
        2: 'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-day-cloudy.svg',
        3: 'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-cloudy.svg',
        45: 'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-fog.svg',
        48: 'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-fog.svg',
        51: 'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-sprinkle.svg',
        61: 'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-rain.svg',
        71: 'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-snow.svg',
        80: 'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-showers.svg',
        95: 'https://cdn.jsdelivr.net/gh/erikflowers/weather-icons/svg/wi-thunderstorm.svg'
    };
    return map[code] || '';
}

// Fetch visitor IP and Weather
fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => {
        const ipEl = document.getElementById('visitor-ip');
        if (ipEl) ipEl.textContent = data.ip;

        fetch(`https://ipapi.co/${data.ip}/json/`).then(r => r.json()).then(info => {
            const flagEl = document.getElementById('ip-flag');
            if (flagEl && info.country_code) {
                flagEl.src = `https://flagcdn.com/48x36/${info.country_code.toLowerCase()}.png`;
                flagEl.style.display = 'inline-block';
            }

            if (info.latitude && info.longitude) {
                const lat = info.latitude, lon = info.longitude;
                fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
                    .then(r => r.json()).then(w => {
                        const weatherEl = document.getElementById('visitor-weather');
                        const iconEl = document.getElementById('weather-icon');
                        if (weatherEl && w.current_weather) {
                            const temp = w.current_weather.temperature;
                            const code = w.current_weather.weathercode;
                            weatherEl.textContent = `${temp}°C`;
                            const cityEl = document.getElementById('visitor-city');
                            if (cityEl && info.city) { cityEl.textContent = info.city; }
                            const iconUrl = getWeatherIcon(code);
                            if (iconEl && iconUrl) {
                                iconEl.src = iconUrl;
                                iconEl.style.display = 'inline-block';
                            }
                        }
                    }).catch(() => {
                        const weatherEl = document.getElementById('visitor-weather');
                        if (weatherEl) weatherEl.textContent = 'Unavailable';
                    });
            }
        });
    }).catch(() => {
        const ipEl = document.getElementById('visitor-ip');
        if (ipEl) ipEl.textContent = 'Unavailable';
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
document.addEventListener('DOMContentLoaded', function () {
    const galleryModal = document.getElementById('galleryModal');
    const galleryClose = document.querySelector('.gallery-close');

    if (galleryClose) {
        galleryClose.addEventListener('click', closeGallery);
    }

    if (galleryModal) {
        galleryModal.addEventListener('click', function (e) {
            if (e.target === galleryModal) {
                closeGallery();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && galleryModal.classList.contains('show')) {
                closeGallery();
            }
        });
    }

    // Image Modal for Design Print and Design Web sections
    initializeImageModals();
});

// Image Modal Functionality
function initializeImageModals() {
    // Project data with all information
    const projectsData = {
        // Design Print Projects
        'project-01.webp': {
            title: 'Business Card',
            description: 'Modern and elegant business card design with clean layout, perfect for creating a professional first impression for your brand.',
            technologies: ['Photoshop', 'Print Design', 'Professional'],
            date: '2022',
            badge: { text: 'Photoshop', class: 'bg-info' }
        },
        'project-02.webp': {
            title: 'Business Card',
            description: 'Creative business card featuring unique typography and color scheme, designed to stand out and leave a lasting impression.',
            technologies: ['Photoshop', 'Creative', 'Premium'],
            date: '2022',
            badge: { text: 'Photoshop', class: 'bg-info' }
        },
        'project-03.webp': {
            title: 'Business Card',
            description: 'Minimalist business card design with focus on simplicity and readability, ideal for modern corporate branding.',
            technologies: ['Photoshop', 'Minimalist', 'Corporate'],
            date: '2023',
            badge: { text: 'Photoshop', class: 'bg-info' }
        },
        'project-04.webp': {
            title: 'Business Card',
            description: 'Elegant and luxurious business card design with sophisticated styling, perfect for high-end businesses and executives.',
            technologies: ['Photoshop', 'Elegant', 'Luxury'],
            date: '2023',
            badge: { text: 'Photoshop', class: 'bg-info' }
        },
        'project-05.webp': {
            title: 'Menu Card',
            description: 'Attractive menu card design with organized layout and appetizing presentation, perfect for cafes and restaurants.',
            technologies: ['Photoshop', 'Menu Design', 'Food & Beverage'],
            date: '2021',
            badge: { text: 'Photoshop', class: 'bg-info' }
        },
        'project-06.webp': {
            title: 'Restaurant Menu',
            description: 'Comprehensive restaurant menu design with detailed sections and beautiful graphics, optimized for print quality.',
            technologies: ['Corel Draw', 'Restaurant', 'Full Menu'],
            date: '2023',
            badge: { text: 'Corel Draw', class: 'bg-danger' }
        },
        // Design Web Projects
        'yemen.webp': {
            title: 'Life in Greece',
            description: 'Comprehensive guide about living in Greece, featuring cultural insights, practical information, and beautiful animations for an engaging user experience.',
            technologies: ['Animation', 'CSS3', 'JavaScript'],
            date: '2024',
            badge: { text: 'Animation', class: 'bg-info' },
            websiteUrl: 'https://anon-site.github.io/greece/'
        },
        'q1.webp': {
            title: 'TV Player',
            description: 'Modern streaming platform with intuitive interface, supporting multiple video formats and providing seamless viewing experience across all devices.',
            technologies: ['Streaming', 'HTML5', 'Responsive'],
            date: '2025',
            badge: { text: 'Streaming', class: 'bg-danger' },
            websiteUrl: 'https://anon-site.github.io/noon.tv'
        },
        'IslamTime.webp': {
            title: 'Islam Time',
            description: 'Islamic prayer times application with accurate location-based calculations, Quranic verses, and Islamic calendar features for Muslim community.',
            technologies: ['Islamic', 'API', 'Real-time'],
            date: '2025',
            badge: { text: 'Islamic App', class: 'bg-success' },
            websiteUrl: 'https://anon-site.github.io/Islam/'
        },
        'b1.webp': {
            title: 'Work Manager',
            description: 'Professional task management system with employee tracking, project organization, and data entry capabilities for efficient workplace productivity.',
            technologies: ['Management', 'Bootstrap', 'CRUD'],
            date: '2023',
            badge: { text: 'Data Entry', class: 'bg-primary' },
            websiteUrl: 'https://anon-site.github.io/Work-Manager/'
        },
        'Panda.jpeg': {
            title: 'Panda',
            description: 'Explore Panda, a refined web experience featuring modern aesthetics, seamless navigation, and a user-centric design approach. This project demonstrates advanced web design principles.',
            technologies: ['Web Design', 'Modern', 'Responsive'],
            date: '2026',
            badge: { text: 'Web Design', class: 'bg-gradient bg-purple' },
            websiteUrl: 'https://anon-site.github.io/Panda/'
        },
        'falconx.webp': {
            title: 'Falcon X',
            description: 'Advanced software solutions for Windows, Android, and FRP tools. Professional desktop applications and powerful mobile apps for various technical needs.',
            technologies: ['Windows', 'Android', 'FRP Tools'],
            date: '2025',
            badge: { text: 'Software Solutions', class: 'bg-primary' },
            websiteUrl: 'https://anon-site.github.io/falcon.x'
        }
    };

    // Create modal if it doesn't exist
    if (!document.getElementById('imageModal')) {
        const modalHTML = `
            <div id="imageModal" class="image-modal">
                <div class="modal-content">
                    <span class="modal-close" onclick="closeImageModal()">&times;</span>
                    <img id="modalImage" src="" alt="">
                    <div class="modal-caption">
                        <div class="modal-title-row">
                            <h5 id="modalTitle"></h5>
                            <span id="modalBadge" class="badge"></span>
                        </div>
                        <div class="modal-details">
                            <p id="modalDescription" class="modal-description"></p>
                            <div id="modalTechnologies" class="modal-technologies"></div>
                            <p id="modalDate" class="modal-date"></p>
                            <div id="modalVisitBtn" class="visit-website-btn" style="display: none;">
                                <a href="#" target="_blank" rel="noopener noreferrer" class="visit-link">
                                    <i class="ri-external-link-line"></i>
                                    <span>Visit Website</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Add click event to all images in Design Print and Design Web sections
    const sections = ['#work', '#Models'];
    sections.forEach(sectionId => {
        const images = document.querySelectorAll(`${sectionId} .border-hover img`);
        images.forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', function () {
                const imgSrc = this.getAttribute('src');
                const fileName = imgSrc.split('/').pop();
                const projectData = projectsData[fileName];

                if (projectData) {
                    openImageModal(imgSrc, projectData);
                }
            });
        });
    });

    // Close modal on Esc key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeImageModal();
        }
    });

    // Close modal on background click
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.addEventListener('click', function (e) {
            if (e.target === imageModal) {
                closeImageModal();
            }
        });
    }
}

function openImageModal(imageSrc, data) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalBadge = document.getElementById('modalBadge');
    const modalDescription = document.getElementById('modalDescription');
    const modalTechnologies = document.getElementById('modalTechnologies');
    const modalDate = document.getElementById('modalDate');
    const modalVisitBtn = document.getElementById('modalVisitBtn');

    if (!modal) return;

    // Set background image (Removed for cleaner look)
    // modal.style.backgroundImage = `url('${imageSrc}')`;


    // Set image
    modalImage.src = imageSrc;
    modalImage.alt = data.title;

    // Set title
    modalTitle.textContent = data.title;

    // Set badge
    modalBadge.textContent = data.badge.text;
    modalBadge.className = `badge ${data.badge.class}`;

    // Set description
    modalDescription.textContent = data.description;

    // Set technologies
    modalTechnologies.innerHTML = data.technologies.map(tech =>
        `<span class="modal-tech-tag">${tech}</span>`
    ).join('');

    // Set date
    modalDate.textContent = `Project Date: ${data.date}`;

    // Set visit website button
    if (data.websiteUrl) {
        modalVisitBtn.style.display = 'inline-block';
        const visitLink = modalVisitBtn.querySelector('a, .visit-link');
        if (visitLink) {
            visitLink.href = data.websiteUrl;
            // Ensure it opens in new tab
            visitLink.setAttribute('target', '_blank');
            visitLink.setAttribute('rel', 'noopener noreferrer');

            // Remove old event listeners and add new one
            const newVisitLink = visitLink.cloneNode(true);
            visitLink.parentNode.replaceChild(newVisitLink, visitLink);

            // Add click event
            newVisitLink.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.open(data.websiteUrl, '_blank', 'noopener,noreferrer');
            });
        }
    } else {
        modalVisitBtn.style.display = 'none';
    }

    // Show modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Add zoom effect that follows mouse movement
    modalImage.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        this.style.transformOrigin = `${x}% ${y}%`;
    });

    modalImage.addEventListener('mouseleave', function () {
        this.style.transformOrigin = 'center center';
    });
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.classList.remove('show');
        // modal.style.backgroundImage = ''; // Clear background image
        document.body.style.overflow = '';
    }
}

// Navbar Scroll Effect
window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});
