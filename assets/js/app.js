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
function updateAthensTime(){
    const now = new Date().toLocaleTimeString('en-GB',{timeZone:'Europe/Athens'});
    const timeEl = document.getElementById('athens-time');
    if(timeEl) timeEl.textContent = now;
}
setInterval(updateAthensTime,1000);
updateAthensTime();

// Fetch visitor IP
fetch('https://api.ipify.org?format=json')
  .then(res=>res.json())
  .then(data=>{
      const ipEl = document.getElementById('visitor-ip');
      if(ipEl) ipEl.textContent = data.ip;
  }).catch(()=>{
      const ipEl = document.getElementById('visitor-ip');
      if(ipEl) ipEl.textContent = 'Unavailable';
  });

// Fetch Athens weather via Open-Meteo
fetch('https://api.open-meteo.com/v1/forecast?latitude=37.98&longitude=23.73&current_weather=true&timezone=Europe%2FAthens')
  .then(res=>res.json())
  .then(data=>{
      const weatherEl = document.getElementById('athens-weather');
      if(weatherEl && data.current_weather){
          const t = data.current_weather.temperature;
          const ws = data.current_weather.windspeed;
          weatherEl.textContent = `${t}°C | Wind ${ws}km/h`;
      }
  }).catch(()=>{
      const weatherEl = document.getElementById('athens-weather');
      if(weatherEl) weatherEl.textContent = 'Unavailable';
  });