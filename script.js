const urlParams = new URLSearchParams(window.location.search);
let names = [];

if (urlParams.has('names')) {
  names = urlParams.get('names').split(',');
} else {
  names = [];
}


let names = [];
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
  spinning = true;
  let duration = Math.random() * 3000 + 4000;
  let start = Date.now();
  let spinAnim = () => {
    let time = Date.now() - start;
    angle += (Math.PI / 30) * Math.exp(-time / 2000);
    drawWheel();
    if (time < duration) {
      requestAnimationFrame(spinAnim);
    } else {
      spinning = false;
      let winnerIndex = Math.floor((names.length - (angle % (2 * Math.PI)) / (2 * Math.PI)) * names.length) % names.length;
      winnerEl.innerText = `🎉 Winner: ${names[winnerIndex]}! 🎉`;
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
  document.getElementById('namesList').innerText = `Names: ${names.join(', ')}`;
}
