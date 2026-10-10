// Gumloop client. Posts to a same-origin proxy (no CORS), which forwards to the Gumloop webhook.
export async function sendQuery(url, payload, timeout = 30000) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), timeout);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: ctl.signal,
            referrerPolicy: 'no-referrer',
            credentials: 'omit'
        });
        const raw = await res.text();
        
        if (res.status === 404 || res.status === 405) throw new Error('Proxy not found. Run "npm start" locally or deploy to Vercel or Netlify (GitHub Pages cannot proxy).');
        if (res.status === 429) throw new Error('Too many requests. Wait a minute and try again.');
        if (!res.ok) throw new Error(`Agent returned ${res.status}`);
        
        let data;
        try { data = JSON.parse(raw); } catch { data = raw; }

        const fullText = format(data);
        const liveData = extractLiveData(fullText);
        const cleanText = stripLiveData(fullText);

        return { ok: true, text: cleanText, raw: data, liveData: liveData };
    } catch (e) {
        if (e.name === 'AbortError') throw new Error('The agent took too long to respond. Try again.');
        throw e;
    } finally {
        clearTimeout(t);
    }
}

function format(d) {
    if (typeof d === 'string') return d || 'The agent accepted the request.';
    for (const k of ['output', 'result', 'response', 'answer', 'message', 'text']) {
        if (typeof d?.[k] === 'string') return d[k];
    }
    if (d?.run_id) return `Agent run started.\nRun ID: ${d.run_id}${d.url ? '\nTrack it in Gumloop: ' + d.url : ''}`;
    return JSON.stringify(d, null, 2);
}

function extractLiveData(text) {
    if (typeof text !== 'string') return null;
    // Scans for a markdown JSON block containing the structured data
    const match = text.match(/```json\s*(\{[\s\S]*?\})\s*```/i);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (e) {
            console.error('Failed to parse live data JSON from agent', e);
        }
    }
    return null;
}

function stripLiveData(text) {
    if (typeof text !== 'string') return text;
    // Removes the JSON block from the chat output so the user only sees the professional brief
    return text.replace(/```json\s*\{[\s\S]*?\}\s*```/i, '').trim();
}