import {createFavoritesStore,favoriteKey} from './favorites.mjs';
import {mountFavoritesUI} from './favorites-ui.mjs';
import {message,trustedEvent,safeHeight,courseURL} from './module-protocol.mjs';
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const scrollMap=()=>document.getElementById('home-map-embed').scrollIntoView({block:'start',behavior:reduceMotion.matches?'auto':'smooth'});
const $=id=>document.getElementById(id);
const views=[...document.querySelectorAll('.view')],nav=[...document.querySelectorAll('.navlinks li')];
function showView(name){
 views.forEach(v=>v.classList.toggle('active',v.id==='view-'+name));
 nav.forEach(n=>n.classList.toggle('active',n.dataset.view===name));
 document.querySelector('.card').classList.toggle('boxed',name!=='home');
}
nav.forEach(n=>n.addEventListener('click',()=>{showView(n.dataset.view||'home');if(n.hasAttribute('data-nav-scroll'))scrollMap();}));
document.querySelectorAll('[data-goto]').forEach(el=>el.addEventListener('click',()=>showView(el.dataset.goto)));
document.querySelectorAll('[data-scroll]').forEach(el=>el.addEventListener('click',scrollMap));
let active='world',config,bootFailed=false;
const states=new Map();
const frames={world:$('worldCourseFrame'),euro:$('euroCourseFrame'),art:$('artCourseFrame')};
let favoriteStorage;try{favoriteStorage=localStorage;}catch{}
const favorites=createFavoritesStore(favoriteStorage);
const favoriteUI=mountFavoritesUI(favorites,{openItem:openFavorite});
let toastTimer;
function favoriteToast(text){$('favoritesToast').textContent=text;$('favoritesToast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('favoritesToast').hidden=true,5000);}
function sendFavorites(state){state.frame.contentWindow.postMessage(message(state.module,'favorites-sync',{items:favorites.forCourse(state.module)}),state.origin);}
function dispatchFavorite(state){if(!state.ready||!state.pendingFavorite)return;const item=state.pendingFavorite;state.frame.contentWindow.postMessage(message(state.module,'open-favorite',{item:{id:item.id,kind:item.kind}}),state.origin);}
function openFavorite(item){const key={apwh:'world',apeuro:'euro',art:'art'}[item.course];if(!key||!config){favoriteToast('课程正在初始化，请稍后重试。');return;}showView('home');selectSubject(key);const state=states.get(key);if(!state){favoriteToast('这门课程暂时无法打开。');return;}state.pendingFavorite=item;dispatchFavorite(state);scrollMap();}
favorites.subscribe(()=>{for(const state of states.values())if(state.ready)sendFavorites(state);});
function setStatus(text,retry=false){$('moduleStatus').hidden=!text;$('moduleMessage').textContent=text;$('retryModule').hidden=!retry;}
function start(key,reload=false){
 const spec=config?.modules?.[key];if(!spec)return;
 let state=states.get(key);
 if(state&&!reload){setStatus(state.ready?'':state.failed?'课程暂时未能载入。':'正在加载课程…',state.failed);return;}
 if(state)clearTimeout(state.timer);
 const url=courseURL(spec.url,location.href);
 if(!url){setStatus('课程地址配置无效。',true);return;}
 url.searchParams.set('hostOrigin',location.origin);
 // Revalidate each independent course on a fresh load; switching retains existing frames.
 url.searchParams.set('load',String(Date.now()));
 const frame=frames[key];
 state={frame,url,origin:url.origin,module:spec.module,ready:false,failed:false,timer:null,pendingFavorite:state?.pendingFavorite||null};states.set(key,state);
 state.timer=setTimeout(()=>{state.failed=true;if(active===key)setStatus('课程暂时未能载入，首页仍可正常使用。',true);},15000);
 frame.onload=()=>frame.contentWindow.postMessage(message(spec.module,'init',{favorites:favorites.forCourse(spec.module)}),url.origin);
 frame.src=url.href;setStatus('正在加载课程…');
}
function selectSubject(key){
 active=key;
 document.querySelectorAll('.subj-pill').forEach(p=>{p.classList.toggle('active',p.dataset.subj===key);p.setAttribute('aria-pressed',String(p.dataset.subj===key));});
 Object.entries(frames).forEach(([k,f])=>{f.hidden=k!==key;});
 const live=!!frames[key];$('courseComingSoon').hidden=live;
 $('todayPick').style.display=key==='world'&&$('todayPick').dataset.ready?'block':'none';
 if(live){if(config)start(key);return;}
 setStatus('');
 $('courseComingTitle').textContent=({euro:'Euro History',us:'US History',geo:'Human Geography'})[key]||'Coming soon';
 $('courseComingDescription').textContent=key==='us'?'美国史提供独立地图入口。':'这一科的互动地图正在制作中。';
 $('usHistoryLink').hidden=key!=='us';
 if(config)$('usHistoryLink').href=config.usHistoryUrl;
}
function renderPick(data){
 if(!data||typeof data!=='object')return;
 const fields=['dateLabel','year','city','category','summary'];
 if(!fields.every(key=>typeof data[key]==='string'&&data[key].length<=3000))return;
 const pick=$('todayPick');pick.replaceChildren();
 const node=(tag,className,text)=>{const el=document.createElement(tag);el.className=className;el.textContent=text;return el;};
 pick.append(node('div','tp-eyebrow',data.dateLabel));
 const top=node('div','tp-top','');top.append(node('span','tp-yr',data.year),node('span','tp-city',data.city),node('span','tp-cat',data.category));
 pick.append(top,node('div','tp-trig',data.summary),node('div','tp-cta','在地图上查看这一事件（重置筛选） →'));
 pick.dataset.ready='true';pick.style.display=active==='world'?'block':'none';
}
addEventListener('message',event=>{
 for(const [key,state]of states){
  if(!trustedEvent(event,state.frame.contentWindow,state.origin,state.module,['ready','resize','today-pick','favorites-import','favorite-change','favorite-opened']))continue;
  if(event.data.type==='ready'){
   state.ready=true;state.failed=false;clearTimeout(state.timer);if(active===key)setStatus('');sendFavorites(state);dispatchFavorite(state);
  }
  if(event.data.type==='favorites-import'){favorites.import(state.module,event.data.items);return;}
  if(!state.ready)return;
  if(event.data.type==='favorite-change'){
   const {action,item}=event.data;
   if(action==='add'){if(!favorites.add(state.module,item)){sendFavorites(state);favoriteToast('这条收藏未能保存，请重新打开内容后再试。');}}
   else if(action==='remove'&&item&&typeof item.id==='string'&&typeof item.kind==='string'){favorites.remove(favoriteKey(state.module,item));sendFavorites(state);}
   return;
  }
  if(event.data.type==='favorite-opened'){
   const target=state.pendingFavorite;
   if(target&&target.id===event.data.id&&target.kind===event.data.kind){state.pendingFavorite=null;favoriteToast(event.data.ok===true?'已打开收藏内容。':'这条内容可能已调整，可从当前课程继续查找。');}
   return;
  }
  const height=safeHeight(event.data.height,state.module);if(height!==null)state.frame.style.height=height+'px';
  if(key==='world'&&event.data.type==='today-pick')renderPick(event.data.pick);
  return;
 }
});
$('retryModule').addEventListener('click',()=>bootFailed?boot():start(active,true));
$('todayPick').addEventListener('click',()=>{const state=states.get('world');if(!state?.ready)return;showView('home');selectSubject('world');scrollMap();state.frame.contentWindow.postMessage(message('apwh','open-today'),state.origin);});
document.querySelectorAll('.subj-pill').forEach(p=>p.addEventListener('click',()=>selectSubject(p.dataset.subj)));
document.querySelectorAll('.subject-item').forEach(item=>item.addEventListener('click',()=>{showView('home');selectSubject(item.dataset.subject);scrollMap();}));
let hintTimer;
document.querySelectorAll('.lang').forEach(el=>el.addEventListener('click',()=>{if(el.dataset.lang!=='en')return;$('langHint').classList.add('show');clearTimeout(hintTimer);hintTimer=setTimeout(()=>$('langHint').classList.remove('show'),2200);}));
document.querySelectorAll('.navlinks li,.subject-item,.back-link,.feature-clickable,.subj-pill,.today-pick').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});});
async function boot(){try{
 bootFailed=false;setStatus('正在加载课程…');
 const response=await fetch('modules.json',{cache:'no-cache'});if(!response.ok)throw Error('config');
 config=await response.json();if(config.schemaVersion!==1||config.modules?.world?.module!=='apwh'||config.modules?.art?.module!=='art'||config.modules?.euro?.module!=='apeuro')throw Error('version');
 const us=new URL(config.usHistoryUrl,location.href);if(us.protocol!=='https:')throw Error('us-url');
 selectSubject(active);
}catch{bootFailed=true;setStatus('课程配置暂时未能载入，请重试。',true);}}
void boot();
