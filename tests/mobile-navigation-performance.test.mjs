import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const source=p=>existsSync(new URL('../'+p,import.meta.url))?read(p):'';
function pager(mobile=true){
 const window={};const context={URLSearchParams,window,location:{search:mobile?'?mode=apk':'?mode=desktop'},matchMedia:()=>({matches:mobile})};
 vm.runInNewContext(source('src/mobile-list-pages-20261011.js'),context);
 return window.LJR_MOBILE_LISTS||{page:(_,rows)=>rows,button:()=>'',more(){},snapshot:()=>({}),restore(){}};
}
test('mobile row renderers only construct six initial rows, then six more, keeping the full search pool',()=>{
 const api=pager(); const rows=Array.from({length:2000},(_,i)=>({name:'Jugador '+i}));let constructed=0;
 const render=()=>api.page('players',rows,'all').map(p=>{constructed++;return p.name});
 assert.equal(render().length,6);assert.equal(constructed,6);assert.equal(rows.length,2000);
 api.more('players');assert.equal(render().length,12);
 assert.equal(api.page('players',rows.filter(x=>x.name==='Jugador 1999'),'1999')[0].name,'Jugador 1999');
 assert.equal(api.page('players',rows,'all').length,6,'new filter starts at six');
});
test('back restores previously expanded pages before the row renderer runs',()=>{
 const api=pager(),rows=Array.from({length:40},(_,i)=>i);api.page('players',rows,'all');api.more('players');api.more('players');
 const entry=api.snapshot();api.page('players',rows,'changed');api.restore(entry);
 assert.equal(api.page('players',rows,'all').length,18);
});
test('PC gets all rows and no mobile pagination control',()=>{
 const api=pager(false),rows=Array.from({length:40},(_,i)=>i);
 assert.equal(api.page('players',rows,'all').length,40);assert.equal(api.button('players',40),'');
});
function navigation(){
 const listeners={};const store=new Map(); const root={id:'screen',scrollTop:0,scrollLeft:0,scrollHeight:2000,clientHeight:700,scrollWidth:400,clientWidth:400,querySelectorAll:()=>[]};
 const location={hash:'#/home',pathname:'/',search:'?mode=apk',href:'https://app.test/#/home'};
 const window={scrollY:0,scrollX:0,addEventListener:(type,fn)=>(listeners[type]??=[]).push(fn),dispatchEvent:e=>(listeners[e.type]||[]).forEach(fn=>fn(e)),scrollTo(a,b){this.scrollY=typeof a==='object'?a.top:b;this.scrollX=typeof a==='object'?a.left:a}};
 const document={body:{},getElementById:()=>root,querySelector:()=>null,addEventListener(){},readyState:'complete',scrollingElement:{scrollTop:0}};
 const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
 const context={window,document,location,sessionStorage:storage,localStorage:storage,history:{replaceState(_,__,url){location.hash=url.slice(url.indexOf('#'))}},getComputedStyle:()=>({overflowY:'auto',overflowX:'auto'}),requestAnimationFrame:fn=>{fn();return 1},setTimeout(){},MutationObserver:class{observe(){}},Event:class{constructor(type){this.type=type}},HashChangeEvent:class{constructor(type){this.type=type}},Element:class{}};
 vm.runInNewContext(read('src/v776-navigation.js'),context);
 return {window,root,location,history:context.history,fire:type=>(listeners[type]||[]).forEach(fn=>fn())};
}
test('a scroll immediately followed by direct hash navigation restores the exact prior offset',()=>{
 const n=navigation();n.window.scrollY=683;n.root.scrollTop=427;n.fire('scroll');
 n.location.hash='#/players';n.fire('hashchange');n.window.LJR_NAVIGATION.back();
 assert.equal(n.location.hash,'#/home');assert.equal(n.window.scrollY,683);assert.equal(n.root.scrollTop,427);
});
function motion({mobile=true,reduced=false,back=false,appReduced=false,storedReduced=false}={}){
 const animations=[];const screen={animate(frames,options){animations.push({frames,options});return {cancel(){},pause(){},play(){},ready:Promise.resolve(),finished:Promise.resolve()}}};
 const html={classList:{add(){},remove(){}}};const document={body:{dataset:{v1300Reduced:String(appReduced)}},documentElement:html,getElementById:()=>screen,readyState:'complete'};
 const context={URLSearchParams,localStorage:{getItem:key=>key==='ljr-profile-prefs-v1300-member17'?JSON.stringify({reduceMotion:storedReduced}):null},window:{LJR_V569_AUTH:{currentAccount:()=>({id:'member17'})},LJR_NAVIGATION:{direction:()=>back?'back':'forward'}},document,location:{hash:'#/home',search:mobile?'?mode=apk':'?mode=desktop'},matchMedia:q=>({matches:q.includes('reduced')?reduced:mobile}),addEventListener(){},performance:{now:()=>0},requestAnimationFrame:fn=>fn(),setTimeout:()=>1,clearTimeout(){},MutationObserver:class{observe(){}}};
 vm.runInNewContext(read('src/v929-route-paint-guard.js'),context);context.window.LJR_VISUAL_STABILITY.begin('#/players');context.location.hash='#/players';context.window.LJR_VISUAL_STABILITY.finish();return animations;
}
test('forward mobile pages slide right to left and back pages reverse',()=>{
 assert.equal(motion()[0]?.frames[0].translate,'100% 0');
 assert.equal(motion({back:true})[0]?.frames[0].translate,'-100% 0');
});
test('reduced motion and PC do not animate mobile page transitions',()=>{
 assert.equal(motion({reduced:true}).length,0);assert.equal(motion({mobile:false}).length,0);
});
const esc=s=>String(s),norm=s=>String(s).toLowerCase();
test('official player directory creates six real player buttons from a 2000-player source',()=>{
 const js=read('src/v66-official-directory.js');const fn=js.slice(js.indexOf('function playerMarkup(){'),js.indexOf('function saveTeam('));
 const rows=Array.from({length:2000},(_,i)=>({name:'Jugador '+i,team:'Juventus',cat:'3',category:'Primera'}));
 const api=pager();const context={window:{LJR_MOBILE_LISTS:api},playerQuery:'',playerCat:'all',playerTeam:'all',playerList:()=>rows,teamsForPlayerFilter(){},norm,same:(a,b)=>a===b,esc,categoryRail:()=>'',playerTeamRail:()=>'',playerAvatar:()=>'',CAT_LABEL:{}};
 const render=()=>vm.runInNewContext(fn+';playerMarkup()',context);
 assert.equal((render().match(/class="v66-player-row"/g)||[]).length,6);api.more('directory-players');
 assert.equal((render().match(/class="v66-player-row"/g)||[]).length,12);
 context.playerQuery='Jugador 1999';assert.ok(render().includes('data-v66-player="Jugador 1999"'));
});
test('official search creates six results and Ver más reaches the rest of the filtered dataset',()=>{
 const js=read('src/v412-reference-screens.js');const fn=js.slice(js.indexOf('function bindSearch(root){'),js.indexOf('function mountSearch('));
 const results={innerHTML:''},head={textContent:''},all={dataset:{}},nodes={'[data-v412-search-results]':results,'.v412-result-heading span':head,'.v412-result-heading button':all};
 const root={querySelector:s=>nodes[s]||null,querySelectorAll:()=>[],classList:{toggle(){}}};
 const rows=Array.from({length:2000},(_,i)=>({name:'Jugador '+i,team:'Juventus',catId:'3',category:'Primera'}));const api=pager();
 vm.runInNewContext(fn+';bindSearch(root)',{window:{LJR_MOBILE_LISTS:api},root,localStorage:{getItem:()=>null},document:{querySelector:()=>null},norm,players:()=>rows,playerStats:()=>({goals:0,points:0}),CAT_NAMES:{},searchPlayerRow:p=>'<button class="search-player">'+p.name+'</button>',bindCommon(){}});
 assert.equal((results.innerHTML.match(/class="search-player"/g)||[]).length,6);assert.match(results.innerHTML,/Ver más/);assert.match(head.textContent,/2000/);
});
function delegateMarkup(path){
 const src=read(path),start=src.indexOf('function delegates(){'),part=src.slice(start);
 const a=part.indexOf('const render=()=>{'),b=part.indexOf(path.includes('green')?"  $$('[data-d-whatsapp]'":"    $$('[data-del]'",a);
 const fn=part.slice(a,b)+'};render();';const host={innerHTML:''},count={textContent:''},stats={innerHTML:''};const controls={'[data-d-search]':{value:''},'[data-d-category-filter]':{value:''},'[data-d-role-filter]':{value:''},'[data-d-count]':count,'[data-d-list]':host,'[data-d-stats]':stats};
 const list=Array.from({length:27},(_,i)=>({id:String(i),name:'Delegado '+i,team:'Juventus',phone:'1234567890'}));
 vm.runInNewContext(fn,{window:{LJR_MOBILE_LISTS:pager()},list,m:{querySelector:()=>null},esc,norm,phoneDigits:s=>s,whatsappPhone:s=>s,dialPhone:s=>s,q:s=>controls[s],$:()=>host});
 return {html:host.innerHTML,list};
}
test('both delegate directories construct six contacts and retain all contacts for export and filtering',()=>{
 for(const path of ['src/v100-additive-functions.js','src/v105-green-app-bottom.js']){
  const {html,list}=delegateMarkup(path);assert.equal((html.match(/<article/g)||[]).length,6,path);assert.equal(list.length,27);assert.match(html,/Ver más/);
 }
});
test('news source filtering happens before pagination, allowing a late saved news item to be found',()=>{
 const src=read('src/v1073-news-automation.js');const fn=src.slice(src.indexOf('function renderPublicNews(host){'),src.indexOf('function updateButtons('));
 const feed={dataset:{},innerHTML:'',hidden:false,querySelector:()=>null};const host={publicFeed:feed,root:{querySelector:()=>({dataset:{newsFilter:'Todas'}})}};
 const rows=Array.from({length:27},(_,i)=>({id:String(i),kind:'news',payload:{title:'Noticia '+i,body:'Texto '+i}}));const settings={query:'',mode:'all'};
 const context={window:{LJR_MOBILE_LISTS:pager()},host,records:()=>rows,recordId:x=>x.id,settings,clean:norm,scope:()=> 'Primera',isRead:()=>false,isSaved:id=>id==='26',esc,buttons:()=>''};
 const render=()=>vm.runInNewContext(fn+';renderPublicNews(host)',context);
 render();assert.equal((feed.innerHTML.match(/<article/g)||[]).length,6);assert.match(feed.innerHTML,/Ver más/);
 settings.mode='saved';render();assert.match(feed.innerHTML,/Noticia 26/);assert.equal((feed.innerHTML.match(/<article/g)||[]).length,1);
});
test('native search also limits constructed player results before the official search module mounts',()=>{
 const src=read('src/main.js'),fn=src.slice(src.indexOf('function searchResultsHtml(q){'),src.indexOf('function officialVoteNorm('));
 const rows=Array.from({length:27},(_,i)=>({id:i,name:'Jugador '+i,team:'JUV',position:'Jugador'}));
 const context={window:{LJR_MOBILE_LISTS:pager()},teams:[],players:rows,news:[],matches:[],normLeagueSearch:norm,team:()=>({name:'Juventus'}),crest:()=>'',sectionHead:s=>'<h2>'+s+'</h2>'};
 const html=vm.runInNewContext(fn+";searchResultsHtml('jugador')",context);assert.equal((html.match(/data-player=/g)||[]).length,6);assert.match(html,/Ver más/);
});
test('native news maps only six source records before constructing news cards',()=>{
 const src=read('src/main.js'),fn=src.slice(src.indexOf('function newsView(){'),src.indexOf('function newsDetailView('));
 const news=Array.from({length:27},(_,i)=>({id:i,title:'Noticia '+i,category:'Liga',date:'Hoy',subtitle:'Oficial'}));
 const html=vm.runInNewContext(fn+';newsView()',{window:{LJR_MOBILE_LISTS:pager()},news,state:{newsFilter:'Todas'}});
 assert.equal((html.match(/class="news-row"/g)||[]).length,6);assert.match(html,/Ver más/);
});
test('native players mount does not construct the full roster before official directory takes over',()=>{
 const src=read('src/main.js'),fn=src.slice(src.indexOf('function playersView(){'),src.indexOf('function filterPlayers('));
 const rows=Array.from({length:27},(_,i)=>({id:i,name:'Jugador '+i}));
 const html=vm.runInNewContext(fn+';playersView()',{window:{LJR_MOBILE_LISTS:pager()},icons:{search:''},state:{searchQuery:''},filterPlayers:()=>rows,playerRowHtml:p=>'<button class="player-row">'+p.name+'</button>'});
 assert.equal((html.match(/class="player-row"/g)||[]).length,6);
});
test('app back traverses an owned browser entry so the Android back stack has no duplicated replacement page',()=>{
 const n=navigation();n.window.LJR_NAVIGATION.leaving('players');n.location.hash='#/players';n.fire('hashchange');
 let backs=0,replaces=0;n.history.state={ljrNavigationUrl:'#/players'};n.history.length=2;
 n.history.back=()=>{backs++};n.history.replaceState=()=>{replaces++};n.window.LJR_NAVIGATION.back();
 assert.equal(backs,1);assert.equal(replaces,0);
});
test('team directory constructs six tiles per category group and keeps every matching club searchable',()=>{
 const src=read('src/v27-teams-drive-reference.js'),fn=src.slice(src.indexOf('  function teamsMarkup(){'),src.indexOf('  function teamStrip('));
 const rows=Array.from({length:27},(_,i)=>({id:i,name:'Club '+i,short:'Club '+i}));const context={window:{LJR_MOBILE_LISTS:pager()},query:'',FIRST_GRID:rows,LIBRE_TEAMS:rows,V27_TEAMS:[],followedIds:()=>[],team:()=>({}),esc,backIcon:()=>'',searchIcon:()=>'',tile:(t,f)=>f?'':'<button class="team-tile">'+t.name+'</button>'};
 let html=vm.runInNewContext(fn+';teamsMarkup()',context);assert.equal((html.match(/class="team-tile"/g)||[]).length,12);assert.equal((html.match(/Ver más/g)||[]).length,2);
 context.query='Club 26';html=vm.runInNewContext(fn+';teamsMarkup()',context);assert.match(html,/Club 26/);assert.equal((html.match(/class="team-tile"/g)||[]).length,2);
});
test('Ver más keeps the reader at the same offset when a list renderer replaces its page',()=>{
 const window={scrollY:480,scrollX:0,scrollTo({top,left}){this.scrollY=top;this.scrollX=left}};
 const screen={scrollTop:240,scrollLeft:0},button={},root={querySelector:()=>button};
 vm.runInNewContext(read('src/mobile-list-pages-20261011.js'),{window,location:{search:'?mode=apk'},URLSearchParams,matchMedia:()=>({matches:true}),document:{getElementById:()=>screen},requestAnimationFrame:fn=>fn()});
 const api=window.LJR_MOBILE_LISTS;api.page('test',Array(30),'all');api.bind(root,'test',()=>{window.scrollY=0;screen.scrollTop=0});button.onclick();
 assert.equal(window.scrollY,480);assert.equal(screen.scrollTop,240);
});
test('native news respects the full saved/query filter before limiting source rows',()=>{
 const src=read('src/main.js'),fn=src.slice(src.indexOf('function newsView(){'),src.indexOf('function newsDetailView('));
 const news=Array.from({length:27},(_,i)=>({id:i,title:'Noticia '+i,category:'Liga',date:'Hoy',subtitle:'Oficial'}));
 const html=vm.runInNewContext(fn+';newsView()',{window:{LJR_MOBILE_LISTS:pager(),LJR_V1073_NEWS:{filterNative:rows=>rows.filter(x=>x.id===26),filterSignature:()=> 'saved:26'}},news,state:{newsFilter:'Todas'}});
 assert.equal((html.match(/class="news-row"/g)||[]).length,1);assert.match(html,/Noticia 26/);
});
test('direct hash navigation saves expanded list state alongside the synchronous scroll offset',()=>{
 const n=navigation();let restored;
 n.window.LJR_MOBILE_LISTS={snapshot:()=>({pages:{players:{signature:'all',limit:18}},views:{}}),restore:value=>{restored=value}};
 n.window.scrollY=840;n.fire('scroll');n.location.hash='#/players';n.fire('hashchange');n.window.LJR_NAVIGATION.back();
 assert.equal(restored?.pages.players.limit,18);
});
test('search ranking reads each player’s official statistics once before sorting',()=>{
 const src=read('src/v412-reference-screens.js'),bind=src.slice(src.indexOf('function bindSearch(root){'),src.indexOf('function mountSearch(')),stats=src.slice(src.indexOf('function playerStats(p){'),src.indexOf('function categoryCode('));
 const rows=Array.from({length:100},(_,i)=>({id:i,name:'Jugador '+i,team:'Juventus',catId:'3',category:'Primera'}));let reads=0;
 const category={get scorers(){reads++;return [{rows:rows.map(p=>[null,p.name,p.team,p.id%17])}]},standings:[{rows:[[null,'Juventus',8,null,null,null,null,null,null,15]]}]};
 const results={innerHTML:''},nodes={'[data-v412-search-results]':results,'.v412-result-heading span':{},'.v412-result-heading button':{dataset:{}}};const root={querySelector:s=>nodes[s]||null,querySelectorAll:()=>[],classList:{toggle(){}}};
 vm.runInNewContext(stats+bind+';bindSearch(root)',{window:{LJR_MOBILE_LISTS:pager()},root,localStorage:{getItem:()=>null},document:{querySelector:()=>null},norm,players:()=>rows,data:()=>({categories:{3:category}}),CAT_NAMES:{},searchPlayerRow:p=>p.name+';',bindCommon(){}});
 assert.ok(reads<=rows.length,reads+' statistics reads for '+rows.length+' players');assert.ok(results.innerHTML.startsWith('Jugador 16;'),'highest goals still rank first');
});
test('mobile slides animate independent translate so legacy important transform:none cannot suppress motion',()=>{
 assert.equal(motion()[0]?.frames[0].translate,'100% 0');assert.equal(motion({back:true})[0]?.frames[0].translate,'-100% 0');
});

test('the app reduced-motion preference disables WAAPI slides even when the OS permits animation',()=>{
 assert.equal(motion({appReduced:true}).length,0);
 assert.equal(motion({storedReduced:true}).length,0,'stored active-account preference applies before its body flag mounts');
 assert.equal(motion({appReduced:false,storedReduced:false}).length,1);
});
