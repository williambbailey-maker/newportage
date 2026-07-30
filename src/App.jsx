import React, { useState, useEffect, useRef } from "react";

// ---- styles ---------------------------------------------------------------
// Hyper-Saturated Fluid: a dull leaf/dollar-bill green is the one "shout"
// colour, carrying the liquid hero; everything below sits in a Deep Onyx void
// on frosted glass. Navy is kept from the original palette as the deep accent.
// The old sand background is gone.
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
:root{
  --shout:#7A9B5E;              /* the 60% colour: muted, flat leaf green, never gradient */
  --void:#0A0A0A;               /* Deep Onyx */
  --surface:#171717;            /* Charcoal */
  --gray:#262626;               /* Deep Gray */
  --navy:#0E3A52;               /* kept from the original identity */
  --ink:#0A0A0A;                /* type on the shout colour */
  --white:#FFFFFF;
  --dim:rgba(255,255,255,.60);
  --glass:rgba(255,255,255,.08);
  --glass-line:rgba(255,255,255,.20);
  --ease:cubic-bezier(.22,1,.36,1);
  /* Sampled from the Newport Jazz Festival poster, for the masthead */
  --poster-navy:#0C1430;
  --poster-cream:#F2DFC6;
  --poster-orange:#EB5A23;
  --poster-gold:#F0B81B;
  --poster-blue:#1E86B5;
}
*{box-sizing:border-box;}
html,body{margin:0;background:var(--void);-webkit-text-size-adjust:100%;}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,ui-sans-serif,sans-serif;
  color:var(--white);-webkit-font-smoothing:antialiased;}
.np-mono{font-family:'Inter',ui-sans-serif,sans-serif;font-variant-numeric:tabular-nums;}
.np-app{min-height:100vh;min-height:100dvh;background:var(--void);
  padding-top:max(14px,env(safe-area-inset-top));padding-bottom:env(safe-area-inset-bottom);}
.np-col{max-width:460px;margin:0 auto;padding:0 16px 90px;
  padding-left:max(16px,env(safe-area-inset-left));padding-right:max(16px,env(safe-area-inset-right));}

/* Frosted glass — the only card surface in the void */
.np-card{background:var(--glass);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
  border:1px solid var(--glass-line);border-radius:32px;
  box-shadow:0 24px 60px -20px rgba(0,0,0,.85);}
.np-solid{background:var(--surface);border:1px solid rgba(255,255,255,.10);border-radius:32px;}
.np-display{font-weight:800;letter-spacing:-.035em;line-height:.94;}

/* Tiny functional labels, so the hero type carries the weight */
.np-label{font-size:10px;text-transform:uppercase;letter-spacing:.18em;font-weight:700;}

/* Poster masthead — the festival's own artwork treatment: cream wordmark filling
   a deep navy field, with FESTIVAL kicked out in vermillion beneath it. */
.np-poster{background:var(--poster-navy);border-radius:28px;padding:22px 20px 18px;
  border:1px solid rgba(242,223,198,.14);}
/* Spans the panel on one line like the poster. The available width is the
   viewport minus fixed padding, so the size is affine in vw rather than a plain
   ratio — that keeps the fill constant at every width instead of drifting. The
   upper bound catches the point where the column stops growing at max-width, and
   it all sits ~5% short of full so a wider font substitution can't overflow. */
.np-poster-word{display:block;color:var(--poster-cream);font-weight:800;
  font-size:clamp(22px,calc(12.35vw - 8.9px),47px);line-height:.9;letter-spacing:-.022em;
  text-transform:uppercase;white-space:nowrap;}
.np-poster-sub{display:block;text-align:right;color:var(--poster-orange);font-weight:800;
  font-size:clamp(12px,4.1vw,18px);letter-spacing:.30em;text-transform:uppercase;
  margin-top:6px;padding-right:.1em;}
.np-poster-rule{height:1px;background:rgba(242,223,198,.18);margin:16px 0 13px;}
.np-poster-date{color:var(--poster-cream);font-size:11px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;}
.np-poster-year{color:var(--poster-orange);font-weight:800;font-size:23px;
  letter-spacing:.06em;line-height:1;margin-top:3px;}

.np-in{background:rgba(255,255,255,.06);border:1px solid var(--glass-line);color:var(--white);
  border-radius:999px;}
.np-in:focus{outline:none;border-color:var(--shout);background:rgba(255,255,255,.11);}
textarea.np-in{border-radius:22px;}
select.np-in option{background:var(--surface);color:var(--white);}
input[type="time"].np-in,input[type="date"].np-in{color-scheme:dark;}
::placeholder{color:rgba(255,255,255,.42);}

button{font-family:inherit;transition:transform .12s var(--ease),background .16s,color .16s,border-color .16s;}
button:active{transform:scale(.96);}
input,select,textarea{font-family:inherit;}

@media (prefers-reduced-motion:no-preference){
  .np-pop{animation:pop .42s var(--ease) both;}
  .np-float{animation:float 7s ease-in-out infinite;}
}
@keyframes pop{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
@keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}
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
// Every stored time is 24h "HH:MM" (native <input type="time"> values); this is
// only for the plain-text renders — the inputs themselves already show
// AM/PM per the browser's own locale formatting.
const fmt12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
};
const fmtSlot = (a) => a.time ? (a.endTime ? `${fmt12(a.time)}–${fmt12(a.endTime)}` : fmt12(a.time)) : "Time TBA";
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

