const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');

function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  menuToggle.querySelector('use').setAttribute('href', open ? '#icon-close' : '#icon-menu');
}

document.documentElement.classList.add('js');
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuToggle.focus();
  }
});

const filters = document.querySelector('.filters');
const filterButtons = [...filters.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('.plan-card')];
const demoStatus = document.querySelector('#demo-status');

filters.hidden = false;
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filterButtons.forEach((filter) => filter.setAttribute('aria-pressed', String(filter === button)));
    cards.forEach((card) => {
      card.hidden = category !== 'todos' && card.dataset.category !== category;
    });
    const count = cards.filter((card) => !card.hidden).length;
    demoStatus.textContent = count === 1 ? '1 plan de ejemplo del prototipo.' : `${count} planes de ejemplo del prototipo.`;
  });
});

const planDetails = {
  cafe: 'En una ficha como esta podrías consultar la ubicación, el menú y los horarios de la cafetería.',
  brunch: 'Una ficha de actividad incluiría los datos del lugar y la información necesaria para planear la visita.',
  noche: 'La ficha te permitiría revisar dónde queda el bar, su horario y el menú antes de salir.',
};
const planDialog = document.querySelector('#plan-dialog');
const planImage = document.querySelector('#plan-dialog-image');
const planTitle = document.querySelector('#plan-dialog-title');
const planCategory = document.querySelector('#plan-dialog-category');
const planDescription = document.querySelector('#plan-dialog-description');
const planInfo = document.querySelector('#plan-dialog-info');

cards.forEach((card) => {
  const button = card.querySelector('.plan-link');
  const image = card.querySelector('img');
  button.hidden = false;
  button.addEventListener('click', () => {
    planImage.src = image.src;
    planImage.alt = image.alt;
    planTitle.textContent = card.querySelector('h3').textContent;
    planCategory.textContent = card.querySelector('.plan-tag').textContent.trim();
    planDescription.textContent = card.querySelector('.plan-content p').textContent;
    planInfo.textContent = planDetails[card.dataset.plan];
    planDialog.showModal();
  });
});

function setupParallax() {
  const world = document.querySelector('.journey-world');
  const header = document.querySelector('.site-header');
  const journey = document.querySelector('.journey');
  const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
  const scenes = [...journey.querySelectorAll('[data-scene]')].map((element) => ({
    element,
    layers: [...element.querySelectorAll('[data-depth]')].map((layer) => ({
      element: layer,
      depth: Number(layer.dataset.depth),
      drift: Number(layer.dataset.drift || 0),
    })),
  }));
  let frame = 0;

  function render() {
    frame = 0;
    if (!motion.matches) return;

    const height = window.innerHeight;
    const middle = height * 0.5;
    const scroll = Math.max(0, window.scrollY);
    const scrollRange = Math.max(1, document.documentElement.scrollHeight - height);
    const progress = Math.min(scroll / scrollRange, 1);
    const distance = Math.min(height, 960) * (window.innerWidth <= 768 ? 0.38 : 1);
    const bounds = scenes.map(({ element }) => element.getBoundingClientRect());

    world.style.setProperty('--world-progress', String(progress));
    header.style.setProperty('--page-progress', String(progress));
    // Keep the hero at its composed position before the first scroll.
    for (const [index, { layers }] of scenes.entries()) {
      const box = bounds[index];
      if (box.bottom < -height * 0.35 || box.top > height * 1.35) continue;

      const offset = index === 0 ? scroll / height : (middle - box.top - box.height * 0.5) / height;
      const shift = Math.max(-0.85, Math.min(0.85, offset)) * distance;

      for (const layer of layers) {
        layer.element.style.setProperty('--depth-x', `${(shift * layer.drift).toFixed(2)}px`);
        layer.element.style.setProperty('--depth-y', `${(shift * layer.depth).toFixed(2)}px`);
      }
    }
  }

  function requestRender() {
    if (motion.matches && !frame) frame = window.requestAnimationFrame(render);
  }

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender);
  window.addEventListener('pageshow', requestRender);
  motion.addEventListener('change', requestRender);
  new ResizeObserver(requestRender).observe(journey);
  requestRender();
}

setupParallax();

const videoDialog = document.querySelector('#video-dialog');
const video = videoDialog.querySelector('video');

document.querySelectorAll('[data-video-link]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    videoDialog.showModal();
    video.play().catch(() => {});
  });
});

videoDialog.addEventListener('close', () => video.pause());

for (const dialog of [planDialog, videoDialog]) {
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    const inside = event.clientX >= bounds.left && event.clientX <= bounds.right
      && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    if (!inside) dialog.close();
  });
}
