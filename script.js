const urlParams = new URLSearchParams(window.location.search);
let names = [];
//-------------------------------------------------------------------
// if (urlParams.has('names')) {
//  names = urlParams.get('names').split(',');
//} else {
//  names = [];
//}  
//-------------------------------------------------------------------

const urlNames = urlParams.get('names');
if (urlNames) {
  names = urlNames.split(',').map(name => name.trim());
  renderNames();// Call your function to display the names in UI/wheel
}
//-------------------------------------------------------------------

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

  const spinDuration = 5000; // total spin duration in ms
  const startTime = performance.now();
  const totalRotation = Math.random() * 4 * Math.PI + 10 * Math.PI; // 5-7 full spins

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animate(currentTime) {
    let elapsed = currentTime - startTime;
    let t = Math.min(elapsed / spinDuration, 1); // normalize to 0-1
    let easedT = easeOutCubic(t);

    angle = easedT * totalRotation;

    drawWheel();

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      spinAudio.pause();
      spinAudio.currentTime = 0;

      spinning = false;

      // Determine winner
      const arc = (2 * Math.PI) / names.length;
      let currentAngle = angle % (2 * Math.PI);
      let winnerIndex = names.length - Math.floor(currentAngle / arc) - 1;
      if (winnerIndex < 0) winnerIndex += names.length;

      const winnerName = names[winnerIndex];
      document.getElementById('winner').innerText = `🎉 Winner: ${winnerName}! 🎉`;

      const winnerDisplay = document.getElementById("winnerName");
winnerDisplay.textContent = winnerName;
winnerDisplay.classList.add("zoom-out");

// Remove class after animation ends so it can be reused
setTimeout(() => {
  winnerDisplay.classList.remove("zoom-out");
}, 2000); // match animation duration


      confetti({
  particleCount: 200,
  spread: 150,
  startVelocity: 40,
  origin: { y: 0.6 }
});

      // Play applause sound for 6 seconds
      clapAudio.currentTime = 0;
      clapAudio.play();
      setTimeout(() => {
        clapAudio.pause();
        clapAudio.currentTime = 0;
      }, 6000);

      // Remove winner from names
      // names.splice(winnerIndex, 1);
      // updateList();
      // drawWheel();
    }
  }

  requestAnimationFrame(animate);
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
  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    try {
      const res = await fetch(`https://weather-proxy-tau.vercel.app/api/weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error("Weather fetch failed");

      const data = await res.json();

      const city = data.name;
      const temp = data.main.temp;
      const desc = data.weather[0].description;

      document.getElementById('weather').innerText = `${city}: ${temp}°C, ${desc}`;
    } catch (err) {
      document.getElementById('weather').innerText = `Weather fetch failed.`;
      console.error(err);
    }
  }, (err) => {
    document.getElementById('weather').innerText = `Location access denied.`;
    console.error(err);
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

function renderNames() {
  const namesList = document.getElementById("namesList");
  namesList.innerHTML = ""; // clear old list

  names.forEach((name, index) => {
    const nameTag = document.createElement("span");
    nameTag.className = "name-tag";
    nameTag.textContent = name;

    // Remove name on click
    nameTag.onclick = () => {
      names.splice(index, 1);
      renderNames();
      updateWheel();
      updateShareLink();
    };

    namesList.appendChild(nameTag);
  });

  updateWheel(); // redraw wheel with updated names
}