// 2026 Newport Jazz Festival — Fort Adams State Park, Jul 31–Aug 2.
// Fri Jul 31 and Sat Aug 1 set times/stages are transcribed from the official
// newportjazz.org schedule. Sunday Aug 2 set times hadn't been published, so the
// remaining announced acts sit on Sunday without a time — tap the pencil to fill
// them in once the poster drops.
const STAGES = ["Fort Stage", "Quad Stage", "Harbor Stage", "Foundation Stage"];
// Poster stage colours — dusty, muted versions of the poster's red/green/blue/
// gold rather than neon, so the palette reads as calm and varied, not loud.
const STAGE_COLOR = {
  "Fort Stage": "#C1697C",
  "Quad Stage": "#5FA07E",
  "Harbor Stage": "#5B8FBD",
  "Foundation Stage": "#BFA35C",
};
const FEST_VENUE = "Fort Adams State Park";
const SEED_VERSION = 3;
const DATES_VERSION = 2;
const SEED_LINEUP = [
  // ---- Friday, July 31 ----
  { artist: "Local Jam", stage: "Fort Stage", date: "2026-07-31", time: "11:30", endTime: "12:00" },
  { artist: "Chicago Underground Duo", stage: "Fort Stage", date: "2026-07-31", time: "12:25", endTime: "13:15" },
  { artist: "Angine de Poitrine", stage: "Fort Stage", date: "2026-07-31", time: "13:40", endTime: "14:30" },
  { artist: "Yebba", stage: "Fort Stage", date: "2026-07-31", time: "15:05", endTime: "16:05" },
  { artist: "Robert Glasper with Bilal & Ari Lennox", stage: "Fort Stage", date: "2026-07-31", time: "16:40", endTime: "17:55" },
  { artist: "Vulfpeck", stage: "Fort Stage", date: "2026-07-31", time: "18:35", endTime: "19:45" },

  { artist: "Braxton Cook", stage: "Quad Stage", date: "2026-07-31", time: "11:05", endTime: "11:50" },
  { artist: "Bernard Purdie & Friends", stage: "Quad Stage", date: "2026-07-31", time: "12:20", endTime: "13:10" },
  { artist: "Anoushka Shankar", stage: "Quad Stage", date: "2026-07-31", time: "13:40", endTime: "14:30" },
  { artist: "Charles Lloyd Sky Quartet", stage: "Quad Stage", date: "2026-07-31", time: "15:00", endTime: "15:50" },
  { artist: "Leon Thomas", stage: "Quad Stage", date: "2026-07-31", time: "16:20", endTime: "17:15" },
  { artist: "Little Simz", stage: "Quad Stage", date: "2026-07-31", time: "17:50", endTime: "18:50" },

  { artist: "Concurrence", stage: "Harbor Stage", date: "2026-07-31", time: "11:00", endTime: "11:40" },
  { artist: "Gena", stage: "Harbor Stage", date: "2026-07-31", time: "12:05", endTime: "12:50" },
  { artist: "Tia Fuller feat. Shamie Fuller Royston", stage: "Harbor Stage", date: "2026-07-31", time: "13:20", endTime: "14:10" },
  { artist: "Mohini Dey", stage: "Harbor Stage", date: "2026-07-31", time: "14:40", endTime: "15:30" },
  { artist: "Lalah Hathaway", stage: "Harbor Stage", date: "2026-07-31", time: "16:00", endTime: "16:55" },
  { artist: "Chief Adjuah", stage: "Harbor Stage", date: "2026-07-31", time: "17:25", endTime: "18:20" },

  { artist: "Newport Jazz Camp", stage: "Foundation Stage", date: "2026-07-31", time: "12:00", endTime: "12:20" },
  { artist: "Nate Smith talks with Charles Lloyd", stage: "Foundation Stage", date: "2026-07-31", time: "13:15", endTime: "13:35" },
  { artist: "Jazz Lab", stage: "Foundation Stage", date: "2026-07-31", time: "14:30", endTime: "15:00" },

  // ---- Saturday, August 1 ----
  { artist: "Local Jam", stage: "Fort Stage", date: "2026-08-01", time: "11:30", endTime: "12:00" },
  { artist: "Butcher Brown", stage: "Fort Stage", date: "2026-08-01", time: "12:30", endTime: "13:20" },
  { artist: "Nate Smith", stage: "Fort Stage", date: "2026-08-01", time: "13:50", endTime: "14:45" },
  { artist: "Cory Wong with Joshua Redman", stage: "Fort Stage", date: "2026-08-01", time: "15:20", endTime: "16:20" },
  { artist: "Gary Clark Jr.", stage: "Fort Stage", date: "2026-08-01", time: "16:55", endTime: "17:55" },
  { artist: "Sonny Miles on a Trane feat. Kamasi Washington & Chief Adjuah", stage: "Fort Stage", date: "2026-08-01", time: "18:30", endTime: "19:45" },

  { artist: "Olive Jones", stage: "Quad Stage", date: "2026-08-01", time: "11:05", endTime: "11:50" },
  { artist: "Mei Semones", stage: "Quad Stage", date: "2026-08-01", time: "12:20", endTime: "13:10" },
  { artist: "John Scofield & Dave Holland", stage: "Quad Stage", date: "2026-08-01", time: "13:40", endTime: "14:30" },
  { artist: "Snarky Puppy", stage: "Quad Stage", date: "2026-08-01", time: "15:10", endTime: "16:00" },
  { artist: "Atomic Habitz feat. Marcus King, Chris Dave & MonoNeon", stage: "Quad Stage", date: "2026-08-01", time: "16:30", endTime: "17:25" },
  { artist: "Jonathan Batiste Trios", stage: "Quad Stage", date: "2026-08-01", time: "18:00", endTime: "19:00" },

  { artist: "Billy Hart Quartet", stage: "Harbor Stage", date: "2026-08-01", time: "11:00", endTime: "11:40" },
  { artist: "Brandon Woody's Upendo", stage: "Harbor Stage", date: "2026-08-01", time: "12:05", endTime: "12:50" },
  { artist: "Maya Delilah", stage: "Harbor Stage", date: "2026-08-01", time: "13:20", endTime: "14:10" },
  { artist: "Linda May Han Oh Trio", stage: "Harbor Stage", date: "2026-08-01", time: "14:40", endTime: "15:30" },
  { artist: "Gotts Street Park", stage: "Harbor Stage", date: "2026-08-01", time: "16:00", endTime: "16:45" },
  { artist: "Terri Lyne Carrington", stage: "Harbor Stage", date: "2026-08-01", time: "17:25", endTime: "18:20" },

  // Foundation Stage talks — the right edge of the schedule was cropped in the
  // source screenshot, so these titles are partial. Edit to correct.
  { artist: "Nate Chinen with Ambrose Akinmusire (title cropped)", stage: "Foundation Stage", date: "2026-08-01", time: "12:00", endTime: "12:25" },
  { artist: "Marcus J. Moore with Terri Lyne Carrington (title cropped)", stage: "Foundation Stage", date: "2026-08-01", time: "13:20", endTime: "13:45" },
  { artist: "Newport Jazz Camp", stage: "Foundation Stage", date: "2026-08-01", time: "14:45", endTime: "15:15" },
].map((a) => ({ venue: FEST_VENUE, starred: false, ...a }));

