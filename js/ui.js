export const $=(s,r=document)=>r.querySelector(s); export const $$=(s,r=document)=>[...r.querySelectorAll(s)];
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const lite=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>'); // safe: escaped first

let t;
export function toast(m){
    const e=$('#toast');
    if(!e) return;
    e.textContent=m;
    e.classList.add('show');
    clearTimeout(t);
    t=setTimeout(()=>e.classList.remove('show'), 2800);
}

// Dynamically rebuilds the community card using live AI data
export function updateDashboardWithLiveData(data) {
    const card = $('#selCard');
    if (!card) return;

    // Safely clear out the zero-state content without using innerHTML
    card.textContent = '';
    card.classList.remove('zero-state'); 

    // Create Live Header
    const header = document.createElement('h3');
    header.textContent = data.community || 'Live Community Data';
    
    // Add visual indicator that this is dynamic AI data, not the static snapshot
    const badge = document.createElement('span');
    badge.textContent = ' (Live AI Data)';
    badge.className = 'live-badge'; // Styled via external CSS, compliant with CSP
    header.appendChild(badge);
    card.appendChild(header);

    // Formatting helpers
    const n = v => Number(v || 0).toLocaleString('en-US');
    
    // Safe DOM row builder
    const addRow = (label, val) => {
        const row = document.createElement('div');
        // Using generic classes that likely match your existing CSS grid/flex structures
        row.className = 'fig-row'; 
        
        const lbl = document.createElement('span');
        lbl.className = 'fig-label';
        lbl.textContent = label;
        
        const valEl = document.createElement('strong');
        valEl.className = 'fig-val';
        valEl.textContent = val;
        
        row.appendChild(lbl);
        row.appendChild(valEl);
        card.appendChild(row);
    };

    // Inject the structured JSON data safely
    addRow('Sales, trailing 12 months', n(data.sales12m));
    addRow('September sales', n(data.salesSep));
    addRow('Median sale price', `AED ${n(data.medianPrice)}`);
    addRow('Median price per sq ft', `AED ${n(data.medianSqft)}`);
    addRow('Off-plan share', `${Number(data.offPlanShare || 0).toFixed(1)}%`);
    addRow('Ejari median annual rent', `AED ${n(data.medianRent)}`);
    addRow('Indicative gross yield', `${Number(data.grossYield || 0).toFixed(2)}%`);

    // Add compliance source note
    const footer = document.createElement('p');
    footer.className = 'source-note mute-text';
    footer.textContent = 'Source: Live Gumloop AI Research. Figures fetched dynamically and unverified against an official DLD index release. Charts below remain city-wide.';
    card.appendChild(footer);
}