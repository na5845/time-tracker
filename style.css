:root {
    --bg-color: #121212; --card-bg: #1e1e1e; --text-main: #e0e0e0; --text-muted: #a0a0a0;
    --input-bg: #2c2c2c; --border: #333; --primary: #bb86fc; --danger: #cf6679; --success: #03dac6;
}
body.light-mode {
    --bg-color: #f0f2f5; --card-bg: #ffffff; --text-main: #333333; --text-muted: #666666;
    --input-bg: #f9f9f9; --border: #e1e4e8; --primary: #6200ee;
}
body {
    font-family: 'Rubik', sans-serif; background-color: var(--bg-color); color: var(--text-main);
    margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; transition: 0.3s;
}
.screen { display: none; width: 100%; max-width: 600px; padding: 20px; }
.active-screen { display: block; }
.card {
    background: var(--card-bg); padding: 2rem; border-radius: 24px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2); border: 1px solid var(--border);
    text-align: center; position: relative;
}
h2 { margin-top: 0; font-weight: 700; margin-bottom: 10px; }
label { display: block; text-align: right; margin-bottom: 5px; color: var(--text-muted); font-size: 0.85rem; }
select, input, textarea {
    width: 100%; padding: 12px; margin-bottom: 15px; font-size: 16px; border-radius: 12px;
    background-color: var(--input-bg); border: 1px solid var(--border); color: var(--text-main);
    box-sizing: border-box; outline: none; font-family: 'Rubik', sans-serif;
}
input:disabled { opacity: 0.6; cursor: not-allowed; border: 1px dashed var(--border); background: transparent; }
button { cursor: pointer; font-family: 'Rubik', sans-serif; }
.main-btn {
    width: 100%; padding: 14px; font-size: 18px; border-radius: 50px;
    font-weight: bold; border: none; margin-bottom: 10px; transition: 0.2s;
}
.btn-primary { background: var(--primary); color: #fff; }
.btn-start { background: #03dac6; color: #000; }
.btn-stop { background: #cf6679; color: white; }
.menu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
.menu-card {
    background: var(--input-bg); border: 1px solid var(--border); border-radius: 20px;
    padding: 30px 20px; cursor: pointer; transition: 0.3s;
    display: flex; flex-direction: column; align-items: center; gap: 15px;
}
.menu-card:hover { transform: translateY(-5px); border-color: var(--primary); background: rgba(187,134,252,0.05); }
.menu-icon { font-size: 3rem; }
.menu-title { font-weight: bold; font-size: 1.2rem; color: var(--text-main); }
.tools-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 20px; }
.tool-btn {
    background: transparent; border: 1px solid var(--border); color: var(--text-muted);
    padding: 10px; border-radius: 12px; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 5px;
}
.tool-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--input-bg); }
.task-tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 15px; }
.task-tab { flex: 1; padding: 10px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-muted); cursor: pointer; transition: 0.3s; }
.task-tab.active { color: var(--primary); border-color: var(--primary); font-weight: bold; }
.task-add-btn { width: 100%; background: var(--input-bg); border: 1px dashed var(--border); color: var(--primary); padding: 12px; border-radius: 12px; margin-bottom: 15px; font-weight: bold; transition: 0.2s; }
.task-add-btn:hover { background: var(--primary); color: white; border-style: solid; }
.task-input-area { display: none; background: rgba(255,255,255,0.03); padding: 15px; border-radius: 12px; margin-bottom: 20px; border: 1px solid var(--border); }
.task-input-area.open { display: block; }
.task-item { display: flex; align-items: center; justify-content: space-between; padding: 15px; border-bottom: 1px solid var(--border); gap: 10px; background: var(--card-bg); transition: 0.2s; }
.task-item:hover { background: var(--input-bg); }
.task-left { display: flex; align-items: center; gap: 10px; flex: 1; text-align: right; }
.task-right { display: flex; align-items: center; gap: 8px; }
.task-checkbox { width: 20px; height: 20px; cursor: pointer; margin: 0; accent-color: var(--primary); }
.task-title { font-weight: bold; font-size: 1rem; display: block; }
.task-meta { font-size: 0.8em; color: var(--text-muted); display: flex; gap: 10px; align-items: center; margin-top: 3px; }
.task-tag { font-size: 0.75rem; background: var(--input-bg); border: 1px solid var(--border); padding: 2px 6px; border-radius: 4px; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 1.2rem; padding: 5px; border-radius: 50%; transition: 0.2s; }
.btn-play { color: var(--success); border: 1px solid var(--success); }
.btn-play:hover { background: var(--success); color: black; }
.btn-edit { color: var(--text-main); border: 1px solid var(--text-muted); }
.btn-del { color: var(--danger); }
.modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(5px); }
.modal-content { background: var(--card-bg); padding: 25px; border-radius: 20px; width: 95%; max-width: 900px; max-height: 90vh; overflow-y: auto; position: relative; border: 1px solid var(--border); }
.close-modal { position: absolute; top: 15px; left: 15px; background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; }
.btn-action { width: 100%; background: var(--primary); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; margin-top: 10px; }
.btn-delete-account-small { background: transparent; border: 1px solid var(--danger); color: var(--danger); padding: 8px 15px; font-size: 0.8rem; border-radius: 8px; margin-top: 25px; display: block; margin-right: auto; transition: 0.2s; cursor: pointer;}
.btn-delete-account-small:hover { background: var(--danger); color: white; }
.btn-delete-log { background: var(--danger); margin-top: 10px; color: white; }
.tab-header { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 15px; }
.tab-btn { flex: 1; background: none; border: none; padding: 12px; color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; transition: 0.3s; font-weight: bold; }
.tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }
.tab-content { display: none; animation: fadeIn 0.3s; }
.tab-content.active { display: block; }
table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.85rem; }
th, td { padding: 12px 8px; border-bottom: 1px solid var(--border); text-align: right; }
th { color: var(--primary); white-space: nowrap; font-size: 0.8rem; background: rgba(255,255,255,0.02); }
.row-inputs { display: flex; gap: 10px; }
.filter-bar { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; margin-bottom: 20px; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; }
.filter-group { flex: 1; min-width: 120px; }
.filter-buttons { display: flex; gap: 5px; flex: 1.5; justify-content: flex-end; margin-top: 10px;}
.btn-filter-date { background: transparent; border: 1px solid var(--border); color: var(--text-muted); padding: 0 15px; border-radius: 8px; font-size: 0.8rem; height: 38px; cursor: pointer; }
.btn-filter-date:hover { border-color: var(--primary); color: var(--primary); }
.btn-filter-go { background: var(--primary); color: white; border:none; border-radius:8px; padding: 0 20px; height: 38px; font-weight: bold; cursor: pointer;}
.btn-export-csv { background: var(--success); color: black; border:none; border-radius:8px; padding: 0 20px; height: 38px; font-weight: bold; display:flex; align-items:center; gap:5px; cursor: pointer;}
.header-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid var(--border); font-size: 0.9rem; color: var(--text-muted); }
.header-actions { display: flex; align-items: center; gap: 15px; }
.theme-toggle { background: none; border: 1px solid var(--border); color: var(--text-main); border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.logout-btn { color: var(--danger); cursor: pointer; text-decoration: underline; font-weight: bold; font-size: 0.9rem; }
.edit-profile-btn { cursor: pointer; margin-right: 5px; font-size: 1.1em; transition: 0.2s; }
.edit-icon { cursor: pointer; font-size: 1.2em; transition: 0.2s; border: none; background: none; }
.edit-icon:hover { transform: scale(1.2); }
.timer { font-size: 3.5rem; font-family: monospace; margin: 10px 0 20px 0; letter-spacing: 2px; }
.btn-back { background: transparent; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; position: absolute; top: 20px; right: 20px; }
.mode-selector { display: flex; gap: 15px; margin-bottom: 20px; justify-content: center; }
.mode-card { border: 1px solid var(--border); padding: 15px; border-radius: 12px; cursor: pointer; width: 120px; text-align: center; opacity: 0.6; }
.mode-card.selected { border-color: var(--primary); background: rgba(187, 134, 252, 0.1); opacity: 1; transform: scale(1.05); }
.mode-icon { font-size: 2rem; display: block; margin-bottom: 5px; }
@media (max-width: 600px) { .filter-row-inputs { grid-template-columns: 1fr 1fr; } .filter-row-buttons { flex-wrap: wrap; } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
