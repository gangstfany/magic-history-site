import test from 'node:test';import assert from 'node:assert/strict';
import {normalizeLanguage,moduleLanguageURL,validateResume} from '../language.mjs';
test('language routing keeps Chinese default and never silently serves Chinese for EN',()=>{
 assert.equal(normalizeLanguage('en'),'en');assert.equal(normalizeLanguage('EN'),'zh');
 assert.equal(moduleLanguageURL({url:'/zh',englishUrl:'/en'},'en'),'/en');
 assert.equal(moduleLanguageURL({url:'/zh'},'en'),null);
 assert.equal(moduleLanguageURL({url:'/zh'},'zh'),'/zh');
});
test('resume state only accepts bounded canonical values',()=>{
 assert.equal(validateResume({period:'u20'}),null);
 assert.equal(validateResume({period:'u3',view:'chain',chainId:'u3_main',chainStep:2}).period,'u3');
 assert.equal(validateResume({period:'u1',chainId:'<script>'}).chainId,null);
});

import {restoreCourseState} from '../language.mjs';
test('restored canonical study card refreshes the course mirror instead of leaving its overview',async()=>{
 const calls=[];const api={reset(){},setPeriod(value){calls.push(value);},setLearningView(){},setMapMode(){},openFavorite(item){calls.push(item);return true;}};
 const course={document:{getElementById:()=>({contentWindow:{__mapFilter:api}})},Event,dispatchEvent:event=>calls.push(event.type)};
 assert.equal(await restoreCourseState({contentWindow:course},{period:'u4',view:'map',studyId:'apwh-u4-potosi-silver-mercury-boom'}),true);
 assert.equal(calls[0],'u4');assert.equal(calls[1].id,'apwh-u4-potosi-silver-mercury-boom');assert.equal(calls[2],'apwh-favorite-refresh');
});
