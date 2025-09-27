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
`Ζήτηση Διαθεσιμότητας — Nireys
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
