import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const script=read('src/pc-drive-eight-references-20261011.js');
const css=read('src/pc-drive-eight-references-20261011.css');
const html=read('index.html');
const db={
  categories:{
    '3':{
      name:'Primera Fuerza',
      standings:[{rows:[
        [1,'Tavera FC',7,4,1,2,12,8,4,13],
        [2,'Juventus',7,3,3,1,10,9,1,12]
      ]}],
      scorers:[{rows:[
        [1,'Luis García','Tavera FC',5],
        [2,'Carlos Ruiz','Juventus',3]
      ]}],
      cards:[{rows:[['Amarilla','Luis García','Tavera FC',2]]}],
      player_usage:{c:{name:'Carlos Ruiz',team:'Juventus',cedulas:7}}
    },
    '1':{name:'Veteranos 50+',standings:[],scorers:[]}
  }
};

function load({mode='desktop',width=1280,native=false,data=db}={}){
  const exposed=script.replace(/\}\)\(\);\s*$/,
    'window.__test={active,desktop,statistics,renderTeam,renderPlayers,featureScorer,phase,book,performance,players,state};\n})();');
  assert.notEqual(exposed,script,'La prueba debe localizar el cierre del módulo');
  const window={
    LJR_OFFICIAL_DATA:data,
    innerWidth:width,
    Capacitor:{isNativePlatform:()=>native},
    addEventListener(){}
  };
  const document={
    readyState:'loading',
    body:{classList:{contains:name=>name==='lj-desktop'}},
    documentElement:{classList:{contains:name=>name==='ljr-pc-datos-uefa'}},
    addEventListener(){},getElementById(){return null}
  };
  const location={search:'?mode='+mode,hash:'#/pc-data'};
  vm.runInNewContext(exposed,{
    window,document,location,sessionStorage:{getItem:()=> '3'},
    URLSearchParams,MutationObserver:class{observe(){}},
    requestAnimationFrame(){},setTimeout(){},
    fetch:()=>Promise.reject(new Error('Sin red en pruebas')),
    Element:class{}
  },{timeout:5000,filename:'pc-drive-eight-references-20261011.js'});
  return {api:window.__test,window,location};
}

test('las dos referencias de escritorio están conectadas en index.html',()=>{
  assert.match(html,/src\/pc-drive-eight-references-20261011\.js/);
  assert.match(html,/src\/pc-drive-eight-references-20261011\.css/);
  assert.doesNotThrow(()=>new vm.Script(script));
});
test('los datos de equipos, goleadores y tarjetas proceden del registro',()=>{
  const {api}=load();
  assert.equal(api.active(),true);
  assert.match(api.renderTeam(),/Tavera FC/);
  assert.match(api.renderPlayers(),/Luis García/);
  assert.match(api.renderPlayers(),/Carlos Ruiz/);
  assert.match(api.featureScorer(),/Luis García/);
  assert.match(api.phase(),/Tavera FC/);
  const luis=api.players().find(p=>p.name==='Luis García');
  assert.equal(luis.yellow,2);
  assert.equal(luis.goals,5);
});
test('métricas no publicadas no muestran datos inventados',()=>{
  const {api}=load();
  api.state.teamMetric='disparos';
  assert.match(api.renderTeam(),/no publica estadísticas verificadas/i);
  api.state.playerMetric='disparos';
  assert.match(api.renderPlayers(),/No se publican registros verificables/i);
  api.state.category='1';
  api.state.teamMetric='clave';
  assert.match(api.renderTeam(),/Aún no hay registros/i);
});
test('el texto dinámico se escapa antes de incorporarse a la tabla',()=>{
  const unsafe=JSON.parse(JSON.stringify(db));
  unsafe.categories['3'].standings[0].rows[0][1]='<img src=x onerror=alert(1)>';
  const {api}=load({data:unsafe});
  assert.doesNotMatch(api.renderTeam(),/<img src=x onerror/);
  assert.match(api.renderTeam(),/&lt;img src=x onerror/);
});
test('móvil, APK y plataforma nativa no activan la interfaz de PC',()=>{
  assert.equal(load({mode:'mobile',width:1366}).api.active(),false);
  assert.equal(load({mode:'apk',width:1366}).api.active(),false);
  assert.equal(load({mode:'desktop',width:1366,native:true}).api.active(),false);
  assert.equal(load({mode:'desktop',width:1366}).api.active(),true);
});
test('los estilos son exclusivos de PC y eliminan la pestaña duplicada',()=>{
  assert.match(css,/html\.ljr-pc-datos-uefa body\.lj-desktop/);
  assert.match(css,/\.ljpc8-original > \.ljpc-eight-tabs\s*\{\s*display:none!important;/);
  assert.doesNotMatch(css,/^\s*(?:body|html|#screen)\s*\{/m);
});
test('los accesos de libro y rendimiento se mantienen conectados',()=>{
  const {api}=load();
  assert.match(api.book(),/data-ljpc8-go="history"/);
  assert.match(api.performance(),/data-ljpc8-go="safe-performance"/);
  assert.match(api.performance(),/data-ljpc8-go="pc-team-compare"/);
});
