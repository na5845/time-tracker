const SUPABASE_URL = 'https://dotrhurfkkgnfxqxtndi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdHJodXJma2tnbmZ4cXh0bmRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MTU5MjQsImV4cCI6MjA3OTI5MTkyNH0.4RHUPUoEzXg5jlepgrnd4hmsiwP6FKyFaysvPd3WCXY';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null, currentWorkspaceId = null, activeLogId = null, timerInterval = null, startTime = null, isLoginMode = true;
let currentTaskFilter = 'todo';

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
    document.getElementById(screenId).classList.add('active-screen');
    if(screenId === 'tasksScreen') { loadClients('task'); loadTasks(); }
    if(screenId === 'timerScreen') { loadClients('timer'); }
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    if(tabName === 'client') {
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        document.getElementById('tab-client').classList.add('active');
    } else {
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        document.getElementById('tab-project').classList.add('active');
    }
}

function switchTaskTab(tabName) {
    currentTaskFilter = tabName;
    document.querySelectorAll('.task-tab').forEach(b => b.classList.remove('active'));
    if(tabName === 'todo') document.querySelector('.task-tab:nth-child(1)').classList.add('active');
    else document.querySelector('.task-tab:nth-child(2)').classList.add('active');
    loadTasks();
}

async function checkAuth() {
    try {
        const { data: { session } } = await sb.auth.getSession();
        if (session) {
            currentUser = session.user;
            const { data: profile } = await sb.from('profiles').select('*').eq('id', currentUser.id).single();
            if (!profile) { showScreen('onboardingScreen'); return; }

            window.currentProfile = profile;
            document.getElementById('userDisplayHome').innerHTML = "שלום, " + (profile.full_name || "משתמש") + ` <span onclick="openEditProfile()" class="edit-icon">✏️</span>`;
            
            const { data: members } = await sb.from('workspace_members').select('workspace_id').eq('user_id', currentUser.id).limit(1);
            if (members && members.length > 0) {
                currentWorkspaceId = members[0].workspace_id;
            } else {
                const { data: ws } = await sb.from('workspaces').insert([{ name: 'הארגון שלי' }]).select().single();
                await sb.from('workspace_members').insert([{ workspace_id: ws.id, user_id: currentUser.id, role: 'admin' }]);
                currentWorkspaceId = ws.id;
            }
            showScreen('homeScreen');
            checkActiveSession();
            loadClients('modal');
        } else {
            showScreen('authScreen');
        }
    } catch (err) { console.error(err); showScreen('authScreen'); }
}

async function handleAuth() {
    const email = document.getElementById('email').value, password = document.getElementById('password').value;
    const btn = document.getElementById('authMainBtn');
    if (!email || !password) return alert("מלא פרטים");
    btn.disabled = true; btn.innerText = "טוען...";
    let error;
    if (isLoginMode) {
        const res = await sb.auth.signInWithPassword({ email, password });
        error = res.error; if (!error) { checkAuth(); return; }
    } else {
        const res = await sb.auth.signUp({ email, password });
        error = res.error; if (!error) alert("נרשמת בהצלחה!");
    }
    if (error) { document.getElementById('authError').innerText = error.message; btn.disabled = false; btn.innerText = isLoginMode ? "כניסה" : "הרשמה"; }
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('authTitle').innerText = isLoginMode ? "התחברות" : "הרשמה";
    document.getElementById('authMainBtn').innerText = isLoginMode ? "כניסה" : "הרשמה";
    document.getElementById('authModeText').innerText = isLoginMode ? "אין לך חשבון?" : "כבר רשום?";
    document.getElementById('authToggleBtn').innerText = isLoginMode ? "הירשם כאן" : "התחבר כאן";
}

async function logout() { await sb.auth.signOut(); localStorage.clear(); window.location.reload(); }

async function loadClients(context) {
    const { data } = await sb.from('clients').select('*').eq('workspace_id', currentWorkspaceId).order('name');
    let selectId = '';
    if(context === 'timer') selectId = 'clientSelect';
    else if(context === 'task') selectId = 'taskClientSelect';
    else if(context === 'modal') selectId = 'modalClientSelect';
    else if(context === 'history') selectId = 'historyClientSelect';
    const sel = document.getElementById(selectId); if(!sel) return;
    const defaultText = context === 'history' ? '-- הכל --' : '-- בחר לקוח --';
    sel.innerHTML = `<option value="">${defaultText}</option>`;
    data?.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
}

async function loadProjects(context) {
    let cIdStr = context === 'timer' ? 'clientSelect' : (context === 'task' ? 'taskClientSelect' : 'historyClientSelect');
    let pIdStr = context === 'timer' ? 'projectSelect' : (context === 'task' ? 'taskProjectSelect' : 'historyProjectSelect');
    const cid = document.getElementById(cIdStr).value;
    const pSel = document.getElementById(pIdStr);
    pSel.innerHTML = `<option value="">${context==='history'?'-- הכל --':'-- טוען... --'}</option>`;
    pSel.disabled = true;
    if(!cid) { if(context === 'history') loadHistoryData(); return; }
    const { data } = await sb.from('projects').select('*').eq('client_id', cid).order('name');
    pSel.innerHTML = `<option value="">${context==='history'?'-- כל הפרויקטים --':'-- בחר פרויקט --'}</option>`;
    if(data.length > 0) { data.forEach(p => pSel.innerHTML += `<option value="${p.id}">${p.name}</option>`); pSel.disabled = false; }
    else pSel.innerHTML = '<option value="">אין פרויקטים</option>';
    if(context === 'history') loadHistoryData();
    if(context === 'timer' && !activeLogId) document.getElementById('actionBtn').disabled = false;
}

