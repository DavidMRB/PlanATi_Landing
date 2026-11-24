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
  cafe: {
    address: 'Barrio Caobos, Cúcuta',
    location: 'Cafetería de barrio en el sector de Caobos.',
    description: 'Una cafetería de barrio para conversar sin afán, probar café de origen y acompañarlo con repostería. Las mesas junto a la ventana son ideales para leer o ponerse al día con alguien.',
    hours: [['Lunes a jueves', '08:00–19:00'], ['Viernes y sábado', '08:00–20:00'], ['Domingo', '09:00–17:00']],
    menu: [
      ['Latte de la casa', 'Espresso con leche y notas de cacao.', 11000],
      ['Rollo de canela', 'Masa suave con glaseado ligero.', 8500],
      ['Tostada de aguacate', 'Pan artesanal con tomate y limón.', 18500],
    ],
    reviews: [
      ['Andrea M.', 5, 'El café y el rollo de canela hicieron una buena pausa de media tarde.'],
      ['Camilo R.', 4, 'Me gustó sentarme junto a la ventana. Volvería por otro latte.'],
    ],
  },
  brunch: {
    address: 'Taller en el sector Caobos, Cúcuta',
    location: 'Taller creativo con mesas de trabajo en el sector de Caobos.',
    description: 'Una mesa de brunch y un taller de pintura en cerámica en el mismo plan. Puedes elegir una pieza, decorarla con ayuda del taller y tomar algo mientras trabajas. La actividad está pensada para principiantes.',
    hours: [['Lunes a viernes', 'Cerrado'], ['Sábado', '10:00–14:00'], ['Domingo', '10:00–13:00']],
    menu: [
      ['Brunch del taller', 'Arepa, huevos y una bebida caliente.', 24000],
      ['Cuenco para pintar', 'Pieza de cerámica con pinceles y pintura.', 32000],
      ['Brunch y cerámica', 'Brunch y materiales para una pieza.', 49000],
    ],
    reviews: [
      ['Laura P.', 5, 'Era mi primera vez pintando cerámica y pude terminar mi cuenco.'],
      ['Mateo V.', 5, 'El brunch estuvo rico y había tiempo suficiente para pintar con calma.'],
    ],
  },
  noche: {
    address: 'Sector Ventura Plaza, Cúcuta',
    location: 'Terraza de ejemplo en el sector de Ventura Plaza.',
    description: 'Una terraza para compartir tapas y ver cómo se encienden las luces de la ciudad. La carta incluye cócteles frutales y alternativas sin alcohol para disfrutar al atardecer.',
    hours: [['Lunes y martes', 'Cerrado'], ['Miércoles y jueves', '17:00–23:00'], ['Viernes y sábado', '17:00–01:00'], ['Domingo', '16:00–22:00']],
    menu: [
      ['Maracuyá al atardecer', 'Cóctel cítrico con hierbabuena.', 26000],
      ['Frutos rojos sin alcohol', 'Soda de frutos rojos y limón.', 16000],
      ['Tabla de tapas', 'Bocados salados para compartir.', 35000],
    ],
    reviews: [
      ['Juliana S.', 5, 'Llegamos al atardecer y las tapas alcanzaron para compartir.'],
      ['Nicolás T.', 4, 'Buena vista desde la terraza. Me gustó encontrar bebidas sin alcohol.'],
    ],
  },
};
const planDialog = document.querySelector('#plan-dialog');

function setupPlaceDemo() {
  const image = planDialog.querySelector('#plan-dialog-image');
  const title = planDialog.querySelector('#plan-dialog-title');
  const category = planDialog.querySelector('#plan-dialog-category');
  const description = planDialog.querySelector('#plan-dialog-description');
  const address = planDialog.querySelector('#plan-address');
  const location = planDialog.querySelector('#plan-location-note');
  const ratingButton = planDialog.querySelector('.place-rating');
  const rating = planDialog.querySelector('#plan-rating');
  const reviewCount = planDialog.querySelector('#plan-review-count');
  const hours = planDialog.querySelector('#plan-hours');
  const menu = planDialog.querySelector('#plan-menu');
  const reviews = planDialog.querySelector('#plan-review-list');
  const favorite = planDialog.querySelector('#plan-favorite');
  const hourTemplate = document.querySelector('#plan-hours-row');
  const menuTemplate = document.querySelector('#plan-menu-item');
  const reviewTemplate = document.querySelector('#plan-review-item');
  const priceFormat = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  const ratingFormat = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const favoritesKey = 'planati-demo-favorites';
  const favorites = new Set();
  let activePlan;

  try {
    const saved = JSON.parse(window.localStorage.getItem(favoritesKey));
    if (Array.isArray(saved)) {
      Object.keys(planDetails).filter((plan) => saved.includes(plan)).forEach((plan) => favorites.add(plan));
    }
  } catch {
    // Some browsers block access to storage when the HTML is opened from disk.
  }

  function syncFavorite() {
    favorite.setAttribute('aria-pressed', String(favorites.has(activePlan)));
  }

  favorite.addEventListener('click', () => {
    if (favorites.has(activePlan)) favorites.delete(activePlan);
    else favorites.add(activePlan);
    syncFavorite();
    try {
      window.localStorage.setItem(favoritesKey, JSON.stringify([...favorites]));
    } catch {
      // The selection stays available until this page is closed.
    }
  });

  planDialog.querySelectorAll('[data-place-jump]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.placeJump);
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'start' });
    });
  });

  cards.forEach((card) => {
    const button = card.querySelector('.plan-link');
    const photo = card.querySelector('img');
    const tag = card.querySelector('.plan-tag');
    button.hidden = false;
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'plan-dialog');
    button.addEventListener('click', () => {
      activePlan = card.dataset.plan;
      const detail = planDetails[activePlan];

      image.src = photo.currentSrc || photo.src;
      image.alt = photo.alt;
      title.textContent = card.querySelector('h3').textContent;
      category.className = tag.className;
      category.textContent = tag.textContent.trim();
      description.textContent = detail.description;
      address.textContent = detail.address;
      location.textContent = detail.location;
      rating.textContent = ratingFormat.format(detail.reviews.reduce((total, [, score]) => total + score, 0) / detail.reviews.length);
      reviewCount.textContent = `${detail.reviews.length} reseñas`;
      ratingButton.setAttribute('aria-label', `Ver ${reviewCount.textContent} de ejemplo. Calificación de ${rating.textContent} sobre 5.`);

      hours.replaceChildren(...detail.hours.map(([day, time]) => {
        const row = hourTemplate.content.firstElementChild.cloneNode(true);
        row.querySelector('dt').textContent = day;
        row.querySelector('dd').textContent = time;
        return row;
      }));

      menu.replaceChildren(...detail.menu.map(([name, summary, price]) => {
        const item = menuTemplate.content.firstElementChild.cloneNode(true);
        item.querySelector('h4').textContent = name;
        item.querySelector('p').textContent = summary;
        item.querySelector('strong').textContent = priceFormat.format(price);
        return item;
      }));

      reviews.replaceChildren(...detail.reviews.map(([author, score, comment]) => {
        const item = reviewTemplate.content.firstElementChild.cloneNode(true);
        item.querySelector('strong').textContent = author;
        item.querySelector('span').textContent = `${score}/5`;
        item.querySelector('p').textContent = comment;
        return item;
      }));

      syncFavorite();
      planDialog.showModal();
      planDialog.scrollTop = 0;
    });
  });
}

setupPlaceDemo();

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
