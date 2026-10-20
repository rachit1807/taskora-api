import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const dir=await mkdtemp(join(tmpdir(),'taskora-'));
process.env.DATA_FILE=join(dir,'tasks.json');
const {default:app}=await import('../src/app.js');
const server=app.listen(0,'127.0.0.1');
await new Promise(r=>server.on('listening',r));
const base=`http://127.0.0.1:${server.address().port}`;
async function request(path,method='GET',body){const res=await fetch(base+path,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return {status:res.status,data:res.status===204?null:await res.json()};}
after(async()=>{await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true});});
test('complete CRUD lifecycle, filtering, pagination and errors',async()=>{
 let r=await request('/api/health');assert.equal(r.status,200);
 r=await request('/api/tasks','POST',{title:'Release testing',priority:'high',category:'Development'});assert.equal(r.status,201);const id=r.data.data.id;
 r=await request('/api/tasks/'+id);assert.equal(r.data.data.title,'Release testing');
 r=await request('/api/tasks/'+id,'PUT',{title:'Release tested',status:'done',priority:'high'});assert.equal(r.data.data.status,'done');
 r=await request('/api/tasks?search=Release&status=done&priority=high&limit=1&page=1');assert.equal(r.data.data.length,1);assert.equal(r.data.pagination.total,1);
 r=await request('/api/tasks','POST',{title:'  '});assert.equal(r.status,400);
 r=await request('/api/tasks','POST',{title:'bad date',dueDate:'2026-02-30'});assert.equal(r.status,400);
 r=await request('/api/tasks?page=-1');assert.equal(r.status,400);
 r=await request('/api/tasks?status=invalid');assert.equal(r.status,400);
 r=await request('/api/tasks/'+id,'DELETE');assert.equal(r.status,204);
 r=await request('/api/tasks/'+id);assert.equal(r.status,404);
 r=await request('/api/missing');assert.equal(r.status,404);
 const bad=await fetch(base+'/api/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:'{invalid'});assert.equal(bad.status,400);assert.equal((await bad.json()).success,false);
});
