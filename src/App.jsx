import React, { useState, useEffect, useRef } from "react";

// ---- styles ---------------------------------------------------------------
// Modern, simple, coastal-neutral palette — sand, deep ocean navy, sunset coral.
const STYLE = `
:root{
  --bg:#F6F3EC; --surface:#FFFFFF; --ink:#16232B; --muted:#707A82;
  --navy:#0E3A52; --navy2:#124A68; --coral:#FF6B4A; --line:rgba(22,35,43,.11);
}
*{box-sizing:border-box;}
html,body{margin:0;background:var(--bg);-webkit-text-size-adjust:100%;}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,ui-sans-serif,sans-serif;}
.np-mono{font-family:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace;}
.np-app{min-height:100vh;min-height:100dvh;padding-top:max(10px,env(safe-area-inset-top));padding-bottom:env(safe-area-inset-bottom);}
.np-card{background:var(--surface);border:1px solid var(--line);}
.np-in{background:#F5F2EC;border:1px solid var(--line);}
.np-in:focus{outline:none;border-color:var(--navy);background:#fff;}
@media (prefers-reduced-motion:no-preference){.np-pop{animation:pop .22s ease;}}
@keyframes pop{from{opacity:0;transform:translateY(3px);}to{opacity:1;transform:none;}}
button{font-family:inherit;}
input,select,textarea{font-family:inherit;}
::placeholder{color:var(--muted);opacity:.7;}
`;

// ---- inline icons ---------------------------------------------------------
const PATHS = {
  waves: <><path d="M2 8c1.7-1.7 3.4-1.7 5.1 0s3.4 1.7 5.1 0 3.4-1.7 5.1 0 3.4 1.7 5.1 0" /><path d="M2 14c1.7-1.7 3.4-1.7 5.1 0s3.4 1.7 5.1 0 3.4-1.7 5.1 0 3.4 1.7 5.1 0" /><path d="M2 20c1.7-1.7 3.4-1.7 5.1 0s3.4 1.7 5.1 0 3.4-1.7 5.1 0 3.4 1.7 5.1 0" /></>,
  pin: <><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
  check: <polyline points="20 6 9 17 4 12" />,
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  trash: <><polyline points="3 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></>,
  cal: <><rect x="3" y="4" width="18" height="18" rx="3" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
  nav: <polygon points="3 11 22 2 13 21 11 13 3 11" />,
  x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
  pencil: <path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
  music: <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></>,
  home: <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h5v-6h4v6h5V10" /></>,
  route: <><circle cx="6" cy="19" r="2.4" /><circle cx="18" cy="5" r="2.4" /><path d="M8.3 19H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.7" /></>,
  star: <polygon points="12 2 14.9 8.6 22 9.3 16.6 14 18.3 21 12 17.3 5.7 21 7.4 14 2 9.3 9.1 8.6" />,
  locate: <><circle cx="12" cy="12" r="7" /><line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" /><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" /></>,
  sun: <><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" /></>,
};
function Ico({ n, s = 16, c = "currentColor", w = 2, fill = "none" }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={c}
      strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[n]}
    </svg>
  );
}

// ---- helpers --------------------------------------------------------------
const uid = () => Math.random().toString(36).slice(2, 9);
const KEY = "newportage-v1";
const APP_VERSION = "1";
const enc = encodeURIComponent;