async function addNewClient() {
    const name = document.getElementById('newClientName').value;
    if (!name) return;
    await sb.from('clients').insert([{ workspace_id: currentWorkspaceId, name: name }]);
    document.getElementById('newClientName').value = ""; alert("לקוח נוסף");
    loadClients('timer'); loadClients('task'); loadClients('modal');
}

async function addNewProject() {
    const cid = document.getElementById('modalClientSelect').value, name = document.getElementById('newProjectName').value, rate = document.getElementById('newProjectRate').value, curr = document.getElementById('newProjectCurrency').value;
    if (!cid || !name) return alert("חסרים פרטים");
    await sb.from('projects').insert([{ workspace_id: currentWorkspaceId, client_id: cid, name: name, hourly_rate: rate, currency: curr }]);
    document.getElementById('newProjectName').value = ""; alert("פרויקט נוסף");
}

async function checkActiveSession() {
    const { data } = await sb.from('time_logs').select('*').is('end_time', null).limit(1);
    if (data && data.length > 0) { activeLogId = data[0].id; startTime = new Date(data[0].start_time); setWorkingState(true); startClockTick(); showScreen('timerScreen'); }
}
async function toggleTimer() {
    const btn = document.getElementById('actionBtn'), pid = document.getElementById('projectSelect').value, desc = document.getElementById('taskDescription').value;
    if (!activeLogId) {
        if (!pid) return alert("בחר פרויקט"); btn.disabled = true;
        const { data, error } = await sb.from('time_logs').insert([{ user_id: currentUser.id, project_id: pid, start_time: new Date(), description: desc }]).select();
        if (!error) { activeLogId = data[0].id; startTime = new Date(); setWorkingState(true); startClockTick(); document.getElementById('taskDescription').value = ""; } else btn.disabled = false;
    } else {
        btn.disabled = true; const { error } = await sb.from('time_logs').update({ end_time: new Date() }).eq('id', activeLogId);
        if (!error) { activeLogId = null; setWorkingState(false); stopClockTick(); } else btn.disabled = false;
    }
}
function setWorkingState(isWorking) {
    const btn = document.getElementById('actionBtn');
    if (isWorking) { btn.innerText = "⏹ סיום עבודה"; btn.className = "main-btn btn-stop"; btn.disabled = false; } 
    else { btn.innerText = "▶ התחל לעבוד"; btn.className = "main-btn btn-start"; btn.disabled = false; document.getElementById('timerDisplay').innerText = "00:00:00"; }
}
function startClockTick() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => { const diff = new Date() - startTime; const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000); document.getElementById('timerDisplay').innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`; }, 1000);
}
function stopClockTick() { if (timerInterval) clearInterval(timerInterval); }

function initHistoryModal() { setHistoryRange('current'); loadClients('history'); openModal('historyModal'); }
function setHistoryRange(type) {
    const now = new Date(); let start, end;
    if (type === 'current') { start = new Date(now.getFullYear(), now.getMonth(), 1); end = new Date(now.getFullYear(), now.getMonth() + 1, 0); } 
    else { start = new Date(now.getFullYear(), now.getMonth() - 1, 1); end = new Date(now.getFullYear(), now.getMonth(), 0); }
    start.setMinutes(start.getMinutes() - start.getTimezoneOffset()); end.setMinutes(end.getMinutes() - end.getTimezoneOffset());
    document.getElementById('historyStart').valueAsDate = start; document.getElementById('historyEnd').valueAsDate = end;
    loadHistoryData();
}
async function loadHistoryData() {
    const start = document.getElementById('historyStart').value, end = document.getElementById('historyEnd').value;
    const cid = document.getElementById('historyClientSelect').value, pid = document.getElementById('historyProjectSelect').value;
    const tbody = document.getElementById('historyBody');
    if (!start || !end) return;
    tbody.innerHTML = "<tr><td colspan='9' style='text-align:center'>טוען...</td></tr>";
    const endDt = new Date(end); endDt.setHours(23,59,59);
    let query = sb.from('time_logs').select('*, projects!inner(name, hourly_rate, currency, client_id, clients(name))').gte('start_time', start).lte('start_time', endDt.toISOString()).order('start_time', { ascending: false });
    if (pid) query = query.eq('project_id', pid); else if (cid) query = query.eq('projects.client_id', cid);
    const { data, error } = await query;
    if (error || !data.length) { tbody.innerHTML = "<tr><td colspan='9' style='text-align:center'>אין נתונים</td></tr>"; document.getElementById('totalSum').innerText = ""; return; }
    tbody.innerHTML = ""; let totalMs = 0, totalCost = 0, currencySym = "";
    data.forEach(r => {
        const s = new Date(r.start_time), e = r.end_time ? new Date(r.end_time) : null;
        let dur = "-", cost = "-"; const curr = r.projects?.currency || ""; if (curr) currencySym = curr;
        if (e) {
            const diff = e - s; totalMs += diff;
            const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000); let sc = Math.floor((diff % 60000) / 1000);
            if (diff > 0 && h===0 && m===0 && sc===0) sc = 1;
            dur = `${h}:${m.toString().padStart(2,'0')}:${sc.toString().padStart
