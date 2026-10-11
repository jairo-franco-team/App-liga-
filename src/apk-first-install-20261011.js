import {Capacitor,registerPlugin} from '@capacitor/core';
import {STEPS,INSTALL_KEY,readStore,shouldStart,resumeStep,saveConsent,saveNotificationPrefs,saveFollowed,devicePermission} from './apk-first-install-state-20261011.js';
import catalog from './onboarding-team-catalog-20261011.json';
/* First installation only. Android's installation dates protect upgrades;
   existing authenticated profile is never replaced or forced through this flow. */
const bridge=registerPlugin('LigaNotifications');
const native=()=>Capacitor.isNativePlatform();
const state=()=>window.LJR_MAIN_ROUTE?.state;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normal=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const LEAGUE='./assets/reference/predictor-v36/liga-crest-white.webp';
let appInert=false,checkInFlight=null;
const notificationRoute=()=>/^#\/(notifications|accountPreferences)(?:\?|$)/.test(String(location.hash));
let overlay=null,step='privacy',selected=new Set(),search='',configuring=false,busy=false,lastPermission=null,focusBefore=null;
let saved=readStore(localStorage,INSTALL_KEY);
function persist(patch){saved={...saved,...patch};localStorage.setItem(INSTALL_KEY,JSON.stringify(saved))}
function statusMessage(result){
 if(result.state==='error')return 'No se pudo consultar el permiso: '+result.message;
 if(result.state==='unsupported')return 'Este navegador no admite notificaciones. Puedes leer los avisos en la app.';
 if(result.granted)return result.native?'Permiso de Android concedido para avisos locales. Las preferencias se guardan en este dispositivo.':'Permiso del navegador concedido. Activa Web Push en el panel de la Liga para registrar este dispositivo.';
 if(result.state==='blocked'||result.state==='denied')return 'Notificaciones bloqueadas o no autorizadas. Puedes seguir usando la app y cambiarlas desde los permisos del dispositivo.';
 return 'Activa el permiso para recibir avisos. Puedes continuar sin notificaciones.';
}
function updateDevice(result){
 lastPermission=result;
 document.querySelectorAll('[data-v46-device-copy],[data-v414-device-copy],[data-install-device-status],[data-v1300-permission]').forEach(el=>{if(el.textContent!==statusMessage(result))el.textContent=statusMessage(result)});
 document.querySelectorAll('[data-v46-device],[data-v414-device],[data-v1300-permission-request]').forEach(button=>{
  const label=result.granted?'Permiso concedido':result.state==='blocked'||result.state==='denied'?'Configuración del dispositivo':'Activar notificaciones';
  if(button.textContent!==label)button.textContent=label;
  if(native())button.disabled=false;
  button.dataset.installPermission=result.state;
 });
}
async function permission(request=false){
 if(!request&&checkInFlight)return checkInFlight;
 const task=readPermission(request);
 if(!request){checkInFlight=task;task.finally(()=>{checkInFlight=null})}
 return task;
}
async function readPermission(request=false){
 const result=await devicePermission({native:native(),bridge,notification:window.Notification,request});
 if(native()||request)localStorage.setItem('ljr-native-notifications-v840',JSON.stringify({granted:result.granted,state:result.state,at:Date.now()}));
 if(request&&result.granted)saveNotificationPrefs(localStorage,state(),{enabled:true});
 const changed=lastPermission?.state!==result.state||lastPermission?.granted!==result.granted;
 updateDevice(result);
 if(native()&&changed)window.LJR_V840_NOTIFICATIONS?.render?.();
 return result;
}
async function recordCompletion(result){
 persist({completed:true,step:'complete',permission:result,at:Date.now()});
 if(native()){
  try{const answer=await bridge.completeOnboarding();if(answer?.completed!==true)throw Error('Android no confirmó el guardado.');persist({nativeCompleted:true})}
  catch(error){persist({nativeCompleted:false});console.warn('[Liga onboarding] Finalización conservada en este dispositivo; Android no confirmó el guardado.');}
 }
}
async function finish(result='skipped'){
 await recordCompletion(result);
 overlay?.remove();overlay=null;
 document.body.classList.remove('ljr-install-open');
 const app=document.querySelector('#app');if(app)app.inert=appInert;
 focusBefore?.focus?.();
 window.dispatchEvent(new CustomEvent('ljr:onboarding-complete',{detail:{permission:result}}));
}
function button(label,action,outline=false){return '<button type="button" class="ljr-install-button'+(outline?' outline':'')+'" data-install-action="'+action+'">'+label+'</button>'}
function teamMarkup(){
 const visible=catalog.filter(t=>normal(t.name).includes(normal(search)));
 return visible.map(t=>'<button type="button" class="ljr-install-team" data-install-team="'+esc(t.name)+'" aria-pressed="'+selected.has(t.name)+'">'+(t.logo?'<img loading="lazy" decoding="async" src="'+esc(t.logo)+'" alt="">':'<span class="ljr-install-initial" aria-hidden="true">'+esc(t.name.slice(0,2))+'</span>')+'<strong>'+esc(t.name)+'</strong><span class="ljr-install-team-check" aria-hidden="true">'+(selected.has(t.name)?'✓':'')+'</span></button>').join('')||'<p>No hay equipos con ese nombre.</p>';
}
function render(){
 if(!overlay)return;
 overlay.dataset.step=step;
 const brand='<div class="ljr-install-brand"><img src="'+LEAGUE+'" alt="Liga Juventino Rosas"><span>LIGA JUVENTINO ROSAS</span></div>';
 const skip=step==='teams'||step==='notifications'?'<button class="ljr-install-skip" data-install-action="skip" type="button">Saltar</button>':'';
 let content='';
 if(step==='privacy')content=brand+'<div class="ljr-install-bottom"><h1 id="ljr-install-title">Valoramos tu privacidad</h1><p>Elige cómo personalizar tu experiencia. Tus preferencias se guardan en este dispositivo.</p>'+button('Empezar','start')+'</div>';
 if(step==='consent')content=brand+'<div class="ljr-install-consent"><h1 id="ljr-install-title">Consentimiento para cookies y datos</h1><div class="ljr-install-consent-copy"><p>Usamos almacenamiento local para conservar tus ajustes, equipos seguidos y juegos. El almacenamiento esencial permite que la aplicación funcione.</p><p>La personalización con tus equipos es opcional. Puedes rechazarla y seguir usando la Liga. Esta elección no activa analítica ni autoriza nuevos servicios externos.</p><p>Puedes cambiar tus ajustes de privacidad desde tu perfil.</p></div>'+(configuring?'<label class="ljr-install-consent-toggle">Personalización con mis equipos<input type="checkbox" data-install-personalization '+(readStore(localStorage,'lj-store-v3').privacy?.personalization===true?'checked':'')+'></label>'+button('Guardar selección','consent-selected'):button('Aceptar todo','consent-accept')+button('Rechazar todo','consent-reject')+button('Configuraciones','configure',true))+'<div class="ljr-install-legal">'+button('Más información','privacy-info',true)+button('Términos y condiciones','terms-info',true)+'</div></div>';
 if(step==='teams')content=skip+'<div class="ljr-install-team-intro"><h1 id="ljr-install-title">Elige los equipos que quieres seguir</h1><p>Accede más rápido a las noticias y próximos partidos de la Liga.</p><input class="ljr-install-search" type="search" placeholder="Buscar equipos" aria-label="Buscar equipos" data-install-search value="'+esc(search)+'"><h2>Equipos en la competición</h2><small>Temporada 2026 · '+catalog.length+' clubes de la Liga</small></div><div class="ljr-install-team-grid">'+teamMarkup()+'</div><div class="ljr-install-team-footer">'+button('Continuar'+(selected.size?' · '+selected.size:''),'teams-next')+'</div>';
 if(step==='notifications')content=skip+'<div class="ljr-install-phone" aria-hidden="true"><div class="ljr-install-phone-cards"><div><b><img src="'+LEAGUE+'" alt="">Liga Juventino Rosas</b><strong>Avisos de tus equipos</strong><span>Consulta partidos y resultados de la Liga.</span></div><div><b><img src="'+LEAGUE+'" alt="">Liga Juventino Rosas</b><strong>Tu Liga, a tu ritmo</strong><span>Elige los avisos que quieres recibir.</span></div></div></div><div class="ljr-install-bottom"><h1 id="ljr-install-title">Sé el primero en saberlo</h1><p>Recibe avisos de goles y resultados mientras usas la app. Ajústalos o desactívalos cuando quieras.</p><p class="ljr-install-status" data-install-status aria-live="polite">'+(lastPermission?esc(statusMessage(lastPermission)):'Activa el permiso de Android o continúa sin notificaciones.')+'</p>'+button(saved.completed?'Continuar':'Activar notificaciones',saved.completed?'finish':'activate')+'</div>';
 overlay.innerHTML='<div class="ljr-install-page">'+content+'</div>';
 overlay.querySelector('h1')?.setAttribute('tabindex','-1');overlay.querySelector('h1')?.focus({preventScroll:true});
}
function advance(next){step=next;persist({step:next});render();overlay?.scrollTo?.({top:0})}
function openPreferences(){
 const panel=document.querySelector('.v46-ref-notifications-main')||document.querySelector('[data-v46-account="notifications"]')||document.querySelector('[data-v1082-push]');
 if(!panel)return false;
 panel.scrollIntoView({behavior:'auto',block:'start'});
 panel.querySelector('[data-v46-notif],[data-v1082-category],button,input')?.focus?.({preventScroll:true});
 return true;
}
async function handleAction(action){
 if(busy)return;
 if(action==='start')return advance('consent');
 if(action==='configure'){configuring=true;return render()}
 if(action.startsWith('consent-')){
  const personalization=action==='consent-accept'||action==='consent-selected'&&overlay.querySelector('[data-install-personalization]')?.checked===true;
  saveConsent(localStorage,state(),{personalization});return advance('teams');
 }
 if(action==='teams-next'){
  const ids=catalog.filter(t=>selected.has(t.name)).flatMap(t=>t.ids);
  saveFollowed(localStorage,state(),ids);return advance('notifications');
 }
 if(action==='skip')return step==='teams'?advance('notifications'):finish('skipped');
 if(action==='finish')return finish(saved.permission||'skipped');
 if(action==='activate'){
  busy=true;const b=overlay.querySelector('[data-install-action="activate"]');if(b)b.disabled=true;
  try{const result=await permission(true);await recordCompletion(result.state);render()}finally{busy=false}
 }
 if(action==='privacy-info'||action==='terms-info'){
  const box=overlay.querySelector('.ljr-install-consent-copy');
  if(box)box.innerHTML=action==='privacy-info'?'<h2>Privacidad de la Liga</h2><p>Esta elección se guarda en este dispositivo. Los datos que publiques o envíes en las funciones de la Liga siguen sus propios controles. No se comparte tu selección con nuevos proveedores.</p><p>La personalización usa tus equipos seguidos. Puedes desactivarla en Ajustes de privacidad de tu perfil.</p>':'<h2>Términos de uso</h2><p>El calendario, resultados y avisos oficiales de la Liga son publicados por sus responsables. Los juegos y preferencias locales no modifican los datos oficiales.</p><p>El permiso de Android puede revocarse en los ajustes del dispositivo. Conceder permiso no confirma la entrega de avisos remotos con la APK cerrada.</p>';
 }
}
window.addEventListener('click',event=>{
 const action=event.target?.closest?.('[data-install-action]');
 if(action){event.preventDefault();event.stopImmediatePropagation();handleAction(action.dataset.installAction);return}
 const team=event.target?.closest?.('[data-install-team]');
 if(team){event.preventDefault();event.stopImmediatePropagation();const name=team.dataset.installTeam;selected.has(name)?selected.delete(name):selected.add(name);persist({selected:[...selected]});team.setAttribute('aria-pressed',String(selected.has(name)));team.querySelector('.ljr-install-team-check').textContent=selected.has(name)?'✓':'';const next=overlay?.querySelector('[data-install-action="teams-next"]');if(next)next.textContent='Continuar'+(selected.size?' · '+selected.size:'');return}
 const current=event.target?.closest?.('#v105-bottom[data-v105-route="notifications"] .v105-card[data-v105-route="notifications"]');
 if(current){event.preventDefault();event.stopImmediatePropagation();openPreferences();return}
 const device=event.target?.closest?.('[data-v46-device],[data-v414-device],[data-v1300-permission-request]');
 if(device){event.preventDefault();event.stopImmediatePropagation();
  if(native()&&['blocked','denied'].includes(device.dataset.installPermission))bridge.openNotificationSettings().catch(()=>updateDevice({state:'error',granted:false,message:'Abre los ajustes de notificaciones de Android.'}));
  else permission(true);
 }
},true);
window.addEventListener('input',event=>{
 if(!event.target?.matches?.('[data-install-search]'))return;
 search=event.target.value;const grid=overlay?.querySelector('.ljr-install-team-grid');if(grid)grid.innerHTML=teamMarkup();
});
window.addEventListener('change',event=>{
 const input=event.target;if(!input?.matches?.('[data-v46-notif]'))return;
 // Both existing native delivery and main save() read these keys. Save once.
 event.stopImmediatePropagation();const patch={[input.dataset.v46Notif]:input.checked};
 if(input.dataset.v46Notif==='enabled')document.querySelectorAll('[data-v46-notif]').forEach(other=>{if(!['sounds','vibration','dnd'].includes(other.dataset.v46Notif)){other.checked=input.checked;patch[other.dataset.v46Notif]=input.checked}});
 saveNotificationPrefs(localStorage,state(),patch);
 const note=document.querySelector('[data-v46-device-copy]');if(note)note.textContent='Preferencias guardadas en este dispositivo. '+(lastPermission?statusMessage(lastPermission):'El permiso se consulta por separado.');
});
async function boot(){
 if(native()){
  try{
   const install=await bridge.getInstallationState();
   const existingUser=!!(readStore(localStorage,'lj-store-v3').user||state()?.user||window.LJR_V569_AUTH?.currentAccount?.());
   if(shouldStart({native:true,install,saved,existingUser})){
    step=resumeStep(saved);selected=new Set(saved.selected||[]);focusBefore=document.activeElement;
    overlay=document.createElement('section');overlay.id='ljr-install-onboarding';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','ljr-install-title');
    const app=document.querySelector('#app');if(app){appInert=!!app.inert;app.inert=true}
    document.body.append(overlay);document.body.classList.add('ljr-install-open');render();
   }
  }catch(error){console.warn('[Liga onboarding] No se pudo comprobar la primera instalación de Android. Se conserva la pantalla actual.');}
 }
 if(notificationRoute())permission(false);
 const screen=document.querySelector('#screen');
 if(screen)new MutationObserver(records=>{
  if(!notificationRoute())return;
  const controls='[data-v46-device],[data-v414-device],[data-v1300-permission-request]';
  // Ignore our own text updates and feed-only insertions; inspect new controls only.
  const relevant=records.some(record=>Array.from(record.addedNodes).some(node=>node.nodeType===1&&(node.matches?.(controls)||node.querySelector?.(controls))));
  if(!relevant)return;
  if(lastPermission)updateDevice(lastPermission);else permission(false);
 }).observe(screen,{childList:true,subtree:true});
}
window.addEventListener('hashchange',()=>{if(notificationRoute())permission(false)});
window.addEventListener('focus',()=>{if(notificationRoute())permission(false)});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&notificationRoute())permission(false)});
window.LJR_INSTALL_ONBOARDING={openSettings:()=>bridge.openNotificationSettings(),requestPermission:()=>permission(true),checkPermission:()=>permission(false),openPreferences,finish};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