const DEFAULT = {
  name: "Newport Jazz Fest Trip", destination: "Newport, RI",
  homeBase: "",
  startDate: "2026-07-30", endDate: "2026-08-02",
  days: {}, places: [], lineup: [], seededLineup: false, lineupVersion: 0, datesVersion: 0, plansVersion: 0,
};
// Plans stays free of individual sets — Lineup is the record of who's playing
// when. Instead, each festival day gets one standing block. Plans items carry
// no time of their own, so the hours live in the block's detail line.
const PLANS_VERSION = 2;
const FEST_BLOCKS = [
  { date: "2026-07-31", title: "Newport Jazz Fest", note: "Fort Adams State Park · 12:00 PM – 9:00 PM" },
  { date: "2026-08-01", title: "Newport Jazz Fest", note: "Fort Adams State Park · 12:00 PM – 9:00 PM" },
];
const PLACE_CATS = ["Beach", "Eat", "See", "Do", "Sail", "Historic", "Nature", "Shop", "Sweet", "Music", "Scenic"];
// Muted, "chill" hues per category — colorful without being neon-bright.
const TAG_COLOR = { Beach: "#5B95B0", Eat: "#C1785A", See: "#6E8FB3", Do: "#B98F5E", Sail: "#4FA093", Historic: "#B99A5B", Nature: "#7BA070", Shop: "#B0759B", Sweet: "#C17B94", Music: "#8B85BD", Scenic: "#6BA085" };
const PLACES_VERSION = 3;

