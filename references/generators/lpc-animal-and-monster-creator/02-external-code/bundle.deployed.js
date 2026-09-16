/* LPC Animal & Monster Creator v1.0.0 — bundle of src/plugin.js (see src/BUILD.md).
   Catalog: https://user.uploads.dev/file/27e36c970aba9ca460ae230c015c201e.json
   Art: LPC community packs — see catalog.packs for the per-pack attribution. */
var wt="1.0.0",Oe="https://user.uploads.dev/file/27e36c970aba9ca460ae230c015c201e.json",D=["up","left","down","right"],be={up:"Up",left:"Left",down:"Down",right:"Right"},Vt={up:"\u25B2",left:"\u25C0",down:"\u25BC",right:"\u25B6"},xt=900,me=new Map,ne=new Map;function vt(l,s){if(ne.size>=xt){let d=Math.floor(xt*.15);for(let r of ne.keys())if(ne.delete(r),--d<=0)break}ne.set(l,s)}function Ye(){me.clear(),ne.clear()}async function Ke(l){let s=me.get(l);if(s)return s;let d=(async()=>{let r=await fetch(l);if(!r.ok)throw new Error("HTTP "+r.status+" fetching "+l);let f=await r.blob();if(typeof createImageBitmap=="function")try{return await createImageBitmap(f)}catch{}return await new Promise((y,g)=>{let n=new Image,t=URL.createObjectURL(f);n.onload=()=>y(n),n.onerror=()=>g(new Error("Could not decode "+l)),n.src=t})})();return d.catch(()=>me.delete(l)),me.set(l,d),d}function le(l,s){let d=document.createElement("canvas");d.width=Math.max(1,Math.round(l)),d.height=Math.max(1,Math.round(s));let r=d.getContext("2d");return r.imageSmoothingEnabled=!1,d}function Ae(l,s){if(!l)return null;if(!s||s===1)return l;let d=le(l.width*s,l.height*s);return d.getContext("2d").drawImage(l,0,0,d.width,d.height),d}async function yt(l){try{return await Ke(l)}catch{}return me.delete(l),await new Promise(s=>setTimeout(s,350)),Ke(l)}async function xe(l={}){let s=l.catalogUrl||Oe,d=await fetch(s);if(!d.ok)throw new Error("HTTP "+d.status+" fetching catalog "+s);let r=await d.json();r.creatures=r.creatures||[];let f=new Map;for(let g of r.creatures)f.set(g.id,g);r.byId=f;let y={};for(let g of r.creatures)(y[g.category]=y[g.category]||[]).push(g);return r.byCategory=y,r.categoryOf=g=>(r.categories||[]).find(n=>n.key===g),r.allTags=[...new Set(r.creatures.flatMap(g=>g.tags||[]))].sort(),r}function Ve(l,s,d={}){return d.sheetBase?d.sheetBase.replace(/\/?$/,"/")+s:l.sheets&&l.sheets[s]||s}function K(l,s){if(!l)return null;let d=l.variants||[];return s?d.find(r=>r.key===s)||d[0]||null:d[0]||null}function J(l,s){if(!s)return{creature:null,variantKey:null};if(typeof s=="string"){let[d,r]=s.split(/[~:]/);return{creature:(l.byId?l.byId.get(d):null)||null,variantKey:r||null}}return s.id&&l.byId?{creature:l.byId.get(s.id)||null,variantKey:s.variant||null}:{creature:s,variantKey:s.variant||null}}function U(l){return Object.values(l.anims||{}).some(s=>s.dirs)}function P(l){return Object.keys(l.anims||{})}function F(l,s){let d=(l.anims||{})[s];if(!d)return null;let r=d.fw||l.fw,f=d.fh||l.fh;return{key:s,def:d,fw:r,fh:f,fps:d.fps||8,loop:d.loop!==!1,dirless:!!d.frames}}function G(l,s,d="down"){let r=F(l,s);if(!r)return 0;if(r.dirless)return r.def.frames.length;let f=r.def.dirs||{},y=f[d]||f.down||f[Object.keys(f)[0]];return y?y.cols.length:0}function kt(l,s,d){let r=F(l,s);return r?r.def.sheetKey&&d.sheets&&d.sheets[r.def.sheetKey]?d.sheets[r.def.sheetKey]:r.def.sheet||d.sheet:d.sheet}function Ct(l,s,d,r){let f=F(l,s);if(!f)return null;if(f.dirless){let w=f.def.frames.length,[S,T]=f.def.frames[(r%w+w)%w];return{row:S,col:T,count:w,index:(r%w+w)%w}}let y=f.def.dirs||{},g=y[d]||y.down||y[Object.keys(y)[0]];if(!g)return null;let n=g.cols.length,t=(r%n+n)%n;return{row:g.row,col:g.cols[t],count:n,index:t}}async function we(l,s,d,r,f,y,g={}){let n=K(s,r),t=F(s,d);if(!t||!n)return null;let w=Ct(s,d,f,y);if(!w)return null;let S=kt(s,d,n),T=Ve(l,S,g),L=[T,w.row,w.col,t.fw,t.fh].join("|"),N=ne.get(L);if(N)return N;let I;try{I=await yt(T)}catch{return null}let _=Math.max(1,Math.round(I.width/t.fw)),z=Math.max(1,Math.round(I.height/t.fh));if(w.col>=_||w.row>=z)return null;let E=le(t.fw,t.fh);return E.getContext("2d").drawImage(I,w.col*t.fw,w.row*t.fh,t.fw,t.fh,0,0,t.fw,t.fh),vt(L,E),E}async function Xe(l,s,d,r,f,y={}){if(!s.shadow)return null;let g=K(s,d),n=g&&g.shadow;if(!n)return null;let t=s.shadow.dirs[r]||s.shadow.dirs.down;if(!t)return null;let w=t.cols.length,S=t.cols[(f%w+w)%w],T=Ve(l,n,y),L=[T,t.row,S,s.shadow.fw,s.shadow.fh].join("|"),N=ne.get(L);if(N)return N;let I;try{I=await yt(T)}catch{return null}let _=le(s.shadow.fw,s.shadow.fh);return _.getContext("2d").drawImage(I,S*s.shadow.fw,t.row*s.shadow.fh,s.shadow.fw,s.shadow.fh,0,0,s.shadow.fw,s.shadow.fh),vt(L,_),_}function Je(l,s){if(!l.shadow)return 0;let d=l.shadow.dirs[s]||l.shadow.dirs.down;return d?d.cols.length:0}async function Z(l,s,d={}){let{creature:r,variantKey:f}=J(l,s);if(!r)throw new Error("Unknown creature: "+s);let y=d.anim||(r.anims.idle?"idle":P(r)[0]),g=d.dir||"down",n=await we(l,r,y,f,g,d.frame||0,d);if(!n)throw new Error("No frame for "+r.id+"/"+y);return Ae(n,d.scale||1)}async function re(l,s,d,r={}){let{creature:f,variantKey:y}=J(l,s),g=F(f,d);if(!g)throw new Error("Unknown animation: "+d);let n=r.dirs||D,t=r.scale||1,w=0;for(let L of n)w=Math.max(w,G(f,d,L));w=Math.max(1,w);let S=le(w*g.fw*t,n.length*g.fh*t),T=S.getContext("2d");for(let L=0;L<n.length;L++)for(let N=0;N<w;N++){let I=await we(l,f,d,y,n[L],N,r);I&&T.drawImage(I,N*g.fw*t,L*g.fh*t,g.fw*t,g.fh*t)}return S}async function ve(l,s,d={}){let{creature:r,variantKey:f}=J(l,s);if(!r)throw new Error("Unknown creature: "+s);let y=K(r,f),g=(d.anims||P(r)).filter(E=>r.anims[E]),n=d.scale||1,t=d.shadow!==!1&&!!r.shadow&&!!y.shadow,w=r.fw,S=r.fh;for(let E of g){let x=F(r,E);w=Math.max(w,x.fw),S=Math.max(S,x.fh)}let T=0;for(let E of g)for(let x of D)T=Math.max(T,G(r,E,x));T=Math.max(1,T);let L=g.length*D.length;t&&(L+=D.length);let N=le(T*w*n,L*S*n),I=N.getContext("2d"),_=(E,x,h)=>{if(!E)return;let p=(w-E.width)/2,b=(S-E.height)/2;I.drawImage(E,(x*w+p)*n,(h*S+b)*n,E.width*n,E.height*n)},z={};g.forEach((E,x)=>{let h=F(r,E),p={};D.forEach((b,k)=>{p[b]=G(r,E,b)}),z[E]={row:x*D.length,frames:p,fps:h.fps,loop:h.loop}});for(let E=0;E<g.length;E++){let x=g[E];for(let h=0;h<D.length;h++){let p=G(r,x,D[h]);for(let b=0;b<p;b++)_(await we(l,r,x,f,D[h],b,d),b,E*4+h)}}if(t){let E=g.length*4;for(let x=0;x<D.length;x++){let h=Je(r,D[x]);for(let p=0;p<h;p++)_(await Xe(l,r,f,D[x],p,d),p,E+x)}}return{canvas:N,blocks:z,cols:T,rows:L,cellW:w,cellH:S,anims:g,shadow:!!t}}function ye(l,s,d={},r={}){let{creature:f,variantKey:y}=J(l,s);if(!f)throw new Error("Unknown creature: "+s);let g=K(f,y),n=d.scale||1,t=f.ground||{x:Math.round(f.fw/2),y:f.fh},w=r.cellW||f.fw,S=r.cellH||f.fh,T=(f.packs||[]).map(L=>l.packs[L]).filter(Boolean);return{generator:"lpc-animal-and-monster-creator",version:wt,creature:f.id,name:f.name,variant:g.key,variantName:g.name,image:r.image||`${f.id}-${g.key}.png`,sheet:g.sheet,scale:n,cellW:w,cellH:S,cols:r.cols||0,rows:r.rows||0,dirOrder:D.slice(),blocks:r.blocks||{},shadowRows:r.shadow?D.length:0,pivot:{x:Math.round(w/2),y:Math.round((S-f.fh)/2+t.y)},tags:f.tags||[],category:f.category,credits:T.map(L=>({name:L.name,authors:L.authors,license:L.license,url:L.url,extraUrls:L.extraUrls}))}}async function ce(l,s,d={}){let{creature:r,variantKey:f}=J(l,s);if(!r)throw new Error("Unknown creature: "+s);let y=K(r,f),g=d.scale||1,n=(d.anims||P(r)).filter(x=>r.anims[x]),t=d.directions||D,w=d.shadow!==!1&&!!r.shadow&&!!y.shadow,S=g,T=r.ground||{x:Math.round(r.fw/2),y:r.fh},L=r.fw*S,N=r.fh*S,I={};for(let x of n){let h=F(r,x);I[x]={fw:h.fw,fh:h.fh,fps:h.fps,loop:h.loop,dirs:{}};for(let p of t){let b=[],k=G(r,x,p);for(let A=0;A<k;A++){let q=await we(l,r,x,f,p,A,d);q&&b.push(Ae(q,g))}I[x].dirs[p]=b}}let _={};if(w)for(let x of t){let h=[],p=Je(r,x);for(let b=0;b<p;b++){let k=await Xe(l,r,f,x,b,d);k&&h.push(Ae(k,g))}_[x]=h}let z=Object.values(I).reduce((x,h)=>x+Object.values(h.dirs).reduce((p,b)=>p+b.length,0),0);return{creature:{id:r.id,variant:y.key,name:r.name},scale:g,animations:n.slice(),directions:t.slice(),frameCount(x,h="down"){let p=I[x];return p&&p.dirs[h]?p.dirs[h].length:0},frameSizeFor(x){let h=I[x];return h?{w:h.fw*g,h:h.fh*g}:{w:r.fw*g,h:r.fh*g}},fps(x){let h=I[x];return h?h.fps:8},loop(x){let h=I[x];return h?h.loop:!0},duration(x,h="down"){let p=this.frameCount(x,h);return p?p/(this.fps(x)||1):0},getFrame(x,h="down",p=0){let b=I[x],k=b&&b.dirs[h]?b.dirs[h]:null;return!k||!k.length?null:k[(p%k.length+k.length)%k.length]},getShadow(x="down",h=0){let p=_[x];return!p||!p.length?null:p[(h%p.length+p.length)%p.length]},hasShadow:w,frameTotal:z,pivot:{x:Math.round(T.x*S),y:Math.round(T.y*S)},place(x,h,p={}){let b=this.getFrame(p.anim||(I.idle?"idle":n[0]),p.dir||"down",p.frame||0);if(!b)return null;let k=p.scale||1,A=b.width*k,q=b.height*k;if(p.anchor==="center")return{c:b,w:A,h:q,left:x-A/2,top:h-q/2};let j=T.x*S+(b.width-L)/2,ue=T.y*S+(b.height-N)/2;return{c:b,w:A,h:q,left:x-j*k,top:h-ue*k}},draw(x,h,p,b={}){let k=this.place(h,p,b);return k?(x.drawImage(k.c,k.left,k.top,k.w,k.h),!0):!1},drawShadow(x,h,p,b={}){let k=this.getShadow(b.dir||"down",b.frame||0);if(!k)return!1;let A=b.scale||1;if(b.anchor==="center"){let q=k.width*A,j=k.height*A;return x.drawImage(k,h-q/2,p-j/2,q,j),!0}return x.drawImage(k,h-T.x*S*A,p-T.y*S*A,k.width*A,k.height*A),!0},drawWithShadow(x,h,p,b={}){return this.drawShadow(x,h,p,b),this.draw(x,h,p,b)}}}function Ze(l){return typeof l=="string"?l:!l||!l.id?"":l.variant?l.id+"~"+l.variant:l.id}function Qe(l){if(!l)return null;let[s,d]=String(l).split(/[~:]/);return s?{id:s,variant:d||null}:null}function et(l){return{creatures:l.creatures.length,variants:l.creatures.reduce((s,d)=>s+d.variants.length,0),animations:l.creatures.reduce((s,d)=>s+Object.keys(d.anims).length,0),frames:l.creatures.reduce((s,d)=>s+Object.entries(d.anims).reduce((r,[,f])=>f.frames?r+f.frames.length:r+Object.values(f.dirs||{}).reduce((y,g)=>y+g.cols.length,0),0),0),sheets:Object.keys(l.sheets||{}).length}}var Et=`
:host { display: block; height: 100%; }

:host {
  --bg: #0b0e13;
  --bg-2: #10151d;
  --panel: #151b24;
  --panel-2: #1b2330;
  --panel-3: #222c3b;
  --text: #e8ecf3;
  --muted: #93a0b4;
  --muted-2: #6b7789;
  --accent: #f0b429;
  --accent-2: #ffd05c;
  --accent-ink: #2a1e05;
  --blue: #5aa9ff;
  --green: #6ddc8b;
  --red: #ff7a7a;
  --border: #26303d;
  --border-2: #33404f;
  --radius: 12px;
  --shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}

.lpc-app, .lpc-app * { box-sizing: border-box; }
/* the hidden attribute must always win, even over the display rules below */
.lpc-app [hidden] { display: none !important; }

.lpc-app {
  margin: 0;
  background:
    radial-gradient(1100px 600px at 70% -10%, #1b2534 0%, transparent 60%),
    radial-gradient(800px 500px at 0% 100%, #1a1f2b 0%, transparent 55%),
    var(--bg);
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  text-align: left;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

button, input, select { font: inherit; color: inherit; }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #2c3644; border-radius: 6px; border: 2px solid transparent; background-clip: content-box; }
::-webkit-scrollbar-thumb:hover { background: #3b4859; background-clip: content-box; }

/* ---------- top bar ---------- */
.topbar {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 14px max(14px, calc((100% - 1720px) / 2 + 14px));
  border-bottom: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(27, 35, 48, 0.9), rgba(16, 21, 29, 0.85));
  backdrop-filter: blur(6px);
  position: sticky; top: 0; z-index: 40;
  flex-wrap: wrap;
  flex: none;
}
.brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
.brand > div { min-width: 0; }
.brand-mark {
  width: 38px; height: 38px; border-radius: 10px; flex: none;
  display: grid; place-items: center; font-weight: 800; font-size: 13px; letter-spacing: 0.5px;
  color: var(--accent-ink);
  background: linear-gradient(150deg, var(--accent-2), var(--accent) 60%, #c98a10);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 3px 10px rgba(240,180,41,0.25);
}
.brand h1 { margin: 0; font-size: 16px; font-weight: 700; letter-spacing: 0.2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.brand p { margin: 2px 0 0; font-size: 11.5px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.top-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.btn {
  appearance: none; cursor: pointer;
  border: 1px solid var(--border-2); background: var(--panel-2); color: var(--text);
  padding: 8px 13px; border-radius: 9px; font-size: 13px; font-weight: 500;
  transition: background .12s ease, border-color .12s ease, transform .05s ease;
  display: inline-flex; align-items: center; gap: 7px; white-space: nowrap;
}
.btn:hover { background: var(--panel-3); border-color: #43526a; }
.btn:active { transform: translateY(1px); }
.btn[disabled] { opacity: .5; pointer-events: none; }
.btn-primary {
  background: linear-gradient(180deg, var(--accent-2), var(--accent));
  border-color: #b9840d; color: var(--accent-ink); font-weight: 700;
}
.btn-primary:hover { background: linear-gradient(180deg, #ffe08a, var(--accent-2)); border-color: var(--accent); }
.btn-ghost { background: transparent; }
.btn-sm { padding: 5px 9px; font-size: 12px; border-radius: 8px; }
.btn-icon { padding: 6px 9px; }
.btn.on { border-color: var(--accent); color: var(--accent-2); background: rgba(240,180,41,.12); }

/* ---------- layout ---------- */
.layout {
  display: grid;
  grid-template-columns: 344px minmax(320px, 1fr) 322px;
  gap: 14px; padding: 14px; align-items: stretch;
  max-width: 1720px; margin: 0 auto 0;
  flex: 1 1 auto; min-height: 0; width: 100%;
}
@media (max-width: 1240px) {
  .lpc-app { height: auto; }
  .layout { grid-template-columns: 330px minmax(0, 1fr); flex: none; }
  .col-detail { grid-column: 1 / -1; }
  .col-browser .panel-body { max-height: min(560px, 62vh); overflow: auto; }
  .col-detail .panel-body { overflow: visible; }
  .stage { flex: none; min-height: 420px; }
}
@media (max-width: 900px) {
  .layout { grid-template-columns: minmax(0, 1fr); padding: 10px; gap: 10px; }
  .col-detail { grid-column: auto; }
  .col-browser .panel-body { max-height: none; overflow: visible; }
  .stage { flex: none; min-height: 340px; }
  .topbar { padding: 10px 12px; }
}
@media (max-width: 620px) {
  .topbar { gap: 10px; }
  .brand p { display: none; }
  .top-actions { width: 100%; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
  .top-actions .btn { justify-content: center; padding: 8px 6px; }
}

.panel {
  background: linear-gradient(180deg, var(--panel), var(--bg-2));
  border: 1px solid var(--border); border-radius: var(--radius);
  box-shadow: var(--shadow); display: flex; flex-direction: column; min-width: 0; min-height: 0;
}
.panel-head {
  padding: 11px 13px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 9px; flex-wrap: wrap; flex: none;
  background: linear-gradient(180deg, rgba(34,44,59,0.55), rgba(21,27,36,0.2));
}
.panel-head h2 { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.9px; color: var(--muted); font-weight: 700; }
.panel-body { padding: 12px; }
.col-browser .panel-body, .col-detail .panel-body { overflow: auto; position: relative; flex: 1 1 auto; min-height: 0; }
@media (max-width: 900px) {
  .col-browser .panel-body, .col-detail .panel-body { overflow: visible; max-height: none; }
}
.spacer { flex: 1 1 auto; }

/* ---------- stage ---------- */
.col-stage { overflow: hidden; }
.stage-tabs { display: flex; gap: 4px; margin-left: auto; }
.stage-tabs button {
  appearance: none; border: 1px solid transparent; background: transparent; color: var(--muted);
  padding: 5px 10px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;
}
.stage-tabs button:hover { color: var(--text); background: var(--panel-2); }
.stage-tabs button.on { background: var(--panel-3); border-color: var(--border-2); color: var(--accent-2); }

.stage-wrap { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }
.stage {
  position: relative; display: grid; place-items: center;
  padding: 18px; min-height: 260px; flex: 1 1 auto; min-width: 0;
  overflow: auto;
}
.stage-bg-checker {
  background:
    linear-gradient(45deg, #0d1117 25%, transparent 25%, transparent 75%, #0d1117 75%),
    linear-gradient(45deg, #0d1117 25%, #111823 25%, #111823 75%, #0d1117 75%);
  background-size: 22px 22px; background-position: 0 0, 11px 11px;
}
.stage-bg-dark { background: #0a0d12; }
.stage-bg-grass {
  background:
    radial-gradient(120% 90% at 50% 0%, #4f8b3f 0%, #3a6d30 45%, #2a5225 100%);
}
.stage-bg-light { background: #dfe5ee; }
#previewCanvas { image-rendering: pixelated; max-width: 100%; height: auto; filter: drop-shadow(0 12px 18px rgba(0,0,0,0.55)); }
#sheetCanvas, #playgroundCanvas { image-rendering: pixelated; max-width: 100%; }
#sheetCanvas { filter: drop-shadow(0 10px 16px rgba(0,0,0,0.5)); }
.playground-ctn { position: absolute; inset: 0; }
#playgroundCanvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.stage-badge {
  position: absolute; left: 12px; top: 12px; font-size: 11px; color: var(--muted); white-space: nowrap;
  background: rgba(11,14,19,0.72); border: 1px solid var(--border); border-radius: 8px; padding: 4px 8px;
  z-index: 2;
}
.stage-hint {
  font-size: 11.5px; color: var(--muted); padding: 9px 12px; border-top: 1px solid var(--border);
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap; flex: none;
}
.stage-controls { padding: 12px; border-top: 1px solid var(--border); display: grid; gap: 10px; flex: none; }
.ctrl-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ctrl-row .label { font-size: 11px; text-transform: uppercase; letter-spacing: .7px; color: var(--muted); font-weight: 700; }
.ctrl-row .grow { flex: 1 1 90px; min-width: 80px; }

select, input[type="text"], input[type="search"], input[type="number"] {
  background: var(--panel-2); border: 1px solid var(--border-2); color: var(--text);
  border-radius: 9px; padding: 7px 10px; outline: none; width: 100%;
}
select:focus, input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(240,180,41,0.14); }
input[type="range"] { width: 118px; accent-color: var(--accent); }
input[type="checkbox"] { accent-color: var(--accent); width: 15px; height: 15px; }
label.chk { display: inline-flex; align-items: center; gap: 5px; cursor: pointer; font-size: 12px; color: var(--muted); }
label.chk:hover { color: var(--text); }

.seg { display: inline-flex; background: var(--panel-2); border: 1px solid var(--border-2); border-radius: 9px; overflow: hidden; }
.seg button {
  appearance: none; border: 0; background: transparent; color: var(--muted);
  padding: 6px 10px; cursor: pointer; font-size: 12px; font-weight: 600;
}
.seg button + button { border-left: 1px solid var(--border); }
.seg button.on { background: linear-gradient(180deg, var(--accent-2), var(--accent)); color: var(--accent-ink); }

/* D-pad for direction */
.dpad { display: grid; grid-template-columns: repeat(3, 30px); grid-template-rows: repeat(3, 26px); gap: 3px; }
.dpad button {
  appearance: none; border: 1px solid var(--border-2); background: var(--panel-2); color: var(--muted);
  border-radius: 7px; cursor: pointer; font-size: 12px; padding: 0; line-height: 1;
}
.dpad button:hover { color: var(--text); background: var(--panel-3); }
.dpad button.on { background: linear-gradient(180deg, var(--accent-2), var(--accent)); color: var(--accent-ink); border-color: #b9840d; }
.dpad .up { grid-area: 1 / 2; }
.dpad .left { grid-area: 2 / 1; }
.dpad .down { grid-area: 3 / 2; }
.dpad .right { grid-area: 2 / 3; }
.dpad .mid {
  grid-area: 2 / 2; display: grid; place-items: center; font-size: 9px; color: var(--muted-2);
  border: 1px dashed var(--border); border-radius: 7px;
}

/* ---------- browser ---------- */
.cat-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 9px; }
.chip {
  border: 1px solid var(--border-2); background: var(--panel-2); color: var(--text);
  padding: 4px 9px; border-radius: 999px; font-size: 12px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 5px;
}
.chip:hover { border-color: var(--accent); color: var(--accent-2); }
.chip.on { background: linear-gradient(180deg, var(--accent-2), var(--accent)); color: var(--accent-ink); border-color: #b9840d; font-weight: 700; }
.chip .n { font-size: 10px; opacity: .75; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(76px, 1fr)); gap: 7px; }
.tile {
  position: relative; border: 1px solid var(--border); border-radius: 10px; overflow: hidden;
  background: #0e1319; cursor: pointer; padding: 0; aspect-ratio: 1 / 1;
  transition: border-color .12s ease, transform .06s ease;
}
.tile:hover { border-color: var(--border-2); transform: translateY(-1px); }
.tile.on { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(240,180,41,.25) inset; }
.tile canvas { width: 100%; height: 100%; display: block; image-rendering: pixelated; }
.tile .cap {
  position: absolute; left: 0; right: 0; bottom: 0; padding: 3px 4px 4px;
  font-size: 9.5px; line-height: 1.15; text-align: center; color: #dbe2ec;
  background: linear-gradient(180deg, transparent, rgba(6,9,13,.88) 55%);
  text-shadow: 0 1px 2px #000; pointer-events: none;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.tile .fav {
  position: absolute; top: 3px; right: 3px; width: 19px; height: 19px; border-radius: 6px;
  border: 1px solid var(--border-2); background: rgba(11,14,19,.75); color: var(--muted-2);
  font-size: 11px; line-height: 1; padding: 0; cursor: pointer; display: grid; place-items: center;
}
.tile .fav:hover { color: var(--accent-2); border-color: var(--accent); }
.tile .fav.on { color: var(--accent-ink); background: var(--accent); border-color: #b9840d; }
.tile .badge {
  position: absolute; top: 4px; left: 4px; font-size: 8.5px; padding: 1px 5px; border-radius: 999px;
  background: rgba(11,14,19,.72); border: 1px solid var(--border-2); color: var(--muted); font-weight: 700;
  text-transform: uppercase; letter-spacing: .4px;
}
.shimmer { position: absolute; inset: 0; background: linear-gradient(100deg, #131a23 30%, #1b2530 50%, #131a23 70%); background-size: 200% 100%; animation: sh 1.1s linear infinite; }
@keyframes sh { from { background-position: 200% 0; } to { background-position: -60% 0; } }
.empty { color: var(--muted-2); font-size: 12.5px; padding: 14px 4px; text-align: center; }

/* ---------- detail ---------- */
.section + .section { border-top: 1px solid var(--border); margin-top: 12px; padding-top: 12px; }
.section h3 { margin: 0 0 9px; font-size: 11px; text-transform: uppercase; letter-spacing: .9px; color: var(--muted); font-weight: 700; }
.swatches { display: flex; flex-wrap: wrap; gap: 5px; }
.sw {
  width: 26px; height: 26px; border-radius: 6px; padding: 0; cursor: pointer;
  border: 1px solid rgba(255,255,255,.14); background: #0e1319; position: relative; overflow: hidden;
}
.sw canvas { width: 100%; height: 100%; display: block; image-rendering: pixelated; }
.sw:hover { transform: translateY(-1px); }
.sw.on { box-shadow: 0 0 0 2px var(--accent), 0 0 0 3px rgba(0,0,0,.5); }
.var-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.var {
  display: flex; align-items: center; gap: 7px; padding: 5px 9px 5px 6px; cursor: pointer;
  border: 1px solid var(--border-2); background: var(--panel-2); border-radius: 9px; color: var(--text); font-size: 12px;
}
.var:hover { border-color: var(--accent); }
.var.on { border-color: var(--accent); background: rgba(240,180,41,.12); color: var(--accent-2); }
.var .sw { width: 24px; height: 24px; border-radius: 5px; }

.anim-list { display: flex; flex-direction: column; gap: 5px; }
.anim-row {
  display: flex; align-items: center; gap: 9px; padding: 5px 7px; border-radius: 8px; cursor: pointer;
  border: 1px solid transparent;
}
.anim-row:hover { background: var(--panel-2); }
.anim-row.on { background: linear-gradient(90deg, rgba(240,180,41,.18), rgba(240,180,41,.04)); border-color: rgba(240,180,41,.35); color: var(--accent-2); }
.anim-row .sw { width: 34px; height: 34px; flex: none; }
.anim-row .nm { flex: 1; min-width: 0; font-size: 12.5px; font-weight: 600; text-transform: capitalize; }
.anim-row .meta { font-size: 10.5px; color: var(--muted-2); font-variant-numeric: tabular-nums; }

.info { display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; font-size: 12px; }
.info dt { color: var(--muted); }
.info dd { margin: 0; text-align: right; font-variant-numeric: tabular-nums; }
.tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
.tag { border: 1px solid var(--border-2); border-radius: 999px; padding: 1px 7px; font-size: 10.5px; color: var(--muted); cursor: pointer; }
.tag:hover { color: var(--accent-2); border-color: var(--accent); }
.tag.on { background: var(--accent); color: var(--accent-ink); border-color: #b9840d; font-weight: 700; }

.credits { font-size: 11.5px; color: var(--muted); line-height: 1.55; }
.credits .c { padding: 7px 0; border-top: 1px dashed var(--border); }
.credits .c:first-child { border-top: 0; }
.credits b { color: var(--text); font-weight: 600; }
.credits a { color: var(--blue); text-decoration: none; word-break: break-word; }
.credits a:hover { text-decoration: underline; }
.lic { display: inline-block; border: 1px solid var(--border-2); border-radius: 999px; padding: 0 6px; margin: 2px 3px 0 0; font-size: 10px; color: var(--muted); }

/* ---------- misc ---------- */
.toast {
  position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%) translateY(14px);
  background: #1d2635; border: 1px solid var(--border-2); color: var(--text);
  padding: 10px 16px; border-radius: 10px; box-shadow: var(--shadow);
  opacity: 0; pointer-events: none; transition: opacity .18s ease, transform .18s ease; z-index: 100;
  font-size: 13px; max-width: 80vw;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
.toast.err { border-color: #7a3a3a; background: #2a1a1c; }

.modal-back {
  position: fixed; inset: 0; background: rgba(5,8,12,.72); backdrop-filter: blur(3px);
  display: grid; place-items: center; z-index: 90; padding: 18px;
}
.modal-back[hidden] { display: none; }
.modal {
  background: linear-gradient(180deg, var(--panel), var(--bg-2)); border: 1px solid var(--border-2);
  border-radius: 14px; box-shadow: var(--shadow); width: min(620px, 100%); max-height: 86vh; overflow: auto;
}
.modal.wide { width: min(820px, 100%); }
.modal-head { padding: 14px 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; gap: 10px; position: sticky; top: 0; background: #141a23; z-index: 2; }
.modal-head h3 { margin: 0; font-size: 15px; }
.modal-body { padding: 16px; }
.modal-foot { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; position: sticky; bottom: 0; background: #12171f; }
.prog { height: 8px; background: var(--panel-3); border-radius: 99px; overflow: hidden; margin: 10px 0; }
.prog > i { display: block; height: 100%; width: 0%; background: linear-gradient(90deg, var(--accent), var(--accent-2)); transition: width .15s ease; }
.field + .field { margin-top: 12px; }
.field label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: .7px; color: var(--muted); margin-bottom: 5px; font-weight: 700; }
.field .row2 { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.x { border: 0; background: transparent; color: var(--muted-2); cursor: pointer; font-size: 15px; line-height: 1; padding: 2px 4px; border-radius: 6px; }
.x:hover { color: #ff8a8a; background: rgba(255,90,90,.12); }
code.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; background: #0e1319; border: 1px solid var(--border); border-radius: 6px; padding: 2px 5px; word-break: break-all; }
.codebox {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; line-height: 1.5;
  background: #0b1017; border: 1px solid var(--border); border-radius: 9px; padding: 11px 12px;
  white-space: pre; overflow: auto; max-height: 300px; color: #cfe0f5; text-align: left; margin: 0;
}
.note { font-size: 11.5px; color: var(--muted); line-height: 1.55; }
.kv { display: flex; justify-content: space-between; gap: 10px; padding: 6px 0; border-top: 1px dashed var(--border); font-size: 12px; }
.kv:first-child { border-top: 0; }
.kv b { font-weight: 600; }
`,Mt=Et;var Xt=`
<div class="lpc-app">
  <header class="topbar">
    <div class="brand">
      <div class="brand-mark">LPC</div>
      <div>
        <h1>Animal &amp; Monster Creator</h1>
        <p id="brandSubEl">Loading bestiary\u2026</p>
      </div>
    </div>
    <div class="top-actions">
      <button class="btn" id="randomBtn" title="Random creature, animation and direction (R)">Randomize</button>
      <button class="btn" id="favBtn" title="Show starred creatures only">&#9733; Favourites</button>
      <button class="btn" id="creditsBtn">Credits</button>
      <button class="btn" id="exportBtn">Export</button>
      <button class="btn btn-primary" id="shareBtn">Share link</button>
    </div>
  </header>

  <div class="layout">
    <section class="panel col-browser">
      <div class="panel-head">
        <h2>Bestiary</h2>
        <span class="spacer"></span>
        <span class="meta" id="browserCountEl"></span>
      </div>
      <div class="panel-body">
        <input type="search" id="searchInput" placeholder="Search creatures, tags, packs&hellip;" autocomplete="off" style="margin-bottom:9px" />
        <div class="cat-chips" id="catChipsEl"></div>
        <div class="grid" id="browserEl"></div>
      </div>
    </section>

    <section class="panel col-stage">
      <div class="panel-head">
        <h2 id="stageTitleEl">Preview</h2>
        <div class="stage-tabs" id="stageTabsEl">
          <button data-tab="preview">Preview</button>
          <button data-tab="sheet">Sheet</button>
          <button data-tab="playground">Playground</button>
        </div>
      </div>
      <div class="stage-wrap">
        <div class="stage stage-bg-checker" id="stageEl">
          <div class="stage-badge" id="stageBadgeEl">&hellip;</div>
          <canvas id="previewCanvas" width="256" height="256"></canvas>
          <canvas id="sheetCanvas" hidden></canvas>
          <div class="playground-ctn" id="playgroundEl" hidden>
            <canvas id="playgroundCanvas"></canvas>
          </div>
        </div>
        <div class="stage-hint" id="stageHintEl"></div>

        <div class="stage-controls" id="previewControlsEl">
          <div class="ctrl-row">
            <span class="label">Anim</span>
            <select id="animSelect" style="width:auto"></select>
            <button class="btn btn-sm" id="playBtn" title="Play / pause (space)">&#10074;&#10074;</button>
            <div class="seg" id="dirSegEl" hidden></div>
            <div class="dpad" id="dpadEl" hidden>
              <button class="up" data-dir="up" title="Face up (arrow keys)">&#9650;</button>
              <button class="left" data-dir="left">&#9664;</button>
              <div class="mid">dir</div>
              <button class="right" data-dir="right">&#9654;</button>
              <button class="down" data-dir="down">&#9660;</button>
            </div>
          </div>
          <div class="ctrl-row">
            <span class="label">Frame</span>
            <input type="range" id="frameRange" class="grow" min="0" max="0" value="0" step="1" />
            <span class="meta" id="frameLabelEl">0 / 0</span>
            <span class="label" style="margin-left:6px">Zoom</span>
            <input type="range" id="zoomRange" min="1" max="14" step="1" value="5" />
            <button class="btn btn-sm" id="fitBtn" title="Fit creature to the stage">Fit</button>
          </div>
          <div class="ctrl-row">
            <label class="chk"><input type="checkbox" id="dirsToggle" /> 4-dir strip</label>
            <label class="chk"><input type="checkbox" id="gridToggle" /> grid &amp; pivot</label>
            <label class="chk"><input type="checkbox" id="shadowToggle" checked /> shadow</label>
            <span class="label" style="margin-left:6px">BG</span>
            <div class="seg" id="bgSegEl">
              <button data-bg="checker">Checker</button>
              <button data-bg="grass">Grass</button>
              <button data-bg="dark">Dark</button>
              <button data-bg="light">Light</button>
            </div>
          </div>
        </div>

        <div class="stage-controls" id="sheetControlsEl" hidden>
          <div class="ctrl-row">
            <span class="label">Scale</span>
            <div class="seg" id="sheetScaleSegEl"></div>
            <span class="meta" id="sheetInfoEl"></span>
            <span class="spacer"></span>
            <button class="btn btn-sm" id="sheetDownloadBtn">Download PNG</button>
          </div>
        </div>

        <div class="stage-controls" id="playgroundControlsEl" hidden>
          <div class="ctrl-row">
            <button class="btn btn-sm btn-primary" id="pgSpawnBtn">Spawn selected</button>
            <button class="btn btn-sm" id="pgAddBtn">Random creature</button>
            <button class="btn btn-sm" id="pgClearBtn">Clear</button>
            <span class="label" style="margin-left:6px">Speed</span>
            <input type="range" id="pgSpeedRange" min="10" max="240" value="80" />
            <span class="meta" id="pgCountEl"></span>
          </div>
        </div>
      </div>
    </section>

    <section class="panel col-detail">
      <div class="panel-head">
        <h2>Creature</h2>
        <span class="spacer"></span>
        <button class="btn btn-sm btn-ghost" id="favStarBtn" title="Star this creature">&#9734; Star</button>
        <button class="btn btn-sm btn-ghost" id="resetBtn">Reset</button>
      </div>
      <div class="panel-body">
        <div class="section" id="variantsSection">
          <h3 id="variantTitleEl">Variants</h3>
          <div class="var-chips" id="variantsEl"></div>
        </div>
        <div class="section">
          <h3>Animations</h3>
          <div class="anim-list" id="animListEl"></div>
        </div>
        <div class="section">
          <h3>Details</h3>
          <dl class="info" id="infoEl"></dl>
          <div class="tags" id="tagsEl"></div>
        </div>
        <div class="section">
          <h3>Credits</h3>
          <div class="credits" id="creditsEl"></div>
        </div>
      </div>
    </section>
  </div>

  <div class="toast" id="toastEl"></div>
  <div class="modal-back" id="modalBack" hidden>
    <div class="modal" id="modalEl">
      <div class="modal-head">
        <h3 id="modalTitleEl"></h3>
        <button class="x" id="modalCloseEl">&#10005;</button>
      </div>
      <div class="modal-body" id="modalBodyEl"></div>
      <div class="modal-foot" id="modalFootEl"></div>
    </div>
  </div>
</div>
`,De=(l,s,d)=>Math.min(d,Math.max(s,l)),O=l=>String(l??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");function Jt(l){if(l&&typeof l.get=="function")return l;try{let d=window.localStorage;if(d)return{get:async r=>{let f=d.getItem("lpc-animals:"+r);return f?JSON.parse(f):null},set:async(r,f)=>d.setItem("lpc-animals:"+r,JSON.stringify(f))}}catch{}let s=new Map;return{get:async d=>s.has(d)?s.get(d):null,set:async(d,r)=>s.set(d,r)}}function ze(l,s){let d=URL.createObjectURL(l),r=document.createElement("a");r.href=d,r.download=s,r.style.display="none",document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(d),8e3)}function tt(l){return new Promise(s=>l.toBlob(d=>s(d),"image/png"))}async function ke(l){try{return await navigator.clipboard.writeText(l),!0}catch{}try{let s=document.createElement("textarea");s.value=l,s.style.cssText="position:fixed;top:-1000px;opacity:0",document.body.appendChild(s),s.select();let d=document.execCommand("copy");return s.remove(),d}catch{return!1}}function Zt(l){let s=0;for(let d of Object.values(l.anims||{}))if(d.frames)s+=d.frames.length;else for(let r of Object.values(d.dirs||{}))s+=r.cols.length;return s}function pe(l){let s=P(l);for(let d of["idle","walk","fly","swim","hop","gallop","shoot","attack","die"])if(s.includes(d))return d;return s[0]}async function Lt(l,s={}){let d=l.shadowRoot||l.attachShadow({mode:"open"});d.innerHTML=`<style>${Mt}</style>${Xt}`;let r=e=>d.querySelector("#"+e),f=d.querySelector(".lpc-app"),y=Jt(s.store),g=s.hash===!0,n={brandSub:r("brandSubEl"),randomBtn:r("randomBtn"),favBtn:r("favBtn"),creditsBtn:r("creditsBtn"),exportBtn:r("exportBtn"),shareBtn:r("shareBtn"),search:r("searchInput"),catChips:r("catChipsEl"),browser:r("browserEl"),browserCount:r("browserCountEl"),stageTitle:r("stageTitleEl"),stageTabs:r("stageTabsEl"),stage:r("stageEl"),stageBadge:r("stageBadgeEl"),stageHint:r("stageHintEl"),preview:r("previewCanvas"),sheet:r("sheetCanvas"),playgroundCtn:r("playgroundEl"),playground:r("playgroundCanvas"),previewControls:r("previewControlsEl"),sheetControls:r("sheetControlsEl"),playgroundControls:r("playgroundControlsEl"),animSelect:r("animSelect"),playBtn:r("playBtn"),dirSeg:r("dirSegEl"),dpad:r("dpadEl"),frameRange:r("frameRange"),frameLabel:r("frameLabelEl"),zoomRange:r("zoomRange"),fitBtn:r("fitBtn"),dirsToggle:r("dirsToggle"),gridToggle:r("gridToggle"),shadowToggle:r("shadowToggle"),bgSeg:r("bgSegEl"),sheetScaleSeg:r("sheetScaleSegEl"),sheetInfo:r("sheetInfoEl"),sheetDownloadBtn:r("sheetDownloadBtn"),pgSpawnBtn:r("pgSpawnBtn"),pgAddBtn:r("pgAddBtn"),pgClearBtn:r("pgClearBtn"),pgSpeed:r("pgSpeedRange"),pgCount:r("pgCountEl"),favStarBtn:r("favStarBtn"),resetBtn:r("resetBtn"),variantsSection:r("variantsSection"),variantTitle:r("variantTitleEl"),variants:r("variantsEl"),animList:r("animListEl"),info:r("infoEl"),tags:r("tagsEl"),credits:r("creditsEl"),toast:r("toastEl"),modalBack:r("modalBack"),modalEl:r("modalEl"),modalTitle:r("modalTitleEl"),modalBody:r("modalBodyEl"),modalFoot:r("modalFootEl"),modalClose:r("modalCloseEl")},t={id:null,variant:null,anim:"idle",dir:"down",frame:0,playing:!0,scale:5,fourDir:!1,grid:!1,shadow:!0,bg:"checker",tab:"preview",sheetScale:2,search:"",category:"all",tag:null,favOnly:!1},w=!1,S=0,T=0,L=null,N=null,I=0,_=0,z=new Set,E=[],x=new Map,h={entities:[],sprites:new Map,grass:null,grassW:0,grassH:0,seeded:!1},p=null,b=()=>t.id?p.byId.get(t.id):null,k=()=>({id:t.id,variant:t.variant}),A=()=>Ze({id:t.id,variant:t.variant}),q=0;function j(e,a){n.toast.textContent=e,n.toast.className="toast show"+(a?" err":""),clearTimeout(q),q=setTimeout(()=>{n.toast.className="toast"},2600)}function ue(e,a,i,o){return n.modalTitle.textContent=e,n.modalBody.innerHTML=a||"",n.modalFoot.innerHTML=i||"",n.modalEl.className="modal"+(o?" wide":""),n.modalBack.hidden=!1,n.modalEl}function ie(){n.modalBack.hidden=!0,n.modalBody.innerHTML="",n.modalFoot.innerHTML=""}n.modalClose.addEventListener("click",ie),n.modalBack.addEventListener("click",e=>{e.target===n.modalBack&&ie()});let $={catalogUrl:s.catalogUrl,sheetBase:s.sheetBase};p=await xe($);let Se=et(p),at=await y.get("favourites");if(Array.isArray(at))for(let e of at)p.byId.has(e)&&z.add(e);let Bt=await y.get("last"),Ee=await y.get("settings");if(Ee&&typeof Ee=="object")for(let e of["fourDir","grid","shadow","bg","tab","sheetScale"])Ee[e]!==void 0&&(t[e]=Ee[e]);function Q(){y.set("settings",{fourDir:t.fourDir,grid:t.grid,shadow:t.shadow,bg:t.bg,tab:t.tab,sheetScale:t.sheetScale})}function nt(){y.set("favourites",[...z])}function Tt(){let e=E.indexOf(t.id);e>=0&&E.splice(e,1),E.unshift(t.id),E.length>8&&(E.length=8),y.set("recent",[...E]),y.set("last",{id:t.id,variant:t.variant})}n.brandSub.textContent=Se.creatures+" creatures \xB7 "+Se.variants+" variants \xB7 "+Se.animations+" animations \xB7 "+Se.frames+" frames";function rt(){let e=t.search.trim().toLowerCase();return p.creatures.filter(a=>t.favOnly&&!z.has(a.id)||t.category!=="all"&&a.category!==t.category||t.tag&&!(a.tags||[]).includes(t.tag)?!1:e?[a.id,a.name,a.category,...a.tags||[],...a.packs||[]].join(" ").toLowerCase().includes(e):!0)}function se(){let e=[],a=[{key:"all",label:"All"},...p.categories||[]];e.push(`<button class="chip${t.category==="all"&&!t.favOnly?" on":""}" data-cat="all">All <span class="n">${p.creatures.length}</span></button>`);for(let i of a){if(i.key==="all")continue;let o=(p.byCategory[i.key]||[]).length;o&&e.push(`<button class="chip${t.category===i.key?" on":""}" data-cat="${O(i.key)}" title="${O(i.blurb||"")}">${O(i.label)} <span class="n">${o}</span></button>`)}n.catChips.innerHTML=e.join(""),n.catChips.querySelectorAll("[data-cat]").forEach(i=>i.addEventListener("click",()=>{t.category=i.dataset.cat,t.favOnly=!1,n.favBtn.classList.remove("on"),se(),V()}))}function V(){let e=rt();if(n.browserCount.textContent=e.length+(e.length===1?" creature":" creatures"),!e.length){n.browser.innerHTML='<div class="empty">No creatures match that filter.<br>Try clearing the search or the tag.</div>';return}let a=document.createDocumentFragment();e.forEach(i=>{let o=document.createElement("button");o.className="tile"+(i.id===t.id?" on":""),o.dataset.id=i.id,o.title=i.name+" \u2014 "+(i.tags||[]).join(", ");let c=document.createElement("canvas");c.width=104,c.height=104,o.appendChild(c);let u=document.createElement("span");u.className="cap",u.textContent=i.name,o.appendChild(u);let C=document.createElement("span");C.className="badge",C.textContent=i.size||i.category,o.appendChild(C);let m=document.createElement("span");m.className="fav"+(z.has(i.id)?" on":""),m.textContent="\u2605",m.title="Star / unstar",m.addEventListener("click",v=>{v.stopPropagation(),z.has(i.id)?z.delete(i.id):z.add(i.id),m.className="fav"+(z.has(i.id)?" on":""),nt(),je(),t.favOnly&&V()}),o.appendChild(m),o.addEventListener("click",()=>ee(i.id,null)),a.appendChild(o)}),n.browser.innerHTML="",n.browser.appendChild(a),Dt()}function ea(e){return n.browser.querySelector('.tile[data-id="'+It(e)+'"] canvas')}function It(e){return String(e).replace(/"/g,'\\"')}function ot(e){let a=document.createElement("span");a.className="sw";let i=document.createElement("canvas");return i.width=e||52,i.height=e||52,a.appendChild(i),{sw:a,cv:i}}let it=new WeakMap;function At(e){let a=it.get(e);if(a)return a;let i=e.width,o=e.height,c=-1,u=-1;try{let m=e.getContext("2d").getImageData(0,0,e.width,e.height).data;for(let v=0;v<e.height;v++)for(let M=0;M<e.width;M++)m[(v*e.width+M)*4+3]>8&&(M<i&&(i=M),M>c&&(c=M),v<o&&(o=v),v>u&&(u=v))}catch{}let C=c<0?{x:0,y:0,w:e.width,h:e.height}:{x:i,y:o,w:c-i+1,h:u-o+1};return it.set(e,C),C}function Re(e,a){let i=e.getContext("2d");i.clearRect(0,0,e.width,e.height);let o=At(a),c=e.width>=96,u=c?25:Math.max(1,Math.round(e.width*.05)),C=c?8:u,m=c?22:u,v=c?8:u,M=e.width-v-C,R=e.height-u-m,B=Math.min(M/o.w,R/o.h),X=B<1;i.imageSmoothingEnabled=X,X&&(i.imageSmoothingQuality="high");let ge=Math.round(o.w*B),W=Math.round(o.h*B);i.drawImage(a,o.x,o.y,o.w,o.h,v+Math.round((M-ge)/2),u+Math.round((R-W)/2),ge,W)}async function Ot(e){if(x.has(e.id))return x.get(e.id);let a=pe(e),i=(U(e),"down"),o=null;try{o=await Z(p,e.id,{anim:a,dir:i,frame:0,...$})}catch{}if(!o)try{o=await Z(p,{id:e.id,variant:e.variants[0].key},{anim:pe(e),frame:0,...$})}catch{}return x.set(e.id,o),o}function Dt(){let e=[...n.browser.querySelectorAll(".tile")],a=0,i=()=>{if(w)return;let o=Math.min(e.length,a+4);for(;a<o;a++){let c=e[a],u=p.byId.get(c.dataset.id);u&&Ot(u).then(C=>{if(!C||!c.isConnected)return;let m=c.querySelector("canvas");m&&Re(m,C)})}a<e.length&&setTimeout(i,24)};i()}function ee(e,a,i={}){let o=p.byId.get(e);if(!o)return;if(t.id=e,t.variant=a||(o.variants.find(u=>u.key===a)?a:o.variants[0].key),P(o).includes(t.anim)||(t.anim=pe(o)),U(o)||(t.dir="down"),t.frame=0,i.keepZoom||st(),n.browser.querySelectorAll(".tile").forEach(u=>u.classList.toggle("on",u.dataset.id===e)),Rt(),dt(),Ue(),Nt(),je(),Le(),Y(),t.tab==="sheet"&&de(),_e(),!i.silent&&(Tt(),typeof s.onSelect=="function"))try{s.onSelect(getSelection())}catch(u){console.error(u)}}function st(){let e=b();if(!e)return;let a=Math.max(e.fw,e.fh);t.scale=De(Math.round(170/a),1,14),n.zoomRange.value=String(t.scale)}function he(e,a={}){let i=b();!i||!e||!i.anims[e]||(t.anim=e,t.frame=0,t.tab==="sheet"&&de(),dt(),He(),a.silent||Y(),_e())}function te(e){!e||U(b())&&!D.includes(e)||(t.dir=e,t.frame=0,He(),Y(),_e())}function Ne(e){let a=Me()+1;t.frame=a?(e%a+a)%a:0,T=0,$e(),Pe()}function Fe(){let e=b(),a=e&&F(e,t.anim);return t.fourDir&&U(e)&&a&&!a.dirless?D:[t.dir]}function zt(){let e=b(),a=e&&F(e,t.anim);return!e||!a?"center":U(e)||a.fw===e.fw&&a.fh===e.fh?"feet":"center"}function Me(){if(!L)return 0;let e=Fe(),a=0;for(let i of e)a=Math.max(a,L.frameCount(t.anim,i));return Math.max(0,a-1)}function Le(){let e=b();n.zoomRange.value=String(t.scale),n.dirsToggle.checked=t.fourDir,n.gridToggle.checked=t.grid,n.shadowToggle.checked=t.shadow,n.shadowToggle.disabled=!(e&&e.shadow),n.dirsToggle.disabled=!U(e),n.bgSeg.querySelectorAll("[data-bg]").forEach(a=>a.classList.toggle("on",a.dataset.bg===t.bg)),n.stage.className="stage stage-bg-"+t.bg,n.stageTabs.querySelectorAll("[data-tab]").forEach(a=>a.classList.toggle("on",a.dataset.tab===t.tab)),n.previewControls.hidden=t.tab!=="preview",n.sheetControls.hidden=t.tab!=="sheet",n.playgroundControls.hidden=t.tab!=="playground",n.preview.hidden=t.tab!=="preview",n.sheet.hidden=t.tab!=="sheet",n.playgroundCtn.hidden=t.tab!=="playground",n.stageTitle.textContent=t.tab==="preview"?"Preview":t.tab==="sheet"?"Animation sheet":"Playground",n.animSelect.disabled=t.tab==="playground",n.stageHint.innerHTML=t.tab==="playground"?'A live demo of the exported API: every creature below is drawn with <code class="mono">createSprite().drawWithShadow(ctx, x, y, { anim, dir, frame })</code> &mdash; the same call your game makes.':t.tab==="sheet"?"Canonical sheet for one animation: one row per direction, in the order <b>up, left, down, right</b>. Transparent background.":'Feet sit on the ground line, so <code class="mono">draw(ctx, x, y, { dir, frame })</code> drops straight into a top-down game loop.',t.tab==="playground"&&fe()}function je(){let e=z.has(t.id);n.favStarBtn.innerHTML=e?"&#9733; Starred":"&#9734; Star",n.favStarBtn.classList.toggle("on",e)}function Rt(){let e=b(),a=e.variants||[];n.variantTitle.textContent=a.length>1?"Variants ("+a.length+")":"Variant",n.variants.innerHTML="",a.forEach(i=>{let o=document.createElement("button");o.className="var"+(i.key===t.variant?" on":"");let{sw:c,cv:u}=ot(48);o.appendChild(c);let C=document.createElement("span");C.textContent=i.name||i.key,o.appendChild(C),o.addEventListener("click",()=>ee(e.id,i.key,{keepZoom:!0})),n.variants.appendChild(o),Z(p,{id:e.id,variant:i.key},{anim:pe(e),dir:"down",frame:0,...$}).then(m=>{m&&Re(u,m)}).catch(()=>{})})}function dt(){let e=b();n.animSelect.innerHTML="";let a=[];n.animList.innerHTML="";for(let i of P(e)){let o=F(e,i);a.push(o);let c=document.createElement("option");c.value=i,c.textContent=i,n.animSelect.appendChild(c);let u=document.createElement("div");u.className="anim-row"+(i===t.anim?" on":"");let{sw:C,cv:m}=ot(68);u.appendChild(C);let v=document.createElement("span");v.className="nm",v.textContent=i,u.appendChild(v);let M=document.createElement("span");M.className="meta";let R=U(e)?G(e,i,"down"):(o.def.frames||[]).length;M.textContent=R+"f \xB7 "+o.fps+"fps"+(o.loop?"":" \xB7 once"),u.appendChild(M),u.addEventListener("click",()=>he(i)),n.animList.appendChild(u),Z(p,k(),{anim:i,dir:"down",frame:0,...$}).then(B=>{B&&Re(m,B)}).catch(()=>{})}n.animSelect.value=t.anim,He()}function He(){let e=b(),a=U(e);if(n.dirSeg.hidden=!a,n.dpad.hidden=!a,n.dirSeg.innerHTML="",a){for(let i of D){let o=document.createElement("button");o.textContent=be[i],o.className=i===t.dir?"on":"",o.addEventListener("click",()=>te(i)),n.dirSeg.appendChild(o)}n.dpad.querySelectorAll("[data-dir]").forEach(i=>i.classList.toggle("on",i.dataset.dir===t.dir))}$e()}function $e(){let e=Me();n.frameRange.max=String(e),n.frameRange.value=String(De(t.frame,0,e)),n.frameLabel.textContent=t.frame+1+" / "+(e+1)}function Ue(){let e=b(),a=K(e,t.variant),i=Zt(e),o=[["Category",(p.categoryOf(e.category)||{}).label||e.category],["Size class",e.size||"\u2014"],["Frame size",e.fw+" \xD7 "+e.fh+" px"],["Directions",U(e)?e.dirs||"lpc":"single view"],["Animations",P(e).length+" ("+i+" frames)"],["Variants",(e.variants||[]).length],["Sheet",a.sheet],["Ground pivot",e.ground?e.ground.x+", "+e.ground.y:"centred"],["Shadow",e.shadow?"yes":"none"]];if(n.info.innerHTML=o.map(([c,u])=>`<dt>${O(c)}</dt><dd>${O(u)}</dd>`).join(""),n.tags.innerHTML="",(e.tags||[]).forEach(c=>{let u=document.createElement("button");u.className="tag"+(t.tag===c?" on":""),u.textContent="#"+c,u.addEventListener("click",()=>{t.tag=t.tag===c?null:c,t.category="all",se(),V(),Ue()}),n.tags.appendChild(u)}),e.notes){let c=document.createElement("div");c.className="note",c.style.marginTop="8px",c.textContent=e.notes,n.tags.appendChild(c)}}function Nt(){let a=(b().packs||[]).map(i=>p.packs[i]).filter(Boolean);n.credits.innerHTML=a.map(i=>`
      <div class="c">
        <b>${O(i.name)}</b><br>
        ${(i.authors||[]).map(O).join(", ")}<br>
        <a href="${O(i.url)}" target="_blank" rel="noopener">${O(i.url)}</a>
        ${(i.extraUrls||[]).map(o=>`<br><a href="${O(o)}" target="_blank" rel="noopener">${O(o)}</a>`).join("")}
        <div>${String(i.license||"").split("/").map(o=>`<span class="lic">${O(o.trim())}</span>`).join("")}</div>
      </div>`).join("")}async function Y(){let e=b();if(!e)return;let a=++I,i=Fe(),o=t.shadow&&!!e.shadow,c;try{c=await ce(p,k(),{scale:t.scale,anims:[t.anim],directions:i,shadow:o,...$})}catch(u){console.error(u),n.stageBadge.textContent="Could not render this creature";return}a!==I||w||(L=c,N=F(e,t.anim),t.frame=De(t.frame,0,Me()),$e(),Pe())}function Pe(){let e=L;if(!e)return;let a=N,i=Fe(),o=zt(),c=t.scale,u=12,C=a.fw*c,m=a.fh*c,v=C+u*2,M=m+u*2,R=n.preview;R.width=v*i.length,R.height=M;let B=R.getContext("2d");B.imageSmoothingEnabled=!1,B.clearRect(0,0,R.width,R.height);let X=e.pivot;for(let W=0;W<i.length;W++){let Te=i[W],Ie=W*v+u;t.grid&&(B.strokeStyle="rgba(120,140,170,0.35)",B.lineWidth=1,B.strokeRect(W*v+.5,.5,v-1,M-1));let bt=Math.min(t.frame,Math.max(0,e.frameCount(t.anim,Te)-1));(o==="feet"?e.drawWithShadow(B,Ie+C/2,u+X.y,{anim:t.anim,dir:Te,frame:bt,anchor:"feet"}):e.drawWithShadow(B,Ie+C/2,u+m/2,{anim:t.anim,dir:Te,frame:bt,anchor:"center"}))||(B.fillStyle="rgba(255,120,120,0.75)",B.font="12px monospace",B.fillText("no frame",Ie+4,u+14)),t.grid&&o==="feet"&&(B.strokeStyle="rgba(240,180,41,0.7)",B.setLineDash([4,3]),B.beginPath(),B.moveTo(W*v,u+X.y+.5),B.lineTo(W*v+v,u+X.y+.5),B.stroke(),B.setLineDash([]),o==="feet"&&(B.fillStyle="#f0b429",B.beginPath(),B.arc(Ie+X.x,u+X.y,2.5,0,Math.PI*2),B.fill()),i.length>1&&(B.fillStyle="rgba(147,160,180,0.9)",B.font="11px ui-sans-serif, system-ui, sans-serif",B.fillText(be[Te],W*v+6,M-4)))}let ge=e.frameCount(t.anim,t.dir);n.stageBadge.textContent=t.anim+" \xB7 "+(i.length>1?"4 directions":be[t.dir])+" \xB7 "+ge+" frame"+(ge===1?"":"s")+" \xB7 "+e.fps(t.anim)+" fps \xB7 "+a.fw+"\xD7"+a.fh+" @ "+c+"x"}function de(){let e=b();if(!e)return;let a=++_,i=e.anims[t.anim]&&t.anim||pe(e),o=Math.max(320,n.stage.clientWidth-48),c=Math.max(1,...D.map(m=>G(e,i,m))),u=F(e,i),C=De(Math.floor(Math.min(o/(c*u.fw),420/(4*u.fh))),1,6);n.sheetScaleSeg.dataset.touched||(t.sheetScale=C),n.sheetScaleSeg.innerHTML=[1,2,3,4].map(m=>`<button data-s="${m}" class="${m===t.sheetScale?"on":""}">${m}x</button>`).join(""),n.sheetScaleSeg.querySelectorAll("[data-s]").forEach(m=>m.addEventListener("click",()=>{n.sheetScaleSeg.dataset.touched="1",t.sheetScale=Number(m.dataset.s),Q(),de()})),re(p,k(),i,{scale:t.sheetScale,...$}).then(m=>{if(a!==_||w)return;let v=n.sheet;v.width=m.width,v.height=m.height;let M=v.getContext("2d");M.imageSmoothingEnabled=!1,M.clearRect(0,0,v.width,v.height),M.drawImage(m,0,0);let R=U(e);n.sheetInfo.textContent=i+" \xB7 "+(R?"up, left, down, right":"single view")+" \xB7 "+m.width+"\xD7"+m.height+" px",n.stageHint.innerHTML=R?"One row per direction \u2014 <b>up, left, down, right</b>, "+c+" columns. Frames are centred in their cell; the pivot stays put across rows, so a whole row animates as-is.":"Direction-independent animation ("+G(e,i,"down")+" frames)."}).catch(m=>{console.error(m),n.sheetInfo.textContent="Could not render sheet"})}let H=null;function Ft(e){let a=e.fw,i=e.fh,o=0,c=0;for(let C of P(e)){let m=F(e,C);a=Math.max(a,m.fw),i=Math.max(i,m.fh),c++;for(let v of D)o=Math.max(o,G(e,C,v))}o=Math.max(1,o);let u=c*4;return e.shadow&&(u+=4),{cols:o,rows:u,cellW:a,cellH:i}}function lt(e,a){let i=Ft(e),o=a;for(;o>1&&(i.cols*i.cellW*o>8e3||i.rows*i.cellH*o>8e3||i.cols*i.cellW*o*i.rows*i.cellH*o>24e6);)o--;return o}async function jt(e,a){let i=b(),o=lt(i,e),c=await ve(p,k(),{scale:o,shadow:a,...$}),u=ye(p,k(),{scale:o,shadow:a},c);return u.scaleLimit=o<e?{requested:e,applied:o,reason:"canvas size limit"}:null,{res:c,manifest:u,scale:o,withShadow:a}}function ct(){let e=b(),a=K(e,t.variant),i=P(e).slice(0,4).join('", "'),o=U(e)?t.dir:"down";return["// main.pjs","lpcAnimals = {import:"+(typeof window.generatorName=="string"?window.generatorName:"lpc-animal-and-monster-creator")+"}","","// game code (importing the generator gives you the plugin object directly)","const creator = root.lpcAnimals;","const sprite = await creator.createSprite("+JSON.stringify(A())+", { scale: 1 });","","// each frame, with the feet anchored at (entity.x, entity.y):","sprite.drawWithShadow(ctx, entity.x, entity.y, {",'  anim: "'+t.anim+'",','  dir: "'+o+'",','  frame: sprite.frameCount("'+t.anim+'", "'+o+'") > 1','    ? Math.floor(t * sprite.fps("'+t.anim+'")) % sprite.frameCount("'+t.anim+'", "'+o+'")',"    : 0,","});","","// animations available: "+i,"// frame size: "+(e.fw+"x"+e.fh)+" \xB7 animations: "+P(e).join(", "),"// credit: "+(e.packs||[]).map(u=>(p.packs[u]||{}).name).filter(Boolean).join(" + "),"// licence: "+[...new Set((e.packs||[]).map(u=>(p.packs[u]||{}).license).filter(Boolean))].join(" / ")].join(`
`)}function pt(){let e=b(),a=K(e,t.variant),i=ue("Export \u2014 "+e.name+(a.name&&a.name!==e.name?" ("+a.name+")":""),`
      <div class="field">
        <label>Pixel scale</label>
        <div class="row2">
          <div class="seg" id="expScaleSeg">
            <button data-s="1">1x</button><button data-s="2" class="on">2x</button>
            <button data-s="3">3x</button><button data-s="4">4x</button>
          </div>
          <label class="chk"><input type="checkbox" id="expShadow" checked ${e.shadow?"":"disabled"} /> shadow rows</label>
          <span class="meta" id="expStatusEl">building&hellip;</span>
        </div>
      </div>
      <div class="prog" id="expProgEl"><i></i></div>
      <div class="field">
        <label>Game sheet \u2014 every animation, uniform cells, one block of 4 direction rows each</label>
        <div class="row2">
          <button class="btn btn-sm" id="expSheetBtn" disabled>Download PNG</button>
          <button class="btn btn-sm" id="expManifestBtn" disabled>Download manifest JSON</button>
          <button class="btn btn-sm btn-ghost" id="expCopyManifestBtn" disabled>Copy manifest</button>
        </div>
      </div>
      <div class="field">
        <label>Manifest preview (<span id="expManifestNameEl"></span>)</label>
        <pre class="codebox" id="expManifestEl">building&hellip;</pre>
      </div>
      <div class="field">
        <label>Single animation sheet</label>
        <div class="row2">
          <button class="btn btn-sm" id="expAnimBtn">Download ${O(t.anim)} sheet</button>
          <span class="meta">rows: up, left, down, right</span>
        </div>
      </div>
      <div class="field">
        <label>Use it in your game</label>
        <pre class="codebox" id="expCodeEl">${O(ct())}</pre>
        <div class="row2" style="margin-top:8px">
          <button class="btn btn-sm btn-ghost" id="expCopyCodeBtn">Copy code</button>
          <button class="btn btn-sm btn-ghost" id="expCopyCodeCtnBtn">Share code: ${O(A())}</button>
        </div>
      </div>`,'<button class="btn btn-primary" id="expCloseBtn">Done</button>',!0),o=m=>i.querySelector("#"+m);o("expCloseBtn").addEventListener("click",ie),o("expCopyCodeBtn").addEventListener("click",async()=>{j(await ke(ct())?"Sprite code copied":"Could not copy",!1)}),o("expCopyCodeCtnBtn").addEventListener("click",async()=>{j(await ke(A())?"Copied "+A():"Could not copy")});let c=2,u=!!e.shadow,C=async()=>{let v=(H&&H.token||0)+1;H={token:v},o("expStatusEl").textContent="building\u2026",o("expProgEl").querySelector("i").style.width="35%",["expSheetBtn","expManifestBtn","expCopyManifestBtn"].forEach(M=>o(M).disabled=!0);try{let M=await jt(c,u);if(!H||H.token!==v)return;H=Object.assign(M,{token:v}),o("expProgEl").querySelector("i").style.width="100%";let R=M.manifest;o("expStatusEl").textContent=R.cols+"\xD7"+R.rows+" cells \xB7 "+M.res.canvas.width+"\xD7"+M.res.canvas.height+" px"+(R.scaleLimit?" \xB7 scale reduced to "+R.scaleLimit.applied+"x (canvas limit)":""),o("expManifestNameEl").textContent=R.image,o("expManifestEl").textContent=JSON.stringify(R,null,1),["expSheetBtn","expManifestBtn","expCopyManifestBtn"].forEach(B=>o(B).disabled=!1)}catch(M){console.error(M),o("expStatusEl").textContent="Failed: "+M.message,o("expProgEl").querySelector("i").style.width="0%"}};o("expScaleSeg").querySelectorAll("[data-s]").forEach(m=>m.addEventListener("click",()=>{c=Number(m.dataset.s),o("expScaleSeg").querySelectorAll("button").forEach(v=>v.classList.toggle("on",v===m)),C()})),o("expShadow").addEventListener("change",m=>{u=m.target.checked,C()}),o("expSheetBtn").addEventListener("click",async()=>{if(!H||!H.res)return;let m=await tt(H.res.canvas);ze(m,H.manifest.image),j("Downloaded "+H.manifest.image)}),o("expManifestBtn").addEventListener("click",()=>{if(!H||!H.manifest)return;let m=H.manifest.image.replace(/\.png$/,".json");ze(new Blob([JSON.stringify(H.manifest,null,2)],{type:"application/json"}),m),j("Downloaded "+m)}),o("expCopyManifestBtn").addEventListener("click",async()=>{H&&j(await ke(JSON.stringify(H.manifest,null,2))?"Manifest copied":"Could not copy")}),o("expAnimBtn").addEventListener("click",async()=>{let m=await re(p,k(),t.anim,{scale:lt(e,c),...$}),v=e.id+"-"+(a.key&&a.key!=="default"?a.key+"-":"")+t.anim+".png";ze(await tt(m),v),j("Downloaded "+v)}),C()}function Ht(){let e=Object.values(p.packs||{});ue("Credits & licences",`<p class="note" style="margin-top:0">Every sprite in this bestiary comes from the Liberated Pixel Cup (LPC) community. Most of these licences require attribution &mdash; the credits for the creature you are viewing are also shown in the right-hand panel so you can copy them into your game's credits screen.</p>
       <div class="credits">${e.map(a=>`
        <div class="c">
          <b>${O(a.name)}</b><br>
          ${(a.authors||[]).map(O).join(" \xB7 ")}<br>
          <a href="${O(a.url)}" target="_blank" rel="noopener">${O(a.url)}</a>
          ${(a.extraUrls||[]).map(i=>`<br><a href="${O(i)}" target="_blank" rel="noopener">${O(i)}</a>`).join("")}
          <div>${String(a.license||"").split("/").map(i=>`<span class="lic">${O(i.trim())}</span>`).join("")}</div>
        </div>`).join("")}
       </div>`,'<button class="btn btn-primary" id="crCloseBtn">Close</button>',!0),n.modalFoot.querySelector("#crCloseBtn").addEventListener("click",ie)}function $t(){return"https://perchance.org/"+(typeof window.generatorName=="string"?window.generatorName:"lpc-animal-and-monster-creator")+"#"+A()+"/"+t.anim+"/"+t.dir}function Ut(){let e=$t(),a=ue("Share this creature",`<div class="field">
        <label>Link</label>
        <div class="row2"><input type="text" id="shareLinkInput" readonly value="${O(e)}" />
        <button class="btn" id="shareCopyBtn">Copy</button></div>
      </div>
      <div class="field">
        <label>Share code</label>
        <div class="row2"><input type="text" id="shareCodeInput" readonly value="${O(A())}" />
        <button class="btn" id="shareCodeCopyBtn">Copy</button></div>
        <p class="note">Pass the code straight to the plugin: <code class="mono">creator.createSprite("${O(A())}")</code></p>
      </div>`,'<button class="btn btn-primary" id="shareCloseBtn">Close</button>');a.querySelector("#shareCloseBtn").addEventListener("click",ie),a.querySelector("#shareCopyBtn").addEventListener("click",async()=>{j(await ke(e)?"Link copied":"Could not copy")}),a.querySelector("#shareCodeCopyBtn").addEventListener("click",async()=>{j(await ke(A())?"Code copied":"Could not copy")});let i=a.querySelector("#shareLinkInput");i.focus(),i.select()}function _e(){if(g)try{history.replaceState(null,"","#"+A()+"/"+t.anim+"/"+t.dir)}catch{}}function Pt(){if(!g)return null;let e=decodeURIComponent(location.hash.replace(/^#/,""));if(!e)return null;let[a,i,o]=e.split("/"),c=Qe(a);return!c||!p.byId.has(c.id)?null:{id:c.id,variant:c.variant,anim:i,dir:o}}function _t(e){return e.fh<=40?2:(e.fh<=64,1)}async function qt(e){let a=e.id+"~"+(t.variant&&t.id===e.id?t.variant:"");if(h.sprites.has(a))return h.sprites.get(a);let i=P(e).filter(c=>c==="walk"||c==="run"||c==="fly"||c==="idle"||c==="hop"||c==="swim"||c==="gallop"),o=await ce(p,{id:e.id,variant:t.id===e.id?t.variant:null},{scale:_t(e),anims:i.length?i:[pe(e)],shadow:t.shadow,...$});return h.sprites.set(a,o),o}function Wt(e){for(let a of["walk","gallop","run","hop","swim","fly","idle"])if(e.animations.includes(a))return a;return e.animations[0]}async function qe(e,a){let i=p.byId.get(e||t.id);if(!i)return;let o;try{o=await qt(i)}catch(m){console.error(m),j("Could not load "+i.name+" frames",!0);return}if(w)return;let c=n.playground.clientWidth||600,u=n.playground.clientHeight||360;h.entities.push({id:i.id,sprite:o,anim:Wt(o),dir:["down","left","right","up"][Math.floor(Math.random()*4)],x:40+Math.random()*Math.max(40,c-80),y:60+Math.random()*Math.max(40,u-100),tx:0,ty:0,t:Math.random()*3,speed:18+Math.random()*22,waiting:0});let C=h.entities[h.entities.length-1];C.tx=40+Math.random()*Math.max(40,c-80),C.ty=60+Math.random()*Math.max(40,u-40),n.pgCount.textContent=h.entities.length+" on the field"}function Gt(){h.entities.length=0,n.pgCount.textContent="0 on the field",Be()}async function ut(){if(h.seeded)return;h.seeded=!0;let e=p.creatures.filter(o=>o.id!=="slime-projectile"),a=[],i=new Set;for(;a.length<9&&a.length<e.length;){let o=e[Math.floor(Math.random()*e.length)];i.has(o.id)||(i.add(o.id),a.push(o))}for(let o of a){if(await qe(o.id,o.variants[Math.floor(Math.random()*o.variants.length)].key),w)return;await new Promise(c=>setTimeout(c,40))}}function Kt(e,a){let i=document.createElement("canvas");i.width=Math.max(1,e),i.height=Math.max(1,a);let o=i.getContext("2d"),c=o.createLinearGradient(0,0,0,a);c.addColorStop(0,"#4b8a3d"),c.addColorStop(.55,"#3f7a34"),c.addColorStop(1,"#2f5f28"),o.fillStyle=c,o.fillRect(0,0,e,a);let u=C=>Math.floor(Math.random()*C);for(let C=0;C<Math.floor(e*a/900);C++){let m=u(e),v=u(a);o.fillStyle="rgba(0,0,0,"+(.03+Math.random()*.06)+")",o.beginPath(),o.ellipse(m,v,10+u(34),5+u(16),Math.random()*Math.PI,0,Math.PI*2),o.fill()}for(let C=0;C<Math.floor(e*a/420);C++){let m=u(e),v=u(a);o.strokeStyle=Math.random()<.5?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.14)",o.lineWidth=1,o.beginPath(),o.moveTo(m,v),o.lineTo(m+(Math.random()<.5?-2:2),v-3-u(3)),o.stroke()}return i}function fe(){let e=Math.max(1,Math.round(n.playground.clientWidth)),a=Math.max(1,Math.round(n.playground.clientHeight));!e||!a||((n.playground.width!==e||n.playground.height!==a)&&(n.playground.width=e,n.playground.height=a),(h.grassW!==e||h.grassH!==a)&&(h.grass=Kt(e,a),h.grassW=e,h.grassH=a))}function Yt(e){let a=n.playground.width,i=n.playground.height,o=Number(n.pgSpeed.value)/80;for(let c of h.entities){if(c.waiting>0){c.waiting-=e;continue}let u=c.tx-c.x,C=c.ty-c.y,m=Math.hypot(u,C);if(m<3){c.waiting=.2+Math.random()*1.6,c.tx=30+Math.random()*Math.max(30,a-60),c.ty=50+Math.random()*Math.max(40,i-60);continue}let v=c.speed*o*e;c.x+=u/m*v,c.y+=C/m*v,c.dir=Math.abs(u)>Math.abs(C)?u>0?"right":"left":C>0?"down":"up";let M=c.sprite.frameCount(c.anim,c.dir)||1;c.t+=e,c.frame=Math.floor(c.t*c.sprite.fps(c.anim))%M}}function Be(){fe();let e=n.playground,a=e.getContext("2d");a.imageSmoothingEnabled=!1,h.grass?a.drawImage(h.grass,0,0):(a.fillStyle="#3f7a34",a.fillRect(0,0,e.width,e.height));let i=[...h.entities].sort((o,c)=>o.y-c.y);for(let o of i)o.sprite.drawWithShadow(a,Math.round(o.x),Math.round(o.y),{anim:o.anim,dir:o.dir,frame:o.frame||0});h.entities.length||(a.fillStyle="rgba(255,255,255,0.75)",a.font="13px ui-sans-serif, system-ui, sans-serif",a.textAlign="center",a.fillText("Spawn a few creatures to see the exported sprite API in action",e.width/2,e.height/2),a.textAlign="left")}n.search.addEventListener("input",()=>{t.search=n.search.value,V()}),n.animSelect.addEventListener("change",()=>he(n.animSelect.value)),n.playBtn.addEventListener("click",()=>{t.playing=!t.playing,n.playBtn.innerHTML=t.playing?"&#10074;&#10074;":"&#9654;"}),n.dirSeg.addEventListener("click",e=>{let a=e.target.closest("button");a&&te(D[Array.from(n.dirSeg.children).indexOf(a)])}),n.dpad.addEventListener("click",e=>{let a=e.target.closest("[data-dir]");a&&te(a.dataset.dir)}),n.frameRange.addEventListener("input",()=>{t.playing=!1,n.playBtn.innerHTML="&#9654;",Ne(Number(n.frameRange.value))}),n.zoomRange.addEventListener("input",()=>{t.scale=Number(n.zoomRange.value),Y()}),n.fitBtn.addEventListener("click",()=>{st(),Y()}),n.dirsToggle.addEventListener("change",()=>{t.fourDir=n.dirsToggle.checked,Q(),Y()}),n.gridToggle.addEventListener("change",()=>{t.grid=n.gridToggle.checked,Q(),Pe()}),n.shadowToggle.addEventListener("change",()=>{t.shadow=n.shadowToggle.checked,Q(),Y()}),n.bgSeg.addEventListener("click",e=>{let a=e.target.closest("[data-bg]");a&&(t.bg=a.dataset.bg,Q(),Le())}),n.stageTabs.addEventListener("click",e=>{let a=e.target.closest("[data-tab]");a&&(t.tab=a.dataset.tab,Q(),Le(),t.tab==="preview"&&Y(),t.tab==="sheet"&&de(),t.tab==="playground"&&(fe(),Be(),ut()))}),n.randomBtn.addEventListener("click",()=>{let e=p.creatures[Math.floor(Math.random()*p.creatures.length)];t.anim="<random>",t.search="",n.search.value="",t.category="all",t.favOnly=!1,n.favBtn.classList.remove("on"),ee(e.id,e.variants[Math.floor(Math.random()*e.variants.length)].key);let a=P(b());he(a[Math.floor(Math.random()*a.length)]),U(b())&&te(D[Math.floor(Math.random()*4)]),se(),V(),j("Rolled the dice: "+b().name)}),n.favBtn.addEventListener("click",()=>{t.favOnly=!t.favOnly,n.favBtn.classList.toggle("on",t.favOnly),se(),V()}),n.favStarBtn.addEventListener("click",()=>{z.has(t.id)?z.delete(t.id):z.add(t.id),nt(),je();let e=n.browser.querySelector('.tile[data-id="'+CSS_escape(t.id)+'"] .fav');e&&e.classList.toggle("on",z.has(t.id)),t.favOnly&&V()}),n.creditsBtn.addEventListener("click",Ht),n.exportBtn.addEventListener("click",pt),n.shareBtn.addEventListener("click",Ut),n.resetBtn.addEventListener("click",()=>{t.playing=!0,n.playBtn.innerHTML="&#10074;&#10074;",t.fourDir=!1,t.grid=!1,t.shadow=!0,t.bg="checker",t.search="",n.search.value="",t.category="all",t.tag=null,t.favOnly=!1,n.favBtn.classList.remove("on"),Q(),ee(t.id,null,{keepZoom:!0,silent:!0}),se(),V(),Ue(),j("Reset view")}),n.sheetDownloadBtn.addEventListener("click",async()=>{let e=b(),a=await re(p,k(),t.anim,{scale:t.sheetScale,...$}),i=e.id+"-"+t.anim+".png";ze(await tt(a),i),j("Downloaded "+i)}),n.pgSpawnBtn.addEventListener("click",()=>qe(t.id,t.variant)),n.pgAddBtn.addEventListener("click",()=>{let e=p.creatures[Math.floor(Math.random()*p.creatures.length)];qe(e.id,e.variants[0].key)}),n.pgClearBtn.addEventListener("click",Gt),n.playground.addEventListener("click",e=>{if(!h.entities.length)return;let a=n.playground.getBoundingClientRect();h.entities[h.entities.length-1].tx=e.clientX-a.left,h.entities[h.entities.length-1].ty=e.clientY-a.top});function ht(e){let a=e.target,i=a&&a.tagName;if(!((i==="INPUT"||i==="SELECT"||i==="TEXTAREA"||a&&a.isContentEditable)&&!(i==="INPUT"&&a.type==="range"))){if(!n.modalBack.hidden&&e.key==="Escape"){ie();return}if(e.key==="ArrowUp"||e.key==="ArrowDown"||e.key==="ArrowLeft"||e.key==="ArrowRight"){let o={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"};U(b())&&(te(o[e.key]),e.preventDefault());return}if(e.key===" "){t.playing=!t.playing,n.playBtn.innerHTML=t.playing?"&#10074;&#10074;":"&#9654;",e.preventDefault();return}e.key==="["?ft(-1):e.key==="]"?ft(1):(e.key==="r"||e.key==="R")&&n.randomBtn.click()}}function ft(e){let a=rt();if(!a.length)return;let i=a.findIndex(o=>o.id===t.id);i<0&&(i=0),i=(i+e+a.length)%a.length,ee(a[i].id,null)}document.addEventListener("keydown",ht);let We=0;function gt(){clearTimeout(We),We=setTimeout(()=>{w||(fe(),t.tab==="preview"?Y():t.tab==="sheet"&&de())},150)}addEventListener("resize",gt);let Ge=0;function mt(e){if(w)return;S=requestAnimationFrame(mt);let a=Ge?Math.min(.1,(e-Ge)/1e3):0;if(Ge=e,t.tab==="preview"){let i=Me();if(t.playing&&i>0&&L){T+=a;let o=1/(L.fps(t.anim)||8);T>=o&&(T%=o,Ne(t.frame+1))}}else t.tab==="playground"&&(Yt(a),Be())}se();let ae=Pt()||Bt||{id:p.creatures[0].id,variant:null,anim:null,dir:null};return Array.isArray(await y.get("recent"))&&E.push(...await y.get("recent")),ee(ae.id,ae.variant,{silent:!0}),ae.anim&&b().anims[ae.anim]&&he(ae.anim,{silent:!0}),ae.dir&&te(ae.dir),Y(),V(),Le(),n.playBtn.innerHTML="&#10074;&#10074;",n.pgCount.textContent="0 on the field",t.tab==="sheet"&&de(),t.tab==="playground"&&(fe(),ut(),Be()),S=requestAnimationFrame(mt),{root:f,shadow:d,mountEl:l,catalog:p,get state(){return Object.assign({},t)},getSelection(){let e=b(),a=K(e,t.variant);return{id:e.id,variant:a.key,name:e.name,variantName:a.name,code:A(),category:e.category,tags:(e.tags||[]).slice(),anim:t.anim,dir:t.dir,frameSize:{w:e.fw,h:e.fh},ground:e.ground||null,packs:(e.packs||[]).slice()}},getCreature:()=>b(),select:(e,a)=>ee(e,a),setAnim:he,setDir:te,setFrame:Ne,renderFrame:e=>Z(p,k(),Object.assign({},$,e)),renderAnimSheet:(e,a)=>re(p,k(),e||t.anim,Object.assign({},$,a)),renderFullSheet:e=>ve(p,k(),Object.assign({},$,e)),manifest:e=>ye(p,k(),e||{}),createSprite:e=>ce(p,k(),Object.assign({},$,e)),openExport:pt,destroy(){w=!0,cancelAnimationFrame(S),clearTimeout(We),removeEventListener("resize",gt),document.removeEventListener("keydown",ht),h.entities.length=0,h.sprites.clear(),x.clear(),Ye();try{d.innerHTML=""}catch{}}}}async function Qt(l={}){let s=document.createElement("div");s.style.cssText="position:fixed;inset:0;z-index:2147483000;background:#0b0e13;overflow:auto;",document.body.appendChild(s);let d=document.body.style.overflow;document.body.style.overflow="hidden";let r=await Lt(s,Object.assign({},l,{height:!1}));return new Promise(f=>{let y=!1,g=w=>{y||(y=!0,document.removeEventListener("keydown",n,!0),document.body.style.overflow=d,r.destroy(),s.remove(),f(w))},n=w=>{w.key==="Escape"&&g(null)};document.addEventListener("keydown",n,!0);let t=r.root.querySelector(".top-actions");if(t){let w=document.createElement("button");w.className="btn btn-ghost",w.textContent="Cancel",w.addEventListener("click",()=>g(null));let S=document.createElement("button");S.className="btn btn-primary",S.textContent="Use this creature",S.addEventListener("click",()=>g(r.getSelection())),t.appendChild(w),t.appendChild(S)}})}var Ce=new Map;function oe(l={}){let s=l.catalogUrl||Oe;if(!Ce.has(s)){let d=xe(l);d.catch(()=>Ce.delete(s)),Ce.set(s,d)}return Ce.get(s)}function sa(){Ce.clear()}async function da(l,s={}){return Z(await oe(s),l,s)}async function la(l,s,d={}){return re(await oe(d),l,s,d)}async function ca(l,s={}){return ve(await oe(s),l,s)}async function pa(l,s={},d={}){return ye(await oe(s),l,s,d)}async function ua(l,s={}){return ce(await oe(s),l,s)}async function ha(l,s={}){let d=await oe(s),{creature:r}=J(d,l);return r?P(r).map(f=>{let y=F(r,f),g=y.def,n=y.dirless?g.frames.length:Math.max(0,...Object.values(g.dirs||{}).map(t=>(t.cols||[]).length));return{id:f,name:g.name||f,frames:n,fps:y.fps,loop:y.loop,directional:!y.dirless}}):[]}async function fa(l={}){return(await oe(l)).creatures.map(d=>({id:d.id,name:d.name,category:d.category,tags:d.tags||[],variants:d.variants.map(r=>({key:r.key,name:r.name})),animations:Object.keys(d.anims),frameSize:{w:d.fw,h:d.fh},size:d.size||null}))}export{Et as CSS,Oe as DEFAULT_CATALOG_URL,D as DIRECTIONS,Vt as DIR_ICON,be as DIR_LABEL,wt as PLUGIN_VERSION,Ct as animFrameGrid,F as animInfo,kt as animSheetRel,ha as animationsFor,et as catalogStats,Ye as clearCaches,sa as clearCatalogCache,ua as createSprite,Qe as creatureFromCode,Ze as creatureToCode,J as findCreature,we as frameCanvas,G as frameCount,oe as getCatalog,U as isDirectional,fa as listCreatures,Ke as loadBitmap,xe as loadCatalog,Lt as mountAnimalCreator,le as newCanvas,Qt as openAnimalCreator,la as renderAnimSheet,da as renderFrame,ca as renderSheet,Ae as scaleCanvas,Je as shadowCount,Xe as shadowFrameCanvas,pa as sheetManifest,Ve as sheetUrl,K as variantOf};
