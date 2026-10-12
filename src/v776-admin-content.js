/* Public content is read from Sites; all shared writes are authorized there. */
(()=>{
 const base=window.LJR_MEDIA_BASE||location.origin,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const cats={'3':'Primera Fuerza','5':'Intermedia','4':'Segunda Fuerza','2':'Veteranos 35+','1':'Veteranos 50+'};
 const kindNames={news:'Noticias',scorers:'Tabla de goleo',standings:'Tabla de posiciones',fixture:'Jornadas y resultados',sanction:'Sancionados',document:'Cédulas y documentos',transmission:'Transmisiones',product:'Tienda',player:'Jugadores',team:'Equipos',page:'Textos, imágenes y diseño',design:'Diseños guardados'};
 let records=[],rawData=null,loaded=false,timer,applying=false;
 const route=()=>location.hash.replace(/^#\/?/,'').split('?')[0]||'home';
 const media=()=>window.LJR_MEDIA;
 const api=(p,o={})=>media()?media().api(p,o):fetch(base+'/api/'+p,o).then(async r=>{const x=await r.json();if(!r.ok)throw Error(x.error);return x});
 const modal=(t,h)=>media().modal(t,h);
 const active=kind=>records.filter(x=>x.kind===kind&&x.published);
 const catOptions=(id='3')=>Object.entries(cats).map(([v,n])=>'<option value="'+v+'" '+(v===id?'selected':'')+'>'+n+'</option>').join('');
 const snapshot=()=>rawData||window.LJR_OFFICIAL_API?.getData?.()||window.LJR_OFFICIAL_DATA||{};
 async function refresh(){try{const data=await api('content');if(!Array.isArray(data.items))throw Error('La respuesta de contenido no es válida. Se conserva la última información disponible.');records=data.items;loaded=true;window.LJR_OFFICIAL_API?.applyContent?.();window.LJR_V508_OFFICIAL?.applyContent?.();apply();window.dispatchEvent(new Event('liga:content'))}catch(err){console.warn('Contenido de la liga:',err.message)}}
 function applyOfficialData(original){
  if(!original)return original;rawData=original;const db=structuredClone(original);
  for(const rec of records.filter(x=>x.published)){
   const p=rec.payload,c=db.categories?.[String(p.category)];if(!c)continue;
   const table={scorers:'scorers',standings:'standings',fixture:'fixtures',sanction:'suspensions'}[rec.kind];
   if(table&&Array.isArray(p.rows)){c[table]=[{headers:p.headers,rows:structuredClone(p.rows)}];continue}
   if(rec.kind==='team'){if(p.logo){db.team_logos||={};db.team_logos[p.name]={app:p.logo}}c.rosters||={};c.rosters[p.name]||=[];c.teams||=[];if(!c.teams.some(t=>(t.name||t)===p.name))c.teams.push({name:p.name,logo:p.logo,field:p.field,community:p.community})}
   if(rec.kind==='player'){c.rosters||={};c.rosters[p.team]||=[];const list=c.rosters[p.team];if(Array.isArray(list)&&!list.some(x=>(typeof x==='string'?x:x.name)===p.name))list.push(p.name)}
  }
  return db;
 }
 function entry(){
  const root=document.querySelector('#screen')||document.querySelector('[data-media-page]');if(!root)return;
  let n=root.querySelector('.ljr-cms-entry');if(!media()?.admin){n?.remove();return}
  if(!n){n=document.createElement('div');n.className='ljr-cms-entry ljr-admin-only';n.innerHTML='<button data-cms-open>Administrar contenido</button><button data-cms-edit-page>Editar esta página</button><button data-cms-story>Historia · 24 h</button><button data-cms-design>Crear publicación</button><button data-cms-help>Cómo administrar</button><button data-cms-video>Subir video</button><button data-cms-photo>Subir foto</button>';root.prepend(n);n.querySelector('[data-cms-open]').onclick=open;n.querySelector('[data-cms-edit-page]').onclick=editPage;n.querySelector('[data-cms-story]').onclick=()=>media().edit('',({home:'home',moments:'moments',video:'video','safe-performance':'performance'}[route()]||'all'),undefined,{kind:'story'});n.querySelector('[data-cms-design]').onclick=()=>window.LJR_DESIGN_STUDIO?.open?.();n.querySelector('[data-cms-help]').onclick=adminHelp;for(const [key,kind] of [['video','video'],['photo','photo']])n.querySelector('[data-cms-'+key+']').onclick=()=>media().edit('',({home:'home',moments:'moments',video:'video','safe-performance':'performance'}[route()]||'all'),undefined,{kind})}
 }
 function publicCard(x){const p=x.payload;return '<article class="ljr-cms-public-card" data-cms-record="'+esc(x.id)+'">'+(p.image?'<img loading="lazy" src="'+esc(p.image)+'" alt="'+esc(p.title||p.name)+'">':'')+'<small>'+esc(p.scope||cats[p.category]||'Liga')+'</small><h3>'+esc(p.title||p.name||'Liga Juventino')+'</h3><p>'+esc(p.body||p.description||'')+'</p>'+(p.url?'<a href="'+esc(p.url)+'" target="_blank" rel="noopener">'+(x.kind==='document'?'Abrir documento':'Ver transmisión')+'</a>':'')+'</article>'}
 function apply(){
  if(applying)return;applying=true;
  try{
   entry();const root=document.querySelector('#screen');if(!root)return;
   for(const x of active('page').filter(x=>x.payload.route===route())){
    const p=x.payload;let target=[...(p.chrome?document:root).querySelectorAll('[data-cms-selector]')].find(el=>el.dataset.cmsSelector===p.selector);
    if(!target)try{target=(p.chrome?document:root).querySelector(p.selector)}catch{}
    if(!target&&p.original)target=Array.from(root.querySelectorAll('h1,h2,h3,p,b,small,span,button')).find(n=>n.childElementCount===0&&n.textContent.trim()===p.original);
    if(!target)continue;target.dataset.cmsEdited='';
    if(p.text!==undefined&&target.childElementCount===0&&target.textContent!==p.text)target.textContent=p.text;
    if(p.image&&p.mediaType!=='video'&&!(target instanceof HTMLVideoElement)){
     target.querySelectorAll('video[data-cms-video]').forEach(video=>{video.pause();const wrapper=video.closest('.v977-player');if(wrapper&&wrapper!==target&&target.contains(wrapper))wrapper.remove();else video.remove()});
    }
    if(p.image&&p.mediaType!=='video'&&target instanceof HTMLVideoElement){
     const image=document.createElement('img');image.className=target.className;image.dataset.cmsSelector=p.selector;image.alt=p.original||'Contenido de la Liga';image.style.cssText=target.style.cssText;
     const wrapper=target.closest('.v977-player');if(wrapper)wrapper.replaceWith(image);else target.replaceWith(image);target=image;
    }
    if(p.image&&p.mediaType==='video'){
     let video=target.matches('video')?target:target.querySelector('video[data-cms-video]');
     if(!video){video=document.createElement('video');video.dataset.cmsVideo=x.id;video.controls=true;video.playsInline=true;video.preload='none';video.style.cssText='display:block;width:100%;height:100%;object-fit:cover';
      if(target instanceof HTMLImageElement){video.className=target.className;video.dataset.cmsSelector=p.selector;target.replaceWith(video);target=video}else{target.querySelectorAll('img,video').forEach(el=>el.remove());target.style.backgroundImage='none';target.prepend(video)}
     }
     if(video.getAttribute('src')!==p.image)video.src=p.image;
    }
    if(p.image&&p.mediaType!=='video'&&target instanceof HTMLImageElement&&target.src!==p.image)target.src=p.image;
    if(p.image&&p.mediaType!=='video'&&!(target instanceof HTMLImageElement))target.style.backgroundImage='url("'+p.image.replace(/"/g,'%22')+'")';
    if(p.hidden)target.hidden=true;
    if(p.color&&/^#[0-9a-f]{6}$/i.test(p.color))target.style.setProperty('color',p.color,'important');
    if(p.background&&/^#[0-9a-f]{6}$/i.test(p.background))target.style.setProperty('background-color',p.background,'important');
    if(p.radius)target.style.setProperty('border-radius',Math.min(32,Number(p.radius))+'px','important');
   }
   let list= root.querySelector('[data-cms-public-feed]');
   const relevant=route()==='news'?active('news'):['cedulas','rulebook'].includes(route())?active('document'):['video','match','matchCenter'].includes(route())?active('transmission'):route()==='club-store'?active('product'):[];
   if(relevant.length){if(!list){list=document.createElement('section');list.dataset.cmsPublicFeed='';const existing=root.querySelector('[data-news-list]');if(existing)existing.prepend(list);else root.append(list)}const html=relevant.map(publicCard).join('');if(list.innerHTML!==html)list.innerHTML=html}
   else list?.remove();
  }finally{applying=false}
 }
 async function open(initialKind){
  if(!media()?.admin)return media()?.login(()=>open(initialKind));
  const n=modal('Administración de la Liga','<div class="cms-kind-grid">'+Object.entries(kindNames).map(([k,label])=>'<button data-cms-kind="'+k+'">'+label+'</button>').join('')+'<button data-cms-inbox>Buzón de ayuda</button><div data-cms-list></div>');
  n.querySelectorAll('[data-cms-kind]').forEach(b=>b.onclick=()=>showList(b.dataset.cmsKind,n));n.querySelector('[data-cms-inbox]').onclick=()=>inbox(n);if(typeof initialKind==='string'&&kindNames[initialKind])await showList(initialKind,n);
 }
 async function showList(kind,n){
  const list=n?.querySelector('[data-cms-list]');
  if(!list||!kindNames[kind])return;
  // Render immediately: do not block opening the editor on an API request.
  const token=String(Date.now())+'-'+Math.random();
  list.dataset.cmsRequest=token;
  list.replaceChildren();
  n.querySelectorAll('[data-cms-kind]').forEach(button=>{
    const chosen=button.dataset.cmsKind===kind;
    button.classList.toggle('is-active',chosen);
    button.setAttribute('aria-pressed',String(chosen));
  });
  const h=document.createElement('h3');h.textContent=kindNames[kind];list.append(h);
  const add=document.createElement('button');add.type='button';
  add.textContent=['scorers','standings','fixture','sanction'].includes(kind)?'Entrar al editor de tabla':'Crear nuevo / abrir editor';
  add.onclick=()=>{
    if(!media()?.admin){media()?.login?.(()=>open(kind));return}
    if(['scorers','standings','fixture','sanction'].includes(kind))tableEditor(kind,records.filter(x=>x.kind===kind));
    else if(kind==='page')editPage();
    else editor(kind);
  };
  list.append(add);
  const progress=document.createElement('p');progress.className='cms-load-feedback';progress.setAttribute('role','status');
  progress.textContent='Cargando registros existentes… Puedes abrir el editor desde el botón de arriba.';
  list.append(progress);
  // The new CMS layout places results below a long grid. Bring the chosen
  // section into view so tapping a tile never appears to do nothing.
  requestAnimationFrame(()=>{
    if(n.isConnected&&list.dataset.cmsRequest===token){
      const panel=list.closest('.ljr-admin-results')||list;
      panel.scrollIntoView({behavior:'smooth',block:'start'});
    }
  });
  try{
    const response=await api('content?admin=1');
    if(!n.isConnected||list.dataset.cmsRequest!==token)return;
    if(!Array.isArray(response?.items))throw Error('El servidor no devolvió los registros.');
    const all=response.items;
    progress.remove();
    const items=all.filter(x=>x.kind===kind);
    if(!items.length){const empty=document.createElement('p');empty.className='cms-load-feedback';empty.textContent='Aún no hay registros de esta sección. Pulsa el botón de arriba para comenzar.';list.append(empty)}
    for(const x of items){
      const row=document.createElement('div');row.className='cms-record-row';
      const b=document.createElement('button');b.type='button';
      b.textContent=(x.payload?.title||x.payload?.name||cats[x.payload?.category]||x.payload?.route||'Contenido')+(x.published?'':' · Borrador');
      b.onclick=()=>Array.isArray(x.payload?.rows)?tableEditor(kind,all,x):editor(kind,x);
      const del=document.createElement('button');del.type='button';del.textContent='Retirar';
      del.onclick=async()=>{
        if(!confirm('¿Retirar este contenido?'))return;
        try{await api('content/'+encodeURIComponent(x.id),{method:'DELETE',body:{revision:x.revision}});await refresh();showList(kind,n)}
        catch(err){const status=n.querySelector('[data-status]');if(status)status.textContent=err.message||'No se pudo retirar.'}
      };
      row.append(b,del);list.append(row);
    }
  }catch(err){
    if(!n.isConnected||list.dataset.cmsRequest!==token)return;
    progress.textContent='No se pudieron consultar los registros: '+(err?.message||'sin conexión')+'. El editor se puede abrir arriba; guardar requiere una sesión y conexión válidas.';
    const status=n.querySelector('[data-status]');if(status)status.textContent='Revisa la conexión con el servidor de administración.';
  }
 }
  const schemas={
  news:[['title','Título'],['scope','Sección','select',['Liga','Equipos','Fichajes']],['body','Texto','textarea'],['image','Imagen','url']],
  document:[['title','Título'],['category','Categoría','category'],['body','Descripción','textarea'],['url','Archivo PDF o enlace','url']],
  transmission:[['title','Título'],['category','Categoría','category'],['body','Descripción','textarea'],['url','Enlace público del directo','url'],['image','Portada','url']],
  product:[['name','Nombre del producto'],['body','Descripción','textarea'],['price','Precio','number'],['image','Imagen','url'],['url','Enlace para pedidos','url']],
  team:[['name','Nombre del equipo'],['category','Categoría','category'],['community','Ciudad o comunidad'],['field','Campo'],['logo','Logo PNG sin fondo','url']],
  player:[['name','Nombre completo'],['category','Categoría','category'],['team','Equipo','team'],['birthdate','Fecha de nacimiento','date'],['photo','Foto del jugador','url'],['number','Número','number']],
  page:[['route','Pantalla'],['selector','Elemento'],['original','Texto original'],['text','Texto nuevo','textarea'],['image','Imagen o video','url'],['mediaType','Tipo de archivo','select',['image','video']],['color','Color de letra','color'],['background','Color de fondo','color'],['radius','Redondeado','number']],
  design:[['title','Nombre del diseño'],['image','Imagen PNG','url'],['body','Descripción','textarea']]
 };
 function editor(kind,rec,initial){
  const p=rec?.payload||initial||{},fields=schemas[kind]||schemas.news;
  const n=modal(rec?'Editar '+kindNames[kind]:'Crear '+kindNames[kind],'<form class="cms-form">'+fields.map(([key,label,type='text',opts])=>'<label>'+label+(type==='textarea'?'<textarea name="'+key+'" rows="4">'+esc(p[key])+'</textarea>':type==='category'?'<select name="'+key+'">'+catOptions(p[key])+'</select>':type==='select'?'<select name="'+key+'">'+opts.map(v=>'<option value="'+esc(v)+'" '+(p[key]===v?'selected':'')+'>'+esc(({image:'Foto o imagen',video:'Video'})[v]||v)+'</option>').join('')+'</select>':'<input name="'+key+'" type="'+(type==='team'?'text':type)+'" value="'+esc(p[key]||(type==='color'?'#ffffff':''))+'" '+(['title','name'].includes(key)?'required':'')+(type==='team'?' list="cms-teams"':'')+'>')+'</label>').join('')+'<datalist id="cms-teams">'+teamNames(p.category).map(v=>'<option>'+esc(v)+'</option>').join('')+'</datalist><label>Foto, video o documento desde el teléfono (hasta 25 MB)<input type="file" data-cms-file accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,application/pdf"></label><p class="cms-help-hint">Elige un archivo o pega su enlace. Revisa los datos y pulsa Guardar cambios para publicarlo. Para videos grandes usa Subir video; para cambiar un cuadro selecciona Editar esta página.</p><label class="liga-remember"><input type="checkbox" name="published" '+(!rec||rec.published?'checked':'')+'> Publicar para todos</label><button type="submit">Guardar cambios</button></form>');
  n.querySelector('section')?.classList.add('ljr-content-studio');
  for(const key of ['color','background']){const field=n.querySelector('[name='+key+']');if(field)field.addEventListener('input',()=>field.dataset.cmsColorChanged='1')}
  for(const key of ['image','photo','logo']){const field=n.querySelector('[name='+key+']');if(!field)continue;const b=document.createElement('button'),preview=document.createElement('img');b.type='button';b.textContent='Elegir '+(key==='logo'?'escudo':'imagen')+' guardado';preview.className='ljr-content-preview';preview.alt='Vista previa del archivo';preview.hidden=!field.value;preview.src=field.value;b.onclick=()=>window.LJR_CONTENT_ASSETS.pick(a=>{field.value=a.url;n.querySelector('[data-cms-file]').value='';preview.src=a.url;preview.hidden=false},key==='logo'?'logo':'');field.oninput=()=>{preview.src=field.value;preview.hidden=!field.value};field.parentElement.after(b,preview);}
  n.querySelector('form').onsubmit=async ev=>{ev.preventDefault();const button=ev.target.querySelector('[type=submit]'),status=n.querySelector('[data-status]');button.disabled=true;
   try{const data=Object.fromEntries(new FormData(ev.target)),payload={...p,...data};delete payload.published;for(const key of ['color','background'])if(!p[key]&&!ev.target.querySelector('[name='+key+']')?.dataset.cmsColorChanged)delete payload[key];const file=n.querySelector('[data-cms-file]').files[0];if(file){status.textContent='Subiendo archivo…';payload.mediaType=file.type.startsWith('video/')?'video':'image';payload[file.type==='application/pdf'?'url':kind==='team'?'logo':kind==='player'?'photo':'image']=await upload(file,data.title||data.name||'Liga Juventino')}
    const id=rec?.id||'content:'+crypto.randomUUID();await api('content/'+encodeURIComponent(id),{method:'PUT',body:{kind,payload,revision:rec?.revision||0,published:data.published==='on'}});await refresh();status.textContent='Cambios guardados para la Liga.';button.textContent='Guardado';button.disabled=true;
   }catch(err){status.textContent=err.message;button.disabled=false}
  };
 }
 async function upload(file,title){if(file.size>25*1024*1024)throw Error('Usa un archivo de hasta 25 MB.');const draft=await api('media',{method:'POST',body:{title,kind:file.type.startsWith('video/')?'video':'photo',mime:file.type,category:'all',placement:'cms'}});await api('media/'+draft.id,{method:'PUT',headers:{'Content-Type':file.type,'X-File-Size':String(file.size)},body:file});return base+'/api/file/'+draft.id}
 function teamNames(category){const db=snapshot(),names=[];for(const [id,c]of Object.entries(db.categories||{})){if(category&&id!==category)continue;for(const name of Object.keys(c.rosters||{}))names.push(name);for(const row of c.standings?.[0]?.rows||[])if(row[1])names.push(row[1])}return [...new Set(names)].sort()}
 function tableEditor(kind,all=[],rec){
  const source={scorers:'scorers',standings:'standings',fixture:'fixtures',sanction:'suspensions'}[kind];
  const n=modal(kindNames[kind],'<label>Categoría<select data-category>'+catOptions(rec?.payload.category)+'</select></label><div class="cms-table-actions"><button type="button" data-add-row>Añadir fila</button>'+(kind==='fixture'?'<label>Reprogramar jornada<input type="number" min="1" data-round placeholder="Jornada"></label><label>Nueva fecha<input type="date" data-date></label><button type="button" data-postpone>Aplicar fecha a jornada</button>':'')+'</div><div class="cms-table-wrap"><table class="cms-edit-table"></table></div><button type="button" data-save-table>Guardar tabla para todos</button>');
  let selected=rec,headers=[],rows=[];
  const select=n.querySelector('[data-category]');
  function load(){selected=all.find(x=>x.kind===kind&&String(x.payload.category)===select.value)||null;const block=selected?.payload||snapshot().categories?.[select.value]?.[source]?.[0]||{headers:kind==='sanction'?['Jugador','Equipo','Motivo','Hasta']:['#','Jugador','Equipo','Goles'],rows:[]};headers=block.headers;rows=structuredClone(block.rows||[]);if(kind==='sanction'&&headers.length===1){headers=['Jugador','Equipo','Motivo','Hasta'];rows=[]}draw()}
  function draw(){n.querySelector('table').innerHTML='<thead><tr>'+headers.map(h=>'<th>'+esc(h)+'</th>').join('')+'<th></th></tr></thead><tbody>'+rows.map((row,i)=>'<tr>'+headers.map((h,j)=>'<td><input aria-label="'+esc(h)+' fila '+(i+1)+'" data-row="'+i+'" data-col="'+j+'" value="'+esc(row[j])+'" '+(/Equipo|Local|Visitante/.test(h)?'list="cms-table-teams"':'')+'></td>').join('')+'<td><button type="button" data-delete-row="'+i+'" aria-label="Quitar fila">×</button></td></tr>').join('')+'</tbody>';n.querySelectorAll('[data-row]').forEach(input=>input.oninput=()=>rows[Number(input.dataset.row)][Number(input.dataset.col)]=input.value);n.querySelectorAll('[data-delete-row]').forEach(b=>b.onclick=()=>{rows.splice(Number(b.dataset.deleteRow),1);draw()});let dl=n.querySelector('datalist');if(!dl){dl=document.createElement('datalist');dl.id='cms-table-teams';n.querySelector('section').append(dl)}dl.innerHTML=teamNames(select.value).map(t=>'<option>'+esc(t)+'</option>').join('')}
  select.onchange=load;n.querySelector('[data-add-row]').onclick=()=>{rows.push(headers.map(()=>''));draw()};
  n.querySelector('[data-postpone]')?.addEventListener('click',()=>{
   const round=String(n.querySelector('[data-round]')?.value||'').trim();
   const date=n.querySelector('[data-date]')?.value||'';
   const status=n.querySelector('[data-status]');
   if(!/^[1-9]\d*$/.test(round)||!/^\d{4}-\d{2}-\d{2}$/.test(date)){
     status.textContent='Escribe el número de jornada y selecciona una fecha válida.';return;
   }
   const dateColumn=headers.findIndex(h=>/fecha|\bd[ií]a\b/i.test(String(h)));
   const index=dateColumn>=0?dateColumn:8;
   const matching=rows.filter(r=>String(r[1]??'').trim()===round);
   if(!matching.length){status.textContent='No se encontraron partidos de la jornada '+round+' en esta categoría. Revisa el número.';return}
   if(!confirm('¿Aplicar la nueva fecha a '+matching.length+' partido(s) de la jornada '+round+'? Todavía deberás guardar para publicar.'))return;
   const [y,m,d]=date.split('-');
   matching.forEach(r=>{
     const time=String(r[index]||'').match(/\b([01]\d|2[0-3]):[0-5]\d\b/)?.[0]||'';
     r[index]=d+'/'+m+'/'+y+(time?' '+time:'');
   });
   status.textContent='Fecha aplicada a '+matching.length+' partido(s) en la vista previa. Pulsa Guardar tabla para todos para publicar.';
   draw();
  });
  n.querySelector('[data-save-table]').onclick=async()=>{const b=n.querySelector('[data-save-table]');b.disabled=true;try{const id=selected?.id||'table:'+kind+':'+select.value;const result=await api('content/'+encodeURIComponent(id),{method:'PUT',body:{kind,payload:{category:select.value,headers,rows},revision:selected?.revision||0,published:true}});selected={id,kind,revision:result.revision,payload:{category:select.value,headers,rows},published:1};await refresh();n.querySelector('[data-status]').textContent='Tabla publicada. Se aplica a las pantallas y a las exportaciones.'}catch(err){n.querySelector('[data-status]').textContent=err.message}finally{b.disabled=false}};load();
 }
 function adminHelp(){
  if(!media()?.admin)return;
  modal('Guía del administrador','<div class="cms-form"><h3>1. Entra con tu cuenta autorizada</h3><p>Abre Más → Herramientas → Administración. Al iniciar sesión verás los botones de edición en cada pantalla.</p><h3>2. Historias en círculos</h3><p>En Inicio o Performance Zone pulsa Historia · 24 h. Escribe el título y el nombre del círculo o equipo, elige foto o video, selecciona la sección y pulsa Publicar. La historia aparece durante 24 horas.</p><h3>3. Videos en Momentos y Liga Juventino TV</h3><p>Abre la sección y pulsa Subir video. Selecciona un archivo del teléfono o Grabar con el teléfono. Espera a que el porcentaje llegue al final y se confirme la publicación. Se admiten archivos de hasta 500 MB.</p><h3>4. Cambiar un cuadro, texto, foto o diseño</h3><p>Pulsa Editar esta página → Seleccionar elemento y toca el cuadro, imagen o texto. Elige el archivo (hasta 25 MB), cambia los textos o colores y pulsa Guardar cambios. También puedes seleccionar los elementos de la cabecera. Para un video mayor, súbelo desde Subir video y pega su enlace en Imagen o video del cuadro y selecciona Tipo de archivo → Video.</p><h3>5. Equipos, jugadores y herramientas</h3><p>En Administrar contenido elige Equipos, Jugadores, Jornadas, Goleadores, Clasificación, Documentos o Diseños. Abre un registro para cambiarlo o Crear nuevo para añadirlo. Las tablas permiten añadir y quitar filas; guarda para publicar.</p><h3>6. Cambiar o retirar publicaciones</h3><p>En Administración → Mis publicaciones abre el contenido y usa sus controles para editarlo o retirarlo. Los cambios publicados se muestran a los visitantes cuando tienen conexión. Sin internet puedes consultar los datos guardados y preparar herramientas; subir y publicar requiere conexión.</p></div>');
 }
 function editPage(){
  if(!media()?.admin)return;
  modal('Editar esta página','<p>Toca el texto, imagen o tarjeta que quieres cambiar. Después podrás subir su imagen, modificar el texto o ajustar sus colores.</p><button data-pick-element>Seleccionar elemento</button>').querySelector('[data-pick-element]').onclick=function(){this.closest('.liga-media-modal').querySelector('[data-close]').click();document.body.classList.add('cms-picking');const cancel=document.createElement('button');cancel.textContent='Cancelar selección';cancel.style.cssText='position:fixed;bottom:20px;left:20px;z-index:999999;padding:14px;background:#153962;color:white;border:2px solid #7ee5f3;border-radius:12px';document.body.append(cancel);const cleanup=()=>{document.body.classList.remove('cms-picking');document.removeEventListener('click',handler,true);document.removeEventListener('keydown',escape);cancel.remove()};const escape=e=>{if(e.key==='Escape')cleanup()};cancel.onclick=e=>{e.stopPropagation();cleanup()};document.addEventListener('keydown',escape);const handler=e=>{const target=e.target.closest('img,video,h1,h2,h3,p,small,b,span,button,article,section');if(!target||!(target.closest('#screen')||target.closest('#app>.topbar')||target.closest('.bottom-nav'))||target.closest('.ljr-cms-entry'))return;e.preventDefault();e.stopImmediatePropagation();cleanup();const nodes=[];let t=target;const chrome=!target.closest('#screen');while(t&&(chrome?t.id!=='app':t.id!=='screen')){const siblings=[...t.parentElement.children].filter(x=>x.tagName===t.tagName);nodes.unshift(t.tagName.toLowerCase()+':nth-of-type('+(siblings.indexOf(t)+1)+')');t=t.parentElement}const selector=target.dataset.cmsSelector||((chrome?'#app > ':'')+nodes.join(' > ')),old=records.find(x=>x.kind==='page'&&x.payload.route===route()&&x.payload.selector===selector);editor('page',old,{route:route(),selector,chrome,original:target.childElementCount===0?target.textContent.trim():'',text:target.childElementCount===0?target.textContent.trim():undefined,image:target instanceof HTMLImageElement?target.src:'',radius:parseFloat(getComputedStyle(target).borderRadius)||0})};document.addEventListener('click',handler,true)};
 }
 async function inbox(n){try{const data=await api('feedback');const list=n.querySelector('[data-cms-list]');list.innerHTML='<h3>Buzón de ayuda</h3>'+data.items.map(x=>'<article class="cms-record-row"><div><b>'+esc(x.name)+'</b><p>'+esc(x.message)+'</p><small>'+new Date(x.created).toLocaleString('es-MX')+'</small></div><select data-feedback="'+esc(x.id)+'">'+['nuevo','revisado','resuelto'].map(s=>'<option '+(s===x.status?'selected':'')+'>'+s+'</option>').join('')+'</select></article>').join('');list.querySelectorAll('[data-feedback]').forEach(s=>s.onchange=async()=>{try{await api('feedback/'+s.dataset.feedback,{method:'PUT',body:{status:s.value}})}catch(err){n.querySelector('[data-status]').textContent=err.message}})}catch(err){n.querySelector('[data-status]').textContent=err.message}}
 window.LJR_CMS={open,refresh,applyOfficialData,editPage,editor,upload,help:adminHelp,get records(){return records},get loaded(){return loaded},esc,cats};
 addEventListener('hashchange',()=>{clearTimeout(timer);timer=setTimeout(apply,100)});addEventListener('liga:admin',apply);
 const root=document.querySelector('#screen');if(root)new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(apply,70)}).observe(root,{childList:true,subtree:true});
 if(document.querySelector('[data-media-page]')){fetch('/league-data.json').then(r=>r.json()).then(db=>{window.LJR_OFFICIAL_DATA=db;rawData=db;refresh()}).catch(()=>refresh())}else refresh();setInterval(refresh,60000);
})();
