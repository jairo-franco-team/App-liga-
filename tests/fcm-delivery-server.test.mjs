import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,randomUUID,verify} from 'node:crypto';
import {buildFcmApprovedMessage,createFcmTransport,validateFcmServerAccount} from '../server/notifications/fcm-delivery.mjs';

const {privateKey}=generateKeyPairSync('rsa',{modulusLength:2048,
 publicKeyEncoding:{type:'spki',format:'pem'},
 privateKeyEncoding:{type:'pkcs8',format:'pem'}});
const account={type:'service_account',project_id:'liga-jr-pruebas',
 client_email:'sender@liga-jr-pruebas.iam.gserviceaccount.com',
 token_uri:'https://oauth2.googleapis.com/token',private_key:privateKey};
const deviceToken='fcm_synthetic_token_for_unit_tests_ABC123456789';
const notice=()=>({id:randomUUID(),status:'processing',approved_by:'presidencia-test',
 approved_at:'2026-10-10T19:00:00Z',title:'Prueba privada de Liga',
 body:'Solo datos sintéticos; no publicar'});

test('FCM requiere servicio privado exacto y no acepta credenciales incompletas',()=>{
 const clean=validateFcmServerAccount(JSON.stringify(account));
 assert.equal(clean.projectId,'liga-jr-pruebas');
 for(const patch of [{client_email:'test@gmail.com'},{token_uri:'https://evil.example/token'},
  {private_key:'invalid-key'},{project_id:'http://evil.example'}])
  assert.throws(()=>validateFcmServerAccount({...account,...patch}),/Credenciales privadas/);
});

test('FCM nunca envía avisos sin aprobación privada ni a token inválido',()=>{
 const original=notice();
 assert.throws(()=>buildFcmApprovedMessage({notice:original,token:deviceToken}),/autorización oficial/);
 assert.throws(()=>buildFcmApprovedMessage({notice:original,token:'a',approvalVerified:true}),/Token/);
 assert.throws(()=>buildFcmApprovedMessage({notice:{...original,approved_at:null},token:deviceToken,approvalVerified:true}),/aprobación registrada/);
 assert.throws(()=>buildFcmApprovedMessage({notice:{...original,status:'draft'},token:deviceToken,approvalVerified:true}),/aprobación registrada/);
 const payload=buildFcmApprovedMessage({notice:original,token:deviceToken,approvalVerified:true});
 assert.deepEqual(payload.message.notification,{title:original.title,body:original.body});
 assert.equal(payload.message.data.route,'notifications');
 assert.equal(payload.message.android.notification.channel_id,'liga_partidos');
 assert.equal(payload.message.android.notification.click_action,undefined);
});

test('FCM OAuth v1 usa JWT firmado y reutiliza token, sin tráfico antes de autorización',async()=>{
 const requests=[];
 const transport=createFcmTransport({serviceAccount:account,now:()=>1791662400000,
 fetchImpl:async(url,init)=>{
  requests.push({url,init});
  if(url==='https://oauth2.googleapis.com/token')
   return new Response(JSON.stringify({access_token:'T'.repeat(40),expires_in:3600}),{status:200});
  if(url==='https://fcm.googleapis.com/v1/projects/liga-jr-pruebas/messages:send')
   return new Response(JSON.stringify({name:'projects/liga-jr-pruebas/messages/123'}),{status:200});
  throw Error('Unexpected address');
 }});
 assert.equal(requests.length,0,'Constructor must never connect');
 await assert.rejects(()=>transport.sendApproved({notice:notice(),token:deviceToken}),/autorización/);
 assert.equal(requests.length,0,'Never connect on unauthorized send');
 const first=await transport.sendApproved({notice:notice(),token:deviceToken,approvalVerified:true});
 assert.deepEqual(first,{accepted:true});
 assert.equal(requests.length,2);
 const oauth=new URLSearchParams(requests[0].init.body);
 const jwt=oauth.get('assertion');
 const [header,claims,signature]=jwt.split('.');
 assert.equal(JSON.parse(Buffer.from(header,'base64url')).alg,'RS256');
 assert.equal(JSON.parse(Buffer.from(claims,'base64url')).aud,'https://oauth2.googleapis.com/token');
 assert.equal(verify('RSA-SHA256',Buffer.from(header+'.'+claims),privateKey,Buffer.from(signature,'base64url')),true);
 assert.equal(requests[1].init.headers.Authorization,'Bearer '+'T'.repeat(40));
 const sent=JSON.parse(requests[1].init.body);
 assert.equal(sent.message.data.route,'notifications');
 assert.equal(sent.message.token,deviceToken);
 await transport.sendApproved({notice:notice(),token:deviceToken,approvalVerified:true});
 assert.equal(requests.filter(x=>x.url==='https://oauth2.googleapis.com/token').length,1,'Reuse scoped OAuth token');
});

test('FCM no filtra tokens en errores de proveedor ni confunde aceptación con entrega',async()=>{
 const transport=createFcmTransport({serviceAccount:account,fetchImpl:async url=>
  new Response(url.includes('/token')?JSON.stringify({access_token:'K'.repeat(40),expires_in:3600}):'sensitive-token-dump',
   {status:url.includes('/token')?200:401})});
 await assert.rejects(()=>transport.sendApproved({notice:notice(),token:deviceToken,approvalVerified:true}),
  error=>error.status===401&&!String(error).includes(deviceToken)&&!String(error).includes('sensitive-token'));
});
