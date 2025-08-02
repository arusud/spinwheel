const urlParams = new URLSearchParams(window.location.search);
let names = [];

if (urlParams.has('names')) {
  names = urlParams.get('names').split(',');
} else {
  names = [];
}


//let names = [];  duplicate , its already mentioned above, remove it
let angle = 0;
let spinning = false;
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const winnerEl = document.getElementById('winner');

function drawWheel() {
  const arc = (2 * Math.PI) / names.length;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  names.forEach((name, i) => {
    let start = arc * i;
    let end = start + arc;

    ctx.beginPath();
    ctx.fillStyle = `hsl(${i * 360 / names.length}, 80%, 70%)`;
    ctx.moveTo(250, 250);
    ctx.arc(250, 250, 250, start + angle, end + angle);
    ctx.fill();

    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(start + arc / 2 + angle);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(name, 230, 10);
    ctx.restore();
  });
}

function spin() {
  if (spinning || names.length === 0) return;

  const spinAudio = document.getElementById('spinAudio');
  const clapAudio = document.getElementById('clapAudio');

  spinning = true;
  spinAudio.currentTime = 0;
  spinAudio.play();

  let duration = Math.random() * 3000 + 4000;
  let start = Date.now();

  const spinAnim = () => {
    let time = Date.now() - start;
    // Easing effect: decelerate
    angle += (Math.PI / 30) * Math.exp(-time / 2000);
    drawWheel();

    if (time < duration) {
      requestAnimationFrame(spinAnim);
    } else {
      spinAudio.pause();
      spinning = false;

      // Calculate winner
      let winnerIndex = Math.floor((names.length - (angle % (2 * Math.PI)) / (2 * Math.PI)) * names.length) % names.length;
      let winnerName = names[winnerIndex];

      // Show winner
      document.getElementById('winner').innerText = `🎉 Winner: ${winnerName}! 🎉`;

      // Clap!
    clapAudio.currentTime = 0;
clapAudio.play();

setTimeout(() => {
  clapAudio.pause();
  clapAudio.currentTime = 0;
}, 6000); // 6000 ms = 6 seconds


      // Remove winner from list
      //names.splice(winnerIndex, 1);
      //updateList();
      //drawWheel();
    }
  };

  spinAnim();
}


function addName() {
  const input = document.getElementById('nameInput');
  if (input.value.trim()) {
    names.push(input.value.trim());
    input.value = '';
    updateList();
    drawWheel();
  }
}

function resetNames() {
  names = [];
  winnerEl.innerText = '';
  updateList();
  drawWheel();
}

function updateList() {
  const container = document.getElementById('namesList');
  container.innerHTML = '';
  names.forEach(name => {
    const span = document.createElement('span');
    span.textContent = name;
    span.style.margin = '5px';
    span.style.padding = '5px 10px';
    span.style.background = '#eee';
    span.style.border = '1px solid #aaa';
    span.style.borderRadius = '8px';
    span.style.cursor = 'pointer';
    span.title = 'Click to remove';
    container.appendChild(span);
  });
}


function generateLink() {
  if (names.length === 0) {
    alert("Please add names first!");
    return;
  }
  const encoded = encodeURIComponent(names.join(','));
  const link = `${window.location.origin}${window.location.pathname}?names=${encoded}`;
  document.getElementById('shareLink').innerHTML = `
    <input type="text" value="${link}" readonly style="width:80%;" onclick="this.select()" />
    <p>Copy and share this link</p>
  `;
}

//  weather information function below //

function fetchWeather() {
  if (!navigator.geolocation) {
    document.getElementById('weather').innerText = 'Geolocation not supported.';
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const apiKey = 'bf0800fb0d447c9c628bd4a2230038b5'; // 🔁 Replace with your real key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const temp = data.main.temp;
      const city = data.name;
      const desc = data.weather[0].description;
      document.getElementById('weather').innerText = `${city}: ${temp}°C, ${desc}`;
    } catch (error) {
      document.getElementById('weather').innerText = 'Failed to load weather.';
      console.error(error);
    }
  }, () => {
    document.getElementById('weather').innerText = 'Location permission denied.';
  });
}

// Call the function when the page loads
fetchWeather();


function clickRemove(event) {
  if (event.target.tagName === 'SPAN') {
    const name = event.target.innerText;
    names = names.filter(n => n !== name);
    updateList();
    drawWheel();
  }
}

