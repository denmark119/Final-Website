const I={
 grid:'<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="7" height="7" rx="1.5"/><rect x="13" y="2" width="7" height="7" rx="1.5"/><rect x="2" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
 search:'<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9.5" cy="9.5" r="6.5"/><path d="M14.5 14.5 20 20"/></svg>',
 cal:'<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="4" width="18" height="16" rx="3"/><path d="M2 9h18M7 2v4M15 2v4M6 13h2M10 13h2M14 13h2"/></svg>',
 clock:'<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="9"/><path d="M11 6v5l3 2"/></svg>',
 bell:'<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#6b7f7e" stroke-width="1.5" stroke-linejoin="round"><path d="M4 16h14l-2-3V9a5 5 0 0 0-10 0v4zM9 19h4"/></svg>',
 menu:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14302f" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
 cross:'<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M8 3h6v5h5v6h-5v5H8v-5H3V8h5z"/></svg>'
};
const NAV=[['index.html','Overview','grid'],['doctors.html','Find a doctor','search'],['appointments.html','My appointments','cal'],['queue.html','Live queue','clock']];
const b=document.body, main=document.querySelector('main'), cur=b.dataset.nav, crumb=b.dataset.crumb||'Patient portal';
const app=document.createElement('div');app.className='app';
app.innerHTML=`<aside class="side"><a class="logo" href="index.html"><span class="mark">${I.cross}</span>careline</a>
<p class="label">PATIENT PORTAL</p><nav class="nav">${NAV.map(n=>`<a href="${n[0]}" class="${n[0]===cur?'on':''}">${I[n[2]]}${n[1]}</a>`).join('')}</nav>
<div class="help"><h4>Here to help</h4><p>Questions about your visit?</p><a href="tel:+6285550123">Call (02) 8555 0123</a><p style="margin:0">Mon–Sat, 7 AM–8 PM</p></div>
<p class="copy">© 2026 Careline Hospital</p></aside>
<div class="right"><header class="top"><div class="bc"><button class="menu-btn" aria-label="Open menu">${I.menu}</button><a href="index.html">Careline General Hospital</a><span>/</span><a href="index.html">${crumb}</a></div>
<div class="r"><span class="hide">Patient ID&nbsp; CL-20481</span><button class="bell" aria-label="Notifications">${I.bell}</button><b>Alex Morgan ⌄</b></div></header></div>`;
b.prepend(app);app.querySelector('.right').appendChild(main);
app.querySelector('.menu-btn').onclick=()=>b.classList.toggle('nav-open');
app.querySelector('.bell').onclick=()=>alert('You have no new notifications.');
main.addEventListener('click',()=>b.classList.remove('nav-open'));

const sel=(group,cls,fn)=>group.forEach(el=>el.addEventListener('click',()=>{group.forEach(x=>x.classList.remove(cls));el.classList.add(cls);fn&&fn(el)}));
// doctors page: search + specialty filter
const docs=[...document.querySelectorAll('.doc')];
if(docs.length){let spec='all';const q=document.getElementById('q'),cnt=document.getElementById('count');
 const run=()=>{const t=q.value.toLowerCase().trim();let n=0;docs.forEach(d=>{const ok=(spec==='all'||d.dataset.spec===spec||(spec==='more'&&d.dataset.spec==='Orthopedics'))&&d.textContent.toLowerCase().includes(t);d.hidden=!ok;if(ok)n++});cnt.textContent=n+(n===1?' doctor':' doctors')};
 const chips=[...document.querySelectorAll('.chip')];sel(chips,'on',c=>{spec=c.dataset.spec;run()});q.addEventListener('input',run);document.getElementById('find').onclick=run}
// booking page: date + time
const days=[...document.querySelectorAll('.day')];
if(days.length){const slots=[...document.querySelectorAll('.slot')];
 const upd=()=>{const d=document.querySelector('.day.on'),s=document.querySelector('.slot.on'),t={long:d.dataset.long,short:d.dataset.short,time:s.dataset.t+' – '+s.dataset.end};
  document.getElementById('sdate').textContent=t.long;document.getElementById('stime').textContent=t.time;
  try{sessionStorage.setItem('booking',JSON.stringify(t))}catch(e){}};
 sel(days,'on',upd);sel(slots,'on',upd);upd()}
// confirmed page: show chosen slot
const cd=document.getElementById('cdate');
if(cd){try{const t=JSON.parse(sessionStorage.getItem('booking'));if(t){cd.textContent=t.short;document.getElementById('ctime').textContent=t.time}}catch(e){}}
