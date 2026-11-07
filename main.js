// Comparison sliders. Each .cmp holds its looks as plain <img>s (they simply stack if this script does not run).
// data-pairs lists which looks can be compared, "0-2,1-2": left-right indexes; the first pair is shown at the start.
// The real range input carries keyboard and screen-reader use; pointer events drive it for mouse and touch.
for (const fig of document.querySelectorAll('.cmp')) {
  const imgs = [...fig.querySelectorAll('img')];
  const names = imgs.map(img => img.dataset.label);
  const pairs = fig.dataset.pairs.split(',').map(p => p.split('-').map(Number));

  const stage = document.createElement('div');
  stage.className = 'stage';
  stage.append(...imgs);

  const handle = document.createElement('div');
  handle.className = 'handle';

  const range = document.createElement('input');
  range.type = 'range';
  range.min = 0;
  range.max = 100;
  range.value = 50;
  stage.append(handle, range);

  const bar = document.createElement('div');
  bar.className = 'bar';
  const leftName = document.createElement('span');
  const rightName = document.createElement('span');
  leftName.className = 'side';
  rightName.className = 'side right';
  const picker = document.createElement('div');
  picker.className = 'picker';
  picker.setAttribute('role', 'group');
  picker.setAttribute('aria-label', 'Choose the looks to compare');
  bar.append(leftName, picker, rightName);
  fig.prepend(bar, stage);

  let left = 0, right = 0;

  const setPos = v => {
    range.value = v;
    stage.style.setProperty('--pos', v + '%');
    range.setAttribute('aria-valuetext', `${Math.round(v)}% ${names[left]}, ${100 - Math.round(v)}% ${names[right]}`);
  };

  const show = pair => {
    [left, right] = pair;
    imgs.forEach((img, i) => { img.className = i === left ? 'left' : i === right ? 'right' : ''; });
    leftName.textContent = names[left];
    rightName.textContent = names[right];
    range.setAttribute('aria-label', `Compare ${names[left]} and ${names[right]}`);
    setPos(+range.value);
    for (const b of picker.children) b.setAttribute('aria-pressed', b.pair === pair);
  };

  if (pairs.length > 1) {
    const shared = pairs.every(p => p[0] === pairs[0][0]); // one fixed look: name only the other
    for (const pair of pairs) {
      const b = document.createElement('button');
      b.type = 'button';
      b.pair = pair;
      b.textContent = shared ? names[pair[1]] : `${names[pair[0]]} / ${names[pair[1]]}`;
      b.addEventListener('click', () => show(pair));
      picker.append(b);
    }
  }

  const fromPointer = e => {
    const box = stage.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, (e.clientX - box.left) / box.width * 100)));
  };
  stage.addEventListener('pointerdown', e => {
    stage.setPointerCapture(e.pointerId);
    stage.classList.add('held');
    fromPointer(e);
  });
  stage.addEventListener('pointermove', e => { if (stage.classList.contains('held')) fromPointer(e); });
  for (const end of ['pointerup', 'pointercancel']) {
    stage.addEventListener(end, () => stage.classList.remove('held'));
  }
  range.addEventListener('input', () => setPos(+range.value));

  fig.classList.add('ready');
  show(pairs[0]);
}

// Thumbnails enlarge over the page. Only the picture itself keeps it open: the X or a click anywhere else closes it.
// Esc and returning focus to the thumbnail come with <dialog>; without this script the links still open the image.
const box = document.createElement('dialog');
box.className = 'box';
box.innerHTML = '<button type="button" aria-label="Close">&times;</button><img alt=""><p></p>';
document.body.append(box);
const big = box.querySelector('img');
box.addEventListener('click', e => { if (e.target !== big) box.close(); });
for (const link of document.querySelectorAll('.grid a')) {
  link.addEventListener('click', e => {
    e.preventDefault();
    big.src = link.href;
    big.alt = link.querySelector('img').alt;
    box.querySelector('p').textContent = link.closest('figure').querySelector('figcaption').textContent;
    box.showModal();
  });
}

// The heat haze clips wait for a click from anyone who asks for less motion.
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  for (const v of document.querySelectorAll('video[autoplay]')) {
    v.removeAttribute('autoplay');
    v.pause();
    v.controls = true;
  }
}
