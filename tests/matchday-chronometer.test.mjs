import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../src/v1132-matchday-premium.js',import.meta.url),'utf8');
const start=source.indexOf('function liveSignal(g,');
const end=source.indexOf('function deepLink(g)',start);
assert.ok(start>=0&&end>start,'Match Day must contain the match chronometer and phase logic');
const storage=new Map();
const ctx={
  Date,JSON,Number,String,Object,Math,Map,Set,Array,localStorage:{getItem:key=>storage.get(key)||null},
  norm:v=>String(v||'').toLowerCase(),sharedLiveStates:new Map(),
  all:[],category:'all',current:'',manualUntil:0,host:null,
  route:()=> 'matchday'
};
const clock=vm.runInNewContext(source.slice(start,end)+';({clockFor,status,chooseAutomaticGame,liveSignal});',ctx);
const startMs=Date.UTC(2026,9,10,14,0,0);
const game={id:'5|1',officialKey:'5:1',catId:'5',time:startMs,status:'---',homeScore:'-',awayScore:'-'};
const fromStart=minutes=>startMs+minutes*60000;

test('Match Day counts down before kickoff without declaring live',()=>{
  const v=clock.clockFor(game,startMs-125000);
  assert.equal(v.period,'CUENTA REGRESIVA');
  assert.equal(v.text,'00:02:05');
  assert.equal(clock.status(game,startMs-125000).type,'next');
});
test('Match Day shows estimated first half, 15 minute break and second half',()=>{
  assert.equal(clock.clockFor(game,fromStart(3)+4000).text,'03:04');
  assert.match(clock.clockFor(game,fromStart(3)).note,/sin confirmar/i);
  assert.match(clock.clockFor(game,fromStart(46)).period,/DESCANSO/i);
  assert.equal(clock.clockFor(game,fromStart(46)).text,'01:00');
  assert.match(clock.clockFor(game,fromStart(62)).period,/2T/);
  assert.equal(clock.clockFor(game,fromStart(62)).text,'47:00');
  assert.equal(clock.clockFor(game,fromStart(106)).text,'—');
  assert.notEqual(clock.status(game,fromStart(3)).type,'live');
});
test('Match Day mirrors verified operator whistle timestamps exactly',()=>{
  const at=fromStart(5)+10000;
  storage.set('ljr-match-live-v144:'+game.officialKey,JSON.stringify({
    phase:'first',firstStartedAt:at-70000,
    source:{connected:false},events:[{type:'phase-first',confirmed:true,ts:at-70000}]
  }));
  assert.equal(clock.status(game,at).type,'live');
  assert.equal(clock.clockFor(game,at).text,'01:10');
  assert.match(clock.clockFor(game,at).note,/operador/i);
  const second=fromStart(70)+5000;
  storage.set('ljr-match-live-v144:'+game.officialKey,JSON.stringify({
    phase:'second',secondStartedAt:second-125000,source:{connected:false},
    events:[{type:'phase-second',confirmed:true,ts:second-125000}]
  }));
  assert.equal(clock.clockFor(game,second).text,'47:05');
});
test('Old unconfirmed phases cannot be presented as live',()=>{
  const at=fromStart(25);
  storage.set('ljr-match-live-v144:'+game.officialKey,JSON.stringify({phase:'first',firstStartedAt:at-30000,source:{connected:false},events:[]}));
  assert.notEqual(clock.status(game,at).type,'live');
  assert.equal(clock.clockFor(game,at).estimated,true);
});
test('Operator final advances the automatic schedule to the next match',()=>{
  const at=fromStart(30);
  storage.set('ljr-match-live-v144:'+game.officialKey,JSON.stringify({
    phase:'final',source:{connected:false},events:[{type:'phase-final',confirmed:true,ts:at}]
  }));
  const next={...game,id:'5|2',officialKey:'5:2',time:fromStart(120)};
  ctx.all=[game,next];
  assert.equal(clock.status(game,at).type,'final');
  assert.equal(clock.chooseAutomaticGame(at).id,'5|2');
});
test('A published final score overrides a stale ticking estimate',()=>{
  const complete={...game,homeScore:'2',awayScore:'1'};
  assert.equal(clock.clockFor(complete,fromStart(70)).text,'2 – 1');
  assert.equal(clock.status(complete,fromStart(70)).type,'final');
});
