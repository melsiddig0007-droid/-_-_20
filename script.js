function nextSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  // Top music button is hidden on the countdown screen
  document.body.classList.toggle('in-countdown', id === 'sec-countdown');

  // Galaxy: hide the top music button and stop the other songs
  const inUniverse = (id === 'sec-universe');
  document.body.classList.toggle('in-universe', inUniverse);
  if (inUniverse) {
    const top = document.getElementById('myAudio');
    const topBtn = document.getElementById('playButton');
    if (top) top.pause();
    if (topBtn) topBtn.textContent = '▶️';
    const card = document.getElementById('bg-music');
    const cardBtn = document.getElementById('musicPlayBtn');
    if (card) card.pause();
    if (cardBtn) cardBtn.innerText = 'تشغيل الموسيقى 🎵';
  }
}

// The countdown is the first screen, so hide the top music button from the start
document.body.classList.add('in-countdown');

// Countdown Timer
// 2 November 2026 at 12:00 AM (midnight) - device local time
const targetDate = new Date(2026, 10, 2, 0, 0, 0).getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = targetDate - now;

  const dEl = document.getElementById('days');
  const hEl = document.getElementById('hours');
  const mEl = document.getElementById('minutes');
  const sEl = document.getElementById('seconds');

  // The time has arrived (or already passed): go to the next section
  if (distance <= 0) {
    if (dEl) dEl.innerText = '00';
    if (hEl) hEl.innerText = '00';
    if (mEl) mEl.innerText = '00';
    if (sEl) sEl.innerText = '00';

    clearInterval(countdownInterval);

    // Only move on if the user is still on the countdown screen
    const countdownSection = document.getElementById('sec-countdown');
    if (countdownSection && countdownSection.classList.contains('active')) {
      nextSection('sec-birthday');
    }
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  if (dEl) dEl.innerText = String(days).padStart(2, '0');
  if (hEl) hEl.innerText = String(hours).padStart(2, '0');
  if (mEl) mEl.innerText = String(minutes).padStart(2, '0');
  if (sEl) sEl.innerText = String(seconds).padStart(2, '0');
}

const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown(); // run immediately so there is no 1-second delay on load

// Audio Controller
const audio = document.getElementById('myAudio');
const button = document.getElementById('playButton');

if (button && audio) {
  button.addEventListener('click', function() {
    if (audio.paused) {
      audio.play();
      button.textContent = '❚❚';
    } else {
      audio.pause();
      button.textContent = '▶️';
    }
  });
}

// --- Picture Puzzle Game Logic (Using Image Cropping via CSS overflow) ---
const PUZZLE_IMAGE_URL = 'photos/game.jpg'; // Path to your image inside photos folder
const BOARD_SIZE = 3;
const TILE_SIZE = 100; // 300px board / 3 = 100px
let tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // Index 8 is empty slot
let currentTiles = [...tiles];

function initPuzzle() {
  const board = document.getElementById('puzzle-board');
  if (!board) return;

  do {
    currentTiles = [...tiles].sort(() => Math.random() - 0.5);
  } while (!isSolvable(currentTiles) || isSolved());

  renderBoard();
}

function renderBoard() {
  const board = document.getElementById('puzzle-board');
  board.innerHTML = '';

  currentTiles.forEach((tileIndex, position) => {
    const tile = document.createElement('div');
    tile.classList.add('puzzle-tile');

    // Ensure relative positioning for internal image clipping
    tile.style.position = 'relative';
    tile.style.overflow = 'hidden';

    if (tileIndex === 8) {
      tile.classList.add('empty');
    } else {
      const row = Math.floor(tileIndex / BOARD_SIZE);
      const col = tileIndex % BOARD_SIZE;

      // Create an image element inside the tile to guarantee it displays
      const img = document.createElement('img');
      img.src = PUZZLE_IMAGE_URL;
      img.style.position = 'absolute';
      img.style.width = '300px';
      img.style.height = '300px';
      img.style.left = '-' + (col * TILE_SIZE) + 'px';
      img.style.top = '-' + (row * TILE_SIZE) + 'px';
      img.style.pointerEvents = 'none'; // Click goes to tile wrapper

      tile.appendChild(img);
      tile.addEventListener('click', () => moveTile(position));
    }

    board.appendChild(tile);
  });
}

