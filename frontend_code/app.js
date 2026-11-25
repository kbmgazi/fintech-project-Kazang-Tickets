/*
 * Kazang Tickets - Spaza Ticket Box Office (demo)
 * All the app logic: storage, language, navigation, the ticket sale flow
 * (search > select > hold > pay > till slip), promoter and admin.
 * Everything is saved in the browser's LocalStorage, so there is no backend.
 */

/* ===== STORAGE ===== */
const load = (k, f) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : f;
  } catch (e) {
    return f;
  }
};
const save = (k, d) => {
  try {
    localStorage.setItem(k, JSON.stringify(d));
  } catch (e) {}
};
const byId = (id) => document.getElementById(id);
const formatRand = (n) =>
  "R" +
  (Math.round(n * 100) / 100).toLocaleString("en-ZA", {
    minimumFractionDigits: Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2,
  });
const MERCHANT = "Mama's Spaza, Soweto";

/* ===== SEED DATA ===== */
const SEED = [
  {
    id: 1,
    name: "Soweto Amapiano Fest",
    date: "2026-12-14",
    venue: "Soweto Theatre",
    area: "Soweto",
    cat: "Amapiano",
    price: 150,
    qty_total: 200,
    qty_sold: 0,
    status: "published",
  },
  {
    id: 2,
    name: "Gospel Explosion",
    date: "2026-12-20",
    venue: "Orlando Stadium",
    area: "Soweto",
    cat: "Gospel",
    price: 100,
    qty_total: 300,
    qty_sold: 0,
    status: "published",
  },
  {
    id: 3,
    name: "Tembisa Comedy Night",
    date: "2026-12-18",
    venue: "Tembisa Hall",
    area: "Tembisa",
    cat: "Comedy",
    price: 80,
    qty_total: 150,
    qty_sold: 0,
    status: "published",
  },
];
let events = load("events", null);
if (!events) {
  events = SEED;
  save("events", events);
}
let sales = load("sales", []);
let favourites = load("favourites", []);
let language = load("lang", "EN");
let selection = null,
  hold = null,
  timerId = null,
  chip = "All";

/* ===== LANGUAGE (key words only) ===== */
const I18N = {
  EN: {
    all: "All",
    fav: "Favourites",
    users: "Users",
    sell: "SELL",
    payments: "PAYMENTS",
    store: "STORE",
    search: "Search",
    tickets: "Tickets",
  },
  ZU: {
    all: "Konke",
    fav: "Izintandokazi",
    users: "Abasebenzisi",
    sell: "THENGISA",
    payments: "AMAPHAYI",
    store: "ISITOLO",
    search: "Sesha",
    tickets: "Amathikithi",
  },
  ST: {
    all: "Tsohle",
    fav: "Tse ratoang",
    users: "Basebedisi",
    sell: "REKISA",
    payments: "DITEFELLO",
    store: "LEBENKELE",
    search: "Batla",
    tickets: "Litikete",
  },
};
const translate = (k) => I18N[language][k] || I18N.EN[k];
function setLanguage(l) {
  language = l;
  save("lang", l);
  applyLanguage();
}
function applyLanguage() {
  document.querySelectorAll("[data-i]").forEach((e) => (e.textContent = translate(e.dataset.i)));
  document
    .querySelectorAll(".lang button")
    .forEach((b) => b.classList.toggle("on", b.dataset.l === language));
  byId("search").placeholder = translate("search") + " event... e.g. Soweto Amapiano";
  renderChips();
}

