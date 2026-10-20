import {readFile, writeFile, mkdir, rename} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
const file = process.env.DATA_FILE || new URL('../../data/tasks.json', import.meta.url);
let queue = Promise.resolve();
const fail = (message,status=400) => Object.assign(new Error(message),{status});
const seed = [
 ['Shape the next big idea','Map out the experience before opening your editor.','in-progress','high','Design'],
 ['Build something worth sharing','Connect the task endpoints and bring the workspace to life.','todo','high','Development'],
 ['Give the details some love','Check spacing, keyboard navigation, and the mobile experience.','todo','medium','Design'],
 ['Document the journey','Write clear examples for every API endpoint.','todo','low','Writing'],
 ['Make room for deep work','A little focus goes a long way.','done','medium','Personal']
].map(([title,description,status,priority,category])=>({id:randomUUID(),title,description,status,priority,category,dueDate:'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}));
async function read(){try{return JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code==='ENOENT')return structuredClone(seed);throw e;}}
function transaction(fn){const result=queue.then(async()=>{const tasks=await read();const value=fn(tasks);await mkdir(new URL('../../data/',import.meta.url),{recursive:true});const temp=typeof file==='string'?file+'.tmp':new URL(file.href+'.tmp');await writeFile(temp,JSON.stringify(tasks,null,2));await rename(temp,file);return value;});queue=result.catch(()=>{});return result;}
function validate(body){
 const {title,description='',status='todo',priority='medium',category='Personal',dueDate=''}=body;
 if(typeof title!=='string'||!title.trim()||title.length>120)throw fail('Title must contain 1–120 characters.');
 if(typeof description!=='string'||description.length>2000)throw fail('Description must be at most 2000 characters.');
 if(!['todo','in-progress','done'].includes(status))throw fail('Invalid task status.');
 if(!['low','medium','high'].includes(priority))throw fail('Invalid priority.');
 if(typeof category!=='string'||!category.trim()||category.length>40)throw fail('Category must contain 1–40 characters.');
 if(typeof dueDate!=='string'||(dueDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)||Number.isNaN(Date.parse(dueDate))||new Date(dueDate).toISOString().slice(0,10)!==dueDate)))throw fail('Use a valid due date (YYYY-MM-DD).');
 return {title:title.trim(),description:description.trim(),status,priority,category:category.trim(),dueDate};
}
export async function list(req,res){
 let tasks=await read(); const totalTasks=tasks.length;
 const stats={total:totalTasks,todo:tasks.filter(t=>t.status==='todo').length,inProgress:tasks.filter(t=>t.status==='in-progress').length,done:tasks.filter(t=>t.status==='done').length};
 const {status,priority,search='',sort='newest'}=req.query;
 if(status&&!['todo','in-progress','done'].includes(status))throw fail('Invalid status filter.');
 if(priority&&!['low','medium','high'].includes(priority))throw fail('Invalid priority filter.');
 if(!['newest','oldest','priority','dueDate'].includes(sort))throw fail('Invalid sort order.');
 const page=Number(req.query.page||1),limit=Number(req.query.limit||9);
 if(!Number.isInteger(page)||page<1||!Number.isInteger(limit)||limit<1||limit>100)throw fail('Page must be positive and limit must be between 1 and 100.');
 tasks=tasks.filter(t=>(!status||t.status===status)&&(!priority||t.priority===priority)&&`${t.title} ${t.description} ${t.category}`.toLowerCase().includes(String(search).toLowerCase()));
 tasks.sort((a,b)=>sort==='priority'?['high','medium','low'].indexOf(a.priority)-['high','medium','low'].indexOf(b.priority):sort==='dueDate'?(a.dueDate||'9999').localeCompare(b.dueDate||'9999'):sort==='oldest'?a.createdAt.localeCompare(b.createdAt):b.createdAt.localeCompare(a.createdAt));
 res.json({success:true,data:tasks.slice((page-1)*limit,page*limit),pagination:{page,limit,total:tasks.length,pages:Math.ceil(tasks.length/limit)},stats});
}
export async function get(req,res){const task=(await read()).find(t=>t.id===req.params.id);if(!task)throw fail('Task not found.',404);res.json({success:true,data:task});}
export async function create(req,res){const fields=validate(req.body||{});const task={id:randomUUID(),...fields,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};await transaction(tasks=>tasks.push(task));res.status(201).json({success:true,data:task});}
export async function update(req,res){const fields=validate(req.body||{});const task=await transaction(tasks=>{const index=tasks.findIndex(t=>t.id===req.params.id);if(index<0)throw fail('Task not found.',404);return tasks[index]={...tasks[index],...fields,updatedAt:new Date().toISOString()};});res.json({success:true,data:task});}
export async function remove(req,res){await transaction(tasks=>{const index=tasks.findIndex(t=>t.id===req.params.id);if(index<0)throw fail('Task not found.',404);tasks.splice(index,1);});res.status(204).end();}
