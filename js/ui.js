export const $=(s,r=document)=>r.querySelector(s);
export const $$=(s,r=document)=>[...r.querySelectorAll(s)];
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const lite=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>'); // safe: escaped first
let t;export function toast(m){const e=$('#toast');e.textContent=m;e.classList.add('show');clearTimeout(t);t=setTimeout(()=>e.classList.remove('show'),2800)}