function moveTile(position) {
  const emptyPosition = currentTiles.indexOf(8);
  const row = Math.floor(position / BOARD_SIZE);
  const col = position % BOARD_SIZE;
  const emptyRow = Math.floor(emptyPosition / BOARD_SIZE);
  const emptyCol = emptyPosition % BOARD_SIZE;

  const isAdjacent = (Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1;

  if (isAdjacent) {
    [currentTiles[position], currentTiles[emptyPosition]] = [currentTiles[emptyPosition], currentTiles[position]];
    renderBoard();

    if (isSolved()) {
      const board = document.getElementById('puzzle-board');
      const emptyTile = board.children[currentTiles.indexOf(8)];
      if (emptyTile) {
        emptyTile.classList.remove('empty');
        emptyTile.style.position = 'relative';
        emptyTile.style.overflow = 'hidden';

        const img = document.createElement('img');
        img.src = PUZZLE_IMAGE_URL;
        img.style.position = 'absolute';
        img.style.width = '300px';
        img.style.height = '300px';
        img.style.left = '-' + (2 * TILE_SIZE) + 'px';
        img.style.top = '-' + (2 * TILE_SIZE) + 'px';
        emptyTile.appendChild(img);
      }
      const successDiv = document.getElementById('puzzle-success');
      if (successDiv) successDiv.classList.remove('hidden');
    }
  }
}

function isSolved() {
  return currentTiles.every((val, index) => val === index);
}

function isSolvable(arr) {
  let inversions = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] !== 8 && arr[j] !== 8 && arr[i] > arr[j]) {
        inversions++;
      }
    }
  }
  return inversions % 2 === 0;
}

window.addEventListener('DOMContentLoaded', initPuzzle);



function openModal(imageSrc, descriptionText) {
  const modal = document.getElementById('memoryModal');
  const modalImg = document.getElementById('modalImg');
  const modalDesc = document.getElementById('modalDesc');

  if (modal && modalImg && modalDesc) {
    modalImg.src = imageSrc;
    modalDesc.innerText = descriptionText;
    modal.classList.remove('hidden');
  }
}

function closeModal() {
  const modal = document.getElementById('memoryModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}


// Simple Toggle for Play / Pause
function toggleSimpleMusic() {
  const audio = document.getElementById('bg-music');
  const playBtn = document.getElementById('musicPlayBtn');

  if (audio.paused) {
    audio.play();
    playBtn.innerText = 'إيقاف المؤقت ⏸️';
  } else {
    audio.pause();
    playBtn.innerText = 'تشغيل الموسيقى 🎵';
  }
}



/* ===== Birthday section ===== */
document.addEventListener('DOMContentLoaded', function () {
  var sec = document.getElementById('sec-birthday');
  if (!sec) return;

  var sc = document.getElementById('bd-stars'), cc = document.getElementById('bd-conf');
  var sx = sc.getContext('2d'), cx = cc.getContext('2d');
  var W = 0, H = 0, stars = [], parts = [];
  var COLORS = ['#ff5c7a', '#ffd166', '#4cc9f0', '#7bd88f', '#b388ff', '#ff9f43'];

  function resize() {
    W = sc.width = cc.width = window.innerWidth;
    H = sc.height = cc.height = window.innerHeight;
    stars = [];
    for (var i = 0; i < 110; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + 0.6, p: Math.random() * 6.28, s: 0.6 + Math.random() * 1.6 });
  }
  window.addEventListener('resize', resize); resize();

  function spawn(n, spread) {
    for (var i = 0; i < n; i++) parts.push({
      x: Math.random() * W, y: -10 - Math.random() * (spread || 0),
      w: 6 + Math.random() * 6, h: 3 + Math.random() * 4,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      vy: 1.4 + Math.random() * 2.6, vx: (Math.random() - 0.5) * 1.4,
      a: Math.random() * 6.28, va: (Math.random() - 0.5) * 0.3, wb: Math.random() * 6.28
    });
  }
  function burst() { spawn(240, H * 0.5); }

  /* Happy Birthday, synthesized (20 seconds) */
  var BEAT = 20 / 24, DUR = 20, ctx = null, t0 = 0, state = 'idle';
  var SONG = [[67,.75],[67,.25],[69,1],[67,1],[72,1],[71,2],
    [67,.75],[67,.25],[69,1],[67,1],[74,1],[72,2],
    [67,.75],[67,.25],[79,1],[76,1],[72,1],[71,1],[69,1],
    [77,.75],[77,.25],[76,1],[72,1],[74,1],[72,2]];

  function schedule() {
    t0 = ctx.currentTime + 0.1;
    var t = t0;
    SONG.forEach(function (n) {
      var f = 440 * Math.pow(2, (n[0] - 69) / 12), d = n[1] * BEAT;
      [[f, 'triangle', 0.22], [f * 2, 'sine', 0.06]].forEach(function (v) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = v[1]; o.frequency.value = v[0];
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(v[2], t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d * 0.95);
        o.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t + d);
      });
      t += d;
    });
  }

  /* Player */
  var btn = document.getElementById('bd-play'), ic = document.getElementById('bd-ic');
  var fill = document.getElementById('bd-fill'), knob = document.getElementById('bd-knob'), cur = document.getElementById('bd-cur');
  var PLAY = 'M8 5v14l11-7z', PAUSE = 'M6 5h4v14H6zM14 5h4v14h-4z';
  function fmt(s) { s = Math.floor(s); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function setIcon(p) { ic.firstElementChild.setAttribute('d', p ? PAUSE : PLAY); }

  btn.addEventListener('click', function () {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (state === 'idle') {
      ctx.resume(); schedule(); state = 'play';
      sec.classList.add('bd-go');
      burst(); setIcon(true);
    } else if (state === 'play') {
      ctx.suspend(); state = 'pause'; setIcon(false);
    } else {
      ctx.resume(); state = 'play'; setIcon(true);
    }
  });

  function finish() {
    state = 'idle'; setIcon(false);
    fill.style.width = '100%'; knob.style.left = '100%'; cur.textContent = '0:20';
    burst();
    setTimeout(function () { document.getElementById('bd-card').scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 900);
  }
  document.getElementById('bd-card').addEventListener('click', burst);
  document.querySelector('#sec-birthday .bd-stage').addEventListener('click', burst);

  /* Main loop (only draws while the section is visible) */
  function frame(ms) {
    if (!sec.classList.contains('active')) {
      if (state === 'play') { ctx.suspend(); state = 'pause'; setIcon(false); }
      requestAnimationFrame(frame);
      return;
    }
    var t = ms / 1000;
    sx.fillStyle = '#07071f'; sx.fillRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      sx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.s + s.p));
      sx.fillStyle = '#fff'; sx.beginPath(); sx.arc(s.x, s.y, s.r, 0, 6.283); sx.fill();
    }
    sx.globalAlpha = 1;

    if (state === 'play' && Math.random() < 0.5) spawn(1);
    cx.clearRect(0, 0, W, H);
    for (var j = parts.length - 1; j >= 0; j--) {
      var p = parts[j];
      p.y += p.vy; p.wb += 0.05; p.x += p.vx + Math.sin(p.wb) * 0.8; p.a += p.va;
      if (p.y > H + 20) { parts.splice(j, 1); continue; }
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a);
      cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.restore();
    }

    if (state === 'play') {
      var pr = Math.max(0, Math.min(1, (ctx.currentTime - t0) / DUR));
      fill.style.width = pr * 100 + '%'; knob.style.left = pr * 100 + '%'; cur.textContent = fmt(pr * DUR);
      if (pr >= 1) finish();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
});



