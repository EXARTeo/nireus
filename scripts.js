document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav');
  const btn = document.querySelector('.mobile-toggle');
  if (nav && btn) {
    btn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }
});

/* ===== Booking logic (boats) ===== */

// Demo στόλος — άλλαξέ τον όταν έχεις πραγματικά ονόματα/χωρητικότητες
const BOATS = [
  // Boat Rental (<=30hp, χωρίς δίπλωμα)
  { id:"b1", name:"Boat_TEST1", type:"Boat Rental", capacity:4, notes:"30hp, σκίαστρο, ψυγείο" },
  { id:"b2", name:"Boat_TEST2", type:"Boat Rental", capacity:5, notes:"30hp, σκάλα θαλάσσης" },
  { id:"b3", name:"Boat_TEST3", type:"Boat Rental", capacity:6, notes:"30hp, οικογενειακό" },

  // Speed Boat (άδεια απαιτείται)
  { id:"s1", name:"Boat_TEST4", type:"Speed Boat Rentals (License Required)", capacity:6, notes:"60hp" },
  { id:"s2", name:"Boat_TEST5", type:"Speed Boat Rentals (License Required)", capacity:7, notes:"90hp" },

  // Private Cruise (με skipper)
  { id:"p1", name:"Boat_TEST6", type:"Private Cruise with Skipper", capacity:7, notes:"RIB 150hp με skipper" }
];

// Elements (υπάρχουν μόνο στη σελίδα boats)
const bookingForm = document.getElementById('bookingForm');
if (bookingForm){
  const svcRadios = Array.from(document.querySelectorAll('input[name="service"]'));
  const serviceHint = document.getElementById('serviceHint');
  const dateEl = document.getElementById('date');
  const timeEl = document.getElementById('time');
  const peopleEl = document.getElementById('people');
  const peopleHint = document.getElementById('peopleHint');
  const boatEl = document.getElementById('boat');
  const msgEl = document.getElementById('msg');
  const availEl = document.getElementById('availabilityNote');
  const whatsBtn = document.getElementById('whatsBtn');

  // Min date = σήμερα (τοπική ζώνη)
  (function setMinDate(){
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const today = new Date(Date.now() - tzOffset).toISOString().split('T')[0];
    dateEl.min = today;
  })();

  const svcText = {
    "Boat Rental": "Έως 30hp, χωρίς δίπλωμα.",
    "Speed Boat Rentals (License Required)": "Ισχυρότερα σκάφη, απαιτείται άδεια χειριστή.",
    "Private Cruise with Skipper": "Ιδιωτική κρουαζιέρα με έμπειρο skipper."
  };

  function currentService(){
    const s = svcRadios.find(r=>r.checked);
    return s ? s.value : "Boat Rental";
  }
  function boatsFor(service){ return BOATS.filter(b => b.type === service); }
  function filterByPeople(list, people){ return list.filter(b => b.capacity >= people); }

  function renderBoatOptions(list){
    boatEl.innerHTML = "";
    if(list.length === 0){
      const opt = document.createElement('option');
      opt.textContent = "— Δεν υπάρχουν διαθέσιμα σκάφη για αυτόν τον αριθμό —";
      opt.disabled = true; opt.selected = true;
      boatEl.appendChild(opt);
      return;
    }
    for(const b of list){
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = `${b.name} • έως ${b.capacity} άτομα`;
      opt.dataset.capacity = String(b.capacity);
      boatEl.appendChild(opt);
    }
  }

  function updateAvailabilityNote(list, people){
    if(list.length === 0){
      availEl.className = "availability bad";
      availEl.textContent = "Δεν βρέθηκε σκάφος που να επιτρέπει αυτόν τον αριθμό ατόμων για την επιλεγμένη υπηρεσία.";
    }else if(list.length <= 1){
      availEl.className = "availability warn";
      availEl.textContent = "Προσοχή: περιορισμένη διαθεσιμότητα για αυτό το πλήθος ατόμων.";
    }else{
      availEl.className = "availability ok";
      availEl.textContent = `Διαθέσιμες επιλογές: ${list.length} σκάφη για ${people} άτομ${people === 1 ? "ο" : "α"}.`;
    }
  }

  function refreshBoatList(){
    const svc = currentService();
    serviceHint.textContent = svcText[svc] || "";
    const people = Math.max(1, parseInt(peopleEl.value || "1", 10));
    const listAll = boatsFor(svc);
    const list = filterByPeople(listAll, people);
    renderBoatOptions(list);
    updateAvailabilityNote(list, people);
    const maxCap = Math.max(...listAll.map(b=>b.capacity));
    peopleEl.max = String(maxCap);
    peopleHint.textContent = `(μέχρι ${maxCap})`;
  }

  function onBoatChange(){
    const selected = BOATS.find(b => b.id === boatEl.value);
    if(!selected) return;
    const cap = selected.capacity;
    let ppl = parseInt(peopleEl.value || "1", 10);
    if(ppl > cap){ peopleEl.value = cap; }
    peopleEl.max = String(cap);
    peopleHint.textContent = `(μέχρι ${cap})`;
  }

  function openWhatsApp(){
    if(!dateEl.value || !timeEl.value || !boatEl.value){
      availEl.className = "availability bad";
      availEl.textContent = "Συμπληρώστε ημερομηνία, ώρα και επιλέξτε σκάφος.";
      return;
    }
    const svc = currentService();
    const boat = BOATS.find(b => b.id === boatEl.value);
    const txt =
`Ζήτηση Διαθεσιμότητας — Nireus
Υπηρεσία: ${svc}
Σκάφος: ${boat ? boat.name : "-"}
Ημερομηνία: ${dateEl.value}
Ώρα αναχώρησης: ${timeEl.value}
Άτομα: ${peopleEl.value}
Μήνυμα: ${msgEl.value || "-"}
`;
    const phone = "306900000000"; // Βάλε πραγματικό νούμερο (χωρίς +)
    const encoded = encodeURIComponent(txt);
    const url = `https://wa.me/${phone}?text=${encoded}`;
    window.open(url, "_blank");
  }

  // Events
  svcRadios.forEach(r => r.addEventListener('change', refreshBoatList));
  peopleEl.addEventListener('input', refreshBoatList);
  boatEl.addEventListener('change', onBoatChange);
  document.getElementById('whatsBtn').addEventListener('click', openWhatsApp);

  // Init
  refreshBoatList();

  // Προαιρετικό: προ-επιλογή service από query string (?service=speed|boat|cruise)
  const params = new URLSearchParams(location.search);
  const svcParam = params.get('service');
  if(svcParam){
    const map = { speed: 'svc-speed', boat: 'svc-boat', cruise: 'svc-cruise' };
    const id = map[svcParam.toLowerCase()];
    if(id){
      const el = document.getElementById(id);
      if(el){ el.checked = true; refreshBoatList(); }
    }
  }
}





