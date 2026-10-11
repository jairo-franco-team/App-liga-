/* V1455 · Cuenta compacta inspirada en las referencias Mi UEFA.
 * Solo monta navegación visual; autenticación y handlers existentes no cambian. */
(()=>{
 'use strict';
 if(window.__LJR_ACCOUNT_COMPACT_1455__)return;
 window.__LJR_ACCOUNT_COMPACT_1455__=true;
 const routes=new Set([
   'accountEdit','accountSecurity','accountPassword','accountDevices',
   'accountPrivacy','accountPreferences','accountAdvisor','accountCloud'
 ]);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const route=()=>{
   const hash=String(location.hash||'');
   return (hash.startsWith('#/')?hash.slice(2):hash.replace('#','')).split('?')[0]||
     document.body?.dataset?.appRoute||'';
 };
 const links=[
  ['accountEdit','Tus datos personales'],
  ['following','Tus equipos'],
  ['accountPreferences','Tus preferencias'],
  ['accountPrivacy','Tu privacidad'],
  ['accountPassword','Email y contraseña'],
  ['fantasy','Tus ventajas'],
  ['accountSecurity','Seguridad y biometría'],
  ['accountDevices','Dispositivos']
 ];
 function name(){
   try{
     const a=window.LJR_V569_AUTH?.currentAccount?.();
     return String(a?.name||'').trim().split(/\s+/)[0]||'aficionado';
   }catch(_){return 'aficionado'}
 }
 function nav(active){
  const aside=document.createElement('aside');
  aside.className='ljr-uefa-side';
  aside.dataset.ljrAccountNav='';
  aside.setAttribute('aria-label','Navegación de Mi cuenta');
  aside.innerHTML='<div class="ljr-uefa-brand">MI <b>LIGA</b></div>'+
  '<p class="ljr-uefa-welcome">Hola, <b>'+esc(name())+'</b><span>haz tuya la Liga</span></p>'+
  '<nav class="ljr-uefa-nav" aria-label="Apartados de cuenta">'+
    links.map(([id,label])=>'<button type="button" data-v569-route="'+id+'"'+
      (active===id?' aria-current="page" class="active"':'')+'>'+esc(label)+'</button>').join('')+
  '</nav><button type="button" class="ljr-uefa-return" data-v569-route="profile">← Volver a mi perfil</button>';
  return aside;
 }
 function desktopOnly(){
  const mode=new URLSearchParams(location.search).get('mode');
  return mode==='desktop'||(!['mobile','apk'].includes(mode)&&window.innerWidth>=1024);
 }
 function mount(){
  if(!desktopOnly()){
    // Keep the original account node and its handlers when switching to mobile.
    for(const shell of document.querySelectorAll?.('#screen .ljr-uefa-layout')||[]){
      const page=shell.querySelector('.v569-page');
      if(page)shell.replaceWith(page);else shell.remove();
    }
    document.querySelector('#screen .ljr-uefa-guest')?.classList.remove('ljr-uefa-guest');
    return;
  }
  const r=route();
  if(r==='accountLogin'||r==='accountRegister'){
    document.querySelector('#screen .v569-page[data-v569-page]')?.classList.add('ljr-uefa-guest');
    return;
  }
  if(!routes.has(r))return;
  const page=document.querySelector('#screen .v569-page[data-v569-page]');
  if(!page||page.dataset.v569Page==='login'||page.dataset.v569Page==='register')return;
  let shell=page.closest('.ljr-uefa-layout');
  if(!shell){
    shell=document.createElement('div');
    shell.className='ljr-uefa-layout';
    page.parentNode.insertBefore(shell,page);
    shell.appendChild(nav(r));
    shell.appendChild(page);
  }else{
    const side=shell.querySelector('[data-ljr-account-nav]');
    if(side){
      for(const btn of side.querySelectorAll('[data-v569-route]')){
        const active=btn.dataset.v569Route===r;
        btn.classList.toggle('active',active);
        if(active)btn.setAttribute('aria-current','page');
        else btn.removeAttribute('aria-current');
      }
    }
  }
 }
 let pending=false;
 function schedule(){
  if(pending)return;pending=true;
  requestAnimationFrame(()=>{pending=false;mount()});
 }
 function start(){
  const screen=document.getElementById('screen');
  if(screen)new MutationObserver(schedule).observe(screen,{childList:true,subtree:false});
  window.addEventListener('hashchange',()=>{schedule();setTimeout(schedule,120)});
  window.addEventListener('ljr:profile-updated',schedule);
  window.addEventListener('resize',schedule);
  schedule();setTimeout(schedule,450);setTimeout(schedule,1400);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();