export default function App() {
  const [trip, setTrip] = useState(DEFAULT);
  const [tab, setTab] = useState("itinerary");
  const [activeDay, setActiveDay] = useState(null);
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
    } else if ((t.lineupVersion || 0) < SEED_VERSION) {
      // Newport published the real schedule — reseed, carrying over which acts
      // were starred. Plans is never touched by this; Lineup is the record of
      // who's playing when.
      const wasStarred = new Set((t.lineup || []).filter((a) => a.starred).map((a) => a.artist));
      const lineup = SEED_LINEUP.map((s) => ({ ...s, id: uid(), starred: wasStarred.has(s.artist) }));
      t = { ...t, lineup };
      mutated = true;
    }
    if (!t.seededLineup || (t.lineupVersion || 0) < SEED_VERSION) {
      t = { ...t, seededLineup: true, lineupVersion: SEED_VERSION };
      mutated = true;
    }
    if ((t.datesVersion || 0) < DATES_VERSION) {
      // Trip now ends Sunday with the festival — Monday Aug 3 is dropped. Anything
      // parked on a dropped day stays in storage, so extending the dates brings it back.
      t = { ...t, startDate: DEFAULT.startDate, endDate: DEFAULT.endDate, datesVersion: DATES_VERSION };
      mutated = true;
    }
    if ((t.placesVersion || 0) < PLACES_VERSION) {
      // The curated spot lists (and the Kingston tab) are retired. Keep two
      // things: anything you typed in yourself, and anything already sitting on
      // a day in Plans. A suggestion is identifiable by having a `summary`.
      const planned = new Set();
      Object.keys(t.days || {}).forEach((k) => {
        (t.days[k] || []).forEach((i) => planned.add((i.title || "").trim().toLowerCase()));
      });
      const keep = (p) => !p.summary || planned.has((p.name || "").trim().toLowerCase());
      // Kingston entries that made it onto a day move across into places so they
      // don't vanish with the tab.
      const rescued = (t.kingston || []).filter((k) => planned.has((k.name || "").trim().toLowerCase()));
      const kept = (t.places || []).filter(keep);
      const have = new Set(kept.map((p) => (p.name || "").toLowerCase()));
      t = {
        ...t,
        places: [...kept, ...rescued.filter((k) => !have.has((k.name || "").toLowerCase()))],
        kingston: undefined,
        kingstonVersion: undefined,
        placesVersion: PLACES_VERSION,
      };
      mutated = true;
    }
    if ((t.plansVersion || 0) < PLANS_VERSION) {
      // Plans items no longer carry a time or a note. Drop any set entries a
      // prior install picked up from starring, strip stored times and free-text
      // notes, then (re)seed the standing festival blocks.
      const daysObj = {};
      Object.keys(t.days || {}).forEach((k) => {
        daysObj[k] = (t.days[k] || [])
          .filter((i) => !i.fromLineup && i.title !== "Newport Jazz Fest")
          .map(({ time, note, ...rest }) => rest);
      });
      FEST_BLOCKS.forEach((b) => {
        daysObj[b.date] = [...(daysObj[b.date] || []), { id: uid(), title: b.title, note: b.note }];
      });
      t = { ...t, days: daysObj, plansVersion: PLANS_VERSION };
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
      <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "grid", placeItems: "center" }}>
        <style>{STYLE}</style>
        <span className="np-label" style={{ color: "rgba(255,255,255,.5)" }}>Loading your trip…</span>
      </div>
    );

  const TABS = [["itinerary", "cal", "Plans"], ["lineup", "music", "Lineup"], ["places", "pin", "Spots"]];

  return (
    <div className="np-app">
      <style>{STYLE}</style>
      <div className="np-col">
        <Header trip={trip} countdown={countdown} />

        <div className="np-card" style={{ display: "flex", gap: 4, padding: 5, borderRadius: 999, marginTop: 20, position: "sticky", top: 10, zIndex: 5 }}>
          {TABS.map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "10px 0", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 11.5, fontWeight: 700, letterSpacing: "-.01em", background: tab === id ? "var(--shout)" : "transparent", color: tab === id ? "var(--ink)" : "rgba(255,255,255,.55)" }}>
              <Ico n={icon} s={13} w={2.4} /> {label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 20 }} key={tab} className="np-pop">
          {tab === "itinerary" && <Itinerary trip={trip} days={days} activeDay={activeDay} setActiveDay={setActiveDay} save={save} />}
          {tab === "lineup" && <Lineup trip={trip} days={days} save={save} />}
          {tab === "places" && <Places trip={trip} days={days} save={save} />}
        </div>

        <div style={{ textAlign: "center", marginTop: 30 }}>
          <a href={`https://www.google.com/maps/search/?api=1&query=${enc(trip.destination || "Newport, RI")}`}
            target="_blank" rel="noopener noreferrer" className="np-label"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "var(--white)", textDecoration: "none", border: `1px solid var(--glass-line)`, borderRadius: 999, padding: "11px 20px", background: "var(--glass)" }}>
            <Ico n="pin" s={13} c="var(--shout)" w={2.4} /> Map
          </a>
        </div>
        <div className="np-label" style={{ textAlign: "center", marginTop: 18, color: "rgba(255,255,255,.30)" }}>
          Newportage · v{APP_VERSION}
        </div>
        <DataTools trip={trip} save={save} />
      </div>
    </div>
  );
}

