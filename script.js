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
            dur = `${h}:${m.toString().padStart(2,'0')}:${sc.toString().padStart(2,'0')}`;
            const cVal = (diff / 3600000) * (r.projects.hourly_rate || 0); totalCost += cVal; cost = cVal.toFixed(2) + curr;
        }
        const fullDesc = (r.description || "").replace(/'/g, "\\'");
        const shortDesc = r.description ? (r.description.length > 20 ? r.description.substring(0,20)+"..." : r.description) : "-";
        tbody.innerHTML += `<tr><td>${s.toLocaleDateString()}</td><td>${s.toLocaleTimeString()}</td><td>${e ? e.toLocaleTimeString() : ""}</td><td>${r.projects.clients.name}</td><td>${r.projects.name}</td><td title="${fullDesc}">${shortDesc}</td><td style="direction:ltr">${dur}</td><td style="direction:ltr">${cost}</td><td><button class="btn-icon btn-edit" onclick="openEditLog('${r.id}','${r.start_time}','${r.end_time}','${fullDesc}')">✏️</button></td></tr>`;
    });
    const th = Math.floor(totalMs / 3600000), tm = Math.floor((totalMs % 3600000) / 60000), ts = Math.floor((totalMs % 60000) / 1000);
    let summary = `סה"כ שעות: ${th}:${tm.toString().padStart(2,'0')}:${ts.toString().padStart(2,'0')}`;
    if (pid || cid) summary += ` (עלות: ${totalCost.toFixed(2)}${currencySym})`;
    document.getElementById('totalSum').innerText = summary;
}
async function exportData() {
    const start = document.getElementById('historyStart').value, end = document.getElementById('historyEnd').value;
    const cid = document.getElementById('historyClientSelect').value, pid = document.getElementById('historyProjectSelect').value;
    if (!start || !end) return alert("בחר תאריכים");
    const endDt = new Date(end); endDt.setHours(23,59,59);
    let query = sb.from('time_logs').select('*, projects!inner(name, hourly_rate, currency, client_id, clients(name))').gte('start_time', start).lte('start_time', endDt.toISOString()).order('start_time');
    if (pid) query = query.eq('project_id', pid); else if (cid) query = query.eq('projects.client_id', cid);
    const { data } = await query;
    if (!data || !data.length) return alert("אין נתונים ליצוא");
    let csv = "\uFEFFתאריך,לקוח,פרויקט,הערה,התחלה,סיום,משך זמן,שעות עשרוניות,תעריף,סה\"כ לתשלום\n";
    data.forEach(r => {
        const d = new Date(r.start_time), dateStr = d.toLocaleDateString('he-IL'), client = r.projects.clients.name, project = r.projects.name, startStr = d.toLocaleTimeString();
        let endStr = "", durStr = "0:00:00", decHours = 0, cost = 0;
        if (r.end_time) {
            const e = new Date(r.end_time); endStr = e.toLocaleTimeString();
            const diff = e - d; decHours = diff / 3600000; cost = decHours * (r.projects.hourly_rate || 0);
            const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000); let s = Math.floor((diff % 60000) / 1000);
            if (diff > 0 && h===0 && m===0 && s===0) s=1;
            durStr = `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        }
        const desc = (r.description || "").replace(/"/g, '""'), curr = r.projects.currency || "";
        csv += `${dateStr},"${client}","${project}","${desc}",${startStr},${endStr},${durStr},${decHours.toFixed(4)},${r.projects.hourly_rate}${curr},${cost.toFixed(2)}${curr}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = `export_${start}_to_${end}.csv`; document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

// --- Tasks ---
function toggleTaskInput() { document.getElementById('taskInputArea').classList.toggle('open'); }
async function loadTasks() {
    const div = document.getElementById('tasksList'); div.innerHTML = "טוען...";
    const isCompleted = currentTaskFilter === 'done';
    const { data } = await sb.from('tasks').select('*, projects(name), clients(name)').eq('user_id', currentUser.id).eq('is_completed', isCompleted).order('created_at', { ascending: false });
    div.innerHTML = "";
    if (!data || !data.length) { div.innerHTML = "<div style='text-align:center; opacity:0.5; margin-top:20px'>אין משימות</div>"; return; }
    data.forEach(t => {
        const checked = t.is_completed ? 'checked' : '';
        const style = t.is_completed ? 'text-decoration:line-through; opacity:0.6' : '';
        let tags = "";
        if (t.clients) tags += `<span class="task-tag">${t.clients.name}</span>`;
        if (t.projects) tags += `<span class="task-tag" style="background:#666">${t.projects.name}</span>`;
        div.innerHTML += `
        <div class="task-item">
            <div class="task-left">
                <input type="checkbox" class="task-checkbox" onchange="toggleTask('${t.id}', this.checked)" ${checked}>
                <div style="${style}">
                    <span class="task-title">${t.title}</span>
                    <div class="task-meta">${tags} ${t.due_date || ''}</div>
                </div>
            </div>
            <div class="task-right">
                ${!t.is_completed ? `<button class="btn-icon btn-play" onclick="startTaskFromItem('${t.title.replace(/'/g,"\\'")}', '${t.project_id}')">▶</button>` : ''}
                <button class="btn-icon btn-edit" onclick="openEditTask('${t.id}', '${t.title.replace(/'/g, "\\'")}', '${t.due_date||''}')">✏️</button>
            </div>
        </div>`;
    });
}
async function addTask() {
    const title = document.getElementById('newTaskTitle').value, date = document.getElementById('newTaskDate').value;
    const cid = document.getElementById('taskClientSelect').value || null, pid = document.getElementById('taskProjectSelect').value || null;
    if (!title) return alert("חובה להזין שם משימה");
    await sb.from('tasks').insert([{ user_id: currentUser.id, title: title, due_date: date || null, client_id: cid, project_id: pid }]);
    document.getElementById('newTaskTitle').value = ""; toggleTaskInput(); loadTasks();
}
async function toggleTask(id, status) { await sb.from('tasks').update({ is_completed: status }).eq('id', id); loadTasks(); }
function openEditTask(id, title, date) { document.getElementById('editTaskId').value = id; document.getElementById('editTaskTitle').value = title; document.getElementById('editTaskDate').value = date; openModal('editTaskModal'); }
async function saveTaskEdit() { const id = document.getElementById('editTaskId').value, title = document.getElementById('editTaskTitle').value, date = document.getElementById('editTaskDate').value; await sb.from('tasks').update({ title: title, due_date: date || null }).eq('id', id); closeModal('editTaskModal'); loadTasks(); }
async function deleteTaskFromModal() { if(!confirm("למחוק?")) return; await sb.from('tasks').delete().eq('id', document.getElementById('editTaskId').value); closeModal('editTaskModal'); loadTasks(); }
async function startTaskFromItem(title, pid) {
    if (!pid || pid === 'null') return alert("המשימה אינה משויכת לפרויקט, אי אפשר למדוד זמן");
    showScreen('timerScreen'); document.getElementById('taskDescription').value = title;
    if (!activeLogId) { const { data, error } = await sb.from('time_logs').insert([{ user_id: currentUser.id, project_id: pid, start_time: new Date(), description: title }]).select(); if (!error) { activeLogId = data[0].id; startTime = new Date(); setWorkingState(true); startClockTick(); } }
}

function openEditLog(id, s, e, d) { document.getElementById('editLogId').value=id; document.getElementById('editLogStart').value=toLocalISO(new Date(s)); document.getElementById('editLogEnd').value=e&&e!=='null'?toLocalISO(new Date(e)):""; document.getElementById('editLogDesc').value=d; openModal('editLogModal'); }
function toLocalISO(d) { const o=d.getTimezoneOffset()*60000; return new Date(d-o).toISOString().slice(0,16); }
async function saveLogEdit() { const id=document.getElementById('editLogId').value, start=document.getElementById('editLogStart').value, end=document.getElementById('editLogEnd').value, desc=document.getElementById('editLogDesc').value; await sb.from('time_logs').update({start_time:new Date(start).toISOString(), end_time:end?new Date(end).toISOString():null, description:desc}).eq('id',id); closeModal('editLogModal'); loadHistoryData(); }
async function deleteLog() { if(confirm("בטוח?")){ await sb.from('time_logs').delete().eq('id',document.getElementById('editLogId').value); closeModal('editLogModal'); loadHistoryData(); } }

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function toggleTheme() { document.body.classList.toggle('light-mode'); }
function openEditProfile() { const p=window.currentProfile; document.getElementById('editProfileEmail').value = p.email; document.getElementById('editProfileName').value = p.full_name; document.getElementById('editProfilePhone').value = p.phone||""; document.getElementById('editProfileID').value = p.identity_number||""; openModal('profileModal'); }
async function saveProfileChanges() { const name=document.getElementById('editProfileName').value.trim(), phone=document.getElementById('editProfilePhone').value.trim(), idNum=document.getElementById('editProfileID').value.trim(); if(!name) return alert("שם חובה"); await sb.from('profiles').update({ full_name: name, phone: phone, identity_number: idNum }).eq('id', currentUser.id); window.currentProfile.full_name=name; window.currentProfile.phone=phone; window.currentProfile.identity_number=idNum; document.getElementById('userDisplayHome').innerHTML = `שלום, ${name} <span onclick="openEditProfile()" class="edit-icon">✏️</span>`; document.getElementById('userDisplay').innerHTML = `שלום, ${name} <span onclick="openEditProfile()" class="edit-profile-btn">✏️</span>`; closeModal('profileModal'); }
async function deleteAccount() { if(confirm("למחוק?")) { await sb.rpc('delete_own_user'); logout(); } }
async function saveOnboarding() { const name=document.getElementById('onboardName').value.trim(), phone=document.getElementById('onboardPhone').value.trim(), idNum=document.getElementById('onboardID').value.trim(); if(!name) return alert("שם חובה"); await sb.from('profiles').insert([{ id: currentUser.id, email: currentUser.email, full_name: name, phone: phone, identity_number: idNum, work_mode: 'solo' }]); location.reload(); }
</script>