function dateList(start, end) {
  if (!start || !end) return [];
  const [ys, ms, ds] = start.split("-").map(Number);
  const [ye, me, de] = end.split("-").map(Number);
  let t = Date.UTC(ys, ms - 1, ds);
  const last = Date.UTC(ye, me - 1, de);
  const out = [];
  while (t <= last && out.length < 30) { out.push(new Date(t).toISOString().slice(0, 10)); t += 86400000; }
  return out;
}
function fmtChip(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return {
    wd: dt.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
    day: d, mo: dt.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
  };
}
function daysUntil(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const now = new Date();
  return Math.round((target - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
}

// 2026 Newport Jazz Festival lineup (confirmed acts, Jul 31–Aug 2, Fort Adams State
// Park). Newport hasn't published which artist plays which day/stage yet — that
// usually lands close to the date, so these sit "Unscheduled" until you tap the
// pencil and set a day/time off the official poster.
const SEED_VERSION = 1;
const SEED_LINEUP = [
  { artist: "Janelle Monáe", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "The Roots", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Jacob Collier", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Raye", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Jon Batiste", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Herbie Hancock", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Thundercat", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Gary Clark Jr.", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Robert Glasper (feat. Bilal & Ari Lennox)", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Charles Lloyd Sky Quartet (feat. Jason Moran)", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "John Scofield & Dave Holland", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Terri Lyne Carrington + Social Science", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Vulfpeck", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Lake Street Dive", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Snarky Puppy", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Cory Wong with Joshua Redman", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Little Simz", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Arlo Parks", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Celeste", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Leon Thomas", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Sienna Spiro", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Mei Semones", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Flea and the Honora Band", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Marcus King (Atomic Habits)", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "Charlie Hunter & Ella Feingold", venue: "Fort Adams State Park", date: "", time: "", starred: false },
  { artist: "The Bad Plus", venue: "Fort Adams State Park", date: "", time: "", starred: false },
];

const DEFAULT = {
  name: "Newport Jazz Fest Trip", destination: "Newport, RI",
  homeBase: "",
  startDate: "2026-07-30", endDate: "2026-08-03",
  days: {}, places: [], lineup: [], seededLineup: false, lineupVersion: 0, datesFixed: false,
};
const PLACE_CATS = ["Beach", "Eat", "See", "Do", "Sail", "Historic", "Shop", "Sweet", "Music", "Scenic"];
const PLACES_VERSION = 1;

// Evergreen Newport, RI + nearby (Middletown, Jamestown) picks — beaches, Gilded
// Age mansions, colonial history, food, and things to fill the days around the fest.
const SEED_PLACES = [
  // --- Beach ---
  { category: "Beach", name: "Easton's Beach (First Beach)", summary: "Newport's main town beach right off Memorial Blvd — boardwalk, vintage carousel, arcade, and a snack bar. Easiest beach to walk to from downtown.", url: "https://www.google.com/search?q=Easton%27s+Beach+Newport+RI" },
  { category: "Beach", name: "Second Beach (Sachuest Beach)", summary: "Bigger and less crowded than Easton's, in Middletown — better waves, dunes, surf lessons available. A short drive from town.", url: "https://www.google.com/search?q=Sachuest+Beach+Middletown+RI" },
  { category: "Beach", name: "Third Beach", summary: "Calm, warm water on the Sakonnet River side of Middletown — good for kayaking, paddleboarding, and small kids. Quieter than the ocean beaches.", url: "https://www.google.com/search?q=Third+Beach+Middletown+RI" },
  { category: "Beach", name: "Gooseberry Beach", summary: "Small cove beach right on Ocean Drive — calm water, snack bar, easy parking. A relaxed stop between mansion sightseeing.", url: "https://www.google.com/search?q=Gooseberry+Beach+Newport+RI" },
  { category: "Beach", name: "Fort Adams State Park waterfront", summary: "The jazz fest's own backyard — a swimmable stretch of Newport Harbor right next to the festival grounds, with picnic lawns and skyline views.", url: "https://www.google.com/search?q=Fort+Adams+State+Park+Newport+RI" },
  { category: "Beach", name: "Brenton Point State Park", summary: "Rocky, open shoreline on Ocean Drive — not for swimming, but the best free kite-flying and sunset-watching spot in Newport, with big lawns to run around.", url: "https://www.google.com/search?q=Brenton+Point+State+Park+Newport+RI" },

  // --- See / Historic (Gilded Age mansions) ---
  { category: "See", name: "The Breakers", summary: "The grandest of the Newport mansions — the Vanderbilt family's 70-room Italian Renaissance summer 'cottage.' Newport's most-visited landmark; book ahead in summer.", url: "https://www.google.com/search?q=The+Breakers+Newport+RI" },
  { category: "See", name: "Marble House", summary: "Another Vanderbilt showpiece, modeled on Versailles's Petit Trianon — a Chinese Tea House on the cliffside lawn. A shorter, less crowded visit than The Breakers.", url: "https://www.google.com/search?q=Marble+House+Newport+RI" },
  { category: "See", name: "Rosecliff", summary: "Modeled on Versailles, with the largest ballroom in Newport — the Great Gatsby (1974) party scenes were filmed here.", url: "https://www.google.com/search?q=Rosecliff+Newport+RI" },
  { category: "See", name: "The Elms", summary: "A coal magnate's French-chateau-style mansion — the 'Servant Life' behind-the-scenes tour (basement to rooftop) is one of the best of the bunch.", url: "https://www.google.com/search?q=The+Elms+Newport+RI" },
  { category: "See", name: "Chateau-sur-Mer", summary: "The earliest of the grand Newport mansions, a High Victorian showpiece that set off the Gilded Age building boom on Bellevue Ave.", url: "https://www.google.com/search?q=Chateau-sur-Mer+Newport+RI" },
  { category: "See", name: "Kingscote", summary: "A Gothic Revival 'cottage' from the 1840s — smaller and earlier than the marble palaces, with a Tiffany-glass dining room.", url: "https://www.google.com/search?q=Kingscote+Newport+RI" },
  { category: "See", name: "Rough Point", summary: "Doris Duke's oceanfront estate on Cliff Walk — art, antiques, and the story of the eccentric heiress who once kept camels on the lawn.", url: "https://www.google.com/search?q=Rough+Point+Newport+RI" },

  // --- Historic (colonial) ---
  { category: "Historic", name: "Touro Synagogue", summary: "The oldest surviving synagogue building in the United States (1763), a National Historic Site with free timed tours downtown.", url: "https://www.google.com/search?q=Touro+Synagogue+Newport+RI" },
  { category: "Historic", name: "White Horse Tavern", summary: "The oldest operating tavern in America (1673) — cozy, low-beamed rooms and elevated New England cooking. Reserve ahead.", url: "https://www.google.com/search?q=White+Horse+Tavern+Newport+RI" },
  { category: "Historic", name: "Trinity Church", summary: "A 1726 colonial church with a landmark white steeple — George Washington worshipped here. Climb the tower on a guided tour.", url: "https://www.google.com/search?q=Trinity+Church+Newport+RI" },
  { category: "Historic", name: "Colony House", summary: "Rhode Island's 1739 statehouse on Washington Square — Washington and Lafayette were both honored here. Free to visit.", url: "https://www.google.com/search?q=Old+Colony+House+Newport+RI" },
  { category: "Historic", name: "International Tennis Hall of Fame", summary: "Housed in the historic Newport Casino — grass courts you can actually play on, plus tennis history exhibits. Steps from Bellevue Ave.", url: "https://www.google.com/search?q=International+Tennis+Hall+of+Fame+Newport+RI" },
  { category: "Historic", name: "Fort Adams", summary: "A massive 19th-century coastal fortification with guided tunnel tours — also, conveniently, the jazz festival's own front lawn.", url: "https://www.google.com/search?q=Fort+Adams+Newport+RI+tours" },

  // --- Scenic / Do ---
  { category: "Scenic", name: "Cliff Walk", summary: "A free 3.5-mile National Recreation Trail tracing the ocean side of the mansions — dramatic surf on one side, Gilded Age lawns on the other. Go early to beat the heat.", url: "https://www.google.com/search?q=Cliff+Walk+Newport+RI" },
  { category: "Scenic", name: "Ocean Drive", summary: "A scenic 10-mile loop past rocky coastline and old estates — great by bike, car, or on foot with stops at Brenton Point and Gooseberry Beach along the way.", url: "https://www.google.com/search?q=Ocean+Drive+Newport+RI" },
  { category: "Do", name: "Bowen's Wharf & Bannister's Wharf", summary: "Newport's historic waterfront — shops, restaurants, and the docks where the harbor tour boats and schooners leave from.", url: "https://www.google.com/search?q=Bowen%27s+Wharf+Newport+RI" },
  { category: "Do", name: "Purgatory Chasm", summary: "A dramatic 160-foot rock cleft above the ocean in Middletown, a five-minute walk from Second Beach. Easy, dramatic, and free.", url: "https://www.google.com/search?q=Purgatory+Chasm+Middletown+RI" },
  { category: "Nature", name: "Norman Bird Sanctuary", summary: "Middletown hiking trails through fields and woods, with a scramble up Hanging Rock for ocean views. Good birding too.", url: "https://www.google.com/search?q=Norman+Bird+Sanctuary+Middletown+RI" },
  { category: "Nature", name: "Sachuest Point National Wildlife Refuge", summary: "Coastal walking trails next to Second Beach — seals in cooler months, seabirds year-round, and open ocean views the whole way.", url: "https://www.google.com/search?q=Sachuest+Point+National+Wildlife+Refuge" },
  { category: "Scenic", name: "Beavertail State Park", summary: "A short drive across the bridge in Jamestown — a lighthouse, tide pools, and rocky point that's one of the best sunset spots in the area.", url: "https://www.google.com/search?q=Beavertail+State+Park+Jamestown+RI" },

  // --- Sail / on the water ---
  { category: "Sail", name: "Newport Harbor schooner sail", summary: "Classic wooden schooners depart Bannister's Wharf for 90-minute sails around the harbor and past the mansions — a great way to see Newport from the water.", url: "https://www.google.com/search?q=schooner+sail+Newport+RI" },
  { category: "Sail", name: "Jamestown day trip", summary: "Newport's quieter sister town across Narragansett Bay — East Ferry waterfront, ice cream, and views back at Newport without the crowds.", url: "https://www.google.com/search?q=Jamestown+Rhode+Island+things+to+do" },
  { category: "Sail", name: "Block Island ferry", summary: "A seasonal high-speed ferry (from Newport in summer, or Point Judith) to a low-key island of bluffs, beaches, and bike rentals — a full but doable day trip.", url: "https://www.google.com/search?q=Block+Island+ferry+from+Newport" },
  { category: "Sail", name: "Third Beach kayak & paddleboard rentals", summary: "Calm, flat water on the Sakonnet River side of Middletown — a relaxed alternative to ocean swimming, good for beginners and kids.", url: "https://www.google.com/search?q=kayak+paddleboard+rental+Third+Beach+Middletown" },
  { category: "Sail", name: "National Sailing Hall of Fame", summary: "Right at Fort Adams — America's Cup history and sailing exhibits, an easy stop before or after a festival set.", url: "https://www.google.com/search?q=National+Sailing+Hall+of+Fame+Newport+RI" },

  // --- Eat ---
  { category: "Eat", name: "Flo's Clam Shack", summary: "Middletown's iconic roadside fried-clam shack overlooking the water near Second Beach — a Newport-area rite of passage.", url: "https://www.google.com/search?q=Flo%27s+Clam+Shack+Middletown+RI" },
  { category: "Eat", name: "Anthony's Seafood", summary: "Local seafood market and takeout counter — lobster rolls, chowder, and fresh catch to eat at picnic tables by the water.", url: "https://www.google.com/search?q=Anthony%27s+Seafood+Middletown+RI" },
  { category: "Eat", name: "The Mooring", summary: "Waterfront seafood right on Sayer's Wharf — award-winning clam chowder and harbor views from the deck.", url: "https://www.google.com/search?q=The+Mooring+Newport+RI" },
  { category: "Eat", name: "Midtown Oyster Bar", summary: "Lively raw bar and seafood spot on Broadway with a strong cocktail list — a good dinner before a late festival night.", url: "https://www.google.com/search?q=Midtown+Oyster+Bar+Newport+RI" },
  { category: "Eat", name: "Fluke Wine Bar & Kitchen", summary: "Seafood-forward small plates and natural wine on Broadway's restaurant row — relaxed, unfussy, and consistently good.", url: "https://www.google.com/search?q=Fluke+Wine+Bar+and+Kitchen+Newport+RI" },
  { category: "Eat", name: "Diego's", summary: "Festive tacos and margaritas on Bowen's Wharf — an easy, casual dinner with harbor views.", url: "https://www.google.com/search?q=Diego%27s+Newport+RI" },
  { category: "Eat", name: "Gustave's at White Horse Tavern", summary: "Elevated New England cooking inside the oldest tavern in America (1673). A special-occasion dinner; reserve ahead.", url: "https://www.google.com/search?q=White+Horse+Tavern+Newport+RI+dinner" },
  { category: "Eat", name: "Newport Vineyards", summary: "A working Middletown winery with a farm-to-table restaurant and tasting room — a nice slower-paced afternoon between beach and fest.", url: "https://www.google.com/search?q=Newport+Vineyards+Middletown+RI" },
  { category: "Eat", name: "Corner Café", summary: "Popular downtown breakfast and brunch spot — expect a line on weekends, but it moves and it's worth it before a beach day.", url: "https://www.google.com/search?q=Corner+Cafe+Newport+RI" },
  { category: "Eat", name: "Perro Salado", summary: "Festive Mexican on the Broadway restaurant strip — margaritas, tacos, good energy for a group dinner.", url: "https://www.google.com/search?q=Perro+Salado+Newport+RI" },
  { category: "Eat", name: "22 Bowen's Wine Bar & Grille", summary: "Waterfront steak and seafood right on the wharf — a dressier dinner option with a view of the boats.", url: "https://www.google.com/search?q=22+Bowen%27s+Newport+RI" },
  { category: "Eat", name: "Empire Tea & Coffee", summary: "Good coffee and pastries to fuel up before a beach morning or an early festival gate time.", url: "https://www.google.com/search?q=Empire+Tea+and+Coffee+Newport+RI" },

  // --- Sweet ---
  { category: "Sweet", name: "Del's Frozen Lemonade", summary: "The Rhode Island original — a slushy frozen lemonade sold from carts and stands all over town. Look for one near the wharves.", url: "https://www.google.com/search?q=Del%27s+Frozen+Lemonade+Newport+RI" },
  { category: "Sweet", name: "Aquidneck Ice Cream", summary: "A local scoop shop good for a post-beach or post-set treat downtown.", url: "https://www.google.com/search?q=Aquidneck+Ice+Cream+Newport+RI" },
  { category: "Sweet", name: "Sweet Berry Farm", summary: "Middletown farm stand with pick-your-own berries and excellent soft serve — a nice detour on the way to Second or Third Beach.", url: "https://www.google.com/search?q=Sweet+Berry+Farm+Middletown+RI" },

  // --- Shop ---
  { category: "Shop", name: "Spring Street & Bellevue Ave", summary: "Newport's historic downtown shopping strip — boutiques, galleries, and antique shops woven through colonial-era streets.", url: "https://www.google.com/search?q=Spring+Street+shopping+Newport+RI" },
  { category: "Shop", name: "Brick Market Place", summary: "An open-air shopping row between America's Cup Ave and Thames Street — easy browsing between waterfront stops.", url: "https://www.google.com/search?q=Brick+Market+Place+Newport+RI" },
  { category: "Shop", name: "Newport Vineyards farm store", summary: "Local wine, cheese, and gifts to take home — right next to the tasting room in Middletown.", url: "https://www.google.com/search?q=Newport+Vineyards+farm+store" },

  // --- Music (beyond the fest) ---
  { category: "Music", name: "Newport Blues Cafe", summary: "A live blues and soul club housed in a historic bank building on Thames Street — a good late-night stop after the festival gates close.", url: "https://www.google.com/search?q=Newport+Blues+Cafe+RI" },
  { category: "Music", name: "One Pelham East", summary: "A Thames Street bar with live local bands most summer nights — casual, loud, and walkable from the wharves.", url: "https://www.google.com/search?q=One+Pelham+East+Newport+RI" },
];

export default function App() {
  const [trip, setTrip] = useState(DEFAULT);
  const [tab, setTab] = useState("itinerary");
  const [activeDay, setActiveDay] = useState(null);
  const [editHeader, setEditHeader] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    let t = { ...DEFAULT };
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const v = window.localStorage.getItem(KEY);
        if (v) t = { ...DEFAULT, ...JSON.parse(v) };
      }
    } catch (e) { /* first run */ }
    let mutated = false;
    if (!t.lineup || t.lineup.length === 0) {
      t = { ...t, lineup: SEED_LINEUP.map((a) => ({ ...a, id: uid() })) };
      mutated = true;
    }
    if (!t.seededLineup || (t.lineupVersion || 0) < SEED_VERSION) {
      t = { ...t, seededLineup: true, lineupVersion: SEED_VERSION };
      mutated = true;
    }
    if (!t.datesFixed) {
      t = { ...t, startDate: DEFAULT.startDate, endDate: DEFAULT.endDate, datesFixed: true };
      mutated = true;
    }
    if ((t.placesVersion || 0) < PLACES_VERSION) {
      const have = new Set((t.places || []).map((p) => p.name.toLowerCase()));
      const additions = SEED_PLACES.filter((p) => !have.has(p.name.toLowerCase())).map((p) => ({ ...p, id: uid() }));
      t = { ...t, places: [...(t.places || []), ...additions], placesVersion: PLACES_VERSION };
      mutated = true;
    }
    if (mutated) {
      try {
        if (typeof window !== "undefined" && window.localStorage)
          window.localStorage.setItem(KEY, JSON.stringify(t));
      } catch (e) { /* memory only */ }
    }
    setTrip(t); setLoaded(true);
  }, []);

  const save = (next) => {
    setTrip(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        if (typeof window !== "undefined" && window.localStorage)
          window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch (e) { /* memory only */ }
    }, 400);
  };

  const days = dateList(trip.startDate, trip.endDate);
  useEffect(() => {
    if (days.length && !days.includes(activeDay)) setActiveDay(days[0]);
  }, [trip.startDate, trip.endDate]); // eslint-disable-line
  const countdown = daysUntil(trip.startDate);

  if (!loaded)
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "grid", placeItems: "center" }}>
        <span className="np-mono" style={{ color: "#707A82", fontSize: 13 }}>Loading your trip…</span>
      </div>
    );

  const TABS = [["itinerary", "cal", "Plans"], ["lineup", "music", "Lineup"], ["places", "pin", "Spots"]];

  return (
    <div className="np-app" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <style>{STYLE}</style>
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "0 16px 90px", paddingLeft: "max(16px, env(safe-area-inset-left))", paddingRight: "max(16px, env(safe-area-inset-right))" }}>
        <Header trip={trip} countdown={countdown} editing={editHeader}
          onEdit={() => setEditHeader(true)} onClose={() => setEditHeader(false)}
          onSave={(p) => { save({ ...trip, ...p }); setEditHeader(false); }} />

        <div className="np-mono" style={{ display: "flex", gap: 4, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 4, marginTop: 16, position: "sticky", top: 8, zIndex: 5 }}>
          {TABS.map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "10px 0", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: ".01em", background: tab === id ? "var(--navy)" : "transparent", color: tab === id ? "#fff" : "var(--muted)", transition: "all .16s" }}>
              <Ico n={icon} s={14} /> {label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 16 }} key={tab} className="np-pop">
          {tab === "itinerary" && <Itinerary trip={trip} days={days} activeDay={activeDay} setActiveDay={setActiveDay} save={save} gotoHeader={() => setEditHeader(true)} />}
          {tab === "lineup" && <Lineup trip={trip} days={days} save={save} />}
          {tab === "places" && <Places trip={trip} days={days} save={save} />}
        </div>

        <div className="np-mono" style={{ textAlign: "center", marginTop: 24, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", opacity: .7 }}>
          Newportage · v{APP_VERSION}
        </div>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <a href={`https://www.google.com/maps/search/?api=1&query=${enc(trip.destination || "Newport, RI")}`}
            target="_blank" rel="noopener noreferrer"
            className="np-mono"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--navy)", fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", textDecoration: "none", border: "1px solid var(--line)", borderRadius: 10, padding: "8px 14px", background: "#fff" }}>
            <Ico n="pin" s={13} c="var(--navy)" /> Map
          </a>
        </div>
        <DataTools trip={trip} save={save} />
      </div>
    </div>
  );
}

