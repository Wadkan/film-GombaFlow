const {DatabaseSync}=require('node:sqlite');
const assert=require('node:assert/strict');
const [database,folder]=process.argv.slice(2);
function decode(text){const a=JSON.parse(text),seen=new Map();function at(i){if(seen.has(i))return seen.get(i);const v=a[i];if(v===null||typeof v!=='object')return v;const out=Array.isArray(v)?[]:{};seen.set(i,out);for(const[k,x]of Object.entries(v))out[k]=typeof x==='string'?at(Number(x)):x;return out;}return at(0);}
const db=new DatabaseSync(database,{readOnly:true});
function response(id){const row=db.prepare("select e.status,d.data from execution_entity e join execution_data d on d.executionId=e.id where e.workflowId=? and e.mode='cli' order by e.id desc limit 1").get(id);assert.ok(row);assert.equal(row.status,'success');const d=decode(row.data);return d.resultData.runData['Chat-válasz ellenőrzése'].at(-1).data.main[0][0].json.output;}
assert.equal(response('metadata-turn-md'),`Elkészült: /data/videos/${folder}/meta.md. Kérlek, nézd át.`);
assert.match(response('metadata-turn-denied'),/nem hajtható végre/);
assert.match(response('metadata-turn-json'),new RegExp(`Mentve: /data/videos/${folder.replace(/\./g,'\\.')}/meta.json`));
db.close();