/* ================================================ */

(function initServicesCarouselArrows(){
  const mq = window.matchMedia('(max-width: 560px)');
  const track = document.querySelector('#services .cards');
  const prevBtn = document.getElementById('srvPrev');
  const nextBtn = document.getElementById('srvNext');
  if (!track || !prevBtn || !nextBtn) return;

  function metrics(){
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap || '12');
    const padL = parseFloat(style.paddingLeft || '0');
    const card = track.querySelector('.card');
    const cardW = card ? card.getBoundingClientRect().width : Math.floor(track.clientWidth * 0.85);
    const step = cardW + gap;
    return { gap, padL, cardW, step };
  }

  function indexNow(){
    const { padL, step } = metrics();
    return Math.round((track.scrollLeft - padL) / step);
  }

  function atStart(){
    return track.scrollLeft <= 2;
  }
  function atEnd(){
    const max = track.scrollWidth - track.clientWidth - 2;
    return track.scrollLeft >= max;
  }

  function updateButtons(){
    const mobile = mq.matches;
    prevBtn.style.display = mobile ? '' : 'none';
    nextBtn.style.display = mobile ? '' : 'none';
    if (!mobile) return;
    prevBtn.disabled = atStart();
    nextBtn.disabled = atEnd();
  }

  function scrollToIndex(i){
    const { padL, step } = metrics();
    const x = padL + i * step;
    track.scrollTo({ left: x, behavior: 'smooth' });
  }

  function scrollByStep(dir){
    const i = indexNow() + dir;
    scrollToIndex(i);
  }

  prevBtn.addEventListener('click', () => scrollByStep(-1));
  nextBtn.addEventListener('click', () => scrollByStep(1));
  track.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);
  (mq.addEventListener ? mq : mq.addListener).addEventListener?.('change', updateButtons) || mq.addListener(updateButtons);

  updateButtons();
})();


