const MAP=[
  {keys:['first name','firstname','given name'],get:p=>(p.full_name||'').trim().split(/\s+/)[0]||''},
  {keys:['last name','lastname','surname','family name'],get:p=>{const a=(p.full_name||'').trim().split(/\s+/);return a.length>1?a.slice(1).join(' '):''}},
  {keys:['full name','fullname','your name','name'],get:p=>p.full_name},
  {keys:['email','e-mail'],get:p=>p.email},{keys:['phone','mobile','telephone'],get:p=>p.phone},
  {keys:['location','city','address'],get:p=>p.location},{keys:['linkedin'],get:p=>p.linkedin},
  {keys:['github'],get:p=>p.github},{keys:['portfolio','website','personal site'],get:p=>p.portfolio},
  {keys:['summary','about','professional summary'],get:p=>p.summary},{keys:['skills'],get:p=>(p.skills||[]).join(', ')}
];
function descriptor(el){const labels=[];if(el.id){const l=document.querySelector(`label[for="${CSS.escape(el.id)}"]`);if(l)labels.push(l.innerText)}const parent=el.closest('label');if(parent)labels.push(parent.innerText);labels.push(el.name||'',el.id||'',el.placeholder||'',el.getAttribute('aria-label')||'',el.autocomplete||'');return labels.join(' ').toLowerCase()}
function setValue(el,value){if(!value||el.disabled||el.readOnly||['hidden','password','file','submit','button'].includes((el.type||'').toLowerCase()))return false;if(!['INPUT','TEXTAREA'].includes(el.tagName))return false;el.focus();const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;const setter=Object.getOwnPropertyDescriptor(proto,'value')?.set;if(setter)setter.call(el,String(value));else el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));el.style.outline='2px solid #315efb';return true}
function fill(profile){let count=0;document.querySelectorAll('input,textarea').forEach(el=>{if(el.value?.trim())return;const d=descriptor(el);for(const m of MAP){if(m.keys.some(k=>d.includes(k))){if(setValue(el,m.get(profile)))count++;break}}});return count}
chrome.runtime.onMessage.addListener((msg,_sender,send)=>{if(msg.type!=='RESUMEFILL_FILL')return;chrome.storage.local.get(['resumeProfile'],r=>send({filled:r.resumeProfile?fill(r.resumeProfile):0}));return true});
