import {COURSE_TITLES,favoriteKey} from './favorites.mjs';
export function mountFavoritesUI(store,{openItem}){
 const byId=id=>document.getElementById(id),dialog=byId('favoritesDialog'),list=byId('favoritesList'),filter=byId('favoritesCourse'),search=byId('favoritesSearch');
 const node=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
 function render(){const all=store.items();byId('favoritesCount').textContent=all.length;const query=search.value.toLocaleLowerCase().trim(),items=all.filter(x=>(!filter.value||x.course===filter.value)&&(!query||[x.title,x.subtitle,x.unit,COURSE_TITLES[x.course]].join(' ').toLocaleLowerCase().includes(query)));list.replaceChildren();
  byId('favoritesStorage').textContent=store.persistent()?'收藏保存在当前浏览器，可跨课程集中查看。':'当前浏览器未允许保存，收藏暂存在本次页面中。';
  byId('favoritesResult').textContent=`${items.length} 条收藏`;
  if(!items.length){const empty=node('div','favorites-empty');empty.append(node('h3','',all.length?'没有符合条件的收藏':'还没有收藏'),node('p','',all.length?'试试切换学科或清空关键词。':'在课程卡片上点击 ☆ 收藏，就能从这里回到相应内容。'));list.append(empty);return;}
  for(const item of items){const card=node('article','favorite-card'),open=node('button','favorite-open'),meta=node('span','favorite-meta',`${COURSE_TITLES[item.course]}${item.unit?' · '+(/^[0-9]+$/.test(item.unit)?'Unit '+item.unit:item.unit.toUpperCase()):''}`);open.type='button';open.append(meta,node('strong','',item.title));if(item.subtitle)open.append(node('span','favorite-subtitle',item.subtitle));open.append(node('span','favorite-go','返回学习 →'));open.addEventListener('click',()=>{dialog.close();openItem(item);});const remove=node('button','favorite-remove','移除');remove.type='button';remove.setAttribute('aria-label',`移除收藏：${item.title}`);remove.addEventListener('click',()=>{store.remove(favoriteKey(item.course,item));byId('favoritesResult').textContent='已移除收藏';byId('favoritesClose').focus();});card.append(open,remove);list.append(card);}
 }
 byId('favoritesTrigger').addEventListener('click',()=>{render();dialog.showModal();});byId('favoritesClose').addEventListener('click',()=>dialog.close());filter.addEventListener('change',render);search.addEventListener('input',render);store.subscribe(render);render();
 return {render};
}
