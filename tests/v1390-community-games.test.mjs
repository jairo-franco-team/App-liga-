import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function harness(){
 const values=new Map();
 let current={id:'account-a',alias:'Jugador A'};
 const localStorage={
  getItem:key=>values.has(key)?values.get(key):null,
  setItem:(key,v)=>{values.set(key,String(v))},
  removeItem:key=>values.delete(key)
 };
 const window={LJR_V569_AUTH:{currentAccount:()=>current}};
 const listeners=new Map();
 const document={readyState:'loading',querySelector:()=>null,addEventListener:(event,fn)=>{listeners.set(event,fn)}};
 const ctx={window,document,location:{hash:'#/rankings',origin:'https://example.test',pathname:'/'},localStorage,Date,Math,Number,String,JSON,Array,Object,Map,Set,Intl,console,requestAnimationFrame:()=>1};
 vm.runInNewContext(readFileSync(new URL('../src/v1390-community-games.js',import.meta.url),'utf8'),ctx,{filename:'v1390-community-games.js'});
 return {ranking:window.LJR_GAME_RANKING,values,as:a=>{current=a}};
}

test('scoring: results and exact scores use existing Pronostica Seis base rules',()=>{
 const h=harness();
 const result=h.ranking.scorePrediction({home:2,away:1},2,1);
 assert.equal(result.points,10);
 assert.equal(result.won,true);
 const miss=h.ranking.scorePrediction({home:0,away:3},2,1);
 assert.equal(miss.won,false);
 assert.equal(miss.points,0);
});
test('same match cannot be credited twice and results are isolated by game and account',()=>{
 const h=harness();
 assert.equal(h.ranking.record('quizArena',{id:'quiz:123',points:60,won:true}),true);
 assert.equal(h.ranking.record('quizArena',{id:'quiz:123',points:60,won:true}),true);
 assert.equal(h.ranking.rankings('quizArena')[0].games,1);
 assert.equal(h.ranking.rankings('quizArena')[0].wins,1);
 h.ranking.record('moreLess',{id:'more:3',points:40,won:false});
 assert.equal(h.ranking.rankings('quizArena')[0].points,60);
 assert.equal(h.ranking.rankings('all')[0].games,2);
 h.as({id:'account-b',alias:'Jugador B'});
 h.ranking.record('quizArena',{id:'quiz:456',points:100,won:true});
 const rows=h.ranking.rankings('quizArena');
 assert.equal(rows.length,2);
 assert.equal(rows[0].name,'Jugador B');
 assert.equal(rows[1].name,'Jugador A');
});
test('anonymous sessions do not create public or registered leaderboard entries',()=>{
 const h=harness();
 h.as(null);
 assert.equal(h.ranking.record('quiniela',{id:'match-1',points:2,won:true}),false);
 assert.equal(h.ranking.rankings('quiniela').length,0);
 assert.equal(h.ranking.scope,'local');
});