// ===== Fleet toggle (SPEEDBOATS / LICENCE-FREE) =====
document.addEventListener('DOMContentLoaded', () => {
  const toggle      = document.getElementById('fleetToggle');
  const speedPanel  = document.getElementById('panel-speed');
  const licfreePanel= document.getElementById('panel-licfree');
  const fleetToggle = document.getElementById('fleet-toggle');
  const optionLeft  = fleetToggle?.querySelector('.option-left');
  const optionRight = fleetToggle?.querySelector('.option-right');

  if (!toggle || !speedPanel || !licfreePanel) return;

  function applyFleetState(showLicenceFree){
    if (showLicenceFree) {
      // LICENCE-FREE BOATS
      speedPanel.classList.add('hidden');
      licfreePanel.classList.remove('hidden');
      optionLeft?.classList.remove('active');
      optionRight?.classList.add('active');
    } else {
      // SPEEDBOATS
      licfreePanel.classList.add('hidden');
      speedPanel.classList.remove('hidden');
      optionRight?.classList.remove('active');
      optionLeft?.classList.add('active');
    }
  }

  // deep-link από hash: #speedboats / #licence-free
  function syncFromHash(){
    const h = location.hash.replace('#','');
    if (h === 'licence-free') {
      toggle.checked = true;
      applyFleetState(true);
    } else if (h === 'speedboats') {
      toggle.checked = false;
      applyFleetState(false);
    } else {
      // αν δεν υπάρχει σχετικό hash, σεβόμαστε την τωρινή τιμή του toggle
      applyFleetState(toggle.checked);
    }
  }

  // αρχικό state με βάση το hash ή το toggle
  syncFromHash();

  // αλλαγή από το switch
  toggle.addEventListener('change', () => {
    applyFleetState(toggle.checked);
  });

  // αλλαγή hash από links στο page
  window.addEventListener('hashchange', syncFromHash);
});



  /* ===== Inline carousels μέσα στις κάρτες ===== */
  (function(){
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));


  /* ===== Inline carousels μέσα στις κάρτες ===== */
  function initCardCarousels(){
    $$('.card .img').forEach(imgWrap => {
      const imgs = $$('img', imgWrap);
      if (imgs.length <= 1) return; // Μόνο αν έχουμε 2+

      // state
      let i = 0;
      imgs[i].classList.add('is-active');

      // dots
      const dots = document.createElement('div');
      dots.className = 'dots';
      imgs.forEach((_, idx) => {
        const d = document.createElement('div');
        d.className = 'dot' + (idx===0 ? ' is-active' : '');
        dots.appendChild(d);
      });
      imgWrap.appendChild(dots);

      const update = (nextIdx) => {
        imgs[i].classList.remove('is-active');
        dots.children[i].classList.remove('is-active');
        i = (nextIdx + imgs.length) % imgs.length;
        imgs[i].classList.add('is-active');
        dots.children[i].classList.add('is-active');
      };

      // auto-rotate (pause on hover)
      const interval = parseInt(imgWrap.getAttribute('data-interval') || '4200', 10);
      let timer = setInterval(() => update(i+1), interval);
      imgWrap.addEventListener('mouseenter', () => { clearInterval(timer); });
      imgWrap.addEventListener('mouseleave', () => { timer = setInterval(() => update(i+1), interval); });

      // Swipe (mobile)
      let startX = null;
      imgWrap.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, {passive:true});
      imgWrap.addEventListener('touchend', e => {
        if(startX == null) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) update(i + (dx < 0 ? 1 : -1));
        startX = null;
      });

      // Click → Lightbox
      imgWrap.style.cursor = 'zoom-in';
      imgWrap.addEventListener('click', () => openLightbox(imgs.map(im => ({
        src: im.currentSrc || im.src,
        alt: im.alt || ''
      })), i));
    });
  }

  /* ===== Lightbox (μία για όλη τη σελίδα) ===== */
  let lb, lbImg, lbPrev, lbNext, lbClose, curr = 0, list = [];
  function buildLightboxOnce(){
    if (lb) return;
    lb = document.createElement('div');
    lb.className = 'lb-backdrop';
    lb.setAttribute('role','dialog');
    lb.setAttribute('aria-modal','true');
    lb.setAttribute('hidden','');

    lb.innerHTML = `
      <div class="lb-dialog">
        <div class="lb-figure">
          <img alt="">
          <button class="lb-prev" aria-label="Προηγούμενη">
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M15.5 3.5 7 12l8.5 8.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <button class="lb-next" aria-label="Επόμενη">
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M8.5 3.5 17 12l-8.5 8.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <button class="lb-close" aria-label="Κλείσιμο">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(lb);
    lbImg = lb.querySelector('img');
    lbPrev = lb.querySelector('.lb-prev');
    lbNext = lb.querySelector('.lb-next');
    lbClose = lb.querySelector('.lb-close');

    const show = () => {
      const it = list[curr];
      lbImg.src = it.src;
      lbImg.alt = it.alt || '';
    };

    const step = (dir) => {
      curr = (curr + dir + list.length) % list.length;
      show();
    };

    lbPrev.addEventListener('click', () => step(-1));
    lbNext.addEventListener('click', () => step(1));
    lbClose.addEventListener('click', closeLightbox);
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (lb.hasAttribute('hidden')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });

    // Basic focus trap: focus στο close
    lb.addEventListener('transitionend', () => lbClose.focus(), { once:true });

    // Helpers
    lb._show = () => { lb.removeAttribute('hidden'); document.documentElement.style.overflow='hidden'; show(); lbClose.focus(); };
    lb._hide = () => { lb.setAttribute('hidden',''); document.documentElement.style.overflow=''; lbImg.removeAttribute('src'); };
  }

  function openLightbox(items, startIndex=0){
    buildLightboxOnce();
    list = items;
    curr = Math.max(0, Math.min(startIndex, list.length-1));
    lb._show();
  }

  function closeLightbox(){ if (lb) lb._hide(); }

  // init
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initCardCarousels, { once:true });
  } else {
    initCardCarousels();
  }
})();