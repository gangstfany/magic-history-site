export const FAVORITES_KEY='magic-history:favorites:v1';
export const COURSE_TITLES=Object.freeze({apwh:'World History',apeuro:'Euro History',art:'Art History'});
const KINDS={apwh:new Set(['study-point','event','chain']),apeuro:new Set(['study-card']),art:new Set(['artwork'])};
const plain=(value,max,empty=false)=>typeof value==='string'&&value.length<=max&&(empty||value.trim().length>0)&&!/[\u0000-\u001f\u007f]/u.test(value);
export function favoriteKey(course,item){return `${course}/${item.kind}/${item.id}`;}
export function normalizeFavorite(course,item,now=Date.now()){
 if(typeof course!=='string'||!Object.hasOwn(KINDS,course)||!item||typeof item!=='object'||Array.isArray(item)||!KINDS[course].has(item.kind)||!plain(item.id,140)||!/[A-Za-z0-9]/.test(item.id[0])||!/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,139}$/.test(item.id)||!plain(item.title,180)||!plain(item.subtitle??'',240,true)||!plain(item.unit,32,true))return null;
 return {course,id:item.id,kind:item.kind,title:item.title.trim(),subtitle:(item.subtitle||'').trim(),unit:item.unit,createdAt:typeof now==='number'&&Number.isFinite(now)?now:Date.now()};
}
export function createFavoritesStore(storage,clock=()=>Date.now()){
 let records=[],persistent=true;const listeners=new Set();
 let rawText;try{rawText=storage?.getItem(FAVORITES_KEY);}catch{persistent=false;}
 try{const raw=JSON.parse(rawText||'null');if(raw?.version===1&&Array.isArray(raw.items)){const seen=new Set();for(const item of raw.items.slice(0,2000)){const valid=normalizeFavorite(item?.course,item,item?.createdAt);if(valid&&!seen.has(favoriteKey(valid.course,valid))){records.push(valid);seen.add(favoriteKey(valid.course,valid));}}}}catch{}
 const copy=()=>records.map(x=>({...x}));
 function save(){try{if(!storage)throw Error('storage unavailable');storage.setItem(FAVORITES_KEY,JSON.stringify({version:1,items:records}));}catch{persistent=false;}for(const listener of listeners)listener(copy());}
 function add(course,item){const valid=normalizeFavorite(course,item,clock());if(!valid)return false;const key=favoriteKey(course,valid),i=records.findIndex(r=>favoriteKey(r.course,r)===key);if(i>=0)records[i]={...valid,createdAt:records[i].createdAt};else{if(records.length>=2000)return false;records.unshift(valid);}save();return true;}
 return {items:copy,forCourse:course=>copy().filter(x=>x.course===course),persistent:()=>persistent,
  subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},add,
  remove(key){const before=records.length;records=records.filter(x=>favoriteKey(x.course,x)!==key);if(records.length!==before)save();return records.length!==before;},
  import(course,items){if(!Array.isArray(items))return;const keys=new Set(records.map(x=>favoriteKey(x.course,x)));for(const item of items.slice(0,2000)){const valid=normalizeFavorite(course,item,clock());if(valid&&!keys.has(favoriteKey(course,valid))&&records.length<2000){records.unshift(valid);keys.add(favoriteKey(course,valid));}}save();}
 };
}