// ---- Header ---------------------------------------------------------------
function Header({ trip, countdown, editing, onEdit, onClose, onSave }) {
  const [f, setF] = useState(pick(trip));
  useEffect(() => { setF(pick(trip)); }, [editing]); // eslint-disable-line
  function pick(t) { return { name: t.name, destination: t.destination, homeBase: t.homeBase, startDate: t.startDate, endDate: t.endDate }; }
  const range = trip.startDate && trip.endDate
    ? `${fmtChip(trip.startDate).mo} ${fmtChip(trip.startDate).day} – ${fmtChip(trip.endDate).mo} ${fmtChip(trip.endDate).day}`
    : "Dates not set";

  return (
    <div className="np-card" style={{ borderRadius: 20, marginTop: 14, overflow: "hidden" }}>
      <div style={{ height: 5, background: "linear-gradient(90deg, var(--navy), var(--coral))" }} />
      <div style={{ padding: 18 }}>
        {!editing ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="np-mono" style={{ fontSize: 10.5, letterSpacing: ".16em", color: "var(--muted)", textTransform: "uppercase" }}>Trip</div>
              <button onClick={onEdit} aria-label="Edit trip" style={ghost}><Ico n="pencil" s={15} /></button>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.08, margin: "6px 0 4px", letterSpacing: "-.01em" }}>{trip.name || "Untitled Trip"}</h1>
            <div className="np-mono" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--navy)", fontSize: 13, fontWeight: 600 }}>
              <Ico n="waves" s={13} c="var(--navy)" />{trip.destination || "Add a destination"}
            </div>
            {trip.homeBase && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${enc(trip.homeBase)}`} target="_blank" rel="noopener noreferrer"
                className="np-mono" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--coral)", fontSize: 11.5, marginTop: 9, textDecoration: "none", border: "1px solid var(--line)", borderRadius: 10, padding: "6px 10px", background: "rgba(255,107,74,.07)" }}>
                <Ico n="home" s={12} c="var(--coral)" />{trip.homeBase}
              </a>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 16, borderTop: "1px dashed var(--line)", paddingTop: 12 }}>
              <div>
                <div className="np-mono" style={{ fontSize: 9.5, letterSpacing: ".12em", color: "var(--muted)", textTransform: "uppercase" }}>Dates</div>
                <div className="np-mono" style={{ fontSize: 13.5, fontWeight: 600, marginTop: 3 }}>{range}</div>
              </div>
              {countdown !== null && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 25, fontWeight: 700, color: countdown < 0 ? "var(--muted)" : "var(--coral)", lineHeight: 1 }}>{countdown > 0 ? countdown : countdown === 0 ? "Today" : "—"}</div>
                  <div className="np-mono" style={{ fontSize: 9.5, letterSpacing: ".1em", color: "var(--muted)", textTransform: "uppercase", marginTop: 2 }}>{countdown > 0 ? "days to go" : countdown === 0 ? "you're off!" : "in progress"}</div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="np-pop" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="np-mono" style={{ fontSize: 11, letterSpacing: ".12em", color: "var(--muted)", textTransform: "uppercase" }}>Edit trip</span>
              <button onClick={onClose} aria-label="Close" style={ghost}><Ico n="x" s={18} /></button>
            </div>
            <Field label="Trip name"><input className="np-in" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={inStyle} /></Field>
            <Field label="Destination"><input className="np-in" value={f.destination} onChange={(e) => setF({ ...f, destination: e.target.value })} style={inStyle} placeholder="Newport, RI" /></Field>
            <Field label="Home base"><input className="np-in" value={f.homeBase} onChange={(e) => setF({ ...f, homeBase: e.target.value })} style={inStyle} placeholder="Hotel / address" /></Field>
            <div style={{ display: "flex", gap: 10 }}>
              <Field label="Start"><input type="date" className="np-in np-mono" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} style={{ ...inStyle, fontSize: 13 }} /></Field>
              <Field label="End"><input type="date" className="np-in np-mono" value={f.endDate} min={f.startDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} style={{ ...inStyle, fontSize: 13 }} /></Field>
            </div>
            <button onClick={() => onSave(f)} className="np-mono" style={primaryBtn}>Save trip</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Itinerary --------------------------------------------------------------
function Itinerary({ trip, days, activeDay, setActiveDay, save, gotoHeader }) {
  const [time, setTime] = useState("09:00");
  const [title, setTitle] = useState("");
  const [editId, setEditId] = useState(null);
  if (!days.length)
    return <Empty icon="cal" title="Set your dates first" sub="Add a start and end date and your trip days appear here, ready to fill." action="Add travel dates" onAction={gotoHeader} />;

  const items = (trip.days[activeDay] || []).slice().sort((a, b) => a.time.localeCompare(b.time));
  const add = () => {
    if (!title.trim()) return;
    save({ ...trip, days: { ...trip.days, [activeDay]: [...(trip.days[activeDay] || []), { id: uid(), time, title: title.trim() }] } });
    setTitle("");
  };
  const del = (id) => {
    const item = (trip.days[activeDay] || []).find((i) => i.id === id);
    const lineup = item && item.fromLineup
      ? trip.lineup.map((a) => a.id === item.fromLineup ? { ...a, starred: false } : a)
      : trip.lineup;
    save({ ...trip, lineup, days: { ...trip.days, [activeDay]: (trip.days[activeDay] || []).filter((i) => i.id !== id) } });
  };
  const update = (id, patch) => save({ ...trip, days: { ...trip.days, [activeDay]: (trip.days[activeDay] || []).map((i) => i.id === id ? { ...i, ...patch } : i) } });

  return (
    <>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
        {days.map((iso) => {
          const c = fmtChip(iso); const on = iso === activeDay; const n = (trip.days[iso] || []).length;
          return (
            <button key={iso} onClick={() => setActiveDay(iso)} style={{ flex: "0 0 auto", width: 56, padding: "9px 0", borderRadius: 14, cursor: "pointer", border: on ? "1px solid var(--navy)" : "1px solid var(--line)", background: on ? "var(--navy)" : "var(--surface)", color: on ? "#fff" : "var(--ink)", textAlign: "center" }}>
              <div className="np-mono" style={{ fontSize: 9.5, letterSpacing: ".08em", opacity: .7, textTransform: "uppercase" }}>{c.wd}</div>
              <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>{c.day}</div>
              <div className="np-mono" style={{ fontSize: 9, opacity: on ? .85 : .5 }}>{n ? `${n}·plan` : "—"}</div>
            </button>
          );
        })}
      </div>
      {items.length === 0
        ? <Empty icon="nav" title="Nothing planned yet" sub="Add a set, a beach block, dinner — anything with a time." compact />
        : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{items.map((it) => {
          const editing = editId === it.id;
          return (
          <div key={it.id} className="np-card np-pop" style={{ borderRadius: 15, overflow: "hidden", padding: 0 }}>
            <div style={{ display: "flex", alignItems: "stretch" }}>
              <button onClick={() => setEditId(editing ? null : it.id)} aria-label="Edit time"
                style={{ flexShrink: 0, width: 68, border: "none", borderRight: "1.5px dashed var(--line)", background: "#F5F2EC", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "14px 6px" }}>
                <Ico n={it.fromLineup ? "music" : "cal"} s={11} c="var(--coral)" />
                <span className="np-mono" style={{ fontSize: 13.5, fontWeight: 700, color: "var(--navy)", letterSpacing: ".01em" }}>{it.time}</span>
              </button>
              <div style={{ flex: 1, minWidth: 0, padding: "12px 10px 12px 14px", display: "flex", alignItems: "flex-start", gap: 6 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.25 }}>{it.title}</div>
                  {it.note && !editing && <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.45, marginTop: 5, whiteSpace: "pre-wrap" }}>{it.note}</div>}
                  {!it.note && !editing && <button onClick={() => setEditId(it.id)} className="np-mono" style={{ marginTop: 6, background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 10.5, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--coral)" }}>+ Add note</button>}
                </div>
                <button onClick={() => setEditId(editing ? null : it.id)} aria-label="Edit" style={{ ...iconBtn, width: 34, height: 34, background: editing ? "var(--navy)" : "#F5F2EC" }}><Ico n="pencil" s={14} c={editing ? "#fff" : "var(--navy)"} /></button>
                <button onClick={() => del(it.id)} aria-label="Remove" style={ghost}><Ico n="trash" s={15} /></button>
              </div>
            </div>
            {editing && (
              <div className="np-pop" style={{ borderTop: "1.5px dashed var(--line)", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="np-mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>Time</span>
                  <input type="time" value={it.time} onChange={(e) => update(it.id, { time: e.target.value })} className="np-in np-mono" style={{ ...inStyle, width: 120, fontSize: 13, padding: "9px 8px" }} />
                </div>
                <textarea value={it.note || ""} onChange={(e) => update(it.id, { note: e.target.value })} placeholder="Add a note — confirmation #, who's coming, what to bring…" rows={3} className="np-in" style={{ ...inStyle, resize: "vertical", lineHeight: 1.45, minHeight: 64 }} />
                <button onClick={() => setEditId(null)} className="np-mono" style={{ alignSelf: "flex-start", background: "var(--navy)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: ".01em" }}>Done</button>
              </div>
            )}
          </div>);
        })}
        </div>}
      <div className="np-card" style={{ borderRadius: 14, padding: 10, display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="np-in np-mono" style={{ ...inStyle, width: 90, fontSize: 12.5, padding: "9px 8px" }} />
        <input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Add a plan…" className="np-in" style={{ ...inStyle, flex: 1 }} />
        <button onClick={add} aria-label="Add plan" style={addBtn}><Ico n="plus" s={18} c="#fff" /></button>
      </div>
    </>
  );
}

// ---- Lineup (Who's playing) ------------------------------------------------
function Lineup({ trip, days, save }) {
  const [artist, setArtist] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState(days[0] || "");
  const [time, setTime] = useState("20:00");
  const [onlyStar, setOnlyStar] = useState(false);
  const [openDir, setOpenDir] = useState(null);
  const [editId, setEditId] = useState(null);

  const add = () => {
    if (!artist.trim()) return;
    save({ ...trip, lineup: [...trip.lineup, { id: uid(), artist: artist.trim(), venue: venue.trim(), date, time, starred: false }] });
    setArtist(""); setVenue("");
  };
  const star = (id) => {
    const act = trip.lineup.find((a) => a.id === id);
    if (!act) return;
    const nowStar = !act.starred;
    const lineup = trip.lineup.map((a) => a.id === id ? { ...a, starred: nowStar } : a);
    let daysObj = trip.days;
    if (act.date) {
      const cur = daysObj[act.date] || [];
      if (nowStar) {
        if (days.includes(act.date) && !cur.some((i) => i.fromLineup === act.id)) {
          const title = act.venue ? `${act.artist} — ${act.venue}` : act.artist;
          daysObj = { ...daysObj, [act.date]: [...cur, { id: uid(), time: act.time || "20:00", title, fromLineup: act.id }] };
        }
      } else if (cur.some((i) => i.fromLineup === act.id)) {
        daysObj = { ...daysObj, [act.date]: cur.filter((i) => i.fromLineup !== act.id) };
      }
    }
    save({ ...trip, lineup, days: daysObj });
  };
  const updateAct = (id, patch) => {
    const act = trip.lineup.find((a) => a.id === id);
    let lineup = trip.lineup.map((a) => a.id === id ? { ...a, ...patch } : a);
    let daysObj = trip.days;
    // Keep a starred act's auto-added Plans entry in sync with edited date/time/venue.
    if (act && act.starred) {
      const next = { ...act, ...patch };
      if (act.date && daysObj[act.date]) {
        daysObj = { ...daysObj, [act.date]: daysObj[act.date].filter((i) => i.fromLineup !== id) };
      }
      if (next.date && days.includes(next.date)) {
        const cur = daysObj[next.date] || [];
        const title = next.venue ? `${next.artist} — ${next.venue}` : next.artist;
        daysObj = { ...daysObj, [next.date]: [...cur, { id: uid(), time: next.time || "20:00", title, fromLineup: id }] };
      }
    }
    save({ ...trip, lineup, days: daysObj });
  };
  const del = (id) => save({ ...trip, lineup: trip.lineup.filter((a) => a.id !== id) });

  let list = trip.lineup.filter((a) => !onlyStar || a.starred);
  const groups = {};
  list.forEach((a) => { const k = a.date || "Unscheduled"; (groups[k] = groups[k] || []).push(a); });
  const keys = Object.keys(groups).sort();

  return (
    <>
      <div className="np-card" style={{ borderRadius: 15, padding: "14px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="np-mono" style={{ fontSize: 10, letterSpacing: ".14em", color: "var(--coral)", textTransform: "uppercase" }}>Festival</div>
          <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.1 }}>Who's playing</div>
        </div>
        <button onClick={() => setOnlyStar((v) => !v)} className="np-mono" style={{ display: "flex", alignItems: "center", gap: 5, border: "1px solid var(--line)", background: onlyStar ? "var(--coral)" : "transparent", color: onlyStar ? "#fff" : "var(--muted)", borderRadius: 10, padding: "7px 11px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
          <Ico n="star" s={13} c={onlyStar ? "#fff" : "var(--coral)"} fill={onlyStar ? "#fff" : "none"} /> Must-see
        </button>
      </div>

      {trip.lineup.length === 0 && <Empty icon="music" title="Build your lineup" sub="Add the acts you're chasing — artist, venue, day, set time. Star the ones you can't miss." compact />}
      {trip.lineup.length > 0 && list.length === 0 && <Empty icon="star" title="No must-sees yet" sub="Tap the star on any act to flag it." compact />}

      {keys.map((k) => (
        <div key={k} style={{ marginBottom: 16 }}>
          <div className="np-mono" style={{ fontSize: 10.5, letterSpacing: ".12em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
            {k === "Unscheduled" ? "Unscheduled — check the poster" : `${fmtChip(k).wd} · ${fmtChip(k).mo} ${fmtChip(k).day}`}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {groups[k].sort((a, b) => (a.time || "").localeCompare(b.time || "")).map((a) => {
              const editing = editId === a.id;
              return (
              <div key={a.id} className="np-card np-pop" style={{ borderRadius: 15, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <button onClick={() => star(a.id)} aria-label="Star" style={{ ...ghost, flexShrink: 0 }}>
                    <Ico n="star" s={20} c="var(--coral)" fill={a.starred ? "var(--coral)" : "none"} />
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.artist}</div>
                    <div className="np-mono" style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                      {a.time || "—"}{a.venue ? ` · ${a.venue}` : ""}
                    </div>
                  </div>
                  <button onClick={() => setEditId(editing ? null : a.id)} aria-label="Edit" style={{ ...iconBtn, background: editing ? "var(--navy)" : "#F5F2EC" }}><Ico n="pencil" s={14} c={editing ? "#fff" : "var(--navy)"} /></button>
                  {a.venue && (
                    <button onClick={() => setOpenDir(openDir === a.id ? null : a.id)} aria-label="Directions" style={{ ...iconBtn, background: openDir === a.id ? "var(--navy)" : "#F5F2EC" }}>
                      <Ico n="route" s={16} c={openDir === a.id ? "#fff" : "var(--navy)"} />
                    </button>
                  )}
                  <button onClick={() => del(a.id)} aria-label="Remove" style={ghost}><Ico n="trash" s={15} /></button>
                </div>
                {editing && (
                  <div className="np-pop" style={{ marginTop: 12, borderTop: "1.5px dashed var(--line)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                    <input value={a.artist} onChange={(e) => updateAct(a.id, { artist: e.target.value })} placeholder="Artist / act" className="np-in" style={inStyle} />
                    <input value={a.venue || ""} onChange={(e) => updateAct(a.id, { venue: e.target.value })} placeholder="Venue / stage" className="np-in" style={inStyle} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <select value={a.date || ""} onChange={(e) => updateAct(a.id, { date: e.target.value })} className="np-in np-mono" style={{ ...inStyle, flex: 1, fontSize: 12.5 }}>
                        <option value="">No date</option>
                        {days.map((d) => <option key={d} value={d}>{`${fmtChip(d).wd} ${fmtChip(d).mo} ${fmtChip(d).day}`}</option>)}
                      </select>
                      <input type="time" value={a.time || ""} onChange={(e) => updateAct(a.id, { time: e.target.value })} className="np-in np-mono" style={{ ...inStyle, width: 96, fontSize: 12.5 }} />
                    </div>
                    <button onClick={() => setEditId(null)} className="np-mono" style={{ alignSelf: "flex-start", background: "var(--navy)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Done</button>
                  </div>
                )}
                {openDir === a.id && a.venue && <MapPanel from={trip.homeBase} to={`${a.venue} ${trip.destination || ""}`} />}
              </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="np-card" style={{ borderRadius: 14, padding: 12, marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
        <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist / act" className="np-in" style={inStyle} />
        <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Venue (e.g. Fort Adams State Park)" className="np-in" style={inStyle} />
        <div style={{ display: "flex", gap: 8 }}>
          {days.length ? (
            <select value={date} onChange={(e) => setDate(e.target.value)} className="np-in np-mono" style={{ ...inStyle, flex: 1, fontSize: 12.5 }}>
              <option value="">No date</option>
              {days.map((d) => <option key={d} value={d}>{`${fmtChip(d).wd} ${fmtChip(d).mo} ${fmtChip(d).day}`}</option>)}
            </select>
          ) : (
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="np-in np-mono" style={{ ...inStyle, flex: 1, fontSize: 12.5 }} />
          )}
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="np-in np-mono" style={{ ...inStyle, width: 96, fontSize: 12.5 }} />
          <button onClick={add} aria-label="Add act" style={addBtn}><Ico n="plus" s={18} c="#fff" /></button>
        </div>
      </div>
    </>
  );
}

// ---- Places (Spots) --------------------------------------------------------
function Places({ trip, days, save }) {
  const [cat, setCat] = useState(PLACE_CATS[0]);
  const [name, setName] = useState("");
  const [openDir, setOpenDir] = useState(null);
  const [openPlan, setOpenPlan] = useState(null);
  const [justAdded, setJustAdded] = useState(null);
  const [nearby, setNearby] = useState(null);   // null = show all; array = within radius
  const [locating, setLocating] = useState(false);
  const [locErr, setLocErr] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  const add = () => {
    if (!name.trim()) return;
    save({ ...trip, places: [...trip.places, { id: uid(), category: cat, name: name.trim() }] });
    setName("");
  };
  const del = (id) => save({ ...trip, places: trip.places.filter((p) => p.id !== id) });
  const addToPlan = (p, iso) => {
    const item = { id: uid(), time: "12:00", title: p.name };
    save({ ...trip, days: { ...trip.days, [iso]: [...(trip.days[iso] || []), item] } });
    setJustAdded({ id: p.id, iso });
  };
  const tagColor = { Beach: "#0E7C9A", Eat: "#C1502E", See: "#0E3A52", Do: "#8A5A2B", Sail: "#1E6B5C", Historic: "#7A5A2E", Shop: "#7A4A6B", Sweet: "#C16B8E", Music: "#5A4A9E", Scenic: "#3A7A5A" };

  const RADIUS_MI = 3;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function distMiles(a, b) {
    const R = 3958.8, rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  async function geocode(q) {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${enc(q)}`, { headers: { Accept: "application/json" } });
      const j = await r.json();
      if (j && j[0]) return { lat: +j[0].lat, lng: +j[0].lon };
    } catch (e) { /* network/sandbox */ }
    return null;
  }

  const findNearby = async () => {
    if (nearby) { setNearby(null); setLocErr(""); return; }
    setLocErr(""); setLocating(true);
    try {
      if (typeof navigator === "undefined" || !navigator.geolocation) throw new Error("no-geo");
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }));
      const me = { lat: pos.coords.latitude, lng: pos.coords.longitude };

      let places2 = trip.places;
      const need = places2.filter((p) => p.lat == null || p.lng == null);
      if (need.length) {
        const coords = {};
        for (const p of need) {
          const c = await geocode(`${p.name} ${trip.destination || ""}`);
          if (c) coords[p.id] = c;
          await sleep(1100); // respect Nominatim's 1 req/sec policy
        }
        if (Object.keys(coords).length) {
          places2 = places2.map((p) => coords[p.id] ? { ...p, ...coords[p.id] } : p);
          save({ ...trip, places: places2 });
        }
      }
      const ranked = places2
        .filter((p) => p.lat != null && p.lng != null)
        .map((p) => ({ place: p, distMi: distMiles(me, { lat: p.lat, lng: p.lng }) }))
        .filter((x) => x.distMi <= RADIUS_MI)
        .sort((a, b) => a.distMi - b.distMi);
      setNearby(ranked);
      if (ranked.length === 0)
        setLocErr(`Nothing saved within ${RADIUS_MI} miles of where you are right now. (Your spots are around ${trip.destination || "your destination"} — this lights up once you're there.)`);
    } catch (e) {
      setLocErr(e && e.message === "no-geo"
        ? "Location services aren't available here. This works once the app is deployed; the in-chat preview can block location access."
        : "Couldn't read your location — access may be blocked. Allow location for this page and try again.");
    }
    setLocating(false);
  };

  const showNearby = Array.isArray(nearby);
  const baseList = showNearby ? nearby.map((x) => x.place) : trip.places;
  const presentCats = PLACE_CATS.filter((c) => trip.places.some((p) => p.category === c));
  const list = filterCat === "All" ? baseList : baseList.filter((p) => p.category === filterCat);
  const distOf = (id) => showNearby ? (nearby.find((x) => x.place.id === id) || {}).distMi : null;

  return (
    <>
      <button onClick={findNearby} disabled={locating} className="np-mono"
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14, borderRadius: 13, padding: "12px 0", fontSize: 13.5, fontWeight: 600, cursor: locating ? "default" : "pointer", border: "1px solid var(--line)", background: showNearby ? "var(--navy)" : "var(--surface)", color: showNearby ? "#fff" : "var(--navy)", letterSpacing: ".01em" }}>
        <Ico n="locate" s={15} c={showNearby ? "#fff" : "var(--navy)"} />
        {locating ? "Finding spots near you…" : showNearby ? "Show all spots" : "Find spots near me (within 3 mi)"}
      </button>

      {locErr && !locating && (
        <div className="np-card" style={{ borderRadius: 13, padding: 13, marginBottom: 12, fontSize: 13.5, color: "var(--muted)", lineHeight: 1.45 }}>{locErr}</div>
      )}

      {presentCats.length > 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {["All", ...presentCats].map((c) => {
            const on = filterCat === c;
            const col = c === "All" ? "var(--navy)" : (tagColor[c] || "var(--navy)");
            const count = c === "All" ? baseList.length : baseList.filter((p) => p.category === c).length;
            return (
              <button key={c} onClick={() => setFilterCat(c)} className="np-mono"
                style={{ fontSize: 11.3, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", padding: "7px 11px", borderRadius: 10, cursor: "pointer", border: `1px solid ${on ? col : "var(--line)"}`, background: on ? col : "var(--surface)", color: on ? "#fff" : "var(--ink)", transition: "all .15s" }}>
                {c}{c !== "All" ? ` ${count}` : ""}
              </button>
            );
          })}
        </div>
      )}

      {showNearby && nearby.length > 0 && (
        <div className="np-mono" style={{ fontSize: 11.3, letterSpacing: ".12em", color: "var(--coral)", textTransform: "uppercase", marginBottom: 10 }}>
          Close by · {nearby.length} within {RADIUS_MI} mi
        </div>
      )}

      {!showNearby && trip.places.length === 0 && <Empty icon="pin" title="No spots saved" sub="Save places to hit. Each gets one-tap directions from your home base." compact />}

      {trip.places.length > 0 && list.length === 0 && filterCat !== "All" && (
        <Empty icon="pin" title={`No ${filterCat} spots ${showNearby ? "nearby" : "yet"}`} sub="Tap another category, or All to see everything." compact />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map((p) => {
          const d = distOf(p.id);
          return (
            <div key={p.id} className="np-card np-pop" style={{ borderRadius: 15, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="np-mono" style={{ fontSize: 10.3, letterSpacing: ".1em", textTransform: "uppercase", color: tagColor[p.category] || "var(--navy)", fontWeight: 700 }}>
                    {p.category}{d != null ? ` · ${d < 0.1 ? "<0.1" : d.toFixed(1)} mi` : ""}
                  </span>
                  <div style={{ fontSize: 18.5, fontWeight: 700, lineHeight: 1.2, marginTop: 3 }}>{p.name}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => { setOpenPlan(openPlan === p.id ? null : p.id); setJustAdded(null); }} aria-label="Add to plans" style={{ ...iconBtn, width: 38, height: 38, background: openPlan === p.id ? "var(--navy)" : "#F5F2EC" }}>
                    <Ico n="cal" s={16} c={openPlan === p.id ? "#fff" : "var(--navy)"} />
                  </button>
                  <button onClick={() => setOpenDir(openDir === p.id ? null : p.id)} aria-label="Directions" style={{ ...iconBtn, width: 38, height: 38, background: openDir === p.id ? "var(--navy)" : "#F5F2EC" }}>
                    <Ico n="route" s={16} c={openDir === p.id ? "#fff" : "var(--navy)"} />
                  </button>
                  <button onClick={() => del(p.id)} aria-label="Remove" style={ghost}><Ico n="trash" s={15} /></button>
                </div>
              </div>
              {p.summary && <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5, marginTop: 9 }}>{p.summary}</div>}
              {p.url && (
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="np-mono" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 11.9, fontWeight: 600, color: "var(--coral)", textDecoration: "none", letterSpacing: ".03em", textTransform: "uppercase" }}>
                  More info ↗
                </a>
              )}
              {openPlan === p.id && (
                <div className="np-pop" style={{ marginTop: 11, borderTop: "1px solid var(--line)", paddingTop: 11 }}>
                  <div className="np-mono" style={{ fontSize: 10.8, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Add to a day</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {days.map((iso) => {
                      const ch = fmtChip(iso);
                      const on = justAdded && justAdded.id === p.id && justAdded.iso === iso;
                      return (
                        <button key={iso} onClick={() => addToPlan(p, iso)} className="np-mono" style={{ fontSize: 11.9, padding: "7px 11px", borderRadius: 10, cursor: "pointer", border: "1px solid var(--line)", background: on ? "var(--navy)" : "var(--surface)", color: on ? "#fff" : "var(--navy)" }}>
                          {ch.wd} {ch.mo} {ch.day}
                        </button>
                      );
                    })}
                  </div>
                  {justAdded && justAdded.id === p.id && (
                    <div className="np-mono" style={{ fontSize: 11.9, color: "var(--coral)", marginTop: 9, lineHeight: 1.4 }}>
                      Added to your Plans at noon — open the Plans tab to set the time.
                    </div>
                  )}
                </div>
              )}
              {openDir === p.id && <MapPanel from={trip.homeBase} to={`${p.name} ${trip.destination || ""}`} />}
            </div>
          );
        })}
      </div>

      {!showNearby && (
        <div className="np-card" style={{ borderRadius: 14, padding: 10, marginTop: 14 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 9, flexWrap: "wrap" }}>
            {PLACE_CATS.map((c) => (
              <button key={c} onClick={() => setCat(c)} className="np-mono" style={{ flex: "1 0 18%", fontSize: 11.6, padding: "6px 0", borderRadius: 8, cursor: "pointer", border: "1px solid var(--line)", background: cat === c ? "var(--navy)" : "transparent", color: cat === c ? "#fff" : "var(--muted)" }}>{c}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Place name…" className="np-in" style={{ ...inStyle, flex: 1 }} />
            <button onClick={add} aria-label="Add place" style={addBtn}><Ico n="plus" s={18} c="#fff" /></button>
          </div>
        </div>
      )}
    </>
  );
}

// ---- shared -----------------------------------------------------------------
function MapPanel({ from, to }) {
  const dest = to || "";
  const src = from
    ? `https://maps.google.com/maps?saddr=${enc(from)}&daddr=${enc(dest)}&output=embed`
    : `https://maps.google.com/maps?q=${enc(dest)}&output=embed`;
  const ext = from
    ? `https://www.google.com/maps/dir/?api=1&origin=${enc(from)}&destination=${enc(dest)}`
    : `https://www.google.com/maps/search/?api=1&query=${enc(dest)}`;
  return (
    <div className="np-pop" style={{ marginTop: 10 }}>
      <div style={{ borderRadius: 13, overflow: "hidden", border: "1px solid var(--line)", background: "#F5F2EC" }}>
        <iframe title={`Map to ${dest}`} src={src} loading="lazy"
          style={{ width: "100%", height: 190, border: 0, display: "block" }} />
      </div>
      <a href={ext} target="_blank" rel="noopener noreferrer" className="np-mono"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 8, background: "var(--navy)", color: "#fff", borderRadius: 11, padding: "11px 0", fontSize: 12.5, fontWeight: 600, textDecoration: "none", letterSpacing: ".01em" }}>
        <Ico n="route" s={15} c="#fff" /> Directions in Google Maps
      </a>
      {from && (
        <div className="np-mono" style={{ fontSize: 10, color: "var(--muted)", textAlign: "center", marginTop: 6 }}>
          from {from}
        </div>
      )}
    </div>
  );
}

