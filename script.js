// รูปใน Img/1.jpg ถึง Img/17.jpg
const MEMORY_IMAGES = Array.from({ length: 17 }, (_, i) => `Img/${i + 1}.jpg`);
MEMORY_IMAGES.forEach(src => { const p = new Image(); p.decoding = "async"; p.src = src; });
let imgQueue = [];
function nextImage() {
  if (!imgQueue.length) imgQueue = [...MEMORY_IMAGES].sort(() => Math.random() - .5);
  return imgQueue.pop();
}

// Add a legally obtained audio file named "khor-won-2.mp3" inside Img.
// Browsers may require the visitor to tap Yes before audio can start.
const FLOWER_COLORS = ["#f58a36", "#f4ca43", "#ed8ab5", "#77c9e9", "#fffdf8"];
const STORIES = [
  {
    text: "ขอบคุณที่วันนั้นเราได้เจอกัน ตั้งแต่วันนั้นโลกของไอก็เริ่มมีสีสันขึ้นมา",
    text2: ""
  },
  {
    text: "แค่เพียงเรื่องราวที่เราได้พูดคุยกันในวันแรก ๆ ก็ทำให้สิ่งเคยเจอมานั้นเปลี่ยนแปลงไป",
    text2: ""
  },
  {
    text: "ไม่รู้ว่าตั้งแต่เมื่อไหร่ที่จากความรู้สึกที่ว่าอยากคุยด้วย กลายเป็นอยากอยู่กับคน ๆ นี้",
    text2: "ความรู้สึกนี้มันคืออะไรนะ... ผมคิดว่ามันน่าจะถูกเรียกว่าความรักหรือเปล่านะ"
  },
  {
    text: "หลังจากที่ได้ลองแลกเปลี่ยนความคิด มุมมอง ทัศนคติ และลองทำอะไรหลาย ๆ อย่างด้วยกัน ทำให้ผมอยากอยู่กับคนคนนี้ไปอีกนาน ๆ",
    text2: "อยากให้คน ๆ นี้รู้ว่าไม่ว่าจะเกิดอะไรขึ้น จะมีผมอยู่ข้าง ๆ"
  },
  {
    text: "หากคุณรู้สึกแบบเดียวกัน ผมอยากให้วันนี้ของเราได้เริ่มต้นอีกบทบาทหนึ่งของความสัมพันธ์ จึงอยากถามคุณว่า",
    text2: "เรามาเป็นแฟนกันนะครับ :)"
  }
];

const flowersEl = document.getElementById("flowers");
const storyCard = document.getElementById("storyCard");
const storyText = document.getElementById("storyText");
const storyText2 = document.getElementById("storyText2");
const sceneCount = document.getElementById("sceneCount");
const nextButton = document.getElementById("nextButton");
const proposal = document.getElementById("proposal");
const happyEnding = document.getElementById("happyEnding");
const petalLayer = document.getElementById("petalLayer");
const memoryLayer = document.getElementById("memoryLayer");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const tinyHint = document.getElementById("tinyHint");
const loveSong = document.getElementById("loveSong");

let scene = 0, noCount = 0, memoryTimer;

