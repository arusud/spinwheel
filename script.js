const urlParams = new URLSearchParams(window.location.search);
let names = [];
//-------------------------------------------------------------------
 if (urlParams.has('names')) {
  names = urlParams.get('names').split(',');
} else {
  names = [];
}  
//-------------------------------------------------------------------
let angle = 0;
let spinning = false;
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const winnerEl = document.getElementById('winner');


// Run once on load
window.onload = function() {
  //resizeCanvas();  // sets canvas size based on screen
 updateList();
  drawWheel();     // draw wheel immediately
};

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
     // document.getElementById('winner').innerText = `🎉 Winner: ${winnerName}! 🎉`;
     document.getElementById('winner').innerText = aiCongratsMessage(winnerName);


fireConfettiAtWheel(); // 🎉 Fire from the center of the wheel

      const winnerDisplay = document.getElementById("winnerName");
winnerDisplay.textContent = winnerName;
winnerDisplay.classList.add("zoom-out");

// Remove class after animation ends so it can be reused
setTimeout(() => {
  winnerDisplay.classList.remove("zoom-out");
}, 2000); // match animation duration

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

function fireConfettiAtWheel() {
  const wheel = document.getElementById("wheel");
  if (!wheel) return;

  const rect = wheel.getBoundingClientRect();

  // Account for scrolling to get the actual visible position
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  // Center position in pixels relative to document
  const centerXpx = rect.left + scrollX + rect.width / 2;
  const centerYpx = rect.top + scrollY + rect.height / 2;

  // Convert to 0–1 coordinates for confetti.js
  const originX = centerXpx / document.documentElement.scrollWidth;
  const originY = centerYpx / document.documentElement.scrollHeight;

  confetti({
    particleCount: 200,
    spread: 360,
    startVelocity: 45,
    origin: { x: originX, y: originY },
    zIndex: 9999
  });
}

function aiCongratsMessage(name) {
  const nameStyled = `<span style="font-weight:bold; color:#2f2fd3;">${name}</span>`; // Bold blue name
  
  const templates = [
    `🏆 ${nameStyled} takes the crown!`,
    `🐦‍🔥 ${nameStyled} rises from ashes!`,
    `🎯 Bullseye! ${nameStyled} wins!`,
    `💫 ${nameStyled} spins to victory!`,
    `🥳 All hail ${nameStyled}, our champion!`,
    `🚀 ${nameStyled} just launched into the winner’s circle!`,
    `🌟 ${nameStyled} shines bright as today’s victor!`,
    `💥 Boom! ${nameStyled} just crushed it!`,
    `🎩 Tip your hat to ${nameStyled}, folks!`,
    `🍀 Luck loves ${nameStyled} today!`,
    `🎉 Confetti showers for ${nameStyled}!`,
    `⚡ ${nameStyled} zapped their way to the top!`,
    `🦸 ${nameStyled} saves the day… and wins!`,
    `💎 ${nameStyled} is a rare gem of a winner!`,
    `📣 Everybody cheer for ${nameStyled}!`,
    `🌈 ${nameStyled} just caught the pot of gold!`,
    `🕺 ${nameStyled} dances away with the prize!`,
    `🍾 Pop the champagne for ${nameStyled}!`,
    `👑 Bow down to ${nameStyled}, the ruler of the wheel!`,
    `🏅 ${nameStyled} adds another medal to the collection!`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}