function DataTools({ trip, save }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const backup = JSON.stringify(trip);
  const copy = async () => {
    try { await navigator.clipboard.writeText(backup); setMsg("Copied. Paste it into a note to keep it safe."); }
    catch (e) { setMsg("Couldn't auto-copy — select the text below and copy it manually."); }
  };
  const restore = () => {
    try {
      const p = JSON.parse(text);
      if (!p || typeof p !== "object" || !("lineup" in p) || !("places" in p)) { setMsg("That doesn't look like a Newportage backup."); return; }
      save(p); setText(""); setMsg("Restored ✓ — your trip has been replaced with the backup.");
    } catch (e) { setMsg("Couldn't read that — make sure you pasted the whole backup."); }
  };
  if (!open)
    return (
      <div style={{ textAlign: "center", marginTop: 10 }}>
        <button onClick={() => setOpen(true)} className="np-mono" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", opacity: .8 }}>Backup &amp; restore</button>
      </div>
    );
  return (
    <div className="np-card np-pop" style={{ borderRadius: 15, padding: 14, marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span className="np-mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>Backup &amp; restore</span>
        <button onClick={() => { setOpen(false); setMsg(""); }} aria-label="Close" style={ghost}><Ico n="x" s={15} /></button>
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginBottom: 11 }}>
        Your edits already save on this device. Use this to keep a copy you control — handy before an update, or to move your trip to another device.
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={copy} className="np-mono" style={{ flex: 1, minWidth: 130, background: "var(--navy)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 12px", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>Copy backup</button>
        <button onClick={restore} disabled={!text.trim()} className="np-mono" style={{ flex: 1, minWidth: 130, background: text.trim() ? "var(--coral)" : "#F5F2EC", color: text.trim() ? "#fff" : "var(--muted)", border: "none", borderRadius: 10, padding: "10px 12px", fontSize: 11.5, fontWeight: 600, cursor: text.trim() ? "pointer" : "default" }}>Restore from text</button>
      </div>
      {msg && <div className="np-mono" style={{ fontSize: 11, color: "var(--coral)", marginTop: 10, lineHeight: 1.4 }}>{msg}</div>}
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste a backup here to restore it…" rows={3} className="np-in np-mono" style={{ ...inStyle, marginTop: 10, resize: "vertical", fontSize: 11, lineHeight: 1.4, minHeight: 58, width: "100%", boxSizing: "border-box" }} />
      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 9, marginBottom: 4 }}>Or copy your current backup from here:</div>
      <textarea readOnly value={backup} onFocus={(e) => e.target.select()} rows={3} className="np-in np-mono" style={{ ...inStyle, resize: "vertical", fontSize: 10, lineHeight: 1.35, minHeight: 50, width: "100%", boxSizing: "border-box", color: "var(--muted)" }} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ flex: 1, display: "block" }}>
      <span className="np-mono" style={{ fontSize: 10, letterSpacing: ".1em", color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: 5 }}>{label}</span>
      {children}
    </label>
  );
}
function Empty({ icon, title, sub, action, onAction, compact }) {
  return (
    <div className="np-card np-pop" style={{ borderRadius: 17, padding: compact ? "26px 20px" : "40px 24px", textAlign: "center", margin: compact ? "4px 0 16px" : "8px 0" }}>
      <div style={{ display: "grid", placeItems: "center", width: 46, height: 46, borderRadius: 14, background: "#F5F2EC", margin: "0 auto 14px" }}>
        <Ico n={icon} s={22} c="var(--navy)" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 6, lineHeight: 1.45, maxWidth: 280, marginLeft: "auto", marginRight: "auto" }}>{sub}</div>
      {action && <button onClick={onAction} className="np-mono" style={{ marginTop: 16, background: "var(--navy)", color: "#fff", border: "none", borderRadius: 11, padding: "10px 18px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>{action}</button>}
    </div>
  );
}

const inStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 14.5, color: "var(--ink)" };
const addBtn = { width: 42, height: 42, flexShrink: 0, borderRadius: 11, border: "none", background: "var(--coral)", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" };
const iconBtn = { width: 38, height: 38, flexShrink: 0, borderRadius: 11, border: "1px solid var(--line)", display: "grid", placeItems: "center", cursor: "pointer" };
const ghost = { background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 0, display: "grid", placeItems: "center" };
const primaryBtn = { marginTop: 4, background: "var(--navy)", color: "#fff", border: "none", borderRadius: 11, padding: "11px 0", fontWeight: 600, fontSize: 13, cursor: "pointer", letterSpacing: ".01em" };