/* ===== HOME TILES ===== */
const TILES = [
  {
    g: "Prepaid & Utilities",
    items: [
      ["airtime", "📱", "Airtime"],
      ["data", "📶", "Data"],
      ["electricity", "🔌", "Electricity"],
      ["bills", "🧾", "Bill Payments"],
    ],
  },
  {
    g: "Media, Travel & Vouchers",
    items: [
      ["dstv", "📺", "DStv"],
      ["gaming", "🎮", "Gaming Vouchers"],
      ["bus", "🚌", "Bus Tickets"],
      ["events", "🎟️⭐", "Events & Tickets", "Concerts, Soccer, Gospel, Comedy", true],
      ["global", "🌍", "Global Airtime"],
      ["easypay", "🎫", "EasyPay Vouchers"],
    ],
  },
  {
    g: "Money Services",
    items: [
      ["send", "📤", "Send Money"],
      ["receive", "📥", "Receive Money"],
      ["kmoney", "👛", "Kazang Money"],
      ["super", "👜", "Super Wallet"],
    ],
  },
];
function tileHTML(it) {
  const [id, ic, n, sub, isNew] = it;
  return `<div class="tile ${isNew ? "new" : ""}" onclick="tapTile('${id}')">${isNew ? '<span class="badge">NEW</span>' : ""}
  <button class="star ${favourites.includes(id) ? "on" : ""}" onclick="event.stopPropagation();toggleFavourite('${id}')">${favourites.includes(id) ? "★" : "☆"}</button>
  <span class="ic">${ic}</span>${n}${sub ? `<small>${sub}</small>` : ""}</div>`;
}
function renderHome() {
  byId("sellGrid").innerHTML = TILES.map(
    (g) => `<h3 class="grp">${g.g}</h3><div class="grid">${g.items.map(tileHTML).join("")}</div>`,
  ).join("");
  const pinned = TILES.flatMap((g) => g.items).filter((i) => favourites.includes(i[0]));
  byId("favGrid").innerHTML = pinned.length
    ? `<div class="grid">${pinned.map(tileHTML).join("")}</div>`
    : '<p style="color:#5b6b7a">No favourites yet. Tap the star on a tile to pin it.</p>';
}
function toggleFavourite(id) {
  favourites = favourites.includes(id) ? favourites.filter((x) => x !== id) : [...favourites, id];
  save("favourites", favourites);
  renderHome();
}
function tapTile(id) {
  if (id === "events") showScreen("tickets");
  else showDemoNotice();
}
function showDemoNotice() {
  toast("Demo - not connected to payment switch");
}
function toast(m) {
  const e = byId("toast");
  e.textContent = m;
  e.classList.remove("hidden");
  clearTimeout(toast.h);
  toast.h = setTimeout(() => e.classList.add("hidden"), 2200);
}

/* ===== NAVIGATION ===== */
const VIEWS = ["home", "fav", "users", "tickets", "select", "slip", "cashup", "promoter", "admin"];
function showScreen(name) {
  if (hold && !hold.sold && name !== "select") releaseHold();
  VIEWS.forEach((v) => byId("v-" + v).classList.toggle("hidden", v !== name));
  const tab = name === "fav" || name === "users" ? name : "home";
  document
    .querySelectorAll("#tabs button")
    .forEach((b) => b.classList.toggle("on", b.dataset.t === tab));
  if (name === "home" || name === "fav") renderHome();
  if (name === "tickets") renderEvents();
  if (name === "promoter") renderPromoter();
  if (name === "admin") renderAdmin();
  if (name === "cashup") renderCashup();
  window.scrollTo(0, 0);
}

/* ===== USERS / PIN ===== */
function signInCashier() {
  if (byId("pin").value === "1234") {
    byId("shift").textContent = "Open - signed in";
    toast("Cashier signed in");
  } else toast("Wrong PIN");
  byId("pin").value = "";
}

/* ===== TICKETS HOME ===== */
const CHIPS = ["All", "Soweto", "Tembisa", "Alexandra", "Gospel", "Amapiano", "Soccer"];
function renderChips() {
  byId("chips").innerHTML = CHIPS.map(
    (c) =>
      `<button class="chip ${c === chip ? "on" : ""}" onclick="chip='${c}';renderChips();renderEvents()">${c === "All" ? translate("all") : c}</button>`,
  ).join("");
}
function heldTicketCount(id) {
  const now = Date.now();
  return load("holds", [])
    .filter((h) => h.expires > now && h.eventId === id)
    .reduce((a, h) => a + h.qty, 0);
}
function left(ev) {
  return ev.qty_total - ev.qty_sold - heldTicketCount(ev.id);
}
const COLORS = ["#0B2C4A", "#1A9E4A", "#c0392b", "#8e44ad", "#d35400"];
function renderEvents() {
  const q = byId("search").value.trim().toLowerCase();
  const list = events.filter(
    (e) =>
      e.status === "published" &&
      (!q || (e.name + " " + e.area + " " + e.venue).toLowerCase().includes(q)) &&
      (chip === "All" || e.area === chip || e.cat === chip),
  );
  byId("events").innerHTML = list.length
    ? list
        .map(
          (e) => `<div class="card" onclick="selectEvent(${e.id})">
  <div class="poster" style="background:${COLORS[e.id % COLORS.length]}">${e.name[0]}</div>
  <div><b>${e.name}</b><div class="m">${e.date} | ${e.venue}</div><div><b>${formatRand(e.price)}</b> &nbsp; <span class="m">Left: ${left(e)}</span></div></div></div>`,
        )
        .join("")
    : '<p style="color:#5b6b7a">No events found</p>';
}

