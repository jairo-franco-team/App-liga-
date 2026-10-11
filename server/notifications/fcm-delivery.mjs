/* Liga Juventino Rosas · transporte FCM HTTP v1, inactivo hasta conexión
 * autorizada con el servidor y credenciales privadas en Railway.
 * Nunca añadir un endpoint público para enviar a tokens suministrados por visitantes.
 * La aprobación real siempre se consulta en PostgreSQL antes de invocar sendApproved.
 */
import {createSign} from 'node:crypto';

const TOKEN_URI='https://oauth2.googleapis.com/token';
const SCOPE='https://www.googleapis.com/auth/firebase.messaging';
const PROJECT=/^[a-z][a-z0-9-]{2,80}$/;
const DEVICE_TOKEN=/^[A-Za-z0-9:_-]{32,4096}$/;
const NOTICE_ID=/^[a-f0-9-]{16,72}$/i;
const base64url=value=>Buffer.from(value).toString('base64url');

export function validateFcmServerAccount(value){
 const account=typeof value==='string'?JSON.parse(value):value;
 if(!account||typeof account!=='object'||Array.isArray(account)||
    account.type!=='service_account'||
    !PROJECT.test(String(account.project_id||''))||
    !/^[A-Za-z0-9_.+-]+@[a-z0-9-]+\.iam\.gserviceaccount\.com$/.test(String(account.client_email||''))||
    typeof account.private_key!=='string'||
    !account.private_key.includes('-----BEGIN PRIVATE KEY-----')||
    !account.private_key.includes('-----END PRIVATE KEY-----')||
    account.token_uri!==TOKEN_URI)
   throw new Error('Credenciales privadas FCM no válidas o incompletas');
 return {projectId:account.project_id,email:account.client_email,privateKey:account.private_key};
}

function approvedNotice(notice){
 if(!notice||typeof notice!=='object'||!NOTICE_ID.test(String(notice.id||''))||
   !['queued','processing'].includes(notice.status)||
   typeof notice.approved_by!=='string'||!notice.approved_by.trim()||
   !notice.approved_at||!Number.isFinite(Date.parse(String(notice.approved_at)))||
   typeof notice.title!=='string'||!notice.title.trim()||notice.title.length>120||
   typeof notice.body!=='string'||!notice.body.trim()||notice.body.length>700)
   throw new Error('Se requiere un aviso válido con aprobación registrada en PostgreSQL');
 return notice;
}

export function buildFcmApprovedMessage({notice,token,approvalVerified}){
 // approvalVerified solo puede venir de una consulta privada que compruebe los
 // permisos y la revisión; NO convertir esto en una bandera recibida del cliente.
 if(approvalVerified!==true)throw new Error('No se verificó autorización oficial');
 const n=approvedNotice(notice);
 if(typeof token!=='string'||!DEVICE_TOKEN.test(token))
  throw new Error('Token de dispositivo inválido');
 return {message:{
   token,
   notification:{title:n.title,body:n.body},
   data:{route:'notifications',noticeId:String(n.id),type:'official'},
   android:{priority:'HIGH',notification:{channel_id:'liga_partidos'}}
 }};
}

export function createFcmTransport({serviceAccount,fetchImpl=fetch,now=()=>Date.now()}){
 const credentials=validateFcmServerAccount(serviceAccount);
 if(typeof fetchImpl!=='function')throw new Error('Cliente HTTPS no disponible');
 let cached=null,expires=0,pending=null;
 async function getAccessToken(){
  if(cached&&expires-now()>90000)return cached;
  if(pending)return pending;
  pending=(async()=>{
   const ts=Math.floor(now()/1000);
   const header=base64url(JSON.stringify({alg:'RS256',typ:'JWT'}));
   const claim=base64url(JSON.stringify({iss:credentials.email,scope:SCOPE,
    aud:TOKEN_URI,iat:ts,exp:ts+3600}));
   const signingInput=header+'.'+claim;
   const signer=createSign('RSA-SHA256');
   signer.update(signingInput);signer.end();
   const assertion=signingInput+'.'+signer.sign(credentials.privateKey).toString('base64url');
   const response=await fetchImpl(TOKEN_URI,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}).toString(),
    signal:AbortSignal.timeout(12000),redirect:'error'});
   if(!response.ok)throw new Error('Autenticación privada FCM falló (HTTP '+response.status+')');
   const result=await response.json();
   if(typeof result.access_token!=='string'||result.access_token.length<20||
      !Number.isFinite(Number(result.expires_in))||Number(result.expires_in)<120)
     throw new Error('OAuth FCM devolvió una respuesta inválida');
   cached=result.access_token;expires=now()+Math.min(3600,Number(result.expires_in))*1000;
   return cached;
  })();
  try{return await pending}finally{pending=null}
 }
 return Object.freeze({
  // Solo apto para invocación desde el despachador privado tras consultar DB
  // y verificar consentimiento, categoría y propietario del token.
  async sendApproved({notice,token,approvalVerified,subscriptionVerified}){
   // El servidor debe comprobar una suscripción FCM activa del propietario.
   // Nunca obtener esta bandera de req.body o del navegador.
   if(subscriptionVerified!==true)throw new Error('No se verificó consentimiento del dispositivo');
   const payload=buildFcmApprovedMessage({notice,token,approvalVerified});
   const bearer=await getAccessToken();
   const url='https://fcm.googleapis.com/v1/projects/'+credentials.projectId+'/messages:send';
   const response=await fetchImpl(url,{method:'POST',
    headers:{Authorization:'Bearer '+bearer,'Content-Type':'application/json; charset=utf-8'},
    body:JSON.stringify(payload),signal:AbortSignal.timeout(12000),redirect:'error'});
   if(!response.ok){
    // La respuesta de Firebase puede mencionar el token: no incluir body o URLs.
    const error=new Error('FCM rechazó el envío privado (HTTP '+response.status+')');
    error.status=response.status;
    throw error;
   }
   return {accepted:true}; // Firebase aceptó, NO es prueba de recepción Android.
  }
 });
}
