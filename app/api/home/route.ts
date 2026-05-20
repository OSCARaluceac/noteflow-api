import { NextResponse } from 'next/server';

const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>NoteFlow API</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0a0a0b;font-family:Inter,system-ui,sans-serif;color:#fafaf9;min-height:100vh}
    .header{background:#18181b;border-bottom:2px solid #c5a028;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
    .logo-text{font-size:20px;font-weight:700;letter-spacing:3px;color:#c5a028}
    .logo-sub{font-size:11px;color:#78716c;letter-spacing:1px;margin-top:2px}
    .badge{background:#c5a02822;border:1px solid #c5a028;color:#c5a028;font-size:11px;padding:4px 10px;border-radius:4px;font-weight:600}
    .hero{padding:48px 32px 32px;max-width:900px;margin:0 auto}
    .hero h1{font-size:28px;font-weight:700;color:#fafaf9;margin-bottom:8px}
    .hero p{color:#78716c;font-size:15px;line-height:1.6;margin-bottom:32px}
    .auth-panel{background:#18181b;border:1px solid #3f3f46;border-radius:8px;padding:20px;margin-bottom:32px}
    .auth-panel h2{font-size:13px;font-weight:600;color:#a8a29e;letter-spacing:1px;margin-bottom:16px;text-transform:uppercase}
    .auth-row{display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap}
    .field{display:flex;flex-direction:column;gap:6px;flex:1;min-width:140px}
    .field label{font-size:12px;color:#78716c;font-weight:500}
    .field input{background:#0a0a0b;border:1px solid #3f3f46;border-radius:6px;padding:8px 12px;color:#fafaf9;font-size:14px;outline:none}
    .field input:focus{border-color:#c5a028}
    .btn{padding:8px 20px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;border:none;white-space:nowrap}
    .btn-gold{background:#c5a028;color:#0a0a0b}
    .btn-outline{background:transparent;border:1px solid #3f3f46;color:#a8a29e}
    .status{font-size:12px;padding:6px 12px;border-radius:4px;margin-top:10px;display:none}
    .status.ok{background:#16a34a22;border:1px solid #16a34a;color:#4ade80;display:block}
    .status.err{background:#dc262622;border:1px solid #dc2626;color:#f87171;display:block}
    .endpoints{max-width:900px;margin:0 auto;padding:0 32px 64px}
    .section-title{font-size:13px;font-weight:600;color:#a8a29e;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #27272a}
    .endpoint{background:#18181b;border:1px solid #27272a;border-radius:8px;margin-bottom:8px;overflow:hidden}
    .ep-header{display:flex;align-items:center;gap:12px;padding:14px 16px;cursor:pointer;user-select:none}
    .ep-header:hover{background:#1f1f22}
    .method{font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;min-width:56px;text-align:center}
    .GET{background:#16a34a22;color:#4ade80;border:1px solid #16a34a44}
    .POST{background:#2563eb22;color:#60a5fa;border:1px solid #2563eb44}
    .PATCH{background:#d9770622;color:#fb923c;border:1px solid #d9770644}
    .DELETE{background:#dc262622;color:#f87171;border:1px solid #dc262644}
    .ep-path{font-family:monospace;font-size:13px;color:#e7e5e4}
    .ep-desc{font-size:12px;color:#57534e;margin-left:auto}
    .lock{font-size:11px;color:#c5a028}
    .ep-body{display:none;padding:16px;border-top:1px solid #27272a}
    .ep-body.open{display:block}
    .try-label{font-size:11px;color:#78716c;margin-bottom:6px;font-weight:500;text-transform:uppercase;letter-spacing:0.5px}
    .try-section{margin-top:12px}
    textarea,input.param{width:100%;background:#0a0a0b;border:1px solid #3f3f46;border-radius:6px;padding:10px 12px;color:#fafaf9;font-family:monospace;font-size:12px;outline:none}
    textarea{resize:vertical;min-height:80px}
    textarea:focus,input.param:focus{border-color:#c5a028}
    .try-btn{background:#c5a028;color:#0a0a0b;border:none;border-radius:6px;padding:8px 16px;font-size:12px;font-weight:700;cursor:pointer;margin-top:10px}
    .response-box{margin-top:12px;background:#0a0a0b;border:1px solid #3f3f46;border-radius:6px;padding:12px;font-family:monospace;font-size:12px;color:#a8a29e;white-space:pre-wrap;max-height:260px;overflow-y:auto;display:none}
    .res-status{font-size:11px;font-weight:700;margin-bottom:8px}
    .res-2{color:#4ade80}.res-4{color:#f87171}.res-5{color:#f87171}
  </style>
</head>
<body>
  <header class="header">
    <div>
      <div class="logo-text">⚔ NOTEFLOW API</div>
      <div class="logo-sub">REST API · PostgreSQL · JWT Auth</div>
    </div>
    <span class="badge">v1.0.0</span>
  </header>
  <div class="hero">
    <h1>Tablón de Contratos de la API</h1>
    <p>API REST para la gestión de notas, listas e ideas. Autentícate primero para obtener tu token y ejecutar peticiones protegidas directamente desde aquí.</p>
    <div class="auth-panel">
      <h2>🔑 Autenticación</h2>
      <div class="auth-row">
        <div class="field"><label>Usuario</label><input id="au" placeholder="aventurero"/></div>
        <div class="field"><label>Contraseña</label><input id="ap" type="password" placeholder="••••••••"/></div>
        <button class="btn btn-gold" id="btn-login">Entrar</button>
        <button class="btn btn-outline" id="btn-register">Registrarse</button>
      </div>
      <div id="auth-status" class="status"></div>
    </div>
  </div>
  <div class="endpoints">
    <div class="section-title">Auth — públicos</div>
    <div id="ep-list"></div>
  </div>
  <script>
    const BASE = window.location.origin + '/api';
    let TOKEN = '';
    const EPS = [
      {m:'POST',p:'/auth/register',d:'Registrar usuario',auth:false,b:'{"username":"aventurero","password":"password123"}'},
      {m:'POST',p:'/auth/login',d:'Iniciar sesión — devuelve JWT',auth:false,b:'{"username":"aventurero","password":"password123"}'},
      {m:'GET',p:'/notes',d:'Todas las notas con items',auth:true,b:null},
      {m:'POST',p:'/notes',d:'Crear nota / checklist / idea',auth:true,b:'{"title":"Mi nota","type":"note","content":"Contenido de prueba"}'},
      {m:'GET',p:'/notes/:id',d:'Nota concreta con sus items',auth:true,b:null},
      {m:'PATCH',p:'/notes/:id',d:'Actualizar campos de una nota',auth:true,b:'{"title":"Titulo actualizado"}'},
      {m:'DELETE',p:'/notes/:id',d:'Eliminar nota (cascade items)',auth:true,b:null},
      {m:'GET',p:'/notes/:id/checklist-items',d:'Items de una lista',auth:true,b:null},
      {m:'POST',p:'/notes/:id/checklist-items',d:'Anadir item a una lista',auth:true,b:'{"text":"Nueva tarea"}'},
      {m:'PATCH',p:'/checklist-items/:itemId',d:'Marcar/desmarcar item',auth:true,b:'{"is_completed":true}'},
      {m:'DELETE',p:'/checklist-items/:itemId',d:'Eliminar item',auth:true,b:null},
      {m:'GET',p:'/misiones',d:'Todas las misiones',auth:true,b:null},
      {m:'POST',p:'/misiones',d:'Crear mision',auth:true,b:'{"title":"Nueva mision","categoria":"Caza","rango":"B"}'},
      {m:'GET',p:'/misiones/:id',d:'Mision por ID',auth:true,b:null},
      {m:'PATCH',p:'/misiones/:id',d:'Actualizar mision',auth:true,b:'{"completed":true}'},
      {m:'DELETE',p:'/misiones/:id',d:'Eliminar mision',auth:true,b:null},
    ];
    function render() {
      const list = document.getElementById('ep-list');
      let html = '', sN = false, sM = false;
      EPS.forEach((ep, i) => {
        if (ep.auth && ep.p.startsWith('/notes') && !sN) { html += '<div class="section-title" style="margin:28px 0 12px">Notas & Items — requieren JWT</div>'; sN = true; }
        if (ep.p.startsWith('/misiones') && !sM) { html += '<div class="section-title" style="margin:28px 0 12px">Misiones — requieren JWT</div>'; sM = true; }
        const bf = ep.b ? '<div class="try-section"><div class="try-label">Body JSON</div><textarea id="b'+i+'">'+JSON.stringify(JSON.parse(ep.b),null,2)+'</textarea></div>' : '';
        const pf = ep.p.includes(':') ? '<div class="try-section"><div class="try-label">'+(ep.p.includes('itemId')?'itemId':'id')+' (uuid)</div><input class="param" id="param'+i+'" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"/></div>' : '';
        html += '<div class="endpoint"><div class="ep-header" onclick="toggle('+i+')"><span class="method '+ep.m+'">'+ep.m+'</span><span class="ep-path">'+ep.p+'</span>'+(ep.auth?'<span class="lock">🔒</span>':'')+'<span class="ep-desc">'+ep.d+'</span></div><div class="ep-body" id="panel'+i+'">'+pf+bf+'<button class="try-btn" onclick="exec('+i+')">▶ Ejecutar</button><div class="response-box" id="res'+i+'"></div></div></div>';
      });
      list.innerHTML = html;
    }
    function toggle(i) { document.getElementById('panel'+i).classList.toggle('open'); }
    async function exec(i) {
      const ep = EPS[i]; let path = ep.p;
      const pe = document.getElementById('param'+i);
      if (pe && pe.value.trim()) path = path.replace(/:id|:itemId/, pe.value.trim());
      const re = document.getElementById('res'+i);
      re.style.display = 'block'; re.innerHTML = '<span style="color:#78716c">Ejecutando...</span>';
      const opts = {method:ep.m, headers:{'Content-Type':'application/json'}};
      if (TOKEN && ep.auth) opts.headers['Authorization'] = 'Bearer '+TOKEN;
      const be = document.getElementById('b'+i);
      if (be) opts.body = be.value;
      try {
        const r = await fetch(BASE+path, opts);
        const cls = 'res-'+String(r.status)[0];
        let text = r.status===204 ? '(sin body — 204 No Content)' : '';
        if (r.status!==204) { try { text=JSON.stringify(await r.json(),null,2); } catch(e) { text=await r.text(); } }
        if (r.ok && path==='/auth/login') { try { const d=JSON.parse(text); if(d.token){TOKEN=d.token;showStatus('Autenticado — token guardado','ok');} } catch(e){} }
        re.innerHTML = '<div class="res-status '+cls+'">HTTP '+r.status+'</div>'+text;
      } catch(e) { re.innerHTML = '<div class="res-status res-5">Error de red</div>'+e.message; }
    }
    async function doLogin() {
      const u=document.getElementById('au').value, pw=document.getElementById('ap').value;
      if(!u||!pw){showStatus('Introduce usuario y contrasena','err');return;}
      try {
        const r=await fetch(BASE+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:pw})});
        const d=await r.json();
        if(r.ok&&d.token){TOKEN=d.token;showStatus('Autenticado como @'+d.user.username+' OK','ok');}
        else showStatus(d.error||'Error al autenticar','err');
      } catch(e){showStatus('Error de conexion','err');}
    }
    async function doRegister() {
      const u=document.getElementById('au').value, pw=document.getElementById('ap').value;
      if(!u||!pw){showStatus('Introduce usuario y contrasena','err');return;}
      try {
        const r=await fetch(BASE+'/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:pw})});
        const d=await r.json();
        if(r.ok) showStatus('Usuario @'+u+' creado. Ahora pulsa Entrar.','ok');
        else showStatus(d.error||'Error al registrar','err');
      } catch(e){showStatus('Error de conexion','err');}
    }
    function showStatus(msg,type){const el=document.getElementById('auth-status');el.textContent=msg;el.className='status '+type;}
    document.getElementById('btn-login').addEventListener('click',doLogin);
    document.getElementById('btn-register').addEventListener('click',doRegister);
    render();
  </script>
</body>
</html>`;

export async function GET() {
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
