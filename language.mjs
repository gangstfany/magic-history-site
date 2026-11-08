/** Language selection and canonical, same-origin course resume state. */
export const normalizeLanguage=value=>value==='en'?'en':'zh';
export const moduleLanguageURL=(spec,language)=>language==='en'?(spec?.englishUrl||null):(spec?.url||null);
const canonical=value=>typeof value==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,139}$/.test(value)?value:null;
export function validateResume(value){
 if(!value||!['all',...Array.from({length:9},(_,i)=>'u'+(i+1))].includes(value.period))return null;
 return {period:value.period,view:['chain','map','quiz'].includes(value.view)?value.view:'chain',mapMode:['events','routes'].includes(value.mapMode)?value.mapMode:'events',chainId:canonical(value.chainId),chainStep:Number.isSafeInteger(value.chainStep)&&value.chainStep>=0&&value.chainStep<100?value.chainStep:0,chainRevision:canonical(value.chainRevision),eventId:canonical(value.eventId),studyId:canonical(value.studyId),query:typeof value.query==='string'?value.query.slice(0,200):'',cats:Array.isArray(value.cats)?value.cats.filter(x=>typeof x==='string'&&/^[A-Z]{2,4}$/.test(x)).slice(0,6):[],theme:canonical(value.theme),group:canonical(value.group),hash:typeof value.hash==='string'&&/^#case-[A-Za-z0-9_-]+$/.test(value.hash)?value.hash:''};
}
export function captureCourseState(frame){
 try{
  const course=frame.contentWindow,map=course.document.getElementById('worldMapFrame')?.contentWindow,api=map?.__mapFilter;if(!api)return null;
  const state=api.getState(),learning=api.getLearningState(),url=new URL(course.location.href);
  return validateResume({...learning,period:state.period,query:state.query,cats:[...state.cats],eventId:api.getTimelineState?.().selectedEventKey,studyId:api.getLocationStudyUiState?.().studyId,theme:url.searchParams.get('theme'),group:url.searchParams.get('group'),hash:url.hash});
 }catch{return null;}
}
export async function restoreCourseState(frame,raw,isCurrent=()=>true){
 const state=validateResume(raw);if(!state)return false;
 let api;
 for(let i=0;i<120&&isCurrent();i++){
  try{api=frame.contentWindow.document.getElementById('worldMapFrame')?.contentWindow?.__mapFilter;}catch{return false;}
  if(api)break;await new Promise(resolve=>setTimeout(resolve,50));
 }
 if(!api||!isCurrent())return false;
 api.reset({includeRegion:true});api.setPeriod(state.period);
 api.setLearningView(state.view);if(state.view==='map')api.setMapMode(state.mapMode);
 if(state.view==='chain'&&state.chainId){api.enterRoute(state.chainId);api.routeStep(state.chainStep);}
 else if(state.studyId)api.openFavorite({id:state.studyId,kind:'study-point'});
 else if(state.eventId&&state.view==='map')api.openFavorite({id:state.eventId,kind:'event'});
 if(state.query)api.setQuery(state.query);
 if(state.cats.length){const active=api.getActiveCats();for(const cat of [...active])if(!state.cats.includes(cat))api.toggleCat(cat);for(const cat of state.cats)if(!active.has(cat))api.toggleCat(cat);}
 try{const course=frame.contentWindow;course.dispatchEvent(new course.Event('apwh-favorite-refresh'));}catch{}
 return true;
}
let language='zh',dictionary={},supplement={},applyScheduled=false;
const textMemory=new WeakMap(),attributeMemory=new WeakMap();
export const getLanguage=()=>language;
export function translate(value){
 if(language!=='en'||typeof value!=='string')return value;
 if(dictionary[value]!==undefined)return dictionary[value];if(supplement[value]!==undefined)return supplement[value];
 const clean=value.trim();const english=dictionary[clean]??supplement[clean];if(english!==undefined)return value.replace(clean,english);
 return value.replace(/(\d+) 秒后可重试/g,'Retry in $1 seconds').replace(/请等待 (\d+) 秒后再发送邮件。/g,'Wait $1 seconds before sending another email.').replace(/(\d+) 条收藏/g,'$1 favorites').replace(/^移除收藏：/,'Remove favorite: ').replace(/独立页面/g,'Separate page');
}
function applyDocument(){
 applyScheduled=false;const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 while(walk.nextNode()){
  const node=walk.currentNode;if(node.parentElement?.closest('script,style,.lang-switch,[data-account-private]'))continue;
  let memory=textMemory.get(node);if(!memory||node.nodeValue!==memory.last)memory={source:node.nodeValue};
  const next=language==='en'?translate(memory.source):memory.source;if(node.nodeValue!==next)node.nodeValue=next;memory.last=next;textMemory.set(node,memory);
 }
 for(const el of document.querySelectorAll('[aria-label],[title],[placeholder]')){
  if(el.closest('.lang-switch'))continue;
  let memory=attributeMemory.get(el);if(!memory){memory={};attributeMemory.set(el,memory);}
  for(const name of ['aria-label','title','placeholder']){
   const current=el.getAttribute(name);if(current===null)continue;
   if(!memory[name]||current!==memory[name].last)memory[name]={source:current};
   const next=language==='en'?translate(memory[name].source):memory[name].source;
   if(current!==next)el.setAttribute(name,next);memory[name].last=next;
  }
 }
}
function schedule(){if(!applyScheduled){applyScheduled=true;queueMicrotask(applyDocument);}}
export async function initializeLanguage({onChange}){
 try{dictionary=await fetch(new URL('homepage-translations.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('translations');return r.json();});}catch{dictionary={};}
 try{const response=await fetch(new URL('account-translations.json',import.meta.url));if(response.ok)Object.assign(dictionary,await response.json());}catch{}
 let stored;try{stored=localStorage.getItem('magic-history:language:v1');}catch{}
 const query=new URLSearchParams(location.search);language=normalizeLanguage(query.has('lang')?query.get('lang'):stored);
 function choose(next,notify=true){
  const previous=language;language=normalizeLanguage(next);document.documentElement.lang=language==='en'?'en':'zh-CN';
  for(const button of document.querySelectorAll('.lang')){const active=button.dataset.lang===language;button.classList.toggle('active',active);button.setAttribute('aria-current',String(active));button.setAttribute('aria-pressed',String(active));}
  const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);
  try{localStorage.setItem('magic-history:language:v1',language);}catch{}
  applyDocument();if(notify&&previous!==language)onChange?.(language,previous);
 }
 for(const button of document.querySelectorAll('.lang'))button.addEventListener('click',()=>choose(button.dataset.lang));
 new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true});choose(language,false);
 return language;
}
export async function loadCourseTranslations(courseURL){
 if(!courseURL)return;try{const url=new URL('display-translations.json',courseURL);const response=await fetch(url);if(response.ok){supplement=await response.json();schedule();}}catch{}
}