/* ===== Universe section (particle heart) ===== */
document.addEventListener('DOMContentLoaded', function () {
  var sec = document.getElementById('sec-universe');
  if (!sec) return;
  // ====== EDIT HERE ======
  var TITLE = 'ملكتي الزغيره ودلوعتي كوثر ♥';
  var PHRASES = ['احبك كوثر','ساتروني وعالمي انت','ابتسمي بسمتك تشجعني','اول مره اشوف عالمي من عيونك','يا اهلي وسندي','دايما بقلبي انت يا كوثر','لحظاتنا تشعل مشاعري','بحب تزتوزك','يا اجمل صدفة بحياتي','نورك يرشدني بعد نور الله','كل سنة وانت طيبه','20 سنة حتكون مليانه فرح باذن الله','اعشقك والعشق قليل بحقك','يدي بيدك وحنتخطي كل شي مع بعض'];
  var GLYPHS = ['🐱','🎀','💋','💐','💖','🐱','💋','💗','✨','🐱','💋','🎀'];
  // =======================
  var $ = function (id) { return document.getElementById(id); };
  var C = $('un-c'), g = C.getContext('2d'), music = $('universe-music');
  var W, H, DPR, F;
  if (document.fonts && document.fonts.load) document.fonts.load("700 20px 'Marhey'"); // make sure Marhey is ready for the canvas
  function rs() { DPR = Math.min(window.devicePixelRatio || 1, 2); W = window.innerWidth; H = window.innerHeight; C.width = W * DPR; C.height = H * DPR; g.setTransform(DPR, 0, 0, DPR, 0, 0); F = Math.min(W, H * .8) * 1.35; }
  window.addEventListener('resize', rs); rs();
  $('un-title').textContent = TITLE;
  var bk = $('un-bk');
  for (var i = 0; i < 14; i++) { var e = document.createElement('i'), s0 = 40 + Math.random() * 90; e.style.cssText = 'width:' + s0 + 'px;height:' + s0 + 'px;left:' + Math.random() * 100 + '%;top:' + Math.random() * 100 + '%;animation-delay:' + (-Math.random() * 14) + 's'; bk.appendChild(e); }
  var R = Math.random, cl = function (v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return Math.max(a, Math.min(b, v)); }, ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  var yaw = 0, pitch = .28, dist = 40, phase = 'intro', pt = 0, drag = false, lx = 0, ly = 0;
  function proj(x, y, z) {
    y -= 2.2; var c = Math.cos(yaw), s = Math.sin(yaw), x1 = x * c + z * s, z1 = -x * s + z * c;
    var cp = Math.cos(pitch), sp = Math.sin(pitch), y2 = y * cp + z1 * sp, z2 = -y * sp + z1 * cp + dist;
    if (z2 < .5) return null; var k = F / z2; return { x: W / 2 + x1 * k, y: H * .52 - y2 * k, k: k, z: z2 };
  }
  function mk(n, f) { var a = []; for (var q = 0; q < n; q++) a.push(f()); return a; }
  var stars = mk(650, function () { var r = 14 + R() * 40, a = R() * 6.283, b = Math.acos(2 * R() - 1); return { x: r * Math.sin(b) * Math.cos(a), y: r * Math.cos(b), z: r * Math.sin(b) * Math.sin(a), p: R() * 9 }; });
  var heart = mk(3200, function () { return { t: R() * 6.283, L: R() < .55 ? 1 : .7, d: R(), j: [R() - .5, R() - .5, R() - .5], p: R() * 9 }; });
  function hp(p, time) {
    var t = p.t, u = .17 * p.L * (1 + .035 * Math.sin(time * 2.4));
    return [16 * Math.pow(Math.sin(t), 3) * u + p.j[0] * .22, 3.7 + (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * u + p.j[1] * .22, p.j[2] * .5 * p.L];
  }
  var disk = mk(700, function () { return { r: .7 + R() * .9, a: R() * 6.283, s: .6 + R() }; });
  var dust = mk(1400, function () { return { r: 2 + R() * 10, a: R() * 6.283, s: .02 + R() * .08, y: R() * .25, p: R() * 9 }; });
  var items = [];
  PHRASES.forEach(function (t) { items.push({ t: t, r: 2.6 + R() * 7, a: R() * 6.283, s: .05 + R() * .08, y: .15 + R() * .5, sz: .7 + R() * .5, p: R() * 9 }); });
  GLYPHS.forEach(function (t) { items.push({ t: t, e: 1, r: 2.8 + R() * 7, a: R() * 6.283, s: .04 + R() * .07, y: .3, sz: 1.3 + R() * .8, p: R() * 9 }); });
  var warp = mk(320, function () { return { a: R() * 6.283, r: R() * .2, v: .3 + R() * 1.2, l: R() }; });

  // music: uses its own <audio id="universe-music"> song
  var muted = false;
  $('un-mb').onclick = function () {
    if (!music) return; muted = !muted;
    $('un-mb').textContent = muted ? '🔇' : '🔊';
    if (muted) music.pause(); else music.play().catch(function () {});
  };
  $('un-intro').addEventListener('pointerdown', function () {
    $('un-intro').classList.add('off'); phase = 'warp'; pt = 0; $('un-mus').classList.add('on');
    if (music) { music.loop = true; music.play().catch(function () {}); }
  });
  C.addEventListener('pointerdown', function (e) { drag = true; lx = e.clientX; ly = e.clientY; });
  window.addEventListener('pointerup', function () { drag = false; });
  window.addEventListener('pointermove', function (e) { if (!drag) return; yaw += (e.clientX - lx) * .006; pitch = cl(pitch + (e.clientY - ly) * .004, .03, 1.1); lx = e.clientX; ly = e.clientY; });
  C.addEventListener('wheel', function (e) { dist = cl(dist + e.deltaY * .01, 7, 24); }, { passive: true });

  var last = performance.now(), T = 0;
  function frame(now) {
    var dt = Math.min((now - last) / 1000, .05); last = now;
    if (!sec.classList.contains('active')) { requestAnimationFrame(frame); return; } // draw only while visible
    T += dt; pt += dt;
    g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
    if (phase === 'intro') { requestAnimationFrame(frame); return; }
    if (phase === 'warp') {
      var cx = W / 2, cy = H * .52, sp = pt < 1.4 ? 1 + pt * pt * 6 : Math.max(1, (2.2 - pt) * 8);
      g.lineCap = 'round';
      warp.forEach(function (w) {
        w.r += w.v * dt * sp * .7; if (w.r > 1.2) { w.r = .02; w.a = R() * 6.283; }
        var R0 = w.r * Math.max(W, H) * .6, R1 = R0 + (.03 + w.l * .12) * sp * Math.max(W, H) * .2 * w.r;
        g.strokeStyle = w.l > .5 ? 'rgba(255,255,255,' + (.3 + w.r * .6) + ')' : 'rgba(255,110,170,' + (.3 + w.r * .6) + ')'; g.lineWidth = .6 + w.r * 2;
        g.beginPath(); g.moveTo(cx + Math.cos(w.a) * R0, cy + Math.sin(w.a) * R0); g.lineTo(cx + Math.cos(w.a) * R1, cy + Math.sin(w.a) * R1); g.stroke();
      });
      if (pt > 2.2) { phase = 'scene'; pt = 0; setTimeout(function () { $('un-title').classList.add('on'); }, 1200); }
      requestAnimationFrame(frame); return;
    }
    if (!drag) yaw += dt * .12;
    dist = ease(cl(pt / 4)) * -28 + 42;
    var form = cl((pt - .4) / 3.2), fade = cl(pt / 2);
    g.globalAlpha = fade;
    stars.forEach(function (s) { var p = proj(s.x, s.y, s.z); if (!p) return; g.fillStyle = 'rgba(255,235,245,' + (.35 + .65 * Math.abs(Math.sin(T * 1.5 + s.p))) + ')'; g.fillRect(p.x, p.y, 1.4, 1.4); });
    dust.forEach(function (d) { d.a += d.s * dt / Math.sqrt(d.r) * 2; var p = proj(Math.cos(d.a) * d.r, d.y, Math.sin(d.a) * d.r); if (!p) return; g.fillStyle = 'rgba(255,' + (60 + (d.p * 10 | 0)) + ',110,' + (.25 + .5 * Math.abs(Math.sin(T * 2 + d.p))) + ')'; g.fillRect(p.x, p.y, 1 + p.k * .012, 1 + p.k * .012); });
    disk.forEach(function (d) { d.a += dt * d.s * 1.4 / d.r; var p = proj(Math.cos(d.a) * d.r, .05, Math.sin(d.a) * d.r); if (!p) return; g.fillStyle = d.r < 1.15 ? 'rgba(255,225,240,.55)' : 'rgba(255,90,170,.5)'; g.fillRect(p.x, p.y, 1.2 + p.k * .01, 1.2 + p.k * .01); });
    heart.forEach(function (h) {
      var f = ease(cl((form - h.d * .55) / .45)); if (f <= 0) return;
      var q = hp(h, T), p = proj(q[0] * f + Math.sin(T * 3 + h.p) * .03, .6 + (q[1] - .6) * f, q[2] * f); if (!p) return;
      var sz = .9 + p.k * .012;
      g.fillStyle = 'rgba(255,' + (110 + (h.p * 12 | 0)) + ',' + (170 + (h.p * 8 | 0)) + ',' + (.45 + .5 * Math.abs(Math.sin(T * 2 + h.p))) + ')'; g.fillRect(p.x, p.y, sz, sz);
    });
    var c0 = proj(0, 3.7, 0);
    if (c0) { var gr = g.createRadialGradient(c0.x, c0.y, 0, c0.x, c0.y, c0.k * 3.2); gr.addColorStop(0, 'rgba(255,60,150,.14)'); gr.addColorStop(1, 'rgba(255,60,150,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
    g.globalCompositeOperation = 'source-over'; g.textAlign = 'center'; g.textBaseline = 'middle';
    var list = [];
    items.forEach(function (it) { it.a += it.s * dt; var p = proj(Math.cos(it.a) * it.r, it.y + Math.sin(T * 1.3 + it.p) * .12, Math.sin(it.a) * it.r); if (p) list.push([it, p]); });
    list.sort(function (a, b) { return b[1].z - a[1].z; });
    list.forEach(function (o) {
      var it = o[0], p = o[1], al = cl(1.15 - (p.z - 6) / 22) * cl((pt - 1) / 2) * fade; if (al <= 0) return; g.globalAlpha = al;
      if (it.e) { g.font = (p.k * .55 * it.sz) + 'px serif'; g.fillText(it.t, p.x, p.y); }
      else { g.font = '700 ' + Math.max(9, p.k * .34 * it.sz) + "px 'Marhey',cursive"; g.shadowColor = '#ff3fa4'; g.shadowBlur = 8; g.fillStyle = '#fff'; g.fillText(it.t, p.x, p.y); g.shadowBlur = 0; }
    });
    g.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
});
