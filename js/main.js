/* ===========================================================
   Para mi Ague — interacciones
   =========================================================== */
(function () {
  'use strict';

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- fecha ---------- */
  (function fecha() {
    const el = $('#fecha');
    if (!el) return;
    const d = new Date();
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio',
                   'agosto','septiembre','octubre','noviembre','diciembre'];
    el.textContent = 'Bogotá, ' + d.getDate() + ' de ' + meses[d.getMonth()] + ' de ' + d.getFullYear();
  })();

  /* ---------- abrir el sobre y desdoblar la hoja ---------- */
  const unfold = $('#unfold');

  function paso(ms, fn) { setTimeout(fn, reduce ? Math.min(ms, 120) : ms); }

  function abrirCarta() {
    if (document.body.classList.contains('is-opening')) return;
    document.body.classList.add('is-opening');   // se cae el sello, se abre la solapa
    corazones(24);

    paso(620,  () => unfold.classList.add('sale'));   // la hoja sale del sobre
    paso(1340, () => unfold.classList.add('abre1'));  // se desdobla el pliegue de abajo
    paso(1820, () => { unfold.classList.add('abre2'); corazones(16); }); // el de arriba
    paso(2680, () => unfold.classList.add('entra'));  // la hoja se abre hacia la carta

    paso(3000, () => {
      document.body.classList.remove('is-sealed');
      document.body.classList.add('is-open');
      $('#carta').setAttribute('aria-hidden', 'false');
      window.scrollTo(0, 0);
      chequearReveal();
    });
    paso(4200, () => { unfold.style.display = 'none'; });
  }

  $('#btnAbrir').addEventListener('click', abrirCarta);
  $('#envelope').addEventListener('click', abrirCarta);
  $('#envelope').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirCarta(); }
  });

  /* ---------- reveal al hacer scroll ---------- */
  const revelables = () => $$('.reveal:not(.visible), .leccion:not(.visible), .polaroid:not(.visible)');

  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const hermanos = Array.from(el.parentElement.children).indexOf(el);
          el.style.transitionDelay = Math.min(hermanos * 55, 420) + 'ms';
          el.classList.add('visible');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  }

  function chequearReveal() {
    if (io) { revelables().forEach(el => io.observe(el)); }
    else    { revelables().forEach(el => el.classList.add('visible')); }
  }
  chequearReveal();

  /* ---------- barra de progreso ---------- */
  const barra = $('#progressBar');
  window.addEventListener('scroll', () => {
    const alto = document.documentElement.scrollHeight - window.innerHeight;
    const pct = alto > 0 ? (window.scrollY / alto) * 100 : 0;
    barra.style.width = pct.toFixed(2) + '%';
  }, { passive: true });

  /* ---------- lecciones ---------- */
  const lecciones = $$('.leccion');
  const contador = $('#contadorLecciones');
  const abiertas = new Set();

  lecciones.forEach((card, i) => {
    card.addEventListener('click', () => {
      card.classList.toggle('abierta');
      if (card.classList.contains('abierta')) {
        abiertas.add(i);
        corazones(3, card);
      } else {
        abiertas.delete(i);
      }
      contador.textContent = abiertas.size;
      if (abiertas.size === lecciones.length) {
        contador.parentElement.innerHTML = 'las once. y todavía me faltan por escribir.';
        corazones(20);
      }
    });
  });

  /* ---------- galería ---------- */
  const galeria = $('#galeria');
  const fotos = (window.FOTOS && window.FOTOS.length) ? window.FOTOS : [];

  if (fotos.length) {
    fotos.forEach((foto, i) => {
      const fig = document.createElement('figure');
      fig.className = 'polaroid reveal';
      fig.setAttribute('role', 'button');
      fig.setAttribute('tabindex', '0');
      fig.dataset.index = i;

      const img = document.createElement('img');
      img.src = foto.src;
      img.alt = foto.pie || 'Nosotras';
      img.loading = 'lazy';

      const cap = document.createElement('figcaption');
      cap.textContent = foto.pie || '';

      fig.appendChild(img);
      fig.appendChild(cap);
      galeria.appendChild(fig);

      fig.addEventListener('click', () => abrirLightbox(i));
      fig.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirLightbox(i); }
      });
    });
  } else {
    const vacia = document.createElement('figure');
    vacia.className = 'polaroid polaroid--vacia reveal';
    vacia.innerHTML = '<span>Aquí van nuestras fotos.<br><br>Suelta las imágenes en la carpeta<br><b>fotos-originales/</b><br>y corre <b>./fotos.sh</b></span>';
    galeria.appendChild(vacia);
  }

  /* ---------- lightbox ---------- */
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let actual = 0;

  function abrirLightbox(i) {
    actual = i;
    pintarLightbox();
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function pintarLightbox() {
    const f = fotos[actual];
    if (!f) return;
    lbImg.src = f.src;
    lbImg.alt = f.pie || '';
    lbCap.textContent = f.pie || '';
  }
  function cerrarLightbox() {
    lb.hidden = true;
    document.body.style.overflow = '';
  }
  function mover(paso) {
    if (!fotos.length) return;
    actual = (actual + paso + fotos.length) % fotos.length;
    pintarLightbox();
  }

  $('#lbCerrar').addEventListener('click', cerrarLightbox);
  $('#lbPrev').addEventListener('click', () => mover(-1));
  $('#lbNext').addEventListener('click', () => mover(1));
  lb.addEventListener('click', e => { if (e.target === lb) cerrarLightbox(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') cerrarLightbox();
    if (e.key === 'ArrowLeft') mover(-1);
    if (e.key === 'ArrowRight') mover(1);
  });

  /* ---------- velitas ---------- */
  const TOTAL_VELAS = 7;
  const contVelas = $('#velas');
  let apagadas = 0;

  for (let i = 0; i < TOTAL_VELAS; i++) {
    const v = document.createElement('button');
    v.className = 'vela';
    v.setAttribute('aria-label', 'Apagar velita ' + (i + 1));
    v.innerHTML = '<span class="vela__llama"></span>';
    v.addEventListener('click', () => apagar(v));
    v.addEventListener('mouseenter', () => { if (!reduce) apagar(v); });
    contVelas.appendChild(v);
  }

  function apagar(v) {
    if (v.classList.contains('apagada')) return;
    v.classList.add('apagada');
    apagadas++;
    if (apagadas === TOTAL_VELAS) {
      $('#pastelHint').style.opacity = '0';
      const deseo = $('#deseo');
      deseo.hidden = false;
      corazones(70);
      setTimeout(() => corazones(50), 700);
    }
  }

  /* ---------- música ---------- */
  const audio = $('#audio'), btnMus = $('#btnMusica');
  btnMus.addEventListener('click', () => {
    if (audio.paused) {
      audio.volume = 0.45;
      audio.play().then(() => btnMus.classList.add('sonando'))
                  .catch(() => btnMus.title = 'Falta el archivo audio/cancion.mp3');
    } else {
      audio.pause();
      btnMus.classList.remove('sonando');
    }
  });

  /* ---------- corazones / pétalos ---------- */
  const canvas = $('#petals'), ctx = canvas.getContext('2d');
  let particulas = [];
  const COLORES = ['#C0768C', '#DFC08A', '#B98B47', '#EBD3D8', '#D2879C'];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function corazones(n, desde) {
    if (reduce) return;
    let x0 = canvas.width / 2, y0 = canvas.height * 0.62;
    if (desde) {
      const r = desde.getBoundingClientRect();
      x0 = r.left + r.width / 2;
      y0 = r.top + r.height / 2;
    }
    for (let i = 0; i < n; i++) {
      particulas.push({
        x: x0 + (Math.random() - 0.5) * 120,
        y: y0 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 3.4,
        vy: -Math.random() * 4.4 - 1.6,
        g: 0.045 + Math.random() * 0.03,
        s: 5 + Math.random() * 8,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.1,
        vida: 1,
        color: COLORES[(Math.random() * COLORES.length) | 0]
      });
    }
    if (!corriendo) { corriendo = true; requestAnimationFrame(loop); }
  }

  function dibujarCorazon(c, x, y, s, rot, color, alpha) {
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.globalAlpha = Math.max(0, alpha);
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(0, s * 0.3);
    c.bezierCurveTo(0, 0, -s, 0, -s, s * 0.45);
    c.bezierCurveTo(-s, s * 0.95, 0, s * 1.25, 0, s * 1.6);
    c.bezierCurveTo(0, s * 1.25, s, s * 0.95, s, s * 0.45);
    c.bezierCurveTo(s, 0, 0, 0, 0, s * 0.3);
    c.closePath();
    c.fill();
    c.restore();
  }

  let corriendo = false;
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particulas = particulas.filter(p => p.vida > 0 && p.y < canvas.height + 80);
    particulas.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.g;
      p.vx *= 0.995;
      p.rot += p.vrot;
      p.vida -= 0.0055;
      dibujarCorazon(ctx, p.x, p.y, p.s, p.rot, p.color, p.vida);
    });
    if (particulas.length) requestAnimationFrame(loop);
    else { corriendo = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  $('#btnRelanzar').addEventListener('click', () => corazones(90));

})();
