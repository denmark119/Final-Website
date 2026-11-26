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
<div class="r"><a id="account-link" href="login.html">Sign in</a><button id="sign-out-global" class="btn light" type="button" hidden>Sign out</button></div></header></div>`;
b.prepend(app);app.querySelector('.right').appendChild(main);
app.querySelector('.menu-btn').onclick=()=>b.classList.toggle('nav-open');
main.addEventListener('click',()=>b.classList.remove('nav-open'));
const todayDate=document.getElementById('today-date');
if(todayDate)todayDate.textContent=new Intl.DateTimeFormat('en-PH',{
 weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Manila'
}).format(new Date());

const sel=(group,cls,fn)=>group.forEach(el=>el.addEventListener('click',()=>{group.forEach(x=>x.classList.remove(cls));el.classList.add(cls);fn&&fn(el)}));
// doctors page: search + specialty filter
const docs=[...document.querySelectorAll('.doc')];
if(docs.length){let spec='all';const q=document.getElementById('q'),cnt=document.getElementById('count');
 const run=()=>{const t=q.value.toLowerCase().trim();let n=0;docs.forEach(d=>{const ok=(spec==='all'||d.dataset.spec===spec||(spec==='more'&&d.dataset.spec==='Orthopedics'))&&d.textContent.toLowerCase().includes(t);d.hidden=!ok;if(ok)n++});cnt.textContent=n+(n===1?' doctor':' doctors')};
 const chips=[...document.querySelectorAll('.chip')];sel(chips,'on',c=>{spec=c.dataset.spec;run()});q.addEventListener('input',run);document.getElementById('find').onclick=run}
// booking page: date + time
const days=[...document.querySelectorAll('.day')];
if(days.length){const slots=[...document.querySelectorAll('.slot')];
 const upd=()=>{const d=document.querySelector('.day.on'),s=document.querySelector('.slot.on'),t={date:d.dataset.date,long:d.dataset.long,short:d.dataset.short,time:s.dataset.t+' – '+s.dataset.end};
  document.getElementById('sdate').textContent=t.long;document.getElementById('stime').textContent=t.time};
 sel(days,'on',upd);sel(slots,'on',upd);upd()}

const client=window.carelineSupabase&&window.carelineSupabase.client;
const accountLink=document.getElementById('account-link');
const signOutButton=document.getElementById('sign-out-global');
const renderAccount=(session)=>{
 if(!accountLink)return;
 if(session&&session.user){
  accountLink.textContent=session.user.user_metadata.full_name||session.user.email||'My account';
  accountLink.href='login.html';
  if(signOutButton)signOutButton.hidden=false;
 }else{
  accountLink.textContent='Sign in';
  accountLink.href='login.html';
  if(signOutButton)signOutButton.hidden=true;
 }
};
if(client){
 client.auth.getSession().then(({data,error})=>{
  if(error){if(accountLink)accountLink.title='Sign-in status could not be loaded: '+error.message;return}
  renderAccount(data.session);
 }).catch((error)=>{
  if(accountLink)accountLink.title='Sign-in status could not be loaded: '+error.message;
 });
 client.auth.onAuthStateChange((_event,session)=>renderAccount(session));
}
if(signOutButton&&client){
 signOutButton.addEventListener('click',async()=>{
  signOutButton.disabled=true;
  const {error}=await client.auth.signOut();
  signOutButton.disabled=false;
  if(error){alert('Could not sign out: '+error.message);return}
  window.location.href='login.html';
 });
}

const formatMoney=(amount)=>'$'+Number(amount).toFixed(2);
const formatDate=(value,options)=>new Intl.DateTimeFormat('en-PH',{
 ...options,timeZone:'Asia/Manila'
}).format(new Date(value));
const loadLoyalty=async()=>{
 const message=document.getElementById('loyalty-message');
 const row=document.getElementById('discount-row');
 if(!client)return;
 const {data:{session},error:sessionError}=await client.auth.getSession();
 if(sessionError){if(message)message.textContent='Could not check your account: '+sessionError.message;return}
 const userLabel=document.getElementById('booking-user');
 const userEmail=document.getElementById('booking-email');
 if(!session){
  if(userLabel)userLabel.textContent='Sign in to book an appointment';
  if(userEmail)userEmail.innerHTML='<a class="tealtx" href="login.html?next=book.html">Sign in or create an account</a> to save this appointment.';
  if(message)message.textContent='Sign in to check your loyalty reward.';
  return;
 }
 const patientName=session.user.user_metadata.full_name||session.user.email||'Patient';
 if(userLabel)userLabel.textContent=patientName;
 if(userEmail)userEmail.textContent=session.user.email||'';
 const {data,error}=await client.rpc('get_my_loyalty_status');
 if(error){if(message)message.textContent='Could not load loyalty details: '+error.message;return}
 const status=Array.isArray(data)?data[0]:data;
 if(!status){if(message)message.textContent='Your patient profile is not ready yet. Please try again shortly.';return}
 const discount=Number(status.discount_percent)||0;
 const joinedAt=new Date(status.joined_at);
 const today=new Date();
 let memberMonths=(today.getFullYear()-joinedAt.getFullYear())*12+today.getMonth()-joinedAt.getMonth();
 if(today.getDate()<joinedAt.getDate())memberMonths--;
 memberMonths=Math.max(0,memberMonths);
 if(row&&discount>0){
  row.hidden=false;
  document.getElementById('discount-label').textContent='Loyalty discount ('+discount+'%)';
  document.getElementById('discount-amount').textContent='−'+formatMoney(60*discount/100);
  document.getElementById('estimated-total').textContent=formatMoney(60*(1-discount/100));
 }
 if(message){
  const visits=Number(status.completed_appointments)||0;
  if(discount>=15)message.textContent='Top loyalty reward active: 15% off eligible consultations.';
  else if(discount>=10)message.textContent='10% loyalty reward active. Complete '+Math.max(0,10-visits)+' more appointment(s) and reach 12 months of membership for 15%.';
  else message.textContent='Your progress: '+memberMonths+' month(s) as a member and '+visits+' completed appointment(s). The first reward requires 6 months and 5 completed visits.';
 }
 const rewardsCard=document.getElementById('loyalty-card');
 if(rewardsCard){
  rewardsCard.hidden=false;
  document.getElementById('rewards-count').textContent=String(status.completed_appointments);
  document.getElementById('rewards-discount').textContent=discount+'%';
  document.getElementById('rewards-tier').textContent=discount>=15?'15% tier':discount>=10?'10% tier':'Standard member';
  document.getElementById('rewards-progress').textContent=discount>=15
   ?'Your highest loyalty reward is active.'
   :discount>=10
    ?'Your next reward needs 12 months of membership and 10 completed appointments.'
    :'Your progress: '+memberMonths+' membership month(s) and '+visits+' completed visit(s). The first reward needs both 6 months and 5 completed visits.';
 }
};
if(document.getElementById('loyalty-card'))loadLoyalty().catch((error)=>{
 const progress=document.getElementById('rewards-progress');
 if(progress)progress.textContent='Could not load loyalty details: '+error.message;
});

const confirmButton=document.getElementById('confirm-booking');
if(confirmButton){
 const message=document.getElementById('booking-error');
 confirmButton.addEventListener('click',async()=>{
  if(!client){message.textContent='Supabase is not configured. Follow the setup steps in README.md before booking.';return}
  confirmButton.disabled=true;
  message.textContent='';
  try{
   const {data:{session},error:sessionError}=await client.auth.getSession();
   if(sessionError)throw sessionError;
   if(!session){window.location.href='login.html?next=book.html';return}
   const selectedDay=document.querySelector('.day.on');
   const selectedSlot=document.querySelector('.slot.on');
   const match=selectedSlot.dataset.t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
   if(!match)throw new Error('Choose a valid appointment time.');
   let hour=Number(match[1])%12;
   if(match[3].toUpperCase()==='PM')hour+=12;
   const startsAt=new Date(selectedDay.dataset.date+'T'+String(hour).padStart(2,'0')+':'+match[2]+':00+08:00');
   const {data,error}=await client.from('appointments').insert({
    doctor_name:'Dr. Sofia Reyes',
    specialty:'Cardiology',
    starts_at:startsAt.toISOString(),
    reason:document.getElementById('reason').value.trim()||null
   }).select('id').single();
   if(error)throw error;
   window.location.href='confirmed.html?appointment='+encodeURIComponent(data.id);
  }catch(error){
   message.textContent='Could not save your appointment: '+error.message;
   confirmButton.disabled=false;
  }
 });
 loadLoyalty().catch((error)=>{
  const loyaltyMessage=document.getElementById('loyalty-message');
  if(loyaltyMessage)loyaltyMessage.textContent='Could not load loyalty details: '+error.message;
 });
}

const appointmentList=document.getElementById('appointment-list');
if(appointmentList){
 const showMessage=(text,linkText,href)=>{
  appointmentList.replaceChildren();
  const p=document.createElement('p');p.className='mut';p.textContent=text;appointmentList.appendChild(p);
  if(linkText){const a=document.createElement('a');a.className='btn light';a.href=href;a.textContent=linkText;appointmentList.appendChild(a)}
 };
 const renderAppointments=async()=>{
  if(!client){showMessage('Connect Supabase to load your saved appointments.','Sign-in setup','login.html');return}
  const {data:{session},error:sessionError}=await client.auth.getSession();
  if(sessionError){showMessage('Could not check your sign-in status: '+sessionError.message);return}
  if(!session){showMessage('Sign in to view your saved appointments.','Sign in','login.html?next='+encodeURIComponent(location.pathname.split('/').pop()));return}
  const {data,error}=await client.from('appointments')
   .select('id,doctor_name,specialty,starts_at,status,consultation_fee,discount_percent,amount_due')
   .order('starts_at',{ascending:appointmentList.dataset.filter==='upcoming'});
  if(error){showMessage('Could not load appointments: '+error.message);return}
  const items=(data||[]).filter((item)=>{
   if(appointmentList.dataset.filter==='history')return item.status==='completed';
   return item.status!=='completed'&&item.status!=='cancelled'&&new Date(item.starts_at)>=new Date();
  });
  appointmentList.replaceChildren();
  if(!items.length){showMessage(appointmentList.dataset.filter==='history'?'No completed appointments yet.':'No upcoming appointments.');return}
  items.forEach((item)=>{
   const article=document.createElement('article');article.className='card appt';
   const tile=document.createElement('div');tile.className='tile';
   const month=document.createElement('small');month.textContent=formatDate(item.starts_at,{month:'short'});
   const day=document.createElement('b');day.textContent=formatDate(item.starts_at,{day:'2-digit'});
   tile.append(month,day);
   const body=document.createElement('div');body.className='body';
   const doctor=document.createElement('h3');doctor.textContent=item.doctor_name;
   const specialty=document.createElement('p');specialty.className='mut';specialty.textContent=item.specialty;
   const visit=document.createElement('p');visit.textContent=formatDate(item.starts_at,{weekday:'short',day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'});
   const cost=document.createElement('p');cost.className='mut sm';cost.textContent='Total: '+formatMoney(item.amount_due)+' · Loyalty discount: '+Number(item.discount_percent)+'%';
   body.append(doctor,specialty,visit,cost);
   const badge=document.createElement('span');badge.className='pill badge';badge.textContent=item.status;
   article.append(tile,body,badge);
   if(appointmentList.dataset.filter==='upcoming'){
    const link=document.createElement('a');link.className='btn light';link.href='confirmed.html?appointment='+encodeURIComponent(item.id);link.textContent='View appointment';body.appendChild(link);
   }
   appointmentList.appendChild(article);
  });
 };
 renderAppointments().catch((error)=>showMessage('Could not load appointments: '+error.message));
}

const confirmedCard=document.getElementById('confirmed-card');
if(confirmedCard&&client){
 const status=document.getElementById('confirmation-message');
 const loadConfirmation=async()=>{
  const appointmentId=new URLSearchParams(location.search).get('appointment');
  if(!appointmentId){status.textContent='No saved appointment was selected.';return}
  const {data:{session},error:sessionError}=await client.auth.getSession();
  if(sessionError){status.textContent='Could not check your sign-in status: '+sessionError.message;return}
  if(!session){status.textContent='Sign in to view this appointment.';return}
  const {data,error}=await client.from('appointments')
   .select('id,doctor_name,specialty,starts_at,status,discount_percent,amount_due')
   .eq('id',appointmentId).single();
  if(error){status.textContent='Could not load your appointment: '+error.message;return}
  document.getElementById('booking-reference').textContent=data.id.slice(0,8).toUpperCase();
  document.getElementById('confirmed-doctor').textContent=data.doctor_name;
  document.getElementById('confirmed-specialty').textContent=data.specialty+' · In-person consultation';
  document.getElementById('cdate').textContent=formatDate(data.starts_at,{weekday:'short',day:'numeric',month:'short',year:'numeric'});
  document.getElementById('ctime').textContent=formatDate(data.starts_at,{hour:'numeric',minute:'2-digit'})+' · Hospital time (GMT+8)';
  document.getElementById('confirmed-patient').textContent=session.user.user_metadata.full_name||session.user.email||'Patient';
  document.getElementById('confirmed-email').textContent=session.user.email||'';
  document.getElementById('confirmed-price').textContent='Total due: '+formatMoney(data.amount_due)+' · Loyalty discount: '+Number(data.discount_percent)+'%.';
  status.hidden=true;
  confirmedCard.hidden=false;
 };
 loadConfirmation().catch((error)=>{status.textContent='Could not load your appointment: '+error.message});
}else if(confirmedCard){
 document.getElementById('confirmation-message').textContent='Connect Supabase before loading saved appointments. See README.md for setup.';
}
