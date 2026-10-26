import test from 'node:test';import assert from 'node:assert/strict';
import {hostOrigin,isMessage,message,trustedEvent,safeHeight}from '../module-protocol.mjs';
test('host origins require HTTPS or loopback, without URL paths or credentials',()=>{
 assert.equal(hostOrigin('https://example.com'),'https://example.com');assert.equal(hostOrigin('http://127.0.0.1:8031'),'http://127.0.0.1:8031');
 for(const value of ['*','null','http://example.com','javascript:alert(1)','https://u:p@example.com','https://example.com/private','https://example.com?x=1'])assert.equal(hostOrigin(value),null,value);
});
test('only expected source origin version module and types are accepted',()=>{
 const source={},event={source,origin:'https://example.com',data:message('apwh','ready')};
 assert.ok(trustedEvent(event,source,event.origin,'apwh',['ready']));
 assert.equal(trustedEvent(event,{},event.origin,'apwh',['ready']),false);assert.equal(trustedEvent(event,source,'https://evil.test','apwh',['ready']),false);
 assert.equal(isMessage({...event.data,version:2},'apwh',['ready']),false);assert.equal(isMessage(event.data,'art',['ready']),false);assert.equal(isMessage(event.data,'apwh',['open-today']),false);
});
test('remote module height is finite and bounded',()=>{assert.equal(safeHeight(Infinity),null);assert.equal(safeHeight('900'),null);assert.equal(safeHeight(-1),280);assert.equal(safeHeight(99999),2200);assert.equal(safeHeight(700.2),701);});
test('invalid course URL config fails safely instead of escaping the click handler',async()=>{
 const {courseURL}=await import('../module-protocol.mjs');
 assert.equal(courseURL('http://[','https://example.com/site/'),null);
 assert.equal(courseURL(undefined,'https://example.com/site/'),null);
 assert.equal(courseURL('javascript:alert(1)','https://example.com/site/'),null);
 assert.equal(courseURL('../magic-history-apwh/','https://example.com/site/').href,'https://example.com/magic-history-apwh/');
});
