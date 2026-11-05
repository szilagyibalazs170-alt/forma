const C='forma-v21',META='forma-meta';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==META).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  const same=u.origin===self.location.origin,font=u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
  if(!same&&!font)return;
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put('./index.html',cp));return res}).catch(()=>caches.match('./index.html')));return}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res})))});
// Spanish reminders: the app stores today's status in META; Android wakes the worker now and then (periodic background sync).
const p2=n=>String(n).padStart(2,'0');
async function remind(){const c=await caches.open(META),r=await c.match('./__remind');if(!r)return;const m=await r.json();if(!m.on)return;
  const now=new Date(),t=now.getFullYear()+'-'+p2(now.getMonth()+1)+'-'+p2(now.getDate()),hm=p2(now.getHours())+':'+p2(now.getMinutes());
  const done=m.day===t?m.done:{am:false,pm:false},nr=await c.match('./__notified'),n=nr?await nr.json():{};
  const due=[['am',m.am,'¡Hola! Jön a mai spanyol','1. alkalom: '+(m.lesson||'új lecke')+'. Kb. 12 perc.'],['pm',m.pm,'Esti spanyol ismétlés','2. alkalom: 17 kérdés, és mára kész vagy.']];
  for(const[k,tm,ti,bo]of due)if(hm>=tm&&!done[k]&&!n[t+k]){n[t+k]=1;await self.registration.showNotification(ti,{body:bo,icon:'icon-192.png',badge:'icon-192.png',tag:'es',data:{go:'es'}})}
  await c.put('./__notified',new Response(JSON.stringify(n)))}
self.addEventListener('periodicsync',e=>{if(e.tag==='es-remind')e.waitUntil(remind())});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{const w=ws[0];if(w){w.postMessage({go:'es'});return w.focus()}return clients.openWindow('./?go=es')}))});
