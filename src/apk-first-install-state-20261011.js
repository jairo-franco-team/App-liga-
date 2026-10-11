/* APK onboarding state and existing Liga preference stores. No account replacement. */
export const STEPS=['privacy','consent','teams','notifications'];
export const INSTALL_KEY='ljr-apk-first-install-20261011';
export function readStore(storage,key,fallback={}){try{return JSON.parse(storage.getItem(key)||'null')??fallback}catch{return fallback}}
export function shouldStart({native,install={},saved={},existingUser=false}){
 return native===true&&install.firstInstall===true&&!install.completed&&!saved.completed&&!existingUser;
}
export function resumeStep(saved){return STEPS.includes(saved?.step)?saved.step:STEPS[0]}
export function saveConsent(storage,state,choice){
 // This flow offers personalisation only. It does not enable analytics/providers.
 const privacy={essential:true,analytics:false,personalization:choice.personalization===true,accepted:true};
 const store=readStore(storage,'lj-store-v3');storage.setItem('lj-store-v3',JSON.stringify({...store,privacy}));
 const v5=readStore(storage,'lj-store-v5');storage.setItem('lj-store-v5',JSON.stringify({...v5,consent:{...privacy,accepted:true}}));
 if(state)state.privacy=privacy;
 return privacy;
}
export function saveNotificationPrefs(storage,state,patch){
 const store=readStore(storage,'lj-store-v3');
 const next={...store.notifications,...readStore(storage,'lj-account-notifications-v46'),...patch};
 storage.setItem('lj-account-notifications-v46',JSON.stringify(next));
 storage.setItem('lj-store-v3',JSON.stringify({...store,notifications:{...store.notifications,...next}}));
 if(state)state.notifications={...state.notifications,...next};
 return next;
}
export function saveFollowed(storage,state,ids){
 const store=readStore(storage,'lj-store-v3');
 const followed=[...new Set([...(Array.isArray(store.followed)?store.followed:[]),...ids])];
 storage.setItem('lj-store-v3',JSON.stringify({...store,followed}));
 if(state)state.followed=followed;
 return followed;
}
export async function devicePermission({native,bridge,notification,request=false}){
 try{
  if(native){
   const result=await (request?bridge.requestPermission():bridge.checkPermission());
   return {granted:result?.granted===true,state:result?.granted===true?'granted':result?.blocked?'blocked':result?.state==='denied'?'denied':request?'denied':'default',native:true};
  }
  if(!notification)return {granted:false,state:'unsupported',native:false};
  let permission=notification.permission;
  if(request&&permission==='default')permission=await notification.requestPermission();
  return {granted:permission==='granted',state:permission||'default',native:false};
 }catch(error){return {granted:false,state:'error',native:!!native,message:String(error?.message||'No se pudo comprobar el permiso.')}}
}
