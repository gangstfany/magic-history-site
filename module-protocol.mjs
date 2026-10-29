export const NAMESPACE='magic-history';
export const VERSION=1;
export function message(module,type,payload={}){return {...payload,namespace:NAMESPACE,version:VERSION,module,type};}
export function isMessage(data,module,types){return !!data&&typeof data==='object'&&!Array.isArray(data)&&data.namespace===NAMESPACE&&data.version===VERSION&&data.module===module&&types.includes(data.type);}
export function hostOrigin(value){
 try{const url=new URL(value);if(url.username||url.password||url.search||url.hash||!['','/'].includes(url.pathname))return null;
 if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)))return null;
 return url.origin;}catch{return null;}
}
export function safeHeight(value,module){return typeof value==='number'&&Number.isFinite(value)?Math.max(280,Math.min(module==='apeuro'?30000:module==='art'?10000:2200,Math.ceil(value))):null;}
export function trustedEvent(event,source,origin,module,types){return event.source===source&&event.origin===origin&&isMessage(event.data,module,types);}
export function courseURL(value,base){
 if(typeof value!=='string'||!value.trim())return null;
 try{const url=new URL(value,base);return hostOrigin(url.origin)&&!url.username&&!url.password?url:null;}catch{return null;}
}