/* ===== SELECT EVENT ===== */
function selectEvent(id) {
  selection = { id, qty: 1 };
  const ev = events.find((e) => e.id === id);
  byId("s-name").textContent = ev.name;
  byId("s-meta").textContent = ev.date + " | " + ev.venue;
  byId("s-price").textContent = formatRand(ev.price);
  byId("s-left").textContent = left(ev);
  byId("payBox").classList.add("hidden");
  byId("holdBtn").classList.remove("hidden");
  byId("qtyBox").classList.remove("hidden");
  byId("cash").value = "";
  showScreen("select");
  updateTotals();
}
function changeQty(d) {
  const ev = events.find((e) => e.id === selection.id);
  selection.qty = Math.max(1, Math.min(left(ev), selection.qty + d));
  updateTotals();
}
function updateTotals() {
  const ev = events.find((e) => e.id === selection.id),
    tot = ev.price * selection.qty;
  byId("qty").textContent = selection.qty;
  byId("s-total").textContent = formatRand(tot);
  byId("s-comm").textContent = formatRand(Math.round(tot * 4) / 100);
}

/* ===== HOLD (5 mins) ===== */
function holdTickets() {
  const ev = events.find((e) => e.id === selection.id);
  if (selection.qty > left(ev)) {
    alert("Not enough tickets left");
    return;
  }
  hold = {
    id: "H" + Date.now(),
    eventId: ev.id,
    qty: selection.qty,
    expires: Date.now() + 300000,
    sold: false,
  };
  const hs = load("holds", []);
  hs.push(hold);
  save("holds", hs);
  byId("holdBtn").classList.add("hidden");
  byId("qtyBox").classList.add("hidden");
  byId("payBox").classList.remove("hidden");
  clearInterval(timerId);
  updateCountdown();
  timerId = setInterval(updateCountdown, 500);
}
function updateCountdown() {
  if (!hold) return;
  const s = Math.max(0, Math.ceil((hold.expires - Date.now()) / 1000));
  byId("timer").textContent =
    String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  if (s === 0) {
    const h = hold;
    releaseHold();
    alert("Hold expired");
    showScreen("tickets");
  }
}
function releaseHold() {
  clearInterval(timerId);
  if (hold) {
    save(
      "holds",
      load("holds", []).filter((h) => h.id !== hold.id),
    );
  }
  hold = null;
}
function updateCashChange() {
  const ev = events.find((e) => e.id === hold.eventId),
    c = parseFloat(byId("cash").value) || 0;
  byId("change").textContent = formatRand(Math.max(0, c - ev.price * hold.qty));
}