// ---- Header ---------------------------------------------------------------
// Display only, styled after the festival poster: cream wordmark on the poster's
// deep navy, FESTIVAL kicked out in vermillion, dates and year at the foot.
function Header({ trip, countdown }) {
  const s = trip.startDate ? fmtChip(trip.startDate) : null;
  const e = trip.endDate ? fmtChip(trip.endDate) : null;
  const range = s && e ? `${s.mo} ${s.day} – ${e.mo} ${e.day}` : "Dates not set";
  const year = trip.startDate ? trip.startDate.slice(0, 4) : "";

  return (
    <div className="np-poster" style={{ marginTop: 2 }}>
      <span className="np-poster-word">Newport Jazz</span>
      <span className="np-poster-sub">Festival</span>

      <div className="np-poster-rule" />

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
        <div>
          <div className="np-poster-date">{range}</div>
          {year && <div className="np-poster-year">{year}</div>}
        </div>
        {countdown !== null && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 23, fontWeight: 800, lineHeight: 1, letterSpacing: "-.01em", color: "var(--poster-gold)" }}>
              {countdown > 0 ? countdown : countdown === 0 ? "Today" : "—"}
            </div>
            <div className="np-poster-date" style={{ opacity: .7, marginTop: 4 }}>
              {countdown > 1 ? "days to go" : countdown === 1 ? "day to go" : countdown === 0 ? "you're off" : "in progress"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Itinerary --------------------------------------------------------------
// Plans is an unordered per-day list — no times, no editing, no notes. Each
// item shows what it is, and a map button when there's somewhere to route to.
function Itinerary({ trip, days, activeDay, setActiveDay, save }) {
  const [title, setTitle] = useState("");
  const [openDirId, setOpenDirId] = useState(null);
  if (!days.length)
    return <Empty icon="cal" title="No trip days" sub="The trip runs Jul 30 – Aug 2." compact />;

  const items = trip.days[activeDay] || [];
  const add = () => {
    if (!title.trim()) return;
    save({ ...trip, days: { ...trip.days, [activeDay]: [...items, { id: uid(), title: title.trim() }] } });
    setTitle("");
  };
  const del = (id) => save({ ...trip, days: { ...trip.days, [activeDay]: items.filter((i) => i.id !== id) } });

  return (
    <>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
        {days.map((iso) => {
          const c = fmtChip(iso); const on = iso === activeDay; const n = (trip.days[iso] || []).length;
          return (
            <button key={iso} onClick={() => setActiveDay(iso)} style={{ flex: "0 0 auto", width: 56, padding: "9px 0", borderRadius: 28, cursor: "pointer", border: on ? "1px solid var(--shout)" : "1px solid var(--glass-line)", background: on ? "var(--shout)" : "rgba(255,255,255,.06)", color: on ? "var(--ink)" : "var(--white)", textAlign: "center" }}>
              <div className="np-mono" style={{ fontSize: 9.5, letterSpacing: ".08em", opacity: .7, textTransform: "uppercase" }}>{c.wd}</div>
              <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>{c.day}</div>
              <div className="np-mono" style={{ fontSize: 9, opacity: on ? .85 : .5 }}>{n ? `${n}·plan` : "—"}</div>
            </button>
          );
        })}
      </div>
      {items.length === 0
        ? <Empty icon="nav" title="Nothing planned yet" sub="Add a beach block, dinner, a drive — anything you want on this day." compact />
        : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{items.map((it) => {
          const dirOpen = openDirId === it.id;
          // An item added from Spots carries its source record, so it renders with
          // the same info as its Spots card — category, summary, directions.
          const sourcePlace = it.fromPlace ? trip.places.find((p) => p.id === it.fromPlace) : null;
          const mapTarget = sourcePlace ? `${sourcePlace.name} ${sourcePlace.near || trip.destination || ""}` : null;
          return (
          <div key={it.id} className="np-card np-pop" style={{ borderRadius: 32, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 18.5, fontWeight: 700, lineHeight: 1.2 }}>{it.title}</div>

                {sourcePlace && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 7, marginTop: 7 }}>
                      <Pill label={sourcePlace.category} color={TAG_COLOR[sourcePlace.category]} />
                      {sourcePlace.near && <span className="np-mono" style={{ fontSize: 11, color: "var(--dim)" }}>{sourcePlace.near}</span>}
                    </div>
                    {sourcePlace.summary && <div style={{ fontSize: 13.5, color: "var(--dim)", lineHeight: 1.5, marginTop: 9 }}>{sourcePlace.summary}</div>}
                    {sourcePlace.url && (
                      <a href={sourcePlace.url} target="_blank" rel="noopener noreferrer" className="np-mono" style={{ display: "flex", width: "fit-content", alignItems: "center", gap: 4, marginTop: 8, fontSize: 11.9, fontWeight: 600, color: "var(--shout)", textDecoration: "none", letterSpacing: ".03em", textTransform: "uppercase" }}>
                        More info ↗
                      </a>
                    )}
                  </>
                )}

                {/* Seeded blocks carry their own standing detail (e.g. the fest
                    venue and end time); it's fixed copy, not an editable note. */}
                {it.note && <div style={{ fontSize: 13.5, color: "var(--dim)", lineHeight: 1.5, marginTop: 9 }}>{it.note}</div>}
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {mapTarget && (
                  <button onClick={() => setOpenDirId(dirOpen ? null : it.id)} aria-label="Directions" style={{ ...iconBtn, width: 38, height: 38, background: dirOpen ? "var(--shout)" : "rgba(255,255,255,.06)" }}><Ico n="route" s={16} c={dirOpen ? "var(--ink)" : "var(--white)"} /></button>
                )}
                <button onClick={() => del(it.id)} aria-label="Remove" style={ghost}><Ico n="trash" s={15} /></button>
              </div>
            </div>
            {dirOpen && mapTarget && <MapPanel from={trip.homeBase} to={mapTarget} />}
          </div>);
        })}
        </div>}
      <div className="np-card" style={{ borderRadius: 28, padding: 10, marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Add a plan…" className="np-in" style={{ ...inStyle, flex: 1 }} />
        <button onClick={add} aria-label="Add plan" style={addBtn}><Ico n="plus" s={18} c="var(--ink)" /></button>
      </div>
    </>
  );
}

// ---- Lineup (Who's playing) ------------------------------------------------
function Lineup({ trip, days, save }) {
  const [artist, setArtist] = useState("");
  const [stage, setStage] = useState(STAGES[0]);
  const [date, setDate] = useState(days[0] || "");
  const [time, setTime] = useState("20:00");
  // Opens on your must-sees; the pill (or the empty-state button) flips to the full schedule.
  const [onlyStar, setOnlyStar] = useState(true);
  const [stageFilter, setStageFilter] = useState("All");

  const add = () => {
    if (!artist.trim()) return;
    save({ ...trip, lineup: [...trip.lineup, { id: uid(), artist: artist.trim(), stage, venue: FEST_VENUE, date, time, endTime: "", starred: false }] });
    setArtist("");
  };
  // Starring only flags the act itself — Lineup is the record of sets, Plans
  // stays free of individual set entries.
  const star = (id) => {
    save({ ...trip, lineup: trip.lineup.map((a) => a.id === id ? { ...a, starred: !a.starred } : a) });
  };
  const del = (id) => save({ ...trip, lineup: trip.lineup.filter((a) => a.id !== id) });

  let list = trip.lineup.filter((a) => (!onlyStar || a.starred) && (stageFilter === "All" || a.stage === stageFilter));
  const groups = {};
  list.forEach((a) => { const k = a.date || "Unscheduled"; (groups[k] = groups[k] || []).push(a); });
  const keys = Object.keys(groups).sort();
  const presentStages = STAGES.filter((s) => trip.lineup.some((a) => a.stage === s));

  return (
    <>
      <div className="np-card" style={{ borderRadius: 32, padding: "14px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="np-mono" style={{ fontSize: 10, letterSpacing: ".14em", color: "var(--shout)", textTransform: "uppercase" }}>Festival</div>
          <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.1 }}>{onlyStar ? "Your must-sees" : "Who's playing"}</div>
        </div>
        <button onClick={() => setOnlyStar((v) => !v)} aria-pressed={onlyStar} className="np-mono" style={{ display: "flex", alignItems: "center", gap: 5, border: "1px solid var(--glass-line)", background: onlyStar ? "var(--shout)" : "transparent", color: onlyStar ? "var(--ink)" : "var(--dim)", borderRadius: 999, padding: "7px 11px", fontSize: 11, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
          <Ico n="star" s={13} c={onlyStar ? "var(--ink)" : "var(--shout)"} fill={onlyStar ? "#fff" : "none"} /> {onlyStar ? "Must-see" : "All sets"}
        </button>
      </div>

      {presentStages.length > 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {["All", ...presentStages].map((s) => {
            const on = stageFilter === s;
            const col = s === "All" ? "var(--shout)" : (STAGE_COLOR[s] || "var(--shout)");
            return (
              <button key={s} onClick={() => setStageFilter(s)} className="np-mono"
                style={{ fontSize: 11.3, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", padding: "7px 11px", borderRadius: 999, cursor: "pointer", border: `1px solid ${on ? col : "var(--glass-line)"}`, background: on ? col : "rgba(255,255,255,.06)", color: on ? "var(--ink)" : "var(--white)", transition: "all .15s" }}>
                {s === "All" ? "All stages" : s.replace(" Stage", "")}
              </button>
            );
          })}
        </div>
      )}

      {trip.lineup.length === 0 && <Empty icon="music" title="Build your lineup" sub="Add the acts you're chasing — artist, stage, day, set time. Star the ones you can't miss." compact />}
      {trip.lineup.length > 0 && list.length === 0 && (
        onlyStar
          ? <Empty icon="star" title="No must-sees yet"
              sub="Open the full schedule and tap the star on any set. Starred sets live here and drop onto the right day in Plans."
              action="Show full schedule" onAction={() => { setOnlyStar(false); setStageFilter("All"); }} compact />
          : <Empty icon="star" title="Nothing on this stage" sub="Pick another stage, or All stages." compact />
      )}

      {keys.map((k) => (
        <div key={k} style={{ marginBottom: 16 }}>
          <div className="np-mono" style={{ fontSize: 10.5, letterSpacing: ".12em", color: "var(--dim)", textTransform: "uppercase", marginBottom: 8 }}>
            {k === "Unscheduled" ? "Unscheduled — check the poster" : `${fmtChip(k).wd} · ${fmtChip(k).mo} ${fmtChip(k).day}`}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {groups[k].slice().sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99")).map((a) => (
              <div key={a.id} className="np-card np-pop" style={{ borderRadius: 32, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <button onClick={() => star(a.id)} aria-label="Star" style={{ ...ghost, flexShrink: 0 }}>
                    <Ico n="star" s={20} c="var(--shout)" fill={a.starred ? "var(--shout)" : "none"} />
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 18.5, fontWeight: 700, lineHeight: 1.2 }}>{a.artist}</div>
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 7, marginTop: 7 }}>
                      <span className="np-mono" style={{ fontSize: 11.5, fontWeight: 600, color: a.time ? "var(--white)" : "var(--dim)" }}>{fmtSlot(a)}</span>
                      {a.stage ? <Pill label={a.stage.replace(" Stage", "")} color={STAGE_COLOR[a.stage]} /> : <DashedPill label="Stage TBA" />}
                    </div>
                  </div>
                  <button onClick={() => del(a.id)} aria-label="Remove" style={ghost}><Ico n="trash" s={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="np-card" style={{ borderRadius: 28, padding: 12, marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
        <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist / act" className="np-in" style={inStyle} />
        <select value={stage} onChange={(e) => setStage(e.target.value)} className="np-in np-mono" style={{ ...inStyle, fontSize: 12.5 }}>
          <option value="">Stage TBA</option>
          {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ display: "flex", gap: 8 }}>
          {days.length ? (
            <select value={date} onChange={(e) => setDate(e.target.value)} className="np-in np-mono" style={{ ...inStyle, flex: 1, fontSize: 12.5 }}>
              <option value="">No date</option>
              {days.map((d) => <option key={d} value={d}>{`${fmtChip(d).wd} ${fmtChip(d).mo} ${fmtChip(d).day}`}</option>)}
            </select>
          ) : (
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="np-in np-mono" style={{ ...inStyle, flex: 1, fontSize: 12.5 }} />
          )}
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="np-in np-mono" style={{ ...inStyle, width: 128, fontSize: 12.5 }} />
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
  // fromPlace lets the Plans card render the full spot info — category, summary,
  // directions — instead of just a bare title.
  const addToPlan = (p, iso) => {
    const item = { id: uid(), time: "", title: p.name, fromPlace: p.id };
    save({ ...trip, days: { ...trip.days, [iso]: [...(trip.days[iso] || []), item] } });
  };

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
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14, borderRadius: 26, padding: "12px 0", fontSize: 13.5, fontWeight: 600, cursor: locating ? "default" : "pointer", border: "1px solid var(--glass-line)", background: showNearby ? "var(--shout)" : "rgba(255,255,255,.06)", color: showNearby ? "var(--ink)" : "var(--white)", letterSpacing: ".01em" }}>
        <Ico n="locate" s={15} c={showNearby ? "var(--ink)" : "var(--white)"} />
        {locating ? "Finding spots near you…" : showNearby ? "Show all spots" : "Find spots near me (within 3 mi)"}
      </button>

      {locErr && !locating && (
        <div className="np-card" style={{ borderRadius: 26, padding: 13, marginBottom: 12, fontSize: 13.5, color: "var(--dim)", lineHeight: 1.45 }}>{locErr}</div>
      )}

      {presentCats.length > 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {["All", ...presentCats].map((c) => {
            const on = filterCat === c;
            const col = c === "All" ? "var(--shout)" : (TAG_COLOR[c] || "var(--shout)");
            const count = c === "All" ? baseList.length : baseList.filter((p) => p.category === c).length;
            return (
              <button key={c} onClick={() => setFilterCat(c)} className="np-mono"
                style={{ fontSize: 11.3, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", padding: "7px 11px", borderRadius: 999, cursor: "pointer", border: `1px solid ${on ? col : "var(--glass-line)"}`, background: on ? col : "rgba(255,255,255,.06)", color: on ? "var(--ink)" : "var(--white)", transition: "all .15s" }}>
                {c}{c !== "All" ? ` ${count}` : ""}
              </button>
            );
          })}
        </div>
      )}

      {showNearby && nearby.length > 0 && (
        <div className="np-mono" style={{ fontSize: 11.3, letterSpacing: ".12em", color: "var(--shout)", textTransform: "uppercase", marginBottom: 10 }}>
          Close by · {nearby.length} within {RADIUS_MI} mi
        </div>
      )}

      {!showNearby && trip.places.length === 0 && <Empty icon="pin" title="No spots saved" sub="Save places to hit. Each gets one-tap directions from your home base." compact />}

      {trip.places.length > 0 && list.length === 0 && filterCat !== "All" && (
        <Empty icon="pin" title={`No ${filterCat} spots ${showNearby ? "nearby" : "yet"}`} sub="Tap another category, or All to see everything." compact />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map((p) => (
          <PlaceCard key={p.id} p={p} trip={trip} days={days} dist={distOf(p.id)}
            onDelete={() => del(p.id)} onAddToPlan={addToPlan} />
        ))}
      </div>

      {!showNearby && (
        <div className="np-card" style={{ borderRadius: 28, padding: 10, marginTop: 14 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 9, flexWrap: "wrap" }}>
            {PLACE_CATS.map((c) => (
              <button key={c} onClick={() => setCat(c)} className="np-mono" style={{ flex: "1 0 18%", fontSize: 11.6, padding: "6px 0", borderRadius: 999, cursor: "pointer", border: "1px solid var(--glass-line)", background: cat === c ? "var(--shout)" : "transparent", color: cat === c ? "var(--ink)" : "var(--dim)" }}>{c}</button>
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
// Category / stage badge, shared so every card that shows one — Spots, Lineup,
// and a sourced Plans item — renders it identically.
function Pill({ label, color }) {
  return (
    <span className="np-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink)", background: color || "var(--shout)", borderRadius: 999, padding: "4px 9px" }}>
      {label}
    </span>
  );
}
function DashedPill({ label }) {
  return (
    <span className="np-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--dim)", border: "1px dashed var(--glass-line)", borderRadius: 999, padding: "3px 8px" }}>
      {label}
    </span>
  );
}

// One saved place. Owns its own expand state so the list does not track it by id.
function PlaceCard({ p, trip, days, dist, onDelete, onAddToPlan }) {
  const [openDir, setOpenDir] = useState(false);
  const [openPlan, setOpenPlan] = useState(false);
  const [addedTo, setAddedTo] = useState(null);
  // `near` lets an out-of-town place geocode against its own town rather than
  // the trip destination.
  const region = p.near || trip.destination || "";

  return (
    <div className="np-card np-pop" style={{ borderRadius: 32, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 7 }}>
            <Pill label={p.category} color={TAG_COLOR[p.category]} />
            {dist != null && <span className="np-mono" style={{ fontSize: 11, color: "var(--dim)" }}>{dist < 0.1 ? "<0.1" : dist.toFixed(1)} mi</span>}
          </div>
          <div style={{ fontSize: 18.5, fontWeight: 700, lineHeight: 1.2, marginTop: 7 }}>{p.name}</div>
          {p.near && <div className="np-mono" style={{ fontSize: 11, color: "var(--dim)", marginTop: 3 }}>{p.near}</div>}
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => { setOpenPlan((v) => !v); setAddedTo(null); }} aria-label="Add to plans" style={{ ...iconBtn, width: 38, height: 38, background: openPlan ? "var(--shout)" : "rgba(255,255,255,.06)" }}>
            <Ico n="cal" s={16} c={openPlan ? "var(--ink)" : "var(--white)"} />
          </button>
          <button onClick={() => setOpenDir((v) => !v)} aria-label="Directions" style={{ ...iconBtn, width: 38, height: 38, background: openDir ? "var(--shout)" : "rgba(255,255,255,.06)" }}>
            <Ico n="route" s={16} c={openDir ? "var(--ink)" : "var(--white)"} />
          </button>
          <button onClick={onDelete} aria-label="Remove" style={ghost}><Ico n="trash" s={15} /></button>
        </div>
      </div>
      {p.summary && <div style={{ fontSize: 13.5, color: "var(--dim)", lineHeight: 1.5, marginTop: 9 }}>{p.summary}</div>}
      {p.url && (
        <a href={p.url} target="_blank" rel="noopener noreferrer" className="np-mono" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 11.9, fontWeight: 600, color: "var(--shout)", textDecoration: "none", letterSpacing: ".03em", textTransform: "uppercase" }}>
          More info ↗
        </a>
      )}
      {openPlan && (
        <div className="np-pop" style={{ marginTop: 11, borderTop: "1px solid var(--glass-line)", paddingTop: 11 }}>
          <div className="np-mono" style={{ fontSize: 10.8, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 8 }}>Add to a day</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {days.map((iso) => {
              const ch = fmtChip(iso);
              const on = addedTo === iso;
              return (
                <button key={iso} onClick={() => { onAddToPlan(p, iso); setAddedTo(iso); }} className="np-mono" style={{ fontSize: 11.9, padding: "7px 11px", borderRadius: 999, cursor: "pointer", border: "1px solid var(--glass-line)", background: on ? "var(--shout)" : "rgba(255,255,255,.06)", color: on ? "var(--ink)" : "var(--white)" }}>
                  {ch.wd} {ch.mo} {ch.day}
                </button>
              );
            })}
          </div>
          {addedTo && (
            <div className="np-mono" style={{ fontSize: 11.9, color: "var(--shout)", marginTop: 9, lineHeight: 1.4 }}>
              Added to your Plans as an any-time item — open Plans to give it a time.
            </div>
          )}
        </div>
      )}
      {openDir && <MapPanel from={trip.homeBase} to={`${p.name} ${region}`} />}
    </div>
  );
}

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
      <div style={{ borderRadius: 26, overflow: "hidden", border: "1px solid var(--glass-line)", background: "rgba(255,255,255,.06)" }}>
        <iframe title={`Map to ${dest}`} src={src} loading="lazy"
          style={{ width: "100%", height: 190, border: 0, display: "block" }} />
      </div>
      <a href={ext} target="_blank" rel="noopener noreferrer" className="np-mono"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 8, background: "var(--shout)", color: "#fff", borderRadius: 999, padding: "11px 0", fontSize: 12.5, fontWeight: 600, textDecoration: "none", letterSpacing: ".01em" }}>
        <Ico n="route" s={15} c="#fff" /> Directions in Google Maps
      </a>
      {from && (
        <div className="np-mono" style={{ fontSize: 10, color: "var(--dim)", textAlign: "center", marginTop: 6 }}>
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
        <button onClick={() => setOpen(true)} className="np-mono" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--dim)", opacity: .8 }}>Backup &amp; restore</button>
      </div>
    );
  return (
    <div className="np-card np-pop" style={{ borderRadius: 32, padding: 14, marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span className="np-mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--dim)" }}>Backup &amp; restore</span>
        <button onClick={() => { setOpen(false); setMsg(""); }} aria-label="Close" style={ghost}><Ico n="x" s={15} /></button>
      </div>
      <div style={{ fontSize: 12, color: "var(--dim)", lineHeight: 1.5, marginBottom: 11 }}>
        Your edits already save on this device. Use this to keep a copy you control — handy before an update, or to move your trip to another device.
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={copy} className="np-mono" style={{ flex: 1, minWidth: 130, background: "var(--shout)", color: "var(--ink)", border: "none", borderRadius: 999, padding: "10px 12px", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>Copy backup</button>
        <button onClick={restore} disabled={!text.trim()} className="np-mono" style={{ flex: 1, minWidth: 130, background: text.trim() ? "var(--shout)" : "rgba(255,255,255,.06)", color: text.trim() ? "#fff" : "var(--dim)", border: "none", borderRadius: 999, padding: "10px 12px", fontSize: 11.5, fontWeight: 600, cursor: text.trim() ? "pointer" : "default" }}>Restore from text</button>
      </div>
      {msg && <div className="np-mono" style={{ fontSize: 11, color: "var(--shout)", marginTop: 10, lineHeight: 1.4 }}>{msg}</div>}
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste a backup here to restore it…" rows={3} className="np-in np-mono" style={{ ...inStyle, marginTop: 10, resize: "vertical", fontSize: 11, lineHeight: 1.4, minHeight: 58, width: "100%", boxSizing: "border-box" }} />
      <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 9, marginBottom: 4 }}>Or copy your current backup from here:</div>
      <textarea readOnly value={backup} onFocus={(e) => e.target.select()} rows={3} className="np-in np-mono" style={{ ...inStyle, resize: "vertical", fontSize: 10, lineHeight: 1.35, minHeight: 50, width: "100%", boxSizing: "border-box", color: "var(--dim)" }} />
    </div>
  );
}

function Empty({ icon, title, sub, action, onAction, compact }) {
  return (
    <div className="np-card np-pop" style={{ padding: compact ? "34px 24px" : "48px 26px", textAlign: "center", margin: compact ? "4px 0 16px" : "8px 0" }}>
      <div style={{ display: "grid", placeItems: "center", width: 54, height: 54, borderRadius: 999, background: "var(--shout)", margin: "0 auto 18px" }}>
        <Ico n={icon} s={23} c="var(--ink)" w={2.4} />
      </div>
      <div className="np-display" style={{ fontSize: 24 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: "var(--dim)", marginTop: 10, lineHeight: 1.55, maxWidth: 290, marginLeft: "auto", marginRight: "auto" }}>{sub}</div>
      {action && (
        <button onClick={onAction} className="np-label"
          style={{ marginTop: 20, background: "var(--shout)", color: "var(--ink)", border: "none", borderRadius: 999, padding: "14px 26px", cursor: "pointer" }}>
          {action}
        </button>
      )}
    </div>
  );
}

// Shared control styling. Pills everywhere — no mid-size radii anywhere in the UI.
const inStyle = { width: "100%", padding: "13px 17px", fontSize: 14.5, border: "none" };
const addBtn = { width: 46, height: 46, flexShrink: 0, borderRadius: 999, border: "none", background: "var(--shout)", color: "var(--ink)", display: "grid", placeItems: "center", cursor: "pointer" };
const iconBtn = { width: 40, height: 40, flexShrink: 0, borderRadius: 999, border: "1px solid var(--glass-line)", background: "rgba(255,255,255,.06)", display: "grid", placeItems: "center", cursor: "pointer" };
const ghost = { background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.42)", padding: 0, display: "grid", placeItems: "center" };
const primaryBtn = { marginTop: 4, background: "var(--shout)", color: "var(--ink)", border: "none", borderRadius: 999, padding: "14px 0", fontWeight: 700, fontSize: 12.5, cursor: "pointer", letterSpacing: ".01em" };
