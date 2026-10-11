/* Portada PC de Liga Juventino Rosas, basada en la maqueta HTML/captura facilitada.
   Se ejecuta exclusivamente desde el shell de escritorio; el móvil y APK no la montan. */
(function(){
'use strict';
const pic={
 stadium:'./public/deportiva-sur-partido.jpg',
 hero:'./public/home-feature-reference.webp',
 players:'./assets/home-players-user.png',
 action:'./public/video-hero-reference.webp',
 momentA:'./assets/moments/moments-original-a.png',
 momentB:'./assets/moments/moments-original-b.png',
 gallery:'./assets/home-players-fictional.jpg'
};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const photo=(src,alt='')=>'<img loading="lazy" decoding="async" src="'+src+'" alt="'+esc(alt)+'">';
const card=(route,title,src,eyebrow='',cls='')=>'<button type="button" class="ljpc-r-card '+cls+'" data-desk-route="'+route+'">'+
 '<span class="ljpc-r-image">'+photo(src,title)+'</span><span class="ljpc-r-shade"></span>'+
 (eyebrow?'<small class="ljpc-r-eyebrow">'+esc(eyebrow)+'</small>':'')+
 '<b class="ljpc-r-caption">'+esc(title)+'</b></button>';
const momentList=[
 ['Gol destacado','video',pic.action],
 ['Pasión por la liga','moments',pic.momentA],
 ['Atajada de la jornada','video',pic.momentB],
 ['Fútbol en Juventino','moments',pic.players],
 ['La jugada destacada','video',pic.gallery],
 ['Momentos de equipos','moments',pic.hero],
 ['La afición','moments',pic.stadium]
];
const circles=[
 ['Momentos','moments',pic.momentA],['Competiciones','competition',pic.stadium],
 ['Equipos','teams',pic.players],['Partidos','competition',pic.action],
 ['Jugador semanal','vote',pic.momentB],['Resultados','standings',pic.gallery],
 ['Gol del día','video',pic.action],['Goleadores','scorers',pic.players],
 ['Destacados','moments',pic.momentA],['Liga TV','video',pic.momentB],
 ['Estadísticas','safe-data',pic.hero],['Calendario','v4-calendar',pic.stadium]
];
function crest(name){
 let src='';
 try{src=window.LJR_OFFICIAL_API?.getLogo?.(name)||window.V66_OFFICIAL_DIRECTORY?.logoFor?.(name)||window.LJR_TEAM_LOGOS?.get?.(name)||''}catch(_){}
 if(!src){const db=window.LJR_OFFICIAL_DATA?.team_logos||{};src=db[name]||''}
 if(src&&/^(https?:\/\/|\.\/|\/|assets\/|public\/)/.test(String(src))){
  if(src.startsWith('assets/')||src.startsWith('public/'))src='./'+src;
  return '<span class="ljpc-r-crest">'+photo(esc(src),name)+'</span>';
 }
 return '<span class="ljpc-r-crest ljpc-r-crest-empty">⚽</span>';
}
function fixtures(games){
 const rows=games.slice(0,6);
 return '<section class="ljpc-r-fixtures" aria-label="Próximos partidos"><div class="desk-wrap ljpc-r-matchrow"><span class="ljpc-r-arrow" aria-hidden="true">‹</span>'+
 (rows.length?rows.map(g=>'<button class="ljpc-r-game" type="button" data-desk-route="competition">'+
 '<small>'+esc(g.text)+'</small><span>'+crest(g.home)+'<b>'+esc(g.home)+'</b></span>'+
 '<span>'+crest(g.away)+'<b>'+esc(g.away)+'</b></span></button>').join(''):
 '<button class="ljpc-r-game ljpc-r-game-empty" type="button" data-desk-route="competition"><small>Calendario oficial</small><b>Consultar próximos partidos</b></button>')+
 '<span class="ljpc-r-arrow" aria-hidden="true">›</span>'+
 '<button class="ljpc-r-all" type="button" data-desk-route="competition">▣ &nbsp; Ver todos los partidos</button></div></section>';
}
function stories(){return '<section class="desk-wrap ljpc-r-stories" aria-label="Historias de la liga"><span class="ljpc-r-arrow round" aria-hidden="true">‹</span>'+
 circles.map(([title,route,img],i)=>'<button type="button" class="ljpc-r-story" data-desk-route="'+route+'"><span class="ljpc-r-storyring">'+photo(img,title)+'</span><span>'+esc(title)+'</span></button>').join('')+
 '<span class="ljpc-r-arrow round" aria-hidden="true">›</span></section>'}
function heading(title,route,label){return '<div class="ljpc-r-heading"><h2>'+title+'</h2><button type="button" data-desk-route="'+route+'">'+label+' ›</button></div>'}
function news(){
 return '<section class="ljpc-r-section desk-wrap ljpc-r-news">'+heading('Últimas noticias','news','Ver todas las noticias')+
 '<div class="ljpc-r-news-top">'+card('news','Actualidad de Liga Juventino Rosas',pic.players,'LIGA · NOTICIAS','ljpc-r-news-feature')+
 card('vote','Participa: jugador de la semana',pic.momentB,'PARTICIPA')+
 '<button type="button" class="ljpc-r-asistencia" data-desk-route="safe-data"><b>DATOS DE LA LIGA</b><span>Resultados y estadísticas</span><i>Ver datos ›</i></button></div>'+
 '<div class="ljpc-r-news-bottom">'+card('video','Vídeos y goles de la jornada',pic.action,'LIGA TV')+
 card('history','Archivo e historia de campeones',pic.stadium,'HISTORIA')+
 card('teams','Conoce los equipos y sus plantillas',pic.gallery,'EQUIPOS','ljpc-r-news-wide')+'</div>'+
 '<button class="ljpc-r-outline" type="button" data-desk-route="news">Ver todas las noticias</button></section>';
}
function videoRow(title,route,items){
 return '<section class="ljpc-r-section desk-wrap">'+heading(title,route,'Ver todos los vídeos')+
 '<div class="ljpc-r-video-grid">'+items.map(([t,img])=>card('video',t,img,'LIGA TV')).join('')+'</div>'+
 '<button class="ljpc-r-outline" type="button" data-desk-route="video">Ver todos los vídeos</button></section>'
}
function render(api){
 const {top,footer,desktopOfficialGames}=api;
 return '<div class="desktop-liga ljpc-ref-home" data-desktop-shell="1">'+
 '<div class="ljpc-r-tiny"><div class="desk-wrap"><span>LIGA JUVENTINO ROSAS · GUANAJUATO</span><button type="button" data-desk-route="accountLogin">Iniciar sesión ◉</button></div></div>'+
 '<div class="desk-home-top ljpc-r-top">'+top()+fixtures(desktopOfficialGames(6))+stories()+
 '<div class="desk-wrap"><div class="ljpc-r-info"><span class="ljpc-r-info-icon">5</span><b>CATEGORÍAS OFICIALES</b><span>Primera · Intermedia · Segunda · Veteranos 35+ · Veteranos 50+</span></div>'+
 '<div class="ljpc-r-hero-grid">'+
 '<button type="button" class="ljpc-r-hero" data-desk-route="news">'+photo(pic.stadium,'Campo de fútbol de la región')+
 '<span class="ljpc-r-shade"></span><strong>Bienvenidos a Liga Juventino Rosas</strong></button>'+
 '<aside class="ljpc-r-side"><h2>Lo más destacado</h2>'+
 [['Mira los vídeos y goles de la jornada','video',pic.action],
 ['Calendario y próximos partidos','competition',pic.stadium],
 ['Momentos de nuestros equipos','moments',pic.momentA],
 ['Tablas y goleadores oficiales','scorers',pic.players],
 ['Fantasy y juegos de la liga','fantasy',pic.gallery]].map(([title,route,img])=>
 '<button type="button" data-desk-route="'+route+'">'+photo(img,title)+'<b>'+esc(title)+'</b></button>').join('')+
 '</aside></div></div></div>'+
 '<main class="ljpc-r-main">'+
 '<section class="ljpc-r-section desk-wrap">'+heading('Momentos','moments','Ver todos los momentos')+
 '<div class="ljpc-r-moments">'+momentList.map(([title,route,img])=>card(route,title,img,'NUEVO')).join('')+'</div></section>'+
 news()+
 '<div class="ljpc-r-video-band">'+videoRow('Resúmenes en vídeo','video',[['Resúmenes de la liga',pic.action],['Momentos especiales',pic.momentA],['Mejores jugadas',pic.momentB],['Más fútbol local',pic.gallery]])+
 videoRow('En portada','video',[['Fútbol de nuestra comunidad',pic.stadium],['Los protagonistas de la jornada',pic.players],['Historias de nuestra liga',pic.hero],['Acciones destacadas',pic.action]])+'</div>'+
 '<div class="ljpc-r-sponsor" aria-label="Información de la liga">LIGA JUVENTINO ROSAS · FÚTBOL LOCAL</div>'+
 '</main>'+footer()+'</div>';
}
window.LJR_PC_HOME_V2={render};
})();