// Voice-to-text via the Web Speech API (browser-dependent; audio may be processed by the browser vendor).
const SR=globalThis.SpeechRecognition||globalThis.webkitSpeechRecognition;
export const voiceSupported=!!SR;
export function createVoice({onText,onState,onError}){if(!SR)return null;const r=new SR();r.lang='en-US';r.interimResults=true;r.continuous=false;let on=false;
 r.onresult=e=>onText([...e.results].map(x=>x[0].transcript).join(' '));
 r.onend=()=>{on=false;onState(false)};r.onerror=e=>{on=false;onState(false);onError(e.error)};
 return {toggle(){if(on){r.stop()}else{try{r.start();on=true;onState(true)}catch(e){onError(e.message)}}}}}
