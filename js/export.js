// Export to PDF (print-to-PDF with print stylesheet) and Share Report.
export function exportPdf(){const t=document.title;document.title='Dubai-Market-Report-'+new Date().toISOString().slice(0,10);print();setTimeout(()=>document.title=t,500)}
export async function shareReport(title,text){try{if(navigator.share){await navigator.share({title,text});return 'shared'}
 await navigator.clipboard.writeText(text);return 'copied'}catch(e){return e.name==='AbortError'?'cancelled':'failed'}}
export function download(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