/* ===== CONFIRM SALE (idempotent) ===== */
function makeTicketCode() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += c[Math.floor(Math.random() * c.length)];
  return "LSK-2026-" + s;
}
function confirmSale() {
  if (!hold) return;
  const done = sales.find((s) => s.holdId === hold.id);
  if (done) {
    showSlip(done);
    return;
  } // no duplicate sale
  const ev = events.find((e) => e.id === hold.eventId),
    total = ev.price * hold.qty,
    cash = parseFloat(byId("cash").value);
  if (isNaN(cash) || cash < total) {
    alert("Cash tendered is less than the total");
    return;
  }
  const sale = {
    id: "S" + Date.now(),
    holdId: hold.id,
    date: new Date().toISOString().slice(0, 10),
    eventId: ev.id,
    eventName: ev.name,
    eventDate: ev.date,
    venue: ev.venue,
    qty: hold.qty,
    price: ev.price,
    total,
    commission: Math.round(total * 4) / 100,
    cash,
    change: cash - total,
    merchant: MERCHANT,
    codes: Array.from({ length: hold.qty }, makeTicketCode),
  };
  sales.push(sale);
  save("sales", sales);
  ev.qty_sold += hold.qty;
  save("events", events);
  hold.sold = true;
  releaseHold();
  showSlip(sale);
}
function showSlip(s) {
  byId("transactionStatus").classList.add("hidden");
  byId("slip").innerHTML =
    `<div class="t">LESAKA - KAZANG TICKETS</div><div class="success">✓ TRANSACTION SUCCESSFUL</div><div><b>${s.eventName}</b></div><div>${s.eventDate} | ${s.venue}</div>
  <div>Qty: ${s.qty} x ${formatRand(s.price)}</div><div>Total: ${formatRand(s.total)}</div><div>Cash: ${formatRand(s.cash)} | Change: ${formatRand(s.change)}</div>
  ${s.codes.map((c) => `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${c}" alt="${c}"><div style="font-size:12px">${c}</div>`).join("")}
  <div style="margin-top:8px">Valid for 1 entry each. Do not share.</div><div>Merchant: ${s.merchant}</div>`;
  VIEWS.forEach((v) => byId("v-" + v).classList.toggle("hidden", v !== "slip"));
}
function showTransactionSuccess() {
  byId("transactionStatus").classList.remove("hidden");
  toast("Transaction successful");
}
function printSlip() {
  window.print();
  showTransactionSuccess();
}
window.addEventListener("afterprint", showTransactionSuccess);

/* ===== PROMOTER ===== */
function createEvent() {
  const n = byId("p-name").value.trim(),
    d = byId("p-date").value,
    v = byId("p-venue").value.trim(),
    a = byId("p-area").value.trim() || "Soweto",
    p = parseFloat(byId("p-price").value),
    q = parseInt(byId("p-qty").value);
  if (!n || !d || !v || !(p > 0) || !(q > 0)) {
    alert("Fill in all fields");
    return;
  }
  events.push({
    id: Date.now(),
    name: n,
    date: d,
    venue: v,
    area: a,
    cat: "",
    price: p,
    qty_total: q,
    qty_sold: 0,
    status: "published",
  });
  save("events", events);
  ["p-name", "p-date", "p-venue", "p-area", "p-price", "p-qty"].forEach(
    (i) => (byId(i).value = ""),
  );
  alert("Event published!");
  renderPromoter();
}
function renderPromoter() {
  byId("p-list").innerHTML = events
    .map(
      (e) =>
        `<div class="row"><span><b>${e.name}</b><br><small>${e.date}</small></span><span>Sold: ${e.qty_sold} / ${e.qty_total} | ${formatRand(e.price)}</span></div>`,
    )
    .join("");
}

/* ===== ADMIN ===== */
function renderAdmin() {
  byId("a-sales").innerHTML = sales.length
    ? `<table><tr><th>Date</th><th>Event</th><th>Qty</th><th>Total</th><th>Merchant</th></tr>${sales.map((s) => `<tr><td>${s.date}</td><td>${s.eventName}</td><td>${s.qty}</td><td>${formatRand(s.total)}</td><td>${s.merchant}</td></tr>`).join("")}</table>`
    : '<p style="color:#5b6b7a">No sales yet</p>';
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const merchantCommission = sales.reduce((sum, sale) => sum + sale.commission, 0);
  const promoterShare = Math.round(totalSales * 85) / 100;
  byId("st-total").textContent = formatRand(totalSales);
  byId("st-prom").textContent = formatRand(promoterShare);
  byId("st-comm").textContent = formatRand(merchantCommission);
  byId("st-les").textContent = formatRand(totalSales - promoterShare - merchantCommission);
}
function resetDemo() {
  localStorage.clear();
  location.reload();
}

/* ===== CASH-UP (demo) ===== */
function renderCashup() {
  const today = new Date().toISOString().slice(0, 10),
    ts = sales.filter((s) => s.date === today),
    tt = ts.reduce((a, s) => a + s.total, 0),
    tc = ts.reduce((a, s) => a + s.commission, 0),
    other = 1850;
  byId("cashupBox").innerHTML = `<b style="color:#0B2C4A;font-size:18px">Cash-up - KAZ-001</b>
  <div class="row"><span>Airtime & other VAS (demo)</span><b>${formatRand(other)}</b></div>
  <div class="row"><span>Tickets sales (${ts.reduce((a, s) => a + s.qty, 0)} tickets)</span><b>${formatRand(tt)}</b></div>
  <div class="row big"><span>Today's Sales</span><span>${formatRand(other + tt)}</span></div>
  <div class="row"><span>Tickets commission</span><b>${formatRand(tc)}</b></div>`;
}

/* ===== INIT ===== */
function updateClock() {
  const d = new Date();
  byId("clock").textContent =
    String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}
updateClock();
setInterval(updateClock, 20000);
save(
  "holds",
  load("holds", []).filter((h) => h.expires > Date.now()),
);
applyLanguage();
showScreen("home");