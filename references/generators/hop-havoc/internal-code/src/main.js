import * as THREE from 'https://esm.sh/three@0.160.0'; 

/* ============================================================
   HOPHAVOC — three.js arena roguelite mod.
   Twin-stick shooter: survive 500s, kill waves, collect XP,
   pick 1-of-3 upgrades, master Supers, Apex heroes and OP gear.
   ============================================================ */

// ---------------- CORE TUNING / MOD SYSTEMS ----------------
const WIN_TIME = 500;
const FINAL_CHALLENGE_TIMEOUT = 999;
const FINAL_TIMEOUT_WARN_AT = 900;
const FINAL_TIMEOUT_URGENT_AT = 970;

// Berserk escalation = OP-tier feature. Runs with no OP item (CLEAN / no-OP) get a
// constant pace; an OP loadout gets the final-30s surge.
const INSANE_BERSERK_START = WIN_TIME - 30;
const INSANE_FINAL_BERSERK_START = WIN_TIME - 10;
const INSANE_BERSERK_SPEED = 1.08;
const INSANE_FINAL_BERSERK_SPEED = 1.18;

// Pursuit speed on Insane, split by loadout. Insane's chase speed was the one pressure a
// CLEAN (no-OP) loadout had no answer to: nothing in a no-OP kit lets you outrun anything, so
// every enemy simply stayed glued to you for 500s. A clean run now pursues at +8% instead of
// +16% (still the fastest difficulty, above Hard's +5%) while an OP loadout keeps the full
// +16% it signed up for. HP, incoming damage and spawn cadence are untouched for both.
const INSANE_CLEAN_SPEED_MULT = 1.08;

// Insane pressure is split by loadout, exactly like the chase speed and the berserk surge:
// a CLEAN / no-OP run (no OP hero, no OP gun) gets the eased numbers, while any OP hero or OP
// gun keeps the original full-pressure Insane grid. `opLoadoutEquipped()` is the single
// condition that decides which side of the split a run is on.
// THE EASE IS CLEAN-ONLY: sb 0.06 -> 0.054, hpMult 1.45 -> 1.305, incomingMult 1.28 -> 1.152.
// Pursuit speed is deliberately NOT eased for either side: 1.16 x 0.9 = 1.044 is at/below
// Hard's 1.05, and Insane must never be as soft as Hard on any axis.
const INSANE_EASE = 0.9;
const INSANE_PRESSURE_OP = Object.freeze({ sb:0.06, hpMult:1.45, incomingMult:1.28 });
const INSANE_PRESSURE_CLEAN = Object.freeze({
  sb:0.06*INSANE_EASE, hpMult:1.45*INSANE_EASE, incomingMult:1.28*INSANE_EASE,
});
const insanePressure = () => (opLoadoutEquipped() ? INSANE_PRESSURE_OP : INSANE_PRESSURE_CLEAN);

// Premium pressure stacks, plus the run-start broadcast that explains them. These literals
// used to be repeated by hand in spawnEnemy, updateSpawning AND the notices, so a tuning
// change could leave a broadcast describing a run the player was not in. Every consumer now
// reads these objects: `heavies` = heavy-enemy HP multiplier, `cadence` = spawn-interval
// multiplier, `extraEvery` = waves between the bonus enemy, `flavour` = notice-only tail.
const DRAGON_CHAOS_PRESSURE = Object.freeze({ heavies:1.26, cadence:0.80, extraEvery:4, flavour:' · BRIAR WARDENS' });
const OP_STACK_PRESSURE     = Object.freeze({ heavies:1.12, cadence:0.88, extraEvery:3, flavour:'' });

const fmtMult = v => String(+Number(v).toFixed(3));               // 1.28, never 1.280
const pressurePct = v => {                                        // 1.26 -> 26 ; 1.305 -> 30.5
  const pct = Math.round((v-1)*1000)/10;                          // x10 round kills 30.4999 float noise
  return Number.isInteger(pct) ? String(pct) : pct.toFixed(1);
};
// The premium pressure stacks apply on EVERY difficulty (Bahamut on Easy gets dragon chaos),
// but the final-30s surge is Insane + at least one OP item only (insaneBerserkStage), so the
// surge tail is only announced on runs that can actually reach it.
const berserkSurgeTail = () => (G.diff==='Insane' && insaneBerserkEligible()) ? ' · BERSERK SURGE IN THE FINAL 30s' : '';
const pressureNoticeLine = p =>
  'HEAVIES +'+pressurePct(p.heavies)+'% HP · WAVE INTERVAL −'+Math.round((1-p.cadence)*100)+'%'
  +' · +1 ENEMY EVERY '+p.extraEvery+(p.extraEvery===3?'RD':'TH')+' WAVE'+p.flavour+berserkSurgeTail();
const insaneGridNoticeLine = p =>
  'HEAVIES +'+pressurePct(p.hpMult)+'% HP · INCOMING ×'+fmtMult(p.incomingMult);

// Economy pacing:
// 450s survival milestones = 1,880 raw run-gold -> ~626 CR before pickups.
// 500s clear adds +1,200 raw -> ~1,026 CR before pickups.
const RUN_GOLD_PER_CREDIT = 3;
const BAHAMUT_HUB_PRICE = 8000;

// End-of-run score / reward normalization. Live score gain stays untouched so perks, HUD
// feedback and the original run economy keep their existing feel; this is settled once,
// immediately before the result screen and leaderboard submission.
const SCORE_MAX = 9999999;
const SCORE_BALANCE = Object.freeze({
  difficulty:{
    Easy:   { score:0.85, credits:0.85 },
    Normal: { score:1.00, credits:1.00 },
    Hard:   { score:1.30, credits:1.20 },
    Insane: { score:1.70, credits:1.45 },
  },
  // Final exams begin at 500s, but the hard gameplay deadline remains 999s.
  // A clear at <=600s earns the full efficiency reward; it smoothly falls to zero
  // at 900s. Clears from 900-999s are still valid, just without a speed reward.
  speed:{ fullAt:600, zeroAt:900, curve:1.25 },
  ending:{
    survival:{ paceBonus:0.00, flatScore:0,     speedCredits:0    },
    dragon:  { paceBonus:1.00, flatScore:12000, speedCredits:1200 },
    apex7:   { paceBonus:1.10, flatScore:15000, speedCredits:1600 },
  },
});
const HERO_BASE = { hp:60, speed:75, hitInvince:2, dodge:0, armor:0, shield:0, crit:0 };
const HERO_R = 12;
// BLINK's PHASE RUN. A 3s sustained dash: +100% Move Speed, +30% Fire Rate, no stamina cost,
// phased for the WHOLE run (immune window == run length) - enemy bodies, contact damage and
// physical obstacles pass straight through, while area attacks (flames, lasers, beams,
// shockwaves, other zone hazards) still land. See heroPhasing()/damageHero()/phaseRunFireMul().
const PHASE_RUN_DURATION = 3.0;
const PHASE_RUN_PHASE_DURATION = 3.0;   // phased window inside the run; == duration today, so the whole run is immune
const PHASE_RUN_FIRE_RATE_BONUS = 0.30; // gun fire rate while the run is active (interval / (1+bonus))
// PHASE RUN's entire look: the hero goes semi-transparent for the window (a blink/fade). There
// is no aura rig, no after-image trail and no recolour - by request the translucent body IS the
// effect, so this opacity is all it needs. See applyPhaseVisual.
const PHASE_BODY_OPACITY = 0.5;
// MAG's BURNING MAGNET Super. The planted magnet is a radial field: it accelerates every enemy
// inside it inward AND kills their outward drift, so a full crowd genuinely converges instead of
// leaking out one body at a time. MAG's own MAGNET stat feeds the field strength, so his passive
// and his Super scale off the same number. The pull is deliberately violent - 1300+ units/s²
// against enemies that walk at ~40-75 units/s - so a body it has hold of is not walking any more,
// it is debris in flight, which is exactly how it reads on screen.
//
// MAG is NOT phased and NOT immune while the magnet is up. The rule is PER BODY and only ever
// about that body: while the field is actively dragging an enemy, that enemy has flown loose of
// normal contact and passes through MAG's body without shoving him or hurting him (a meteor does
// not punch you - it goes through you). Everything else is untouched: a body the field is NOT
// holding hits MAG exactly as usual, a dragged body starts hitting him again the moment the field
// ends, and body contact is the ONLY thing ever refused - flames, lasers, beams, shockwaves,
// hostile projectiles, melee lunges and every `area:` hit land on him as they always did.
// See magnetPulled() / applyMagnetGhost() / updateMagnetGhosting() and the `kind:'magnet'`
// branch of updateEffects.
const MAGNET_FX_RADIUS = 200;            // pull field radius (upsized from 170)
const MAGNET_PULL_ACCEL = 1300;          // inward acceleration, units/s²
const MAGNET_PULL_MAGNET_BONUS = 26;     // extra inward acceleration per point of MAGNET
const MAGNET_PULL_GHOST_OPACITY = 0.40;  // opacity of a body the field is dragging (it is in flight)
const MAGNET_PULL_GHOST_TINT = new THREE.Color(0xd8ecff);  // ...and the colour wash that says so
const MAGNET_PULL_GHOST_TINT_AMT = 0.50;
// dash ability pathway (see PERKS sprint/dash/stamcharge/dashtrail)
const SPIN_ORBIT_R = 40;            // spinner orb orbital radius (must match updateSummons)
const DASH_DIST = 110;                // short emergency reposition; distinct from sustained Sprint
const DASH_STAMINA_COST = 40;           // two dashes from full stamina still leave Sprint's 20-stamina start threshold
const DASH_TRAIL_W = 2*(SPIN_ORBIT_R*2); // 2x the orb perks' orbital diameter
const DASH_RING_R = 2*SPIN_ORBIT_R;      // 2x the orb perks' orbital radius
const SPRINT_START_STAMINA = 20;          // a fresh sprint cannot start below this amount
const HERO_HIT_DMG = 20;
const BULLET_SPEED = 500;
const EXPM = (lvl) => 10 + lvl;                       // XP threshold: 10, 11, 12, 13…
const ARENA = { w:480, h:270 };                       // world "area" in units² (480×270) — the camera shows exactly this much world
const VIEW = { halfW:240, halfH:135 };                // camera half-extents, recomputed to keep the world area constant at any aspect
const PIXEL_CRUNCH = 3; // desktop: render at 1/3 res, CSS-upscale = pixel-art crunch
const MOBILE_PIXEL_CRUNCH = 4; // LOW mobile quality tier
const MOBILE_GRAPHICS_CRUNCH = Object.freeze({
  original:PIXEL_CRUNCH,      // ORIGINAL quality tier
  low:MOBILE_PIXEL_CRUNCH,    // LOW quality tier
  verylow:6,                  // budget-phone fallback
});

function mobileGraphicsCrunch(){
  const q=String(SAVE?.mobileGraphicsQuality||'original');
  return MOBILE_GRAPHICS_CRUNCH[q]||MOBILE_GRAPHICS_CRUNCH.original;
}
function applyMobileGraphicsQuality(){
  if(!G.renderer) return;
  G.renderer.setPixelRatio(1/mobileGraphicsCrunch());
  G.renderer.setSize(innerWidth,innerHeight,false);
}

// Stackable bone-bullet summon proc. Low per-hit chance is intentional because
// piercing/multi-bone sources can roll once for every enemy actually hit.
const BONE_DOG_PROC_CHANCE = 0.03;       // BONE BARREL / normal bone-gun hits
const PERK_BONE_DOG_PROC_CHANCE = 0.03;  // Backbone / Explode Bones hits
const BONE_DOG_LIFE = 8;

// Explode / Explode Bones corpse-proc safety.
// Successful death explosions stay at the original full 10% chance and full power. The only
// safety valve is a burst -> truce rhythm: several corpses may proc rapidly, but once a dense
// chain produces too many successful corpse activations in one burst, corpse necromancy rests
// briefly. Already-spawned explosive bullets, weapon explosions, Explosive Crits, Eggers,
// Stink Bugs, Supers, etc. are untouched and keep resolving normally during the truce.
const DEATH_EXPLOSION_CHANCE = 0.10;
const DEATH_EXPLOSION_BURST_CAP = 6;
const DEATH_EXPLOSION_BURST_GAP = 0.80;
const DEATH_EXPLOSION_TRUCE = 3.00;

function deathExplosionCanRoll(){
  const h=G.hero;
  if(!h) return false;
  const now=G.time||0;
  if(now < (h.deathExplosionRestUntil||0)) return false;
  if(now-(h.deathExplosionLastAt??-Infinity) > DEATH_EXPLOSION_BURST_GAP){
    h.deathExplosionBurst=0;
  }
  return true;
}

function recordDeathExplosionProc(){
  const h=G.hero;
  if(!h) return;
  const now=G.time||0;
  if(now-(h.deathExplosionLastAt??-Infinity) > DEATH_EXPLOSION_BURST_GAP){
    h.deathExplosionBurst=0;
  }
  h.deathExplosionLastAt=now;
  h.deathExplosionBurst=(h.deathExplosionBurst||0)+1;
  if(h.deathExplosionBurst>=DEATH_EXPLOSION_BURST_CAP){
    h.deathExplosionRestUntil=now+DEATH_EXPLOSION_TRUCE;
    h.deathExplosionBurst=0;
    h.deathExplosionLastAt=-Infinity;
  }
}

// Poison identity: attrition that scales with the TARGET. A stack set always bites for at least
// the flat poison value, and on top of that takes POISON_PCT_PER_SEC of the target's MAX HP per
// second - so poison is the one damage source that cannot be outgrown by a bigger health bar:
// it is the boss/elite killer, and it stays deliberately weak against trash (where a % of 30 HP
// is a rounding error and the flat floor is all you get). Repeated applications stack to four with
// diminishing damage gains instead of multiplying linearly: 100% -> 160% -> 195% -> 215%. Poison
// also applies only a very light built-in movement penalty (10%); the dedicated Slowdown perk
// remains the real crowd-control tool. Poison EXPIRES (3s) - it has to be maintained.
const POISON_MAX_STACKS = 4;
const POISON_STACK_MULT = Object.freeze([1.00, 1.60, 1.95, 2.15]);
const POISON_SLOW_MULT = 0.90;
const POISON_PCT_PER_SEC = 0.007;   // share of MAX HP per second, per stack set (before the multipliers)

// Fire identity: FLAT damage that never goes out - the mirror image of poison. Each ignition adds
// one stack (capped here), a stack always keeps the strongest source's per-stack value, and the
// burn has NO expiry: once something is alight it burns until it dies. That bounded flat total is
// what makes fire the crowd answer (it melts small packs and chains between enemies that touch)
// and what keeps it honest against a boss, where 5 stacks of the base 5-DPS burn is 25 DPS against
// a 10,000 HP bar. Fire is for minions; poison is for the big ones. Retune the cap here.
const FIRE_MAX_STACKS = 5;
// VENOM POOL (TOXIC BLASTER) tuning. The pool is deliberately the small sibling of a toxic
// cloud: about half the cloud's tick strength, and it builds stacks over ~1s instead of
// capping them instantly. Its LOOK is the shared toxic cloud itself (see makeToxicCloudMesh).
// The hazard radius and the DRAWN radius are separate on purpose: the pool poisons a wide area
// but is drawn as a small puff, so a toxic run leaves small green puffs on the floor instead of
// floor-wide blobs. Retune size/life/strength here.
const POISON_POOL_R = 24;        // hazard radius: what the pool actually ticks poison in
const POISON_POOL_VIS_R = 12;    // sphere radius it is DRAWN at (~1/4 of a full cloud's volume)
const POISON_POOL_LIFE = 2.8;
const POISON_POOL_TICK = 0.4;
const POISON_POOL_STRENGTH = 0.6;
// Concurrent pool cap. At the base 0.9s cadence only ~3 pools are ever alive at once, but a
// fire-rate build can spit globs several times faster, and an uncapped pool per glob would
// carpet the floor (and grow the mesh count with it). The oldest pool is retired instead.
const POISON_POOL_MAX = 8;

// Player-facing hard caps. Keep this small and explicit: these are mechanics that genuinely
// stop gaining value, not arbitrary ceilings for normal late-run scaling.
const RUN_STAT_CAPS = Object.freeze({
  crit:1.00,
  dodge:0.75,
  armor:0.60,
  magnetRadius:100,
  // Stacks of the two projectile cards. Each stack adds ONE FULL BASE VOLLEY (baseVolleySize),
  // so +2 means every weapon can reach 3x its own shot.
  projectileBonus:2,
  spinners:2,
  unlimitedSuperCooldownMin:1.00,
});

// XP attraction saturates at RUN_STAT_CAPS.magnetRadius, so Magnet mods stop mattering at
// +50. Derived so the runtime radius calculation and the picker's "already maxed" test
// cannot drift apart.
const HERO_BASE_MAGNET_RADIUS = 50;
const RUN_MAGNET_MOD_CAP = RUN_STAT_CAPS.magnetRadius - HERO_BASE_MAGNET_RADIUS;

function enemyStatusMoveMult(e){
  const coreSlow=Math.min(e?.slowT>0?(e.slowPct||0.5):1,e?.poison?POISON_SLOW_MULT:1);
  return coreSlow*((e?.wolfHowlSlowT||0)>0?0.85:1);
}

function poisonPctDps(e){
  // The max-HP half of poison. It scales with the same poison mods (and the ammo-scaling perk)
  // as the flat half, so investing in poison pays off on a boss exactly the way it does on trash:
  // it just never decays into irrelevance as the health bar grows.
  const maxHp=e?.maxHp||0;
  if(!(maxHp>0)) return 0;
  let d=maxHp*POISON_PCT_PER_SEC*G.hero.mods.poison;
  if(G.hero.poisonScalesAmmo) d*=(G.hero.maxAmmo/10);
  return d;
}

function applyPoison(e,dps,duration=3){
  if(!e || e.dead || !(dps>0)) return;
  const prev=e.poison;
  const stacks=Math.min(POISON_MAX_STACKS,(prev?.stacks||0)+1);
  // Flat floor OR the % of max HP, whichever is bigger - so trash takes exactly what it always
  // took, and only enemies past roughly 1,400 HP (at base poison) start feeling the share.
  const incoming=Math.max(dps,poisonPctDps(e));
  // A weaker follow-up can add a stack but can never downgrade a stronger poison already on target.
  const baseDps=Math.max(prev?.baseDps||prev?.dps||0,incoming);
  e.poison={
    baseDps,
    stacks,
    dps:baseDps*POISON_STACK_MULT[stacks-1],
    t:Math.max(prev?.t||0,duration)
  };
}

// The single way in for every ignition in the game: guns, perk actives, supers and fire zones all
// call this. Each application adds a stack (capped by FIRE_MAX_STACKS) and raises the per-stack
// value to the strongest source seen - so a flamethrower stack is worth more than a light-burn
// stack - and the burn never expires.
function applyBurn(e,dps,opts={}){
  if(!e || e.dead || !(dps>0)) return;
  const prev=e.burn;
  const per=Math.max(prev?.per||prev?.dps||0,dps);
  const stacks=Math.min(FIRE_MAX_STACKS,(prev?.stacks||0)+1);
  e.burn={ per, stacks, dps:per*stacks, t:Infinity };
  if(opts.inferno || prev?.inferno) e.burn.inferno=true;
}

function recomputeView(){
  const area = ARENA.w*ARENA.h;                       // 129600 units² of world is always visible
  const a = innerWidth/innerHeight;
  VIEW.halfW = Math.sqrt(area*a)/2;
  VIEW.halfH = Math.sqrt(area/a)/2;
  // The tilted camera (CAM_OFF y/z) foreshortens vertical world-z by sin(tilt)≈0.81, so it
  // shows more floor than the frustum — extend the walkable arena to the visible floor edges.
  const tl = Math.hypot(CAM_OFF.y, CAM_OFF.z);
  const sinT = CAM_OFF.y/tl, cosT = CAM_OFF.z/tl;
  VIEW.visW = VIEW.halfW*1.02;              // visible floor half-extent, x
  VIEW.visH = VIEW.halfH*1.02/sinT;         // visible floor half-extent, z
  VIEW.walkShift = (cosT/sinT)*9;           // z-shift of the walkable range at the hero's body height
}

const GUNS = [
  { id:'arcritter', name:'AR-CRITTER',    dmg:24, ammo:12, fire:0.4,  proj:1, reload:1.5,  range:0.6, crit:30, arc:0,   kb:75, speed:500, special:['long','bounce'],         color:0x6aa3ff, desc:'Precision rifle. 30% crit chance, long reach.' },
  { id:'blastersg', name:'BLASTER-SG12',  dmg:12, ammo:6,  fire:0.48, proj:5, reload:1.4,  range:0.45,crit:0,  arc:62,  kb:38, speed:300, special:['spread','short'],       color:0x8f9ba8, desc:'5-shell shotgun spread. Tighter, faster blast with a 6-shot magazine.' },
  { id:'scrapper',  name:'SCRAPPER',      dmg:10, ammo:40, fire:0.4,  proj:1, reload:1.5,  range:0.6, crit:0,  arc:0,   kb:75, speed:400, special:['long','bounce','dblshot'], color:0xc9a86a, desc:'Fast double-shot. Big mag, long reach.' },
  { id:'rustyp',    name:'RUSTY-P',       dmg:20, ammo:6,  fire:0.3,  proj:1, reload:1.0,  range:0.2, crit:10, arc:0,   kb:75, speed:500, special:['short','bounce'],       color:0xa0713f, desc:'Sawed-off brute. Massive damage, point-blank range, 10% crit.' },
  { id:'boom',      name:'BOOM BLASTER',  dmg:50, ammo:6,  fire:1.75, proj:1, reload:2,    range:0.1, crit:0,  arc:0,   kb:75, speed:150, special:['explode','long','bounce'], color:0xff7a3d, desc:'Explosive shells. Big splash damage.' },
  { id:'taipan',    name:'TAIPAN',        dmg:14, ammo:16, fire:0.5,  proj:1, reload:1,    range:0.5, crit:0,  arc:0,   kb:75, speed:350, special:['poison','long'],          color:0x7ce04f, desc:'Venom darts. Poison stacks to 4 with diminishing damage and a light slow, and bites for a share of max HP - deadliest on bosses.' },
  { id:'mg',        name:'MG-ECLIPSE',    dmg:10, ammo:140,fire:0.30, proj:1, reload:2,    range:0.6, crit:20, arc:0,   kb:75, speed:500, special:['long','bounce'],         color:0x8b7dff, desc:'Machine gun. 20% crit, huge magazine.' },
  { id:'r6',        name:'R6-BOUNCER',    dmg:15, ammo:50, fire:0.7,  proj:1, reload:1.75, range:2.5, crit:10, arc:0,   kb:75, speed:500, special:['bounce','long'],        color:0xffd166, desc:'Bullets ricochet off walls for 2.5s. 10% crit.' },
  { id:'toxic',     name:'TOXIC BLASTER', dmg:22, ammo:25, fire:0.90, proj:1, reload:1.20, range:0.8, crit:0,  arc:0,   kb:75, speed:800, special:['poison','long'], poisonMult:1.25, pool:{r:24, life:2.8, strength:0.6}, color:0x49c23f, desc:'Chunky poison globs. Stronger venom that stacks to 4 with a light slow and bites for a share of max HP - deadliest on bosses. Every glob bursts into a small venom cloud where it lands.', detail:'Chunky poison globs with stronger venom: poison stacks to 4 with diminishing damage and a light slow, and every stack bites for a share of the target max HP on top of the flat poison value - so a stack set that barely tickles a goblin tears through a boss. Each glob leaves a small radius-24 venom cloud on the floor where it lands, the same sickly haze as the Stink Bug and HAZE\'s ultimate at a smaller size, splashing a burst of poison on anything standing in it. The cloud ticks every 0.4s for 2.8s, so it keeps whatever it catches poisoned after the glob is gone instead of capping the stacks instantly.', role:'Venom globber / lingering area denial.' },
  { id:'splitter',  name:'SPLITTER',      dmg:13, ammo:15, fire:0.4,  proj:3, reload:0.75, range:0.6, crit:0,  arc:180, kb:75, speed:500, special:['spread','slow','mid','bounce'], color:0x7fd4ff, desc:'Triple spread that slows whatever it hits.' },
  { id:'void',      name:'VOID RIFLE',    dmg:30, ammo:4,  fire:0.4,  proj:1, reload:1.75, range:0.6, crit:0,  arc:0,   kb:75, speed:800, special:['void','long','bounce'], color:0x23283a, desc:'Black-hole rounds. 50% chance to refund 1-2 ammo.' },
  // Standard arsenal: ZNEEKE, BUGSY'S ZAPPER, BB-NOZIA, BONE BARREL, SALAMANDRO
  { id:'zneeke',     name:'ZNEEKE',        dmg:8,  ammo:60, fire:0.24, proj:1, reload:0.5,  range:0.24,crit:0,  arc:10,  kb:35, speed:600, special:['spread','short'],         color:0x9fd8ff, desc:'True rapid-fire plasma pistol. Huge magazine, fast reload, slight spread.' },
  { id:'zapper',     name:"BUGSY'S ZAPPER",dmg:13, ammo:25, fire:0.5,  proj:1, reload:1.2,  range:0.5, crit:0,  arc:0,   kb:30, speed:0,   special:['beam','mid'],            color:0x5be3ff, desc:'Short electric beam that zaps everything it crosses.' },
  { id:'bouncecannon',name:'BB-NOZIA',     dmg:8,  ammo:12, fire:0.5,  proj:1, reload:1.5,  range:0.5, crit:0,  arc:0,   kb:30, speed:700, special:['bounce','explode'],      color:0x5b8dff, desc:'Bouncing shells that explode. Hold fire to ramp the shells up to ×2.5 size and damage; charging never slows the gun.', cardDesc:'Bouncing shells that explode. Hold fire to ramp them up to ×2.5 - it keeps auto-firing while it charges.', detail:'Bouncing shells that explode. Holding fire ramps the shells from ×1 to ×2.5 over 0.75s, and the charge is KEPT while fire is held: firing does not spend it, so a steadily held trigger fires fully charged shells at the normal interval. Full charge means ×1.65 direct and explosion damage, ×1.45 blast radius, ×1.45 knockback and the ×2.5 shell size. Releasing fire - or tapping - drops the charge straight back to ×1, so quick taps fire plain shells. Charging never slows the fire rate.', role:'Charged ricochet cannon.' },
  { id:'bonebarrel', name:'BONE BARREL',   dmg:18, ammo:80, fire:0.6,  proj:1, reload:1,    range:0.4, crit:0,  arc:12,  kb:100,speed:400, special:['bone','pierce','long'],  color:0xe8e0d0, desc:'Piercing bone rounds. Every bone-bullet hit has a 3% chance to summon a temporary Bone Dog for 8s; multiple procs can stack.', detail:'Piercing bone rounds with a stackable summon proc: every enemy actually hit by a bone bullet independently rolls a 3% chance to summon a temporary skeletal Bone Dog for 8 seconds. Piercing and multi-bone effects can therefore build a pack.', role:'Piercing summon rifle.' },
  { id:'salamandro', name:'SALAMANDRO',    dmg:6,  ammo:10, fire:0.65, proj:4, reload:1.2,  range:0.28,crit:0,  arc:18,  kb:48, speed:450, special:['spread','short'], burnDps:8, color:0xff8a3d, desc:'4-pellet fire-blast. Fast close-range volleys ignite targets, and burn stacks and never goes out.' },
  // --- RudBo mod: premium / OP arsenal. Eight weapons are OP-tier:
  // MISSILE, ROCKET, GRENADE, SUNLANCE, GRAVITY MAUL, WILD-FOX, AEGIS, INFERNO.
  // OP weapons use distinct damage, control, defense and mobility mechanics.
  
  { id:'missile',   name:'MISSILE LAUNCHER',dmg:46, ammo:4,  fire:0.70, proj:1, reload:1.80, range:0.55,crit:15, arc:0,   kb:78, speed:340, special:['homing','explode','long'], blast:40, explosionScale:0.74, homingTurn:2.8, homingLife:1.35, smokeTrail:true, smokeEvery:0.10, smokeScale:0.85, color:0xff4f6f, price:4300, op:true, desc:'Heavy homing blasts with limited guidance.', detail:'Four missiles per magazine. Each missile deals 46 base damage with 78 knockback and a radius-40 explosion; guidance applies during the opening flight phase before the missile commits to its path.', role:'Pursuit launcher.' },
  { id:'rocket',    name:'ROCKET LAUNCHER', dmg:90, ammo:2,  fire:1.35, proj:1, reload:1.80, range:0.35,crit:0,  arc:0,   kb:320,speed:500, special:['explode','long'],       blast:170, blastInner:65, explosionScale:0.95, smokeTrail:true, smokeEvery:0.075, smokeScale:1.15, color:0x8a6a3f, price:4400, op:true, desc:'Two-shot siege rocket · huge radius-170 shockwave with a full-power inner core and steep outer falloff.', detail:'Two rockets per magazine. Direct impact stays 90 base damage / 320 knockback. The explosion is visually much larger: full splash inside radius 65, then both splash damage and blast knockback fall continuously to zero at radius 170. The larger spectacle is therefore close to the old radius-120 full blast in total area pressure rather than a raw screen-clear buff.', role:'Siege launcher.' },
  { id:'grenade',   name:'GRENADE LAUNCHER',dmg:34, ammo:4,  fire:0.90, proj:1, reload:1.90, range:0.45,crit:0,  arc:0,   kb:58, speed:235, special:['arc','explode','cluster'], blast:34, explosionScale:0.80, clusterCount:5, clusterScale:0.65, color:0x7aa85f, price:4100, op:true, desc:'Arcing cluster grenades for area denial.', detail:'Each arcing shot creates a radius-34 primary blast and five delayed mini-grenades for area saturation.', role:'Area denial lobber.' },
  { id:'sunlance',  name:'SUNLANCE',       dmg:46, ammo:9,  fire:0.50, proj:1, reload:1.25, range:1.25,crit:10, arc:0,   kb:42, speed:0,   special:['opbeam','long','pierce'], refractChance:0.24, refractSecondChance:0.34, refractThirdChance:0.14, refractScale:0.28, refractLen:100, sunBurnDps:5, color:0xfff08a, price:4600, op:true, desc:'Piercing solar beam with Pyro burn and random prism splits.', detail:'Full-line piercing beam · 46 base damage · 42 knockback · 10% crit · 5-DPS Pyro-scaled burn that stacks and never goes out. A hit has a 24% prism chance: one random branch appears, with independent 34% and 14% rolls for second and third branches. Branches deal 28% base beam damage and do not seek targets.', role:'Line piercer / Pyro prism laser.' },
  { id:'gravmaul',  name:'GRAVITY MAUL',   dmg:60, ammo:8,  fire:0.52, proj:1, reload:1.10, range:0,   crit:25, arc:0,   kb:760,speed:0,   special:['melee'], meleeR:64, pushR:84, pullR:170, pullKb:520, meleeArc:132, xpPullR:195, xpPullStep:84, moveMul:1.20, color:0xbda4ff, price:4300, op:true, desc:'Heavy gravity hammer with blunt launch and crowd pull.', detail:'Direct striking fan · 60 base damage · 760 knockback. A radius-170 gravity field pulls enemies toward a stand-off boundary outside the direct-hit zone. A timed point-blank frontal swing can home-run one ordinary enemy projectile.', role:'Heavy melee launch / gravity setup.' },
  { id:'vulpine',   name:'WILD-FOX',        dmg:24, ammo:18, fire:0.30, proj:1, reload:0.90, range:1.1, crit:25, arc:0,   kb:85, speed:1100, special:['long','bounce'], bounces:4, color:0xff7a3d, price:4000, op:true, desc:'Fast ricochet rifle with sharp crit pressure.', detail:'24 base damage · 18-round magazine · fire rate 3.33/s · reload time 0.90s · 25% crit · projectile speed 1100 · range 1.1 · up to 4 ricochets per shot.', role:'Fast ricochet rifle.' },
  { id:'aegis',     name:'AEGIS',           dmg:40, ammo:12, fire:0.46, proj:1, reload:1.30, range:0, crit:25, arc:0, kb:1050, speed:0, special:['shieldbash'], bashR:60, pushR:126, bashArc:120, guardArc:150, guardArcPerExtra:60, maxGuardArc:270, autoPushR:86, autoPushKb:360, autoPushEvery:1.00, reflectDmg:26, moveMul:1.12, color:0x74d9ff, price:4700, op:true, desc:'Mirror guard with a 1050-knockback inner bash and harmless outer shove.', detail:'Radius-60 inner fan · 40 base damage · 1050 knockback to every caught enemy. The outer fan extends to 126 and deals no damage while applying shove force. Automatic guard shove is harmless and single-target within radius 86. Projectile-count perks set the guard arc to 150°, 210° or 270°; the rear remains open.', role:'Area bash / single-target auto-guard / reflect shield.' },
  { id:'inferno',   name:'INFERNO FLAMETHROWER', dmg:6.2, ammo:95, fire:0.070, proj:1, reload:1.80, range:0, crit:0, arc:0, kb:18, speed:0, special:['flameop'], flameR:138, flameArc:64, burnDps:24, moveMul:1.12, color:0xff6a2a, price:4500, op:true, desc:'Radius-138 fire cone whose afterburn stacks up to 5 and never goes out.', detail:'64° fire cone · radius 138 · 6.2 direct tick damage · 18 knockback · Move Speed ×1.12 · each contact adds a 24-DPS fire stack (up to 5) that never goes out.', role:'Close cone burner / permanent burning pressure.' },
];

const OP_WEAPON_ICONS = Object.freeze({
  missile:'🚀', rocket:'💥', grenade:'💣', sunlance:'☀️',
  gravmaul:'🔨', vulpine:'🦊', aegis:'🛡️', inferno:'🔥',
});
function weaponIcon(g){
  if(!g) return '🔫';
  if(OP_WEAPON_ICONS[g.id]) return OP_WEAPON_ICONS[g.id];
  if(g.special?.includes('shieldbash')) return '🛡️';
  if(g.special?.includes('flameop')) return '🔥';
  if(g.special?.includes('melee')) return '🔨';
  return '🔫';
}

const ENEMIES = {
  goblingreen:{ hp:30,  speed:35, kb:0,   r:9,  color:0x46662e, kind:'chase', hop:4.5 },
  egger:      { hp:50,  speed:35, kb:0,   r:12, color:0xd3c6a2, kind:'chase', hop:4 },
  shooter:    { hp:75,  speed:35, kb:30,  r:12, color:0x7786d8, kind:'shooter' },
  goblinred:  { hp:100, speed:23, kb:0,   r:11, color:0xae4634, kind:'chase', hop:4.5 },
  steelcrab:  { hp:6500,speed:35, kb:0,   r:22, color:0x4a4f57, kind:'chase' },
  goblinblue: { hp:150, speed:39, kb:0,   r:11, color:0x3f7ab8, kind:'chase', hop:4.5 },
  troll:      { hp:200, speed:5,  kb:0,   r:20, color:0x4c7a3a, kind:'chase' },
  laserdude:  { hp:1600,speed:20, kb:0,   r:15, color:0x2b2f3a, kind:'laser',  elite:true, brain:true },
  pigsassin:  { hp:80,  speed:48, kb:0,   r:11, color:0xf29bb8, kind:'chase', hop:5 },
  absorber:   { hp:2500,speed:25, kb:0,   r:28, color:0x3a2e4f, kind:'absorber', elite:true, brain:true, shielded:true },
  briarwarden:{ hp:2600,speed:27, kb:120, r:18, color:0x32281f, kind:'briar', elite:true, brain:true },
  thornwall:  { hp:520, speed:0,  kb:999, r:10, color:0x6f5635, kind:'stationary', noReward:true },
  shielder:   { hp:600,  speed:0, kb:0,   r:36, color:0x5b8dff, kind:'shield', dead:false },
  dummy:      { hp:5000,speed:0,  kb:0,   r:14, color:0x9a7442, kind:'stationary' },
  box3:       { hp:10,  speed:35, kb:0,   r:5.5, color:0xff9540, kind:'chase', hop:3, float:true },
  boss1:      { hp:10000,speed:14, kb:150, r:32, color:0x8a1f2d, kind:'boss', boss:true, bossColor:0xff5a5a },
  boss2:      { hp:5000, speed:16, kb:150, r:28, color:0x6a2fa8, kind:'boss', boss:true, bossColor:0xcf7dff },
  boss3:      { hp:2500, speed:20, kb:150, r:24, color:0x25172f, kind:'boss', boss:true, bossColor:0xff6bd6 },
  bahamut:    { hp:30000,speed:36, kb:520, r:29, color:0x3d2d5c, kind:'boss', boss:true, bossColor:0xffd166 },
};

const SPAWNS = [
  { type:'goblingreen', at:0,   interval:6.5, count:4, side:'all',     sb:true,  sideOff:'goblin' },
  { type:'troll',       at:15,  interval:15,  count:4, side:'all',     sb:true,  sideOff:'big' },
  { type:'box3',        at:75,  interval:11,  count:7, side:'random',  sb:true,  sideOff:'big' },
  { type:'egger',       at:100, interval:8,   count:1, side:'random',  sb:true,  sideOff:'big' },
  { type:'goblingreen', at:175, interval:2,   count:2, side:'lr',      sb:false, sideOff:'goblin' },
  { type:'goblinblue',  at:200, interval:11,  count:2, side:'tb',      sb:true,  sideOff:'goblin' },
  { type:'goblinblue',  at:275, interval:11,  count:2, side:'lr',      sb:true,  sideOff:'goblin' },
  { type:'shooter',     at:225, interval:6.5, count:1, side:'random',  sb:true,  sideOff:'big' },
  { type:'goblinred',   at:325, interval:3,   count:2, side:'lr',      sb:false, sideOff:'goblin' },
  { type:'goblinred',   at:350, interval:3,   count:2, side:'tb',      sb:false, sideOff:'goblin' },
  { type:'goblinred',   at:150, interval:13,  count:4, side:'all',     sb:true,  sideOff:'goblin', only:['Normal'] },
  { type:'pigsassin',   at:50,  interval:16,  count:1, side:'random',  sb:true,  sideOff:'big', only:['Hard'] },
  { type:'goblinred',   at:175, interval:6.5, count:2, side:'lr',      sb:true,  sideOff:'goblin', only:['Hard'] },
  { type:'pigsassin',   at:1,   interval:8,   count:1, side:'random',  sb:true,  sideOff:'big', only:['Insane'] },
  { type:'goblinblue',  at:400, interval:3,   count:4, side:'all',     sb:false, sideOff:'goblin', only:['Insane'] },
];

// explicit encounter HP below as final values so they are not multiplied twice by the
// global difficulty HP curve: Crusher = tank/brute, Hexlord = controller, Wraith = glass caster.
const BOSS_SPAWNS = {
  Easy: [
    { t:275, e:'absorber', hp:3500 },
    { t:375, e:'absorber', hp:4500 },
    { t:450, e:'boss1',    hp:8000 },
  ],
  Normal: [
    { t:250, e:'absorber',  hp:5500 },
    { t:325, e:'absorber',  hp:5500 },
    { t:375, e:'boss1',     hp:10000 },
  ],
  Hard: [
    { t:140, e:'absorber',  hp:2500 },
    { t:215, e:'boss2',     hp:5500 },
    { t:300, e:'absorber',  hp:7500 },
    { t:375, e:'boss1',     hp:13500 },
    { t:415, e:'laserdude', hp:6600, x:460, y:300 },
    { t:415, e:'laserdude', hp:6600, x:0, y:-5 },
    { t:430, e:'absorber',  hp:7500 },
  ],
  Insane: [
    { t:50,  e:'absorber',  hp:1200 },
    { t:110, e:'laserdude', hp:1100 },
    { t:150, e:'boss3',     hp:3000 },
    { t:225, e:'absorber',  hp:7500 },
    { t:275, e:'boss2',     hp:7500 },
    { t:315, e:'laserdude', hp:1600, x:0, y:-5 },
    { t:315, e:'laserdude', hp:1600, x:460, y:300 },
    { t:375, e:'boss1',     hp:14500, bh:true },
    { t:400, e:'laserdude', hp:1600, x:0, y:-5 },
    { t:400, e:'laserdude', hp:6600, x:460, y:300 },
    { t:450, e:'absorber',  hp:7500 },
  ],
};

// BRIAR WARDEN is a Bahamut-only pressure elite. Easy schedules one late encounter;
// Normal/Hard/Insane schedules are defined below. Never spawn a second Warden while
// another is alive, so the challenge stays about readable control rather than chain-lock spam.
const BRIAR_BAHAMUT_SPAWNS = {
  Easy:[330],
  Normal:[220,410],
  Hard:[150,320,445],
  Insane:[90,210,340,455],
};

// Level-up pool: 45 base perks + conditional unlocks + 7 king perks = 65 total.
// Conditional entries only appear when their requirements are met.
// 'mindpopper' and 'expdub' are unobtainable compatibility entries.



// Projectile cards add a whole BASE VOLLEY per stack, not a single bullet: "Double Bullet"
// doubles the shot you actually fire. Every weapon therefore gets identical terms - x2 then x3
// its own volley for the same +60% then +92% total damage - instead of the flat +1 that was
// worth +100% on a single-shot rifle but only +20% on the 5-shell shotgun, where it paid less
// than the -20% damage it charges and the extra shell vanished inside the spread.
function baseVolleySize(){
  return Math.max(1, Math.floor(Number(G.gun?.proj)||1));
}

const PERKS = [
  { id:'criticalhit',    name:'Critical Hit',  desc:'Crit Chance +10%',                          mastery:'Critical', apply:g=>{g.hero.mods.crit+=0.10;}, },
  { id:'magnet',         name:'Magnet',        desc:'XP Attraction +20 · Crit Chance +5%',    mastery:'Critical', apply:g=>{g.hero.mods.magnet+=20; g.hero.mods.crit+=0.05;}, },
  { id:'criticalsight',  name:'Critical Sight',desc:'Bullet Range +0.30 · Crit Chance +5%', mastery:'Critical', apply:g=>{g.hero.mods.range+=0.3; g.hero.mods.crit+=0.05;}, },
  { id:'exsplosivecrits',name:'Explosive Crits',desc:'Critical hits explode',                             king:'Critical', apply:g=>{g.hero.explosiveCrits=true;}, },
  { id:'hpfordamage',    name:'HP for Damage', desc:'Heal 60 HP, - 25% Damage',                                     apply:g=>{healHero(60); g.hero.mods.dmg*=0.75;}, },
  { id:'heart',          name:'Heart',         desc:'+ 20 Max HP',                                                 apply:g=>{g.hero.maxHp+=20; healHero(20);}, },
  { id:'regen',          name:'Regen',         desc:'Hero regenerates 10 HP every 30 seconds',                      apply:g=>{g.hero.regen=true;}, },
  { id:'poisondodge',    name:'Poison Dodge',  desc:'Poison Damage +50% Speed +33% Dodge Chance +5%',               mastery:'Dodge', apply:g=>{g.hero.mods.poison*=1.5; g.hero.mods.speed*=1.33; g.hero.mods.dodge=Math.min(RUN_STAT_CAPS.dodge,g.hero.mods.dodge+0.05);}, },
  { id:'stinkbug',       name:'Stink Bug',     desc:'Every 4s spawn a temporary Stink Bug minion. It chases the nearest enemy, then suicide-explodes into poison. Summon Damage affects it.', apply:g=>{g.hero.stinkbug=true;}, },
  { id:'bulletspikes',   name:'Bullet Spikes', desc:'Every 3s fire a 12-way ring of steel spikes that pierce, damage and slow. These are spike projectiles, not bone bullets.', apply:g=>{g.hero.bulletspikes=true;}, },
  { id:'slowdown',       name:'Slowdown',      desc:'Bullets Slow Enemies',                                        apply:g=>{g.hero.slowBullets=true;}, },
  { id:'slowinglight',   name:'Slowing Light', desc:'Hero Light radius +15 and slows enemies', mastery:'Pyro', apply:g=>{g.hero.mods.light+=15; g.hero.slowingLight=true;}, },
  { id:'spikebuff',      name:'Spike Buff',    desc:'+15 Spike Damage, Spikes also deal extra fire damage.',        requires:'penburst', apply:g=>{g.hero.spikeDmg+=15; g.hero.spikeFire=true;}, },
  { id:'slowspikes',     name:'Slow Spikes',   desc:'Drop a spike trap that slows and deals 15 Spike damage',       apply:g=>{g.hero.slowspikes=true;}, },
  { id:'stablefocus',    name:'Stable Focus',  desc:'20% Chance to gain an ammo when collecting XP orbs.',          apply:g=>{g.hero.stablefocus=true;}, },
  { id:'xpbuff',         name:'XP Buff',       desc:'Damage Scales with current XP',                                apply:g=>{g.hero.xpbuff=true;}, },
  { id:'bruiser',        name:'Bruiser',       desc:'+8% DMG Reduction. When hit gain 6 ammo', mastery:'Armor',   apply:g=>{g.hero.mods.armor+=0.08; g.hero.bruiser=true;}, },
  { id:'shieldregen',    name:'Shield Regen',  desc:'Gain a shield that slowly regenerates', mastery:'Armor',     apply:g=>{g.hero.maxShield=20; g.hero.shield=20; g.hero.shieldRegen=true;}, },
  // Armor grants +12% damage reduction.
  
  { id:'armor',          name:'Armor',         desc:'+12% DMG Reduction', mastery:'Armor',            apply:g=>{g.hero.mods.armor+=0.12;}, },
  { id:'armorking',      name:'Armor King',    desc:'+10% DMG Reduction. + 1 DMG per active shield point', king:'Armor', apply:g=>{g.hero.mods.armor+=0.10; g.hero.armorKing=true;}, },
  { id:'rager',          name:'Rager',         desc:'Damage Increases the lower the HP',                           apply:g=>{g.hero.rager=true;}, },
  { id:'enragedammo',    name:'Enraged Ammo',  desc:'25% chance to gain 2 ammo every kill when raged',             requires:'rager', apply:g=>{g.hero.enragedammo=true;}, },
  // Trade Off routes its HP cost through dodge, shield and armor handling.
  
  { id:'tradeoff',       name:'Trade Off',     desc:'Trade Half of your HP for +20% DMG',                          apply:g=>{const h=g.hero;
    if(!(Math.random()<Math.min(RUN_STAT_CAPS.dodge,h.mods.dodge))){
      let loss=h.hp/2;
      if(h.shield>0){ const ab=Math.min(h.shield, loss); h.shield-=ab; loss-=ab; }
      loss*=(1-Math.min(RUN_STAT_CAPS.armor,h.mods.armor));
      h.hp=Math.max(0.5,h.hp-loss);
    }
    h.mods.dmg*=1.2;}, },
  { id:'quickhands',     name:'Quick Hands',   desc:'Reload Time −17% · Fire Rate +18%', mastery:'Reload', apply:g=>{g.hero.mods.reload*=5/6; g.hero.mods.fire*=1-1/6.6;}, },
  { id:'reloadbomb',     name:'Reload Bomb',   desc:'Drop a bomb when you reload', mastery:'Reload',              apply:g=>{g.hero.reloadbomb=true;}, },
  { id:'reloadking',     name:'Reload King',   desc:'Reload Time −50%', mastery:'Reload',             apply:g=>{g.hero.mods.reload*=0.5;}, },
  { id:'reloadreckoner', name:'Reload Reckoner',desc:'5% chance to heal 10 HP on reload · Reload Time −50%', king:'Reload', apply:g=>{g.hero.mods.reload*=0.5; g.hero.reloadreckoner=true;}, },
  { id:'burninglight',   name:'Burning Light', desc:'Hero Light inflicts burn damage', mastery:'Pyro', apply:g=>{g.hero.burningLight=true;}, },
  { id:'burner',         name:'Burner',        desc:'Fire Damage +50%',                                mastery:'Pyro', requires:'burninglight', apply:g=>{g.hero.mods.fire*=1.5;}, },
  { id:'lordofthelight', name:'Lord Of The Light', desc:'Fire Damage +100% · Enemy hits have 10% ammo-gain chance', king:'Pyro', apply:g=>{g.hero.mods.fire*=2; g.hero.lordAmmo=true;}, },
  { id:'airdamage',      name:'Air Damage',    desc:'+ 15 Stationary DMG',                                        mastery:'Rooted', apply:g=>{g.hero.mods.stationary+=15;}, },
  { id:'stationarylight',name:'Stationary Light',desc:'Hero Light is larger while stationary. Heal 20 HP',         mastery:'Rooted', apply:g=>{healHero(20); g.hero.stationLight=true;}, },
  { id:'rootedfire',     name:'Rooted Fire',   desc:'Doubles Fire DMG while stationary',                           mastery:'Rooted', apply:g=>{g.hero.rootedfire=true;}, },
  { id:'rootedking',     name:'Rooted King',   desc:'Gain 0.5 Hp per/s while stationary. + 100% Stationary DMG',   king:'Rooted', apply:g=>{g.hero.rootedking=true; g.hero.mods.stationaryMult+=1.0;}, },
  { id:'turret',         name:'Turret',        desc:'Summon A Turret that fires at the closest target', mastery:'Summon', apply:g=>{addTurret();}, },
  { id:'buffturret',     name:'Buff Turret',   desc:'+ 5 Turret Damage + 100% Turret Shooting Speed', requires:'turret', apply:g=>{g.hero.turretDmg*=1.5; g.hero.turretRateBuff+=0.5;}, },
  { id:'twoturrets',     name:'Two Turrets',   desc:'Summon a second turret', requires:'turret',                  apply:g=>{addTurret();}, },
  { id:'doggo',          name:'Doggo',         desc:'Summon 1 permanent Doggo companion that bites for 12 damage', mastery:'Summon',        apply:g=>{addDog(false);}, },
  { id:'buffdoggo',      name:'Buff Doggo',    desc:"Increase Doggo damage by 50% and speed by 25", requires:'doggo',           apply:g=>{g.hero.dogMult*=1.5; g.hero.dogSpeed+=25;}, },
  { id:'summonbuff',     name:'Summon Buff',   desc:'Summon Damage +50%',                              apply:g=>{g.hero.mods.summon*=1.5;}, },
  { id:'spinner',        name:'Spinner',       desc:'Summon a Orb that spins around you dealing 30 damage', mastery:'Summon', apply:g=>{g.hero.spinners=Math.min(RUN_STAT_CAPS.spinners,(g.hero.spinners||0)+1);}, },
  { id:'spinner2',       name:'Spinner II',    desc:'Summon a second Orb', requires:'spinner',                      apply:g=>{g.hero.spinners=Math.min(RUN_STAT_CAPS.spinners,(g.hero.spinners||0)+1);}, },
  { id:'summonking',     name:'Summon King',   desc:'Summon Damage +100%', king:'Summon',           apply:g=>{g.hero.mods.summon*=2;}, },
  { id:'speeddemon',     name:'Speed Demon',   desc:'Move Speed +17% · Fire Rate +25% · Reload Time −17%',                  mastery:'Dodge', apply:g=>{g.hero.mods.speed*=7/6; g.hero.mods.fire*=0.8; g.hero.mods.reload*=5/6;}, },
  { id:'dodgebuff',      name:'Dodge Buff',    desc:'Poison Damage +50% Dodge Chance + 10%',                       mastery:'Dodge', apply:g=>{g.hero.mods.poison*=1.5; g.hero.mods.dodge=Math.min(RUN_STAT_CAPS.dodge,g.hero.mods.dodge+0.10);}, },
  { id:'dodgeking',      name:'Dodge King',    desc:'Dodge Chance + 15% Gain 10 Shield Points every successful dodge', king:'Dodge', apply:g=>{g.hero.mods.dodge=Math.min(RUN_STAT_CAPS.dodge,g.hero.mods.dodge+0.15); g.hero.dodgeKing=true;}, },
  { id:'bulletbully',    name:'Bullet Bully',  desc:'Triple Your Shot -20% Damage Each -33% Speed', requires:'doublebullet', apply:g=>{if((g.hero.mods.projStacks||0)>=RUN_STAT_CAPS.projectileBonus)return; g.hero.mods.projStacks=(g.hero.mods.projStacks||0)+1; g.hero.mods.proj+=baseVolleySize(); g.hero.mods.dmg*=0.8; g.hero.mods.speed*=0.667; if(g.gun.id!=='blastersg'&&g.gun.id!=='splitter') g.hero.mods.spread+=35;}, },
  { id:'doublebullet',   name:'Double Bullet', desc:'Double Your Shot -20% Damage Each',                            apply:g=>{if((g.hero.mods.projStacks||0)>=RUN_STAT_CAPS.projectileBonus)return; g.hero.mods.projStacks=(g.hero.mods.projStacks||0)+1; g.hero.mods.proj+=baseVolleySize(); g.hero.mods.dmg*=0.8; if(g.gun.id!=='blastersg'&&g.gun.id!=='splitter') g.hero.mods.spread+=20;}, },
  { id:'knockback',      name:'Knockback',     desc:'Knockback +10% · Weapon Damage +10%',                      mastery:'Knockback', apply:g=>{g.hero.mods.kb*=1.1; g.hero.mods.dmg*=1.1;}, },
  { id:'hitinvince',     name:'Hit Invince',   desc:'Increases Weapon Damage by 15%. Longer Invincibility after getting hit', mastery:'Knockback', apply:g=>{g.hero.mods.dmg*=1.15; g.hero.invinceFlat+=3;}, },
  { id:'damageknockback',name:'Damage Knockback',desc:'+3 Weapon Damage · Knockback +10%',                  mastery:'Knockback', apply:g=>{g.hero.flatDmg+=3; g.hero.mods.kb*=1.1;}, },
  { id:'knockbackking',  name:'Knockback King',desc:'Every 4 Seconds push back all surrounding enemies',            king:'Knockback', apply:g=>{g.hero.knockbackKing=true;}, },
  { id:'ammo',           name:'Ammo',          desc:'+10 Ammo · Poison Damage scales with Max Ammo',           apply:g=>{g.hero.maxAmmo+=10; g.hero.ammo=Math.min(g.hero.maxAmmo,g.hero.ammo+10); g.hero.poisonScalesAmmo=true;}, },
  { id:'manipulator',    name:'Manipulator',   desc:'Doubles Ammo at the cost of speed',
    // Double Bullet doubles current and maximum ammo.
    // (max grows to ~3× base), plus flat −20 max speed. Order matters — ammo first.
    apply:g=>{g.hero.ammo*=2; g.hero.maxAmmo+=g.hero.ammo; g.hero.mods.speed*=(75-20)/75;}, },
  { id:'doublejump',     name:'Double Jump',   desc:'Increased Magnet, +6 ammo, heal 20 Hp',                       apply:g=>{g.hero.mods.magnet+=5; g.hero.maxAmmo+=6; g.hero.ammo=Math.min(g.hero.maxAmmo,g.hero.ammo+6); healHero(20);}, },
  { id:'buff',           name:'Buff',          desc:'Increases Damage by 30%',                                     apply:g=>{g.hero.mods.dmg*=1.3;}, },
  { id:'ranger',         name:'Ranger',        desc:'Damage Increases based on distance, - 5 base damage)',         apply:g=>{g.hero.ranger=true;}, },
  { id:'radius',         name:'Radius',        desc:'Increases Hero Light Radius',                                 requires:'stinkbug', apply:g=>{g.hero.mods.light+=25;}, },
  { id:'explode',        name:'Explode',       desc:'10% Chance enemies explode on death. After 6 rapid triggers, rests for 3s.', apply:g=>{g.hero.explodeDeath=true;}, },
  { id:'explodebones',   name:'Explode Bones', desc:'Exploding deaths fire 12 bone bullets. Shares Explode’s 3s rest.', requires:'explode', apply:g=>{g.hero.explodeDeath=true; g.hero.explodeBones=true;}, },
  { id:'backbone',       name:'Backbone',      desc:'Shoot 3 bone bullets behind you. Every hit independently has a 3% chance to summon a temporary Bone Dog for 8s; multiple Bone Dogs can stack.', apply:g=>{g.hero.backbone=true;}, },
  { id:'penquinpal',     name:'Penquin Pal',   desc:'Summon a penquin pal that collects nearby xp', mastery:'Summon', apply:g=>{g.hero.penguin=true;}, },
  { id:'penburst',       name:'Pen Burst',     desc:'Penguin Pal slams every 5s for 50 damage', mastery:'Summon', requires:'penquinpal', apply:g=>{g.hero.penburst=true;}, },
  { id:'burningroots',   name:'Burning Roots', desc:'Every 4 seconds, enemies in your light are set ablaze.',       king:'burningroots', apply:g=>{g.hero.burningroots=true;}, },
  { id:'superplus',      name:'Super Plus',    desc:'Gain 1 extra super use',                                      apply:g=>{g.hero.super.maxUses+=1; g.hero.super.uses+=1;}, },
  { id:'firenova',       name:'Fire Nova',     desc:'Using your super ignites every nearby enemy. Fire already spreads to whatever a burning enemy touches.', apply:g=>{g.hero.fireNova=true;}, },
  // DASH ability pathway — sprint first, then dash OR stamina charge, then the fire trail.
  { id:'sprint',     name:'Sprint',         desc:'Move Speed +70% while Sprint is active. Needs at least 20 stamina to start, then may drain to 0. Desktop: Right-Click / Shift. Mobile: tap SPRINT to toggle.', apply:g=>{g.hero.sprint=true;}, },
  { id:'dash',       name:'Dash',           desc:'Dash 110 units for 40 stamina and become invincible during the dash. Desktop follows mouse aim. Mobile quick-tap follows the left stick (facing if stationary); drag overrides direction.', requires:'sprint', apply:g=>{g.hero.dash=true;}, },
  { id:'stamcharge', name:'Stamina Cell',   desc:'Stamina Recharge +100%.',                                        requires:'sprint', apply:g=>{g.hero.staminaRegenMult=2;}, },
  { id:'dashtrail',  name:'Dash Fire Trail',desc:'Dashes leave a burning trail for 10s and ignite a ring of fire when you arrive.', requires:'dash', apply:g=>{g.hero.dashFire=true;}, },
];

// Late-run FLEX repeat policy.
// LEGACY REGRESSION RULE: the original picker excluded every already-owned perk, so
// normal perks were one-time. FLEX is a new exception system, not a restoration of
// legacy stacking. Keep the exception pool intentionally tiny: recovery/trade perks,
// Super growth, and capped core stats only. Everything else remains one-pick.
// Numeric values are TOTAL pickup limits, including the first copy. Infinity means the
// stat itself (or another explicit gameplay cap) decides when the perk stops being useful.
const LATE_REPEAT_LIMITS = Object.freeze({
  criticalhit:Infinity,   // +10% Crit; stops at 100%
  heart:Infinity,         // +20 Max HP + heal 20
  hpfordamage:Infinity,   // reverse trade: heal 60, then ×0.75 weapon damage
  armor:Infinity,         // +12% armor DR; stops at 60%
  tradeoff:3,             // trade current HP for ×1.20 damage; bounded because dodge/DR reduce the price
  superplus:Infinity,     // extra Super stock, or -0.25s unlimited-Super cooldown to the 1s floor
});

// A card that can do NOTHING for the player right now is never offered: a stat already at its
// hard cap can never pay off, and a pure trade card with nothing left to trade against is a
// trap (HP for Damage at full HP is just -25% damage). This is a cap/dead-value rule, NOT a
// build-preference filter - cards that are merely weak for the current build stay in the pool
// because a later pick can make them good (Summon Buff before any summon, Poison lines on a
// non-poison gun, Rooted Fire before any burn source, Armor King before any shield source).
function perkGivesNothing(p){
  const h=G.hero;
  if(!h || !p) return false;
  const caps=RUN_STAT_CAPS;
  const critMaxed=(h.mods.crit||0)>=caps.crit-0.001;
  switch(p.id){
    // Pure single-stat cards: dead the moment their stat is capped.
    case 'criticalhit':  return critMaxed;
    case 'armor':        return Math.min(caps.armor,h.mods.armor||0)>=caps.armor-0.001;
    // Both halves saturated: XP attraction is capped (radius 100) and Crit is capped.
    case 'magnet':       return (h.mods.magnet||0)>=RUN_MAGNET_MOD_CAP-0.001 && critMaxed;
    // apply() early-returns at the projectile cap, so these are literal no-op cards there.
    case 'doublebullet':
    case 'bulletbully':  return (h.mods.projStacks||0)>=caps.projectileBonus;
    // Super Plus only adds Super stock, or cooldown for an unlimited-Super hero at the floor.
    case 'superplus':    return !!h.super && !!G.char?.unlimitedSuper && h.super.chargeMax<=caps.unlimitedSuperCooldownMin+0.001;
    // Nothing to heal: taking this would only apply the -25% damage.
    case 'hpfordamage':  return h.hp>=h.maxHp-0.5;
    default: return false;
  }
}

function repeatPerkLimit(id){
  return Object.prototype.hasOwnProperty.call(LATE_REPEAT_LIMITS,id) ? LATE_REPEAT_LIMITS[id] : 1;
}
function repeatPerkStackCount(id){
  return Math.max(0,Number(G.perkStacks?.[id])||0);
}
function lateRepeatUseful(p){
  const h=G.hero;
  if(!h || !p) return false;
  const limit=repeatPerkLimit(p.id);
  if(limit<=1) return false;
  const stacks=repeatPerkStackCount(p.id);
  if(Number.isFinite(limit) && stacks>=limit) return false;

  // Real stat caps take precedence over the pickup limit so a dead card never appears.
  return !perkGivesNothing(p);
}

function perkStackCount(id){
  return Math.max(1, Number(G.perkStacks?.[id])||1);
}

// perk icon sprite sheet — procedural 32px cells (8 cols × 9 rows), chunky pixel-art.
// The 4 dash-pathway icons (sprint/dash/stamcharge/dashtrail at row 8, cols 3-6) were
// Sprite atlas source is the project asset sheet.
const ICON_URL = 'https://user.uploads.dev/file/ad85909be9297423b73976d26cff3276.png';
const PERK_ICONS = {
  criticalhit:[0,0], magnet:[1,0], criticalsight:[2,0], exsplosivecrits:[3,0], hpfordamage:[4,0], heart:[5,0], regen:[6,0], poisondodge:[7,0],
  mindpopper:[0,1], stinkbug:[1,1], bulletspikes:[2,1], slowdown:[3,1], slowinglight:[4,1], spikebuff:[5,1], slowspikes:[6,1], stablefocus:[7,1],
  xpbuff:[0,2], expdub:[1,2], bruiser:[2,2], shieldregen:[3,2], armor:[4,2], armorking:[5,2], rager:[6,2], enragedammo:[7,2],
  tradeoff:[0,3], quickhands:[1,3], reloadbomb:[2,3], reloadking:[3,3], reloadreckoner:[4,3], burninglight:[5,3], burner:[6,3], lordofthelight:[7,3],
  airdamage:[0,4], stationarylight:[1,4], rootedfire:[2,4], rootedking:[3,4], turret:[4,4], buffturret:[5,4], twoturrets:[6,4], doggo:[7,4],
  buffdoggo:[0,5], summonbuff:[1,5], spinner:[2,5], spinner2:[3,5], summonking:[4,5], speeddemon:[5,5], dodgebuff:[6,5], dodgeking:[7,5],
  bulletbully:[0,6], doublebullet:[1,6], knockback:[2,6], hitinvince:[3,6], damageknockback:[4,6], knockbackking:[5,6], ammo:[6,6], manipulator:[7,6],
  doublejump:[0,7], buff:[1,7], ranger:[2,7], radius:[3,7], explode:[4,7], explodebones:[5,7], backbone:[6,7], penquinpal:[7,7],
  penburst:[0,8], burningroots:[1,8], superplus:[2,8],
  sprint:[3,8], dash:[4,8], stamcharge:[5,8], dashtrail:[6,8], firenova:[7,8],
};

const GEMS = [
  { id:'green',  name:'GREEN GEM',  color:0x3fbf5f, desc:'+10% DMG Reduction',            apply:g=>{g.hero.mods.armor+=0.10;}, },
  { id:'blue',   name:'BLUE GEM',   color:0x4f7dff, desc:'+50% Summon DMG',               apply:g=>{g.hero.mods.summon*=1.5;}, },
  { id:'purple', name:'PURPLE GEM', color:0x9f4fff, desc:'+20% Speed, +10% Dodge',        apply:g=>{g.hero.mods.speed*=1.20; g.hero.mods.dodge=Math.min(RUN_STAT_CAPS.dodge,g.hero.mods.dodge+0.10);}, },
  { id:'red',    name:'RED GEM',    color:0xff4f4f, desc:'+25% Weapon DMG',               apply:g=>{g.hero.mods.dmg*=1.25;}, },
  { id:'black',  name:'BLACK GEM',  color:0x3a3a3a, desc:'Reload Time −15% · Fire Rate +18%', apply:g=>{g.hero.mods.reload*=0.85; g.hero.mods.fire*=0.85;}, },
  { id:'yellow', name:'YELLOW GEM', color:0xffd166, desc:'Max Ammo +100% · Move Speed −25%',
    // Yellow Gem doubles current/max ammo and applies Move Speed ×0.75.
    
    
    apply:g=>{g.hero.maxAmmo*=2; g.hero.ammo*=2; g.hero.mods.speed*=0.75;}, },
  { id:'poison', name:'POISON GEM', color:0x6fbf4f, desc:'+25% Poison DMG',               apply:g=>{g.hero.mods.poison*=1.25;}, },
  { id:'crit',   name:'CRIT GEM',   color:0xff8f4f, desc:'+10% Crit, +1 Crit Mastery',    apply:g=>{g.hero.mods.crit+=0.10;}, },
];

// Shared cat-king baseline.


const CAT_KING_CORE = Object.freeze({ hp:70, dmg:1.22, speed:1.02, armor:0.08 });

// Normal-bunny Super cadence is intentionally asymmetric: rapid utility/mobility casts
// trade per-cast power for rhythm, while summon/retaliation Supers remain heavier commitments.
const CHARACTERS = [
  { id:'pulse', name:'PULSE', color:0x7fd4ff, passive:'Balanced', passiveDesc:'Reliable all-rounder with standard HP and no build dependency.', superUses:16, superCharge:7,
    superName:'PULSE', superDesc:'Knock all enemies away and heal 10 HP.' },
  { id:'mag', name:'MAG', color:0xff9a3d, passive:'+12% Weapon DMG · +30 Magnet', passiveDesc:'Weapon damage +12%, +30 Magnet, and a magnet Super that drags crowds in.', stats:{ dmg:1.12, magnet:30 }, superUses:14, superCharge:11,
    superName:'BURNING MAGNET', superDesc:'Cast a burning magnet ahead; radius 200, dragging every enemy in range into the point and setting them alight. The pull is violent enough that the bodies it holds are in flight, so they ghost straight through MAG instead of body-checking him - while anything the field is not holding hits him normally.' },
  { id:'bones', name:'BONES', color:0xe8e8e0, passive:'1 Bone Doggo · +15% Summon DMG', passiveDesc:'Starts with 1 permanent Bone Doggo, and every summon deals +15% damage.',
    stats:{ summon:1.15, dogs:1 }, superUses:10, superCharge:18,
    superName:'PACK', superDesc:'Summon 3 temporary Bone Doggos for 8 seconds. Only one temporary PACK trio can exist at a time.' },
  { id:'porter', name:'PORTER', color:0x9b5de5, passive:'+12% Dodge · +18% Speed', passiveDesc:'Fast evasive skirmisher with a stronger portal-tear escape burst.', stats:{ dodge:0.12 }, superUses:18, superCharge:9,
    superName:'WARP', superDesc:'Teleport anywhere on the map through paired portals. The exit tears a wider area for 120% weapon-scaled damage; enemies pursue the departure point for 0.45s before reacquiring PORTER.' },
  { id:'payne', name:'PAYNE', color:0xff4f4f, passive:'Comeback Rage', passiveDesc:'Comeback bruiser: RAGE adds up to +14 flat weapon damage as HP falls.', superUses:10, superCharge:17,
    superName:'PAYBACK', superDesc:'Spend up to 7 HP for a radius-260 blast dealing 75–110 damage from current RAGE; a successful hit restores 6–10 HP.' },
  { id:'haze', name:'HAZE', color:0x48b84f, passive:'+80% Poison DMG', passiveDesc:'Poison damage +80%, and TOXIC BURST seeds extra toxic clouds.', stats:{ poison:1.80 }, superUses:18, superCharge:7,
    superName:'TOXIC BURST', superDesc:'Create 4 guaranteed stronger toxic clouds, then seed up to 3 extra clouds on randomly chosen nearby XP orbs without consuming them.' },
  { id:'mo', name:'MO', color:0xffd166, passive:'Double Ammo · 5% Slower', passiveDesc:'Double starting magazine for ammo bombs, at 5% slower movement.', superUses:24, superCharge:5,
    superName:'AMMO BOMB', superDesc:'Detonate a radius-145 bomb dealing 65% of Max Ammo with a 75-damage minimum, then recover 20% of Max Ammo.' },
  { id:'nikki', name:'NIKKI', color:0xff9ad5, passive:'1 Turret · Turret Support', passiveDesc:'Starts with 1 permanent turret, and turret perks build on that base.', stats:{ turrets:1 }, superUses:12, superCharge:14,
    superName:'OVERDRIVE', superDesc:'Deploy 2 temporary turrets farther from NIKKI for 8s. All active turrets gain Fire Rate +300% (4×); boosted shots deal 35% normal turret damage with 100 knockback.' },
  { id:'blink', name:'BLINK', color:0x3f63d8, passive:'Fast', passiveDesc:'Move Speed +17%, plus PHASE RUN to dash straight through danger.', superUses:20, superCharge:7,
    superName:'PHASE RUN', superDesc:'Run at +100% Move Speed and +30% Fire Rate for 3s with no stamina cost, ignoring slows and knockback. Phased for the whole run: enemy bodies, contact damage and physical obstacles (Thorn Guards, hostile cakes) pass straight through - but flames, lasers, beams and other area attacks still hit.' },
  { id:'rooty', name:'ROOTY', color:0x8b6a3f, passive:'Bramble Garden · Thorn Guards', passiveDesc:'Grows brambles every 7s; step on one to awaken a blocking Thorn Guard.', superUses:10, superCharge:12,
    superName:'BRAMBLES', superDesc:'Grow 10 brambles in a radius-64 ring for 8 seconds. ROOTY can step on those brambles to awaken blocking Thorn Guards.' },
  // --- Apex heroes: compact card copy; exact mechanics live in the specs popover. ---
  { id:'raja', apex:true, name:'RAJA', color:0xd96b22, icon:'🐯', beast:true, op:true, scale:1.22, hitR:15.75, biped:true, price:5000,
    passive:'+70 Max HP · +8% DR · +22% Weapon DMG · +10% Crit · Predator Claws', passiveDesc:'Predator Claws roll RAJA’s full current crit chance for ×2 crit damage.',
    specs:'Predator Claws auto-strike nearby targets and use RAJA’s full crit chance. PREDATOR FRENZY opens with a radius-96 hit for 66 × damage modifier; landing any opening ground-claw marker on an enemy deals that 66 × hit again. Then for 7s: Move Speed ×1.35; claw interval 0.24s; reach 145; claws rotate to a different in-range target when possible; 60 × damage modifier; 110 knockback; up to 1.5 HP heal per claw hit; 10% DR; 45% knockback resistance.',
    stats:{ ...CAT_KING_CORE, crit:0.10, autoSlash:true }, superUses:10, superCharge:13,
    superIcon:'🐾', superName:'PREDATOR FRENZY', superDesc:'Opening 66 × damage-modifier burst + aimed ground-claw bonus hit · 7s: Move Speed ×1.35 · claw interval 0.24s · reach 145 · rotate targets when possible · 60 × damage modifier · 110 knockback · up to 1.5 HP heal/hit · +10% DR · 45% knockback resistance.' },
  { id:'mane', apex:true, name:'MANE', color:0xc88d35, icon:'🦁', beast:true, op:true, scale:1.22, hitR:15.75, biped:true, price:5500,
    passive:"+70 Max HP · +8% DR · +22% Weapon DMG · King's Paw", passiveDesc:'King’s Paw auto-strikes within 72 every 0.85s for 14 × damage modifier / 190 knockback.',
    specs:'King’s Paw auto-strikes within 72 every 0.85s for 14 × damage modifier / 190 knockback. KING’S ROAR deals one 22 × damage-modifier arena hit with 175 knockback, applies one class-scaled fear-stun and heals 28 HP. Echoes deal no damage; new entrants can receive one fear-stun.',
    stats:{ ...CAT_KING_CORE, kb:1.22, autoPunch:true }, superUses:9, superCharge:17,
    superIcon:'📣', superName:"KING'S ROAR", superDesc:'22 × damage-modifier arena hit · 175 knockback · class-scaled fear-stun · 28 HP heal · echoes can stun new entrants once.' },
  { id:'grizz', apex:true, name:'GRIZZ', color:0x6f4b32, icon:'🐻', beast:true, op:true, scale:1.32, hitR:18, biped:true, price:5000,
    passive:'+170 Max HP · +4% DR · +15% Weapon DMG · Wounded Resolve', passiveDesc:'230 HP with Wounded Resolve scaling damage reduction below 70% HP.',
    specs:'Wounded Resolve starts below 70% HP and strengthens toward critical HP. GRIZZLY BULWARK creates a local persistent quake: repeated aftershock damage and tremor-staggers, 6s guard, and XP pull that converts pickups into sustain.',
    stats:{ hp:170, dmg:1.15, armor:0.04, speed:0.82, regenRate:0.10, grizzResolve:true }, superUses:8, superCharge:19,
    superIcon:'🛡️', superName:'GRIZZLY BULWARK', superDesc:'Local quake: repeated aftershock damage/tremors, 6s guard and XP-pull healing.' },
  { id:'fang', apex:true, name:'FANG', color:0x707a85, icon:'🐺', beast:true, op:true, scale:1.13, hitR:14.25, biped:true, price:4500,
    passive:'+40 Max HP · Pack Leader · +50% ALL Summon DMG · Starts with 2 Wolves', passiveDesc:'Starts with 2 permanent wolves. Every summon FANG controls deals 50% more damage.',
    specs:'Starts with 2 permanent wolves. All summons deal +50% damage. His wolves use distinct pack roles, and PACK HOWL calls 4 more temporary wolves for 10 seconds.',
    stats:{ hp:40, dogs:2, summon:1.50, speed:1.08 }, superUses:9, superCharge:16,
    superIcon:'🐺', superName:'PACK HOWL', superDesc:'Call 4 temporary wolves for 10s. With both starting wolves alive, the pack reaches 6.' },
  { id:'foxy', apex:true, name:'FOXY', color:0xe97836, icon:'🦊', beast:true, op:true, scale:1.04, hitR:13, biped:true, price:3500,
    passive:'+10 Max HP · Scout Senses · Quick Hands · WILD-FOX', passiveDesc:'Fast marksman with quick hands and WILD-FOX.',
    specs:'Move Speed +16% · Crit +10% · Fire Rate +14% · Reload Time −30% · Bullet Speed +12% · Range +0.22 · Magnet +36 · Vision +30 · WILD-FOX ricochet up to 4 times.',
    stats:{ hp:10, speed:1.16, crit:0.10, fire:0.88, reload:0.70, bulletSpeed:1.12, range:0.22, magnet:36, vision:30 }, superUses:1, superCharge:1.50, unlimitedSuper:true,
    superIcon:'💨', superName:'FOX DASH', superDesc:'Unlimited 1.5s dash with heavy shove, landing blast, ammo recovery and focus.' },
  { id:'val', apex:true, name:'VAL', color:0xf28b6f, icon:'🐱', beast:true, op:true, scale:1.00, hitR:12.5, biped:true, price:4200,
    passive:'+5 Max HP · +18% Speed · +15% Dodge · Pastry Hunt', passiveDesc:'Collect 3 ingredients to auto-craft a blocking cake.',
    specs:'Pastry Hunt periodically scatters large strawberry, candy and bread pickups and kills can drop more. Collect 3 ingredients to auto-craft a large cake that blocks enemies and hostile line-of-fire: bullets, moving laser projectiles, continuous laser lanes and breath cones cannot pass through it. Val can still eat the cake for healing and XP; fresh cakes heal less and mature to full strength. BAKERY PANIC sends a visible frosting ripple across the arena; lighter minions puff into cakes or ingredients when the wave reaches them, while heavyweight enemies such as Steel Crab resist Cakefy.',
    stats:{ hp:5, speed:1.18, dodge:0.15, fire:0.90, reload:0.78, valBaker:true, valIngredientDropEvery:8.5 }, superUses:8, superCharge:20,
    superIcon:'🍰', superName:'BAKERY PANIC', superDesc:'Spreading frosting ripple: lighter minions puff into cakes or ingredients; heavyweight minions resist.' },
  { id:'talon', apex:true, name:'TALON', color:0x8c633d, icon:'🦅', bird:true, op:true, scale:1.08, hitR:13.5, biped:true, price:5200,
    passive:'+15 Max HP · SKY CYCLE · Sky Vision · Airborne Invincibility', passiveDesc:'5.0s grounded at Move Speed −18%, then 3.5s airborne at Move Speed +120% with immunity.',
    specs:'Ground: normal vision, vulnerable, 0.82× speed for 5s. Flight: 2.20× speed for 3.5s, +65 vision and airborne immunity.',
    stats:{ hp:15, skyCycle:true, groundSpeed:0.82, flightSpeed:2.20, groundDur:5.0, flightDur:3.5, airVision:65 }, superUses:8, superCharge:16,
    superIcon:'🦅', superName:'KAMIKAZE DIVE', superDesc:'190-unit aimed dive with extreme minion displacement and position-ring-out potential.' },
  { id:'bahamut', apex:true, finalApex:true, name:'BAHAMUT', color:0x544064, icon:'🐉', dragon:true, op:true, hitR:18.5, biped:true, price:BAHAMUT_HUB_PRICE,
    passive:'+200 Max HP · +25% DR · +35% Weapon DMG · +15% Crit · Slow Regain · Level-Up Feast · DRAGON ARSENAL', passiveDesc:'Final Apex with huge stats, slow regeneration, 7 HP Level-Up Feast, and four Dragon skills.',
    specs:'LEVEL-UP FEAST restores 7 HP per level. DRAGON ARSENAL: Breath, Lance, Radial Burst and Sweep. FINAL APEX RUSH uses a burning charge path, landing shockwave and empowered Dragon Arsenal sequence.',
    stats:{ hp:200, dmg:1.35, armor:0.25, crit:0.15, speed:1.05, kb:1.35, regenRate:0.06, bahamutSkills:true }, superUses:6, superCharge:22,
    superIcon:'🪽', superName:'FINAL APEX RUSH', superDesc:'225-unit flaming rush · landing shockwave · Breath · 5-beam Lance · 10-missile Radial Burst · enlarged Sweep.' },
];

const HERO_DETAIL_SHEETS = {
  pulse:{role:'ALL-ROUNDER / SPACE MAKER',stats:'HP 60 · STANDARD DAMAGE / DEFENSE',passive:'Standard 60 HP. No conditional passive.',super:'PULSE · radius 240 · knockback 420 · immediately heals 10 HP. The blast pushes every enemy in range away from PULSE. Base charge 7s · stock 16.'},
  mag:{role:'DAMAGE / CROWD PULL',stats:'HP 60 · WEAPON DMG +12% · MAGNET +30',passive:'Weapon Damage +12% · Magnet +30.',super:'BURNING MAGNET · cast 105 units ahead · radius 200 · lasts 6s. The planted magnet is a real pull field: every enemy inside is accelerated toward the point and its outward drift is cancelled, so a crowd genuinely converges rather than leaking out one body at a time. Pull strength scales with MAGNET, so MAG’s passive and his Super feed the same number (+26 inward acceleration per point of MAGNET on top of the base field). It also stacks a 16-DPS fire-modified burn on whatever is inside - and fire never goes out, so anything it catches keeps burning after the magnet is gone. IN FLIGHT: the pull is violent enough (1300+ units/s of acceleration against enemies that walk at 40-75) that a body the field holds is not walking any more - it is debris being flung at the point, so it ghosts straight through MAG instead of body-blocking him or flattening him on the way past, and it is drawn spectral (semi-transparent, with the same blue-white wash the game uses for phased) so you can see at a glance which bodies are in flight and which are not. The field ring is the whole rule, and it is per body: inside the ring, a body being dragged passes through MAG; outside it, or the instant the 6s ends, an enemy hits MAG exactly like it would hit anyone. MAG himself is never phased and never immune - he still takes flames, lasers, beams, shockwaves, projectiles and area attacks from everything including the bodies he is dragging, and any body the field is not holding still hurts him normally. Base charge 11s · stock 14.'},
  bones:{role:'BONE SUMMONER',stats:'HP 60 · ALL SUMMON DMG +15% · STARTS WITH 1 PERMANENT BONE DOGGO',passive:'BONES starts every run with 1 permanent Bone Doggo. Any Doggo source he gains becomes a Bone Doggo, and every summon he controls deals 15% more damage.',mechanicsTitle:'BONE PACK',mechanics:'The starting companion, Doggo perk and PACK all create Bone Doggos for BONES. Bone-bullet summons also create temporary Bone Doggos. His +15% summon damage applies to the entire summon army.',super:'PACK · summons 3 temporary Bone Doggos for 8s. Together with the permanent Bone Doggo this gives BONES a four-dog core pack. Only one temporary PACK trio can exist at a time. Base charge 18s · stock 10.'},
  porter:{role:'TELEPORT / EVASION / PORTAL BURST',stats:'HP 60 · MOVE SPEED +18% · DODGE +12%',passive:'Move Speed +18% · Dodge +12%.',super:'WARP · teleport to the chosen point anywhere on the map through paired purple portals. The exit portal tears enemies within radius 76 for 120% current weapon-scaled damage and stronger knockback. For 0.45s after teleporting, enemy AI continues moving and attacking against PORTER’s departure position before it reacquires his real position; PORTER has 0.85s arrival invulnerability. Desktop lands at the mouse point; mobile drag controls direction and distance, while a quick tap keeps the familiar short reposition. Base charge 9s · stock 18.'},
  payne:{role:'COMEBACK DAMAGE / RETALIATION',stats:'HP 60 · ACTIVE COMEBACK RAGE',passive:'RAGE thresholds use Max HP: below 75% +3 flat weapon damage; below 50% +6; below 30% +10; below 15% +14.',super:'PAYBACK · spends up to 7 HP but can never reduce PAYNE below 1 HP · radius 260 · base 75 damage, rising with post-cost RAGE up to 110 at critical HP · if at least one enemy is hit, recover 6 HP plus up to 4 more from a large crowd. Brief 0.6s cast invulnerability. Base charge 17s · stock 10.'},
  haze:{role:'POISON / AREA DENIAL',stats:'HP 60 · POISON DMG +80%',passive:'Poison Damage +80%.',super:'TOXIC BURST · always creates 4 toxic clouds near HAZE at ×1.25 cloud damage. Then up to 3 XP orbs within 165 are chosen at random and each seeds 1 additional ×1.25 cloud without being consumed. If 3 or more XP orbs are in range, exactly 3 extra clouds are created, capped at 7 total. Base charge 7s · stock 18.'},
  mo:{role:'AMMO / EXPLOSIVE BURST',stats:'HP 60 · MOVE SPEED −5% · STARTING MAGAZINE ×2',passive:'Starting Magazine ×2 · Move Speed −5%.',super:'AMMO BOMB · radius 145 · damage is 65% of current Max Ammo with a 75-damage floor · restores 20% Max Ammo after detonation. Base charge 5s · stock 24.'},
  nikki:{role:'TURRET SUPPORT / SUPPRESSIVE BARRAGE',stats:'HP 60 · STARTS WITH 1 PERMANENT TURRET',passive:'NIKKI starts every run with 1 permanent turret. Turret perks can add additional turrets.',super:'OVERDRIVE · 8s · deploys 2 temporary turrets in a wider formation. Every active turret gains Fire Rate +300% (4×); each boosted shot deals 35% normal turret damage and carries 100 knockback instead of 20. The lower per-shot damage offsets the much denser suppression. Base charge 14s · stock 12.'},
  blink:{role:'PHASED BURST / PHASE RUN',stats:'HP 60 · MOVE SPEED +17%',passive:'Move Speed +17%.',super:'PHASE RUN · 3s · Move Speed +100% and Fire Rate +30%, with no stamina cost; cannot stack with Sprint; ignores slows and knockback. Phased for the entire run: enemy bodies, contact damage and physical obstacles (Thorn Guards, hostile cakes) pass straight through, so it is a true dash through danger. Area attacks are the exception - flames, lasers, beams, shockwaves and zone hazards still damage him. Base charge 7s · stock 20.'},
  rooty:{role:'PLANT CONTROL / BLOCKING SUMMONS',stats:'HP 60 · BRAMBLE GARDEN',passive:'BRAMBLE GARDEN grows 1 bramble near ROOTY every 7s, with up to 3 passive brambles waiting at once. Brambles deal light contact damage and slow enemies. Walk onto one to consume it and awaken a 12s THORN GUARD. The step-on zone is generous and drawn on the floor: you convert a bramble by stepping into its ring, not by landing dead-centre on the plant. Up to 3 Guards stay active; awakening a fourth instantly removes the oldest Guard and grows the new one where ROOTY stepped. Guard thorns deal stronger contact damage than brambles and also act as friendly cover: ordinary enemies cannot walk through them and hostile projectiles stop on them. Heavy elites and bosses resist the hard body-block but still take thorn contact damage and slow. General Summon Damage improves both bramble and Guard contact damage.',super:'BRAMBLES · creates 10 separate brambles in a radius-64 ring for 8s. Because the ring is tight and every bramble shows a large step zone, ROOTY can cross it and relocate his 3 active THORN GUARDS in one pass: each new Guard replaces the oldest once the cap is full. Unconverted brambles remain traps. Base charge 12s · stock 10.'},
  raja:{role:'APEX DAMAGE KING / MELEE PRESSURE',stats:'HP 130 · SPEED ×1.02 · WEAPON DMG ×1.22 · DR 8% · CRIT +10%',passive:'PREDATOR CLAWS auto-strike the nearest enemy within 85 every 0.82s for 42 × damage modifier / 65 knockback. Claws roll RAJA’s full crit chance for ×2 damage; Explosive Crits applies.',super:'PREDATOR FRENZY · opens with a radius-96 claw burst for 66 × damage modifier. The three visible opening ground-claw markers are real sweet spots: an enemy overlapping any one of them takes one extra 66 × damage-modifier hit. For 7s Raja moves 35% faster; auto-claws accelerate to every 0.24s, reach 145, avoid the immediately previous target when another target is in range, deal 60 × damage modifier and heal up to 1.5 HP on a successful Frenzy claw hit. While Frenzy is active Raja gains 10% extra multiplicative DR and 45% knockback resistance.'},
  mane:{role:'APEX FEAR CONTROL / SUSTAIN',stats:'HP 130 · SPEED ×1.02 · WEAPON DMG ×1.22 · DR 8% · KNOCKBACK ×1.22',passive:'KING\'S PAW automatically strikes a nearby target within 72 every 0.85s for 14 × damage modifier and 190 × knockback modifier.',super:'KING\'S ROAR · one 22 × damage-modifier arena hit · 175 knockback · fear-stun: 5s normal, 3s elite/brain, 1s conventional boss, 0.4s Bahamut · heals 28 HP. Echoes deal no damage; new entrants can receive one fear-stun.'},
  grizz:{role:'APEX TANK / LOCAL ATTRITION',stats:'HP 230 · SPEED ×0.82 · WEAPON DMG ×1.15 · BASE DR 4% · REGEN 0.10 HP/s',passive:'WOUNDED RESOLVE starts below 70% HP and progressively adds up to 42% multiplicative damage reduction near empty HP.',super:'GRIZZLY BULWARK · radius-160 quake for 5.5s. Opening hit: 7 damage / 95 knockback. Aftershocks about every 0.72s deal 6 damage plus a micro-stagger. Grizz gains 6s guard (30% extra multiplicative reduction), pulls XP inward, and each XP collected during guard heals 0.45 HP.'},
  fang:{role:'APEX SUMMON COMMANDER',stats:'HP 100 · SPEED ×1.08 · WEAPON DMG ×1.00 · ALL SUMMON DMG ×1.50 · STARTS WITH 2 PERMANENT WOLVES',passive:'PACK LEADER starts FANG with 2 permanent wolves. Summon Damage ×1.50. Wolves use guard, vanguard and hunter roles.',super:'PACK HOWL · 9 stock · 16s base recharge · calls 4 temporary wolves for 10s. With both permanent wolves alive, pack size reaches 6. Active wolves fan out and pursue aggressively for 7s.'},
  foxy:{role:'APEX SPEED / MARKSMAN / REPOSITION',stats:'HP 70 · SPEED ×1.16 · CRIT +10% · FIRE INTERVAL ×0.88 · RELOAD ×0.68 · BULLET SPEED ×1.12 · RANGE +0.22 · MAGNET +36 · VISION +30',passive:'SCOUT SENSES + QUICK HANDS. WILD-FOX is Foxy\'s signature ricochet rifle and can bounce up to 4 times per shot.',super:'FOX DASH · unlimited uses · 1.5s base recharge · travels 100 units in 0.14s with brief invulnerability · crossing an enemy deals 4 × damage modifier / 240 knockback · landing puff shoves nearby enemies away for 180 knockback without extra damage · restores 20% Max Ammo · grants 0.9s FOX FOCUS, which increases weapon damage by 25%.'},
  val:{role:'APEX EVASION / QUICK HANDS / RESOURCE CONVERSION',stats:'HP 65 · SPEED ×1.18 · DODGE +15% · FIRE INTERVAL ×0.90 · RELOAD ×0.78',passive:'PASTRY HUNT scatters Strawberry / Candy / Bread about every 8.5s. Normal kills have a 12% ingredient chance; elite/brain kills 42%; bosses 100%. Ingredients use their own short-range attraction. Collect 3 to auto-craft a ~42s Strawberry/Blueberry cake that blocks/shoves enemies and blocks hostile bullets, moving laser projectiles, continuous laser lanes and breath cones. Val can eat it for +2 HP when fresh, maturing to the old +8 HP prime heal after 18s, plus +3 XP.',super:'BAKERY PANIC · visible frosting ripple spreads across the arena. Eligible ordinary and summoned minions transform only when the wave reaches them, with a PUFF effect. Steel Crab/heavyweights, elites, Apex heroes and bosses resist Cakefy.'},
  talon:{role:'APEX FLIGHT / EXTREME DISPLACEMENT',stats:'HP 75 · GROUND SPEED ×0.82 · FLIGHT SPEED ×2.20 · FLIGHT VISION +65',passive:'SKY CYCLE alternates 5.0s grounded/vulnerable with 3.5s airborne/immune. Flight moves at ×2.20 speed, gains +65 vision and uses distinct takeoff, airborne ground-projection and landing tells.',super:'KAMIKAZE DIVE · 190-unit aimed dive over 0.30s · immune during travel · lateral route displacement · extreme impact displacement against ordinary minions · bosses resist displacement and cannot position-die.'},
  bahamut:{
    role:'FINAL APEX / MULTI-SKILL BRUISER',
    stats:'HP 260 · SPEED ×1.05 · WEAPON DMG ×1.35 · DR 25% · CRIT +15% · KNOCKBACK ×1.35 · REGEN 0.06 HP/s · LEVEL-UP FEAST 7 HP/LV',
    passive:'HP 260 · Weapon Damage ×1.35 · DR 25% · Crit +15% · Knockback ×1.35 · Regen 0.06 HP/s. LEVEL-UP FEAST restores 7 HP per level. DRAGON ARSENAL adds four numbered combat skills in addition to the equipped weapon and E Super.',
    arsenal:[
      {key:'1',name:'DRAGON BREATH',meta:'CD 2.2s · RANGE 186 · CONE 82°',body:'22 base direct damage × damage modifier, falling to about 82% at maximum range · 24 DPS × fire modifier for 2.1s · 175 × knockback modifier.'},
      {key:'2',name:'DRAGON LANCE',meta:'CD 3.0s · RANGE 238 · 3 BEAMS',body:'Three piercing beams · 34 base damage × damage modifier each · 620 projectile speed · pierce 3 · 75 knockback.'},
      {key:'3',name:'RADIAL BURST',meta:'CD 4.2s · 6 MISSILES · BLAST R34',body:'Each missile uses 58 base total damage: 70% direct + 30% explosion, both × damage modifier · fixed radial launch · 0.12s straight phase, then target lock/homing · 118 knockback.'},
      {key:'4',name:'DRAGON SWEEP',meta:'CD 3.6s · RADIUS 92',body:'42 base damage × damage modifier to enemies in range · 360 × knockback modifier. The three visible ground-claw markers are real sweet spots: an enemy overlapping any marker takes one extra Sweep hit.'},
    ],
    arsenalFoot:'Dragon 1–4 share a 0.24s global skill lock. Their cooldowns are independent of the E Super meter.',
    super:'FINAL APEX RUSH · 0.16s windup + 0.58s travel over 225 units · invulnerable through the charge · route contact 70 × damage modifier / 620 knockback · leaves a 120-wide, 5.5s fire road at 30 DPS × fire modifier · landing shock radius 160 for 110 × damage modifier / 900 knockback plus a class-scaled stun · then immediately unleashes empowered DRAGON BREATH, 5-beam DRAGON LANCE, 10-missile RADIAL BURST and an enlarged DRAGON SWEEP.'
  },
};

function heroDetailsHtml(c,{showClassTag=true,showDifficultyNote=true}={}){
  const d=HERO_DETAIL_SHEETS[c.id]||{};
  const stock=c.unlimitedSuper
    ? 'UNLIMITED USES · BASE RECHARGE '+c.superCharge+'s'
    : 'BASE STOCK '+c.superUses+' · BASE CHARGE '+c.superCharge+'s';
  const apexTag=showClassTag ? (c.apex?'<span class="specTag op">APEX / OP</span>':'<span class="specTag">BUNNY</span>') : '';
  const arsenal=d.arsenal?.length
    ? '<div class="specSection"><div class="specSectionTitle">DRAGON ARSENAL · 1–4</div><div class="specArsenal">'+d.arsenal.map(sk=>
        '<div class="specSkill"><div class="specSkillHead"><span class="specSkillKey">'+sk.key+'</span><b>'+sk.name+'</b></div><div class="specSkillMeta">'+uxCopy(sk.meta)+'</div><div class="specSkillBody">'+uxCopy(sk.body)+'</div></div>'
      ).join('')+'</div>'+(d.arsenalFoot?'<div class="specFoot">'+uxCopy(d.arsenalFoot)+'</div>':'')+'</div>'
    : '';
  return [
    '<div class="specRoleRow">'+apexTag+'<span class="specRole">'+(d.role||'HERO')+'</span></div>',
    '<div class="specSection"><div class="specSectionTitle">BASELINE</div><div class="specBody strong">'+uxCopy(d.stats||'HP 60 · STANDARD BASELINE')+'</div></div>',
    '<div class="specSection"><div class="specSectionTitle">PASSIVE / IDENTITY</div><div class="specBody">'+uxCopy(d.passive||c.passive||c.passiveDesc||'—')+'</div></div>',
    d.mechanics?'<div class="specSection"><div class="specSectionTitle">'+(d.mechanicsTitle||'MECHANICS')+'</div><div class="specBody">'+uxCopy(d.mechanics)+'</div></div>':'',
    arsenal,
    '<div class="specSection superSpec"><div class="specSectionTitle">SUPER · '+c.superName+'</div><div class="specBody">'+uxCopy(d.super||c.superDesc)+'</div><div class="specFoot">'+stock+(showDifficultyNote?' · DIFFICULTY MODIFIES LIMITED SUPER STOCK/CHARGE':'')+'</div></div>',
  ].join('');
}

// Curated OP-hero palette skins. These are intentionally art-directed material-channel
// swaps, not free hue rotation: the model, anatomy and silhouette never change.
const HERO_SKINS = {
  raja:[
    {id:'royal', name:'Royal Stripe', flavor:'Classic orange tiger with deep natural stripes and bright predator eyes.', swatches:[0xd96b22,0xf4dfbf,0x201113], palette:{body:0xd96b22,cream:0xf4dfbf,dark:0x23170e,eye:0xffd35a,stripe:0x201113,light:0xd96b22}},
    {id:'white', name:'White Tiger', flavor:'Cold white coat, black stripes and ice-blue eyes.', swatches:[0xe9edf0,0xffffff,0x15181d], palette:{body:0xe9edf0,cream:0xffffff,dark:0x20242a,eye:0x74d9ff,stripe:0x15181d,light:0xdceeff}},
    {id:'black', name:'Black Tiger', flavor:'Dark graphite tiger with bright silver-white stripes and a pale grey throat, chest and belly.', swatches:[0x3d444d,0xdfe6ec,0x171a1f], palette:{body:0x3d444d,cream:0xb8c1ca,dark:0x171a1f,eye:0xf0bd58,stripe:0xe4e9ed,light:0xb8c3ce}},
    {id:'blood', name:'Bloodstripe', flavor:'Dark iron-grey tiger with vivid blood-red stripes, red eyes and a pale grey underbelly.', swatches:[0x49464e,0xc7c3c0,0xd32945], palette:{body:0x49464e,cream:0xc7c3c0,dark:0x17171b,eye:0xff3048,stripe:0xd32945,light:0xc1aab2}},
  ],
  mane:[
    {id:'golden', name:'Golden King', flavor:'Warm tawny coat with a deep brown royal mane.', swatches:[0xc88d35,0xe8c47e,0x55301b], palette:{body:0xc88d35,cream:0xe8c47e,dark:0x57331d,eye:0xe6b54a,mane:0x55301b,light:0xc88d35}},
    {id:'white', name:'White Lion', flavor:'Ivory lion with a layered silver-cream mane.', swatches:[0xe7dfcf,0xf7f2e7,0xb9b5b0], palette:{body:0xe7dfcf,cream:0xf7f2e7,dark:0x554d48,eye:0x8ecdf2,mane:0xb9b5b0,light:0xe7dfcf}},
    {id:'black', name:'Black Lion', flavor:'Smoky grey lion with a true black mane, pale grey underside and warm gold predator eyes.', swatches:[0x666a70,0xb8b6b2,0x17191d], palette:{body:0x666a70,cream:0xb8b6b2,dark:0x292c31,eye:0xe0b34f,mane:0x17191d,light:0x969aa0}},
    {id:'sunfire', name:'Sunfire King', flavor:'Richer crimson lion with a proud golden mane and warm royal underfur.', swatches:[0xc84a2f,0xe1af63,0xb6862c], palette:{body:0xc84a2f,cream:0xe1af63,dark:0x4a2018,eye:0xffcf5c,mane:0xb6862c,light:0xd76840}},
    {id:'rose', name:'Rose Lion', flavor:'Dreamy pastel-pink lion with a deeper rose mane, pale cream underside and warm gold eyes.', swatches:[0xe9a7be,0xffe8f0,0xb95f86], palette:{body:0xe9a7be,cream:0xffe8f0,dark:0x6f3850,eye:0xffd76b,mane:0xb95f86,light:0xf2bdd0}},
  ],
  grizz:[
    {id:'grizzly', name:'Brown Grizz', flavor:'Heavy natural grizzly browns, warm muzzle tones and bright predator eyes.', swatches:[0x6f4b32,0xa87952,0x2d1f18], palette:{body:0x6f4b32,cream:0xa87952,dark:0x2d1f18,eye:0xf0c55c,light:0x6f4b32}},
    {id:'polar', name:'Polar Bear', flavor:'Cream-white fur with cool shadows and dark features.', swatches:[0xe9edef,0xf8f7f2,0x282d31], palette:{body:0xe9edef,cream:0xf8f7f2,dark:0x282d31,eye:0x78c9ed,light:0xe6f1f5}},
    {id:'moon', name:'Moon Bear', flavor:'Dark slate bear with a warm moon-mark chest and readable body separation.', swatches:[0x313840,0xe0c78d,0x101317], palette:{body:0x313840,cream:0xe0c78d,dark:0x101317,eye:0xe1bc62,light:0x847667}},
    {id:'panda', name:'Panda Guard', flavor:'Ivory face and chest against black limbs, ears and body.', swatches:[0x17191c,0xf2eee5,0x090a0b], palette:{body:0x17191c,cream:0xf2eee5,dark:0x090a0b,eye:0x73a8d8,head:'cream',light:0xcfd3d2}},
  ],
  fang:[
    {id:'grey', name:'Grey Fang', flavor:'Natural steel-grey wolf with warm predator eyes.', swatches:[0x707a85,0xc0c8cf,0x252b31], palette:{body:0x707a85,cream:0xc0c8cf,dark:0x252b31,eye:0xe1b64a,light:0x788591}},
    {id:'night', name:'Nightfang', flavor:'Darker charcoal-black wolf with pale grey underside and bright amber predator eyes.', swatches:[0x2f3943,0xaeb7c0,0x0d1218], palette:{body:0x2f3943,cream:0xaeb7c0,dark:0x0d1218,eye:0xf1c058,light:0x6b7987}},
    {id:'frost', name:'Frostfang', flavor:'Bright arctic white wolf with icy blue-grey points.', swatches:[0xe8eff2,0xffffff,0x617282], palette:{body:0xe8eff2,cream:0xffffff,dark:0x617282,eye:0x74d9ff,light:0xe5f5ff}},
    {id:'storm', name:'Blue Fang', flavor:'Bold cobalt fantasy wolf with icy blue chest and deep navy points.', swatches:[0x245fc1,0x82bdff,0x10264d], palette:{body:0x245fc1,cream:0x82bdff,dark:0x10264d,eye:0x9ff7ff,light:0x3a8df0}},
  ],
  foxy:[
    {id:'red', name:'Red Fox', flavor:'Classic red-orange fox with a bright cream mask, tail tip and golden predator eyes.', swatches:[0xe97836,0xffead7,0x4a2415], palette:{body:0xe97836,cream:0xffead7,dark:0x4a2415,eye:0xffcf61,light:0xe97836}},
    {id:'silver', name:'Silver Fox', flavor:'Silver-charcoal coat with pale cool highlights.', swatches:[0x59616a,0xd6d9dc,0x1c2025], palette:{body:0x59616a,cream:0xd6d9dc,dark:0x1c2025,eye:0x7ec7f2,light:0x73808d}},
    {id:'arctic', name:'Arctic Fox', flavor:'Clean winter white with soft blue-grey points.', swatches:[0xe9eff2,0xffffff,0x606c78], palette:{body:0xe9eff2,cream:0xffffff,dark:0x606c78,eye:0x6ecfff,light:0xe4f3fa}},
    {id:'shadow', name:'Shadow Fox', flavor:'Dark ash fox with black points and a lighter warm-grey throat, chest and belly.', swatches:[0x464148,0xbda99d,0x161418], palette:{body:0x464148,cream:0xbda99d,dark:0x161418,eye:0xeaa258,light:0x9c8980}},
  ],
  val:[
    {id:'ginger', name:'Ginger Tabby', flavor:'Classic warm ginger tabby with creamy underside and red stripes.', swatches:[0xf28b6f,0xffede0,0xb94c37], palette:{body:0xf28b6f,cream:0xffede0,dark:0x5a2a24,eye:0xffdc8a,stripe:0xb94c37,light:0xf7a282}},
    {id:'pink', name:'Pink Frosting', flavor:'Soft pink cat with white frosting tones and bright berry stripes.', swatches:[0xf3a2c9,0xfff1f7,0xd96aa0], palette:{body:0xf3a2c9,cream:0xfff1f7,dark:0x6d314c,eye:0xfff0a8,stripe:0xd96aa0,light:0xf8bfd9}},
    {id:'purple', name:'Purple Velvet', flavor:'Fantasy violet coat with pale cream frosting and deep plum stripes.', swatches:[0x9f7cff,0xf1e9ff,0x5a35b6], palette:{body:0x9f7cff,cream:0xf1e9ff,dark:0x332255,eye:0xffefad,stripe:0x5a35b6,light:0xbca0ff}},
    {id:'blue', name:'Blueberry Cream', flavor:'Cool pastel-blue coat with white cream and bright cobalt striping.', swatches:[0x71b7ff,0xf6fbff,0x2d6fcb], palette:{body:0x71b7ff,cream:0xf6fbff,dark:0x1f3f70,eye:0xfff3b2,stripe:0x2d6fcb,light:0xa5d3ff}},
    {id:'white', name:'Snow Cake', flavor:'White sugar-coat cat with pale blush shadows and clean rose-gold stripes.', swatches:[0xf0eef1,0xffffff,0xc89ab1], palette:{body:0xf0eef1,cream:0xffffff,dark:0x5b4f5a,eye:0x8fd7ff,stripe:0xc89ab1,light:0xffffff}},
  ],
  talon:[
    {id:'redtail', name:'Redtail', flavor:'Natural hawk browns, cream breast and golden beak.', swatches:[0x8c633d,0xe4d2ad,0xe9b447], palette:{body:0x8c633d,mid:0x6e492f,dark:0x3a291e,cream:0xe4d2ad,beak:0xe9b447,eye:0xffd35a,flight:0xffd35a,light:0xa67b4b}},
    {id:'gyr', name:'Gyrfalcon', flavor:'White and cool-grey raptor plumage with icy highlights.', swatches:[0xe8ecec,0xb9c2c8,0x56616b], palette:{body:0xe8ecec,mid:0xb9c2c8,dark:0x56616b,cream:0xf8f7ef,beak:0xc8b77a,eye:0x8edcff,flight:0xb9ecff,light:0xdcecf1}},
    {id:'raven', name:'Ravenhawk', flavor:'Graphite-black raptor with layered charcoal feathers and pale breast contrast.', swatches:[0x2d333a,0x5c6670,0xaeb6be], palette:{body:0x2d333a,mid:0x5c6670,dark:0x10151a,cream:0xaeb6be,beak:0xb69752,eye:0xffc557,flight:0xd8ae58,light:0x79848e}},
    {id:'storm', name:'Stormwing', flavor:'Muted slate-blue feathers with pale storm-cloud breast.', swatches:[0x455d70,0x647d90,0xc1d0da], palette:{body:0x455d70,mid:0x647d90,dark:0x263744,cream:0xc1d0da,beak:0xd2b260,eye:0x8ee7ff,flight:0x8ee7ff,light:0x62859d}},
  ],
  bahamut:[
    {id:'arcane', name:'Arcane Bahamut', flavor:'Original dusk-purple hide, pale scales and violet accents.', swatches:[0x2d2435,0xc6b6cf,0x8d69bb], palette:{body:0x2d2435,dorsal:0x17131d,ventral:0xc6b6cf,accent:0x8d69bb,membrane:0x4a3758,horn:0xe1d4c4,claw:0x120f15,light:0x75608c}},
    {id:'inferno', name:'Crimson Bahamut', flavor:'Regal crimson dragon with a warm cream underside and muted gold accents.', swatches:[0x8f3f36,0xf0d2a7,0xc99a52], palette:{body:0x8f3f36,dorsal:0x48231f,ventral:0xf0d2a7,accent:0xc99a52,membrane:0x6f302f,horn:0xead7b4,claw:0x2a1715,light:0xc86b54}},
    {id:'void', name:'Azure Bahamut', flavor:'Deep royal-blue dragon with a clean white underside and icy blue accents.', swatches:[0x315f9a,0xf4f7fa,0x82c9ff], palette:{body:0x315f9a,dorsal:0x183651,ventral:0xf4f7fa,accent:0x82c9ff,membrane:0x587fa8,horn:0xe7edf2,claw:0x172536,light:0x75b9e8}},
    {id:'frost', name:'Olive Bahamut', flavor:'Ancient olive dragon with a pale sand underside and restrained bronze accents.', swatches:[0x606842,0xded6b3,0xb18a4d], palette:{body:0x606842,dorsal:0x33391f,ventral:0xded6b3,accent:0xb18a4d,membrane:0x747750,horn:0xe2d7b5,claw:0x292d1c,light:0x9e9a69}},
    {id:'celestial', name:'Celestial Bahamut', flavor:'Radiant celestial dragon with ivory scales, rich gold armor tones and a restrained pale blue divine accent.', swatches:[0xe7dcc6,0xd8af45,0x9fcfff], palette:{body:0xe7dcc6,dorsal:0xb98b2d,ventral:0xfff8ea,accent:0x9fcfff,membrane:0xf1e1b8,horn:0xfff6df,claw:0x8c6a22,light:0xf4dc83}},
  ],
};
function heroSkinList(cid){ return HERO_SKINS[cid]||[]; }
function heroSkinById(cid,id){
  const list=heroSkinList(cid);
  return list.find(s=>s.id===id) || list[0] || null;
}
function selectedHeroSkin(cid){
  let id='';
  try{ id=SAVE?.heroSkins?.[cid]||''; }catch(_){ }
  return heroSkinById(cid,id);
}
function setHeroSkin(cid,id){
  const skin=heroSkinById(cid,id); if(!skin) return null;
  SAVE.heroSkins=SAVE.heroSkins&&typeof SAVE.heroSkins==='object'?SAVE.heroSkins:{};
  SAVE.heroSkins[cid]=skin.id; saveGame();
  return skin;
}
function cycleHeroSkin(cid,dir){
  const list=heroSkinList(cid); if(!list.length) return null;
  const cur=selectedHeroSkin(cid)||list[0];
  let i=list.findIndex(s=>s.id===cur.id); if(i<0)i=0;
  return setHeroSkin(cid,list[(i+(dir<0?-1:1)+list.length)%list.length].id);
}
function heroSkinPickerHtml(cid){
  const list=heroSkinList(cid); if(!list.length) return '';
  const s=selectedHeroSkin(cid)||list[0];
  const dots=s.swatches.map(c=>'<span class="skinSwatch" style="background:'+hexColor(c)+'"></span>').join('');
  return '<div class="skinBlock" data-skin-hero="'+cid+'">'+
    '<div class="skinEyebrow">SKIN · '+list.length+' CURATED</div>'+
    '<div class="skinPicker"><button class="skinChevron" type="button" data-skin-dir="-1" aria-label="Previous skin">‹</button>'+
    '<div class="skinChoice"><b class="skinName">'+s.name+'</b><div class="skinSwatches">'+dots+'</div></div>'+
    '<button class="skinChevron" type="button" data-skin-dir="1" aria-label="Next skin">›</button></div>'+
    '<div class="skinFlavor">'+s.flavor+'</div></div>';
}
function gunCardSubtitle(g){
  return uxCopy(g.cardDesc || g.desc);
}
function gunFireRateText(g){
  const r=1/Math.max(0.001,Number(g.fire)||1);
  return (r>=10?r.toFixed(1):r>=1?r.toFixed(2):r.toFixed(2)).replace(/\.0+$/,'').replace(/(\.\d*[1-9])0+$/,'$1')+'/s';
}
function gunMetaHtml(g,{includeCrit=true}={}){
  const rangeLabel=g.special.includes('long')?'LONG':g.special.includes('mid')?'MID':'SHORT';
  return 'DAMAGE <b>'+g.dmg+'</b> · AMMO <b>'+g.ammo+'</b> · FIRE RATE <b>'+gunFireRateText(g)+'</b> · RELOAD <b>'+g.reload+'s</b> · RANGE <b>'+rangeLabel+'</b>'+(includeCrit?' · CRIT <b>'+g.crit+'%</b>':'')+(g.moveMul>1?' · MOVE SPEED <b>+'+Math.round((g.moveMul-1)*100)+'%</b>':'')+(g.pool?' · VENOM POOL':'');
}
function gunDetailsHtml(g){
  const rangeLabel = g.special.includes('long')?'LONG':g.special.includes('mid')?'MID':'SHORT';
  const tags=[];
  if(g.special.includes('explode')) tags.push('BLAST '+Math.round(g.blast||0));
  if(g.special.includes('cluster')) tags.push('CLUSTER ×'+(g.clusterCount||0));
  if(g.special.includes('homing')) tags.push('HOMING');
  if(g.special.includes('opbeam')||g.special.includes('beam')) tags.push('PIERCE');
  if(g.special.includes('shieldbash')) tags.push('GUARD');
  if(g.special.includes('melee')) tags.push('MELEE');
  if(g.special.includes('flameop')) tags.push('CONE');
  if(g.special.includes('bounce')) tags.push('RICOCHET'+((g.bounces||0)>0?' ×'+g.bounces:''));
  if(g.special.includes('bone')) tags.push('BONE DOG 3% / HIT · 8s · STACKS');
  if(g.pool) tags.push('VENOM POOL '+(g.pool.r||32)+' · '+(g.pool.life||2.8)+'s');
  const statLine=gunMetaHtml(g);
  return '<div class="specLine"><b>ROLE</b> · '+(g.role||gunCardSubtitle(g))+'</div>'+
    '<div class="specBody">'+uxCopy(g.detail||g.desc)+'</div>'+
    '<div class="specLine">'+statLine+'</div>'+
    (tags.length?'<div class="specFoot">'+tags.join(' · ')+'</div>':'');
}

const DIFFS = {
  Easy:   { label:'EASY',   sb:-0.03, hpMult:0.8, speedMult:1.00, incomingMult:1.00, desc:'A gentler lab tour. Weaker enemies, slower waves, a lighter boss schedule.' },
  Normal: { label:'NORMAL', sb:0,    hpMult:1,   speedMult:1.00, incomingMult:1.00, desc:'The intended experience. Balanced waves and a fair boss schedule.' },
  Hard:   { label:'HARD',   sb:0.03, hpMult:1.1, speedMult:1.05, incomingMult:1.08, desc:'Elites arrive sooner. Enemies are tougher, quicker and hit harder.' },
  Insane: { label:'INSANE', sb:0.06, hpMult:1.45,speedMult:1.16, incomingMult:1.28, desc:'Relentless pressure without fodder inflation: basic mobs stay fragile; large enemies, elites and bosses gain +45% HP while damage and attack tempo rise. Pursuit is +16% with an OP item in your loadout, and +8% on a clean / no-OP run. A clean run also gets a 10% lighter grid: heavies gain +30.5% HP and incoming damage is ×1.152. Any OP hero or OP gun keeps these full values.' },
};

// ---------------- Globals ----------------
const G = {
  state:'menu', stage:'char', sel:{ char:null, gun:null, gem:null, diff:null },
  scene:null, camera:null, renderer:null, raycaster:null, clock:null,
  hero:null, gun:null, enemies:[], bullets:[], ebullets:[], orbs:[], summons:[], effects:[], clouds:[],
  time:0, score:0, gold:0, kills:0, exp:0, level:0, mult:1,
  spawners:[], bossIdx:0, mIdx:0, mGoldIdx:0, _berserkStage:0,
  keys:{}, mouse:{x:0,y:0,down:false,touchMode:false}, aimWorld:new THREE.Vector3(), aimDir:new THREE.Vector3(0,0,1),
  shake:0, simPaused:false, perks:[], perkStacks:{}, unlockedKings:[], masteryBonus:{}, debugFrom:'menu',
  lastHpBar:null, levelPaused:false, heroR:HERO_R, debugInvalidated:false,
  // A run is RANKABLE only when a real player started it (G._rankIntent, set by
  // startRunWithOrientation) and nothing programmatic touched it (G.harnessTouched, set by
  // every call through the __BBAPI test harness). Training, the debug panel and the test
  // harness produce SANDBOX runs: fully playable, but they leave no trace - no leaderboard
  // row, no credits, no conquest unlocks. See runIsRankable().
  rankedRun:false, harnessTouched:false, _rankIntent:false,
  testMode:false, testPads:[], testPadCooldown:0, _launchTest:false,
  testSel:{char:null,gun:null,gem:null,diff:null,perks:[],gear:[],scoreDie:true},
  trainingSetupDirty:false,
  desktopSprintToggle:false,
  finalTimeoutWarned:false, finalTimeoutUrgentWarned:false,
};

const $ = s => document.querySelector(s);

function toWorld(gdx,gdy){ return new THREE.Vector3(gdx-ARENA.w/2, 0, ARENA.h/2-gdy); }
function toGD(v){ return { x:v.x+ARENA.w/2, y:ARENA.h/2-v.z }; }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function dist2(ax,az,bx,bz){ const dx=ax-bx, dz=az-bz; return dx*dx+dz*dz; }

// User-facing stat language: always describe what the player experiences, not internal
// multipliers. Smaller fire/reload multipliers are faster internally, but the UI should say
// FIRE RATE +N% / RELOAD TIME -N% so every screen reads the same way.
function uxCopy(value){
  let s=String(value??'');
  const cleanLabel=label=>{
    const upper=label===label.toUpperCase();
    let x=label.replace(/\bDMG\b/gi,'Damage').replace(/^ALL SUMMON DAMAGE$/i,'Summon Damage');
    if(upper) x=x.toUpperCase();
    return x;
  };
  const pct=n=>Math.round(Math.abs(n)*100);
  const signed=(delta,{zero='STANDARD'}={})=>{
    if(Math.abs(delta)<0.0005) return zero;
    return (delta>0?'+':'−')+pct(delta)+'%';
  };
  const direct=/\b(Move Speed|Speed|Ground Speed|Flight Speed|Weapon Damage|Weapon DMG|All Summon Damage|All Summon DMG|Summon Damage|Summon DMG|Poison Damage|Poison DMG|Fire Damage|Fire DMG|Bullet Speed|Knockback)\s*×\s*(\d+(?:\.\d+)?)/gi;
  s=s.replace(direct,(m,label,num)=>cleanLabel(label)+' '+signed(Number(num)-1));
  s=s.replace(/\bFire Interval\s*×\s*(\d+(?:\.\d+)?)/gi,(m,num)=>{
    const n=Number(num); return 'Fire Rate '+signed(n>0?(1/n)-1:0);
  });
  s=s.replace(/\bReload(?: Time)?\s*×\s*(\d+(?:\.\d+)?)/gi,(m,num)=>'Reload Time '+signed(Number(num)-1));
  s=s.replace(/\b(\d+(?:\.\d+)?)×\s*speed\b/gi,(m,num)=>'Move Speed '+signed(Number(num)-1));
  return s;
}

// ---------------- Audio (synthesized WebAudio) ----------------
const AUD = {
  ctx:null, master:null, muted:false, bgmOn:false, _timer:null, _step:0, _next:0, _track:null, _musicEl:null, _cache:{},
  init(){
    if(this.ctx) return;
    try{
      const C = window.AudioContext || window.webkitAudioContext;
      if(!C) return;
      this.ctx = new C();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.6;
      this.master.connect(this.ctx.destination);
    }catch(e){ this.ctx = null; }
  },
  resume(){ if(this.ctx && this.ctx.state==='suspended') this.ctx.resume(); },
  setMuted(m){ this.muted=m; if(this.master) this.master.gain.value = m?0:0.6; if(this._musicEl) this._musicEl.volume = m?0:0.45; },
  tone(freq, dur, type, vol, slide, delay){
    if(!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + (delay||0);
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type||'square';
    o.frequency.setValueAtTime(freq, t);
    if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq+slide), t+dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t+dur+0.03);
  },
  noise(dur, vol, freq, q, delay){
    if(!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + (delay||0);
    const n = Math.max(1, Math.floor(this.ctx.sampleRate*dur));
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<n;i++) d[i] = (Math.random()*2-1)*(1-i/n);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=freq||2000; f.Q.value=q||1;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t);
  },
  shoot(){ this.noise(0.05, 0.16, 2600, 1.4); this.tone(190, 0.06, 'square', 0.05, -120); },
  empty(){ this.noise(0.028, 0.3, 950, 3); },
  kill(){ this.noise(0.07, 0.12, 700, 1.2); },
  xp(){ this.tone(700, 0.09, 'sine', 0.11); this.tone(1050, 0.12, 'sine', 0.11, 0, 0.06); },
  heal(){ this.tone(392, 0.13, 'triangle', 0.12); this.tone(588, 0.20, 'triangle', 0.12, 0, 0.08); },
  dash(){ this.noise(0.16, 0.2, 1500, 1.3); this.tone(520, 0.18, 'sine', 0.12, -320); },
  hurt(){ this.noise(0.28, 0.4, 320, 0.7); this.tone(120, 0.22, 'sawtooth', 0.16, -60); },
  perk(){ [540,810,1080].forEach((f,i)=>this.tone(f, 0.12, 'square', 0.11, 0, i*0.07)); },
  levelup(){ [440,554,660,880].forEach((f,i)=>this.tone(f, 0.18, 'triangle', 0.13, 0, i*0.09)); },
  boom(){ this.noise(0.35, 0.35, 380, 0.6); this.tone(75, 0.3, 'sine', 0.28, -35); },
  super(){ [440,587,740,1108].forEach((f,i)=>this.tone(f, 0.2, 'sawtooth', 0.09, 0, i*0.07)); this.noise(0.4, 0.18, 1200, 1); },
  boss(){ this.tone(95, 0.45, 'sawtooth', 0.2, -20); this.tone(72, 0.6, 'sawtooth', 0.2, -15, 0.22); },
  ui(){ this.tone(880, 0.05, 'square', 0.06); },
  tick(sec){
    const urgent = sec<=5;
    this.tone(urgent?1400:1000, 0.05, 'square', urgent?0.14:0.09);
    if(urgent) this.tone(1600, 0.06, 'square', 0.1, 0, 0.06);
  },
  win(){
    const seq = [523,659,784,1047,1319,1568];
    seq.forEach((f,i)=>this.tone(f, 0.25, 'square', 0.11, 0, i*0.11));
    this.tone(2093, 0.55, 'square', 0.12, 0, 0.72);
    [1047,1319,1568].forEach((f,i)=>this.tone(f, 0.18, 'triangle', 0.08, 0, 0.78+i*0.13));
  },
  lose(){
    this.tone(220, 0.5, 'sawtooth', 0.16, -30);
    this.tone(185, 0.55, 'sawtooth', 0.16, -25, 0.35);
    this.tone(147, 0.65, 'sawtooth', 0.16, -20, 0.7);
    this.tone(110, 1.1, 'sawtooth', 0.15, -15, 1.05);
    this.tone(73, 1.4, 'sine', 0.18, -10, 1.5);
  },
  startBGM(){
    this.init();
    if(!this.ctx || this.bgmOn) return;
    this.bgmOn = true;
    this._step = 0;
    this._next = this.ctx.currentTime + 0.08;
    this._timer = setInterval(()=>this._schedule(), 30);
  },
  stopBGM(){
    this.bgmOn = false;
    if(this._timer){ clearInterval(this._timer); this._timer = null; }
    if(this._musicEl){ try{ this._musicEl.pause(); }catch(e){} this._musicEl = null; }
    this._track = null;
    this._randomTrackId = null;
  },
  playTrack(id){
    this.init();
    // Keep the already-resolved RANDOM choice through pause/resume. A fresh RANDOM
    // song is chosen only after stopBGM() clears the active run/session track.
    if(id==='random' && this._track==='random' && this._randomTrackId){
      if(this._musicEl?.paused){ const p=this._musicEl.play(); if(p&&p.catch)p.catch(()=>{}); }
      return;
    }
    if(id!=='random' && this._track===id){
      if(id==='synth' && !this.bgmOn) this.startBGM();
      return;
    }
    if(this.bgmOn) this.stopBGM();
    else if(this._musicEl){ try{ this._musicEl.pause(); }catch(e){} this._musicEl = null; }

    let playId=id;
    if(id==='random'){
      const pool=MUSIC.filter(m=>m.id!=='random' && !!m.url);
      if(!pool.length){ this._track=null; this._randomTrackId=null; return; }
      playId=pool[Math.floor(Math.random()*pool.length)].id;
      this._randomTrackId=playId;
    }else{
      this._randomTrackId=null;
    }
    this._track=id;
    if(playId==='synth'){ this.startBGM(); return; }
    const t = MUSIC.find(m=>m.id===playId);
    if(!t || !t.url){ this._track = null; this._randomTrackId=null; return; }
    let el = this._cache[playId];
    if(!el){ el = this._cache[playId] = new Audio(t.url); el.loop = true; el.preload = 'auto'; }
    el.volume = this.muted ? 0 : 0.45;
    el.currentTime = 0;
    this._musicEl = el;
    const p = el.play();
    if(p && p.catch) p.catch(()=>{});
  },
  _schedule(){
    if(!this.ctx || !this.bgmOn) return;
    const spb = 60/148/4;
    while(this._next < this.ctx.currentTime + 0.12){
      this._playStep(this._step, this._next);
      this._next += spb;
      this._step = (this._step+1)%64;
    }
  },
  _playStep(s, t){
    if(!this.ctx || this.muted) return;
    if(s%4===0) this._kick(t);
    if(s%16===8) this.noise(0.09, 0.16, 1700, 0.8, t-this.ctx.currentTime);
    if(s%2===1) this.noise(0.02, 0.05, 8000, 1, t-this.ctx.currentTime);
    const bass = [55,55,65.4,55,55,82.4,73.4,65.4,49,49,58.3,49,49,65.4,58.3,55,
                  55,55,65.4,55,55,82.4,73.4,65.4,55,55,65.4,82.4,87.3,82.4,73.4,65.4];
    if(s%2===0) this._bass(bass[s%32], t);
    if(s===20 || s===52) this.tone(220, 0.4, 'sawtooth', 0.04, -60, t-this.ctx.currentTime);
    if(s===24 || s===56) this.tone(233, 0.4, 'sawtooth', 0.04, -60, t-this.ctx.currentTime);
  },
  _kick(t){
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(38, t+0.12);
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t+0.15);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t+0.17);
  },
  _bass(freq, t){
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type='square'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t+0.22);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t+0.24);
  },
};

// ---------------- Damage feedback / status helpers ----------------
function dmgVignette(){
  const el = $('#dmgVignette');
  el.style.transition = 'none';
  el.style.opacity = 0.95;
  requestAnimationFrame(()=>{
    el.style.transition = 'opacity .8s ease-out';
    el.style.opacity = 0;
  });
  const ctn = $('#splatCtn');
  for(let i=0;i<4;i++){
    const s = document.createElement('div');
    s.className = 'splat';
    const edge = Math.floor(Math.random()*4);
    const inset = 1 + Math.random()*2; // hug the edges, 1-3% in from the border
    if(edge===0){ s.style.left = (Math.random()*100)+'%'; s.style.top = inset+'%'; }
    else if(edge===1){ s.style.left = (Math.random()*100)+'%'; s.style.top = (100-inset)+'%'; }
    else if(edge===2){ s.style.left = inset+'%'; s.style.top = (Math.random()*100)+'%'; }
    else { s.style.left = (100-inset)+'%'; s.style.top = (Math.random()*100)+'%'; }
    const size = 20+Math.random()*36;
    s.style.width = size+'px'; s.style.height = size+'px';
    ctn.appendChild(s);
    setTimeout(()=>s.remove(), 800);
  }
}

function applyStatusTint(e){
  let col = null, amt = 0.55;
  if(e.poison && e.burn) col = new THREE.Color(0x8a6a3a);
  else if(e.poison) col = new THREE.Color(0x6fbf4f);
  else if(e.burn){
    col = new THREE.Color(0xff7a3d);
    // Fire never goes out now, so the tint doubles as the readout for how hot a target is: one
    // light trickle of a stack barely shows, a fully stacked burn glows hard. Without this every
    // ignited enemy on screen would sit at the same flat orange for the rest of the run.
    amt = 0.26 + 0.42*clamp((e.burn.stacks||1)/FIRE_MAX_STACKS,0,1);
  }
  e.mesh.traverse(o=>{
    if(o.isMesh && o.material && o.material.isMeshStandardMaterial && o.userData.baseColor){
      o.material.color.copy(o.userData.baseColor);
      if(col) o.material.color.lerp(col, amt);
      // A body the magnet is dragging is in flight, and it is drawn as such: the same spectral
      // blue the game already uses for "phased" is washed over it, on top of any status tint, so
      // a body that will pass straight through MAG reads as debris immediately instead of looking
      // like a normal walking enemy. Colour-only on purpose - it costs nothing (no program
      // change, unlike flipping `transparent`), and the opacity half of the look lives in
      // applyMagnetGhost. Cleared automatically: the wash is driven by the same per-frame call
      // that owns the body's colour, so it ends with the pull.
      if(e.magnetGhost) o.material.color.lerp(MAGNET_PULL_GHOST_TINT, MAGNET_PULL_GHOST_TINT_AMT);
    }
  });
}

function clearArena(){
  for(const p of (G.testPads||[])){ if(p?.mesh) sceneRemove(p.mesh); }
  G.testPads=[];
  for(const e of G.enemies){
    if(e.apexHpBar) removeApexWorldHpBar(e);
    if(e.bossWorldHpBar) removeBossWorldHpBar(e);
    if(e.eliteHitStatus) removeEliteHitStatus(e);
    if(e.shield?.mesh) sceneRemove(e.shield.mesh);
    if(e.bombFx) sceneRemove(e.bombFx);
    if(e.laserSight) sceneRemove(e.laserSight);
    sceneRemove(e.mesh);
  }
  for(const b of G.bullets) sceneRemove(b.mesh);
  for(const b of G.ebullets) sceneRemove(b.mesh);
  for(const o of G.orbs){ sceneRemove(o.mesh); sceneRemove(o.glow); }
  for(const s of G.summons) sceneRemove(s.mesh);
  for(const f of G.effects){
    if(f.mesh) sceneRemove(f.mesh);
    // MAG's field ring is a second mesh that hangs off the same effect, so a run that ends while
    // the magnet is still planted has to take the ring with it - otherwise a ring would be left
    // standing on the floor of the next run.
    if(f.fieldRing) sceneRemove(f.fieldRing);
  }
  for(const c of G.clouds) sceneRemove(c.mesh);
  if(G.testPads?.length){ for(const p of G.testPads){ if(p.mesh) sceneRemove(p.mesh); } G.testPads=[]; }
  if(G.hero?.reloadIndicator?.sprite) sceneRemove(G.hero.reloadIndicator.sprite);
  if(G.heroMesh) sceneRemove(G.heroMesh);
  if(G.renderer?.domElement) G.renderer.domElement.style.cursor='';
  document.querySelectorAll('#floaters .floater').forEach(el=>el.remove());
  $('#bossbarWrap').hidden = true;
  G.hero = null;
  G.heroMesh = null;
}

// ---------------- Scene setup ----------------
const HX = 175, HY = 195;
const CAM_OFF = new THREE.Vector3(0, 300, 215);
// How much the one fixed camera squashes each world axis on screen. World-z (into the floor)
// shrinks by CAM_TILT_SIN, world-y (up) by CAM_TILT_COS. Anything that has to read as a flat
// shape to the player - a pickup cross, a marker - is built in the XY plane and then scaled
// up by 1/CAM_TILT_COS so the tilt can not squash its vertical arms.
const CAM_TILT_SIN = CAM_OFF.y/Math.hypot(CAM_OFF.y, CAM_OFF.z);
const CAM_TILT_COS = CAM_OFF.z/Math.hypot(CAM_OFF.y, CAM_OFF.z);

function initScene(){
  const renderer = new THREE.WebGLRenderer({ antialias:false, preserveDrawingBuffer:false, powerPreference:'high-performance' });
  renderer.setPixelRatio(1/mobileGraphicsCrunch());
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.useLegacyLights = true;
  $('#gameCtn').appendChild(renderer.domElement);
  G.renderer = renderer;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04060a);
  G.scene = scene;

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2500);
  camera.up.set(0,1,0);
  G.camera = camera;
  function fitCamera(){
    recomputeView();
    const m = 1.02;
    camera.left = -VIEW.halfW*m; camera.right = VIEW.halfW*m;
    camera.top = VIEW.halfH*m; camera.bottom = -VIEW.halfH*m;
    camera.updateProjectionMatrix();
  }
  fitCamera();
  camera.position.set(0, CAM_OFF.y, CAM_OFF.z);
  camera.lookAt(0,0,0);
  window.addEventListener('resize', ()=>{ renderer.setSize(innerWidth, innerHeight, false); fitCamera(); });

  G.raycaster = new THREE.Raycaster();

  // lights
  scene.add(new THREE.AmbientLight(0x4a5a6e, 0.5));
  scene.add(new THREE.HemisphereLight(0x6b7f94, 0x020305, 0.34));
  const rim = new THREE.DirectionalLight(0x9fc0de, 0.72);
  rim.position.set(-300, 240, -180);
  scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0x5a6480, 0.24);
  rim2.position.set(260, 170, 260);
  scene.add(rim2);
  G.heroLight = new THREE.PointLight(0xffedc4, 0.44, 120, 1.8);
  scene.add(G.heroLight);
  G.charLight = new THREE.PointLight(0xffffff, 0.385, 120, 1.4);
  scene.add(G.charLight);
  // Extra short-range core illumination: brightens only the innermost readable area.
  G.coreLight = new THREE.PointLight(0xfff3df, 0.16, 52, 2.2);
  scene.add(G.coreLight);

  // floor (oversized so it always covers the adaptive view at any aspect)
  const ft = floorTexture();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.MeshStandardMaterial({ map:ft, roughness:0.95, metalness:0 }));
  floor.rotation.x = -Math.PI/2;
  floor.position.set(0,0,0);
  scene.add(floor);

  // of the largest safe mobile wins because it changes no collision/gameplay state.
  {
    const rockN=55, grassN=55;
    const rockGeo=new THREE.DodecahedronGeometry(1,0);
    const grassGeo=new THREE.ConeGeometry(1,3,5);
    const rockMat=new THREE.MeshStandardMaterial({color:0x353b44,roughness:1});
    const grassMat=new THREE.MeshStandardMaterial({color:0x2f4a2f,roughness:1});
    const rocks=new THREE.InstancedMesh(rockGeo,rockMat,rockN);
    const grass=new THREE.InstancedMesh(grassGeo,grassMat,grassN);
    const dummy=new THREE.Object3D();
    let ri=0,gi=0;
    for(let i=0;i<110;i++){
      const a=Math.random()*Math.PI*2;
      const r=30+Math.random()*640;
      const x=Math.cos(a)*r,z=Math.sin(a)*r;
      const rock=(i<rockN);
      dummy.position.set(x,1,z);
      dummy.rotation.set(0,Math.random()*Math.PI,0);
      if(rock){
        const sc=2.2+Math.random()*2;
        dummy.scale.set(sc,sc,sc);
        dummy.updateMatrix(); rocks.setMatrixAt(ri++,dummy.matrix);
      }else{
        const sc=1.6+Math.random();
        dummy.scale.set(sc,1,sc);
        dummy.updateMatrix(); grass.setMatrixAt(gi++,dummy.matrix);
      }
    }
    rocks.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    grass.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    rocks.frustumCulled=false; grass.frustumCulled=false;
    scene.add(rocks,grass);
  }

  // Dead pines are also static, so 20 trees become one trunk batch + one foliage batch.
  {
    const n=20;
    const trunkGeo=new THREE.CylinderGeometry(0.9,1.6,1,5);
    const folGeo=new THREE.ConeGeometry(1,1,5);
    const trunkMat=new THREE.MeshBasicMaterial({color:0xffffff,vertexColors:true});
    const folMat=new THREE.MeshBasicMaterial({color:0xffffff,vertexColors:true});
    const trunks=new THREE.InstancedMesh(trunkGeo,trunkMat,n);
    const foliage=new THREE.InstancedMesh(folGeo,folMat,n);
    const dummy=new THREE.Object3D();
    const shades=[0x080d16,0x0a1120,0x0c1424,0x09101a];
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2;
      const r=50+Math.random()*600;
      const x=Math.cos(a)*r,z=Math.sin(a)*r;
      const h=13+Math.random()*17;
      const col=new THREE.Color(shades[(Math.random()*4)|0]);
      dummy.position.set(x,h*0.14,z);
      dummy.rotation.set(0,Math.random()*Math.PI,0);
      dummy.scale.set(1, h*0.28, 1);
      dummy.updateMatrix(); trunks.setMatrixAt(i,dummy.matrix); trunks.setColorAt(i,col);
      dummy.position.set(x,h*0.55,z);
      dummy.scale.set(h*0.32+Math.random()*1.5, h*0.74, h*0.32+Math.random()*1.5);
      dummy.updateMatrix(); foliage.setMatrixAt(i,dummy.matrix); foliage.setColorAt(i,col);
    }
    trunks.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    foliage.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    if(trunks.instanceColor) trunks.instanceColor.setUsage(THREE.StaticDrawUsage);
    if(foliage.instanceColor) foliage.instanceColor.setUsage(THREE.StaticDrawUsage);
    trunks.frustumCulled=false; foliage.frustumCulled=false;
    scene.add(trunks,foliage);
  }

  // vignette overlay
  const vig = document.createElement('div');
  vig.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:5;background:radial-gradient(ellipse at center, transparent 44%, rgba(2,3,6,.68) 100%);';
  document.body.appendChild(vig);

  G.radialTex = radialTexture();
  G.orbGlowTex = radialTexture('rgba(190,255,120,1)','rgba(190,255,120,.35)','rgba(190,255,120,0)');
  G.fireTex = radialTexture('rgba(255,200,100,1)','rgba(255,130,45,.6)','rgba(255,80,20,0)');
  // solid fire band for the dash trail BODY: bright yellow core → orange → transparent across width (U),
  // uniform along the trail length (V)
  const _fc = document.createElement('canvas'); _fc.width=256; _fc.height=128;
  const _fx = _fc.getContext('2d');
  const _hg = _fx.createLinearGradient(0,0,256,0);
  _hg.addColorStop(0,'rgba(255,80,20,0)'); _hg.addColorStop(0.22,'rgba(255,120,40,.55)');
  _hg.addColorStop(0.5,'rgba(255,190,90,1)'); _hg.addColorStop(0.78,'rgba(255,120,40,.55)');
  _hg.addColorStop(1,'rgba(255,80,20,0)');
  _fx.fillStyle = _hg; _fx.fillRect(0,0,256,128);
  G.fireBandTex = new THREE.CanvasTexture(_fc); G.fireBandTex.colorSpace = THREE.SRGBColorSpace;
  // filled (non-hollow) fire disc for the pill's end caps: solid core, soft rim
  const _dc = document.createElement('canvas'); _dc.width=_dc.height=128;
  const _dx = _dc.getContext('2d');
  const _dg = _dx.createRadialGradient(64,64,4,64,64,62);
  _dg.addColorStop(0,'rgba(255,190,90,1)'); _dg.addColorStop(0.65,'rgba(255,160,60,.95)');
  _dg.addColorStop(0.85,'rgba(255,120,40,.35)'); _dg.addColorStop(1,'rgba(255,80,20,0)');
  _dx.fillStyle = _dg; _dx.fillRect(0,0,128,128);
  G.fireDiscTex = new THREE.CanvasTexture(_dc); G.fireDiscTex.colorSpace = THREE.SRGBColorSpace;

  // particle system
  const MAXP = isCoarse()?480:900;
  const pGeo = new THREE.BufferGeometry();
  G.pPos = new Float32Array(MAXP*3);
  G.pCol = new Float32Array(MAXP*3);
  G.pLife = new Float32Array(MAXP);
  G.pV = new Float32Array(MAXP*3);
  G.pAge = new Float32Array(MAXP);
  pGeo.setAttribute('position', new THREE.BufferAttribute(G.pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(G.pCol, 3));
  const pMat = new THREE.PointsMaterial({ size:3, vertexColors:true, transparent:true, opacity:0.9, depthWrite:false });
  G.parts = new THREE.Points(pGeo, pMat);
  G.parts.frustumCulled = false;
  scene.add(G.parts);
  G.pCursor = 0;
  for(let i=0;i<MAXP;i++) G.pLife[i] = -1;

  G.clock = new THREE.Clock();

}

function floorTexture(){
  const c = document.createElement('canvas'); c.width=c.height=256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#141d2c'; ctx.fillRect(0,0,256,256);
  for(let i=0;i<340;i++){
    const x=Math.random()*256, y=Math.random()*256;
    ctx.fillStyle = 'rgba(66,84,108,'+(0.07+Math.random()*0.11)+')';
    ctx.fillRect(x,y,6+Math.random()*10, 4+Math.random()*8);
  }
  for(let i=0;i<5200;i++){
    const x=Math.random()*256, y=Math.random()*256, r=Math.random();
    ctx.fillStyle = r<0.5 ? 'rgba(66,84,108,'+(0.15+Math.random()*0.30)+')' : 'rgba(3,5,8,'+(0.2+Math.random()*0.32)+')';
    ctx.fillRect(x,y,1.8,1.8);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(12, 12);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function radialTexture(inner='rgba(255,244,200,1)', mid='rgba(255,244,200,.5)', outer='rgba(255,244,200,0)'){
  const c = document.createElement('canvas'); c.width=c.height=128;
  const ctx = c.getContext('2d');
  const gr = ctx.createRadialGradient(64,64,2,64,64,62);
  gr.addColorStop(0, inner); gr.addColorStop(0.4, mid); gr.addColorStop(1, outer);
  ctx.fillStyle = gr; ctx.fillRect(0,0,128,128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function glowSprite(tex, scale, opacity=1){
  const m = new THREE.SpriteMaterial({ map:tex, transparent:true, opacity, depthWrite:false, depthTest:false, blending:THREE.AdditiveBlending });
  const s = new THREE.Sprite(m); s.scale.set(scale, scale, 1);
  return s;
}

function stdMat(color, opts={}){
  return new THREE.MeshStandardMaterial({ color, roughness:opts.roughness??0.75, metalness:opts.metalness??0.08, emissive:opts.emissive??0x000000, emissiveIntensity:opts.emissiveIntensity??1 });
}

// ---------------- Hero ----------------
function buildHeroMesh(cid=null){
  const g = new THREE.Group();
  const heroDef=CHARACTERS.find(c=>c.id===(cid||G.char?.id));
  const sig=new THREE.Color(heroDef?.color??0xf6f2ea);
  // Bunny identity tint: just enough of the hero's colour to tell two bunnies apart at gameplay
  // scale, NOT a coat of the raw card colour. User requirement (2026-09-16: "their body color
  // much less"): this used to lerp 0.42 toward the signature, which read as a strongly dyed
  // rabbit; it is now 0.18, so the coat stays close to the cream base and the colour reads as a
  // tint rather than the bunny's whole body. The belly pastel follows it down (0.20) so the
  // belly cannot end up MORE tinted than the coat it sits on.
  const coat=new THREE.Color(0xf6f2ea).lerp(sig,0.18);
  const soft=new THREE.Color(0xffc6d0).lerp(sig,0.20);
  // Ear accent: a DEEPER version of each bunny's own colour. The belly keeps the soft pastel
  // (pale pink nudged toward the signature colour), while the ears are built from the
  // signature hue itself - same hue, higher saturation, lower lightness - so each bunny's ears
  // read as their own colour at gameplay distance instead of every bunny sharing one
  // washed-out pink. Deriving the hue from the signature (rather than from a pink mix) is what
  // keeps greens green: mixing pink into green drags the hue through olive.
  // Near-neutral signatures (BONES) take the fixed coffee accent described below instead.
  // NOTE: three's getHSL() reads the WORKING (linear) space while setHSL() writes sRGB, so both
  // calls pass THREE.SRGBColorSpace explicitly - mixing the two defaults is what makes a naive
  // HSL tweak come out unexpectedly bright.
  const earAccent=new THREE.Color(sig);
  {
    const hsl={}; earAccent.getHSL(hsl, THREE.SRGBColorSpace);
    // "Deep" means RICHER than the coat, not near-black: lightness is pulled into a band
    // (0.40-0.54) instead of scaled down, because scaling a dark signature (BLINK's navy,
    // ROOTY's brown) made the ears read as an unlit blob at arena-camera distance.
    if(hsl.s < 0.25){
      // Near-neutral signature (BONES' ivory - the bone bunny) owns no hue worth keeping, so it
      // takes a fixed accent instead of its signature hue, and this branch sets that colour
      // outright: the saturation floor in the else-branch exists to make a *signature* hue pop,
      // and letting it touch the coffee accent pushed the ear to s 0.50 (~#7e4c2a), a rust/orange
      // rather than a brown.
      // The accent is COFFEE (sRGB ≈ #714f38). The old value here was the "classic" pink bunny
      // ear, which on an ivory coat read as a RED ear (reported), and darkening it toward black
      // for contrast just read as near-black. A muted brown is the one accent that stays in the
      // same material family as bare bone while still separating from the near-white coat at
      // arena-camera distance. Do not put a pink/red hue or a near-black value back here.
      earAccent.setHSL(0.068, 0.34, 0.33, THREE.SRGBColorSpace);
    } else {
      // Ear saturation boost: user requirement (2026-09-16: "the bunny ear more saturation should
      // be a bit less") - the ears are still the RICHEST part of the bunny, but a step down from
      // the old ×1.12 / floor 0.50 / cap 0.98, which pushed the strong signatures (MAG orange, the
      // greens) to a fully-saturated ear on a cream coat. ×1.05 / floor 0.44 / cap 0.88 keeps the
      // ears clearly more saturated than the coat without the neon look.
      hsl.l = Math.min(0.54, Math.max(0.40, hsl.l*0.90));
      earAccent.setHSL(hsl.h, Math.min(0.88, Math.max(0.44, hsl.s*1.05)), hsl.l, THREE.SRGBColorSpace);
    }
  }
  const coatHex=coat.getHex(), softHex=soft.getHex(), earHex=earAccent.getHex();
  // The ears self-light at nearly the body's rate on purpose: they are already darker in hue than
  // the coat, and dropping their emissive too (0.22) darkened them a second time, which pushed the
  // dark signatures (BLINK, ROOTY) into unreadable near-black silhouettes at gameplay distance.
  const white = stdMat(coatHex, {emissive:coatHex, emissiveIntensity:0.38}), pink = stdMat(softHex, {emissive:softHex, emissiveIntensity:0.38}),
        earAccentMat = stdMat(earHex, {emissive:earHex, emissiveIntensity:0.30}),
        dark = stdMat(0x2a2a2e, {emissive:0x2a2a2e, emissiveIntensity:0.3}), gunGrey = stdMat(0x555b66, {metalness:0.5, roughness:0.4});
  const body = new THREE.Mesh(new THREE.SphereGeometry(7.2, 16, 12), white);
  body.scale.set(1, 1.18, 1.12); body.position.y = 8.5;
  g.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(5, 12, 10), pink);
  belly.scale.set(1.05, 1.0, 0.95); belly.position.set(0, 7.6, 1.6);
  g.add(belly);
  const head = new THREE.Mesh(new THREE.SphereGeometry(5.6, 14, 12), white);
  head.position.set(0, 18, 0); g.add(head);
  for(const s of [-1,1]){
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 2.4, 9, 8), earAccentMat);
    ear.position.set(2.6*s, 25, 0); ear.rotation.z = 0.25*s;
    g.add(ear);
  }
  for(const s of [-1,1]){
    const eye = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), dark);
    eye.position.set(2.3*s, 18.6, 4.4); g.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 8), new THREE.MeshStandardMaterial({color:0xe8647a}));
  nose.position.set(0, 16.8, 5.6); g.add(nose);
  // feet
  const feet = [];
  for(const s of [-1,1]){
    const f = new THREE.Mesh(new THREE.SphereGeometry(2.6, 10, 8), white);
    f.scale.set(1.2,0.7,1.5); f.position.set(3.4*s, 2, 0.8); g.add(f);
    feet.push(f);
  }
  g.userData.feet = feet;
  // gun
  const gun = new THREE.Group();
  const rec = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3, 8), gunGrey); gun.add(rec);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 7, 8), gunGrey); bar.rotation.x = Math.PI/2; bar.position.z = 7; gun.add(bar);
  const grip = new THREE.Mesh(new THREE.BoxGeometry(1.8, 4, 2), gunGrey); grip.position.set(0,-3.2,2); gun.add(grip);
  gun.position.set(4.6, 11.5, 6);
  g.add(gun);
  g.userData.gun = gun;
  // blob shadow
  const sh = new THREE.Mesh(new THREE.CircleGeometry(7, 20), new THREE.MeshBasicMaterial({ color:0x000000, transparent:true, opacity:0.35, depthWrite:false }));
  sh.rotation.x = -Math.PI/2; sh.position.y = 0.15;
  g.add(sh);
  g.userData.shadow = sh;
  sceneAdd(g);
  return g;
}

// RudBo mod — low-poly ANTHRO BIPEDAL hero meshes for the apex beasts (tiger/lion/bear/wolf/fox).
function buildBeastMesh(cid,skinId=null){
  // One shared low-poly anthro builder, but each apex species has its own silhouette.
  // Gameplay hit radius stays internal and is calibrated to the visible hero body: bigger silhouettes are easier to hit.
  const baseP = {
    raja:{ body:0xd96b22, cream:0xf4dfbf, dark:0x23170e, eye:0xffd35a, shadow:9.3, build:'power', ears:'round', tail:'tiger' },
    mane:{ body:0xc88d35, cream:0xe8c47e, dark:0x57331d, eye:0xe6b54a, shadow:9.5, build:'power', ears:'round', tail:'lion' },
    grizz:{body:0x6f4b32, cream:0xa87952, dark:0x2d1f18, eye:0xf0c55c, shadow:10.8,build:'bear',  ears:'round', tail:'bear' },
    fang:{ body:0x707a85, cream:0xb8c0c7, dark:0x252b31, eye:0xe1b64a, shadow:9.0, build:'athletic', ears:'point', tail:'wolf' },
    foxy:{ body:0xe97836, cream:0xffead7, dark:0x4a2415, eye:0xffcf61, shadow:7.9, build:'cute', ears:'point', tail:'fox' },
    val:{ body:0xf28b6f, cream:0xffede0, dark:0x5a2a24, eye:0xffdc8a, shadow:7.2, build:'cute', ears:'point', tail:'tiger' },
  }[cid] || { body:0x888888, cream:0xdddddd, dark:0x222222, eye:0xffd35a, shadow:8.5, build:'athletic', ears:'point', tail:'wolf' };
  const skin=heroSkinById(cid,skinId);
  const P={...baseP,...(skin?.palette||{})};

  const bodyMat = stdMat(P.body, {emissive:P.body, emissiveIntensity:0.34});
  const creamMat = stdMat(P.cream, {emissive:P.cream, emissiveIntensity:0.24});
  const darkMat = stdMat(P.dark, {emissive:P.dark, emissiveIntensity:0.22});
  const tigerStripeColor=(cid==='raja' || cid==='val')?(P.stripe??P.dark):P.dark;
  const tigerStripeMat=(cid==='raja' || cid==='val')?stdMat(tigerStripeColor,{emissive:tigerStripeColor,emissiveIntensity:0.18}):darkMat;
  if(cid==='raja' || cid==='val'){
    tigerStripeMat.userData.baseColor=tigerStripeColor;
    tigerStripeMat.userData.baseEmissive=tigerStripeColor;
    tigerStripeMat.userData.baseEmissiveIntensity=0.22;
  }
  const eyeMat = new THREE.MeshBasicMaterial({ color:P.eye });
  const gunGrey = stdMat(0x555b66, {metalness:0.5, roughness:0.4});
  const g = new THREE.Group();

  const addSphere=(r,mat,x,y,z,sx=1,sy=1,sz=1)=>{
    const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat);
    m.position.set(x,y,z); m.scale.set(sx,sy,sz); g.add(m); return m;
  };
  // --- torso silhouette ---
  let shoulderX=6.7, armR=1.65, legR=1.8, headY=26.5, headR=5.0, muzzleY=25.6;
  if(P.build==='bear'){
    // GRIZZ: full heavyweight bara silhouette — huge upper back, shelf-like pecs,
    // thick musclegut, oversized delts and legs. Its internal hit radius is correspondingly larger.
    addSphere(8.85,bodyMat,0,17.0,-0.25,1.49,1.46,1.05);
    addSphere(5.45,bodyMat,-5.65,21.15,1.15,1.28,0.91,1.00);
    addSphere(5.45,bodyMat, 5.65,21.15,1.15,1.28,0.91,1.00);
    addSphere(5.65,creamMat,-3.45,19.0,3.10,1.09,0.82,0.80);
    addSphere(5.65,creamMat, 3.45,19.0,3.10,1.09,0.82,0.80);
    // Chunkier bara musclegut: broad abdominal barrel plus a lower belly mass, not a flat power torso.
    addSphere(7.55,creamMat,0,14.45,2.35,1.28,1.19,1.01);
    addSphere(5.10,creamMat,0,11.15,1.65,1.22,0.88,0.94);
    addSphere(4.70,bodyMat,-7.05,16.2,-1.15,1.13,1.15,0.95);
    addSphere(4.70,bodyMat, 7.05,16.2,-1.15,1.13,1.15,0.95);
    shoulderX=10.00; armR=3.10; legR=2.94; headY=28.7; headR=6.08; muzzleY=27.25;
  } else if(P.build==='power'){
    // Power-build cat anatomy: broad V-taper, thick traps, dominant pec shelf, big arms and thighs.
    addSphere(7.95,bodyMat,0,17.25,-0.15,1.45,1.44,0.95);
    addSphere(4.95,bodyMat,-4.55,20.95,1.65,1.23,0.87,0.88);
    addSphere(4.95,bodyMat, 4.55,20.95,1.65,1.23,0.87,0.88);
    // True continuous predator underside: one fused throat/chest/belly field.
    // No detached left/right cream pec blobs, so the marking cannot read as a bra or spots.
    addSphere(3.60,creamMat,0,20.75,3.05,0.94,1.18,0.66);
    addSphere(6.10,creamMat,0,17.10,2.55,1.18,1.24,0.82);
    addSphere(6.20,creamMat,0,14.25,2.22,1.14,1.14,0.88);
    addSphere(4.20,creamMat,0,11.55,1.80,1.08,0.90,0.86);
    addSphere(4.05,bodyMat,-5.95,16.35,-1.25,1.05,1.14,0.92);
    addSphere(4.05,bodyMat, 5.95,16.35,-1.25,1.05,1.14,0.92);
    shoulderX=8.95; armR=2.68; legR=2.58; headY=28.05; headR=5.38; muzzleY=26.85;
  } else if(P.build==='athletic'){
    // broad chest, developed traps/delts, thick arms, powerful thighs and a tighter waist.
    addSphere(7.48,bodyMat,0,17.55,-0.15,1.40,1.43,0.87);
    addSphere(4.45,bodyMat,-4.10,20.90,1.65,1.20,0.84,0.84);
    addSphere(4.45,bodyMat, 4.10,20.90,1.65,1.20,0.84,0.84);
    addSphere(3.20,creamMat,0,20.55,2.95,0.92,1.16,0.64);
    addSphere(5.15,creamMat,0,17.15,2.45,1.08,1.22,0.78);
    addSphere(5.05,creamMat,0,14.55,2.15,0.98,1.08,0.80);
    addSphere(3.55,creamMat,0,12.00,1.72,0.92,0.88,0.80);
    addSphere(3.55,bodyMat,-5.45,16.35,-1.05,1.00,1.08,0.87);
    addSphere(3.55,bodyMat, 5.45,16.35,-1.05,1.00,1.08,0.87);
    shoulderX=8.50; armR=2.40; legR=2.40; headY=27.9; headR=5.02; muzzleY=26.60;
  } else {
    // FOXY: upgraded but intentionally not bara-heavy — compact athletic torso, fox chest bib,
    addSphere(6.15,bodyMat,0,15.9,-0.10,1.07,1.24,0.94);
    addSphere(3.45,bodyMat,-3.0,18.65,1.05,1.05,0.86,0.86);
    addSphere(3.45,bodyMat, 3.0,18.65,1.05,1.05,0.86,0.86);
    addSphere(4.75,creamMat,0,15.25,2.35,0.98,1.06,0.82);
    addSphere(3.10,bodyMat,-3.8,12.2,-0.9,1.06,1.12,0.96);
    addSphere(3.10,bodyMat, 3.8,12.2,-0.9,1.06,1.12,0.96);
    shoulderX=6.10; armR=1.55; legR=1.70; headY=26.0; headR=5.45; muzzleY=25.05;
  }

  // MANE gets a true 3D mane volume: forward cheek/forehead mass plus a rear ruff,
  // The head is added afterward so the face stays readable.
  if(cid==='mane'){
    const maneColor=P.mane??0x55301b;
    const maneMat=stdMat(maneColor,{emissive:maneColor,emissiveIntensity:0.24});

    // Main crown around the head.
    addSphere(7.55,maneMat,0,headY-0.25,0.55,1.14,1.19,0.82);
    addSphere(6.25,maneMat,0,headY+0.10,1.55,1.08,1.10,0.70);

    // Rear ruff gives the back-of-head real depth in profile.
    addSphere(6.70,maneMat,0,headY-0.35,-2.55,1.12,1.18,0.86);
    addSphere(5.55,maneMat,0,headY-2.10,-3.10,1.08,1.10,0.80);
    addSphere(4.40,maneMat,0,headY+2.10,-1.95,1.00,0.96,0.74);

    // Jagged outer silhouette in front/side view.
    for(let i=0;i<14;i++){
      const a=i/14*Math.PI*2;
      const tuft=new THREE.Mesh(new THREE.ConeGeometry(1.65+(i%3)*0.10,4.35+(i%2)*0.35,6),maneMat);
      const frontBias=Math.max(0,Math.cos(a))*1.55;
      const backBias=Math.max(0,-Math.cos(a))*1.25;
      tuft.position.set(Math.cos(a)*7.15,headY-0.15+Math.sin(a)*7.30,1.40+frontBias-backBias);
      tuft.rotation.z=a-Math.PI/2;
      tuft.rotation.x=0.08*Math.sin(a);
      g.add(tuft);
    }

    // Forward sideburns and muzzle-frame volume: visible beside and in front of the face.
    for(const s of [-1,1]){
      addSphere(2.75,maneMat,s*5.30,headY-1.20,3.75,1.02,1.28,0.82);
      addSphere(2.10,maneMat,s*3.65,headY+0.30,4.25,0.96,1.02,0.74);
      const cheekTuft=new THREE.Mesh(new THREE.ConeGeometry(1.65,4.6,6),maneMat);
      cheekTuft.position.set(s*5.55,headY-3.75,3.25);
      cheekTuft.rotation.z=s*0.42;
      g.add(cheekTuft);
    }

    // Lower rear neck mane stops the silhouette from collapsing flat behind the jaw.
    addSphere(4.25,maneMat,0,headY-5.10,-2.55,1.18,1.02,0.76);
    for(const s of [-1,1]) addSphere(2.75,maneMat,s*4.65,headY-4.55,-2.20,1.00,1.12,0.78);

    // Neck/chest mane extends well below the jaw for the classic adult-male-lion outline.
    addSphere(5.85,maneMat,0,headY-6.25,0.05,1.34,1.25,0.70);
    addSphere(5.05,maneMat,0,headY-10.0,-0.15,1.28,1.07,0.66);
    for(const s of [-1,1]) addSphere(3.45,maneMat,s*5.55,headY-7.65,-0.35,1.05,1.18,0.72);
  }

  // Species-specific head proportions.
  const headMat=P.head==='cream'?creamMat:bodyMat;
  const head=addSphere(headR,headMat,0,headY,cid==='mane'?2.0:0.9,
    cid==='raja'?1.10:cid==='mane'?1.07:cid==='grizz'?1.12:cid==='fang'?0.96:1.02,
    cid==='foxy'?1.03:0.95,
    cid==='fang'?0.94:1.0);

  // Upgraded head/neck structure: traps and jaw volumes read clearly from the angled arena camera.
  if(cid==='raja' || cid==='mane' || cid==='grizz' || cid==='fang'){
    const trapY=cid==='grizz'?23.25:22.85;
    const trapX=cid==='grizz'?4.7:4.15;
    const trapR=cid==='grizz'?3.25:2.85;
    for(const side of [-1,1]) addSphere(trapR,bodyMat,side*trapX,trapY,-0.35,1.15,0.78,0.88);
  }
  if(cid==='raja'){
    // Strong tiger brow and jaw planes prevent the face from reading like a round cat mascot.
    for(const side of [-1,1]){
      const brow=new THREE.Mesh(new THREE.BoxGeometry(3.25,0.85,1.55),darkMat);
      brow.position.set(side*1.85,headY+2.05,4.25); brow.rotation.z=side*0.12; g.add(brow);
      addSphere(2.05,creamMat,side*3.4,headY-2.15,3.35,1.08,0.88,0.86);
    }
  } else if(cid==='grizz'){
    // Bear brow shelf + broad lower jaw give GRIZZ a mature heavyweight head.
    for(const side of [-1,1]){
      const brow=new THREE.Mesh(new THREE.BoxGeometry(3.15,0.82,1.55),darkMat);
      brow.position.set(side*1.9,headY+1.9,4.35); brow.rotation.z=side*0.08; g.add(brow);
    }
    addSphere(3.9,bodyMat,0,headY-2.55,2.25,1.16,0.70,0.90);
  } else if(cid==='fang'){
    // Wolf ruff and jaw taper emphasize an adult canid silhouette without making the head oversized.
    for(const side of [-1,1]){
      const neckRuff=new THREE.Mesh(new THREE.ConeGeometry(2.10,5.0,7),bodyMat);
      neckRuff.position.set(side*4.45,headY-4.0,0.55); neckRuff.rotation.z=side*0.72; g.add(neckRuff);
      const brow=new THREE.Mesh(new THREE.BoxGeometry(2.75,0.70,1.35),darkMat);
      brow.position.set(side*1.65,headY+1.85,4.10); brow.rotation.z=side*0.18; g.add(brow);
    }
  } else if(cid==='foxy'){
    // White face mask and forehead blaze upgrade species readability at small screen sizes.
    for(const side of [-1,1]) addSphere(2.55,creamMat,side*2.65,headY-0.55,3.10,1.05,1.10,0.68);
    const blaze=new THREE.Mesh(new THREE.ConeGeometry(1.2,4.8,7),creamMat);
    blaze.position.set(0,headY+1.9,4.05); blaze.rotation.x=Math.PI; g.add(blaze);
  } else if(cid==='val'){
    for(const side of [-1,1]) addSphere(2.15,creamMat,side*2.35,headY-0.85,3.85,1.02,1.00,0.62);
    addSphere(1.40,bodyMat,0,headY+1.55,4.15,0.92,0.70,0.42);
  }

  // Pointed and rounded cheek-ruff variants are assigned by the active beast palette.
  // side cones made their faces read like fins/fans, so their cheek silhouette stays soft.
  if(cid==='raja' || cid==='fang'){
    const cheekMat=cid==='raja'?creamMat:bodyMat;
    for(const s of [-1,1]){
      const cheek=new THREE.Mesh(new THREE.ConeGeometry(1.8,4.2,7),cheekMat);
      cheek.position.set(s*4.25,headY-1.0,2.0);
      cheek.rotation.z=s*0.95;
      g.add(cheek);
    }
  }
  if(cid==='foxy'){
    for(const s of [-1,1]) addSphere(1.55,bodyMat,s*4.25,headY-1.45,2.65,1.05,0.82,0.70);
  } else if(cid==='val'){
    for(const s of [-1,1]) addSphere(1.30,creamMat,s*3.55,headY-1.45,3.20,1.00,0.78,0.62);
  }

  // Ears: tiger/lion/bear are rounded; wolf/fox are pointed with visible inner ear.
  for(const s of [-1,1]){
    if(P.ears==='round'){
      const er=addSphere(cid==='grizz'?2.0:1.75,bodyMat,s*(cid==='grizz'?3.7:3.5),headY+4.5,cid==='mane'?1.7:0.8,1,0.9,0.75);
      const inner=addSphere(cid==='grizz'?1.0:0.85,darkMat,s*(cid==='grizz'?3.7:3.5),headY+4.5,cid==='mane'?2.6:1.6,1,0.85,0.55);
    } else {
      const er=new THREE.Mesh(new THREE.ConeGeometry(cid==='foxy'?2.35:2.0,cid==='foxy'?6.2:5.5,7),bodyMat);
      er.position.set(s*(cid==='foxy'?3.3:3.0),headY+5.3,0.7); er.rotation.z=-s*0.18; g.add(er);
      const inner=new THREE.Mesh(new THREE.ConeGeometry(cid==='foxy'?1.35:1.1,cid==='foxy'?4.0:3.4,7),darkMat);
      inner.position.set(s*(cid==='foxy'?3.3:3.0),headY+5.0,1.35); inner.rotation.z=-s*0.18; g.add(inner);
    }
  }

  // Muzzles: broad feline/bear pads, longer wolf muzzle, small cute fox muzzle.
  if(cid==='raja' || cid==='mane' || cid==='grizz' || cid==='val'){
    const mw=cid==='grizz'?2.65:cid==='val'?1.92:2.45;
    const mx=cid==='val'?1.18:1.6;
    const mz=cid==='val'?5.35:5.1;
    addSphere(mw,creamMat,-mx,muzzleY,mz,1.05,0.72,1.0);
    addSphere(mw,creamMat, mx,muzzleY,mz,1.05,0.72,1.0);
  } else {
    addSphere(cid==='fang'?2.5:2.15,creamMat,0,muzzleY,cid==='fang'?5.7:5.3,
      cid==='fang'?0.92:1.0,0.72,cid==='fang'?1.45:1.2);
  }
  addSphere(cid==='grizz'?1.35:cid==='fang'?1.08:cid==='val'?0.88:1.0,darkMat,0,muzzleY+0.25,cid==='fang'?7.55:cid==='foxy'?6.65:cid==='val'?6.55:6.75,1.08,0.75,0.92);
  if(cid==='fang' || cid==='foxy'){
    // Dark lower lip makes the long canid muzzle read as a muzzle rather than one cream blob.
    addSphere(cid==='fang'?1.75:1.45,darkMat,0,muzzleY-1.05,cid==='fang'?6.65:5.95,1.0,0.32,0.72);
  }

  // Predator eyes are simple bright dot-eyes by default. Skins can still override
  // the dot color through palette.eye.
  const headCenterZ=cid==='mane'?2.0:0.9;
  const headScaleZ=cid==='fang'?0.94:1.0;
  const headFrontZ=headCenterZ+headR*headScaleZ;
  for(const s of [-1,1]){
    const er=cid==='foxy'?0.58:cid==='val'?0.60:cid==='grizz'?0.56:cid==='fang'?0.50:0.54;
    const eyeX=s*(cid==='foxy'?2.12:cid==='val'?2.05:cid==='grizz'?2.15:cid==='fang'?1.98:2.00);
    const eyeZ=headFrontZ-er*0.10;
    addSphere(er,eyeMat,eyeX,headY+0.82,eyeZ,
      cid==='fang'?1.08:1.0, cid==='fang'?0.90:1.0, 0.46);
  }

  // RAJA stripes are thin surface marks, not chunky floating boxes. Side marks sit on
  // the true broad-torso surface; forehead marks sit in front of the head; dorsal bars
  // sit just outside the back so they remain visible from the gameplay camera.
  if(cid==='raja'){
    const stripeColor=tigerStripeColor;
    const stripeMat=tigerStripeMat;
    const rajaStripes=[];
    const addStripe=(x,y,z,len=3.2,w=0.34,rz=0,flatten=0.42)=>{
      const m=new THREE.Mesh(new THREE.CapsuleGeometry(w,len,3,6),stripeMat);
      m.position.set(x,y,z);
      m.rotation.z=rz;
      m.scale.z=flatten;
      g.add(m);
      rajaStripes.push(m);
      return m;
    };

    for(const s of [-1,1]){
      addStripe(s*10.15,21.2,-0.15,3.5,0.38,s*0.62,0.52);
      addStripe(s*10.45,18.1,-0.75,3.3,0.36,s*0.54,0.50);
      addStripe(s*10.00,15.1,-1.45,3.0,0.34,s*0.45,0.48);
      addStripe(s*9.15,12.8,-2.10,2.6,0.32,s*0.36,0.46);

      // Rear shoulder/rump accents.
      addStripe(s*6.40,22.1,-6.25,3.1,0.34,s*0.48,0.34);
      addStripe(s*5.15,19.1,-6.80,3.2,0.34,s*0.34,0.32);
      addStripe(s*4.25,15.9,-6.85,2.9,0.32,s*0.24,0.30);

      addStripe(s*4.70,headY-0.8,5.70,2.15,0.28,s*0.78,0.38);
      addStripe(s*4.15,headY-2.15,5.88,1.65,0.25,s*0.68,0.36);
    }

    // Forehead crown: clear vertical tiger marks on the FRONT surface.
    addStripe(-1.55,headY+2.55,6.12,2.65,0.27,-0.18,0.34);
    addStripe( 0.00,headY+3.05,6.25,3.00,0.29, 0.00,0.32);
    addStripe( 1.55,headY+2.55,6.12,2.65,0.27, 0.18,0.34);

    // Broad dorsal bars across the real back surface.
    for(let i=0;i<4;i++){
      const d=addStripe(0,22.0-i*2.55,-7.20+i*0.08,4.7-i*0.35,0.35,Math.PI/2+(i%2?0.05:-0.05),0.28);
      d.scale.x=1.0;
    }

    const frenzyRingMat=new THREE.MeshBasicMaterial({color:0xff173d,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
    const frenzyRing=new THREE.Mesh(new THREE.RingGeometry(8.6,10.0,48),frenzyRingMat);
    frenzyRing.rotation.x=-Math.PI/2;
    frenzyRing.position.y=0.18;
    frenzyRing.visible=false;
    g.add(frenzyRing);

    const frenzyOuterRingMat=new THREE.MeshBasicMaterial({color:0xff6a4d,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
    const frenzyOuterRing=new THREE.Mesh(new THREE.RingGeometry(11.0,11.9,52),frenzyOuterRingMat);
    frenzyOuterRing.rotation.x=-Math.PI/2;
    frenzyOuterRing.position.y=0.20;
    frenzyOuterRing.visible=false;
    g.add(frenzyOuterRing);

    const frenzyAuraMat=new THREE.MeshBasicMaterial({color:0xff3e59,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
    const frenzyAura=new THREE.Mesh(new THREE.CircleGeometry(8.2,32),frenzyAuraMat);
    frenzyAura.rotation.x=-Math.PI/2;
    frenzyAura.position.y=1.15;
    frenzyAura.visible=false;
    g.add(frenzyAura);

    const frenzySpinMat=new THREE.MeshBasicMaterial({color:0xffa18a,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
    const frenzySpin=new THREE.Group();
    frenzySpin.position.y=0.26;
    frenzySpin.visible=false;
    for(let i=0;i<4;i++){
      const a=i*Math.PI*0.5 + Math.PI*0.18;
      const mark=new THREE.Mesh(new THREE.BoxGeometry(1.35,0.16,4.9),frenzySpinMat);
      mark.position.set(Math.sin(a)*11.2,0,Math.cos(a)*11.2);
      mark.rotation.y=a + Math.PI*0.38;
      frenzySpin.add(mark);
    }
    g.add(frenzySpin);

    g.userData.rajaStripeMat=stripeMat;
    g.userData.rajaStripes=rajaStripes;
    g.userData.rajaFrenzyRing=frenzyRing;
    g.userData.rajaFrenzyOuterRing=frenzyOuterRing;
    g.userData.rajaFrenzyAura=frenzyAura;
    g.userData.rajaFrenzySpin=frenzySpin;
  }
  if(cid==='val'){
    const addStripe=(x,y,z,len=2.3,w=0.26,rz=0,flatten=0.36)=>{
      const m=new THREE.Mesh(new THREE.CapsuleGeometry(w,len,3,6),tigerStripeMat);
      m.position.set(x,y,z);
      m.rotation.z=rz;
      m.scale.z=flatten;
      g.add(m);
      return m;
    };
    for(const s of [-1,1]){
      addStripe(s*6.9,17.9,-0.55,2.7,0.28,s*0.58,0.42);
      addStripe(s*6.8,15.2,-1.15,2.5,0.27,s*0.48,0.40);
      addStripe(s*6.2,12.9,-1.70,2.1,0.24,s*0.36,0.38);
      addStripe(s*3.7,headY-0.85,5.35,1.65,0.22,s*0.74,0.34);
      addStripe(s*3.3,headY-2.10,5.52,1.35,0.20,s*0.60,0.32);
    }
    addStripe(-1.18,headY+2.10,5.82,1.95,0.22,-0.16,0.30);
    addStripe( 0.00,headY+2.55,5.95,2.25,0.24, 0.00,0.28);
    addStripe( 1.18,headY+2.10,5.82,1.95,0.22, 0.16,0.30);
    for(let i=0;i<3;i++) addStripe(0,17.9-i*2.2,-6.8+i*0.05,3.5-i*0.25,0.30,Math.PI/2+(i%2?0.04:-0.04),0.26);
  }

  const arms=[];
  for(const s of [-1,1]){
    const arm=new THREE.Group();
    const upperLen=P.build==='bear'?5.25:P.build==='power'?5.0:P.build==='athletic'?4.85:4.45;
    const foreLen=P.build==='bear'?3.9:P.build==='power'?3.65:P.build==='athletic'?3.55:3.25;
    const upper=new THREE.Mesh(new THREE.CapsuleGeometry(armR,upperLen,6,9),bodyMat);
    upper.position.y=-3.05;
    const fore=new THREE.Mesh(new THREE.CapsuleGeometry(armR*0.84,foreLen,6,9),bodyMat);
    fore.position.y=-8.65;
    const hand=new THREE.Mesh(new THREE.SphereGeometry(armR*(P.build==='cute'?0.94:1.02),10,8),creamMat);
    hand.position.y=P.build==='cute'?-11.25:-11.85;
    arm.add(upper,fore,hand);
    if(P.build!=='cute'){
      const bicep=new THREE.Mesh(new THREE.SphereGeometry(armR*1.06,11,9),bodyMat);
      bicep.scale.set(1.08,1.18,1.04); bicep.position.set(0,-3.55,0.60); arm.add(bicep);
      const foreMass=new THREE.Mesh(new THREE.SphereGeometry(armR*0.88,10,8),bodyMat);
      foreMass.scale.set(1.0,1.28,0.98); foreMass.position.set(0,-8.55,0.42); arm.add(foreMass);
    }
    arm.position.set(shoulderX*s,P.build==='bear'?22.1:P.build==='cute'?18.9:20.9,0.85);
    arm.rotation.z=(P.build==='cute'?0.08:0.115)*s;
    g.add(arm); arms.push(arm);
  }
  g.userData.arms=arms;

  // Biped legs. Base y remains 2.5 so the existing walk animator can drive them safely.
  const feet=[];
  for(const s of [-1,1]){
    const leg=new THREE.Group();
    const thighLen=P.build==='bear'?4.85:P.build==='power'?4.55:P.build==='athletic'?4.48:4.05;
    const shinLen=P.build==='bear'?3.65:P.build==='power'?3.48:P.build==='athletic'?3.42:3.22;
    const thigh=new THREE.Mesh(new THREE.CapsuleGeometry(legR,thighLen,6,9),bodyMat); thigh.position.y=5.25;
    const shin=new THREE.Mesh(new THREE.CapsuleGeometry(legR*0.79,shinLen,6,9),bodyMat); shin.position.y=1.18;
    const foot=new THREE.Mesh(new THREE.SphereGeometry(legR*1.05,10,8),darkMat);
    foot.scale.set(P.build==='cute'?1.20:1.28,0.62,cid==='fang'?1.70:cid==='foxy'?1.58:1.50); foot.position.set(0,-1.55,1.38);
    leg.add(thigh,shin,foot);
    if(P.build!=='cute'){
      const quad=new THREE.Mesh(new THREE.SphereGeometry(legR*1.03,10,8),bodyMat);
      quad.scale.set(1.08,1.24,1.04); quad.position.set(0,5.45,0.45); leg.add(quad);
      const calf=new THREE.Mesh(new THREE.SphereGeometry(legR*0.76,10,8),bodyMat);
      calf.scale.set(0.98,1.30,1.02); calf.position.set(0,0.95,-0.18); leg.add(calf);
    }
    leg.position.set((P.build==='bear'?4.35:P.build==='power'?3.85:P.build==='athletic'?3.75:3.10)*s,2.5,0);
    g.add(leg); feet.push(leg);
  }
  g.userData.feet=feet;

  // Tail silhouettes. All mammal tails originate from the pelvis/rump, not the mid-back.
  // Their roots stay low enough to read anatomically from the arena camera while still
  // clearing the biped legs. VAL reuses the tabby/tiger tail with a slimmer scale.
  if(P.tail==='bear'){
    // GRIZZ gets a proper visible bear nub: broad, round and low on the rump.
    addSphere(3.15,bodyMat,0,12.25,-7.15,1.18,1.08,1.02);
  } else if(P.tail==='lion'){
    const tail=new THREE.Mesh(new THREE.CylinderGeometry(0.62,0.88,9.0,7),bodyMat);
    tail.rotation.x=-Math.PI/2+0.12;
    tail.position.set(0,12.55,-8.15);
    g.add(tail);
    addSphere(1.95,darkMat,0,11.95,-12.65,1.02,1.18,1.05);
  } else if(P.tail==='tiger'){
    const isVal=cid==='val';
    const tail=new THREE.Mesh(new THREE.CylinderGeometry(isVal?0.78:1.08,isVal?1.02:1.38,isVal?9.2:10.4,8),bodyMat);
    tail.rotation.x=-Math.PI/2+0.10;
    tail.position.set(0,isVal?12.0:12.55,isVal?-7.85:-8.15);
    g.add(tail);
    const bands=isVal?4:5;
    for(let i=0;i<bands;i++){
      const rr=(isVal?0.91:1.24)-i*(isVal?0.055:0.07);
      const band=new THREE.Mesh(new THREE.TorusGeometry(rr,isVal?0.24:0.31,6,10),tigerStripeMat);
      band.rotation.x=Math.PI+0.10;
      band.position.set(0,(isVal?12.0:12.55)-i*0.10,(isVal?-5.95:-5.95)-i*(isVal?1.75:1.90));
      g.add(band);
    }
  } else if(P.tail==='wolf'){
    const tailBase=new THREE.Mesh(new THREE.CylinderGeometry(0.95,1.18,5.8,7),bodyMat);
    tailBase.rotation.x=-Math.PI/2+0.20;
    tailBase.position.set(0,12.75,-7.55);
    g.add(tailBase);
    addSphere(2.05,bodyMat,0,12.25,-10.55,1.12,0.98,1.42);
    addSphere(1.78,bodyMat,0,11.70,-13.55,1.06,0.92,1.50);
    addSphere(1.10,darkMat,0,11.15,-16.55,0.96,0.84,1.10);
  } else if(P.tail==='fox'){
    const tailBase=new THREE.Mesh(new THREE.CylinderGeometry(1.18,1.42,6.0,8),bodyMat);
    tailBase.rotation.x=-Math.PI/2+0.18;
    tailBase.position.set(0,12.55,-7.65);
    g.add(tailBase);
    addSphere(2.65,bodyMat,0,12.10,-11.0,1.26,1.04,1.62);
    addSphere(2.45,bodyMat,0,11.45,-14.35,1.22,1.02,1.76);
    addSphere(1.82,creamMat,0,10.85,-17.75,1.08,0.92,1.32);
  }

  // Weapon anchor is species-specific so larger bodies do not wear the weapon through the torso.
  const gun=new THREE.Group();
  const rec=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.8,7.5),gunGrey); gun.add(rec);
  const bar=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,7,8),gunGrey); bar.rotation.x=Math.PI/2; bar.position.z=6.5; gun.add(bar);
  const grip=new THREE.Mesh(new THREE.BoxGeometry(1.7,3.6,1.9),gunGrey); grip.position.set(0,-3.2,0.5); gun.add(grip);
  const weaponPose={
    raja:{x:5.45,y:18.35,z:8.35,scale:1.08},
    mane:{x:5.55,y:18.35,z:8.35,scale:1.09},
    grizz:{x:7.25,y:19.15,z:9.05,scale:1.18},
    fang:{x:5.10,y:18.25,z:8.15,scale:1.05},
    foxy:{x:3.95,y:16.05,z:7.35,scale:0.95},
    val:{x:3.85,y:16.15,z:7.45,scale:0.93},
  }[cid] || {x:4.2,y:17.4,z:7.5,scale:1};
  gun.position.set(weaponPose.x,weaponPose.y,weaponPose.z);
  gun.scale.setScalar(weaponPose.scale);
  g.add(gun); g.userData.gun=gun; g.userData.weaponPose=weaponPose;

  const sh=new THREE.Mesh(new THREE.CircleGeometry(P.shadow,24),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.35,depthWrite:false}));
  sh.rotation.x=-Math.PI/2; sh.position.y=0.15; g.add(sh); g.userData.shadow=sh;

  sceneAdd(g);
  return g;
}

// RudBo mod — TALON uses a dedicated low-poly hawk body rather than pretending a bird is a mammal "beast".
function buildBirdMesh(skinId=null){
  const g = new THREE.Group();
  const T=heroSkinById('talon',skinId)?.palette||{};
  const brown = stdMat(T.body??0x8c633d,{emissive:T.body??0x8c633d,emissiveIntensity:0.28});
  const midBrown = stdMat(T.mid??0x6e492f,{emissive:T.mid??0x6e492f,emissiveIntensity:0.24});
  const dark = stdMat(T.dark??0x3a291e,{emissive:T.dark??0x3a291e,emissiveIntensity:0.22});
  const cream = stdMat(T.cream??0xe4d2ad,{emissive:T.cream??0xe4d2ad,emissiveIntensity:0.24});
  const gold = stdMat(T.beak??0xe9b447,{emissive:T.beak??0xe9b447,emissiveIntensity:0.28});
  const eyeMat = new THREE.MeshBasicMaterial({color:T.eye??0xffd35a});
  const pupilMat = new THREE.MeshBasicMaterial({color:0x111111});
  const gunGrey = stdMat(0x555b66,{metalness:0.5,roughness:0.4});

  // More anatomical hawk torso: compact ribcage, tapered waist, layered breast feathers.
  const body=new THREE.Mesh(new THREE.SphereGeometry(6.35,16,12),brown);
  body.scale.set(0.96,1.38,0.94); body.position.y=13.25; g.add(body);
  const upperChest=new THREE.Mesh(new THREE.SphereGeometry(5.0,14,11),cream);
  upperChest.scale.set(0.90,0.88,0.56); upperChest.position.set(0,16.0,4.10); g.add(upperChest);
  const lowerChest=new THREE.Mesh(new THREE.SphereGeometry(4.35,14,11),cream);
  lowerChest.scale.set(0.82,1.08,0.50); lowerChest.position.set(0,11.9,4.05); g.add(lowerChest);
  for(let i=0;i<3;i++){
    const bib=new THREE.Mesh(new THREE.ConeGeometry(2.6-i*0.28,3.9,7),cream);
    bib.position.set(0,15.6-i*2.35,5.05); bib.rotation.x=Math.PI; g.add(bib);
  }

  for(const side of [-1,1]){
    const mantle=new THREE.Mesh(new THREE.SphereGeometry(3.65,12,10),midBrown);
    mantle.scale.set(1.18,0.86,0.82); mantle.position.set(side*4.55,17.6,-0.25); g.add(mantle);
  }

  const head=new THREE.Mesh(new THREE.SphereGeometry(5.0,16,12),brown);
  head.scale.set(1.02,0.94,1.04); head.position.set(0,23.2,0.55); g.add(head);
  // Small swept crown/occipital feathers upgrade the head silhouette while staying hawk-like.
  for(const side of [-1,0,1]){
    const crest=new THREE.Mesh(new THREE.ConeGeometry(0.95,3.6,6),midBrown);
    crest.position.set(side*1.55,26.35,-1.55-Math.abs(side)*0.25);
    crest.rotation.x=-0.42; crest.rotation.z=-side*0.12; g.add(crest);
  }

  // Heavy brow, bright eyes and a two-part hooked beak make TALON read as a raptor at gameplay size.
  for(const side of [-1,1]){
    const brow=new THREE.Mesh(new THREE.BoxGeometry(3.35,0.82,1.5),dark);
    brow.position.set(side*1.85,24.95,4.05); brow.rotation.z=side*0.16; g.add(brow);
    const eye=new THREE.Mesh(new THREE.SphereGeometry(0.92,9,7),eyeMat);
    eye.scale.set(1.05,0.82,0.62); eye.position.set(side*1.78,23.9,4.70); g.add(eye);
    const pupil=new THREE.Mesh(new THREE.SphereGeometry(0.40,8,6),pupilMat);
    pupil.scale.set(0.82,1.0,0.55); pupil.position.set(side*1.78,23.9,5.38); g.add(pupil);
  }
  const cere=new THREE.Mesh(new THREE.SphereGeometry(1.65,10,8),gold);
  cere.scale.set(1.05,0.52,0.82); cere.position.set(0,22.65,5.65); g.add(cere);
  const beakTop=new THREE.Mesh(new THREE.ConeGeometry(2.05,6.4,8),gold);
  beakTop.rotation.x=Math.PI/2; beakTop.position.set(0,21.95,7.05); g.add(beakTop);
  const hook=new THREE.Mesh(new THREE.ConeGeometry(1.18,3.45,8),gold);
  hook.rotation.x=-Math.PI/2.50; hook.position.set(0,20.75,9.55); g.add(hook);

  // carries a shoulder plate, overlapping coverts and six primaries for a much fuller wing model.
  const wings=[];
  for(const side of [-1,1]){
    const wing=new THREE.Group();
    wing.position.set(side*5.0,17.75,-0.75);

    const shoulder=new THREE.Mesh(new THREE.SphereGeometry(3.0,12,9),brown);
    shoulder.scale.set(1.26,0.70,0.82); shoulder.position.set(side*1.8,0.1,0.0); wing.add(shoulder);

    for(let i=0;i<3;i++){
      const covert=new THREE.Mesh(new THREE.CapsuleGeometry(1.34-i*0.08,5.2+i*0.75,5,8),i===0?brown:midBrown);
      covert.rotation.z=Math.PI/2;
      covert.position.set(side*(3.7+i*2.55),-0.45-i*0.58,0.30-i*0.18);
      covert.scale.set(0.82,1,1.08); wing.add(covert);
    }
    for(let i=0;i<6;i++){
      const feather=new THREE.Mesh(new THREE.CapsuleGeometry(1.22-i*0.055,7.0+i*0.95,5,8),i<2?midBrown:dark);
      feather.rotation.z=Math.PI/2;
      feather.position.set(side*(6.2+i*2.65),-1.6-i*0.70,-0.15-i*0.34);
      feather.scale.set(0.70,1,1); wing.add(feather);
    }

    // Ground default remains folded DOWN; animation code drives only these root groups.
    wing.rotation.z=side<0 ? 1.34 : -1.34;
    g.add(wing); wings.push(wing);
  }
  g.userData.wings=wings;

  // Lean but powerful raptor legs with separated ankle, front talons and a rear killing talon.
  const feet=[];
  for(const side of [-1,1]){
    const leg=new THREE.Group();
    const thigh=new THREE.Mesh(new THREE.SphereGeometry(1.72,10,8),brown);
    thigh.scale.set(1.0,1.35,1.0); thigh.position.y=7.05; leg.add(thigh);
    const shin=new THREE.Mesh(new THREE.CylinderGeometry(0.78,0.98,6.4,8),gold); shin.position.y=3.5; leg.add(shin);
    const ankle=new THREE.Mesh(new THREE.SphereGeometry(1.0,8,6),gold); ankle.scale.set(1.0,0.72,1.0); ankle.position.y=0.45; leg.add(ankle);
    const foot=new THREE.Mesh(new THREE.SphereGeometry(1.55,9,7),gold); foot.scale.set(1.18,0.52,1.58); foot.position.set(0,-0.05,1.25); leg.add(foot);
    for(let t=-1;t<=1;t++){
      const toe=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.38,2.15,6),gold);
      toe.rotation.x=Math.PI/2; toe.rotation.z=t*0.16; toe.position.set(t*0.82,-0.18,2.45); leg.add(toe);
      const claw=new THREE.Mesh(new THREE.ConeGeometry(0.35,2.35,7),dark);
      claw.rotation.x=Math.PI/2; claw.position.set(t*0.94,-0.24,3.75); leg.add(claw);
    }
    const rearClaw=new THREE.Mesh(new THREE.ConeGeometry(0.42,2.65,7),dark);
    rearClaw.rotation.x=-Math.PI/2; rearClaw.position.set(0,0.0,-0.95); leg.add(rearClaw);
    leg.position.set(side*2.9,1.75,0); g.add(leg); feet.push(leg);
  }
  g.userData.feet=feet;

  for(let i=-2;i<=2;i++){
    const tf=new THREE.Mesh(new THREE.CapsuleGeometry(0.92-Math.abs(i)*0.06,5.6-Math.abs(i)*0.25,5,8),i===0?midBrown:dark);
    tf.rotation.x=Math.PI/2; tf.rotation.z=-i*0.055;
    tf.position.set(i*1.25,12.6,-7.15-Math.abs(i)*0.35); g.add(tf);
  }

  const gun=new THREE.Group();
  const rec=new THREE.Mesh(new THREE.BoxGeometry(2.3,2.7,7.2),gunGrey); gun.add(rec);
  const bar=new THREE.Mesh(new THREE.CylinderGeometry(1.0,1.0,6.8,8),gunGrey); bar.rotation.x=Math.PI/2; bar.position.z=6.3; gun.add(bar);
  const grip=new THREE.Mesh(new THREE.BoxGeometry(1.6,3.4,1.8),gunGrey); grip.position.set(0,-3.0,0.5); gun.add(grip);
  gun.position.set(4.15,16.55,7.55); gun.scale.setScalar(0.97); g.add(gun); g.userData.gun=gun;

  const sh=new THREE.Mesh(new THREE.CircleGeometry(8.4,24),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.35,depthWrite:false}));
  sh.rotation.x=-Math.PI/2; sh.position.y=0.15; g.add(sh); g.userData.shadow=sh;

  // Flight readability: keep the immune state marked on the ground only.
  // No floating gold ball around TALON; use projected gold rings instead.
  const flightRingMat=new THREE.MeshBasicMaterial({color:T.flight??T.eye??0xffd35a,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
  const flightRing=new THREE.Mesh(new THREE.RingGeometry(10.5,13.0,40),flightRingMat);
  flightRing.rotation.x=-Math.PI/2; flightRing.position.y=0.18; flightRing.visible=false; g.add(flightRing); g.userData.flightRing=flightRing;
  const flightRing2Mat=new THREE.MeshBasicMaterial({color:T.cream??0xfff0a0,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
  const flightRing2=new THREE.Mesh(new THREE.RingGeometry(15.0,15.8,40),flightRing2Mat);
  flightRing2.rotation.x=-Math.PI/2; flightRing2.position.y=0.19; flightRing2.visible=false; g.add(flightRing2); g.userData.flightRing2=flightRing2;
  const flightRing3Mat=new THREE.MeshBasicMaterial({color:T.cream??0xfff0a0,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
  const flightRing3=new THREE.Mesh(new THREE.RingGeometry(6.3,7.3,32),flightRing3Mat);
  flightRing3.rotation.x=-Math.PI/2; flightRing3.position.y=0.21; flightRing3.visible=false; g.add(flightRing3); g.userData.flightRing3=flightRing3;
  const flightCoreMat=new THREE.MeshBasicMaterial({color:T.cream??0xfff0a0,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
  const flightCore=new THREE.Mesh(new THREE.CircleGeometry(2.2,24),flightCoreMat);
  flightCore.rotation.x=-Math.PI/2; flightCore.position.y=0.22; flightCore.visible=false; g.add(flightCore); g.userData.flightCore=flightCore;
  sceneAdd(g);
  return g;
}

function configureHeroHeldWeapon(hm, weapon){
  const anchor=hm?.userData?.gun;
  if(!anchor) return;

  const clearAnchor=()=>{
    const oldGeo=new Set(), oldMat=new Set();
    for(const child of [...anchor.children]){
      child.traverse(o=>{
        if(o.geometry) oldGeo.add(o.geometry);
        if(o.material){
          if(Array.isArray(o.material)) for(const m of o.material) oldMat.add(m);
          else oldMat.add(o.material);
        }
      });
      anchor.remove(child);
    }
    for(const geo of oldGeo) geo.dispose?.();
    for(const mat of oldMat) mat.dispose?.();
  };

  // AEGIS is a real front-facing shield fan, not a gun recolor. Build the three
  // physical panels once; projectile perks only toggle/reposition these cached meshes.
  if(weapon.id==='aegis'){
    clearAnchor();
    anchor.position.x *= 0.30;
    anchor.position.z += 1.2;
    const rim=stdMat(0x334b62,{metalness:0.72,roughness:0.25,emissive:0x142839,emissiveIntensity:0.18});
    const face=stdMat(0x74d9ff,{metalness:0.48,roughness:0.22,emissive:0x2b8ab8,emissiveIntensity:0.34});
    const core=new THREE.MeshBasicMaterial({color:0xe9fbff});
    const makePanel=()=>{
      const panel=new THREE.Group();
      const disc=new THREE.Mesh(new THREE.CylinderGeometry(4.9,4.9,0.95,12),face);
      disc.rotation.x=Math.PI/2; disc.position.z=7.8; panel.add(disc);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(4.6,0.34,8,24),rim);
      ring.position.z=8.3; panel.add(ring);
      const boss=new THREE.Mesh(new THREE.CylinderGeometry(1.35,1.7,1.25,10),core);
      boss.rotation.x=Math.PI/2; boss.position.z=8.7; panel.add(boss);
      for(const side of [-1,1]){
        const brace=new THREE.Mesh(new THREE.BoxGeometry(0.55,5.8,0.45),rim);
        brace.position.set(side*2.35,0,8.6); brace.rotation.z=side*0.48; panel.add(brace);
      }
      anchor.add(panel);
      return panel;
    };
    anchor.userData.aegisPanels=[makePanel(),makePanel(),makePanel()];

    // Persistent ground fan shows the exact directional protection used by aegisTryBlock().
    // It is attached to the hero once and reused; geometry only changes when projectile
    // perks increase the physical shield count/guard angle.
    const guardGroup=new THREE.Group();
    const guardFillMat=new THREE.MeshBasicMaterial({color:0x74d9ff,transparent:true,opacity:0.11,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
    const guardEdgeMat=new THREE.MeshBasicMaterial({color:0xe9fbff,transparent:true,opacity:0.58,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
    const guardFill=new THREE.Mesh(new THREE.RingGeometry(7,24,64,1,-Math.PI*0.95,Math.PI*0.9),guardFillMat);
    const guardEdge=new THREE.Mesh(new THREE.RingGeometry(22.6,24.2,64,1,-Math.PI*0.95,Math.PI*0.9),guardEdgeMat);
    guardFill.rotation.x=-Math.PI/2; guardEdge.rotation.x=-Math.PI/2;
    guardFill.position.y=0.02; guardEdge.position.y=0.04;
    guardGroup.add(guardFill,guardEdge);
    const makeBoundary=()=>{
      const root=new THREE.Group();
      const line=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.18,17),guardEdgeMat.clone());
      line.position.set(0,0.06,15.5); root.add(line); guardGroup.add(root); return {root,line};
    };
    const guardLeft=makeBoundary(), guardRight=makeBoundary();
    hm.add(guardGroup);
    hm.userData.aegisGuard={group:guardGroup,fill:guardFill,edge:guardEdge,left:guardLeft,right:guardRight,arcDeg:null};
    syncAegisVisuals();
    return;
  }

  // ROCKET LAUNCHER gets its own chunky siege tube instead of the generic gun prop.
  if(weapon.id==='rocket'){
    clearAnchor();
    const dark=stdMat(0x282d33,{metalness:0.72,roughness:0.28});
    const bodyMat=stdMat(0x8a6a3f,{metalness:0.52,roughness:0.34,emissive:0x2a1b0d,emissiveIntensity:0.16});
    const hot=stdMat(0xd7923f,{metalness:0.42,roughness:0.30,emissive:0x6a3210,emissiveIntensity:0.22});
    const tube=new THREE.Mesh(new THREE.CylinderGeometry(1.55,1.75,12.8,12),bodyMat);
    tube.rotation.x=Math.PI/2; tube.position.z=6.2; anchor.add(tube);
    const muzzle=new THREE.Mesh(new THREE.TorusGeometry(1.85,0.38,8,18),dark);
    muzzle.position.z=12.7; anchor.add(muzzle);
    const rear=new THREE.Mesh(new THREE.TorusGeometry(1.72,0.30,8,18),hot);
    rear.position.z=-0.3; anchor.add(rear);
    const sight=new THREE.Mesh(new THREE.BoxGeometry(0.65,1.15,4.2),dark);
    sight.position.set(0,2.0,5.0); anchor.add(sight);
    const grip=new THREE.Mesh(new THREE.BoxGeometry(1.0,3.6,1.2),dark);
    grip.position.set(0,-2.0,3.0); grip.rotation.x=-0.20; anchor.add(grip);
    return;
  }

  // INFERNO has a thick fuel body and long heat-shielded nozzle.
  if(weapon.id==='inferno'){
    clearAnchor();
    const dark=stdMat(0x292b30,{metalness:0.62,roughness:0.30});
    const hot=stdMat(0xff6a2a,{metalness:0.30,roughness:0.38,emissive:0xff4018,emissiveIntensity:0.26});
    const tank=stdMat(0xb63d20,{metalness:0.42,roughness:0.36});
    const glow=new THREE.MeshBasicMaterial({color:0xffd06a});
    const body=new THREE.Mesh(new THREE.BoxGeometry(3.1,3.2,7.0),dark); body.position.z=3.0; anchor.add(body);
    const can=new THREE.Mesh(new THREE.CylinderGeometry(1.8,1.8,5.5,10),tank); can.position.set(-2.3,0,2.0); anchor.add(can);
    const nozzle=new THREE.Mesh(new THREE.CylinderGeometry(0.72,1.05,10.5,10),hot); nozzle.rotation.x=Math.PI/2; nozzle.position.z=11.2; anchor.add(nozzle);
    const shroud=new THREE.Mesh(new THREE.CylinderGeometry(1.35,1.15,3.2,10),dark); shroud.rotation.x=Math.PI/2; shroud.position.z=16.9; anchor.add(shroud);
    const pilot=new THREE.Mesh(new THREE.SphereGeometry(0.72,8,6),glow); pilot.position.z=18.6; anchor.add(pilot);
    return;
  }

  if(weapon.id==='vulpine'){
    clearAnchor();
    const orange=stdMat(0xff7a3d,{metalness:0.48,roughness:0.28,emissive:0x7d2a10,emissiveIntensity:0.20});
    const dark=stdMat(0x252933,{metalness:0.72,roughness:0.24});
    const silver=stdMat(0xcbd2dc,{metalness:0.86,roughness:0.18});
    const glow=new THREE.MeshBasicMaterial({color:0xffd07a});

    const stock=new THREE.Mesh(new THREE.BoxGeometry(2.8,2.6,5.2),dark);
    stock.position.set(0,-0.2,-1.0); anchor.add(stock);

    const receiver=new THREE.Mesh(new THREE.BoxGeometry(2.5,2.4,7.0),orange);
    receiver.position.z=4.4; anchor.add(receiver);

    const barrel=new THREE.Mesh(new THREE.CylinderGeometry(0.62,0.82,10.5,10),silver);
    barrel.rotation.x=Math.PI/2; barrel.position.z=12.5; anchor.add(barrel);

    const muzzle=new THREE.Mesh(new THREE.CylinderGeometry(1.0,0.78,2.0,10),dark);
    muzzle.rotation.x=Math.PI/2; muzzle.position.z=18.2; anchor.add(muzzle);

    const scopeBody=new THREE.Mesh(new THREE.CylinderGeometry(0.62,0.62,5.3,10),dark);
    scopeBody.rotation.x=Math.PI/2; scopeBody.position.set(0,2.1,5.0); anchor.add(scopeBody);
    const scopeLens=new THREE.Mesh(new THREE.CircleGeometry(0.48,12),glow);
    scopeLens.position.set(0,2.1,7.7); anchor.add(scopeLens);

    const finL=new THREE.Mesh(new THREE.BoxGeometry(0.35,1.3,4.8),orange);
    finL.position.set(-1.55,0.5,8.0); finL.rotation.z=-0.22; anchor.add(finL);
    const finR=finL.clone(); finR.position.x=1.55; finR.rotation.z=0.22; anchor.add(finR);
    return;
  }

  if(!weapon.special.includes('melee')){
    const heldMat=new THREE.MeshStandardMaterial({color:weapon.color,roughness:0.4,metalness:0.55});
    anchor.traverse(o=>{ if(o.isMesh) o.material=heldMat; });
    return;
  }

  // Gravity Maul replaces the gun-shaped prop completely but reuses the established
  // hero weapon anchor, so every hero still points the held weapon where they aim.
  clearAnchor();
  const shaftMat=stdMat(0x4f465e,{metalness:0.55,roughness:0.34,emissive:0x241c35,emissiveIntensity:0.18});
  const headMat=stdMat(weapon.color,{metalness:0.65,roughness:0.28,emissive:weapon.color,emissiveIntensity:0.20});
  const coreMat=new THREE.MeshBasicMaterial({color:0xefe6ff});

  const shaft=new THREE.Mesh(new THREE.CylinderGeometry(0.65,0.82,12,8),shaftMat);
  shaft.rotation.x=Math.PI/2;
  shaft.position.z=4.6;
  anchor.add(shaft);

  const head=new THREE.Mesh(new THREE.BoxGeometry(7.4,3.8,3.8),headMat);
  head.position.z=10.0;
  anchor.add(head);

  const core=new THREE.Mesh(new THREE.SphereGeometry(1.35,10,8),coreMat);
  core.position.z=12.0;
  anchor.add(core);

  const band=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.26,7,18),coreMat);
  band.rotation.y=Math.PI/2;
  band.position.z=10.0;
  anchor.add(band);
}

// ---------------- Enemy meshes ----------------
function buildEnemyMesh(type){
  const g = new THREE.Group();
  const c = ENEMIES[type];
  const mat = stdMat(c.color, { emissive: c.color, emissiveIntensity: c.boss?0.32:0.14 });
  const dk = stdMat(Math.max(0, (c.color>>16)*0.5), {}); // darker accent (approx)
  dk.color.multiplyScalar(0.55);

  const eyeMat = new THREE.MeshBasicMaterial({ color: c.boss?0xff3030 : 0xffd0d0 });

  if(type==='goblingreen' || type==='goblinred' || type==='goblinblue'){
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 9), mat); body.scale.set(1.1,1.15,1.05); body.position.y=0.9; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.62, 8, 7), mat); head.position.y=2.1; g.add(head);
    for(const s of [-1,1]){
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.13,6,6), eyeMat); e.position.set(0.32*s,2.2,0.5); g.add(e);
      const er = new THREE.Mesh(new THREE.ConeGeometry(0.26,0.9,5), mat); er.position.set(0.3*s,2.85,0); g.add(er);
    }
    g.scale.setScalar(c.r);
  }
  else if(type==='egger'){
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 9), mat); body.scale.set(0.85,1.25,0.85); body.position.y=1.1; g.add(body);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.18,0.4,5), stdMat(0xffa94d)); beak.rotation.x=Math.PI/2; beak.position.set(0,1.0,0.9); g.add(beak);
    for(const s of [-1,1]){ const e=new THREE.Mesh(new THREE.SphereGeometry(0.12,6,6), eyeMat); e.position.set(0.3*s,1.6,0.7); g.add(e); }
    g.scale.setScalar(c.r);
  }
  else if(type==='shooter'){
    const body = new THREE.Mesh(new THREE.ConeGeometry(1,1.9,7), mat); body.position.y=1.1; g.add(body);
    const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.75,0.75,0.28,7), new THREE.MeshBasicMaterial({color:0x0a0c10})); visor.position.y=1.5; visor.position.z=0.25; g.add(visor);
    for(const s of [-1,1]){ const e=new THREE.Mesh(new THREE.SphereGeometry(0.15,6,6), eyeMat); e.position.set(0.28*s,1.5,0.62); g.add(e); }
    g.scale.setScalar(c.r);
  }
  else if(type==='steelcrab'){
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9,0.9,1.5), stdMat(c.color,{metalness:0.6,roughness:0.35,emissive:c.color,emissiveIntensity:0.15})); body.position.y=0.8; g.add(body);
    for(const s of [-1,1]) for(const z of [-1,1]){
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18,0.18,0.9), stdMat(0x5c626c,{metalness:0.5})); leg.position.set(1.05*s,0.45,0.7*z); leg.rotation.z=0.45*s; g.add(leg);
    }
    for(const s of [-1,1]){ const claw=new THREE.Mesh(new THREE.SphereGeometry(0.34,7,7), stdMat(0x8a2f2f,{metalness:0.5,emissive:0x3a0f0f,emissiveIntensity:0.6})); claw.position.set(0.95*s,0.8,0); g.add(claw); }
    for(const s of [-1,1]){ const e=new THREE.Mesh(new THREE.SphereGeometry(0.15,6,6), eyeMat); e.position.set(0.32*s,1.25,0.7); g.add(e); }
    g.scale.setScalar(c.r/1.15);
  }
  else if(type==='troll'){
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 9), mat); body.scale.set(1.25,1.1,1); body.position.y=1.0; g.add(body);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.6,8,7), stdMat(0x9ab96f)); belly.position.set(0,0.75,0.8); g.add(belly);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.6,8,7), mat); head.position.y=2.05; g.add(head);
    for(const s of [-1,1]){ const h=new THREE.Mesh(new THREE.ConeGeometry(0.2,0.8,5), mat); h.position.set(0.24*s,2.7,0); g.add(h); const e=new THREE.Mesh(new THREE.SphereGeometry(0.14,6,6), eyeMat); e.position.set(0.28*s,2.1,0.5); g.add(e); }
    g.scale.setScalar(c.r/1.2);
  }
  else if(type==='laserdude'){
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.8,1,2.2,7), mat); body.position.y=1.3; g.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.9,0.7,0.8), stdMat(0x16181f)); head.position.y=2.6; g.add(head);
    const visorMat = new THREE.MeshBasicMaterial({color:0xff4f9a});
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.62,0.20,0.10), visorMat); visor.position.set(0,2.6,0.42); g.add(visor);
    for(const s of [-1,1]){ const arm=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.9,0.22), mat); arm.position.set(0.95*s,1.4,0); g.add(arm); }
    // Elite identity: a tall pink locator and halo make the sentinel readable inside mob piles.
    const beaconMat=new THREE.MeshBasicMaterial({color:0xff4f9a,transparent:true,opacity:0.40,depthWrite:false});
    const beacon=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.045,3.6,6),beaconMat); beacon.position.y=4.8; g.add(beacon);
    const halo=new THREE.Mesh(new THREE.TorusGeometry(1.18,0.075,7,28),new THREE.MeshBasicMaterial({color:0xff75b5,transparent:true,opacity:0.82,depthWrite:false}));
    halo.rotation.x=Math.PI/2; halo.position.y=0.14; g.add(halo);
    g.userData.laserHalo=halo; g.userData.laserBeacon=beacon; g.userData.laserVisor=visor;
    g.scale.setScalar(c.r);
  }
  else if(type==='pigsassin'){
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 9), mat); body.scale.set(1.15,1.05,1); body.position.y=1.0; g.add(body);
    const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.34,0.5,8), stdMat(0xe87fa3)); snout.rotation.x=Math.PI/2; snout.position.set(0,0.9,0.95); g.add(snout);
    for(const s of [-1,1]){ const ear=new THREE.Mesh(new THREE.ConeGeometry(0.3,0.7,5), mat); ear.position.set(0.55*s,1.8,0.1); g.add(ear); const e=new THREE.Mesh(new THREE.SphereGeometry(0.13,6,6), eyeMat); e.position.set(0.3*s,1.4,0.8); g.add(e); }
    const knife = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.12,1.1), stdMat(0xc8ccd4,{metalness:0.8,roughness:0.2})); knife.position.set(0.7,0.7,0.6); g.add(knife);
    g.scale.setScalar(c.r);
  }
  else if(type==='briarwarden'){
    const bark=stdMat(0x32281f,{roughness:0.88,metalness:0.02,emissive:0x120b06,emissiveIntensity:0.18});
    const thorn=stdMat(0xe0c58e,{roughness:0.62,emissive:0x5a2107,emissiveIntensity:0.34});
    const hot=new THREE.MeshBasicMaterial({color:0xff6a24});
    const body=new THREE.Mesh(new THREE.CylinderGeometry(0.72,1.02,2.4,8),bark); body.position.y=1.35; g.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.62,9,8),bark); head.position.y=2.78; g.add(head);
    const core=new THREE.Mesh(new THREE.SphereGeometry(0.27,8,7),hot); core.position.set(0,1.45,0.78); g.add(core);
    for(const sx of [-1,1]){
      const arm=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.22,1.75,7),bark); arm.position.set(0.92*sx,1.45,0); arm.rotation.z=0.42*sx; g.add(arm);
      const lash=new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.08,2.35,6),thorn); lash.position.set(1.42*sx,0.98,0.18); lash.rotation.z=0.72*sx; g.add(lash);
    }
    for(let i=0;i<7;i++){
      const a=(i/7-0.5)*Math.PI*1.45;
      const spike=new THREE.Mesh(new THREE.ConeGeometry(0.16,0.95,6),thorn);
      spike.position.set(Math.sin(a)*0.62,3.48+Math.cos(a)*0.16,-0.05);
      spike.rotation.z=-Math.sin(a)*0.72; g.add(spike);
    }
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.08,0.09,7,30),new THREE.MeshBasicMaterial({color:0xff6a24,transparent:true,opacity:0.80,depthWrite:false}));
    ring.rotation.x=Math.PI/2; ring.position.y=0.12; g.add(ring); g.userData.briarRing=ring; g.userData.briarCore=core;
    g.scale.setScalar(c.r/1.45);
  }
  else if(type==='thornwall'){
    const bark=stdMat(0x5b432a,{roughness:0.94,emissive:0x160b04,emissiveIntensity:0.16});
    const thorn=stdMat(0xe3c994,{roughness:0.62,emissive:0x612006,emissiveIntensity:0.30});
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.52,2.8,7),bark); trunk.position.y=1.35; g.add(trunk);
    for(const y of [0.55,1.15,1.75,2.35]) for(const sx of [-1,1]){
      const sp=new THREE.Mesh(new THREE.ConeGeometry(0.14,0.88,6),thorn); sp.position.set(0.47*sx,y,0); sp.rotation.z=-sx*Math.PI/2; g.add(sp);
    }
    const crown=new THREE.Mesh(new THREE.ConeGeometry(0.26,1.05,6),thorn); crown.position.y=3.15; g.add(crown);
    g.scale.setScalar(c.r/1.10);
  }
  else if(type==='absorber'){
    // ABSORBER: broad armored collector with an unmistakable forward vortex mouth.
    const shell=stdMat(0x352843,{roughness:0.48,metalness:0.22,emissive:0x140b20,emissiveIntensity:0.32});
    const rim=stdMat(0x76608d,{roughness:0.35,metalness:0.45,emissive:0x25113b,emissiveIntensity:0.32});
    const voidMat=new THREE.MeshBasicMaterial({color:0x12081b});
    const coreMat=new THREE.MeshBasicMaterial({color:0xb86fff});
    const body=new THREE.Mesh(new THREE.CylinderGeometry(0.92,1.08,1.72,9),shell); body.position.y=1.02; g.add(body);
    const top=new THREE.Mesh(new THREE.SphereGeometry(0.74,10,8),shell); top.scale.set(1.15,0.78,1.0); top.position.y=1.90; g.add(top);
    const mouth=new THREE.Mesh(new THREE.TorusGeometry(0.58,0.18,8,24),rim); mouth.rotation.x=Math.PI/2; mouth.position.set(0,1.10,0.92); g.add(mouth);
    const voidDisk=new THREE.Mesh(new THREE.CircleGeometry(0.48,20),voidMat); voidDisk.position.set(0,1.10,1.02); g.add(voidDisk);
    const core=new THREE.Mesh(new THREE.SphereGeometry(0.22,8,7),coreMat); core.position.set(0,1.10,1.08); g.add(core);
    for(const sx of [-1,1]){
      const intake=new THREE.Mesh(new THREE.ConeGeometry(0.20,0.92,6),rim); intake.position.set(0.88*sx,1.35,0.28); intake.rotation.z=-sx*0.72; g.add(intake);
      const foot=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.32,0.82),shell); foot.position.set(0.62*sx,0.18,0.12); g.add(foot);
    }
    const orbit1=new THREE.Mesh(new THREE.TorusGeometry(1.04,0.06,7,26),coreMat); orbit1.rotation.x=Math.PI/2; orbit1.position.y=1.0; g.add(orbit1);
    const orbit2=new THREE.Mesh(new THREE.TorusGeometry(0.84,0.05,7,24),coreMat); orbit2.rotation.z=Math.PI/2; orbit2.position.y=1.0; g.add(orbit2);
    g.userData.absorberCore=core; g.userData.absorberOrbit=[orbit1,orbit2];
    g.scale.setScalar(c.r/1.25);
  }
  else if(type==='shielder'){
    // to their protected enemy with an exact shield/HP readout.
    const bubble = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.05,1),
      new THREE.MeshBasicMaterial({color:0x6fa8ff,transparent:true,opacity:0.20,wireframe:true,depthWrite:false})
    );
    bubble.position.y=0.15; g.add(bubble);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.13, 8, 24), new THREE.MeshBasicMaterial({color:0x78c8ff,transparent:true,opacity:0.88}));
    ring.rotation.x = Math.PI/2.2; g.add(ring);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.34,0), new THREE.MeshBasicMaterial({color:0xd8f3ff})); core.position.y=0.15; g.add(core);
    g.scale.setScalar(c.r/1.4);
  }
  else if(type==='dummy'){
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.4,2.4,7), mat); post.position.y=1.2; g.add(post);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,1.6,6), mat); arm.rotation.z=Math.PI/2; arm.position.set(0,2.0,0); g.add(arm);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.5,8,7), stdMat(0xc9a86a)); head.position.y=2.6; g.add(head);
    for(const s of [-1,1]){ const e=new THREE.Mesh(new THREE.SphereGeometry(0.08,5,5), new THREE.MeshBasicMaterial({color:0x000})); e.position.set(0.18*s,2.7,0.42); g.add(e); }
    g.scale.setScalar(c.r/1.4);
  }
  else if(type==='box3'){
    // orange "bomb" orb — deliberately distinct from the green XP pickups
    const orb = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), stdMat(0xff9540, {emissive:0xff7a00, emissiveIntensity:1.05, roughness:0.4}));
    orb.position.y = 1; g.add(orb);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), new THREE.MeshBasicMaterial({color:0xffd9a0}));
    core.position.y = 1; g.add(core);
    const glow = glowSprite(G.radialTex, 3.2, 0.5);
    glow.material.color.set(0xff8a2a);
    glow.position.y = 1; g.add(glow);
    g.scale.setScalar(c.r/1.1);
  }
  else if(type==='bahamut'){
    // Secret OP final boss: a buff anthro dragon, only slightly larger than the apex heroes.
    // Built at world-ish dimensions rather than scaling a 1-unit blob by collision radius.
    const hideMat=stdMat(0x34254f,{roughness:0.48,metalness:0.10,emissive:0x120a24,emissiveIntensity:0.35});
    const chestMat=stdMat(0x6e518d,{roughness:0.42,metalness:0.08});
    const scaleMat=stdMat(0x8f78b8,{roughness:0.36,metalness:0.16});
    const hornMat=stdMat(0x17131f,{roughness:0.30,metalness:0.28});
    const goldMat=stdMat(0xd8a94f,{roughness:0.28,metalness:0.72,emissive:0x49310a,emissiveIntensity:0.25});
    const magicMat=new THREE.MeshBasicMaterial({color:0xb86cff,transparent:true,opacity:0.92});
    const add=(geo,mat,x,y,z,rx=0,ry=0,rz=0)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.rotation.set(rx,ry,rz); g.add(m); return m; };
    const muscleParts=[];
    const pecParts=[];
    const wingParts=[];
    const gaitParts=[];
    // Dragon body foundation: thick legs, narrow waist, broad chest/delts and arms.
    const torso=add(new THREE.CylinderGeometry(5.8,6.8,13,10),hideMat,0,11,0); muscleParts.push(torso);
    const belly=add(new THREE.SphereGeometry(6.2,12,10),hideMat,0,10,1.1); belly.scale.set(1.08,1.05,0.92); muscleParts.push(belly);
    for(const sx of [-1,1]){
      const pec=add(new THREE.SphereGeometry(4.7,10,9),chestMat,sx*3.7,17.2,2.2); pec.scale.set(1.15,0.78,0.82); muscleParts.push(pec); pecParts.push(pec);
      const delt=add(new THREE.SphereGeometry(3.7,10,9),hideMat,sx*8.0,17.0,0.4); delt.scale.set(1.08,1,1); muscleParts.push(delt);
      const upper=add(new THREE.CylinderGeometry(2.6,3.0,8.5,9),hideMat,sx*9.1,12.8,0.3,0,0,sx*0.08); muscleParts.push(upper);
      const fore=add(new THREE.CylinderGeometry(2.2,2.55,7.4,9),hideMat,sx*9.2,6.2,1.1,0,0,-sx*0.05); muscleParts.push(fore);
      const thigh=add(new THREE.CylinderGeometry(3.3,3.9,10.5,9),hideMat,sx*3.6,2.7,0.1,0,0,-sx*0.03); muscleParts.push(thigh);
      const shin=add(new THREE.CylinderGeometry(2.5,3.0,8.0,9),hideMat,sx*3.7,-5.8,0.8,0,0,sx*0.04); muscleParts.push(shin);
      const foot=add(new THREE.BoxGeometry(5.2,2.4,7.0),hornMat,sx*3.8,-10.0,2.2);
      gaitParts.push(
        {mesh:upper,side:sx,kind:'arm',amp:0.72},
        {mesh:fore,side:sx,kind:'arm',amp:0.58},
        {mesh:thigh,side:sx,kind:'leg',amp:1.00},
        {mesh:shin,side:sx,kind:'leg',amp:0.88},
        {mesh:foot,side:sx,kind:'foot',amp:1.00}
      );
    }
    // Dragon head + muzzle + horns.
    const neck=add(new THREE.CylinderGeometry(3.8,4.7,7.5,9),hideMat,0,22.1,-0.4);
    const head=add(new THREE.SphereGeometry(5.0,12,10),hideMat,0,27.8,0.8); head.scale.set(1.02,1.0,0.92);
    const muzzle=add(new THREE.BoxGeometry(6.3,3.2,6.7),scaleMat,0,25.7,5.2);
    const hornRefs=[];
    const eyeRefs=[];
    for(const sx of [-1,1]){
      const horn=add(new THREE.ConeGeometry(1.45,7.4,7),hornMat,sx*3.1,32.7,-0.5,0,0,-sx*0.32); hornRefs.push(horn);
      const eye=add(new THREE.SphereGeometry(0.72,7,6),new THREE.MeshBasicMaterial({color:0xffd166}),sx*1.75,28.8,5.05); eyeRefs.push(eye);
    }
    // Folded wings: visible but compact so he is larger than GRIZZ, not kaiju-sized.
    for(const sx of [-1,1]){
      const wing=add(new THREE.ConeGeometry(5.3,16.5,3),scaleMat,sx*7.2,19.2,-4.0,Math.PI/2,0,sx*0.55);
      wing.scale.z=0.45;
      wingParts.push(wing);
    }
    // Heavy tail.
    const tail=add(new THREE.ConeGeometry(3.2,20,8),hideMat,0,7.4,-11.2,Math.PI/2,0,0);
    // Right-hand dragon glaive, left-hand magic focus.
    const shaft=add(new THREE.CylinderGeometry(0.55,0.55,20,8),goldMat,10.4,8.1,2.0,0,0,-0.16);
    const blade=add(new THREE.ConeGeometry(2.4,7.8,4),goldMat,11.8,18.2,2.0,0,0,-0.16);
    const orb=add(new THREE.SphereGeometry(1.7,10,8),magicMat,-10.1,7.2,2.4);
    const orbit=new THREE.Mesh(new THREE.TorusGeometry(2.8,0.22,7,20),magicMat); orbit.rotation.x=Math.PI/2; orbit.position.copy(orb.position); g.add(orbit);
    g.userData.bahamutOrb=orb; g.userData.bahamutOrbit=orbit; g.userData.bahamutGlaive=shaft; g.userData.bahamutGlaiveParts=[shaft,blade];
    g.userData.bahamutMuscleParts=muscleParts;
    g.userData.bahamutPecs=pecParts;
    g.userData.bahamutWings=wingParts;
    g.userData.bahamutGaitParts=gaitParts;
    g.userData.bahamutHead=head;
    g.userData.bahamutNeck=neck;
    g.userData.bahamutMuzzle=muzzle;
    g.userData.bahamutHorns=hornRefs;
    g.userData.bahamutEyes=eyeRefs;
    g.userData.bahamutTail=tail;
    g.scale.setScalar(1.08);
  }
  else if(type==='boss1'){
    // CRUSHER: squat armored brute. Small shoulder/back spikes sell charge/slam danger;
    const armor=stdMat(0x59141e,{metalness:0.34,roughness:0.46,emissive:0x22070b,emissiveIntensity:0.30});
    const plate=stdMat(0xa8323e,{metalness:0.50,roughness:0.34,emissive:0x3a0b10,emissiveIntensity:0.24});
    const iron=stdMat(0x24262b,{metalness:0.70,roughness:0.30});
    const hot=new THREE.MeshBasicMaterial({color:0xff6b62});
    const body=new THREE.Mesh(new THREE.BoxGeometry(1.62,1.55,1.28),armor); body.position.y=1.12; g.add(body);
    const chest=new THREE.Mesh(new THREE.BoxGeometry(1.82,0.58,1.42),plate); chest.position.set(0,1.58,0.05); g.add(chest);
    const head=new THREE.Mesh(new THREE.BoxGeometry(0.92,0.72,0.86),iron); head.position.set(0,2.36,0.08); g.add(head);
    const visor=new THREE.Mesh(new THREE.BoxGeometry(0.62,0.16,0.10),hot); visor.position.set(0,2.40,0.53); g.add(visor);
    for(const sx of [-1,1]){
      const shoulder=new THREE.Mesh(new THREE.SphereGeometry(0.46,8,7),plate); shoulder.scale.set(1.35,0.90,1.0); shoulder.position.set(1.02*sx,1.64,0); g.add(shoulder);
      const spike=new THREE.Mesh(new THREE.ConeGeometry(0.18,0.62,6),iron); spike.position.set(1.20*sx,2.05,-0.05); spike.rotation.z=-sx*0.72; g.add(spike);
      const arm=new THREE.Mesh(new THREE.BoxGeometry(0.42,1.18,0.48),armor); arm.position.set(1.13*sx,0.88,0.16); g.add(arm);
      const port=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.19,0.48,8),iron); port.rotation.x=Math.PI/2; port.position.set(1.13*sx,0.82,0.62); g.add(port);
    }
    for(const sx of [-1,1]){
      const backSpike=new THREE.Mesh(new THREE.ConeGeometry(0.13,0.52,6),iron); backSpike.position.set(0.44*sx,1.82,-0.72); backSpike.rotation.x=-0.62; g.add(backSpike);
    }
    g.scale.setScalar(c.r/1.18);
    g.userData.crusherVisor=visor;
  }
  else if(type==='boss2'){
    // HEXLORD: tall caster silhouette with robe, floating crown and magic hands.
    const robe=stdMat(0x51207d,{roughness:0.72,emissive:0x1a082b,emissiveIntensity:0.38});
    const trim=stdMat(0x9f5fe2,{metalness:0.24,roughness:0.42,emissive:0x3a145d,emissiveIntensity:0.44});
    const dark=stdMat(0x17101f,{roughness:0.60});
    const magic=new THREE.MeshBasicMaterial({color:0xcf65ff,transparent:true,opacity:0.92});
    const robeBody=new THREE.Mesh(new THREE.ConeGeometry(0.92,2.65,8),robe); robeBody.position.y=1.18; g.add(robeBody);
    const shoulders=new THREE.Mesh(new THREE.BoxGeometry(2.15,0.34,0.72),trim); shoulders.position.y=2.08; g.add(shoulders);
    const hood=new THREE.Mesh(new THREE.ConeGeometry(0.68,1.15,7),dark); hood.position.y=2.72; hood.rotation.x=Math.PI; g.add(hood);
    const face=new THREE.Mesh(new THREE.SphereGeometry(0.38,8,7),dark); face.position.set(0,2.48,0.24); g.add(face);
    for(const sx of [-1,1]){
      const eye=new THREE.Mesh(new THREE.SphereGeometry(0.095,6,5),magic); eye.position.set(0.16*sx,2.52,0.58); g.add(eye);
      const hand=new THREE.Mesh(new THREE.SphereGeometry(0.25,8,7),magic); hand.position.set(1.18*sx,1.55,0.22); g.add(hand);
      const crown=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.62,5),trim); crown.position.set(0.46*sx,3.35,0); crown.rotation.z=-sx*0.24; g.add(crown);
    }
    const crownTop=new THREE.Mesh(new THREE.ConeGeometry(0.14,0.72,5),trim); crownTop.position.set(0,3.50,-0.02); g.add(crownTop);
    const orbit=new THREE.Mesh(new THREE.TorusGeometry(1.12,0.06,7,28),magic); orbit.rotation.x=Math.PI/2; orbit.position.y=1.18; g.add(orbit);
    g.scale.setScalar(c.r/1.42);
    g.userData.hexOrbit=orbit;
  }
  else if(type==='boss3'){
    // WRAITH: narrow hovering specter. Angry slanted eyes are intentional: unlike normal
    // dot eyes, they instantly communicate hostile caster and remain visible at the top edge.
    const shroud=stdMat(0x1c1025,{roughness:0.82,emissive:0x120719,emissiveIntensity:0.48});
    const edge=stdMat(0x58306b,{roughness:0.55,emissive:0x2d103d,emissiveIntensity:0.50});
    const evil=new THREE.MeshBasicMaterial({color:0xff5fd0});
    const torso=new THREE.Mesh(new THREE.ConeGeometry(0.72,2.85,7),shroud); torso.position.y=1.35; g.add(torso);
    const hood=new THREE.Mesh(new THREE.ConeGeometry(0.76,1.25,7),shroud); hood.position.y=2.75; hood.rotation.x=Math.PI; g.add(hood);
    for(const sx of [-1,1]){
      const eye=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.10,0.09),evil); eye.position.set(0.22*sx,2.55,0.59); eye.rotation.z=-sx*0.30; g.add(eye);
      const wisp=new THREE.Mesh(new THREE.ConeGeometry(0.18,1.65,6),edge); wisp.position.set(0.78*sx,1.20,-0.10); wisp.rotation.z=sx*0.52; g.add(wisp);
      const horn=new THREE.Mesh(new THREE.ConeGeometry(0.16,0.82,5),edge); horn.position.set(0.42*sx,3.28,0); horn.rotation.z=-sx*0.42; g.add(horn);
    }
    const tailL=new THREE.Mesh(new THREE.ConeGeometry(0.20,1.45,6),edge); tailL.position.set(-0.28,-0.20,0); tailL.rotation.z=-0.15; g.add(tailL);
    const tailR=tailL.clone(); tailR.position.x=0.28; tailR.rotation.z=0.15; g.add(tailR);
    const gl=new THREE.Mesh(new THREE.TorusGeometry(0.76,0.08,6,24),new THREE.MeshBasicMaterial({color:0xff6bd6,transparent:true,opacity:0.88,depthWrite:false})); gl.rotation.x=Math.PI/2; gl.position.y=1.05; g.add(gl);
    g.scale.setScalar(c.r/1.12);
    g.userData.wraithGlow=gl;
  }
  else {
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 9), mat); body.position.y=1; g.add(body);
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.16,6,6), eyeMat); e.position.set(0.3,1.5,0.8); g.add(e);
    g.scale.setScalar(c.r);
  }

  // blob shadow
  const sh = new THREE.Mesh(new THREE.CircleGeometry(0.9, 16), new THREE.MeshBasicMaterial({ color:0x000000, transparent:true, opacity:0.32, depthWrite:false }));
  sh.rotation.x = -Math.PI/2; sh.position.y = 0.14;
  g.add(sh);
  g.userData.shadow=sh;
  if(type==='bahamut') sh.scale.setScalar(12);

  // red border ring so enemies read as "hostile" vs summons. Shield entities use
  // their blue bubble/core alone so they do not look like a second unrelated enemy underneath.
  if(type!=='shielder'){
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.98, 1.20, 28), new THREE.MeshBasicMaterial({ color:0xff2020, transparent:true, opacity:0.8, depthWrite:false, side:THREE.DoubleSide }));
    ring.rotation.x = -Math.PI/2;
    ring.position.y = 0.08;
    g.add(ring);
    g.userData.borderRing = ring;
  }
  if(c.boss){
    const bossRing = new THREE.Mesh(
      new THREE.RingGeometry(1.30, 1.52, 40),
      new THREE.MeshBasicMaterial({ color:0xffd166, transparent:true, opacity:0.82, depthWrite:false, side:THREE.DoubleSide })
    );
    bossRing.rotation.x = -Math.PI/2;
    bossRing.position.y = 0.10;
    g.add(bossRing);
    g.userData.bossRing = bossRing;
    if(type==='bahamut'){ bossRing.scale.setScalar(18); if(g.userData.borderRing) g.userData.borderRing.scale.setScalar(17); }
  }

  // remember base colors for status tinting (poison→green, burn→orange)
  g.traverse(o=>{ if(o.isMesh && o.material && o.material.isMeshStandardMaterial && o.material.color){ o.userData.baseColor = o.material.color.clone(); } });

  sceneAdd(g);
  return g;
}

function removeBahamutMeshPart(g,part){
  if(!g || !part) return;
  g.remove(part);
  part.geometry?.dispose?.();
}

function removeBahamutMeshParts(g,parts){
  for(const part of (parts||[])) removeBahamutMeshPart(g,part);
}

function captureBahamutGaitBase(g){
  for(const p of (g?.userData?.bahamutGaitParts||[])){
    if(!p?.mesh || p.base) continue;
    p.base={
      x:p.mesh.position.x,y:p.mesh.position.y,z:p.mesh.position.z,
      rx:p.mesh.rotation.x,ry:p.mesh.rotation.y,rz:p.mesh.rotation.z,
    };
  }
  const tails=g?.userData?.bahamutTailParts||[];
  for(const t of tails){
    if(!t?.mesh || t.base) continue;
    t.base={x:t.mesh.position.x,y:t.mesh.position.y,z:t.mesh.position.z,rx:t.mesh.rotation.x,ry:t.mesh.rotation.y,rz:t.mesh.rotation.z};
  }
  const wings=g?.userData?.bahamutWingGaitParts||[];
  for(const w of wings){
    if(!w?.mesh || w.base) continue;
    w.base={x:w.mesh.position.x,y:w.mesh.position.y,z:w.mesh.position.z,rx:w.mesh.rotation.x,ry:w.mesh.rotation.y,rz:w.mesh.rotation.z};
  }
}

function animateBahamutGait(g,moving,dt,speedMul=1){
  if(!g?.userData) return;
  captureBahamutGaitBase(g);
  const parts=g.userData.bahamutGaitParts||[];
  if(!parts.length) return;
  const blend=1-Math.exp(-dt*(moving?18:9));
  if(moving) g.userData.bahamutGaitPhase=(g.userData.bahamutGaitPhase||0)+dt*8.6*speedMul;
  const phase=g.userData.bahamutGaitPhase||0;
  for(const p of parts){
    if(!p?.mesh || !p.base) continue;
    const side=p.side||1, amp=p.amp||1;
    const legWave=Math.sin(phase)*side;
    let z=p.base.z, y=p.base.y, rx=p.base.rx, rz=p.base.rz;
    if(moving){
      if(p.kind==='leg'){
        z += legWave*5.15*amp;
        y += Math.max(0,-legWave)*1.55*amp;
        rx += legWave*0.58*amp;
      }else if(p.kind==='foot'){
        z += legWave*6.60*amp;
        y += Math.max(0,-legWave)*2.85*amp;
        rx += legWave*0.44*amp;
      }else if(p.kind==='arm'){
        const armWave=-legWave;
        z += armWave*4.55*amp;
        y += Math.max(0,-armWave)*0.55*amp;
        rx += armWave*0.50*amp;
        rz += armWave*0.085;
      }
    }
    p.mesh.position.z += (z-p.mesh.position.z)*blend;
    p.mesh.position.y += (y-p.mesh.position.y)*blend;
    p.mesh.rotation.x += (rx-p.mesh.rotation.x)*blend;
    p.mesh.rotation.z += (rz-p.mesh.rotation.z)*blend;
  }
  for(const tail of (g.userData.bahamutTailParts||[])){
    if(!tail?.mesh || !tail.base) continue;
    const sway=moving ? Math.sin(phase*0.72+(tail.index||0)*0.55)*0.21*(tail.amp||1) : 0;
    const ry=tail.base.ry+sway;
    tail.mesh.rotation.y += (ry-tail.mesh.rotation.y)*blend;
  }
  // Walking wings visibly counter-balance the heavy stride, but still read as wings rather than jets.
  for(const w of (g.userData.bahamutWingGaitParts||[])){
    if(!w?.mesh || !w.base) continue;
    const side=w.side||1, amp=w.amp||1;
    const flap=moving ? Math.sin(phase*0.92+0.45)*amp : 0;
    const lift=moving ? (0.5+0.5*Math.sin(phase*1.84))*amp : 0;
    const y=w.base.y+lift*0.72;
    const rx=w.base.rx-flap*0.085;
    const rz=w.base.rz-side*flap*0.135;
    w.mesh.position.y += (y-w.mesh.position.y)*blend;
    w.mesh.rotation.x += (rx-w.mesh.rotation.x)*blend;
    w.mesh.rotation.z += (rz-w.mesh.rotation.z)*blend;
  }
}


function buildPlayableBahamutMesh(skinId=null){
  const D=heroSkinById('bahamut',skinId)?.palette||{};
  // Playable BAHAMUT: a large anthro fantasy dragon. He should feel much more
  // massive than GRIZZ, with a readable V-taper, proper reptilian muzzle and broad
  // membrane wings rather than cone stubs.
  const g=buildEnemyMesh('bahamut');
  for(const key of ['borderRing','bossRing']){
    const ring=g.userData[key];
    if(ring){ g.remove(ring); ring.geometry?.dispose?.(); ring.material?.dispose?.(); delete g.userData[key]; }
  }

  // eyes, muzzle, horns, wings, tail and boss props are removed from the scene graph
  // completely; there is no invisible second dragon living inside the playable mesh.
  g.scale.multiplyScalar(1.56);
  removeBahamutMeshParts(g,g.userData.bahamutWings);
  removeBahamutMeshParts(g,g.userData.bahamutHorns);
  removeBahamutMeshParts(g,g.userData.bahamutEyes);
  removeBahamutMeshParts(g,g.userData.bahamutGlaiveParts);
  removeBahamutMeshPart(g,g.userData.bahamutHead);
  removeBahamutMeshPart(g,g.userData.bahamutMuzzle);
  removeBahamutMeshPart(g,g.userData.bahamutTail);
  removeBahamutMeshPart(g,g.userData.bahamutOrb);
  removeBahamutMeshPart(g,g.userData.bahamutOrbit);
  delete g.userData.bahamutWings;
  delete g.userData.bahamutHorns;
  delete g.userData.bahamutEyes;
  delete g.userData.bahamutGlaiveParts;
  delete g.userData.bahamutGlaive;
  delete g.userData.bahamutHead;
  delete g.userData.bahamutMuzzle;
  delete g.userData.bahamutTail;
  delete g.userData.bahamutOrb;
  delete g.userData.bahamutOrbit;
  for(const pec of (g.userData.bahamutPecs||[])) pec.scale.set(1.24,0.56,0.70);
  for(const part of (g.userData.bahamutMuscleParts||[])){
    part.scale.x*=1.14;
    part.scale.y*=1.03;
    part.scale.z*=1.10;
  }

  const bodyMat=stdMat(D.body??0x2d2435,{roughness:0.52,metalness:0.06,emissive:D.body??0x100d15,emissiveIntensity:0.16});
  const dorsalMat=stdMat(D.dorsal??0x17131d,{roughness:0.48,metalness:0.10,emissive:D.dorsal??0x08060c,emissiveIntensity:0.12});
  const ventralMat=stdMat(D.ventral??0xc6b6cf,{roughness:0.36,metalness:0.04,emissive:D.ventral??0x261b2d,emissiveIntensity:0.07});
  const accentMat=stdMat(D.accent??0x8d69bb,{roughness:0.34,metalness:0.16,emissive:D.accent??0x40215f,emissiveIntensity:0.20});
  const membraneMat=stdMat(D.membrane??0x4a3758,{roughness:0.50,metalness:0.02,side:THREE.DoubleSide});
  const hornMat=stdMat(D.horn??0xe1d4c4,{roughness:0.24,metalness:0.06});
  const clawMat=stdMat(D.claw??0x120f15,{roughness:0.22,metalness:0.18});
  const add=(geo,mat,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>{
    const m=new THREE.Mesh(geo,mat);
    m.position.set(x,y,z);
    m.rotation.set(rx,ry,rz);
    m.scale.set(sx,sy,sz);
    g.add(m);
    return m;
  };
  const addCaps=(r,len,mat,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>{
    const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,len,5,8),mat);
    m.position.set(x,y,z);
    m.rotation.set(rx,ry,rz);
    m.scale.set(sx,sy,sz);
    g.add(m);
    return m;
  };

  // Chest and torso: rounded anatomy. The pecs are broad horizontal masses,
  // not boxes and not two inflated spheres stuck on the chest.
  addCaps(1.55,3.8,ventralMat,-3.55,20.0,4.5,0,0,Math.PI/2-0.10,1.0,1.0,1.30);
  addCaps(1.55,3.8,ventralMat, 3.55,20.0,4.5,0,0,Math.PI/2+0.10,1.0,1.0,1.30);
  add(new THREE.SphereGeometry(2.4,12,10),ventralMat,0,17.5,4.0,0,0,0,0.90,1.20,0.82);
  add(new THREE.SphereGeometry(4.0,12,10),bodyMat,-7.2,18.1,-0.2,0,0,-0.14,1.36,1.02,1.02);
  add(new THREE.SphereGeometry(4.0,12,10),bodyMat, 7.2,18.1,-0.2,0,0, 0.14,1.36,1.02,1.02);
  add(new THREE.SphereGeometry(2.8,12,10),dorsalMat,0,23.8,-2.7,0,0,0,1.18,1.18,1.0);
  add(new THREE.SphereGeometry(3.0,12,10),bodyMat,0,13.0,1.0,0,0,0,0.88,1.38,0.82);
  add(new THREE.SphereGeometry(2.25,12,10),ventralMat,0,10.2,4.0,0,0,0,0.82,1.24,0.72);

  const gaitParts=g.userData.bahamutGaitParts||(g.userData.bahamutGaitParts=[]);
  for(const sx of [-1,1]){
    const upperBulk=add(new THREE.SphereGeometry(2.9,10,8),bodyMat,sx*10.5,14.0,1.3,0,0,sx*0.16,1.10,1.22,1.08);
    const foreBulk=add(new THREE.SphereGeometry(2.45,10,8),bodyMat,sx*10.1,6.9,1.9,0,0,-sx*0.12,1.06,1.18,1.02);
    const thighBulk=add(new THREE.SphereGeometry(3.25,10,8),bodyMat,sx*4.2,3.8,1.0,0,0,-sx*0.04,1.16,1.30,1.10);
    const shinBulk=add(new THREE.SphereGeometry(2.40,10,8),bodyMat,sx*4.2,-4.0,1.4,0,0,sx*0.04,1.06,1.22,1.02);
    const footBulk=add(new THREE.BoxGeometry(5.8,2.9,7.4),clawMat,sx*4.2,-10.4,2.5);
    gaitParts.push(
      {mesh:upperBulk,side:sx,kind:'arm',amp:0.70},
      {mesh:foreBulk,side:sx,kind:'arm',amp:0.55},
      {mesh:thighBulk,side:sx,kind:'leg',amp:0.96},
      {mesh:shinBulk,side:sx,kind:'leg',amp:0.84},
      {mesh:footBulk,side:sx,kind:'foot',amp:0.96}
    );
  }

  // Neck frill / chest ruff.
  addCaps(1.25,2.8,accentMat,-5.5,18.7,3.4,0,0,-0.54,1.0,1.18,0.84);
  addCaps(1.25,2.8,accentMat, 5.5,18.7,3.4,0,0, 0.54,1.0,1.18,0.84);
  addCaps(1.05,2.2,accentMat,-3.9,15.4,4.1,0,0,-0.24,0.94,1.14,0.80);
  addCaps(1.05,2.2,accentMat, 3.9,15.4,4.1,0,0, 0.24,0.94,1.14,0.80);

  // Head rebuild: flatter cranium, longer reptilian snout, softer cheek transition.
  // This avoids the big-brain / hair-bang silhouette.
  add(new THREE.SphereGeometry(4.5,12,10),bodyMat,0,28.0,-0.2,0,0,0,1.12,0.84,1.02);
  add(new THREE.SphereGeometry(2.0,10,8),dorsalMat,0,30.6,-0.9,0,0,0,1.28,0.38,0.94);
  const upperMuzzle=add(new THREE.CylinderGeometry(1.85,2.95,7.9,8),ventralMat,0,26.1,6.6,Math.PI/2,0,0,1.08,0.64,1.0);
  const lowerJaw=add(new THREE.CylinderGeometry(1.32,2.18,6.0,8),clawMat,0,24.3,6.2,Math.PI/2,0,0,1.04,0.46,1.0);
  add(new THREE.SphereGeometry(0.34,8,6),dorsalMat,-1.05,27.0,10.1,0,0,0,1.05,0.42,0.62);
  add(new THREE.SphereGeometry(0.34,8,6),dorsalMat, 1.05,27.0,10.1,0,0,0,1.05,0.42,0.62);
  add(new THREE.SphereGeometry(1.15,10,8),dorsalMat,-2.05,28.7,4.1,0,0,-0.10,1.12,0.46,0.76);
  add(new THREE.SphereGeometry(1.15,10,8),dorsalMat, 2.05,28.7,4.1,0,0, 0.10,1.12,0.46,0.76);
  add(new THREE.SphereGeometry(1.9,10,8),bodyMat,-2.65,22.6,3.1,0,0,-0.10,0.98,1.10,0.82);
  add(new THREE.SphereGeometry(1.9,10,8),bodyMat, 2.65,22.6,3.1,0,0, 0.10,0.98,1.10,0.82);

  // Proper swept-back dragon horns. Narrow bases sit behind the brow and point backward,
  // so they read as horns rather than upright animal ears.
  for(const sx of [-1,1]){
    add(new THREE.ConeGeometry(0.82,6.8,8),hornMat,sx*3.55,31.0,-1.5,-0.78,0,sx*0.22,1.0,1.0,1.0);
    add(new THREE.ConeGeometry(0.56,4.7,7),accentMat,sx*2.15,30.2,-2.6,-0.92,0,sx*0.14,1.0,1.0,1.0);
  }

  // Segmented dragon tail: thick at the pelvis, smoothly tapering away. It also gets
  // a restrained counter-sway during locomotion so the gait reads from the top-down view.
  const tailParts=[
    add(new THREE.CylinderGeometry(2.75,2.05,8.5,9),bodyMat,0,8.2,-10.6,Math.PI/2,0,0,1,1,1),
    add(new THREE.CylinderGeometry(2.05,1.25,8.0,9),bodyMat,0,6.8,-18.2,Math.PI/2,0,0,1,1,1),
    add(new THREE.CylinderGeometry(1.25,0.48,7.0,8),dorsalMat,0,5.5,-25.0,Math.PI/2,0,0,1,1,1),
    add(new THREE.ConeGeometry(0.82,3.6,7),accentMat,0,5.2,-29.8,Math.PI/2,0,0,1,1,1),
  ];
  g.userData.bahamutTailParts=tailParts.map((mesh,index)=>({mesh,index,amp:0.72+index*0.13}));

  // piece is registered for the shared gait so walking produces a subtle organic flap.
  const wingGaitParts=g.userData.bahamutWingGaitParts||(g.userData.bahamutWingGaitParts=[]);
  for(const sx of [-1,1]){
    const shoulder=add(new THREE.SphereGeometry(1.7,10,8),bodyMat,sx*7.5,21.8,-4.8,0,0,0,1.0,1.0,1.0);
    const bone1=addCaps(0.9,8.6,bodyMat,sx*10.2,22.0,-9.4,0,0,sx*0.82,1.0,1.0,1.0);
    const bone2=addCaps(0.72,8.0,bodyMat,sx*14.0,21.2,-15.0,0,0,sx*1.00,1.0,1.0,1.0);
    const finger1=addCaps(0.48,9.8,accentMat,sx*15.0,21.2,-18.0,0,0,sx*1.06,1.0,1.0,1.0);
    const finger2=addCaps(0.42,9.3,accentMat,sx*13.3,18.4,-17.2,0,0,sx*0.90,1.0,1.0,1.0);
    const finger3=addCaps(0.36,8.2,accentMat,sx*11.6,15.4,-15.5,0,0,sx*0.74,1.0,1.0,1.0);
    const membrane1=add(new THREE.PlaneGeometry(10.5,14.5),membraneMat,sx*11.9,19.0,-13.2,0,sx>0?-0.18:0.18,sx*0.62,1,1,1);
    const membrane2=add(new THREE.PlaneGeometry(8.5,10.8),membraneMat,sx*10.4,16.4,-11.1,0,sx>0?-0.12:0.12,sx*0.42,1,1,1);
    membrane1.userData.isWingMembrane=true; membrane2.userData.isWingMembrane=true;
    for(const [mesh,amp] of [[shoulder,0.20],[bone1,0.50],[bone2,0.72],[finger1,0.92],[finger2,0.82],[finger3,0.70],[membrane1,0.88],[membrane2,0.70]]){
      wingGaitParts.push({mesh,side:sx,amp});
    }
  }

  // Dorsal spines for a cleaner fantasy silhouette.
  for(const [x,y,z,s] of [[0,26.0,-5.2,1.00],[0,21.8,-6.6,0.94],[0,17.3,-7.1,0.88],[0,13.5,-6.8,0.82]]){
    add(new THREE.ConeGeometry(1.00*s,3.6*s,7),accentMat,x,y,z,-0.24,0,0);
  }

  const gun=new THREE.Group();
  gun.position.set(10.4,11.2,5.7);
  gun.scale.setScalar(1.00);
  g.add(gun);
  g.userData.gun=gun;
  if(g.userData.shadow){
    g.userData.shadow.material.opacity=0.22;
    g.userData.shadow.scale.set(15.5,9.0,1);
  }
  captureBahamutGaitBase(g);
  return g;
}


function decorateEnemyBahamutMesh(g){
  if(!g || g.userData.enemyBahamutDecorated) return g;
  g.userData.enemyBahamutDecorated=true;
  // gold boss ring was enormous, visually ambiguous, and looked like a permanent attack radius.
  const hostile=new THREE.Mesh(
    new THREE.RingGeometry(11.7,12.5,44),
    new THREE.MeshBasicMaterial({color:0xff2020,transparent:true,opacity:0.76,depthWrite:false,side:THREE.DoubleSide})
  );
  hostile.rotation.x=-Math.PI/2; hostile.position.y=0.08; g.add(hostile); g.userData.borderRing=hostile;
  g.traverse(o=>{ if(o.isMesh && o.material?.isMeshStandardMaterial && o.material.color && !o.userData.baseColor) o.userData.baseColor=o.material.color.clone(); });
  return g;
}

// ---------------- Spawning ----------------
function spawnEnemy(type, wx, wz, opts={}){
  const c = ENEMIES[type];
  // decoration, not alternate anatomy, so future gait/wing/model fixes cannot diverge.
  const mesh = type==='bahamut' ? decorateEnemyBahamutMesh(buildPlayableBahamutMesh('arcane')) : buildEnemyMesh(type);
  mesh.position.set(wx, 0, wz);
  const hpMult = (G.diff==='Insane') ? insanePressure().hpMult : (DIFFS[G.diff] ? DIFFS[G.diff].hpMult : 1);
  // Do not turn disposable mobs into HP sponges just because the player is OP.
  // On Insane, only genuinely heavy enemies get the large HP multiplier; basic fodder
  // keeps its normal kill-time so Bahamut and other OP builds still feel powerful.
  const heavyEnemy=!!(c.boss || c.elite || c.brain || c.kind==='shield' || c.r>=18);
  const traditionalBoss=(type==='boss1'||type==='boss2'||type==='boss3');
  // BOSS_SPAWNS already carries final difficulty-specific HP for the three traditional
  // making late Hard/Insane bosses much spongier than their own schedule advertised.
  const difficultyHp = (traditionalBoss && opts.hp!=null) ? 1 : ((G.diff==='Insane' && !heavyEnemy) ? 1 : hpMult);
  // Premium-loadout HP pressure is also reserved for meaningful targets. Difficulty for
  // fodder comes from speed, damage, attack cadence and battlefield pressure instead.
  const apexPressureHp = heavyEnemy ? (G.dragonChaos ? DRAGON_CHAOS_PRESSURE.heavies : (G.opStackChallenge ? OP_STACK_PRESSURE.heavies : 1)) : 1;
  const hp = Math.round((opts.hp != null ? opts.hp : c.hp) * difficultyHp * apexPressureHp);
  // Difficulty speed is read once, at spawn: an enemy's chase speed never changes again, so
  // this is the single place the clean-run Insane reduction has to be applied.
  const baseSpeedMult = DIFFS[G.diff]?.speedMult || 1;
  const diffSpeed = (G.diff==='Insane' && !insaneBerserkEligible()) ? INSANE_CLEAN_SPEED_MULT : baseSpeedMult;
  const e = {
    type, mesh, hp, maxHp: hp, r: c.r, speed: c.speed*diffSpeed, kb: c.kb, kind: c.kind,
    x:wx, z:wz, kbx:0, kbz:0, slowT:0, slowPct:0.5,
    poison:null, burn:null, fireT:0, biteT:0, hitCd:0,
    dead:false, boss:c.boss, elite:c.elite, brain:c.brain, noReward:!!c.noReward,
    hop:c.hop, float:c.float, hopPhase: Math.random()*6.283,
  };
  if(type==='absorber'){ e.shield=null; e.regen=0; e.absorbT=1.0+Math.random()*0.6; }
  if(type==='briarwarden'){ e.briarT=1.05; e.briarNext='barrier'; e.briarDir=Math.random()<0.5?-1:1; e.briarWalls=[]; e.briarLash=null; e.briarGuardNoticeT=0; }
  if(type==='thornwall'){ e.life=5.4; e.owner=opts.owner||null; }
  if(type==='shielder'){ e.pulseScale=1; e.baseScale=mesh.scale.x; e.hp=hp; e.maxHp=e.hp; }
  if(type==='shooter'){ e.fireT=3; }
  if(type==='laserdude'){
    e.laserSide=wx>=0?1:-1;
    e.laserState='move'; e.laserStateT=0; e.laserTargetZ=clamp(wz,-VIEW.visH+24,VIEW.visH-24);
    e.beamActive=false; e.beam=null; e.laserSight=null;
  }
  if(type==='boss1'){ e.fireT=0.8; e.bh=!!opts.bh; e.crusherMeleeT=0.4; e.crusherWind=0; e.crusherAttack=''; e.crusherRangedRest=0; }
  if(type==='boss2'){ e.attackT=0; e.attackVar=0; e.pending=false; }
  if(type==='boss3'){
    e.attackT=0; e.attackVar=0; e.pending=false;
    e.wraithDir=Math.random()<0.5?-1:1; e.wraithDrops=[]; e.wraithCastT=0;
    e.z=-(VIEW.visH-Math.max(24,e.r*0.70)); e.mesh.position.z=e.z;
  }
  if(type==='bahamut'){ e.attackT=1.15; e.moveT=0; e.moveMode='orbit'; e.orbitDir=Math.random()<0.5?-1:1; e.action=null; e.lastAttack=''; e.phase=1; e.combo=0; e.forceApexUlt=false; e.hitHeroT=0; e.weaponSpin=0; }
  if(opts.name) e.name = opts.name;
  G.enemies.push(e);
  return e;
}

function makeEnemyShieldLabel(width=256,height=64){
  const canvas=document.createElement('canvas'); canvas.width=width; canvas.height=height;
  const ctx=canvas.getContext('2d');
  const tex=new THREE.CanvasTexture(canvas); tex.colorSpace=THREE.SRGBColorSpace;
  const mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,depthTest:false});
  const sprite=new THREE.Sprite(mat);
  return {canvas,ctx,tex,sprite};
}

const ELITE_HIT_STATUS_LIFE=1.15;
function makeEliteHitStatus(e){
  if(!e?.elite || e.boss) return null;
  if(e.eliteHitStatus) return e.eliteHitStatus;
  const w=clamp((e.r||16)*1.6,30,48), h=2.7;
  const group=new THREE.Group();
  const makeRow=(y,color)=>{
    const bg=new THREE.Mesh(
      new THREE.PlaneGeometry(w+2,h+1),
      new THREE.MeshBasicMaterial({color:0x07101a,transparent:true,opacity:0.88,depthTest:false,depthWrite:false})
    );
    const fill=new THREE.Mesh(
      new THREE.PlaneGeometry(w,h),
      new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.98,depthTest:false,depthWrite:false})
    );
    bg.position.y=y; fill.position.set(0,y,0.05);
    bg.renderOrder=910; fill.renderOrder=911;
    group.add(bg,fill);
    return {bg,fill};
  };
  const hp=makeRow(0,0xff6262);
  const shield=makeRow(4.2,0x65c7ff);
  const label=makeEnemyShieldLabel(512,64);
  label.sprite.position.y=9.4;
  label.sprite.scale.set(clamp(w*1.62,56,78),12,1);
  label.sprite.renderOrder=912;
  group.add(label.sprite);
  group.userData.fullW=w;
  group.userData.hp=hp;
  group.userData.shield=shield;
  group.userData.label=label;
  group.userData.ttl=0;
  group.userData.shieldHp=0;
  group.userData.shieldMax=0;
  group.visible=false;
  sceneAdd(group);
  e.eliteHitStatus=group;
  return group;
}
function syncEliteHitStatus(e,redrawLabel=false){
  const bar=e?.eliteHitStatus;
  if(!bar) return;
  const w=bar.userData.fullW;
  const hpRatio=clamp(e.hp/Math.max(1,e.maxHp),0,1);
  const hpFill=bar.userData.hp.fill;
  hpFill.scale.x=Math.max(0.001,hpRatio);
  hpFill.position.x=-(w*(1-hpRatio))*0.5;

  if(e.shield && !e.shield.dead){
    bar.userData.shieldHp=e.shield.hp;
    bar.userData.shieldMax=e.shield.maxHp;
  }
  const shieldMax=Math.max(0,bar.userData.shieldMax||0);
  const shieldHp=clamp(bar.userData.shieldHp||0,0,shieldMax||1);
  const showShield=shieldMax>0;
  bar.userData.shield.bg.visible=showShield;
  bar.userData.shield.fill.visible=showShield;
  if(showShield){
    const shieldRatio=clamp(shieldHp/Math.max(1,shieldMax),0,1);
    const shieldFill=bar.userData.shield.fill;
    shieldFill.scale.x=Math.max(0.001,shieldRatio);
    shieldFill.position.x=-(w*(1-shieldRatio))*0.5;
  }

  const lift=Math.max(31,(e.r||16)+18);
  bar.position.set(e.x,(e.mesh?.position?.y||0)+lift,e.z);
  if(G.camera?.quaternion) bar.quaternion.copy(G.camera.quaternion);

  if(redrawLabel){
    const {canvas,ctx,tex}=bar.userData.label;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.font='800 21px system-ui, sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.lineWidth=6; ctx.strokeStyle='rgba(3,8,15,.94)';
    const hpText='HP '+Math.max(0,Math.ceil(e.hp))+'/'+Math.max(1,Math.ceil(e.maxHp));
    const text=showShield ? hpText+'  ·  SHIELD '+Math.ceil(shieldHp)+'/'+Math.ceil(shieldMax) : hpText;
    ctx.strokeText(text,canvas.width/2,canvas.height/2);
    ctx.fillStyle=showShield?'#d8f2ff':'#ffd9d9';
    ctx.fillText(text,canvas.width/2,canvas.height/2);
    tex.needsUpdate=true;
  }
}
function flashEliteHitStatus(e,{shieldHp=null,shieldMax=null}={}){
  if(!e?.elite || e.dead || e.boss) return;
  const bar=makeEliteHitStatus(e);
  if(!bar) return;
  if(shieldMax!=null){
    bar.userData.shieldMax=Math.max(0,Number(shieldMax)||0);
    bar.userData.shieldHp=clamp(Number(shieldHp)||0,0,bar.userData.shieldMax||1);
  }else if(e.shield && !e.shield.dead){
    bar.userData.shieldMax=e.shield.maxHp;
    bar.userData.shieldHp=e.shield.hp;
  }else{
    bar.userData.shieldMax=0;
    bar.userData.shieldHp=0;
  }
  bar.userData.ttl=ELITE_HIT_STATUS_LIFE;
  bar.visible=true;
  syncEliteHitStatus(e,true);
}
function updateEliteHitStatus(e,dt){
  const bar=e?.eliteHitStatus;
  if(!bar || !bar.visible) return;
  bar.userData.ttl=Math.max(0,(bar.userData.ttl||0)-dt);
  if(bar.userData.ttl<=0){ bar.visible=false; return; }
  syncEliteHitStatus(e,false);
}
function removeEliteHitStatus(e){
  const bar=e?.eliteHitStatus;
  if(!bar) return;
  bar.traverse(o=>{
    if(o.material?.map && o.material.map!==G.radialTex) o.material.map.dispose?.();
    o.material?.dispose?.();
  });
  sceneRemove(bar);
  e.eliteHitStatus=null;
}

function redrawEnemyShieldLabel(shield){
  if(!shield?.label) return;
  const {canvas,ctx,tex}=shield.label;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.font='700 24px system-ui, sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.lineWidth=6; ctx.strokeStyle='rgba(3,8,15,.92)';
  const owner=shield.owner;
  const text='SHIELD '+Math.max(0,Math.ceil(shield.hp))+'/'+shield.maxHp+(owner?'  ·  HP '+Math.max(0,Math.ceil(owner.hp))+'/'+owner.maxHp:'');
  ctx.strokeText(text,canvas.width/2,canvas.height/2);
  ctx.fillStyle='#bfe9ff'; ctx.fillText(text,canvas.width/2,canvas.height/2);
  tex.needsUpdate=true;
}

const ENEMY_SHIELD_REGEN_DELAY = 4.0;
const ENEMY_SHIELD_REGEN_FULL_TIME = 8.0;

function updateEnemyShieldRegen(e,dt){
  const regen=e?.shieldRegen;
  if(!regen || e.dead) return;
  regen.delay=Math.max(0,(regen.delay||0)-dt);
  if(regen.delay>0) return;

  if(!e.shield){
    const startHp=Math.max(1,regen.maxHp*0.02);
    giveEnemyShield(e,regen.maxHp,{source:regen.source||'',startHp,announce:false,remember:false});
    floater('SHIELD REFORMING',e.x,e.z,'shield');
  }

  const shield=e.shield;
  if(!shield || shield.dead || shield.hp>=shield.maxHp) return;
  const before=shield.hp;
  shield.hp=Math.min(shield.maxHp,shield.hp+(shield.maxHp/ENEMY_SHIELD_REGEN_FULL_TIME)*dt);
  if(shield.hp!==before){
    shield.regenLabelT=(shield.regenLabelT||0)-dt;
    if(shield.label && shield.regenLabelT<=0){
      redrawEnemyShieldLabel(shield);
      shield.regenLabelT=0.12;
    }
  }
}

function updateEnemyShieldVisual(e,dt=0){
  updateEnemyShieldRegen(e,dt);
  const shield=e?.shield;
  if(!shield || shield.dead || !shield.mesh) return;
  shield.floatCd=Math.max(0,(shield.floatCd||0)-dt);
  shield.mesh.position.x=e.x; shield.mesh.position.z=e.z;
  const frac=clamp(shield.hp/Math.max(1,shield.maxHp),0,1);
  if(shield.fill){
    shield.fill.scale.x=Math.max(0.001,frac);
    shield.fill.position.x=-shield.barW*(1-frac)/2;
  }
  if(shield.bubble?.material){
    shield.bubble.material.opacity=(0.10+0.14*frac)+0.05*Math.sin(G.time*5+e.x*0.03);
  }
  if(shield.ring?.material) shield.ring.material.opacity=0.24+0.56*frac;
}

function removeEnemyShield(e,{burstFx=true,announce=true}={}){
  const shield=e?.shield;
  if(!shield) return;
  shield.dead=true;
  if(shield.mesh) sceneRemove(shield.mesh);
  e.shield=null;
  if(burstFx) burst(e.x,Math.max(8,e.r*0.8),e.z,0x6fa8ff,18,120,0.8,0.45);
  if(announce) floater('SHIELD BROKE',e.x,e.z,'shield');
}

function giveEnemyShield(e,hp,{source='',startHp=null,announce=true,remember=true}={}){
  if(!e || e.dead) return null;
  if(e.shield) removeEnemyShield(e,{burstFx:false,announce:false});
  const maxHp=Math.max(1,Math.round(hp));
  const initialHp=startHp==null ? maxHp : clamp(Number(startHp)||1,1,maxHp);
  if(remember){
    e.shieldRegen={maxHp,source,delay:0};
  }
  const grp=new THREE.Group();
  const r=Math.max(10,e.r*1.12);
  const bubble=new THREE.Mesh(
    new THREE.IcosahedronGeometry(r,1),
    new THREE.MeshBasicMaterial({color:0x6fa8ff,transparent:true,opacity:0.24,wireframe:true,depthWrite:false})
  );
  bubble.position.y=Math.max(9,e.r*0.95); grp.add(bubble);
  const ring=new THREE.Mesh(
    new THREE.RingGeometry(Math.max(8,e.r*1.02),Math.max(10,e.r*1.16),32),
    new THREE.MeshBasicMaterial({color:0x78c8ff,transparent:true,opacity:0.80,depthWrite:false,side:THREE.DoubleSide})
  );
  ring.rotation.x=-Math.PI/2; ring.position.y=0.18; grp.add(ring);

  let barW=0, fill=null, label=null;
  // Elite shield bubbles stay readable, but their HP/shield readout is transient on hit.
  // Non-elites keep the existing persistent shield readout.
  if(!e.elite){
    barW=clamp(e.r*1.65,28,72);
    const barY=Math.max(24,e.r*2.25);
    const bg=new THREE.Mesh(new THREE.BoxGeometry(barW+3,4.8,1.3),new THREE.MeshBasicMaterial({color:0x07101a,transparent:true,opacity:0.90,depthTest:false}));
    bg.position.y=barY; grp.add(bg);
    fill=new THREE.Mesh(new THREE.BoxGeometry(barW,2.8,1.5),new THREE.MeshBasicMaterial({color:0x65c7ff,depthTest:false}));
    fill.position.y=barY; grp.add(fill);
    label=makeEnemyShieldLabel();
    label.sprite.position.y=barY+8.0; label.sprite.scale.set(clamp(barW*1.35,46,82),14,1); grp.add(label.sprite);
  }

  grp.position.set(e.x,0,e.z); sceneAdd(grp);
  e.shield={hp:initialHp,maxHp,mesh:grp,bubble,ring,fill,barW,label,source,owner:e,dead:false,floatCd:0,regenLabelT:0};
  redrawEnemyShieldLabel(e.shield);
  updateEnemyShieldVisual(e,0);
  if(announce) floater('SHIELD +'+Math.ceil(initialHp),e.x,e.z,'shield');
  return e.shield;
}

function spawnAbsorberWithShield(wx,wz,hp){
  const a=spawnEnemy('absorber',wx,wz,{hp});
  giveEnemyShield(a,Math.max(120,Math.round(a.maxHp*0.35)),{source:'absorber'});
  return a;
}

// ---------------- Bullets ----------------
// Projectile meshes are extremely hot-path objects. Reuse immutable geometry/material
const _projectileGeoCache=new Map();
const _projectileMatCache=new Map();
const BULLET_GRID_CELL=64;
const _bulletEnemyGrid=new Map();
function projectileGeometry(r=2.2,laser=false){
  const key=laser?'laser':('s'+Math.round(r*20));
  let geo=_projectileGeoCache.get(key);
  if(!geo){ geo=laser?new THREE.BoxGeometry(1.6,1.6,7):new THREE.SphereGeometry(r,8,7); _projectileGeoCache.set(key,geo); }
  return geo;
}
function projectileMaterial(color){
  const key=color>>>0;
  let mat=_projectileMatCache.get(key);
  if(!mat){ mat=new THREE.MeshBasicMaterial({color:key}); _projectileMatCache.set(key,mat); }
  return mat;
}
function bulletGridKey(cx,cz){ return ((cx&0xffff)<<16)|(cz&0xffff); }
function buildBulletEnemyGrid(){
  _bulletEnemyGrid.clear();
  for(let i=0;i<G.enemies.length;i++){
    const e=G.enemies[i];
    if(e.dead||e.type==='shielder') continue;
    const cx=Math.floor(e.x/BULLET_GRID_CELL),cz=Math.floor(e.z/BULLET_GRID_CELL);
    const key=bulletGridKey(cx,cz);
    let bucket=_bulletEnemyGrid.get(key);
    if(!bucket){ bucket=[]; _bulletEnemyGrid.set(key,bucket); }
    bucket.push({e,order:i});
  }
  return _bulletEnemyGrid;
}

function fireBullet(x,z,dx,dz,dmg,opts={}){
  const r=opts.r??2.2, color=opts.color??0xffe066;
  let mesh, rocketFlame=null;
  if(opts.rocketFx){
    const grp=new THREE.Group();
    const body=new THREE.Mesh(new THREE.CylinderGeometry(1.35,1.55,8.4,9),projectileMaterial(color));
    const nose=new THREE.Mesh(new THREE.ConeGeometry(1.48,3.4,9),projectileMaterial(0xd9b36c));
    const band=new THREE.Mesh(new THREE.TorusGeometry(1.48,0.22,6,14),projectileMaterial(0x272c33));
    rocketFlame=new THREE.Mesh(new THREE.ConeGeometry(1.35,5.8,7),projectileMaterial(0xff6a20));
    nose.position.y=5.8;
    band.position.y=-3.8; band.rotation.x=Math.PI/2;
    rocketFlame.position.y=-6.4; rocketFlame.rotation.z=Math.PI;
    grp.add(body,nose,band,rocketFlame);
    const dir=new THREE.Vector3(dx,0,dz);
    if(dir.lengthSq()>0.0001){
      dir.normalize();
      grp.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
    }
    mesh=grp;
  }else{
    const geom=opts.spike
      ? new THREE.ConeGeometry(Math.max(1.15,r*0.72),Math.max(5.6,r*4.0),5)
      : projectileGeometry(r,false);
    mesh=new THREE.Mesh(geom,projectileMaterial(color));
    if(opts.spike){
      const dir=new THREE.Vector3(dx,0,dz);
      if(dir.lengthSq()>0.0001){
        dir.normalize();
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
      }
    }
  }
  mesh.position.set(x, 3, z);
  if(opts.scale) mesh.scale.setScalar(opts.scale);
  sceneAdd(mesh);
  const life = opts.life ?? (G.gun ? (G.gun.special.includes('explode') ? (6 + G.gun.range) : (G.gun.range + G.hero.mods.range)) : 0.6);
  const b = {
    mesh, x, z, dx, dz, speed: opts.speed??BULLET_SPEED, dmg, life,
    pierce: opts.pierce||0, bounce: opts.bounce||0, poison: opts.poison||0, burn:opts.burn||0, slow: opts.slow||false, slowDur: opts.slowDur,
    explode: opts.explode||0, explodeColor:opts.explodeColor, explodeFx:opts.explodeFx||false, impactPad:opts.impactPad??3, bone: opts.bone||false, boneProcChance:opts.boneProcChance, spike: opts.spike||false, kb: opts.kb??G.hero.mods.kb,
    pool: opts.pool||null, poolSplat:false,
    homing: opts.homing||false, softHoming:opts.softHoming||false, softTarget:opts.softTarget||null, lockTarget:opts.lockTarget||false, acquireTarget:opts.acquireTarget||false, homingDelay:opts.homingDelay||0, homingTurn:opts.homingTurn||0, homingLife:opts.homingLife||0, homingAge:0,
    vy: opts.vy||0, y:3, blastR: opts.blastR||36, blastInnerR:opts.blastInnerR||0,
    cluster: opts.cluster||0, clusterScale: opts.clusterScale??0.6, expireExplode: opts.expireExplode||false,
    trailSmoke: opts.trailSmoke||false, smokeEvery:opts.smokeEvery||0.1, smokeScale:opts.smokeScale||1, smokeT:0,
    rocketFx:!!opts.rocketFx, rocketFlame, rocketFxT:0,
    noCrit: opts.noCrit||false,
    noDirect: opts.noDirect||false,
    hit: new Set(), dead:false, bounced:false, color:opts.color??0xffe066,
  };
  G.bullets.push(b);
  return b;
}

function fireEnemyProjectile(x,z,dx,dz,opts={}){
  const laser=opts.laser;
  const r=opts.r??3.4, color=opts.color??(laser?0xff4f9a:0xff5a5a);
  const mesh=new THREE.Mesh(projectileGeometry(r,!!laser),projectileMaterial(color));
  mesh.position.set(x, opts.y??3.4, z);
  if(opts.scale) mesh.scale.setScalar(opts.scale);
  if(laser) mesh.lookAt(x+dx, 0, z+dz);
  sceneAdd(mesh);
  const b = {
    mesh, x, z, dx, dz, speed:opts.speed??130, dmg:opts.dmg??HERO_HIT_DMG, kb:opts.kb||0, hp:100, life:opts.life??12,
    laser, rot:opts.rot||0, beam:false, dead:false, r,
    softHoming:opts.softHoming||false, homingDelay:opts.homingDelay||0, homingTurn:opts.homingTurn||0, homingLife:opts.homingLife||0, homingAge:0,
  };
  G.ebullets.push(b);
  return b;
}

function enemyPerceivedHeroTarget(){
  const h=G.hero;
  return h?.porterAiDecoy?.t>0 ? h.porterAiDecoy : h;
}

// boss1 (and boss2's summoned minions use 6-way) volley: n boss bullets spread evenly across arcDeg centred on the hero
function bossVolley(e, n, arcDeg, speed){
  const target=enemyPerceivedHeroTarget();
  const dx = target.x - e.x, dz = target.z - e.z;
  const base = Math.atan2(dx, dz);
  for(let i=0;i<n;i++){
    const off = n>1 ? (i/(n-1) - 0.5) * arcDeg : 0;
    const a = base + off*Math.PI/180;
    fireEnemyProjectile(e.x, e.z, Math.sin(a), Math.cos(a), {speed, rot:55});
  }
}

// HEXLORD visibly corrupts a small number of existing enemies into 3s bomb carriers.
// Attribution matters more than raw count: every carrier gets a persistent marker and a cast tether.
function removeHexBombMarker(e){
  if(!e?.bombFx) return;
  sceneRemove(e.bombFx);
  e.bombFx=null;
}
function addHexBombMarker(e,boss){
  removeHexBombMarker(e);
  const grp=new THREE.Group();
  const ringMat=new THREE.MeshBasicMaterial({color:0xcf65ff,transparent:true,opacity:0.88,depthWrite:false,side:THREE.DoubleSide});
  const ring=new THREE.Mesh(new THREE.RingGeometry(Math.max(8,e.r*0.82),Math.max(11,e.r*1.02),28),ringMat);
  ring.rotation.x=-Math.PI/2; ring.position.y=0.18; grp.add(ring);
  const bombMat=new THREE.MeshBasicMaterial({color:0xff5a7d,transparent:true,opacity:0.95,depthWrite:false});
  const bomb=new THREE.Mesh(new THREE.SphereGeometry(Math.max(2.2,Math.min(4.2,e.r*0.18)),8,7),bombMat);
  bomb.position.y=Math.max(18,e.r*1.7); grp.add(bomb);
  const fuse=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,4.2,6),new THREE.MeshBasicMaterial({color:0xffd166}));
  fuse.position.set(0,bomb.position.y+3.0,0); fuse.rotation.z=0.5; grp.add(fuse);
  grp.position.set(e.x,0,e.z); sceneAdd(grp);
  e.bombFx=grp; e.bombRing=ring; e.bombIcon=bomb; e.bombOwner=boss;
}
function spawnSpellArcFx(x0,z0,x1,z1,color=0xcf65ff,life=0.48){
  const grp=new THREE.Group();
  const dx=x1-x0,dz=z1-z0;
  const steps=8;
  for(let i=1;i<=steps;i++){
    const t=i/(steps+1);
    const mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.72,depthWrite:false});
    const mote=new THREE.Mesh(new THREE.OctahedronGeometry(i%2?1.35:0.95,0),mat);
    mote.position.set(x0+dx*t,5.5+Math.sin(Math.PI*t)*13.5,z0+dz*t);
    mote.rotation.set(t*2.7,t*4.1,t*1.8);
    grp.add(mote);
  }
  sceneAdd(grp);
  G.effects.push({kind:'beamfx',mesh:grp,t:0,life});
  return grp;
}
function boss2Summon(boss){
  const types=['goblingreen','goblinred','troll','box3','dummy','egger','shooter'];
  const cands=G.enemies.filter(e=>!e.dead && types.includes(e.type) && e.bombT==null);
  for(let i=cands.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [cands[i],cands[j]]=[cands[j],cands[i]]; }
  const maxBombs=G.diff==='Insane'?4:(G.diff==='Hard'?4:3);
  const picked=cands.slice(0,maxBombs);
  for(const e of picked){
    e.bombT=3; e.bombShown=3; e.bombOwner=boss;
    addHexBombMarker(e,boss);
    // This link is a harmless CAST indicator, not an attack lane. Keep it elevated and
    // broken so players read the marked carrier/countdown as the danger, not the path.
    spawnSpellArcFx(boss.x,boss.z,e.x,e.z,0xcf65ff,0.50);
    floater('CURSED · BOMB 3',e.x,e.z,'crit');
    burst(e.x,12,e.z,0xcf65ff,10,72,0.5,0.3);
  }
  if(picked.length){
    floater('HEXLORD CURSE',boss.x,boss.z,'crit');
    banner('HEXLORD CURSE · '+picked.length+' BOMB'+(picked.length>1?'S':''));
  } else {
    floater('NO HOSTS',boss.x,boss.z,'shield');
  }
  return picked.length;
}

function briarLiveWalls(e){
  if(!e) return [];
  e.briarWalls=(e.briarWalls||[]).filter(w=>w&&!w.dead);
  return e.briarWalls;
}
function clearBriarWalls(e,burstFx=false){
  if(!e) return;
  for(const w of briarLiveWalls(e)){
    if(burstFx) burst(w.x,5,w.z,0xff8a42,7,72,0.28,0.18);
    removeEnemyNoReward(w);
  }
  e.briarWalls=[];
}
function spawnBriarBarrier(e){
  if(!e||e.dead) return;
  clearBriarWalls(e,false);
  const target=enemyPerceivedHeroTarget(), dx=target.x-e.x, dz=target.z-e.z, len=Math.max(1,Math.hypot(dx,dz));
  const ux=dx/len, uz=dz/len, px=uz, pz=-ux;
  const hp=G.diff==='Insane'?760:(G.diff==='Hard'?650:520);
  e.briarWalls=[];
  for(const off of [-22,0,22]){
    const wx=clamp(e.x+ux*34+px*off,-VIEW.visW+14,VIEW.visW-14);
    const wz=clamp(e.z+uz*34+pz*off,-VIEW.visH+14,VIEW.visH-14);
    const w=spawnEnemy('thornwall',wx,wz,{hp,owner:e});
    w.life=5.4; w.owner=e; e.briarWalls.push(w);
    spawnRadiusRing(wx,wz,12,0xff7a32,0.28);
  }
  floater('THORN WALL',e.x,e.z,'crit');
}
function spawnBriarLashTell(e){
  if(!e||e.dead||e.briarLash) return;
  const target=enemyPerceivedHeroTarget(), tx=target.x, tz=target.z, dx=tx-e.x, dz=tz-e.z, len=Math.max(1,Math.hypot(dx,dz));
  const mat=new THREE.MeshBasicMaterial({color:0xff8a42,transparent:true,opacity:0.70,depthWrite:false});
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(2.6,0.65,len),mat);
  mesh.position.set((e.x+tx)/2,4.5,(e.z+tz)/2); mesh.lookAt(tx,4.5,tz); sceneAdd(mesh);
  e.briarLash={t:0.58,tx,tz,mesh,mat};
  spawnRadiusRing(tx,tz,18,0xff8a42,0.58);
  floater('LASH!',e.x,e.z,'crit');
}
function resolveBriarLash(e){
  const l=e?.briarLash; if(!l) return;
  sceneRemove(l.mesh); e.briarLash=null;
  const h=G.hero; if(!h||h.dead||h.airborne) return;
  const hitDist=distToSeg(h.x,h.z,e.x,e.z,l.tx,l.tz);
  if(hitDist>G.heroR+10 || h.invince>0) return;
  const hp0=h.hp, sh0=h.shield;
  damageHero(14,{fromX:e.x-h.x,fromZ:e.z-h.z,sourceX:e.x,sourceZ:e.z,projectile:false});
  const landed=h.hp<hp0 || h.shield<sh0;
  if(!landed || h.dead) return;
  const dx=e.x-h.x,dz=e.z-h.z,len=Math.max(1,Math.hypot(dx,dz));
  h.x+=dx/len*38; h.z+=dz/len*38; h.briarSlowT=Math.max(h.briarSlowT||0,1.10);
  floater('GRABBED',h.x,h.z,'hurt');
}

// WRAITH gives two existing minions a visible, finite blue shield layer.
function boss3SummonShields(source=null){
  const types=['goblingreen','egger','goblinred','goblinblue','troll','box3','pigsassin','absorber','steelcrab'];
  let made=0;
  for(let k=0;k<2;k++){
    const cands=G.enemies.filter(e=>!e.dead && types.includes(e.type) && !e.shield);
    if(!cands.length) break;
    const e=cands[Math.floor(Math.random()*cands.length)];
    const shieldHp=clamp(Math.round(e.maxHp*0.60),60,1600);
    giveEnemyShield(e,shieldHp,{source:'boss3'});
    if(source) spawnSpellArcFx(source.x,source.z,e.x,e.z,0x8fdcff,0.42);
    made++;
  }
  if(made) banner('WRAITH SHIELD · '+made+' MINION'+(made>1?'S':''));
}

function spawnLaserSight(e,life){
  if(e.laserSight) sceneRemove(e.laserSight);
  const width=VIEW.visW*2+18;
  const mesh=new THREE.Mesh(
    new THREE.BoxGeometry(width,0.55,2.4),
    new THREE.MeshBasicMaterial({color:0xff75b5,transparent:true,opacity:0.48,depthWrite:false})
  );
  mesh.position.set(0,1.1,e.z); sceneAdd(mesh); e.laserSight=mesh;
  G.effects.push({kind:'laserSight',mesh,t:0,life,owner:e});
  return mesh;
}

// LASER DUDE's beam is centered on the arena lane, not shifted by the elite's own X.
function spawnLaserBeam(e){
  const fullW=VIEW.visW*2+18;
  const mesh=new THREE.Mesh(
    new THREE.BoxGeometry(fullW,3.2,16),
    new THREE.MeshBasicMaterial({color:0xff4f9a,transparent:true,opacity:0.78})
  );
  mesh.position.set(0,4,e.z); sceneAdd(mesh);
  const b={mesh,x:0,z:e.z,dx:1,dz:0,speed:0,dmg:HERO_HIT_DMG,hp:100,life:0.52,laser:false,beam:true,hbeam:true,linked:e,dead:false,hitCd:0,fullW,aegisBlocked:false};
  G.ebullets.push(b);
  return b;
}

function makeWraithShardMesh(color=0xff4f9a){
  const grp=new THREE.Group();
  const shardMat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.74,depthWrite:false});
  const coreMat=new THREE.MeshBasicMaterial({color:color===0xff4f9a?0xffd7ea:0xe8fbff,transparent:true,opacity:0.98,depthWrite:false});
  const shard=new THREE.Mesh(new THREE.ConeGeometry(7.2,28,3),shardMat);
  shard.rotation.x=Math.PI/2; shard.position.y=5; grp.add(shard);
  const core=new THREE.Mesh(new THREE.ConeGeometry(2.4,23,3),coreMat);
  core.rotation.x=Math.PI/2; core.position.y=5.1; grp.add(core);
  return grp;
}

// WRAITH lives on the top edge. Every rain shard begins beneath its visible body and travels downward.
function spawnWraithShard(source,wx){
  const z0=source && !source.dead ? source.z+Math.max(14,source.r*0.55) : -(VIEW.visH+18);
  const grp=makeWraithShardMesh(0xff4f9a);
  grp.position.set(clamp(wx,-VIEW.visW+16,VIEW.visW-16),0,z0); sceneAdd(grp);
  const travel=(VIEW.visH-z0+24)/245;
  const b={mesh:grp,x:grp.position.x,z:z0,dx:0,dz:1,speed:245,dmg:HERO_HIT_DMG,hp:100,life:travel,
    laser:false,beam:true,vertical:true,beamW:12,dead:false,hitCd:0,hazard:'wraithShard',owner:source||null};
  G.ebullets.push(b);
  return b;
}

function spawnFallingBeam(origX,source=null){
  const wx=source ? origX : ((origX/480)-0.5)*(VIEW.visW*2*0.92);
  return spawnWraithShard(source,wx);
}

function normalizeWraithLanes(xs){
  if(!xs?.length) return [];
  const lo=-VIEW.visW+18, hi=VIEW.visW-18;
  let min=Math.min(...xs), max=Math.max(...xs), shift=0;
  // warnings on one X near an edge, visually promising 3 lanes while firing 4 shards.
  if(min<lo) shift+=lo-min;
  if(max+shift>hi) shift+=hi-(max+shift);
  return xs.map(x=>x+shift);
}
function clearWraithTell(drop){
  const fx=drop?.tell;
  if(!fx || fx.dead) return;
  if(fx.mesh) sceneRemove(fx.mesh);
  fx.dead=true;
  drop.tell=null;
}
function spawnWraithTell(e,x,life){
  const z0=e.z+Math.max(14,e.r*0.55);
  const grp=new THREE.Group();
  const mats=[];

  const ghost=makeWraithShardMesh(0xff87c3);
  ghost.traverse(o=>{
    if(!o.material) return;
    o.material=o.material.clone();
    o.material.transparent=true;
    o.material.depthWrite=false;
    o.material.opacity*=0.30;
    mats.push(o.material);
  });
  ghost.position.set(0,0,5);
  grp.add(ghost);

  // Broken floor dashes communicate the exact travel lane/width without looking like
  const endZ=VIEW.visH-8;
  const span=Math.max(30,endZ-z0);
  const dashCount=7;
  for(let i=0;i<dashCount;i++){
    const mat=new THREE.MeshBasicMaterial({color:0xff6bd6,transparent:true,opacity:0.20,depthWrite:false});
    const dash=new THREE.Mesh(new THREE.BoxGeometry(12,0.35,Math.min(18,span/(dashCount+1)*0.52)),mat);
    dash.position.set(0,0.38,(span*(i+1))/(dashCount+1));
    grp.add(dash); mats.push(mat);
  }
  grp.position.set(x,0,z0);
  sceneAdd(grp);
  const fx={kind:'wraithTell',mesh:grp,mats,ghost,owner:e,t:0,life:Math.max(0.15,life),dead:false};
  G.effects.push(fx);
  return fx;
}
function queueWraithRain(e,xs,{stagger=0.10,label='CONE RAIN'}={}){
  if(e.wraithDrops?.length) for(const d of e.wraithDrops) clearWraithTell(d);
  e.wraithDrops=[];
  const lanes=normalizeWraithLanes(xs);
  for(let i=0;i<lanes.length;i++){
    const delay=0.68+i*stagger;
    const drop={x:lanes[i],t:delay,tell:null};
    drop.tell=spawnWraithTell(e,drop.x,delay+0.10);
    e.wraithDrops.push(drop);
  }
  floater(label+' ×'+lanes.length,e.x,e.z,'crit');
}

function spawnReflectedWraithShard(enemyShard,dmg,label){
  if(!enemyShard || enemyShard.dead) return false;
  const owner=enemyShard.owner && !enemyShard.owner.dead ? enemyShard.owner : null;
  let dx=0,dz=-1;
  if(owner){
    const tx=owner.x-enemyShard.x,tz=owner.z-enemyShard.z,len=Math.max(0.01,Math.hypot(tx,tz));
    dx=tx/len; dz=tz/len;
  } else { dx=-enemyShard.dx; dz=-enemyShard.dz; }
  const mesh=makeWraithShardMesh(0x9feaff);
  mesh.position.set(enemyShard.x,0,enemyShard.z); mesh.rotation.y=Math.atan2(dx,dz); sceneAdd(mesh);
  // Reflected cones pierce intervening fodder so the return-to-WRAITH counterplay is reliable.
  const b={mesh,x:enemyShard.x,z:enemyShard.z,dx,dz,speed:360,dmg,life:2.2,pierce:99,bounce:0,poison:0,slow:false,
    explode:0,bone:false,spike:false,kb:130,homing:false,softHoming:false,vy:0,y:3,blastR:0,cluster:0,noCrit:true,noDirect:false,
    hit:new Set(),dead:false,color:0x9feaff};
  G.bullets.push(b);
  enemyShard.dead=true;
  floater(label,enemyShard.x,enemyShard.z,'shield');
  burst(enemyShard.x,7,enemyShard.z,0x9feaff,12,105,0.30,0.20);
  return true;
}

// granting them or leaving them unreachable. The reward appears at the visible edge and
// flies a short distance inward, preserving the direction the enemy left from.
function arenaRewardReturnPath(x,z){
  const edgePad=8, landPad=38;
  const sx=clamp(x,-VIEW.visW+edgePad,VIEW.visW-edgePad);
  const sz=clamp(z,-VIEW.visH+edgePad,VIEW.visH-edgePad);
  let tx=sx,tz=sz;
  if(x < -VIEW.visW) tx=-VIEW.visW+landPad;
  else if(x > VIEW.visW) tx=VIEW.visW-landPad;
  if(z < -VIEW.visH) tz=-VIEW.visH+landPad;
  else if(z > VIEW.visH) tz=VIEW.visH-landPad;
  return {sx,sz,tx,tz};
}

// ---------------- XP orbs ----------------
function spawnOrb(x,z,opts={}){
  const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.7, 0), new THREE.MeshBasicMaterial({ color:0x9ceb5a }));
  mesh.position.set(x, 6, z);
  sceneAdd(mesh);
  const glow = glowSprite(G.orbGlowTex, 15, 0.9); glow.position.copy(mesh.position); glow.position.y=4;
  sceneAdd(glow);
  const o = {
    kind:opts.kind||'xp', mesh, glow, x, z,
    life:opts.life??15, pickupDelay:opts.pickupDelay??0, dead:false,
    returnT:opts.returnT||0, returnDur:opts.returnT||0,
    returnFromX:x, returnFromZ:z,
    returnX:opts.returnX??x, returnZ:opts.returnZ??z
  };
  G.orbs.push(o);
  return o;
}
function orbKind(o){ return o?.kind || 'xp'; }
function isXpOrb(o){ return orbKind(o)==='xp'; }

// ---------------- [+] bonus drops ----------------
// The heavy half of the roster can hand over a plus on death: a red one patches the
// hero up, a green one carries a bigger XP bite than an ordinary orb. Ordinary minions never
// roll these, so a pickup stays a reward for killing something that actually took work.
// NOTE (balance): the amounts are deliberately small. A [+] is a nudge, not a supply line -
// the fat minion tier is "only slightly" more than nothing at all, and the champion/boss tiers
// are what make a long fight feel worth finishing.
const PLUS_DROP_TIERS = {
  heavy: { chance:0.18, heal:3,  xp:3  },
  elite: { chance:0.55, heal:8,  xp:6  },
  boss:  { chance:1.00, heal:16, xp:12 },
  apex:  { chance:1.00, heal:24, xp:18 },
};
// Deep, single-dominant-channel hues. The bars carry their colour as emissive AND sit under an
// additive halo, so a colour with a lot of the other two channels (the old salmon-pink heal
// 0xff4f6a, for instance) has its green/blue lifted by the glow and clips to pink. Keeping the
// off-channels low is what keeps the heal reading as RED.
const PLUS_TINT = { heal:0xff1f30, xp:0x2fd35c };
// The [+] heal value is scaled by loadout, on the same clean-run/OP split as the Insane pursuit
// speed. A premium hero or gun is meant to be the harder run and already carries far more sustain
// of its own (bigger HP pools, damage reduction, super healing), so the arena's own sustain comes
// back a little smaller; a plain bunny, who has none of that, gets a little more. The tiers in
// PLUS_DROP_TIERS stay the neutral reference - these two numbers are the only place to retune it.
// The drop is rolled with the scaled value, so the "+N" float on pickup is what the cross was
// actually worth.
const PLUS_HEAL_CLEAN_MULT = 1.25;
const PLUS_HEAL_OP_MULT = 0.75;
function plusHealAmount(base){
  const mult = opLoadoutEquipped() ? PLUS_HEAL_OP_MULT : PLUS_HEAL_CLEAN_MULT;
  return Math.max(1, Math.round(base*mult));
}
let _plusGlowTex = null;
function plusGlowTexture(kind){
  _plusGlowTex = _plusGlowTex || {};
  if(!_plusGlowTex[kind]){
    // Saturated centres (not near-white) - an additive sprite with a white core clips the bars
    // underneath to a featureless blob, which is exactly how the plus stops reading as a plus.
    // The heal halo is the same red as the bars so the additive pass can not tint the cross
    // towards pink.
    _plusGlowTex[kind] = kind==='heal'
      ? radialTexture('rgba(255,42,58,1)','rgba(255,42,58,.30)','rgba(255,42,58,0)')
      : radialTexture('rgba(64,224,110,1)','rgba(64,224,110,.34)','rgba(64,224,110,0)');
  }
  return _plusGlowTex[kind];
}
function plusDropTier(e){
  if(!e) return null;
  if(e.apexBoss || e.type==='bahamut') return 'apex';
  if(e.boss) return 'boss';
  if(e.elite || e.brain) return 'elite';
  if(e.r>=18) return 'heavy';
  return null;
}
function spawnPlus(x,z,opts={}){
  const kind = opts.kind==='heal' ? 'heal' : 'xp';
  const color = PLUS_TINT[kind];
  // `dx/dz` nudges the drop off the death spot. A champion hands over a heal AND an xp plus at
  // once, and two additive glows sharing one spot add up to a white blob, so the pair is split.
  const dx = opts.dx||0, dz = opts.dz||0;
  const px = x+dx, pz = z+dz;
  // Two crossed bars in the XY plane, so the shape faces the one fixed camera and reads as a
  // cross rather than as a tumbling object.
  const mesh = new THREE.Group();
  const mat = stdMat(color,{emissive:color,emissiveIntensity:1.0,roughness:0.34,metalness:0.10});
  const bar = (w,h)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,2.0),mat); mesh.add(m); return m; };
  bar(3.0,9.0); bar(9.0,3.0);
  // Cancel the camera tilt: the plate is built as a square cross, but the tilted camera squashes
  // world-y to cos(tilt)≈0.58, which would hand the player a squat, wide plus whose arms change
  // length as it turns. Scaling the plate's height back up by 1/cos(tilt) makes the cross project
  // as the symmetric, equal-armed cross it is meant to be.
  mesh.scale.set(1, 1/CAM_TILT_COS, 1);
  mesh.position.set(px,6,pz);
  sceneAdd(mesh);
  const glow = glowSprite(plusGlowTexture(kind), 12.5, 0.46);
  glow.position.set(px,4,pz);
  sceneAdd(glow);
  const o = {
    kind, plus:true, amount:Math.max(1,Math.round(opts.amount||1)), mesh, glow, x:px, z:pz,
    life:opts.life??22, pickupDelay:opts.pickupDelay??0, dead:false,
    returnT:opts.returnT||0, returnDur:opts.returnT||0,
    returnFromX:px, returnFromZ:pz,
    returnX:(opts.returnX??x)+dx, returnZ:(opts.returnZ??z)+dz
  };
  G.orbs.push(o);
  return o;
}
// Called from the kill reward path. `rewardPath` is the same off-map fly-back leg the XP orb
// uses, so a plus dropped by an enemy that died outside the arena walks back in with the loot.
function rollPlusDrops(e,x,z,rewardPath){
  const tier = plusDropTier(e);
  if(!tier) return;
  const t = PLUS_DROP_TIERS[tier];
  const px = rewardPath ? rewardPath.sx : x, pz = rewardPath ? rewardPath.sz : z;
  const drop = (kind,amount,dx=0,dz=0)=>{
    spawnPlus(px,pz,{
      kind, amount, dx, dz, pickupDelay:0.44,
      returnT:rewardPath?0.44:0, returnX:rewardPath?rewardPath.tx:px, returnZ:rewardPath?rewardPath.tz:pz
    });
  };
  // Champions and bosses always hand over both, so their drop is felt - split to either side of
  // the corpse so the two glows do not stack into one white flare. A fat minion only ever rolls
  // once, and rarely.
  if(tier==='boss' || tier==='apex'){
    const off = tier==='apex' ? 11 : 8.5;
    drop('heal',plusHealAmount(t.heal),-off,-off*0.45); drop('xp',t.xp,off,off*0.45);
    return;
  }
  if(Math.random() >= t.chance) return;
  if(Math.random() < 0.55) drop('heal',plusHealAmount(t.heal)); else drop('xp',t.xp);
}
function valDropSpot(x,z,opts={}){
  const tries=opts.tries??18;
  const spread=opts.spread??42;
  const minHero=opts.minHero??20;
  const minOrb=opts.minOrb??16;
  const minCake=opts.minCake??28;
  const minR=opts.minR??0;
  let best={x:clamp(x,-VIEW.visW+10,VIEW.visW-10),z:clamp(z,-VIEW.visH+10,VIEW.visH-10)},bestScore=-1e9;
  for(let i=0;i<tries;i++){
    const a=Math.random()*Math.PI*2;
    const rr=minR+Math.random()*spread;
    const px=clamp(x+Math.cos(a)*rr,-VIEW.visW+10,VIEW.visW-10);
    const pz=clamp(z+Math.sin(a)*rr,-VIEW.visH+10,VIEW.visH-10);
    let score=0;
    if(G.hero){
      const dh=Math.hypot(px-G.hero.x,pz-G.hero.z);
      if(dh<minHero) score-=(minHero-dh)*12;
      else score+=Math.min(8,(dh-minHero)*0.18);
    }
    for(const o of G.orbs){
      if(o.dead) continue;
      const d=Math.hypot(px-o.x,pz-o.z);
      if(d<minOrb) score-=(minOrb-d)*10;
    }
    for(const fx of G.effects){
      if(fx.dead || fx.kind!=='valCake') continue;
      const d=Math.hypot(px-fx.x,pz-fx.z);
      if(d<minCake) score-=(minCake-d)*12;
    }
    for(const e of G.enemies){
      if(e.dead || e.type!=='apexcake') continue;
      const d=Math.hypot(px-e.x,pz-e.z);
      if(d<minCake) score-=(minCake-d)*12;
    }
    if(score>bestScore){ bestScore=score; best={x:px,z:pz}; }
    if(score>=4) break;
  }
  return best;
}
function buildValIngredientMesh(type='strawberry'){
  const g=new THREE.Group();
  if(type==='strawberry'){
    const fruit=stdMat(0xe94f5f,{emissive:0xe94f5f,emissiveIntensity:0.14});
    const leaf=stdMat(0x5aa447,{emissive:0x5aa447,emissiveIntensity:0.08});
    const seedMat=new THREE.MeshBasicMaterial({color:0xffe39a});
    const body=new THREE.Mesh(new THREE.SphereGeometry(2.75,14,11),fruit);
    body.scale.set(0.94,1.15,0.94); body.position.y=0.45;
    const tip=new THREE.Mesh(new THREE.ConeGeometry(2.12,3.55,12),fruit);
    tip.position.y=-1.95; tip.rotation.x=Math.PI;
    const crown=new THREE.Mesh(new THREE.ConeGeometry(2.25,1.25,7),leaf);
    crown.position.y=3.25;
    g.add(body,tip,crown);
    for(let i=0;i<10;i++){
      const a=i/10*Math.PI*2;
      const seed=new THREE.Mesh(new THREE.SphereGeometry(0.17,5,4),seedMat);
      seed.position.set(Math.cos(a)*1.95,0.35+(i%3-1)*0.78,Math.sin(a)*1.38+1.55);
      g.add(seed);
    }
  } else if(type==='candy'){
    // Big wrapped sweet: round colored center with unmistakable twisted wrappers.
    const candy=stdMat(0xd878ff,{emissive:0xd878ff,emissiveIntensity:0.14,roughness:0.48});
    const wrapper=stdMat(0xffd6f5,{emissive:0xffd6f5,emissiveIntensity:0.09,roughness:0.58});
    const stripe=stdMat(0x73c7ff,{emissive:0x73c7ff,emissiveIntensity:0.10});
    const center=new THREE.Mesh(new THREE.SphereGeometry(2.55,14,11),candy);
    center.scale.set(1.25,0.96,0.96);
    g.add(center);
    for(const side of [-1,1]){
      const wrap=new THREE.Mesh(new THREE.ConeGeometry(2.25,3.1,8),wrapper);
      wrap.rotation.z=side*Math.PI/2;
      wrap.position.x=side*4.15;
      g.add(wrap);
    }
    const band=new THREE.Mesh(new THREE.TorusGeometry(2.25,0.32,6,18),stripe);
    band.rotation.y=Math.PI/2;
    g.add(band);
    g.rotation.y=0.22;
    g.rotation.z=-0.10;
  } else {
    // Chunky scored loaf, deliberately warm/brown so it cannot read as litter or XP.
    const crust=stdMat(0xc9823d,{emissive:0xc9823d,emissiveIntensity:0.08,roughness:0.82});
    const bread=stdMat(0xe9b86f,{emissive:0xe9b86f,emissiveIntensity:0.07,roughness:0.86});
    const score=stdMat(0xffdda1,{emissive:0xffdda1,emissiveIntensity:0.06,roughness:0.88});
    const base=new THREE.Mesh(new THREE.BoxGeometry(6.7,2.7,4.7),crust);
    base.position.y=-0.65;
    const top=new THREE.Mesh(new THREE.SphereGeometry(3.35,14,10),bread);
    top.scale.set(1.05,0.72,0.76); top.position.y=1.35;
    g.add(base,top);
    for(let i=-1;i<=1;i++){
      const cut=new THREE.Mesh(new THREE.BoxGeometry(0.38,0.42,3.55),score);
      cut.position.set(i*1.55,3.05,0.10);
      cut.rotation.y=-0.28;
      cut.rotation.z=0.10;
      g.add(cut);
    }
    g.rotation.y=-0.18;
  }
  return { mesh:g };
}
function spawnValIngredient(x,z,opts={}){
  const types=['strawberry','candy','bread'];
  const type=opts.type || types[Math.floor(Math.random()*types.length)];
  const spot=opts.fixedSpot
    ? {x:clamp(x,-VIEW.visW+8,VIEW.visW-8),z:clamp(z,-VIEW.visH+8,VIEW.visH-8)}
    : valDropSpot(x,z,{spread:opts.spread??44,minHero:opts.minHero??22,minOrb:opts.minOrb??20,minCake:opts.minCake??30,minR:opts.minR??12});
  const built=buildValIngredientMesh(type);
  const mesh=built.mesh;
  mesh.position.set(spot.x,5.7,spot.z);
  sceneAdd(mesh);
  // Ingredients are physical props, not glowing XP. Only a quiet floor shadow keeps them grounded.
  const marker=new THREE.Mesh(new THREE.CircleGeometry(4.6,18),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.20,depthWrite:false}));
  marker.rotation.x=-Math.PI/2; marker.position.set(spot.x,0.20,spot.z); sceneAdd(marker);
  const o={
    kind:'ingredient', ingredientType:type, mesh, glow:marker, groundMarker:true,
    x:spot.x, z:spot.z, life:opts.life??27, pickupDelay:opts.pickupDelay??0.35, dead:false,
    returnT:opts.returnT||0, returnDur:opts.returnT||0,
    returnFromX:spot.x, returnFromZ:spot.z,
    returnX:opts.returnX??spot.x, returnZ:opts.returnZ??spot.z
  };
  G.orbs.push(o);
  return o;
}
function buildValCakeMesh(){
  const g=new THREE.Group();
  const baseMat=stdMat(0xf0d4a0,{emissive:0xf0d4a0,emissiveIntensity:0.12});
  const icingMat=stdMat(0xffc6e6,{emissive:0xffc6e6,emissiveIntensity:0.18});
  const creamMat=stdMat(0xffffff,{emissive:0xffffff,emissiveIntensity:0.14});
  const redMat=stdMat(0xe94f5f,{emissive:0xe94f5f,emissiveIntensity:0.16});
  const greenMat=stdMat(0x5aa447,{emissive:0x5aa447,emissiveIntensity:0.10});
  const blueMat=stdMat(0x5364c9,{emissive:0x5364c9,emissiveIntensity:0.18});
  const layer1=new THREE.Mesh(new THREE.CylinderGeometry(8.4,8.9,3.5,22),baseMat);
  const layer2=new THREE.Mesh(new THREE.CylinderGeometry(7.25,7.65,3.1,22),icingMat);
  const creamTop=new THREE.Mesh(new THREE.CylinderGeometry(6.7,7.0,1.4,22),creamMat);
  layer1.position.y=2.2; layer2.position.y=5.05; creamTop.position.y=7.15;
  g.add(layer1,layer2,creamTop);
  const strawberryCake=Math.random()<0.5;
  if(strawberryCake){
    for(let i=0;i<6;i++){
      const a=i/6*Math.PI*2;
      const berry=new THREE.Mesh(new THREE.SphereGeometry(0.95,10,8),redMat);
      berry.scale.set(0.86,1.12,0.86); berry.position.set(Math.cos(a)*3.55,8.25,Math.sin(a)*3.55);
      const leaf=new THREE.Mesh(new THREE.ConeGeometry(0.58,0.65,5),greenMat);
      leaf.position.copy(berry.position); leaf.position.y+=0.92;
      g.add(berry,leaf);
    }
    g.userData.topping='strawberry';
  } else {
    for(let i=0;i<8;i++){
      const a=i/8*Math.PI*2;
      const berry=new THREE.Mesh(new THREE.SphereGeometry(0.78,10,8),blueMat);
      berry.position.set(Math.cos(a)*3.55,8.15+(i%2)*0.18,Math.sin(a)*3.55);
      g.add(berry);
    }
    const center=new THREE.Mesh(new THREE.SphereGeometry(1.0,10,8),blueMat);
    center.position.y=8.35; g.add(center);
    g.userData.topping='blueberry';
  }
  const candleMat=stdMat(0xaed9ff,{emissive:0xaed9ff,emissiveIntensity:0.18});
  const flameMat=new THREE.MeshBasicMaterial({color:0xffd05a,transparent:true,opacity:0.92});
  const candle=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.34,2.8,8),candleMat);
  const flame=new THREE.Mesh(new THREE.SphereGeometry(0.62,8,6),flameMat);
  candle.position.y=9.55; flame.position.y=11.25; flame.scale.set(0.72,1.25,0.72);
  g.add(candle,flame);
  g.userData.flame=flame;
  return g;
}
const VAL_CAKE_FRESH_HEAL=2;
const VAL_CAKE_PRIME_HEAL=8;
const VAL_CAKE_PRIME_AGE=18;
function valCakeHealAtAge(age){
  const maturity=clamp((Number(age)||0)/VAL_CAKE_PRIME_AGE,0,1);
  return Math.round(VAL_CAKE_FRESH_HEAL+(VAL_CAKE_PRIME_HEAL-VAL_CAKE_FRESH_HEAL)*maturity);
}
function spawnValCake(x,z,opts={}){
  const spot=valDropSpot(x,z,{spread:opts.spread??52,minHero:opts.minHero??36,minOrb:opts.minOrb??30,minCake:opts.minCake??44,minR:opts.minR??20});
  const mesh=buildValCakeMesh();
  mesh.position.set(spot.x,4.0,spot.z);
  sceneAdd(mesh);
  const fx={ kind:'valCake', mesh, x:spot.x, z:spot.z, r:24, pickupR:19, t:0, life:opts.life??42, pickupDelay:opts.pickupDelay??0.65, bobPhase:Math.random()*Math.PI*2 };
  G.effects.push(fx);
  const dx=spot.x-x,dz=spot.z-z;
  const len=Math.max(1,Math.hypot(dx,dz));
  for(const e of G.enemies){
    if(e.dead || e.kind==='shield') continue;
    if(dist2(e.x,e.z,spot.x,spot.z) < (31+e.r)*(31+e.r)){
      e.kbx += dx/len*105;
      e.kbz += dz/len*105;
    }
  }
  burst(spot.x,7,spot.z,0xff9ec6,12,88,0.38,0.24);
  return fx;
}

function activeValCakes(){
  return G.effects.filter(fx=>fx && fx.kind==='valCake' && !fx.dead && (fx.life-fx.t)>0);
}

// Return the nearest player-cake hit along a line segment.
// pad expands the cake for wide projectiles/beams without changing its physical enemy-block radius.
function valCakeSegmentBlock(x0,z0,x1,z1,pad=0){
  const dx=x1-x0,dz=z1-z0;
  const a=dx*dx+dz*dz;
  if(a<0.0001) return null;
  let best=null;
  for(const cake of activeValCakes()){
    const r=Math.max(1,(cake.r||24)+Math.max(0,pad));
    const ox=x0-cake.x,oz=z0-cake.z;
    const b=2*(ox*dx+oz*dz);
    const c=ox*ox+oz*oz-r*r;
    const disc=b*b-4*a*c;
    if(disc<0) continue;
    const s=Math.sqrt(disc);
    let t=(-b-s)/(2*a);
    if(t<0 || t>1){
      const t2=(-b+s)/(2*a);
      if(t2<0 || t2>1) continue;
      t=t2;
    }
    if(!best || t<best.t){
      best={cake,t,x:x0+dx*t,z:z0+dz*t};
    }
  }
  return best;
}

function valCakeBlockFeedback(hit,strong=false){
  const cake=hit?.cake;
  if(!cake) return;
  const now=G.time||0;
  if(now-(cake.lastBlockFx||-99) < (strong?0.16:0.09)) return;
  cake.lastBlockFx=now;
  const x=hit.x??cake.x,z=hit.z??cake.z;
  burst(x,6,z,strong?0xfff0f7:0xffd2e5,strong?7:4,strong?72:48,0.22,0.15);
  if(strong) spawnRadiusRing(cake.x,cake.z,(cake.r||24)+5,0xffb7d8,0.18);
}

function activeRootyThornGuards(){
  return G.summons.filter(s=>s && s.kind==='thornGuard' && s.alive && s.t>0);
}

function rootyThornGuardSegmentBlock(x0,z0,x1,z1,pad=0){
  const dx=x1-x0,dz=z1-z0;
  const a=dx*dx+dz*dz;
  if(a<0.0001) return null;
  let best=null;
  for(const guard of activeRootyThornGuards()){
    const r=Math.max(1,(guard.r||ENEMIES.thornwall.r)+Math.max(0,pad));
    const ox=x0-guard.x,oz=z0-guard.z;
    const b=2*(ox*dx+oz*dz);
    const c=ox*ox+oz*oz-r*r;
    const disc=b*b-4*a*c;
    if(disc<0) continue;
    const root=Math.sqrt(disc);
    let t=(-b-root)/(2*a);
    if(t<0 || t>1){
      const t2=(-b+root)/(2*a);
      if(t2<0 || t2>1) continue;
      t=t2;
    }
    if(!best || t<best.t) best={guard,t,x:x0+dx*t,z:z0+dz*t};
  }
  return best;
}

function rootyThornGuardBlockFeedback(hit,strong=false){
  const guard=hit?.guard;
  if(!guard) return;
  const now=G.time||0;
  if(now-(guard.lastBlockFx||-99)<(strong?0.16:0.09)) return;
  guard.lastBlockFx=now;
  burst(hit.x??guard.x,6,hit.z??guard.z,0x78d765,strong?7:4,strong?72:46,0.22,0.15);
  if(strong) spawnRadiusRing(guard.x,guard.z,(guard.r||10)+5,0xaaf39a,0.18);
}

function nearestFriendlyCoverHit(cakeHit,thornHit){
  if(!cakeHit) return thornHit ? {kind:'thorn',hit:thornHit} : null;
  if(!thornHit) return {kind:'cake',hit:cakeHit};
  return thornHit.t<cakeHit.t ? {kind:'thorn',hit:thornHit} : {kind:'cake',hit:cakeHit};
}

function friendlyCoverFeedback(cover,strong=false){
  if(!cover) return;
  if(cover.kind==='thorn') rootyThornGuardBlockFeedback(cover.hit,strong);
  else valCakeBlockFeedback(cover.hit,strong);
}

function tryCraftValCake(x,z){
  const h=G.hero;
  if(!h?.valBaker) return;
  while((h.valIngredients||0) >= 3){
    h.valIngredients -= 3;
    spawnValCake(x,z,{fromHero:true});
    banner('CAKE READY!');
    floater('🍰',h.x,h.z,'heal');
  }
}
function grantValIngredientDirect(){
  const h=G.hero;
  if(!h?.valBaker) return false;

  // Ring-out equivalent of collecting a physical ingredient: preserve its normal
  // score/gold value, but put it straight into VAL's meter because the real drop
  // would have been unreachable outside the arena.
  h.valIngredients=(h.valIngredients||0)+1;
  G.score += 2;
  G.gold += 1;
  burst(h.x,8,h.z,0xffbe89,7,70,0.5,0.3);

  if((h.valIngredients||0)>=3){
    tryCraftValCake(h.x,h.z);
  }else{
    floater('INGREDIENT +1 · '+(h.valIngredients||0)+'/3',h.x,h.z,'heal');
  }
  return true;
}
function valPanicConvertible(e){
  if(!e || e.dead || e.type==='apexcake' || e.kind==='shield' || e.apexFinalMember || e.kind==='apexhero') return false;
  // Heavy top-tier ordinary minions are not free Cakefy targets. STEEL CRAB is deliberately
  if(e.type==='steelcrab') return false;
  // Hostile summon units count as minions and are eligible for Cakefy rules.
  // and BRIAR WARDEN's thorn guards, but never the Apex/elite summoner itself.
  if(e.kind==='apexwolf' || e.type==='thornwall') return true;
  return !e.boss && !e.brain && !e.elite && e.kind!=='stationary';
}
function removeValPanicTarget(e,{reward=true}={}){
  if(!e || e.dead) return false;
  if(e.shield) removeEnemyShield(e,{burstFx:false,announce:false});
  if(e.type==='briarwarden') clearBriarWalls(e,true);
  if(e.briarLash?.mesh) sceneRemove(e.briarLash.mesh);
  removeHexBombMarker(e);
  if(e.laserSight) sceneRemove(e.laserSight);
  if(e.wraithDrops?.length){ for(const d of e.wraithDrops) clearWraithTell(d); e.wraithDrops=[]; }
  if(e.type==='shielder' && e.parent) e.parent.shield=null;
  e.dead=true; e.mesh.visible=false; sceneRemove(e.mesh);
  if(reward && !e.noReward){ G.kills++; G.score+=1; G.gold+=1; }
  return true;
}
function startValPanic(x,z,opts={}){
  const hostile=!!opts.hostile;
  const source=opts.source||null;
  // Hostile VAL never converts units. Apex Seven VAL uses conjured cakes instead.
  // Player VAL keeps the normal Cakefy rules, including hostile summon targets.
  const all=hostile?[]:G.enemies.filter(valPanicConvertible);
  const targets=(opts.maxTargets&&all.length>opts.maxTargets)
    ? all.sort((a,b)=>dist2(a.x,a.z,x,z)-dist2(b.x,b.z,x,z)).slice(0,opts.maxTargets)
    : all;
  const maxR=Math.hypot(VIEW.visW,VIEW.visH)+70;
  const speed=opts.speed||330;
  G.effects.push({kind:'valPanic',x,z,t:0,life:maxR/speed+0.60,maxR,speed,hostile,source,targets:targets.map(e=>({e,done:false,d:Math.sqrt(dist2(e.x,e.z,x,z))})),ringT:0});
  spawnRadiusRing(x,z,36,hostile?0xff79b5:0xff9cc9,0.32);
  burst(x,9,z,0xffd4e8,18,105,0.48,0.28);
  return targets.length;
}
function spawnValTransformPuff(x,z,hostile=false){
  const grp=new THREE.Group();
  const mats=[];
  const colors=hostile?[0xff8fbd,0xffd6e7,0xffffff]:[0xffa6d0,0xffe0ee,0xffffff];
  for(let i=0;i<6;i++){
    const mat=new THREE.MeshBasicMaterial({color:colors[i%colors.length],transparent:true,opacity:0.90,depthWrite:false});
    mats.push(mat);
    const puff=new THREE.Mesh(new THREE.SphereGeometry(2.7+(i%2)*0.55,8,6),mat);
    const a=i/6*Math.PI*2 + (i%2)*0.22;
    puff.position.set(Math.cos(a)*(2.2+(i%3)*0.65),(i%2)*1.25,Math.sin(a)*(2.2+(i%3)*0.65));
    puff.userData.puffDir={x:Math.cos(a),z:Math.sin(a),lift:0.8+(i%3)*0.35};
    grp.add(puff);
  }
  const coreMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.82,depthWrite:false,blending:THREE.AdditiveBlending});
  mats.push(coreMat);
  const core=new THREE.Mesh(new THREE.SphereGeometry(3.6,9,7),coreMat);
  core.scale.set(1.18,0.82,1.18); grp.add(core);
  grp.position.set(x,6,z);
  sceneAdd(grp);
  G.effects.push({kind:'valPuff',mesh:grp,mats,t:0,life:0.46});
  spawnRadiusRing(x,z,22,hostile?0xff6faa:0xffc0dc,0.30);
  burst(x,8,z,0xffffff,10,92,0.62,0.30);
  burst(x,8,z,hostile?0xff79b5:0xff9cc9,8,78,0.48,0.26);
  floater('PUFF!',x,z,'heal',24);
}

function spawnApexValCake(owner,x=null,z=null,opts={}){
  if(!owner || owner.dead) return null;
  const living=G.enemies.filter(o=>!o.dead&&o.type==='apexcake'&&o.owner===owner).length;
  if(living>=2) return null;
  const h=G.hero;
  const dx=h.x-owner.x,dz=h.z-owner.z,len=Math.max(1,Math.hypot(dx,dz));
  const baseX=x??(owner.x+dx/len*(48+Math.random()*26));
  const baseZ=z??(owner.z+dz/len*(48+Math.random()*26));
  const spot=valDropSpot(baseX,baseZ,{spread:30,minHero:30,minOrb:24,minCake:38,minR:8});
  const mesh=buildValCakeMesh();
  mesh.position.set(spot.x,4.0,spot.z); sceneAdd(mesh);
  const c={type:'apexcake',kind:'stationary',owner,mesh,x:spot.x,z:spot.z,hp:420,maxHp:420,r:24,speed:0,kb:240,kbx:0,kbz:0,slowT:0,slowPct:1,poison:null,burn:null,dead:false,hitCd:0,life:opts.life??20,heal:opts.heal??180,apexCake:true};
  G.enemies.push(c);
  burst(c.x,8,c.z,0xffa8d0,14,95,0.42,0.25);
  spawnRadiusRing(c.x,c.z,30,0xff9cc9,0.34);
  return c;
}

// ---------------- Particles ----------------
function burst(x,y,z,color,n,speed,up=0.5,life=0.5){
  const col = new THREE.Color(color);
  for(let i=0;i<n;i++){
    const p = G.pCursor; G.pCursor=(G.pCursor+1)%(G.pPos.length/3);
    G.pPos[p*3]=x; G.pPos[p*3+1]=y; G.pPos[p*3+2]=z;
    const a=Math.random()*Math.PI*2, b=(Math.random()-0.5)*0.7;
    const sp=(0.4+Math.random())*speed;
    G.pV[p*3]=Math.cos(a)*sp; G.pV[p*3+2]=Math.sin(a)*sp; G.pV[p*3+1]=up*(0.3+Math.random()*0.7)*sp*0.4;
    const f = 0.5+Math.random()*0.5;
    G.pCol[p*3]=col.r*f; G.pCol[p*3+1]=col.g*f; G.pCol[p*3+2]=col.b*f;
    G.pLife[p]=life*(0.5+Math.random()*0.8); G.pAge[p]=0;
  }
}

// turbulent tumbling smoke cloud on death
function smokeBurst(x, y, z, color=0x565c66, n=7){
  const grp=new THREE.Group();
  const matBase=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.6,depthWrite:false});
  const smokeN=isCoarse()?Math.max(2,Math.ceil(n*0.55)):n;
  for(let i=0;i<smokeN;i++){
    const s = 1.2 + Math.random()*1.6;
    const m = new THREE.Mesh(new THREE.SphereGeometry(s, 9, 7), matBase.clone());
    m.userData = {
      dx:(Math.random()*2-1)*3.2, dz:(Math.random()*2-1)*3.2,
      vy: 3+Math.random()*3,
      ph: Math.random()*Math.PI*2, wob: 2.2+Math.random()*3,
      grow: 1.4+Math.random()*1.0, rot: (Math.random()-0.5)*4,
      s, life: 0.5+Math.random()*0.3
    };
    m.position.set((Math.random()*2-1)*0.7, (Math.random()-0.5)*1.5, (Math.random()*2-1)*0.7);
    grp.add(m);
  }
  grp.position.set(x, y, z);
  sceneAdd(grp);
  G.effects.push({ kind:'smoke', mesh:grp, t:0, life:0.85 });
}

function eggplosion(x, z){
  AUD.boom();
  burst(x, 12, z, 0xffc36b, 22, 140, 0.9, 0.6);
  burst(x, 12, z, 0xfff3d6, 12, 95, 0.6, 0.4);
  const flash = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), new THREE.MeshBasicMaterial({ color:0xffd27a, transparent:true, opacity:0.85 }));
  flash.position.set(x, 13, z);
  sceneAdd(flash);
  G.effects.push({ kind:'flash', mesh:flash, t:0, life:0.35, max:52 });
  for(const tgt of G.enemies){
    if(tgt.dead || tgt===undefined) continue;
    if(dist2(tgt.x,tgt.z,x,z) < (52+tgt.r)*(52+tgt.r)){
      damageEnemy(tgt,50,{show:true,quiet:true});
      const dx=tgt.x-x, dz=tgt.z-z; const l=Math.max(0.01,Math.hypot(dx,dz));
      tgt.kbx += dx/l*130; tgt.kbz += dz/l*130;
    }
  }
}

function updateParticles(dt){
  if(isCoarse()){
    G._particleAccum=(G._particleAccum||0)+dt;
    if(G._particleAccum<1/30) return;
    dt=Math.min(0.066,G._particleAccum);
    G._particleAccum=0;
  }
  const n = G.pPos.length/3;
  for(let i=0;i<n;i++){
    if(G.pLife[i]<0) continue;
    G.pAge[i]+=dt;
    if(G.pAge[i]>=G.pLife[i]){ G.pLife[i]=-1; G.pPos[i*3+1]=-50; continue; }
    G.pPos[i*3]+=G.pV[i*3]*dt; G.pPos[i*3+1]+=G.pV[i*3+1]*dt; G.pPos[i*3+2]+=G.pV[i*3+2]*dt;
    G.pV[i*3+1]-=6*dt;
  }
  G.parts.geometry.attributes.position.needsUpdate = true;
  G.parts.material.opacity = 0.9;
}

// ---------------- Floating text ----------------
function floater(text, x, z, cls='', worldY=20){
  const el = document.createElement('div');
  el.className = 'floater '+cls;
  el.textContent = text;
  $('#floaters').appendChild(el);
  const p = worldToScreen(new THREE.Vector3(x, worldY, z));
  el.style.left = p.x+'px'; el.style.top = p.y+'px';
  setTimeout(()=>el.remove(), 950);
}
function banner(text){
  const el = document.createElement('div');
  el.className = 'floater banner';
  el.textContent = text;
  $('#floaters').appendChild(el);
  setTimeout(()=>el.remove(), 2300);
}
function clearStartNotices(){
  const host=$('#startNotices');
  if(host) host.replaceChildren();
}
function startNotice(text,{tone='info',life=8000}={}){
  const host=$('#startNotices');
  if(!host) return;
  const el=document.createElement('div');
  el.className='startNotice '+tone;
  el.textContent=text;
  const ms=Math.max(2800,Number(life)||8000);
  el.style.setProperty('--start-notice-life',ms+'ms');
  host.appendChild(el);
  while(host.children.length>4) host.firstElementChild?.remove();
  setTimeout(()=>el.remove(),ms+120);
}
function worldToScreen(v){
  const p = v.clone().project(G.camera);
  return { x:(p.x*0.5+0.5)*innerWidth, y:(-p.y*0.5+0.5)*innerHeight };
}

// ---------------- Combat ----------------
// PAYNE / Rager: percentage thresholds keep the comeback curve stable when Max HP changes.
// The curve starts early and stays controlled; a bunny should not need near-death HP to function.
function rageFlat(h){
  const maxHp=Math.max(1,Number(h.maxHp)||1);
  const ratio=clamp((Number(h.hp)||0)/maxHp,0,1);
  if(ratio < 0.15) return 14;
  if(ratio < 0.30) return 10;
  if(ratio < 0.50) return 6;
  if(ratio < 0.75) return 3;
  return 0;
}
function computeBulletDamage(noStationary){
  const h = G.hero;
  let d = G.gun.dmg * h.mods.dmg + h.flatDmg;
  // damage multipliers (they're separate terms in its bullet-damage sum)
  if(h.xpbuff) d += G.exp/2;
  if(h.rager) d += rageFlat(h);
  if(h.armorKing) d += h.shield;
  const moving = G.heroMoving;
  // noStationary: orig explode/bone bullets deal gun's totalbasedamage, which has no
  // stationary term — pass true when matching those
  if(!noStationary && !moving){
    d += h.mods.stationary;
    d *= (1 + h.mods.stationaryMult);
  }
  if((h.foxFocusT||0) > 0) d *= 1.25;
  return Math.max(1, d);
}

// A ricochet can arrive from any direction, so a bounced shell's travel vector says nothing
// about which way the crowd should move: a shell that has come off a wall is usually heading
// back toward the hero, and shoving along that vector dragged enemies onto the player.
// Any shove from a bounced projectile that would push a target closer to the hero is
// therefore replaced with a straight outward push. Straight shots, hero supers and the
// intentional pull effects (Gravity Maul / thrower style) never go through this.
function outwardFromHero(e){
  if(!G.hero) return null;
  const dx=e.x-G.hero.x, dz=e.z-G.hero.z, len=Math.hypot(dx,dz);
  if(len<0.5) return null;
  return { x:dx/len, z:dz/len };
}
function shoveAwayFromHero(e, dirx, dirz){
  const out=outwardFromHero(e);
  if(!out) return { x:dirx, z:dirz };
  if(dirx*out.x + dirz*out.z >= 0) return { x:dirx, z:dirz };
  return out;
}

function damageEnemy(e, dmg, opts={}){
  if(e.dead || dmg<=0) return;
  let eliteShieldSnapshot=null;
  if(e.shieldRegen) e.shieldRegen.delay=ENEMY_SHIELD_REGEN_DELAY;

  // A visible enemy shield is a finite extra HP layer. Elite overhead HP/shield status is
  // intentionally transient, but the physical shield bubble remains visible while active.
  if(e.shield && !e.shield.dead && !opts.ignoreShield){
    const shield=e.shield;
    const absorbed=Math.min(shield.hp,dmg);
    shield.hp-=absorbed;
    dmg-=absorbed;
    eliteShieldSnapshot={shieldHp:Math.max(0,shield.hp),shieldMax:shield.maxHp};
    redrawEnemyShieldLabel(shield);
    updateEnemyShieldVisual(e,0);
    burst(e.x,Math.max(8,e.r*0.7),e.z,0x6fa8ff,3,45,0.3,0.25);
    if(opts.show && (shield.floatCd||0)<=0){
      floater('SHIELD −'+Math.max(1,Math.round(absorbed)),e.x,e.z,'shield');
      shield.floatCd=0.12;
    }
    if(shield.hp<=0) removeEnemyShield(e,{burstFx:true,announce:true});
    if(dmg<=0){ flashEliteHitStatus(e,eliteShieldSnapshot||{}); return; }
  }

  // Compatibility path for standalone shielder debug spawns.
  if(e.type==='shielder'){
    e.hp-=dmg;
    if(opts.show) floater(Math.round(dmg),e.x,e.z,'shield');
    if(e.hp<=0 && !e.dead){ e.dead=true; e.mesh.visible=false; burst(e.x,12,e.z,0x6fa8ff,26,140,1,0.6); if(e.parent) e.parent.shield=null; }
    return;
  }

  if(e.type==='briarwarden' && briarLiveWalls(e).length){
    dmg*=0.38;
    if((e.briarGuardNoticeT||0)<=G.time){ e.briarGuardNoticeT=G.time+0.55; floater('THORN GUARD',e.x,e.z,'shield'); }
  }
  // APEX SEVEN roster phases now shift difficulty toward aggression instead of sponge DR.
  // Phase 1 (7-6): 0% · Phase 2 (5-4): 5% · Phase 3 (3): 8% · Last Stand (2): 10% · Final Apex (1): 12%.
  if(e.apexFinalMember && G.apexSevenActive){
    const alive=G.enemies.reduce((n,o)=>n+(!o.dead&&o.apexFinalMember?1:0),0);
    const resolveDr=apexSevenResolveDr(alive);
    if(resolveDr>0) dmg*=1-resolveDr;
  }
  e.hp -= dmg;
  e.lastHitDmg = dmg;
  flashEliteHitStatus(e,eliteShieldSnapshot||{});
  if(opts.show) floater(Math.round(dmg), e.x, e.z, opts.cls||(opts.crit?'crit':''));
  if(!opts.quiet) burst(e.x, 10, e.z, e.boss?0xff8a8a:0xb32222, e.boss?10:5, 90, 0.5, 0.35);

  // knockback
  const kb = opts.kb || 0;
  if(kb>0){
    const m = kb * enemyKnockResponse(e) / (1 + e.kb*0.03);
    let kdx=opts.dirx||0, kdz=opts.dirz||0;
    if(opts.awayFromHero){ const r=shoveAwayFromHero(e,kdx,kdz); kdx=r.x; kdz=r.z; }
    e.kbx += kdx*m; e.kbz += kdz*m;
  }
  // slow bullets perk
  if(opts.slow || G.hero.slowBullets){ e.slowT = Math.max(e.slowT, opts.slowDur ?? 1.6); }
  if(opts.poison) applyPoison(e,opts.poison,3);
  if(opts.burn) applyBurn(e,opts.burn);
  if(G.hero.lordAmmo && Math.random()<0.10) G.hero.ammo = Math.min(G.hero.maxAmmo, G.hero.ammo+1);

  if(e.hp<=0){
    if(e.noReward){ burst(e.x,5,e.z,0xff8a42,9,82,0.34,0.20); removeEnemyNoReward(e); }
    else killEnemy(e,{...(opts.killOpts||{})});
  }
}

function killEnemy(e,opts={}){
  if(e.dead) return;

  // Leaving the arena is normal and silent: living enemies simply walk back.
  // Only death outside gets edge feedback:
  //   offMapDamage = ordinary HP death while outside;
  //   ringOut      = position kill beyond the hard ring-out margin.
  // Death FX are clamped to the visible edge; physical drops fly back inside.
  const outsideArena=
    e.x < -VIEW.visW || e.x > VIEW.visW ||
    e.z < -VIEW.visH || e.z > VIEW.visH;
  if(outsideArena && !opts.ringOut && !opts.offMapDamage){
    opts={...opts,offMapDamage:true,returnReward:true,
      effectX:clamp(e.x,-VIEW.visW+8,VIEW.visW-8),
      effectZ:clamp(e.z,-VIEW.visH+8,VIEW.visH-8)};
  }

  if(G.testMode&&e.testDummy){
    e.dead=true; e.hp=0; e.mesh.visible=false; burst(e.x,10,e.z,0x55e3ff,16,95,0.42,0.24); floater('DUMMY KO',e.x,e.z,'crit');
    setTimeout(()=>reviveTestDummy(e),850);
    return;
  }
  e.dead = true;
  if(e.apexHpBar) removeApexWorldHpBar(e);
  if(e.bossWorldHpBar) removeBossWorldHpBar(e);
  if(e.eliteHitStatus) removeEliteHitStatus(e);
  if(e.apexFinalMember){
    floater(APEX_SEVEN_FINAL[e.apexHeroId]?.label+' DOWN',e.x,e.z,'crit');
    const remain=G.enemies.filter(o=>o!==e && !o.dead && o.apexFinalMember).length;
    if(remain===0){
      G.apexSevenActive=false; G.apexSevenDefeated=true; G.finalBossDefeated=true; G.finalBossActive=false;
      G.score+=6000*G.mult; G.gold+=6000;
      banner('⚔ APEX SEVEN DEFEATED');
    }else{
      announceApexSevenState(remain);
    }
  }
  if(e.shield) removeEnemyShield(e,{burstFx:false,announce:false});
  if(e.type==='briarwarden') clearBriarWalls(e,true);
  if(e.briarLash?.mesh) sceneRemove(e.briarLash.mesh);
  removeHexBombMarker(e);
  if(e.laserSight) sceneRemove(e.laserSight);
  if(e.wraithDrops?.length){ for(const d of e.wraithDrops) clearWraithTell(d); e.wraithDrops=[]; }
  if(e.type==='shielder' && e.parent) e.parent.shield = null;
  e.mesh.visible = false;
  const x=opts.effectX??e.x, z=opts.effectZ??e.z;
  const rewardPath=opts.returnReward ? arenaRewardReturnPath(e.x,e.z) : null;

  if(opts.ringOut){
    // True position kill: loud, catchy edge confirmation.
    spawnRadiusRing(x,z,30,0xffd166,0.34);
    spawnRadiusRing(x,z,44,0xff8a3a,0.24);
    burst(x,7,z,0xffd166,14,116,0.34,0.20);
    floater('OUT!',x,z,'crit',25);
  }else if(opts.offMapDamage){
    // Enemy died while already outside. No verbose label: one obvious red death mark is enough.
    spawnRadiusRing(x,z,22,0xd92f2f,0.22);
    burst(x,7,z,0xd92f2f,9,82,0.26,0.17);
    floater('❌',x,z,'',23);
  }

  G.kills++;
  if(e.brain||e.boss) AUD.boom(); else AUD.kill();

  if(e.brain || e.boss){
    // Elite/boss death gets a strong visual, but the message names what actually died.
    burst(x, 14, z, 0xff8a3a, 40, 160, 1.2, 0.7);
    burst(x, 14, z, 0xffffff, 18, 100, 1, 0.4);
    smokeBurst(x, 6, z, 0x3c3230, 10);
    G.shake = Math.max(G.shake, 0.7);
    banner(e.type==='bahamut' ? 'BAHAMUT DEFEATED' : (e.boss ? 'BOSS DOWN' : (e.type==='absorber' ? 'ABSORBER DOWN' : (e.type==='laserdude' ? 'LASER ELITE DOWN' : (e.type==='briarwarden' ? 'BRIAR WARDEN DOWN' : 'ELITE DOWN')))));
    if(e.type==='bahamut'){ G.finalBossDefeated=true; G.finalBossActive=false; G.score+=5000*G.mult; G.gold+=5000; }
    if(e.boss){
      // boss death shockwave: every enemy within 100px of the boss is shoved away from the hero (orig polar force 250)
      const h = G.hero;
      for(const o of G.enemies){
        if(o.dead || o===e) continue;
        if(dist2(o.x, o.z, x, z) < 100*100){
          const dx=o.x-h.x, dz=o.z-h.z; const len=Math.max(0.01, Math.hypot(dx,dz));
          o.kbx += dx/len*250; o.kbz += dz/len*250;
        }
      }
    }
  }
  else {
    burst(x, 10, z, 0xb32222, 9, 90, 0.6, 0.4);
    smokeBurst(x, 5, z, 0x3f454e, 8);
  }

  // Explode perk: any killed enemy (incl. bosses/brain) normally gets the original 10%
  // corpse-proc roll. One successful proc still fires the complete 12-projectile explosive ring
  // at full damage, so fast early/mid-game chains remain just as strong as before.
  //
  // Dense late-game chains use a burst/truce guard measured in SUCCESSFUL EXPLODING CORPSES,
  // not projectile detonations and not chain generations. Once the burst cap is reached, corpse
  // necromancy is temporarily disabled: deaths during the truce do not even roll the 10% proc.
  // Existing Explode bullets continue normally, which lets the current cascade finish with a
  // natural tail instead of being cut off mid-effect. A quiet gap resets the burst counter.
  if(G.hero.explodeDeath && deathExplosionCanRoll() && Math.random()<DEATH_EXPLOSION_CHANCE){
    recordDeathExplosionProc();
    const dmg = computeBulletDamage(true);
    const bones = G.hero.explodeBones;
    const base = Math.random()*Math.PI*2;
    const arc = e.boss ? 90 : 360;
    for(let i=0;i<12;i++){
      const a = base + (arc===360 ? i/12 : i/11*arc/360)*Math.PI*2;
      fireBullet(x, z, Math.cos(a), Math.sin(a), dmg,
        bones
          ? {bone:true, boneProcChance:PERK_BONE_DOG_PROC_CHANCE, color:0xe8e0d0, r:1.8, speed:250, life:6, kb:0, noCrit:true, explode:dmg, noDirect:true}
          : {color:0xffb347, speed:300, life:6, kb:0, noCrit:true, explode:dmg, noDirect:true});
    }
  }

  // egger detonates on death — turbulent smoke + eggplosion AoE
  if(e.type==='egger') eggplosion(x, z);

  // Normal kills leave an XP orb. Off-map/ring-out kills also leave a real orb:
  // it appears at the visible edge and flies back inside before normal pickup/magnet rules.
  if(opts.returnReward && rewardPath){
    spawnOrb(rewardPath.sx,rewardPath.sz,{
      life:18,pickupDelay:0.44,
      returnT:0.42,returnX:rewardPath.tx,returnZ:rewardPath.tz
    });
  }else if(opts.directXp){
    addExp(1);
    floater('+1 XP',x,z,'crit');
  }else{
    spawnOrb(x, z);
  }
  // [+] bonus pickup, on top of the ordinary orb. Tiered by what died: only the fat bodies,
  // champions and bosses can drop one at all (see PLUS_DROP_TIERS).
  rollPlusDrops(e, x, z, (opts.returnReward && rewardPath) ? rewardPath : null);
  if(G.hero?.valBaker){
    const dropChance=e.boss?1.0:(e.elite||e.brain?0.42:0.12);
    if(Math.random()<dropChance){
      if(opts.returnReward && rewardPath){
        spawnValIngredient(rewardPath.sx,rewardPath.sz,{
          fixedSpot:true,life:29,pickupDelay:0.50,
          returnT:0.46,returnX:rewardPath.tx,returnZ:rewardPath.tz
        });
      }else{
        spawnValIngredient(x,z,{spread:e.boss?56:42,minR:e.boss?16:10,pickupDelay:0.35});
      }
    }
  }
  if(e.elite){ G.gold += 20; }
  // orig enragedammo: on ANY kill, 10% chance (roll 1-10 == 4) to gain 2 ammo — no HP gate
  if(G.hero.enragedammo && Math.random()<0.10) G.hero.ammo = Math.min(G.hero.maxAmmo, G.hero.ammo+2);

  sceneRemove(e.mesh);
}


function removeEnemyNoReward(e){
  if(!e || e.dead) return;
  e.dead=true;
  if(e.apexHpBar) removeApexWorldHpBar(e);
  if(e.bossWorldHpBar) removeBossWorldHpBar(e);
  if(e.eliteHitStatus) removeEliteHitStatus(e);
  if(e.shield) removeEnemyShield(e,{burstFx:false,announce:false});
  removeHexBombMarker(e);
  if(e.laserSight) sceneRemove(e.laserSight);
  e.mesh.visible=false;
  sceneRemove(e.mesh);
}

function explodeDamage(x,z,r,dmg,color,opts={}){
  AUD.boom();
  burst(x, 10, z, color??0xffb347, 20, 150, 0.8, 0.5);
  const flash = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshBasicMaterial({ color:0xffd27a, transparent:true, opacity:0.85 }));
  flash.position.set(x, 12, z);
  sceneAdd(flash);
  G.effects.push({ kind:'flash', mesh:flash, t:0, life:0.25, max:r });

  const innerR=clamp(Number(opts.innerR??r)||r,0,r);
  const falloffPower=Math.max(0.2,Number(opts.falloffPower)||1);
  const useFalloff=innerR<r-0.001;

  for(const e of G.enemies){
    if(e.dead) continue;
    const dx=e.x-x,dz=e.z-z,len=Math.max(0.01,Math.hypot(dx,dz));
    if(len >= r+e.r) continue;

    // Falloff uses distance from the blast to the target's near edge, so large bodies are
    // treated fairly. Default explosions keep legacy full damage because innerR===r.
    const surfaceDist=Math.max(0,len-(e.r||0));
    const t=useFalloff ? clamp((surfaceDist-innerR)/Math.max(0.001,r-innerR),0,1) : 0;
    const falloff=useFalloff ? Math.pow(1-t,falloffPower) : 1;
    if(falloff<=0) continue;

    damageEnemy(e,dmg*falloff,{show:true,quiet:true});
    const baseKb=e.boss ? 42 : ((e.elite||e.brain) ? 86 : 160);
    const blastKb=baseKb*falloff;
    let px=dx/len, pz=dz/len;
    if(opts.awayFromHero){ const r=shoveAwayFromHero(e,px,pz); px=r.x; pz=r.z; }
    e.kbx += px*blastKb;
    e.kbz += pz*blastKb;
  }
}

// OP arsenal booms: explode with the bullet's own blast radius, then spawn cluster minis.
function bulletBoom(b){
  if(!b.explode) return;
  const col=b.explodeColor??0xff8a3a;
  const blastR=b.blastR||36;
  const innerR=b.blastInnerR||blastR;
  explodeDamage(b.x,b.z,blastR,b.explode,col,{
    innerR,
    falloffPower:1,
    awayFromHero: !!b.bounced,
  });
  if(b.rocketFx){
    // The rocket reads as a siege detonation without increasing its full-power core.
    spawnRadiusRing(b.x,b.z,innerR,0xffd166,0.28);
    spawnRadiusRing(b.x,b.z,blastR,col,0.46);
    burst(b.x,8,b.z,0xffd166,18,178,0.52,0.34);
    burst(b.x,6,b.z,0xff6a24,14,138,0.42,0.30);
    G.shake=Math.max(G.shake,0.42);
  }else if(b.explodeFx){
    spawnRadiusRing(b.x,b.z,blastR,col,0.22);
    burst(b.x,5,b.z,col,9,92,0.30,0.20);
  }
  if(b.cluster) spawnCluster(b);
}
function spawnCluster(b){
  for(let i=0;i<(b.cluster||0);i++){
    const a = Math.random()*Math.PI*2;
    const dmg = Math.max(1, Math.round(b.dmg*(b.clusterScale??0.6)*(b.clusterDamageScale??1)));
    const blastR = 26*(b.clusterRadiusScale??1);
    // Mini-grenades are delayed lobbed hazards, not instant radial bullets. Multi-shot keeps
    fireBullet(b.x, b.z, Math.sin(a), Math.cos(a), dmg, {
      color:0x7aa85f, speed:130+Math.random()*55, life:1.35, kb:34, explode:dmg, blastR,
      expireExplode:true, noCrit:true, noDirect:true, vy:55+Math.random()*35, r:1.8,
    });
  }
}

// Lightweight grey smoke bead used by OP missiles/rockets. One mesh per bead keeps the
// trail readable without using the much heavier multi-sphere death-smoke effect.
function spawnProjectileSmokeDot(x,y,z,scale=1){
  const r = (1.4 + Math.random()*1.1)*scale;
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(r, 6, 5),
    new THREE.MeshBasicMaterial({ color:0x737981, transparent:true, opacity:0.46, depthWrite:false })
  );
  mesh.position.set(x+(Math.random()-0.5)*2.0, y+(Math.random()-0.5)*1.2, z+(Math.random()-0.5)*2.0);
  sceneAdd(mesh);
  G.effects.push({
    kind:'smokedot', mesh, t:0, life:0.52+Math.random()*0.20,
    driftX:(Math.random()-0.5)*5, driftZ:(Math.random()-0.5)*5, rise:2.2+Math.random()*2.0,
    grow:1.5+Math.random()*0.6,
  });
}

// INFERNO contact flame: keep the target visibly burning for as long as the stream
// keeps touching it, then leave a 0.6s visual aftermath. Damage still comes only from
// the existing burn state; this effect is feedback, not a second damage source.
function touchInfernoIgniteFlame(target,scale=1){
  if(!target) return;
  const live=target._infernoFlameFx;
  if(live && !live.dead){
    live.afterT=0.60;
    live.target=target;
    return;
  }
  const grp=new THREE.Group();
  const outerMat=new THREE.MeshBasicMaterial({color:0xff6a1f,transparent:true,opacity:0.88,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending});
  const innerMat=new THREE.MeshBasicMaterial({color:0xffdc72,transparent:true,opacity:0.92,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending});
  const outer=new THREE.Mesh(new THREE.ConeGeometry(2.7,7.8,7),outerMat);
  const inner=new THREE.Mesh(new THREE.ConeGeometry(1.35,5.6,7),innerMat);
  outer.position.y=4.0; inner.position.y=3.5; inner.position.x=0.45;
  outer.rotation.z=(Math.random()-0.5)*0.20; inner.rotation.z=(Math.random()-0.5)*0.28;
  grp.add(outer,inner);
  grp.position.set(target.x,Math.max(10,(target.r||10)*1.15+5),target.z);
  grp.scale.setScalar(clamp(scale,0.8,1.8));
  sceneAdd(grp);
  const fx={kind:'igniteflame',mesh:grp,mats:[outerMat,innerMat],t:0,afterT:0.60,target,dead:false};
  target._infernoFlameFx=fx;
  G.effects.push(fx);
}

function healHero(n){
  if(!G.hero) return;
  const h = G.hero;
  const before = h.hp;
  h.hp = Math.min(h.maxHp, h.hp + n);
  const gained = Math.max(0, h.hp-before);
  if(gained>0){
    floater('+'+Math.max(1,Math.round(gained)), h.x, h.z, 'heal');
    h._hudHpTrailRatio = Math.max(h._hudHpTrailRatio??0, h.hp/h.maxHp);
  }
}

function pulseHpHud(){
  const p = $('#statsPanel');
  if(!p) return;
  p.classList.remove('damagePulse');
  // Force animation restart without creating timers/listeners.
  void p.offsetWidth;
  p.classList.add('damagePulse');
}

// ---------------- Hero damage ----------------
function aegisShieldCount(){
  const h=G.hero;
  return clamp(1+(h?.mods?.proj||0),1,3);
}

function aegisGuardArcDeg(){
  const gun=G.gun;
  if(!gun?.special?.includes('shieldbash')) return 0;
  return Math.min(gun.maxGuardArc||260,(gun.guardArc||150)+(aegisShieldCount()-1)*(gun.guardArcPerExtra||55));
}

function aegisGuardCoversSource(sourceX,sourceZ){
  const h=G.hero, gun=G.gun;
  if(!h || !gun?.special?.includes('shieldbash') || h.reloading || h.ammo<=0) return false;
  const fx=Number(sourceX)-h.x, fz=Number(sourceZ)-h.z;
  const len=Math.hypot(fx,fz);
  if(!Number.isFinite(len) || len<0.001) return false;
  const half=aegisGuardArcDeg()*Math.PI/360;
  return (fx/len)*G.aimDir.x+(fz/len)*G.aimDir.z >= Math.cos(half);
}

function syncAegisVisuals(){
  const h=G.hero, anchor=h?.mesh?.userData?.gun;
  const panels=anchor?.userData?.aegisPanels;
  if(panels && panels.length>=3){
    const [center,left,right]=panels;
    const count=aegisShieldCount();
    center.visible=count!==2;
    left.visible=count>=2;
    right.visible=count>=2;
    center.position.set(0,0,0); center.rotation.set(0,0,0); center.scale.setScalar(count===3?0.92:1);
    const sideX=count===2?3.5:5.0;
    const sideYaw=(count===2?18:30)*Math.PI/180;
    const sideScale=count===2?0.96:0.88;
    left.position.set(-sideX,0,-0.5); left.rotation.set(0,-sideYaw,0); left.scale.setScalar(sideScale);
    right.position.set(sideX,0,-0.5); right.rotation.set(0,sideYaw,0); right.scale.setScalar(sideScale);
  }

  const guard=h?.mesh?.userData?.aegisGuard;
  if(!guard) return;
  const arcDeg=aegisGuardArcDeg();
  if(guard.arcDeg===arcDeg) return;
  guard.arcDeg=arcDeg;
  const arc=arcDeg*Math.PI/180;
  const half=arc/2;
  const start=-Math.PI/2-half; // RingGeometry is XY before we lay it onto XZ; local +Z is -PI/2.
  const replaceGeo=(mesh,inner,outer)=>{
    const old=mesh.geometry;
    mesh.geometry=new THREE.RingGeometry(inner,outer,72,1,start,arc);
    old?.dispose?.();
  };
  replaceGeo(guard.fill,7,24);
  replaceGeo(guard.edge,22.8,24.0);
  // AEGIS displays one breathing protection arc; cached fill/spokes stay hidden.
  
  guard.fill.visible=false;
  guard.left.line.visible=false;
  guard.right.line.visible=false;
  guard.left.root.rotation.y=half;
  guard.right.root.rotation.y=-half;
}

function updateAegisGuardVisual(dt){
  const h=G.hero, gun=G.gun, guard=h?.mesh?.userData?.aegisGuard;
  if(!guard) return;
  const equipped=!!gun?.special?.includes('shieldbash');
  guard.group.visible=equipped;
  if(!equipped) return;
  syncAegisVisuals();

  // Hero bob should never lift the protection indicator off the floor.
  guard.group.position.y=-h.mesh.position.y+0.20;
  const active=!h.reloading && h.ammo>0;
  h.aegisFlashT=Math.max(0,(h.aegisFlashT||0)-dt);
  const flash=h.aegisFlashT>0 ? h.aegisFlashT/0.18 : 0;
  const pulse=0.5+0.5*Math.sin(G.time*4.6);
  guard.fill.material.opacity=0;
  guard.left.line.material.opacity=0;
  guard.right.line.material.opacity=0;
  guard.edge.material.opacity=active ? 0.18+pulse*0.14+flash*0.22 : 0.055;
}

function spawnAegisReflectedBullet(enemyBullet,dx,dz,dmg){
  if(!enemyBullet?.mesh) return;
  // Clone at the exact contact position so the incoming projectile appears to reverse
  // continuously throughout the reflected shot.
  const mesh=enemyBullet.mesh.clone();
  if(enemyBullet.mesh.material){
    mesh.material=enemyBullet.mesh.material.clone();
    if(mesh.material.color) mesh.material.color.setHex(0xb9f2ff);
  }
  mesh.position.copy(enemyBullet.mesh.position);
  sceneAdd(mesh);
  const speed=Math.max(520,(enemyBullet.speed||130)*2.8);
  if(enemyBullet.laser) mesh.lookAt(enemyBullet.x+dx*10,0,enemyBullet.z+dz*10);
  G.bullets.push({
    mesh,x:enemyBullet.x,z:enemyBullet.z,dx,dz,speed,dmg,life:1.25,
    pierce:0,bounce:0,poison:0,slow:false,explode:0,bone:false,spike:false,kb:95,
    homing:false,vy:0,y:enemyBullet.mesh.position.y||3,blastR:0,cluster:0,clusterScale:0,
    expireExplode:false,trailSmoke:false,smokeEvery:0.1,smokeScale:1,smokeT:0,
    noCrit:true,noDirect:false,hit:new Set(),dead:false,color:0xb9f2ff,
  });
}

function updateAegisAutoPush(dt){
  const h=G.hero, gun=G.gun;
  if(!h || !gun?.special?.includes('shieldbash') || h.reloading || h.ammo<=0){
    if(h) h.aegisAutoT=0;
    return;
  }
  h.aegisAutoT=(h.aegisAutoT||0)+trainingTimerDt(dt);
  const every=gun.autoPushEvery||1.40;
  if(h.aegisAutoT<every) return;
  h.aegisAutoT%=every;

  const R=gun.autoPushR||56;
  const half=aegisGuardArcDeg()*Math.PI/360;
  const coneDot=Math.cos(half);
  let best=null,bestD=Infinity,bestUx=0,bestUz=0;

  // Automatic guard shove is intentionally single-target.
  // Pick the nearest valid threat inside the actual guard arc.
  for(const e of G.enemies){
    if(e.dead || e.kind==='shield') continue;
    // Skip targets within King's Paw's fresh launch window.
    if(G.char?.id==='mane' && G.time-(e._manePawAt??-99)<0.65) continue;

    const vx=e.x-h.x, vz=e.z-h.z, d=Math.hypot(vx,vz);
    if(d<0.001 || Math.max(0,d-e.r)>R) continue;
    const ux=vx/d, uz=vz/d;
    if(ux*G.aimDir.x+uz*G.aimDir.z<coneDot) continue;
    if(d<bestD){
      best=e; bestD=d; bestUx=ux; bestUz=uz;
    }
  }

  if(!best) return;

  const classScale=best.type==='bahamut'?0.18:(best.apexBoss?enemyKnockResponse(best)*0.72:(best.boss?0.20:((best.elite||best.brain)?0.40:1)));
  const nearScale=0.62+0.28*clamp(1-bestD/R,0,1);
  const impulse=((gun.autoPushKb||95)*h.mods.kb*nearScale*classScale)/(1+(best.kb||0)*0.03);

  best.kbx+=bestUx*impulse;
  best.kbz+=bestUz*impulse;
  best.knockoutSource='AEGIS';
  best._aegisBumpAt=G.time;

  spawnRadiusRing(best.x,best.z,Math.max(10,Math.min(18,best.r+6)),0xb9f2ff,0.12);
  burst(best.x,7,best.z,0x74d9ff,4,54,0.20,0.14);

  h.aegisFlashT=Math.max(h.aegisFlashT||0,0.10);
  G.shake=Math.max(G.shake,0.045);
}

function aegisTryBlock(opts={}){
  const h=G.hero, gun=G.gun;
  if(!h || !gun?.special?.includes('shieldbash') || h.reloading || h.ammo<=0) return false;
  let fx=Number(opts.fromX), fz=Number(opts.fromZ);
  if(!Number.isFinite(fx) || !Number.isFinite(fz)){
    const sx=Number(opts.sourceX), sz=Number(opts.sourceZ);
    if(!Number.isFinite(sx) || !Number.isFinite(sz)) return false;
    fx=sx-h.x; fz=sz-h.z;
  }
  const len=Math.hypot(fx,fz);
  if(len<0.001) return false;
  fx/=len; fz/=len;
  const half=aegisGuardArcDeg()*Math.PI/360;
  if(fx*G.aimDir.x+fz*G.aimDir.z < Math.cos(half)) return false;
  h.ammo=Math.max(0,h.ammo-1);
  floater(opts.projectile?'↩ REFLECT':'BLOCK!',h.x+fx*10,h.z+fz*10,'shield');
  h.aegisFlashT=0.18;
  burst(h.x+fx*12,9,h.z+fz*12,0x74d9ff,7,70,0.26,0.20);
  if(opts.projectile){
    const reflectedDmg=(gun.reflectDmg||22)*h.mods.dmg;
    if(opts.laserBeam&&opts.sourceEnemy&&!opts.sourceEnemy.dead){
      // Continuous beams cannot physically reverse as a single projectile. Bounce a short
      // cyan counter-beam back into the owner once per guarded beam hit instead.
      spawnDragonBeamFx(h.x,h.z,opts.sourceEnemy.x,opts.sourceEnemy.z,0xb9f2ff,2.2,0.15);
      damageEnemy(opts.sourceEnemy,reflectedDmg,{show:true,quiet:true});
      floater('↩ LASER',opts.sourceEnemy.x,opts.sourceEnemy.z,'shield');
    } else if(opts.wraithShard&&opts.enemyBullet) spawnReflectedWraithShard(opts.enemyBullet,reflectedDmg,'↩ CONE');
    else if(opts.enemyBullet) spawnAegisReflectedBullet(opts.enemyBullet,fx,fz,reflectedDmg);
    else fireBullet(h.x+fx*10,h.z+fz*10,fx,fz,reflectedDmg,{color:0xb9f2ff,speed:720,life:1.15,kb:85,noCrit:true,r:2.6});
  }
  if(h.ammo<=0) startReload();
  return true;
}

// PHASE RUN (BLINK super). A 3s run, phased for all of it (PHASE_RUN_PHASE_DURATION ==
// PHASE_RUN_DURATION today), plus a fire-rate bonus for the same window. While phased the hero is intangible: enemy bodies, contact
// damage and physical obstacles (Thorn Guards, hostile cakes) pass straight through, and
// so do discrete shots. Area attacks are the deliberate exception - anything that fills a
// region of space (flames, lasers, beams, shockwaves, zone hazards like a future poison
// pool) tags its damageHero call with `area:true` and lands normally. Keep that tag at the
// call site whenever a new area attack is added.
function heroPhasing(h){
  h = h || G.hero;
  // Driven by blinkPhaseT, NOT blinkRunT: the phase window is its own timer (today it equals
  // the run length, but they are separate knobs on purpose).
  return !!h && !h.dead && (h.blinkPhaseT||0) > 0;
}

// PHASE RUN's fire-rate bonus: ×(1+PHASE_RUN_FIRE_RATE_BONUS) for the whole run, applied as a
// fire-INTERVAL divisor at the single cadence gate (tryFire). Deliberately a run helper and
// not a `h.mods.fire` mutation, so it can never leak past the run or stack with itself.
function phaseRunFireMul(h){
  h = h || G.hero;
  return (h && !h.dead && (h.blinkRunT||0) > 0) ? (1 + PHASE_RUN_FIRE_RATE_BONUS) : 1;
}

// MAG's BURNING MAGNET contact rule, and it is PER BODY - it is not a state of MAG's.
// The field drags whatever it holds at 1300+ units/s² while a normal enemy walks at 40-75, so a
// body the field has hold of is not walking into MAG, it is debris in flight - and debris passes
// through him instead of shoving against his hitbox or flattening him on the way past.
// Everything else is untouched: a body the field is NOT dragging hurts him normally, a dragged
// body is vulnerable to its own contact again the instant the field ends, and contact is the only
// thing ever refused. MAG himself is never phased and never immune.
// Returns the field that is currently dragging `e`, or null.
// Written against the caster's field so a future magnet source cannot silently hand this to
// another hero.
function magnetPulled(e){
  if(!e || e.dead || e.kind === 'shield' || e.type === 'apexcake' || G.char?.id !== 'mag') return null;
  for(const fx of G.effects){
    if(!fx || fx.dead || fx.kind !== 'magnet') continue;
    const dx=e.x-fx.x, dz=e.z-fx.z;
    if(dx*dx+dz*dz < fx.r*fx.r) return fx;
  }
  return null;
}

// The look of a dragged body: while the field has hold of it, it goes spectral, because it is in
// flight and it physically ghosts through MAG. Same caching discipline as applyPhaseVisual - every
// change is remembered on the material itself, so the end of the pull restores the exact original
// instead of assuming what it was. Only MeshStandardMaterial is touched: enemy rings and shield
// bubbles are MeshBasic and keep their own opacity animations untouched.
function applyMagnetGhost(e, active){
  const mesh = e?.mesh;
  if(!mesh) return;
  mesh.traverse(o=>{
    if(!o.isMesh) return;
    const m = o.material;
    if(!m || !m.isMeshStandardMaterial) return;
    if(active){
      if(!m.userData.magGhostSaved){
        m.userData.magGhostSaved = { transparent:m.transparent, opacity:m.opacity, depthWrite:m.depthWrite };
        m.transparent = true;
        m.opacity = MAGNET_PULL_GHOST_OPACITY;
        m.depthWrite = true;
      }
    } else if(m.userData.magGhostSaved){
      m.transparent = m.userData.magGhostSaved.transparent;
      m.opacity = m.userData.magGhostSaved.opacity;
      m.depthWrite = m.userData.magGhostSaved.depthWrite;
      m.userData.magGhostSaved = null;
    }
  });
  e.magnetGhost = active;
}

// Per-frame sweep, so the in-flight look can never outlive the pull: whatever a live field is
// dragging is spectral, and everything else is solid again on the first frame the field is gone.
// Runs unconditionally (not behind a MAG check) because the RESTORE has to happen whether or not
// MAG is still the character, still alive, or still holding a magnet.
function updateMagnetGhosting(){
  for(const e of G.enemies){
    if(!e || e.dead) continue;
    const pulled = !!magnetPulled(e);
    if(pulled !== !!e.magnetGhost) applyMagnetGhost(e, pulled);
  }
}

// PHASE RUN's look, and the whole of it: the hero's own materials simply go semi-transparent
// for the window and come back exactly as they were afterwards. That is deliberately the
// plainest thing that reads as "intangible". An aura rig (light pool, spirals, ripples, plume,
// motes, veil), a blue repaint with a fresnel rim, and a trail of after-image copies were all
// built here first and were removed by request as far too busy - do not reintroduce them; the
// translucent body IS the effect. The only motion left is a slow breath on the alpha, which
// exists so the ghost reads as alive rather than as a transparency glitch.
//
// Two things are load-bearing and must survive any retune:
//   1. depthWrite stays ON. Three's default for transparent materials is OFF, and with writes
//      off every intersection between the hero's own overlapping spheres draws through the near
//      hemisphere, which is what turns a translucent body into a pile of glass balloons. Writes
//      stay on, and updatePhaseVisual draws the hero's parts NEAR-TO-FAR each frame, so every
//      pixel keeps only its outermost surface.
//   2. The held weapon is phased with the body instead of being treated specially. One opacity
//      for the whole model is what "semi-transparent" means; the old additive-blended glow gun
//      was part of the light show that was removed.
function applyPhaseVisual(h, active){
  const mesh = h?.mesh;
  if(!mesh) return;
  // A phasing hero must not stamp its contact shadow on the floor: a solid black disc under a
  // translucent body reads as a hole punched through it. Hidden for the window, restored with
  // its own saved opacity on the way out.
  const sh = mesh.userData.shadow;
  if(sh){
    if(active && !sh.userData.phaseShadowSaved) sh.userData.phaseShadowSaved = { visible:sh.visible, opacity:sh.material.opacity };
    if(active){
      sh.visible = false;
    } else if(sh.userData.phaseShadowSaved){
      sh.visible = sh.userData.phaseShadowSaved.visible;
      sh.material.opacity = sh.userData.phaseShadowSaved.opacity;
      sh.userData.phaseShadowSaved = null;
    }
  }
  // Every change is cached on the material itself, so the restore is exact rather than an
  // assumption about what the material looked like before.
  const list = [];
  mesh.traverse(o=>{
    const m = o.material;
    if(!o.isMesh || !m || !m.isMeshStandardMaterial) return;
    if(active){
      if(!m.userData.phaseSaved){
        m.userData.phaseSaved = { transparent:m.transparent, opacity:m.opacity, depthWrite:m.depthWrite };
        m.transparent = true;
        m.opacity = PHASE_BODY_OPACITY;
        m.depthWrite = true;
        m.needsUpdate = true;
      }
      list.push(o);
    } else {
      const s = m.userData.phaseSaved;
      if(!s) return;
      m.transparent = s.transparent;
      m.opacity = s.opacity;
      m.depthWrite = s.depthWrite;
      m.userData.phaseSaved = null;
      m.needsUpdate = true;
    }
  });
  // The per-frame draw order works off this list. It is rebuilt on every activation rather than
  // cached for the run, which is what picks up the held weapon (built a beat after the hero) and
  // anything else added to the model later.
  if(active){
    mesh.userData.phaseList = list;
  } else if(mesh.userData.phaseList){
    for(const o of mesh.userData.phaseList) o.renderOrder = 0;
    mesh.userData.phaseList = null;
  }
}

// Per-frame upkeep while the window is open: keep the hero's parts drawing near-to-far (rule 1
// above) and breathe the alpha.
const PHASE_SORT_TMP = new THREE.Vector3();
function updatePhaseVisual(h,dt){
  const mesh = h?.mesh, list = mesh?.userData.phaseList;
  if(!list || !list.length || !heroPhasing(h)) return;
  const cam = G.camera.position;
  for(const o of list){ o.getWorldPosition(PHASE_SORT_TMP); o.userData.phaseZ = PHASE_SORT_TMP.distanceToSquared(cam); }
  list.sort((a,b)=>a.userData.phaseZ - b.userData.phaseZ);
  const op = PHASE_BODY_OPACITY*(0.85 + 0.25*(0.5 + 0.5*Math.sin(G.time*2.4)));
  for(let i=0;i<list.length;i++){
    list[i].renderOrder = i + 1;
    const m = list[i].material;
    if(m) m.opacity = op;
  }
}

// The one part of the phase machinery that is not free: flipping a material to transparent bumps
// its version, so the first phased frame re-initialises every hero material with the renderer
// (uniform re-writes, program lookups). That is small, but it lands on exactly the frame the
// player pressed the Super to dodge through something, so it is pre-touched once on the first
// frame of the run: flip the look on, draw a single pixel into the corner of the framebuffer
// (autoClear off, so that pixel is the only thing touched and the screen never actually
// changes), then flip it back before the real frame is drawn.
let _phaseWarmRenderer = null;
function warmPhasePrograms(h){
  const mesh = h?.mesh, r = G.renderer;
  if(!mesh || !r) return true;
  if(heroPhasing(h)) return false;
  if(r === _phaseWarmRenderer) return true;
  applyPhaseVisual(h, true);
  // The camera is only moved at the END of a frame, so push these through the frustum test
  // rather than trusting wherever it happens to be pointing during this first frame.
  const unculled = [];
  const uncull = o => { if(o.frustumCulled){ o.frustumCulled = false; unculled.push(o); } };
  mesh.traverse(uncull);
  const prevViewport = r.getViewport(new THREE.Vector4());
  const prevAutoClear = r.autoClear;
  r.autoClear = false;
  r.setViewport(0, 0, 1, 1);
  r.render(G.scene, G.camera);
  r.setViewport(prevViewport.x, prevViewport.y, prevViewport.z, prevViewport.w);
  r.autoClear = prevAutoClear;
  for(const o of unculled) o.frustumCulled = true;
  applyPhaseVisual(h, false);
  _phaseWarmRenderer = r;
  return true;
}

function damageHero(dmg,opts={}){
  // PHASE RUN: phased heroes ignore everything except damage explicitly tagged `area`.
  if(heroPhasing() && !opts.area) return;
  if(!opts.skipAegis&&aegisTryBlock(opts)) return;
  const h = G.hero;
  // Difficulty raises enemy-side lethality, never lowers the player's stats. Only hits
  // carrying a hostile source position are scaled so self-cost perks remain unchanged.
  if(Number.isFinite(Number(opts.sourceX)) && Number.isFinite(Number(opts.sourceZ))){
    dmg *= (G.diff==='Insane') ? insanePressure().incomingMult : (DIFFS[G.diff]?.incomingMult || 1);
  }
  if(h.dead || h.invince>0 || h.airborne) return;
  if(Math.random() < Math.min(RUN_STAT_CAPS.dodge,h.mods.dodge)){
    floater('DODGED!', h.x, h.z, 'dodge');
    // NOTE (balance parity): orig SetShieldPoints(20) — refills shield to the default cap of 20, not +10
    if(h.dodgeKing){ h.shield = Math.min(h.maxShield, 20); }
    h.invince = 0.4;
    return;
  }
  const hpBefore = h.hp;
  const hpRatioBefore = clamp(hpBefore/h.maxHp,0,1);
  let d = dmg, shieldAbsorbed = 0;
  if(h.shield>0){
    shieldAbsorbed = Math.min(h.shield, d);
    h.shield -= shieldAbsorbed; d -= shieldAbsorbed;
    burst(h.x, 12, h.z, 0x8fd4ff, 8, 80, 0.4, 0.3);
  }
  d *= (1 - Math.min(RUN_STAT_CAPS.armor, h.mods.armor));
  // GRIZZ Wounded Resolve: keep the giant HP bar, but let it visibly get beaten down.
  // Baseline DR is intentionally low. Below 70% HP he progressively hardens, reaching
  // 42% additional multiplicative DR near empty HP. Around half HP he is still slightly
  if(h.grizzResolve && hpRatioBefore < 0.70){
    const woundedDR = 0.42 * clamp((0.70-hpRatioBefore)/0.70, 0, 1);
    d *= (1-woundedDR);
  }
  // GRIZZ super remains an extra 30% multiplicative reduction, so using Bulwark while
  // wounded creates his strongest refusal-to-fall window without granting immunity.
  if((h.grizzGuardT||0) > 0) d *= 0.70;
  // RAJA has to stay in contact range to cash in Frenzy. Give that 7s commitment
  // a small survival window without turning his normal state into a tank.
  if(G.char?.id==='raja' && (h.tigerFrenzyT||0)>0) d *= 0.90;
  h.hp -= d;
  const hpLost = Math.max(0, hpBefore-Math.max(0,h.hp));
  if(h.grizzResolve && hpLost>0){
    const hpRatioAfter=clamp(Math.max(0,h.hp)/h.maxHp,0,1);
    const tierBefore=hpRatioBefore<=0.20?3:(hpRatioBefore<=0.40?2:(hpRatioBefore<0.70?1:0));
    const tierAfter=hpRatioAfter<=0.20?3:(hpRatioAfter<=0.40?2:(hpRatioAfter<0.70?1:0));
    if(tierAfter>tierBefore){
      const txt=tierAfter===3?'REFUSE TO FALL':(tierAfter===2?'GRIZZ HARDENS':'WOUNDED RESOLVE');
      floater(txt,h.x,h.z,'shield');
      spawnRadiusRing(h.x,h.z,26+tierAfter*6,0xc99a66,0.30);
    }
  }
  const incomingKb=Math.max(0,Number(opts.kb)||0);
  if(incomingKb>0 && (hpLost>0 || shieldAbsorbed>0) && Number.isFinite(Number(opts.sourceX)) && Number.isFinite(Number(opts.sourceZ))){
    const kx=h.x-Number(opts.sourceX), kz=h.z-Number(opts.sourceZ), kl=Math.max(0.001,Math.hypot(kx,kz));
    const massScale=G.char?.id==='bahamut'?0.58:
      (G.char?.id==='grizz'?0.64:
      (G.char?.id==='raja' && (h.tigerFrenzyT||0)>0 ? 0.55 : 1));
    h.kbx=(h.kbx||0)+(kx/kl)*incomingKb*massScale;
    h.kbz=(h.kbz||0)+(kz/kl)*incomingKb*massScale;
  }
  if(hpLost>0){
    h._hudHpTrailRatio = Math.max(h._hudHpTrailRatio??hpRatioBefore, hpRatioBefore);
    h._hudHpTrailHoldUntil = performance.now()+260;
    floater('−'+Math.max(1,Math.round(hpLost)), h.x, h.z, 'hurt');
    pulseHpHud();
  } else if(shieldAbsorbed>0){
    floater('SHIELD −'+Math.max(1,Math.round(shieldAbsorbed)), h.x, h.z, 'shield');
  }
  h.invince = HERO_BASE.hitInvince * h.mods.invince + h.invinceFlat;
  if(h.bruiser) h.ammo = Math.min(h.maxAmmo, h.ammo+6);
  G.shake = Math.max(G.shake, 0.3);
  AUD.hurt();
  dmgVignette();
  burst(h.x, 12, h.z, 0xff5a5a, 8, 90, 0.5, 0.4);
  if(h.hp<=0){
    h.hp=0; h.dead=true;
    if(G.testMode){
      h.mesh.visible=false; banner('🧪 TRAINING HERO DOWN · AUTO REVIVE');
      setTimeout(()=>testHeroRevive(),1100);
    }else gameOver();
  }
}

function ensureHeroReloadIndicator(h){
  if(h?.reloadIndicator?.sprite) return h.reloadIndicator;
  const canvas=document.createElement('canvas');
  canvas.width=240; canvas.height=40;
  const ctx=canvas.getContext('2d');
  const tex=new THREE.CanvasTexture(canvas);
  tex.colorSpace=THREE.SRGBColorSpace;
  tex.minFilter=THREE.LinearFilter;
  tex.magFilter=THREE.LinearFilter;
  const mat=new THREE.SpriteMaterial({
    map:tex,transparent:true,depthWrite:false,depthTest:false
  });
  const sprite=new THREE.Sprite(mat);
  sprite.scale.set(38,6.5,1);
  sprite.renderOrder=999;
  sprite.visible=false;
  sceneAdd(sprite);
  h.reloadIndicator={canvas,ctx,tex,sprite,lastBucket:-1};
  return h.reloadIndicator;
}

function updateHeroReloadFeedback(h){
  const desktopFine=!isCoarse();
  if(G.renderer?.domElement){
    G.renderer.domElement.style.cursor =
      (desktopFine && h?.reloading && !h.dead && G.state==='arena') ? 'not-allowed' : '';
  }

  if(!h) return;
  const ind=ensureHeroReloadIndicator(h);
  const active=!!h.reloading && !h.dead && G.state==='arena';
  ind.sprite.visible=active;
  if(!active) return;

  const p=clamp(h.reloadT/Math.max(0.001,h.reloadDur),0,1);
  const bucket=Math.floor(p*50); // ~2% redraw steps; cheap even on mobile.
  if(bucket!==ind.lastBucket){
    ind.lastBucket=bucket;
    const {ctx,canvas,tex}=ind;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Bar only: readable status without covering the hero.
    const bx=18, by=12, bw=204, bh=14;
    ctx.fillStyle='rgba(5,8,12,.72)';
    ctx.fillRect(bx,by,bw,bh);
    ctx.fillStyle='#f1c75b';
    ctx.fillRect(bx,by,bw*p,bh);
    ctx.strokeStyle='rgba(255,255,255,.70)';
    ctx.lineWidth=2;
    ctx.strokeRect(bx+1,by+1,bw-2,bh-2);
    tex.needsUpdate=true;
  }

  ind.sprite.position.set(
    h.x,
    Math.max(38,G.heroR*2.55+12),
    h.z
  );
}

// ---------------- Reload / fire ----------------
function startReload(){
  const h = G.hero;
  if(!h || h.reloading || h.dead) return;
  if(h.ammo >= h.maxAmmo) return;
  h.reloading = true;
  h.reloadT = 0;
  h.reloadDur = trainingInterval(G.gun.reload * h.mods.reload);
  updateHeroReloadFeedback(h);
}

function finishReload(){
  const h = G.hero;
  h.reloading = false;
  h.ammo = h.maxAmmo;
  h.minigunSpin = 0;
  updateHeroReloadFeedback(h);
  if(h.reloadbomb){
    // drop a bomb with a short fuse that bursts into a ring of bullets
    const b = { x:h.x, z:h.z, t:0, life:2 };
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshBasicMaterial({color:0x2a2a2e}));
    mesh.position.set(h.x, 2, h.z); sceneAdd(mesh);
    b.mesh = mesh;
    G.effects.push({ kind:'bomb', ...b });
  }
  if(h.reloadreckoner && Math.random()<0.05){
    h.hp = Math.min(h.maxHp, h.hp+10);
    floater('+10', h.x, h.z, 'heal');
  }
}

function volleyAngles(count, arc, aimA, minStepDeg=10){
  count=Math.max(1,Math.floor(count||1));
  if(count===1) return [aimA];
  // Every extra projectile must be visibly separate. Existing weapon/perk spread wins,
  // and a nominal 0° weapon receives a minimum fan so projectiles remain visually separate.
  const minFan=(count-1)*minStepDeg*Math.PI/180;
  const fan=Math.max(Math.abs(arc||0),minFan);
  return Array.from({length:count},(_,i)=>aimA+(i/(count-1)-0.5)*fan);
}

function fireSunlanceRefraction(base,ox,oz,parentA,excludeEnemy=null){
  const h=G.hero;
  // Red-Alert-style prism crack: random nearby side direction, never target-seeking.
  const side=Math.random()<0.5?-1:1;
  const a=parentA+side*(0.55+Math.random()*1.10);
  const len=(G.gun.refractLen||96)*(0.82+Math.random()*0.30);
  const dx=Math.sin(a),dz=Math.cos(a);
  const ex=ox+dx*len,ez=oz+dz*len;
  const abx=ex-ox,abz=ez-oz,abl2=abx*abx+abz*abz;
  const branchDmg=base*(G.gun.refractScale||0.30);
  let hits=0;

  for(const e of G.enemies){
    if(e.dead || e===excludeEnemy) continue;
    const apx=e.x-ox,apz=e.z-oz;
    const t=Math.max(0,Math.min(1,(apx*abx+apz*abz)/abl2));
    const cx=ox+t*abx,cz=oz+t*abz;
    if(dist2(e.x,e.z,cx,cz) >= (e.r+5)*(e.r+5)) continue;

    damageEnemy(e,branchDmg,{
      dirx:dx,dirz:dz,
      kb:(G.gun.kb||0)*h.mods.kb*0.42,
      burn:(G.gun.sunBurnDps||0)*h.mods.fire*0.60,
      show:true,quiet:true
    });
    burst(e.x,7,e.z,0xff8a63,3,48,0.22,0.16);
    hits++;
    if(hits>=2) break; // tiny real payoff, not a second full piercing lance.
  }

  const grp=new THREE.Group();
  const coreMat=new THREE.MeshBasicMaterial({color:0xffffd2,transparent:true,opacity:0.92,depthWrite:false});
  const glowMat=new THREE.MeshBasicMaterial({color:0xff6f52,transparent:true,opacity:0.30,depthWrite:false});
  const core=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.8,len),coreMat);
  const glow=new THREE.Mesh(new THREE.BoxGeometry(6.2,3.6,len),glowMat);
  core.position.z=len/2; glow.position.z=len/2; grp.add(glow,core);
  grp.position.set(ox,4.1,oz); grp.rotation.y=a; sceneAdd(grp);
  G.effects.push({kind:'beamfx',mesh:grp,t:0,life:0.18});
  burst(ox,6,oz,0xffb56f,5,54,0.22,0.15);
}

function fireOpBeam(base, aimA){
  const h=G.hero;
  // Span farther than the visible arena diagonal so the line always reaches the far wall.
  const BL=Math.hypot(VIEW.visW*2,VIEW.visH*2)+90;
  const bx=h.x, bz=h.z;
  const dx=Math.sin(aimA), dz=Math.cos(aimA);
  const ex=bx+dx*BL, ez=bz+dz*BL;
  const abx=ex-bx, abz=ez-bz, abl2=abx*abx+abz*abz;
  const beamHits=[];
  for(const e of G.enemies){
    if(e.dead) continue;
    const apx=e.x-bx, apz=e.z-bz;
    const t=Math.max(0,Math.min(1,(apx*abx+apz*abz)/abl2));
    const cx=bx+t*abx, cz=bz+t*abz;
    if(dist2(e.x,e.z,cx,cz) < (e.r+7)*(e.r+7)){
      const crit=Math.random()<h.mods.crit;
      const dmg=base*(crit?2:1);
      damageEnemy(e,dmg,{
        dirx:dx,dirz:dz,
        kb:G.gun.kb*h.mods.kb,
        burn:(G.gun.sunBurnDps||0)*h.mods.fire,
        show:true,crit
      });
      if(crit && h.explosiveCrits){ explodeDamage(e.x,e.z,36,base,0xffd166); floater('EXPLOSIVE CRIT',e.x,e.z,'crit'); }
      burst(e.x,9,e.z,0xfff3a6,5,60,0.27,0.20);
      beamHits.push(e);
    }
  }

  // Random prism split: one branch on a refraction event, then independent rolls can
  // add a second and rarer third. Each branch chooses its own random direction and never
  // target-seeks, so multi-splits are mostly spectacle with occasional accidental damage.
  if(beamHits.length && Math.random()<(G.gun.refractChance||0)){
    const pivot=beamHits[(Math.random()*beamHits.length)|0];
    let branches=1;
    if(Math.random()<(G.gun.refractSecondChance||0)) branches++;
    if(Math.random()<(G.gun.refractThirdChance||0)) branches++;
    for(let i=0;i<branches;i++){
      fireSunlanceRefraction(base,pivot.x,pivot.z,aimA,pivot);
    }
  }

  const grp=new THREE.Group();
  const core=new THREE.Mesh(new THREE.BoxGeometry(2.9,2.9,BL),new THREE.MeshBasicMaterial({color:0xfff7c7,transparent:true,opacity:0.96,depthWrite:false}));
  const glow=new THREE.Mesh(new THREE.BoxGeometry(8.6,4.9,BL),new THREE.MeshBasicMaterial({color:0xffd85c,transparent:true,opacity:0.24,depthWrite:false}));
  core.position.z=BL/2; glow.position.z=BL/2; grp.add(glow,core);
  grp.position.set(bx,4.2,bz); grp.rotation.y=aimA; sceneAdd(grp);
  G.effects.push({kind:'opbeamfx',mesh:grp,t:0,life:0.22});
  G.shake=Math.max(G.shake,0.16);
}

function tryGravityMaulPerfectDeflect(h,dx,dz){
  // Exact-swing parry: one incoming projectile in a tiny frontal window. WRAITH cones are
  // discrete magical projectiles; sustained beams remain excluded.
  const perfectR=40;
  const perfectDot=Math.cos(18*Math.PI/180); // 36° total sweet spot
  let best=null,bestD=Infinity;
  for(const b of G.ebullets){
    if(b.dead || b.hbeam || (b.beam && b.hazard!=='wraithShard') || !b.mesh) continue;
    const vx=b.x-h.x,vz=b.z-h.z,d=Math.hypot(vx,vz);
    if(d<0.001 || d>perfectR) continue;
    const ux=vx/d,uz=vz/d;
    if(ux*dx+uz*dz<perfectDot) continue;
    const towardHero=(-ux)*(b.dx||0)+(-uz)*(b.dz||0);
    if(towardHero<0.72) continue;
    if(d<bestD){ best=b; bestD=d; }
  }
  if(!best) return false;

  const deflectDmg=Math.max(18,Math.round((G.gun?.dmg||55)*0.42*h.mods.dmg));
  if(best.hazard==='wraithShard') spawnReflectedWraithShard(best,deflectDmg*1.35,'HOME RUN!');
  else {
    spawnAegisReflectedBullet(best,dx,dz,deflectDmg);
    best.dead=true;
    floater('HOME RUN!',h.x+dx*18,h.z+dz*18,'crit');
    burst(best.x,7,best.z,0xf0e8ff,9,92,0.28,0.20);
  }
  G.shake=Math.max(G.shake,0.22);
  return true;
}

function fireGravityMaul(base, aimA){
  const h=G.hero;
  const dx=Math.sin(aimA), dz=Math.cos(aimA);
  tryGravityMaulPerfectDeflect(h,dx,dz);
  const damageR=G.gun.meleeR||60;
  const pushR=Math.max(damageR+1,G.gun.pushR||88);
  const pullR=Math.max(pushR+1,G.gun.pullR||128);
  const half=(G.gun.meleeArc||126)*Math.PI/360;
  const coneDot=Math.cos(half);

  for(const e of G.enemies){
    if(e.dead || e.kind==='shield') continue;
    const vx=e.x-h.x, vz=e.z-h.z;
    const d=Math.hypot(vx,vz);
    if(d>pullR+e.r || d<0.001) continue;
    const ux=vx/d, uz=vz/d;
    const inStrikeFan=ux*dx+uz*dz>=coneDot;
    // Gravity follows the hammer swing. Nothing behind the wielder is pulled.
    if(!inStrikeFan) continue;

    // The actual strike is a real heavy-maul impact: AEGIS remains the #1 weapon for
    // displacement/ring-outs, but GRAVITY MAUL is deliberately #2 and should visibly launch.
    if(d<=pushR+e.r){
      if(d<=damageR+e.r){
        const crit=Math.random()<h.mods.crit;
        const dmg=base*(crit?2:1);
        damageEnemy(e,dmg,{dirx:ux,dirz:uz,kb:0,show:true,crit});
        burst(e.x,8,e.z,0xcdb8ff,6,72,0.30,0.22);
      }
      const outerT=d<=damageR ? 1 : clamp(1-(d-damageR)/(pushR-damageR),0,1);
      const rangeScale=d<=damageR ? 1 : 0.50+outerT*0.45;
      const classScale=e.type==='bahamut' ? 0.34 : (e.apexBoss ? enemyKnockResponse(e) : (e.boss ? 0.32 : ((e.elite||e.brain) ? 0.58 : 1)));
      const impulse=(G.gun.kb*h.mods.kb*rangeScale*classScale)/(1+(e.kb||0)*0.03);
      e.kbx+=ux*impulse;
      e.kbz+=uz*impulse;
      continue;
    }

    const pullT=clamp(1-d/pullR,0,1);
    const classScale=e.type==='bahamut'?0.12:(e.apexBoss?enemyKnockResponse(e)*0.72:(e.boss?0.16:((e.elite||e.brain)?0.42:1)));
    const wantedPull=((G.gun.pullKb||105)*h.mods.kb*(0.55+pullT*0.45)*classScale)/(1+(e.kb||0)*0.03);

    // Hard stand-off: gravity can rapidly gather a target to just outside the shove/hit
    // region, but the gravity impulse itself cannot carry it into that region. Normal AI,
    // another swing, or some other force can still move it inward afterward.
    const standOffR=pushR+e.r+7;
    const gap=Math.max(0,d-standOffR);
    const radialVel=(e.kbx||0)*ux+(e.kbz||0)*uz; // + outward, - inward
    const currentInward=Math.max(0,-radialVel);
    const maxInwardSpeed=gap*7*0.78; // matches ~7/s knockback decay with safety margin
    const pull=Math.min(wantedPull,Math.max(0,maxInwardSpeed-currentInward));
    e.kbx-=ux*pull;
    e.kbz-=uz*pull;
  }

  // Gravity also tugs loose XP toward the wielder on every swing. Do not snap orb
  // positions here: arm each orb with a short smooth gravity impulse and let updateOrbs()
  // animate the pull over several frames. This keeps the hammer utility readable instead
  // of looking like XP is teleporting/glitching toward the player.
  const xpPullR=G.gun.xpPullR||180;
  const xpPullStep=G.gun.xpPullStep||72;
  for(const o of G.orbs){
    if(o.dead || !isXpOrb(o)) continue;
    const ox=o.x-h.x, oz=o.z-h.z, d=Math.hypot(ox,oz);
    if(d<0.001 || d>xpPullR) continue;
    const oux=ox/d, ouz=oz/d;
    if(oux*dx+ouz*dz<coneDot) continue; // XP behind the swing is not vacuumed through the hero.
    const closeness=1-d/xpPullR;
    const speed=xpPullStep*(2.25+1.35*closeness);
    o.maulPullT=Math.max(o.maulPullT||0,0.38);
    o.maulPullDur=0.38;
    o.maulPullVX=(-ox/d)*speed;
    o.maulPullVZ=(-oz/d)*speed;
  }

  const fx=new THREE.Group();
  const mats=[];
  const damageGeo=new THREE.RingGeometry(7,damageR,36,1,-Math.PI/2-half,half*2);
  damageGeo.rotateX(-Math.PI/2);
  const damageMat=new THREE.MeshBasicMaterial({color:0xbda4ff,transparent:true,opacity:0.62,side:THREE.DoubleSide,depthWrite:false});
  fx.add(new THREE.Mesh(damageGeo,damageMat)); mats.push(damageMat);

  const pushGeo=new THREE.RingGeometry(damageR,pushR,36,1,-Math.PI/2-half,half*2);
  pushGeo.rotateX(-Math.PI/2);
  const pushMat=new THREE.MeshBasicMaterial({color:0x8f72e8,transparent:true,opacity:0.20,side:THREE.DoubleSide,depthWrite:false});
  fx.add(new THREE.Mesh(pushGeo,pushMat)); mats.push(pushMat);

  // Quiet frontal gravity bands match the real pull geometry; no rear circle suggests
  // that enemies behind the hammer can be vacuumed through the wielder.
  for(const ratio of [0.76,1]){
    const r=pullR*ratio;
    const mat=new THREE.MeshBasicMaterial({color:0x9d86ef,transparent:true,opacity:ratio===1?0.14:0.10,side:THREE.DoubleSide,depthWrite:false});
    const ring=new THREE.Mesh(new THREE.RingGeometry(r-1.0,r+1.0,40,1,-Math.PI/2-half,half*2),mat);
    ring.rotation.x=-Math.PI/2;
    ring.position.y=0.04;
    fx.add(ring); mats.push(mat);
  }

  const guideMat=new THREE.MeshBasicMaterial({color:0xf0e8ff,transparent:true,opacity:0.82,depthWrite:false});
  const guide=new THREE.Mesh(new THREE.BoxGeometry(1.7,0.16,damageR-8),guideMat);
  guide.position.set(0,0.08,(damageR+8)*0.5);
  fx.add(guide); mats.push(guideMat);

  fx.position.set(h.x,0.68,h.z);
  fx.rotation.y=aimA;
  sceneAdd(fx);
  G.effects.push({kind:'meleeFx',mesh:fx,mats,baseOpacity:mats.map(m=>m.opacity),t:0,life:0.20});
  burst(h.x+dx*32,8,h.z+dz*32,0xbda4ff,10,92,0.30,0.22);
  G.shake=Math.max(G.shake,0.22);
}

function spawnAegisBashVisual(h,aimA,damageR,pushR,half){
  // AEGIS bash feedback matches the active fan zones.
  // Inner bright sector = damaging bash reach; outer soft sector = shove reach.
  const fx=new THREE.Group();
  const innerGeo=new THREE.RingGeometry(6,damageR,30,1,-Math.PI/2-half,half*2); innerGeo.rotateX(-Math.PI/2);
  const innerMat=new THREE.MeshBasicMaterial({color:0x9eeaff,transparent:true,opacity:0.58,side:THREE.DoubleSide,depthWrite:false});
  fx.add(new THREE.Mesh(innerGeo,innerMat));
  const outerGeo=new THREE.RingGeometry(damageR,pushR,30,1,-Math.PI/2-half,half*2); outerGeo.rotateX(-Math.PI/2);
  const outerMat=new THREE.MeshBasicMaterial({color:0x4db8e8,transparent:true,opacity:0.16,side:THREE.DoubleSide,depthWrite:false});
  fx.add(new THREE.Mesh(outerGeo,outerMat));
  fx.position.set(h.x,0.72,h.z);
  fx.rotation.y=aimA;
  sceneAdd(fx);
  G.effects.push({kind:'meleeFx',mesh:fx,mats:[innerMat,outerMat],baseOpacity:[0.58,0.16],t:0,life:0.18});
}

function fireAegisBash(base,aimA){
  const h=G.hero;
  const dx=Math.sin(aimA), dz=Math.cos(aimA);
  const damageR=G.gun.bashR||60, pushR=Math.max(damageR+1,G.gun.pushR||86);
  const half=(G.gun.bashArc||112)*Math.PI/360, coneDot=Math.cos(half);
  let hitCount=0;

  // Every enemy inside the visible bash fan is affected.
  spawnAegisBashVisual(h,aimA,damageR,pushR,half);
  h.aegisFlashT=0.16;

  for(const e of G.enemies){
    if(e.dead || e.kind==='shield') continue;
    const vx=e.x-h.x, vz=e.z-h.z, d=Math.hypot(vx,vz);
    if(d<0.001) continue;
    const ux=vx/d, uz=vz/d;
    if(ux*dx+uz*dz<coneDot) continue;

    // Radius checks use the enemy's near edge, so large bodies match the visible fan.
    const edgeD=Math.max(0,d-e.r);
    if(edgeD>pushR) continue;

    const inDamageZone=edgeD<=damageR;
    const outerT=inDamageZone?1:clamp(1-(edgeD-damageR)/(pushR-damageR),0,1);
    const crit=inDamageZone && Math.random()<h.mods.crit;

    // Inner fan: actual shield impact damage. Outer fan: displacement only.
    if(inDamageZone){
      damageEnemy(e,base*(crit?2:1),{dirx:ux,dirz:uz,kb:0,show:true,crit});
    }

    if(!e.dead){
      const rangeScale=inDamageZone?1:(0.68+outerT*0.22);
      const classScale=e.type==='bahamut'?0.22:(e.apexBoss?enemyKnockResponse(e):(e.boss?0.25:((e.elite||e.brain)?0.52:1)));
      const impulse=(G.gun.kb*h.mods.kb*rangeScale*classScale)/(1+(e.kb||0)*0.03);
      e.kbx+=ux*impulse;
      e.kbz+=uz*impulse;
      e.knockoutSource='AEGIS';
    }

    burst(e.x,8,e.z,crit?0xffe9a6:(inDamageZone?0x9eeaff:0x74d9ff),crit?10:6,crit?92:72,0.26,0.18);
    hitCount++;
  }

  burst(h.x+dx*25,7,h.z+dz*25,0x74d9ff,hitCount?8:5,hitCount?70:52,0.22,0.16);
  G.shake=Math.max(G.shake,hitCount?0.12:0.06);
}

function fireInferno(base,aimA){
  const h=G.hero;
  const R=G.gun.flameR||124, half=(G.gun.flameArc||54)*Math.PI/360;
  const dx=Math.sin(aimA), dz=Math.cos(aimA), coneDot=Math.cos(half);
  for(const e of G.enemies){
    if(e.dead || e.kind==='shield') continue;
    const vx=e.x-h.x, vz=e.z-h.z, d=Math.hypot(vx,vz);
    if(d>R+e.r || d<0.001) continue;
    const ux=vx/d, uz=vz/d;
    if(ux*dx+uz*dz<coneDot) continue;
    const dmg=base*(1-0.10*clamp(d/R,0,1));
    damageEnemy(e,dmg,{dirx:ux,dirz:uz,kb:G.gun.kb*h.mods.kb,show:false,quiet:true});
    const infernoDps=(G.gun.burnDps||20)*h.mods.fire;
    applyBurn(e,infernoDps,{inferno:true});
    touchInfernoIgniteFlame(e,0.85+Math.min(0.75,(e.r||10)/22));
    if(Math.random()<0.24){ floater(Math.max(1,Math.round(dmg)),e.x,e.z,''); burst(e.x,7,e.z,0xff7b2d,2,48,0.24,0.16); }
  }
  const grp=new THREE.Group(), mats=[];
  for(let i=0;i<5;i++){
    const hot=i<2;
    const mat=new THREE.MeshBasicMaterial({color:hot?0xffd36a:(i<4?0xff7a28:0xff3f16),transparent:true,opacity:hot?0.56:0.43,depthWrite:false}); mats.push(mat);
    const puff=new THREE.Mesh(new THREE.SphereGeometry(3.5+i*1.35,8,6),mat);
    puff.scale.set(0.75,0.62,1.55+i*0.11); puff.position.set((i%2?1:-1)*(0.7+i*0.28),4.2+i*0.20,17+i*18.5); grp.add(puff);
  }
  grp.position.set(h.x,0,h.z); grp.rotation.y=aimA; sceneAdd(grp);
  G.effects.push({kind:'flamejet',mesh:grp,mats,t:0,life:0.16});
}

function fireZapperBeam(base, aimA){
  const h=G.hero;
  const BL=170;
  const bx=h.x, bz=h.z;
  const dx=Math.sin(aimA), dz=Math.cos(aimA);
  const ex=bx+dx*BL, ez=bz+dz*BL;
  const abx=ex-bx, abz=ez-bz, abl2=abx*abx+abz*abz;
  for(const e of G.enemies){
    if(e.dead) continue;
    const apx=e.x-bx, apz=e.z-bz;
    const t=Math.max(0,Math.min(1,(apx*abx+apz*abz)/abl2));
    const cx=bx+t*abx, cz=bz+t*abz;
    if(dist2(e.x,e.z,cx,cz)<(e.r+8)*(e.r+8)){
      const crit=Math.random()<h.mods.crit;
      const dmg=base*(crit?2:1);
      damageEnemy(e,dmg,{dirx:dx,dirz:dz,kb:G.gun.kb*h.mods.kb,show:true,crit,poison:0});
      if(crit && h.explosiveCrits){ explodeDamage(e.x,e.z,36,base,0xffd166); floater('EXPLOSIVE CRIT',e.x,e.z,'crit'); }
      burst(e.x,8,e.z,0x5be3ff,5,70,0.4,0.25);
    }
  }
  const beamMesh=new THREE.Mesh(new THREE.BoxGeometry(2,2,BL),new THREE.MeshBasicMaterial({color:0x5be3ff,transparent:true,opacity:0.9}));
  beamMesh.position.set((bx+ex)/2,3,(bz+ez)/2);
  beamMesh.lookAt(ex,0,ez);
  sceneAdd(beamMesh);
  G.effects.push({kind:'beamfx',mesh:beamMesh,t:0,life:0.4});
}

function fireShot(){
  const h = G.hero;
  h.ammo = Math.max(0, h.ammo-1);
  if(G.gun.special.includes('flameop')){
    if(G.time-(h.lastFlameSound||-99)>0.22){ AUD.shoot(); h.lastFlameSound=G.time; }
  } else AUD.shoot();
  if(!G.gun.special.includes('shieldbash') && !G.gun.special.includes('flameop')){
    burst(h.x + G.aimDir.x*18, 13, h.z + G.aimDir.z*18, 0x77776e, 4, 34, 0.6, 0.5);
  }

  const base = computeBulletDamage();
  const n = G.gun.proj + h.mods.proj;
  const arc = ((G.gun.arc||0) + (h.mods.spread||0)) * Math.PI/180;
  // Explosive multi-shot must match what the player sees: every visible explosive projectile
  // still owns a real blast. Balance the 2/3-shot versions by making each blast physically
  // scaled in radius and damage per projectile.
  // Direct projectile damage already carries Double Bullet / Bullet Bully's normal -20% steps.
  const explosiveMulti = G.gun.special.includes('explode') && n>1;
  const multiBlastDamageScale = !explosiveMulti ? 1 : (n===2 ? 0.82 : 0.62);
  const multiBlastRadiusScale = !explosiveMulti ? 1 : (n===2 ? 0.84 : 0.70);
  // Cluster grenades keep their expected count per parent shot. In multi-shot mode their
  // sub-blasts use per-projectile radius/damage scaling so the screen shows many small booms
  // rather than a few full-sized booms with mysteriously missing damage.
  const clusterPerProjectile = G.gun.special.includes('cluster') ? (G.gun.clusterCount||3) : 0;
  const clusterMultiDamageScale = n<=1 ? 1 : (n===2 ? 0.65 : 0.45);
  const clusterMultiRadiusScale = n<=1 ? 1 : (n===2 ? 0.78 : 0.62);
  const aimA = Math.atan2(G.aimDir.x, G.aimDir.z);
  if(G.gun.special.includes('opbeam')){
    for(const a of volleyAngles(n,arc,aimA,9)) fireOpBeam(base,a);
  } else if(G.gun.special.includes('shieldbash')){
    // AEGIS projectile perks widen the physical defensive fan; they do not multiply
    // one bash into a crowd shove. Every trigger selects at most one target.
    fireAegisBash(base,aimA);
  } else if(G.gun.special.includes('flameop')){
    for(const a of volleyAngles(n,arc,aimA,16)) fireInferno(base,a);
  } else if(G.gun.special.includes('melee')){
    for(const a of volleyAngles(n,arc,aimA,24)) fireGravityMaul(base,a);
  } else if(G.gun.special.includes('beam')){
    for(const a of volleyAngles(n,arc,aimA,9)) fireZapperBeam(base,a);
  } else {
    const shotAngles=volleyAngles(n,arc,aimA,10);
    for(let i=0;i<n;i++){
      let a = shotAngles[i];
      if(n===1 && arc>0) a += (Math.random()-0.5)*arc;
      else if(n===1 && arc<=0) a += (Math.random()-0.5)*0.09;
      const dx = Math.sin(a), dz = Math.cos(a);
      // ranger: damage scales with distance to aim
      let dmg = base;
      if(h.ranger) dmg = Math.max(1, dmg + Math.hypot(G.aimWorld.x-h.x, G.aimWorld.z-h.z)*0.045 - 5);

      // BB-NOZIA's hold charge used to enlarge only the mesh. Keep the same 1..2.5
      // visual charge, but make it a real weapon mechanic: moderate damage/blast/KB scaling.
      const bounceCharge = G.gun.id==='bouncecannon' ? clamp(h.bounceCharge||1,1,2.5) : 1;
      const bounceChargeT = (bounceCharge-1)/1.5;
      if(G.gun.id==='bouncecannon') dmg *= 1 + 0.65*bounceChargeT;

      const opts = {
        color: G.gun.color, kb: G.gun.kb * h.mods.kb * (G.gun.id==='bouncecannon' ? 1+0.30*bounceChargeT : 1),
        speed: (G.gun.speed || BULLET_SPEED) * h.mods.bulletSpeed,
        pierce: G.gun.special.includes('pierce') ? 99 : 0,
        bounce: G.gun.special.includes('bounce') ? (G.gun.bounces??999) : 0,
        explode: G.gun.special.includes('explode') ? (G.gun.id==='bouncecannon'?dmg:base)*(G.gun.explosionScale??1)*multiBlastDamageScale : 0,
        slow: G.gun.special.includes('slow'),
        poison: G.gun.special.includes('poison') ? poisonDps()*(G.gun.poisonMult||1) : 0,
        // TOXIC BLASTER's venom pool: the glob leaves a small poison cloud where it lands. Carried
        // on the bullet (not spawned at the muzzle) so the cloud appears at the impact point.
        pool: G.gun.pool ? { r:G.gun.pool.r, life:G.gun.pool.life, strength:G.gun.pool.strength, poisonMult:(G.gun.poisonMult||1) } : null,
        burn: (G.gun.burnDps||0) * h.mods.fire,
        bone: G.gun.special.includes('bone'),
        scale: bounceCharge,
        // Premium arsenal: seeker missile, siege rocket, indirect cluster grenade.
        homing: G.gun.special.includes('homing'),
        homingTurn: G.gun.homingTurn||0,
        homingLife: G.gun.homingLife||0,
        blastR: (G.gun.blast || 36)*multiBlastRadiusScale*(G.gun.id==='bouncecannon' ? 1+0.30*bounceChargeT : 1),
        blastInnerR: (G.gun.blastInner || 0)*multiBlastRadiusScale,
        expireExplode: (G.gun.id==='missile' || G.gun.id==='rocket' || G.gun.id==='grenade'),
        cluster: clusterPerProjectile,
        clusterScale: G.gun.clusterScale??0.6,
        clusterDamageScale: clusterMultiDamageScale,
        clusterRadiusScale: clusterMultiRadiusScale,
        noDirect: G.gun.id==='grenade',
        vy: G.gun.special.includes('arc') ? 90 : 0,
        trailSmoke: !!G.gun.smokeTrail,
        smokeEvery: G.gun.smokeEvery||0.1,
        smokeScale: G.gun.smokeScale||1,
        rocketFx: G.gun.id==='rocket',
        explodeFx: G.gun.id==='rocket',
        life: G.gun.id==='missile' ? 2.35 : G.gun.id==='rocket' ? 1.75 : G.gun.id==='grenade' ? 2.5 : undefined,
      };
      fireBullet(h.x, h.z, dx, dz, dmg, opts);
    }
    if(G.gun.id==='bouncecannon'){
      // The held charge is deliberately NOT spent by firing. Holding fire ramps the shells from
      // x1 to x2.5 over 0.75s and then keeps them there, so sustained auto fire IS the charged
      // state and the fire interval never changes. Releasing fire drops the charge straight back
      // to x1 (updateHero's firing branch), which is what keeps tap-firing at uncharged shells.
      // Spending the charge per shot instead made only the first shell of a burst look different.
      const bc = clamp(h.bounceCharge||1, 1, 2.5);
      const mx=h.x+G.aimDir.x*12, mz=h.z+G.aimDir.z*12;
      spawnRadiusRing(mx,mz,6+bc*5,G.gun.color,0.14);
    }
    if(G.gun.id==='rocket'){
      const mx=h.x+G.aimDir.x*17, mz=h.z+G.aimDir.z*17;
      spawnRadiusRing(mx,mz,20,0xffa23a,0.15);
      burst(mx,8,mz,0xff7a28,8,78,0.42,0.20);
      G.shake=Math.max(G.shake,0.11);
    }
  }
  // MAG passive: +5 fire damage per hit is applied as burn-ish flat — see bullet hit
  if(G.gun.special.includes('void')){
    const r = (Math.random()*4)|0;
    if(r<2){
      const n = r+1;
      h.ammo = Math.min(h.maxAmmo, h.ammo+n);
      floater('+'+n+' Ammo', h.x, h.z, 'ammo');
    }
  }
  if(!G.gun.special.includes('shieldbash') && !G.gun.special.includes('flameop')){
    burst(h.x + G.aimDir.x*12, 8, h.z + G.aimDir.z*12, 0xffe066, 3, 60, 0.3, 0.12);
  }
}

function tryFire(dt){
  const h = G.hero;
  if(h.reloading || h.dead) return;
  if(h.ammo<=0){ AUD.empty(); startReload(); return; }
  // PHASE RUN's run fire-rate bonus divides the fire interval at this single cadence gate.
  let interval = trainingInterval(G.gun.fire * h.mods.fire / phaseRunFireMul(h));
  if(G.time - h.lastFire < interval) return;
  h.lastFire = G.time;
  fireShot();
  if(G.gun.special.includes('dblshot')){
    G.effects.push({ kind:'dblshot', t:0 });
  }
}

function poisonDps(){
  let d = 10 * G.hero.mods.poison;
  if(G.hero.poisonScalesAmmo) d *= (G.hero.maxAmmo/10);
  return d;
}

function spawnDragonBeamFx(x0,z0,x1,z1,color=0x7dd8ff,width=3.2,life=0.18){
  const dx=x1-x0, dz=z1-z0, len=Math.max(1,Math.hypot(dx,dz));
  const grp=new THREE.Group();
  const core=new THREE.Mesh(new THREE.BoxGeometry(width, width, len), new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.90}));
  const glow=new THREE.Mesh(new THREE.BoxGeometry(width*2.3, width*2.3, len), new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.24,depthWrite:false}));
  grp.add(glow); grp.add(core);
  grp.position.set((x0+x1)/2, 5.0, (z0+z1)/2);
  grp.lookAt(x1, 5.0, z1);
  sceneAdd(grp);
  G.effects.push({kind:'beamfx',mesh:grp,t:0,life});
}
function dragonConeBurst(h,dir,color=0xff8d4d){
  const base=Math.atan2(dir.x,dir.z);
  for(const dist of [34,58,84]){
    for(const off of [-0.34,0,0.34]){
      const a=base+off;
      burst(h.x+Math.sin(a)*dist, 8, h.z+Math.cos(a)*dist, color, 5, 18+dist*0.20, 0.18, 0.12);
    }
  }
}
function dragonSweepFx(h,dir=G.aimDir,color=0xffbf66){
  // Dragon Sweep always has a baseline radial hit, but its three visible ground claws are
  // also real precision sweet spots. Return their exact visual transforms for hit testing.
  const aimA=Math.atan2(dir.x,dir.z), marks=[];
  for(const off of [-0.58,0,0.58]){
    const a=aimA+off;
    const px=h.x+Math.sin(a)*54;
    const pz=h.z+Math.cos(a)*54;
    const mark={x:px,z:pz,angle:a,scale:1.52};
    marks.push(mark);
    spawnClawMark(mark.x,mark.z,mark.angle,color,mark.scale);
  }
  spawnRadiusRing(h.x,h.z,92,color,0.42);
  burst(h.x,10,h.z,color,20,132,0.44,0.27);
  return marks;
}

function bahamutHeroFan(h,count=7,arc=78,dmg=24,dir=G.aimDir,power=1){
  // Dragon Breath should read as one huge flame fan, not a tiny narrow puff or a stack of
  const range=186*(1+0.14*Math.max(0,power-1));
  const arcDeg=82+14*Math.max(0,power-1), half=arcDeg*Math.PI/360;
  const aimA=Math.atan2(dir.x,dir.z), dx=Math.sin(aimA), dz=Math.cos(aimA), coneDot=Math.cos(half);
  for(const e of G.enemies){
    if(e.dead || e.kind==='shield') continue;
    const vx=e.x-h.x, vz=e.z-h.z, d=Math.hypot(vx,vz);
    if(d>range+e.r || d<0.001) continue;
    const ux=vx/d, uz=vz/d;
    if(ux*dx+uz*dz<coneDot) continue;
    const distMul=1-0.18*clamp(d/range,0,1);
    const dealt=(22*power*distMul)*h.mods.dmg;
    damageEnemy(e,dealt,{dirx:ux,dirz:uz,kb:175*power*h.mods.kb,show:false,quiet:true});
    applyBurn(e,24*power*h.mods.fire);
    if(Math.random()<0.14){ floater(Math.max(1,Math.round(dealt)),e.x,e.z,''); }
  }
  const visualScale=1+0.24*Math.max(0,power-1);
  for(const off of [-0.26,-0.15,-0.06,0,0.06,0.15,0.26]){
    const grp=new THREE.Group(), mats=[];
    for(let i=0;i<7;i++){
      const hot=i<2;
      const mat=new THREE.MeshBasicMaterial({color:hot?0xffd36a:(i<5?0xff7a28:0xff3f16),transparent:true,opacity:hot?0.56:0.40,depthWrite:false});
      mats.push(mat);
      const puff=new THREE.Mesh(new THREE.SphereGeometry((4.8+i*1.85)*visualScale,8,6),mat);
      puff.scale.set(0.96,0.72,1.95+i*0.18);
      puff.position.set((i%2?1:-1)*(0.8+i*0.30),4.1+i*0.32,(18+i*17.6)*visualScale);
      grp.add(puff);
    }
    grp.position.set(h.x,0,h.z);
    grp.rotation.y=aimA+off;
    sceneAdd(grp);
    G.effects.push({kind:'flamejet',mesh:grp,mats,t:0,life:0.48+0.10*Math.max(0,power-1)});
  }
  spawnRadiusRing(h.x+dx*(94*visualScale),h.z+dz*(94*visualScale),36*visualScale,0xff8d4d,0.12);
}
function bahamutHeroLance(h,dir=G.aimDir,power=1,beamCount=3){
  // Distinct visual identity: visible piercing dragon beams with a tip bolt.
  // The Super finisher fires a wider five-beam empowered lance without touching normal cooldowns.
  const base=Math.atan2(dir.x,dir.z);
  const n=Math.max(1,beamCount|0);
  const spread=n<=1?0:0.24;
  for(let i=0;i<n;i++){
    const off=n===1?0:(-spread/2 + spread*i/(n-1));
    const a=base+off, dx=Math.sin(a), dz=Math.cos(a);
    const reach=238*(1+0.10*Math.max(0,power-1));
    spawnDragonBeamFx(h.x, h.z, h.x+dx*reach, h.z+dz*reach, 0x7dd8ff, 3.0*(1+0.28*Math.max(0,power-1)), 0.16+0.04*Math.max(0,power-1));
    fireBullet(h.x,h.z,dx,dz,34*power*h.mods.dmg,{color:0x7dd8ff,speed:620,life:0.82+0.10*Math.max(0,power-1),kb:75*power,pierce:3,r:2.6,scale:1.0+0.12*Math.max(0,power-1)});
  }
}
function bahamutHeroRadial(h,count=6,dmg=58){
  // Authored launch first, tracking second. Every orb leaves on a fixed, evenly spaced
  // radial spoke, but only for a *brief* 0.12s opening beat. That keeps the launch pattern
  // visibly intentional without making the Dragon missiles miss most of the arena before
  // guidance begins. Once acquired, a target is locked and never silently swapped.
  const base=-Math.PI/2;
  for(let i=0;i<count;i++){
    const a=base+i/count*Math.PI*2;
    fireBullet(h.x,h.z,Math.sin(a),Math.cos(a),dmg*0.70*h.mods.dmg,{
      color:0xc579ff,speed:228,life:2.15,kb:118,pierce:0,r:5.8,scale:1.34,
      explode:dmg*0.30*h.mods.dmg,explodeColor:0xc579ff,explodeFx:true,blastR:34,impactPad:6.5,
      softHoming:true,softTarget:null,lockTarget:true,acquireTarget:true,homingDelay:0.12,homingTurn:1.65,homingLife:1.78,trailSmoke:true,smokeEvery:0.09,smokeScale:0.86,
    });
  }
  burst(h.x,10,h.z,0xc579ff,14,104,0.32,0.20);
  spawnRadiusRing(h.x,h.z,72,0xc579ff,0.38);
}
function bahamutHeroSweep(h,dir=G.aimDir,power=1){
  // Source cue + ground attack happen unconditionally. The radius is the reliable hit;
  // a player who deliberately lands one of the visible ground claws earns one full extra hit.
  const r=92*(1+0.42*Math.max(0,power-1));
  floater('💢',h.x,h.z,'lionPunch',48);
  const clawMarks=dragonSweepFx(h,dir,0xffbf66);
  if(power>1) spawnRadiusRing(h.x,h.z,r,0xffd166,0.50);
  for(const e of G.enemies){
    if(e.dead || e.kind==='shield') continue;
    const dx=e.x-h.x,dz=e.z-h.z,len=Math.max(1,Math.hypot(dx,dz));
    if(clawMarks.some(m=>clawMarkHitsEnemy(e,m.x,m.z,m.angle,m.scale))){
      damageEnemy(e,42*power*h.mods.dmg,{dirx:dx/len,dirz:dz/len,kb:360*power*h.mods.kb,show:true});
    }
    if(!e.dead && len<=r+e.r){
      damageEnemy(e,42*power*h.mods.dmg,{dirx:dx/len,dirz:dz/len,kb:360*power*h.mods.kb,show:true});
      spawnClawHeadMark(e,Math.atan2(dx,dz),0xf0b85a,1.38+0.22*Math.max(0,power-1));
    }
  }
}
function bahamutHeroImpact(h,dx,dz){
  const ix=h.x+dx*28, iz=h.z+dz*28;
  // FINAL APEX RUSH must justify its 22s meter and six-stock limit. Landing is a real
  // arena event: heavy damage, huge knockback, class-scaled shock/stun, then all four
  // numbered Dragon Arsenal attacks fire in empowered form without consuming their CDs.
  const shockR=160;
  spawnRadiusRing(ix,iz,shockR,0xffd166,0.72);
  spawnRadiusRing(ix,iz,126,0x7dd8ff,0.58);
  burst(ix,18,iz,0xb86cff,58,285,0.96,0.68);
  burst(ix,14,iz,0xffd166,34,235,0.74,0.48);
  floater('SHOCK!',ix,iz,'crit');
  for(const e of G.enemies){
    if(e.dead || e.kind==='shield') continue;
    const ex=e.x-ix,ez=e.z-iz,len=Math.max(1,Math.hypot(ex,ez));
    if(len<=shockR+e.r){
      damageEnemy(e,110*h.mods.dmg,{dirx:ex/len,dirz:ez/len,kb:900*h.mods.kb,show:true});
      const shockStun=e.type==='bahamut'?0.16:(e.boss?0.22:(e.apexBoss?0.30:((e.elite||e.brain)?0.46:0.90)));
      e.stunT=Math.max(e.stunT||0,shockStun);
    }
  }

  const dir={x:dx,z:dz};
  bahamutActionCallout(h,'FULL ARSENAL',0xffd166);
  bahamutHeroFan(h,7,82,24,dir,1.55);
  bahamutHeroLance(h,dir,1.50,5);
  bahamutHeroRadial(h,10,76);
  bahamutHeroSweep(h,dir,1.55);
  G.shake=Math.max(G.shake,1.35);
}

function bahamutActionCallout(h,label,color=0xffd166){
  const el=document.createElement('div');
  el.className='floater crit';
  el.textContent='🐉 '+label;
  el.style.color='#'+color.toString(16).padStart(6,'0');
  el.style.fontWeight='900';
  el.style.letterSpacing='.08em';
  el.style.textShadow='0 2px 6px #000, 0 0 10px currentColor';
  $('#floaters').appendChild(el);
  const p=worldToScreen(new THREE.Vector3(h.x,48,h.z));
  el.style.left=p.x+'px'; el.style.top=p.y+'px';
  setTimeout(()=>el.remove(),1050);
}

const BAHAMUT_SKILLS={
  fan:{ cd:2.2, label:'DRAGON BREATH' },
  lance:{ cd:3.0, label:'DRAGON LANCE' },
  radial:{ cd:4.2, label:'RADIAL BURST' },
  sweep:{ cd:3.6, label:'DRAGON SWEEP' },
};
function tryBahamutSkill(kind,skillDir=null){
  const h=G.hero, def=BAHAMUT_SKILLS[kind];
  if(!def || !h || h.dead || !h.bahamutSkills || G.state!=='arena' || G.simPaused || h.dashing) return false;
  if((h.bahamutGlobalCd||0)>0 || (h.bahamutSkillCd?.[kind]||0)>0) return false;

  const dir=skillDir||G.aimDir;
  let calloutColor=0xffd166;
  if(kind==='fan'){ bahamutHeroFan(h,1,0,0,dir); calloutColor=0xff8d4d; }
  else if(kind==='lance'){ bahamutHeroLance(h,dir); calloutColor=0x7dd8ff; }
  else if(kind==='radial'){ bahamutHeroRadial(h,6,58); calloutColor=0xc579ff; }
  else if(kind==='sweep'){ bahamutHeroSweep(h,dir); calloutColor=0xf0b85a; }
  else return false;
  bahamutActionCallout(h,def.label,calloutColor);

  h.bahamutSkillCd[kind]=def.cd;
  h.bahamutGlobalCd=0.24;
  burst(h.x,9,h.z,kind==='lance'?0x7dd8ff:(kind==='radial'||kind==='sweep'?0xffd166:0xb86cff),8,82,0.30,0.18);
  return true;
}
function updateBahamutHeroSkills(h,dt){
  if(!h.bahamutSkills) return;
  const timerDt=trainingTimerDt(dt);
  h.bahamutGlobalCd=Math.max(0,(h.bahamutGlobalCd||0)-timerDt);
  for(const kind of Object.keys(BAHAMUT_SKILLS)){
    h.bahamutSkillCd[kind]=Math.max(0,(h.bahamutSkillCd[kind]||0)-timerDt);
  }
}

// ---------------- Supers ----------------
function castSuper(skillDir=null){
  const h = G.hero;
  const unlimitedSuper = !!h?.super?.unlimited;
  if(!h || h.dead || (!unlimitedSuper && h.super.uses<=0) || h.super.chargeT < h.super.chargeMax) return;
  if(!unlimitedSuper) h.super.uses--;
  h.super.chargeT = 0;
  AUD.super();
  const id = G.char.id;
  const S = { x:h.x, z:h.z };

  if(id==='pulse'){
    for(const e of G.enemies){
      if(e.dead) continue;
      const dx=e.x-h.x, dz=e.z-h.z; const len=Math.max(1,Math.hypot(dx,dz));
      if(len<240){ e.kbx+=dx/len*420; e.kbz+=dz/len*420; }
    }
    h.hp = Math.min(h.maxHp, h.hp+10);
    floater('+10', h.x, h.z, 'heal');
    burst(h.x, 14, h.z, 0x7fd4ff, 30, 160, 0.8, 0.6);
    G.shake = Math.max(G.shake, 0.4);
  }
  else if(id==='mag'){
    // BURNING MAGNET is a cast, not a self-trap: plant it ahead in the aimed direction
    // so MAG can herd a crowd into a dangerous point without summoning that crowd onto himself.
    // See magnetPulled() for the one contact rule that comes with it (a body the field is
    // dragging is in flight, so it ghosts through MAG - MAG himself is never immune).
    const dir=skillDir||G.aimDir;
    const tx=clamp(h.x+dir.x*105,-VIEW.visW+18,VIEW.visW-18);
    const tz=clamp(h.z+dir.z*105,-VIEW.visH+18,VIEW.visH-18);
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(12, 10, 4), new THREE.MeshBasicMaterial({color:0xff5a3d}));
    mesh.rotation.x = Math.PI; mesh.rotation.y = Math.PI/4;
    mesh.position.set(tx,16,tz); sceneAdd(mesh);
    // The field ring is its own mesh rather than a spawnRadiusRing: it has to sit at the REAL pull
    // radius (the shared ring helper draws its rings at `r/8` of the value it is given - a
    // codebase-wide visual convention, so a 200-unit field would have rendered as a 25-unit ring
    // sitting inside the crowd it is supposed to be dragging). It marks the zone whose bodies are
    // in flight and therefore ghost through MAG, and it stays where it was planted.
    const fieldRing = new THREE.Mesh(
      new THREE.RingGeometry(0.975, 1.0, 72),
      new THREE.MeshBasicMaterial({color:0xff8a4d, transparent:true, opacity:0.42, depthWrite:false, side:THREE.DoubleSide})
    );
    fieldRing.rotation.x = -Math.PI/2;
    fieldRing.position.set(tx, 1.6, tz);
    fieldRing.scale.setScalar(MAGNET_FX_RADIUS);
    sceneAdd(fieldRing);
    G.effects.push({kind:'magnet',mesh,fieldRing,t:0,life:6,r:MAGNET_FX_RADIUS,x:tx,z:tz});
    burst(tx,16,tz,0xff5a3d,20,120,0.8,0.6);
  }
  else if(id==='bones'){
    // PACK is a temporary summon burst, not an uncapped permanent-army generator.
    // Recasting clears only the active PACK trio; perk Doggos/Bone Dogs are untouched.
    for(const s of G.summons){
      if(s.alive && s.kind==='dog' && s.source==='bonesPack'){
        s.alive=false;
        sceneRemove(s.mesh);
      }
    }
    for(let i=0;i<3;i++) addDog(true,8,'normal','bonesPack');
    banner('PACK! · 8s');
  }
  else if(id==='porter'){
    // WARP is point-targeted teleportation, not an always-max-range dash. Desktop lands at
    // the mouse point. Mobile quick-tap keeps a short reposition; drag controls distance.
    const startX=h.x,startZ=h.z;
    const bounds=porterWarpBounds();
    let destX,destZ;
    if(Number.isFinite(skillDir?.targetX) && Number.isFinite(skillDir?.targetZ)){
      destX=clamp(skillDir.targetX,bounds.minX,bounds.maxX);
      destZ=clamp(skillDir.targetZ,bounds.minZ,bounds.maxZ);
    }else if(!skillDir && !G.mouse.touchMode && G.aimWorld){
      destX=clamp(G.aimWorld.x,bounds.minX,bounds.maxX);
      destZ=clamp(G.aimWorld.z,bounds.minZ,bounds.maxZ);
    }else{
      const dir=repositionDirection(skillDir);
      const maxDist=porterMaxWarpDistance(startX,startZ,dir.x,dir.z);
      const requested=Number.isFinite(skillDir?.range)?skillDir.range:170;
      const warpDist=clamp(requested,0,maxDist);
      destX=startX+dir.x*warpDist;
      destZ=startZ+dir.z*warpDist;
    }
    spawnPorterPortal(startX,startZ,false);
    burst(startX,14,startZ,0x8f6bff,24,130,0.55,0.38);
    spawnRadiusRing(startX,startZ,30,0x8f6bff,0.30);
    // AI-only departure memory: enemies are not stunned or paused. For 0.3s they keep
    // moving, aiming and attacking the old position as if PORTER had not been reacquired yet.
    // There is deliberately no human-visible clone/afterimage mesh.
    h.porterAiDecoy={x:startX,z:startZ,t:0.45};
    h.x=destX; h.z=destZ;
    h.mesh.position.x=h.x; h.mesh.position.z=h.z;
    h.kbx=0; h.kbz=0;
    h.invince=Math.max(h.invince,0.85);
    spawnPorterPortal(h.x,h.z,true);

    // The exit portal itself is the attack. No fired spikes: nearby enemies are ripped once
    // by the arrival tear, keeping PORTER readable as a teleporter rather than a projectile Super.
    const tearR=76,tearDmg=computeBulletDamage(true)*1.20,tearKb=Math.max(110,G.gun.kb*h.mods.kb*1.15);
    for(const e of G.enemies){
      if(e.dead || e.kind==='shield') continue;
      const ex=e.x-h.x,ez=e.z-h.z;
      const d=Math.max(0.001,Math.hypot(ex,ez));
      if(d>tearR+e.r) continue;
      damageEnemy(e,tearDmg,{dirx:ex/d,dirz:ez/d,kb:tearKb,show:true,quiet:true});
    }
    burst(h.x,14,h.z,0xb78fff,30,155,0.66,0.44);
    spawnRadiusRing(h.x,h.z,tearR,0xb78fff,0.30);
    spawnRadiusRing(h.x,h.z,38,0x6fd9ff,0.24);
    banner('WARP · PORTAL TEAR');
  }
  else if(id==='blink'){
    // BLINK owns the sustained-run lane: a 3s dash through danger, phased for all 3s, at
    // +100% Move Speed and +30% Fire Rate. Phasing ignores bodies, contact and discrete
    // shots - including walking through Thorn Guards and hostile cakes - but area attacks
    // (flames, lasers, beams, shockwaves, zone hazards) still land. Balance intent: the
    // area hole keeps this a repositioning tool, not a safe button.
    h.blinkRunT=PHASE_RUN_DURATION;
    h.blinkPhaseT=PHASE_RUN_PHASE_DURATION;
    h.blinkRunFxT=0;
    h.kbx=0; h.kbz=0;
    applyPhaseVisual(h,true);
    burst(h.x,10,h.z,0x6f83ff,20,115,0.55,0.35);
    spawnSoftRing(h.x,h.z,52,0x9fd8ff,0.85,1.4);
    banner('PHASE RUN · '+PHASE_RUN_DURATION+'s · +'+Math.round(PHASE_RUN_FIRE_RATE_BONUS*100)+'% FIRE');
  }
  else if(id==='payne'){
    const cost=Math.min(7,Math.max(0,h.hp-1));
    h.hp=Math.max(1,h.hp-cost);
    const rage=rageFlat(h);
    const blastDmg=75+rage*2.5; // 75 / 82.5 / 90 / 100 / 110 across the comeback curve.
    let hits=0;
    for(const e of G.enemies){
      if(e.dead) continue;
      if(dist2(e.x,e.z,h.x,h.z) < 260*260){
        damageEnemy(e,blastDmg,{show:true,cls:'crit',quiet:true});
        hits++;
      }
    }
    if(hits>0){
      const heal=6+Math.min(4,Math.floor(Math.max(0,hits-1)/4));
      h.hp=Math.min(h.maxHp,h.hp+heal);
    }
    h.invince=Math.max(h.invince,0.6);
    burst(h.x,14,h.z,0xff4f4f,36,170,0.9,0.7);
    G.shake=Math.max(G.shake,0.6);
  }
  else if(id==='haze'){
    // The Super floor is deterministic: always plant four stronger clouds.
    // XP only supplies extra positions. Randomness chooses WHICH nearby XP orbs seed clouds,
    // never WHETHER the bonus happens: with 3+ nearby XP, HAZE always gets all 3 bonus clouds.
    const base=4;
    const phase=Math.atan2(G.aimDir.x,G.aimDir.z);
    let total=0;
    for(let i=0;i<base;i++){
      const a=phase+i/base*Math.PI*2;
      const r=64;
      const x=clamp(h.x+Math.cos(a)*r,-VIEW.visW+28,VIEW.visW-28);
      const z=clamp(h.z+Math.sin(a)*r,-VIEW.visH+VIEW.walkShift+28,VIEW.visH+VIEW.walkShift-28);
      addCloud(x,z,1.25); total++;
    }
    const nearby=G.orbs.filter(o=>!o.dead&&isXpOrb(o)&&dist2(o.x,o.z,h.x,h.z)<165*165);
    for(let i=nearby.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [nearby[i],nearby[j]]=[nearby[j],nearby[i]];
    }
    for(const o of nearby.slice(0,3)){
      addCloud(o.x,o.z,1.25);
      total++;
    }
    banner('TOXIC BURST · '+total+' CLOUDS');
  }
  else if(id==='mo'){
    explodeDamage(h.x,h.z,145,Math.max(75,h.maxAmmo*0.65),0xffd166);
    const refill=Math.max(1,Math.ceil(h.maxAmmo*0.20));
    const before=h.ammo;
    h.ammo=Math.min(h.maxAmmo,h.ammo+refill);
    if(h.ammo>before) floater('+'+(h.ammo-before)+' Ammo',h.x,h.z,'ammo');
    banner('AMMO BOMB!');
  }
  else if(id==='nikki'){
    // OVERDRIVE drops two temporary flank turrets instead of crowding one directly behind NIKKI.
    // OVERDRIVE trades heavy per-shot damage for a 4×-rate suppressive barrage with heavy knockback.
    const aimX=G.aimDir.x,aimZ=G.aimDir.z;
    const sideX=aimZ,sideZ=-aimX;
    const temps=[];
    for(const side of [-1,1]){
      const x=clamp(h.x-aimX*34+sideX*42*side,-VIEW.visW+14,VIEW.visW-14);
      const z=clamp(h.z-aimZ*34+sideZ*42*side,-VIEW.visH+VIEW.walkShift+14,VIEW.visH+VIEW.walkShift-14);
      const temp=addTurret({x,z,life:8,overdriveTemp:true});
      if(temp){ temp.mesh.scale.setScalar(1.08); temps.push(temp); }
    }
    const battery=G.summons.filter(s=>s.kind==='turret'&&s.alive);
    const rateMul=4.0;
    for(const t of battery){
      t.boostT=8;
      t.overdriveRate=rateMul;
      t.overdriveShotMul=0.35;
    }
    burst(h.x,8,h.z,0xff9ad5,30,165,0.65,0.42);
    banner('OVERDRIVE · 8s · 4× BARRAGE');
  }
  else if(id==='rooty'){
    const n = 10;
    for(let i=0;i<n;i++){
      const a = i/n*Math.PI*2;
      spawnRootyBramble(h.x+Math.cos(a)*64,h.z+Math.sin(a)*64,8,false);
    }
    banner('BRAMBLES');
  }
  // RudBo apex-beast supers — OP, but each solves a different combat problem.
  else if(id==='bahamut'){
    // FINAL APEX RUSH uses the same reposition-vector controls as Dash/WARP/FOX DASH:
    // desktop follows mouse aim; mobile quick-tap follows the left stick; drag overrides it.
    const dir=repositionDirection(skillDir), dx=dir.x,dz=dir.z;
    const windup=0.16, travelDur=0.58, rushDur=windup+travelDur;
    h.dashing={dx,dz,t:0,dur:rushDur,travelDur,windup,dist:225,bahamutRush:true,hits:new Set(),trailT:0,startX:h.x,startZ:h.z};
    // Final Apex Rush is explicitly immune through the charge and full visible travel.
    h.invince=Math.max(h.invince,rushDur+0.35);
    spawnRadiusRing(h.x,h.z,58,0xb86cff,0.52);
    burst(h.x,12,h.z,0xffd166,24,160,0.50,0.34);
    bahamutActionCallout(h,'FINAL APEX RUSH',0xffd166);
    banner('FINAL APEX RUSH');
    G.shake=Math.max(G.shake,0.35);
  }
  else if(id==='raja'){
    // PREDATOR FRENZY opens with one front claw and two rear-side claws:
    //           川
    //           🐯
    //       川       川
    // This avoids the unwanted 川川川 pavement line.
    const frenzyBurstR = 96;
    spawnRadiusRing(h.x, h.z, frenzyBurstR, 0xff382f, 0.62);
    queueRadiusRing(h.x, h.z, frenzyBurstR*1.12, 0xff6a4d, 0.10, 0.52);
    queueRadiusRing(h.x, h.z, frenzyBurstR*0.86, 0xff173d, 0.22, 0.42);
    const openerA=Math.atan2(G.aimDir.x,G.aimDir.z);
    const fx=G.aimDir.x, fz=G.aimDir.z;
    const sx=fz, sz=-fx;
    const clawSpecs=[
      {f:56, s:0, ang:0.00, sc:2.18},
      {f:-10, s:-44, ang:-0.08, sc:2.02},
      {f:-10, s: 44, ang: 0.08, sc:2.02},
    ];
    const openerClaws=[];
    for(const spec of clawSpecs){
      const px=h.x + fx*spec.f + sx*spec.s;
      const pz=h.z + fz*spec.f + sz*spec.s;
      const mark={x:px,z:pz,angle:openerA+spec.ang,scale:spec.sc};
      openerClaws.push(mark);
      spawnClawMark(mark.x,mark.z,mark.angle,0xff173d,mark.scale);
    }
    burst(h.x, 10, h.z, 0xff173d, 10, 72, 0.36, 0.22);
    for(const e of G.enemies){
      if(e.dead || e.kind==='shield') continue;
      const dx=e.x-h.x, dz=e.z-h.z;
      const len=Math.max(1,Math.hypot(dx,dz));
      // The opener claws are no longer fake scenery: landing any visible marker earns
      // one additional full opener hit. One enemy gets at most one claw bonus per cast.
      if(openerClaws.some(m=>clawMarkHitsEnemy(e,m.x,m.z,m.angle,m.scale))){
        damageEnemy(e, 66*h.mods.dmg, {dirx:dx/len, dirz:dz/len, kb:135, show:true});
      }
      if(!e.dead && len <= frenzyBurstR + e.r){
        damageEnemy(e, 66*h.mods.dmg, {dirx:dx/len, dirz:dz/len, kb:135, show:true});
      }
    }
    burst(h.x, 16, h.z, 0xff4a2d, 42, 190, 0.85, 0.58);
    h.tigerFrenzyT = 7;
    h.tigerVampAcc = 0;
    h.tigerVampTick = 0;
    h.tigerFuryMarkT = 0;
    h.tigerLastFrenzyTarget = null;
    floater('💢',h.x,h.z,'lionPunch',38);
    h.slashT = 0; // opener owns the first Frenzy claw beat
    banner('PREDATOR FRENZY');
    G.shake = Math.max(G.shake, 0.55);
  }
  else if(id==='mane'){
    // KING'S ROAR has exactly one damaging event: the initial arena blast.
    // Echoes never deal aftermath damage. They only catch enemies that were not already
    // inside/caught at cast time, and each enemy can be echo-stunned only once per roar.
    const roarR = Math.hypot(VIEW.visW, VIEW.visH) + 90;
    spawnRadiusRing(h.x, h.z, roarR, 0xffcf4d, 1.10);
    const roarEcho={
      kind:'roarecho',x:h.x,z:h.z,r:roarR,t:0,life:4.6,nextPulse:0.42,pulseIndex:0,
      seen:new Set()
    };
    G.effects.push(roarEcho);

    for(const e of G.enemies){
      if(e.dead || e.kind==='shield') continue;

      // "Whole arena" means enemies whose centers are actually inside the playable map.
      // Fresh spawns just outside are deliberately left for the echo to catch on entry.
      const insideArena =
        e.x>=-VIEW.visW && e.x<=VIEW.visW &&
        e.z>=-VIEW.visH && e.z<=VIEW.visH;
      if(!insideArena) continue;

      roarEcho.seen.add(e);
      const dx=e.x-h.x, dz=e.z-h.z; const len=Math.max(1,Math.hypot(dx,dz));
      damageEnemy(e, 22*h.mods.dmg, {dirx:dx/len, dirz:dz/len, kb:175*h.mods.kb, show:true});
      if(!e.dead){
        const stun = e.type==='bahamut' ? 0.40 : (e.boss ? 1.0 : (e.elite||e.brain ? 3.0 : 5.0));
        e.stunT = Math.max(e.stunT||0, stun);
        // KING'S ROAR is mechanically a stun, but visually it reads as fear.
        e.roarFearT = Math.max(e.roarFearT||0, stun);
        e.roarFearSeed = Math.random()*Math.PI*2;
        e.roarFearDx = dx/len; e.roarFearDz = dz/len;
        if(!e.roarFearPose){
          e.roarFearPose={rx:e.mesh.rotation.x,rz:e.mesh.rotation.z};
        }
        if((e.boss||e.elite||e.brain||Math.random()<0.18)) floater('!',e.x,e.z,'lionPunch',Math.max(24,e.r?e.r*1.8:24));
      }
    }
    healHero(28);
    burst(h.x, 16, h.z, 0xffcf4d, 48, 230, 1.1, 0.9);
    banner("KING'S ROAR");
    G.shake = Math.max(G.shake, 0.55);
  }
  else if(id==='grizz'){
    // GRIZZLY BULWARK is a local hold-your-ground quake, deliberately unlike MANE's
    // arena-wide knock-away. The opener barely displaces enemies; the real threat is
    // staying inside the repeated damaging aftershocks while GRIZZ hardens and pulls XP.
    const r = 160;
    spawnRadiusRing(h.x, h.z, r, 0xc99a66, 0.85);
    for(const e of G.enemies){
      if(e.dead || dist2(e.x,e.z,h.x,h.z) >= r*r) continue;
      const dx=e.x-h.x, dz=e.z-h.z; const len=Math.max(1,Math.hypot(dx,dz));
      damageEnemy(e, 7, {dirx:dx/len, dirz:dz/len, kb:95, show:true});
      if(!e.dead) e.slowT = Math.max(e.slowT, 1.15);
    }
    const qm = new THREE.Mesh(
      new THREE.CircleGeometry(24, 40),
      new THREE.MeshBasicMaterial({ color:0xc99a66, transparent:true, opacity:0.5, depthWrite:false })
    );
    qm.rotation.x = -Math.PI/2;
    qm.position.set(h.x, 1.2, h.z);
    sceneAdd(qm);
    G.effects.push({
      kind:'quake', mesh:qm, mat:qm.material, x:h.x, z:h.z, r,
      aftershockDamage:6, aftershockEvery:0.72, aftershockT:0.32,
      slowLife:3.0, shake:0.30, t:0, life:5.5
    });
    h.grizzGuardT = Math.max(h.grizzGuardT||0, 6);
    G.magnet = { hero:true, x:h.x, z:h.z, t:6 };
    burst(h.x, 10, h.z, 0x8a5a33, 42, 180, 1.0, 0.82);
    banner('GRIZZLY BULWARK');
    G.shake = Math.max(G.shake, 0.42);
  }
  else if(id==='fang'){
    // PACK HOWL: a short six-wolf burst. FANG keeps range, coverage and automation,
    // Temporary pack duration is capped at 10s.
    for(let i=0;i<4;i++) addDog(true, 10);
    for(const s of G.summons){
      if(s.kind==='dog' && s.alive && s.wolf) s.packHowlT = Math.max(s.packHowlT||0, 7);
    }
    burst(h.x, 14, h.z, 0x9aa7b5, 34, 180, 0.9, 0.6);
    banner('PACK HOWL!');
  }
  else if(id==='talon'){
    // KAMIKAZE DIVE uses the same reposition-vector controls as every other movement skill.
    const dir=repositionDirection(skillDir), dx=dir.x, dz=dir.z;
    const diveDur=0.30;
    h.dashing={dx,dz,t:0,dur:diveDur,dist:190,hawkDive:true,hits:new Set()};
    // The hawk is explicitly immune for the entire dive, not merely because two timers overlap.
    h.invince=Math.max(h.invince,diveDur+0.25);
    burst(h.x,12,h.z,0xe9b447,18,150,0.55,0.35);
    banner('KAMIKAZE DIVE');
  }
  else if(id==='foxy'){
    // FOX DASH is a reposition vector: desktop follows mouse aim; mobile quick-tap
    // follows the left stick, while a mobile drag supplies the explicit override vector.
    const dir=repositionDirection(skillDir);
    const dx = dir.x, dz = dir.z;
    h.dashing = { dx, dz, t:0, dur:0.14, dist:100, foxDash:true, hits:new Set() };
    h.invince = Math.max(h.invince, h.dashing.dur + 0.08);
    h.foxFocusT = Math.max(h.foxFocusT||0, 0.90);
    h.ammo = Math.min(h.maxAmmo, h.ammo + Math.max(1, Math.ceil(h.maxAmmo*0.20)));
    burst(h.x, 8, h.z, 0xffc98a, 10, 120, 0.4, 0.25);
    AUD.dash();
    banner('FOX DASH');
    G.shake = Math.max(G.shake, 0.18);
  }
  else if(id==='val'){
    const changed=startValPanic(h.x,h.z,{hostile:false,speed:350});
    banner(changed ? 'BAKERY PANIC · '+changed+' TARGETS' : 'BAKERY PANIC');
    G.shake = Math.max(G.shake, 0.30);
  }

  // Fire Nova perk: any super casts a nova of flame that ignites every nearby enemy (matches the
  // PULSE push radius). Fire already spreads between enemies in contact, so this card's real
  // payoff is reaching the whole ring at once, without waiting for the chain.
  if(h.fireNova){
    const fr = 240;
    for(const e of G.enemies){
      if(e.dead) continue;
      if(dist2(e.x,e.z,h.x,h.z) < fr*fr){
        applyBurn(e,burnDps());
      }
    }
    burst(h.x, 16, h.z, 0xff5a3d, 26, 160, 0.9, 0.7);
    G.shake = Math.max(G.shake, 0.3);
  }
}

// ---------------- Clouds / summons ----------------
// ONE toxic-cloud look for every poison cloud in the game: HAZE's TOXIC BURST, the Stink Bug's
// death burst and the TOXIC BLASTER's venom pools all draw this same green emissive sphere, so
// the arena never shows two different "poison cloud" styles. A venom pool is just a much smaller
// one that sits low over the floor and lives ~3s instead of 5 (see addPoisonPool below).
const CLOUD_RADIUS = 55;         // damage radius of a full toxic cloud
const CLOUD_LIFE = 5;            // its lifetime
const CLOUD_VIS_R = 26;          // sphere radius of a full cloud (visual:damage = 0.47)
const CLOUD_OPACITY = 0.55;      // peak sphere opacity
function makeToxicCloudMesh(visRadius){
  return new THREE.Mesh(
    new THREE.SphereGeometry(visRadius, 10, 8),
    new THREE.MeshStandardMaterial({ color:0x5abf4f, emissive:0x2a7a2a, emissiveIntensity:0.8, transparent:true, opacity:CLOUD_OPACITY }),
  );
}
function addCloud(x,z,damageMult=1){
  const m = makeToxicCloudMesh(CLOUD_VIS_R);
  m.position.set(x, 8, z);
  sceneAdd(m);
  G.clouds.push({ mesh:m, x, z, t:0, life:CLOUD_LIFE, damageMult });
}

// VENOM POOL (TOXIC BLASTER): the small, short-lived sibling of a toxic cloud, left on the floor
// where a glob lands. It lives in G.clouds so it is cleared by the same run teardown, but carries
// `pool:true` plus its own radius/strength so updateClouds treats it as a ground hazard instead of
// a floating cloud. Deliberate differences from a cloud:
//   - it is SMALL (radius 24 vs the cloud's 55) and short-lived, so a toxic run paints a few
//     pools behind it rather than blanketing the arena;
//   - it ticks on an interval (0.4s) instead of every frame, so poison stacks build over about
//     a second of standing in it instead of capping the instant an enemy steps in;
//   - the tick is weaker than a cloud (strength, default 0.6 of poisonDps, scaled by the gun's
//     own poisonMult so a stronger-venom gun leaves a stronger cloud), and applyPoison keeps
//     the STRONGER of the existing and incoming poison, so a pool can never downgrade a hit.
// The LOOK is the shared toxic cloud mesh (see makeToxicCloudMesh), but DRAWN much smaller than
// it poisons: a radius-12 sphere (POISON_POOL_VIS_R) slowly growing to ~18 as it fades, against
// the full cloud's radius-26 sphere, sitting low over the floor. The hazard radius stays 24, so
// the pool still catches everything it did - it just reads as a small puff of the same gas
// rather than a floor-wide blob, so a toxic run leaves a trail of small puffs behind it instead
// of painting the arena green.
function addPoisonPool(x,z,opts={}){
  const radius = opts.r || POISON_POOL_R;
  const life = opts.life || POISON_POOL_LIFE;
  const dps = opts.dps ?? poisonDps()*(opts.poisonMult||1)*(opts.strength ?? POISON_POOL_STRENGTH);
  if(!(dps>0)) return null;
  const m = makeToxicCloudMesh(POISON_POOL_VIS_R);
  m.position.set(x, 6, z);
  sceneAdd(m);
  const c = {
    mesh:m, mat:m.material, pool:true, x, z, radius, visR:POISON_POOL_VIS_R, dps, strength:opts.strength ?? POISON_POOL_STRENGTH,
    t:0, life, tick:0.05, tickEvery:POISON_POOL_TICK, kick:0, color:opts.color || 0x7fe24f,
  };
  // Retire the oldest pool if we are already at the concurrent cap (see POISON_POOL_MAX).
  const live = G.clouds.filter(x=>x.pool && !x.dead);
  while(live.length >= POISON_POOL_MAX){
    const old = live.shift();
    old.dead = true;
    sceneRemove(old.mesh);
  }
  G.clouds.push(c);
  // Splash: the glob visibly bursts into the cloud it leaves behind.
  burst(x, 5, z, opts.color || 0x7ce04f, 7, 58, 0.34, 0.24);
  return c;
}

function buildStinkBugMesh(){
  const g=new THREE.Group();
  const shellMat=new THREE.MeshStandardMaterial({color:0x6fbf4f,emissive:0x224c1c,emissiveIntensity:0.42,roughness:0.7});
  const darkMat=new THREE.MeshStandardMaterial({color:0x253425,roughness:0.82});
  const wingMat=new THREE.MeshStandardMaterial({color:0xa6d96f,transparent:true,opacity:0.78,roughness:0.58});
  const eyeMat=new THREE.MeshBasicMaterial({color:0xeaff9a});

  const body=new THREE.Mesh(new THREE.SphereGeometry(4.0,8,6),shellMat);
  body.scale.set(0.82,0.58,1.20);
  body.position.set(0,3.6,0.4);
  g.add(body);

  const head=new THREE.Mesh(new THREE.SphereGeometry(2.25,7,5),darkMat);
  head.scale.set(0.92,0.72,0.95);
  head.position.set(0,3.45,4.2);
  g.add(head);

  for(const side of [-1,1]){
    const wing=new THREE.Mesh(new THREE.SphereGeometry(2.7,7,5),wingMat);
    wing.scale.set(0.72,0.18,1.20);
    wing.position.set(side*2.35,4.15,-0.2);
    wing.rotation.z=side*0.34;
    g.add(wing);

    const eye=new THREE.Mesh(new THREE.SphereGeometry(0.46,6,4),eyeMat);
    eye.position.set(side*0.9,3.9,5.9);
    g.add(eye);

    for(let i=0;i<3;i++){
      const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,4.0,5),darkMat);
      leg.position.set(side*2.4,2.15,2.2-i*2.0);
      leg.rotation.z=side*(0.82+0.12*i);
      leg.rotation.x=(i-1)*0.25;
      g.add(leg);
    }

    const antenna=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,3.3,5),darkMat);
    antenna.position.set(side*0.95,4.15,6.15);
    antenna.rotation.x=Math.PI/2-0.30;
    antenna.rotation.z=side*0.34;
    g.add(antenna);
  }

  const stripe=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.22,7.0),darkMat);
  stripe.position.set(0,5.75,-0.15);
  g.add(stripe);
  g.userData.stinkBug=true;
  return g;
}

function canineRole(isWolf){
  const r = Math.random();
  if(isWolf) return r < 0.16 ? 'guard' : (r < 0.56 ? 'vanguard' : 'hunter');
  return r < 0.42 ? 'guard' : (r < 0.68 ? 'vanguard' : 'hunter');
}

function initialCanineRole(isWolf, slot){
  if(!isWolf) return canineRole(false);
  // FANG starts with a mixed-role pack.
  // Later wolves still diversify, while ensureFangWolfRoleFloor() guarantees one guard.
  if(slot===0) return 'guard';
  if(slot===1) return 'hunter';
  if(slot===2) return 'vanguard';
  return canineRole(true);
}

function ensureFangWolfRoleFloor(){
  if(G.char?.id!=='fang') return;
  const wolves=G.summons.filter(s=>s.kind==='dog' && s.alive && s.wolf);
  if(!wolves.length) return;
  const h=G.hero;
  const byNear=wolves.slice().sort((a,b)=>
    dist2(a.mesh.position.x,a.mesh.position.z,h.x,h.z)-dist2(b.mesh.position.x,b.mesh.position.z,h.x,h.z)
  );
  const preferPermanent=role=>{
    const pool=byNear.filter(s=>!s.temp && s.role!==role);
    return pool[0] || byNear.find(s=>s.role!==role) || byNear[0];
  };
  const assign=(wolf,role)=>{
    if(!wolf || wolf.role===role) return;
    wolf.role=role;
    wolf.roleT=6+Math.random()*4;
    wolf.target=null;
    wolf.targetHold=0;
    wolf.decisionT=0;
  };

  // Minimum pack structure: one wolf guards FANG; with enough wolves, preserve
  // at least one vanguard and one hunter too. Extra wolves remain free to reroll.
  if(!wolves.some(s=>s.role==='guard')) assign(preferPermanent('guard'),'guard');
  if(wolves.length>=2 && wolves.every(s=>s.role==='guard')){
    assign(byNear[byNear.length-1],'hunter');
  }
  if(wolves.length>=3){
    if(!wolves.some(s=>s.role==='vanguard')){
      const candidate=byNear.slice().reverse().find(s=>s.role!=='guard') || byNear[byNear.length-1];
      assign(candidate,'vanguard');
    }
    if(!wolves.some(s=>s.role==='hunter')){
      const candidate=byNear.slice().reverse().find(s=>s.role!=='guard' && s.role!=='vanguard') || byNear[byNear.length-1];
      assign(candidate,'hunter');
    }
  }
}

function buildCanineMesh(isWolf,variant='normal',wolfPalette=null){
  const m = new THREE.Group();
  const bone=variant==='bone';
  // FANG's pack inherits his selected skin palette. Ordinary Doggos and dedicated
  // Bone Dogs keep their own colors and never borrow FANG cosmetics.
  const WP=isWolf && !bone ? (wolfPalette||{}) : {};
  const fur = bone ? 0xd8d0bd : (isWolf ? (WP.body??0x8794a3) : 0x9b6a38);
  const furDark = bone ? 0x5a5d5b : (isWolf ? (WP.dark??0x343b46) : 0x5d3b22);
  const furLight = bone ? 0xf4eedf : (isWolf ? (WP.cream??WP.light??0xd7dde2) : 0xd6b07c);
  const eyeCol = bone ? 0x8ee7ff : (isWolf ? (WP.eye??0xffc857) : 0x17120d);
  const legRoots = [];

  const body = new THREE.Mesh(new THREE.SphereGeometry(isWolf?6.3:5.5, 10, 8), stdMat(fur, {roughness:0.85}));
  body.scale.set(isWolf?1.18:1.12, isWolf?0.78:0.74, isWolf?1.58:1.42);
  body.position.set(0, isWolf?8.3:7.1, 0);
  m.add(body);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(isWolf?4.8:4.2, 9, 7), stdMat(furLight, {roughness:0.9}));
  chest.scale.set(0.86, 1.0, 0.72);
  chest.position.set(0, isWolf?9.0:7.7, isWolf?3.7:3.2);
  m.add(chest);

  if(isWolf){
    const neck = new THREE.Mesh(new THREE.SphereGeometry(4.6, 9, 8), stdMat(fur, {roughness:0.86}));
    neck.scale.set(0.9, 1.15, 0.86);
    neck.position.set(0, 11.1, 4.5);
    neck.rotation.x = -0.28;
    m.add(neck);
  }

  const head = new THREE.Group();
  head.position.set(0, isWolf?13.0:10.8, isWolf?7.1:6.2);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(isWolf?4.5:4.2, 10, 8), stdMat(fur, {roughness:0.84}));
  skull.scale.set(isWolf?0.92:1.0, isWolf?0.95:0.94, isWolf?1.05:1.0);
  head.add(skull);

  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(isWolf?2.55:2.45, 8, 6), stdMat(furLight, {roughness:0.9}));
  muzzle.scale.set(1.0, 0.72, isWolf?1.62:1.38);
  muzzle.position.set(0, isWolf?-0.65:-0.5, isWolf?3.45:3.15);
  head.add(muzzle);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(isWolf?1.05:0.9, 7, 6), stdMat(0x17191d, {roughness:0.7}));
  nose.scale.set(1.0, 0.75, 0.8);
  nose.position.set(0, isWolf?-0.55:-0.45, isWolf?5.0:4.35);
  head.add(nose);

  for(const side of [-1,1]){
    const eye = new THREE.Mesh(new THREE.SphereGeometry(isWolf?0.72:0.62, 7, 6), new THREE.MeshBasicMaterial({color:eyeCol}));
    eye.scale.set(0.8, 1, 0.52);
    eye.position.set(side*(isWolf?1.8:1.65), isWolf?0.75:0.65, isWolf?3.15:2.95);
    head.add(eye);

    if(isWolf){
      const ear = new THREE.Mesh(new THREE.ConeGeometry(1.65, 4.5, 5), stdMat(furDark, {roughness:0.92}));
      ear.position.set(side*2.25, 4.0, 0.2);
      ear.rotation.z = side*-0.16;
      ear.rotation.x = -0.08;
      head.add(ear);
      const inner = new THREE.Mesh(new THREE.ConeGeometry(0.75, 2.6, 5), stdMat(0x8e6064, {roughness:1}));
      inner.position.set(side*2.25, 4.0, 0.62);
      inner.rotation.z = side*-0.16;
      inner.rotation.x = -0.08;
      head.add(inner);
    } else {
      // fallback non-wolf branch for compatibility; player companions use the wolf silhouette
      const ear = new THREE.Mesh(new THREE.SphereGeometry(1.55, 7, 6), stdMat(furDark, {roughness:0.92}));
      ear.scale.set(0.72, 1.45, 0.48);
      ear.position.set(side*3.0, 0.35, 0.7);
      ear.rotation.z = side*0.4;
      head.add(ear);
    }
  }

  if(isWolf){
    for(const side of [-1,1]){
      const fang = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.1, 5), stdMat(0xf0eee4, {roughness:0.9}));
      fang.position.set(side*0.8, -1.7, 4.15);
      fang.rotation.x = Math.PI;
      head.add(fang);
    }
  }
  m.add(head);

  for(const side of [-1,1]) for(const front of [-1,1]){
    const root = new THREE.Group();
    const x = side*(isWolf?3.65:3.15);
    const z = front*(isWolf?5.0:4.25);
    root.position.set(x, isWolf?5.8:5.0, z);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(isWolf?1.25:1.15, isWolf?1.0:0.95, isWolf?5.7:5.0, 6), stdMat(furDark, {roughness:0.92}));
    leg.position.y = -(isWolf?2.65:2.3);
    root.add(leg);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(isWolf?1.35:1.2, 7, 5), stdMat(furDark, {roughness:0.95}));
    paw.scale.set(1.0, 0.55, 1.35);
    paw.position.set(0, -(isWolf?5.25:4.55), isWolf?0.35:0.3);
    root.add(paw);
    root.userData.front = front > 0;
    root.userData.side = side;
    legRoots.push(root);
    m.add(root);
  }

  let tail;
  if(isWolf){
    tail = new THREE.Group();
    const tailBase = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.08, 4.8, 7), stdMat(fur, {roughness:0.9}));
    tailBase.rotation.x = -1.02;
    tail.add(tailBase);
    const tailMid = new THREE.Mesh(new THREE.SphereGeometry(1.45, 8, 6), stdMat(fur, {roughness:0.9}));
    tailMid.scale.set(1.0, 0.88, 1.45);
    tailMid.position.set(0, -0.5, -3.0);
    tail.add(tailMid);
    const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 6), stdMat(furDark, {roughness:0.94}));
    tailTip.scale.set(0.9, 0.78, 1.05);
    tailTip.position.set(0, 0.1, -5.6);
    tail.add(tailTip);
    tail.position.set(0, 9.2, -7.5);
    tail.rotation.z = 0.18;
  } else {
    tail = new THREE.Mesh(new THREE.ConeGeometry(1.65, 6.3, 7), stdMat(fur, {roughness:0.9}));
    tail.position.set(0, 7.6, -7.0);
    tail.rotation.x = -1.05;
    tail.rotation.z = 0.35;
  }
  m.add(tail);

  if(bone){
    const boneMat=stdMat(0xf0ead9,{emissive:0xb9d9d4,emissiveIntensity:0.18,roughness:0.88});
    const jointMat=stdMat(0xc9c3b4,{roughness:0.92});
    // Ivory skull plate defines the skeletal wolf face.
    const mask=new THREE.Mesh(new THREE.SphereGeometry(isWolf?3.15:2.85,9,7),boneMat);
    mask.scale.set(isWolf?0.86:0.92,0.76,0.34); mask.position.set(0,0.05,isWolf?3.7:3.35); head.add(mask);
    const muzzleBone=new THREE.Mesh(new THREE.BoxGeometry(isWolf?2.7:2.45,1.0,isWolf?2.6:2.25),boneMat);
    muzzleBone.position.set(0,-0.85,isWolf?4.55:4.05); head.add(muzzleBone);
    // Strong spine/rib silhouette so the summon reads as BONE even when small.
    for(let i=0;i<6;i++){
      const vertebra=new THREE.Mesh(new THREE.SphereGeometry(0.60,7,5),boneMat);
      vertebra.position.set(0,12.55,2.5-i*1.82); m.add(vertebra);
    }
    for(let i=0;i<5;i++){
      const rib=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.34,7.8-i*0.42,6),boneMat);
      rib.rotation.z=Math.PI/2; rib.position.set(0,9.15-i*0.15,2.8-i*1.45); m.add(rib);
      for(const side of [-1,1]){
        const joint=new THREE.Mesh(new THREE.SphereGeometry(0.50,6,5),jointMat);
        joint.position.set(side*(3.75-i*0.16),9.15-i*0.15,2.8-i*1.45); m.add(joint);
      }
    }
    const shoulderBone=new THREE.Mesh(new THREE.SphereGeometry(3.25,8,6),boneMat);
    shoulderBone.scale.set(1.20,0.38,0.62); shoulderBone.position.set(0,9.5,4.7); m.add(shoulderBone);
    const hipBone=new THREE.Mesh(new THREE.SphereGeometry(2.8,8,6),boneMat);
    hipBone.scale.set(1.22,0.40,0.64); hipBone.position.set(0,8.0,-4.2); m.add(hipBone);
    // Thick pale long-bone shafts on all four legs; paws/joints retain a little charcoal contrast.
    for(const root of legRoots){
      const shaft=new THREE.Mesh(new THREE.CylinderGeometry(0.48,0.54,4.35,6),boneMat);
      shaft.position.y=-2.55; root.add(shaft);
      const ankle=new THREE.Mesh(new THREE.SphereGeometry(0.62,6,5),jointMat);
      ankle.position.y=-4.45; root.add(ankle);
    }
    m.userData.boneCanine=true;
    m.userData.boneWolf=!!isWolf;
  }

  m.userData.canine = { body, chest, head, tail, legRoots };
  return m;
}


function buildBoneDogMesh(){
  // Dedicated skeleton model. No common Doggo/Wolf body, fur shell or recolor path.
  const m = new THREE.Group();
  const legRoots = [];

  const boneMat = stdMat(0xfffdf4,{roughness:0.78});
  const boneShadeMat = stdMat(0xe8dfcc,{roughness:0.88});
  const voidMat = stdMat(0x08090c,{roughness:1.0});
  const jointMat = stdMat(0xcfc5b2,{roughness:0.92});

  // animateCanine() expects a body object it can pitch while running.
  const body = new THREE.Group();
  body.position.set(0,7.2,0);
  m.add(body);

  // Pelvis.
  const pelvisL = new THREE.Mesh(new THREE.SphereGeometry(2.45,8,6),boneMat);
  pelvisL.scale.set(1.0,0.62,1.0);
  pelvisL.position.set(-1.8,0,-2.7);
  body.add(pelvisL);

  const pelvisR = pelvisL.clone();
  pelvisR.position.x = 1.8;
  body.add(pelvisR);

  const pelvisBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.50,0.50,4.3,6),boneShadeMat);
  pelvisBridge.rotation.z = Math.PI/2;
  pelvisBridge.position.set(0,0,-2.7);
  body.add(pelvisBridge);

  // Black empty chest cavity behind bright ribs.
  const chest = new THREE.Group();
  chest.position.set(0,1.4,2.2);
  body.add(chest);

  const cavity = new THREE.Mesh(new THREE.SphereGeometry(3.25,8,6),voidMat);
  cavity.scale.set(0.92,0.60,1.18);
  cavity.position.set(0,0.1,0);
  chest.add(cavity);

  // Central sternum.
  const sternum = new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.45,7.2,6),boneShadeMat);
  sternum.rotation.x = Math.PI/2;
  sternum.position.set(0,0.05,0.15);
  chest.add(sternum);

  // Rib cage: visibly white, separated by black space.
  for(let i=0;i<5;i++){
    const z = 2.45-i*1.22;
    const width = 7.7-i*0.38;

    const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.36,0.36,width,6),boneMat);
    rib.rotation.z = Math.PI/2;
    rib.position.set(0,0.30-i*0.10,z);
    chest.add(rib);

    for(const side of [-1,1]){
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.48,6,5),jointMat);
      cap.position.set(side*(width*0.50),0.30-i*0.10,z);
      chest.add(cap);
    }
  }

  // Exposed backbone from shoulders to pelvis.
  for(let i=0;i<8;i++){
    const vertebra = new THREE.Mesh(new THREE.SphereGeometry(0.60-i*0.025,7,5),boneMat);
    vertebra.scale.set(0.90,0.78,1.10);
    vertebra.position.set(0,4.55,4.0-i*1.22);
    body.add(vertebra);
  }

  // Shoulder blades / shoulder bar.
  const shoulderBar = new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,7.0,6),boneShadeMat);
  shoulderBar.rotation.z = Math.PI/2;
  shoulderBar.position.set(0,4.9,4.0);
  body.add(shoulderBar);

  for(const side of [-1,1]){
    const scapula = new THREE.Mesh(new THREE.SphereGeometry(1.55,7,5),boneMat);
    scapula.scale.set(0.72,0.42,1.30);
    scapula.position.set(side*2.8,4.45,3.35);
    scapula.rotation.z = side*0.30;
    body.add(scapula);
  }

  // Neck vertebrae.
  for(let i=0;i<3;i++){
    const neckBone = new THREE.Mesh(new THREE.SphereGeometry(0.72-i*0.06,7,5),boneShadeMat);
    neckBone.position.set(0,5.4+i*1.15,4.8+i*0.60);
    body.add(neckBone);
  }

  // Skull. This is a bone skull, not a recolored dog head.
  const head = new THREE.Group();
  head.position.set(0,10.8,6.3);

  const cranium = new THREE.Mesh(new THREE.SphereGeometry(4.0,10,8),boneMat);
  cranium.scale.set(0.92,0.88,0.88);
  head.add(cranium);

  // Black eye cavities cut visually into the skull.
  for(const side of [-1,1]){
    const socket = new THREE.Mesh(new THREE.SphereGeometry(1.02,7,6),voidMat);
    socket.scale.set(1.18,0.95,0.50);
    socket.position.set(side*1.48,0.52,2.85);
    head.add(socket);

    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.62,6,5),boneShadeMat);
    cheek.scale.set(0.90,0.58,1.10);
    cheek.position.set(side*2.10,-0.42,2.55);
    head.add(cheek);
  }

  // Long skeletal muzzle.
  const snoutTop = new THREE.Mesh(new THREE.BoxGeometry(2.75,1.05,3.35),boneMat);
  snoutTop.position.set(0,-0.52,3.65);
  head.add(snoutTop);

  const nasalVoid = new THREE.Mesh(new THREE.BoxGeometry(0.72,0.62,0.85),voidMat);
  nasalVoid.position.set(0,-0.36,5.22);
  head.add(nasalVoid);

  const jawL = new THREE.Mesh(new THREE.BoxGeometry(0.62,0.72,2.85),boneShadeMat);
  jawL.position.set(-0.82,-1.42,3.75);
  head.add(jawL);

  const jawR = jawL.clone();
  jawR.position.x = 0.82;
  head.add(jawR);

  const jawBridge = new THREE.Mesh(new THREE.BoxGeometry(2.05,0.50,0.62),boneShadeMat);
  jawBridge.position.set(0,-1.45,5.00);
  head.add(jawBridge);

  // Teeth.
  for(const side of [-1,1]){
    for(let i=0;i<3;i++){
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.18,0.70,5),boneMat);
      tooth.position.set(side*(0.42+i*0.34),-1.05,5.18-i*0.35);
      tooth.rotation.x = Math.PI;
      head.add(tooth);
    }
  }

  // Pointed bone ears.
  for(const side of [-1,1]){
    const ear = new THREE.Mesh(new THREE.ConeGeometry(1.10,3.25,5),boneMat);
    ear.position.set(side*2.25,3.08,0.15);
    ear.rotation.z = side*-0.12;
    head.add(ear);

    const innerVoid = new THREE.Mesh(new THREE.ConeGeometry(0.52,1.85,5),voidMat);
    innerVoid.position.set(side*2.25,3.02,0.48);
    innerVoid.rotation.z = side*-0.12;
    head.add(innerVoid);
  }

  m.add(head);

  // Four fully skeletal legs.
  for(const side of [-1,1]) for(const front of [-1,1]){
    const root = new THREE.Group();
    root.position.set(side*3.15,5.0,front*4.25);

    const shoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(0.76,6,5),jointMat);
    root.add(shoulderJoint);

    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.48,0.56,2.65,6),boneMat);
    upper.position.y = -1.55;
    root.add(upper);

    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.62,6,5),jointMat);
    knee.position.y = -3.05;
    root.add(knee);

    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.40,0.47,2.50,6),boneMat);
    lower.position.y = -4.25;
    root.add(lower);

    const ankle = new THREE.Mesh(new THREE.SphereGeometry(0.50,6,5),jointMat);
    ankle.position.y = -5.55;
    root.add(ankle);

    // Bony toes complete the skeletal feet.
    for(let toe=-1;toe<=1;toe++){
      const toeBone = new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.20,1.35,5),boneShadeMat);
      toeBone.rotation.x = Math.PI/2;
      toeBone.position.set(toe*0.42,-5.85,0.62);
      root.add(toeBone);
    }

    root.userData.front = front > 0;
    root.userData.side = side;
    legRoots.push(root);
    m.add(root);
  }

  // Vertebrae tail.
  const tail = new THREE.Group();
  tail.position.set(0,7.65,-5.75);
  tail.rotation.z = 0.28;

  for(let i=0;i<7;i++){
    const seg = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(0.30,0.70-i*0.055),6,5),
      i%2===0 ? boneMat : boneShadeMat
    );
    seg.scale.set(0.86,0.78,1.18);
    seg.position.set(0,-0.03,-i*0.90);
    tail.add(seg);
  }
  m.add(tail);

  m.userData.boneCanine = true;
  m.userData.canine = { body, chest, head, tail, legRoots };
  return m;
}

const ROOTY_GUARD_MAX=3;
// "Walk onto a bramble" IS ROOTY's whole loop, so the step-on zone is deliberately generous.
// The trigger is measured CENTRE to CENTRE, and the hero's collision radius (12) is much smaller
// than his drawn body, so the old +7 pad let ROOTY visually stand on a bramble without consuming
// it - the plant read as "I'm on it" while the game said no. The pad now covers the drawn body
// plus real walking forgiveness, and every bramble draws its step zone at the true trigger radius
// so what you see is exactly where you have to be.
const ROOTY_BRAMBLE_STEP_PAD=18;
function rootyBrambleStepR(){ return G.heroR+ROOTY_BRAMBLE_STEP_PAD; }

// Soft disc for the bramble step zone. A graded band (fading to nothing at the rim) rather than a
// hard RingGeometry outline, for the same reason as spawnSoftRing: a crisp outline reads as a drawn
// shape parked on the floor, and with 10 Super brambles overlapping inside one ring the outlines
// weave into a lattice that fights the plants for attention. Overlapping soft discs just merge into
// one glow, which is what "the whole band is the step zone" should look like.
let _brambleZoneTex = null;
function brambleZoneTexture(){
  if(_brambleZoneTex) return _brambleZoneTex;
  const s=128, c=document.createElement('canvas'); c.width=c.height=s;
  const ctx=c.getContext('2d');
  const g=ctx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
  g.addColorStop(0,'rgba(255,255,255,0.15)');
  g.addColorStop(0.55,'rgba(255,255,255,0.20)');
  g.addColorStop(0.85,'rgba(255,255,255,0.46)');
  g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,s,s);
  _brambleZoneTex = new THREE.CanvasTexture(c);
  _brambleZoneTex.colorSpace = THREE.SRGBColorSpace;
  return _brambleZoneTex;
}

function spawnRootyBramble(x,z,life=6,passive=false){
  const m = new THREE.Group();
  const cone = new THREE.Mesh(new THREE.ConeGeometry(6.5, 15, 6), stdMat(0x3f9e4f));
  cone.position.set(0,7.5,0);
  cone.rotation.z=Math.PI;
  m.add(cone);
  const zone = new THREE.Mesh(new THREE.PlaneGeometry(2,2),
    new THREE.MeshBasicMaterial({map:brambleZoneTexture(),color:0x62c96b,transparent:true,opacity:0.42,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
  zone.rotation.x=-Math.PI/2;
  zone.position.y=1.6;
  zone.scale.setScalar(rootyBrambleStepR());
  m.add(zone);
  m.position.set(x,0,z);
  sceneAdd(m);
  const fx={kind:'bramble',mesh:m,zoneMesh:zone,t:0,life,x,z,rootyOwned:true,rootyPassive:!!passive};
  G.effects.push(fx);
  return fx;
}

function buildThornGuardMesh(){
  // Thorn Guard keeps one compact faction ring: recolor the model's existing hostile ring
  // instead of stacking a second oversized marker on top of it.
  const g=buildEnemyMesh('thornwall');
  const ring=g.userData.borderRing;
  if(ring?.material){
    ring.material.color.setHex(0x78d765);
    ring.material.opacity=0.72;
  }
  g.userData.rootyFriendlyRing=ring||null;
  return g;
}

function addThornGuard(x,z){
  // ROOTY's three-Guard cap is a rolling formation, not a spawn lock.
  // Once full, every newly awakened bramble replaces the oldest active Guard.
  const active=G.summons.filter(s=>s.kind==='thornGuard'&&s.alive);
  while(active.length>=ROOTY_GUARD_MAX){
    const oldest=active.shift();
    oldest.alive=false;
    oldest.t=0;
    sceneRemove(oldest.mesh);
  }
  const mesh=buildThornGuardMesh();
  mesh.position.set(x,0,z); sceneAdd(mesh);
  const guard={kind:'thornGuard',mesh,x,z,r:ENEMIES.thornwall.r,t:12,alive:true};
  G.summons.push(guard);
  burst(x,8,z,0x77cf62,12,82,0.42,0.26);
  floater('THORN GUARD',x,z,'crit');
  return guard;
}

function awakenRootyBramble(fx){
  if(!fx?.rootyOwned || fx.dead || G.char?.id!=='rooty') return false;
  const guard=addThornGuard(fx.x,fx.z);
  if(!guard) return false;
  sceneRemove(fx.mesh); fx.dead=true;
  return true;
}

function addDog(temp, life, variant='normal', source=''){
  // Internal 'dog' ids stay for save/runtime compatibility.
  // FANG converts every Doggo source into a Wolf.
  // BONES and all bone-bullet summon sources use a completely separate skeleton model.
  const isWolf = G.char?.id === 'fang';
  const isBones = G.char?.id === 'bones';
  const effectiveVariant = isWolf ? 'normal' : (isBones ? 'bone' : variant);
  const isBoneDog = effectiveVariant === 'bone';

  const wolfPalette=isWolf
    ? (G.heroSkin?.palette || selectedHeroSkin('fang')?.palette || null)
    : null;
  const m = isBoneDog
    ? buildBoneDogMesh()
    : buildCanineMesh(isWolf,'normal',wolfPalette);

  const slot = G.summons.filter(s=>s.kind==='dog' && s.alive).length;
  const a = slot*2.15 + Math.random()*0.5;
  const rr = isBoneDog
    ? 44 + Math.random()*12
    : (isWolf?58:42) + Math.random()*(isWolf?18:12);

  m.position.set(G.hero.x + Math.cos(a)*rr, 0, G.hero.z + Math.sin(a)*rr);
  m.rotation.y = a + Math.PI;
  sceneAdd(m);

  const canine = {
    kind:'dog', mesh:m, x:m.position.x, z:m.position.z,
    temp:!!temp, t:temp ? (life ?? 8) : Infinity, biteT:Math.random()*0.35,
    alive:true, slot, wolf:isWolf, boneDog:isBoneDog, source:source||'', variant:effectiveVariant,
    role:initialCanineRole(isWolf,slot), roleT:4+Math.random()*6,
    decisionT:Math.random()*0.8, target:null, targetHold:0,
    gait:Math.random()*Math.PI*2, biteAnim:0,
    contactR:isWolf?11.5:(isBoneDog?9.0:9.5),
  };
  G.summons.push(canine);
  return canine;
}

function addTurret(opts={}){
  const m = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(7,8,5,8), stdMat(0x4a525c,{metalness:0.4,roughness:0.5}));
  const tur = new THREE.Mesh(new THREE.CylinderGeometry(5,5,8,8), stdMat(0x666f7a,{metalness:0.4,roughness:0.5})); tur.position.y=6;
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,10,8), stdMat(0x2a2e33,{metalness:0.6})); barrel.rotation.x=Math.PI/2; barrel.position.set(0,7,8);
  const overdriveRing=new THREE.Mesh(new THREE.TorusGeometry(9.5,0.55,6,24),new THREE.MeshBasicMaterial({color:0xff9ad5,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
  overdriveRing.rotation.x=Math.PI/2; overdriveRing.position.y=2.2; overdriveRing.visible=false;
  m.add(base); m.add(tur); m.add(barrel); m.add(overdriveRing);
  const x=opts.x??G.hero.x,z=opts.z??G.hero.z;
  const t = { kind:'turret', mesh:m, x, z, t:opts.life??Infinity, fireT:0, boostT:0, alive:true, barrel, overdriveRing, overdriveTemp:!!opts.overdriveTemp };
  m.position.set(x,0,z);
  sceneAdd(m);
  G.summons.push(t);
  return t;
}

// ---------------- Effects update ----------------
function updateEffects(dt){
  for(const fx of G.effects){
    fx.t += dt;
    if(fx.kind==='flash'){
      const k = fx.t/fx.life;
      fx.mesh.scale.setScalar(1 + fx.max*2*k);
      fx.mesh.material.opacity = 0.85*(1-k);
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='beamfx'){
      const k=clamp(fx.t/fx.life,0,1);
      if(fx.mesh?.material){
        const mat=fx.mesh.material;
        if(mat.userData.fxBaseOpacity==null) mat.userData.fxBaseOpacity=mat.opacity??0.9;
        mat.opacity=mat.userData.fxBaseOpacity*(1-k);
      }else if(fx.mesh?.traverse){
        fx.mesh.traverse(obj=>{
          const mat=obj.material;
          if(!mat || mat.opacity==null) return;
          if(mat.userData.fxBaseOpacity==null) mat.userData.fxBaseOpacity=mat.opacity;
          mat.opacity=mat.userData.fxBaseOpacity*(1-k);
        });
      }
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='wraithTell'){
      const owner=fx.owner;
      if(!owner || owner.dead || fx.t>=fx.life){
        sceneRemove(fx.mesh); fx.dead=true;
      } else {
        const pulse=0.72+0.28*Math.abs(Math.sin(G.time*10.5));
        for(let i=0;i<(fx.mats?.length||0);i++){
          const mat=fx.mats[i];
          if(!mat) continue;
          mat.opacity=(i<2?0.16:0.14)*pulse;
        }
        if(fx.ghost) fx.ghost.position.z=5+Math.sin(G.time*8.0)*1.5;
      }
    }
    else if(fx.kind==='opbeamfx'){
      const k=clamp(fx.t/fx.life,0,1);
      for(const m of fx.mesh.children){ if(m.material) m.material.opacity *= Math.max(0,1-k*0.32); }
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='meleeFx'){
      const k=clamp(fx.t/fx.life,0,1);
      fx.mesh.scale.setScalar(1+k*0.10);
      if(fx.mats){
        for(let i=0;i<fx.mats.length;i++) fx.mats[i].opacity=(fx.baseOpacity?.[i]??0.6)*(1-k);
      }
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='flamejet'){
      const k=clamp(fx.t/fx.life,0,1);
      for(let i=0;i<fx.mesh.children.length;i++){
        const m=fx.mesh.children[i]; m.position.z += dt*(40+i*8); m.scale.multiplyScalar(1+dt*(0.9+i*0.06));
        if(fx.mats?.[i]) fx.mats[i].opacity=(i<2?0.56:0.43)*(1-k);
      }
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='smokedot'){
      const k = clamp(fx.t/fx.life,0,1);
      fx.mesh.position.x += fx.driftX*dt;
      fx.mesh.position.z += fx.driftZ*dt;
      fx.mesh.position.y += fx.rise*dt;
      fx.mesh.scale.setScalar(1 + k*fx.grow);
      fx.mesh.material.opacity = 0.46*(1-k);
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='igniteflame'){
      fx.afterT=Math.max(0,(fx.afterT??0)-dt);
      const target=fx.target;
      if(target && !target.dead){
        fx.mesh.position.x=target.x;
        fx.mesh.position.z=target.z;
        fx.mesh.position.y=Math.max(10,(target.r||10)*1.15+5);
      }
      const fade=clamp((fx.afterT||0)/0.60,0,1);
      const flicker=1+Math.sin(fx.t*34)*0.10;
      if(!target || target.dead) fx.mesh.position.y += dt*4.5;
      if(fx.mesh.children[0]) fx.mesh.children[0].scale.set(flicker,1+0.18*Math.sin(fx.t*27),flicker);
      if(fx.mesh.children[1]) fx.mesh.children[1].scale.set(1/flicker,1+0.14*Math.sin(fx.t*31),1/flicker);
      if(fx.mats?.[0]) fx.mats[0].opacity=0.88*fade;
      if(fx.mats?.[1]) fx.mats[1].opacity=0.92*fade;
      if(fx.afterT<=0){
        if(target?._infernoFlameFx===fx) target._infernoFlameFx=null;
        for(const m of fx.mats||[]) m.dispose?.();
        sceneRemove(fx.mesh); fx.dead=true;
      }
    }
    else if(fx.kind==='smoke'){
      for(const m of fx.mesh.children){
        const u = m.userData;
        const tk = fx.t/u.life;
        if(tk>=1){ m.visible=false; continue; }
        m.scale.setScalar(u.s*(1 + tk*u.grow*1.0));
        m.position.x = u.dx*tk + Math.sin(fx.t*u.wob + u.ph)*1.2*tk;
        m.position.z = u.dz*tk + Math.cos(fx.t*u.wob*0.8 + u.ph)*1.2*tk;
        m.position.y = u.vy*tk - Math.sin(fx.t*6+u.ph)*1.0*tk;
        m.rotation.y += u.rot*dt*0.6; m.rotation.x += u.rot*0.4*dt;
        m.material.opacity = 0.62*(1-tk);
      }
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='bomb'){
      const k = fx.t/fx.life;
      fx.mesh.scale.setScalar(1 + Math.sin(fx.t*22)*0.18*(0.4+k));
      if(fx.t>=fx.life){
        for(let i=0;i<12;i++){
          const a = i/12*Math.PI*2;
          fireBullet(fx.x, fx.z, Math.cos(a), Math.sin(a), 30, {color:0xffb347, speed:300, life:0.3, kb:20, r:2.2});
        }
        burst(fx.x, 10, fx.z, 0xffb347, 16, 130, 0.6, 0.4);
        sceneRemove(fx.mesh); fx.dead=true;
      }
    }
    else if(fx.kind==='magnet'){
      fx.mesh.rotation.y += dt*3;
      // The pull is a radial field, not a nudge: it accelerates everything inside inward, and it
      // cancels outward drift, so a crowd cannot leak out of the field one body at a time - that
      // leak was what made the Super read as "not actually pulling". MAG's MAGNET stat feeds the
      // acceleration, which is the mechanical link between his passive and his Super.
      const field = MAGNET_PULL_ACCEL + (Number(G.hero.mods.magnet)||0)*MAGNET_PULL_MAGNET_BONUS;
      for(const e of G.enemies){
        if(e.dead) continue;
        const dx=e.x-fx.x, dz=e.z-fx.z; const d2=dx*dx+dz*dz;
        if(d2 < fx.r*fx.r){
          const len=Math.max(1,Math.sqrt(d2));
          const ux=dx/len, uz=dz/len;
          const outward=(e.kbx||0)*ux+(e.kbz||0)*uz;   // + = trying to escape the field
          if(outward>0){ e.kbx-=ux*outward; e.kbz-=uz*outward; }
          e.kbx -= ux*field*dt;
          e.kbz -= uz*field*dt;
          applyBurn(e,16*G.hero.mods.fire);
          if(Math.random()<dt*3) burst(e.x, 8, e.z, 0xff5a3d, 1, 40, 0.4, 0.2);
        }
      }
      // The field's own ring, drawn at the REAL pull radius rather than on MAG. That radius is the
      // whole rule now: everything inside it is in flight and ghosts through MAG, everything
      // outside it is solid and hits him normally - so the ring is the readout, not a safe bubble
      // around him. It fades over its last second so the end of the pull is visible instead of a
      // ring that snaps away.
      if(fx.fieldRing){
        const fade = Math.min(1, Math.max(0, (fx.life - fx.t)));
        fx.fieldRing.material.opacity = (0.34 + 0.16*Math.abs(Math.sin(fx.t*3.4)))*fade;
      }
      if(fx.t>=fx.life){
        sceneRemove(fx.mesh); fx.dead=true;
        if(fx.fieldRing){ sceneRemove(fx.fieldRing); fx.fieldRing=null; }
      }
    }
    else if(fx.kind==='fireroad'){
      const k = fx.t/fx.life;
      const op = 0.85*(1 - k*0.7)*(0.85 + 0.15*Math.sin(fx.t*45));
      for(const m of (fx.mats||[fx.mat])) m.opacity = op;
      for(const g of fx.glows){ g.material.opacity = 0.7*(1-k)*(0.7 + 0.3*Math.sin(fx.t*30 + g.position.x)); g.scale.setScalar(1 + 0.2*Math.sin(fx.t*18 + g.position.z)); }
      if(fx.hostile){
        fx.heroHitT=Math.max(0,(fx.heroHitT||0)-dt);
        const h=G.hero;
        if(h && !h.dead && distToSeg(h.x,h.z,fx.x0,fx.z0,fx.x1,fx.z1) < fx.halfW + G.heroR){
          if(fx.heroHitT<=0){
            fx.heroHitT=fx.heroHitEvery||0.68;
            damageHero(fx.heroDamage||10,{sourceX:(fx.x0+fx.x1)*0.5,sourceZ:(fx.z0+fx.z1)*0.5,area:true});
            burst(h.x,8,h.z,0xff7a3d,3,48,0.30,0.18);
          }
        }
      }else{
        for(const e of G.enemies){
          if(e.dead) continue;
          if(distToSeg(e.x,e.z,fx.x0,fx.z0,fx.x1,fx.z1) < fx.halfW + e.r){
            applyBurn(e,fx.dps||burnDps());
            if(Math.random()<dt*3) burst(e.x, 8, e.z, 0xff7a3d, 1, 40, 0.4, 0.2);
          }
        }
      }
      if(Math.random() < dt*2.5) burst(fx.x0 + Math.random()*(fx.x1-fx.x0), 8, fx.z0 + Math.random()*(fx.z1-fx.z0), 0xff8a3a, 2, 45, 0.5, 0.3);
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='firering'){
      const k = fx.t/fx.life;
      fx.mat.opacity = 0.95*(1-k)*(0.8 + 0.2*Math.sin(fx.t*40));
      for(const g of fx.glows){ g.material.opacity = 0.8*(1-k)*(0.7 + 0.3*Math.sin(fx.t*26 + g.position.x)); g.scale.setScalar(1 + 0.15*Math.sin(fx.t*20)); }
      for(const e of G.enemies){
        if(e.dead) continue;
        if(dist2(e.x,e.z,fx.x,fx.z) < fx.r*fx.r){
          applyBurn(e,burnDps());
          if(Math.random()<dt*2) burst(e.x, 8, e.z, 0xff9a3d, 1, 40, 0.4, 0.2);
        }
      }
      if(Math.random() < dt*6){
        const a = Math.random()*Math.PI*2;
        burst(fx.x + Math.cos(a)*fx.r, 8, fx.z + Math.sin(a)*fx.r, 0xff9a2a, 2, 40, 0.6, 0.3);
      }
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='clawfx'){
      const k=fx.t/fx.life;
      const s=fx.baseScale||1;
      fx.mat.opacity=0.95*(1-k);
      // Keep X/Z locked on the actual enemy hit. Only scale/fade for impact motion.
      fx.mesh.scale.set(s*(1+k*0.10),s*(1+k*0.05),s*(1+k*0.08));
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='pawfx'){
      const k=clamp(fx.t/fx.life,0,1);
      fx.mat.opacity=0.88*(1-k);
      fx.mesh.scale.setScalar(1+k*0.32);
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='delayedRing'){
      if(fx.t>=fx.delay){
        spawnRadiusRing(fx.x,fx.z,fx.r,fx.color,fx.ringLife);
        fx.dead=true;
      }
    }
    else if(fx.kind==='ringfx'){
      const k = fx.t/fx.life;
      fx.mesh.scale.setScalar(fx.r/8 * (1 + k*0.15));
      fx.mat.opacity = 0.9*(1-k);
      fx.mat.color.setHex(fx.color);
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='softRing'){
      const k = clamp(fx.t/fx.life,0,1);
      fx.mesh.scale.setScalar(fx.r*(0.42 + 0.78*k));
      fx.mat.opacity = Math.pow(1-k,1.5)*0.42;
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='porterPortal'){
      const k=clamp(fx.t/fx.life,0,1);
      const pulse=1+Math.sin(fx.t*28)*0.06;
      const scale=fx.arrival ? (0.52+0.62*Math.sin(Math.min(1,k*1.45)*Math.PI/2)) : (1.12-0.48*k);
      fx.mesh.scale.setScalar(scale*pulse);
      const fade=1-k;
      if(fx.outerMat) fx.outerMat.opacity=0.88*fade;
      if(fx.innerMat) fx.innerMat.opacity=0.68*fade;
      if(fx.coreMat) fx.coreMat.opacity=0.30*fade;
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='windgust'){
      const k=clamp(fx.t/fx.life,0,1);
      if(fx.gusts){
        for(let i=0;i<fx.gusts.length;i++){
          const gust=fx.gusts[i];
          const drift=(18+i*6)*fx.scale;
          gust.position.z=gust.userData.baseZ + drift*k;
          gust.position.x=gust.userData.baseX + gust.userData.side*10*k*fx.scale;
          gust.position.y=gust.userData.baseY + Math.sin(k*Math.PI)*(1.2+i*0.16);
          gust.scale.set(1+k*0.35,1+k*0.22,1);
        }
      }
      if(fx.mats){
        for(let i=0;i<fx.mats.length;i++) fx.mats[i].opacity=Math.max(0,(i===0?0.28:0.78)*(1-k));
      }
      if(k<0.65 && Math.random()<dt*18){
        const a=(Math.random()-0.5)*0.95;
        const rr=20+Math.random()*120;
        burst(fx.mesh.position.x + Math.sin(a)*rr, 6, fx.mesh.position.z + Math.cos(a)*rr, 0xdff8ff, 1, 28, 0.25, 0.18);
      }
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='roarecho'){
      // Echoes have NO damage. They only fear-stun an enemy that was not already caught
      // by this roar and newly appears/enters the playable arena while the echo is alive.
      if(!(fx.seen instanceof Set)) fx.seen=new Set();

      for(const e of G.enemies){
        if(e.dead || e.kind==='shield' || fx.seen.has(e)) continue;
        const insideArena =
          e.x>=-VIEW.visW && e.x<=VIEW.visW &&
          e.z>=-VIEW.visH && e.z<=VIEW.visH;
        if(!insideArena) continue;

        fx.seen.add(e);
        const dx=e.x-fx.x, dz=e.z-fx.z;
        const len=Math.max(1,Math.hypot(dx,dz));
        const stun=e.type==='bahamut' ? 0.40 : (e.boss ? 1.0 : (e.elite||e.brain ? 3.0 : 5.0));
        e.stunT=Math.max(e.stunT||0,stun);
        e.roarFearT=Math.max(e.roarFearT||0,stun);
        e.roarFearSeed=Math.random()*Math.PI*2;
        e.roarFearDx=dx/len;
        e.roarFearDz=dz/len;
        if(!e.roarFearPose){
          e.roarFearPose={rx:e.mesh.rotation.x,rz:e.mesh.rotation.z};
        }
        if((e.boss||e.elite||e.brain||Math.random()<0.18)){
          floater('!',e.x,e.z,'lionPunch',Math.max(24,e.r?e.r*1.8:24));
        }
      }

      if(fx.t>=fx.nextPulse && fx.pulseIndex<5){
        const i=fx.pulseIndex++;
        const fade=1-i/5;
        const r=fx.r*(0.90+i*0.028);
        spawnRadiusRing(fx.x,fx.z,r,i%2?0xffe28a:0xffcf4d,0.78+fade*0.18);
        fx.nextPulse+=0.68+0.08*i;
        G.shake=Math.max(G.shake,0.035+0.025*fade);
      }
      if(fx.t>=fx.life) fx.dead=true;
    }
    else if(fx.kind==='apexQuake'){
      const owner=fx.owner;
      if(!owner || owner.dead){ sceneRemove(fx.mesh); fx.dead=true; continue; }
      fx.x=owner.x; fx.z=owner.z;
      fx.mesh.position.x=fx.x; fx.mesh.position.z=fx.z;
      const k=clamp(fx.t/fx.life,0,1);
      fx.mesh.scale.setScalar(fx.r/24*(1+0.07*Math.sin(fx.t*10)));
      fx.mat.opacity=0.46*(1-k*0.58);
      fx.nextShock-=dt;
      if(fx.nextShock<=0){
        fx.nextShock+=fx.shockEvery||0.72;
        spawnRadiusRing(fx.x,fx.z,fx.r*(0.82+Math.random()*0.12),0x9b704e,0.48);
        G.shake=Math.max(G.shake,0.20);
        const h=G.hero;
        if(h && !h.dead && dist2(h.x,h.z,fx.x,fx.z)<(fx.r+G.heroR)*(fx.r+G.heroR)){
          damageHero(fx.shockDmg||6,{sourceX:fx.x,sourceZ:fx.z,kb:85,area:true});
          burst(h.x,5,h.z,0xc99a66,3,38,0.20,0.14);
        }
      }
      // Enemy GRIZZ may still steal a few loose XP during Bulwark, but the quake has a
      // hard siphon budget. It cannot turn a dense late-game XP field into infinite healing.
      // Ingredients are not XP and are never absorbed.
      if((fx.absorbedXp||0)<(fx.absorbCap||6)){
        for(const o of G.orbs){
          if(o.dead || !isXpOrb(o)) continue;
          const dx=fx.x-o.x,dz=fx.z-o.z,d=Math.max(1,Math.hypot(dx,dz));
          if(d>175) continue;
          const pull=(70+(1-d/175)*150)*dt;
          o.x+=dx/d*pull; o.z+=dz/d*pull;
          if(d<18){
            o.dead=true;
            fx.absorbedXp=(fx.absorbedXp||0)+1;
            const before=owner.hp;
            owner.hp=Math.min(owner.maxHp,owner.hp+18);
            if(owner.hp>before) floater('ABSORB +'+Math.round(owner.hp-before),owner.x,owner.z,'heal');
            burst(owner.x,8,owner.z,0x9ceb5a,5,50,0.30,0.18);
            if(fx.absorbedXp>=(fx.absorbCap||6)) break;
          }
        }
      }
      if(Math.random()<dt*8){
        const a=Math.random()*Math.PI*2,rr=Math.sqrt(Math.random())*fx.r;
        burst(fx.x+Math.cos(a)*rr,4,fx.z+Math.sin(a)*rr,0xb9895e,2,42,0.34,0.22);
      }
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='quake'){
      const k = fx.t/fx.life;
      fx.mesh.scale.setScalar(fx.r/24 * (1 + 0.06*Math.sin(fx.t*9)));
      fx.mat.opacity = 0.5*(1-k*0.6);
      if((fx.shake||0)>0) G.shake=Math.max(G.shake, fx.shake*(0.34+0.66*(1-k)));

      // Every visible ground ripple is a real aftershock. Damage and micro-stagger are
      // synchronized to the ring so each damage tick has visible tremor feedback.
      let aftershock=false;
      fx.aftershockT=(fx.aftershockT||0)+dt;
      const aftershockEvery=fx.aftershockEvery||0.72;
      if(fx.aftershockT>=aftershockEvery){
        fx.aftershockT-=aftershockEvery;
        aftershock=true;
        spawnRadiusRing(fx.x,fx.z,fx.r*(0.82+0.12*Math.sin(fx.t*1.7)),0xc99a66,0.52);
        G.shake=Math.max(G.shake,0.18*(1-k*0.45));
      }
      if(Math.random() < dt*9){
        const a = Math.random()*Math.PI*2, rr = Math.sqrt(Math.random())*fx.r;
        burst(fx.x + Math.cos(a)*rr, 5, fx.z + Math.sin(a)*rr, 0xc99a66, 2, 50, 0.5, 0.3);
      }
      for(const e of G.enemies){
        if(e.dead) continue;
        if(dist2(e.x,e.z,fx.x,fx.z) < fx.r*fx.r){
          if(aftershock){
            const a=Math.random()*Math.PI*2;
            damageEnemy(e,fx.aftershockDamage||6,{dirx:Math.cos(a),dirz:Math.sin(a),kb:24,show:false,quiet:true});
            if(!e.dead){
              // Tiny repeated interruptions make the quake feel physical without copying
              // KING'S ROAR's long stun identity without copying TALON's extreme displacement.
              const classScale=e.type==='bahamut'?0.12:e.boss?0.22:(e.elite||e.brain)?0.50:1;
              e.stunT=Math.max(e.stunT||0,0.12*classScale);
              burst(e.x,Math.max(5,e.r*0.35),e.z,0xd7b07b,2,32,0.22,0.14);
            }
          }
          if(fx.t<=(fx.slowLife??3.0)) e.slowT=Math.max(e.slowT,0.35);
        }
      }
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='bramble'){
      if(fx.zoneMesh) fx.zoneMesh.material.opacity = 0.30 + 0.20*Math.abs(Math.sin(fx.t*2.6));
      const h=G.hero;
      const stepR=rootyBrambleStepR();
      if(fx.rootyOwned && h && !h.dead && dist2(h.x,h.z,fx.x,fx.z)<stepR*stepR && awakenRootyBramble(fx)) continue;
      for(const e of G.enemies){
        if(e.dead) continue;
        if(dist2(e.x,e.z,fx.x,fx.z) < 16*16){
          e.slowT = Math.max(e.slowT, 0.8);
          e.hitCd = 0.5;
          if(Math.random()<dt*4){ const d=8*G.hero.mods.summon; damageEnemy(e,d,{show:true,quiet:true}); }
        }
      }
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='spiketrap'){
      for(const e of G.enemies){
        if(e.dead || e.boss) continue;
        if(dist2(e.x,e.z,fx.x,fx.z) < 18*18){
          e.slowT = Math.max(e.slowT, 0.8);
          if(Math.random()<dt*2){ damageEnemy(e,fx.dmg,{show:true,quiet:true}); }
        }
      }
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='stinkbug'){
      fx.mesh.position.y = 4 + Math.abs(Math.sin(fx.t*6))*2;
      if(fx.t>=fx.life){
        explodeDamage(fx.x, fx.z, 70, 30, 0x7ac74a);
        addCloud(fx.x, fx.z);
        sceneRemove(fx.mesh); fx.dead=true;
      }
    }
    else if(fx.kind==='laserSight'){
      const owner=fx.owner;
      if(!owner || owner.dead || fx.t>=fx.life){
        if(owner && owner.laserSight===fx.mesh) owner.laserSight=null;
        sceneRemove(fx.mesh); fx.dead=true;
      } else if(fx.mesh?.material){
        fx.mesh.material.opacity=0.30+0.28*Math.abs(Math.sin(G.time*12));
      }
    }
    else if(fx.kind==='valPuff'){
      const k=clamp(fx.t/fx.life,0,1);
      const pop=Math.sin(Math.min(1,k)*Math.PI);
      for(let i=0;i<fx.mesh.children.length;i++){
        const m=fx.mesh.children[i];
        const d=m.userData?.puffDir;
        if(d){
          m.position.x+=d.x*28*dt;
          m.position.z+=d.z*28*dt;
          m.position.y+=d.lift*8*dt;
          m.scale.setScalar(0.82+k*0.95);
        }else{
          m.scale.setScalar(0.75+pop*1.55+k*0.45);
        }
      }
      for(const mat of fx.mats||[]) mat.opacity=Math.max(0,0.92*(1-k));
      if(fx.t>=fx.life){ sceneRemove(fx.mesh); fx.dead=true; }
    }
    else if(fx.kind==='valPanic'){
      const radius=Math.min(fx.maxR,fx.t*fx.speed);
      fx.ringT=(fx.ringT||0)-dt;
      if(fx.ringT<=0){
        fx.ringT=0.14;
        spawnRadiusRing(fx.x,fx.z,Math.max(28,radius),fx.hostile?0xff70ad:0xffa6d0,0.24);
      }
      for(const rec of fx.targets){
        const e=rec.e;
        if(rec.done || !e || e.dead || rec.d>radius) continue;
        rec.done=true;
        const ex=e.x,ez=e.z;
        if(!removeValPanicTarget(e,{reward:!fx.hostile})) continue;
        // The ripple does not silently delete a minion: every conversion gets a large
        // frosting-cloud PUFF at the exact target, then the bakery object is revealed from it.
        spawnValTransformPuff(ex,ez,fx.hostile);
        if(fx.hostile){
          if(fx.source && !fx.source.dead) spawnApexValCake(fx.source,ex,ez,{life:18,heal:120});
        }else{
          if(Math.random()<0.18) spawnValCake(ex,ez,{life:42,pickupDelay:0.30,spread:14,minR:3});
          else spawnValIngredient(ex,ez,{life:29,pickupDelay:0.24,spread:15,minR:3});
        }
      }
      if(fx.t>=fx.life || fx.targets.every(r=>r.done||!r.e||r.e.dead)) fx.dead=true;
    }
    else if(fx.kind==='valCake'){
      const remain=fx.life-fx.t;
      fx.pickupDelay=Math.max(0,(fx.pickupDelay||0)-dt);
      if(fx.mesh?.userData?.flame){
        const flame=fx.mesh.userData.flame;
        flame.scale.set(0.72+Math.sin(G.time*12)*0.08,1.18+Math.abs(Math.sin(G.time*14))*0.20,0.72+Math.sin(G.time*12)*0.08);
        if(flame.material) flame.material.opacity=0.82+0.12*Math.abs(Math.sin(G.time*15));
      }
      fx.mesh.position.y=4.2+Math.sin(G.time*3.2+fx.bobPhase)*0.42 + Math.max(0,0.8-fx.t)*1.5;
      fx.mesh.rotation.y += dt*0.55;
      const cakeMaturity=clamp(fx.t/VAL_CAKE_PRIME_AGE,0,1);
      fx.mesh.scale.setScalar(0.93+cakeMaturity*0.07);
      if(cakeMaturity>=1 && !fx.primeShown){
        fx.primeShown=true;
        floater('⏱ PRIME',fx.x,fx.z,'heal');
      }
      fx.mesh.visible = remain>5 || Math.floor(remain*5)%2===0;
      for(const e of G.enemies){
        if(e.dead || e.kind==='shield') continue;
        const rr=fx.r + e.r*0.72;
        let dx=e.x-fx.x, dz=e.z-fx.z;
        let d2=dx*dx+dz*dz;
        if(d2>=rr*rr) continue;
        let d=Math.sqrt(d2);
        if(d<0.001){ const a=Math.random()*Math.PI*2; dx=Math.cos(a); dz=Math.sin(a); d=1; }
        const ux=dx/d, uz=dz/d;
        const push=(rr-d)+0.12;
        e.x += ux*push;
        e.z += uz*push;
        e.kbx += ux*(e.boss?28:72);
        e.kbz += uz*(e.boss?28:72);
        e.slowT=Math.max(e.slowT,0.18);
        e.mesh.position.x=e.x; e.mesh.position.z=e.z;
        if(Math.random()<dt*5) burst(e.x,5,e.z,0xffd9ea,1,24,0.18,0.12);
      }
      const h=G.hero;
      if(h && !h.dead && fx.pickupDelay<=0 && dist2(h.x,h.z,fx.x,fx.z) < (fx.pickupR+G.heroR*0.40)*(fx.pickupR+G.heroR*0.40)){
        AUD.xp();
        const cakeHeal=valCakeHealAtAge(fx.t);
        healHero(cakeHeal);
        addExp(3);
        G.score += 3;
        G.gold += 3;
        burst(fx.x,8,fx.z,0xffb7d8,14,100,0.48,0.30);
        floater((fx.t>=VAL_CAKE_PRIME_AGE?'PRIME CAKE +':'CAKE +')+cakeHeal+' HP',h.x,h.z,'heal');
        sceneRemove(fx.mesh); fx.dead=true;
      } else if(fx.t>=fx.life){
        sceneRemove(fx.mesh); fx.dead=true;
      }
    }
    else if(fx.kind==='dblshot'){
      if(fx.t>=trainingInterval(0.1)){ fireShot(); fx.dead=true; }
    }
  }
  G.effects = G.effects.filter(f=>!f.dead);
}

// ---------------- Perk actives (timed) ----------------
function updatePerkActives(dt){
  const h = G.hero;
  const timerDt=trainingTimerDt(dt);
  // game (see the NOTE above the PERKS table) — keep it out. Readding it breaks parity.
  if(G.char?.id==='rooty'){
    h.rootyBrambleT=(h.rootyBrambleT||0)+timerDt;
    const waiting=G.effects.filter(f=>!f.dead&&f.kind==='bramble'&&f.rootyPassive).length;
    if(h.rootyBrambleT>=7 && waiting<3){
      h.rootyBrambleT-=7;
      // Never spawn a bramble already inside ROOTY's own step zone: it would convert on the same
      // frame it appeared, so the player would never see the trap or make a choice. The garden
      // starts just outside the step radius (a small margin) and stays reachable - 38-68 units
      // instead of the old 42-94, so it is something you use mid-fight rather than a detour.
      const minR = rootyBrambleStepR() + 8;
      const a=Math.random()*Math.PI*2, r=minR + Math.random()*30;
      const x=clamp(h.x+Math.cos(a)*r,-VIEW.visW+16,VIEW.visW-16);
      const z=clamp(h.z+Math.sin(a)*r,-VIEW.visH+16,VIEW.visH-16);
      spawnRootyBramble(x,z,14,true);
      burst(x,6,z,0x62c96b,6,45,0.28,0.18);
    }
  }
  if(h.mindpopper){
    h.mindpopperT = (h.mindpopperT||0) + timerDt;
    if(h.mindpopperT >= 2){
      const alive = G.enemies.filter(e=>!e.dead && ['goblingreen','goblinred','goblinblue','troll','box3','dummy','egger'].includes(e.type));
      if(alive.length){
        h.mindpopperT = 0;
        const t = alive[Math.floor(Math.random()*alive.length)];
        burst(t.x, 12, t.z, 0x7ac74a, 12, 90, 0.5, 0.4);
        for(let i=0;i<12;i++){
          const a = Math.random()*Math.PI*2;
          fireBullet(t.x, t.z, Math.cos(a), Math.sin(a), 10, {color:0x7ac74a, r:1.6, speed:200, life:1.5, kb:10, poison:poisonDps()*0.5});
        }
        killEnemy(t);
        spawnOrb(t.x, t.z);
        floater('POP!', t.x, t.z, 'crit');
      }
    }
  }
  if(h.stinkbug){
    h.stinkbugT = (h.stinkbugT||0) + timerDt;
    if(h.stinkbugT >= 4){
      h.stinkbugT = 0;
      const mesh = buildStinkBugMesh();
      mesh.position.set(h.x, 0, h.z);
      sceneAdd(mesh);
      G.summons.push({ kind:'stinkbug', mesh, t:8, alive:true, bornAt:G.time });
    }
  }
  if(h.burningroots){
    h.burningrootsT = (h.burningrootsT||0) + timerDt;
    if(h.burningrootsT >= 4){
      h.burningrootsT = 0;
      const lr = h.lightRadius;
      for(const e of G.enemies){
        if(e.dead) continue;
        if(dist2(e.x,e.z,h.x,h.z) < lr*lr){
          applyBurn(e,burnDps());
        }
      }
    }
  }
  if(h.bulletspikes){
    h.bulletspikesT = (h.bulletspikesT||0) + timerDt;
    if(h.bulletspikesT >= 3){
      h.bulletspikesT = 0;
      const n=12;
      for(let i=0;i<n;i++){
        const a=i/n*Math.PI*2;
        fireBullet(h.x, h.z, Math.cos(a), Math.sin(a), h.spikeDmg, {color:0x9fc7d8, r:1.8, speed:75, life:0.75, kb:15, slow:true, slowDur:5, pierce:99, spike:true});
      }
    }
  }
  if(h.slowspikes){
    h.slowspikesT = (h.slowspikesT||0) + timerDt;
    if(h.slowspikesT >= 3){
      h.slowspikesT = 0;
      const mesh = new THREE.Mesh(new THREE.ConeGeometry(9, 3, 10), new THREE.MeshBasicMaterial({color:0x9a9aa6, transparent:true, opacity:0.8}));
      mesh.rotation.x = -Math.PI/2;
      mesh.position.set(h.x, 1, h.z);
      sceneAdd(mesh);
      G.effects.push({ kind:'spiketrap', mesh, x:h.x, z:h.z, t:0, life:6, dmg:15 });
    }
  }
  if(h.knockbackKing){
    h.knockbackKingT = (h.knockbackKingT||0) + timerDt;
    if(h.knockbackKingT >= 4){
      h.knockbackKingT = 0;
      for(const e of G.enemies){
        if(e.dead) continue;
        const dx=e.x-h.x, dz=e.z-h.z; const len=Math.max(1,Math.hypot(dx,dz));
        if(len<200){ e.kbx+=dx/len*340; e.kbz+=dz/len*340; }
      }
      burst(h.x, 14, h.z, 0xcfd6e0, 16, 130, 0.6, 0.4);
    }
  }
}

// ---------------- Spawning drivers ----------------
// A "premium" (OP) loadout is a premium hero or a premium gun. Every loadout-scaled rule reads
// this one condition - the Insane pursuit speed / late berserk, the extra pressure stack, and the
// heal [+] value below - so they can never disagree about what counts as an OP run.
function opLoadoutEquipped(){
  return !!(G.char?.op || G.gun?.op);
}
function insaneBerserkEligible(){
  return opLoadoutEquipped();
}
function insaneBerserkStage(t=G.time){
  if(G.testMode || G.diff!=='Insane' || !insaneBerserkEligible() || t<INSANE_BERSERK_START || t>=WIN_TIME) return 0;
  return t>=INSANE_FINAL_BERSERK_START ? 2 : 1;
}
function insaneBerserkSpeedMult(t=G.time){
  const stage=insaneBerserkStage(t);
  return stage===2 ? INSANE_FINAL_BERSERK_SPEED : (stage===1 ? INSANE_BERSERK_SPEED : 1);
}
function updateInsaneBerserkCue(){
  const stage=insaneBerserkStage();
  if(stage===G._berserkStage) return;
  if(stage>G._berserkStage){
    const maxWait=stage===2?0.8:1.5;
    for(const s of G.spawners){
      if(G.time>=s.def.at && s.t>G.time+maxWait) s.t=G.time+maxWait;
    }
    if(stage===2){
      banner('☠ FINAL BERSERK · LAST 10s');
      G.shake=Math.max(G.shake,0.42);
    }else{
      banner('🔥 BERSERK · LAST 30s');
      G.shake=Math.max(G.shake,0.24);
    }
  }
  G._berserkStage=stage;
}
function initSpawners(){
  G.spawners = [];
  for(const s of SPAWNS){
    if(s.only && !s.only.includes(G.diff)) continue;
    G.spawners.push({ def:s, t:s.at, waveN:0 });
  }
  G.bossIdx = 0;
  G.bossSchedule = BOSS_SPAWNS[G.diff] || BOSS_SPAWNS.Normal;
  G.briarIdx=0;
  G.briarSchedule=BRIAR_BAHAMUT_SPAWNS[G.diff]||[];
  G.mIdx = 0; G.mGoldIdx = 0;
  G.scoreMilestones = [ [100,100],[200,200],[300,300],[400,400] ];
  G.goldMilestones = [ [25,25],[50,25],[75,25],[100,100],[125,35],[150,35],[175,35],[200,200],[225,45],[250,45],[275,45],[300,300],[325,55],[350,55],[375,55],[400,400],[425,200],[450,200] ];
}

function spawnAtSide(side){
  let x, z;
  if(side==='left'){ x = -(VIEW.visW+22); z = (Math.random()*2-1)*VIEW.visH; }
  else if(side==='right'){ x = VIEW.visW+22; z = (Math.random()*2-1)*VIEW.visH; }
  else if(side==='top'){ z = -(VIEW.visH+22); x = (Math.random()*2-1)*VIEW.visW; }
  else { z = VIEW.visH+22; x = (Math.random()*2-1)*VIEW.visW; }
  return { x, z };
}

function updateSpawning(dt){
  if(G.testMode) return;
  const t = G.time;
  for(const s of G.spawners){
    if(t < s.def.at) continue;
    if(t >= s.t){
      const sb = s.def.sb ? G.sb * Math.floor(t/10) : 0;
      s.waveN=(s.waveN||0)+1;
      const baseInterval=Math.max(0.05,s.def.interval-sb);
      // Premium pressure goes onto the arena side. Bahamut keeps a chaotic cadence,
      // difficulty comes from enemy stats and cadence without excessive mesh counts
      // with extra meshes every wave.
      const berserkStage=insaneBerserkStage(t);
      const pressure = G.dragonChaos ? DRAGON_CHAOS_PRESSURE : (G.opStackChallenge ? OP_STACK_PRESSURE : null);
      let cadenceMult = pressure ? pressure.cadence : 1;
      if(berserkStage===1) cadenceMult*=0.78;
      else if(berserkStage===2) cadenceMult*=0.58;
      s.t = t + Math.max(0.05,baseInterval*cadenceMult);
      let extraCount = (pressure && s.waveN % pressure.extraEvery === 0) ? 1 : 0;
      if(berserkStage===1 && s.waveN%4===0) extraCount+=1;
      else if(berserkStage===2 && s.waveN%2===0) extraCount+=1;
      const count = s.def.count + extraCount;
      let sides;
      if(s.def.side==='all') sides = ['left','right','top','bottom'];
      else if(s.def.side==='lr') sides = ['left','right'];
      else if(s.def.side==='tb') sides = ['top','bottom'];
      else sides = [['left','right','top','bottom'][Math.floor(Math.random()*4)]];
      for(let i=0;i<count;i++){
        const p = spawnAtSide(sides[i % sides.length]);
        spawnEnemy(s.def.type, p.x, p.z);
      }
    }
  }
  // bosses
  const sched = G.bossSchedule;
  while(G.bossIdx < sched.length && t >= sched[G.bossIdx].t){
    const b = sched[G.bossIdx]; G.bossIdx++;
    let w;
    if(b.x!=null && b.y!=null){
      const wx = b.x===460 ? VIEW.visW-12 : 0;
      const wz = b.y===300 ? VIEW.visH-12 : -(VIEW.visH-12);
      w = { x:wx, z:wz };
    }
    else if(b.e==='absorber') w = { x:-(VIEW.visW+22), z:(Math.random()*2-1)*VIEW.visH };
    else if(b.e==='laserdude') w = { x:(Math.random()*2-1)*VIEW.visW, z:-(VIEW.visH+22) };
    else w = { x:(Math.random()*2-1)*(VIEW.visW-38), z:-(VIEW.visH-28) };
    let spawned;
    if(b.e==='absorber'){
      spawned = spawnAbsorberWithShield(w.x, w.z, b.hp);
    } else {
      spawned = spawnEnemy(b.e, w.x, w.z, {hp:b.hp, bh:!!b.bh});
    }
    G.shake = Math.max(G.shake, 0.5);
    if(spawned && spawned.boss){
      AUD.boss();
      banner('⚠ BOSS ARRIVED · '+bossLabel(spawned.type));
    } else {
      banner('⚠ ELITE INCOMING');
    }
  }
  // Bahamut-specific anti-OP elite. A due encounter is skipped if one Warden is already alive;
  // only one control elite can be active at a time.
  if(G.dragonChaos){
    while(G.briarIdx<(G.briarSchedule?.length||0) && t>=G.briarSchedule[G.briarIdx]){
      G.briarIdx++;
      if(G.enemies.some(e=>!e.dead&&e.type==='briarwarden')) continue;
      const side=Math.random()<0.5?'left':'right', p=spawnAtSide(side);
      p.z=clamp((Math.random()*2-1)*VIEW.visH*0.55,-VIEW.visH+35,VIEW.visH-35);
      const w=spawnEnemy('briarwarden',p.x,p.z);
      G.shake=Math.max(G.shake,0.28);
      banner('🌿 BRIAR WARDEN · THORN CONTROL');
      floater('BRIAR WARDEN',w.x,w.z,'crit');
    }
  }

  // milestones
  while(G.mIdx < G.scoreMilestones.length && t >= G.scoreMilestones[G.mIdx][0]){
    G.score += G.scoreMilestones[G.mIdx][1] * G.mult; G.mIdx++;
    floater('+'+G.scoreMilestones[G.mIdx-1][1]+' SCORE', G.hero.x, G.hero.z, 'crit');
  }
  while(G.mGoldIdx < G.goldMilestones.length && t >= G.goldMilestones[G.mGoldIdx][0]){
    G.gold += G.goldMilestones[G.mGoldIdx][1]; G.mGoldIdx++;
  }
}

// ---------------- Secret OP final boss: BAHAMUT ----------------
function finalBahamutEligible(){
  return G.diff==='Insane' && !!G.char?.op && !!G.gun?.op && G.char?.id!=='bahamut';
}
function finalApexSevenEligible(){
  return G.diff==='Insane' && G.char?.id==='bahamut';
}

const APEX_SEVEN_FINAL={
  // The Seven trade projectile spam for aggressive roster pressure. Every member owns an
  // independent attack clock, so their rhythms can overlap naturally without a scripted team volley.
  // kb is body-mass resistance; knockMul is how visibly the hero reacts to player knockback.
  raja:{hp:11200,speed:80,r:16,kb:48,knockMul:1.00,color:0xd96b22,label:'RAJA'},
  mane:{hp:11700,speed:73,r:16,kb:52,knockMul:0.95,color:0xc88d35,label:'MANE'},
  grizz:{hp:14000,speed:55,r:19,kb:145,knockMul:0.52,color:0x6f4b32,label:'GRIZZ'},
  fang:{hp:9600,speed:85,r:15,kb:22,knockMul:1.28,color:0x707a85,label:'FANG'},
  foxy:{hp:6800,speed:100,r:13,kb:9,knockMul:1.62,color:0xe97836,label:'FOXY'},
  val:{hp:6200,speed:98,r:12.5,kb:11,knockMul:1.52,color:0xf28b6f,label:'VAL'},
  talon:{hp:7400,speed:98,r:14,kb:7,knockMul:1.78,color:0x8c633d,label:'TALON'},
};
function apexSevenRosterPhase(alive){
  return alive>=6?1:(alive>=4?2:3);
}
function apexSevenResolveDr(alive){
  // Late survivors become more dangerous, not exponentially more tedious to finish.
  if(alive>=6) return 0;
  if(alive>=4) return 0.05;
  if(alive===3) return 0.08;
  if(alive===2) return 0.10;
  return 0.12;
}
function apexSevenMoveMul(alive){
  if(alive>=6) return 1.00;
  if(alive>=4) return 1.18;
  if(alive===3) return 1.30;
  if(alive===2) return 1.38;
  return 1.46;
}
function apexSevenSpecialRate(alive){
  if(alive>=6) return 1.00;
  if(alive>=4) return 1.24;
  if(alive===3) return 1.42;
  if(alive===2) return 1.58;
  return 1.74;
}
function apexSevenLastStandDamage(alive){
  if(alive===1) return 1.38;
  if(alive===2) return 1.25;
  if(alive===3) return 1.10;
  return 1.00;
}
function apexSevenAttackRecovery(e,phase1,phase2,phase3){
  const alive=Math.max(1,e.apexAlive||7), phase=apexSevenRosterPhase(alive);
  let base=phase===1?phase1:(phase===2?phase2:phase3);
  if(alive===2) base*=0.90;
  else if(alive===1) base*=0.80;
  return base*(0.92+Math.random()*0.16);
}
function announceApexSevenState(remain){
  if(remain<=0) return;
  const phase=apexSevenRosterPhase(remain);
  G.apexSevenPhase=phase;
  let label='';
  if(remain===5) label='PHASE 2 · BERSERK';
  else if(remain===3) label='PHASE 3 · APEX UNLEASHED';
  else if(remain===2) label='LAST STAND · 2 APEX REMAIN';
  else if(remain===1){
    const last=G.enemies.find(o=>!o.dead&&o.apexFinalMember);
    label='FINAL APEX · '+(APEX_SEVEN_FINAL[last?.apexHeroId]?.label||'ONE REMAINS');
  }
  if(!label) return;
  banner('⚔ '+label);
  for(const o of G.enemies){
    if(o.dead||!o.apexFinalMember) continue;
    o.attackT=Math.max(o.attackT||0,0.68+Math.random()*0.28);
    spawnRadiusRing(o.x,o.z,48,APEX_SEVEN_FINAL[o.apexHeroId]?.color||0xffd166,0.48);
    floater(remain<=2?'LAST STAND':(phase===3?'UNLEASHED':'BERSERK'),o.x,o.z,'crit');
  }
  G.shake=Math.max(G.shake,phase===3?0.55:0.38);
}
function enemyKnockResponse(e){
  if(e?.apexBoss) return APEX_SEVEN_FINAL[e.apexHeroId]?.knockMul||1;
  if(e?.kind==='apexwolf') return 1.35;
  return 1;
}
function buildApexFinalMesh(id){
  const c=CHARACTERS.find(x=>x.id===id);
  const m=id==='talon'?buildBirdMesh():buildBeastMesh(id);
  if(c?.scale) m.scale.setScalar(c.scale*0.90);
  // Hero-model shadows already exist. Add one compact hostile ring so seven allies do not
  // visually blend into Bahamut's own projectiles and summons.
  const ring=new THREE.Mesh(new THREE.RingGeometry(10,12,28),new THREE.MeshBasicMaterial({color:0xff3f3f,transparent:true,opacity:0.68,depthWrite:false,side:THREE.DoubleSide}));
  ring.rotation.x=-Math.PI/2; ring.position.y=0.12; m.add(ring); m.userData.apexHostileRing=ring;
  return m;
}
function makeApexWorldHpBar(e){
  const group=new THREE.Group();
  const w=e.apexHeroId==='grizz'?34:(e.apexHeroId==='val'?28:30), h=3.2;
  const bg=new THREE.Mesh(new THREE.PlaneGeometry(w+2,h+1),new THREE.MeshBasicMaterial({color:0x140f12,transparent:true,opacity:0.88,depthTest:false,depthWrite:false}));
  const fillMat=new THREE.MeshBasicMaterial({color:APEX_SEVEN_FINAL[e.apexHeroId].color,transparent:true,opacity:0.96,depthTest:false,depthWrite:false});
  const fill=new THREE.Mesh(new THREE.PlaneGeometry(w,h),fillMat);
  bg.renderOrder=900; fill.renderOrder=901;
  fill.position.z=0.05;
  group.add(bg,fill);
  group.userData.fill=fill; group.userData.fullW=w;
  sceneAdd(group);
  e.apexHpBar=group;
  return group;
}
function updateApexWorldHpBar(e){
  const bar=e.apexHpBar; if(!bar) return;
  const ratio=clamp(e.hp/Math.max(1,e.maxHp),0,1), fill=bar.userData.fill, w=bar.userData.fullW;
  fill.scale.x=Math.max(0.001,ratio);
  fill.position.x=-(w*(1-ratio))*0.5;
  const lift=e.apexHeroId==='talon'&&e.apexAirborne?36:(e.apexHeroId==='grizz'?43:38);
  bar.position.set(e.x,(e.mesh.position.y||0)+lift,e.z);
  if(G.camera?.quaternion) bar.quaternion.copy(G.camera.quaternion);
}
function removeApexWorldHpBar(e){
  if(!e?.apexHpBar) return;
  sceneRemove(e.apexHpBar);
  e.apexHpBar=null;
}
function makeBossWorldHpBar(e){
  if(!e || e.bossWorldHpBar) return e?.bossWorldHpBar||null;
  const w=e.type==='bahamut'?42:Math.max(28,Math.min(38,(e.r||24)*1.05));
  const h=3.4;
  const color=ENEMIES[e.type]?.bossColor || ENEMIES[e.type]?.color || 0xff5a5a;
  const group=new THREE.Group();
  const bg=new THREE.Mesh(new THREE.PlaneGeometry(w+2,h+1),new THREE.MeshBasicMaterial({color:0x120d10,transparent:true,opacity:0.90,depthTest:false,depthWrite:false}));
  const fill=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.98,depthTest:false,depthWrite:false}));
  bg.renderOrder=900; fill.renderOrder=901; fill.position.z=0.05;
  group.add(bg,fill); group.userData.fill=fill; group.userData.fullW=w;
  sceneAdd(group); e.bossWorldHpBar=group;
  return group;
}
function updateBossWorldHpBar(e){
  const bar=e.bossWorldHpBar||makeBossWorldHpBar(e); if(!bar) return;
  const ratio=clamp(e.hp/Math.max(1,e.maxHp),0,1), fill=bar.userData.fill, w=bar.userData.fullW;
  fill.scale.x=Math.max(0.001,ratio);
  fill.position.x=-(w*(1-ratio))*0.5;
  const lift=e.type==='bahamut'?58:Math.max(30,(e.r||24)+15);
  bar.position.set(e.x,(e.mesh.position.y||0)+lift,e.z);
  if(G.camera?.quaternion) bar.quaternion.copy(G.camera.quaternion);
}
function removeBossWorldHpBar(e){
  if(!e?.bossWorldHpBar) return;
  sceneRemove(e.bossWorldHpBar);
  e.bossWorldHpBar=null;
}
function animateApexBeastEnemy(e,moving,dt){
  const mesh=e.mesh, feet=mesh?.userData?.feet, arms=mesh?.userData?.arms;
  if(!feet?.length) return;
  if(e.apexWalkBase==null){
    e.apexWalkBase={feet:feet.map(f=>({y:f.position.y,rx:f.rotation.x})),arms:(arms||[]).map(a=>({rx:a.rotation.x,rz:a.rotation.z}))};
    e.apexWalkPhase=Math.random()*Math.PI*2;
  }
  const k=1-Math.exp(-dt*(moving?18:10));
  if(moving) e.apexWalkPhase+=dt*(e.apexHeroId==='foxy'?14:e.apexHeroId==='fang'?12.5:e.apexHeroId==='grizz'?8.5:10.5);
  const ph=Math.sin(e.apexWalkPhase||0);
  for(let i=0;i<feet.length;i++){
    const f=feet[i],base=e.apexWalkBase.feet[i],wave=(i%2===0?ph:-ph);
    const ty=base.y+(moving?Math.max(0,wave)*(e.apexHeroId==='grizz'?2.4:3.1):0);
    const trx=base.rx+(moving?wave*(e.apexHeroId==='grizz'?0.18:0.28):0);
    f.position.y+=(ty-f.position.y)*k;
    f.rotation.x+=(trx-f.rotation.x)*k;
  }
  for(let i=0;i<(arms||[]).length;i++){
    const a=arms[i],base=e.apexWalkBase.arms[i],wave=(i%2===0?-ph:ph);
    a.rotation.x+=(base.rx+(moving?wave*0.42:0)-a.rotation.x)*k;
    a.rotation.z+=(base.rz+(moving?wave*0.045:0)-a.rotation.z)*k;
  }
  if(moving) mesh.position.y=Math.abs(ph)*(e.apexHeroId==='grizz'?0.7:1.1);
  else mesh.position.y+=(0-mesh.position.y)*k;
}
function animateApexTalonEnemy(e,dt,moving){
  e.apexFlightT=(e.apexFlightT||0)+dt;
  const phase=e.apexPhase||1, alive=e.apexAlive||7;
  const airDur=alive===1?4.2:(alive===2?4.0:(phase>=3?3.6:(phase>=2?3.0:2.7)));
  const groundDur=phase>=3?3.5:(phase>=2?3.8:4.0);
  const dur=e.apexAirborne?airDur:groundDur;
  if(e.apexFlightT>=dur){
    e.apexFlightT=0;
    e.apexAirborne=!e.apexAirborne;
    spawnRadiusRing(e.x,e.z,e.apexAirborne?28:44,e.apexAirborne?0x76e4ff:0xffa15a,0.42);
    floater(e.apexAirborne?'TAKEOFF':'LAND',e.x,e.z,'crit');
  }
  const wings=e.mesh?.userData?.wings||[];
  const feet=e.mesh?.userData?.feet||[];
  if(e.apexAirborne){
    e.mesh.position.y=14.0+Math.sin(G.time*8.5)*1.6;
    const flap=0.55+Math.sin(G.time*10.5)*0.42;
    if(wings[0]) wings[0].rotation.z=flap;
    if(wings[1]) wings[1].rotation.z=-flap;
    for(const f of feet) f.rotation.x=-0.34;
  }else{
    e.mesh.position.y=moving?Math.abs(Math.sin(G.time*11+e.x))*1.0:0;
    if(wings[0]) wings[0].rotation.z=1.34;
    if(wings[1]) wings[1].rotation.z=-1.34;
    for(const f of feet) f.rotation.x*=Math.max(0,1-dt*10);
  }
}
function spawnApexWolf(owner){
  if(!owner || owner.dead) return null;
  const living=G.enemies.filter(o=>!o.dead&&o.kind==='apexwolf'&&o.owner===owner).length;
  if(living>=4) return null;
  const phase=owner.apexPhase||1;
  const hp=phase>=3?620:520, speed=phase>=3?138:128;
  const mesh=buildCanineMesh(true);
  const a=Math.random()*Math.PI*2, rr=32+Math.random()*22;
  const x=clamp(owner.x+Math.cos(a)*rr,-VIEW.visW+18,VIEW.visW-18);
  const z=clamp(owner.z+Math.sin(a)*rr,-VIEW.visH+18,VIEW.visH-18);
  mesh.position.set(x,0,z); sceneAdd(mesh);
  const w={type:'apexwolf',kind:'apexwolf',owner,wolf:true,mesh,x,z,hp,maxHp:hp,r:11.5,speed,kb:8,kbx:0,kbz:0,slowT:0,slowPct:0.70,poison:null,burn:null,dead:false,hitCd:0,biteT:0.15+Math.random()*0.35,gait:Math.random()*Math.PI*2,biteAnim:0,slot:living};
  G.enemies.push(w);
  floater(phase>=3?'BERSERK WOLF':'WOLF',x,z,'crit');
  return w;
}
function updateApexWolfEnemy(e,dt,heroX,heroZ){
  // FANG's hostile wolves are part of his boss kit, not orphan enemies. Once their
  // packmaster falls, the remaining pack disperses instead of becoming immortal cleanup.
  if(!e.owner || e.owner.dead){ removeEnemyNoReward(e); return; }
  e.biteT=Math.max(0,(e.biteT||0)-dt);
  const dx=heroX-e.x,dz=heroZ-e.z,len=Math.max(1,Math.hypot(dx,dz)),ux=dx/len,uz=dz/len;
  let speed=e.speed*((e.slowT||0)>0?e.slowPct:1);
  const knockSpeed=Math.hypot(e.kbx||0,e.kbz||0);
  if(knockSpeed>14) speed*=Math.max(0.08,1-clamp((knockSpeed-14)/150,0,0.92));
  const stop=G.heroR+e.r+3;
  let moveSpeed=0;
  if(len>stop){
    const step=Math.min(len-stop,speed*dt);
    e.x+=ux*step+e.kbx*dt; e.z+=uz*step+e.kbz*dt; moveSpeed=step/Math.max(dt,0.001);
  }else{
    e.x+=e.kbx*dt; e.z+=e.kbz*dt;
  }
  e.kbx*=Math.exp(-8*dt); e.kbz*=Math.exp(-8*dt);
  e.mesh.position.x=e.x; e.mesh.position.z=e.z; e.mesh.rotation.y=Math.atan2(dx,dz);
  animateCanine(e,moveSpeed,dt);
  if(len<=stop+3 && e.biteT<=0){
    e.biteT=0.72; e.biteAnim=0.16;
    const biteBase=(e.owner?.apexPhase||1)>=3?22:18;
    damageHero(biteBase*apexSevenLastStandDamage(e.owner?.apexAlive||7),{sourceX:e.x,sourceZ:e.z,kb:105});
    burst(heroX,6,heroZ,0xaeb8c4,4,45,0.28,0.18);
  }
}
function spawnApexGrizzQuake(e){
  const phase=e.apexPhase||1, alive=e.apexAlive||7;
  const r=phase>=3?175:150;
  const life=phase>=3?6.0:5.3;
  const shockEvery=phase>=3?0.58:0.72;
  const shockDmg=(phase>=3?8:6)*apexSevenLastStandDamage(alive);
  const mesh=new THREE.Mesh(new THREE.CircleGeometry(24,40),new THREE.MeshBasicMaterial({color:0x9b704e,transparent:true,opacity:0.46,depthWrite:false,side:THREE.DoubleSide}));
  mesh.rotation.x=-Math.PI/2; mesh.position.set(e.x,1.1,e.z); sceneAdd(mesh);
  G.effects.push({kind:'apexQuake',owner:e,mesh,mat:mesh.material,x:e.x,z:e.z,r,t:0,life,nextShock:0.45,shockEvery,shockDmg,absorbedXp:0,absorbCap:6});
  spawnRadiusRing(e.x,e.z,r,0x9b704e,0.52);
  burst(e.x,7,e.z,0x6f4b32,24,120,0.46,0.28);
}

function spawnApexFinalHero(id,x,z){
  const d=APEX_SEVEN_FINAL[id], mesh=buildApexFinalMesh(id);
  mesh.position.set(x,0,z);
  const e={
    type:'apex_'+id, apexHeroId:id, apexFinalMember:true, kind:'apexhero', boss:false, apexBoss:true, elite:true, brain:true,
    mesh, hp:d.hp, maxHp:d.hp, r:d.r, speed:d.speed, kb:d.kb,
    x,z,kbx:0,kbz:0,slowT:0,slowPct:0.6,poison:null,burn:null,fireT:0,biteT:0,hitCd:0,
    dead:false,attackT:0.65+Math.random()*1.85,moveT:0,orbitDir:Math.random()<0.5?-1:1,phase2:false,phase3:false,apexPhase:1,apexAlive:7,
    apexAirborne:false,apexFlightT:Math.random()*1.5,packT:2.8+Math.random()*1.6,quakeT:2.5+Math.random()*1.7,pawT:0.45+Math.random()*0.35,valCakeT:3.4+Math.random()*1.5,valPanicT:8.0+Math.random()*2.0,
  };
  G.enemies.push(e);
  makeApexWorldHpBar(e);
  floater(d.label,x,z,'crit');
  return e;
}
function spawnApexSevenFinal(){
  if(G.finalBossSpawned) return;
  G.finalBossSpawned=true; G.finalBossActive=true; G.apexSevenActive=true; G.apexSevenDefeated=false; G.apexSevenPhase=1;
  // Bahamut's Insane finale stacks the Seven on top of the live survival run. Normal
  // waves, XP-bearing minions and existing hostile pressure remain active because
  // XP-bearing mobs remain important for level recovery and the rest of the run's build economy.
  const wx=Math.max(72,VIEW.visW*0.62), wz=Math.max(56,VIEW.visH*0.55);
  // Perimeter slots prevent entry overlap between Apex members.
  const specs=[
    ['raja',-wx,-wz*0.18], ['grizz',-wx*0.34,-wz*0.95], ['talon',wx*0.58,-wz*0.76],
    ['mane',wx,-wz*0.16], ['foxy',wx*0.74,wz*0.72], ['val',0,wz*0.96], ['fang',-wx*0.76,wz*0.70],
  ];
  for(const [id,x,z] of specs) spawnApexFinalHero(id,x,z);
  AUD.boss(); banner('⚔ FINAL APEX · THE SEVEN · 999s LIMIT'); G.shake=Math.max(G.shake,0.9);
  startNotice('FINAL EXAM ACTIVE · DEFEAT ALL SEVEN BEFORE 999s',{tone:'final',life:10000});
  spawnRadiusRing(0,0,Math.min(VIEW.visW,VIEW.visH)*0.72,0xffd166,1.15);
}
function apexHeroFire(e,count,arcDeg,speed,dmg,color,kb=0){
  const target=enemyPerceivedHeroTarget();
  const dx=target.x-e.x,dz=target.z-e.z,base=Math.atan2(dx,dz);
  for(let i=0;i<count;i++){
    const off=count>1?(i/(count-1)-0.5)*arcDeg*Math.PI/180:0, a=base+off;
    fireEnemyProjectile(e.x,e.z,Math.sin(a),Math.cos(a),{speed,dmg,kb,color,life:5.5,r:2.8});
  }
}
function updateApexFinalHero(e,dt,heroX,heroZ){
  const id=e.apexHeroId;
  const dx=heroX-e.x,dz=heroZ-e.z,len=Math.max(1,Math.hypot(dx,dz)),ux=dx/len,uz=dz/len;
  const aliveSeven=G.enemies.reduce((n,o)=>n+(!o.dead&&o.apexFinalMember?1:0),0);
  const rosterPhase=apexSevenRosterPhase(aliveSeven);
  const specialRate=apexSevenSpecialRate(aliveSeven);
  const lastStandDmg=apexSevenLastStandDamage(aliveSeven);
  e.apexAlive=aliveSeven;
  e.apexPhase=rosterPhase;
  e.phase2=rosterPhase>=2;
  e.phase3=rosterPhase>=3;

  // Roster phases replace the old personal-low-HP power-up. The Seven still attack on
  // independent clocks; losing members makes each survivor more aggressive, not coordinated.
  const haste=apexSevenMoveMul(aliveSeven);
  e.attackT-=dt;
  e.moveT-=dt;
  e.packT=Math.max(0,(e.packT||0)-dt*specialRate);
  e.quakeT=Math.max(0,(e.quakeT||0)-dt*specialRate);
  e.pawT=Math.max(0,(e.pawT||0)-dt*specialRate);
  e.valCakeT=Math.max(0,(e.valCakeT||0)-dt*specialRate);
  e.valPanicT=Math.max(0,(e.valPanicT||0)-dt*specialRate);
  if(e.moveT<=0){ e.moveT=0.55+Math.random()*0.75; if(Math.random()<0.42)e.orbitDir*=-1; }

  // PHASE 3 upgrades signatures instead of simply flooding the arena with basic shots.
  if(id==='fang' && e.packT<=0){
    e.packT=e.phase3?5.4:6.4;
    const wolves=e.phase3?3:2;
    for(let i=0;i<wolves;i++) spawnApexWolf(e);
    spawnRadiusRing(e.x,e.z,e.phase3?70:58,0xaeb8c4,0.40);
    floater(e.phase3?'PACK HOWL · BERSERK':'PACK HOWL',e.x,e.z,'crit');
  }

  if(id==='grizz' && e.quakeT<=0){
    e.quakeT=e.phase3?6.5:7.4;
    spawnApexGrizzQuake(e);
    floater(e.phase3?'BULWARK · UNLEASHED':'BULWARK',e.x,e.z,'crit');
  }

  // Enemy VAL never Cakefies living units. Her boss ult simply constructs hostile cover/healing cakes.
  if(id==='val' && e.valCakeT<=0){
    e.valCakeT=e.phase3?7.2:8.4;
    spawnApexValCake(e,null,null,{heal:e.phase3?240:180});
    floater('CAKE DROP',e.x,e.z,'crit');
  }
  if(id==='val' && e.valPanicT<=0){
    e.valPanicT=e.phase3?10.5:12.5;
    const cakeCount=e.phase3?3:2;
    let made=0;
    for(let i=0;i<cakeCount;i++){
      const a=(i/cakeCount)*Math.PI*2 + e.orbitDir*0.45;
      const rr=58+i*16;
      if(spawnApexValCake(e,e.x+Math.cos(a)*rr,e.z+Math.sin(a)*rr,{life:e.phase3?20:18,heal:e.phase3?180:130})) made++;
    }
    spawnRadiusRing(e.x,e.z,e.phase3?118:96,0xff79b5,0.46);
    burst(e.x,9,e.z,0xffd4e8,e.phase3?28:22,125,0.52,0.30);
    if(made>0) floater('BAKERY PANIC · CAKES ×'+made,e.x,e.z,'crit');
    else floater('BAKERY PANIC',e.x,e.z,'crit');
    G.shake=Math.max(G.shake,0.24);
  }

  let targetR=65;
  if(id==='fang') targetR=95;
  if(id==='foxy') targetR=145;
  if(id==='val') targetR=132;
  if(id==='talon') targetR=e.apexAirborne?150:112;
  if(id==='grizz') targetR=58;
  const radial=clamp((len-targetR)/45,-1,1);
  const orbit=id==='raja'||id==='grizz'?0.22:(id==='mane'?0.38:(id==='val'?1.02:0.82));
  let mx=(ux*radial + -uz*e.orbitDir*orbit)*e.speed*haste;
  let mz=(uz*radial +  ux*e.orbitDir*orbit)*e.speed*haste;
  if(id==='foxy'){ mx*=1.08; mz*=1.08; }
  if(id==='val'){ mx*=1.12; mz*=1.12; }
  if(id==='talon'){
    const flightMul=e.apexAirborne?(e.phase3?1.92:1.75):0.90;
    mx*=flightMul; mz*=flightMul;
  }
  const knockSpeed=Math.hypot(e.kbx||0,e.kbz||0);
  if(knockSpeed>12){
    const suppress=clamp((knockSpeed-12)/190,0,0.94);
    mx*=1-suppress; mz*=1-suppress;
  }
  e.x+=(mx+e.kbx)*dt; e.z+=(mz+e.kbz)*dt;
  e.kbx*=Math.exp(-8*dt); e.kbz*=Math.exp(-8*dt);
  e.mesh.position.x=e.x; e.mesh.position.z=e.z; e.mesh.rotation.y=Math.atan2(dx,dz);
  e.x=clamp(e.x,-VIEW.visW+18,VIEW.visW-18);
  e.z=clamp(e.z,-VIEW.visH+18,VIEW.visH-18);
  e.mesh.position.x=e.x; e.mesh.position.z=e.z;
  const moving=Math.hypot(mx,mz)>3 || Math.hypot(e.kbx,e.kbz)>8;
  if(id==='talon') animateApexTalonEnemy(e,dt,moving);
  else animateApexBeastEnemy(e,moving,dt);
  updateApexWorldHpBar(e);

  if(e.attackT<=0){
    // Independent personal rhythms remain intact in all three phases.
    if(id==='raja'){
      e.attackT=apexSevenAttackRecovery(e,1.55,1.40,1.24);
      const clawRange=e.phase3?112:94;
      if(len<clawRange){
        spawnClawMark(heroX,heroZ,Math.atan2(dx,dz),0xff3048,e.phase3?1.58:1.35);
        damageHero((e.phase3?39:31)*lastStandDmg,{sourceX:e.x,sourceZ:e.z,kb:e.phase3?225:185});
      } else apexHeroFire(e,e.phase3?3:2,e.phase3?22:15,270,(e.phase3?22:20)*lastStandDmg,0xff6a35,65);
    } else if(id==='mane'){
      if(len<96 && e.pawT<=0){
        e.pawT=e.phase3?0.96:(e.phase2?1.15:1.28);
        e.attackT=apexSevenAttackRecovery(e,1.50,1.36,1.20);
        spawnKingsPawMark(heroX,heroZ,Math.atan2(dx,dz));
        floater('💢',e.x,e.z,'lionPunch',34);
        damageHero((e.phase3?36:30)*lastStandDmg,{sourceX:e.x,sourceZ:e.z,kb:e.phase3?255:220});
        burst(heroX,7,heroZ,0xffd166,8,72,0.30,0.18);
      }else{
        e.attackT=apexSevenAttackRecovery(e,3.45,3.10,2.75);
        const roarR=e.phase3?128:105;
        spawnRadiusRing(e.x,e.z,roarR,0xffd166,0.38);
        if(len<roarR+7) damageHero((e.phase3?29:23)*lastStandDmg,{sourceX:e.x,sourceZ:e.z,kb:e.phase3?175:135,area:true});
        floater(e.phase3?"KING'S ROAR · UNLEASHED":"KING'S ROAR",e.x,e.z,'crit');
      }
    } else if(id==='grizz'){
      e.attackT=apexSevenAttackRecovery(e,2.18,1.95,1.72);
      const slamR=e.phase3?96:82;
      spawnRadiusRing(e.x,e.z,slamR,0x9b704e,0.34);
      burst(e.x,8,e.z,0x6f4b32,14,95,0.36,0.24);
      if(len<slamR+6) damageHero((e.phase3?32:26)*lastStandDmg,{sourceX:e.x,sourceZ:e.z,kb:e.phase3?330:285,area:true});
    } else if(id==='fang'){
      e.attackT=apexSevenAttackRecovery(e,1.78,1.60,1.40);
      apexHeroFire(e,e.phase3?4:3,e.phase3?38:34,225,(e.phase3?21:18)*lastStandDmg,0xb8c0c7,48);
    } else if(id==='foxy'){
      e.attackT=apexSevenAttackRecovery(e,1.28,1.15,1.02);
      apexHeroFire(e,e.phase3?2:1,e.phase3?8:0,390,(e.phase3?22:19)*lastStandDmg,0xff8a42,58);
      const dashKick=e.phase3?130:95;
      e.kbx+=-uz*e.orbitDir*dashKick; e.kbz+=ux*e.orbitDir*dashKick;
      if(e.phase3 && Math.random()<0.28) floater('FOX FOCUS',e.x,e.z,'crit');
    } else if(id==='val'){
      e.attackT=apexSevenAttackRecovery(e,1.48,1.33,1.18);
      apexHeroFire(e,e.phase3?3:2,e.phase3?24:20,335,(e.phase3?20:17)*lastStandDmg,0xff9cc9,52);
      const side=e.orbitDir*(e.phase3?145:(e.phase2?118:100));
      e.kbx+=-uz*side; e.kbz+=ux*side;
      if(Math.random()<0.24) floater('ZIP!',e.x,e.z,'dodge');
    } else if(id==='talon'){
      e.attackT=apexSevenAttackRecovery(e,1.68,1.51,1.34);
      const diveChance=e.phase3?0.72:0.60;
      if(e.apexAirborne && len<165 && Math.random()<diveChance){
        spawnRadiusRing(heroX,heroZ,e.phase3?68:58,0xffd35a,0.28);
        spawnDragonBeamFx(e.x,e.z,heroX,heroZ,0xdff8ff,e.phase3?1.9:1.5,0.18);
        damageHero((e.phase3?34:29)*lastStandDmg,{sourceX:e.x,sourceZ:e.z,kb:e.phase3?780:680,area:true});
        e.kbx-=ux*(e.phase3?185:150); e.kbz-=uz*(e.phase3?185:150);
        floater(e.phase3?'DIVE · UNLEASHED':'DIVE',e.x,e.z,'crit');
      } else apexHeroFire(e,3,28,270,(e.phase3?20:17)*lastStandDmg,0xffd35a,70);
    }
  }

  if(e.hitCd>0)e.hitCd-=dt;
  if(len<e.r+G.heroR && e.hitCd<=0 && !magnetPulled(e)){
    e.hitCd=0.7;
    damageHero(20*lastStandDmg,{sourceX:e.x,sourceZ:e.z,kb:id==='grizz'?180:(id==='talon'?150:95)});
  }
  const rr=e.mesh.userData.apexHostileRing;
  if(rr?.material) rr.material.opacity=0.45+0.28*Math.abs(Math.sin(G.time*5+e.x*0.03));
}
function spawnBahamutFinal(){
  if(G.finalBossSpawned) return;
  G.finalBossSpawned = true;
  G.finalBossActive = true;
  // Bahamut enters during the active survival run; existing minions and
  // normal spawners remain active so XP-, vamp- and crowd-dependent builds keep working.
  // Clear only hostile projectiles to make the boss entrance readable.
  for(const b of G.ebullets){
    if(!b.dead){ b.dead=true; sceneRemove(b.mesh); }
  }
  G.ebullets=[];
  const b=spawnEnemy('bahamut',0,-Math.max(45,VIEW.visH*0.52),{hp:36000,name:'BAHAMUT'});
  keepBossInArena(b);
  AUD.boss();
  banner('☠ FINAL APEX · BAHAMUT · 999s LIMIT');
  startNotice('FINAL EXAM ACTIVE · DEFEAT BAHAMUT BEFORE 999s',{tone:'final',life:10000});
  G.shake=Math.max(G.shake,0.75);
  spawnRadiusRing(b.x,b.z,125,0xffd166,1.25);
}
function spawnEnemyDragonBreathFx(e,dx,dz){
  const aimA=Math.atan2(dx,dz);
  const h=G.hero;
  let globalBlockDist=Infinity;

  // If physical friendly cover actually protects the hero, the entire visible flame fan stops
  // at that cover. Do not draw harmless fire behind a Thorn Guard / cake and imply a hit.
  if(h){
    const cakeHit=valCakeSegmentBlock(e.x,e.z,h.x,h.z,G.heroR*0.20);
    const thornHit=rootyThornGuardSegmentBlock(e.x,e.z,h.x,h.z,G.heroR*0.12);
    const cover=nearestFriendlyCoverHit(cakeHit,thornHit);
    if(cover){
      const hx=cover.hit.x??h.x,hz=cover.hit.z??h.z;
      globalBlockDist=Math.max(24,Math.hypot(hx-e.x,hz-e.z)-2);
    }
  }

  // AEGIS is hero-centered rather than world cover, but follows the same visual rule.
  if(h && aegisGuardCoversSource(e.x,e.z)){
    const vx=h.x-e.x,vz=h.z-e.z,d=Math.hypot(vx,vz);
    if(d>0.001 && d<=180){
      const ux=vx/d,uz=vz/d;
      if(ux*dx+uz*dz>=Math.cos(80*Math.PI/360)) globalBlockDist=Math.min(globalBlockDist,Math.max(28,d-16));
    }
  }

  for(const off of [-0.24,-0.12,0,0.12,0.24]){
    const laneA=aimA+off,laneDx=Math.sin(laneA),laneDz=Math.cos(laneA);
    let blockDist=globalBlockDist;

    // Also clip individual flame lanes against any friendly cover they physically intersect.
    const endX=e.x+laneDx*180,endZ=e.z+laneDz*180;
    const cakeLane=valCakeSegmentBlock(e.x,e.z,endX,endZ,0);
    const thornLane=rootyThornGuardSegmentBlock(e.x,e.z,endX,endZ,0);
    const laneCover=nearestFriendlyCoverHit(cakeLane,thornLane);
    if(laneCover){
      const lx=laneCover.hit.x??endX,lz=laneCover.hit.z??endZ;
      blockDist=Math.min(blockDist,Math.max(24,Math.hypot(lx-e.x,lz-e.z)-2));
    }

    const grp=new THREE.Group(),mats=[];
    for(let i=0;i<6;i++){
      const hot=i<2, travel=18+i*17;
      const radius=4.5+i*1.7,scaleZ=1.82+i*0.16;
      // Use the puff's real forward size, not only its center, so flame geometry cannot poke
      // through the blocker even when the gameplay hit was correctly stopped.
      if(Number.isFinite(blockDist) && travel+radius*scaleZ>blockDist+2) continue;
      const mat=new THREE.MeshBasicMaterial({color:hot?0xffd36a:(i<4?0xff7625:0xff3918),transparent:true,opacity:hot?0.58:0.42,depthWrite:false});
      mats.push(mat);
      const puff=new THREE.Mesh(new THREE.SphereGeometry(radius,8,6),mat);
      puff.scale.set(0.92,0.68,scaleZ); puff.position.set((i%2?1:-1)*(0.7+i*0.28),5+i*0.28,travel); grp.add(puff);
    }
    grp.position.set(e.x,0,e.z); grp.rotation.y=laneA; sceneAdd(grp);
    G.effects.push({kind:'flamejet',mesh:grp,mats,t:0,life:0.48});
  }
  if(Number.isFinite(globalBlockDist)){
    const bx=e.x+dx*globalBlockDist,bz=e.z+dz*globalBlockDist;
    burst(bx,10,bz,0x74d9ff,8,86,0.34,0.22);
    burst(bx,10,bz,0xff8a32,6,68,0.30,0.20);
    spawnRadiusRing(bx,bz,20,0xb9f2ff,0.16);
  }
}
function bahamutEnemyBreathHit(e,dx,dz,phase){
  const vx=G.hero.x-e.x,vz=G.hero.z-e.z,d=Math.hypot(vx,vz);
  if(d>180 || d<0.001) return;
  const ux=vx/d,uz=vz/d;
  if(ux*dx+uz*dz < Math.cos(80*Math.PI/360)) return;

  // Physical friendly cover must actually sit between Bahamut and the hero.
  const cakeHit=valCakeSegmentBlock(e.x,e.z,G.hero.x,G.hero.z,G.heroR*0.20);
  const thornHit=rootyThornGuardSegmentBlock(e.x,e.z,G.hero.x,G.hero.z,G.heroR*0.12);
  const cover=nearestFriendlyCoverHit(cakeHit,thornHit);
  if(cover){
    friendlyCoverFeedback(cover,true);
    return;
  }
  damageHero(phase===3?44:phase===2?39:34,{sourceX:e.x,sourceZ:e.z,flame:true,area:true});
}
function bahamutRadial(e,count=7,speed=108,dmg=30,offset=0,homingDelay=0.14){
  // A real radial magic pattern: every orb first commits to its visible spoke, then bends
  // toward the hero after a short delay. The opening starburst is always dodge-readable.
  for(let i=0;i<count;i++){
    const a=offset+i/count*Math.PI*2;
    fireEnemyProjectile(e.x,e.z,Math.sin(a),Math.cos(a),{
      speed,dmg,color:0xc579ff,life:6.5,r:5.4,scale:1.12,
      softHoming:true,homingDelay,homingTurn:0.92,homingLife:1.35,
    });
  }
}
function spawnBahamutRushPath(e,dx,dz,dist=138,color=0xff755f){
  for(let d=28;d<=dist;d+=28) spawnRadiusRing(e.x+dx*d,e.z+dz*d,15,color,0.48);
}
function spawnBahamutClawPreview(e,dx,dz){
  const base=Math.atan2(dx,dz);
  for(const off of [-0.48,0,0.48]){
    const a=base+off;
    spawnRadiusRing(e.x+Math.sin(a)*58,e.z+Math.cos(a)*58,17,0xd8a94f,0.40);
  }
}
function spawnBahamutAttackTell(e,dx,dz,range,arcDeg,color,life,label=''){
  const grp=new THREE.Group();
  const fillMat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.16,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
  const lineMat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.72,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
  const fill=new THREE.Mesh(makeSkillSectorGeometry(range,arcDeg,28),fillMat);
  fill.position.y=0.70; grp.add(fill);
  const arrow=new THREE.Mesh(makeSkillArrowGeometry(range,3.5,16,10),lineMat);
  arrow.position.y=0.82; grp.add(arrow);
  grp.position.set(e.x,0,e.z);
  grp.rotation.y=Math.atan2(dx,dz);
  sceneAdd(grp);
  G.effects.push({kind:'beamfx',mesh:grp,t:0,life});
  if(label) floater(label,e.x,e.z,'crit',30);
}

function bahamutEnemyApexImpact(e,dx,dz){
  const ix=e.x+dx*20, iz=e.z+dz*20;
  spawnRadiusRing(ix,iz,108,0xffd166,0.66);
  burst(ix,12,iz,0xb86cff,38,210,0.82,0.52);
  if(dist2(ix,iz,G.hero.x,G.hero.z)<(108+G.heroR)**2){
    damageHero(24,{sourceX:e.x,sourceZ:e.z,area:true});
  }
  bahamutRadial(e,8,118,31,Math.PI/8);
  spawnEnemyDragonBreathFx(e,dx,dz);
  bahamutEnemyBreathHit(e,dx,dz,3);
}
function bahamutPickAttack(e,dist){
  const phase=e.phase;
  const target=enemyPerceivedHeroTarget(), targetX=target.x, targetZ=target.z;
  e.combo=(e.combo||0)+1;
  let pick='';
  // Phase 3 uses the rush-and-arsenal motif with boss-specific timing.
  // relying on an ordinary rush that can be mistaken for teleporting. Force the first
  // phase-3 turn, then repeat about every fifth attack.
  if(phase>=3 && (e.forceApexUlt || e.combo>=5)){
    pick='apex';
    e.forceApexUlt=false;
    e.combo=0;
  } else {
    let pool = dist<72 ? ['sweep','rush','fan','radial'] : dist>155 ? ['rush','fan','lance','radial'] : ['fan','sweep','rush','lance','radial'];
    if(phase>=2) pool.push('radial');
    if(phase>=3) pool.push('lance','radial');
    if((e.rushCd||0)>0) pool=pool.filter(x=>x!=='rush');
    pool=pool.filter(x=>x!==e.lastAttack || pool.length<2);
    pick=pool[Math.floor(Math.random()*pool.length)];
  }
  e.lastAttack=pick;
  if(pick==='apex'){
    const dx=targetX-e.x,dz=targetZ-e.z,len=Math.max(1,Math.hypot(dx,dz));
    e.action={kind:'apexWind',t:0.72,dx:dx/len,dz:dz/len,startX:e.x,startZ:e.z};
    e.rushCd=Math.max(e.rushCd||0,5.6);
    banner('BAHAMUT · FINAL APEX RUSH');
    spawnRadiusRing(e.x,e.z,74,0xb86cff,0.72);
    spawnBahamutRushPath(e,dx/len,dz/len,150,0xc48cff);
  } else if(pick==='rush'){
    const dx=targetX-e.x,dz=targetZ-e.z,len=Math.max(1,Math.hypot(dx,dz));
    e.action={kind:'rushWind',t:phase>=3?0.38:0.50,dx:dx/len,dz:dz/len,startX:e.x,startZ:e.z};
    e.rushCd=phase===1?7.2:phase===2?6.2:5.4;
    spawnRadiusRing(e.x,e.z,52,0xff7a55,0.5);
    spawnBahamutRushPath(e,dx/len,dz/len,phase>=3?138:120,0xff755f);
  } else if(pick==='sweep'){
    const dx=targetX-e.x,dz=targetZ-e.z,len=Math.max(1,Math.hypot(dx,dz));
    const wind=phase>=3?0.44:phase===2?0.50:0.58;
    e.action={kind:'sweepWind',t:wind,dx:dx/len,dz:dz/len};
    // Exact 116° / 100-range melee danger is shown before the claws land.
    spawnBahamutAttackTell(e,dx/len,dz/len,100,116,0xd8a94f,wind,'CLAW!');
    spawnBahamutClawPreview(e,dx/len,dz/len);
  } else if(pick==='fan'){
    const dx=targetX-e.x,dz=targetZ-e.z,len=Math.max(1,Math.hypot(dx,dz));
    const wind=phase>=3?0.48:phase===2?0.56:0.66;
    e.action={kind:'breathWind',t:wind,dx:dx/len,dz:dz/len};
    // Breath damages an 80° cone out to 180, so the warning uses that exact footprint.
    spawnBahamutAttackTell(e,dx/len,dz/len,180,80,0xff7a28,wind,'BREATH!');
  } else if(pick==='lance'){
    // Three visible beam lanes plus moving spear projectiles: modern readable lance identity.
    const dx=targetX-e.x,dz=targetZ-e.z,base=Math.atan2(dx,dz);
    for(const off of [-0.12,0,0.12]){
      const a=base+off, bx=Math.sin(a), bz=Math.cos(a);
      spawnDragonBeamFx(e.x,e.z,e.x+bx*255,e.z+bz*255,0x7dd8ff,2.8,0.20);
      fireEnemyProjectile(e.x,e.z,bx,bz,{speed:phase>=3?235:205,dmg:phase>=3?35:30,color:0x7dd8ff,life:5,laser:true});
    }
    e.attackT=phase>=3?0.72:0.98;
  } else if(pick==='radial'){
    const count=phase===1?6:phase===2?7:8;
    const offset=Math.random()*Math.PI*2;
    const wind=phase===1?0.54:phase===2?0.46:0.38;
    e.action={kind:'radialWind',t:wind,count,offset};
    banner('BAHAMUT · ARCANE ORBS ×'+count);
    spawnRadiusRing(e.x,e.z,70,0xc579ff,wind);
    for(let i=0;i<count;i++){
      const a=offset+i/count*Math.PI*2;
      spawnRadiusRing(e.x+Math.sin(a)*44,e.z+Math.cos(a)*44,9,0xc579ff,wind*0.92);
    }
  }
}
function updateBahamut(e,dt,heroX,heroZ){
  const hp01=Math.max(0,e.hp/e.maxHp);
  const phase=hp01>0.66?1:hp01>0.33?2:3;
  if(phase!==e.phase){
    e.phase=phase; e.attackT=Math.min(e.attackT,0.45); e.orbitDir*=-1;
    if(phase===3){ e.forceApexUlt=true; e.combo=0; }
    banner('BAHAMUT · PHASE '+phase);
    spawnRadiusRing(e.x,e.z,95,phase===3?0xff5a5a:0xb86cff,0.8);
  }
  e.hitHeroT=Math.max(0,(e.hitHeroT||0)-dt);
  e.rushCd=Math.max(0,(e.rushCd||0)-dt);
  e.weaponSpin=(e.weaponSpin||0)+dt*(phase===3?4.5:2.8);
  if(e.mesh.userData.bahamutOrbit) e.mesh.userData.bahamutOrbit.rotation.z=e.weaponSpin;

  // Active telegraphed melee / rush states.
  if(e.action){
    e.action.t-=dt;
    if(e.action.kind==='radialWind'){
      animateBahamutGait(e.mesh,false,dt,1);
      if(Math.random()<dt*14) burst(e.x,10,e.z,0xc579ff,2,58,0.25,0.16);
      if(e.action.t<=0){
        const count=e.action.count||6, offset=e.action.offset||0;
        bahamutRadial(e,count,phase===3?120:phase===2?112:104,phase===3?34:phase===2?30:27,offset,phase===3?0.10:phase===2?0.13:0.16);
        e.action=null; e.attackT=phase===3?0.84:phase===2?0.98:1.10;
      }
      return;
    }
    if(e.action.kind==='breathWind'){
      e.mesh.rotation.y=Math.atan2(e.action.dx,e.action.dz);
      animateBahamutGait(e.mesh,false,dt,1);
      if(Math.random()<dt*22) burst(e.x+e.action.dx*13,25,e.z+e.action.dz*13,0xff8a32,2,42,0.20,0.14);
      if(e.action.t<=0){
        spawnEnemyDragonBreathFx(e,e.action.dx,e.action.dz);
        bahamutEnemyBreathHit(e,e.action.dx,e.action.dz,phase);
        e.action={kind:'breathHold',t:0.52,dx:e.action.dx,dz:e.action.dz};
      }
      return;
    }
    if(e.action.kind==='breathHold'){
      e.mesh.rotation.y=Math.atan2(e.action.dx,e.action.dz);
      animateBahamutGait(e.mesh,false,dt,1);
      if(e.action.t<=0){ e.action=null; e.attackT=phase===3?0.76:0.98; }
      return;
    }
    if(e.action.kind==='apexWind'){
      e.mesh.rotation.y=Math.atan2(e.action.dx,e.action.dz);
      animateBahamutGait(e.mesh,false,dt,1.08);
      if(Math.random()<dt*18) burst(e.x,10,e.z,0xb86cff,2,62,0.28,0.18);
      if(e.action.t<=0){ e.action={kind:'apexRush',t:0.54,dx:e.action.dx,dz:e.action.dz,startX:e.action.startX,startZ:e.action.startZ}; }
      return;
    }
    if(e.action.kind==='apexRush'){
      animateBahamutGait(e.mesh,true,dt,1.38);
      const sp=285;
      e.x+=e.action.dx*sp*dt; e.z+=e.action.dz*sp*dt;
      e.mesh.position.x=e.x; e.mesh.position.z=e.z;
      if(e.hitHeroT<=0 && dist2(e.x,e.z,heroX,heroZ)<(e.r+G.heroR+7)**2){
        e.hitHeroT=0.55; damageHero(34,{sourceX:e.x,sourceZ:e.z}); G.shake=Math.max(G.shake,0.58);
      }
      if(Math.random()<dt*28){
        burst(e.x,10,e.z,Math.random()<0.45?0xffd166:0xb86cff,2,90,0.36,0.20);
        if(Math.random()<0.34) spawnRadiusRing(e.x,e.z,24,0xb86cff,0.20);
      }
      keepBossInArena(e);
      if(e.action.t<=0){
        const ax=e.action.dx, az=e.action.dz;
        spawnFireTrail(e.action.startX??e.x,e.action.startZ??e.z,e.x,e.z,{width:70,life:4.6,hostile:true,heroDamage:14,heroHitEvery:0.66});
        bahamutEnemyApexImpact(e,ax,az);
        e.action=null; e.attackT=1.12; e.orbitDir*=(Math.random()<0.5?-1:1);
      }
      return;
    }
    if(e.action.kind==='rushWind'){
      e.mesh.rotation.y=Math.atan2(e.action.dx,e.action.dz);
      animateBahamutGait(e.mesh,false,dt,1);
      if(e.action.t<=0){ e.action={kind:'rush',t:phase===3?0.46:0.48,dx:e.action.dx,dz:e.action.dz,startX:e.action.startX,startZ:e.action.startZ}; }
      return;
    }
    if(e.action.kind==='rush'){
      animateBahamutGait(e.mesh,true,dt,1.28);
      const sp=phase===3?300:250;
      e.x+=e.action.dx*sp*dt; e.z+=e.action.dz*sp*dt;
      // Keep the visible boss body synchronized every rush frame.
      // only e.x/e.z and updated the mesh after the rush ended, which looked like teleporting.
      e.mesh.position.x=e.x; e.mesh.position.z=e.z;
      keepBossInArena(e);
      if(e.hitHeroT<=0 && dist2(e.x,e.z,heroX,heroZ)<(e.r+G.heroR+7)**2){ e.hitHeroT=0.45; damageHero(phase===3?42:36,{sourceX:e.x,sourceZ:e.z}); G.shake=Math.max(G.shake,0.55); }
      if(Math.random()<dt*22) burst(e.x,10,e.z,0xff7a55,2,80,0.35,0.2);
      if(e.action.t<=0){
        const ax=e.action.dx, az=e.action.dz;
        spawnFireTrail(e.action.startX??e.x,e.action.startZ??e.z,e.x,e.z,{
          width:phase===1?56:phase===2?62:66,
          life:phase===1?3.3:phase===2?3.8:4.1,
          hostile:true,
          heroDamage:phase===1?8:phase===2?10:12,
          heroHitEvery:0.70
        });
        // E scales with the active boss phase.
        // Phase 1 teaches the flame wake; phase 2 adds a smaller radial payoff; phase 3
        // Phase 3 adds radial magic plus a forward breath.
        if(phase>=2) bahamutRadial(e,phase===2?5:6,phase===2?108:116,phase===2?25:29,Math.PI/6,0.12);
        if(phase>=3){
          spawnEnemyDragonBreathFx(e,ax,az);
          bahamutEnemyBreathHit(e,ax,az,3);
        }
        spawnRadiusRing(e.x,e.z,phase===1?58:72,0xff8a3a,0.52);
        e.action=null; e.attackT=phase===3?0.72:phase===2?0.86:0.98; e.orbitDir*=(Math.random()<0.5?-1:1);
      }
      return;
    }
    if(e.action.kind==='sweepWind'){
      e.mesh.rotation.y=Math.atan2(e.action.dx,e.action.dz);
      animateBahamutGait(e.mesh,false,dt,1);
      if(Math.random()<dt*18) burst(e.x+e.action.dx*9,15,e.z+e.action.dz*9,0xd8a94f,2,38,0.18,0.13);
      if(e.action.t<=0){
        floater('💢',e.x,e.z,'lionPunch',46);
        dragonSweepFx(e,{x:e.action.dx,z:e.action.dz},0xffbf66);
        const vx=heroX-e.x,vz=heroZ-e.z,dist=Math.max(0.001,Math.hypot(vx,vz));
        const facing=(vx/dist)*e.action.dx+(vz/dist)*e.action.dz;
        if(dist<100 && facing>Math.cos(58*Math.PI/180)){
          damageHero(phase===3?38:32,{sourceX:e.x,sourceZ:e.z});
          spawnClawHeadMark({x:G.hero.x,z:G.hero.z,r:G.heroR,dead:false},Math.atan2(vx,vz),0xf0b85a,1.30);
        }
        G.shake=Math.max(G.shake,0.45);
        e.action=null; e.attackT=phase===3?0.55:0.82;
      }
      return;
    }
  }

  // Agile, imperfectly predictable footwork: orbit, feint inward, or peel away.
  e.moveT-=dt;
  if(e.moveT<=0){
    const modes=['orbit','orbit','close','retreat'];
    if(phase>=2) modes.push('cross');
    e.moveMode=modes[Math.floor(Math.random()*modes.length)];
    if(Math.random()<0.45) e.orbitDir*=-1;
    e.moveT=0.75+Math.random()*(phase===3?0.75:1.4);
  }
  const dx=heroX-e.x,dz=heroZ-e.z,len=Math.max(1,Math.hypot(dx,dz)),ux=dx/len,uz=dz/len;
  let mx=0,mz=0,spd=e.speed*(phase===3?1.22:phase===2?1.10:1);
  if(e.moveMode==='orbit'){
    const target=phase===1?120:105, radial=Math.max(-1,Math.min(1,(len-target)/55));
    mx=(ux*radial + -uz*e.orbitDir*0.92)*spd; mz=(uz*radial + ux*e.orbitDir*0.92)*spd;
  } else if(e.moveMode==='close'){ mx=ux*spd*1.05; mz=uz*spd*1.05; }
  else if(e.moveMode==='retreat'){ mx=-ux*spd*0.92; mz=-uz*spd*0.92; }
  else { mx=(-uz*e.orbitDir+ux*0.35)*spd*1.12; mz=(ux*e.orbitDir+uz*0.35)*spd*1.12; }
  e.x+=(mx+e.kbx)*dt; e.z+=(mz+e.kbz)*dt;
  e.mesh.position.x=e.x; e.mesh.position.z=e.z; e.mesh.rotation.y=Math.atan2(dx,dz);
  animateBahamutGait(e.mesh,Math.hypot(mx,mz)>1,dt,phase===3?1.18:phase===2?1.08:1);
  e.kbx*=Math.exp(-10*dt); e.kbz*=Math.exp(-10*dt);
  keepBossInArena(e);

  e.attackT-=dt;
  if(e.attackT<=0) bahamutPickAttack(e,len);
}

// ---------------- Enemy update ----------------
const _bossHudVec = new THREE.Vector3();
function bossLabel(type){
  return type==='boss1' ? 'CRUSHER' : type==='boss2' ? 'HEXLORD' : type==='boss3' ? 'WRAITH' : type==='bahamut' ? 'BAHAMUT' : 'BOSS';
}
function keepBossInArena(e){
  if(!e || !e.boss) return;
  if(!Number.isFinite(e.x) || !Number.isFinite(e.z)){
    e.x = 0; e.z = -Math.max(0, VIEW.visH*0.55); e.kbx = 0; e.kbz = 0;
  }
  const mx = Math.max(20, e.r*0.48), mz = Math.max(18, e.r*0.42);
  const minX = -VIEW.visW + mx, maxX = VIEW.visW - mx;
  const minZ = -VIEW.visH + mz, maxZ = VIEW.visH - mz;
  if(e.x < minX){ e.x=minX; if(e.kbx<0) e.kbx=0; }
  if(e.x > maxX){ e.x=maxX; if(e.kbx>0) e.kbx=0; }
  if(e.z < minZ){ e.z=minZ; if(e.kbz<0) e.kbz=0; }
  if(e.z > maxZ){ e.z=maxZ; if(e.kbz>0) e.kbz=0; }
  e.mesh.position.x=e.x; e.mesh.position.z=e.z;
}
// Soft return room: enemies only need to travel 70 units beyond the visible arena
// to become a position kill. This keeps generic knockback from trivializing HP, while
// Dedicated displacement tools can reliably reach the position-kill margin.
const ENEMY_RINGOUT_MARGIN = 70;
const ENEMY_RETURN_INSET = 18;

function enemyCanUseRingoutBoundary(e){
  if(!e || e.dead || e.boss || e.noReward) return false;
  // These objects have dedicated fixed-position / nonstandard movement rules.
  if(e.kind==='stationary' || e.kind==='shield' || e.kind==='laser' || e.kind==='apexhero' || e.apexFinalMember) return false;
  return true;
}

function updateEnemyArenaReturn(e,dt){
  if(!enemyCanUseRingoutBoundary(e)) return false;

  const outside =
    e.x < -VIEW.visW || e.x > VIEW.visW ||
    e.z < -VIEW.visH || e.z > VIEW.visH;

  if(!outside){
    e.arenaReturn=false;
    e.knockoutLaunched=false;
    e.knockoutSource=null;
    return false;
  }

  const knockSpeed=Math.hypot(e.kbx||0,e.kbz||0);
  // Fresh enemies spawn 22 units outside the arena with zero knockback. Only an enemy
  // that actually crossed the edge with meaningful knockback can ever become a ring-out.
  if(knockSpeed>30) e.knockoutLaunched=true;

  const farOutside =
    e.x < -VIEW.visW-ENEMY_RINGOUT_MARGIN || e.x > VIEW.visW+ENEMY_RINGOUT_MARGIN ||
    e.z < -VIEW.visH-ENEMY_RINGOUT_MARGIN || e.z > VIEW.visH+ENEMY_RINGOUT_MARGIN;

  if(farOutside && e.knockoutLaunched){
    // Resolve death effects/rewards at the nearest visible edge so Explode / Explode Bones
    // uses the normal kill path with edge-clamped rewards and effects.
    const fxX=clamp(e.x,-VIEW.visW+8,VIEW.visW-8);
    const fxZ=clamp(e.z,-VIEW.visH+8,VIEW.visH-8);
    killEnemy(e,{returnReward:true,ringOut:true,positionSource:e.knockoutSource||'',effectX:fxX,effectZ:fxZ});
    return true;
  }

  e.arenaReturn=true;

  // While outside, ALL normal AI is suspended. This is especially important for shooters:
  // they walk back like a fresh spawn and are not allowed to snipe from outside the map.
  const tx=clamp(e.x,-VIEW.visW+ENEMY_RETURN_INSET,VIEW.visW-ENEMY_RETURN_INSET);
  const tz=clamp(e.z,-VIEW.visH+ENEMY_RETURN_INSET,VIEW.visH-ENEMY_RETURN_INSET);
  const dx=tx-e.x,dz=tz-e.z,len=Math.max(0.01,Math.hypot(dx,dz));
  const slow=enemyStatusMoveMult(e);
  const returnSpeed=Math.max(10,e.speed)*slow*insaneBerserkSpeedMult();

  e.x+=(dx/len*returnSpeed + (e.kbx||0))*dt;
  e.z+=(dz/len*returnSpeed + (e.kbz||0))*dt;
  e.kbx=(e.kbx||0)*Math.exp(-7*dt);
  e.kbz=(e.kbz||0)*Math.exp(-7*dt);

  // Shooter cooldown may recover while returning, but firing is impossible until re-entry.
  if(e.kind==='shooter') e.fireT=(e.fireT||0)-dt;

  e.mesh.position.x=e.x;
  e.mesh.position.z=e.z;
  e.mesh.rotation.y=Math.atan2(dx,dz);
  if(e.float) e.mesh.position.y=9+Math.sin(G.time*3+e.hopPhase)*3;
  else if(e.hop) e.mesh.position.y=Math.abs(Math.sin(G.time*11+e.hopPhase))*e.hop;

  return true;
}

function updateBossArrow(boss){
  const el = $('#bossArrow');
  if(!el || !boss || boss.dead || !G.camera){ if(el) el.hidden=true; return; }
  _bossHudVec.set(boss.x, Math.max(8,boss.r*0.7), boss.z).project(G.camera);
  const onScreen = _bossHudVec.z>-1 && _bossHudVec.z<1 && Math.abs(_bossHudVec.x)<0.92 && Math.abs(_bossHudVec.y)<0.88;
  if(onScreen){ el.hidden=true; return; }
  const cx=innerWidth*0.5, cy=innerHeight*0.5;
  const sx=(_bossHudVec.x*0.5+0.5)*innerWidth, sy=(-_bossHudVec.y*0.5+0.5)*innerHeight;
  const ang=Math.atan2(sy-cy, sx-cx);
  const ca=Math.cos(ang), sa=Math.sin(ang), pad=44;
  const tx=(cx-pad)/Math.max(0.001,Math.abs(ca));
  const ty=(cy-pad)/Math.max(0.001,Math.abs(sa));
  const t=Math.min(tx,ty);
  el.style.left=(cx+ca*t)+'px'; el.style.top=(cy+sa*t)+'px';
  const arr=el.querySelector('.arr'); if(arr) arr.style.transform='rotate('+ang+'rad)';
  const txt=el.querySelector('.txt'); if(txt) txt.textContent=bossLabel(boss.type);
  el.hidden=false;
}
function updateEnemies(dt){
  const h=G.hero;
  const actualHeroX=h.x,actualHeroZ=h.z;
  if(h.porterAiDecoy){
    h.porterAiDecoy.t=Math.max(0,h.porterAiDecoy.t-dt);
    if(h.porterAiDecoy.t<=0) h.porterAiDecoy=null;
  }
  const perceivedHero=enemyPerceivedHeroTarget();
  const heroX=perceivedHero.x,heroZ=perceivedHero.z;
  const berserkSpeed=insaneBerserkSpeedMult();
  for(const e of G.enemies){
    if(e.dead) continue;
    updateEnemyShieldVisual(e,dt);
    updateEliteHitStatus(e,dt);
    if(e.slowT>0) e.slowT-=dt;
    if((e.wolfHowlSlowT||0)>0) e.wolfHowlSlowT=Math.max(0,e.wolfHowlSlowT-dt);
    if(e.poison){
      e.hp-=e.poison.dps*dt;
      if(Math.random()<0.4) burst(e.x,9,e.z,0x7ac74a,1,30,0.3,0.3);
      e.poisonAcc=(e.poisonAcc||0)+e.poison.dps*dt;
      e.poisonTick=(e.poisonTick||0)-dt;
      if(e.poisonTick<=0){ e.poisonTick=0.3; if(e.poisonAcc>=1){ floater(Math.round(e.poisonAcc),e.x,e.z,'poison'); e.poisonAcc=0; } }
      e.poison.t-=dt;
      if(e.poison.t<=0)e.poison=null;
      if(e.hp<=0){ killEnemy(e); continue; }
    }
    if(e.burn){
      // Fire NEVER expires: `e.burn.t` is Infinity by design (see applyBurn) - a burn is removed
      // only by the target dying. It is flat damage that stacks, so the whole block is bounded:
      // FIRE_MAX_STACKS x the strongest source's value, forever.
      e.hp-=e.burn.dps*dt;
      const infernoBurn=!!e.burn.inferno;
      e.burnAcc=(e.burnAcc||0)+e.burn.dps*dt;
      e.burnTick=(e.burnTick||0)-dt;
      if(e.burnTick<=0){
        e.burnTick=infernoBurn?0.20:0.30;
        if(e.burnAcc>=1){ floater(Math.round(e.burnAcc),e.x,e.z,'fire'); e.burnAcc=0; }
        // Flame licks off the target once per tick rather than every frame. Now that a burn never
        // goes out, a per-frame emit would let a burning wave monopolise the shared particle ring
        // buffer (starving every other effect in the game) for the rest of the run.
        burst(e.x,9,e.z,infernoBurn?0xff5a20:0xff7a3d,1,infernoBurn?36:30,0.5,0.25);
      }
      // Fire spreads to whatever the burning enemy touches - always, not only with the Fire Nova
      // perk. The chain is fire's whole answer to a crowd, so it belongs to the element.
      e.fireSpreadCd=(e.fireSpreadCd||0)-dt;
      if(e.fireSpreadCd<=0){
        e.fireSpreadCd=0.5;
        for(const o of G.enemies){
          if(o===e || o.dead) continue;
          if(dist2(o.x,o.z,e.x,e.z)<(e.r+o.r+5)*(e.r+o.r+5)) applyBurn(o,e.burn.per);
        }
      }
      if(e.hp<=0){ killEnemy(e); continue; }
    }
    applyStatusTint(e);
    if(e.type==='box3'){
      const fl=0.72+0.28*Math.sin(G.time*19+e.hopPhase*5)+(Math.sin(G.time*47+e.hopPhase*11)>0.85?-0.35:0);
      const orbMat=e.mesh.children[0]&&e.mesh.children[0].material;
      if(orbMat)orbMat.emissiveIntensity=1.05*Math.max(0.25,fl);
      const glowMat=e.mesh.children[2]&&e.mesh.children[2].material;
      if(glowMat)glowMat.opacity=0.5*Math.max(0.2,fl);
    }

    if(e.type==='absorber'&&e.mesh.userData.absorberOrbit){
      const [a,b]=e.mesh.userData.absorberOrbit;
      if(a)a.rotation.z+=dt*0.75;
      if(b)b.rotation.y-=dt*0.95;
      const core=e.mesh.userData.absorberCore;
      if(core)core.scale.setScalar(0.82+0.24*Math.abs(Math.sin(G.time*5.5)));
    }
    if(e.type==='boss2'&&e.mesh.userData.hexOrbit) e.mesh.userData.hexOrbit.rotation.z+=dt*0.70;
    if(e.type==='boss3'&&e.mesh.userData.wraithGlow){
      const gl=e.mesh.userData.wraithGlow;
      gl.scale.setScalar(0.92+0.10*Math.sin(G.time*5.2));
      if(gl.material)gl.material.opacity=0.68+0.22*Math.abs(Math.sin(G.time*6.4));
    }

    if(e.type==='apexcake'){
      e.life=Math.max(0,(e.life||0)-dt);
      e.mesh.position.y=4.1+Math.sin(G.time*3.5+e.x*0.02)*0.35;
      e.mesh.rotation.y+=dt*0.32;
      if(e.mesh.userData?.flame){
        const f=e.mesh.userData.flame;
        f.scale.set(0.72+Math.sin(G.time*12)*0.06,1.18+Math.abs(Math.sin(G.time*14))*0.18,0.72+Math.sin(G.time*12)*0.06);
      }
      const owner=e.owner;
      if(owner && !owner.dead && dist2(e.x,e.z,owner.x,owner.z)<(e.r+owner.r+5)*(e.r+owner.r+5)){
        const before=owner.hp;
        owner.hp=Math.min(owner.maxHp,owner.hp+(e.heal||520));
        const got=Math.round(owner.hp-before);
        if(got>0) floater('CAKE +'+got,owner.x,owner.z,'heal');
        burst(e.x,8,e.z,0xffb5d6,12,82,0.42,0.24);
        removeEnemyNoReward(e); continue;
      }
      const hdx=actualHeroX-e.x,hdz=actualHeroZ-e.z,hd=Math.max(0.001,Math.hypot(hdx,hdz));
      const blockR=e.r+G.heroR*0.78;
      if(hd<blockR && !heroPhasing()){
        const ux=hdx/hd,uz=hdz/hd,push=blockR-hd+0.25;
        G.hero.x+=ux*push; G.hero.z+=uz*push;
        G.hero.x=clamp(G.hero.x,-(VIEW.visW-10),VIEW.visW-10);
        G.hero.z=clamp(G.hero.z,-(VIEW.visH-10)+VIEW.walkShift,(VIEW.visH-10)+VIEW.walkShift);
        G.hero.mesh.position.x=G.hero.x; G.hero.mesh.position.z=G.hero.z;
      }
      if(e.life<=0){ removeEnemyNoReward(e); continue; }
      continue;
    }

    if(e.type==='thornwall'){
      e.life-=dt;
      e.thornHitT=Math.max(0,(e.thornHitT||0)-dt);
      if(e.life<=0 || !e.owner || e.owner.dead){ removeEnemyNoReward(e); continue; }
      e.mesh.rotation.y+=dt*0.22;
      const hdx=actualHeroX-e.x, hdz=actualHeroZ-e.z, hd=Math.max(0.001,Math.hypot(hdx,hdz));
      const blockR=e.r+G.heroR*0.72;
      if(hd<blockR && !heroPhasing()){
        const ux=hdx/hd, uz=hdz/hd, push=blockR-hd+0.35;
        G.hero.x+=ux*push; G.hero.z+=uz*push;
        G.hero.x=clamp(G.hero.x,-(VIEW.visW-10),VIEW.visW-10);
        G.hero.z=clamp(G.hero.z,-(VIEW.visH-10)+VIEW.walkShift,(VIEW.visH-10)+VIEW.walkShift);
        G.hero.mesh.position.x=G.hero.x; G.hero.mesh.position.z=G.hero.z;
        if(e.thornHitT<=0){
          e.thornHitT=0.78;
          damageHero(7,{sourceX:e.x,sourceZ:e.z,skipAegis:true});
          burst(G.hero.x,5,G.hero.z,0xff8a42,4,45,0.22,0.16);
          floater('THORNS',G.hero.x,G.hero.z,'hurt');
        }
      }
      continue;
    }

    // Spawned or short-knocked enemies outside the visible arena must re-enter before
    // any attack AI runs. Extremely long player knockback becomes a rewarded ring-out kill.
    if(updateEnemyArenaReturn(e,dt)) continue;

    if((e.stunT||0)>0){
      e.stunT=Math.max(0,e.stunT-dt);
      e.kbx*=Math.exp(-7*dt); e.kbz*=Math.exp(-7*dt);
      e.x+=e.kbx*dt; e.z+=e.kbz*dt;

      if((e.roarFearT||0)>0){
        e.roarFearT=Math.max(0,e.roarFearT-dt);
        const seed=e.roarFearSeed||0;
        const classScale=e.boss?0.45:(e.elite||e.brain?0.72:1.0);
        const tremor=Math.sin(G.time*32+seed)*0.85*classScale;
        const stagger=Math.sin(G.time*13+seed*1.7)*0.55*classScale;
        const awayPulse=0.65+0.35*Math.abs(Math.sin(G.time*9+seed));
        const adx=e.roarFearDx||0, adz=e.roarFearDz||1;
        // Logical enemy position remains stunned. Only the rendered body recoils,
        // scrambles and shakes away from Mane, so fear is obvious without adding
        // hidden movement/collision changes.
        e.mesh.position.x=e.x + adx*awayPulse*1.25 + (-adz)*tremor;
        e.mesh.position.z=e.z + adz*awayPulse*1.25 + adx*tremor;
        e.mesh.rotation.y=Math.atan2(adx,adz); // face away from the roar source
        const pose=e.roarFearPose||{rx:0,rz:0};
        e.mesh.rotation.x=pose.rx + 0.055*classScale*Math.abs(Math.sin(G.time*11+seed));
        e.mesh.rotation.z=pose.rz + stagger*0.10;
      } else {
        e.mesh.position.x=e.x; e.mesh.position.z=e.z;
        if(e.roarFearPose){
          e.mesh.rotation.x=e.roarFearPose.rx;
          e.mesh.rotation.z=e.roarFearPose.rz;
          e.roarFearPose=null;
        }
      }
      if(e.boss)keepBossInArena(e);
      continue;
    }
    if(e.roarFearPose){
      // top-level pose before normal movement/animation resumes.
      e.mesh.rotation.x=e.roarFearPose.rx;
      e.mesh.rotation.z=e.roarFearPose.rz;
      e.roarFearPose=null; e.roarFearT=0;
      e.mesh.position.x=e.x; e.mesh.position.z=e.z;
    }
    if(e.kind==='apexwolf'){ updateApexWolfEnemy(e,dt,heroX,heroZ); continue; }
    if(e.kind==='apexhero'){ updateApexFinalHero(e,dt,heroX,heroZ); continue; }
    if(e.kind==='boss'&&e.type==='bahamut'){
      updateBahamut(e,dt,heroX,heroZ);
      continue;
    }

    let mx=0,mz=0;
    const dx=heroX-e.x,dz=heroZ-e.z;
    const len=Math.max(0.01,Math.hypot(dx,dz));

    if(e.kind==='shield'){
      if(e.parent&&!e.parent.dead){ e.x=e.parent.x; e.z=e.parent.z; e.mesh.position.x=e.x; e.mesh.position.z=e.z; }
    } else if(e.kind!=='stationary'){
      let chasing=true,tx=heroX,tz=heroZ;
      if(e.kind==='briar'){
        chasing=false;
        const ux=dx/len,uz=dz/len,target=108,radial=clamp((len-target)/42,-1,1);
        const ctlSlow=(e.slowT>0?e.slowPct:1)*((e.wolfHowlSlowT||0)>0?0.85:1);
        mx=(ux*radial-uz*e.briarDir*0.62)*e.speed*berserkSpeed*ctlSlow;
        mz=(uz*radial+ux*e.briarDir*0.62)*e.speed*berserkSpeed*ctlSlow;
        if(Math.abs(e.x)>VIEW.visW-36 || Math.abs(e.z)>VIEW.visH-34) e.briarDir*=-1;
      }
      if(e.kind==='shooter')chasing=len<100;
      if(e.kind==='boss'&&e.type==='boss1')chasing=(len<=170 || (e.crusherRangedRest||0)>0) && e.crusherWind<=0;
      if(e.kind==='boss'&&e.type==='boss2')chasing=e.attackT<=6;
      if(e.kind==='boss'&&e.type==='boss3'){
        // WRAITH is always visible/vulnerable on the top edge and glides left/right there.
        chasing=false;
        const topZ=-(VIEW.visH-Math.max(24,e.r*0.70));
        e.z+=(topZ-e.z)*Math.min(1,dt*7);
        if(!e.pending && !(e.wraithDrops&&e.wraithDrops.length)){
          const edge=Math.max(48,VIEW.visW-42);
          e.x+=e.wraithDir*e.speed*berserkSpeed*1.55*dt;
          if(e.x<=-edge){ e.x=-edge; e.wraithDir=1; }
          if(e.x>= edge){ e.x= edge; e.wraithDir=-1; }
        }
        e.mesh.position.y=3.0+Math.sin(G.time*3.2+e.hopPhase)*2.0;
      }
      if(e.kind==='laser'){
        // Perimeter sentinel: stays on one side edge and moves only between readable firing rows.
        chasing=false;
        const edgeX=e.laserSide>0?VIEW.visW-16:-VIEW.visW+16;
        e.x+=(edgeX-e.x)*Math.min(1,dt*9);
        if(e.laserState==='move'){
          const dd=e.laserTargetZ-e.z;
          if(Math.abs(dd)>4) mz=Math.sign(dd)*e.speed*berserkSpeed*1.9;
        }
      }
      if(chasing){
        const slow=enemyStatusMoveMult(e);
        let ls=1;
        if(G.hero.slowingLight){ const lr=G.hero.lightRadius; if(dist2(e.x,e.z,tx,tz)<lr*lr)ls=0.45; }
        const ldx=tx-e.x,ldz=tz-e.z,llen=Math.max(0.01,Math.hypot(ldx,ldz));
        mx=ldx/llen*e.speed*berserkSpeed*slow*ls; mz=ldz/llen*e.speed*berserkSpeed*slow*ls;
      }
      if(e.kind==='absorber'&&e.shield){ mx*=0.4; mz*=0.4; }
      e.x+=(mx+e.kbx)*dt; e.z+=(mz+e.kbz)*dt;
      if(e.kind==='laser'){
        e.z=clamp(e.z,-VIEW.visH+24,VIEW.visH-24);
        e.x=e.laserSide>0?VIEW.visW-16:-VIEW.visW+16;
      }
      if(e.kind==='boss'&&e.type==='boss3') e.z=-(VIEW.visH-Math.max(24,e.r*0.70));
      e.mesh.position.x=e.x; e.mesh.position.z=e.z;
      if(e.type==='boss1') e.mesh.rotation.y+=dt*15*(Math.PI/180)*60;
      else e.mesh.rotation.y=Math.atan2(dx,dz);
      if(e.float)e.mesh.position.y=9+Math.sin(G.time*3+e.hopPhase)*3;
      else if(e.hop)e.mesh.position.y=Math.abs(Math.sin(G.time*11+e.hopPhase))*e.hop;
    }
    e.kbx*=Math.exp(-7*dt); e.kbz*=Math.exp(-7*dt);

    if(e.kind==='briar'){
      if(e.mesh.userData.briarRing) e.mesh.userData.briarRing.rotation.z+=dt*0.55;
      if(e.briarLash){
        e.briarLash.t-=dt;
        e.briarLash.mat.opacity=0.46+0.34*Math.abs(Math.sin(G.time*13));
        if(e.briarLash.t<=0) resolveBriarLash(e);
      } else {
        e.briarT-=dt;
        if(e.briarT<=0){
          if(e.briarNext==='barrier'){ spawnBriarBarrier(e); e.briarNext='lash'; e.briarT=2.7; }
          else { spawnBriarLashTell(e); e.briarNext='barrier'; e.briarT=4.2; }
        }
      }
    }

    if(e.kind==='shooter'){
      e.fireT-=dt;
      if(len>101&&e.fireT<=0){ e.fireT=G.diff==='Insane'?2.15:(G.diff==='Hard'?2.65:3); fireEnemyProjectile(e.x,e.z,dx/len,dz/len,{speed:G.diff==='Insane'?58:45,rot:55}); }
    }

    if(e.kind==='absorber'&&e.shield){
      e.absorbT-=dt;
      if(e.absorbT<=0){
        e.absorbT=1.8;
        let best=null,bd=90*90;
        for(const o of G.orbs){
          if(o.dead||o.absorbOwner||!isXpOrb(o))continue;
          const d=dist2(o.x,o.z,e.x,e.z);
          if(d<bd){bd=d;best=o;}
        }
        if(best){
          best.absorbOwner=e; best.absorbLife=2.2;
          spawnDragonBeamFx(e.x,e.z,best.x,best.z,0xb86fff,1.4,0.28);
          floater('XP DRAIN',e.x,e.z,'poison');
        }
      }
    }

    if(e.kind==='laser'){
      const halo=e.mesh.userData.laserHalo,beacon=e.mesh.userData.laserBeacon;
      if(halo?.material)halo.material.opacity=0.58+0.34*Math.abs(Math.sin(G.time*6));
      if(beacon?.material)beacon.material.opacity=0.24+0.36*Math.abs(Math.sin(G.time*7));
      if(e.laserState==='move'&&Math.abs(e.laserTargetZ-e.z)<=5){
        e.laserState='telegraph'; e.laserStateT=G.diff==='Insane'?0.56:(G.diff==='Hard'?0.66:0.78);
        spawnLaserSight(e,e.laserStateT); floater('LASER LOCK',e.x,e.z,'crit');
      } else if(e.laserState==='telegraph'){
        e.laserStateT-=dt;
        if(e.laserStateT<=0){
          e.laserState='fire'; e.beamActive=true; e.beam=spawnLaserBeam(e); e.laserStateT=0.52;
          burst(e.x,12,e.z,0xff4f9a,9,70,0.35,0.22);
        }
      } else if(e.laserState==='fire'){
        e.laserStateT-=dt;
        if(e.laserStateT<=0){
          e.laserState='move'; e.beamActive=false;
          if(e.beam){ e.beam.dead=true; sceneRemove(e.beam.mesh); e.beam=null; }
          const jitter=(Math.random()*2-1)*55;
          e.laserTargetZ=clamp(heroZ+jitter,-VIEW.visH+28,VIEW.visH-28);
        }
      }
    }

    if(e.kind==='boss'&&e.type==='boss1'){
      e.fireT-=dt;
      e.crusherRangedRest=Math.max(0,(e.crusherRangedRest||0)-dt);
      e.crusherMeleeT=Math.max(0,(e.crusherMeleeT||0)-dt);
      if(e.crusherWind>0){
        e.crusherWind-=dt;
        if(e.crusherWind<=0){
          if(e.crusherAttack==='slam'){
            spawnRadiusRing(e.x,e.z,82,0xff5a5a,0.34);
            burst(e.x,10,e.z,0xff5a5a,24,145,0.50,0.30);
            if(dist2(e.x,e.z,actualHeroX,actualHeroZ)<(82+G.heroR)*(82+G.heroR)) damageHero(G.diff==='Insane'?28:25,{sourceX:e.x,sourceZ:e.z,area:true});
          } else if(e.crusherAttack==='rush'){
            e.kbx+=e.crusherAimX*(G.diff==='Insane'?290:250);
            e.kbz+=e.crusherAimZ*(G.diff==='Insane'?290:250);
            burst(e.x,8,e.z,0xff7a5a,12,105,0.35,0.22);
          }
          e.crusherAttack=''; e.crusherMeleeT=G.diff==='Insane'?0.88:1.08;
        }
      } else if(len<90&&e.crusherMeleeT<=0){
        // Close range belongs to CRUSHER's telegraphed melee. Once the player gets
        // inside his approach band he stops firing point-blank volleys.
        const l=Math.max(1,Math.hypot(dx,dz));
        e.crusherAimX=dx/l; e.crusherAimZ=dz/l;
        e.crusherAttack=Math.random()<0.62?'slam':'rush';
        e.crusherWind=G.diff==='Insane'?0.44:(G.diff==='Hard'?0.50:0.56);
        e.fireT=Math.max(e.fireT,0.55);
        if(e.crusherAttack==='slam') spawnRadiusRing(e.x,e.z,82,0xff5a5a,e.crusherWind);
        else spawnDragonBeamFx(e.x,e.z,e.x+e.crusherAimX*95,e.z+e.crusherAimZ*95,0xff765f,1.2,e.crusherWind);
        floater(e.crusherAttack==='slam'?'SLAM':'RUSH',e.x,e.z,'crit');
      } else if(len>170&&e.fireT<=0&&(e.crusherRangedRest||0)<=0){
        // CRUSHER fires one deliberate fan, then has a real no-shoot recovery window.
        // During that break he advances before resuming ranged pressure.
        const insane=e.bh;
        bossVolley(e,insane?6:5,insane?112:92,insane?38:35);
        e.fireT=0.35;
        e.crusherRangedRest=insane?1.75:(G.diff==='Hard'?2.05:2.35);
        floater('RELOAD',e.x,e.z,'ammo');
      }
    }

    if(e.kind==='boss'&&e.type==='boss2'){
      e.attackT+=dt;
      if(e.hp>e.maxHp)e.hp=e.maxHp;
      const boss2Wind=G.diff==='Insane'?4.6:(G.diff==='Hard'?5.4:6);
      const boss2Cycle=G.diff==='Insane'?6.3:(G.diff==='Hard'?7.2:8);
      if(e.attackT>boss2Wind&&!e.pending){
        e.pending=true; e.attackVar=1+Math.floor(Math.random()*3);
        if(e.attackVar<=2)boss2Summon(e);
        else { G.magnet={x:e.x,z:e.z,t:2.2}; floater('XP MAGNET',e.x,e.z,'crit'); spawnRadiusRing(e.x,e.z,125,0xcf65ff,0.55); }
      }
      if(e.attackT>boss2Cycle){e.attackT=0;e.pending=false;e.attackVar=0;}
      for(const o of G.orbs){
        if(o.dead || !isXpOrb(o))continue;
        if(dist2(o.x,o.z,e.x,e.z)<(e.r+5)*(e.r+5)){
          e.hp=Math.min(e.maxHp,e.hp+100); floater('XP +100',e.x,e.z,'heal'); o.dead=true; sceneRemove(o.mesh); sceneRemove(o.glow); break;
        }
      }
    }

    if(e.kind==='boss'&&e.type==='boss3'){
      e.attackT+=dt;
      // Process promised rain first: every warning lane deterministically produces one cone.
      if(e.wraithDrops&&e.wraithDrops.length){
        for(const d of e.wraithDrops)d.t-=dt;
        const due=e.wraithDrops.filter(d=>d.t<=0);
        e.wraithDrops=e.wraithDrops.filter(d=>d.t>0);
        for(const d of due){
          clearWraithTell(d);
          spawnWraithShard(e,d.x);
        }
      }
      const wind=G.diff==='Insane'?1.25:(G.diff==='Hard'?1.55:1.85);
      const cycle=G.diff==='Insane'?5.0:(G.diff==='Hard'?5.7:6.4);
      if(e.attackT>wind&&!e.pending){
        e.pending=true;
        e.attackVar=1+Math.floor(Math.random()*3);
        if(e.attackVar===1){
          const spread=G.diff==='Insane'?44:50;
          const count=G.diff==='Insane'?5:4;
          const xs=[];
          for(let i=0;i<count;i++)xs.push(e.x+(i-(count-1)/2)*spread);
          queueWraithRain(e,xs,{stagger:0.11,label:'CONE RAIN'});
        } else if(e.attackVar===2){
          const lockX=clamp(heroX,-VIEW.visW+42,VIEW.visW-42);
          queueWraithRain(e,[lockX-30,lockX,lockX+30],{stagger:0.14,label:'FOCUSED RAIN'});
        } else {
          boss3SummonShields(e);
        }
      }
      if(e.attackT>=cycle){e.attackT=0;e.pending=false;e.attackVar=0;}
    }

    if(e.boss){
      keepBossInArena(e);
      if(e.type==='boss3'){
        // keepBossInArena is generic; reassert WRAITH's top-edge lane after clamping.
        e.z=-(VIEW.visH-Math.max(24,e.r*0.70)); e.mesh.position.z=e.z;
      }
      const bossRing=e.mesh.userData.bossRing;
      if(bossRing&&bossRing.material){ const pulse=0.92+0.10*Math.sin(G.time*5.5); bossRing.scale.setScalar(pulse); bossRing.material.opacity=0.58+0.28*Math.abs(Math.sin(G.time*4.2)); }
    }

    if(e.kind!=='shield'&&e.hitCd>0)e.hitCd-=dt;
    if(e.kind!=='shield'&&e.type!=='apexcake'&&!e.testDummy&&!magnetPulled(e)&&dist2(e.x,e.z,actualHeroX,actualHeroZ)<(e.r+G.heroR)*(e.r+G.heroR)&&e.hitCd<=0){ e.hitCd=0.6; damageHero(HERO_HIT_DMG,{sourceX:e.x,sourceZ:e.z}); }

    if(e.bombFx){
      e.bombFx.position.set(e.x,0,e.z);
      const pulse=0.84+0.18*Math.abs(Math.sin(G.time*12));
      e.bombFx.scale.setScalar(pulse);
      if(e.bombRing?.material)e.bombRing.material.opacity=0.46+0.48*Math.abs(Math.sin(G.time*10));
    }
    const br=e.mesh.userData.borderRing;
    if(br&&br.material){
      if(e.bombT!=null&&e.bombOwner&&!e.bombOwner.dead)br.material.opacity=0.3+0.7*Math.abs(Math.sin(G.time*22+e.x));
      else br.material.opacity=0.55+0.35*Math.sin(G.time*4+e.x*0.7);
    }
  }

  // HEXLORD bomb countdown. Killing HEXLORD visibly disarms every surviving carrier.
  {
    const expired=[];
    for(const e of G.enemies){
      if(e.dead||e.bombT==null)continue;
      if(e.bombOwner&&e.bombOwner.dead){
        e.bombT=null;e.bombOwner=null;e.bombShown=null; removeHexBombMarker(e);
        floater('DISARMED',e.x,e.z,'heal'); burst(e.x,9,e.z,0x8fe0ff,9,65,0.35,0.20); continue;
      }
      e.bombT=Math.max(0,e.bombT-dt);
      const shown=Math.max(1,Math.ceil(e.bombT));
      if(e.bombT>0&&shown<(e.bombShown||3)){
        e.bombShown=shown; floater('BOMB '+shown,e.x,e.z,'crit'); burst(e.x,10,e.z,0xcf65ff,8,65,0.4,0.22);
      }
      if(e.bombT<=0)expired.push(e);
    }
    for(const e of expired){
      if(e.dead)continue;
      removeHexBombMarker(e);
      for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; fireEnemyProjectile(e.x,e.z,Math.sin(a),Math.cos(a),{speed:175,rot:55,color:0xcf65ff}); }
      floater('SELF-DESTRUCT',e.x,e.z,'crit'); burst(e.x,12,e.z,0xff7a3d,22,130,0.8,0.45); smokeBurst(e.x,5,e.z,0x4b3430,5); removeEnemyNoReward(e);
    }
  }

  {
    const sepGrid=buildBulletEnemyGrid(),es=G.enemies;
    for(let i=0;i<es.length;i++){
      const a=es[i]; if(a.dead||a.kind==='shield'||a.testDummy)continue;
      const cx=Math.floor(a.x/BULLET_GRID_CELL),cz=Math.floor(a.z/BULLET_GRID_CELL);
      for(let ox=-1;ox<=1;ox++) for(let oz=-1;oz<=1;oz++){
        const bucket=sepGrid.get(bulletGridKey(cx+ox,cz+oz));
        if(!bucket)continue;
        for(const rec of bucket){
          if(rec.order<=i)continue;
          const b=rec.e; if(b.dead||b.kind==='shield'||b.testDummy)continue;
          const dx=b.x-a.x,dz=b.z-a.z,rr=(a.r+b.r)*0.62;
          const d2=dx*dx+dz*dz;
          if(d2>=rr*rr)continue;
          if(d2>0.0001){const d=Math.sqrt(d2),push=(rr-d)/2,ux=dx/d,uz=dz/d;a.x-=ux*push;a.z-=uz*push;b.x+=ux*push;b.z+=uz*push;}
          else{const ang=Math.random()*Math.PI*2;a.x+=Math.cos(ang)*rr*0.25;a.z+=Math.sin(ang)*rr*0.25;b.x-=Math.cos(ang)*rr*0.25;b.z-=Math.sin(ang)*rr*0.25;}
          a.mesh.position.x=a.x;a.mesh.position.z=a.z;b.mesh.position.x=b.x;b.mesh.position.z=b.z;
        }
      }
    }
  }

  const apexSeven=G.enemies.filter(e=>!e.dead&&e.apexFinalMember);
  const trueBosses=G.enemies.filter(e=>!e.dead&&e.boss);
  const totalBossClass=apexSeven.length+trueBosses.length;

  // One true boss gets the dramatic top bar. Multi-boss encounters use individual
  // world bars so a shared pool never lies about separate health values.
  for(const b of trueBosses){
    if(totalBossClass>1) updateBossWorldHpBar(b);
    else if(b.bossWorldHpBar) removeBossWorldHpBar(b);
  }

  if(apexSeven.length && trueBosses.length===0){
    $('#bossbarWrap').hidden=false;
    const n=apexSeven.length, phase=apexSevenRosterPhase(n);
    const state=n===1?('FINAL APEX · '+(APEX_SEVEN_FINAL[apexSeven[0].apexHeroId]?.label||'1 REMAINS')):
      (n===2?'APEX SEVEN · LAST STAND · 2/7 REMAIN':
      ('APEX SEVEN · PHASE '+phase+(phase===2?' · BERSERK':(phase===3?' · UNLEASHED':''))+' · '+n+'/7 REMAIN'));
    $('#bossName').textContent=state;
    const bb=$('#bossBar'); if(bb) bb.style.display='none';
    const ba=$('#bossArrow'); if(ba)ba.hidden=true;
  } else if(totalBossClass>1){
    $('#bossbarWrap').hidden=false;
    $('#bossName').textContent='MULTI-BOSS · '+totalBossClass+' ACTIVE';
    const bb=$('#bossBar'); if(bb) bb.style.display='none';
    const ba=$('#bossArrow'); if(ba)ba.hidden=true;
  } else if(trueBosses.length===1){
    const boss=trueBosses[0];
    const bb=$('#bossBar'); if(bb) bb.style.display='block';
    $('#bossbarWrap').hidden=false;
    $('#bossName').textContent='BOSS · '+bossLabel(boss.type);
    $('#bossFill').style.width=clamp(boss.hp/boss.maxHp,0,1)*100+'%';
    updateBossArrow(boss);
  } else {
    const bb=$('#bossBar'); if(bb) bb.style.display='block';
    $('#bossbarWrap').hidden=true; const ba=$('#bossArrow'); if(ba)ba.hidden=true;
  }
}

// ---------------- Bullets update ----------------
function updateBullets(dt){
  const enemyGrid=buildBulletEnemyGrid();
  for(const b of G.bullets){
    if(b.dead) continue;
    // Bahamut heavy orbs use deliberately loose, time-limited guidance. They can
    // catch simple movement but cannot snap around forever like the normal missile launcher.
    if(b.softHoming){
      b.homingAge=(b.homingAge||0)+dt;
      const delay=b.homingDelay||0;
      if(b.homingAge>=delay && b.homingAge <= (b.homingLife||0)){
        let best=(b.softTarget && !b.softTarget.dead && b.softTarget.type!=='shielder') ? b.softTarget : null;
        // Dragon radial orbs intentionally acquire only after their fixed launch phase.
        // Acquisition happens once; a locked orb never jumps to an unrelated target later.
        if(!best && b.acquireTarget){
          let bd=Infinity;
          for(const e of G.enemies){
            if(e.dead || e.type==='shielder' || e.kind==='shield') continue;
            const d=dist2(e.x,e.z,b.x,b.z);
            if(d<bd){ bd=d; best=e; }
          }
          b.softTarget=best;
          b.acquireTarget=false;
          if(best) spawnRadiusRing(best.x,best.z,Math.max(10,best.r+5),0xc579ff,0.20);
        }else if(!best && !b.lockTarget){
          let bd=Infinity;
          for(const e of G.enemies){
            if(e.dead || e.type==='shielder') continue;
            const d=dist2(e.x,e.z,b.x,b.z);
            if(d<bd){ bd=d; best=e; }
          }
          b.softTarget=best;
        }
        if(best){
          const dx=best.x-b.x, dz=best.z-b.z, len=Math.max(0.01,Math.hypot(dx,dz));
          const cur=Math.atan2(b.dx,b.dz), tgt=Math.atan2(dx/len,dz/len);
          let dA=tgt-cur; while(dA>Math.PI)dA-=Math.PI*2; while(dA<-Math.PI)dA+=Math.PI*2;
          const cap=(b.homingTurn||1.5)*dt;
          const turn=Math.max(-cap,Math.min(cap,dA));
          b.dx=Math.sin(cur+turn); b.dz=Math.cos(cur+turn);
        }
      }
    }
    // Missile launcher: limited opening guidance, then ballistic commitment. It remains
    // Guidance ends after the opening flight phase.
    if(b.homing){
      b.homingAge=(b.homingAge||0)+dt;
      if(!(b.homingLife>0) || b.homingAge<=b.homingLife){
        let best=null, bd=Infinity;
        for(const e of G.enemies){
          if(e.dead || e.type==='shielder') continue;
          const d=dist2(e.x,e.z,b.x,b.z);
          if(d<bd){ bd=d; best=e; }
        }
        if(best){
          const dx=best.x-b.x, dz=best.z-b.z; const len=Math.max(0.01,Math.hypot(dx,dz));
          const cur=Math.atan2(b.dx,b.dz), tgt=Math.atan2(dx/len,dz/len);
          let dA=tgt-cur; while(dA>Math.PI)dA-=Math.PI*2; while(dA<-Math.PI)dA+=Math.PI*2;
          const cap=(b.homingTurn||6)*dt;
          const turn=Math.max(-cap, Math.min(cap, dA));
          b.dx=Math.sin(cur+turn); b.dz=Math.cos(cur+turn);
        }
      }
    }
    // Launcher exhaust: missiles keep grey smoke; ROCKET adds a hot tail flame and sparks.
    if(b.trailSmoke){
      b.smokeT -= dt;
      if(b.smokeT<=0){
        spawnProjectileSmokeDot(b.x-b.dx*5,b.y??3.2,b.z-b.dz*5,b.smokeScale);
        b.smokeT += b.smokeEvery;
      }
    }
    if(b.rocketFx){
      b.rocketFxT-=dt;
      if(b.rocketFxT<=0){
        const tx=b.x-b.dx*8, tz=b.z-b.dz*8;
        burst(tx,b.y??3.2,tz,0xff6a20,2,30,0.10,0.16);
        b.rocketFxT+=0.045;
      }
      if(b.rocketFlame){
        const pulse=1+Math.sin(G.time*42)*0.18;
        b.rocketFlame.scale.set(0.88*pulse,1.05+0.22*pulse,0.88*pulse);
      }
    }
    // arc (grenade launcher): lobbed — gravity, explodes on landing
    if(b.vy){
      b.vy -= 170*dt;
      b.y += b.vy*dt;
      if(b.y<=1.8){
        bulletBoom(b);
        b.dead = true;
        continue;
      }
      b.mesh.position.y = b.y;
    }
    b.x += b.dx*b.speed*dt; b.z += b.dz*b.speed*dt;
    b.life -= dt;
    b.mesh.position.x = b.x; b.mesh.position.z = b.z;
    if(b.life<=0){
      if(b.expireExplode) bulletBoom(b);
      b.dead=true; continue;
    }
    // bounce off walls
    if(b.bounce>0){
      let bounced=false;
      if(b.x < -VIEW.visW || b.x > VIEW.visW){ b.dx = -b.dx; b.x = clamp(b.x,-VIEW.visW,VIEW.visW); bounced=true; }
      if(b.z < -VIEW.visH || b.z > VIEW.visH){ b.dz = -b.dz; b.z = clamp(b.z,-VIEW.visH,VIEW.visH); bounced=true; }
      if(bounced){ b.bounce--; b.bounced=true; burst(b.x, 8, b.z, 0xffe066, 4, 50, 0.3, 0.2); }
    }
    // Hit the actual enemy. A compact spatial grid keeps rapid-fire weapons from doing
    // Earliest enemy index wins when bodies overlap for deterministic resolution.
    let hit=false,hitEnemy=null,hitOrder=Infinity;
    const gcx=Math.floor(b.x/BULLET_GRID_CELL),gcz=Math.floor(b.z/BULLET_GRID_CELL);
    for(let ox=-1;ox<=1;ox++) for(let oz=-1;oz<=1;oz++){
      const bucket=enemyGrid.get(bulletGridKey(gcx+ox,gcz+oz));
      if(!bucket) continue;
      for(const rec of bucket){
        const e=rec.e;
        if(rec.order>=hitOrder||e.dead||b.hit.has(e)) continue;
        const hitPad=b.impactPad??3;
        if(dist2(b.x,b.z,e.x,e.z)<(e.r+hitPad)*(e.r+hitPad)){ hitEnemy=e; hitOrder=rec.order; }
      }
    }
    if(hitEnemy){
      const e=hitEnemy;
      b.hit.add(e);
      if(b.bone){
        const procChance=b.boneProcChance??BONE_DOG_PROC_CHANCE;
        if(Math.random()<procChance){
          addDog(true,BONE_DOG_LIFE,'bone','boneBullet');
          floater(G.char?.id==='fang'?'WOLF! · 8s':'BONE DOG! · 8s',e.x,e.z,'heal');
        }
      }
      if(b.noDirect){
        bulletBoom(b); b.dead=true; hit=true;
      } else {
        const crit=!b.noCrit&&Math.random()<G.hero.mods.crit;
        const dmg=b.dmg*(crit?2:1);
        damageEnemy(e,dmg,{dirx:b.dx,dirz:b.dz,kb:b.kb,awayFromHero:!!b.bounced,show:true,crit,poison:b.poison,burn:b.burn,slow:b.slow||undefined,slowDur:b.slowDur});
        if(crit&&G.hero.explosiveCrits){ explodeDamage(e.x,e.z,36,b.dmg,0xffd166); floater('EXPLOSIVE CRIT',e.x,e.z,'crit'); }
        if(b.explode) bulletBoom(b);
        if(b.pierce>0)b.pierce--;else b.dead=true;
        hit=true;
      }
    }
  }
  G.bullets = G.bullets.filter(b=>{
    if(b.dead){
      // TOXIC BLASTER: the glob leaves its venom pool exactly where it ended - on the enemy it
      // hit, on the wall it bounced off, or wherever it ran out of range. One pool per glob
      // (poolSplat guards the single splat), and it is clamped into the arena so a pool can
      // never land outside the visible floor.
      if(b.pool && !b.poolSplat){
        b.poolSplat=true;
        addPoisonPool(clamp(b.x,-VIEW.visW,VIEW.visW), clamp(b.z,-VIEW.visH,VIEW.visH), b.pool);
      }
      sceneRemove(b.mesh); return false;
    }
    return true;
  });
}

function burnDps(){
  // NOTE (balance parity): orig base burn = hero var20 burninglightdamage (5), ticked
  // every 1.5s while in radius; we keep the procced-DOT model but use the orig base.
  let d = 5 * G.hero.mods.fire;
  if(G.hero.rootedfire && !G.heroMoving) d *= 2;
  if(G.hero.spikeFire) d *= 1.4;
  return d;
}

function updateEnemyBullets(dt){
  const h = G.hero;
  for(const b of G.ebullets){
    if(b.dead) continue;
    if(b.hbeam){
      // LASER DUDE's locked horizontal lane: source remains the visible sentinel on the side edge.
      const e=b.linked;
      if(!e||e.dead){b.dead=true;continue;}
      b.x=0;b.z=e.z;b.life-=dt;
      b.mesh.position.z=b.z;

      // VAL cakes and ROOTY Thorn Guards are physical beam cover. Re-evaluate every frame.
      const cakeBeamHit=valCakeSegmentBlock(e.x,e.z,h.x,h.z,8);
      const thornBeamHit=rootyThornGuardSegmentBlock(e.x,e.z,h.x,h.z,8);
      const coverBeamHit=nearestFriendlyCoverHit(cakeBeamHit,thornBeamHit);
      if(coverBeamHit){
        const stopX=coverBeamHit.hit.x;
        const segW=Math.max(4,Math.abs(e.x-stopX));
        b.mesh.scale.x=segW/Math.max(1,b.fullW||VIEW.visW*2+18);
        b.mesh.position.x=(e.x+stopX)*0.5;
        friendlyCoverFeedback(coverBeamHit,true);
      }else if(b.aegisBlocked){
        // Once AEGIS catches this short continuous beam, the visible beam terminates at
        // the shield plane at the interception point.
        const side=Math.sign(e.x-h.x)||1;
        const stopX=h.x+side*(G.heroR*0.58+5.5);
        const segW=Math.max(4,Math.abs(e.x-stopX));
        b.mesh.scale.x=segW/Math.max(1,b.fullW||VIEW.visW*2+18);
        b.mesh.position.x=(e.x+stopX)*0.5;
      }else{
        b.mesh.scale.x=1;
        b.mesh.position.x=0;
      }
      if(b.life<=0){b.dead=true;continue;}
      if(!coverBeamHit && Math.abs(h.z-b.z)<8+G.heroR&&Math.abs(h.x)<VIEW.visW+10){
        if(b.hitCd<=0){
          b.hitCd=0.6;
          const vx=e.x-h.x,vz=e.z-h.z,vl=Math.max(0.001,Math.hypot(vx,vz));
          const blocked=aegisTryBlock({fromX:vx/vl,fromZ:vz/vl,projectile:true,laserBeam:true,sourceEnemy:e});
          if(blocked) b.aegisBlocked=true;
          else damageHero(b.dmg,{sourceX:e.x,sourceZ:e.z,skipAegis:true,kb:b.kb||0,area:true});
        }
      }
      if(b.hitCd>0)b.hitCd-=dt;
      continue;
    }
    if(b.vertical){
      // WRAITH cone: a real discrete projectile from the visible top-edge boss. AEGIS can
      // reflect it and a perfectly timed GRAVITY MAUL swing can home-run it.
      const prevX=b.x,prevZ=b.z;
      b.z+=b.dz*b.speed*dt;b.x+=b.dx*b.speed*dt;b.life-=dt;
      b.mesh.position.x=b.x;b.mesh.position.z=b.z;
      if(b.life<=0||b.z>VIEW.visH+18||b.z<-(VIEW.visH+28)){b.dead=true;continue;}
      const cakeHit=valCakeSegmentBlock(prevX,prevZ,b.x,b.z,(b.beamW||8)*0.42);
      const thornHit=rootyThornGuardSegmentBlock(prevX,prevZ,b.x,b.z,(b.beamW||8)*0.42);
      const coverHit=nearestFriendlyCoverHit(cakeHit,thornHit);
      if(coverHit){
        b.x=coverHit.hit.x;b.z=coverHit.hit.z;
        b.mesh.position.x=b.x;b.mesh.position.z=b.z;
        b.dead=true;
        friendlyCoverFeedback(coverHit,true);
        continue;
      }
      if(Math.abs(h.x-b.x)<b.beamW/2+G.heroR&&Math.abs(h.z-b.z)<12+G.heroR){
        if(b.hitCd<=0){
          const blocked=aegisTryBlock({fromX:-b.dx,fromZ:-b.dz,projectile:true,enemyBullet:b,wraithShard:true});
          if(blocked){b.hitCd=0.6;continue;}
          b.hitCd=0.6;damageHero(b.dmg,{fromX:-b.dx,fromZ:-b.dz,sourceX:b.x-b.dx*4,sourceZ:b.z-b.dz*4,projectile:false,kb:b.kb||0});
        }
      }
      if(b.hitCd>0)b.hitCd-=dt;
      continue;
    }
    if(b.softHoming){
      b.homingAge=(b.homingAge||0)+dt;
      const homingDelay=b.homingDelay||0;
      if(b.homingAge>=homingDelay && b.homingAge <= (b.homingLife||0)){
        const target=enemyPerceivedHeroTarget();
        const dx=target.x-b.x, dz=target.z-b.z, len=Math.max(0.01,Math.hypot(dx,dz));
        const cur=Math.atan2(b.dx,b.dz), tgt=Math.atan2(dx/len,dz/len);
        let dA=tgt-cur; while(dA>Math.PI)dA-=Math.PI*2; while(dA<-Math.PI)dA+=Math.PI*2;
        const cap=(b.homingTurn||1.25)*dt;
        const turn=Math.max(-cap,Math.min(cap,dA));
        b.dx=Math.sin(cur+turn); b.dz=Math.cos(cur+turn);
      }
    }
    const prevX=b.x,prevZ=b.z;
    b.x += b.dx*b.speed*dt; b.z += b.dz*b.speed*dt;
    b.life -= dt;
    b.mesh.position.x = b.x; b.mesh.position.z = b.z;
    if(b.rot) b.mesh.rotation.y += b.rot*dt*60;
    if(b.laser) b.mesh.lookAt(b.x+b.dx, 0, b.z+b.dz);
    if(b.life<=0){ b.dead=true; continue; }

    const cakeHit=valCakeSegmentBlock(prevX,prevZ,b.x,b.z,b.r??4);
    const thornHit=rootyThornGuardSegmentBlock(prevX,prevZ,b.x,b.z,b.r??4);
    const coverHit=nearestFriendlyCoverHit(cakeHit,thornHit);
    if(coverHit){
      b.x=coverHit.hit.x;b.z=coverHit.hit.z;
      b.mesh.position.x=b.x;b.mesh.position.z=b.z;
      b.dead=true;
      friendlyCoverFeedback(coverHit,!!b.laser);
      continue;
    }

    const hitR=(b.r??6)+G.heroR;
    if(dist2(b.x,b.z,h.x,h.z) < hitR*hitR){
      // Let AEGIS inspect the live projectile before it is removed. If blocked, the
      // reflected clone starts at this exact contact point and flies back outward.
      const blocked=aegisTryBlock({fromX:-b.dx,fromZ:-b.dz,projectile:true,enemyBullet:b});
      b.dead=true;
      if(!blocked){
        damageHero(b.dmg,{fromX:-b.dx,fromZ:-b.dz,sourceX:b.x-b.dx*2,sourceZ:b.z-b.dz*2,projectile:false,kb:b.kb||0});
        if(b.softHoming){ spawnRadiusRing(b.x,b.z,18,0xc579ff,0.20); burst(b.x,5,b.z,0xc579ff,7,76,0.26,0.18); }
      }
    }
  }
  G.ebullets = G.ebullets.filter(b=>{ if(b.dead){ sceneRemove(b.mesh); return false; } return true; });
}

// ---------------- Orbs update ----------------
function updateOrbs(dt){
  const h=G.hero;
  const magnet=h.magnetRadius;
  if(G.magnet){G.magnet.t-=dt;if(G.magnet.t<=0)G.magnet=null;}
  for(const o of G.orbs){
    if(o.dead)continue;
    const kind=orbKind(o);
    o.life-=dt;
    o.pickupDelay=Math.max(0,(o.pickupDelay||0)-dt);
    const pickupReady=(o.pickupDelay||0)<=0;
    const returning=(o.returnT||0)>0;
    if(returning){
      const dur=Math.max(0.001,o.returnDur||0.42);
      o.returnT=Math.max(0,o.returnT-dt);
      const p=1-o.returnT/dur;
      const ease=p*p*(3-2*p);
      o.x=o.returnFromX+(o.returnX-o.returnFromX)*ease;
      o.z=o.returnFromZ+(o.returnZ-o.returnFromZ)*ease;
    }
    if(o.life<=0){
      if(o.life>-3){o.mesh.visible=(Math.floor(o.life*5)%2===0);o.glow.visible=o.mesh.visible;}
      if(o.life<-3){o.dead=true;o.mesh.visible=false;o.glow.visible=false;continue;}
    }

    // ABSORBER gets first claim only on tethered XP. Special cake ingredients stay independent.
    let absorbed=false;
    if(!returning && kind==='xp' && o.absorbOwner){
      const a=o.absorbOwner;
      o.absorbLife=Math.max(0,(o.absorbLife||0)-dt);
      if(a.dead||!a.shield||o.absorbLife<=0){o.absorbOwner=null;}
      else {
        const d2a=dist2(o.x,o.z,a.x,a.z),la=Math.max(1,Math.sqrt(d2a));
        const pull=155;
        o.x+=(a.x-o.x)/la*pull*dt;o.z+=(a.z-o.z)/la*pull*dt;
        if(d2a<(a.r+8)*(a.r+8)){
          const heal=Math.max(8,Math.min(60,Math.round(a.maxHp*0.006)));
          const before=a.hp;a.hp=Math.min(a.maxHp,a.hp+heal);const got=Math.round(a.hp-before);
          if(got>0)floater('ABSORB +'+got,a.x,a.z,'heal');
          burst(a.x,9,a.z,0xb86fff,8,70,0.35,0.24);
          o.dead=true; absorbed=true;
        }
      }
    }
    if(absorbed)continue;

    // A heal [+] is never wasted: at full health the hero leaves it where it fell (and the
    // magnet ignores it), so it is still there when the next hit lands. It is the one pickup
    // in the arena that waits for you.
    const fullHp = kind==='heal' && h.hp>=h.maxHp;
    let px=h.x,pz=h.z,pr=kind==='ingredient'?Math.min(28,Math.max(18,magnet*0.38)):magnet;
    const bossMagnet=!!(G.magnet&&G.magnet.t>0&&kind==='xp');
    if(bossMagnet){px=G.magnet.hero?h.x:G.magnet.x;pz=G.magnet.hero?h.z:G.magnet.z;pr=1e9;}
    const d2=dist2(o.x,o.z,px,pz);
    if(!returning&&!fullHp&&pickupReady&&!o.absorbOwner&&d2<pr*pr){
      const len=Math.max(1,Math.sqrt(d2));
      const basePull=((1-Math.min(1,len/(pr===1e9?480:pr)))*420+60)*(bossMagnet?0.2:1);
      const pull=kind==='ingredient'?basePull*0.34:basePull;
      o.x+=(px-o.x)/len*pull*dt;o.z+=(pz-o.z)/len*pull*dt;
    }
    if(!returning&&(o.maulPullT||0)>0){
      const dur=Math.max(0.001,o.maulPullDur||0.38),k=clamp(o.maulPullT/dur,0,1),ease=Math.sin((1-k)*Math.PI);
      o.x+=(o.maulPullVX||0)*ease*dt;o.z+=(o.maulPullVZ||0)*ease*dt;
      o.maulPullT=Math.max(0,o.maulPullT-dt);if(o.maulPullT<=0){o.maulPullVX=0;o.maulPullVZ=0;}
    }
    o.mesh.position.x=o.x;o.mesh.position.z=o.z;o.mesh.position.y=(kind==='ingredient'?5.7:6)+Math.sin(G.time*(kind==='ingredient'?2.2:4)+o.x)*0.55;
    if(o.groundMarker){ o.glow.position.x=o.x; o.glow.position.z=o.z; o.glow.position.y=0.20; }
    else { o.glow.position.copy(o.mesh.position); }
    if(o.plus){
      // A [+] only reads as a [+] while its bars stay upright to the camera. It used to spin in
      // its own plane, which turned the cross into an X twice a second - and because the camera
      // is tilted, the arms visibly breathed in length through every turn. So the spin is gone:
      // the cross now only sways gently off face-on, which keeps it a solid object instead of a
      // flat sticker, and the shared float above carries the bob.
      o.mesh.rotation.y=0.16*Math.sin(G.time*1.5+o.x*0.2);
    } else {
      o.mesh.rotation.y+=dt*(kind==='ingredient'?0.55:2);
      o.mesh.rotation.z+=dt*(kind==='ingredient'?0.22:1.4);
    }
    const pickupR=kind==='ingredient'?19:(o.plus?16.5:15);
    if(!returning&&!fullHp&&pickupReady&&!o.absorbOwner&&d2<pickupR*pickupR){o.dead=true;collectOrb(o);}
  }
  G.orbs=G.orbs.filter(o=>{if(o.dead){sceneRemove(o.mesh);sceneRemove(o.glow);return false;}return true;});
}

function addExp(n){
  const h = G.hero;
  G.exp += n * (h.expMult||1);
  if(G.exp >= EXPM(G.level)) triggerLevelup();
}

function collectOrb(o=null){
  const h = G.hero;
  const kind=orbKind(o);
  if(kind==='heal'){
    // Red [+] - the only pickup that trades nothing for HP. Score moves a touch so the pickup
    // still shows up on the run summary; no gold, so the [+] can not be farmed for currency.
    const amt = Math.max(1,Math.round(o?.amount||4));
    AUD.heal();
    healHero(amt);
    G.score += 2;
    burst(h.x, 10, h.z, 0xff4f6a, 10, 85, 0.55, 0.34);
    return;
  }
  AUD.xp();
  if(kind==='ingredient'){
    h.valIngredients=(h.valIngredients||0)+1;
    G.score += 2;
    G.gold += 1;
    burst(h.x, 8, h.z, 0xffbe89, 7, 70, 0.5, 0.3);
    if((h.valIngredients||0) >= 3){
      tryCraftValCake(h.x,h.z);
    } else {
      floater((h.valIngredients||0)+'/3', h.x, h.z, 'heal');
    }
    return;
  }
  // A green [+] carries more XP than a plain orb; score and gold stay at the plain-orb rate so
  // a bonus drop is never a currency multiplier.
  const xp = Math.max(1,Math.round(o?.amount||1));
  addExp(xp);
  G.score += 1;
  G.gold += 1.5;
  burst(h.x, 8, h.z, 0x9ceb5a, 5, 60, 0.5, 0.3);
  if(xp>1) floater('+'+xp+' XP', h.x, h.z, 'crit');
  if(h.stablefocus && Math.random()<0.2) h.ammo = Math.min(h.maxAmmo, h.ammo+1);
  // GRIZZ gets mild baseline regeneration; Bulwark still converts collected XP
  // into emergency sustain, but at a lower rate so the two healing sources stack cleanly.
  if((h.grizzGuardT||0) > 0){
    const before=h.hp;
    h.hp = Math.min(h.maxHp, h.hp + 0.45);
    const healed=h.hp-before;
    if(healed>0){
      h.grizzHealAcc=(h.grizzHealAcc||0)+healed;
      if(G.time-(h.grizzHealFloatT||0)>=0.28){
        floater('+'+Math.round(h.grizzHealAcc), h.x, h.z, 'heal');
        h.grizzHealAcc=0; h.grizzHealFloatT=G.time;
      }
    }
  }
}

// ---------------- Level up ----------------
const MASTERIES = ['Armor','Reload','Summon','Pyro','Rooted','Dodge','Knockback','Critical'];
const KING_OF = {
  Armor:'armorking', Reload:'reloadreckoner', Summon:'summonking', Pyro:'lordofthelight',
  Rooted:'rootedking', Dodge:'dodgeking', Knockback:'knockbackking', Critical:'exsplosivecrits',
};
function masteryPoints(){
  const m = { Armor:0, Reload:0, Summon:0, Pyro:0, Rooted:0, Dodge:0, Knockback:0, Critical:0 };
  for(const pid of G.perks){
    const p = PERKS.find(x=>x.id===pid);
    if(!p) continue;
    // FLEX repeats scale the perk effect, not the mastery track. One perk ID = one mastery point.
    if(p.mastery && m[p.mastery]!=null) m[p.mastery]+=1;
    if(p.id==='rootedfire') m.Pyro+=1;
  }
  for(const k in (G.masteryBonus||{})){ if(m[k]!=null) m[k] += G.masteryBonus[k]; }
  m.total = MASTERIES.reduce((a,t)=>a+m[t], 0);
  return m;
}

const FANG_SUMMON_PERKS = new Set(['turret','buffturret','twoturrets','doggo','buffdoggo','summonbuff','spinner','spinner2','summonking','penquinpal','penburst']);
const MELEE_BLOCKED_PERKS = new Set(['ranger']);
const FLEX_REPEAT_SLOT_LEVEL = 12;
function perkWeight(p){
  let w = 1;
  if(G.char?.id==='fang' && (p.mastery==='Summon' || p.king==='Summon' || FANG_SUMMON_PERKS.has(p.id))) w *= 1.3;
  return w;
}

function drawPerks(){
  const m = masteryPoints();
  const blockedByGun=p=>
    (G.gun?.special?.includes('melee') || G.gun?.special?.includes('shieldbash') || G.gun?.special?.includes('flameop')) &&
    MELEE_BLOCKED_PERKS.has(p.id);

  const avail = PERKS.filter(p=>{
    if(G.perks.includes(p.id)) return false;
    if(p.requires && !G.perks.includes(p.requires)) return false;
    if(blockedByGun(p)) return false;
    if(p.king) return false;
    if(perkGivesNothing(p)) return false;
    return true;
  });

  for(const t of MASTERIES){
    if(m[t] >= 3 && !G.unlockedKings.includes(KING_OF[t])) G.unlockedKings.push(KING_OF[t]);
  }
  if(m.Pyro>=2 && m.Rooted>=2 && !G.unlockedKings.includes('burningroots')) G.unlockedKings.push('burningroots');
  for(const kid of G.unlockedKings){
    const kp = PERKS.find(x=>x.id===kid);
    if(kp && !G.perks.includes(kid) && !avail.includes(kp)) avail.push(kp);
  }

  const repeats=PERKS
    .filter(base=>
      G.perks.includes(base.id) &&
      !base.king &&
      lateRepeatUseful(base) &&
      (!base.requires || G.perks.includes(base.requires)) &&
      !blockedByGun(base)
    )
    .map(base=>({...base,repeatable:true}));

  const weightedPick=(pool,used=[])=>{
    const candidates=pool.filter(p=>!used.includes(p));
    if(!candidates.length) return null;
    const total=candidates.reduce((s,p)=>s+perkWeight(p),0);
    if(total<=0) return candidates[0];
    let r=Math.random()*total;
    for(const p of candidates){
      r-=perkWeight(p);
      if(r<=0) return p;
    }
    return candidates[candidates.length-1];
  };

  const picks=[];
  const flexRepeatOpen=G.level>=FLEX_REPEAT_SLOT_LEVEL && repeats.length>0;

  // Late-run FLEX slot: one of three cards may come from a useful owned stack even while
  // several unwanted unique perks remain. The other two slots continue exploring the
  // unique pool, so the system does not collapse into three copies of the same build.
  if(flexRepeatOpen && avail.length>=3){
    for(let i=0;i<2;i++){
      const p=weightedPick(avail,picks);
      if(p) picks.push(p);
    }
    const rp=weightedPick(repeats,picks);
    if(rp) picks.push(rp);
  }else{
    const pool=[...avail];

    // When fewer than three unique choices remain, fill only the missing slots with
    // repeatable perks that still produce real gameplay value.
    if(pool.length<3){
      const shuffled=[...repeats];
      for(let i=shuffled.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
      }
      pool.push(...shuffled.slice(0,3-pool.length));
    }

    while(picks.length<3){
      const p=weightedPick(pool,picks);
      if(!p) break;
      picks.push(p);
    }
  }

  // Shuffle final card positions so the FLEX slot is not visually hard-coded to card #3.
  for(let i=picks.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [picks[i],picks[j]]=[picks[j],picks[i]];
  }
  return picks;
}

function triggerLevelup(){
  G.state = 'levelup';
  G.simPaused = true;
  G.level++;

  // Level recovery is 3 HP; Bahamut's LEVEL-UP FEAST recovers 7 HP per level.
  
  if(G.hero && !G.hero.dead && G.hero.hp<G.hero.maxHp){
    const before=G.hero.hp;
    const recovery=G.char?.id==='bahamut' ? 7 : 3;
    G.hero.hp=Math.min(G.hero.maxHp,G.hero.hp+recovery);
    const healed=G.hero.hp-before;
    if(healed>0){
      floater(
        (G.char?.id==='bahamut'?'LEVEL FEAST +':'LEVEL RECOVER +')+Math.round(healed),
        G.hero.x,G.hero.z,'heal'
      );
      G.hero._hudHpTrailRatio=Math.max(G.hero._hudHpTrailRatio??0,G.hero.hp/G.hero.maxHp);
    }
  }
  AUD.levelup();
  showLevelupChoices();
}

function perkDisplay(p){
  if(p?.id==='superplus' && G.char?.unlimitedSuper){
    return { name:'Dash Plus', desc:'Fox Dash cooldown -0.25s.' };
  }
  return { name:p?.name||'', desc:uxCopy(p?.desc||'') };
}

// The two projectile cards are the only cards whose value depends on the gun in hand, so their
// level-up card prints the real numbers for the weapon being held ("1 → 2 PROJECTILES" on a
// laser, "5 → 10 PROJECTILES" on the shotgun) instead of leaving the payout to guesswork.
function projectileVolleyNote(p){
  if(!G.gun || !(p?.id==='doublebullet' || p?.id==='bulletbully')) return '';
  const base=baseVolleySize();
  const stacks=Math.min(RUN_STAT_CAPS.projectileBonus,Math.max(0,Number(G.hero?.mods?.projStacks)||0));
  return base*(1+stacks)+' → '+base*(2+stacks)+' PROJECTILES';
}

function showLevelupChoices(){
  const picks = drawPerks();
  // orig's die (xpmultiplyer) shows a uniform random 1-4 face each level-up and adds that
  const roll = 1 + Math.floor(Math.random()*4);
  const cards = picks.map(p=>{
    const pd=perkDisplay(p);
    const volleyNote=projectileVolleyNote(p);
    return {
    title:pd.name, subtitle:pd.desc+(volleyNote?' · '+volleyNote:''), icon:PERK_ICONS[p.id],
    meta: (()=>{
      if(p.repeatable){
        const next=repeatPerkStackCount(p.id)+1;
        const limit=repeatPerkLimit(p.id);
        return Number.isFinite(limit) ? ('↻ REPEAT '+next+'/'+limit) : ('↻ REPEAT ×'+next);
      }
      return p.king ? '👑 KING PERK' : (p.mastery? '+1 '+p.mastery+' Mastery' : null);
    })(),
    cls:'', color: p.king ? '#cf7dff' : '#ffd166',
    onPick: ()=>{ takePerk(p); }
  }; });
  if(!(G.testMode && G.testSel.scoreDie===false)){
    cards.push({
      title:'SCORE ×'+(G.mult+roll), subtitle:'Permanently multiply your score gain.',
      meta:'+'+roll+' SCORE MULTIPLIER', cls:'dieCard', color:'#9ceb5a',
      onPick: ()=>{ takeDie(roll); }
    });
  }
  showChoice('LEVEL UP!', 'Choose an upgrade', cards, true);
}

function ensureSummons(){
  const wantSpin = Math.min(RUN_STAT_CAPS.spinners,G.hero.spinners||0);
  const spinners = G.summons.filter(s=>s.kind==='spinner');
  while(spinners.length < wantSpin){
    const m = new THREE.Mesh(new THREE.SphereGeometry(7, 10, 8), new THREE.MeshBasicMaterial({ color:0x7fd4ff }));
    sceneAdd(m);
    G.summons.push({ kind:'spinner', mesh:m, t:Infinity, alive:true });
    spinners.push(1);
  }
  while(spinners.length > wantSpin){
    const s = spinners.pop();
    const real = G.summons.find(x=>x.kind==='spinner' && x.alive);
    if(real){ real.alive=false; sceneRemove(real.mesh); }
  }
  const havePen = G.summons.filter(s=>s.kind==='penguin').length;
  if(G.hero.penguin && havePen===0) addPenguin();
  if(!G.hero.penguin && havePen>0){
    const s = G.summons.find(x=>x.kind==='penguin');
    if(s){ s.alive=false; sceneRemove(s.mesh); }
  }
}

function fangEchoSummonPerk(p){
  if(G.char?.id!=='fang') return;
  if(!(p.mastery==='Summon' || p.king==='Summon' || FANG_SUMMON_PERKS.has(p.id))) return;

  // PACK ECHO: a brief bonus wolf rewards FANG for leaning into Summon without
  // turning every Summon-tree pickup into a long-duration permanent damage snowball.
  const wolf=addDog(true,6);
  wolf.packBuffT=2.5;
  wolf.packEcho=true;
  floater('PACK ECHO +1', G.hero.x, G.hero.z, 'crit');
}

function applyPerkEffect(p){
  if(p.id==='superplus' && G.char?.unlimitedSuper){
    const h=G.hero;
    h.super.chargeMax=Math.max(RUN_STAT_CAPS.unlimitedSuperCooldownMin,h.super.chargeMax-0.25);
    h.super.chargeT=Math.min(h.super.chargeT,h.super.chargeMax);
    return;
  }
  p.apply(G);
}
function takePerk(p){
  if(!G.perks.includes(p.id)) G.perks.push(p.id);
  G.perkStacks[p.id]=(Number(G.perkStacks[p.id])||0)+1;
  try {
    applyPerkEffect(p);
  } catch(err){ console.error('perk failed:', p.id, err); }
  // Projectile perks physically widen AEGIS into a two- or three-shield fan.
  syncAegisVisuals();
  ensureSummons();
  fangEchoSummonPerk(p);
  finishLevelup();
}

function takeDie(roll){
  G.mult += roll;
  finishLevelup();
}

function resumeAfterLevelup(){
  G.state='arena';
  G.simPaused=false;
  hideChoice();
  refreshPerkPanel();
}

function finishLevelup(){
  const h = G.hero;
  G.exp = 0;
  h.invince = Math.max(h.invince, 1);
  for(const e of G.enemies){
    if(e.dead) continue;
    const dx=e.x-h.x, dz=e.z-h.z; const len=Math.max(1,Math.hypot(dx,dz));
    if(len<90){ e.kbx+=dx/len*260; e.kbz+=dz/len*260; }
  }
  burst(h.x, 14, h.z, 0xcfd6e0, 16, 130, 0.6, 0.4);
  AUD.perk();

  // Normal level-up flow: choosing the perk / score die IS the confirmation.
  // Resume gameplay immediately on both desktop and mobile.
  resumeAfterLevelup();
}

// ---------------- Summons update ----------------
function canineTargetValid(e){ return !!e && !e.dead; }

function pickCanineTarget(s, h){
  const isWolf = !!s.wolf;
  const wideWolf = isWolf && (s.temp || (s.packHowlT||0)>0);
  // Normal FANG wolves stay readable around their leader. Temporary/howling wolves
  // are the intentionally wider-ranging berserk pack.
  const acquireR = isWolf ? (wideWolf?300:205) : 235;
  const protectR = isWolf ? (wideWolf?150:105) : 190;
  const aimX = G.aimDir?.x || 0, aimZ = G.aimDir?.z || 1;
  let best=null, bestScore=Infinity;

  for(const e of G.enemies){
    if(e.dead) continue;
    const heroD2 = dist2(e.x,e.z,h.x,h.z);
    if(heroD2 > acquireR*acquireR) continue;

    if(s.role==='guard'){
      if(heroD2 > protectR*protectR) continue;
      if(heroD2 < bestScore){ bestScore=heroD2; best=e; }
      continue;
    }

    if(s.role==='vanguard'){
      const dx=e.x-h.x, dz=e.z-h.z;
      const len=Math.max(1,Math.hypot(dx,dz));
      const dot=(dx/len)*aimX + (dz/len)*aimZ;
      if(dot < (isWolf?0.15:0.3)) continue;
      // Prefer what the player is aiming toward, then nearer targets in that cone.
      const score = len * (1.45-dot);
      if(score < bestScore){ bestScore=score; best=e; }
      continue;
    }

    // hunter: nearest prey to this summon, not merely nearest to the hero
    const selfD2 = dist2(e.x,e.z,s.mesh.position.x,s.mesh.position.z);
    if(selfD2 < bestScore){ bestScore=selfD2; best=e; }
  }

  // Vanguard falls back to nearby prey when the aim cone is empty.
  if(!best && s.role==='vanguard'){
    for(const e of G.enemies){
      if(e.dead) continue;
      const d2=dist2(e.x,e.z,h.x,h.z);
      if(d2<bestScore && d2<protectR*protectR){ bestScore=d2; best=e; }
    }
  }
  return best;
}

function animateCanine(s, moveSpeed, dt){
  const rig=s.mesh.userData.canine;
  if(!rig) return;
  const moving=moveSpeed>5;
  s.gait += dt*(s.wolf?12:9)*(0.55+Math.min(1,moveSpeed/(s.wolf?125:85)));
  const amp=moving ? (s.wolf?0.58:0.48) : 0;
  for(let i=0;i<rig.legRoots.length;i++){
    const leg=rig.legRoots[i];
    const phase=(leg.userData.front ? 0 : Math.PI) + (leg.userData.side>0 ? Math.PI : 0);
    leg.rotation.x += (Math.sin(s.gait+phase)*amp-leg.rotation.x)*Math.min(1,dt*12);
  }
  if(moving){
    rig.body.rotation.x = Math.sin(s.gait*2)*0.035;
    rig.head.position.y = (s.wolf?13.0:10.8) + Math.abs(Math.sin(s.gait))*0.28;
  } else {
    rig.body.rotation.x *= Math.max(0,1-dt*8);
    rig.head.position.y += ((s.wolf?13.0:10.8)-rig.head.position.y)*Math.min(1,dt*8);
  }
  if(s.biteAnim>0){
    s.biteAnim=Math.max(0,s.biteAnim-dt);
    rig.head.rotation.x = -0.32*Math.sin((s.biteAnim/(s.wolf?0.16:0.19))*Math.PI);
  } else rig.head.rotation.x *= Math.max(0,1-dt*15);
  rig.tail.rotation.z += ((s.wolf?0.18:0.35) + Math.sin(G.time*(s.wolf?5.2:4.2)+s.slot)*0.18-rig.tail.rotation.z)*Math.min(1,dt*8);
}

function updateCanineSummon(s, h, sm, dt){
  const isWolf=!!s.wolf;
  s.roleT -= dt;
  s.decisionT -= dt;
  s.targetHold -= dt;
  s.biteT -= trainingTimerDt(dt);
  if((s.packBuffT||0)>0) s.packBuffT = Math.max(0, s.packBuffT-dt);
  if((s.packHowlT||0)>0) s.packHowlT = Math.max(0, s.packHowlT-dt);
  const packEchoBuff = isWolf && (s.packBuffT||0)>0;
  const packHowlBuff = isWolf && (s.packHowlT||0)>0;

  if(s.roleT<=0){
    s.role=canineRole(isWolf);
    s.roleT=(isWolf?5:6)+Math.random()*(isWolf?5:7);
    // Role changes do not instantly discard a valid prey; wolves especially stay sticky.
    s.decisionT=Math.min(s.decisionT,0.15+Math.random()*0.25);
  }

  const heroDist=Math.hypot(s.mesh.position.x-h.x,s.mesh.position.z-h.z);
  const wideWolf=isWolf && (s.temp || packHowlBuff);
  const hardLeash=isWolf ? (s.role==='guard' ? (wideWolf?165:118) : (wideWolf?390:235)) : 300;
  const stickyLeash=isWolf ? (s.role==='guard' ? (wideWolf?145:105) : (wideWolf?340:205)) : 260;

  // A real guard interrupts its current plan when FANG is actually threatened.
  // It only reacts to nearby danger, so the rest of the pack can keep distinct jobs.
  let emergencyThreat=null, emergencyD2=Infinity;
  if(isWolf && s.role==='guard'){
    const emergencyR=82;
    for(const threat of G.enemies){
      if(threat.dead) continue;
      const d2=dist2(threat.x,threat.z,h.x,h.z);
      if(d2<emergencyR*emergencyR && d2<emergencyD2){ emergencyD2=d2; emergencyThreat=threat; }
    }
    if(emergencyThreat && s.target!==emergencyThreat){
      s.target=emergencyThreat;
      s.targetHold=1.2;
      s.decisionT=0.2;
    }
  }

  const currentOkay=canineTargetValid(s.target) && dist2(s.target.x,s.target.z,h.x,h.z) <= stickyLeash*stickyLeash;

  if(heroDist>hardLeash){
    s.target=null;
    s.targetHold=0;
  } else if(!currentOkay || (s.decisionT<=0 && s.targetHold<=0)){
    s.target=pickCanineTarget(s,h);
    s.decisionT=(isWolf?0.65:0.9)+Math.random()*(isWolf?0.65:0.95);
    s.targetHold=s.target ? ((isWolf?3.5:2.0)+Math.random()*(isWolf?2.8:2.0)) : 0;
  }

  let moveSpeed=0;
  const e=canineTargetValid(s.target) ? s.target : null;
  if(e){
    // Attack from a contact point around the prey.
    const attackA=s.slot*2.18 + (s.role==='hunter'?0.55:0);
    const contactOffset=Math.max(2,e.r + s.contactR*0.62);
    const tx=e.x + Math.cos(attackA)*contactOffset;
    const tz=e.z + Math.sin(attackA)*contactOffset;
    const dx=tx-s.mesh.position.x, dz=tz-s.mesh.position.z;
    const len=Math.max(0.001,Math.hypot(dx,dz));
    const centerD=Math.hypot(e.x-s.mesh.position.x,e.z-s.mesh.position.z);
    const biteR=e.r + s.contactR + (isWolf?1.5:1.0);
    const chaseSpeed=(isWolf?125:78) + h.dogSpeed + (s.temp?(isWolf?15:10):0) + (packHowlBuff?24:(packEchoBuff?14:0));

    if(len>2.2 && centerD>biteR*0.78){
      const step=Math.min(len,chaseSpeed*dt);
      s.mesh.position.x += dx/len*step;
      s.mesh.position.z += dz/len*step;
      moveSpeed=step/Math.max(dt,0.001);
    }
    const faceX=e.x-s.mesh.position.x, faceZ=e.z-s.mesh.position.z;
    s.mesh.rotation.y=Math.atan2(faceX,faceZ);

    if(centerD<=biteR && s.biteT<=0){
      s.biteT=isWolf ? (packHowlBuff?0.54:(packEchoBuff?0.60:0.68)) : 0.78;
      s.biteAnim=isWolf?0.16:0.19;
      const fl=Math.max(1,Math.hypot(faceX,faceZ));
      // Wolves win on reach, automation and coverage. Their raw bite DPS is intentionally
      // below RAJA's claws; PACK HOWL accelerates the pack without adding another damage multiplier.
      const dmg=isWolf ? (12+(h.wolfFlat||0))*h.dogMult*sm : 12*h.dogMult*sm;
      const biteKb=isWolf ? (packHowlBuff?76:70) : 32;
      damageEnemy(e,dmg,{dirx:faceX/fl,dirz:faceZ/fl,kb:biteKb,show:true});
      // Only PACK HOWL itself grants the pack's brief control bite. PACK ECHO wolves
      // can frenzy for a moment, but do not gain this slow.
      if(packHowlBuff && !e.dead) e.wolfHowlSlowT = Math.max(e.wolfHowlSlowT||0, 0.45);
      burst(e.x,8,e.z,isWolf?0xaeb8c4:0xc88a4a,isWolf?4:3,isWolf?55:42,0.3,0.2);
    }
  } else {
    // Distinct idle formations: guards stay close, vanguards bias toward the aim,
    // hunters roam wider. This keeps packs from behaving like one synchronized blob.
    const baseA=s.slot*2.18 + G.time*(isWolf?0.22:0.16);
    const wideWolf=isWolf && (s.temp || packHowlBuff);
    let radius;
    if(isWolf){
      radius=s.role==='guard' ? (wideWolf?44:32) : (s.role==='hunter' ? (wideWolf?82:58) : (wideWolf?68:46));
    }else{
      radius=s.role==='guard' ? 34 : (s.role==='hunter' ? 62 : 50);
    }
    let fx=h.x+Math.cos(baseA)*radius, fz=h.z+Math.sin(baseA)*radius;
    if(s.role==='vanguard'){
      const forward=isWolf ? (wideWolf?46:30) : 34;
      fx += (G.aimDir?.x||0)*forward;
      fz += (G.aimDir?.z||1)*forward;
    }
    const dx=fx-s.mesh.position.x, dz=fz-s.mesh.position.z;
    const len=Math.max(0.001,Math.hypot(dx,dz));
    const followSpeed=isWolf?138:92;
    if(len>3){
      const step=Math.min(len,followSpeed*dt);
      s.mesh.position.x += dx/len*step;
      s.mesh.position.z += dz/len*step;
      s.mesh.rotation.y=Math.atan2(dx,dz);
      moveSpeed=step/Math.max(dt,0.001);
    }
  }

  s.x=s.mesh.position.x;
  s.z=s.mesh.position.z;
  animateCanine(s,moveSpeed,dt);
}

function updateSummons(dt){
  const h = G.hero;
  const sm = h.mods.summon;
  ensureFangWolfRoleFloor();
  const closest = () => {
    let best=null, bd=1e9;
    for(const e of G.enemies){ if(e.dead) continue; const d=dist2(e.x,e.z,0,0); const d2=dist2(e.x,e.z,h.x,h.z); if(d2<bd){bd=d2;best=e;} }
    return best;
  };
  for(const s of G.summons){
    if(!s.alive) continue;
    s.t -= dt;
    if(s.t<=0){ s.alive=false; sceneRemove(s.mesh); continue; }

    if(s.kind==='dog'){
      updateCanineSummon(s,h,sm,dt);
    }
    else if(s.kind==='turret'){
      s.boostT = Math.max(0,(s.boostT||0)-dt);
      const boosted=s.boostT>0;
      if(s.overdriveRing){
        s.overdriveRing.visible=boosted;
        if(boosted){
          const pulse=(Math.sin(G.time*15)+1)*0.5;
          s.overdriveRing.material.opacity=0.32+0.34*pulse;
          s.overdriveRing.rotation.z+=dt*2.8;
          s.overdriveRing.scale.setScalar(0.95+0.12*pulse);
        }
      }
      const e = closest();
      s.fireT -= trainingTimerDt(dt);
      if(e){
        const dx=e.x-s.mesh.position.x, dz=e.z-s.mesh.position.z; const len=Math.max(1,Math.hypot(dx,dz));
        s.mesh.rotation.y = Math.atan2(dx,dz);
        if(len<300 && s.fireT<=0){
          const rate=boosted?(s.overdriveRate||1.55):1;
          s.fireT = Math.max(0.075, (1.2 - h.turretRateBuff)/rate);
          const shotMul=boosted?(s.overdriveShotMul??1):1;
          fireBullet(s.mesh.position.x, s.mesh.position.z, dx/len, dz/len,
            (8 * h.turretDmg) * sm * shotMul, {color:boosted?0xffb3e3:0x9fd4ff, speed:boosted?560:450, kb:boosted?100:20, life:0.8, r:boosted?2.2:1.8});
          if(boosted && Math.random()<0.55) burst(s.mesh.position.x,8,s.mesh.position.z,0xff9ad5,2,34,0.16,0.10);
        }
      }
    }
    else if(s.kind==='thornGuard'){
      // Thorn Guard is the upgraded form of a ROOTY bramble: stronger contact thorns plus cover.
      // Ordinary enemies are body-blocked; heavy enemies resist the hard stop. Multiple Guards
      // share one enemy cooldown so a three-wall cluster cannot multiply damage into a boss-melter.
      const sr=s.r||ENEMIES.thornwall.r;
      for(const e of G.enemies){
        if(e.dead || e.type==='thornwall') continue;
        const dx=e.x-s.x,dz=e.z-s.z;
        const d=Math.max(0.001,Math.hypot(dx,dz));
        const blockR=sr+e.r*0.78;
        if(d>=blockR) continue;
        const ux=dx/d,uz=dz/d;
        const heavyweight=!!(e.boss||e.elite||e.brain||e.type==='steelcrab'||e.type==='absorber');
        if(!heavyweight){
          const push=blockR-d+0.35;
          e.x+=ux*push;e.z+=uz*push;
          e.x=clamp(e.x,-VIEW.visW+e.r,VIEW.visW-e.r);
          e.z=clamp(e.z,-VIEW.visH+e.r,VIEW.visH-e.r);
          e.mesh.position.x=e.x;e.mesh.position.z=e.z;
        }else{
          e.slowT=Math.max(e.slowT,0.28);
        }
        if((e.rootyThornHitAt||0)<=G.time){
          e.rootyThornHitAt=G.time+0.55;
          damageEnemy(e,24*sm,{dirx:ux,dirz:uz,kb:heavyweight?6:20,show:true,quiet:true});
          if(!e.dead) e.slowT=Math.max(e.slowT,0.55);
          burst(e.x,6,e.z,0x73c95c,4,42,0.22,0.14);
        }
      }
      s.mesh.rotation.y+=dt*0.22;
    }
    else if(s.kind==='spinner'){
      const idx = G.summons.filter(x=>x.kind==='spinner'&&x.alive).indexOf(s);
      const spin = idx===0 ? 2.5 : 3.25;
      const a = G.time*spin + idx*Math.PI;
      s.mesh.position.x = h.x + Math.cos(a)*40;
      s.mesh.position.z = h.z + Math.sin(a)*40;
      s.mesh.rotation.y += dt*4;
      for(const e of G.enemies){
        if(e.dead) continue;
        if(dist2(e.x,e.z,s.mesh.position.x,s.mesh.position.z) < (e.r+8)*(e.r+8) && e.hitCd<=0){
          e.hitCd = 0.5;
          damageEnemy(e, 30*sm, {dirx:Math.cos(a), dirz:Math.sin(a), kb:60, show:true});
        }
      }
    }
    else if(s.kind==='penguin'){
      let best=null, bd=1e9;
      for(const o of G.orbs){
        if(o.dead || !isXpOrb(o)) continue;
        const d2 = dist2(o.x,o.z,s.mesh.position.x,s.mesh.position.z);
        if(d2<bd){ bd=d2; best=o; }
      }
      if(best){
        const dx=best.x-s.mesh.position.x, dz=best.z-s.mesh.position.z; const len=Math.max(1,Math.sqrt(bd));
        s.mesh.position.x += dx/len*25*dt;
        s.mesh.position.z += dz/len*25*dt;
        s.mesh.rotation.y = Math.atan2(dx,dz);
        if(bd < 16*16){
          best.dead = true;
          G.gold += 1;
          G.score += 1;
          addExp(1);
          AUD.xp();
          burst(best.x, 8, best.z, 0x9ceb5a, 5, 60, 0.5, 0.3);
        }
      }
      s.slamT -= trainingTimerDt(dt);
      if(G.hero.penburst && s.slamT<=0){
        s.slamT = 5;
        burst(s.mesh.position.x, 8, s.mesh.position.z, 0xdfe8f5, 14, 90, 0.6, 0.4);
        explodeDamage(s.mesh.position.x, s.mesh.position.z, 70, 50*sm, 0xdfe8f5);
      }
    }
    else if(s.kind==='stinkbug'){
      // A real temporary summon/minion: visible bug body, independent chase AI and
      // Summon Damage scaling. It is a suicide minion, not a fired weapon projectile.
      s.mesh.position.y=0.4+Math.sin((G.time-(s.bornAt||0))*10)*0.35;
      let best=null, bd=1e9;
      for(const e of G.enemies){
        if(e.dead) continue;
        const d2 = dist2(e.x,e.z,s.mesh.position.x,s.mesh.position.z);
        if(d2<bd){ bd=d2; best=e; }
      }
      if(best){
        const dx=best.x-s.mesh.position.x, dz=best.z-s.mesh.position.z; const len=Math.max(1,Math.sqrt(bd));
        s.mesh.position.x += dx/len*25*dt;
        s.mesh.position.z += dz/len*25*dt;
        s.mesh.rotation.y = Math.atan2(dx,dz);
        if(bd < 20*20){
          sceneRemove(s.mesh);
          s.alive = false;
          burst(best.x, 10, best.z, 0x7ac74a, 12, 90, 0.5, 0.4);
          addCloud(best.x, best.z, sm);
          explodeDamage(best.x, best.z, 60, 10*h.mods.poison*sm, 0x7ac74a);
          for(const e of G.enemies){
            if(e.dead) continue;
            if(dist2(e.x,e.z,best.x,best.z) < 60*60){
              applyPoison(e,poisonDps()*sm,2);
            }
          }
        }
      }
    }
  }
  G.summons = G.summons.filter(s=>s.alive);
  ensureFangWolfRoleFloor();
}

// ---------------- Dash ----------------
function getMovementIntentDir(){
  let mx=0,mz=0;
  const k=G.keys||{};
  if(k['KeyW']||k['ArrowUp']) mz-=1;
  if(k['KeyS']||k['ArrowDown']) mz+=1;
  if(k['KeyA']||k['ArrowLeft']) mx-=1;
  if(k['KeyD']||k['ArrowRight']) mx+=1;
  const mv=G.touch?.move;
  if(mv){ mx+=mv.dx; mz+=mv.dz; }
  const len=Math.hypot(mx,mz);
  if(len<=0.15) return null;
  return {x:mx/len,z:mz/len};
}

function repositionDirection(override=null){
  if(override){
    const len=Math.max(0.001,Math.hypot(override.x,override.z));
    return {x:override.x/len,z:override.z/len};
  }
  // Desktop reposition skills always follow the mouse aim. Mobile quick-taps pass the
  // left-stick direction explicitly, while a mobile drag passes its own override vector.
  const len=Math.max(0.001,Math.hypot(G.aimDir.x,G.aimDir.z));
  return {x:G.aimDir.x/len,z:G.aimDir.z/len};
}

function porterWarpBounds(){
  const heroEdgePad=4+Math.max(0,G.heroR-HERO_R)*0.55;
  return {
    minX:-(VIEW.visW-heroEdgePad),
    maxX:VIEW.visW-heroEdgePad,
    minZ:-(VIEW.visH-heroEdgePad)+VIEW.walkShift,
    maxZ:(VIEW.visH-heroEdgePad)+VIEW.walkShift,
  };
}

function porterMaxWarpDistance(x,z,dx,dz){
  const b=porterWarpBounds();
  const tx=dx>0.0001?(b.maxX-x)/dx:(dx<-0.0001?(b.minX-x)/dx:Infinity);
  const tz=dz>0.0001?(b.maxZ-z)/dz:(dz<-0.0001?(b.minZ-z)/dz:Infinity);
  return Math.max(0,Math.min(tx>0?tx:Infinity,tz>0?tz:Infinity));
}

function sprintRequestedNow(){
  const k=G.keys||{};
  return !!(G.mouse.rDown || G.touchSprint || G.desktopSprintToggle || k['ShiftLeft'] || k['ShiftRight']);
}

function sprintCanStart(h=G.hero){
  return !!(h && h.sprint && h.stamina>=SPRINT_START_STAMINA-0.01);
}

function updateSprintVisual(h,active,dx=0,dz=0,dt=0){
  let fx=h?.sprintFx;
  if(!fx){
    if(!active) return;
    fx=new THREE.Group();
    const offsets=[-10,-5,0,5,10];
    for(let i=0;i<offsets.length;i++){
      const mat=new THREE.MeshBasicMaterial({
        color:i%2?0x88dcff:0xe2f7ff,transparent:true,opacity:0.34,depthWrite:false,
        blending:THREE.AdditiveBlending
      });
      const line=new THREE.Mesh(new THREE.BoxGeometry(i===2?0.8:0.58,0.22,13+(i%3)*4),mat);
      line.position.set(offsets[i],2.8,-12-i*3.2);
      line.userData.sprintIndex=i;
      fx.add(line);
    }
    fx.visible=false;
    sceneAdd(fx);
    h.sprintFx=fx;
    h.sprintFxT=0;
  }
  fx.visible=!!active;
  if(!active) return;
  h.sprintFxT=(h.sprintFxT||0)+dt*34;
  fx.position.set(h.x,0.4,h.z);
  fx.rotation.y=Math.atan2(dx,dz);
  for(const line of fx.children){
    const i=line.userData.sprintIndex||0;
    const phase=(h.sprintFxT+i*5.2)%24;
    line.position.z=-7-phase;
    line.material.opacity=0.18+0.30*(1-phase/24);
  }
}

function tryDash(skillDir=null){
  if(G.state!=='arena' || G.simPaused) return;
  const h = G.hero;
  if(!h || h.dead || !h.dash || h.dashing) return;
  if(h.stamina < DASH_STAMINA_COST - 0.01) return;
  const dir=repositionDirection(skillDir);
  h.stamina = Math.max(0,h.stamina-DASH_STAMINA_COST);
  h.dashing = { dx:dir.x, dz:dir.z, t:0, dur:0.16, dist:DASH_DIST };
  h.invince = Math.max(h.invince, h.dashing.dur + 0.05);
  AUD.dash();
  burst(h.x, 8, h.z, 0x9fd4ff, 12, 140, 0.5, 0.3);
  if(h.dashFire){
    spawnFireTrail(h.x, h.z, h.x + dir.x*DASH_DIST, h.z + dir.z*DASH_DIST);
  }
}

function distToSeg(px,pz,x0,z0,x1,z1){
  const dx=x1-x0, dz=z1-z0;
  const L2 = dx*dx+dz*dz;
  const t = L2 ? clamp(((px-x0)*dx+(pz-z0)*dz)/L2, 0, 1) : 0;
  return Math.hypot(px-(x0+dx*t), pz-(z0+dz*t));
}

function spawnFireTrail(x0,z0,x1,z1,opts={}){
  const dx=x1-x0, dz=z1-z0;
  const len = Math.max(1, Math.hypot(dx,dz));
  const w = opts.width||DASH_TRAIL_W, r = w/2;
  const grp = new THREE.Group();
  const mk = tex => new THREE.MeshBasicMaterial({ map:tex, transparent:true, opacity:1, depthWrite:false, blending:THREE.AdditiveBlending });
  const bodyMat = mk(G.fireBandTex), discMat = mk(G.fireDiscTex);
  // body: rectangle spanning the dash start→end (yawed on a parent group so the x-flatten and
  const bodyGrp = new THREE.Group();
  bodyGrp.rotation.y = Math.atan2(dx, dz);
  const body = new THREE.Mesh(new THREE.PlaneGeometry(w, len), bodyMat);
  body.rotation.x = -Math.PI/2;
  body.position.y = 2;
  bodyGrp.add(body);
  bodyGrp.position.set((x0+x1)/2, 0, (z0+z1)/2);
  grp.add(bodyGrp);
  // filled (non-hollow) circle at each end — diameter = trail width, so the 3 shapes form a pill
  const discGeo = new THREE.CircleGeometry(r, 24);
  for(const [cx,cz] of [[x0,z0],[x1,z1]]){
    const c = new THREE.Mesh(discGeo, discMat);
    c.rotation.x = -Math.PI/2;
    c.position.set(cx, 2, cz);
    grp.add(c);
  }
  sceneAdd(grp);
  G.effects.push({
    kind:'fireroad', mesh:grp, mat:bodyMat, mats:[bodyMat,discMat], glows:[],
    x0, z0, x1, z1, halfW:r, t:0, life:opts.life||10, dps:opts.dps||0,
    hostile:!!opts.hostile, heroDamage:opts.heroDamage||0, heroHitEvery:opts.heroHitEvery||0.68, heroHitT:0
  });
}

function spawnFireRing(x,z){
  const grp = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ map:G.fireDiscTex, transparent:true, opacity:0.9, depthWrite:false, blending:THREE.AdditiveBlending });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(DASH_RING_R, 48), mat);
  disc.rotation.x = -Math.PI/2;
  disc.position.y = 2;
  grp.add(disc);
  grp.position.set(x, 0, z);
  sceneAdd(grp);
  G.effects.push({ kind:'firering', mesh:grp, mat, glows:[], x, z, r:DASH_RING_R, t:0, life:3 });
}

function spawnRadiusRing(x, z, r, color, life=0.9){
  const mat = new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.9, depthWrite:false, side:THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.96, 1.0, 64), mat);
  ring.rotation.x = -Math.PI/2;
  ring.position.set(x, 1.6, z);
  ring.scale.setScalar(r);
  sceneAdd(ring);
  G.effects.push({ kind:'ringfx', mesh:ring, mat, x, z, r, color, t:0, life });
}

function queueRadiusRing(x, z, r, color, delay, life=0.9){
  G.effects.push({ kind:'delayedRing', x, z, r, color, delay, ringLife:life, t:0, life:delay+0.05 });
}

// Soft annulus for spawnSoftRing below. Every edge fades to nothing on purpose: a hard-edged
// RingGeometry outline reads as a drawn shape parked on the floor rather than as a wave of light
// leaving the hero.
let _softRingTex = null;
function softRingTexture(){
  if(_softRingTex) return _softRingTex;
  const s=128, c=document.createElement('canvas'); c.width=c.height=s;
  const ctx=c.getContext('2d');
  const g=ctx.createRadialGradient(s/2,s/2,s*0.10,s/2,s/2,s*0.5);
  g.addColorStop(0,'rgba(255,255,255,0)');
  g.addColorStop(0.38,'rgba(255,255,255,0)');
  g.addColorStop(0.62,'rgba(255,255,255,0.18)');
  g.addColorStop(0.79,'rgba(255,255,255,0.90)');
  g.addColorStop(0.90,'rgba(255,255,255,0.24)');
  g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,s,s);
  _softRingTex = new THREE.CanvasTexture(c);
  _softRingTex.colorSpace = THREE.SRGBColorSpace;
  return _softRingTex;
}

// Expanding ring with a graded band instead of a hard-edged RingGeometry outline - used for
// the PHASE RUN activation flourish, where a crisp ring would read as a drawn shape.
function spawnSoftRing(x, z, r, color, life=0.75, y=1.2){
  const tex = softRingTexture();
  const mat = new THREE.MeshBasicMaterial({map:tex,color,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1,1),mat);
  m.rotation.x = -Math.PI/2; m.position.set(x, y, z);
  sceneAdd(m);
  G.effects.push({kind:'softRing',mesh:m,mat,r,t:0,life});
}

function spawnPorterPortal(x,z,arrival=false){
  const grp=new THREE.Group();
  const outerMat=new THREE.MeshBasicMaterial({color:0x8f6bff,transparent:true,opacity:0.88,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
  const innerMat=new THREE.MeshBasicMaterial({color:0x6fd9ff,transparent:true,opacity:0.68,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
  const coreMat=new THREE.MeshBasicMaterial({color:0x351d63,transparent:true,opacity:0.30,depthWrite:false,side:THREE.DoubleSide});
  const outer=new THREE.Mesh(new THREE.TorusGeometry(18,2.3,7,32),outerMat);
  const inner=new THREE.Mesh(new THREE.TorusGeometry(13.5,0.85,6,28),innerMat);
  const core=new THREE.Mesh(new THREE.CircleGeometry(13.2,28),coreMat);
  core.position.z=-0.18;
  grp.add(core); grp.add(outer); grp.add(inner);
  grp.position.set(x,12,z);
  sceneAdd(grp);
  G.effects.push({kind:'porterPortal',mesh:grp,outerMat,innerMat,coreMat,arrival:!!arrival,t:0,life:0.48});
}

function spawnHawkWindBurst(x, z, dx, dz, scale=1){
  const grp = new THREE.Group();
  grp.position.set(x, 0, z);
  grp.rotation.y = Math.atan2(dx, dz);

  const gustMat = new THREE.MeshBasicMaterial({
    color:0xdff8ff,
    transparent:true,
    opacity:0.78,
    depthWrite:false,
    side:THREE.DoubleSide,
    blending:THREE.AdditiveBlending,
  });
  const wakeMat = new THREE.MeshBasicMaterial({
    color:0x8fe8ff,
    transparent:true,
    opacity:0.28,
    depthWrite:false,
    side:THREE.DoubleSide,
    blending:THREE.AdditiveBlending,
  });

  const wake = new THREE.Mesh(new THREE.RingGeometry(3.2, 6.0, 32, 1, -Math.PI*0.40, Math.PI*0.80), wakeMat);
  wake.rotation.x = -Math.PI/2;
  wake.position.y = 0.55;
  wake.scale.setScalar(4.8*scale);
  grp.add(wake);

  const gusts=[];
  const gustBands=[
    { z:36, w:18, h:9, x:0 },
    { z:56, w:20, h:10, x:-14 },
    { z:58, w:20, h:10, x:14 },
    { z:84, w:22, h:11, x:-26 },
    { z:84, w:22, h:11, x:26 },
    { z:112, w:24, h:12, x:-40 },
    { z:112, w:24, h:12, x:40 },
  ];
  for(const cfg of gustBands){
    const gust = new THREE.Mesh(new THREE.PlaneGeometry(cfg.w, cfg.h), gustMat.clone());
    gust.position.set(cfg.x*scale, 7.5 + Math.abs(cfg.x)*0.02, cfg.z*scale);
    gust.rotation.y = cfg.x*0.0025;
    gust.userData.baseX = cfg.x*scale;
    gust.userData.baseY = gust.position.y;
    gust.userData.baseZ = cfg.z*scale;
    gust.userData.side = Math.sign(cfg.x);
    grp.add(gust);
    gusts.push(gust);
  }

  sceneAdd(grp);
  G.effects.push({ kind:'windgust', mesh:grp, gusts, mats:[wakeMat, ...gusts.map(g=>g.material)], t:0, life:0.46, scale });
}

function hawkImpact(h, dx, dz){
  const ix=h.x+dx*46, iz=h.z+dz*46;
  burst(ix,10,iz,0xe9b447,54,310,1.0,0.70);
  spawnHawkWindBurst(ix,iz,dx,dz,1.0);
  queueRadiusRing(ix+dx*22,iz+dz*22,26,0xdff8ff,0.02,0.22);
  queueRadiusRing(ix+dx*60,iz+dz*60,32,0xa6ecff,0.06,0.24);
  queueRadiusRing(ix+dx*104,iz+dz*104,38,0x7fd8ff,0.10,0.26);
  G.shake=Math.max(G.shake,1.0);

  const perpX=dz, perpZ=-dx;
  for(const e of G.enemies){
    if(e.dead || e.kind==='shield') continue;
    const ex=e.x-h.x, ez=e.z-h.z;
    const d=Math.hypot(ex,ez);
    if(d>210 || d<1) continue;
    const dot=(ex/d)*dx+(ez/d)*dz;
    if(dot<0.05) continue; // huge forward wind cone, still not a radial roar

    // Impact damage is still secondary; the dive's identity is hurricane-force displacement.
    damageEnemy(e,14,{dirx:dx,dirz:dz,kb:0,show:true});

    // Push both FORWARD and hard OUTWARD from the dive centerline. This creates the
    // lateral crowd-splitting behavior toward arena edges rather than a radial
    // radial nudge. Boss classes still move, but resist enough to remain boss-like.
    const lateral=ex*perpX+ez*perpZ;
    const side=lateral>=0?1:-1;
    let px=dx*0.82+perpX*side*1.18;
    let pz=dz*0.82+perpZ*side*1.18;
    const plen=Math.max(0.001,Math.hypot(px,pz));
    px/=plen; pz/=plen;

    const classScale=e.type==='bahamut'?0.20:(e.apexBoss?enemyKnockResponse(e):(e.boss?0.34:((e.elite||e.brain)?0.55:1)));
    const distanceScale=0.82+0.18*(1-d/210);
    const resist=1+(e.kb||0)*0.012;
    // Normal enemies are effectively blasted to the arena edge in a few frames.
    // Bosses retain strong class/KB resistance so this stays crowd-clearing rather than boss cheese.
    const impulse=9000*classScale*distanceScale/resist;
    e.kbx+=px*impulse;
    e.kbz+=pz*impulse;
    e.knockoutSource='TALON';

    if(!e.dead) e.stunT=Math.max(e.stunT||0,e.boss?0.28:0.78);
  }
}

function clawMarkHitsEnemy(e,x,z,angle=0,scale=1){
  // Match the three visible BoxGeometry claw stripes in spawnClawMark. Enemy radius is
  // included so an apparent model overlap counts instead of demanding pixel-perfect centers.
  const ca=Math.cos(angle), sa=Math.sin(angle);
  for(let i=-1;i<=1;i++){
    const lx=i*4.6*scale, lz=i*0.55*scale;
    const cx=x+lx*ca+lz*sa, cz=z-lx*sa+lz*ca;
    const a=angle-i*0.055, dx=Math.sin(a), dz=Math.cos(a), half=10.75*scale;
    if(distToSeg(e.x,e.z,cx-dx*half,cz-dz*half,cx+dx*half,cz+dz*half)<=e.r+0.60*scale) return true;
  }
  return false;
}

function spawnClawMark(x, z, angle=0, color=0xff3048, scale=1){
  // The mark is centered exactly on the hit coordinates and aligned with the
  // hero→target attack direction. No random rotation or displaced visual origin.
  const grp=new THREE.Group();
  const mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.95,depthWrite:false,side:THREE.DoubleSide});
  for(let i=-1;i<=1;i++){
    const slash=new THREE.Mesh(new THREE.BoxGeometry(1.20,0.72,21.5),mat);
    slash.position.set(i*4.6,6.1,i*0.55);
    slash.rotation.y=-i*0.055;
    grp.add(slash);
  }
  const hit=new THREE.Mesh(new THREE.RingGeometry(2.2,3.5,18),mat);
  hit.rotation.x=-Math.PI/2;
  hit.position.y=0.07;
  grp.add(hit);
  grp.position.set(x,0.72,z);
  grp.rotation.y=angle;
  grp.scale.setScalar(scale);
  sceneAdd(grp);
  G.effects.push({kind:'clawfx',mesh:grp,mat,baseScale:scale,t:0,life:scale>1?0.40:0.34});
}

function spawnClawHeadMark(target, angle=0, color=0xff3048, scale=1){
  if(!target || target.dead) return;
  // target so the paw mark reads as an enemy hit indicator.
  const grp=new THREE.Group();
  const mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.96,depthWrite:false,depthTest:false,side:THREE.DoubleSide});
  for(let i=-1;i<=1;i++){
    const slash=new THREE.Mesh(new THREE.BoxGeometry(1.15,18.5,0.60),mat);
    slash.position.set(i*4.2,0,i*0.22);
    slash.rotation.z=-i*0.07;
    grp.add(slash);
  }
  const headY=Math.max(12,(target.r||10)*1.45+7);
  grp.position.set(target.x,headY,target.z);
  // Keep the mark facing the gameplay camera while retaining a small attack-direction tilt.
  grp.rotation.x=-0.18;
  grp.rotation.y=angle*0.10;
  grp.scale.setScalar(scale);
  sceneAdd(grp);
  G.effects.push({kind:'clawfx',mesh:grp,mat,baseScale:scale,t:0,life:0.36});
}

function spawnKingsPawMark(x,z,angle=0){
  const grp=new THREE.Group();
  const mat=new THREE.MeshBasicMaterial({color:0xffd166,transparent:true,opacity:0.88,side:THREE.DoubleSide,depthWrite:false});
  const addPad=(r,px,pz,sx=1,sz=1)=>{
    const pad=new THREE.Mesh(new THREE.CircleGeometry(r,12),mat);
    pad.rotation.x=-Math.PI/2;
    pad.position.set(px,0,pz);
    pad.scale.set(sx,sz,1);
    grp.add(pad);
  };
  addPad(3.6,0,-0.6,1.25,1.0);
  addPad(1.45,-3.2,3.0,1.0,1.1);
  addPad(1.55,-1.05,4.2,1.0,1.15);
  addPad(1.55,1.25,4.15,1.0,1.15);
  addPad(1.35,3.35,2.85,1.0,1.08);
  grp.position.set(x,0.82,z);
  grp.rotation.y=angle;
  sceneAdd(grp);
  G.effects.push({kind:'pawfx',mesh:grp,mat,t:0,life:0.34});
}

// ---------------- Hero update ----------------
function updateHero(dt){
  const h = G.hero;
  if(h.dead) return;
  if((h.briarSlowT||0)>0) h.briarSlowT=Math.max(0,h.briarSlowT-dt);

  // TALON passive — automatically alternate vulnerable ground time and completely
  // untouchable flight time. Start grounded so the passive has a readable cadence.
  if(h.skyCycle){
    h.flightT += dt;
    const limit=h.airborne?h.flightDur:h.groundDur;
    if(h.flightT>=limit){
      h.flightT=0;
      h.airborne=!h.airborne;
      floater(h.airborne?'TAKEOFF · IMMUNE':'LANDED · VULNERABLE',h.x,h.z,h.airborne?'dodge':'ammo');
      if(h.airborne){
        spawnRadiusRing(h.x,h.z,28,0x76e4ff,0.46);
        burst(h.x,8,h.z,0xe9b447,18,110,0.48,0.27);
      }else{
        // Landing protection: a small shockwave clears Talon's feet without turning
        // the passive landing into another offensive Super. Damage is deliberately low;
        // the main value is a brief, gentle shove away from the touchdown point.
        const landingR=46;
        spawnRadiusRing(h.x,h.z,landingR,0xff8a52,0.44);
        burst(h.x,5,h.z,0xd3b071,14,82,0.40,0.24);
        for(const e of G.enemies){
          if(e.dead || e.kind==='shield') continue;
          const dx=e.x-h.x, dz=e.z-h.z;
          const len=Math.max(1,Math.hypot(dx,dz));
          if(len<=landingR+e.r){
            damageEnemy(e,5,{dirx:dx/len,dirz:dz/len,kb:95,show:true});
          }
        }
      }
    }
  }

  if(h.valBaker){
    h.valDropT = (h.valDropT||0) + trainingTimerDt(dt);
    if(h.valDropT >= (h.valDropEvery||7)){
      h.valDropT -= (h.valDropEvery||7);
      spawnValIngredient(h.x,h.z,{spread:36,minR:14,pickupDelay:0.35});
      burst(h.x,6,h.z,0xffc2e4,4,55,0.28,0.18);
    }
  }

  // movement
  let mx=0, mz=0;
  const k = G.keys;
  if(k['KeyW']||k['ArrowUp']) mz -= 1;
  if(k['KeyS']||k['ArrowDown']) mz += 1;
  if(k['KeyA']||k['ArrowLeft']) mx -= 1;
  if(k['KeyD']||k['ArrowRight']) mx += 1;
  // touch joystick
  if(G.touch && G.touch.move){
    mx += G.touch.move.dx; mz += G.touch.move.dz;
  }
  const mag = Math.hypot(mx,mz);
  const ml = Math.max(1, mag);
  // Mobile idle-facing follows movement. Once the right-hand aim gesture begins,
  // that gesture owns facing until release. This makes a plain tap fire in the
  // character facing direction when no drag direction is supplied.
  if(G.mouse.touchMode && !(G.touch&&G.touch.aim) && !G.mobileSkillAiming && mag>0.1){
    G.aimDir.x = mx/mag; G.aimDir.z = mz/mag;
    G.aimWorld.set(h.x+G.aimDir.x*190,0,h.z+G.aimDir.z*190);
  }
  let sprintVisualActive=false, sprintVisualDx=0, sprintVisualDz=0;
  if(h.dashing){
    // dash overrides movement input: straight line along the aim, invincible.
    // BAHAMUT gets a brief visible charge so Final Apex Rush reads as a rush, not a teleport.
    const dash = h.dashing;
    dash.t += dt;
    const bahamutCharging=!!(dash.bahamutRush && dash.t<(dash.windup||0));
    if(!bahamutCharging){
      const moveDur=dash.bahamutRush ? (dash.travelDur||dash.dur) : dash.dur;
      h.x += dash.dx * (dash.dist/moveDur) * dt;
      h.z += dash.dz * (dash.dist/moveDur) * dt;
      G.heroMoving = true;
    }else{
      G.heroMoving = false;
      if(Math.random()<dt*18) burst(h.x,10,h.z,0xb86cff,2,54,0.22,0.14);
    }
    if(dash.hawkDive){
      // The whole dive corridor acts like a cutting typhoon: low pass-through damage,
      // but enemies clipped along the route are violently peeled sideways away from
      // TALON's centerline. The final impact remains the truly insane forward blast.
      const perpX=dash.dz, perpZ=-dash.dx;
      for(const e of G.enemies){
        if(e.dead || dash.hits.has(e)) continue;
        const ex=e.x-h.x, ez=e.z-h.z;
        if(ex*ex+ez*ez < (42 + e.r)*(42 + e.r)){
          dash.hits.add(e);
          damageEnemy(e,4,{dirx:dash.dx,dirz:dash.dz,kb:0,show:true});

          const lateral=ex*perpX+ez*perpZ;
          const side=lateral>=0?1:-1;
          let px=dash.dx*0.24+perpX*side;
          let pz=dash.dz*0.24+perpZ*side;
          const plen=Math.max(0.001,Math.hypot(px,pz));
          px/=plen; pz/=plen;
          const classScale=e.type==='bahamut'?0.18:(e.apexBoss?enemyKnockResponse(e):(e.boss?0.30:((e.elite||e.brain)?0.55:1)));
          const resist=1+(e.kb||0)*0.014;
          const impulse=3200*classScale/resist;
          e.kbx+=px*impulse;
          e.kbz+=pz*impulse;
          e.knockoutSource='TALON';
          burst(e.x,7,e.z,0xa6ecff,7,125,0.30,0.18);
        }
      }
    }
    if(dash.foxDash){
      // fox dash: knock back + damage each enemy swept through, once per enemy
      for(const e of G.enemies){
        if(e.dead || dash.hits.has(e)) continue;
        if(dist2(e.x,e.z,h.x,h.z) < (40 + e.r)*(40 + e.r)){
          dash.hits.add(e);
          damageEnemy(e, 4*h.mods.dmg, {dirx:dash.dx, dirz:dash.dz, kb:240, show:true});
          burst(e.x, 8, e.z, 0xffc98a, 6, 110, 0.32, 0.18);
        }
      }
    }
    if(dash.bahamutRush && !bahamutCharging){
      for(const e of G.enemies){
        if(e.dead || dash.hits.has(e)) continue;
        if(dist2(e.x,e.z,h.x,h.z) < (46 + e.r)*(46 + e.r)){
          dash.hits.add(e);
          damageEnemy(e,70*h.mods.dmg,{dirx:dash.dx,dirz:dash.dz,kb:620*h.mods.kb,show:true});
          burst(e.x,10,e.z,0xff7a3d,10,135,0.38,0.24);
        }
      }
      dash.trailT=(dash.trailT||0)+dt;
      if(dash.trailT>=0.09){
        dash.trailT=0;
        spawnRadiusRing(h.x,h.z,36,0xff8d4d,0.22);
      }
      if(Math.random()<dt*22) burst(h.x,8,h.z,0xffd166,2,70,0.28,0.18);
    }
    if(dash.t >= dash.dur){
      h.dashing = null;
      if(dash.hawkDive){
        hawkImpact(h,dash.dx,dash.dz);
        h.invince=Math.max(h.invince,0.30);
      } else if(dash.bahamutRush){
        // The rush itself is a weapon, not just a teleport-to-impact. Contact damage is
        // handled continuously above; the completed route remains as a short Dragon-fire road.
        spawnFireTrail(dash.startX??h.x,dash.startZ??h.z,h.x,h.z,{width:120,life:5.5,dps:30*h.mods.fire});
        bahamutHeroImpact(h,dash.dx,dash.dz);
        h.invince=Math.max(h.invince,1.25);
      } else if(!dash.foxDash){
        h.invince = Math.max(h.invince, 2);
        if(h.dashFire) spawnFireRing(h.x, h.z);
      } else {
        // FOX DASH finishes with a harmless-but-forceful fox-puff. The dash is an escape/reposition
        // Super, so reward landing beside a crowd with real breathing room instead of a cosmetic burst.
        const puffR=58;
        for(const e of G.enemies){
          if(e.dead || e.kind==='shield') continue;
          const ex=e.x-h.x, ez=e.z-h.z, len=Math.max(1,Math.hypot(ex,ez));
          if(len<=puffR+e.r){
            const m=180*enemyKnockResponse(e)/(1+(e.kb||0)*0.03);
            e.kbx+=(ex/len)*m; e.kbz+=(ez/len)*m;
          }
        }
        spawnRadiusRing(h.x,h.z,puffR,0xffc98a,0.34);
        burst(h.x, 14, h.z, 0xff9a3d, 20, 150, 0.6, 0.4);
      }
    }
  } else {
    const blinkRunning=(h.blinkRunT||0)>0;
    let speed = HERO_BASE.speed * h.mods.speed * (blinkRunning?2.0:1);
    if((h.tigerFrenzyT||0)>0) speed *= 1.35;
    // OP close-range weapons compensate for their reach by helping the player stay
    // in contact. This is a weapon property so movement balance stays centralized.
    speed *= G.gun?.moveMul || 1;
    if((h.briarSlowT||0)>0 && !blinkRunning) speed*=0.78;
    if(h.skyCycle) speed *= h.airborne ? h.flightSpeed : h.groundSpeed;
    const sprintRequested = h.sprint && sprintRequestedNow();
    if(!sprintRequested) h.sprintActive=false;
    else if(!h.sprintActive && sprintCanStart(h)) h.sprintActive=true;
    const sprinting = !blinkRunning && !!h.sprintActive && sprintRequested && mag>0.1 && h.stamina>0;
    if(sprinting){
      speed *= 1.7;
      sprintVisualActive=true;
      sprintVisualDx=mx/mag;
      sprintVisualDz=mz/mag;
    }else if(blinkRunning && mag>0.1){
      sprintVisualActive=true;
      sprintVisualDx=mx/mag;
      sprintVisualDz=mz/mag;
      h.blinkRunFxT=(h.blinkRunFxT||0)+dt;
      if(h.blinkRunFxT>=0.10){
        h.blinkRunFxT=0;
        burst(h.x,4,h.z,0x7d8cff,2,32,0.18,0.11);
      }
    }
    h.x += mx/ml * speed * dt;
    h.z += mz/ml * speed * dt;
    G.heroMoving = mag>0.1;
    if(sprinting){
      h.stamina = Math.max(0, h.stamina - h.staminaDrain*dt);
      // A started sprint may drain below the 20-stamina start threshold, but after
      // exhaustion it must recharge to the threshold before a new sprint can begin.
      if(h.stamina<=0.001){
        h.sprintActive=false;
        if(G.touchSprint) G.touchSprint=false;
        if(G.desktopSprintToggle) G.desktopSprintToggle=false;
      }
    } else if(h.sprint){
      h.stamina = Math.min(h.maxStamina, h.stamina + h.staminaRegen*h.staminaRegenMult*trainingTimerDt(dt));
    }
  }
  // Hostile melee/impact knockback is a real movement impulse. AEGIS block/dodge returns
  // before damageHero applies it, so successful defense never causes phantom shove.
  if((h.blinkRunT||0)>0){
    h.kbx=0; h.kbz=0;
  }else if(!h.dashing && (Math.abs(h.kbx||0)>0.05 || Math.abs(h.kbz||0)>0.05)){
    h.x+=(h.kbx||0)*dt;
    h.z+=(h.kbz||0)*dt;
  }
  h.kbx=(h.kbx||0)*Math.exp(-9*dt);
  h.kbz=(h.kbz||0)*Math.exp(-9*dt);

  // Keep larger visual/collision footprints inside the arena without shrinking bunny movement space.
  const heroEdgePad = 4 + Math.max(0, G.heroR - HERO_R)*0.55;
  h.x = clamp(h.x, -(VIEW.visW-heroEdgePad), VIEW.visW-heroEdgePad);
  h.z = clamp(h.z, -(VIEW.visH-heroEdgePad)+VIEW.walkShift, (VIEW.visH-heroEdgePad)+VIEW.walkShift);
  h.mesh.position.x = h.x;
  h.mesh.position.z = h.z;
  updateSprintVisual(h,sprintVisualActive,sprintVisualDx,sprintVisualDz,dt);
  if(G.mobileSkillPreview) updateMobileSkillPreview(G.mobileSkillPreview);

  h.super.chargeT = Math.min(h.super.chargeMax, h.super.chargeT + trainingTimerDt(dt));

  // bob + face. TALON physically rises while airborne; KAMIKAZE keeps him low and fast.
  const hawkDiving=!!(h.dashing&&h.dashing.hawkDive);
  const hawkCycleLeft=h.skyCycle ? ((h.airborne?h.flightDur:h.groundDur)-h.flightT) : 999;
  const hawkCueWindow=1.00;
  const hawkLandingHint=h.skyCycle && h.airborne && hawkCycleLeft<=hawkCueWindow && !hawkDiving;
  if(h.skyCycle && (h.airborne||hawkDiving)) h.mesh.position.y = hawkDiving ? 5.5 : 13.5 + Math.sin(G.time*8)*1.4;
  else h.mesh.position.y = G.heroMoving ? Math.abs(Math.sin(G.time*10))*2 : Math.sin(G.time*3)*0.8;
  h.mesh.rotation.y = Math.atan2(G.aimDir.x, G.aimDir.z);
  if(G.char?.dragon) animateBahamutGait(h.mesh,!!G.heroMoving,dt,h.dashing?.bahamutRush?1.28:1);
  updateAegisGuardVisual(dt);
  h.bobT += dt;

  const wings=h.mesh.userData.wings;
  if(wings){
    const flying=h.airborne||hawkDiving;
    const cycleLeft=hawkCycleLeft;
    const cueWindow=hawkCueWindow;
    const takeoffHint=h.skyCycle && !h.airborne && cycleLeft<=cueWindow && !hawkDiving;
    const landingHint=hawkLandingHint;
    const cueProgress=(takeoffHint||landingHint) ? clamp(1-cycleLeft/cueWindow,0,1) : 0;

    if(flying){
      const flap=Math.sin(G.time*14)*0.34;
      if(landingHint){
        // Before landing, wings lower toward the body.
        // the normal full flight flap until the exact landing frame.
        const fold=0.18+cueProgress*0.56;
        wings[0].rotation.z= fold+flap*(1-cueProgress)*0.45;
        wings[1].rotation.z=-fold-flap*(1-cueProgress)*0.45;
      }else{
        wings[0].rotation.z= flap;
        wings[1].rotation.z=-flap;
      }
      wings[0].rotation.y=-0.04; wings[1].rotation.y=0.04;
    }else{
      // True folded-DOWN ground pose. During the pre-takeoff tell, lift/open smoothly.
      const down=takeoffHint ? 1.34-cueProgress*0.82 : 1.34;
      wings[0].rotation.z= down;
      wings[1].rotation.z=-down;
      wings[0].rotation.y=-0.24+cueProgress*0.16;
      wings[1].rotation.y= 0.24-cueProgress*0.16;
    }

    const sh=h.mesh.userData.shadow;
    if(sh){
      sh.material.opacity=flying?0.13:0.35;
      sh.scale.setScalar(flying?1.45:1);
      // TALON's mesh is scaled, so compensate parent scale when projecting onto world floor.
      const parentScaleY=Math.max(0.001,h.mesh.scale.y||1);
      sh.position.y=flying?(0.15-h.mesh.position.y)/parentScaleY:0.15;
    }

    const flightRing=h.mesh.userData.flightRing;
    const flightRing2=h.mesh.userData.flightRing2;
    const flightRing3=h.mesh.userData.flightRing3;
    const flightCore=h.mesh.userData.flightCore;
    if(flightRing && flightRing2 && flightRing3 && flightCore){
      const immune=h.airborne && !hawkDiving;
      const pulse=(Math.sin(G.time*7)+1)*0.5;
      const blink=(Math.sin(G.time*23)+1)*0.5;
      // Ground projection is visible for the whole immune flight and also stays on
      // during the pre-landing cue so players can keep tracking where TALON is.
      const showProjected=immune||takeoffHint||landingHint;
      flightRing.visible=showProjected;
      // Normal flight uses one quiet locator only. Extra rings/core appear only for
      // takeoff/landing cues, where the added visual noise carries real information.
      flightRing2.visible=showProjected&&(takeoffHint||landingHint);
      flightRing3.visible=showProjected&&landingHint;
      flightCore.visible=showProjected&&(takeoffHint||landingHint);
      if(showProjected){
        // These markers are children of TALON's scaled mesh. Convert the desired world-floor
        // height back into local coordinates or the 1.08x hero scale buries them below ground.
        const parentScaleY=Math.max(0.001,h.mesh.scale.y||1);
        const groundY=(0.22-h.mesh.position.y)/parentScaleY;
        flightRing.position.y=groundY;
        flightRing2.position.y=groundY+0.02/parentScaleY;
        flightRing3.position.y=groundY+0.03/parentScaleY;
        flightCore.position.y=groundY+0.04/parentScaleY;

        if(takeoffHint){
          flightRing.material.color.setHex(0x76e4ff);
          flightRing2.material.color.setHex(0xd8f8ff);
          flightRing3.material.color.setHex(0xf0fdff);
          flightCore.material.color.setHex(0xb7f2ff);
          flightRing.material.opacity=0.26+blink*0.52;
          flightRing2.material.opacity=0.12+blink*0.28;
          flightRing3.material.opacity=0.18+blink*0.34;
          flightCore.material.opacity=0.08+blink*0.12;
          flightRing.scale.setScalar(0.92+cueProgress*0.16);
          flightRing2.scale.setScalar(1.00+cueProgress*0.12);
          flightRing3.scale.setScalar(0.98+cueProgress*0.10);
          flightCore.scale.setScalar(0.95+cueProgress*0.10);
        }else if(landingHint){
          // Last-second landing warning: projected position turns hot orange/red and
          // contracts aggressively toward the exact touchdown point.
          flightRing.material.color.setHex(cueProgress>0.62?0xff3f32:0xff8a52);
          flightRing2.material.color.setHex(cueProgress>0.62?0xff8a52:0xffd0a0);
          flightRing3.material.color.setHex(0xfff0ca);
          flightCore.material.color.setHex(cueProgress>0.62?0xff3f32:0xffa96f);
          flightRing.material.opacity=0.48+blink*0.46;
          flightRing2.material.opacity=0.22+blink*0.34;
          flightRing3.material.opacity=0.30+blink*0.46;
          flightCore.material.opacity=0.16+blink*0.24;
          flightRing.scale.setScalar(1.10-cueProgress*0.22);
          flightRing2.scale.setScalar(1.16-cueProgress*0.24);
          flightRing3.scale.setScalar(1.06-cueProgress*0.26);
          flightCore.scale.setScalar(1.14-cueProgress*0.30);
        }else{
          // Normal airborne tracking is deliberately subdued: one thin stationary gold
          // floor ring, no concentric breathing stack and no spinning visual clutter.
          flightRing.material.color.setHex(0xd7b34a);
          flightRing.material.opacity=0.20+pulse*0.06;
          flightRing.scale.setScalar(0.94+pulse*0.025);
        }
        if(takeoffHint||landingHint){
          flightRing.rotation.z+=dt*0.55;
          flightRing2.rotation.z-=dt*0.38;
          flightRing3.rotation.z+=dt*0.72;
        }
      }
    }
  }

  // walk animation: feet (+ arms for bipedal apex mammals)
  const hf = h.mesh.userData.feet;
  if(hf){
    if(G.heroMoving){
      const ph = Math.sin(G.time*15);
      if(hf.length===4){
        hf[0].position.y = 2 + Math.max(0, ph)*2; hf[2].position.y = 2 + Math.max(0, ph)*2;
        hf[1].position.y = 2 + Math.max(0, -ph)*2; hf[3].position.y = 2 + Math.max(0, -ph)*2;
      } else {
        hf[0].position.y = 2.5 + Math.max(0, ph)*3;
        hf[1].position.y = 2.5 + Math.max(0, -ph)*3;
        const arms = h.mesh.userData.arms;
        if(arms){
          arms[0].rotation.x = ph*0.45;
          arms[1].rotation.x = -ph*0.45;
        }
      }
    } else {
      for(const f of hf) f.position.y = 2;
      const arms = h.mesh.userData.arms;
      if(arms) for(const a of arms) a.rotation.x = 0;
    }
  }
  // Footstep dust while moving. TALON deliberately has no continuous trail in either
  // ground or flight state: he is a flapping/gliding bird, not a jet. His takeoff, landing
  // and Kamikaze Dive already provide discrete movement VFX when an effect carries meaning.
  if(G.heroMoving && !h.skyCycle){
    h.dustT = (h.dustT||0) + dt;
    if(h.dustT >= 0.09){
      h.dustT = 0;
      burst(h.x - G.aimDir.x*5, 1.5, h.z - G.aimDir.z*5, 0x9a9684, 2, 26, 1.1, 0.4);
    }
  }

  // invincibility blink
  if(h.invince>0){
    h.invince -= dt;
    h.mesh.visible = (h.dashing||h.airborne) ? true : Math.floor(h.invince*12)%2===0;
    if(h.invince<=0) h.mesh.visible = true;
  }
  // TALON landing tell is visual only: during the final half-second of flight the hawk
  // itself blinks while the ground projection turns hot. Set visibility immediately
  // outside that warning so this never leaks into normal flight/ground states.
  if(h.skyCycle && hawkLandingHint && hawkCycleLeft<=0.55){
    h.mesh.visible=Math.floor(G.time*12)%2===0;
  }else if(h.skyCycle && h.invince<=0){
    h.mesh.visible=true;
  }
  // First frame of the run only: compile every phase-only shader while the arena is still
  // empty, so the first Super press is a uniform flip instead of a stall. See warmPhasePrograms.
  if(!h.phaseWarmDone) h.phaseWarmDone = warmPhasePrograms(h);
  if(h.phaseT>0) h.phaseT -= dt;
  if(h.blinkPhaseT>0) h.blinkPhaseT=Math.max(0,h.blinkPhaseT-dt);
  if((h.blinkRunT||0)>0){
    h.blinkRunT=Math.max(0,h.blinkRunT-dt);
    // The phase window is shorter than the run, so the translucent body (and the hero's real
    // materials) track `phased`, not the run: the tail is a plain speed dash with the hero
    // fully solid and visible again.
    const phased = (h.blinkPhaseT||0)>0 && h.blinkRunT>0;
    if(phased !== !!h.blinkVisActive){
      h.blinkVisActive = phased;
      applyPhaseVisual(h, phased);
    }
    updatePhaseVisual(h, dt);
  } else if(h.blinkVisActive){
    h.blinkVisActive=false;
    applyPhaseVisual(h,false);
    updatePhaseVisual(h, dt);
  }
  if((h.tigerFrenzyT||0)>0) h.tigerFrenzyT = Math.max(0, h.tigerFrenzyT-dt);
  if(G.char?.id==='raja' && h.mesh){
    const frenzy=(h.tigerFrenzyT||0)>0;
    const pulse=(Math.sin(G.time*12)+1)*0.5;
    const ring=h.mesh.userData.rajaFrenzyRing;
    const outerRing=h.mesh.userData.rajaFrenzyOuterRing;
    const aura=h.mesh.userData.rajaFrenzyAura;
    const spin=h.mesh.userData.rajaFrenzySpin;
    const stripeMat=h.mesh.userData.rajaStripeMat;
    if(frenzy){
      if(ring){
        ring.visible=true;
        ring.material.opacity=0.28+0.22*pulse;
        ring.scale.setScalar(1.06+0.14*pulse);
      }
      if(outerRing){
        outerRing.visible=true;
        outerRing.material.opacity=0.16+0.18*(1-pulse);
        outerRing.scale.setScalar(0.98+0.08*pulse);
      }
      if(aura){
        aura.visible=true;
        aura.material.opacity=0.10+0.08*pulse;
        aura.scale.setScalar(1.06+0.18*pulse);
      }
      if(spin){
        spin.visible=true;
        spin.rotation.y += dt*2.8;
        for(const child of spin.children){
          if(child.material) child.material.opacity=0.30+0.22*pulse;
        }
      }
      if(stripeMat){
        stripeMat.color.setHex(0x241012);
        stripeMat.emissive.setHex(0xff173d);
        stripeMat.emissiveIntensity=0.72+0.28*pulse;
      }
      h.tigerAuraFxT=(h.tigerAuraFxT||0)+dt;
      if(h.tigerAuraFxT>=0.18){
        h.tigerAuraFxT=0;
        h.tigerFuryMarkT=0;
        burst(h.x,8,h.z,0xff173d,2,24,0.18,0.12);
      }
      // Fury must be readable even in a crowded arena. Re-show a simple rage mark
      // above Raja while Frenzy is active.
      h.tigerFuryMarkT=(h.tigerFuryMarkT||0)+dt;
      if(h.tigerFuryMarkT>=0.72){
        h.tigerFuryMarkT=0;
        floater('💢',h.x,h.z,'lionPunch',38);
      }
    }else{
      h.tigerAuraFxT=0;
      if(ring){ ring.visible=false; ring.material.opacity=0; ring.scale.setScalar(1); }
      if(outerRing){ outerRing.visible=false; outerRing.material.opacity=0; outerRing.scale.setScalar(1); }
      if(aura){ aura.visible=false; aura.material.opacity=0; aura.scale.setScalar(1); }
      if(spin){
        spin.visible=false;
        for(const child of spin.children){
          if(child.material) child.material.opacity=0;
        }
      }
      if(stripeMat){
        stripeMat.color.setHex(stripeMat.userData.baseColor||0x201113);
        stripeMat.emissive.setHex(stripeMat.userData.baseEmissive||0x120607);
        stripeMat.emissiveIntensity=stripeMat.userData.baseEmissiveIntensity??0.22;
      }
    }
  }
  if((h.grizzGuardT||0)>0) h.grizzGuardT = Math.max(0, h.grizzGuardT-dt);
  if((h.foxFocusT||0)>0) h.foxFocusT = Math.max(0, h.foxFocusT-dt);

  // aiming
  aimFromPointer();

  updateDesktopSkillAim();

  // A short mobile drag is aim-then-one-shot. Only a drag held past the
  // small grace window enters the existing continuous/autofire path.
  if(G.mouse.touchMode && G.touch&&G.touch.aim){
    const ta=G.touch.aim;
    if(ta.dragged && !ta.autoFire && performance.now()-ta.startedAt>=TOUCH_AUTOFIRE_MS){
      ta.autoFire=true;
      G.touch.fire=true;
    }
  }

  // firing
  if((G.mouse.down || (G.touch && G.touch.fire)) && !G.aimingDisabled){
    // BB-NOZIA: holding fire ramps the shells from x1 to x2.5 over 750ms (size, direct and
    // explosion damage, blast radius and knockback all scale with it). The charge is held while
    // fire is held - firing does not spend it - so the auto-fire stream itself is the charged
    // state. Releasing fire snaps it back to x1, so tapping still fires plain shells.
    if(G.gun.id==='bouncecannon') h.bounceCharge = Math.min(2.5, (h.bounceCharge||1) + (dt/0.75)*1.5);
    tryFire(dt);
  } else {
    h.minigunSpin = Math.max(0, (h.minigunSpin||0)-dt*0.2);
    h.lastFire = Math.min(h.lastFire, G.time);
    h.bounceCharge = 1; // BB-NOZIA: letting go of fire drops the held charge
  }

  // reload
  if(h.reloading){
    h.reloadT += dt;
    if(h.reloadT >= h.reloadDur) finishReload();
    else updateHeroReloadFeedback(h);
  } else {
    updateHeroReloadFeedback(h);
  }
  if(!h.reloading && !G.mouse.down && !(G.touch&&G.touch.fire) && G.keys['KeyR']){
    // handled in keydown
  }

  // passive timers
  if(h.regen){ h.regenT = (h.regenT||0)+trainingTimerDt(dt); if(h.regenT>=30){ h.regenT=0; h.hp=Math.min(h.maxHp,h.hp+10); floater('+10',h.x,h.z,'heal'); } }
  if((h.charRegenRate||0)>0 && h.hp<h.maxHp){
    const before=h.hp;
    h.hp = Math.min(h.maxHp, h.hp + h.charRegenRate*dt);
    h.regenHealAcc=(h.regenHealAcc||0)+(h.hp-before);
    h.regenAcc=(h.regenAcc||0)+dt;
    if(h.regenAcc>=5){
      h.regenAcc=0;
      if(h.regenHealAcc>=0.5) floater('+'+Math.max(1,Math.round(h.regenHealAcc)),h.x,h.z,'heal');
      h.regenHealAcc=0;
    }
  }
  // AEGIS keeps breathing room automatically, matching the defensive feel of
  // MANE's King's Paw without adding another timer/listener outside the main update loop.
  updateAegisAutoPush(dt);
  updateBahamutHeroSkills(h,dt);

  if((h.tigerFrenzyT||0)>0){
    h.tigerVampTick=(h.tigerVampTick||0)+dt;
    if(h.tigerVampTick>=1){
      h.tigerVampTick-=1;
      if((h.tigerVampAcc||0)>=0.5){
        floater('+'+Math.max(1,Math.round(h.tigerVampAcc)),h.x,h.z,'heal');
        h.tigerVampAcc=0;
      }
    }
  } else if((h.tigerVampAcc||0)>=0.5){
    floater('+'+Math.max(1,Math.round(h.tigerVampAcc)),h.x,h.z,'heal');
    h.tigerVampAcc=0;
    h.tigerVampTick=0;
  }
  if(h.autoSlash){
    const frenzy=(h.tigerFrenzyT||0)>0;
    const slashEvery=frenzy?0.24:0.82;
    const slashRange=frenzy?145:85;
    if(!frenzy) h.tigerLastFrenzyTarget=null;
    h.slashT = (h.slashT||0) + trainingTimerDt(dt);
    if(h.slashT >= slashEvery){
      h.slashT = 0;
      let best=null, bd=1e9, repeat=null, repeatD=1e9;
      for(const e of G.enemies){
        if(e.dead) continue;
        const d2 = dist2(e.x,e.z,h.x,h.z);
        if(d2 >= slashRange*slashRange) continue;
        if(frenzy && e===h.tigerLastFrenzyTarget){
          if(d2<repeatD){ repeatD=d2; repeat=e; }
          continue;
        }
        if(d2 < bd){ bd=d2; best=e; }
      }
      // Frenzy claws rotate targets when possible. A lone enemy/boss still takes every claw.
      if(!best) best=repeat;
      if(best){
        if(frenzy) h.tigerLastFrenzyTarget=best;
        const dx=best.x-h.x, dz=best.z-h.z, len=Math.max(1,Math.hypot(dx,dz));
        // Hero crit, weapon crit and crit perks therefore keep scaling his actual identity
        // through hero, weapon and perk crit modifiers.
        const crit=Math.random()<h.mods.crit;
        const baseSlashDmg=(frenzy?60:42)*h.mods.dmg;
        const slashDmg=baseSlashDmg*(crit?2:1);
        damageEnemy(best, slashDmg, {dirx:dx/len, dirz:dz/len, kb:frenzy?110:65, show:true,crit});
        if(crit && h.explosiveCrits){
          explodeDamage(best.x,best.z,36,baseSlashDmg,0xffd166);
          floater('EXPLOSIVE CRIT',best.x,best.z,'crit');
        }
        if(frenzy && h.hp<h.maxHp){
          const before=h.hp;
          h.hp=Math.min(h.maxHp,h.hp+1.5);
          h.tigerVampAcc=(h.tigerVampAcc||0)+(h.hp-before);
          h._hudHpTrailRatio=Math.max(h._hudHpTrailRatio??0,h.hp/h.maxHp);
        }
        spawnClawMark(best.x, best.z, Math.atan2(dx,dz), frenzy?0xff173d:0xd82432, frenzy?1.70:1.08);
        burst(best.x, 9, best.z, 0xff3948, frenzy?12:5, frenzy?118:58, frenzy?0.40:0.32, 0.25);
      }
    }
  }
  if(h.autoPunch){
    // KING'S PAW: MANE's normal-play control passive reaches farther and triggers
    // often enough to create reliable breathing room, while remaining far below RAJA's DPS.
    h.punchT = (h.punchT||0) + trainingTimerDt(dt);
    if(h.punchT >= 0.85){
      h.punchT = 0;
      let best=null, bd=1e9, fallback=null, fallbackD=1e9;
      const punchRange=72;
      const coordinatingAegis=G.gun?.special?.includes('shieldbash');
      for(const e of G.enemies){
        if(e.dead) continue;
        const d2=dist2(e.x,e.z,h.x,h.z);
        if(d2 >= punchRange*punchRange) continue;
        if(d2<fallbackD){ fallbackD=d2; fallback=e; }
        // Prefer a fresh target so AEGIS + King's Paw spread their control across the crowd.
        if(coordinatingAegis && G.time-(e._aegisBumpAt??-99)<0.65) continue;
        if(d2 < bd){ bd=d2; best=e; }
      }
      best=best||fallback;
      if(best){
        const dx=best.x-h.x, dz=best.z-h.z, len=Math.max(1,Math.hypot(dx,dz));
        best._manePawAt=G.time;
        damageEnemy(best, 14*h.mods.dmg, {dirx:dx/len, dirz:dz/len, kb:190*h.mods.kb, show:true});
        // Cause and effect are visually separate: angry MANE cue above the lion,
        // then the gold paw-print lands exactly on the knocked-back enemy.
        floater('💢',h.x,h.z,'lionPunch',34);
        spawnKingsPawMark(best.x,best.z,Math.atan2(dx,dz));
        spawnRadiusRing(best.x, best.z, 17, 0xffc75a, 0.24);
        burst(best.x, 9, best.z, 0xffd166, 11, 92, 0.34, 0.24);
      }
    }
  }
  if(h.shieldRegen) h.shield = Math.min(h.maxShield, h.shield + 0.25*dt);
  if(h.rootedking && !G.heroMoving){ h.hp = Math.min(h.maxHp, h.hp + 0.5*dt); }
  // backbone: orig fires 3 bone bullets behind the aim (25° arc, speed 250, full bullet
  // damage — gun totalbasedamage, no stationary/crit/kb) every 2.5s, independent of firing
  if(h.backbone){
    h.backboneT = (h.backboneT||0) + trainingTimerDt(dt);
    if(h.backboneT >= 2.5){
      h.backboneT -= 2.5;
      const aimA = Math.atan2(G.aimDir.x, G.aimDir.z);
      const base = aimA + Math.PI;
      const dmg = computeBulletDamage(true);
      for(let i=0;i<3;i++){
        const a = base + (i/2 - 0.5)*25*Math.PI/180;
        fireBullet(h.x, h.z, Math.sin(a), Math.cos(a), dmg, {bone:true, boneProcChance:PERK_BONE_DOG_PROC_CHANCE, color:0xe8e0d0, r:1.8, speed:250, life:6, kb:0, noCrit:true});
      }
    }
  }

  // light
  h.lightRadius = 74 + h.mods.light + (h.stationLight && !G.heroMoving ? 25 : 0);
  const lr = h.lightRadius;
  G.heroLight.position.set(h.x, 26, h.z);
  // Scout/raptor vision extends visible illumination without secretly enlarging
  // Burning Light / Slowing Light combat radii. TALON sees even farther while airborne.
  G.heroLight.distance = lr + 40 + (h.visionBonus||0) + (h.airborne ? (h.airVisionBonus||0) : 0);
  G.charLight.position.set(h.x, 22, h.z);
  G.heroLight.color.set(G.char.lightColor);
  G.charLight.color.set(G.heroSkin?.palette?.light??G.char.color);
  if(G.coreLight) G.coreLight.position.set(h.x,20,h.z);

  // light damage effects
  for(const e of G.enemies){
    if(e.dead) continue;
    if(dist2(e.x,e.z,h.x,h.z) < lr*lr){
      if(G.hero.burningLight && Math.random()<dt*0.5){
        applyBurn(e,burnDps());
      }
    }
  }

  h.magnetRadius = Math.min(RUN_STAT_CAPS.magnetRadius, HERO_BASE_MAGNET_RADIUS + h.mods.magnet);
  updateTestPads(dt);

  // regen super? no
}

function aimFromPointer(){
  if(G.touch && G.touch.aim){
    const d = Math.max(0.001, Math.hypot(G.touch.aim.dx, G.touch.aim.dz));
    G.aimDir.x = G.touch.aim.dx/d; G.aimDir.z = G.touch.aim.dz/d;
    return;
  }
  if(G.mouse.touchMode) return; // last input was touch: preserve tap/joystick aim direction
  const r = G.raycaster;
  r.setFromCamera(new THREE.Vector2(G.mouse.x, G.mouse.y), G.camera);
  const plane = new THREE.Plane(new THREE.Vector3(0,1,0), 0);
  r.ray.intersectPlane(plane, G.aimWorld);
  if(G.aimWorld){
    const dx = G.aimWorld.x - G.hero.x, dz = G.aimWorld.z - G.hero.z;
    const len = Math.max(0.001, Math.hypot(dx,dz));
    G.aimDir.x = dx/len; G.aimDir.z = dz/len;
  }
}

// ---------------- Effects / misc helpers ----------------

// ---------------- TRAINING sandbox ----------------
// EXP pad doubles as a deliberate rapid-test switch. Ten-times cadence is fast enough to
// expose reloads, skills and timed passives without the frame/particle chaos of a 100x lab.
const TRAINING_RAPID_RATE=10;
function trainingRapidRate(){
  return G.testMode&&G.hero?.trainingRapid ? TRAINING_RAPID_RATE : 1;
}
function trainingTimerDt(dt){
  return dt*trainingRapidRate();
}
function trainingInterval(v){
  return v/trainingRapidRate();
}
function enableTrainingRapid(){
  const h=G.hero;
  if(!G.testMode||!h) return false;
  const newlyEnabled=!h.trainingRapid;
  h.trainingRapid=true;
  // The Training spam pad is a sandbox switch: Super stock becomes infinite while Rapid is on.
  // Recharge still exists (at ×10 cadence), so timing/animation code is exercised normally.
  h.super.unlimited=true;
  h.super.uses=h.super.maxUses;

  // Existing remaining cooldowns should shrink immediately instead of waiting for the next cast.
  if(h.reloading){
    const remain=Math.max(0,h.reloadDur-h.reloadT);
    h.reloadDur=h.reloadT+Math.max(0.04,remain/TRAINING_RAPID_RATE);
  }
  // Super is immediately ready, then keeps recharging at the Rapid test cadence.
  h.super.chargeT=h.super.chargeMax;
  h.bahamutGlobalCd=Math.max(0,(h.bahamutGlobalCd||0)/TRAINING_RAPID_RATE);
  for(const kind of Object.keys(h.bahamutSkillCd||{})){
    h.bahamutSkillCd[kind]=Math.max(0,(h.bahamutSkillCd[kind]||0)/TRAINING_RAPID_RATE);
  }
  if(h.sprint) h.stamina=Math.max(h.stamina,h.maxStamina-(h.maxStamina-h.stamina)/TRAINING_RAPID_RATE);
  h.lastFire=Math.min(h.lastFire,G.time-trainingInterval(G.gun.fire*h.mods.fire));

  // Summon attack timers are cooldowns too; preserve lifetimes/active-buff durations.
  for(const sm of G.summons){
    if(sm.kind==='dog') sm.biteT=Math.max(0,(sm.biteT||0)/TRAINING_RAPID_RATE);
    else if(sm.kind==='turret') sm.fireT=Math.max(0,(sm.fireT||0)/TRAINING_RAPID_RATE);
    else if(sm.kind==='penguin') sm.slamT=Math.max(0,(sm.slamT||0)/TRAINING_RAPID_RATE);
  }
  updateHUD(true);
  return newlyEnabled;
}
function makeTestTextSprite(text,color='#ffffff'){
  const c=document.createElement('canvas'); c.width=512; c.height=128;
  const ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
  ctx.font='900 42px system-ui, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.lineWidth=10; ctx.strokeStyle='rgba(3,7,12,.94)'; ctx.strokeText(text,256,64);
  ctx.fillStyle=color; ctx.fillText(text,256,64);
  const tex=new THREE.CanvasTexture(c); tex.colorSpace=THREE.SRGBColorSpace;
  const mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,depthTest:false});
  const sp=new THREE.Sprite(mat); sp.scale.set(78,19,1); return sp;
}
function makeTestPad(id,label,x,z,color){
  const g=new THREE.Group();
  const disc=new THREE.Mesh(new THREE.CircleGeometry(18,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.28,depthWrite:false,side:THREE.DoubleSide}));
  disc.rotation.x=-Math.PI/2; disc.position.y=0.20; g.add(disc);
  const ring=new THREE.Mesh(new THREE.RingGeometry(15.5,18,36),new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.86,depthWrite:false,side:THREE.DoubleSide}));
  ring.rotation.x=-Math.PI/2; ring.position.y=0.24; g.add(ring);
  const labelSp=makeTestTextSprite(label,'#ffffff'); labelSp.position.set(0,12,0); g.add(labelSp);
  g.position.set(x,0,z); sceneAdd(g);
  const pad={id,label,x,z,r:20,mesh:g,inside:false,cooldown:0};
  G.testPads.push(pad); return pad;
}
function spawnTestDummy(x,z,label='DUMMY'){
  const g=new THREE.Group();
  const bodyMat=stdMat(0x65717e,{emissive:0x26313d,emissiveIntensity:0.28});
  const pale=stdMat(0xaeb8c2,{emissive:0x3a4652,emissiveIntensity:0.22});
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(5.8,13,6,10),bodyMat); body.position.y=12; g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(5.0,12,9),pale); head.position.y=24; g.add(head);
  for(const sx of [-1,1]){
    const arm=new THREE.Mesh(new THREE.CapsuleGeometry(2.0,9,5,8),bodyMat); arm.position.set(8*sx,13,0); arm.rotation.z=0.12*sx; g.add(arm);
    const leg=new THREE.Mesh(new THREE.CapsuleGeometry(2.7,9,5,8),bodyMat); leg.position.set(3.4*sx,3.5,0); g.add(leg);
  }
  const ring=new THREE.Mesh(new THREE.RingGeometry(10,12,28),new THREE.MeshBasicMaterial({color:0x55e3ff,transparent:true,opacity:0.72,depthWrite:false,side:THREE.DoubleSide}));
  ring.rotation.x=-Math.PI/2; ring.position.y=0.18; g.add(ring);
  const sp=makeTestTextSprite(label,'#9eefff'); sp.position.set(0,33,0); sp.scale.set(54,13,1); g.add(sp);
  g.position.set(x,0,z); sceneAdd(g);
  const e={type:'testdummy',kind:'stationary',testDummy:true,noReward:false,brain:false,boss:false,elite:false,mesh:g,hp:1800,maxHp:1800,r:13,speed:0,kb:999,x,z,kbx:0,kbz:0,slowT:0,slowPct:0.6,poison:null,burn:null,fireT:0,biteT:0,hitCd:999,dead:false,hopPhase:Math.random()*10};
  G.enemies.push(e); return e;
}
function reviveTestDummy(e){
  if(!G.testMode || !e || !G.enemies.includes(e)) return;
  e.dead=false; e.hp=e.maxHp; e.poison=null; e.burn=null; e.kbx=0; e.kbz=0; e.mesh.visible=true;
  burst(e.x,8,e.z,0x55e3ff,10,70,0.35,0.22); floater('DUMMY REVIVED',e.x,e.z,'heal');
}
function testHeroRevive(){
  const h=G.hero; if(!G.testMode || !h) return;
  h.dead=false; h.hp=h.maxHp; h.shield=Math.max(0,h.shield); h.invince=Math.max(h.invince||0,3); h.mesh.visible=true;
  h.x=clamp(h.x,-VIEW.visW+28,VIEW.visW-28); h.z=clamp(h.z,-VIEW.visH+28,VIEW.visH-28);
  h.mesh.position.x=h.x; h.mesh.position.z=h.z;
  burst(h.x,10,h.z,0x9ceb5a,20,125,0.55,0.3); banner('🧪 TEST REVIVE · FULL HP'); updateHUD(true);
}
function clearTestHostiles(){
  if(!G.testMode) return;
  for(const e of [...G.enemies]){
    if(e.dead || e.testDummy) continue;
    if(e.wraithDrops?.length){ for(const d of e.wraithDrops) clearWraithTell(d); e.wraithDrops=[]; }
    if(e.type==='briarwarden') clearBriarWalls(e,true);
    removeEnemyNoReward(e);
  }
  G.enemies=G.enemies.filter(e=>!e.dead || e.testDummy);
  for(const b of G.ebullets){ if(!b.dead){ b.dead=true; sceneRemove(b.mesh); } }
  G.ebullets=[];
  $('#bossbarWrap').hidden=true;
}
function spawnTestDanger(){
  if(!G.testMode||!G.hero) return;
  clearTestHostiles();
  const h=G.hero, choice=Math.floor(Math.random()*6), spread=(n,r0=95,r1=175)=>{
    const types=['goblingreen','goblinred','goblinblue','troll','shooter','pigsassin','box3'];
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2,r=r0+Math.random()*(r1-r0),type=types[Math.floor(Math.random()*types.length)];
      spawnEnemy(type,clamp(h.x+Math.cos(a)*r,-VIEW.visW+20,VIEW.visW-20),clamp(h.z+Math.sin(a)*r,-VIEW.visH+20,VIEW.visH-20));
    }
  };
  if(choice===0){ spread(28,75,190); banner('🧪 DANGER · LIVE SWARM'); }
  else if(choice===1){
    spread(14,80,170); for(const t of ['absorber','laserdude','briarwarden']){ const a=Math.random()*Math.PI*2; spawnEnemy(t,Math.cos(a)*145,Math.sin(a)*105); }
    banner('🧪 DANGER · ELITE SWARM');
  }else if(choice===2){
    spawnEnemy('boss1',-115,-65,{hp:10000,name:'CRUSHER'}); spawnEnemy('boss2',115,-65,{hp:7000,name:'HEXLORD'}); spawnEnemy('boss3',0,-105,{hp:3500,name:'WRAITH'});
    banner('🧪 DANGER · TRADITIONAL BOSSES');
  }else if(choice===3){
    spawnEnemy('bahamut',0,-Math.max(55,VIEW.visH*0.55),{hp:26000,name:'TEST BAHAMUT'}); spread(10,95,170); banner('🧪 DANGER · BAHAMUT');
  }else if(choice===4){
    const ids=['raja','mane','grizz','fang','foxy','val','talon'];
    ids.forEach((id,i)=>{ const a=-Math.PI/2+i/ids.length*Math.PI*2; const e=spawnApexFinalHero(id,Math.cos(a)*138,Math.sin(a)*92); e.apexFinalMember=false; });
    banner('🧪 DANGER · APEX SEVEN · 7/7');
  }else{
    spread(18,70,180); spawnEnemy('bahamut',0,-Math.max(55,VIEW.visH*0.55),{hp:18000,name:'TEST BAHAMUT'});
    const ids=['raja','mane','grizz','fang','foxy','val','talon'];
    for(const [i,id] of ids.entries()){ const a=-Math.PI/2+i/ids.length*Math.PI*2; const e=spawnApexFinalHero(id,Math.cos(a)*150,Math.sin(a)*98); e.apexFinalMember=false; }
    banner('🧪 DANGER · CHAOS LAB · BAHAMUT + APEX 7');
  }
}
function testExpStorm(){
  if(!G.testMode||!G.hero) return;
  const rapidNew=enableTrainingRapid();

  // EXP is a deliberate edge resource in Training, not floor clutter through the test lane.
  // Refresh the old XP field instead of stacking another 300 orbs on top of it.
  for(const o of G.orbs){
    if(o.dead || !isXpOrb(o)) continue;
    o.dead=true;
    sceneRemove(o.mesh); sceneRemove(o.glow);
  }
  G.orbs=G.orbs.filter(o=>!o.dead);

  const count=300, margin=10, edgeBand=20;
  const minX=-VIEW.visW+margin, maxX=VIEW.visW-margin;
  const minZ=-VIEW.visH+VIEW.walkShift+margin, maxZ=VIEW.visH+VIEW.walkShift-margin;
  const pads=G.testPads||[];
  const dummies=G.enemies.filter(e=>!e.dead&&e.testDummy);
  const clearOfTraining=(x,z)=>{
    if(dist2(x,z,G.hero.x,G.hero.z)<78*78) return false;
    for(const p of pads) if(dist2(x,z,p.x,p.z)<58*58) return false;
    for(const d of dummies) if(dist2(x,z,d.x,d.z)<68*68) return false;
    return true;
  };

  let made=0, attempts=0;
  while(made<count && attempts<count*18){
    const side=attempts%4;
    let x,z;
    if(side===0){ x=minX+Math.random()*edgeBand; z=minZ+Math.random()*(maxZ-minZ); }
    else if(side===1){ x=maxX-Math.random()*edgeBand; z=minZ+Math.random()*(maxZ-minZ); }
    else if(side===2){ x=minX+Math.random()*(maxX-minX); z=minZ+Math.random()*edgeBand; }
    else { x=minX+Math.random()*(maxX-minX); z=maxZ-Math.random()*edgeBand; }
    attempts++;
    if(!clearOfTraining(x,z)) continue;
    spawnOrb(x,z,{life:120,pickupDelay:1.0});
    made++;
  }
  banner('🧪 EXP EDGE FIELD · '+made+' ORBS · RAPID ×'+TRAINING_RAPID_RATE+' · ∞ ULT');
  if(rapidNew) floater('RAPID ×'+TRAINING_RAPID_RATE+' · ∞ ULT',G.hero.x,G.hero.z,'crit');
}

function markTrainingSetupPending(label='TRAINING SETUP'){
  if(G.testMode&&G.hero){
    G.trainingSetupDirty=true;
    banner('🧪 '+label+' · PENDING · RESUME TO APPLY');
  }
}

function testEquipGun(id){
  const next=GUNS.find(g=>g.id===id); if(!next) return false;
  G.testSel.gun=next.id;
  persistTrainingSelection();
  markTrainingSetupPending('GUN · '+next.name);
  return true;
}
function testEquipHero(id){
  const next=CHARACTERS.find(c=>c.id===id); if(!next) return false;
  G.testSel.char=next.id;
  persistTrainingSelection();
  markTrainingSetupPending('HERO · '+next.name);
  return true;
}
function primeTestReadiness(){
  const h=G.hero;
  if(!G.testMode||!h) return;
  h.dead=false;
  h.hp=h.maxHp;
  h.ammo=h.maxAmmo;
  h.reloading=false; h.reloadT=0; h.reloadDur=0;
  h.stamina=h.maxStamina;
  h.super.uses=h.super.maxUses;
  h.super.chargeT=h.super.chargeMax;
  h.bahamutGlobalCd=0;
  for(const kind of Object.keys(h.bahamutSkillCd||{})) h.bahamutSkillCd[kind]=0;
  h.mesh.visible=true;
  updateHUD(true);
}
function resetTestArena(){
  if(!G.testMode) return;
  if(G.trainingSetupDirty){
    banner('🧪 SETUP CHANGES PENDING · RESUME TO APPLY FIRST');
    return;
  }
  G._launchTest=true;
  G._rankIntent=false;
  beginRun();
  // beginRun rebuilds the currently applied fake arena when no staged loadout changes exist.
  banner('🧪 TRAINING RESET · AMMO + ULT READY');
}
function initTestArena(){
  G.testPads=[];
  // Keep controls and targets in two obvious rows. EXP itself lives on the outer map edge,
  // so the central lane remains clean for movement, aiming and dummy tests.
  const padZ=-Math.min(104,VIEW.visH*0.66)+VIEW.walkShift;
  const padX=Math.min(124,VIEW.visW*0.52);
  const dummyZ=Math.min(92,VIEW.visH*0.56)+VIEW.walkShift;
  const dummyX=Math.min(64,VIEW.visW*0.28);
  makeTestPad('danger','1 · DANGER',-padX,padZ,0xff4f5e);
  makeTestPad('reset','2 · RESET',0,padZ,0xffd166);
  makeTestPad('xp','3 · EXP + RAPID',padX,padZ,0x9ceb5a);
  spawnTestDummy(-dummyX,dummyZ,'DUMMY A'); spawnTestDummy(0,dummyZ+10,'DUMMY B'); spawnTestDummy(dummyX,dummyZ,'DUMMY C');
  primeTestReadiness();
  startNotice('🧪 TRAINING · SCORE / GOLD ARE FAKE',{tone:'training',life:9000});
}
function updateTestPads(dt){
  if(!G.testMode||!G.hero||G.hero.dead) return;
  for(const p of G.testPads){
    p.cooldown=Math.max(0,(p.cooldown||0)-dt);
    const inside=dist2(G.hero.x,G.hero.z,p.x,p.z)<p.r*p.r;
    if(inside&&!p.inside&&p.cooldown<=0){
      p.cooldown=1.1;
      if(p.id==='danger') spawnTestDanger();
      else if(p.id==='reset') resetTestArena();
      else if(p.id==='xp') testExpStorm();
    }
    p.inside=inside;
    const ring=p.mesh?.children?.[1]; if(ring?.material) ring.material.opacity=0.58+0.30*Math.abs(Math.sin(G.time*4+p.x));
  }
}
function startTestModeWithOrientation(){
  G.testSel=sanitizeTrainingSelection(G.testSel);
  persistTrainingSelection();
  G._launchTest=true;
  G._rankIntent=false;
  AUD.init(); AUD.resume();
  if(isPortraitTouch()){
    pendingLandscapeStart=true; checkOrientation(); return;
  }
  if(isCoarse()) goFullscreen();
  beginRun();
}

function addPenguin(){
  const m = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(5, 10, 9), stdMat(0x1c1e24));
  body.scale.set(1,1.35,0.9); body.position.y=6;
  const belly = new THREE.Mesh(new THREE.SphereGeometry(3.4, 8, 7), stdMat(0xf2f2f2));
  belly.scale.set(1,1.3,0.85); belly.position.set(0,5.4,2.4);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(1.1,2.2,5), stdMat(0xffa94d)); beak.rotation.x=Math.PI/2; beak.position.set(0,5.6,5.2);
  for(const s of [-1,1]){ const e=new THREE.Mesh(new THREE.SphereGeometry(0.9,6,6), new THREE.MeshBasicMaterial({color:0xffffff})); e.position.set(2.1*s,8,3.8); m.add(e); const p=new THREE.Mesh(new THREE.SphereGeometry(0.35,5,5), new THREE.MeshBasicMaterial({color:0x1c1e24})); p.position.set(2.1*s,8,4.3); m.add(p); }
  m.add(body); m.add(belly); m.add(beak);
  m.position.set(G.hero.x, 0, G.hero.z);
  sceneAdd(m);
  const p = { kind:'penguin', mesh:m, x:0, z:0, slamT:5, alive:true };
  G.summons.push(p);
  return p;
}

// ---------------- Start run ----------------
function beginRun(){
  goFullscreen();
  const launchTest=!!G._launchTest;
  const rankIntent=!!G._rankIntent;
  G._launchTest=false;
  G._rankIntent=false;
  G.testMode=launchTest;
  // Only a real menu / customize / replay launch is rankable, and only until something
  // programmatic touches the run (see runIsRankable): a run started by a direct beginRun()
  // call - the __BBAPI test harness, or anything else that bypasses the play buttons - is a
  // sandbox run from the first frame. G.harnessTouched is deliberately NOT cleared here: only
  // a trusted click on a play button clears it (see startRunWithOrientation), so a scripted
  // click on PLAY cannot launder a run back into the ranking.
  G.rankedRun=rankIntent&&!launchTest;
  const sel = launchTest
    ? {
        char:G.testSel.char,
        gun:G.testSel.gun,
        gem:G.testSel.gem,
        diff:G.testSel.diff,
        music:DEFAULT_SELECTION.music,
        gunPicked:true,
      }
    : G.sel;
  if(!launchTest&&!ownsHero(sel.char)) sel.char='pulse';
  if(!launchTest&&!ownsGun(sel.gun)) sel.gun='rustyp';
  if(!launchTest&&!ownsGem(sel.gem)) sel.gem='green';
  // Selecting FOXY auto-equips WILD-FOX unless the player explicitly selected another gun.
  // player deliberately picked a different gun.
  if(sel.char==='foxy' && !sel.gunPicked){
    grantVulpine();
    sel.gun = 'vulpine';
  }
  G.char = CHARACTERS.find(c=>c.id===sel.char);
  G.gun = GUNS.find(g=>g.id===sel.gun);
  G.gem = GEMS.find(g=>g.id===sel.gem);
  G.diff = sel.diff;
  G.sb = (G.diff==='Insane') ? insanePressure().sb : DIFFS[G.diff].sb;
  G.finalBossMode = launchTest ? null : (finalApexSevenEligible() ? 'apexSeven' : (finalBahamutEligible() ? 'bahamut' : null));
  G.finalBossEligible = !!G.finalBossMode;
  G.heroR = G.char.hitR || HERO_R;

  clearArena();
  G.enemies=[]; G.bullets=[]; G.ebullets=[]; G.orbs=[]; G.summons=[]; G.effects=[]; G.clouds=[]; G.perks=[]; G.perkStacks={};
  G.time=0; G.score=0; G.gold=0; G.kills=0; G.exp=0; G.level=0; G._hudNextMs=0; G._particleAccum=0; _vigNextMs=0;
  G.scoreSettled=false; G.scoreBreakdown=null; G.runCredits=0; G.runBanked=false;
  G.mult=1; G.unlockedKings=[]; G.masteryBonus={ Critical: G.gem.id==='crit'?1:0 };
  G.shake=0; G.simPaused=false; G.aimingDisabled=false; G.lastTickSec = WIN_TIME+1; G._berserkStage=0; G.touchSprint=false; G.desktopSprintToggle=false; G.mobileSkillAiming=false; G.mobileSkillPreview=null;
  clearStartNotices();
  G.finalBossWarned=false; G.finalBossSpawned=false; G.finalBossActive=false; G.finalBossDefeated=false;
  G.apexSevenActive=false; G.apexSevenDefeated=false; G.apexSevenPhase=0;
  G.finalTimeoutWarned=false; G.finalTimeoutUrgentWarned=false;
  G.debugInvalidated = launchTest;
  if(G.heroMesh) sceneRemove(G.heroMesh);
  const skin=G.char.apex?selectedHeroSkin(G.char.id):null;
  G.heroSkin=skin;
  const skinId=skin?.id||null;
  const hm = G.char.dragon ? buildPlayableBahamutMesh(skinId) : (G.char.bird ? buildBirdMesh(skinId) : (G.char.beast ? buildBeastMesh(G.char.id,skinId) : buildHeroMesh(G.char.id)));
  hm.position.set(0, 0, 0);
  if(G.char.scale && !G.char.dragon) hm.scale.setScalar(G.char.scale);
  G.heroMesh = hm;

  const h = G.hero = {
    mesh: hm, x:0, z:0, hp:HERO_BASE.hp, maxHp:HERO_BASE.hp,
    speed:1, mods:{ dmg:1, fire:1, reload:1, speed:1, crit:G.gun.crit/100, armor:0, dodge:0, kb:1,
      proj:0, projStacks:0, range:0, magnet:0, light:0, poison:1, fire:1, summon:1, stationary:0, stationaryMult:0, maxAmmo:0, invince:1, bulletSpeed:1, spread:0 },
    // NOTE (balance parity): orig hero Health behavior defaults MaxShieldPoints to 20
    // (shield starts at 0, only regens with shieldregen) — dodgeking refills to this cap.
    flatDmg:0, spikeDmg:15, maxShield:20, shield:0, shieldRegen:false, ammo:0, maxAmmo:0,
    reloading:false, reloadT:0, reloadDur:0, lastFire:-9, minigunSpin:0, invince:0, phaseT:0, blinkRunT:0, blinkRunFxT:0, blinkPhaseT:0, blinkVisActive:false, invinceFlat:0,
    dogMult:1, dogSpeed:0, turretDmg:1, turretSpeed:1, turretRateBuff:0, spinners:0, magnetRadius:HERO_BASE_MAGNET_RADIUS, lightRadius:74,
    stablefocus:false, expMult:1, super:{ uses:G.char.superUses, maxUses:G.char.superUses, chargeT:0, chargeMax:G.char.superCharge }, regen:false,
    slowBullets:false, slowingLight:false, burningLight:false, explosiveCrits:false,
    explodeDeath:false, explodeBones:false, deathExplosionBurst:0, deathExplosionLastAt:-Infinity, deathExplosionRestUntil:0, xpbuff:false, rager:false, armorKing:false,
    enragedammo:false, poisonScalesAmmo:false, reloadbomb:false, reloadreckoner:false,
    knockbackKing:false, ranger:false, rootedfire:false, rootedking:false, lordAmmo:false, stationLight:false,
    spikeFire:false, bruiser:false, dodgeKing:false, backbone:false, mindpopper:false,
    stinkbug:false, bulletspikes:false, slowspikes:false, penguin:false, penburst:false,
    stamina:100, maxStamina:100, staminaRegen:6.93, staminaDrain:50, staminaRegenMult:1,
    sprint:false, sprintActive:false, dash:false, dashFire:false, dashing:null, kbx:0, kbz:0, fireNova:false,
    backboneT:0, bounceCharge:1,
    tigerFrenzyT:0, tigerVampAcc:0, tigerVampTick:0, grizzGuardT:0, grizzResolve:false, foxFocusT:0, charRegenRate:0, visionBonus:0, airVisionBonus:0, skyCycle:false, airborne:false, flightT:0, groundDur:0, flightDur:0, groundSpeed:1, flightSpeed:1,
    valBaker:false, valIngredients:0, valDropT:0, valDropEvery:7, rootyBrambleT:0, porterAiDecoy:null,
    bahamutSkills:false, bahamutSkillCd:{fan:0,lance:0,radial:0,sweep:0}, bahamutGlobalCd:0,
    trainingRapid:false,
    dead:false, fireT:0, poisonMult:1,
  };

  // Character run-start passives and identity modifiers.
  // Keep these identity modifiers explicit so balance changes stay readable.
  const cid = G.char.id;
  if(cid==='porter'){ h.mods.speed *= 1.18; }
  if(cid==='payne'){ h.rager = true; }
  if(cid==='mo'){ h.mods.speed *= 0.95; }
  if(cid==='blink') h.mods.speed *= 1.17;

  // RudBo apex beasts — stat lines, applied at run start.
  const st = G.char.stats;
  if(st){
    if(st.hp){ h.maxHp += st.hp; }
    if(st.dmg) h.mods.dmg *= st.dmg;
    if(st.crit) h.mods.crit += st.crit;
    if(st.dodge) h.mods.dodge = Math.min(RUN_STAT_CAPS.dodge,h.mods.dodge+st.dodge);
    if(st.speed) h.mods.speed *= st.speed;
    if(st.armor) h.mods.armor += st.armor;
    if(st.kb) h.mods.kb *= st.kb;
    if(st.fire) h.mods.fire *= st.fire;
    if(st.reload) h.mods.reload *= st.reload;
    if(st.bulletSpeed) h.mods.bulletSpeed *= st.bulletSpeed;
    if(st.range) h.mods.range += st.range;
    if(st.magnet) h.mods.magnet += st.magnet;
    if(st.vision) h.visionBonus += st.vision;
    if(st.airVision) h.airVisionBonus += st.airVision;
    if(st.summon) h.mods.summon *= st.summon;
    if(st.poison) h.mods.poison *= st.poison;
    if(st.wolfDmg) h.wolfFlat = st.wolfDmg;
    if(st.regenRate) h.charRegenRate = st.regenRate;
    else if(st.regen) h.charRegenRate = 0.9;
    if(st.grizzResolve) h.grizzResolve = true;
    if(st.autoSlash) h.autoSlash = true;
    if(st.autoPunch) h.autoPunch = true;
    if(st.bahamutSkills) h.bahamutSkills = true;
    if(st.skyCycle){
      h.skyCycle = true;
      h.groundSpeed = st.groundSpeed || 0.72;
      h.flightSpeed = st.flightSpeed || 1.18;
      h.groundDur = st.groundDur || 4.5;
      h.flightDur = st.flightDur || 3.0;
      h.flightT = 0;
      h.airborne = false;
    }
    if(st.valBaker){
      h.valBaker = true;
      h.valDropEvery = st.valIngredientDropEvery || 7;
    }
    if(st.dogs){ for(let i=0;i<st.dogs;i++) addDog(false); }
    if(st.turrets){ for(let i=0;i<st.turrets;i++) addTurret(); }
    h.hp = h.maxHp;
  }

  // OP hero + OP weapon should feel fully OP. Do not secretly nerf the player.
  // That premium-on-premium loadout activates additional enemy pressure.
  G.opStackChallenge=!!(G.char?.op && G.gun?.op);
  G.dragonChaos=cid==='bahamut';

  const DIFF_SUPER = { Easy:{uses:6, chg:0.7}, Normal:{uses:3, chg:0.85}, Hard:{uses:0, chg:1}, Insane:{uses:-2, chg:1.15} };
  const ds = DIFF_SUPER[G.diff] || DIFF_SUPER.Normal;
  const unlimitedSuper = !!G.char.unlimitedSuper;
  const su = unlimitedSuper ? 1 : Math.max(1, G.char.superUses + ds.uses);
  h.super = {
    uses:su,
    maxUses:su,
    chargeT:0,
    chargeMax: unlimitedSuper ? G.char.superCharge : Math.max(1, Math.ceil(G.char.superCharge*ds.chg)),
    unlimited:unlimitedSuper
  };

  // gun ammo
  h.maxAmmo = G.gun.ammo;
  h.ammo = G.gun.ammo;
  if(cid==='mo'){
    h.maxAmmo *= 2;
    h.ammo *= 2;
  }
  G.gem.apply(G);

  // Equipped cursed consumables: buying only adds stock. Copies are consumed here,
  // when the player actually deploys with them equipped — never at purchase time.
  // `G._skipCursedGear` is set by the pre-deploy prompt when the player wants this one run
  // clean; the remembered loadout survives either way (see the block below).
  const equippedCurses = launchTest
    ? [...(G.testSel.gear||[])]
    : (G._skipCursedGear ? [] : rememberedCursedGear());
  for(const vid of equippedCurses) applyVending(vid);
  if(!launchTest){
    for(const vid of equippedCurses){
      const n=Math.max(0, Number(SAVE.vendingStock[vid])||0);
      if(n<=1) delete SAVE.vendingStock[vid];
      else SAVE.vendingStock[vid]=n-1;
    }
    // REMEMBERED, not cleared. Whatever still has copies stays equipped so the next deploy can
    // offer the same set in one tap, and `vendingFresh=false` marks it as inherited-from-a-run
    // so the next deploy asks before spending another copy.
    SAVE.vendingEquipped=SAVE.vendingEquipped.filter(id=>vendingStock(id)>0);
    SAVE.vendingFresh=false;
    G._skipCursedGear=false;
    saveGame();
  }

  if(launchTest){
    for(const pid of (G.testSel.perks||[])){
      const p=PERKS.find(x=>x.id===pid);
      if(p) grantPerk(p);
    }
    // Commit the staged Training setup to the running sandbox.
    G.trainingSetupDirty=false;
  }

  // Held weapon model/color, including the dedicated maul model.
  configureHeroHeldWeapon(hm,G.gun);

  // boss/char lights
  G.char.lightColor = new THREE.Color(G.char.color);

  initSpawners();
  ensureSummons();
  updateHUD(true);
  setScreen('none');
  $('#hud').hidden = false;
  G.state = 'arena';
  AUD.playTrack(G.sel.music);
  if(launchTest){
    initTestArena();
    setTimeout(()=>startNotice('1 DANGER · 2 RESET · 3 EXP EDGE 300 ORBS + RAPID ×10 + ∞ ULT',{tone:'info',life:9000}),260);
  }else{
    if(h.bahamutSkills) setTimeout(()=>startNotice('DRAGON SKILLS · 1 FAN · 2 LANCE · 3 BURST · 4 SWEEP · E RUSH',{tone:'skill',life:10000}),160);
    if(G.dragonChaos){
      setTimeout(()=>startNotice('⚠ BAHAMUT RESPONSE · CHAOS PRESSURE ACTIVE',{tone:'danger',life:9500}),360);
      setTimeout(()=>startNotice(pressureNoticeLine(DRAGON_CHAOS_PRESSURE),{tone:'danger',life:9500}),720);
    }else if(G.opStackChallenge){
      setTimeout(()=>startNotice('⚠ APEX LOADOUT RESPONSE · EXTRA PRESSURE ACTIVE',{tone:'danger',life:9000}),320);
      setTimeout(()=>startNotice(pressureNoticeLine(OP_STACK_PRESSURE),{tone:'danger',life:9000}),680);
    }else if(G.diff==='Insane' && insaneBerserkEligible()){
      // Exactly ONE OP item. There is no extra pressure stack, but insaneBerserkEligible() is
      // true for any OP item, so the run still gets full-pressure Insane AND the final-30s
      // surge. That surge used to arrive with nothing on screen explaining it.
      setTimeout(()=>startNotice('⚠ OP LOADOUT · FULL INSANE PRESSURE · '+insaneGridNoticeLine(INSANE_PRESSURE_OP)+' · BERSERK SURGE IN THE FINAL 30s',{tone:'danger',life:9000}),320);
    }else if(G.diff==='Insane'){
      // Clean / no-OP Insane: the eased grid, base chase, and no surge at all. Worth saying
      // out loud, because the whole point of the eased grid is that it is not the same run.
      setTimeout(()=>startNotice('⚠ INSANE · CLEAN RUN · '+insaneGridNoticeLine(INSANE_PRESSURE_CLEAN)+' · CHASE ×'+fmtMult(INSANE_CLEAN_SPEED_MULT)+' · NO BERSERK SURGE',{tone:'danger',life:9500}),320);
    }
    if(G.finalBossMode==='bahamut') setTimeout(()=>startNotice('⚠ INSANE FINAL EXAM · BAHAMUT ENTERS AT 500s · HARD STOP 999s',{tone:'final',life:10000}),1080);
    else if(G.finalBossMode==='apexSeven') setTimeout(()=>startNotice('⚠ INSANE FINAL EXAM · THE APEX SEVEN ENTER AT 500s · HARD STOP 999s',{tone:'final',life:10000}),1080);
  }
}

// ---------------- Mobile: joysticks, fullscreen, orientation ----------------
function isCoarse(){ return matchMedia('(pointer:coarse)').matches; }
let pendingLandscapeStart = false;

function isPortraitTouch(){ return isCoarse() && innerHeight > innerWidth; }
function hasFullscreen(){ return !!(document.fullscreenElement || document.webkitFullscreenElement); }
function updateFullscreenReenter(){
  const btn=$('#touchFullscreenBtn');
  if(!btn) return;
  const de=document.documentElement;
  const supported=!!(de.requestFullscreen || de.webkitRequestFullscreen);
  const inRun=!!G.hero && G.state!=='menu' && G.state!=='select';
  btn.hidden=!(isCoarse() && supported && inRun && !hasFullscreen());
}

function goFullscreen(){
  if(!isCoarse()) return;
  const de = document.documentElement;
  const lockLandscape = ()=>{
    try{
      if(screen.orientation && screen.orientation.lock){
        const p = screen.orientation.lock('landscape');
        if(p&&p.then) p.then(()=>setTimeout(checkOrientation, 80), ()=>setTimeout(checkOrientation, 80));
      }
    }catch(e){}
  };
  let fs = null;
  try{
    if(de.requestFullscreen) fs = de.requestFullscreen();
    else if(de.webkitRequestFullscreen) de.webkitRequestFullscreen();
  }catch(e){}
  if(fs && fs.then) fs.then(lockLandscape, lockLandscape);
  else lockLandscape();
  setTimeout(checkOrientation, 100);
  setTimeout(updateFullscreenReenter, 160);
}

function checkOrientation(){
  const ov = $('#rotateOv');
  if(!ov) return;
  const waiting = pendingLandscapeStart && isPortraitTouch();
  ov.hidden = !waiting;
  if(pendingLandscapeStart && !isPortraitTouch()){
    pendingLandscapeStart = false;
    ov.hidden = true;
    beginRun();
  }
}

// Cursed gear confirm. The loadout is remembered across runs, so this is the only place a
// player has to touch it: one tap to spend copies on this run, one to run clean. Shown only
// for a loadout inherited from a finished run (vendingFresh === false) - never right after
// the player hand-picked it in CUSTOMIZE CHARACTER.
function vendingPromptNeeded(){
  // Only ever consulted on the real-run deploy path (startRunWithOrientation), never for
  // training - G.testMode is still the PREVIOUS run's value at that point, so it is not
  // a safe thing to branch on here.
  return !SAVE.vendingFresh && rememberedCursedGear().length>0;
}
function showCursedGearPrompt(onChoice){
  const items=rememberedCursedGear().map(id=>HUB_SHOP.vending.find(v=>v.id===id)).filter(Boolean);
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:70;background:rgba(4,7,11,.92);display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:max(10px,env(safe-area-inset-top)) 10px max(10px,env(safe-area-inset-bottom));box-sizing:border-box;';
  ov.innerHTML='<div style="width:min(520px,100%);margin:auto 0;background:#141a24;border:1px solid #26313f;border-radius:12px;padding:22px 24px;box-sizing:border-box;color:#e8eef5;text-align:left">'+
    '<div style="font-size:18px;font-weight:800;letter-spacing:1.6px;color:#ffd166">🧪 CURSED GEAR</div>'+
    '<div style="font-size:12.5px;line-height:1.75;opacity:.85;margin:10px 0 14px">'+
      'Your last run used these. Use them again on this run, or leave them in the stockpile for a run you want them in.'+
    '</div>'+
    items.map(it=>'<div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-top:1px solid #26313f">'+
        '<div style="font-size:20px;line-height:1.1">'+it.icon+'</div>'+
        '<div><div style="font-weight:700;font-size:13px">'+it.name+' <span style="opacity:.6;font-weight:400">×'+vendingStock(it.id)+'</span></div>'+
        '<div style="font-size:11.5px;opacity:.75;line-height:1.5">'+uxCopy(it.desc)+'</div></div>'+
      '</div>').join('')+
    '<button class="btn" id="cgUse" style="width:100%;margin-top:16px">USE '+items.length+(items.length===1?' ITEM':' ITEMS')+' THIS RUN</button>'+
    '<button class="btn" id="cgSkip" style="width:100%;margin-top:8px">RUN CLEAN · SAVE THEM</button>'+
    '<div style="font-size:11px;opacity:.6;text-align:center;margin-top:10px">Skipping spends nothing. The set stays remembered either way.</div>'+
  '</div>';
  document.body.appendChild(ov);
  const done=use=>{ ov.remove(); AUD.ui(); onChoice(use); };
  ov.querySelector('#cgUse').onclick=()=>done(true);
  ov.querySelector('#cgSkip').onclick=()=>done(false);
}
function startRunWithOrientation(ev){
  G._launchTest=false;
  // The one and only place a rankable run is declared: the play / customize / replay
  // buttons. beginRun() consumes this flag, so a programmatic beginRun() is never rankable.
  // A click that a real pointer/keyboard produced is `isTrusted`, and that is the one thing a
  // script cannot forge: it proves a human pressed play, so it clears the harness mark that
  // an earlier tool call left on this page. A synthetic element.click() is not trusted and
  // (re)marks the run as a sandbox run instead.
  if(ev && typeof ev.isTrusted === 'boolean') G.harnessTouched = !ev.isTrusted;
  G._rankIntent=true;
  persistLastSelection();
  AUD.init(); AUD.resume();
  const launch=()=>{
    if(isPortraitTouch()){
      pendingLandscapeStart = true;
      checkOrientation();
      return;
    }
    if(isCoarse()) goFullscreen();
    beginRun();
  };
  if(vendingPromptNeeded()){
    showCursedGearPrompt(use=>{ G._skipCursedGear=!use; launch(); });
    return;
  }
  launch();
}

const JOY_R = 44;                       // joystick knob travel radius, px
const TOUCH_AIM_DRAG_PX = 14;            // tap dead-zone before a gesture becomes aiming
const TOUCH_AUTOFIRE_MS = 180;           // short drag releases one shot; held drag becomes autofire
function joyBase(side){ return document.getElementById(side==='L'?'joyL':'joyR'); }
function touchInJoy(side, x, y){
  const b = joyBase(side); if(!b) return false;
  const r = b.getBoundingClientRect();
  if(!r.width || !r.height) return false;
  const cx = r.left + r.width/2, cy = r.top + r.height/2;
  return Math.hypot(x-cx, y-cy) <= r.width/2;
}
function showJoy(side){
  const b = joyBase(side); if(!b) return;
  b.classList.add('dragging');
}
function dragJoy(side, ox, oy){
  const b = joyBase(side); if(!b) return;
  const d = Math.hypot(ox,oy); const sc = d>JOY_R ? JOY_R/d : 1;
  const k = b.querySelector('.jknob'); if(k) k.style.transform = 'translate('+(ox*sc)+'px,'+(oy*sc)+'px)';
}
function resetJoy(side){
  const b = joyBase(side); if(!b) return;
  b.classList.remove('dragging');
  b.style.left=''; b.style.top='';
  const k = b.querySelector('.jknob'); if(k) k.style.transform='';
}
function toggleArenaPause(){
  if(G.state==='arena'){
    G.state='paused';
    G.simPaused=true;
    $('#pauseScreen').hidden=false;
    renderPauseHeroSplash();
    renderPauseHeroStatus();
    renderPauseSkinPanel();
    renderPauseVisibility();
    renderPauseStats();
    const pt=$('#pauseTestBtn'); if(pt) pt.hidden=!G.testMode;
  } else if(G.state==='paused'){
    G.state='arena';
    G.simPaused=false;
    $('#pauseScreen').hidden=true;
    AUD.playTrack(G.sel.music);
  }
}

function mobileEnemyAimDir(){
  const h=G.hero;
  if(!h || h.dead) return null;
  let best=null,bestD2=Infinity;
  for(const e of G.enemies){
    if(e.dead || e.kind==='shield') continue;
    const d2=dist2(e.x,e.z,h.x,h.z);
    if(d2<bestD2){ bestD2=d2; best=e; }
  }
  if(!best) return null;
  const dx=best.x-h.x,dz=best.z-h.z,len=Math.max(0.001,Math.hypot(dx,dz));
  return {x:dx/len,z:dz/len};
}

function mobileRepositionDir(){
  return getMovementIntentDir() || {x:G.aimDir.x,z:G.aimDir.z};
}

function mobileTapAutoAim(){
  const h=G.hero, dir=mobileEnemyAimDir();
  if(!h || !dir) return false;
  G.aimDir.x=dir.x; G.aimDir.z=dir.z;
  G.aimWorld.set(h.x+dir.x*190,0,h.z+dir.z*190);
  return true;
}

function resolveMobileSkillTapDir(mode){
  if(mode==='enemy') return mobileEnemyAimDir() || {x:G.aimDir.x,z:G.aimDir.z};
  if(mode==='reposition') return mobileRepositionDir();
  return {x:G.aimDir.x,z:G.aimDir.z};
}

function makeSkillArrowGeometry(length,width=4,headLen=18,headWidth=11){
  const shaftEnd=Math.max(8,length-headLen);
  const a=width*0.5, hw=headWidth*0.5;
  const verts=new Float32Array([
    -a,0,0,   a,0,0,   a,0,shaftEnd,
    -a,0,0,   a,0,shaftEnd,   -a,0,shaftEnd,
    -hw,0,shaftEnd,   hw,0,shaftEnd,   0,0,length,
  ]);
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(verts,3));
  geo.computeVertexNormals();
  return geo;
}

function makeSkillSectorGeometry(range,arcDeg,segments=30){
  const arc=Math.max(0.02,arcDeg*Math.PI/180);
  const verts=[];
  for(let i=0;i<segments;i++){
    const a0=-arc/2+arc*(i/segments), a1=-arc/2+arc*((i+1)/segments);
    verts.push(0,0,0, Math.sin(a0)*range,0,Math.cos(a0)*range, Math.sin(a1)*range,0,Math.cos(a1)*range);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  geo.computeVertexNormals();
  return geo;
}

function spawnMobileSkillPreview(spec,dir=G.aimDir,range=null){
  const h=G.hero;
  if(!h || !spec) return null;
  const grp=new THREE.Group();
  const color=spec.color||0x8fe8ff;
  const mats=[];
  let arrow=null,impactRing=null;
  const mk=(opacity)=>{
    const m=new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
    mats.push(m); return m;
  };

  if(spec.type==='radius'){
    const radius=spec.radius||spec.range||48;
    const fill=new THREE.Mesh(new THREE.CircleGeometry(radius,64),mk(0.055));
    fill.rotation.x=-Math.PI/2; fill.position.y=0.50; grp.add(fill);
    const ring=new THREE.Mesh(new THREE.RingGeometry(Math.max(1,radius-2.6),radius,64),mk(0.70));
    ring.rotation.x=-Math.PI/2; ring.position.y=0.72; grp.add(ring);
  } else {
    if(spec.type==='cone'){
      const cone=new THREE.Mesh(makeSkillSectorGeometry(spec.range,spec.arcDeg||30),mk(0.16));
      cone.position.y=0.55; grp.add(cone);
    }
    arrow=new THREE.Mesh(makeSkillArrowGeometry(spec.range,spec.arrowWidth||4,spec.headLen||18,spec.headWidth||12),mk(0.68));
    arrow.position.y=0.72; grp.add(arrow);
  }

  if(spec.impactR && spec.type!=='radius'){
    const mat=mk(0.58);
    impactRing=new THREE.Mesh(new THREE.RingGeometry(Math.max(1,spec.impactR-2.4),spec.impactR,48),mat);
    impactRing.rotation.x=-Math.PI/2; impactRing.position.set(0,0.76,spec.range); grp.add(impactRing);
  }
  if(spec.impactCone){
    const c=spec.impactCone;
    const cone=new THREE.Mesh(makeSkillSectorGeometry(c.range,c.arcDeg||90),mk(0.13));
    cone.position.set(0,0.58,spec.range); grp.add(cone);
  }

  grp.position.set(h.x,0,h.z);
  grp.rotation.y=Math.atan2(dir.x,dir.z);
  sceneAdd(grp);
  const preview={mesh:grp,mats,spec,dir:{x:dir.x,z:dir.z},arrow,impactRing,baseRange:spec.range};
  G.mobileSkillPreview=preview;
  if(Number.isFinite(range)) updateMobileSkillPreview(preview,dir,range);
  return preview;
}

function updateMobileSkillPreview(preview,dir=null,range=null){
  if(!preview || !G.hero) return;
  if(dir) preview.dir={x:dir.x,z:dir.z};
  const d=preview.dir||G.aimDir;
  preview.mesh.position.set(G.hero.x,0,G.hero.z);
  preview.mesh.rotation.y=Math.atan2(d.x,d.z);
  if(Number.isFinite(range) && preview.arrow && preview.baseRange>0){
    const shown=clamp(range,1,preview.baseRange);
    preview.arrow.scale.z=shown/preview.baseRange;
    if(preview.impactRing) preview.impactRing.position.z=shown;
  }
}

function removeMobileSkillPreview(preview){
  if(!preview) return;
  preview.mesh.traverse?.(obj=>{ if(obj.geometry) obj.geometry.dispose?.(); });
  sceneRemove(preview.mesh);
  for(const m of preview.mats||[]) m.dispose?.();
  if(G.mobileSkillPreview===preview) G.mobileSkillPreview=null;
}

function superSkillPreviewConfig(){
  const id=G.char?.id;
  // One authoritative Super-shape map for desktop AND touch. Do not split this by
  // input method: if a Super has a direction/radius, every control surface must agree.
  if(id==='bahamut') return {directional:true,tapAim:'reposition',preview:{type:'line',range:225,impactR:118,color:0xd6a2ff,arrowWidth:5,headWidth:15}};
  if(id==='talon') return {directional:true,tapAim:'reposition',preview:{type:'line',range:190,impactCone:{range:210,arcDeg:174},color:0xdff8ff,arrowWidth:5,headWidth:15}};
  if(id==='foxy') return {directional:true,tapAim:'reposition',preview:{type:'line',range:100,impactR:18,color:0xffc98a}};
  if(id==='mag') return {directional:true,tapAim:'enemy',preview:{type:'line',range:105,impactR:MAGNET_FX_RADIUS,color:0xff5a3d,arrowWidth:4,headWidth:12}};
  if(id==='porter') return {directional:true,tapAim:'reposition',targetPoint:true,preview:{type:'line',range:Math.hypot(VIEW.visW*2,VIEW.visH*2),impactR:64,color:0xb78fff}};

  // Real radial footprints where the Super actually checks a radius. Summon/self/global
  // Supers still get an honest cast-circle rather than pretending they are directional.
  const radial={
    pulse:[240,0x7fd4ff],          // push/heal field
    bones:[58,0xcfd7e2],           // pack summon circle
    payne:[260,0xff4f4f],          // PAYBACK damage radius
    haze:[165,0x76d55f],           // XP-seeding search radius; base clouds remain close to HAZE
    mo:[100,0xffd166],             // ammo-bomb explosion
    nikki:[42,0x8fe8ff],           // self/global turret-overdrive cast marker
    blink:[42,0x7388ff],           // self-activated phase run
    rooty:[90,0x62c96b],           // bramble ring
    raja:[96,0xff382f],            // frenzy opener
    mane:[Math.hypot(VIEW.visW,VIEW.visH)+90,0xffcf4d], // arena-wide roar
    grizz:[160,0xc99a66],          // quake
    fang:[58,0x9aa7b5],            // pack summon circle
    val:[Math.hypot(VIEW.visW,VIEW.visH)+70,0xff9cc9] // spreading Bakery Panic wave
  }[id];
  if(radial) return {directional:false,preview:{type:'radius',radius:radial[0],color:radial[1]}};
  return {directional:false,preview:{type:'radius',radius:42,color:0x8fe8ff}};
}
function mobileSuperTouchConfig(){ return superSkillPreviewConfig(); }
function desktopSuperPreviewConfig(){ return superSkillPreviewConfig(); }
function dragonSkillPreviewConfig(kind){
  if(kind==='fan') return {directional:true,tapAim:'enemy',preview:{type:'cone',range:186,arcDeg:82,color:0xff8d4d,arrowWidth:4,headWidth:13}};
  if(kind==='lance') return {directional:true,tapAim:'enemy',preview:{type:'cone',range:238,arcDeg:14,color:0x9fe8ff,arrowWidth:4,headWidth:13}};
  if(kind==='radial') return {directional:false,preview:{type:'radius',radius:72,color:0xc579ff}};
  if(kind==='sweep') return {directional:false,preview:{type:'radius',radius:92,color:0xffbf66}};
  return {directional:false};
}
function superReadyNow(){
  const h=G.hero;
  if(!h||h.dead||G.state!=='arena'||G.simPaused||h.dashing) return false;
  const unlimited=!!h.super?.unlimited;
  return (unlimited||h.super.uses>0) && h.super.chargeT>=h.super.chargeMax;
}
function bahamutSkillReadyNow(kind){
  const h=G.hero;
  return !!(h&&!h.dead&&h.bahamutSkills&&G.state==='arena'&&!G.simPaused&&!h.dashing&&
    (h.bahamutGlobalCd||0)<=0&&(h.bahamutSkillCd?.[kind]||0)<=0);
}
function desktopSkillTipData(kind){
  if(kind==='super'){
    const c=G.char;
    if(!c) return null;
    const runtimeUnlimited=!!G.hero?.super?.unlimited;
    const trainingUnlimited=!!(G.testMode&&G.hero?.trainingRapid&&runtimeUnlimited&&!c.unlimitedSuper);
    return {title:c.superName||'SUPER',meta:trainingUnlimited?('TRAINING ∞ · RAPID ×'+TRAINING_RAPID_RATE):(runtimeUnlimited?'UNLIMITED':('BASE CD '+c.superCharge+'s · STOCK '+c.superUses)),body:c.superDesc||HERO_DETAIL_SHEETS[c.id]?.super||''};
  }
  if(kind==='sprint') return {title:'SPRINT',meta:'MOVE SPEED +70%',body:'Hold Right-Click / Shift or toggle the HUD button. Needs at least 20 stamina to start, then drains stamina while moving.'};
  if(kind==='dash') return {title:'DASH',meta:'110 UNITS · 40 STAMINA',body:'Emergency reposition toward mouse aim. Invulnerable during the dash.'};
  const dragonIndex={fan:0,lance:1,radial:2,sweep:3}[kind];
  if(dragonIndex!=null){
    const spec=HERO_DETAIL_SHEETS.bahamut?.arsenal?.[dragonIndex];
    if(spec) return {title:spec.key+' · '+spec.name,meta:spec.meta,body:spec.body};
  }
  return null;
}
function showDesktopSkillTip(data){
  const tip=$('#desktopSkillTip');
  if(!tip||!data) return;
  const title=$('#desktopSkillTipTitle'), meta=$('#desktopSkillTipMeta'), body=$('#desktopSkillTipBody');
  if(title) title.textContent=data.title||'';
  if(meta) meta.textContent=uxCopy(data.meta||'');
  if(body) body.textContent=uxCopy(data.body||'');
  tip.hidden=false;
}
function hideDesktopSkillTip(){
  const tip=$('#desktopSkillTip');
  if(tip) tip.hidden=true;
}
function wireDesktopSkillTip(el,getData){
  if(!el) return;
  const show=()=>showDesktopSkillTip(typeof getData==='function'?getData():getData);
  el.addEventListener('mouseenter',show);
  el.addEventListener('mouseleave',hideDesktopSkillTip);
  el.addEventListener('focus',show);
  el.addEventListener('blur',hideDesktopSkillTip);
  el.addEventListener('pointerdown',hideDesktopSkillTip);
}

function dashReadyNow(){
  const h=G.hero;
  return !!(h&&!h.dead&&h.dash&&G.state==='arena'&&!G.simPaused&&!h.dashing&&h.stamina>=DASH_STAMINA_COST-0.01);
}
const DESKTOP_SKILL_HOLD_MS=130;
let desktopSkillAim=null;
function beginDesktopSkillAim(code,cfg,action){
  if(!cfg||desktopSkillAim||!G.hero) return false;
  const getDir=()=>{
    if(!cfg.directional) return {x:G.aimDir.x,z:G.aimDir.z};
    if(cfg.targetPoint && !G.mouse.touchMode && G.hero){
      const b=porterWarpBounds();
      const targetX=clamp(G.aimWorld.x,b.minX,b.maxX),targetZ=clamp(G.aimWorld.z,b.minZ,b.maxZ);
      const dx=targetX-G.hero.x,dz=targetZ-G.hero.z,len=Math.max(0.001,Math.hypot(dx,dz));
      return {x:dx/len,z:dz/len,range:len,targetX,targetZ};
    }
    return cfg.tapAim==='reposition' ? repositionDirection() : {x:G.aimDir.x,z:G.aimDir.z};
  };
  const dir=getDir();
  // Lazy preview: a normal quick tap never creates a projection at all. Holding past
  // 130ms deliberately enters preview mode, then release still commits the skill.
  desktopSkillAim={code,cfg,action,getDir,dir,preview:null,downAt:performance.now(),previewShown:false};
  return true;
}
function updateDesktopSkillAim(){
  const a=desktopSkillAim;
  if(!a) return;
  if(!G.hero||G.state!=='arena'||G.simPaused){ finishDesktopSkillAim(a.code,true); return; }
  a.dir=a.getDir();
  if(!a.previewShown && a.cfg.preview && performance.now()-a.downAt>=DESKTOP_SKILL_HOLD_MS){
    a.preview=spawnMobileSkillPreview(a.cfg.preview,a.dir,a.dir.range);
    a.previewShown=!!a.preview;
  }
  if(a.preview) updateMobileSkillPreview(a.preview,a.dir,a.dir.range);
}
function finishDesktopSkillAim(code,cancel=false){
  const a=desktopSkillAim;
  if(!a||a.code!==code) return false;
  // Refresh direction at release so even a sub-threshold tap uses the latest mouse aim.
  a.dir=a.getDir();
  if(a.preview) removeMobileSkillPreview(a.preview);
  desktopSkillAim=null;
  if(!cancel&&G.state==='arena'&&G.hero&&!G.hero.dead){
    if(a.cfg.directional) a.action(a.dir); else a.action();
  }
  updateHUD(true);
  return true;
}

// ---------------- Input ----------------
function initInput(){
  $('#muteBtn').hidden = !$('#menuScreen').hidden;
  $('#muteBtn').addEventListener('click', ()=>{ AUD.setMuted(!AUD.muted); $('#muteBtn').textContent = AUD.muted ? '🔇' : '🔊'; });
  const rotateGo = $('#rotateGoBtn');
  if(rotateGo) rotateGo.addEventListener('click', e=>{ e.stopPropagation(); goFullscreen(); });
  const rotateCancel = $('#rotateCancelBtn');
  if(rotateCancel) rotateCancel.addEventListener('click', e=>{ e.stopPropagation(); pendingLandscapeStart=false; G._rankIntent=false; checkOrientation(); });
  const fsBtn=$('#touchFullscreenBtn');
  if(fsBtn) fsBtn.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); goFullscreen(); });
  document.addEventListener('fullscreenchange',updateFullscreenReenter);
  document.addEventListener('webkitfullscreenchange',updateFullscreenReenter);
  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', ()=>setTimeout(checkOrientation, 250));
  checkOrientation();
  if(isCoarse()){
    const sw = $('#subWrap'), hb = $('#howBtn'), hw = $('#howWrap');
    if(sw && hb) sw.appendChild(hb);
    if(hw && hw.children.length===0) hw.remove();
  }
  const gesture = ()=>{ AUD.init(); AUD.resume(); };
  window.addEventListener('pointerdown', gesture, {once:true});
  window.addEventListener('keydown', gesture, {once:true});
  if(window.matchMedia?.('(hover:hover) and (pointer:fine)').matches){
    wireDesktopSkillTip($('#superBtn'),()=>desktopSkillTipData('super'));
    wireDesktopSkillTip($('#deskSprintBtn'),()=>desktopSkillTipData('sprint'));
    wireDesktopSkillTip($('#deskDashBtn'),()=>desktopSkillTipData('dash'));
    wireDesktopSkillTip($('#dragonDeskFanBtn'),()=>desktopSkillTipData('fan'));
    wireDesktopSkillTip($('#dragonDeskLanceBtn'),()=>desktopSkillTipData('lance'));
    wireDesktopSkillTip($('#dragonDeskRadialBtn'),()=>desktopSkillTipData('radial'));
    wireDesktopSkillTip($('#dragonDeskSweepBtn'),()=>desktopSkillTipData('sweep'));
  }
  window.addEventListener('keydown', e=>{
    G.keys[e.code] = true;
    if(e.code==='KeyR'&&!e.repeat) startReload();
    if(e.code==='KeyE'&&!e.repeat){
      const cfg=desktopSuperPreviewConfig();
      if(superReadyNow()) beginDesktopSkillAim('KeyE',cfg,dir=>castSuper(dir));
    }
    if(e.code==='Space'&&!e.repeat){
      if(dashReadyNow()) beginDesktopSkillAim('Space',{directional:true,tapAim:'reposition',preview:{type:'line',range:DASH_DIST,impactR:16,color:0xffd166}},dir=>tryDash(dir));
    }
    if(e.code==='Digit1'&&!e.repeat){ const cfg=dragonSkillPreviewConfig('fan'); if(bahamutSkillReadyNow('fan')) beginDesktopSkillAim('Digit1',cfg,dir=>tryBahamutSkill('fan',dir)); }
    if(e.code==='Digit2'&&!e.repeat){ const cfg=dragonSkillPreviewConfig('lance'); if(bahamutSkillReadyNow('lance')) beginDesktopSkillAim('Digit2',cfg,dir=>tryBahamutSkill('lance',dir)); }
    if(e.code==='Digit3'&&!e.repeat){ const cfg=dragonSkillPreviewConfig('radial'); if(bahamutSkillReadyNow('radial')) beginDesktopSkillAim('Digit3',cfg,()=>tryBahamutSkill('radial')); }
    if(e.code==='Digit4'&&!e.repeat){ const cfg=dragonSkillPreviewConfig('sweep'); if(bahamutSkillReadyNow('sweep')) beginDesktopSkillAim('Digit4',cfg,()=>tryBahamutSkill('sweep')); }
    if((e.code==='Escape' || e.code==='KeyP')&&!e.repeat){ finishDesktopSkillAim(desktopSkillAim?.code||'',true); toggleArenaPause(); }
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', e=>{
    G.keys[e.code]=false;
    if(finishDesktopSkillAim(e.code,false)) e.preventDefault();
  });

  const canvas = G.renderer.domElement;
  // events or pointer movement: the browser/mouse-driver chord risk is preferable to
  // Keep mouse listeners on the renderer canvas so overlay controls remain independent.
  canvas.addEventListener('contextmenu', e=>e.preventDefault());
  window.addEventListener('mousemove', e=>{
    G.mouse.x = (e.clientX/innerWidth)*2-1;
    G.mouse.y = -(e.clientY/innerHeight)*2+1;
    G.mouse.touchMode = false;
  });
  window.addEventListener('mousedown', e=>{
    if(e.button===0){
      G.mouse.down = true;
      if(G.state==='arena' && !G.simPaused && G.hero && G.hero.ammo<=0 && !G.hero.reloading){ AUD.empty(); startReload(); }
    }
    if(e.button===2) G.mouse.rDown = true;
  });
  window.addEventListener('mouseup', e=>{ if(e.button===0) G.mouse.down=false; if(e.button===2) G.mouse.rDown=false; });

  // touch — left joystick moves. Any other canvas touch is a fire gesture:
  // no-direction tap = auto-aim nearest enemy and fire once; short drag + release = aim there and fire once;
  // held drag = the existing continuous/autofire mode until release.
  canvas.addEventListener('touchstart', e=>{
    e.preventDefault();
    G.mouse.touchMode = true;
    for(const t of e.changedTouches){
      G.touch = G.touch||{};
      if(touchInJoy('L', t.clientX, t.clientY)){
        G.touch.moveId = t.identifier;
        const _b = joyBase('L').getBoundingClientRect();
        G.touch.moveBase = {x:_b.left + _b.width/2, y:_b.top + _b.height/2};
        G.touch.move = {dx:0, dz:0};
        showJoy('L');
        continue;
      }
      // Do not let a second combat finger steal an aim gesture already in progress.
      if(G.touch.aimId!=null) continue;
      G.touch.aimId = t.identifier;
      G.touch.aimStart = {x:t.clientX, y:t.clientY};
      G.touch.aim = {
        dx:G.aimDir.x, dz:G.aimDir.z,
        dragged:false, autoFire:false,
        startedAt:performance.now(),
        fromJoy:touchInJoy('R', t.clientX, t.clientY)
      };
      G.touch.fire = false;
      if(G.touch.aim.fromJoy) showJoy('R');
    }
  }, {passive:false});
  canvas.addEventListener('touchmove', e=>{
    e.preventDefault();
    for(const t of e.changedTouches){
      if(G.touch && G.touch.move && t.identifier===G.touch.moveId){
        const _ox = t.clientX-G.touch.moveBase.x, _oy = t.clientY-G.touch.moveBase.y;
        G.touch.move.dx = clamp(_ox/JOY_R,-1,1);
        G.touch.move.dz = clamp(_oy/JOY_R,-1,1);
        dragJoy('L', _ox, _oy);
      } else if(G.touch && G.touch.aim && t.identifier===G.touch.aimId){
        const ox=t.clientX-G.touch.aimStart.x, oy=t.clientY-G.touch.aimStart.y;
        const len=Math.hypot(ox,oy);
        if(len<TOUCH_AIM_DRAG_PX) continue;
        const a=G.touch.aim;
        a.dragged=true;
        a.dx=ox/len; a.dz=oy/len;
        G.aimDir.x=a.dx; G.aimDir.z=a.dz;
        G.aimWorld.set(G.hero.x+a.dx*190,0,G.hero.z+a.dz*190);
        showJoy('R');
        dragJoy('R', ox, oy);
      }
    }
  }, {passive:false});
  canvas.addEventListener('touchend', e=>{
    for(const t of e.changedTouches){
      if(G.touch && t.identifier===G.touch.moveId){
        G.touch.move=null; G.touch.moveId=null; resetJoy('L');
      }
      if(G.touch && t.identifier===G.touch.aimId){
        const aim=G.touch.aim;
        const h=G.hero;
        // No-direction tap: auto-aim the nearest live enemy and fire exactly once.
        // Short drag: keep the explicit drag direction and fire exactly once.
        // Held drag: autofire already fired while held; release only stops it.
        if(aim && !aim.autoFire && h && !h.dead && !G.aimingDisabled){
          if(!aim.dragged) mobileTapAutoAim();
          if(!aim.dragged && !G.enemies.some(e=>!e.dead && e.kind!=='shield')){
            G.aimWorld.set(h.x+G.aimDir.x*190,0,h.z+G.aimDir.z*190);
          }
          // A tap requests one shot; tryFire() remains the single authoritative fire-rate
          // gate. Never reset lastFire here or rapid tapping bypasses slow-weapon cadence.
          tryFire(0);
        }
        G.touch.aim=null;
        G.touch.aimId=null;
        G.touch.aimStart=null;
        G.touch.fire=false;
        resetJoy('R');
      }
    }
  });
  canvas.addEventListener('touchcancel', e=>{
    for(const t of e.changedTouches){
      if(G.touch && t.identifier===G.touch.moveId){
        G.touch.move=null; G.touch.moveId=null; resetJoy('L');
      }
      if(G.touch && t.identifier===G.touch.aimId){
        G.touch.aim=null;
        G.touch.aimId=null;
        G.touch.aimStart=null;
        G.touch.fire=false;
        resetJoy('R');
      }
    }
  });
}

// ---------------- HUD ----------------
function updateHUD(force=false){
  const nowPerf=performance.now();
  // HUD text/style churn is expensive on mobile and does not need render-frame cadence.
  // Combat stays full-rate; presentation updates at 15 Hz mobile / 24 Hz desktop, while
  // explicit state changes can still force an immediate refresh.
  const hudStep=isCoarse()?66:42;
  if(!force && nowPerf < (G._hudNextMs||0)) return;
  G._hudNextMs=nowPerf+hudStep;
  updateFullscreenReenter();
  if(!G.hero || G.state==='menu') return;
  const h = G.hero;
  const hpRatio = clamp(h.hp/h.maxHp,0,1);
  const now = nowPerf;
  const prevHud = h._hudPrevMs || now;
  const hudDt = Math.min(0.1, Math.max(0,(now-prevHud)/1000));
  h._hudPrevMs = now;
  if(h._hudHpTrailRatio==null) h._hudHpTrailRatio = hpRatio;
  if(hpRatio >= h._hudHpTrailRatio) h._hudHpTrailRatio = hpRatio;
  else if(now >= (h._hudHpTrailHoldUntil||0)) h._hudHpTrailRatio = Math.max(hpRatio, h._hudHpTrailRatio-hudDt*1.55);
  $('#hpLossBar').style.width = (clamp(h._hudHpTrailRatio,0,1)*100)+'%';
  $('#hpBar').style.width = (hpRatio*100)+'%';
  $('#hpText').textContent = Math.ceil(h.hp)+'/'+Math.ceil(h.maxHp);
  const statsPanel=$('#statsPanel');
  if(statsPanel) statsPanel.classList.toggle('lowHp', hpRatio<=0.30 && h.hp>0);
  const hasShieldResource = !!(h.shieldRegen || h.dodgeKing || h.shield>0);
  const shieldWrap=$('#shieldWrap');
  if(shieldWrap) shieldWrap.hidden = !hasShieldResource;
  $('#shieldBar').style.width = (h.maxShield? clamp(h.shield/h.maxShield,0,1)*100 : 0)+'%';
  const shieldText=$('#shieldText');
  if(shieldText) shieldText.textContent = Math.ceil(h.shield)+'/'+Math.ceil(h.maxShield||0);

  $('#staminaWrap').hidden = !h.sprint;
  if(h.sprint){
    $('#staminaBar').style.width = clamp(h.stamina/h.maxStamina,0,1)*100+'%';
    const staminaText=$('#staminaText');
    if(staminaText) staminaText.textContent = Math.ceil(h.stamina)+'/'+Math.ceil(h.maxStamina);
  }
  $('#statusLabel').innerHTML = heroPhasing(h) ? 'PHASED' : (h.invince>0 ? 'INVINCIBLE' : '&nbsp;');
  const diffHud=$('#difficultyHud');
  const berserkStage=insaneBerserkStage();
  if(diffHud){
    const diffName=G.diff||'Normal';
    diffHud.dataset.diff=diffName.toLowerCase();
    diffHud.classList.toggle('berserk',berserkStage===1);
    diffHud.classList.toggle('finalBerserk',berserkStage===2);
    diffHud.textContent=berserkStage===2 ? '☠ INSANE · FINAL BERSERK' : (berserkStage===1 ? '🔥 INSANE · BERSERK' : (DIFFS[diffName]?.label||String(diffName).toUpperCase()));
  }
  const timePanel=$('#timePanel');
  if(timePanel){
    timePanel.classList.toggle('berserk',berserkStage===1);
    timePanel.classList.toggle('finalBerserk',berserkStage===2);
  }
  const timeSub=$('#timePanel .sub');
  const finalExamTimed=!!(!G.testMode && G.finalBossActive && !G.finalBossDefeated && G.time>=WIN_TIME);
  const finalExamRemain=Math.max(0,Math.ceil(FINAL_CHALLENGE_TIMEOUT-G.time));
  if(timeSub){
    timeSub.textContent=finalExamTimed
      ? ('FINAL EXAM · '+finalExamRemain+'s LEFT')
      : (berserkStage===2 ? 'FINAL BERSERK' : (berserkStage===1 ? 'BERSERK' : 'SURVIVE'));
  }
  $('#timeText').textContent = Math.ceil(G.time);
  const thresh = EXPM(G.level);
  $('#lvlText').textContent = G.level+1;
  $('#expText').textContent = Math.floor(G.exp)+'/'+thresh;
  $('#xpBar').style.width = clamp(G.exp/thresh,0,1)*100+'%';
  const valCakeMeter=$('#valCakeMeter');
  if(valCakeMeter){
    valCakeMeter.hidden=!h.valBaker;
    if(h.valBaker){
      const count=clamp(Math.floor(h.valIngredients||0),0,2);
      const slots=valCakeMeter.querySelectorAll('.valIngSlot');
      slots.forEach((slot,i)=>slot.classList.toggle('filled',i<count));
      const txt=$('#valIngredientText'); if(txt) txt.textContent=(h.valIngredients||0)+'/3';
    }
  }
  // Sandbox runs (training, debug, or anything the __BBAPI test harness touched) are not
  // ranked and pay nothing, so the HUD says so for the whole run.
  const testBadge=$('#testHudBadge');
  if(testBadge){
    const sandbox=!!G.hero && !runIsRankable();
    testBadge.hidden=!sandbox;
    if(sandbox) testBadge.textContent=G.testMode?'TRAINING · FAKE':'SANDBOX · NOT RANKED';
  }
  $('#scoreText').textContent = Math.floor(G.score);
  $('#goldText').textContent = runGoldToCredits();
  $('#killsText').textContent = G.kills;
  $('#ammoText').textContent = h.ammo;
  const shieldWeapon=G.gun?.special?.includes('shieldbash');
  const flameWeapon=G.gun?.special?.includes('flameop');
  $('#gunName').textContent = G.gun ? G.gun.name+(shieldWeapon?' · ENERGY':flameWeapon?' · FUEL':'') : '';
  $('#ammoText').style.color = h.ammo===0 ? 'var(--red)' : '';
  $('#reloadBar').style.width = h.reloading ? (h.reloadT/h.reloadDur*100)+'%' : '0%';
  $('#reloadHint').textContent = h.reloading
    ? (shieldWeapon?'RECHARGING AEGIS...':flameWeapon?'REFILLING FUEL...':'RELOADING...')
    : (h.ammo<h.maxAmmo ? (shieldWeapon?'R TO RECHARGE':flameWeapon?'R TO REFILL':'CLICK / R TO RELOAD') : '');
  $('#superMeter').style.height = (h.super.chargeT/h.super.chargeMax*100)+'%';
  $('#touchSuperMeter').style.height = (h.super.chargeT/h.super.chargeMax*100)+'%';
  const unlimitedSuper = !!h.super.unlimited;
  const showDragonSkills = !!h.bahamutSkills;
  const superRemain = Math.max(0, h.super.chargeMax - h.super.chargeT);
  $('#superUses').textContent = unlimitedSuper ? '∞' : h.super.uses;
  // Dragon 1–4 centered cooldown language directly on the action control.
  $('#superSub').textContent = unlimitedSuper
    ? (superRemain<=0 ? 'UNLIMITED' : '')
    : (h.super.uses<=0 ? 'NO CHARGES' : '');
  const superReady = (unlimitedSuper || h.super.uses>0) && h.super.chargeT>=h.super.chargeMax;
  const superCooling = (unlimitedSuper || h.super.uses>0) && superRemain>0;
  const superCdText = superCooling ? (superRemain<10?superRemain.toFixed(1):Math.ceil(superRemain)) : '';
  const superBtn=$('#superBtn');
  superBtn.classList.toggle('cooling',superCooling);
  const superBtnCd=$('#superBtnCd'); if(superBtnCd) superBtnCd.textContent=superCdText;
  const touchSuperCd=$('#touchSuperCd'); if(touchSuperCd) touchSuperCd.textContent=superCooling?('CD '+superCdText):'';
  superBtn.style.borderColor = superReady ? 'var(--gold)' : 'var(--line)';
  superBtn.style.color = superReady ? 'var(--gold)' : 'var(--dim)';
  const touchSuper=$('#touchSuperBtn');
  touchSuper.classList.toggle('cooling',superCooling);
  touchSuper.style.borderColor = superReady ? 'var(--gold)' : 'var(--line)';
  const touchSuperUses=$('#touchSuperUses');
  if(touchSuperUses) touchSuperUses.textContent = unlimitedSuper ? '∞' : h.super.uses;
  const tsb = touchSuper.querySelector('.lbl');
  const tsi = touchSuper.querySelector('.ico');
  const superIcon=G.char?.superIcon || (unlimitedSuper?'💨':(showDragonSkills?'🪽':'✦'));
  if(tsb && !touchSuper.classList.contains('aiming')) tsb.textContent = unlimitedSuper ? 'DASH' : (showDragonSkills ? 'RUSH' : 'SUPER');
  if(tsi) tsi.textContent = superIcon;
  const deskSuperIcon=$('#superIcon');
  if(deskSuperIcon) deskSuperIcon.textContent=superIcon;
  const sprintLow = h.sprint && !h.sprintActive && !sprintCanStart(h);
  const touchSprint=$('#touchSprintBtn');
  touchSprint.hidden = !h.sprint;
  touchSprint.classList.toggle('toggleOn',!!G.touchSprint);
  touchSprint.classList.toggle('resourceLocked',sprintLow);
  touchSprint.setAttribute('aria-pressed',G.touchSprint?'true':'false');
  touchSprint.setAttribute('aria-disabled',sprintLow?'true':'false');
  const touchSprintLbl=touchSprint.querySelector('.lbl'); if(touchSprintLbl) touchSprintLbl.textContent=G.touchSprint?'SPRINT ON':'SPRINT';
  const touchDash=$('#touchDashBtn');
  const dashLow = h.dash && h.stamina<DASH_STAMINA_COST-0.01;
  touchDash.hidden = !h.dash;
  touchDash.classList.toggle('resourceLocked',dashLow);
  touchDash.setAttribute('aria-disabled',dashLow?'true':'false');
  touchDash.setAttribute('aria-label','Dash · 40 stamina'); touchDash.title='DASH · 40 STAMINA';

  const deskSprint=$('#deskSprintBtn');
  if(deskSprint){
    const sprintActive=!!(G.desktopSprintToggle || (h.sprintActive && sprintRequestedNow()));
    deskSprint.hidden=!h.sprint;
    deskSprint.classList.toggle('toggleOn',sprintActive);
    deskSprint.classList.toggle('resourceLocked',sprintLow);
    deskSprint.setAttribute('aria-disabled',sprintLow?'true':'false');
  }
  const deskDash=$('#deskDashBtn');
  if(deskDash){
    deskDash.hidden=!h.dash;
    deskDash.classList.toggle('resourceLocked',dashLow);
    deskDash.setAttribute('aria-disabled',dashLow?'true':'false');
    deskDash.setAttribute('aria-label','Dash · 40 stamina'); deskDash.title='DASH · 40 STAMINA';
  }
  const deskReload=$('#deskReloadBtn');
  if(deskReload){
    deskReload.disabled=!!h.reloading || h.ammo>=h.maxAmmo;
    deskReload.classList.toggle('cooling',!!h.reloading);
    const remain=h.reloading?Math.max(0,h.reloadDur-h.reloadT):0;
    const cd=$('#deskReloadCd'); if(cd) cd.textContent=h.reloading?(remain<10?remain.toFixed(1):Math.ceil(remain)):'';
  }
  const superBtnLbl=$('#superBtn .lbl');
  if(superBtnLbl) superBtnLbl.textContent = unlimitedSuper ? 'DASH' : (showDragonSkills ? 'RUSH' : 'SUPER');
  const dragonHud=[
    ['fan','#touchDragonFanBtn'],
    ['lance','#touchDragonLanceBtn'],
    ['radial','#touchDragonRadialBtn'],
    ['sweep','#touchDragonSweepBtn'],
  ];
  for(const [kind,sel] of dragonHud){
    const btn=$(sel); if(!btn) continue;
    btn.hidden=!showDragonSkills;
    if(!showDragonSkills) continue;
    const def=BAHAMUT_SKILLS[kind], cd=Math.max(0,h.bahamutSkillCd?.[kind]||0);
    btn.classList.toggle('cooling',cd>0 || (h.bahamutGlobalCd||0)>0);
    const meter=btn.querySelector('.skillMeter');
    if(meter) meter.style.height=((1-clamp(cd/def.cd,0,1))*100)+'%';
    const cdEl=btn.querySelector('.cd');
    if(cdEl) cdEl.textContent=cd>0 ? ('CD '+(cd<10?cd.toFixed(1):Math.ceil(cd))) : '';
  }
  const dragonDeskHud=[
    ['fan','#dragonDeskFanBtn'],
    ['lance','#dragonDeskLanceBtn'],
    ['radial','#dragonDeskRadialBtn'],
    ['sweep','#dragonDeskSweepBtn'],
  ];
  const dragonDeskOrbit=$('#dragonDeskOrbit');
  if(dragonDeskOrbit) dragonDeskOrbit.hidden=!showDragonSkills;
  for(const [kind,sel] of dragonDeskHud){
    const btn=$(sel); if(!btn) continue;
    btn.hidden=!showDragonSkills;
    if(!showDragonSkills) continue;
    const def=BAHAMUT_SKILLS[kind], cd=Math.max(0,h.bahamutSkillCd?.[kind]||0);
    const globalCd=Math.max(0,h.bahamutGlobalCd||0);
    const shownCd=Math.max(cd,globalCd);
    btn.classList.toggle('cooling',shownCd>0);
    const meter=btn.querySelector('.skillMeter');
    if(meter) meter.style.height=((1-clamp(cd/def.cd,0,1))*100)+'%';
    const cdEl=btn.querySelector('.cd');
    if(cdEl) cdEl.textContent=shownCd>0 ? (shownCd<10?shownCd.toFixed(1):Math.ceil(shownCd)) : '';
  }

  const dragonDeskHint=$('#dragonDeskHint');
  if(dragonDeskHint){
    dragonDeskHint.hidden=true;
    dragonDeskHint.innerHTML='';
  }
  const touchDragonHint=$('#touchDragonHint');
  if(touchDragonHint){
    const cooling=showDragonSkills
      ? Object.entries(h.bahamutSkillCd||{}).filter(([,v])=>v>0).sort((a,b)=>a[1]-b[1])[0]
      : null;
    touchDragonHint.hidden=!cooling;
    touchDragonHint.textContent = cooling
      ? (cooling[0].toUpperCase()+' '+(cooling[1]<10?cooling[1].toFixed(1):Math.ceil(cooling[1]))+'s')
      : '';
  }
  const touchReload=$('#touchReloadBtn');
  if(touchReload){
    touchReload.disabled = h.reloading || h.ammo>=h.maxAmmo;
    touchReload.classList.toggle('cooling',!!h.reloading);
    const lbl=touchReload.querySelector('.lbl');
    const ico=touchReload.querySelector('.ico');
    const cd=$('#touchReloadCd');
    const remain=h.reloading?Math.max(0,h.reloadDur-h.reloadT):0;
    if(lbl) lbl.textContent='RELOAD';
    if(ico) ico.textContent=h.reloading?'…':'↻';
    if(cd) cd.textContent=h.reloading?('CD '+(remain<10?remain.toFixed(1):Math.ceil(remain))):'';
  }
  $('#tAmmoText').textContent = h.ammo;
  $('#tAmmoText').style.color = h.ammo===0 ? 'var(--red)' : '';
  $('#tGunName').textContent = G.gun ? G.gun.name+(shieldWeapon?' · ENERGY':flameWeapon?' · FUEL':'') : '';
  $('#touchReloadBar').style.width = h.reloading ? (h.reloadT/h.reloadDur*100)+'%' : '0%';
}

function refreshPerkPanel(){
  const el = $('#perkList');
  el.innerHTML = '';
  for(const pid of G.perks){
    const p = PERKS.find(x=>x.id===pid);
    if(!p) continue;
    const row = document.createElement('div');
    row.className = 'perkRow';
    const ic = PERK_ICONS[p.id];
    const pd=perkDisplay(p);
    const stacks=perkStackCount(pid);
    row.innerHTML = (ic? '<span class="piconSm" style="background-image:url('+ICON_URL+');background-position:-'+(ic[0]*32)+'px -'+(ic[1]*32)+'px"></span>':'') + '<b>'+pd.name+(stacks>1?' ×'+stacks:'')+'</b>' + (p.king? ' <span class="m">👑 KING</span>' : (p.mastery? ' <span class="m">['+p.mastery+']</span>':'')) + '<br><span style="color:#8fa3b8">'+pd.desc+'</span>';
    el.appendChild(row);
  }
  const m = masteryPoints();
  const mr = MASTERIES.filter(t=>m[t]>0).map(t=>t+' '+m[t]).join(' · ');
  $('#masteryRow').textContent = mr ? 'Mastery: '+mr : '';
}

$('#superBtn').addEventListener('click', ()=>castSuper());

function wireTouchSkill(btn,action,getConfig){
  if(!btn) return;
  let gesture=null;
  btn.addEventListener('pointerdown',e=>{
    e.preventDefault();
    e.stopPropagation();
    if(G.state!=='arena' || !G.hero || G.hero.dead) return;
    const cfg=(typeof getConfig==='function'?getConfig():getConfig)||{directional:false};
    const r=btn.getBoundingClientRect();
    const rawDir=cfg.directional ? resolveMobileSkillTapDir(cfg.tapAim||'enemy') : {x:G.aimDir.x,z:G.aimDir.z};
    const dir={x:rawDir.x,z:rawDir.z};
    if(cfg.targetPoint){
      const maxDist=porterMaxWarpDistance(G.hero.x,G.hero.z,dir.x,dir.z);
      dir.range=Math.min(170,maxDist);
    }
    // Touch also previews real radial/self footprints. Non-directional casts commit on
    // release so the radius preview remains visible during hold.
    gesture={id:e.pointerId,cx:r.left+r.width/2,cy:r.top+r.height/2,moved:false,cfg,dir,preview:spawnMobileSkillPreview(cfg.preview,dir,dir.range)};
    G.mobileSkillAiming=true;
    btn.classList.add('aiming');
    try{ btn.setPointerCapture(e.pointerId); }catch(_){}
  });
  btn.addEventListener('pointermove',e=>{
    if(!gesture || e.pointerId!==gesture.id || !G.hero) return;
    e.preventDefault();
    if(!gesture.cfg.directional) return;
    const ox=e.clientX-gesture.cx, oy=e.clientY-gesture.cy;
    const len=Math.hypot(ox,oy);
    if(len<12) return;
    gesture.moved=true;
    const dx=ox/len,dz=oy/len;
    G.mouse.touchMode=true;
    gesture.dir={x:dx,z:dz};
    if(gesture.cfg.targetPoint){
      const maxDist=porterMaxWarpDistance(G.hero.x,G.hero.z,dx,dz);
      gesture.dir.range=maxDist*clamp(len/JOY_R,0,1);
    }
    updateMobileSkillPreview(gesture.preview,gesture.dir,gesture.dir.range);
    showJoy('R');
    dragJoy('R',ox,oy);
  });
  const finish=(e,cancel=false)=>{
    if(!gesture || e.pointerId!==gesture.id) return;
    e.preventDefault();
    const current=gesture;
    removeMobileSkillPreview(current.preview);
    if(!cancel && G.state==='arena' && G.hero && !G.hero.dead) action(current.dir);
    btn.classList.remove('aiming');
    G.mobileSkillAiming=false;
    gesture=null;
    if(!(G.touch&&G.touch.aim)) resetJoy('R');
    updateHUD(true);
  };
  btn.addEventListener('pointerup',e=>finish(e,false));
  btn.addEventListener('pointercancel',e=>finish(e,true));
}

wireTouchSkill($('#touchSuperBtn'),dir=>castSuper(dir),()=>mobileSuperTouchConfig());
wireTouchSkill($('#touchDashBtn'),dir=>tryDash(dir),()=>({directional:true,tapAim:'reposition',preview:{type:'line',range:DASH_DIST,impactR:16,color:0xffd166}}));
wireTouchSkill($('#touchDragonFanBtn'),dir=>tryBahamutSkill('fan',dir),()=>dragonSkillPreviewConfig('fan'));
wireTouchSkill($('#touchDragonLanceBtn'),dir=>tryBahamutSkill('lance',dir),()=>dragonSkillPreviewConfig('lance'));
wireTouchSkill($('#touchDragonRadialBtn'),()=>tryBahamutSkill('radial'),()=>dragonSkillPreviewConfig('radial'));
wireTouchSkill($('#touchDragonSweepBtn'),()=>tryBahamutSkill('sweep'),()=>dragonSkillPreviewConfig('sweep'));

for(const [sel,kind] of [
  ['#dragonDeskFanBtn','fan'],
  ['#dragonDeskLanceBtn','lance'],
  ['#dragonDeskRadialBtn','radial'],
  ['#dragonDeskSweepBtn','sweep'],
]){
  const btn=$(sel);
  if(btn) btn.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    tryBahamutSkill(kind);
    updateHUD(true);
  });
}

$('#touchSprintBtn').addEventListener('pointerdown', e=>{
  e.preventDefault(); e.stopPropagation();
  if(!G.hero || G.hero.dead || !G.hero.sprint) return;
  if(!G.touchSprint && !sprintCanStart(G.hero)){
    G.touchSprint=false;
    floater('NEED 20 STAMINA',G.hero.x,G.hero.z,'ammo');
    updateHUD(true);
    return;
  }
  G.touchSprint=!G.touchSprint;
  if(!G.touchSprint) G.hero.sprintActive=false;
  updateHUD(true);
});
$('#touchReloadBtn').addEventListener('pointerdown', e=>{ e.preventDefault(); if(G.hero && !G.hero.dead && !G.hero.reloading && G.hero.ammo<G.hero.maxAmmo) startReload(); });
$('#touchPauseBtn').addEventListener('pointerdown', e=>{ e.preventDefault(); e.stopPropagation(); toggleArenaPause(); });
const deskReload=$('#deskReloadBtn'); if(deskReload) deskReload.addEventListener('click',e=>{ e.preventDefault(); if(G.hero&&!G.hero.dead&&!G.hero.reloading&&G.hero.ammo<G.hero.maxAmmo) startReload(); });
const deskSprint=$('#deskSprintBtn'); if(deskSprint) deskSprint.addEventListener('click',e=>{
  e.preventDefault();
  if(!G.hero?.sprint) return;
  if(!G.desktopSprintToggle && !sprintCanStart(G.hero)){
    floater('NEED 20 STAMINA',G.hero.x,G.hero.z,'ammo');
    updateHUD(true);
    return;
  }
  G.desktopSprintToggle=!G.desktopSprintToggle;
  if(!G.desktopSprintToggle) G.hero.sprintActive=false;
  updateHUD(true);
});
const deskDash=$('#deskDashBtn'); if(deskDash) deskDash.addEventListener('click',e=>{ e.preventDefault(); tryDash(); updateHUD(true); });

// ---------------- Choice UI ----------------
let choiceOnPick = null;
function showChoice(heading, sub, cards, isLevelup){
  G.choiceCards = cards;
  $('#stageHead').textContent = heading;
  $('#stageSub').textContent = sub;
  const ctn = $('#selectCards');
  ctn.innerHTML = '';
  for(const c of cards){
    const el = document.createElement('div');
    el.className = 'card '+(c.cls||'');
    el.style.borderColor = c.color||'var(--line)';
    const ic = c.icon;
    const chip = ic
      ? '<div class="chip" style="background:'+(c.color||'#333')+'"><i class="picon" style="background-image:url('+ICON_URL+');background-position:-'+(ic[0]*32)+'px -'+(ic[1]*32)+'px"></i></div>'
      : '<div class="chip" style="background:'+(c.color||'#333')+'">'+(c.iconGlyph||'★')+'</div>';
    el.innerHTML = chip +
      '<div class="cname">'+c.title+'</div>'+
      '<div class="cdesc">'+(c.subtitle||'')+'</div>'+
      (c.meta? '<div class="stat">'+c.meta+'</div>':'');
    el.onclick = ()=>{ if(el.classList.contains('locked')) return; if(c.onPick) c.onPick(); };
    el.classList.add('locked');
    setTimeout(()=>el.classList.remove('locked'), 1200);
    ctn.appendChild(el);
  }
  const masteryPanel = $('#masteryPanel');
  if(isLevelup){
    renderMasteryPanel();
    masteryPanel.hidden = false;
  } else {
    masteryPanel.hidden = true;
  }
  $('#selBackBtn').hidden = true;
  const nextBtn=$('#selNextBtn');
  nextBtn.hidden = true;
  nextBtn.disabled = false;
  nextBtn.textContent = 'NEXT';
  nextBtn.onclick = null;
  const selectScreen=$('#selectScreen');
  selectScreen.classList.toggle('levelupChoice',!!isLevelup);
  selectScreen.hidden = false;
}

function renderMasteryPanel(){
  const m = masteryPoints();
  const el = $('#masteryList');
  el.innerHTML = MASTERIES.map(c=>
    '<div class="masteryRow'+(m[c]>=3?' king':'')+'"><span>'+c+'</span><b>'+m[c]+'</b></div>').join('');
  $('#masteryHint').innerHTML = '3 POINTS IN A TRACK<br>UNLOCKS ITS KING PERK';
}
function hideChoice(){
  const selectScreen=$('#selectScreen');
  selectScreen.hidden = true;
  selectScreen.classList.remove('levelupChoice');
}

// ---------------- Screens ----------------
function setScreen(name){
  hideCardSpecs(true);
  $('#muteBtn').hidden = name!=='menu';
  for(const id of ['menuScreen','selectScreen','customScreen','pauseScreen','endScreen','hubScreen','debugScreen','lbScreen','communityScreen']){
    $('#'+id).hidden = true;
  }
  if(name==='menu'){
    $('#menuScreen').hidden = false;
    updateMenuCredits();
    setRandomHomeSplash();
  }
  if(name==='select') $('#selectScreen').hidden = false;
  if(name==='custom') $('#customScreen').hidden = false;
  if(name==='pause'){ $('#pauseScreen').hidden = false; renderPauseHeroStatus(); renderPauseStats(); }
  if(name==='end') $('#endScreen').hidden = false;
  if(name==='hub') $('#hubScreen').hidden = false;
  if(name==='debug') $('#debugScreen').hidden = false;
  if(name==='lb') $('#lbScreen').hidden = false;
  if(name==='community') $('#communityScreen').hidden = false;
}

function hexColor(n){ return '#'+n.toString(16).padStart(6,'0'); }

// Full portrait art stays on large background / wallpaper-style surfaces.
const HERO_SPLASH_ART = Object.freeze({
  payne:'https://user.uploads.dev/file/abf00196a6b587c0caa1f7463ab8fc5b.jpg',
  bahamut:'https://user.uploads.dev/file/b6137c556e43b23c5dc60adea8fafdb7.jpg',
  val:'https://user.uploads.dev/file/cbfb8b5a3b9554b4ebd5fcf12a314f32.jpg',
  talon:'https://user.uploads.dev/file/879ce1a3b8be6cfca1b2f037d5a3ac75.jpg',
  foxy:'https://user.uploads.dev/file/7463d0276c0591e1d8ec675219b8f811.jpg',
  fang:'https://user.uploads.dev/file/30d951cd03038a7f6380c95db29869a3.jpg',
  grizz:'https://user.uploads.dev/file/cee86febbc98b4ce272023617626168c.jpg',
  mane:'https://user.uploads.dev/file/4b2f87f618526822c947d24a991485c7.jpg',
  raja:'https://user.uploads.dev/file/129fb7271d42f0950023f28b1880e268.jpg',
  rooty:'https://user.uploads.dev/file/a99c2b0f6f3c9e2ec25cafcd3fdce41a.jpg',
  blink:'https://user.uploads.dev/file/e64ae951e19ab4cdfd384abd7e70e266.jpg',
  nikki:'https://user.uploads.dev/file/7933b8de6c4706cf322933b5eab12026.jpg',
  mo:'https://user.uploads.dev/file/173526c32567ba4a35bf2d18e7d2c68c.jpg',
  haze:'https://user.uploads.dev/file/0d3e0d6e282d6ca2af494a8d582ad5ca.jpg',
  porter:'https://user.uploads.dev/file/b113396e062f0bc34e1ef4f889fd3f86.jpg',
  bones:'https://user.uploads.dev/file/b8ee6fb0208e8adc2fb7b95e96f03f2c.jpg',
  mag:'https://user.uploads.dev/file/3520a2c5fcadd72c7d86bf3bb6ec3b13.jpg',
  pulse:'https://user.uploads.dev/file/baf825ae75cfe9bdc7887d8733cf57c4.jpg',
});

// Lightweight paired thumbnails are reserved for repeated grid/card surfaces.
const HERO_THUMB_ART = Object.freeze({
  payne:'https://user.uploads.dev/file/888cceb672c04377e5a08cb9cd61c31c.jpg',
  bahamut:'https://user.uploads.dev/file/853c786f9853ed5232b66cd3632284a9.jpg',
  val:'https://user.uploads.dev/file/fae04829db1ef4292b3377e03123715f.jpg',
  talon:'https://user.uploads.dev/file/17de659e0cb42170fdfcfa68aa370160.jpg',
  foxy:'https://user.uploads.dev/file/1850b2498c661db9d2146d105997b687.jpg',
  fang:'https://user.uploads.dev/file/5ddd4b561590c149807b7e4fd88542e4.jpg',
  grizz:'https://user.uploads.dev/file/4be9c7acd3abb7e345eae7ad61e74d86.jpg',
  mane:'https://user.uploads.dev/file/cf3827b6050f830514d41a39f345c322.jpg',
  raja:'https://user.uploads.dev/file/e7735fe37e00e1812953159c0e32fd14.jpg',
  rooty:'https://user.uploads.dev/file/9a906812a3868f3ca0f2357efce61323.jpg',
  blink:'https://user.uploads.dev/file/6d59670091989c00a76b194f7e6c78e2.jpg',
  nikki:'https://user.uploads.dev/file/70fc5f27c7a5ff5b7d0056d3c7a8647d.jpg',
  mo:'https://user.uploads.dev/file/7b4678258cc9d0b6da858f9bc88afe7c.jpg',
  haze:'https://user.uploads.dev/file/1ea96f4d10194ea6ccda1766366557ce.jpg',
  porter:'https://user.uploads.dev/file/d5fdc6d3f9e074527b8b188b3417340e.jpg',
  bones:'https://user.uploads.dev/file/630b90e15bf7f90eba10580a285e9e3b.jpg',
  mag:'https://user.uploads.dev/file/5123a6206fe526c45f361f4fc393f185.jpg',
  pulse:'https://user.uploads.dev/file/2537a423510e90ef379be264178a605b.jpg',
});
const HERO_SPLASH_IDS = Object.freeze(Object.keys(HERO_SPLASH_ART));

function heroSplashUrl(id){ return HERO_SPLASH_ART[id]||''; }
function heroThumbUrl(id){ return HERO_THUMB_ART[id]||heroSplashUrl(id); }

function heroSplashArtEnabled(){
  return String(SAVE?.mobileGraphicsQuality||'original')!=='verylow';
}
function heroSplashImgHtml(id,cls=''){
  if(!heroSplashArtEnabled()) return '';
  const src=heroSplashUrl(id);
  return src ? '<img class="'+cls+'" src="'+src+'" alt="" loading="lazy" decoding="async">' : '';
}
function heroThumbImgHtml(id,cls=''){
  if(!heroSplashArtEnabled()) return '';
  const src=heroThumbUrl(id);
  return src ? '<img class="'+cls+'" src="'+src+'" alt="" loading="lazy" decoding="async">' : '';
}
function heroSplashFallbackHtml(id,cls='heroSplashIconFallback'){
  const hero=CHARACTERS.find(c=>c.id===id);
  if(!hero) return '';
  return '<div class="'+cls+'" style="--hero-color:'+hexColor(hero.color??0x8a95a5)+'">'+(hero.icon||'🐰')+'</div>';
}
function heroCardVisualHtml(id,icon,col){
  if(heroSplashArtEnabled() && heroThumbUrl(id)){
    return '<div class="heroSplashThumb">'+heroThumbImgHtml(id)+'</div>';
  }
  return '<div class="chip" style="background:'+col+'">'+(icon||'🐰')+'</div>';
}
function setRandomHomeSplash(){
  const box=$('#homeHeroSplash');
  if(!box || !HERO_SPLASH_IDS.length) return;
  let id=HERO_SPLASH_IDS[(Math.random()*HERO_SPLASH_IDS.length)|0];
  if(HERO_SPLASH_IDS.length>1 && box.dataset.hero===id){
    const i=(HERO_SPLASH_IDS.indexOf(id)+1+((Math.random()*(HERO_SPLASH_IDS.length-1))|0))%HERO_SPLASH_IDS.length;
    id=HERO_SPLASH_IDS[i];
  }
  box.dataset.hero=id;
  box.innerHTML=(heroSplashArtEnabled() && heroSplashUrl(id))
    ? heroSplashImgHtml(id)
    : heroSplashFallbackHtml(id,'homeHeroIconFallback');
}
function renderPauseHeroSplash(){
  const box=$('#pauseHeroSplash');
  if(!box) return;
  const id=G.char?.id||G.sel?.char||'';
  const hero=CHARACTERS.find(c=>c.id===id);
  box.hidden=!hero;
  if(!hero){ box.innerHTML=''; return; }
  box.innerHTML=(heroSplashArtEnabled() && heroSplashUrl(id))
    ? heroSplashImgHtml(id)
    : heroSplashFallbackHtml(id);
}

function pauseLiveDamageReduction(h){
  if(!h) return 0;
  let taken=1-Math.min(RUN_STAT_CAPS.armor,Math.max(0,Number(h.mods?.armor)||0));
  const hpRatio=clamp((Number(h.hp)||0)/Math.max(1,Number(h.maxHp)||1),0,1);
  if(h.grizzResolve && hpRatio<0.70){
    const woundedDR=0.42*clamp((0.70-hpRatio)/0.70,0,1);
    taken*=1-woundedDR;
  }
  if((h.grizzGuardT||0)>0) taken*=0.70;
  if(G.char?.id==='raja' && (h.tigerFrenzyT||0)>0) taken*=0.90;
  return clamp(1-taken,0,0.99);
}
function pauseStatCapMeta(value,cap,fmt){
  const atCap=value>=cap-0.0005;
  return (atCap?'MAX ':'CAP ')+fmt(cap);
}
// HERO STATUS on the pause screen: the same identity card the hero-select screen shows
// (role / passive / Super / baseline), PLUS a LIVE NOW grid of the values this run has actually
// calculated. The reason both exist in one place is damage: the baseline says what the hero is
// built with ("WEAPON DMG ×1.12") while LIVE NOW says what one shot is actually worth right now
// ("SHOT DMG 22.4 · BASE 20"). Every number here is read from the running hero, never the sheet.
function renderPauseHeroStatus(){
  const panel=$('#pauseHeroStatusPanel'), box=$('#pauseHeroStatusBody');
  const h=G.hero;
  if(!panel||!box) return;
  const hero=CHARACTERS.find(c=>c.id===(G.char?.id||G.sel?.char||''));
  if(!hero||!h){ panel.hidden=true; return; }
  panel.hidden=G.state!=='paused';
  if(panel.hidden) return;

  const d=HERO_DETAIL_SHEETS[hero.id]||{};
  const title=$('#pauseHeroStatusTitle');
  if(title) title.textContent='HERO STATUS · '+hero.name+' · PASSIVE / ULT';
  const gun=G.gun||{};
  const num=(v,dg=1)=>Number(v||0).toFixed(dg).replace(/\.0$/,'');
  const pct=v=>Math.round(Math.max(0,v)*100)+'%';
  const liveShot=computeBulletDamage(true);
  const baseShot=Number(gun.dmg)||0;
  const dmgMod=Number(h.mods?.dmg)||1;
  const stationary=Number(h.mods?.stationary)||0;
  const totalProj=(Number(gun.proj)||1)+(Number(h.mods?.proj)||0);
  const fireInterval=Math.max(0.001,(Number(gun.fire)||0)*(Number(h.mods?.fire)||1));
  const dps=liveShot*totalProj/fireInterval;
  const liveDR=pauseLiveDamageReduction(h);
  const crit=Math.min(RUN_STAT_CAPS.crit,Math.max(0,Number(h.mods?.crit)||0));
  const moveSpeed=HERO_BASE.speed*(Number(h.mods?.speed)||1)*(Number(gun.moveMul)||1);
  const superUnlimited=!!G.char?.unlimitedSuper;
  const superValue=superUnlimited
    ? num(h.super?.chargeMax||0,2)+'s CD'
    : Math.max(0,Math.floor(h.super?.uses||0))+'/'+Math.max(0,Math.floor(h.super?.maxUses||0));
  const superMeta=superUnlimited
    ? ((h.super?.chargeMax||0)<=RUN_STAT_CAPS.unlimitedSuperCooldownMin+0.001?'MIN ':'FLOOR ')+num(RUN_STAT_CAPS.unlimitedSuperCooldownMin,1)+'s'
    : 'SUPER STOCK';
  const superNow=superUnlimited
    ? ('RECHARGE '+num(h.super?.chargeMax||0,2)+'s · '+superMeta)
    : (superValue+' STOCK LEFT');
  const stock=hero.unlimitedSuper
    ? 'UNLIMITED USES · BASE RECHARGE '+hero.superCharge+'s'
    : 'BASE STOCK '+hero.superUses+' · BASE CHARGE '+hero.superCharge+'s';

  const tag=hero.apex?'<span class="phsTag op">APEX / OP</span>':'<span class="phsTag">BUNNY</span>';
  const tile=(label,value,meta)=>'<div class="pauseStat"><div class="pauseStatLabel">'+label+'</div><div class="pauseStatValue">'+value+'</div><div class="pauseStatMeta">'+meta+'</div></div>';
  const live=[
    tile('SHOT DMG',num(liveShot,1),(stationary>0?('+'+num(stationary,0)+' STILL · '):'')+'BASE '+num(baseShot,1)+' · ×'+num(dmgMod,2)),
    tile('SHOT DPS',num(dps,1),'SHOT × '+totalProj+' × '+num(1/fireInterval,2)+'/s'),
    tile('HP',Math.ceil(h.hp)+' / '+Math.ceil(h.maxHp),'CURRENT / MAX'),
    tile('DR',pct(liveDR),'LIVE REDUCTION'),
    tile('CRIT',pct(crit),'CHANCE'),
    tile('MOVE',num(moveSpeed,1),'UNITS / s'),
    tile('FIRE RATE',num(1/fireInterval,2)+'/s',num(fireInterval,2)+'s INTERVAL'),
    tile('SUPER',superValue,superMeta),
  ].join('');

  box.innerHTML=[
    '<div class="phsRoleRow">'+tag+'<span class="phsRole">'+uxCopy(d.role||'HERO')+'</span></div>',
    '<div class="phsSection"><div class="phsSectionTitle">PASSIVE / IDENTITY</div><div class="phsBody">'+uxCopy(d.passive||hero.passiveDesc||'—')+'</div></div>',
    (d.mechanics?'<div class="phsSection"><div class="phsSectionTitle">'+uxCopy(d.mechanicsTitle||'MECHANICS')+'</div><div class="phsBody">'+uxCopy(d.mechanics)+'</div></div>':''),
    '<div class="phsSection phsSuperSection"><div class="phsSectionTitle">SUPER · '+uxCopy(hero.superName||'SUPER')+'</div><div class="phsBody">'+uxCopy(d.super||hero.superDesc||'—')+'</div><div class="phsFoot">'+uxCopy(stock)+' · NOW '+superNow+'</div></div>',
    '<div class="phsSection"><div class="phsSectionTitle">BASELINE (ORIGINAL)</div><div class="phsBody strong">'+uxCopy(d.stats||'HP 60 · STANDARD BASELINE')+'</div></div>',
    '<div class="phsSection"><div class="phsSectionTitle">LIVE NOW · CALCULATED THIS RUN</div><div id="pauseHeroLiveGrid">'+live+'</div></div>',
  ].join('');
}
function renderPauseStats(){
  const panel=$('#pauseStatsPanel'),grid=$('#pauseStatsGrid'),note=$('#pauseStatsNote');
  const h=G.hero;
  if(!panel||!grid||!h||!G.gun){
    if(panel) panel.hidden=true;
    return;
  }
  panel.hidden=G.state!=='paused';
  if(panel.hidden) return;

  const pct=v=>Math.round(Math.max(0,v)*100)+'%';
  const num=(v,d=1)=>Number(v).toFixed(d).replace(/\.0$/,'');
  const armor=Math.min(RUN_STAT_CAPS.armor,Math.max(0,Number(h.mods.armor)||0));
  const liveDR=pauseLiveDamageReduction(h);
  const dodge=Math.min(RUN_STAT_CAPS.dodge,Math.max(0,Number(h.mods.dodge)||0));
  const crit=Math.min(RUN_STAT_CAPS.crit,Math.max(0,Number(h.mods.crit)||0));
  const magnet=Math.min(RUN_STAT_CAPS.magnetRadius,50+(Number(h.mods.magnet)||0));
  const projStacks=Math.min(RUN_STAT_CAPS.projectileBonus,Math.max(0,Number(h.mods.projStacks)||0));
  const totalProj=(Number(G.gun.proj)||1)+(Number(h.mods.proj)||0);
  const spinners=Math.min(RUN_STAT_CAPS.spinners,Math.max(0,Number(h.spinners)||0));
  const moveSpeed=HERO_BASE.speed*(Number(h.mods.speed)||1)*(Number(G.gun.moveMul)||1);
  const fireInterval=Math.max(0.001,(Number(G.gun.fire)||0)*(Number(h.mods.fire)||1));
  const reloadTime=Math.max(0,(Number(G.gun.reload)||0)*(Number(h.mods.reload)||1));
  const shotDamage=computeBulletDamage(true);
  const stationary=Number(h.mods.stationary)||0;
  const superUnlimited=!!G.char?.unlimitedSuper;
  const superValue=superUnlimited
    ? num(h.super?.chargeMax||0,2)+'s CD'
    : Math.max(0,Math.floor(h.super?.uses||0))+'/'+Math.max(0,Math.floor(h.super?.maxUses||0));
  const superMeta=superUnlimited
    ? ((h.super?.chargeMax||0)<=RUN_STAT_CAPS.unlimitedSuperCooldownMin+0.001?'MIN ':'FLOOR ')+num(RUN_STAT_CAPS.unlimitedSuperCooldownMin,1)+'s'
    : 'SUPER STOCK';

  const rows=[
    ['HP',Math.ceil(h.hp)+' / '+Math.ceil(h.maxHp),'MAX '+Math.ceil(h.maxHp),h.hp>=h.maxHp-0.001],
    ['SHIELD',Math.ceil(h.shield||0)+' / '+Math.ceil(h.maxShield||0),(h.shieldRegen?'REGENERATING':'CURRENT / MAX'),false],
    ['WEAPON DMG',num(shotDamage,1),(stationary>0?('+'+num(stationary,0)+' STATIONARY · '):'')+'BASE '+num(G.gun.dmg,1)+' · ×'+num(h.mods.dmg||1,2),false],
    ['CRIT',pct(crit),pauseStatCapMeta(crit,RUN_STAT_CAPS.crit,pct),crit>=RUN_STAT_CAPS.crit-0.0005],
    ['DR',pct(liveDR),(liveDR>armor+0.001?'ARMOR '+pct(armor)+' · ':'')+pauseStatCapMeta(armor,RUN_STAT_CAPS.armor,pct),armor>=RUN_STAT_CAPS.armor-0.0005],
    ['DODGE',pct(dodge),pauseStatCapMeta(dodge,RUN_STAT_CAPS.dodge,pct),dodge>=RUN_STAT_CAPS.dodge-0.0005],
    ['MOVE',num(moveSpeed,1),'BASE RUN SPEED',false],
    ['FIRE RATE',num(1/fireInterval,2)+'/s',num(fireInterval,2)+'s INTERVAL',false],
    ['RELOAD',num(reloadTime,2)+'s','CURRENT',false],
    ['PROJECTILES',String(totalProj),'×'+(projStacks+1)+' VOLLEY'+(projStacks>=RUN_STAT_CAPS.projectileBonus?' · MAX':' · '+projStacks+'/'+RUN_STAT_CAPS.projectileBonus+' UPGRADES'),projStacks>=RUN_STAT_CAPS.projectileBonus],
    ['AMMO',Math.floor(h.ammo||0)+' / '+Math.floor(h.maxAmmo||0),'CURRENT / MAX',false],
    ['KNOCKBACK','×'+num(h.mods.kb||1,2),'WEAPON MOD',false],
    ['POISON','×'+num(h.mods.poison||1,2),POISON_MAX_STACKS+' STACK CAP · % OF MAX HP · 10% SLOW',false],
    ['FIRE','×'+num(h.mods.fire||1,2),FIRE_MAX_STACKS+' STACK CAP · NEVER GOES OUT',false],
    ['SUMMON','×'+num(h.mods.summon||1,2),'DAMAGE MOD',false],
    ['MAGNET',num(magnet,0),pauseStatCapMeta(magnet,RUN_STAT_CAPS.magnetRadius,v=>num(v,0)),magnet>=RUN_STAT_CAPS.magnetRadius-0.001],
    ['LIGHT',num(h.lightRadius||74,0),'COMBAT RADIUS',false],
    ['SPIN ORBS',spinners+' / '+RUN_STAT_CAPS.spinners,(spinners>=RUN_STAT_CAPS.spinners?'MAX':'CAP '+RUN_STAT_CAPS.spinners),spinners>=RUN_STAT_CAPS.spinners],
    ['SUPER',superValue,superMeta,superUnlimited&&(h.super?.chargeMax||0)<=RUN_STAT_CAPS.unlimitedSuperCooldownMin+0.001],
  ];

  // Show FLEX repeat state only when it adds information beyond the live stat above.
  // Finite repeaters always show their pickup cap; uncapped repeaters appear after the
  // second copy so players can see how many times a trade/recovery perk was actually taken.
  for(const [id,limit] of Object.entries(LATE_REPEAT_LIMITS)){
    const stacks=repeatPerkStackCount(id);
    if(stacks<=0 || limit<=1) continue;
    const p=PERKS.find(x=>x.id===id);
    if(Number.isFinite(limit)){
      const atMax=stacks>=limit;
      rows.push([
        (p?.name||id).toUpperCase()+' STACK',
        stacks+' / '+limit,
        atMax?'MAX':'PICKUP CAP '+limit,
        atMax
      ]);
    }else if(stacks>1){
      rows.push([
        (p?.name||id).toUpperCase()+' STACK',
        '×'+stacks,
        'NO PICKUP CAP',
        false
      ]);
    }
  }

  grid.innerHTML=rows.map(([label,value,meta,isMax])=>
    '<div class="pauseStat'+(isMax?' isMax':'')+'">'+
      '<div class="pauseStatLabel">'+label+'</div>'+
      '<div class="pauseStatValue">'+value+'</div>'+
      '<div class="pauseStatMeta">'+meta+'</div>'+
    '</div>'
  ).join('');

  if(note){
    const stacks=Object.entries(G.perkStacks||{}).filter(([,n])=>Number(n)>1).length;
    note.textContent=stacks
      ? 'LIVE RUN VALUES · '+stacks+' PERK'+(stacks===1?'':'S')+' CURRENTLY STACKED'
      : 'LIVE RUN VALUES · HARD / REPEAT CAPS ARE MARKED';
  }
}
function showHeroUnlockReveal(id){
  const hero=CHARACTERS.find(c=>c.id===id);
  const ov=$('#heroUnlockReveal');
  if(!hero || !ov) return;
  const img=$('#heroUnlockImg'), fallback=$('#heroUnlockFallback'), name=$('#heroUnlockName');
  const src=heroSplashUrl(id);
  const useArt=heroSplashArtEnabled() && !!src;
  if(img){
    img.hidden=!useArt;
    if(useArt) img.src=src;
    else img.removeAttribute('src');
  }
  if(fallback){
    fallback.hidden=useArt;
    fallback.style.setProperty('--hero-color',hexColor(hero.color??0x8a95a5));
    fallback.textContent=hero.icon||'🐰';
  }
  if(name) name.textContent=hero.name;
  ov.hidden=false;
}
function closeHeroUnlockReveal(){
  const ov=$('#heroUnlockReveal');
  if(ov) ov.hidden=true;
}

let cardPreviewRuntime=null;
function disposePreviewScene(rt){
  if(!rt?.scene) return;
  const oldScene=G.scene;
  G.scene=rt.scene;
  for(const child of [...rt.scene.children]){
    if(child.userData?._previewKeep) continue;
    sceneRemove(child);
  }
  G.scene=oldScene;
  rt.scene=null;
  rt.root=null;
  rt.heroId='';
}
function buildHeroPreviewScene(cid){
  const hero=CHARACTERS.find(c=>c.id===cid);
  if(!hero) return null;
  const scene=new THREE.Scene();
  const markKeep=o=>{ o.userData=o.userData||{}; o.userData._previewKeep=true; return o; };
  scene.add(markKeep(new THREE.AmbientLight(0xffffff,1.05)));
  scene.add(markKeep(new THREE.HemisphereLight(0xaecbff,0x101722,0.85)));
  const key=markKeep(new THREE.DirectionalLight(0xffffff,1.10)); key.position.set(48,72,68); scene.add(key);
  const rim=markKeep(new THREE.DirectionalLight(0x79d4ff,0.42)); rim.position.set(-55,26,-45); scene.add(rim);
  const floor=markKeep(new THREE.Mesh(new THREE.CircleGeometry(18,32), new THREE.MeshBasicMaterial({color:0x111826,transparent:true,opacity:0.9,depthWrite:false})));
  floor.rotation.x=-Math.PI/2; floor.position.y=0.02; scene.add(floor);
  const oldScene=G.scene;
  G.scene=scene;
  const skinId=hero.apex?(selectedHeroSkin(hero.id)?.id||null):null;
  let mesh = hero.dragon ? buildPlayableBahamutMesh(skinId) : (hero.bird ? buildBirdMesh(skinId) : (hero.beast ? buildBeastMesh(hero.id,skinId) : buildHeroMesh(hero.id)));
  G.scene=oldScene;
  if(hero.scale && !hero.dragon) mesh.scale.setScalar(hero.scale);
  if(mesh.userData?.gun) mesh.userData.gun.visible=false;
  const box=new THREE.Box3().setFromObject(mesh);
  const size=new THREE.Vector3();
  const center=new THREE.Vector3();
  box.getSize(size); box.getCenter(center);
  mesh.position.x -= center.x;
  mesh.position.z -= center.z;
  mesh.position.y -= box.min.y;
  const root=new THREE.Group();
  scene.remove(mesh); root.add(mesh); scene.add(root);
  return {scene,root,size};
}
function ensureCardPreviewRuntime(){
  if(cardPreviewRuntime) return cardPreviewRuntime;
  const wrap=document.createElement('div'); wrap.className='specPreview';
  const viewport=document.createElement('div'); viewport.className='specPreviewViewport';
  const ctrls=document.createElement('div'); ctrls.className='specPreviewBtns';
  ctrls.innerHTML='<button class="previewPoseBtn active" type="button" data-pose="turn">TURN</button><button class="previewPoseBtn" type="button" data-pose="front">FRONT</button><button class="previewPoseBtn" type="button" data-pose="back">BACK</button>';
  wrap.append(viewport,ctrls);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,premultipliedAlpha:true});
  renderer.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1));
  renderer.setSize(238,170,false);
  renderer.setClearColor(0x000000,0);
  renderer.domElement.style.width='100%';
  renderer.domElement.style.height='100%';
  viewport.appendChild(renderer.domElement);
  const camera=new THREE.OrthographicCamera(-32,32,24,-24,0.1,500);
  camera.position.set(0,18,90);
  const rt=cardPreviewRuntime={wrap,viewport,ctrls,renderer,camera,scene:null,root:null,mode:'turn',angle:0,heroId:''};
  ctrls.addEventListener('click',ev=>{
    const btn=ev.target.closest('.previewPoseBtn');
    if(!btn) return;
    rt.mode=btn.dataset.pose||'turn';
    for(const b of ctrls.querySelectorAll('.previewPoseBtn')) b.classList.toggle('active', b===btn);
  });
  const tick=()=>{
    requestAnimationFrame(tick);
    if(!rt.wrap.isConnected || rt.wrap.hidden || !rt.scene || !rt.root) return;
    if(rt.mode==='turn') rt.angle=(rt.angle+0.012)%(Math.PI*2);
    else if(rt.mode==='front') rt.angle=0;
    else if(rt.mode==='back') rt.angle=Math.PI;
    rt.root.rotation.y=rt.angle;
    renderer.render(rt.scene,rt.camera);
  };
  tick();
  return rt;
}
function mountCardPreview(pop,it){
  const rt=ensureCardPreviewRuntime();
  if(!it?.previewHero){ rt.wrap.remove(); return; }
  disposePreviewScene(rt);
  const built=buildHeroPreviewScene(it.previewHero);
  if(!built){ rt.wrap.remove(); return; }
  rt.scene=built.scene;
  rt.root=built.root;
  rt.heroId=it.previewHero;
  rt.mode='turn';
  rt.angle=0;
  for(const b of rt.ctrls.querySelectorAll('.previewPoseBtn')) b.classList.toggle('active', b.dataset.pose==='turn');
  const aspect=238/170;
  const frame=Math.max(13, built.size.y*0.66, built.size.x*0.52, built.size.z*0.52);
  rt.camera.left=-frame*aspect; rt.camera.right=frame*aspect; rt.camera.top=frame; rt.camera.bottom=-frame;
  rt.camera.position.set(0,Math.max(14,built.size.y*0.52),90);
  rt.camera.lookAt(0,Math.max(11,built.size.y*0.44),0);
  rt.camera.updateProjectionMatrix();
  // Keep the sticky header compact. The 3D preview is document content, not part of
  // the header row; putting it beside the title makes the flex row huge and crushes names.
  const top=pop.querySelector('.specTop');
  if(top) top.insertAdjacentElement('afterend',rt.wrap);
}
function refreshFangWolfPackVisuals(){
  if(G.char?.id!=='fang' || !Array.isArray(G.summons)) return;
  const palette=G.heroSkin?.palette || selectedHeroSkin('fang')?.palette || null;

  for(const s of G.summons){
    if(s.kind!=='dog' || !s.alive || !s.wolf || s.boneDog || !s.mesh) continue;

    const old=s.mesh;
    const pos=old.position.clone();
    const rot=old.rotation.clone();
    const scale=old.scale.clone();
    const visible=old.visible;

    sceneRemove(old);
    const mesh=buildCanineMesh(true,'normal',palette);
    mesh.position.copy(pos);
    mesh.rotation.copy(rot);
    mesh.scale.copy(scale);
    mesh.visible=visible;
    sceneAdd(mesh);
    s.mesh=mesh;
  }
}

function rebuildCurrentHeroVisual(){
  if(!G.hero || !G.char?.apex || !G.heroMesh) return;
  const oldMesh=G.heroMesh;
  const oldPos=oldMesh.position.clone();
  const oldRot=oldMesh.rotation.y;
  const oldVis=oldMesh.visible;
  sceneRemove(oldMesh);
  const skin=selectedHeroSkin(G.char.id);
  G.heroSkin=skin;
  const skinId=skin?.id||null;
  const hm = G.char.dragon ? buildPlayableBahamutMesh(skinId) : (G.char.bird ? buildBirdMesh(skinId) : buildBeastMesh(G.char.id,skinId));
  hm.position.copy(oldPos);
  hm.rotation.y=oldRot;
  if(G.char.scale && !G.char.dragon) hm.scale.setScalar(G.char.scale);
  hm.visible=oldVis;
  configureHeroHeldWeapon(hm,G.gun);
  G.heroMesh=hm;
  G.hero.mesh=hm;
  if(G.char?.id==='fang') refreshFangWolfPackVisuals();
  updateVig();
}
function renderPauseSkinPanel(){
  const panel=$('#pauseSkinPanel'), ctn=$('#pauseSkinCtn');
  if(!panel || !ctn) return;
  if(!(G.state==='paused' && G.hero && G.char?.apex)){
    panel.hidden=true; ctn.innerHTML='';
    return;
  }
  panel.hidden=false;
  ctn.innerHTML=heroSkinPickerHtml(G.char.id);
  for(const btn of ctn.querySelectorAll('.skinChevron')){
    btn.addEventListener('click',ev=>{
      ev.preventDefault(); ev.stopPropagation();
      const next=cycleHeroSkin(G.char.id, Number(btn.dataset.skinDir)||1);
      if(!next) return;
      rebuildCurrentHeroVisual();
      renderPauseSkinPanel();
      AUD.ui();
    });
  }
}

let cardSpecHideTimer=0;
function ensureCardSpecPopover(){
  let pop=document.getElementById('cardSpecPopover');
  if(pop) return pop;
  const backdrop=document.createElement('div');
  backdrop.id='cardSpecBackdrop';
  backdrop.hidden=true;
  backdrop.addEventListener('pointerdown',ev=>{ ev.preventDefault(); ev.stopPropagation(); });
  backdrop.addEventListener('click',ev=>{ ev.preventDefault(); ev.stopPropagation(); });
  document.body.appendChild(backdrop);
  pop=document.createElement('div');
  pop.id='cardSpecPopover';
  pop.setAttribute('role','dialog');
  pop.setAttribute('aria-modal','true');
  pop.hidden=true;
  pop.addEventListener('mouseenter',()=>clearTimeout(cardSpecHideTimer));
  pop.addEventListener('mouseleave',()=>{
    if(pop.dataset.pinned!=='1') cardSpecHideTimer=setTimeout(()=>hideCardSpecs(false),150);
  });
  document.body.appendChild(pop);
  return pop;
}
function hideCardSpecs(force=false){
  clearTimeout(cardSpecHideTimer);
  const pop=document.getElementById('cardSpecPopover');
  if(!pop || (!force && pop.dataset.pinned==='1')) return;
  pop.hidden=true; pop.dataset.pinned='0'; pop._anchor=null;
  const backdrop=document.getElementById('cardSpecBackdrop');
  if(backdrop) backdrop.hidden=true;
  cardPreviewRuntime?.wrap.remove();
}
function showCardSpecs(anchor,it,pin=false){
  if(!it?.details) return;
  clearTimeout(cardSpecHideTimer);
  const pop=ensureCardSpecPopover();
  const details=typeof it.details==='function'?it.details():it.details;
  pop.innerHTML='<div class="specTop"><div class="specHead" data-no-translate>'+it.title+'</div><button class="specDismiss" type="button" aria-label="Dismiss info">DISMISS ×</button></div>'+details;
  pop.querySelector('.specDismiss')?.addEventListener('click',ev=>{ ev.preventDefault(); ev.stopPropagation(); hideCardSpecs(true); AUD.ui(); });
  mountCardPreview(pop,it);

  // For Apex heroes, skin choice belongs directly under the 3D showcase/pose controls.
  if(it.previewHero && heroSkinList(it.previewHero).length){
    const preview=pop.querySelector('.specPreview');
    if(preview) preview.insertAdjacentHTML('afterend',heroSkinPickerHtml(it.previewHero));
  }

  pop.hidden=false; pop.dataset.pinned=pin?'1':'0'; pop._anchor=anchor;
  pop.setAttribute('aria-modal',pin?'true':'false');
  const backdrop=document.getElementById('cardSpecBackdrop');
  if(backdrop) backdrop.hidden=!pin;
  for(const btn of pop.querySelectorAll('.skinChevron')){
    btn.addEventListener('click',ev=>{
      ev.preventDefault(); ev.stopPropagation();
      const hero=btn.closest('.skinBlock')?.dataset.skinHero;
      if(!hero) return;
      const next=cycleHeroSkin(hero,Number(btn.dataset.skinDir)||1);
      if(!next) return;
      const col=hexColor(next.palette?.body??CHARACTERS.find(c=>c.id===hero)?.color??0x888888);
      const chip=anchor.querySelector('.chip'); if(chip) chip.style.background=col;
      if(G.sel.char===hero){ anchor.style.borderColor=col; anchor.style.outline='2px solid '+col; }
      showCardSpecs(anchor,it,pop.dataset.pinned==='1');
      AUD.ui();
    });
  }
  const r=anchor.getBoundingClientRect();
  const mobile=isCoarse() || innerWidth<680;
  const w=mobile
    ? Math.min(440,Math.max(280,innerWidth-20))
    : Math.min(620,Math.max(480,innerWidth-32));
  pop.style.width=w+'px';
  const h=Math.min(pop.offsetHeight,innerHeight-20);
  let left,top;
  if(mobile){
    left=(innerWidth-w)/2;
    top=7;
  }else{
    left=r.left+r.width/2-w/2;
    left=Math.max(10,Math.min(innerWidth-w-10,left));
    top=r.bottom+8;
    if(top+h>innerHeight-10) top=Math.max(10,r.top-h-8);
  }
  pop.style.left=Math.round(left)+'px'; pop.style.top=Math.round(top)+'px';
}

function renderGroup(ctn, items, key, onpick){
  hideCardSpecs(true);
  ctn.innerHTML = '';
  for(const it of items){
    const el = document.createElement('div');
    const useHeroArt=!!(it.previewHero&&heroSplashArtEnabled()&&heroThumbUrl(it.previewHero));
    el.className = 'card '+(it.cls||'')+(it.locked?' locked':'')+(it.details?' hasDetails':'')+(useHeroArt?' heroArtCard':'');
    const col = hexColor(it.color);
    const sel = G.sel[key]===it.id;
    el.style.borderColor = sel ? col : 'var(--line)';
    el.style.outline = sel ? '2px solid '+col : 'none';
    el.innerHTML =
      (useHeroArt
        ? '<div class="heroSplashThumb">'+heroThumbImgHtml(it.previewHero)+'</div>'
        : '')+
      '<div class="chip" style="background:'+col+'">'+(it.icon||'?')+'</div>'+ 
      (it.op ? '<div class="opBadge">OP</div>' : '')+
      (it.details && !it.locked ? '<button class="cardInfoBtn" type="button" aria-label="Open '+it.title+' info and 3D preview" title="INFO / 3D PREVIEW">ⓘ</button>' : '')+
      '<div class="cname" data-no-translate>'+it.title+'</div>'+ 
      '<div class="cdesc">'+uxCopy(it.subtitle||'')+'</div>'+ 
      (it.locked ? '<div class="stat" style="color:var(--gold)">🔒 '+(it.lockText||'LOCKED')+'</div>'
        : (it.meta? '<div class="stat">'+uxCopy(it.meta)+'</div>':''))+
      (sel? '<div class="picked">✓</div>':'');
    if(it.details && !it.locked){
      // Specs/3D preview are explicit only. Desktop hover must never cover the card the
      // player is trying to select, and touch has no accidental hover state to fight.
      const info=el.querySelector('.cardInfoBtn');
      info?.addEventListener('click',ev=>{
        ev.preventDefault(); ev.stopPropagation();
        showCardSpecs(el,it,true);
        AUD.ui();
      });
    }
    if(!it.locked) el.onclick = ()=>{
      hideCardSpecs(true);
      G.sel[key]=it.id;
      if(key==='gun') G.sel.gunPicked=true;
      renderCustomize();
      AUD.ui();
      if(onpick) onpick(it);
      persistLastSelection();
    };
    ctn.appendChild(el);
  }
}

function grantVulpine(){
  if(!SAVE.guns.includes('vulpine')) SAVE.guns.push('vulpine');
}
function renderVendingLoadout(){
  const ctn=$('#ccVending');
  const hint=$('#ccVendingHint');
  if(!ctn) return;
  ctn.innerHTML='';
  if(hint) hint.textContent=SAVE.vendingEquipped.length+'/'+VENDING_EQUIP_LIMIT+' EQUIPPED · REMEMBERED FOR YOUR NEXT RUN · COPIES SPENT ONLY IF YOU USE THEM';
  for(const it of HUB_SHOP.vending){
    const stock=vendingStock(it.id);
    const equipped=equipsVending(it.id);
    const el=document.createElement('div');
    el.className='card equipCard'+(stock?'':' locked')+(equipped?' equipped':'');
    const col=hexColor(it.color);
    el.style.borderColor=equipped?col:'var(--line)';
    el.style.outline=equipped?'2px solid '+col:'none';
    el.innerHTML=
      '<div class="chip" style="background:'+col+'">'+it.icon+'</div>'+
      '<div class="cname" data-no-translate>'+it.name+'</div>'+
      '<div class="cdesc">'+uxCopy(it.desc)+'</div>'+
      (equipped
        ? '<div class="stat equipState">EQUIPPED · STOCK ×'+stock+'</div>'
        : stock
          ? '<div class="stat">STOCK ×'+stock+' · TAP TO EQUIP</div>'
          : '<div class="stat" style="color:var(--gold)">NO STOCK · BUY IN HUB</div>');
    if(stock){
      el.onclick=()=>{
        if(!toggleVendingEquip(it.id)){
          if(hint) hint.textContent=VENDING_EQUIP_LIMIT+'/'+VENDING_EQUIP_LIMIT+' EQUIPPED · UNEQUIP ONE ITEM FIRST';
          AUD.empty();
          return;
        }
        AUD.ui();
        renderVendingLoadout();
      };
    }
    ctn.appendChild(el);
  }
}

let customTab='hero';
function syncCustomTabs(){
  document.querySelectorAll('#customTabs .segBtn').forEach(b=>b.classList.toggle('active', b.dataset.t===customTab));
  document.querySelectorAll('#customScroll .customGroup').forEach(g=>{
    g.hidden = g.dataset.customTab!==customTab;
  });
  const sc=$('#customScroll'); if(sc) sc.scrollTop=0;
}
function renderCustomize(){
  const mapHero = c=>({
    id:c.id, color:(c.apex?(selectedHeroSkin(c.id)?.palette?.body??c.color):c.color), icon:c.icon||'🐰', title:c.name, subtitle:c.passiveDesc, op:c.op,
    meta:(c.unlimitedSuper?'SKILL · ':'ULT · ')+c.superName,
    skinHero:c.apex?c.id:null,
    previewHero:c.id,
    details:()=>heroDetailsHtml(c),
    locked:!ownsHero(c.id),
    lockText:c.id==='bahamut' && !bahamutPurchaseUnlocked()
      ? 'LOCKED · DEFEAT BAHAMUT AND WIN'
      : 'BUY IN HUB · '+(c.price||HERO_PRICE)+' CR',
  });
  const onHeroPick = c=>{
    // FOXY selection equips WILD-FOX unless a gun was explicitly chosen.
    if(c.id==='foxy' && !G.sel.gunPicked){
      grantVulpine();
      G.sel.gun = 'vulpine';
      renderCustomize();
    }
  };
  renderGroup($('#ccChar'), CHARACTERS.filter(c=>!c.apex).map(mapHero), 'char', onHeroPick);
  renderGroup($('#ccBeast'), CHARACTERS.filter(c=>c.apex).map(mapHero), 'char', onHeroPick);
  renderGroup($('#ccGun'), GUNS.map(g=>{
    const rangeLabel = g.special.includes('long')?'LONG':g.special.includes('mid')?'MID':'SHORT';
    return {
      id:g.id, color:g.color, icon:weaponIcon(g), title:g.name, cls:'gunCard', subtitle:gunCardSubtitle(g), op:g.op,
      meta:gunMetaHtml(g),
      details:g.op ? (()=>gunDetailsHtml(g)) : null,
      locked:!ownsGun(g.id), lockText:'BUY IN HUB · '+(g.price||GUN_PRICE)+' CR',
    };
  }), 'gun');
  renderGroup($('#ccGem'), GEMS.map(g=>({
    id:g.id, color:g.color, icon:'💎', title:g.name, subtitle:g.desc,
    locked:!ownsGem(g.id), lockText:'BUY IN HUB · '+GEM_PRICE+' CR',
  })), 'gem');
  renderVendingLoadout();
  renderGroup($('#ccMusic'), MUSIC.map(m=>({
    id:m.id, color:m.id==='random'?0xffd166:(m.url?0x4fc3ff:0x75869a), icon:m.id==='random'?'🎲':'♪', title:m.name, subtitle:m.desc,
  })), 'music', it=>{ AUD.init(); AUD.resume(); AUD.playTrack(it.id); });
}

function showCustomize(){
  setScreen('custom');
  renderCustomize();
  syncCustomTabs();
}

// ---------------- Menu ----------------
// RudBo cheat codes — type in the menu's CHEAT CODE field.
const CHEAT_CODES = {
  'RudBo': { credits:10000, msg:'+10,000 CREDITS DEPOSITED' },
  'RudBo100': { credits:100000, msg:'+100,000 CREDITS DEPOSITED' },
  'ILoveFurry': { credits:100000000, msg:'+100,000,000 CREDITS DEPOSITED' },
  'FurAI': { dragon:true, msg:'🐉 PLAYABLE BAHAMUT UNLOCKED' },
  'AIFurryGen': { dragon:true, msg:'🐉 PLAYABLE BAHAMUT UNLOCKED' },
};
function enterCheatCode(){
  const inp = $('#cheatInput'); if(!inp) return;
  const code = inp.value.trim();
  const matchedCode = Object.keys(CHEAT_CODES).find(k=>k.toLowerCase()===code.toLowerCase());
  const c = matchedCode ? CHEAT_CODES[matchedCode] : null;
  const msgEl = $('#cheatMsg');
  if(c){
    if(c.dragon){
      const already=SAVE.heroes.includes('bahamut');
      SAVE.bahamutCleared=true;
      if(!already) SAVE.heroes.push('bahamut');
      msgEl.textContent = already ? '🐉 BAHAMUT ALREADY UNLOCKED' : c.msg;
      if(!already) setTimeout(()=>showHeroUnlockReveal('bahamut'),80);
    }else{
      SAVE.credits += c.credits||0;
      msgEl.textContent = c.msg;
    }
    saveGame();
    updateMenuCredits();
    inp.value = '';
    msgEl.style.color = 'var(--gold)';
    AUD.init(); AUD.resume(); AUD.perk();
  } else if(code){
    msgEl.textContent = 'INVALID CODE';
    msgEl.style.color = 'var(--red)';
    AUD.init(); AUD.resume(); AUD.empty();
  }
}

// ---------------- What's New / credits ----------------
// Bump this number whenever the first-open notice should appear again (i.e. whenever a
// new CHANGELOG entry below is added, so everyone's notice pops up once and shows it).
const WHATS_NEW_NOTICE_VERSION = 34;
const WHATS_NEW_NOTICE_KEY = 'bb_whats_new_notice_version';

// ---------------- Patch notes / changelog ----------------
// MANDATORY: EVERY change to this generator gets an entry here, in the same edit batch as
// the change itself - newest first. Players read this list inside the What's New modal,
// as the last block below the credits, so it is the shared record of what changed and why.
// Rules: `tag` is one of FIX | RESTORE | FEATURE | BALANCE | UX; `items` are plain strings
// (rendered as text, never HTML); keep them player-readable and say WHY, not just what.
// EXCEPTION (user requirement): while a change has NOT been saved/published yet
// (`window.generatorIsUnsaved` true), a follow-up tweak to that SAME change does NOT get a
// new entry - rewrite the existing in-flight entry in place instead, and do not bump
// WHATS_NEW_NOTICE_VERSION for it. Players never see half-shipped intermediate iterations.
// Server/layout changes also update the matching section of src/README.md.
const CHANGELOG = [
  {
    date: '2026-09-16', tag: 'BALANCE', title: 'MAG is no longer a safe zone: only the bodies his own pull is dragging pass through him',
    items: [
      'The previous patch answered "my own Super drags the crowd onto me" with a personal safety ring: for the whole 6 seconds, enemy bodies were held out of MAG\'s space and body contact could not damage him at all. It fixed the problem, but it handed one button six seconds of immunity, so casting into a crowd carried no risk and MAG stopped being a glass cannon. The shell and its ring are gone.',
      'What replaced it is per BODY, and it is never a state of MAG\'s. The pull is violent enough that whatever it holds is not walking any more - it is debris in flight - so a body the field is currently dragging ghosts straight through MAG instead of body-blocking him or flattening him on the way past. A meteor goes through you; MAG himself is never phased and never immune.',
      'Body contact is still the only thing ever refused, and only for bodies the field is holding. An enemy the field is not holding hits MAG exactly like it would hit anyone, a dragged body goes back to hurting him the instant the 6 seconds end, and flames, lasers, beams, shockwaves, hostile projectiles, melee lunges and every area attack land on him exactly as they always did - including from the very bodies he is dragging.',
      'The field ring is now drawn on the floor at the real pull radius where the magnet was planted, because that ring IS the rule: inside it, bodies are in flight and pass through; outside it, they are solid. It fades out over the last second, so the end of the pull is visible instead of the ring snapping away.',
      'And the bodies show it: while the field is dragging an enemy, that enemy goes spectral - a semi-transparent body with the same blue-white wash the game already uses for "phased" - so a ghosted body is one that cannot touch you and a solid one can. The read is on the enemy, not on MAG, which is where the rule actually lives. Tuning is MAGNET_PULL_GHOST_OPACITY / MAGNET_PULL_GHOST_TINT / MAGNET_PULL_GHOST_TINT_AMT next to MAGNET_FX_RADIUS / MAGNET_PULL_ACCEL / MAGNET_PULL_MAGNET_BONUS; the old MAGNET_SHELL_PAD is gone.',
    ],
  },
  {
    date: '2026-09-16', tag: 'FEATURE', title: 'Esc now shows the full hero status (passive + Ult), and every damage figure shows the live calculated number too',
    items: [
      'Pausing used to give you a settings page: your current stats were there, but nothing told you what the hero you were actually playing DOES. Esc now opens a HERO STATUS card for the hero you are on - their role, the PASSIVE / IDENTITY description, the Super with its full description and how many uses you have left right now, and the baseline the hero is built with. Everything that used to live only in the hero-select card is now one keypress away mid-run.',
      'Damage now reads as a calculated live number, not just the original. The WEAPON DMG row in the pause stats shows what a shot is actually worth right now AND names the original it started from (BASE 20 · ×1.12), and the hero card adds a LIVE NOW grid with SHOT DMG (the live value with the base printed next to it) and SHOT DPS (live damage × projectiles × fire rate), so what your build really puts out is visible instead of something you have to work out from multipliers.',
      'The two are deliberately shown side by side: BASELINE (ORIGINAL) is what the hero is built with, LIVE NOW · CALCULATED THIS RUN is what this run has made of it, including current HP, damage reduction (with Wounded Resolve and guard folded in), crit chance, move speed, fire rate and the live Super state.',
      'RESUME and QUIT stay above the card, so the long hero text can never push them off the screen, and the card sits above the stats grid so the numbers you just came for are still one glance away.',
    ],
  },
  {
    date: '2026-09-16', tag: 'BALANCE', title: 'ROOTY: stepping on a bramble actually works now, and the whole plant loop is faster',
    items: [
      'ROOTY\'s plant loop was quietly fighting the player. The game decided "you are standing on the bramble" by measuring centre to centre, but ROOTY\'s collision circle is much smaller than his drawn body - so he could look like he was standing right on top of a plant and still not convert it, especially while moving. The step-on zone is now much larger: it covers his whole drawn body plus real walking forgiveness, so brushing past a bramble converts it instead of demanding a pixel-perfect landing.',
      'Every bramble now draws a soft green ring on the floor at the exact radius that counts, and that ring breathes while the plant is alive - so you can see where to step instead of guessing. The brambles themselves are drawn a bit bigger too, so they read at arena-camera distance.',
      'Passive brambles also grow within reach instead of far away - 38 to 68 units out instead of 42 to 94 - so the garden is something you use in the middle of a fight rather than a trip you have to interrupt yourself for. They are placed just outside the new step zone on purpose: a bramble that appeared already under your feet would convert the instant it grew, so you would never actually see the trap.',
      'BRAMBLES (his Super) is a tighter, longer-lived ring: brambles appear at radius 64 (was 90) and last 8s (was 6). With the tighter ring and the bigger step zones, one pass across it re-plants his whole 3-Guard formation - which is what the Super was always supposed to do.',
      'Tuning lives in ROOTY_BRAMBLE_STEP_PAD, right next to ROOTY_GUARD_MAX.',
    ],
  },
  {
    date: '2026-09-16', tag: 'BALANCE', title: 'MAG\'s BURNING MAGNET now actually drags the whole crowd in - and cannot kill MAG with it',
    items: [
      'The Super was only doing half its job. BURNING MAGNET is meant to drag a crowd into one burning point, but enemies could simply walk out of the field one body at a time, so the pull read as a nudge instead of "everyone is coming to me". Worse, the crowd that DID arrive was standing on MAG, and MAG has 60 HP - so casting your own Super could kill you faster than not casting it.',
      'The magnet is now a real pull field. Its radius goes 170 → 200, everything inside is pulled considerably harder, and an enemy trying to walk OUT of the field has that outward motion cancelled, so the crowd converges and stays converged for the whole 6 seconds instead of leaking away. It also keeps stacking its fire-modified burn on everything inside, which fire now never loses.',
      'Pull strength scales with MAGNET, and MAG finally has a MAGNET stat to scale with: his passive now gives +30 Magnet on top of the +12% weapon damage it always gave. So his XP pickup radius grows AND his own Super gets stronger from the same number - and stacking the Magnet level-up card still does something, because +30 is not at the +50 cap.',
      'MAGNETIC SHELL was the first answer to "my own Super drags the crowd onto me": while the magnet was planted, the field held enemy bodies out of MAG\'s personal space and body contact could not damage him at all. It worked, but it handed one button six seconds of personal safety, so casting into a crowd carried no risk. It has since been reworked - see the MAG entry above for what replaced it.',
    ],
  },
  {
    date: '2026-09-16', tag: 'BALANCE', title: 'Fire and poison now do genuinely different jobs: fire never goes out, poison scales with the target',
    items: [
      'Fire was the weaker damage-over-time for a simple reason: a burn was a small flat number that ran out after about two seconds, so it was only ever a short top-up on whatever you had just shot, while poison started from a bigger number AND stacked to more than double it. Poison was the better burn in every situation, which left fire with no reason to exist outside its guns.',
      'Fire is now flat damage that STACKS and NEVER GOES OUT. Every ignition adds a stack (up to 5), a stack is worth the strongest source that lit it (a flamethrower stack is worth far more than a light-burn stack), and once something is alight it burns until it dies - no timer, no refresh, no maintenance. Fire also spreads on its own now: a burning enemy ignites whatever it touches, so a fire build chains down a whole pack instead of picking one target at a time. That is the crowd answer, and it stays honest against a boss, where five stacks of flat burn is a rounding error on a 10,000 HP bar.',
      'Poison is now the mirror image: the one damage source that scales with the TARGET. A stack set always bites for at least the poison value it always did, and on top of that takes a share of the target\'s MAX HP per second - so trash takes exactly what it took before, and a boss or elite (anything past roughly 1,400 HP at base poison) takes far more than flat damage ever could. Poison still expires after 3 seconds and still stacks to four with diminishing damage, so it has to be maintained: it is sustained focus on a big target, not a fire-and-forget.',
      'Both still tick straight through enemy shields, exactly as before.',
      'The pause menu says which is which: the FIRE row now reads "5 STACK CAP · NEVER GOES OUT" and the POISON row reads "% OF MAX HP". The orange glow on a burning enemy also reads the stack count now - one stack is barely a tint, five stacks is a full glow - so you can see how hot something is at a glance instead of every burning enemy looking identical.',
      'Fire Nova keeps its payoff (a super ignites every nearby enemy at once) but no longer advertises the spread, since spreading is what fire does now. All the tuning lives in two constants next to the poison ones: FIRE_MAX_STACKS and POISON_PCT_PER_SEC.',
    ],
  },
  {
    date: '2026-09-16', tag: 'FIX', title: 'Test/tool runs can no longer reach the leaderboard, and the board has an owner cleanup tool',
    items: [
      'A run started by the automation harness (the tooling that drives the game while it is being worked on) used to go through the same entry point as the play buttons, so the game had no way to tell the two apart and those runs were RANKED - posted to the real boards under the player\'s own name. Runs now carry an explicit "a real player pressed play" flag, and only a TRUSTED press of PLAY / CUSTOMIZE / retry sets it: a click the browser itself reports as genuine (a finger, a mouse, the keyboard) clears the automation mark, while a scripted click or any call through the automation hook only ever marks the run as a test run. Result: a harness-started run is fully playable but is never ranked, never banks gold and never unlocks a conquest win - and even a run already in progress drops out of ranking the moment the harness touches it, while your own runs still rank normally even on a page a tool has just inspected.',
      'The HUD now tells you which kind of run you are in, for the whole run: TRAINING · FAKE in the training arena, SANDBOX · NOT RANKED for anything that is not a real ranked run. The end screen says the same thing instead of quietly not recording the run, so a sandbox score can no longer look like it was ignored by a bug.',
      'OWNER TOOLS are now in the leaderboard panel: with the owner password they HIDE your own runs (never delete them), and the scope starts on TODAY ONLY · ALL BOARDS - the one-click sweep if a day of junk runs ever needs to come off the board. A hidden run keeps its archive slot, its lifetime totals and its duplicate signature, so hiding a run can never look like a wiped archive, and a browser that still holds the run can never push it back onto the board. Only rows matching your player token AND every run field are touched, so no other player\'s runs are affected. Scope is today only, every run of yours, or just what is on screen.',
      'The same pass also sweeps the junk out of the local copy of the board history that every browser keeps as a backup to offer back if the archive is ever wiped, and then refuses to remember those rows again - so a board that has been cleaned up cannot quietly refill itself from an older read of it.',
    ],
  },
  {
    date: '2026-09-16', tag: 'BALANCE', title: 'Double Bullet and Bullet Bully now double your actual shot',
    items: [
      'Both projectile cards added a flat +1 bullet, so the exact same card was worth wildly different amounts depending on the gun: a single-shot weapon went 1 → 2 → 3 (double, then +50%), while the 5-shell shotgun only went 5 → 6 → 7. On the shotgun the card paid less than the 20% damage cut it charges, so taking it was a net loss - and the one extra shell was invisible inside the 62° spread, which is why the upgrade looked like it did nothing.',
      'The cards now add one whole base volley per stack, so every weapon gets identical terms: your own shot doubled, then tripled. The laser still reads 1 → 2 → 3 beams, and the shotgun now reads 5 → 10 → 15 shells with the fan visibly widening as it goes. The damage math is unchanged, so total shot damage is the same +60% then +92% on every gun.',
      'The level-up card also prints the real numbers for the weapon you are holding (for example "5 → 10 PROJECTILES"), and the pause-menu PROJECTILES row shows your volley multiplier and how many of the two upgrades you have taken, so the payout is never guesswork again.',
    ],
  },
  {
    date: '2026-09-16', tag: 'UX', title: 'The default bunnies are far less colour-drenched, with calmer ears',
    items: [
      'The ten default bunnies were dyed too hard: the coat was mixed 42% of the way toward the hero’s card colour, which read as a solid orange or green or red rabbit instead of a cream rabbit with a tint. The mix is now 18%, so the colour is a hint of the hero rather than the whole body. The belly patch follows it down so it can never end up more coloured than the coat around it.',
      'The ears stay the most colourful part of each bunny - that is the point of them - but they were being pushed to a fully saturated version of the hero colour, which looked neon on a pale rabbit. The boost is now a step smaller, so the ears read as the same colour done richer rather than a glowing cap.',
      'Only the ten default bunnies changed. The Apex heroes (beasts, birds, dragons) and the special hero skins are untouched, and nothing about stats, cards or gameplay changed.',
    ],
  },
  {
    date: '2026-09-16', tag: 'UX', title: 'TOXIC BLASTER venom clouds are drawn much smaller',
    items: [
      'The pools read as bigger than one gunshot deserves: they were drawn at the same radius they poison, so a few seconds of firing left the floor looking like it was covered in full-size poison clouds. They are now drawn at about a quarter of that area - a small green puff that still grows and fades exactly like HAZE’s clouds, just noticeably smaller on screen.',
      'It is a look change only. The cloud still poisons the same radius-24 area on the same 0.4s ticks for the same 2.8s, so nothing about how it catches you or what it deals changed - it is just no longer the size of the hazard it hides.',
      'The two little bubbles each tick gives off now rise inside the puff instead of spreading across the full hidden hazard radius, so the pool reads as one small object rather than a wide fizzing patch.',
    ],
  },
  {
    date: '2026-09-16', tag: 'UX', title: 'MAG’s card no longer sells its passive as “always-on”',
    items: [
      'Every hero passive in the game is permanent, so calling MAG’s +12% weapon damage “Always-on” made it read like a special case when it is just what the hero does. The card now says the bonus and what the Super adds, the same way the other heroes’ cards do.',
      'Nothing about MAG changed: same +12% weapon damage, same BURNING MAGNET Super, same stats and Super charge.',
    ],
  },
  {
    date: '2026-09-16', tag: 'UX', title: 'TOXIC BLASTER pools are now proper poison clouds',
    items: [
      'Where a venom glob lands, the TOXIC BLASTER now leaves the SAME green poison cloud that HAZE’s Toxic Burst and the Stink Bug’s death burst leave - the same shape, the same glowing green, the same fade and the same slow spread. It used to leave a flat glossy puddle painted on the floor, which read as a completely different effect from the poison clouds the rest of the game uses.',
      'Only the size and the lifetime make it a “pool”: it is about half a full cloud’s width, sits low over the floor, and lasts under three seconds. Everything that makes it a pool is unchanged - it still ticks poison into anything standing in it every 0.4s, still builds stacks over about a second instead of capping them instantly, and is still weaker per tick than a full cloud so it tops up a direct hit rather than replacing it.',
      'The old puddle art is gone with it, including the puddle texture it was drawn from and the floor shadow, stain and halo discs that built it. Nothing else about the gun changed: the same globs, the same poison, the same splash where they land.',
      'Also for legibility: when something standing in a pool takes a tick, the cloud pulses slightly brighter for a moment, so you can see the pool biting even when the numbers are small.',
    ],
  },
  {
    date: '2026-09-16', tag: 'FIX', title: 'Run-start broadcasts can no longer describe the wrong run',
    items: [
      'Every number in a start-of-run broadcast is now read from the same constants the arena itself uses, instead of being typed out by hand a second time. The dragon-chaos and apex-loadout notices and the spawn code used to carry the same figures as three separate copies of a literal, so a tuning pass could leave a notice announcing a run you were not in. There is now exactly one source per figure (`DRAGON_CHAOS_PRESSURE`, `OP_STACK_PRESSURE`, `INSANE_PRESSURE_OP`/`_CLEAN`), so a broadcast cannot drift out of date again.',
      'Two Insane runs had no broadcast at all and now have one. Carrying exactly ONE OP item (an OP hero with a free gun, or a free hero with an OP gun) puts you on the full-pressure Insane grid AND gives you the final-30s BERSERK surge - and that surge used to arrive with nothing on screen to explain it. An Insane run with no OP item at all was also silent, so the eased grid went unmentioned. Both now say up front which run you are in: full pressure plus surge, or the eased clean grid with no surge.',
      'The dragon-chaos notice no longer promises a BERSERK surge on difficulties that can never reach one. The dragon-chaos pressure stack applies wherever BAHAMUT is taken, but the surge is Insane-only, so the surge line is now only printed when the run can actually get it.',
      'Training’s start notice said “3 EXP EDGE ×300”, which read like a 300-times multiplier. That pad drops 300 XP orbs and turns on RAPID ×10 and infinite ULT, so it now says exactly that (and matches the pad’s own banner).',
      'The Hub weapons hint claimed all weapons cost the standard price, which is false for the premium guns at the bottom of the list (4,000-4,700 CR) - the hint now says so. The vending-machine hint’s placeholder text also contradicted the real rule; it now describes the remembered set and the spent-only-if-you-use-it behaviour the code already had.',
      'The INSANE difficulty card’s own description was quoting an internal variable name at the player and understated the clean grid; it now reads as plain text and gives the real clean-run figures (+30.5% heavy HP, incoming ×1.152).',
    ],
  },
  {
    date: '2026-09-16', tag: 'BALANCE', title: 'Insane is 10% lighter - on a clean / no-OP run only',
    items: [
      'On Insane with a CLEAN loadout - no OP hero and no OP gun - the pressure knobs are now multiplied by 0.9: the spawn-cadence bonus (0.054 instead of 0.06), the heavy-enemy HP multiplier (large enemies, elites and bosses gain +30.5% HP instead of +45%) and the incoming-damage multiplier (×1.152 instead of ×1.28).',
      'An OP run is not affected at all. Carrying an OP hero or an OP gun keeps the original full-pressure grid - 0.06 / +45% / ×1.28 - exactly as it was. It is the same split rule the Insane chase speed and the berserk surge already use, decided by one condition (`opLoadoutEquipped`), so a run can never be half-eased.',
      'Pursuit speed is untouched on both sides: Insane still chases at ×1.16 with an OP item and ×1.08 on a clean run. 1.16 × 0.9 would land at ×1.044, at or below Hard’s ×1.05, and Insane has to stay the fastest and most lethal difficulty on every axis.',
      'Nothing else moved: fodder keeps its base HP on Insane (the HP multiplier only ever applied to heavies), the Insane-only spawn entries and boss schedule are unchanged, the final-exam bosses are unchanged, and every other difficulty is untouched. The 0.9 lives in one named constant (`INSANE_EASE`) beside the other Insane tuning, with the two pressure grids side by side, so it can be dialled again in one place.',
    ],
  },
  {
    date: '2026-09-16', tag: 'BALANCE', title: 'A heal [+] is worth less on a premium loadout, more on a plain bunny',
    items: [
      'The red [+] on the floor now heals by loadout. On a plain bunny - no premium hero, no premium gun - it heals a little more than it used to. On a run carrying an OP hero or an OP gun it heals a little less than it used to.',
      'The reason is the same one behind the Insane chase speed: a premium loadout already carries far more sustain of its own, with the bigger HP pools, the damage reduction and the super healing. A plain bunny has none of that, so the arena’s own food is worth less to the loadout that does not need it and more to the one that does.',
      'It applies on every difficulty - this is a loadout rule, not an Insane rule - and it is per drop, so the “+N” that floats up when you grab one is exactly what the cross was worth to you.',
      'The fat minion, champion and boss [+] drops are all scaled this way. The apex [+] is scaled too, but note that it can only ever be seen by a premium run: the Apex Seven final fight needs Insane with a premium hero AND a premium gun, and the dragon final fight needs BAHAMUT, so a plain bunny never meets an apex enemy and never sees that cross at all. The green XP [+] is untouched - its value does not depend on what you are carrying.',
    ],
  },
  {
    date: '2026-09-16', tag: 'FIX', title: 'The heal [+] is actually red now, and actually a cross',
    items: [
      'The red [+] on the floor was neither. Its colour was built from a salmon pink, and the soft glow laid over it is additive, so the glow’s own green and blue bled into the bars and pushed the whole thing further towards pink. The heal cross is now a deep red with a matching red halo, so the glow can only brighten the red it is sitting on instead of tinting it.',
      'It did not read as a cross either. The plus spun in its own plane, so twice a second it was an X rather than a plus - and because the camera is tilted, the arms also changed length as it turned, which made the shape look like it was wobbling between a squat plus and a fat dash.',
      'The spin is gone. It now stays upright and sways gently instead, so every frame is a clean plus, and the bars were rebuilt so the tilted camera can no longer squash them - the cross measures the same on screen as it does in the world, with four equal arms.',
      'The glow is also smaller and softer than it was, so the shape is not sitting inside a big pink haze at arena distance. The GREEN XP [+] got the same shape treatment; its colour is unchanged.',
    ],
  },
  {
    date: '2026-09-16', tag: 'FIX', title: 'BONES’ ears are coffee brown instead of a red ear',
    items: [
      'The bone bunny’s ears came out a dull red. BONES’ signature colour is ivory, which carries no hue of its own, so the ear-colour code fell through to the “classic” pink bunny ear - and against a near-white coat that pink read as a red ear rather than as a colour choice.',
      'His ears are now a plain coffee brown. They still separate clearly from the ivory coat at arena distance, but they sit in the same material family as bare bone instead of looking like a wound.',
      'Only BONES changed. Every other hero’s ears are still built from that hero’s own signature colour - BLINK’s deep blue, ROOTY’s brown, HAZE’s green, and so on - and none of their colours moved.',
    ],
  },
  {
    date: '2026-09-16', tag: 'UX', title: 'BLINK phases as a clean fade now, with no light show around the hero',
    items: [
      'PHASE RUN arrived wrapped in a whole rig of light: a glowing pool on the floor, spinning spiral arms, expanding rings, a rising plume of puffs and sparks, a blue repaint of the body, and a trail of glowing copies of the hero behind you. It was busy enough to hide the thing it was describing, so it is gone.',
      'What is left IS the phase: for the 3 seconds the hero simply goes semi-transparent, breathing slowly so it clearly reads as “not quite here”, and then snaps back to exactly how it looked before. No ring at the feet, no blue tint, no trail.',
      'It is also cheaper to run - the aura, the after-images and all their textures and shaders no longer exist, so the phased frames do less work.',
      'Nothing about the ability itself changed: still 3s of phase-through for the same +30% Fire Rate, and the same rule that area attacks - flames, lasers, beams, shockwaves, zone hazards - still land on you while bodies and bullets do not. This entry is only about how it looks.',
    ],
  },
  {
    date: '2026-09-16', tag: 'FEATURE', title: 'TOXIC BLASTER globs leave a venom puddle where they land',
    items: [
      'Every toxic glob now splats. Wherever a glob ends - on the enemy it hit, or wherever it ran out of range - it leaves a small pool of venom on the floor, about the size of a body, with an uneven lobed outline, a dark wet rim, highlights and a shadow that seats it in the stone.',
      'The puddle keeps working after the shot: anything standing in it is poisoned every 0.4s for as long as it lasts (2.8s), so the gun denies ground instead of only poisoning whatever it directly hits. The trap ticks are deliberately weaker than a direct hit, and poison never downgrades - so walking into a puddle tops up the venom already on you rather than replacing it with the weaker pool value.',
      'It builds stacks up over about a second instead of capping them the instant you step in. That is what makes it feel like standing in something nasty rather than being shot, and it keeps the puddle as attrition rather than a second direct hit.',
      'It belongs to the gun, not to poison in general: only TOXIC BLASTER leaves pools (its card carries a VENOM POOL tag). TAIPAN, HAZE’s clouds and the poison perks are all exactly as they were.',
      'Puddles are capped at 8 alive at once and the oldest retires, so a fire-rate build paints a few slicks behind itself instead of carpeting the whole arena.',
    ],
  },
  {
    date: '2026-09-16', tag: 'BALANCE', title: 'Insane is a chase, not a stampede, on a clean loadout',
    items: [
      'Insane gave every enemy the same big speed multiplier whether or not you were carrying a premium item. With an OP hero or gun in the kit that is the point - the fight has to be able to reach you. On a clean loadout, with nothing in the kit that answers it, the same multiplier only meant being run down in the open with no counterplay. That was the one form of pressure Insane applied that a plain build had no answer to at all.',
      'So pursuit speed is now split by loadout: with an OP item equipped Insane keeps its old faster chase, and on a clean run enemies move at a lower multiplier. It is a shorter leash, not a different difficulty - one step down, nothing else.',
      'This is speed only. Enemy HP, the damage they deal, how often they attack and how many of them spawn are all exactly as they were, so Insane still hits as hard as it always did. You just get room to move between hits.',
      'Normal and Hard are untouched - their multipliers never had this special case - and the apex bosses set their own speed directly, so the set-piece fights are unchanged too. The difficulty card text now states both multipliers, so the trade is visible before you pick.',
    ],
  },
  {
    date: '2026-09-16', tag: 'UX', title: 'Your cursed gear is remembered, and the next run asks before spending it',
    items: [
      'Buying a cursed consumable in the HUB puts a copy in your stockpile; you equip up to three in CUSTOMIZE CHARACTER and a copy is spent when a run actually deploys. The problem was what happened next: the game cleared your equipped set every time, so to run the same curses again you had to go back into CUSTOMIZE and pick all three over again, every single run.',
      'The set is now remembered instead of cleared. Nothing to re-select, nothing to re-tick - your cursed loadout survives between runs on its own.',
      'The next deploy then asks one question: use them this run, or run clean. USING spends a copy of each exactly as before and the curses apply as they always did. RUNNING CLEAN spends nothing and applies nothing, and both your copies and your equipped set are left precisely where they were, ready for the next run you do want them on. That is the fix for burning a stack on a run you wanted clean.',
      'Hand-picking in CUSTOMIZE is still the source of truth: choose a fresh set there and the next deploy just uses it with no question asked. The prompt only appears for a set inherited from a finished run, and only while you still have copies of the items in it.',
      'The loadout panel and the HUB shop text were updated to spell this out.',
    ],
  },
  {
    date: '2026-09-16', tag: 'FEATURE', title: 'Heavy kills can leave a spinning [+] behind',
    items: [
      'The fat half of the roster now has a chance to drop a spinning plus where it died. A RED [+] patches you up, a GREEN [+] carries a bigger XP bite than an ordinary orb. They turn in place on the spot - a plus reads as a plus while it spins.',
      'It is a bonus, not a supply line. The big round-bodied heavies only roll it rarely and for very little (that is the “only slightly” tier), champions roll it about half the time for roughly double that, and bosses always hand over both a red and a green one at once for the biggest amounts. The apex bosses give the most of all.',
      'A boss drops its pair to either side of the corpse rather than on one spot. Two glowing pluses stacked in the same place just add up to a white flare, so they are deliberately split apart to stay two readable pickups.',
      'The heal [+] is the only pickup in the arena that waits for you: at full health you will not vacuum it up and the magnet ignores it, so it stays exactly where it fell until the next hit lands and you walk back over it.',
      'Neither [+] pays out gold, so a bonus drop is never a currency multiplier. Plain XP orbs, cakes and ingredients behave exactly as they did before.',
    ],
  },
  {
    date: '2026-09-16', tag: 'FIX', title: 'Pressing BLINK’s phase no longer freezes the fight',
    items: [
      'The first time the phase look was ever drawn, the game compiled a fresh batch of shaders on that exact frame. On a slower device that was roughly 75-180ms with the screen stopped at the very worst moment: you press the button to dodge, the fight freezes, and the hit you were dodging lands while the controls are dead.',
      'The phase look is now prepared while the run is loading instead of when it is used, and the last few programs are compiled once in a throwaway one-pixel offscreen render on the first frame, before anything can shoot at you. Recompiling is also re-runnable now, so it happens again after your held weapon is built, which was the other thing that could still trigger a stall.',
      'Measured on the same machine: the activation frame now costs about the same as an ordinary frame, and the renderer reports no new shader programs at the moment of activation - the whole effect is a single uniform flip.',
      'Nothing about the phase changed: still 3 seconds of phase-through for the same +30% fire rate, and it looks exactly the same before, during and after - including snapping back to your normal materials with zero difference once it ends.',
    ],
  },
  {
    date: '2026-09-16', tag: 'FIX', title: 'BLINK’s phase-through is made of light now, not a cylinder',
    items: [
      'The phase effect used to be a hard ground ring plus an open-ended cylinder standing around the hero. At arena distance that read as two bits of geometry parked in the middle of a fight, and it was the weird cylinder/dome you were seeing.',
      'What is there now: a wide pool of light on the floor with a brighter core inside it, two counter-rotating spiral arms sweeping over the ground, three thin rings travelling outward, and a low plume of soft puffs and sparks coming off the body. Every piece fades to nothing at its own edge, so there is no border anywhere for the eye to catch.',
      'The whole rig is deliberately wider than it is tall. The glow over the body is a squat wide billboard and the rising puffs stop around head height and fan outward as they climb, so the light spreads across the floor instead of stacking up into a column.',
      'The hero keeps more of its own colours and glows a bit less while phased, so you can still tell it is BLINK instead of one flat blue blob, and its contact shadow is switched off during the phase - a solid black disc under a body made of light landed as a dark shape floating inside the glow.',
      'The after-images are now rim-lit single-shell copies of the bunny with a soft halo rather than flat bright cards, and they drop a little further apart, so you read separate copies trailing behind you instead of one smear.',
      'Timings are untouched: still 3s of phase-through for the same +30% fire rate. This entry is only about how it looks.',
    ],
  },
  {
    date: '2026-09-16', tag: 'BALANCE', title: 'BB-NOZIA: hold fire and the shells STAY charged',
    items: [
      'The card said "hold fire to charge the projectile", which promised something the gun did not do. It kept auto-firing the whole time (as it always has - the trigger is a normal auto trigger), and the charge was wiped by every single shot, so a held burst really only ever reached ×2 and the first shell of a burst looked different from the rest.',
      'Now holding fire ramps the shells from ×1 to ×2.5 over 0.75s and KEEPS them there. Firing no longer spends the charge, so a steadily held trigger fires fully charged shells at the normal fire interval: same interval, bigger shells. No charge-and-release, no slower fire rate, no rate penalty at all.',
      'Letting go of fire - or tapping - snaps the charge straight back to ×1, so quick taps still fire plain shells. That is the whole trade-off: charged shells cost you holding the trigger, and nothing else.',
      'What full charge is worth: ×1.65 direct AND explosion damage, ×1.45 blast radius, ×1.45 knockback, ×2.5 shell size. A sustained held burst used to sit at ×2 (×1.43 damage), so the sustained ceiling moved up about 15%, and the 0.75s ramp still means the first shells of every hold are the small ones.',
      'Each shot now also kicks a ring off the muzzle that grows with the charge, so you can read the charge level directly instead of guessing from shell size.',
      'Card and spec text were rewritten to say exactly this instead of the old ambiguous line.',
    ],
  },
  {
    date: '2026-09-16', tag: 'UX', title: 'The ears are a DEEPER version of each bunny’s own colour',
    items: [
      'Every bunny’s ears now carry a distinctly deeper, richer version of that hero’s own signature colour - same hue, more saturation, less lightness - so the ears read as the concentrated colour and the body stays the soft pastel coat.',
      'Before this, all 10 default bunnies shared one pale pink ear, so from the arena camera every rabbit was the same washed-out-eared blob and you could not tell them apart by colour.',
      'The accent is taken from the hero colour itself rather than mixed out of pink: a pink mix dragged HAZE’s green ear through olive, so green stays green and purple stays purple.',
      'The belly still keeps its pastel - only the ears were deepened. The read at a glance is now: soft body, deep colour accent above it.',
      'BONES has no colour to deepen (ivory signature), so his ears are the classic pink bunny ear in a deeper rose instead of a tint too faint to notice against the pale coat.',
      'The ears also self-light at close to the body rate, so the dark signatures (BLINK, ROOTY) show as lit deep colour instead of fading into black silhouettes at gameplay distance.',
    ],
  },
  {
    date: '2026-09-16', tag: 'BALANCE', title: 'The final-30s BERSERK surge is an OP-run thing now',
    items: [
      'Insane used to switch on two hidden escalation stages in the last 30 seconds of every run: at 470s enemy movement speed went up 8% and spawn cadence sped up 22%, then at 490s everything jumped again to 18% faster movement and a 42% faster cadence, plus a bonus enemy every other wave.',
      'That surge is now gated on the loadout. If you deploy with an OP hero or an OP weapon it fires exactly as before, both stages - it is part of the extra pressure an OP run already signs up for, and the run-start warning now tells you it is coming.',
      'A CLEAN / no-OP run - no OP hero, no OP weapon - gets none of it. No speed spike, no cadence spike, no extra enemies, no orange or pink HUD flare, and the timer stays on SURVIVE. Insane keeps a constant pace from 0s all the way to 500s, so the difficulty you can read at 100s is the difficulty you get at 499s.',
      'Why: the surge was the only Insane pressure that could not be prepared for. A clean loadout already faces the +45% heavy HP, the faster and harder-hitting enemies, the Insane-only spawns and the final exam, so the last 30 seconds became a wall that decided runs instead of a phase that tested them.',
    ],
  },
  {
    date: '2026-09-16', tag: 'UX', title: 'Bunny card briefs are all one even line now',
    items: [
      'The 10 default bunny cards had wildly uneven descriptions - HAZE and BLINK were one short stat, BONES and ROOTY were a small paragraph - so cards in a row looked ragged and lopsided.',
      'Every default bunny brief is now a single comparable sentence (roughly 60-75 characters) that names its signature mechanic, so rows of cards read evenly.',
      'Trimmed detail, not mechanics: ROOTY (the 3-Guard replacement rule and summon scaling), BONES (every Doggo becoming a Bone Doggo), PAYNE (the exact RAGE threshold table, though the +14 top bonus is still named) and NIKKI (turret perks building on her setup). The exact numbers stay in each hero\'s detail popover.',
      'Apex briefs were already one-liners and are unchanged.',
    ],
  },
  {
    date: '2026-09-16', tag: 'UX', title: 'Patch notes sit under the credits, and the self-link is gone',
    items: [
      'The changelog list now renders BELOW the credits block instead of above it, so the credits read first and the patch notes follow them.',
      'Removed the "HOP HAVOC MOD" credit entry: it linked to this same generator, which is not a credit - you are already here.',
      'The credits heading lost the now-empty "PLAY" label and reads CREDITS · MORE FROM RUDBO.',
    ],
  },
  {
    date: '2026-09-16', tag: 'BALANCE', title: 'PHASE RUN is a 3s phased dash with +30% Fire Rate',
    items: [
      'PHASE RUN is now 3 seconds long, and BLINK is PHASED for all 3 of them: enemy bodies, contact damage, Thorn Guards and hostile cakes pass straight through, so it is a real dash through danger instead of a wall you bounce off.',
      'The run also carries a +30% Fire Rate bonus for those 3 seconds, so the dash is not just an escape - you can dive through a pack and shoot your way out the far side at the same time.',
      'It keeps +100% Move Speed with no stamina cost, and still ignores slows and knockback for the whole run.',
      'Area attacks still land: flames, fire roads, lasers and beams, boss shockwaves/slams and zone hazards all ignore phasing. Decision on lasers (you asked): lasers DO count as area damage - you dodge them by moving, not by phasing. Ordinary enemy bullets, bites and claws are not area, so those pass through you while phased.',
      'The HUD reads PHASED while the run is active, and the hero turns spectral blue with a ground ring and shell so you can see the state.',
    ],
  },
  {
    date: '2026-09-16', tag: 'FIX', title: 'Level-up cards that can do nothing are gone',
    items: [
      'Some cards used to show up after they had already stopped doing anything - you would spend a pick and gain exactly nothing.',
      'Now a card is hidden while its effect is dead: Critical Hit once crit is at the 100% cap, Armor once damage resistance is at its cap, the projectile cards (Double Bullet, Bullet Bully) once you are at the +2 projectile cap, Magnet once your XP pickup radius is maxed and crit is capped, Super Plus at the 1s cooldown floor on unlimited-Super heroes (FOXY), and HP for Damage at full HP (that one was a trap: -25% damage for a heal you did not need).',
      'Repeat picks (the late-game repeat slots and FLEX\'s deep perk pool) respect the same rule, so a maxed stat no longer eats a repeat slot.',
      'Cards that are only weak for your CURRENT build are deliberately kept, because a later pick can make them good again - Summon Buff before you have summons, Poison cards on a non-poison gun, Rooted Fire before any burn source, Armor King before any shield source. Only caps and dead values are filtered, never build preference.',
    ],
  },
  {
    date: '2026-09-16', tag: 'BALANCE', title: 'Ricochets shove enemies away, never onto you',
    items: [
      'Reported: BB-NOZIA "consistently blasts enemies towards you instead of away". Confirmed and fixed - it was the bounce, not the blast.',
      'Why it happened: a shell that has come off a wall is usually travelling back toward you, and both its contact shove and its explosion push were taken from that travel direction. A shell detonating while flying home therefore pushed its target straight at you.',
      'Now: any shove from a bounced projectile that would move a target CLOSER to you is replaced with a straight outward push, so a blast can only ever buy you room. Magnitude is unchanged - only the direction is corrected.',
      'This covers every ricochet weapon (BB-NOZIA, R6-BOUNCER, WILD-FOX, SCRAPPER, AR-CRITTER, MG-ECLIPSE, VOID RIFLE, BOOM BLASTER), not just BB-NOZIA.',
      'Straight shots, hero supers and the deliberate pull effects (GRAVITY MAUL\'s gravity field) behave exactly as before.',
    ],
  },
  {
    date: '2026-09-16', tag: 'UX', title: 'In-game patch notes',
    items: [
      'This list: every change is documented here, newest first, directly under What\'s New.',
      'The newest entries open automatically - tap any entry to expand or collapse it, or SHOW ALL for the whole history.',
      'The notice opens once for everyone whenever a new entry is added.',
    ],
  },
  {
    date: '2026-09-16', tag: 'FIX', title: 'HUB owner counts now actually come back up',
    items: [
      'The HUB "N OWN IT" numbers now ADD every owner we can identify on top of the baseline. The rebuilt count used to be floored at the baseline, which is why the numbers looked frozen at their old standing-in values after the 2026-09-16 wipe.',
      'Owning an item counts as +1 immediately, from the first frame - no waiting on the server, and no baseline-only flash while the first read is in flight.',
      'Counted from the players themselves: a save that owns an item proves a purchase, so each browser reports what it owns and the server counts DISTINCT players. Repeat visits never inflate the number.',
      'The rule in one line: an item with baseline B and N known owners shows B + N. If 30 players owned an item before the wipe and 15 of them load the page, the count adds 15 back - all 30 loading adds all 30.',
      'Verification tokens written into the live registry while testing this are cleared once when the updated server deploys; real owners are re-counted automatically on their next page load.',
      'The HUB badge no longer breaks "OWN IT" across two lines.',
    ],
  },
  {
    date: '2026-09-16', tag: 'RESTORE', title: 'Owner counts rebuilt from the players',
    items: [
      'New owner registry inside unused server state: no archive layout change, no version bump, and existing archives load byte-for-byte.',
      'A key\'s count IS the number of distinct player tokens stored for it (1600 per item, after which the count freezes instead of over-counting).',
      'Clients report the items their save owns when they load the page; the same player reporting again is free and adds nothing.',
      'Details: src/README.md, "Owner registry (HUB N OWN IT)".',
    ],
  },
  {
    date: '2026-09-16', tag: 'RESTORE', title: 'Leaderboard archive rebuilt from players',
    items: [
      'Every browser offers back the leaderboard rows it had already seen, so the archive is rebuilt by the people who played it - the "CONTRIBUTED N LOCAL RUNS TO THE ARCHIVE" line.',
      'A periodic backup file holds a full archive snapshot (rows plus lifetime stats) and is restored automatically when the archive looks empty.',
      'Server-side restore RPCs validate every row and are rate limited, and a durable flag stops a second restore from running over live data.',
      'Details: src/README.md, "Leaderboard archive backup & self-heal" and "Local contribution (crowd restore)".',
    ],
  },
  {
    date: '2026-09-16', tag: 'FIX', title: 'The 2026-09-16 wipe, and why it cannot happen again',
    items: [
      'Cause: a layout version bump shipped without a migrator, and the boot fallback zero-filled the whole 50 MiB shared state - taking the leaderboard archive and the HUB counters with it.',
      'That fallback is gone. An unknown layout version now FREEZES the archive (reads only, writes refused) instead of erasing it.',
      'Every boot path preserves the community counter tail and the owner registry; the v3 migration lifts them out and puts them back around its own reset.',
      'Standing rule: no boot path may zero-fill anything outside the archive region.',
    ],
  },
  {
    date: '2026-09-16', tag: 'BALANCE', title: 'Win / pace score rebalance',
    items: [
      'Win and pace score bonuses retuned (SCORE_BALANCE). This is pure client-side arithmetic and never needed a server layout change.',
      'Historical note: the histogram bin-width change that shipped alongside this rebalance is what forced the version bump, and that bump is what wiped the archive. Fixed above.',
    ],
  },
];

const PN_OPEN_DEFAULT = 2;
function pnEntryRow(entry, open){
  const row=document.createElement('div'); row.className='pnEntry';
  const head=document.createElement('button'); head.type='button'; head.className='pnEntryHead';
  const meta=document.createElement('span'); meta.className='pnMeta';
  const tag=document.createElement('span'); tag.className='pnTag '+String(entry.tag||'note').toLowerCase(); tag.textContent=String(entry.tag||'NOTE');
  const date=document.createElement('span'); date.className='pnDate'; date.textContent=String(entry.date||'');
  meta.append(tag,date);
  const title=document.createElement('span'); title.className='pnEntryTitle'; title.textContent=String(entry.title||'');
  const caret=document.createElement('span'); caret.className='pnCaret'; caret.setAttribute('aria-hidden','true'); caret.textContent='▾';
  head.append(meta,title,caret);
  const body=document.createElement('ul'); body.className='pnItems';
  for(const text of (entry.items||[])){ const li=document.createElement('li'); li.textContent=String(text); body.append(li); }
  row.classList.toggle('pnOpen',open);
  head.setAttribute('aria-expanded',open?'true':'false');
  body.hidden=!open;
  head.addEventListener('click',()=>{
    const now=!row.classList.contains('pnOpen');
    row.classList.toggle('pnOpen',now);
    head.setAttribute('aria-expanded',now?'true':'false');
    body.hidden=!now;
    AUD.ui();
  });
  row.append(head,body);
  return row;
}
function pnRender(){
  const list=$('#pnList'); if(!list) return;
  list.replaceChildren();
  const frag=document.createDocumentFragment();
  CHANGELOG.forEach((entry,i)=>frag.append(pnEntryRow(entry,i<PN_OPEN_DEFAULT)));
  list.append(frag);
  const sub=$('#pnSub'); if(sub) sub.textContent=CHANGELOG.length+(CHANGELOG.length===1?' ENTRY':' ENTRIES')+' · NEWEST FIRST';
  const btn=$('#pnToggleBtn');
  if(btn){
    btn.textContent='SHOW ALL';
    btn.onclick=()=>{
      const open=btn.textContent!=='HIDE OLDER';
      list.querySelectorAll('.pnEntry').forEach(row=>{
        const head=row.querySelector('.pnEntryHead'), body=row.querySelector('.pnItems');
        row.classList.toggle('pnOpen',open);
        if(head) head.setAttribute('aria-expanded',open?'true':'false');
        if(body) body.hidden=!open;
      });
      btn.textContent=open?'HIDE OLDER':'SHOW ALL';
      AUD.ui();
    };
  }
}
function openWhatsNew(){
  const modal=$('#whatsNewModal');
  if(!modal) return;
  if($('#pnList') && !$('#pnList').childElementCount) pnRender();
  modal.hidden=false;
  if(BB_AT?.lang && BB_AT.lang!=='en') bbScheduleSettled(modal,80);
}
function closeWhatsNew(){
  const modal=$('#whatsNewModal');
  if(modal) modal.hidden=true;
  try{ localStorage.setItem(WHATS_NEW_NOTICE_KEY,String(WHATS_NEW_NOTICE_VERSION)); }catch(e){}
}
function maybeShowWhatsNew(){
  let seen=0;
  try{ seen=Number(localStorage.getItem(WHATS_NEW_NOTICE_KEY))||0; }catch(e){}
  if(seen < WHATS_NEW_NOTICE_VERSION) openWhatsNew();
}

function initMenus(){
  const cheatInp = $('#cheatInput');
  if(cheatInp){
    cheatInp.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); enterCheatCode(); } });
    cheatInp.addEventListener('focus', ()=>cheatInp.select());
  }
  $('#cheatSubmitBtn').addEventListener('click', enterCheatCode);
  $('#cheatHelpBtn').addEventListener('click', ()=>{ AUD.init(); AUD.resume(); openCommunity(); });
  const visInp=$('#arenaVisibility');
  if(visInp) visInp.addEventListener('input',()=>{
    SAVE.arenaVisibility=clamp(Number(visInp.value)||50,0,100); saveGame(); updateVig();
    const v=$('#arenaVisibilityValue'); if(v) v.textContent=Math.round(SAVE.arenaVisibility)+'%';
  });
  document.querySelectorAll('#mobileGraphicsQualitySeg .segBtn').forEach(b=>{
    b.addEventListener('click',()=>{
      const q=String(b.dataset.q||'original');
      if(!MOBILE_GRAPHICS_CRUNCH[q]) return;
      SAVE.mobileGraphicsQuality=q;
      saveGame();
      applyMobileGraphicsQuality();
      renderPauseVisibility();
      renderPauseHeroSplash();
      AUD.ui();
    });
  });
  $('#heroUnlockCloseBtn')?.addEventListener('click',()=>{ closeHeroUnlockReveal(); AUD.ui(); });
  $('#heroUnlockReveal')?.addEventListener('click',e=>{ if(e.target?.id==='heroUnlockReveal') closeHeroUnlockReveal(); });
  $('#whatsNewBtn').addEventListener('click', ()=>{ AUD.init(); AUD.resume(); openWhatsNew(); });
  $('#whatsNewCloseBtn').addEventListener('click', closeWhatsNew);
  $('#whatsNewGotItBtn').addEventListener('click', closeWhatsNew);
  document.addEventListener('keydown', e=>{ if(e.key==='Escape' && !$('#whatsNewModal').hidden) closeWhatsNew(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape' && !$('#lbOwnerModal').hidden) lbOwnerClose(); });
  $('#startBtn').addEventListener('click', startRunWithOrientation);
  $('#customBtn').addEventListener('click', ()=>{
    AUD.init(); AUD.resume();
    showCustomize();
  });
  $('#customBackBtn').addEventListener('click', ()=> setScreen('menu'));
  $('#customGoBtn').addEventListener('click', startRunWithOrientation);
  document.querySelectorAll('#customTabs .segBtn').forEach(b=>{
    b.addEventListener('click', ()=>{
      customTab=b.dataset.t||'hero';
      syncCustomTabs();
      AUD.ui();
    });
  });
  $('#hubBtn').addEventListener('click', showHub);
  $('#testBtn').addEventListener('click', ()=>{
    AUD.init(); AUD.resume();
    G.debugFrom='menu';
    G.testSel=sanitizeTrainingSelection(G.testSel);
    setScreen('debug');
    renderDebug();
  });
  $('#pauseTestBtn').addEventListener('click', ()=>{
    if(!G.testMode) return;
    AUD.init(); AUD.resume();
    G.debugFrom='pause';
    setScreen('debug');
    renderDebug();
  });
  $('#testStartBtn').addEventListener('click', startTestModeWithOrientation);
  $('#debugResetBtn').addEventListener('click', ()=>{
    const live=!!(G.testMode&&G.hero);
    resetDebugSettings();
    if(live){
      G.trainingSetupDirty=true;
      renderDebug();
      banner('🧪 TRAINING SETUP RESET · PENDING · RESUME TO APPLY');
    }else{
      renderDebug();
      banner('🧪 TRAINING SETUP RESET');
    }
    AUD.ui();
  });
  const returnDebugToPause=()=>{
    G.state='paused';
    G.simPaused=true;
    setScreen('pause');
    renderPauseHeroSplash();
    renderPauseSkinPanel();
    renderPauseVisibility();
    renderPauseStats();
    renderPauseHeroStatus();
    const pt=$('#pauseTestBtn'); if(pt) pt.hidden=!G.testMode;
    const rb=$('#resumeBtn');
    if(rb){
      rb.disabled=false;
      rb.style.pointerEvents='auto';
      rb.style.opacity='';
    }
  };
  $('#debugNormalBtn').addEventListener('click', ()=>{
    if(G.debugFrom==='pause'&&G.testMode) returnDebugToPause();
    else setScreen('menu');
    AUD.ui();
  });
  $('#debugBackBtn').addEventListener('click', ()=>{
    if(G.debugFrom==='pause'&&G.testMode) returnDebugToPause();
    else setScreen('menu');
  });
  $('#hubBackBtn').addEventListener('click', ()=>{ setScreen('menu'); });
  document.querySelectorAll('#hubTabs .segBtn').forEach(b=>{
    b.addEventListener('click', ()=>{
      hubTab = b.dataset.t;
      renderHub();
      AUD.ui();
    });
  });
  document.querySelectorAll('#diffSeg .segBtn').forEach(b=>{
    b.addEventListener('click', ()=>{
      G.sel.diff = b.dataset.d;
      document.querySelectorAll('#diffSeg .segBtn').forEach(x=>x.classList.toggle('active', x===b));
      persistLastSelection();
      AUD.ui();
    });
  });
  $('#lbBtn').addEventListener('click', ()=>{ AUD.init(); AUD.resume(); lbOpen(); });
  $('#lbBackBtn').addEventListener('click', ()=> setScreen('menu'));
  $('#communityBtn').addEventListener('click', ()=>{ AUD.init(); AUD.resume(); openCommunity(); });
  $('#communityBackBtn').addEventListener('click', ()=> setScreen('menu'));
  document.querySelectorAll('#lbDiffSeg .segBtn').forEach(b=>{
    b.addEventListener('click', ()=>{
      LB.diffIdx = +b.dataset.d;
      lbSyncSegs(); lbRefresh(true); AUD.ui();
    });
  });
  document.querySelectorAll('#lbTierSeg .segBtn').forEach(b=>{
    b.addEventListener('click', ()=>{
      LB.tierTab = +b.dataset.t;
      lbSyncSegs(); lbRefresh(true); AUD.ui();
    });
  });
  document.querySelectorAll('[data-lbsort]').forEach(b=>{
    b.addEventListener('click', ()=>{
      lbSetSort(b.dataset.lbsort);
      AUD.ui();
    });
  });
  $('#lbHeroFilter')?.addEventListener('change', e=>{
    LB.heroFilter=e.target.value||'';
    LB.displayLimit=LB_PAGE_SIZE;
    lbApplyView();
    AUD.ui();
  });
  $('#lbWeaponFilter')?.addEventListener('change', e=>{
    LB.weaponFilter=e.target.value||'';
    LB.displayLimit=LB_PAGE_SIZE;
    lbApplyView();
    AUD.ui();
  });
  $('#lbJumpBtn').addEventListener('click', ()=>{ lbJumpMine(); AUD.ui(); });
  $('#lbLoadMoreBtn')?.addEventListener('click', ()=>{ lbLoadMore(); AUD.ui(); });
  $('#lbOwnerBtn')?.addEventListener('click', ()=>{ AUD.init(); AUD.resume(); lbOwnerOpen(); AUD.ui(); });
  $('#lbOwnerCloseBtn')?.addEventListener('click', ()=>{ lbOwnerClose(); AUD.ui(); });
  $('#lbOwnerCancelBtn')?.addEventListener('click', ()=>{ lbOwnerClose(); AUD.ui(); });
  $('#lbOwnerHideBtn')?.addEventListener('click', ()=>{ lbOwnerHide(); });
  $('#lbOwnerPwInput')?.addEventListener('keydown', e=>{ if(e.key==='Enter') lbOwnerHide(); });
  $('#lbOwnerModal')?.addEventListener('click', e=>{ if(e.target?.id==='lbOwnerModal') lbOwnerClose(); });
  $('#lbNameBtn').addEventListener('click', ()=>{
    lbSaveName($('#lbNameInput').value);
    const m = $('#lbNameMsg');
    if(m){ m.textContent = LB.name ? 'SAVED ✓' : 'PLEASE ENTER A NAME'; m.style.color = LB.name ? 'var(--green)' : 'var(--red)'; setTimeout(()=>{ m.textContent=''; }, 1600); }
    AUD.ui();
  });
  $('#lbNameInput').addEventListener('keydown', e=>{ if(e.key==='Enter') $('#lbNameBtn').click(); });
  const lbSearchInput=$('#lbSearchInput');
  if(lbSearchInput){
    lbSearchInput.addEventListener('input', ()=>{
      LB.searchQuery=lbSearchInput.value;
      lbApplyView();
    });
  }
  $('#howBtn').addEventListener('click', ()=>{
    const ov = document.createElement('div');
    const mobile = isCoarse();
    const cap = key=>'<kbd style="display:inline-block;min-width:18px;padding:1px 6px;margin:0 1px;border:1px solid #405268;border-bottom-width:2px;border-radius:5px;background:#0d131c;color:#f4f8ff;font:800 11px/1.55 system-ui,sans-serif;text-align:center;box-shadow:inset 0 1px rgba(255,255,255,.05)">'+key+'</kbd>';
    const controls = mobile
      ? '<b>Left stick</b> — move and set facing<br><b>Quick tap fire / right side</b> — auto-aim nearest enemy and shoot once<br><b>Short drag + release</b> — aim there and shoot once<br><b>Hold aim drag</b> — autofire until release<br><b>Directional skills</b> — hold/drag to preview the real path, cone or impact; release casts once<br><b>Attack-skill tap</b> — auto-aim nearest enemy and cast once<br><b>Reposition-skill tap</b> — inherit current walk direction; if stationary, use facing. It never auto-aims the enemy swarm<br><b>Tap SPRINT</b> — toggle sprint on/off (unlockable)<br><b>DASH</b> — tap follows movement → facing fallback; drag overrides direction<br><b>RELOAD</b> — reload / refill<br><b>SUPER / RUSH</b> — directional Supers show their path; radial/self Supers show their real cast radius before release<br><b>Action orbit</b> — center AIM/FIRE; evenly spaced middle ring for RELOAD / SUPER / SPRINT / DASH; evenly spaced outer ring for Dragon 1–4. Hidden abilities leave their slots empty<br><b>Bahamut</b> — purple Dragon skills sit on the outer orbit: FAN and LANCE are aimed; BURST and SWEEP cast instantly<br><b>⚙</b> — pause / settings<br><br>'
      : cap('W')+' '+cap('A')+' '+cap('S')+' '+cap('D')+' — move<br><b>Mouse</b> — aim<br>Hold '+cap('LMB')+' — fire<br>Hold '+cap('RMB')+' / '+cap('Shift')+' — sprint (unlockable; HUD button can toggle it)<br>'+cap('R')+' — reload<br>'+cap('Space')+' — dash · '+cap('E')+' — Super · '+cap('1')+' '+cap('2')+' '+cap('3')+' '+cap('4')+' — Dragon skills<br>Hold '+cap('Space')+' / '+cap('E')+' / Dragon '+cap('1')+' '+cap('2')+' '+cap('3')+' '+cap('4')+' — reveal the truthful projection, then release to cast; quick tap casts with no indicator flash<br><b>Directional skills</b> — show their route/cone while held; reposition skills follow mouse aim<br>Bahamut '+cap('3')+' / '+cap('4')+' — show a radius indicator while held<br>'+cap('Esc')+' — pause<br><br>';
    ov.className='howOverlay';
    ov.style.cssText = 'position:fixed;inset:0;z-index:60;background:rgba(6,9,13,.94);display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:max(10px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left));box-sizing:border-box;';
    ov.innerHTML = '<div class="howCard" style="width:min(520px,100%);margin:auto 0;background:#141a24;border:1px solid #26313f;border-radius:12px;padding:24px 30px;box-sizing:border-box;line-height:1.9;font-size:13px;color:#e8eef5">'+
      '<div style="font-size:20px;font-weight:800;letter-spacing:2px;margin-bottom:12px;color:#6fd9ff">🎮 HOW TO PLAY</div>'+
      controls+
      'Survive <b>500 seconds</b>. Kill enemies for XP orbs. Leveling up pauses the fight and offers 1-of-3 upgrades plus a <b>score-multiplier die</b>. '+
      'Mastery perks level a track — <b>3 points in a track unlock its king perk</b>. '+
      'Pick a difficulty on this screen, or tap <b>CUSTOMIZE CHARACTER</b> to pick a hero, weapon and gem. '+
      'Watch out for the big ones — bosses drop in on a schedule.<br><br>'+
      '<button class="btn" id="howClose" style="width:100%">GOT IT</button></div>';
    document.body.appendChild(ov);
    ov.querySelector('#howClose').onclick = ()=>ov.remove();
  });
  const resumeFromPause=()=>{
    // PAUSE UI is authoritative. Never let stale state from Test Tools block Resume.
    if(!G.hero || G.hero.dead) return;

    if(G.testMode && G.trainingSetupDirty){
      // One commit point: rebuild once from the complete staged Training selection.
      G._launchTest=true;
      beginRun();
      G.state='arena';
      G.simPaused=false;
      setScreen('none');
      $('#hud').hidden=false;
      banner('🧪 TRAINING SETUP APPLIED');
      return;
    }

    G.state='arena';
    G.simPaused=false;
    setScreen('none');
    $('#hud').hidden=false;
    AUD.playTrack(G.sel.music);
  };

  const resumeBtn=$('#resumeBtn');
  // pointerup makes touch/landscape Training reliable; click remains keyboard/accessibility fallback.
  let resumePointerHandled=false;
  resumeBtn.addEventListener('pointerup', e=>{
    e.preventDefault();
    resumePointerHandled=true;
    resumeFromPause();
    setTimeout(()=>{ resumePointerHandled=false; },0);
  });
  resumeBtn.addEventListener('click', e=>{
    e.preventDefault();
    if(resumePointerHandled) return;
    resumeFromPause();
  });
  $('#quitBtn').addEventListener('click', ()=>{
    G.state='menu'; G.simPaused=false; G.testMode=false; G._launchTest=false;
    AUD.stopBGM();
    setScreen('menu'); $('#hud').hidden=true;
  });
  $('#retryBtn').addEventListener('click', (ev)=>{
    if(G.endResult && G.endResult.win && G.endResult.nextDiff) G.sel.diff = G.endResult.nextDiff;
    persistLastSelection();
    startRunWithOrientation(ev);
  });
  $('#menuBtn').addEventListener('click', ()=>{
    G.state='menu'; G.testMode=false; G._launchTest=false;
    AUD.stopBGM();
    setScreen('menu'); $('#hud').hidden=true;
  });
  $('#endNameBtn').addEventListener('click', ()=>{
    const inp=$('#endNameInput');
    lbSaveName(inp ? inp.value : '');
    const msg=$('#endNameMsg');
    if(!LB.name){
      if(msg){ msg.textContent='ENTER A NAME'; msg.style.color='var(--red)'; }
      inp?.focus();
      return;
    }
    if(msg){ msg.textContent='SAVED ✓'; msg.style.color='var(--green)'; }
    submitEndLeaderboard();
  });
  $('#endNameInput').addEventListener('keydown', e=>{
    if(e.key==='Enter'){ e.preventDefault(); $('#endNameBtn').click(); }
  });
}

function renderEndSplash(){
  const screen=$('#endScreen'), splash=$('#endSplash');
  if(!screen || !splash) return;
  const id=G.char?.id||G.sel?.char||'';
  const src=heroSplashArtEnabled()?heroSplashUrl(id):'';
  const heroColor=hexColor(G.char?.color??0x6fd9ff);
  splash.style.backgroundImage=src?'url("'+src+'")':'none';
  screen.style.setProperty('--end-hero-color',heroColor);
}
function endBoardId(){
  const di=LB_DIFFS.indexOf(G.diff);
  const tier=lbTier();
  return di>=0 && (tier===0||tier===2) ? di*3+tier : -1;
}
function updateEndRank(){
  const el=$('#endRank'); if(!el) return;
  if(!runIsRankable()){ el.textContent='—'; el.title='Sandbox runs are not ranked'; return; }
  const boardId=endBoardId();
  if(boardId<0){ el.textContent='—'; return; }
  const c=LB.cache[boardId];
  const score=Math.floor(G.score),kills=Math.floor(G.kills),time=Math.floor(G.time),level=G.level+1;
  const exact=c?.entries?.find(e=>e.token===LB.token && e.score===score && e.kills===kills && e.time===time && e.level===level);
  if(exact){
    el.textContent='#'+(exact.boardRank||exact.scoreRank||1).toLocaleString();
    el.title='Exact leaderboard rank for this run';
    return;
  }
  if(c){
    const est=lbEstimateRank(score,[boardId]);
    el.textContent='~#'+lbFmtCount(est.rank);
    el.title='Estimated rank from lifetime leaderboard history';
  }else{
    el.textContent=LB.opened?'…':'—';
    el.title=LB.opened?'Loading leaderboard rank':'Rank unavailable while offline';
  }
}
function refreshEndRank(){
  updateEndRank();
  const boardId=endBoardId();
  if(boardId>=0 && LB.opened && LB.socket) lbRequestPage(boardId,0,true,0).then(updateEndRank);
}

function awardSurvivalClear(){
  G.score += 500 * G.mult;
  G.gold += 1200;
}

function finalClearMode(){
  if(!G.finalBossDefeated) return 'survival';
  if(G.finalBossMode==='apexSeven') return 'apex7';
  if(G.finalBossMode==='bahamut') return 'dragon';
  return 'survival';
}

function finalClearSpeedFactor(mode,time=G.time){
  if(mode==='survival') return 0;
  const s=SCORE_BALANCE.speed;
  const span=Math.max(1,s.zeroAt-s.fullAt);
  const linear=clamp((s.zeroAt-(Number(time)||0))/span,0,1);
  return Math.pow(linear,s.curve);
}

function settleRunScoreAndCredits(){
  if(G.scoreSettled && G.scoreBreakdown) return G.scoreBreakdown;

  const diffCfg=SCORE_BALANCE.difficulty[G.diff]||SCORE_BALANCE.difficulty.Normal;
  const mode=finalClearMode();
  const modeCfg=SCORE_BALANCE.ending[mode]||SCORE_BALANCE.ending.survival;
  const rawScore=Math.max(0,Math.floor(Number(G.score)||0));
  const rawCredits=runGoldToCredits();
  const speedFactor=finalClearSpeedFactor(mode);
  const paceMult=1+modeCfg.paceBonus*speedFactor;
  const flatSpeedScore=Math.round(modeCfg.flatScore*speedFactor);
  const preDifficultyScore=Math.round(rawScore*paceMult+flatSpeedScore);
  const finalScore=Math.min(SCORE_MAX,Math.max(0,Math.round(preDifficultyScore*diffCfg.score)));
  const baseCredits=Math.max(0,Math.round(rawCredits*diffCfg.credits));
  const speedCredits=Math.max(0,Math.round(modeCfg.speedCredits*speedFactor));
  const finalCredits=baseCredits+speedCredits;

  G.score=finalScore;
  G.runCredits=finalCredits;
  G.scoreSettled=true;
  G.scoreBreakdown={
    rawScore, rawCredits, preDifficultyScore, finalScore, finalCredits, baseCredits, speedCredits,
    difficulty:G.diff, difficultyScoreMult:diffCfg.score, difficultyCreditMult:diffCfg.credits,
    mode, paceMult, flatSpeedScore, speedFactor, time:Math.floor(G.time),
  };
  return G.scoreBreakdown;
}

function renderEndScoreBreakdown(b){
  const el=$('#endScoreBreak');
  if(!el) return;
  if(!b || !runIsRankable()){ el.hidden=true; el.innerHTML=''; return; }

  const diffLabel=(b.difficulty||'Normal').toUpperCase();
  const modeLabel=b.mode==='dragon'?'DRAGON CLEAR':(b.mode==='apex7'?'APEX SEVEN CLEAR':'RUN');
  const speedPct=Math.round(b.speedFactor*100);
  const speedRows=b.mode==='survival' ? '' :
    '<div class="sbRow sbSpeed"><span>PACE</span><b>×'+b.paceMult.toFixed(2)+'</b></div>'+
    '<div class="sbRow sbSpeed"><span>SPEED BONUS</span><b>+'+b.flatSpeedScore.toLocaleString()+'</b></div>';
  const speedNote=b.mode==='survival' ? '' :
    '<div class="sbSpeedNote">'+modeLabel+' · '+b.time+'s · SPEED REWARD '+speedPct+'% · FULL ≤600s · ZERO ≥900s · HARD STOP 999s</div>';

  el.innerHTML=
    '<div class="sbtitle"><span>SCORE MAP</span><span class="sbDiff">'+diffLabel+' ×'+b.difficultyScoreMult.toFixed(2)+'</span></div>'+
    '<div class="sgrid">'+
      '<div class="sbRow"><span>RAW SCORE</span><b>'+b.rawScore.toLocaleString()+'</b></div>'+
      speedRows+
      '<div class="sbRow"><span>PRE-DIFFICULTY</span><b>'+b.preDifficultyScore.toLocaleString()+'</b></div>'+
      '<div class="sbRow"><span>FINAL SCORE</span><b>'+b.finalScore.toLocaleString()+'</b></div>'+
      '<div class="sbRow"><span>BASE CR</span><b>'+b.rawCredits.toLocaleString()+' ×'+b.difficultyCreditMult.toFixed(2)+'</b></div>'+
      '<div class="sbRow"><span>SPEED CR</span><b>+'+b.speedCredits.toLocaleString()+'</b></div>'+
      '<div class="sbRow"><span>FINAL CR</span><b>'+b.finalCredits.toLocaleString()+'</b></div>'+
    '</div>'+speedNote;
  el.hidden=false;
}

function finalChallengeTimeout(){
  if(G.state!=='arena' || G.finalBossDefeated) return;
  G.state='end';
  G.simPaused=true;
  G.time=FINAL_CHALLENGE_TIMEOUT;
  AUD.stopBGM();
  AUD.win();
  awardSurvivalClear();

  const apexSevenFail=G.finalBossMode==='apexSeven';
  const heroName=G.char?.name||'YOUR HERO';
  G.endResult={
    win:true,
    nextDiff:null,
    bahamutWin:false,
    apexSevenWin:false,
    challengeFailed:true,
    timedOut:true,
    failedChallenge:G.finalBossMode,
    ending:apexSevenFail?'apex7-failed':'dragon-failed',
  };
  $('#endKicker').textContent='⏱ 999s HARD LIMIT · INSANE CLEAR';
  $('#endTitle').textContent='FINAL EXAM TIMED OUT';
  $('#endTitle').className='endTitle partial';
  $('#endSub').textContent=apexSevenFail
    ? heroName+' survived the run, but the APEX SEVEN were not all defeated before the 999-second hard stop. INSANE clear secured; Apex Seven Conqueror not earned.'
    : heroName+' survived the run, but BAHAMUT was not defeated before the 999-second hard stop. INSANE clear secured; Dragon Conqueror not earned.';
  showEndScreen();
}

function gameOver(){
  G.state='end';
  G.simPaused = true;
  AUD.stopBGM();

  const challengeFailed = !!(G.finalBossEligible && G.finalBossSpawned && !G.finalBossDefeated && G.time>=WIN_TIME);
  if(challengeFailed){
    AUD.win();
    awardSurvivalClear();
    const apexSevenFail = G.finalBossMode==='apexSeven';
    const heroName = G.char?.name||'YOUR HERO';
    G.endResult = {
      win:true,
      nextDiff:null,
      bahamutWin:false,
      apexSevenWin:false,
      challengeFailed:true,
      failedChallenge:G.finalBossMode,
      ending:apexSevenFail?'apex7-failed':'dragon-failed',
    };
    $('#endKicker').textContent = '🔥 INSANE CLEAR · FINAL CHALLENGE FAILED';
    $('#endTitle').textContent = 'SURVIVAL COMPLETE';
    $('#endTitle').className = 'endTitle partial';
    $('#endSub').textContent = apexSevenFail
      ? heroName+' survived 500 seconds and triggered the APEX SEVEN, but fell before defeating all seven. INSANE clear secured; Apex Seven Conqueror not earned.'
      : heroName+' survived 500 seconds and triggered BAHAMUT, but fell before conquering the dragon. INSANE clear secured; Dragon Conqueror not earned.';
    showEndScreen();
    return;
  }

  AUD.lose();
  G.endResult = { win:false, ending:'defeat' };
  $('#endKicker').textContent = 'RUN ENDED';
  $('#endTitle').textContent = 'YOU DIED';
  $('#endTitle').className = 'endTitle lose';
  $('#endSub').textContent = (G.char?.name||'Your hero')+' fell after '+Math.floor(G.time)+' seconds.';
  showEndScreen();
}

function winGame(){
  G.state='end';
  G.simPaused = true;
  AUD.stopBGM();
  AUD.win();
  awardSurvivalClear();
  const diffs = ['Easy','Normal','Hard','Insane'];
  const ni = diffs.indexOf(G.diff);
  const nextDiff = (ni>=0 && ni<diffs.length-1) ? diffs[ni+1] : null;
  const bahamutWin = !!G.finalBossDefeated && G.finalBossMode==='bahamut';
  const apexSevenWin = !!G.finalBossDefeated && G.finalBossMode==='apexSeven';
  const ending=apexSevenWin?'apex7':(bahamutWin?'dragon':(G.diff==='Insane'?'insane':'success'));
  G.endResult = { win:true, nextDiff, bahamutWin, apexSevenWin, ending };
  const unlockBahamut = bahamutWin && runIsRankable() && !SAVE.bahamutCleared;
  if(unlockBahamut){ SAVE.bahamutCleared=true; saveGame(); }
  const heroName=G.char?.name||'YOUR HERO';
  $('#endTitle').className = 'endTitle win'+((bahamutWin||apexSevenWin)?' legendary':'');
  if(apexSevenWin){
    $('#endKicker').textContent='⚔ APEX SEVEN DEFEATED';
    $('#endTitle').textContent='CONGRATULATIONS!';
    $('#endSub').textContent=heroName+' survived INSANE and defeated RAJA, MANE, GRIZZ, FANG, FOXY, VAL and TALON together.';
  }else if(bahamutWin){
    $('#endKicker').textContent='🐉 DRAGON CONQUERED';
    $('#endTitle').textContent='CONGRATULATIONS!';
    $('#endSub').textContent=unlockBahamut
      ? heroName+' defeated BAHAMUT. PLAYABLE BAHAMUT is now unlocked for purchase in the Hub for '+BAHAMUT_HUB_PRICE.toLocaleString()+' CR.'
      : heroName+' defeated BAHAMUT and cleared the final exam.';
  }else if(G.diff==='Insane'){
    $('#endKicker').textContent='🔥 INSANE CLEAR';
    $('#endTitle').textContent='INSANE SURVIVED!';
    $('#endSub').textContent=heroName+' survived the full 500 seconds on INSANE.';
  }else{
    $('#endKicker').textContent='MISSION COMPLETE · '+G.diff.toUpperCase();
    $('#endTitle').textContent='YOU SURVIVED!';
    $('#endSub').textContent=nextDiff
      ? heroName+' survived 500 seconds. '+DIFFS[nextDiff].label+' is ready when you are.'
      : heroName+' survived 500 seconds. The lab is yours.';
  }
  showEndScreen();
}

function submitEndLeaderboard(){
  const st=$('#lbStatus');
  const prompt=$('#endNamePrompt');
  if(!runIsRankable()){
    if(prompt) prompt.hidden=true;
    if(st) st.textContent = (G.testMode||G.debugInvalidated)
      ? '🧪 TRAINING — FAKE SCORE / GOLD ARE NOT RECORDED'
      : '🧪 SANDBOX RUN — NOT RANKED, NO REWARDS';
    return;
  }
  if(!LB.name){
    if(prompt){
      prompt.hidden=false;
      const inp=$('#endNameInput');
      if(inp && !inp.value) inp.value=lbSuggestedBunnyName();
      setTimeout(()=>inp?.focus(),0);
    }
    if(st) st.textContent='🏆 NAME THIS RUN BEFORE IT IS RECORDED';
    return;
  }
  if(prompt) prompt.hidden=true;
  if(st) st.textContent = LB.opened ? '🏆 SYNCING RECORD…' : '🏆 RECORD WILL SYNC WHEN ONLINE';
  const sub=lbSubmitRun();
  if(!sub) return;
  sub.p.then(res=>{
    updateEndRank();
    if(!st) return;
    if(res==='submitted'){
      const c=LB.cache[sub.boardId];
      const my=c && c.entries.filter(x=>x.token===LB.token).sort((a,b)=>(a.scoreRank||9999)-(b.scoreRank||9999))[0];
      st.textContent=my
        ? '🏆 RECORD SAVED · '+lbOrdinal(my.scoreRank||c.myRank)+' · '+lbTopPercent(my.scoreRank||c.myRank,c.entries.length)+' — '+LB_DIFFS[sub.di].toUpperCase()+(sub.tier===2?' · OP':' · CLEAN')
        : '🏆 RECORD SAVED';
    } else if(res==='queued'){ st.textContent='🏆 QUEUED — WILL SYNC WHEN ONLINE'; }
    else { st.textContent='🏆 COULD NOT REACH SERVER'; }
  });
}

function showEndScreen(){
  const scoreResult=settleRunScoreAndCredits();
  bankRunGold();
  $('#endScreen').dataset.ending=G.endResult?.ending||'defeat';
  renderEndSplash();
  $('#endScore').textContent = Math.floor(G.score).toLocaleString();
  $('#endGold').textContent = Math.floor(G.gold).toLocaleString();
  $('#endCredits').textContent = '+'+scoreResult.finalCredits.toLocaleString()+' CR';
  $('#endKills').textContent = G.kills.toLocaleString();
  $('#endTime').textContent = Math.floor(G.time)+'s'+(G.endResult?.win?' ★':'');
  $('#endLevel').textContent = G.level+1;
  renderEndScoreBreakdown(scoreResult);
  $('#endCommunity').innerHTML='';
  if(G.endResult?.win){
    communityRenderEnd();
    communityRecordEnd();
  }
  const harder = G.endResult && G.endResult.win && G.endResult.nextDiff;
  $('#retryBtn').textContent = harder ? '▲ MAKE IT HARDER' : '↻ TRY AGAIN';
  const endNamePrompt=$('#endNamePrompt');
  if(endNamePrompt) endNamePrompt.hidden=true;
  const endNameInput=$('#endNameInput');
  if(endNameInput) endNameInput.value='';
  setScreen('end');
  refreshEndRank();
  submitEndLeaderboard();
}

// ---------------- Main loop ----------------
function sceneAdd(o){ G.scene.add(o); }
function sceneRemove(o){ G.scene.remove(o); o.traverse && o.traverse(x=>{ if(x.isMesh || x.isSprite || x.isPoints){ x.geometry && x.geometry.dispose && x.geometry.dispose(); if(x.material && x.material.map && x.material.map!==G.radialTex){} } }); }

let lastFrame = 0;

let vigEl = null;
const _vigV = new THREE.Vector3();
let _vigNextMs=0, _vigLastCss='', _vigLastX=NaN, _vigLastZ=NaN, _vigLastVis=NaN, _vigLastW=0, _vigLastH=0;
function updateVig(force=false){
  if(!vigEl) vigEl = document.querySelector('#vig');
  if(!vigEl) return;
  const m = G.heroMesh;
  if(!m){ if(_vigLastCss!==''){ vigEl.style.background=''; _vigLastCss=''; } return; }
  const now=performance.now();
  const vis=clamp(Number(SAVE?.arenaVisibility??50),0,100);
  const moved=!Number.isFinite(_vigLastX) || Math.abs(m.position.x-_vigLastX)>1.5 || Math.abs(m.position.z-_vigLastZ)>1.5;
  const changed=vis!==_vigLastVis || innerWidth!==_vigLastW || innerHeight!==_vigLastH;
  if(!force && !changed && (!moved || now<_vigNextMs)) return;
  _vigNextMs=now+(isCoarse()?80:45);
  _vigLastX=m.position.x; _vigLastZ=m.position.z; _vigLastVis=vis; _vigLastW=innerWidth; _vigLastH=innerHeight;
  _vigV.copy(m.position).project(G.camera);
  const w=innerWidth,h=innerHeight;
  const px=(_vigV.x+1)*0.5*w;
  const py=(1-_vigV.y)*0.5*h;
  const R=Math.max(w,h)*0.55;
  const shade=clamp(1.22-vis*0.008,0.42,1.18);
  const a1=(0.05*shade).toFixed(3),a2=(0.55*shade).toFixed(3),a3=Math.min(0.98,0.93*shade).toFixed(3),a4=Math.min(0.99,0.97*shade).toFixed(3);
  const css='radial-gradient('+R+'px '+R+'px at '+px.toFixed(0)+'px '+py.toFixed(0)+'px, rgba(3,5,9,0) 0%, rgba(3,5,9,'+a1+') 16%, rgba(3,5,9,'+a2+') 38%, rgba(2,4,8,'+a3+') 70%, rgba(2,4,8,'+a4+') 100%)';
  if(css!==_vigLastCss){ vigEl.style.background=css; _vigLastCss=css; }
}
function renderPauseVisibility(){
  const panel=$('#pauseVisibilityPanel'),inp=$('#arenaVisibility');
  if(!panel||!inp) return;
  panel.hidden=!(G.state==='paused');
  inp.value=String(Math.round(clamp(Number(SAVE.arenaVisibility)||50,0,100)));
  const val=$('#arenaVisibilityValue'); if(val) val.textContent=inp.value+'%';

  const q=String(SAVE.mobileGraphicsQuality||'original');
  document.querySelectorAll('#mobileGraphicsQualitySeg .segBtn').forEach(b=>{
    b.classList.toggle('active',b.dataset.q===q);
  });
}
function loop(ts){
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, G.clock.getDelta());
  lastFrame = ts;

  // Menu/customize/hub/training setup live in G.state === 'menu'.
  // Do not render the arena behind those UI screens; the Home splash is its own background layer.
  const gameCtn=$('#gameCtn');
  if(G.state==='menu'){
    if(gameCtn && gameCtn.style.visibility!=='hidden') gameCtn.style.visibility='hidden';
    return;
  }
  if(gameCtn && gameCtn.style.visibility!=='visible') gameCtn.style.visibility='visible';

  if(G.state==='arena' && !G.simPaused){
    G.time += dt;
    updateInsaneBerserkCue();
    G.score += dt * G.mult;
    updateHero(dt);    updateSpawning(dt);
    updateEnemies(dt);
    updateBullets(dt);
    updateEnemyBullets(dt);
    updateOrbs(dt);
    updateSummons(dt);
    updatePerkActives(dt);
    updateClouds(dt);
    updateEffects(dt);
    updateMagnetGhosting();
    updateParticles(dt);
    if(!G.testMode && G.time >= WIN_TIME && G.state==='arena'){
      if(G.finalBossEligible){
        if(!G.finalBossSpawned){
          if(G.finalBossMode==='apexSeven') spawnApexSevenFinal();
          else spawnBahamutFinal();
        }else if(G.finalBossDefeated){
          winGame();
        }else{
          if(G.time>=FINAL_TIMEOUT_WARN_AT && !G.finalTimeoutWarned){
            G.finalTimeoutWarned=true;
            startNotice('⏱ FINAL EXAM · 99s REMAIN · HARD STOP AT 999s',{tone:'danger',life:9000});
            banner('⏱ 99s REMAIN');
          }
          if(G.time>=FINAL_TIMEOUT_URGENT_AT && !G.finalTimeoutUrgentWarned){
            G.finalTimeoutUrgentWarned=true;
            startNotice('☠ FINAL EXAM · 29s REMAIN',{tone:'final',life:9000});
            banner('☠ 29s REMAIN');
          }
          if(G.time>=FINAL_CHALLENGE_TIMEOUT) finalChallengeTimeout();
        }
      } else winGame();
    }
    const remain = WIN_TIME - G.time;
    if(!G.testMode && remain <= 30 && remain > 0 && !G.finalBossActive){
      const sec = Math.ceil(remain);
      if(sec !== G.lastTickSec){ G.lastTickSec = sec; AUD.tick(sec); }
    }
  } else if(G.state==='end'){
    updateParticles(dt);
  }

  // fixed camera: the whole arena is always on screen, only screen shake moves it
  G.shake *= Math.exp(-7*dt);
  const sx = (Math.random()-0.5)*2*G.shake*10;
  const sz = (Math.random()-0.5)*2*G.shake*10;
  G.camera.position.set(sx, CAM_OFF.y, CAM_OFF.z+sz);
  G.camera.lookAt(0, 0, 0);

  G.renderer.render(G.scene, G.camera);
  updateVig();
  updateHUD();
}

function updateClouds(dt){
  for(const c of G.clouds){
    if(c.dead) continue;
    c.t += dt;
    if(c.pool){
      // VENOM POOL: the shared toxic-cloud look - the SAME mesh, the same fade and the same slow
      // growth as a full cloud, just much smaller (drawn at visR) and shorter-lived. Poison ticks
      // on an interval rather than every frame, so stacks build over about a second instead of
      // capping instantly.
      const k = clamp(c.t/c.life, 0, 1);
      // A caught enemy stirs the pool: a brief brightening so the tick is legible. Decays so the
      // flash cannot leave the cloud permanently brighter than a real one.
      c.kick = Math.max(0, (c.kick||0) - dt*1.1);
      c.mat.opacity = Math.min(CLOUD_OPACITY, CLOUD_OPACITY*(1-k) + c.kick);
      c.mesh.scale.setScalar(1 + k*0.5);
      c.tick -= dt;
      if(c.tick<=0){
        c.tick += c.tickEvery;
        // Each tick stirs up a couple of slow rising motes, so a stationary pool still visibly
        // bubbles instead of sitting there as a static image.
        for(let i=0;i<2;i++){
          const ba=Math.random()*Math.PI*2, bd=(c.visR||c.radius)*Math.random()*0.7;
          burst(c.x+Math.cos(ba)*bd, 2.4, c.z+Math.sin(ba)*bd, 0xa8ff6a, 1, 14, 1.6, 0.6);
        }
        for(const e of G.enemies){
          if(e.dead) continue;
          if(dist2(e.x,e.z,c.x,c.z) < c.radius*c.radius){
            applyPoison(e,c.dps,1.6);
            c.kick = 0.14;
          }
        }
      }
    } else {
      const k = c.t/c.life;
      c.mesh.material.opacity = CLOUD_OPACITY*(1-k);
      c.mesh.scale.setScalar(1 + k*0.5);
      for(const e of G.enemies){
        if(e.dead) continue;
        if(dist2(e.x,e.z,c.x,c.z) < CLOUD_RADIUS*CLOUD_RADIUS){
          applyPoison(e,10*G.hero.mods.poison*(c.damageMult||1),1);
        }
      }
    }
    if(c.t>=c.life){ sceneRemove(c.mesh); c.dead=true; }
  }
  G.clouds = G.clouds.filter(c=>!c.dead);
}

// ---------------- Music tracks ----------------
// 5 dark/intense electronic tracks generated with perchance's generate_music (dubstep battle, brooding menu,
// neurofunk boss, dark-orchestral victory, gritty synthwave). Rebuild recipe: regenerate similar moods,
// upload the mp3s, swap the URLs below.
const MUSIC = [
  { id:'random', name:'RANDOM', url:null, desc:'Random soundtrack each run' },
  { id:'d2', name:'SHADOW PROLOGUE', url:'https://user.uploads.dev/file/ffc5a5ad8ed0eacb12bbce26dea90584.mp3', desc:'Brooding electronic pulse, 110 BPM' },
  { id:'d3', name:'BOSS RAMPAGE',  url:'https://user.uploads.dev/file/5534e73dfe78dea3de7f2917b694dea0.mp3', desc:'Neurofunk DnB assault, 175 BPM' },
  { id:'d4', name:'DAWN OF CHAOS', url:'https://user.uploads.dev/file/bcf7bd0cea673c9639540116e47a2108.mp3', desc:'Dark orchestral-electronic anthem' },
  { id:'d5', name:'NEON SAVAGE',   url:'https://user.uploads.dev/file/4b979aa3f75841c12c7d88dbabee213a.mp3', desc:'Gritty dark synthwave, 130 BPM' },
];

// ---------------- HUB shop / persistence ----------------
// persistent "Credits" currency (GDevelop storage file "tinyalch"/"gold", game var 1)
// spent in its HUB. Its HUB backbling lockers (game var 5, charunlock "bone"/"lightbag"/
// etc. keys) are DEAD content — the selection room never reads those keys — so we port
// only the WORKING purchases: gems (gemunlock keys, 1000 each), heroes (charunlock,
// enter a persistent stockpile when bought and are consumed only after explicit equip + deploy.
const SAVE_KEY = 'bb_hub_save_v1';
const HERO_PRICE = 2500, GUN_PRICE = 1500, GEM_PRICE = 1000;
const FREE_GUNS = new Set(['rustyp','zneeke','zapper','bouncecannon','bonebarrel','salamandro']);
const HUB_SHOP = {
  gems: GEMS.filter(g=>g.id!=='green').map(g=>({ id:g.id, cat:'gems', icon:'💎', color:g.color, name:g.name, desc:g.desc, price:GEM_PRICE })),
  heroes: ['mag','bones','porter','payne','haze','mo','raja','mane','grizz','fang','foxy','val','talon','bahamut'].map(id=>{ const c=CHARACTERS.find(x=>x.id===id); return { id, cat:'heroes', icon:c.icon||'🐰', color:c.color, name:c.name, desc:c.passiveDesc, price:c.price||HERO_PRICE }; }),
  guns: GUNS.filter(g=>!FREE_GUNS.has(g.id)).map(g=>({ id:g.id, cat:'guns', icon:weaponIcon(g), color:g.color, name:g.name, desc:gunCardSubtitle(g), price:g.price||GUN_PRICE })),
  vending: [
    { id:'v1', cat:'vending', icon:'🧪', color:0x8fd4ff, name:'CURSED CRYSTAL', price:500, desc:'Damage Reduction +25% · Move Speed −40%' },
    { id:'v2', cat:'vending', icon:'🐾', color:0xe8e8e0, name:"SUMMONER'S MARK", price:500, desc:'Summon Damage +50% · Weapon Damage −25%' },
    { id:'v3', cat:'vending', icon:'☠️', color:0x6fbf4f, name:'POISONED TOOTH', price:500, desc:'Poison Damage +50% · Weapon Damage −10%' },
    { id:'v4', cat:'vending', icon:'🥤', color:0xc9a86a, name:'BANDOLIER', price:750, desc:'Max Ammo +50% · Reload Time +15%' },
    { id:'v5', cat:'vending', icon:'❤️‍🔥', color:0xff5a5a, name:'RAGE PUMP', price:500, desc:'Weapon Damage +25% · Max HP −25' },
    { id:'v6', cat:'vending', icon:'🫀', color:0xff8f4f, name:'GRIZZLED HEART', price:750, desc:'Weapon Damage +50% · Max HP −50' },
    { id:'v7', cat:'vending', icon:'⚡', color:0xffd166, name:'OVERCLOCK', price:750, desc:'+3 Super Uses · Super Recharge Time +25%' },
    { id:'v8', cat:'vending', icon:'💥', color:0xffb0d0, name:'BRUTAL PACT', price:750, desc:'Knockback +15% · +1 Knockback Mastery · Damage Reduction −10%' },
    { id:'v9', cat:'vending', icon:'🚀', color:0x6aa3ff, name:'HAIR TRIGGER', price:750, desc:'Fire Rate +33% · Reload Time +25%' },
    { id:'v10', cat:'vending', icon:'🔥', color:0xff7a3d, name:'MOLTEN ROUNDS', price:750, desc:'+7 Fire Damage · Weapon Damage −10% · Max HP −10' },
  ],
};
const VENDING_EQUIP_LIMIT = 3;
function defaultSave(){
  return {
    credits:0,
    gems:['green'],
    heroes:['pulse','nikki','blink','rooty'],
    guns:[...FREE_GUNS],
    // Compatibility field migrated into vending stock on load.
    vending:[],
    vendingStock:{},
    vendingEquipped:[],
    // true = the equipped list was set by hand in CUSTOMIZE and has not been deployed yet, so
    // deploying must not re-ask about it. false = carried over from a finished run, which is
    // what triggers the "use your cursed gear again?" prompt on the next deploy.
    vendingFresh:false,
    bahamutCleared:false,
    heroSkins:{},
    arenaVisibility:50,
    mobileGraphicsQuality:'original',
    lastSelection:null,
    trainingSelection:null,
  };
}
let SAVE = defaultSave();
function loadSave(){
  let migrated=false;
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(raw) SAVE=Object.assign(defaultSave(), JSON.parse(raw));
  }catch(e){}
  for(const g of FREE_GUNS){ if(!SAVE.guns.includes(g)) SAVE.guns.push(g); }
  SAVE.bahamutCleared=!!SAVE.bahamutCleared;
  SAVE.arenaVisibility=clamp(Number(SAVE.arenaVisibility)||50,0,100);
  if(!MOBILE_GRAPHICS_CRUNCH[SAVE.mobileGraphicsQuality]) SAVE.mobileGraphicsQuality='original';
  if(!SAVE.heroSkins || typeof SAVE.heroSkins!=='object' || Array.isArray(SAVE.heroSkins)) SAVE.heroSkins={};
  const cleanHeroSkins={};
  for(const [cid,id] of Object.entries(SAVE.heroSkins)){ const s=heroSkinById(cid,id); if(s && s.id===id) cleanHeroSkins[cid]=id; }
  SAVE.heroSkins=cleanHeroSkins;

  const valid=new Set(HUB_SHOP.vending.map(v=>v.id));
  const cleanStock={};
  if(SAVE.vendingStock && typeof SAVE.vendingStock==='object' && !Array.isArray(SAVE.vendingStock)){
    for(const [id,value] of Object.entries(SAVE.vendingStock)){
      if(!valid.has(id)) continue;
      const n=Math.max(0,Math.floor(Number(value)||0));
      if(n) cleanStock[id]=n;
    }
  }
  SAVE.vendingStock=cleanStock;

  // Pending purchase data migrates into inventory copies without auto-equip.
  // the whole purpose of this migration is to stop purchase from implying use.
  if(Array.isArray(SAVE.vending) && SAVE.vending.length){
    for(const id of SAVE.vending){ if(valid.has(id)) SAVE.vendingStock[id]=(SAVE.vendingStock[id]||0)+1; }
    SAVE.vending=[];
    migrated=true;
  }

  SAVE.vendingEquipped=[...new Set(Array.isArray(SAVE.vendingEquipped)?SAVE.vendingEquipped:[])]
    .filter(id=>valid.has(id) && (SAVE.vendingStock[id]||0)>0)
    .slice(0,VENDING_EQUIP_LIMIT);
  SAVE.vendingFresh=!!SAVE.vendingFresh;

  if(migrated) saveGame();
}
function saveGame(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); }catch(e){} }

const DEFAULT_SELECTION = { char:'pulse', gun:'rustyp', gem:'green', diff:'Normal', music:'random', gunPicked:false };
const DEFAULT_TRAINING_SELECTION = Object.freeze({
  char:'pulse',
  gun:'rustyp',
  gem:'green',
  diff:'Normal',
  perks:[],
  gear:[],
  scoreDie:true,
});

function sanitizeTrainingSelection(raw){
  const s=(raw && typeof raw==='object') ? raw : {};
  const out={
    char:CHARACTERS.some(c=>c.id===s.char) ? s.char : DEFAULT_TRAINING_SELECTION.char,
    gun:GUNS.some(g=>g.id===s.gun) ? s.gun : DEFAULT_TRAINING_SELECTION.gun,
    gem:GEMS.some(g=>g.id===s.gem) ? s.gem : DEFAULT_TRAINING_SELECTION.gem,
    diff:DIFFS[s.diff] ? s.diff : DEFAULT_TRAINING_SELECTION.diff,
    perks:[],
    gear:[],
    scoreDie:s.scoreDie!==false,
  };
  const validPerks=new Set(PERKS.map(p=>p.id));
  out.perks=[...new Set(Array.isArray(s.perks)?s.perks:[])].filter(id=>validPerks.has(id));
  const validGear=new Set(HUB_SHOP.vending.map(v=>v.id));
  out.gear=[...new Set(Array.isArray(s.gear)?s.gear:[])]
    .filter(id=>validGear.has(id))
    .slice(0,VENDING_EQUIP_LIMIT);
  return out;
}

function persistTrainingSelection(){
  G.testSel=sanitizeTrainingSelection(G.testSel);
  SAVE.trainingSelection={
    char:G.testSel.char,
    gun:G.testSel.gun,
    gem:G.testSel.gem,
    diff:G.testSel.diff,
    perks:[...G.testSel.perks],
    gear:[...G.testSel.gear],
    scoreDie:G.testSel.scoreDie!==false,
  };
  saveGame();
}

function restoreTrainingSelection(){
  G.testSel=sanitizeTrainingSelection(SAVE.trainingSelection);
}

function persistLastSelection(){
  if(!G.sel) return;
  SAVE.lastSelection={
    char:G.sel.char,
    gun:G.sel.gun,
    gem:G.sel.gem,
    diff:G.sel.diff,
    music:G.sel.music,
    gunPicked:!!G.sel.gunPicked,
  };
  saveGame();
}
function restoreLastSelection(){
  const raw=(SAVE.lastSelection && typeof SAVE.lastSelection==='object') ? SAVE.lastSelection : {};
  const sel={...DEFAULT_SELECTION,...raw};
  if(!CHARACTERS.some(c=>c.id===sel.char) || !ownsHero(sel.char)) sel.char=DEFAULT_SELECTION.char;
  if(!GUNS.some(g=>g.id===sel.gun) || !ownsGun(sel.gun)) sel.gun=DEFAULT_SELECTION.gun;
  if(!GEMS.some(g=>g.id===sel.gem) || !ownsGem(sel.gem)) sel.gem=DEFAULT_SELECTION.gem;
  if(!DIFFS[sel.diff]) sel.diff=DEFAULT_SELECTION.diff;
  if(!MUSIC.some(m=>m.id===sel.music)) sel.music=DEFAULT_SELECTION.music;
  sel.gunPicked=!!sel.gunPicked;
  G.sel=sel;
}
function syncSelectionMenuUi(){
  document.querySelectorAll('#diffSeg .segBtn').forEach(b=>b.classList.toggle('active',b.dataset.d===G.sel.diff));
}
const ownsGem = id => SAVE.gems.includes(id);
const ownsHero = id => SAVE.heroes.includes(id);
const ownsGun = id => SAVE.guns.includes(id);
const vendingStock = id => Math.max(0,Math.floor(Number(SAVE.vendingStock[id])||0));
const equipsVending = id => SAVE.vendingEquipped.includes(id);
const bahamutPurchaseUnlocked = () => !!SAVE.bahamutCleared;
function hubItemOwned(it){ if(it.cat==='gems') return ownsGem(it.id); if(it.cat==='heroes') return ownsHero(it.id); if(it.cat==='guns') return ownsGun(it.id); return false; }
function hubItemPrereqMet(it){ return it.id!=='bahamut' || bahamutPurchaseUnlocked(); }
function buyHubItem(it){
  if(!hubItemPrereqMet(it)) return false;
  if(SAVE.credits<it.price) return false;
  if(it.cat!=='vending' && hubItemOwned(it)) return false;
  SAVE.credits -= it.price;
  if(it.cat==='gems') SAVE.gems.push(it.id);
  else if(it.cat==='heroes') SAVE.heroes.push(it.id);
  else if(it.cat==='guns') SAVE.guns.push(it.id);
  else SAVE.vendingStock[it.id]=vendingStock(it.id)+1;
  saveGame();
  const communityKey=communityOwnershipKey(it);
  if(communityKey){ communityBump(communityKey); communityReportOwnership(); }
  AUD.ui();
  return true;
}
function toggleVendingEquip(id){
  if(vendingStock(id)<=0) return false;
  const i=SAVE.vendingEquipped.indexOf(id);
  // Hand-editing the list always marks it FRESH: the player has just said what they want, so
  // the next deploy carries it out without asking them again. Only a list inherited from a
  // finished run gets the confirm prompt (see showCursedGearPrompt).
  if(i>=0){ SAVE.vendingEquipped.splice(i,1); SAVE.vendingFresh=true; saveGame(); return true; }
  if(SAVE.vendingEquipped.length>=VENDING_EQUIP_LIMIT) return false;
  SAVE.vendingEquipped.push(id);
  SAVE.vendingFresh=true;
  saveGame();
  return true;
}
// The remembered loadout, filtered to the copies that actually still exist in the stockpile.
function rememberedCursedGear(){
  return SAVE.vendingEquipped.filter(id=>vendingStock(id)>0);
}
// One-run cursed equipment: stockpiled on purchase, selected in Customize, consumed
// only when beginRun() actually deploys that equipped loadout.
function applyVending(id){
  const h = G.hero;
  switch(id){
    case 'v1': h.mods.armor+=0.25; h.mods.speed*=0.6; break;
    case 'v2': h.mods.summon*=1.5; h.mods.dmg*=0.75; break;
    case 'v3': h.mods.poison*=1.5; h.mods.dmg*=0.9; break;
    case 'v4': h.maxAmmo=Math.ceil(h.maxAmmo*1.5); h.ammo=Math.min(h.maxAmmo,h.ammo); h.mods.reload*=1.15; break;
    case 'v5': h.mods.dmg*=1.25; h.maxHp=Math.max(10,h.maxHp-25); break;
    case 'v6': h.mods.dmg*=1.5; h.maxHp=Math.max(10,h.maxHp-50); break;
    case 'v7': h.super.maxUses+=3; h.super.uses+=3; h.super.chargeMax*=1.25; break;
    case 'v8': h.mods.kb*=1.15; G.masteryBonus.Knockback=(G.masteryBonus.Knockback||0)+1; h.mods.armor=Math.max(0,h.mods.armor-0.10); break;
    case 'v9': h.mods.fire*=0.75; h.mods.reload*=1.25; break;
    case 'v10': h.flatDmg+=7; h.mods.dmg*=0.9; h.maxHp=Math.max(10,h.maxHp-10); break;
  }
  h.hp = Math.min(h.hp, h.maxHp);
}
function runGoldToCredits(rawGold=G.gold){
  return Math.max(0,Math.floor((Number(rawGold)||0)/RUN_GOLD_PER_CREDIT));
}
function bankRunGold(){
  if(!runIsRankable() || G.runBanked) return;
  const earned=G.scoreSettled ? Math.max(0,Math.floor(G.runCredits||0)) : runGoldToCredits();
  G.runBanked=true;
  if(earned>0){ SAVE.credits += earned; saveGame(); }
}
function updateMenuCredits(){ const el=$('#menuCredits'); if(el) el.textContent=SAVE.credits; }

let hubTab='heroes';
function showHub(){
  AUD.init(); AUD.resume();
  setScreen('hub');
  renderHub();
}
const DEBUG_SOUNDS = [
  { name:'TICK (last 30s)',   fn:()=>AUD.tick(30) },
  { name:'TICK (final 5s)',   fn:()=>AUD.tick(3) },
  { name:'WIN',               fn:()=>AUD.win() },
  { name:'LOSE',              fn:()=>AUD.lose() },
  { name:'SHOOT',             fn:()=>AUD.shoot() },
  { name:'EMPTY',             fn:()=>AUD.empty() },
  { name:'KILL',              fn:()=>AUD.kill() },
  { name:'XP',                fn:()=>AUD.xp() },
  { name:'HURT',              fn:()=>AUD.hurt() },
  { name:'PERK',              fn:()=>AUD.perk() },
  { name:'LEVEL UP',          fn:()=>AUD.levelup() },
  { name:'BOOM',              fn:()=>AUD.boom() },
  { name:'SUPER',             fn:()=>AUD.super() },
  { name:'BOSS',              fn:()=>AUD.boss() },
  { name:'UI',                fn:()=>AUD.ui() },
];
function grantPerk(p){
  if(!G.hero || G.hero.dead || G.perks.includes(p.id)) return;
  G.perks.push(p.id);
  G.perkStacks[p.id]=1;
  try{ applyPerkEffect(p); }catch(err){ console.error('perk failed:', p.id, err); }
  ensureSummons();
  if(G.hero.invince !== undefined) G.hero.invince = Math.max(G.hero.invince, 0.5);
}

// Training/custom test settings invalidate score and credits; they are never routed to a
// separate leaderboard category. Credit/secret codes only affect progression unlock currency.
function invalidateDebugRun(){
  if(!G.hero || G.hero.dead || G.state==='end') return;
  G.debugInvalidated = true;
  banner('TRAINING RUN — SCORE / CREDITS WILL NOT COUNT');
}

// THE run-validity gate. Every payout path (leaderboard row, credits, conquest unlocks)
// asks this one question, so a run can never be ranked by one path and sandboxed by another.
// A run qualifies only while a real player started it and nothing programmatic has touched
// it since: an automated test run (__BBAPI) or a training/debug run is a sandbox run.
function runIsRankable(){
  return !!G.rankedRun && !G.harnessTouched && !G.testMode && !G.debugInvalidated;
}

function debugSection(title){
  const d=document.createElement('div'); d.className='debugSection';
  d.innerHTML='<div class="debugHead">'+title+'</div>';
  return d;
}
function debugInfo(txt){
  const d=document.createElement('div'); d.className='debugInfo'; d.textContent=txt;
  return d;
}

function resetDebugSettings(){
  G.testSel={
    char:DEFAULT_TRAINING_SELECTION.char,
    gun:DEFAULT_TRAINING_SELECTION.gun,
    gem:DEFAULT_TRAINING_SELECTION.gem,
    diff:DEFAULT_TRAINING_SELECTION.diff,
    perks:[],
    gear:[],
    scoreDie:true,
  };
  persistTrainingSelection();
}
function leaveDebugForNormal(){
  const inRun=G.hero && !G.hero.dead;
  $('#debugBtn').hidden=true;
  if(inRun){
    // A live Training run remains non-ranked until it ends, even after restoring defaults.
    banner('NORMAL SETTINGS RESTORED · CURRENT RUN STILL TRAINING');
    setScreen('pause');
    renderPauseSkinPanel();
  }else{
    G.debugInvalidated=false;
    setScreen('menu');
  }
}

let testLoadoutTab='hero';
function testHeroCardItem(c){
  return {
    id:c.id,color:(c.apex?(selectedHeroSkin(c.id)?.palette?.body??c.color):c.color),icon:c.icon||'🐰',title:c.name,subtitle:c.passiveDesc,op:c.op,
    meta:(c.unlimitedSuper?'SKILL · ':'ULT · ')+c.superName,previewHero:c.id,
    details:()=>heroDetailsHtml(c)
  };
}
function testGunCardItem(g){
  const rangeLabel=g.special.includes('long')?'LONG':g.special.includes('mid')?'MID':'SHORT';
  return {id:g.id,color:g.color,icon:weaponIcon(g),title:g.name,cls:'gunCard',subtitle:gunCardSubtitle(g),op:g.op,
    meta:gunMetaHtml(g,{includeCrit:false}),details:g.op?(()=>gunDetailsHtml(g)):null};
}
function testGemCardItem(g){
  return {id:g.id,color:g.color,icon:'💎',title:g.name,subtitle:g.desc,meta:'TRAINING GEM'};
}
function testPerkCardItem(p){
  const pd=perkDisplay(p),ic=PERK_ICONS[p.id]||[7,8];
  return {id:p.id,color:p.king?0xcf7dff:0xffd166,icon:'◆',title:pd.name,subtitle:pd.desc,
    meta:p.king?'👑 KING PERK':(p.mastery?'+1 '+p.mastery+' MASTERY':'LEVEL-UP PERK'),perkIcon:ic};
}
function setTrainingGem(id){
  const gem=GEMS.find(g=>g.id===id); if(!gem) return;
  G.testSel.gem=id;
  persistTrainingSelection();
  markTrainingSetupPending('GEM · '+gem.name);
}
function setTrainingDiff(id){
  if(!DIFFS[id]) return;
  G.testSel.diff=id;
  persistTrainingSelection();
  markTrainingSetupPending('DIFFICULTY · '+DIFFS[id].label);
}
function toggleTrainingPerk(id){
  const p=PERKS.find(p=>p.id===id);
  if(!p) return;
  const a=G.testSel.perks||(G.testSel.perks=[]),i=a.indexOf(id);
  const removing=i>=0;
  if(removing) a.splice(i,1); else a.push(id);
  persistTrainingSelection();
  markTrainingSetupPending((removing?'REMOVE PERK · ':'PERK · ')+perkDisplay(p).name);
}
function toggleTrainingGear(id){
  const gear=HUB_SHOP.vending.find(v=>v.id===id); if(!gear) return;
  const a=G.testSel.gear||(G.testSel.gear=[]),i=a.indexOf(id);
  if(i>=0)a.splice(i,1);
  else if(a.length<VENDING_EQUIP_LIMIT)a.push(id);
  else { banner('TRAINING GEAR · MAX '+VENDING_EQUIP_LIMIT); return; }
  persistTrainingSelection();
  markTrainingSetupPending('GEAR · '+gear.name);
}
function renderTrainingMultiGrid(ctn,items,selectedIds,onpick){
  const selected=new Set(selectedIds||[]); ctn.innerHTML='';
  for(const it of items){
    const el=document.createElement('div');
    const sel=selected.has(it.id),col=hexColor(it.color||0xffd166);
    el.className='card '+(it.cls||'')+(sel?' trainingSelected':'');
    el.style.borderColor=sel?col:'var(--line)';
    const perkBg=it.perkIcon?' style="background-image:url('+ICON_URL+');background-position:-'+(it.perkIcon[0]*32)+'px -'+(it.perkIcon[1]*32)+'px"':'';
    el.innerHTML='<div class="chip"'+perkBg+'>'+(it.perkIcon?'':(it.icon||'?'))+'</div><div class="cname">'+it.title+'</div><div class="cdesc">'+(it.subtitle||'')+'</div>'+(it.meta?'<div class="stat">'+it.meta+'</div>':'')+(sel?'<div class="trainingOptionState">SELECTED</div>':'');
    el.onclick=()=>{ onpick(it); AUD.ui(); };
    ctn.appendChild(el);
  }
}
function renderTestCardGrid(ctn,items,selectedId,onpick){
  ctn.innerHTML='';
  for(const it of items){
    const el=document.createElement('div');
    const col=hexColor(it.color),sel=selectedId===it.id;
    const useHeroArt=!!(it.previewHero&&heroSplashArtEnabled()&&heroThumbUrl(it.previewHero));
    el.className='card '+(it.cls||'')+(it.details?' hasDetails':'')+(useHeroArt?' heroArtCard':'');
    el.style.borderColor=sel?col:'var(--line)'; el.style.outline=sel?'2px solid '+col:'none';
    el.innerHTML=(useHeroArt
        ? '<div class="heroSplashThumb">'+heroThumbImgHtml(it.previewHero)+'</div>'
        : '<div class="chip" style="background:'+col+'">'+(it.icon||'?')+'</div>')+
      (it.op?'<div class="opBadge">OP</div>':'')+
      (it.details?'<button class="cardInfoBtn" type="button" aria-label="Open '+it.title+' info" title="INFO / 3D PREVIEW">ⓘ</button>':'')+
      '<div class="cname" data-no-translate>'+it.title+'</div><div class="cdesc">'+(it.subtitle||'')+'</div>'+(it.meta?'<div class="stat">'+it.meta+'</div>':'')+(sel?'<div class="picked">✓</div>':'');
    const info=el.querySelector('.cardInfoBtn');
    info?.addEventListener('click',ev=>{ ev.preventDefault();ev.stopPropagation();showCardSpecs(el,it,true);AUD.ui(); });
    el.onclick=()=>{ hideCardSpecs(true); onpick(it); AUD.ui(); };
    ctn.appendChild(el);
  }
}
function renderDebug(){
  const ctn=$('#debugSections'); ctn.innerHTML='';
  const inRun=!!(G.testMode&&G.hero);
  const startBtn=$('#testStartBtn'); if(startBtn) startBtn.hidden=inRun;
  const exitBtn=$('#debugNormalBtn');
  if(exitBtn) exitBtn.textContent=inRun
    ? (G.trainingSetupDirty?'← BACK TO PAUSE · CHANGES PENDING':'← BACK TO PAUSE')
    : 'EXIT TRAINING';
  ctn.appendChild(debugInfo(inRun
    ? (G.trainingSetupDirty
        ? '🧪 LIVE TRAINING · SETUP CHANGES PENDING. Hero, Gun, Gem, Difficulty, Perks, Gear and score-die changes are staged only. Go BACK TO PAUSE and press RESUME once to apply the whole setup.'
        : '🧪 LIVE TRAINING SANDBOX: score and gold are fake. Loadout changes are staged here and only apply when you go BACK TO PAUSE and press RESUME.')
    : 'TRAINING is isolated from normal play. Build any loadout below; ownership, stock and leaderboard rules do not restrict the sandbox.'));

  const launch=debugSection('🧪 TRAINING LOADOUT');
  const heroId=G.testSel.char;
  const gunId=G.testSel.gun;
  const gemId=G.testSel.gem;
  const tabs=document.createElement('div'); tabs.className='trainingTabs';
  const tabDefs=[['hero','HERO'],['gun','GUN'],['gem','GEM'],['perk','PERKS'],['gear','GEAR'],['run','RUN']];
  tabs.innerHTML=tabDefs.map(([id,label])=>'<button class="segBtn '+(testLoadoutTab===id?'active':'')+'" data-test-loadout="'+id+'">'+label+'</button>').join('');
  launch.appendChild(tabs);
  tabs.querySelectorAll('.segBtn').forEach(b=>b.onclick=()=>{ testLoadoutTab=b.dataset.testLoadout; renderDebug(); AUD.ui(); });

  if(testLoadoutTab==='hero'){
    const h1=document.createElement('div'); h1.className='groupHead testGroupHead'; h1.textContent='BUNNIES'; launch.appendChild(h1);
    const bunnyGrid=document.createElement('div'); bunnyGrid.className='cards testLoadoutGrid'; launch.appendChild(bunnyGrid);
    renderTestCardGrid(bunnyGrid,CHARACTERS.filter(c=>!c.apex).map(testHeroCardItem),heroId,it=>{ testEquipHero(it.id); renderDebug(); });
    const h2=document.createElement('div'); h2.className='groupHead testGroupHead'; h2.textContent='APEX HEROES · OP'; launch.appendChild(h2);
    const apexGrid=document.createElement('div'); apexGrid.className='cards testLoadoutGrid'; launch.appendChild(apexGrid);
    renderTestCardGrid(apexGrid,CHARACTERS.filter(c=>c.apex).map(testHeroCardItem),heroId,it=>{ testEquipHero(it.id); renderDebug(); });
  }else if(testLoadoutTab==='gun'){
    const gh=document.createElement('div'); gh.className='groupHead testGroupHead'; gh.textContent='ALL WEAPONS'; launch.appendChild(gh);
    const gunGrid=document.createElement('div'); gunGrid.className='cards testLoadoutGrid'; launch.appendChild(gunGrid);
    renderTestCardGrid(gunGrid,GUNS.map(testGunCardItem),gunId,it=>{ testEquipGun(it.id); renderDebug(); });
  }else if(testLoadoutTab==='gem'){
    const gh=document.createElement('div'); gh.className='groupHead testGroupHead'; gh.textContent='ALL GEMS · OWNERSHIP IGNORED'; launch.appendChild(gh);
    const grid=document.createElement('div'); grid.className='cards testLoadoutGrid'; launch.appendChild(grid);
    renderTestCardGrid(grid,GEMS.map(testGemCardItem),gemId,it=>{ setTrainingGem(it.id); renderDebug(); });
  }else if(testLoadoutTab==='perk'){
    launch.appendChild(debugInfo('Pick exact perks. During live Training, perk changes are PENDING only; nothing is granted or removed until you go BACK TO PAUSE and press RESUME.'));
    const grid=document.createElement('div'); grid.className='cards testLoadoutGrid'; launch.appendChild(grid);
    renderTrainingMultiGrid(grid,PERKS.map(testPerkCardItem),G.testSel.perks,it=>{ toggleTrainingPerk(it.id); renderDebug(); });
  }else if(testLoadoutTab==='gear'){
    launch.appendChild(debugInfo('Select up to '+VENDING_EQUIP_LIMIT+' cursed gear items. Training ignores stock and never consumes copies.'));
    const items=HUB_SHOP.vending.map(v=>({id:v.id,color:v.color,icon:v.icon,title:v.name,subtitle:v.desc,meta:'CURSED GEAR'}));
    const grid=document.createElement('div'); grid.className='cards testLoadoutGrid'; launch.appendChild(grid);
    renderTrainingMultiGrid(grid,items,G.testSel.gear,it=>{ toggleTrainingGear(it.id); renderDebug(); });
  }else{
    const dh=document.createElement('div'); dh.className='groupHead testGroupHead'; dh.textContent='DIFFICULTY'; launch.appendChild(dh);
    const diffs=Object.entries(DIFFS).map(([id,d])=>({id,color:id==='Easy'?0x66e26b:id==='Normal'?0x6aa3ff:id==='Hard'?0xffd166:0xff5a5a,icon:id==='Insane'?'☠':'◆',title:d.label,subtitle:d.desc,meta:'TRAINING DIFFICULTY'}));
    const dgrid=document.createElement('div'); dgrid.className='cards testLoadoutGrid'; launch.appendChild(dgrid);
    renderTestCardGrid(dgrid,diffs,G.testSel.diff,it=>{ setTrainingDiff(it.id); renderDebug(); });

    const mh=document.createElement('div'); mh.className='groupHead testGroupHead'; mh.textContent='LEVEL-UP SCORE MULTIPLIER'; launch.appendChild(mh);
    const mgrid=document.createElement('div'); mgrid.className='cards testLoadoutGrid'; launch.appendChild(mgrid);
    const enabled=G.testSel.scoreDie!==false;
    const opts=[
      {id:'on',color:0x9ceb5a,icon:'🎲',title:'SCORE DIE · ON',subtitle:'Level-up keeps the normal score-multiplier die choice.',meta:'NORMAL BEHAVIOR'},
      {id:'off',color:0x8fa3b8,icon:'—',title:'SCORE DIE · OFF',subtitle:'Level-up shows perk cards only. Useful for perk testing, including mobile.',meta:'TRAINING ONLY'}
    ];
    renderTestCardGrid(mgrid,opts,enabled?'on':'off',it=>{
      G.testSel.scoreDie=it.id==='on';
      persistTrainingSelection();
      markTrainingSetupPending('SCORE DIE · '+(G.testSel.scoreDie?'ON':'OFF'));
      renderDebug();
      AUD.ui();
    });
  }

  const launchRow=document.createElement('div'); launchRow.className='debugGrid';
  if(!inRun){
    const start=document.createElement('div'); start.className='card debugCard';
    start.innerHTML='<div class="cname">▶ DEPLOY TRAINING</div><div class="cdesc">Deploys the full Training loadout above. Normal waves are disabled; use 1 DANGER · 2 RESET · 3 EXP.</div>';
    start.onclick=()=>startTestModeWithOrientation(); launchRow.appendChild(start);
  }else{
    const info=document.createElement('div'); info.className='card debugCard';
    info.innerHTML='<div class="cname">LIVE TRAINING</div><div class="cdesc">1 DANGER · 2 RESET · 3 EXP. Hero and dummies revive; score and gold remain fake.</div>';
    launchRow.appendChild(info);
  }
  launch.appendChild(launchRow); ctn.appendChild(launch);

  // ---- SOUNDS ----
  const snd=debugSection('🔊 SOUND TEST');
  const sgrid=document.createElement('div'); sgrid.className='debugGrid';
  for(const s of DEBUG_SOUNDS){
    const el=document.createElement('div'); el.className='card debugCard';
    el.innerHTML='<div class="cname">🔊 '+s.name+'</div>';
    el.onclick=()=>{ AUD.init(); AUD.resume(); s.fn(); AUD.ui(); };
    sgrid.appendChild(el);
  }
  snd.appendChild(sgrid); ctn.appendChild(snd);

}
function hubTabHint(){
  const hints = {
    gems: 'Gems are permanent passive boons. The green gem is free; the other 7 cost '+GEM_PRICE+' credits each.',
    heroes: 'Unlock heroes permanently. Standard bunnies use the regular hero price; apex heroes have their own prices. BAHAMUT only becomes purchasable after you defeat him and complete that winning run, then costs '+BAHAMUT_HUB_PRICE.toLocaleString()+' CR.',
    guns: 'Unlock weapons permanently for '+GUN_PRICE+' credits each. The premium (OP) weapons listed at the bottom have their own higher prices.',
    vending: 'Cursed consumables go into your stockpile. Buying does NOT activate them. Equip up to '+VENDING_EQUIP_LIMIT+' in CUSTOMIZE CHARACTER and that set is remembered: your next deploy asks whether to use it again, so a copy is spent only on a run you actually want it in.',
  };
  $('#hubHint').textContent = hints[hubTab];
}
function renderHub(){
  $('#hubCredits').textContent = SAVE.credits;
  document.querySelectorAll('#hubTabs .segBtn').forEach(b=>b.classList.toggle('active', b.dataset.t===hubTab));
  hubTabHint();
  const items=HUB_SHOP[hubTab];
  const ctn=$('#hubCards'); ctn.innerHTML='';
  for(const it of items) ctn.appendChild(hubCard(it));
  // Ownership totals stay secret until the player owns the permanent item. Owned Hub
  // cards keep showing the live total afterward; the purchase toast is the first reveal.
  communitySyncCountEls(ctn);
  communityFetch(items.map(communityOwnershipKey).filter(Boolean));
}
let hubPurchaseToastTimer=0;
function showHubPurchaseToast(it){
  const key=communityOwnershipKey(it);
  const toast=$('#hubPurchaseToast');
  if(!key || !toast) return;
  const name=$('#hubPurchaseToastName');
  const count=$('#hubPurchaseToastCount');
  if(name) name.textContent=it.name;
  if(count){
    count.dataset.communityKey=key;
    count.dataset.communityKind='owner';
  }
  communitySyncCountEls(toast);
  clearTimeout(hubPurchaseToastTimer);
  toast.hidden=false;
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');
  hubPurchaseToastTimer=setTimeout(()=>{
    toast.classList.remove('show');
    setTimeout(()=>{ if(!toast.classList.contains('show')) toast.hidden=true; },180);
  },2200);
}
function hubCard(it){
  const el=document.createElement('div');
  const col=hexColor(it.color);
  const useHeroArt=!!(it.cat==='heroes'&&heroSplashArtEnabled()&&heroThumbUrl(it.id));
  el.className='card hubCard'+(useHeroArt?' heroArtCard':'');
  const owned=hubItemOwned(it);
  const prereq=hubItemPrereqMet(it);
  const afford=SAVE.credits>=it.price;
  const stock=it.cat==='vending'?vendingStock(it.id):0;
  const ownerKey=owned?communityOwnershipKey(it):'';
  const badge='<div class="ownedBadge">OWNED ✓'+(ownerKey?' · <span data-community-key="'+ownerKey+'" data-community-kind="owner"></span>':'')+'</div>';
  const priceRow=prereq
    ? '<div class="price">'+it.price+' CR</div><button class="buyBtn" '+(afford?'':'disabled')+'>BUY</button>'
    : '<div class="price" style="color:var(--red)">DEFEAT BAHAMUT + WIN FIRST</div><button class="buyBtn" disabled>LOCKED</button>';
  const vendingRows='<div class="ownedBadge">STOCK ×'+stock+'</div>'+priceRow;
  el.innerHTML =
    (useHeroArt
      ? '<div class="heroSplashThumb">'+heroThumbImgHtml(it.id)+'</div>'
      : '<div class="chip" style="background:'+col+'">'+(it.icon||'?')+'</div>')+
    '<div class="cname" data-no-translate>'+it.name+'</div>'+
    '<div class="cdesc">'+uxCopy(it.desc)+'</div>'+
    (it.cat==='vending'?vendingRows:(owned?badge:priceRow));
  const bb=el.querySelector('.buyBtn');
  if(bb) bb.onclick=(e)=>{
    e.stopPropagation();
    if(buyHubItem(it)){
      renderHub();
      showHubPurchaseToast(it);
      if(it.cat==='heroes') showHeroUnlockReveal(it.id);
      AUD.ui();
    }
  };
  return el;
}

// ---------------- Online leaderboard & community ----------------
// Username + high-score records live on the server-plugin's authoritative,
// but tier 1 is retired/orphaned. Active ranking views are CLEAN (0) and OP (2) only.
const LB_KEY_TOKEN = 'bb_lb_token_v1';
const LB_KEY_NAME = 'bb_lb_name_v1';
const LB_KEY_BEST = 'bb_lb_mybest_v1';
const LB_DIFFS = ['Easy','Normal','Hard','Insane'];
// Archive/wire layout version — identifies the byte format only, NOT the scoring rules.
// Scoring changes never bump it; the server migrates old archives in place instead of wiping.
const LB_PROTO_VERSION = 4;
const LB_PAGE_SIZE = 200;
const LB = {
  token:'', name:'', socket:null, opened:false, _rt:null, attempts:0,
  diffIdx:-1, tierTab:-1, sortKey:'latest', sortDir:-1, searchQuery:'', heroFilter:'', weaponFilter:'', cache:{}, entries:[], viewCount:0, retainedTotal:0, lifetimeTotal:0, loadedTotal:0,
  displayLimit:LB_PAGE_SIZE, loadingMore:false, deferApply:false, myRank:0, status:'off', pending:null, myBest:{}, _peekBound:false, _pageRequests:{},
  frozen:false, restoreNote:'', backupBusy:false, restoreBlocked:false, backupError:'',
  contribNote:'', contribBusy:false, contribBlocked:false,
};

// Shared social-proof counters. The server stores only post-feature deltas; these baselines
// represent purchases / clears that happened before counters existed.
const COMMUNITY_CLEAR_BASELINE = Object.freeze({ all:120, insane:20, dragon:3, apex7:3 });
const COMMUNITY = {
  delta:Object.create(null), local:Object.create(null), pending:[], sending:false, fetching:new Set(),
  // Owner registry (see OWNER_KEYS in index.html's server script). `abs` marks keys whose
  // server value is an ABSOLUTE owner count rebuilt from the players themselves, not a delta.
  abs:Object.create(null), tail:Object.create(null), reg:Object.create(null),
  ownerSig:'', ownerSent:false, ownerBusy:false,
};
function communityOwnershipKey(it){
  if(!it || it.cat==='vending') return '';
  if(it.cat!=='gems' && it.cat!=='heroes' && it.cat!=='guns') return '';
  return 'own:'+it.cat+':'+it.id;
}
function communityBaseline(key){
  const k=String(key||'');
  if(k==='clear:all') return COMMUNITY_CLEAR_BASELINE.all;
  if(k==='clear:insane') return COMMUNITY_CLEAR_BASELINE.insane;
  if(k==='clear:dragon') return COMMUNITY_CLEAR_BASELINE.dragon;
  if(k==='clear:apex7') return COMMUNITY_CLEAR_BASELINE.apex7;
  const p=k.split(':');
  if(p.length!==3 || p[0]!=='own') return 0;
  if(p[1]==='gems') return 15;
  if(p[1]==='heroes'){
    if(p[2]==='bahamut') return 4;
    const hero=CHARACTERS.find(c=>c.id===p[2]);
    return hero?.op ? 10 : 15;
  }
  if(p[1]==='guns'){
    const gun=GUNS.find(g=>g.id===p[2]);
    return gun?.op ? 10 : 15;
  }
  return 0;
}
// Does THIS browser own the item behind an owner key? Owning it is proof of a past purchase,
// so the count includes this player at minimum, even before (or without) a server round-trip.
function communityOwnsKey(key){
  const p=String(key||'').split(':');
  if(p.length!==3||p[0]!=='own')return false;
  if(p[1]==='gems')return ownsGem(p[2]);
  if(p[1]==='heroes')return ownsHero(p[2]);
  if(p[1]==='guns')return ownsGun(p[2]);
  return false;
}
function communityCount(key){
  const k=String(key||'');
  const local=Math.max(0,Number(COMMUNITY.local[k])||0);
  const abs=!!COMMUNITY.abs[k];
  // `reg` is the server's rebuilt distinct-owner count; `own` is this browser's own
  // ownership. `own` is applied whether or not the server row has arrived yet, so a player
  // who owns an item always sees the count including themselves from the very first frame
  // (no baseline-only flicker before the first communityGet). Owning an item proves a past
  // purchase, and the legacy delta/tail is floored in with max - never summed - so a purchase
  // that also produced a report cannot be counted twice and the number never goes down.
  const reg=abs?Math.max(0,Number(COMMUNITY.reg[k])||0):0;
  const n=Math.max(0,Number(abs?COMMUNITY.tail[k]:COMMUNITY.delta[k])||0);
  const own=communityOwnsKey(k)?1:0;
  return communityBaseline(k)+Math.max(n,reg,own)+local;
}
function communitySyncCountEls(scope=document){
  scope.querySelectorAll?.('[data-community-key]').forEach(el=>{
    const key=el.dataset.communityKey;
    const n=communityCount(key);
    if(el.dataset.communityKind==='owner'){
      el.textContent='👥 '+n.toLocaleString()+' OWN IT';
      el.setAttribute('aria-label',n.toLocaleString()+' players own this');
    }else if(el.dataset.communityKind==='finisher'){
      const label=el.dataset.communityLabel||'FINISHER';
      const labelEl=document.createElement('span');
      const rankEl=document.createElement('strong');
      labelEl.className='endCommunityLabel';
      rankEl.className='endCommunityRank';
      labelEl.textContent=label;
      rankEl.textContent='YOU ARE THE '+lbOrdinal(n);
      el.replaceChildren(labelEl,rankEl);
      el.setAttribute('aria-label',label+'. You are the '+lbOrdinal(n)+'.');
    }else{
      el.textContent=n.toLocaleString();
    }
  });
}
async function communityFetch(keys,force=false){
  if(!LB.opened || !LB.socket?.rpc?.communityGet) return false;
  const unique=[...new Set((keys||[]).map(String).filter(Boolean))];
  const need=force ? unique : unique.filter(k=>COMMUNITY.delta[k]===undefined&&!COMMUNITY.abs[k]);
  if(!need.length) return true;
  const sig=need.slice().sort().join('\n');
  if(COMMUNITY.fetching.has(sig)) return false;
  COMMUNITY.fetching.add(sig);
  try{
    const raw=await LB.socket.rpc.communityGet(need.join('\n'));
    const rows=JSON.parse(String(raw||'[]'));
    for(const row of rows){
      if(Array.isArray(row) && row.length>=2){
        const k=String(row[0]),n=Math.max(0,Number(row[1])||0);
        if(row.length>=4 && Number(row[2])===1){
          // Registry-backed row: slot 3 is the rebuilt owner count, slot 1 the legacy delta.
          COMMUNITY.abs[k]=1;
          COMMUNITY.tail[k]=Math.max(COMMUNITY.tail[k]||0,n);
          COMMUNITY.reg[k]=Math.max(COMMUNITY.reg[k]||0,Number(row[3])||0);
        }else{
          COMMUNITY.delta[k]=Math.max(COMMUNITY.delta[k]||0,n);
        }
      }
    }
    communitySyncCountEls();
    communityRenderEnd();
    return true;
  }catch(e){ return false; }
  finally{ COMMUNITY.fetching.delete(sig); }
}
function communityRefreshVisible(force=false){
  const keys=[...document.querySelectorAll('[data-community-key]')].map(el=>el.dataset.communityKey);
  return communityFetch(keys,force);
}
// ---- Owner registry (client half) -------------------------------------------
// The HUB "N OWN IT" numbers are the one social-proof figure that no browser ever
// cached, so there was nothing to hand back after they were zeroed. What every
// browser DOES have is its own save, so each one reports the keys it owns and the
// server counts distinct tokens per key: the count is rebuilt from the players.
// Derived from HUB_SHOP itself (only purchasable items exist there), so the key set
// cannot drift from the shop, and the server ignores anything it doesn't know.
function communityOwnershipKeys(){
  const out=[];
  for(const cat of ['gems','heroes','guns']){
    for(const it of (HUB_SHOP[cat]||[])){
      if(!hubItemOwned(it)) continue;
      const key=communityOwnershipKey(it);
      if(key) out.push(key);
    }
  }
  return out;
}
// [0xcf][token:16][count:u16le] then count x [len:u8][key bytes] — the key travels as a
// string, so the client and the server scripts need no shared key ordering.
function ownerReportBlock(keys){
  let encLen=0; for(const k of keys) encLen+=1+k.length;
  const out=new Uint8Array(19+encLen), tok=String(LB.token||'');
  out[0]=0xcf;
  for(let j=0;j<16;j++)out[1+j]=j<tok.length?tok.charCodeAt(j)&255:0;
  out[17]=keys.length&255; out[18]=(keys.length>>8)&255;
  let p=19;
  for(const k of keys){ out[p++]=k.length&255; for(let j=0;j<k.length;j++)out[p++]=k.charCodeAt(j)&255; }
  return out.buffer;
}
async function communityReportOwnership(force=false){
  if(COMMUNITY.ownerBusy) return false;
  if(!LB.opened||!LB.socket?.rpc?.ownerReport) return false;
  const keys=communityOwnershipKeys();
  if(!keys.length) return false;
  const sig=keys.slice().sort().join('\n');
  if(!force && COMMUNITY.ownerSent && sig===COMMUNITY.ownerSig) return true;
  COMMUNITY.ownerBusy=true;
  try{
    for(let i=0;i<keys.length;i+=64) await LB.socket.rpc.ownerReport(ownerReportBlock(keys.slice(i,i+64)));
    COMMUNITY.ownerSig=sig; COMMUNITY.ownerSent=true;
    communityRefreshVisible(true);
    return true;
  }catch(e){ return false; }
  finally{ COMMUNITY.ownerBusy=false; }
}
function communityBump(key){
  key=String(key||'');
  if(!key) return;
  COMMUNITY.local[key]=(COMMUNITY.local[key]||0)+1;
  COMMUNITY.pending.push(key);
  communitySyncCountEls();
  communityRenderEnd();
  communityFlush();
}
async function communityFlush(){
  if(COMMUNITY.sending || !LB.opened || !LB.socket?.rpc?.communityEvent || !COMMUNITY.pending.length) return;
  COMMUNITY.sending=true;
  try{
    while(LB.opened && LB.socket && COMMUNITY.pending.length){
      const key=COMMUNITY.pending[0];
      let next;
      try{ next=Math.max(0,Number(await LB.socket.rpc.communityEvent(key))||0); }
      catch(e){ break; }
      COMMUNITY.delta[key]=next;
      COMMUNITY.local[key]=Math.max(0,(COMMUNITY.local[key]||0)-1);
      COMMUNITY.pending.shift();
      communitySyncCountEls();
      communityRenderEnd();
    }
  }finally{ COMMUNITY.sending=false; }
}
function communityRenderEnd(){
  const box=$('#endCommunity');
  if(!box || !G.endResult?.win) return;
  const rows=[];
  if(G.endResult.apexSevenWin) rows.push(['clear:apex7','⚔ APEX SEVEN CONQUEROR']);
  else if(G.endResult.bahamutWin) rows.push(['clear:dragon','🐉 DRAGON CONQUEROR']);
  if(G.diff==='Insane') rows.push(['clear:insane','🔥 INSANE FINISHER']);
  rows.push(['clear:all','🏁 500s FINISHER']);
  box.innerHTML=rows.map(([key,label])=>'<span class="endCommunityChip" data-community-key="'+key+'" data-community-kind="finisher" data-community-label="'+label+'"></span>').join('');
  communitySyncCountEls(box);
}
function communityRecordEnd(){
  if(!runIsRankable()) return;
  if(!G.endResult?.win || G.endResult.communityReported) return;
  G.endResult.communityReported=true;
  const keys=['clear:all'];
  if(G.diff==='Insane') keys.push('clear:insane');
  if(G.endResult.bahamutWin) keys.push('clear:dragon');
  if(G.endResult.apexSevenWin) keys.push('clear:apex7');
  for(const key of keys) communityBump(key);
}
function lbGenToken(){
  try{
    let t = localStorage.getItem(LB_KEY_TOKEN);
    if(t && t.length===16){ let ok=true; for(const c of t){ const n=c.charCodeAt(0); if(!((n>=48&&n<=57)||(n>=97&&n<=102))){ ok=false; break; } } if(ok) return t; }
    const a = new Uint8Array(8);
    crypto.getRandomValues(a);
    t = Array.from(a, b=>b.toString(16).padStart(2,'0')).join('');
    localStorage.setItem(LB_KEY_TOKEN, t);
    return t;
  }catch(e){ return '0123456789abcdef'; }
}
const LB_NAME_CHAR_CAP=12;
const LB_NAME_UTF8_CAP=38;
const LB_UTF8_NAME_FLAG=0x20;
const LB_HERO_CODE_IDS=['pulse','mag','bones','porter','payne','haze','mo','nikki','blink','rooty','raja','mane','grizz','fang','foxy','val','talon','bahamut'];
const LB_GUN_CODE_IDS=['arcritter','blastersg','scrapper','rustyp','boom','taipan','mg','r6','toxic','splitter','void','zneeke','zapper','bouncecannon','bonebarrel','salamandro','missile','rocket','grenade','sunlance','gravmaul','vulpine','aegis','inferno'];
const LB_TEXT_ENCODER=new TextEncoder();
const LB_TEXT_DECODER=new TextDecoder('utf-8',{fatal:false});
function lbSanitizeName(n){
  let s=String(n||'');
  try{s=s.normalize('NFC');}catch(e){}
  s=s.replace(/[<>&`]/g,'').replace(/[\u0000-\u001f\u007f-\u009f]/g,'');
  let out='',bytes=0,count=0;
  for(const ch of s){
    const len=LB_TEXT_ENCODER.encode(ch).length;
    if(count>=LB_NAME_CHAR_CAP||bytes+len>LB_NAME_UTF8_CAP)break;
    out+=ch; bytes+=len; count++;
  }
  return out.trim();
}
function lbName(){ try{ return lbSanitizeName(localStorage.getItem(LB_KEY_NAME) || ''); }catch(e){ return ''; } }
function lbSaveName(n){
  n = lbSanitizeName(n);
  LB.name = n;
  try{ localStorage.setItem(LB_KEY_NAME, n); }catch(e){}
}
function lbNameOrDefault(){ return LB.name || ''; }
function lbLoadMyBest(){
  try{
    const o=JSON.parse(localStorage.getItem(LB_KEY_BEST)||'{}');
    return o && typeof o==='object' ? o : {};
  }catch(e){ return {}; }
}
function lbRememberBest(boardId,rec){
  const key=String(boardId);
  const next={
    score:Math.max(1,Math.floor(rec.score||0)),
    kills:Math.max(0,Math.floor(rec.kills||0)),
    time:Math.max(0,Math.floor(rec.time||0)),
    level:Math.max(0,Math.floor(rec.level||0)),
    charId:String(rec.charId||''),
    gunId:String(rec.gunId||''),
    unixDays:Math.floor(Date.now()/86400000)
  };
  const prev=LB.myBest[key];
  if(!prev || lbScoreCompare(next,prev)<0){
    LB.myBest[key]=next;
    try{ localStorage.setItem(LB_KEY_BEST,JSON.stringify(LB.myBest)); }catch(e){}
  }
}
function lbSuggestedBunnyName(){
  // Readable anonymous-style suggestion, e.g. Bunny6Re51a — never submitted silently.
  const digit=()=>String(Math.floor(Math.random()*10));
  const upper=()=>String.fromCharCode(65+Math.floor(Math.random()*26));
  const lower=()=>String.fromCharCode(97+Math.floor(Math.random()*26));
  return 'Bunny'+digit()+upper()+lower()+digit()+digit()+lower();
}
function lbTier(){
  return ((G.char && G.char.op) || (G.gun && G.gun.op)) ? 2 : 0;
}
function lbBoardId(){
  if(LB.diffIdx < 0 || LB.tierTab < 0) return -1;
  return LB.diffIdx*3 + LB.tierTab;
}
function lbBoardIds(){
  const diffCount = LB_DIFFS.length;
  const activeTiers=[0,2];
  if(LB.diffIdx < 0){
    if(LB.tierTab < 0) return Array.from({length:diffCount},(_,i)=>activeTiers.map(t=>i*3+t)).flat();
    if(!activeTiers.includes(LB.tierTab)) return [];
    return Array.from({length:diffCount}, (_,i)=>i*3+LB.tierTab);
  }
  const base = LB.diffIdx*3;
  if(LB.tierTab < 0) return activeTiers.map(t=>base+t);
  return activeTiers.includes(LB.tierTab) ? [base+LB.tierTab] : [];
}
function lbScoreCompare(a,b){
  // Match the server's authoritative score ordering exactly.
  return (b.score-a.score) || (a.time-b.time) || (b.kills-a.kills);
}
function lbConqueredDragon(cid){ return String(cid||'').endsWith('~c'); }
function lbDefeatedApexSeven(cid){ const s=String(cid||''); return s.endsWith('~7') || s.endsWith('~s'); }
function lbHeroBaseId(cid){ return String(cid||'').replace(/~[c7s]$/,''); }
function lbRunIdentityValid(e){
  const raw=String(e?.charId||''),base=lbHeroBaseId(raw),suffix=raw.slice(base.length);
  const c=CHARACTERS.find(x=>x.id===base),g=GUNS.find(x=>x.id===String(e?.gunId||''));
  if(!c||!g) return false;
  // Historical rows keep the tier they were submitted under; only impossible entity IDs are
  // hidden client-side. The v111 server applies current tier/conquest rules to NEW submissions.
  return !suffix || suffix==='~c' || suffix==='~7' || suffix==='~s';
}
function lbHeroDisplay(cid){
  const base=lbHeroBaseId(cid);
  const c=CHARACTERS.find(x=>x.id===base);
  return {
    icon:c?(c.icon||'🐰'):'🐰',
    name:c?c.name:String(base||'UNKNOWN').toUpperCase(),
    color:c?.color??0x8a95a5,
  };
}
function lbHeroCellHtml(cid){
  const h=lbHeroDisplay(cid);
  const col=hexColor(h.color);
  return '<span class="lbHeroBadge" style="--hero-color:'+col+'">'+
    '<span class="lbHeroIcon" aria-hidden="true">'+h.icon+'</span>'+
    '<span class="lbHeroName">'+esc(h.name)+'</span>'+
  '</span>';
}
function lbServerOrder(){ return LB.sortKey==='latest' ? 1 : 0; }
function lbSortEntries(entries){
  const dir=LB.sortDir||-1;
  const key=LB.sortKey||'latest';
  const str=(v)=>String(v||'').toLowerCase();
  return entries.sort((a,b)=>{
    let av,bv;
    if(key==='player') return str(a.name).localeCompare(str(b.name))*dir || lbScoreCompare(a,b);
    if(key==='rank'){
      av=a.viewRank||a.scoreRank||a.boardRank||999999999;
      bv=b.viewRank||b.scoreRank||b.boardRank||999999999;
    }else if(key==='latest'){ av=a.submittedAt||((a.unixDays||0)*86400); bv=b.submittedAt||((b.unixDays||0)*86400); }
    else if(key==='kills'){ av=a.kills; bv=b.kills; }
    else if(key==='time'){ av=a.time; bv=b.time; }
    else if(key==='level'){ av=a.level; bv=b.level; }
    else { av=a.score; bv=b.score; }
    if(av!==bv) return (av-bv)*dir;
    return lbScoreCompare(a,b);
  });
}
function lbApplyView(){
  const ids=lbBoardIds();
  const raw=[];
  let retainedTotal=0,lifetimeTotal=0;
  const serverOrder=lbServerOrder();
  for(const id of ids){
    const cached=LB.cache[id];
    if(!cached || cached.order!==serverOrder) continue;
    // Never render malformed/tampered archive rows. The server also rejects and purges
    // these in v111, but the client keeps this guard for stale server instances/caches.
    raw.push(...cached.entries.slice(0,LB.displayLimit).filter(lbRunIdentityValid));
    retainedTotal += cached.storedCount||cached.entries.length;
    lifetimeTotal += cached.totalRuns||cached.storedCount||cached.entries.length;
  }
  const heroFilter=String(LB.heroFilter||'');
  const weaponFilter=String(LB.weaponFilter||'');
  const categoryFiltered=raw.filter(e=>
    (!heroFilter || lbHeroBaseId(e.charId)===heroFilter) &&
    (!weaponFilter || String(e.gunId||'')===weaponFilter)
  );

  // Rank is recalculated inside the selected Hero/Gun category. This is what makes
  // HERO/GUN useful as leaderboard filters rather than meaningless alphabetic sorts.
  const ranked=[...categoryFiltered].sort(lbScoreCompare);
  ranked.forEach((e,i)=>{ e.scoreRank=i+1; e.viewRank=i+1; });
  const mine=ranked.find(e=>e.token===LB.token);
  LB.myRank=mine ? mine.viewRank : 0;

  // Player-name search operates inside the selected Hero/Gun category.
  const q=String(LB.searchQuery||'').trim().toLowerCase();
  const filtered=q ? categoryFiltered.filter(e=>String(e.name||'').toLowerCase().includes(q)) : categoryFiltered;
  const sortedView=lbSortEntries([...filtered]);
  LB.loadedTotal=raw.length;
  LB.retainedTotal=retainedTotal;
  LB.lifetimeTotal=lifetimeTotal;
  LB.viewCount=sortedView.length;
  LB.entries=sortedView.slice(0,LB.displayLimit);
  lbRender();
}

function lbConnect(){
  if(!root || !root.createServerSocket) return;
  if(LB.socket) return;
  clearTimeout(LB._rt);
  let sock;
  try{ sock = root.createServerSocket(); }catch(e){ return; }
  sock.binaryType = 'arraybuffer';
  LB.socket = sock;
  sock.addEventListener('open', ()=>{
    LB.opened = true; LB.attempts = 0; LB.status = 'online'; LB.restoreBlocked = false; LB.contribBlocked = false;
    for(const i of [0,2,3,5,6,8,9,11]){ try{ sock.send('\u0000SUB:lb:'+i); }catch(e){} }
    try{ sock.send('\u0000SUB:community'); }catch(e){}
    if(LB.pending){ const p = LB.pending; LB.pending = null; lbSendSubmit(p); }
    communityFlush();
    communityRefreshVisible(true);
    communityReportOwnership();
    if($('#lbScreen') && !$('#lbScreen').hidden) lbRefresh(false);
    lbBackupMaybe();
    lbContributeMaybe();
  });
  sock.addEventListener('message', ev=>{
    if(ev.data instanceof ArrayBuffer){ lbHandleBoard(ev.data,0); return; }
    if(typeof ev.data==='string' && ev.data==='\u0000LB-FROZEN'){
      LB.frozen=true; LB.restoreNote=''; lbRender();
      return;
    }
    if(typeof ev.data==='string' && ev.data==='\u0000COMM'){
      communityRefreshVisible(true);
      return;
    }
    if(typeof ev.data==='string' && ev.data.startsWith('\u0000LB:')){
      const b=Number(ev.data.slice(4));
      if(Number.isInteger(b) && lbBoardIds().includes(b)) lbRequestPage(b,0,true).then(()=>lbEnsureDepth(b,LB.displayLimit));
    }
  });
  sock.addEventListener('close', ev=>{
    LB.opened = false; LB.socket = null;
    // Re-report on the next connection (the server dedups by token, so re-offering is free)
    // so a rebuilt owner count keeps climbing even across server reboots.
    COMMUNITY.ownerSent = false;
    if(ev.code === 4403){ LB.status = 'blocked'; return; }
    LB.status = 'offline';
    LB._rt = setTimeout(lbConnect, Math.min(30000, 1000*Math.pow(2, Math.min(6, LB.attempts++))));
  });
  sock.addEventListener('error', ()=>{});
}

function lbReadField(dv, o, max){
  let s='';
  for(let i=0;i<max;i++){ const c=dv.getUint8(o+i); if(!c) break; s+=String.fromCharCode(c); }
  return s;
}
function lbCompactRowIdentity(dv,o){
  const packed=dv.getUint8(o+27),base=LB_HERO_CODE_IDS[packed&31],gun=LB_GUN_CODE_IDS[dv.getUint8(o+28)];
  const suffix=['','~c','~7','~s'][(packed>>5)&3]||'';
  return{charId:base?base+suffix:'',gunId:gun||''};
}
function lbCompactRowName(dv,o){
  const n=Math.min(LB_NAME_UTF8_CAP,dv.getUint8(o+29));
  const bytes=new Uint8Array(n); let p=0;
  for(let j=30;j<=38&&p<n;j++)bytes[p++]=dv.getUint8(o+j);
  for(let j=40;j<=51&&p<n;j++)bytes[p++]=dv.getUint8(o+j);
  for(let j=55;j<=71&&p<n;j++)bytes[p++]=dv.getUint8(o+j);
  return lbSanitizeName(LB_TEXT_DECODER.decode(bytes.subarray(0,p)));
}
const LB_HIST_BINS=1000;
const LB_HIST_WIDTH=1000;
const LB_ROW_BYTES=72;
const LB_REPLY_HEAD=34+LB_HIST_BINS*4;
function lbHandleBoard(buf,order=0){
  try{
    const dv=new DataView(buf);
    if(dv.getUint8(0)!==LB_PROTO_VERSION) return;
    const b=dv.getUint8(1);
    if(b%3===1) return;
    const count=dv.getUint16(2,true);
    const offset=dv.getUint32(4,true);
    const storedCount=dv.getUint32(8,true);
    const myRank=dv.getUint32(12,true);
    const totalRuns=dv.getUint32(16,true);
    const prunedCount=dv.getUint32(20,true);
    const maxSlots=dv.getUint32(24,true);
    const histBins=dv.getUint16(28,true);
    const globalActive=dv.getUint32(30,true);
    if(histBins!==LB_HIST_BINS || buf.byteLength<LB_REPLY_HEAD+count*72) return;
    const hist=new Uint32Array(LB_HIST_BINS);
    for(let i=0;i<LB_HIST_BINS;i++) hist[i]=dv.getUint32(34+i*4,true);
    const page=[];
    for(let i=0;i<count;i++){
      const o=LB_REPLY_HEAD+i*72;
      const token=lbReadField(dv,o,16);
      const unixDays=dv.getUint16(o+52,true);
      const timeMeta=dv.getUint8(o+54);
      const hasPreciseTime=(timeMeta&0x80)!==0;
      const compactUnicode=(timeMeta&LB_UTF8_NAME_FLAG)!==0;
      const secondOfDay=hasPreciseTime
        ? (dv.getUint8(o+26)|(dv.getUint8(o+39)<<8)|(((timeMeta>>6)&1)<<16))
        : 0;
      const ids=compactUnicode?lbCompactRowIdentity(dv,o):{charId:lbReadField(dv,o+27,12),gunId:lbReadField(dv,o+40,12)};
      page.push({
        token,
        score:dv.getUint32(o+16,true),
        kills:dv.getUint16(o+20,true),
        time:dv.getUint16(o+22,true),
        level:dv.getUint16(o+24,true),
        charId:ids.charId,
        gunId:ids.gunId,
        unixDays,
        submittedAt:unixDays*86400+secondOfDay,
        name:compactUnicode?lbCompactRowName(dv,o):lbReadField(dv,o+55,17),
        diffIdx:Math.floor(b/3), tier:b%3,
        boardRank:order===0 ? offset+i+1 : 0,
      });
    }
    const prev=LB.cache[b];
    const cache=(prev&&prev.order===order)?prev:{entries:[]};
    cache.order=order;
    if(offset===0) cache.entries=page;
    else if(offset===cache.entries.length) cache.entries.push(...page);
    else{
      for(let i=0;i<page.length;i++) cache.entries[offset+i]=page[i];
      cache.entries=cache.entries.filter(Boolean);
    }
    cache.myRank=myRank||cache.myRank||0;
    cache.storedCount=storedCount;
    cache.totalRuns=Math.max(totalRuns,storedCount);
    cache.prunedCount=prunedCount;
    cache.maxSlots=maxSlots;
    cache.globalActive=globalActive;
    cache.hist=hist;
    LB.cache[b]=cache;
    // Every row this browser has seen is kept locally so a later wipe can be rebuilt
    // from the players themselves (see "Local contribution" below).
    lbSeenAdd(b,page);
    // LOAD MORE batches multiple board-page replies. Do not rebuild the whole table
    // for every arriving page; the batch applies once at the end so the list feels
    // like it extends rather than repeatedly refreshing under the player's finger.
    if(lbBoardIds().includes(b) && !LB.deferApply) lbApplyView();
    // A reply is the first moment the archive's true size is known, so this is where
    // an empty-looking archive triggers the snapshot recovery attempt, and where this
    // browser offers back whatever it still holds locally.
    lbTryRestore();
    lbContributeMaybe();
  }catch(e){}
}

function lbBoardRequestBuffer(boardId,offset=0,limit=LB_PAGE_SIZE,order=lbServerOrder()){
  const buf=new Uint8Array(25), dv=new DataView(buf.buffer);
  dv.setUint8(0,LB_PROTO_VERSION); dv.setUint8(1,boardId);
  for(let i=0;i<16;i++) buf[2+i]=LB.token.charCodeAt(i)&255;
  dv.setUint32(18,Math.max(0,offset>>>0),true);
  dv.setUint16(22,Math.max(20,Math.min(500,limit||LB_PAGE_SIZE)),true);
  dv.setUint8(24,order===1?1:0);
  return buf.buffer;
}
function lbRequestPage(boardId,offset=0,force=false,order=lbServerOrder()){
  if(!LB.opened||!LB.socket) return Promise.resolve(false);
  const key=boardId+':'+order+':'+offset;
  if(!force && LB._pageRequests[key]) return LB._pageRequests[key];
  const p=LB.socket.rpc.getBoard(lbBoardRequestBuffer(boardId,offset,LB_PAGE_SIZE,order))
    .then(rep=>{ lbHandleBoard(rep,order); return true; })
    .catch(()=>false)
    .finally(()=>{ delete LB._pageRequests[key]; });
  LB._pageRequests[key]=p;
  return p;
}
async function lbEnsureDepth(boardId,target){
  target=Math.max(LB_PAGE_SIZE,target||LB_PAGE_SIZE);
  const order=lbServerOrder();
  let c=LB.cache[boardId];
  if(!c || c.order!==order){ await lbRequestPage(boardId,0,true,order); c=LB.cache[boardId]; }
  if(!c || c.order!==order) return;
  while(c.entries.length<Math.min(target,c.storedCount||target)){
    const before=c.entries.length;
    await lbRequestPage(boardId,before,false,order);
    c=LB.cache[boardId];
    if(!c || c.order!==order || c.entries.length<=before) break;
  }
}
async function lbLoadMore(){
  if(LB.loadingMore) return;
  const screen=$('#lbScreen');
  const oldScroll=screen ? screen.scrollTop : 0;
  const moreBtn=$('#lbLoadMoreBtn');
  LB.loadingMore=true;
  LB.deferApply=true;
  if(moreBtn){ moreBtn.disabled=true; moreBtn.textContent='LOADING…'; }
  LB.displayLimit += LB_PAGE_SIZE;
  try{
    await Promise.all(lbBoardIds().map(id=>lbEnsureDepth(id,LB.displayLimit)));
  }finally{
    LB.deferApply=false;
    LB.loadingMore=false;
  }
  // Render once after the batch and preserve page position.
  // 200 rows stay where they were and the newly loaded rows extend the ranking.
  lbApplyView();
  if(screen) screen.scrollTop=oldScroll;
}

function esc(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
function lbCharIcon(cid){ return lbHeroDisplay(cid).icon; }
function lbWeaponDisplay(gid){
  const g = GUNS.find(x=>x.id===gid);
  if(!g) return { icon:'🔫', name:String(gid||'UNKNOWN').toUpperCase() };
  return { icon:weaponIcon(g), name:g.name };
}
function lbHeroInfoItem(e){
  const id=lbHeroBaseId(e.charId), c=CHARACTERS.find(x=>x.id===id);
  if(!c) return null;
  return {title:c.name,details:()=>heroDetailsHtml(c,{showClassTag:false,showDifficultyNote:false})};
}
function lbWeaponInfoItem(e){
  const g=GUNS.find(x=>x.id===e.gunId);
  if(!g) return null;
  return {title:g.name,details:()=>gunDetailsHtml(g)};
}
function lbPrepareInfoCell(cell,item){
  if(!cell || !item) return;
  cell.classList.add('lbInfoCell');
  cell.tabIndex=0;
  cell.setAttribute('role','button');
  cell.setAttribute('aria-label','View '+item.title.toLowerCase()+' details');
  cell._lbInfoItem=item;
}
function lbEnsureInfoDelegation(tbody){
  if(!tbody || tbody.dataset.infoBound==='1') return;
  tbody.dataset.infoBound='1';
  const cellFrom=target=>target?.closest?.('.lbInfoCell');
  const open=(ev,cell)=>{
    if(!cell?._lbInfoItem) return;
    ev.preventDefault(); ev.stopPropagation();
    showCardSpecs(cell,cell._lbInfoItem,true);
    AUD.ui();
  };
  // Ranking inspection is deliberate: desktop click / keyboard, mobile tap.
  // Hover and focus alone never open a hero or weapon card.
  tbody.addEventListener('click',ev=>{
    const cell=cellFrom(ev.target);
    if(cell) open(ev,cell);
  });
  tbody.addEventListener('keydown',ev=>{
    if(ev.key!=='Enter' && ev.key!==' ') return;
    const cell=cellFrom(ev.target);
    if(cell) open(ev,cell);
  });
}
function lbDateLabel(unixDays){
  if(!unixDays) return '—';
  const d=new Date(unixDays*86400000);
  return Number.isFinite(d.getTime()) ? d.toISOString().slice(0,10) : '—';
}
function lbOrdinal(n){
  n=Math.max(1,Number(n)||1);
  const mod100=n%100;
  const suf=(mod100>=11&&mod100<=13)?'TH':(n%10===1?'ST':n%10===2?'ND':n%10===3?'RD':'TH');
  return n+suf;
}
function lbTopPercent(rank,total,approx=false){
  if(!rank||!total) return '';
  // An estimate can exceed the board's known total (lifetime histogram mass vs retained
  // rows); a percentile worse than last place is meaningless, so floor it at 100%.
  const p=Math.min(100,Math.max(0.0001,rank/total*100));
  let s;
  if(p<0.01) s='<0.01';
  else if(p<1) s=p.toFixed(2);
  else if(p<10) s=p.toFixed(1);
  else s=Math.ceil(p).toString();
  return (approx?'~':'')+'TOP '+s+'%';
}
function lbFmtCount(n){
  n=Math.max(0,Number(n)||0);
  if(n<1000) return Math.round(n).toLocaleString();
  if(n<1e6) return (n/1e3).toFixed(n<1e4?1:0)+'K';
  if(n<1e9) return (n/1e6).toFixed(n<1e7?1:0)+'M';
  if(n<1e12) return (n/1e9).toFixed(n<1e10?1:0)+'B';
  return (n/1e12).toFixed(1)+'T';
}
function lbEstimateRank(score,ids=lbBoardIds()){
  score=Math.max(0,Math.min(SCORE_MAX,Number(score)||0));
  let total=0, higher=0, complete=true;
  const bin=Math.max(0,Math.min(LB_HIST_BINS-1,Math.floor(score/LB_HIST_WIDTH)));
  const low=bin*LB_HIST_WIDTH;
  const high=Math.min(SCORE_MAX+1,(bin+1)*LB_HIST_WIDTH);
  const fracAbove=Math.max(0,Math.min(1,(high-1-score)/Math.max(1,high-low)));
  for(const id of ids){
    const c=LB.cache[id];
    if(!c){ complete=false; continue; }
    total += c.totalRuns||c.entries.length;
    if(c.hist){
      for(let i=bin+1;i<LB_HIST_BINS;i++) higher+=c.hist[i]||0;
      higher+=(c.hist[bin]||0)*fracAbove;
    }else{
      higher+=c.entries.filter(e=>e.score>score).length;
      complete=false;
    }
  }
  return {rank:Math.max(1,Math.round(1+higher)),total,approx:true,complete};
}
function lbRankLabel(rank,approx=false){
  if(!approx){
    if(rank===1) return '🥇 1ST';
    if(rank===2) return '🥈 2ND';
    if(rank===3) return '🥉 3RD';
  }
  return (approx?'~':'#')+(approx?lbFmtCount(rank):rank);
}
function lbBestForSelected(){
  let best=null, boardId=-1;
  for(const id of lbBoardIds()){
    const r=LB.myBest[String(id)];
    if(!r) continue;
    if(LB.heroFilter && lbHeroBaseId(r.charId)!==LB.heroFilter) continue;
    if(LB.weaponFilter && String(r.gunId||'')!==LB.weaponFilter) continue;
    if(!best || lbScoreCompare(r,best)<0){ best=r; boardId=id; }
  }
  return best ? {record:best,boardId} : null;
}
function lbMySummary(){
  const best=lbBestForSelected();
  if(!best) return {text:'NO LOCAL SCORE SAVED FOR THIS VIEW',row:null};
  const ids=lbBoardIds();
  const single=ids.length===1;
  const boardCache=LB.cache[best.boardId];
  let exactRank=0,row=null;
  if(single && boardCache){
    row=boardCache.entries.find(e=>e.token===LB.token && e.score===best.record.score) ||
        boardCache.entries.find(e=>e.token===LB.token);
    exactRank=boardCache.myRank||row?.boardRank||0;
  }
  const est=lbEstimateRank(best.record.score,ids);
  const rank=exactRank||est.rank;
  const approx=!exactRank;
  const pct=lbTopPercent(est.rank,est.total||LB.lifetimeTotal||LB.entries.length,true);
  const rankTxt=approx?'~#'+lbFmtCount(rank):lbOrdinal(rank);
  const totalTxt=est.total ? ' OF '+lbFmtCount(est.total)+' LIFETIME RUNS' : '';
  const cut=(single && exactRank && boardCache && exactRank>boardCache.entries.length) ? ' · LOAD MORE TO REACH IT' : '';
  return {
    row,
    exactRank,
    text:'YOUR BEST: '+best.record.score.toLocaleString()+' PTS · '+rankTxt+totalTxt+(pct?' · '+pct:'')+cut
  };
}

function lbRenderMyCard(){
  const card=$('#lbMyCard'), txt=$('#lbMyText');
  if(!card||!txt) return;
  const s=lbMySummary();
  txt.textContent=s.text;
  card.classList.toggle('hasMine',!!lbBestForSelected());
}
async function lbJumpMine(){
  let s=lbMySummary();
  const ids=lbBoardIds();
  if(ids.length===1 && s.exactRank){
    const id=ids[0], c=LB.cache[id];
    if(c && s.exactRank>c.entries.length){
      const need=Math.ceil(s.exactRank/LB_PAGE_SIZE)*LB_PAGE_SIZE;
      LB.displayLimit=Math.max(LB.displayLimit,need);
      await lbEnsureDepth(id,need);
      lbApplyView();
      s=lbMySummary();
    }
  }
  const rows=[...document.querySelectorAll('#lbList tr.me')];
  const row=s.row ? rows.find(r=>Number(r.dataset.score)===Number(s.row.score)) : rows[0];
  const target=row||$('#lbMyCard');
  if(target){
    target.scrollIntoView({behavior:'smooth',block:'center'});
    target.classList.remove('mineFlash'); void target.offsetWidth; target.classList.add('mineFlash');
    setTimeout(()=>target.classList.remove('mineFlash'),1400);
  }
}

function lbSetSort(key){
  const oldOrder=lbServerOrder();
  if(LB.sortKey===key) LB.sortDir*=-1;
  else{
    LB.sortKey=key;
    LB.sortDir=(key==='player'||key==='rank')?1:-1;
  }
  const newOrder=lbServerOrder();
  if(newOrder!==oldOrder){
    LB.cache={};
    LB._pageRequests={};
    lbRefresh(true);
  }else lbApplyView();
}
function lbSyncSortUI(){
  document.querySelectorAll('[data-lbsort]').forEach(b=>{
    const active=b.dataset.lbsort===LB.sortKey;
    b.classList.toggle('active',active);
    if(b.classList.contains('lbSortBtn')){
      const base=b.dataset.label||b.textContent.replace(/[↑↓]/g,'').trim();
      b.dataset.label=base;
      b.textContent=base+(active?(LB.sortDir>0?' ↑':' ↓'):'');
    }
  });
}
function lbRender(){
  const tbody = $('#lbList'); if(!tbody) return;
  lbEnsureInfoDelegation(tbody);
  const empty = $('#lbEmpty'); if(empty) empty.style.display = LB.entries.length ? 'none' : '';
  tbody.innerHTML = '';
  for(let i=0;i<LB.entries.length;i++){
    const e = LB.entries[i];
    const tr = document.createElement('tr');
    if(e.token===LB.token) tr.className='me';
    const tierTag = (LB.tierTab < 0 && e.tier===2) ? '<span class="lbTierTag t2">OP</span>' : '';
    const diffTag = LB.diffIdx < 0 ? '<span class="lbDiffTag d'+e.diffIdx+'">'+esc(LB_DIFFS[e.diffIdx]||'UNKNOWN')+'</span>' : '';
    const conquerTag = lbConqueredDragon(e.charId) ? '<span class="lbTierTag t2">🐉 DRAGON CONQUERED</span>' : (lbDefeatedApexSeven(e.charId) ? '<span class="lbTierTag t2">⚔ APEX SEVEN DEFEATED</span>' : '');
    const playerHtml=esc(e.name)+diffTag+tierTag+conquerTag;
    const weapon=lbWeaponDisplay(e.gunId);
    const ids=lbBoardIds();
    const filteredCategory=!!(LB.heroFilter||LB.weaponFilter);
    const single=ids.length===1;
    const exactRank=filteredCategory
      ? (e.viewRank||i+1)
      : (single && e.boardRank ? e.boardRank : 0);
    const est=filteredCategory ? null : lbEstimateRank(e.score,ids);
    const rank=exactRank||(est?.rank||e.viewRank||i+1);
    const approx=!exactRank;
    // Hero/Gun filters create a category ranking from the loaded archive, so do not
    // show a misleading whole-board lifetime percentile beside that filtered rank.
    const pct=filteredCategory ? '' : lbTopPercent(est.rank,est.total||LB.lifetimeTotal||LB.entries.length,true);
    const finisher=e.time>=WIN_TIME;
    const timeHtml=e.time+'s'+(finisher?' <span class="lbFinishStar" title="500s survival finisher" aria-label="500 second finisher">★</span>':'');
    tr.dataset.score=String(e.score);
    if(finisher) tr.classList.add('finisher');
    tr.innerHTML =
      '<td class="rank" data-label="RANK"><b>'+lbRankLabel(rank,approx)+'</b><small>'+pct+'</small></td>'+
      '<td class="pName" data-label="PLAYER" tabindex="0"><span class="lbNameClip">'+playerHtml+'</span><span class="lbNamePeek" aria-hidden="true">'+playerHtml+'</span></td>'+
      '<td class="pChar" data-label="HERO">'+lbHeroCellHtml(e.charId)+'<span class="lbInfoMark" aria-hidden="true">ⓘ</span></td>'+
      '<td class="pWeapon" data-label="GUN"><span class="weaponIcon">'+weapon.icon+'</span><span class="lbWeaponName">'+esc(weapon.name)+'</span><span class="lbInfoMark" aria-hidden="true">ⓘ</span></td>'+
      '<td class="pScore" data-label="SCORE">'+e.score.toLocaleString()+'</td>'+
      '<td class="pKills" data-label="KILLS">'+e.kills+'</td>'+
      '<td class="pTime'+(finisher?' finisher':'')+'" data-label="TIME">'+timeHtml+'</td>'+
      '<td class="pLevel" data-label="LV">'+e.level+'</td>'+
      '<td class="pDate" data-label="DATE">'+lbDateLabel(e.unixDays)+'</td>';
    tbody.appendChild(tr);
    lbPrepareInfoCell(tr.querySelector('.pChar'),lbHeroInfoItem(e));
    lbPrepareInfoCell(tr.querySelector('.pWeapon'),lbWeaponInfoItem(e));
    const nameCell=tr.querySelector('.pName');
    const nameClip=nameCell?.querySelector('.lbNameClip');
    if(nameCell && nameClip){
      const overflow=nameClip.scrollWidth>nameClip.clientWidth+1;
      nameCell.classList.toggle('hasOverflow',overflow);
      if(overflow){
        nameCell.setAttribute('aria-label','Show full player badges');
        nameCell.addEventListener('click',ev=>{
          ev.stopPropagation();
          const wasOpen=nameCell.classList.contains('peekOpen');
          document.querySelectorAll('#lbList .pName.peekOpen').forEach(el=>el.classList.remove('peekOpen'));
          if(!wasOpen) nameCell.classList.add('peekOpen');
        });
      }
    }
  }
  if(!LB._peekBound){
    LB._peekBound=true;
    document.addEventListener('click',()=>{
      document.querySelectorAll('#lbList .pName.peekOpen').forEach(el=>el.classList.remove('peekOpen'));
    });
  }
  lbSyncSortUI();
  lbRenderMyCard();
  const line=$('#lbStatusLine');
  const moreBtn=$('#lbLoadMoreBtn');
  const archiveMeta=$('#lbArchiveMeta');
  const idsNow=lbBoardIds();
  const hasMore=LB.displayLimit<LB.retainedTotal;
  if(moreBtn){
    moreBtn.hidden=!hasMore;
    moreBtn.disabled=LB.loadingMore;
    moreBtn.textContent=LB.loadingMore?'LOADING…':('LOAD '+LB_PAGE_SIZE+' MORE');
  }
  if(archiveMeta){
    const aged=idsNow.reduce((n,id)=>n+(LB.cache[id]?.prunedCount||0),0);
    const anyCache=idsNow.map(id=>LB.cache[id]).find(Boolean);
    const cap=anyCache?.maxSlots||0, activeGlobal=anyCache?.globalActive||0;
    archiveMeta.textContent=(LB.retainedTotal?lbFmtCount(LB.retainedTotal)+' RETAINED IN VIEW':'')+
      (LB.lifetimeTotal?' · '+lbFmtCount(LB.lifetimeTotal)+' LIFETIME':'')+
      (aged?' · '+lbFmtCount(aged)+' AGED OUT':'')+
      (cap?' · GLOBAL ARCHIVE '+lbFmtCount(activeGlobal)+' / '+lbFmtCount(cap):'');
    archiveMeta.hidden=!(LB.retainedTotal||LB.lifetimeTotal);
  }
  if(line){
    const searchQ=String(LB.searchQuery||'').trim();
    const heroFilterName=LB.heroFilter ? lbHeroDisplay(LB.heroFilter).name : '';
    const weaponFilterName=LB.weaponFilter ? lbWeaponDisplay(LB.weaponFilter).name : '';
    const entityBits=[heroFilterName&&('HERO '+heroFilterName),weaponFilterName&&('GUN '+weaponFilterName)].filter(Boolean);
    const entityLabel=entityBits.length ? entityBits.join(' · ')+' · ' : '';
    const crossDiff=LB.diffIdx<0, crossTier=LB.tierTab<0;
    const waiting=idsNow.some(id=>!LB.cache[id]);
    let loadingLabel='LOADING BOARD…';
    if(crossDiff&&crossTier) loadingLabel='LOADING GLOBAL RANKING…';
    else if(crossDiff) loadingLabel='LOADING CROSS-DIFFICULTY RANKING…';
    else if(crossTier) loadingLabel='LOADING TOTAL RANKING…';
    if(LB.frozen){
      line.textContent='ARCHIVE FROZEN — LAYOUT MISMATCH · NOTHING WAS DELETED';
      line.classList.add('lbAlert');
    }else{
      line.classList.remove('lbAlert');
      if(waiting&&LB.opened) line.textContent=loadingLabel;
      else if(LB.restoreNote) line.textContent=LB.restoreNote;
      else if(LB.contribNote) line.textContent=LB.contribNote;
      else if(!LB.opened&&LB.status==='blocked') line.textContent='LEADERBOARD UNAVAILABLE OFF PERCHANCE';
    else if(!LB.opened&&LB.status==='offline') line.textContent='OFFLINE — RECONNECTING…';
    else if(searchQ){
      line.textContent=entityLabel+'SEARCH “'+searchQ+'” · '+LB.entries.length+' MATCH'+(LB.entries.length===1?'':'ES')+
        ' IN '+lbFmtCount(LB.loadedTotal)+' LOADED RUNS'+(hasMore?' · LOAD MORE SEARCHES DEEPER':'');
    }else if(LB.entries.length){
      line.textContent=entityLabel+'SHOWING '+LB.entries.length+' MATCH'+(LB.entries.length===1?'':'ES')+
        ' · '+lbFmtCount(LB.loadedTotal)+' LOADED · '+lbFmtCount(LB.lifetimeTotal)+' LIFETIME';
    }else line.textContent=LB.opened?'NO RUNS YET — SUBMIT ONE!':'CONNECTING…';
    }
  }
}
function lbSyncSegs(){
  document.querySelectorAll('#lbDiffSeg .segBtn').forEach(b=>b.classList.toggle('active', +b.dataset.d===LB.diffIdx));
  document.querySelectorAll('#lbTierSeg .segBtn').forEach(b=>b.classList.toggle('active', +b.dataset.t===LB.tierTab));
}
function lbPopulateEntityFilters(){
  const hs=$('#lbHeroFilter'), ws=$('#lbWeaponFilter');
  if(hs && hs.options.length<=1){
    for(const c of CHARACTERS){
      const o=document.createElement('option');
      o.value=c.id;
      o.textContent=(c.icon||'🐰')+' '+c.name;
      hs.appendChild(o);
    }
  }
  if(ws && ws.options.length<=1){
    for(const g of GUNS){
      const o=document.createElement('option');
      o.value=g.id;
      o.textContent=weaponIcon(g)+' '+g.name;
      ws.appendChild(o);
    }
  }
  if(hs) hs.value=LB.heroFilter||'';
  if(ws) ws.value=LB.weaponFilter||'';
}
function lbOpen(){
  setScreen('lb');
  const ni=$('#lbNameInput'); if(ni) ni.value=LB.name;
  const si=$('#lbSearchInput'); if(si) si.value=LB.searchQuery||'';
  lbSyncSegs();
  lbPopulateEntityFilters();
  lbRefresh(true);
  lbTryRestore();
  lbBackupMaybe();
}
function lbRefresh(resetDepth=false){
  if(resetDepth) LB.displayLimit=LB_PAGE_SIZE;
  lbApplyView();
  if(!LB.opened||!LB.socket) return;
  for(const boardId of lbBoardIds()) lbEnsureDepth(boardId,LB.displayLimit);
}

// A submit payload with an explicit identity, so a run can be built for a token/name
// that are not the current player's (the local-contribution module replays other
// people's cached rows with their own token and name).
function lbBuildRunPayload(rec, token, name){
  const nm = lbSanitizeName(name);
  const charId = String(rec.charId||'pulse').slice(0,12);
  const gunId = String(rec.gunId||'rustyp').slice(0,12);
  const encAscii = s => { const o = new Uint8Array(s.length); for(let i=0;i<s.length;i++) o[i]=s.charCodeAt(i)&255; return o; };
  const nameUtf8=LB_TEXT_ENCODER.encode(nm).subarray(0,LB_NAME_UTF8_CAP);
  // Keep the original 72-byte prefix for compatibility, then append the authoritative UTF-8 name.
  const buf = new Uint8Array(74+nameUtf8.length);
  const dv = new DataView(buf.buffer);
  dv.setUint8(0, LB_PROTO_VERSION);
  dv.setUint8(1, rec.diff);
  dv.setUint8(2, rec.tier);
  const cb = encAscii(charId); dv.setUint8(3, cb.length); buf.set(cb, 4);
  const gb = encAscii(gunId); dv.setUint8(16, gb.length); buf.set(gb, 17);
  const legacyName=Array.from(nm).filter(ch=>{const cp=ch.codePointAt(0);return cp>=32&&cp<=126;}).join('').slice(0,16)||'PLAYER';
  const nb = encAscii(legacyName); dv.setUint8(29, nb.length); buf.set(nb, 30);
  const tb = encAscii(String(token||'').slice(0,16)); buf.set(tb, 46);
  dv.setUint32(62, Math.min(SCORE_MAX, Math.max(1, Math.floor(rec.score))), true);
  dv.setUint16(66, Math.min(99999, Math.floor(rec.kills)), true);
  dv.setUint16(68, Math.min(999, Math.floor(rec.time)), true);
  dv.setUint16(70, Math.min(999, Math.floor(rec.level)), true);
  buf[72]=0xa5; buf[73]=nameUtf8.length; buf.set(nameUtf8,74);
  return buf;
}
function lbBuildSubmit(rec){
  return lbBuildRunPayload(rec, LB.token, lbNameOrDefault()).buffer;
}
// ---------------------------------------------------------------------------
// OWNER CLEANUP ("hide my own runs") — client half.
//
// The server's withdrawMine() sets a WITHDRAWN bit on matching archive rows so they
// stop being paged out to anyone, while KEEPING their slot (see the OWNER CLEANUP
// block in the index.html server script for why deleting the rows instead would be
// the wrong move). Rows are matched by this browser's own token PLUS every run field,
// so a stray call can never touch another player's rows. Only the SHA-256 of the owner
// password lives on the server; the password itself is typed in here and never stored.
// ---------------------------------------------------------------------------
const LB_WITHDRAW_MAGIC = 0xce;
const LB_WITHDRAW_MAX_ROWS = 400;
const LB_WITHDRAW_PW_MAX = 64;
function lbAsciiBytes(s){
  const o = new Uint8Array(s.length);
  for(let i=0;i<s.length;i++) o[i]=s.charCodeAt(i)&255;
  return o;
}
// [0xce][token:16][count:u16le][pwLen:u8][password] then count x
// [board:u8][day:u16le][score:u32le][kills:u16le][time:u16le][level:u16le]
// [charLen:u8][charId][gunLen:u8][gunId] — must stay in lockstep with withdrawMine().
function lbWithdrawRequestBuffer(rows, password){
  const token = lbAsciiBytes(String(LB.token||'').slice(0,16));
  const pw = LB_TEXT_ENCODER.encode(String(password||'')).slice(0,LB_WITHDRAW_PW_MAX);
  const parts = [];
  for(const r of (rows||[])){
    if(parts.length >= LB_WITHDRAW_MAX_ROWS) break;
    const board = Math.floor(r.diffIdx)*3 + Math.floor(r.tier);
    if(board%3===1) continue;                                  // tier-1 boards are retired
    const cb = lbAsciiBytes(String(r.charId||''));
    const gb = lbAsciiBytes(String(r.gunId||''));
    const part = new Uint8Array(15+cb.length+gb.length), dv = new DataView(part.buffer);
    part[0] = board;
    dv.setUint16(1, Math.max(0,Math.floor(r.unixDays||0)), true);
    dv.setUint32(3, Math.max(0,Math.floor(r.score||0)), true);
    dv.setUint16(7, Math.max(0,Math.floor(r.kills||0)), true);
    dv.setUint16(9, Math.max(0,Math.floor(r.time||0)), true);
    dv.setUint16(11, Math.max(0,Math.floor(r.level||0)), true);
    part[13] = cb.length; part.set(cb,14);
    part[14+cb.length] = gb.length; part.set(gb,15+cb.length);
    parts.push(part);
  }
  const head = new Uint8Array(20+pw.length);
  head[0] = LB_WITHDRAW_MAGIC; head.set(token,1);
  head[17] = parts.length&255; head[18] = (parts.length>>8)&255; head[19] = pw.length;
  head.set(pw,20);
  let total = head.length; for(const p of parts) total += p.length;
  const out = new Uint8Array(total); let o = 0;
  out.set(head,o); o += head.length;
  for(const p of parts){ out.set(p,o); o += p.length; }
  return out;
}
// Hides rows that belong to THIS browser's token. Resolves with the server's
// "withdrawn:<n>" (n = rows actually hidden) so callers can report a real number.
async function lbWithdrawRows(rows, password){
  const mine = (rows||[]).filter(r=>r && r.token===LB.token);
  if(!mine.length) return 'withdrawn:0';
  if(!LB.opened || !LB.socket) throw new Error('leaderboard-offline');
  const rep = await LB.socket.rpc.withdrawMine(lbWithdrawRequestBuffer(mine,password).buffer);
  return String(rep);
}
// Hides every row this player owns on the given boards, deepest-first: the page only
// holds the rows it has paged in, so each board is filled to its stored depth before
// filtering. Chunked to the server's per-call row cap. Returns the rows it acted on so
// the caller can also forget them locally (nothing may be re-offered by contribution).
async function lbWithdrawMineOnBoards(boardIds, password, dayFilter=0){
  const rows = [];
  for(const b of boardIds){
    if(b%3===1) continue;
    // Fill every board in scope first: a board with no cache at all would otherwise be
    // skipped, and hiding nothing looks identical to "nothing of yours is here".
    const c = LB.cache[b];
    await lbEnsureDepth(b, Math.max((c && c.storedCount)||0, LB_PAGE_SIZE));
    rows.push(...(((LB.cache[b]||{}).entries)||[]).filter(r=>r.token===LB.token && (!dayFilter || Math.floor(r.unixDays)===dayFilter)));
  }
  let total = 0;
  for(let i=0;i<rows.length;i+=LB_WITHDRAW_MAX_ROWS){
    try{ total += Number(String(await lbWithdrawRows(rows.slice(i,i+LB_WITHDRAW_MAX_ROWS), password)).replace('withdrawn:',''))||0; }
    catch(e){ return {withdrawn:total, rows, error:String((e&&e.message)||e)}; }
  }
  return {withdrawn:total, rows, error:null};
}
// Drops hidden runs from this browser's rollback sources: the local "your best" card and
// the seen-rows mirror that the contribution path offers back to a wiped archive. Without
// this, a hidden run could be silently re-offered by the owner's OWN browser.
function lbForgetLocalRuns(rows){
  if(!rows||!rows.length) return;
  let bestChanged=false;
  lbSeenLoad();
  for(const r of rows){
    const board = Math.floor(r.diffIdx)*3 + Math.floor(r.tier);
    const best = LB.myBest[String(board)];
    if(best && Math.floor(best.score)===Math.floor(r.score) && Math.floor(best.unixDays||0)===Math.floor(r.unixDays||0)
      && String(best.charId||'')===String(r.charId||'') && String(best.gunId||'')===String(r.gunId||'')){
      delete LB.myBest[String(board)]; bestChanged=true;
    }
    LB_SEEN.rows.delete(lbSeenKey(board,r));
  }
  if(bestChanged){ try{ localStorage.setItem(LB_KEY_BEST,JSON.stringify(LB.myBest)); }catch(e){} }
  lbSeenSave();
}
function lbOwnerOpen(){
  const m=$('#lbOwnerModal'); if(!m) return;
  const pw=$('#lbOwnerPwInput'); if(pw) pw.value='';
  const msg=$('#lbOwnerMsg'); if(msg){ msg.textContent=''; msg.classList.remove('lbAlert'); }
  m.hidden=false;
}
function lbOwnerClose(){ const m=$('#lbOwnerModal'); if(m) m.hidden=true; }
async function lbOwnerHide(){
  const pwEl=$('#lbOwnerPwInput'), msg=$('#lbOwnerMsg'), btn=$('#lbOwnerHideBtn');
  const pw = pwEl ? pwEl.value : '';
  const say=(text,alert)=>{ if(msg){ msg.textContent=text; msg.classList.toggle('lbAlert',!!alert); } };
  if(!pw){ say('ENTER THE OWNER PASSWORD.',true); return; }
  const scope = ($('#lbOwnerScope') && $('#lbOwnerScope').value) || 'view';
  const dayFilter = scope==='today' ? Math.floor(Date.now()/86400000) : 0;
  const boards = scope==='view' ? lbBoardIds() : lbAllBoards();
  if(btn){ btn.disabled=true; btn.textContent='HIDING…'; }
  say('WORKING — LOADING MY RUNS…');
  let res;
  try{ res = await lbWithdrawMineOnBoards(boards, pw, dayFilter); }
  catch(e){ res = {withdrawn:0, rows:[], error:String((e&&e.message)||e)}; }
  if(btn){ btn.disabled=false; btn.textContent='HIDE MY RUNS'; }
  if(res.error){
    if(res.error==='bad-password' || /bad-password/.test(res.error)) say('WRONG PASSWORD.',true);
    else if(res.error==='leaderboard-offline') say('LEADERBOARD NOT CONNECTED — TRY AGAIN.',true);
    else if(res.error==='unknown-rpc' || res.error==='not-found' || /unknown|unsupported|not.?found/i.test(res.error)) say('THIS SERVER DOES NOT SUPPORT CLEANUP YET — SAVE THE GENERATOR FIRST.',true);
    else say('FAILED: '+String(res.error).toUpperCase(),true);
    return;
  }
  lbForgetLocalRuns(res.rows);
  if(res.withdrawn>0){ say('HIDDEN '+(res.withdrawn===1?'1 RUN':'HIDDEN '+res.withdrawn+' RUNS')+' OF '+res.rows.length+'.'); AUD.ui(); }
  else if(res.rows.length) say('NOTHING LEFT TO HIDE ('+res.rows.length+' ALREADY HIDDEN).');
  else say('NO RUNS OF YOURS MATCH THIS SCOPE.');
  lbRefresh(true);
}
async function lbSendSubmit(rec){
  if(!LB.opened || !LB.socket){ LB.pending = rec; return 'queued'; }
  try{
    const rep = await LB.socket.rpc.submit(lbBuildSubmit(rec));
    lbHandleBoard(rep,0);
    // Only remember the local best once the server actually accepted the run. Doing
    // this before the submit is acknowledged is what let locally-rejected test runs
    // (and rate-limited ones) linger as phantom "your best" rows on the boards.
    lbRememberBest(rec.diff*3+rec.tier, rec);
    return 'submitted';
  }catch(e){ return 'failed'; }
}
function lbSubmitRun(){
  if(!runIsRankable() || !LB.name) return null;
  const di = LB_DIFFS.indexOf(G.diff);
  if(di < 0) return null;
  const tier = lbTier();
  if(tier!==0 && tier!==2) return null;
  const rec = {
    diff: di,
    tier,
    score: Math.floor(G.score),
    kills: G.kills,
    time: Math.floor(G.time),
    level: G.level + 1,
    charId: (G.char ? G.char.id : 'pulse') + (G.finalBossDefeated ? (G.finalBossMode==='apexSeven'?'~7':'~c') : ''),
    gunId: G.gun ? G.gun.id : 'rustyp',
  };
  const boardId=di*3+tier;
  return { p: lbSendSubmit(rec), boardId, di, tier };
}

// ---------------------------------------------------------------------------
// Archive backup + restore.
//
// The server's durable state has no backup of its own, so this module mirrors the
// archive into a public upload-plugin EDITABLE text file every few minutes and can
// push that snapshot back if the durable archive ever comes back empty. On
// 2026-09-16 a layout bump shipped without a migration and the server's zero-fill
// fallback wiped a live archive of thousands of runs; the server now FREEZES
// instead of wiping, and these are the RPCs that recover a wiped archive from the
// mirror. Server side: RESTORE_* constants + restoreBegin/Rows/Stats/Finish in
// index.html's server script. The file name below must match LB_BACKUP_NAME there.
// ---------------------------------------------------------------------------
const LB_BACKUP_NAME = 'hop-havoc-mod-lb-backup-1';
const LB_BACKUP_META_KEY = 'bb_lb_backup_meta_v1';
const LB_BACKUP_MAGIC = 'HHMODLB1';
const LB_BACKUP_ROWS_PER_BOARD = 600;
const LB_BACKUP_PAGE = 500;
// The mirror is a disaster-recovery device, not a live feed: it only needs to be as
// fresh as "the archive as of the last time someone looked". Mirror writes share the
// anonymous upload quota, so they are throttled and skipped entirely while the
// archive's row count is unchanged.
const LB_BACKUP_MIN_INTERVAL = 30*60*1000;
const LB_BACKUP_STAT_BYTES = 8+LB_HIST_BINS*4;
const LB_RESTORE_MAX_EXISTING = 200;
const LB_RESTORE_ROWS_PER_BLOCK = 256;
const LB_RESTORE_RETRY_MS = 90*1000;

function lbAllBoards(){ return Array.from({length:LB_DIFFS.length*3},(_,i)=>i); }
function lbB64Encode(bytes){
  let s='';
  for(let i=0;i<bytes.length;i+=0x8000) s+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));
  return btoa(s);
}
function lbB64Decode(str){
  const bin=atob(String(str||'')); const out=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i);
  return out;
}
function lbBackupMeta(){
  try{ const o=JSON.parse(localStorage.getItem(LB_BACKUP_META_KEY)||'{}'); return (o&&typeof o==='object')?o:{}; }catch(e){ return {}; }
}
function lbSaveBackupMeta(m){ try{ localStorage.setItem(LB_BACKUP_META_KEY,JSON.stringify(m)); }catch(e){} }
function lbBackupKeyFromText(text){
  const m=/(?:^|\n)K\s+([A-Za-z0-9_-]{4,})/.exec(String(text||''));
  return m?m[1]:'';
}
// Reads raw 72-byte archive records straight out of a board reply. lbHandleBoard()
// rebuilds the UI cache and drops the original bytes, which is exactly what the
// mirror needs, so this stays a separate parse.
function lbParseBoardPageRaw(buf){
  try{
    const dv=new DataView(buf);
    if(dv.getUint8(0)!==LB_PROTO_VERSION) return null;
    const count=dv.getUint16(2,true);
    if(buf.byteLength<LB_REPLY_HEAD+count*LB_ROW_BYTES) return null;
    const rows=new Uint8Array(count*LB_ROW_BYTES);
    if(count) rows.set(new Uint8Array(buf,LB_REPLY_HEAD,count*LB_ROW_BYTES));
    const hist=new Uint8Array(LB_HIST_BINS*4), hdv=new DataView(hist.buffer);
    for(let i=0;i<LB_HIST_BINS;i++) hdv.setUint32(i*4,dv.getUint32(34+i*4,true),true);
    return {
      board:dv.getUint8(1), count, rows, hist,
      storedCount:dv.getUint32(8,true), totalRuns:dv.getUint32(16,true),
      pruned:dv.getUint32(20,true), globalActive:dv.getUint32(30,true),
    };
  }catch(e){ return null; }
}
async function lbCollectBoardBackup(boardId,maxRows){
  const out={board:boardId,rows:new Uint8Array(0),n:0,total:0,pruned:0,hist:null};
  let offset=0;
  while(out.n<maxRows){
    const limit=Math.min(LB_BACKUP_PAGE,maxRows-out.n);
    let rep; try{ rep=await LB.socket.rpc.getBoard(lbBoardRequestBuffer(boardId,offset,limit,0)); }catch(e){ break; }
    const page=lbParseBoardPageRaw(rep); if(!page) break;
    if(!out.hist) out.hist=page.hist;
    if(out.n===0){ out.total=page.totalRuns; out.pruned=page.pruned; }
    if(!page.count) break;
    const merged=new Uint8Array((out.n+page.count)*LB_ROW_BYTES);
    merged.set(out.rows,0); merged.set(page.rows,out.n*LB_ROW_BYTES);
    out.rows=merged; out.n+=page.count; offset+=page.count;
    if(page.count<limit || offset>=page.storedCount) break;
  }
  return out;
}
async function lbBuildBackupSnapshot(){
  const meta=lbBackupMeta();
  const lines=[LB_BACKUP_MAGIC+' '+String(window.generatorName||'')+' '+Date.now()+' '+LB_PROTO_VERSION];
  if(meta.key) lines.push('K '+meta.key);
  const stats=new Uint8Array(lbAllBoards().length*LB_BACKUP_STAT_BYTES);
  const sdv=new DataView(stats.buffer);
  let rows=0;
  for(const b of lbAllBoards()){
    const col=await lbCollectBoardBackup(b,LB_BACKUP_ROWS_PER_BOARD);
    const so=b*LB_BACKUP_STAT_BYTES;
    sdv.setUint32(so,col.total,true); sdv.setUint32(so+4,col.pruned,true);
    if(col.hist) stats.set(col.hist,so+8);
    if(col.n){ lines.push('ROWS '+b+' '+col.n+' '+lbB64Encode(col.rows)); rows+=col.n; }
  }
  lines.push('STATS '+lbB64Encode(stats));
  return {text:lines.join('\n'),rows};
}
async function lbEnsureBackupKey(){
  const meta=lbBackupMeta();
  if(meta.key) return meta.key;
  // The file is the only surviving copy of its edit key after a localStorage wipe,
  // so the key travels inside the snapshot itself (the K line).
  try{
    const text=await root.uploadPlugin.editable.get(LB_BACKUP_NAME);
    const key=lbBackupKeyFromText(text);
    if(key){ meta.key=key; lbSaveBackupMeta(meta); return key; }
  }catch(e){}
  return '';
}
async function lbUploadBackup(){
  if(!LB.opened||!LB.socket) return false;
  if(!root?.uploadPlugin?.editable) return false;
  let built; try{ built=await lbBuildBackupSnapshot(); }catch(e){ return false; }
  if(!built.rows) return false;
  const meta=lbBackupMeta();
  if(meta.rows && built.rows<meta.rows) return false; // never replace a fuller mirror with a thinner one
  let key=meta.key||await lbEnsureBackupKey();
  const put=k=>k ? root.uploadPlugin.editable.set(LB_BACKUP_NAME,built.text,{editKey:k})
                 : root.uploadPlugin.editable.set(LB_BACKUP_NAME,built.text);
  // editable.set resolves (does not throw) for service errors, so `error` must be checked.
  // `editable_requires_saved_generator` is the expected result while the generator is unsaved.
  let res=null;
  try{ res=await put(key); }catch(e){ res={error:String(e?.message||e)}; }
  if(res && res.error){
    const reread=await lbEnsureBackupKey();
    if(reread && reread!==key){
      key=reread;
      try{ res=await put(key); }catch(e){ res={error:String(e?.message||e)}; }
    }
  }
  if(!res || res.error){
    LB.backupError=String(res&&res.error||'unknown');
    console.warn('hop-havoc leaderboard: snapshot mirror not updated ('+LB.backupError+')');
    return false;
  }
  if(res.editKey){
    key=res.editKey;
    // The mirror must carry its own edit key: after a localStorage wipe that line is the
    // only way to find the key again and keep updating the same file (a fresh create
    // cannot know it up front, so the file is written once more with it embedded).
    try{ await root.uploadPlugin.editable.set(LB_BACKUP_NAME,built.text.replace('\n','\nK '+key+'\n'),{editKey:key}); }catch(e){}
  }
  LB.backupError='';
  lbSaveBackupMeta({at:Date.now(),rows:built.rows,active:lbArchiveSignature(),key});
  return true;
}
// Cheap "has the archive changed" signature: the server's global live-row count, which
// is present on every board reply. Any submit or age-out moves it.
function lbArchiveSignature(){
  const cached=Object.values(LB.cache).find(c=>c&&typeof c.globalActive==='number');
  return cached?cached.globalActive:-1;
}
function lbBackupMaybe(force=false){
  if(LB.backupBusy) return;
  const meta=lbBackupMeta();
  if(!force && meta.at && Date.now()-meta.at<LB_BACKUP_MIN_INTERVAL) return;
  const sig=lbArchiveSignature();
  if(!force && meta.at && meta.rows && meta.active===sig) return;
  LB.backupBusy=true;
  Promise.resolve().then(lbUploadBackup).catch(()=>{}).finally(()=>{ LB.backupBusy=false; });
}
function lbParseBackupText(text){
  const lines=String(text||'').split('\n');
  const head=lines[0].split(' ');
  if(head[0]!==LB_BACKUP_MAGIC) return null;
  if(head[1] && window.generatorName && head[1]!==window.generatorName) return null;
  const blocks=[]; let stats=null;
  for(let i=1;i<lines.length;i++){
    const l=lines[i]; if(!l) continue;
    const sp=l.indexOf(' ');
    const tag=sp<0?l:l.slice(0,sp);
    if(tag==='ROWS'){
      const parts=l.split(' '), board=Number(parts[1]), n=Number(parts[2]);
      if(!Number.isInteger(board)||board<0||board>=lbAllBoards().length) continue;
      if(!Number.isInteger(n)||n<1) continue;
      let bytes; try{ bytes=lbB64Decode(parts[3]); }catch(e){ continue; }
      const rows=Math.min(n,Math.floor(bytes.length/LB_ROW_BYTES));
      if(rows>0) blocks.push({board,rows:bytes.subarray(0,rows*LB_ROW_BYTES),n:rows});
    }else if(tag==='STATS'){
      try{ stats=lbB64Decode(l.slice(6)); }catch(e){ stats=null; }
    }
  }
  if(!blocks.length) return null;
  return {blocks,stats};
}
async function lbTryRestore(){
  if(LB.frozen||LB.restoreNote||LB.backupBusy||LB.restoreBlocked) return false;
  if(!LB.opened||!LB.socket) return false;
  if(!root?.uploadPlugin?.editable) return false;
  const cached=Object.values(LB.cache).find(c=>c&&typeof c.globalActive==='number');
  if(!cached||cached.globalActive>LB_RESTORE_MAX_EXISTING) return false;
  const meta=lbBackupMeta();
  if(meta.restoreAt && Date.now()-meta.restoreAt<LB_RESTORE_RETRY_MS) return false;
  meta.restoreAt=Date.now(); lbSaveBackupMeta(meta);
  let text=null; try{ text=await root.uploadPlugin.editable.get(LB_BACKUP_NAME); }catch(e){ return false; }
  const snap=lbParseBackupText(text); if(!snap) return false;
  let received=0;
  try{
    await LB.socket.rpc.restoreBegin('');
    for(const blk of snap.blocks){
      for(let i=0;i<blk.n;i+=LB_RESTORE_ROWS_PER_BLOCK){
        const n=Math.min(LB_RESTORE_ROWS_PER_BLOCK,blk.n-i);
        const buf=new Uint8Array(3+n*LB_ROW_BYTES);
        buf[0]=blk.board; buf[1]=n&255; buf[2]=(n>>8)&255;
        buf.set(blk.rows.subarray(i*LB_ROW_BYTES,(i+n)*LB_ROW_BYTES),3);
        await LB.socket.rpc.restoreRows(buf.buffer);
        received+=n;
      }
    }
    if(snap.stats&&snap.stats.length>=lbAllBoards().length*LB_BACKUP_STAT_BYTES)
      await LB.socket.rpc.restoreStats(snap.stats.buffer);
    const res=await LB.socket.rpc.restoreFinish('');
    LB.restoreNote='ARCHIVE RESTORED FROM LOCAL BACKUP · '+String(res||'').replace('restored:','')+' RUNS';
    console.log('hop-havoc leaderboard: restore finished', res, 'from', received, 'backed-up rows');
  }catch(e){
    // A deployed server that predates these RPCs simply does not answer them, so a
    // failure stays quiet in the UI (and latches until the next reconnect) instead of
    // showing a scary error on a generator whose archive is fine.
    LB.restoreBlocked=true;
    console.warn('hop-havoc leaderboard: snapshot restore unavailable', e?.message||e);
    return false;
  }
  lbRefresh(true);
  return true;
}

// ---------------------------------------------------------------------------
// Local contribution ("crowd restore").
//
// The durable archive has no backup of its own, and the 2026-09-16 wipe proved that a
// single mirror file is a single point of failure. Every browser, however, still holds
// data the server may have lost:
//   * LB.myBest - this player's own best run on each board, with the day it was set
//     (written only after the server accepted that run), and
//   * from here on, every board row this browser has ever seen, accumulated in
//     bb_lb_seenrows_v1 (bounded, oldest dropped) - including other players' rows.
// On connect we offer those back to the server in small batches (RPC contributeRuns), so
// a wiped archive is rebuilt piece by piece from the players' own devices instead of
// depending on one snapshot file. The server accepts contributions only while the
// archive is still small, re-validates and rebuilds every row itself, and skips exact
// duplicates, so this is no more dangerous than the ordinary submit path.
// Server side: CONTRIB_* constants + contributeRuns in index.html's server script.
const LB_SEEN_KEY='bb_lb_seenrows_v1';
const LB_SEEN_MAX_ROWS=2500;
const LB_CONTRIB_BATCH=64;
const LB_CONTRIB_MAGIC=0xCB;
const LB_CONTRIB_MAX_ACTIVE=20000;
const LB_CONTRIB_PASS_MAX=1500;
const LB_CONTRIB_RETRY_MS=120000;
const LB_CONTRIB_SAVE_MS=6000;
const LB_SEEN={rows:new Map(),loaded:false,timer:null};

// Rows this build refuses to remember at all. Before the trusted-click gate in
// `runIsRankable` existed, the agent test harness pushed runs to the LIVE boards
// (2026-09-16, day 20712) under the owner token. They are still sitting in the archive,
// so any read of a saved board hands them straight back to this ledger - and a ledger row
// is exactly what this browser offers the archive after a wipe, so remembering them is
// how a cleaned-up board would get its junk runs back. The owner's one real run from that
// day (board 9, score 583) is kept; the rest of the token+day bucket is harness output.
// This is a one-off cleanup of one day's incident, not a rule - delete once it is stale.
const LB_SEEN_DROP=[{token:'10b4e86594e2463d',day:20712,keepBoard:9,keepScore:583}];
function lbSeenRefused(b,r){
  for(const d of LB_SEEN_DROP){
    if(String((r&&r.token)||'')!==d.token) continue;
    if(Math.floor(Number(r&&r.unixDays)||0)!==d.day) continue;
    if(b===d.keepBoard&&Number(r.score)===d.keepScore) continue;
    return true;
  }
  return false;
}

function lbSeenKey(b,r){ return b+'|'+String(r.token||'')+'|'+r.score+'|'+r.time+'|'+r.kills; }
function lbSeenLoad(){
  if(LB_SEEN.loaded) return;
  LB_SEEN.loaded=true;
  let arr=null; try{ arr=JSON.parse(localStorage.getItem(LB_SEEN_KEY)||'null'); }catch(e){}
  let refused=0;
  if(Array.isArray(arr)) for(const r of arr){
    if(!r||typeof r.b!=='number') continue;
    if(lbSeenRefused(r.b,r)){ refused++; continue; }
    LB_SEEN.rows.set(lbSeenKey(r.b,r),r);
  }
  lbSeenTrim();
  // Rewrite the stored array immediately so a refused row is gone from disk on this very
  // load, instead of lingering until the next time something is added.
  if(refused) lbSeenSave();
}
function lbSeenTrim(){
  while(LB_SEEN.rows.size>LB_SEEN_MAX_ROWS) LB_SEEN.rows.delete(LB_SEEN.rows.keys().next().value);
}
function lbSeenSaveSoon(){
  if(LB_SEEN.timer) return;
  LB_SEEN.timer=setTimeout(()=>{ LB_SEEN.timer=null; lbSeenSave(); },LB_CONTRIB_SAVE_MS);
}
function lbSeenSave(){
  try{ localStorage.setItem(LB_SEEN_KEY,JSON.stringify([...LB_SEEN.rows.values()])); }catch(e){}
}
// Remember every row this browser sees, so a later wipe can be rebuilt from it.
function lbSeenAdd(b,entries){
  if(!entries||!entries.length) return;
  lbSeenLoad();
  let changed=false;
  for(const e of entries){
    if(!e||!e.token||!(e.score>0)||!e.charId||!e.gunId) continue;
    if(lbSeenRefused(b,e)) continue;
    const k=lbSeenKey(b,e);
    if(LB_SEEN.rows.has(k)) continue;
    LB_SEEN.rows.set(k,{b,token:e.token,score:e.score,kills:e.kills,time:e.time,level:e.level,
      charId:e.charId,gunId:e.gunId,unixDays:e.unixDays||0,name:e.name||''});
    changed=true;
  }
  if(!changed) return;
  lbSeenTrim(); lbSeenSaveSoon();
}
// The day a run was really set, or 0 to let the server stamp it today. 19000 is the
// server's own plausibility floor for a stored date.
function lbRunDay(r){ const d=Math.floor(Number(r&&r.unixDays)||0); return (d>=19000&&d<40000)?d:0; }
function lbRunFromSeen(r){
  return {days:lbRunDay(r),
    payload:lbBuildRunPayload({diff:Math.floor(r.b/3),tier:r.b%3,score:r.score,kills:r.kills,
      time:r.time,level:r.level,charId:r.charId,gunId:r.gunId}, r.token, r.name)};
}
// This player's own local bests, as runs to offer back. Tier-1 boards are retired and
// are skipped (the server rejects them anyway).
function lbCollectMyBestRuns(){
  const out=[], token=LB.token||lbGenToken(), name=lbNameOrDefault(), boards=lbAllBoards().length;
  for(const key of Object.keys(LB.myBest||{})){
    const b=Number(key);
    if(!Number.isInteger(b)||b<0||b>=boards||b%3===1) continue;
    const r=LB.myBest[key]; if(!r||!(r.score>0)) continue;
    out.push({days:lbRunDay(r),
      payload:lbBuildRunPayload({diff:Math.floor(b/3),tier:b%3,score:r.score,kills:r.kills,
        time:r.time,level:r.level,charId:r.charId,gunId:r.gunId}, token, name)});
  }
  return out;
}
// [0xCB][count:u16le] then [days:u16le][len:u16le][payload] per run.
function lbContributionBlock(runs){
  const take=runs.slice(0,LB_CONTRIB_BATCH);
  let size=3; for(const r of take) size+=4+r.payload.length;
  const buf=new Uint8Array(size), dv=new DataView(buf.buffer);
  buf[0]=LB_CONTRIB_MAGIC; dv.setUint16(1,take.length,true);
  let o=3;
  for(const r of take){
    dv.setUint16(o,r.days&0xffff,true); dv.setUint16(o+2,r.payload.length,true);
    buf.set(r.payload,o+4); o+=4+r.payload.length;
  }
  return {buffer:buf.buffer,count:take.length};
}
async function lbContributeMaybe(force=false){
  if(LB.contribBusy||LB.contribBlocked||LB.frozen) return false;
  if(!LB.opened||!LB.socket) return false;
  const cached=Object.values(LB.cache).find(c=>c&&typeof c.globalActive==='number');
  // No board reply yet, so we don't know whether the archive needs help.
  if(!cached) return false;
  const meta=lbBackupMeta();
  // Detect a FRESH wipe (live rows collapsed from a real archive) so everything this
  // browser holds is offered again, even rows it already contributed once.
  lbSeenLoad();
  if((meta.lastActive||0)>=500 && cached.globalActive<200){
    for(const r of LB_SEEN.rows.values()) delete r.sent;
    lbSeenSave();
  }
  // A healthy archive is not writable this way (the server enforces the same window).
  if(cached.globalActive>LB_CONTRIB_MAX_ACTIVE) return false;
  if(!force&&meta.contribAt&&Date.now()-meta.contribAt<LB_CONTRIB_RETRY_MS) return false;
  const queue=lbCollectMyBestRuns();
  // Offer back only rows for a board the server still holds FEWER of than we do. On a
  // healthy archive every board already has at least as many, so a client uploads
  // nothing; after a wipe (server count 0) it offers everything it kept.
  const localByBoard={};
  for(const r of LB_SEEN.rows.values()) localByBoard[r.b]=(localByBoard[r.b]||0)+1;
  const pending=[];
  for(const r of LB_SEEN.rows.values()){
    if(r.sent) continue;
    const c=LB.cache[r.b];
    if(!c||typeof c.storedCount!=='number') continue;
    if(c.storedCount>=localByBoard[r.b]) continue;
    pending.push(r);
    if(pending.length>=LB_CONTRIB_PASS_MAX) break;
  }
  for(const r of pending) queue.push(lbRunFromSeen(r));
  LB.contribBusy=true;
  let added=0,dup=0,invalid=0,stopped=false;
  try{
    for(let i=0;i<queue.length;i+=LB_CONTRIB_BATCH){
      const blk=lbContributionBlock(queue.slice(i,i+LB_CONTRIB_BATCH));
      if(!blk.count) break;
      let res;
      try{ res=await LB.socket.rpc.contributeRuns(blk.buffer); }
      catch(e){
        const m=String((e&&e.message)||e);
        if(/archive-healthy|rate-limited|in-progress|archive-frozen/.test(m)){ stopped=true; break; }
        throw e;
      }
      const m=/^contrib:(\d+):(\d+):(\d+)$/.exec(String(res||''));
      if(m){ added+=Number(m[1]); dup+=Number(m[2]); invalid+=Number(m[3]); }
      await new Promise(r=>setTimeout(r,150));
    }
    meta.contribAt=Date.now(); meta.lastActive=cached.globalActive; lbSaveBackupMeta(meta);
    // Mark what we offered so the next pass doesn't re-upload it (a fresh wipe clears
    // these marks above).
    if(pending.length&&!stopped){ for(const r of pending) r.sent=1; lbSeenSave(); }
    if(added){
      LB.contribNote='CONTRIBUTED '+added+' LOCAL RUN'+(added===1?'':'S')+' TO THE ARCHIVE';
      console.log('hop-havoc leaderboard: contributed '+added+' local runs ('+dup+' already present, '+invalid+' rejected)');
      lbRefresh(true);
    }
  }catch(e){
    // An undeployed server simply doesn't answer the RPC, so this stays quiet in the UI
    // and latches until the next reconnect, like the snapshot restore above.
    LB.contribBlocked=true;
    console.warn('hop-havoc leaderboard: local contribution unavailable',(e&&e.message)||e);
    return false;
  }finally{ LB.contribBusy=false; }
  return added>0;
}

function openCommunity(){
  setScreen('community');
  const ctn = $('#communityCtn');
  if(ctn && !ctn.dataset.rendered){
    ctn.dataset.rendered = '1';
    try{
      if(!root?.defaultCommentOptions) throw new Error('defaultCommentOptions missing');
      ctn.innerHTML = root.commentsPlugin(root.defaultCommentOptions);
    }catch(e){
      console.error('comments-plugin failed', e);
      ctn.innerHTML = '<div style="padding:20px;color:var(--dim)">COMMUNITY COULD NOT LOAD</div>';
    }
  }
}

// ---------------- Auto-translate (UI) ----------------
const BB_LANG_KEY = 'bb_ui_language_v1';
const BB_TCACHE_KEY = 'bb_ui_translation_cache_v1';
const BB_LANG_CODES = '|en|ru|es|pt|de|fr|pl|zh-TW|zh-CN|it|id|hi|ja|vi|tr|ko|ar|fa|bn|ur|th|nl|sv|da|no|fi|ms|tl|';
const BB_LANG_OPTIONS = [
  ['auto','Auto (Browser)'],['en','English'],['es','Español'],['pt','Português'],['de','Deutsch'],['fr','Français'],
  ['it','Italiano'],['nl','Nederlands'],['ru','Русский'],['pl','Polski'],['tr','Türkçe'],
  ['id','Bahasa Indonesia'],['vi','Tiếng Việt'],['th','ไทย'],['ms','Bahasa Melayu'],['tl','Filipino'],
  ['hi','हिन्दी'],['ar','العربية'],['fa','فارسی'],['bn','বাংলা'],['ur','اردو'],
  ['zh-TW','繁體中文'],['zh-CN','简体中文'],['ja','日本語'],['ko','한국어'],['sv','Svenska'],['da','Dansk'],
  ['no','Norsk'],['fi','Suomi']
];
const BB_NO_TRANSLATE = '#hud, #lbTable, #commentWrap, #gameCtn, #floaters, #splatCtn, [data-no-translate], pre, code, script, style, noscript, svg, iframe, .fa, .material-icons';
function bbNormLang(v){
  v = String(v||'').trim();
  if(!v || v==='auto') return 'auto';
  return BB_LANG_CODES.includes('|'+v+'|') ? v : 'en';
}
function bbDetectLang(){
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language||'en'];
  for(const item of langs){
    const value = String(item||'').toLowerCase();
    if(value.startsWith('zh-tw')||value.startsWith('zh-hk')||value.includes('hant')) return 'zh-TW';
    if(value.startsWith('zh')) return 'zh-CN';
    const base = value.split('-')[0];
    if(base==='nb'||base==='nn') return 'no';
    if(base==='fil') return 'tl';
    if('|ru|es|pt|de|fr|pl|it|id|hi|ja|vi|tr|ko|ar|fa|bn|ur|th|nl|sv|da|no|fi|ms|tl|en|'.includes('|'+base+'|')) return base;
  }
  return 'en';
}
function bbResolveLang(v){ const n = bbNormLang(v); return n==='auto' ? bbDetectLang() : n; }
function bbShouldTranslate(value, maxLength=360, maxWords=60){
  const text = String(value||'').replace(/\s+/g,' ').trim();
  if(text.length<2 || text.length>maxLength || text.split(/\s+/).length>maxWords) return false;
  if(!/[A-Za-z]/.test(text)) return false;
  if(/https?:\/\/|www\.|^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(text)) return false;
  return true;
}
function bbVisible(el){ return !!el && el.isConnected && !!(el.offsetWidth||el.offsetHeight||el.getClientRects().length); }
function bbExcluded(node){
  const el = node?.nodeType===Node.ELEMENT_NODE ? node : node?.parentElement;
  return !el || !!el.closest(BB_NO_TRANSLATE);
}
const BB_AT = {
  language:'en', lang:'en', cache:Object.create(null), cacheTimer:0, addedTimer:0, wakeTimer:0,
  addedNodes:new Set(), settledTimers:new Map(), visState:new WeakMap(), textState:new WeakMap(), attrState:new WeakMap(),
  translatedNodes:new Set(), translatedAttrs:new Set(), pending:new Map(), retries:Object.create(null),
  queue:[], active:0, failures:0, pausedUntil:0, provider:'google', observer:null, surfaceObserver:null, switchGuard:false
};
window.__BBAT = BB_AT;
function bbSaveCacheSoon(){
  clearTimeout(BB_AT.cacheTimer);
  BB_AT.cacheTimer = setTimeout(()=>{
    try{
      const keys = Object.keys(BB_AT.cache);
      if(keys.length>700) keys.slice(0, keys.length-600).forEach(k=>delete BB_AT.cache[k]);
      localStorage.setItem(BB_TCACHE_KEY, JSON.stringify({language:BB_AT.lang, entries:BB_AT.cache}));
    }catch(e){}
  }, 500);
}
async function bbFetchJson(url, timeoutMs){
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), timeoutMs);
  try{
    const res = await fetch(url, {signal:controller.signal, credentials:'omit', referrerPolicy:'no-referrer', cache:'force-cache'});
    if(!res.ok) throw new Error('translation unavailable');
    return await res.json();
  } finally { clearTimeout(timer); }
}
async function bbFetchTranslation(source){
  if(BB_AT.provider==='google'){
    try{
      const data = await bbFetchJson('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl='+encodeURIComponent(BB_AT.lang)+'&dt=t&q='+encodeURIComponent(source), 4500);
      const translated = Array.isArray(data?.[0]) ? data[0].map(p=>p?.[0]||'').join('').trim() : '';
      if(translated) return translated;
      BB_AT.provider='mymemory';
    }catch(e){ BB_AT.provider='mymemory'; }
  }
  const fb = await bbFetchJson('https://api.mymemory.translated.net/get?q='+encodeURIComponent(source)+'&langpair='+encodeURIComponent('en|'+BB_AT.lang), 6000);
  const translated = String(fb?.responseData?.translatedText||'').trim();
  if(!translated || /^MYMEMORY WARNING/i.test(translated)) throw new Error('translation unavailable');
  return translated;
}
function bbWakeAfterPause(){
  if(BB_AT.wakeTimer) return;
  const wait = Math.max(30, BB_AT.pausedUntil - Date.now() + 30);
  BB_AT.wakeTimer = setTimeout(()=>{ BB_AT.wakeTimer=0; BB_AT.provider='google'; bbRunQueue(); }, wait);
}
function bbRunQueue(){
  if(Date.now() < BB_AT.pausedUntil){ bbWakeAfterPause(); return; }
  while(BB_AT.active<2 && BB_AT.queue.length){
    const source = BB_AT.queue.shift();
    const callbacks = BB_AT.pending.get(source)||[];
    let keepPending = false;
    BB_AT.active += 1;
    bbFetchTranslation(source)
      .then(translated=>{
        if(!translated) return;
        BB_AT.failures=0; delete BB_AT.retries[source];
        BB_AT.cache[source]=translated; bbSaveCacheSoon();
        callbacks.forEach(apply=>apply(translated));
      })
      .catch(()=>{
        BB_AT.failures += 1;
        const retries = (BB_AT.retries[source]||0)+1;
        BB_AT.retries[source]=retries;
        if(retries<=1 && callbacks.length){ keepPending=true; BB_AT.queue.push(source); }
        else delete BB_AT.retries[source];
        if(BB_AT.failures>=6){ BB_AT.failures=0; BB_AT.pausedUntil=Date.now()+15000; bbWakeAfterPause(); }
      })
      .finally(()=>{ if(!keepPending) BB_AT.pending.delete(source); BB_AT.active-=1; bbRunQueue(); });
  }
}
function bbRequestText(source, apply){
  if(BB_AT.cache[source]){ apply(BB_AT.cache[source]); return; }
  if(BB_AT.pending.has(source)){ BB_AT.pending.get(source).push(apply); return; }
  BB_AT.pending.set(source,[apply]);
  BB_AT.queue.push(source);
  if(Date.now()<BB_AT.pausedUntil) bbWakeAfterPause(); else bbRunQueue();
}
function bbTranslateTextNode(node){
  if(BB_AT.lang==='en' || !node?.isConnected || node.parentElement?.closest('input, textarea, select') || bbExcluded(node)) return;
  const raw = String(node.nodeValue||'');
  const m = raw.match(/^(\s*)([\s\S]*?)(\s*)$/);
  const current = m?.[2]||raw;
  let state = BB_AT.textState.get(node);
  if(state && current!==state.source && current!==state.translated) state = null;
  const source = state?.source || current;
  if(!bbShouldTranslate(source)) return;
  state ||= { source, translated:'', before:m?.[1]||'', after:m?.[3]||'' };
  BB_AT.textState.set(node, state);
  bbRequestText(source, translated=>{
    const latest = BB_AT.textState.get(node);
    if(!latest || latest.source!==source || !node.isConnected) return;
    latest.translated = translated;
    node.nodeValue = latest.before + translated + latest.after;
    BB_AT.translatedNodes.add({node, state:latest});
  });
}
function bbTranslateAttribute(el, name){
  if(BB_AT.lang==='en' || !el?.isConnected || bbExcluded(el)) return;
  const current = String(el.getAttribute(name)||'').trim();
  if(!bbShouldTranslate(current)) return;
  let states = BB_AT.attrState.get(el);
  if(!states) BB_AT.attrState.set(el, states = Object.create(null));
  let state = states[name];
  if(!state || (current!==state.source && current!==state.translated)) state = states[name] = { source:current, translated:'' };
  bbRequestText(state.source, translated=>{
    const latest = BB_AT.attrState.get(el)?.[name];
    if(!latest || latest.source!==state.source || !el.isConnected) return;
    latest.translated = translated;
    el.setAttribute(name, translated);
    BB_AT.translatedAttrs.add({el, name, state:latest});
  });
}
function bbScanContainer(container){
  if(!bbVisible(container) || bbExcluded(container)) return;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let node;
  while((node = walker.nextNode())) bbTranslateTextNode(node);
  container.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el=>{
    ['placeholder','title','aria-label'].forEach(n=>{ if(el.hasAttribute(n)) bbTranslateAttribute(el,n); });
  });
}
function bbScanExact(el){
  if(!el?.isConnected || !bbVisible(el) || bbExcluded(el)) return;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node;
  while((node = walker.nextNode())) bbTranslateTextNode(node);
  const own = target=>{ ['placeholder','title','aria-label'].forEach(n=>{ if(target.hasAttribute?.(n)) bbTranslateAttribute(target,n); }); };
  own(el);
  el.querySelectorAll?.('[placeholder],[title],[aria-label]').forEach(own);
}
function bbScheduleAdded(node){
  if(!node) return;
  BB_AT.addedNodes.add(node);
  if(BB_AT.addedTimer) return;
  BB_AT.addedTimer = setTimeout(()=>{
    BB_AT.addedTimer = 0;
    const nodes = Array.from(BB_AT.addedNodes);
    BB_AT.addedNodes.clear();
    const compact = nodes.filter(n=>!nodes.some(o=>o!==n && o.nodeType===Node.ELEMENT_NODE && o.contains?.(n)));
    compact.forEach(n=>{
      if(n.nodeType===Node.TEXT_NODE){ if(n.parentElement && bbVisible(n.parentElement) && !bbExcluded(n)) bbTranslateTextNode(n); }
      else bbScanExact(n);
    });
  }, 35);
}
function bbScheduleSettled(root, delay=260){
  if(!root?.isConnected) return;
  const existing = BB_AT.settledTimers.get(root);
  if(existing) clearTimeout(existing);
  const timer = setTimeout(()=>{ BB_AT.settledTimers.delete(root); if(bbVisible(root) && !bbExcluded(root)) bbScheduleAdded(root); }, delay);
  BB_AT.settledTimers.set(root, timer);
}
function bbContainers(){
  const out = [];
  document.querySelectorAll('.screen').forEach(el=>{ if(bbVisible(el)) out.push(el); });
  return out;
}
function bbScan(){
  if(BB_AT.lang==='en') return;
  bbContainers().forEach(bbScanContainer);
}
function bbRescan(){ bbScan(); }
function bbInitObservers(){
  if(BB_AT.observer) return;
  BB_AT.surfaceObserver = new MutationObserver(mutations=>{
    mutations.forEach(mut=>{
      if(mut.type==='characterData'){
        if(BB_AT.lang==='en' || BB_AT.switchGuard) return;
        const node = mut.target;
        const state = BB_AT.textState.get(node);
        const current = String(node.nodeValue||'').trim();
        if(state?.translated && current===String(state.translated).trim()) return;
        if(node.parentElement && bbVisible(node.parentElement) && !bbExcluded(node)) bbTranslateTextNode(node);
        return;
      }
      if(BB_AT.lang==='en') return;
      const target = mut.target;
      if(!target?.isConnected || bbExcluded(target)) return;
      if(!target.matches?.('.screen, #hud, [data-bb-translate]')) return;
      const wasVisible = BB_AT.visState.get(target);
      const nowVisible = bbVisible(target);
      BB_AT.visState.set(target, nowVisible);
      const opened = mut.attributeName==='hidden' ? !target.hidden
        : mut.attributeName==='aria-hidden' ? target.getAttribute('aria-hidden')!=='true'
        : mut.attributeName==='class' && wasVisible===false && nowVisible;
      if(nowVisible && (wasVisible===false || wasVisible===undefined || opened)) bbScheduleSettled(target);
    });
  });
  document.querySelectorAll('.screen, #hud').forEach(el=>{ BB_AT.visState.set(el, bbVisible(el)); });
  BB_AT.surfaceObserver.observe(document.body, {subtree:true, characterData:true, attributes:true, attributeFilter:['hidden','class','aria-hidden']});
  BB_AT.observer = new MutationObserver(mutations=>{
    if(BB_AT.lang==='en') return;
    mutations.forEach(mut=>{ mut.addedNodes.forEach(node=>bbScheduleAdded(node)); });
  });
  BB_AT.observer.observe(document.body, {childList:true, subtree:true});
  document.addEventListener('click', e=>{
    const root = e.target?.closest?.('.screen,[data-bb-translate]');
    if(root && bbVisible(root) && !bbExcluded(root)) bbScheduleSettled(root);
  }, {passive:true});
  document.addEventListener('change', e=>{
    const root = e.target?.closest?.('.screen');
    if(root) bbScheduleSettled(root);
  }, true);
}
function initAutoTranslate(){
  const pref = bbNormLang(localStorage.getItem(BB_LANG_KEY) || 'auto');
  BB_AT.lang = bbResolveLang(pref);
  document.documentElement.lang = BB_AT.lang;
  try{
    const saved = JSON.parse(localStorage.getItem(BB_TCACHE_KEY)||'null');
    if(saved?.language===BB_AT.lang && saved.entries) Object.assign(BB_AT.cache, saved.entries);
  }catch(e){}
  const sel = $('#langSelect');
  if(sel){
    sel.innerHTML = BB_LANG_OPTIONS.map(([v,l])=>'<option value="'+v+'">'+l+'</option>').join('');
    sel.value = pref;
    sel.addEventListener('change', ()=>bbSetLanguage(sel.value));
  }
  bbInitObservers();
  if(BB_AT.lang!=='en') bbScan();
}
function bbSetLanguage(value){
  value = bbNormLang(value);
  localStorage.setItem(BB_LANG_KEY, value);
  const selEl = $('#langSelect');
  if(selEl) selEl.value = value;
  BB_AT.switchGuard = true;
  BB_AT.translatedNodes.forEach(({node, state})=>{
    if(!node.isConnected) return;
    const cur = String(node.nodeValue||'');
    if(cur === state.before + state.translated + state.after) node.nodeValue = state.before + state.source + state.after;
  });
  BB_AT.translatedAttrs.forEach(({el, name, state})=>{
    if(!el.isConnected) return;
    if(el.getAttribute(name) === state.translated) el.setAttribute(name, state.source);
  });
  BB_AT.translatedNodes.clear();
  BB_AT.translatedAttrs.clear();
  BB_AT.textState = new WeakMap();
  BB_AT.attrState = new WeakMap();
  BB_AT.cache = Object.create(null);
  BB_AT.pending = new Map();
  BB_AT.queue = [];
  BB_AT.active = 0;
  BB_AT.failures = 0;
  BB_AT.pausedUntil = 0;
  BB_AT.provider = 'google';
  BB_AT.lang = bbResolveLang(value);
  document.documentElement.lang = BB_AT.lang;
  BB_AT.switchGuard = false;
  try{
    const saved = JSON.parse(localStorage.getItem(BB_TCACHE_KEY)||'null');
    if(saved?.language===BB_AT.lang && saved.entries) Object.assign(BB_AT.cache, saved.entries);
  }catch(e){}
  if(BB_AT.lang!=='en') bbScan();
}

// ---------------- Boot ----------------
G.sel = {...DEFAULT_SELECTION};
loadSave();
restoreLastSelection();
restoreTrainingSelection();
LB.token = lbGenToken();
LB.name = lbName();
LB.myBest = lbLoadMyBest();
lbConnect();
initScene();
initInput();
initMenus();
syncSelectionMenuUi();
initAutoTranslate();
setScreen('menu');
$('#hud').hidden = true;
maybeShowWhatsNew();
window.__BB = G; // debugging hook
window.__THREE = THREE;
// Every export below is the SAME function the game itself uses, but a call through this
// harness marks the active run so it cannot be ranked (see runIsRankable). A driver that
// starts a run via beginRun() therefore gets a SANDBOX run: playable, but no leaderboard
// row, no credits, no conquest unlock. On 2026-09-16 agent-driven beginRun() calls opened
// RANKED runs and posted them to the live boards under the owner's identity; this wrapper
// is the safety net that makes that impossible, whatever the caller does with the API.
const BBAPI_RAW = { beginRun, addCloud, addPoisonPool, pressureNoticeLine, insaneGridNoticeLine, berserkSurgeTail, DRAGON_CHAOS_PRESSURE, OP_STACK_PRESSURE, INSANE_PRESSURE_OP, INSANE_PRESSURE_CLEAN, insanePressure, opLoadoutEquipped, insaneBerserkEligible, spawnEnemy, spawnOrb, spawnPlus, fireBullet, damageHero, buildHeroMesh, buildBeastMesh, buildBirdMesh, buildPlayableBahamutMesh, configureHeroHeldWeapon, buildCanineMesh, addDog, spawnApexWolf, updateCanineSummon, hawkImpact, spawnClawMark, spawnKingsPawMark, queueRadiusRing, fangEchoSummonPerk, spawnProjectileSmokeDot, fireOpBeam, fireGravityMaul, fireAegisBash, fireInferno, triggerLevelup, drawPerks, masteryPoints, computeBulletDamage, burnDps, poisonDps, applyBurn, applyPoison, poisonPctDps, magnetPulled, applyMagnetGhost, updateMagnetGhosting, updateHero, updatePerkActives, updateEffects, updateClouds, tryFire, tryDash, spawnFireTrail, spawnFireRing, updateHUD, showChoice, hideChoice, castSuper, ENEMIES, PERKS, PERK_ICONS, GUNS, CHARACTERS, GEMS, DIFFS, AUD, MUSIC, applyStatusTint, SPAWNS, BOSS_SPAWNS, MASTERIES, KING_OF, G, addExp, collectOrb, updateSpawning, updateSummons, updateEnemies, updateBullets, updateEnemyBullets, updateOrbs, killEnemy, takePerk, takeDie, showLevelupChoices, renderMasteryPanel, refreshPerkPanel, winGame, spawnLaserBeam, spawnFallingBeam, bossVolley, boss2Summon, boss3SummonShields, spawnBahamutFinal, updateBahamut, finalBahamutEligible, damageEnemy, HUB_SHOP, SAVE, saveGame, buyHubItem, toggleVendingEquip, renderVendingLoadout, vendingStock, applyVending, showHub, renderHub, ownsGem, ownsHero, ownsGun, bankRunGold, COMMUNITY, communityCount, communityFetch, communityBump, communityReportOwnership, communityOwnershipKeys, LB, lbConnect, lbOpen, lbRefresh, lbSubmitRun, lbHandleBoard, lbApplyView, openCommunity, lbBuildSubmit, lbBuildRunPayload, lbBuildBackupSnapshot, lbUploadBackup, lbTryRestore, lbBackupMaybe, lbParseBackupText, lbAllBoards, lbContributeMaybe, lbSeenAdd, lbCollectMyBestRuns, lbRunFromSeen, lbWithdrawMineOnBoards, lbWithdrawRows, lbWithdrawRequestBuffer, lbForgetLocalRuns, lbOwnerOpen, lbOwnerHide, initAutoTranslate, bbSetLanguage, bbRescan, bbScan, openWhatsNew, closeWhatsNew, maybeShowWhatsNew, pulseHpHud };
window.__BBAPI = (()=>{
  const api = {};
  for(const k of Object.keys(BBAPI_RAW)){
    const v = BBAPI_RAW[k];
    if(typeof v !== 'function'){ api[k] = v; continue; }
    if(k === 'beginRun'){
      // rankedRun is forced off BEFORE anything can read it, so the run this starts is a
      // sandbox run from its first frame even if the caller sets the intent flags first.
      api[k] = function(...a){ G.harnessTouched = true; G._rankIntent = false; const r = v.apply(this,a); G.rankedRun = false; G._rankIntent = false; return r; };
    } else {
      api[k] = function(...a){ G.harnessTouched = true; return v.apply(this,a); };
    }
  }
  return api;
})();

requestAnimationFrame(loop);