// ===== Canvas garden: ดอกไม้เยอะเกือบเต็มเนิน แต่ยังลื่น (วาดด้วย canvas ใบเดียว) =====
let gCanvas, gCtx, gW = 0, gH = 0, gDpr = 1, colorIdx = 0, fadeFrom = 0, fadeT = -99, flowerList = [], sparkleList = [];
const gStart = performance.now(), petalSprites = {}, faceSprites = {};
function spriteCanvas(size, draw) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  draw(c.getContext("2d"), size); return c;
}
function petalSprite(color) {
  return petalSprites[color] || (petalSprites[color] = spriteCanvas(160, (g, S) => {
    g.translate(S / 2, S / 2);
    for (let i = 0; i < 12; i++) {
      g.save(); g.rotate(i * Math.PI / 6);
      g.beginPath(); g.ellipse(0, -S * .25, S * .14, S * .25, 0, 0, Math.PI * 2);
      g.fillStyle = color; g.fill();
      const hl = g.createLinearGradient(0, -S * .5, 0, -S * .1);
      hl.addColorStop(0, "rgba(255,255,255,.45)"); hl.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = hl; g.fill();
      g.lineWidth = 1.5; g.strokeStyle = "rgba(120,80,90,.14)"; g.stroke();
      g.restore();
    }
  }));
}
function faceSprite(blink) {
  return faceSprites[blink] || (faceSprites[blink] = spriteCanvas(160, (g, S) => {
    const cx = S / 2, cy = S / 2, R = S * .21, D = R * 2;
    const gr = g.createRadialGradient(cx - R * .3, cy - R * .4, 1, cx, cy, R);
    gr.addColorStop(0, "#fff3ad"); gr.addColorStop(1, "#f0a93a");
    g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fillStyle = gr; g.fill();
    g.lineWidth = 2; g.strokeStyle = "rgba(255,255,255,.45)"; g.stroke();
    g.fillStyle = "rgba(255,110,140,.5)";
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * D * .32, cy + D * .13, D * .1, D * .065, 0, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = g.fillStyle = "#5a3a2a"; g.lineWidth = 2.6; g.lineCap = "round";
    for (const s of [-1, 1]) {
      const ex = cx + s * D * .165, ey = cy - R + D * .44;
      g.beginPath();
      if (blink) g.arc(ex, ey + D * .03, D * .08, Math.PI * 1.1, Math.PI * 1.9);
      else g.ellipse(ex, ey, D * .075, D * .1, 0, 0, Math.PI * 2);
      blink ? g.stroke() : g.fill();
    }
    g.beginPath(); g.arc(cx, cy - R + D * .5, D * .13, Math.PI * .15, Math.PI * .85); g.stroke();
  }));
}
function layoutGarden(first) {
  gDpr = Math.min(window.devicePixelRatio || 1, 2);
  gW = flowersEl.clientWidth; gH = flowersEl.clientHeight;
  gCanvas.width = gW * gDpr; gCanvas.height = gH * gDpr;
  const mobile = gW < 600, rows = mobile ? 6 : 8;
  flowerList = [];
  for (let r = 0; r < rows; r++) {
    const near = r / (rows - 1);
    const size = (mobile ? 13 : 18) + near * (mobile ? 17 : 30);
    const bottomPct = 38 - near * 35;
    const n = Math.ceil(gW / (size * 1.25));
    for (let k = 0; k < n; k++) {
      const s = size * (.85 + Math.random() * .3);
      flowerList.push({
        x: (k + Math.random()) / n * gW, y: gH * (1 - bottomPct / 100) + (Math.random() - .5) * gH * .03, s,
        sp: .8 + Math.random() * .7, ph: Math.random() * 6.28,
        delay: first ? Math.random() * 2.4 : -5, blinkAt: 1 + Math.random() * 5, pop: 0, hx: 0, hy: 0, hr: 0
      });
    }
  }
  sparkleList = Array.from({ length: mobile ? 14 : 30 }, () => ({
    x: Math.random() * gW, y: gH * (.18 + Math.random() * .6), r: 3 + Math.random() * 5, sp: 1.5 + Math.random() * 2.5, ph: Math.random() * 6.28
  }));
}
function drawGarden(now) {
  const t = (now - gStart) / 1000, g = gCtx;
  g.setTransform(gDpr, 0, 0, gDpr, 0, 0); g.clearRect(0, 0, gW, gH);
  const petals = petalSprite(FLOWER_COLORS[colorIdx]), open = faceSprite(false), shut = faceSprite(true);
  const fk = Math.min((t - fadeT) / 1.8, 1), fe = fk * fk * (3 - 2 * fk);
  const oldPetals = fk < 1 ? petalSprite(FLOWER_COLORS[fadeFrom]) : null;
  g.lineCap = "round";
  for (const f of flowerList) {
    const gr = Math.min((t - f.delay) / 1.1, 1);
    if (gr <= 0) { f.hr = 0; continue; }
    const e = gr < 1 ? 1 + 2.70158 * Math.pow(gr - 1, 3) + 1.70158 * Math.pow(gr - 1, 2) : 1;
    const ang = Math.sin(t * f.sp + f.ph) * .06 + Math.sin(f.x * .006 - t * 1.3) * .05;
    const L = f.s * 1.9;
    f.hx = f.x + Math.sin(ang) * L * e; f.hy = f.y - Math.cos(ang) * L * e; f.hr = f.s * .6 * e;
    g.save(); g.translate(f.x, f.y); g.rotate(ang); g.scale(e, e);
    g.strokeStyle = "#5fa863"; g.lineWidth = Math.max(2, f.s * .11);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -L); g.stroke();
    g.fillStyle = "#64b86b";
    for (const [side, h] of [[-1, .38], [1, .56]]) {
      g.save(); g.translate(0, -L * h); g.rotate(-side * .5);
      g.beginPath(); g.ellipse(side * f.s * .22, 0, f.s * .24, f.s * .09, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
    let pulse = 1 + .07 * Math.sin(t * 2.4 + f.ph * 2);
    if (f.pop) {
      const p = (t - f.pop) / .7;
      if (p >= 1) f.pop = 0; else if (p > 0) pulse *= 1 + .5 * Math.sin(p * Math.PI * 2) * (1 - p);
    }
    const hs = f.s * pulse;
    g.translate(0, -L); g.rotate(Math.sin(t * 1.9 + f.ph) * .1);
    g.save(); g.rotate(t * .22 + f.ph);
    if (oldPetals) { g.drawImage(oldPetals, -hs / 2, -hs / 2, hs, hs); g.globalAlpha = fe; }
    g.drawImage(petals, -hs / 2, -hs / 2, hs, hs); g.restore(); g.globalAlpha = 1;
    if (t > f.blinkAt + .16) f.blinkAt = t + 2.5 + Math.random() * 4;
    g.drawImage(t > f.blinkAt ? shut : open, -hs / 2, -hs / 2, hs, hs);
    g.restore();
  }
  g.fillStyle = "#fff7b8";
  for (const s of sparkleList) {
    const k = Math.max(0, Math.sin(t * s.sp + s.ph)); if (k < .05) continue;
    const r = s.r * k; g.globalAlpha = k;
    g.beginPath(); g.moveTo(s.x, s.y - r); g.quadraticCurveTo(s.x, s.y, s.x + r, s.y); g.quadraticCurveTo(s.x, s.y, s.x, s.y + r);
    g.quadraticCurveTo(s.x, s.y, s.x - r, s.y); g.quadraticCurveTo(s.x, s.y, s.x, s.y - r); g.fill();
  }
  g.globalAlpha = 1;
}
function spawnHeart(x, y) {
  const h = document.createElement("span");
  h.className = "float-heart"; h.textContent = ["♡", "💗", "✿", "✨"][Math.floor(Math.random() * 4)];
  h.style.left = `${x}px`; h.style.top = `${y}px`;
  document.body.appendChild(h); setTimeout(() => h.remove(), 1800);
}
function hitFlower(x, y) {
  for (let i = flowerList.length - 1; i >= 0; i--) {
    const f = flowerList[i];
    if (f.hr && Math.hypot(x - f.hx, y - f.hy) < f.hr) return f;
  }
}
function makeGarden() {
  gCanvas = document.createElement("canvas"); flowersEl.appendChild(gCanvas); gCtx = gCanvas.getContext("2d");
  layoutGarden(true); setFlowerColor(0);
  let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => layoutGarden(false), 200); });
  gCanvas.addEventListener("pointermove", e => { gCanvas.style.cursor = hitFlower(e.offsetX, e.offsetY) ? "pointer" : ""; });
  gCanvas.addEventListener("pointerdown", e => {
    const hit = hitFlower(e.offsetX, e.offsetY); if (!hit) return;
    const t = (performance.now() - gStart) / 1000;
    for (const f of flowerList) { const d = Math.hypot(f.hx - hit.hx, f.hy - hit.hy); if (f.hr && d < 90) f.pop = t + d / 350; }
    spawnHeart(e.clientX, e.clientY - 10);
  });
  const loop = now => { drawGarden(now); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
function setFlowerColor(index) {
  if (index !== colorIdx) { fadeFrom = colorIdx; fadeT = (performance.now() - gStart) / 1000; }
  colorIdx = index;
  document.documentElement.style.setProperty("--flower", FLOWER_COLORS[index]);
}
function showScene(index) {
  scene = index;
  setFlowerColor(index);
  sceneCount.textContent = `SCENE 0${index + 1} / 05`;
  storyText.classList.remove("reveal");
  storyText2.classList.remove("reveal");
  storyText.textContent = STORIES[index].text;
  storyText2.textContent = STORIES[index].text2;
  requestAnimationFrame(() => {
    storyText.classList.add("reveal");
    if (STORIES[index].text2) {
      setTimeout(() => storyText2.classList.add("reveal"), 900);
    }
  });
  nextButton.textContent = index === 4 ? "ไปต่อกันนะ ♡" : "ค่อย ๆ ไปด้วยกัน ♡";
  if (index === 4) nextButton.setAttribute("aria-label", "ไปยังคำถาม");
}
nextButton.addEventListener("click", () => {
  if (scene < 4) {
    showScene(scene + 1);
  } else {
    storyCard.classList.add("hidden");
    setTimeout(() => {
      proposal.classList.remove("hidden");
    }, 400);
  }
});
function startPetals() {
  setInterval(() => {
    if (document.hidden) return;
    const petal = document.createElement("span");
    petal.className = "falling-petal";
    petal.textContent = Math.random() > .5 ? "✿" : "❀";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.fontSize = `${12 + Math.random() * 18}px`;
    petal.style.color = FLOWER_COLORS[scene] || "#fff";
    petal.style.setProperty("--drift", `${Math.random() * 220 - 110}px`);
    petal.style.animationDuration = `${8 + Math.random() * 9}s`;
    petalLayer.appendChild(petal);
    setTimeout(() => petal.remove(), 18000);
  }, 550);
}
function startMemoryRain() {
  clearInterval(memoryTimer);
  memoryTimer = setInterval(() => {
    if (document.hidden || memoryLayer.childElementCount > 10) return;
    const img = document.createElement("img");
    img.className = "memory-photo";
    img.decoding = "async";
    img.src = nextImage();
    img.alt = "ความทรงจำของเรา";
    img.style.left = `${Math.random() * 86 + 4}%`;
    img.style.setProperty("--duration", `${9 + Math.random() * 5}s`);
    img.style.setProperty("--tilt", `${Math.random() * 24 - 12}deg`);
    img.style.setProperty("--spin", `${(Math.random() < .5 ? -1 : 1) * (540 + Math.floor(Math.random() * 3) * 360)}deg`);
    img.onerror = () => img.remove();
    memoryLayer.appendChild(img);
    setTimeout(() => img.remove(), 15000);
  }, 1200);
}
function celebrate() {
  for (let i = 0; i < 150; i++) {
    const bit = document.createElement("i");
    bit.className = "confetti";
    bit.style.left = `${Math.random() * 100}%`;
    bit.style.background = ["#ff8eb3", "#ffd66b", "#8ed9e8", "#b5e7a0", "#c7a4ef"][i % 5];
    bit.style.setProperty("--duration", `${2.5 + Math.random() * 3.5}s`);
    bit.style.animationDelay = `${Math.random() * 1.2}s`;
    bit.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(bit);
    setTimeout(() => bit.remove(), 7000);
  }
}
yesButton.addEventListener("click", async () => {
  proposal.classList.add("hidden");
  memoryLayer.innerHTML = "";
  clearInterval(memoryTimer);
  happyEnding.classList.remove("hidden");
  celebrate();
  try {
    loveSong.currentTime = 0;
    await loveSong.play();
  } catch (err) {
    tinyHint.textContent = "ถ้าเพลงไม่เล่น ให้ตรวจสอบไฟล์ Img/khor-won-2.mp3 นะครับ";
  }
});
noButton.addEventListener("click", () => {
  noCount++;
  const yesScale = Math.min(1 + noCount * 0.18, 3.2);
  const noScale = Math.max(1 - noCount * 0.13, 0.08);
  yesButton.style.transform = `scale(${yesScale})`;
  noButton.style.transform = `scale(${noScale})`;
  yesButton.style.zIndex = "2";
  tinyHint.textContent = ["แน่ใจเหรอครับ 🥺", "ลองคิดอีกทีได้ไหม", "ปุ่ม Yes ดูน่ากดขึ้นแล้วนะ 💗", "ผมรอคำตอบ Yes อยู่นะ 🌼"][Math.min(noCount - 1, 3)];
  if (noScale <= 0.08) {
    noButton.style.visibility = "hidden";
    tinyHint.textContent = "เหลือคำตอบที่ผมแอบหวังไว้แล้วครับ 💞";
  }
});
document.getElementById("replayButton").addEventListener("click", () => {
  loveSong.pause();
  loveSong.currentTime = 0;
  happyEnding.classList.add("hidden");
  proposal.classList.add("hidden");
  storyCard.classList.remove("hidden");
  memoryLayer.innerHTML = "";
  clearInterval(memoryTimer);
  noCount = 0;
  yesButton.style.transform = "";
  noButton.style.transform = "";
  noButton.style.visibility = "";
  tinyHint.textContent = "ลองเลือกดูสิครับ 🌼";
  showScene(0);
  startMemoryRain();
});
makeGarden();
showScene(0);
startPetals();

function spawnCritters() {
  ["🦋", "🐝", "🦋", "🐞", "🦋", "🐝", "🦋", "🐞"].forEach((emoji, i) => {
    const c = document.createElement("div");
    c.className = "critter";
    c.style.top = `${12 + Math.random() * 45}%`;
    c.style.animationDuration = `${22 + Math.random() * 16}s`;
    c.style.animationDelay = `${-i * 7}s`;
    c.innerHTML = `<span>${emoji}</span>`;
    document.body.appendChild(c);
  });
}
startMemoryRain();
spawnCritters();