import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('shell has no direct course data or internal API dependency',()=>{
 const shell=read('index.html')+read('shell.mjs');
 assert.doesNotMatch(shell,/contentDocument|contentWindow\.__|__mapFilter|apwh-u[1-9]|data-route-step|artwork-data/);
 assert.doesNotMatch(shell,/<script[^>]+data\//);assert.doesNotMatch(shell,/innerHTML/);
});
test('course deployments are runtime URLs and auth is pinned to an immutable release',()=>{
 const modules=JSON.parse(read('modules.json'));assert.equal(modules.modules.world.module,'apwh');assert.equal(modules.modules.art.module,'art');
 const auth=JSON.parse(read('auth-release.json'));assert.match(auth.commit,/^[a-f0-9]{40}$/);assert.equal(auth.repository,'gangstfany/magic-history-auth');
});
