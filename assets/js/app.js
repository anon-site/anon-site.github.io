const navbar = document.querySelector('.navbar')

window.addEventListener('scroll', () => {
    if(this.scrollY > 0) {
        navbar.classList.remove('py-4')
        navbar.classList.add('shadow', 'py-3')
    } else {
        navbar.classList.add('py-4')
        navbar.classList.remove('shadow', 'py-3')
    }
})

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
    var delta = 200 - Math.random() * 100;

    if (this.isDeleting) { delta /= 2; }

    if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
    this.isDeleting = false;
    this.loopNum++;
    delta = 500;
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
    css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid #fff}";
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

// ---------------- Live Info Section ----------------
let userTimezone = 'Europe/Athens'; // Default timezone
let userCity = 'Athens'; // Default city

function updateLocalTime(){
    const now = new Date().toLocaleTimeString('en-GB',{timeZone: userTimezone});
    const timeEl = document.getElementById('local-time');
    if(timeEl) timeEl.textContent = now;
}

function updateTimezoneAndCity(timezone, city) {
    userTimezone = timezone;
    userCity = city;
    const cityEl = document.getElementById('local-city');
    if(cityEl) cityEl.textContent = city;
}

setInterval(updateLocalTime,1000);

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
updateLocalTime();

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
          
          // Update timezone and city for local time display
          if(info.timezone && info.city) {
              updateTimezoneAndCity(info.timezone, info.city);
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