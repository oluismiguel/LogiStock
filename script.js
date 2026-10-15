// Protótipo local: produtos persistem neste navegador via localStorage.
try {
  const currentUser = JSON.parse(localStorage.getItem('logistock_demo_session') || 'null');
  if (!currentUser) { window.location.replace('login.html'); }
  else {
    const name = document.querySelector('.person-name strong');
    const avatar = document.querySelector('.avatar');
    if (name) name.textContent = currentUser.name;
    if (avatar) avatar.textContent = currentUser.name.split(/\s+/).map(part => part[0]).join('').slice(0,2).toUpperCase();
  }
} catch { window.location.replace('login.html'); }

const sidebar = document.getElementById('sidebar');
const toast = document.getElementById('toast');
let toastTimer;
function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

const MODULE_KEYS={finance:'logistock_finance_v1',accounts:'logistock_accounts_v1',logs:'logistock_logs_v1'};
function readModule(key){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function saveModule(key,value){localStorage.setItem(key,JSON.stringify(value))}
function addLog(action,details=''){const logs=readModule(MODULE_KEYS.logs);let user={};try{user=JSON.parse(localStorage.getItem('logistock_demo_session')||'{}')}catch{}logs.unshift({id:Date.now()+Math.random(),date:new Date().toISOString(),user:user.name||'Usuário',action,details});saveModule(MODULE_KEYS.logs,logs.slice(0,500))}
const baseNotify=notify;notify=function(message){baseNotify(message);if(!/Visualização demonstrativa/.test(message))addLog('Ação no sistema',message)};
function periodStart(period){const d=new Date();d.setHours(0,0,0,0);if(period==='daily')return d;if(period==='weekly'){d.setDate(d.getDate()-6);return d}if(period==='monthly'){d.setDate(1);return d}return new Date(0)}
function periodFilter(items,period,dateField='date'){const start=periodStart(period);return items.filter(x=>{const d=new Date(x[dateField]||0);return d>=start&&d<=new Date()})}
function moneyBR(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function moduleShell(title,subtitle,body){document.getElementById('addProductFab').hidden=true;document.getElementById('pageTitle').textContent=title;document.getElementById('pageSubtitle').textContent=subtitle;document.querySelector('.stats').hidden=true;document.querySelector('.command').hidden=true;document.getElementById('resultCount').hidden=true;document.getElementById('products').hidden=true;let host=document.getElementById('moduleContent');if(!host){host=document.createElement('section');host.id='moduleContent';document.querySelector('.main').append(host)}host.hidden=false;host.innerHTML=body}
function restoreDashboard(){document.getElementById('addProductFab').hidden=false;document.querySelector('.stats').hidden=false;document.querySelector('.command').hidden=false;document.getElementById('resultCount').hidden=false;document.getElementById('products').hidden=false;const host=document.getElementById('moduleContent');if(host)host.hidden=true;document.getElementById('pageTitle').textContent='Dashboard';document.getElementById('pageSubtitle').textContent='Visão geral do seu estoque e operações'}
function renderFinance(){
 const items=readModule(MODULE_KEYS.finance),period=document.getElementById('periodFilter')?.value||'monthly',chartType=document.getElementById('chartType')?.value||'pie',filtered=periodFilter(items,period);
 const income=filtered.filter(x=>x.type==='Entrada').reduce((s,x)=>s+Number(x.amount),0),expense=filtered.filter(x=>x.type==='Saída').reduce((s,x)=>s+Number(x.amount),0);
 const chartData=[{label:'Entradas',value:income},{label:'Saídas',value:expense}];
 function chartMarkup(type,data){
   const total=data.reduce((a,b)=>a+b.value,0)||1;
   if(type==='bar')return `<svg viewBox="0 0 520 210" role="img" aria-label="Gráfico de barras de entradas e saídas"><line x1="60" y1="170" x2="490" y2="170" stroke="#555"/><rect x="130" y="${170-(data[0].value/total)*130}" width="85" height="${Math.max(2,(data[0].value/total)*130)}" rx="8" fill="#00d6a0"/><rect x="300" y="${170-(data[1].value/total)*130}" width="85" height="${Math.max(2,(data[1].value/total)*130)}" rx="8" fill="#ff2438"/><text x="172" y="195" text-anchor="middle" fill="currentColor">Entradas</text><text x="342" y="195" text-anchor="middle" fill="currentColor">Saídas</text></svg>`;
   if(type==='line')return `<svg viewBox="0 0 520 210" role="img" aria-label="Gráfico de linhas de entradas e saídas"><path d="M60 170 H490 M60 120 H490 M60 70 H490" stroke="#444" fill="none"/><polyline points="80,${170-(data[0].value/total)*130} 270,${170-(data[0].value/total)*130} 470,${170-(data[1].value/total)*130}" fill="none" stroke="#ff2438" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="80" cy="${170-(data[0].value/total)*130}" r="6" fill="#00d6a0"/><circle cx="270" cy="${170-(data[0].value/total)*130}" r="6" fill="#00d6a0"/><circle cx="470" cy="${170-(data[1].value/total)*130}" r="6" fill="#ff2438"/><text x="80" y="195" fill="currentColor">Entradas</text><text x="400" y="195" fill="currentColor">Saídas</text></svg>`;
   const angle=data[0].value/total*360,large=angle>180?1:0,rad=angle*Math.PI/180,x=100+68*Math.sin(rad),y=100-68*Math.cos(rad),path=`M 100 100 L 100 32 A 68 68 0 ${large} 1 ${x} ${y} Z`;
   return `<svg viewBox="0 0 520 210" role="img" aria-label="Gráfico de pizza de entradas e saídas"><g transform="translate(20 5)"><circle cx="100" cy="100" r="68" fill="#ff2438"/><path d="${path}" fill="#00d6a0"/></g><rect x="230" y="70" width="12" height="12" rx="3" fill="#00d6a0"/><text x="252" y="81" fill="currentColor">Entradas · ${moneyBR(income)}</text><rect x="230" y="105" width="12" height="12" rx="3" fill="#ff2438"/><text x="252" y="116" fill="currentColor">Saídas · ${moneyBR(expense)}</text></svg>`;
 }
 moduleShell('Financeiro','Acompanhe entradas, saídas e saldo por período',`<div class="module-toolbar"><div class="module-filters"><label>Período <select id="periodFilter"><option value="daily">Diário</option><option value="weekly">Semanal</option><option value="monthly" selected>Mensal</option><option value="all">Todo o período</option></select></label><label>Gráfico <select id="chartType"><option value="pie">Pizza</option><option value="bar">Barras</option><option value="line">Linhas</option></select></label></div><button class="module-action" id="addTransaction">＋ Novo lançamento</button></div><div class="module-cards"><div class="module-card"><small>Entradas</small><strong>${moneyBR(income)}</strong></div><div class="module-card"><small>Saídas</small><strong>${moneyBR(expense)}</strong></div><div class="module-card"><small>Saldo</small><strong>${moneyBR(income-expense)}</strong></div></div><div class="module-panel"><h3>Resumo gráfico</h3><div class="finance-chart">${chartMarkup(chartType,chartData)}</div></div><div class="module-panel"><h3>Novo lançamento</h3><form id="transactionForm" class="module-form"><select name="type"><option>Entrada</option><option>Saída</option></select><input name="description" required placeholder="Descrição"><input name="amount" required type="number" min=".01" step=".01" placeholder="Valor (R$)"><input name="date" type="date" required value="${new Date().toISOString().slice(0,10)}"><button class="module-action">Salvar</button></form><h3>Movimentações</h3><table class="module-table"><thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Valor</th></tr></thead><tbody>${filtered.map(x=>`<tr><td>${new Date(x.date+'T12:00:00').toLocaleDateString('pt-BR')}</td><td><span class="module-badge ${x.type==='Entrada'?'good':'warn'}">${x.type}</span></td><td>${escapeHtml(x.description)}</td><td>${moneyBR(x.amount)}</td></tr>`).join('')||'<tr><td colspan="4" class="module-empty">Nenhum lançamento neste período.</td></tr>'}</tbody></table></div>`);
 document.getElementById('periodFilter').value=period;document.getElementById('chartType').value=chartType;document.getElementById('periodFilter').onchange=renderFinance;document.getElementById('chartType').onchange=renderFinance;
 document.getElementById('addTransaction').onclick=()=>document.querySelector('[name="description"]').focus();
 document.getElementById('transactionForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),amount=Number(f.get('amount'));if(amount<=0)return;const list=readModule(MODULE_KEYS.finance);list.unshift({id:Date.now(),type:f.get('type'),description:f.get('description').trim(),amount,date:f.get('date')});saveModule(MODULE_KEYS.finance,list);addLog('Lançamento financeiro',`${f.get('type')}: ${f.get('description')} (${moneyBR(amount)})`);renderFinance();notify('Lançamento financeiro salvo.')}
}
function renderAccounts(){
 let accounts=readModule(MODULE_KEYS.accounts),session={};try{session=JSON.parse(localStorage.getItem('logistock_demo_session')||'{}')}catch{}
 const users=(()=>{try{return JSON.parse(localStorage.getItem('logistock_demo_users')||'[]')}catch{return []}})();
 // Sincroniza cadastros feitos pela tela de registro com a tabela administrativa.
 users.forEach(u=>{if(!accounts.some(a=>a.email.toLowerCase()===u.email.toLowerCase()))accounts.unshift({id:u.id||Date.now(),name:u.name,email:u.email,role:u.role||'A definir',status:u.status||'Pendente',date:u.date||new Date().toISOString()})});
 if(!accounts.some(a=>a.email==='admin@logistock.local'))accounts.unshift({id:'admin-demo',name:'Administrador',email:'admin@logistock.local',role:'Administrador',status:'Aprovada',date:new Date().toISOString()});
 saveModule(MODULE_KEYS.accounts,accounts);
 const isAdmin=session.role==='Administrador'||session.email==='admin@logistock.local';
 const period=document.getElementById('periodFilter')?.value||'all',filtered=periodFilter(accounts,period);
 const statusBadge=status=>`<span class="module-badge ${status==='Aprovada'?'good':status==='Rejeitada'?'warn':'pending'}">${escapeHtml(status||'Pendente')}</span>`;
 moduleShell('Controle de contas','Aprove novos cadastros e defina o perfil de acesso',`${!isAdmin?'<div class="module-panel"><p class="helper-text">Somente um Administrador pode aprovar contas ou alterar perfis. Você está visualizando a lista em modo somente leitura.</p></div>':''}<div class="module-toolbar"><div class="module-filters"><label>Período de cadastro <select id="periodFilter"><option value="daily">Diário</option><option value="weekly">Semanal</option><option value="monthly">Mensal</option><option value="all" selected>Todo o período</option></select></label><label>Status <select id="accountStatusFilter"><option value="all">Todos</option><option value="Pendente">Pendentes</option><option value="Aprovada">Aprovadas</option><option value="Rejeitada">Rejeitadas</option></select></label></div></div><div class="module-panel"><div class="module-cards"><div class="module-card"><small>Total de contas</small><strong>${accounts.length}</strong></div><div class="module-card"><small>Aguardando aprovação</small><strong>${accounts.filter(a=>(a.status||'Pendente')==='Pendente').length}</strong></div><div class="module-card"><small>Aprovadas</small><strong>${accounts.filter(a=>a.status==='Aprovada').length}</strong></div></div><h3>Solicitações e contas cadastradas</h3><p class="helper-text">Novos usuários podem se registrar normalmente, mas o login fica bloqueado até que um administrador aprove a conta e atribua um perfil.</p><table class="module-table"><thead><tr><th>Usuário</th><th>E-mail</th><th>Perfil</th><th>Status</th><th>Cadastro</th>${isAdmin?'<th>Ações administrativas</th>':''}</tr></thead><tbody id="accountsRows">${filtered.map(x=>`<tr data-status="${escapeHtml(x.status||'Pendente')}"><td>${escapeHtml(x.name)}</td><td>${escapeHtml(x.email)}</td><td>${isAdmin&&x.email!=='admin@logistock.local'?`<select class="role-select" data-role-email="${escapeHtml(x.email)}"><option ${x.role==='Operador'?'selected':''}>Operador</option><option ${x.role==='Financeiro'?'selected':''}>Financeiro</option><option ${x.role==='Administrador'?'selected':''}>Administrador</option><option ${x.role==='Somente leitura'?'selected':''}>Somente leitura</option><option ${x.role==='A definir'?'selected':''} disabled>A definir</option></select>`:escapeHtml(x.role||'A definir')}</td><td>${statusBadge(x.status||'Pendente')}</td><td>${new Date(x.date).toLocaleDateString('pt-BR')}</td>${isAdmin?`<td>${x.email==='admin@logistock.local'?'<span class="helper-text">Conta principal</span>':`<div class="account-actions"><button class="module-action" data-approve="${escapeHtml(x.email)}" ${x.status==='Aprovada'?'disabled':''}>✓ Aprovar</button><button class="module-action danger" data-reject="${escapeHtml(x.email)}" ${x.status==='Rejeitada'?'disabled':''}>Recusar</button><button class="module-action danger" data-delete-account="${escapeHtml(x.email)}" title="Excluir conta" aria-label="Excluir conta">🗑</button></div>`}</td>`:''}</tr>`).join('')||`<tr><td colspan="${isAdmin?6:5}" class="module-empty">Nenhuma conta neste período.</td></tr>`}</tbody></table></div>`);
 document.getElementById('periodFilter').value=period;document.getElementById('periodFilter').onchange=renderAccounts;
 const statusFilter=document.getElementById('accountStatusFilter');statusFilter.onchange=()=>{const wanted=statusFilter.value;document.querySelectorAll('#accountsRows tr[data-status]').forEach(row=>row.hidden=wanted!=='all'&&row.dataset.status!==wanted)};
 if(!isAdmin)return;
 document.querySelectorAll('[data-role-email]').forEach(sel=>sel.onchange=()=>{const email=sel.dataset.roleEmail,role=sel.value;const list=readModule(MODULE_KEYS.accounts);const account=list.find(a=>a.email.toLowerCase()===email.toLowerCase());if(account){account.role=role;saveModule(MODULE_KEYS.accounts,list)}const us=(()=>{try{return JSON.parse(localStorage.getItem('logistock_demo_users')||'[]')}catch{return []}})();const user=us.find(u=>u.email.toLowerCase()===email.toLowerCase());if(user){user.role=role;localStorage.setItem('logistock_demo_users',JSON.stringify(us))}addLog('Perfil de conta alterado',`${email} — ${role}`);notify('Perfil atualizado.');});
 document.querySelectorAll('[data-approve]').forEach(btn=>btn.onclick=()=>{const email=btn.dataset.approve;const roleSelect=document.querySelector(`[data-role-email="${CSS.escape(email)}"]`);const role=roleSelect?.value||'Operador';if(role==='A definir')return notify('Escolha um perfil antes de aprovar.');const list=readModule(MODULE_KEYS.accounts);const account=list.find(a=>a.email.toLowerCase()===email.toLowerCase());if(account){account.status='Aprovada';account.role=role;saveModule(MODULE_KEYS.accounts,list)}const us=(()=>{try{return JSON.parse(localStorage.getItem('logistock_demo_users')||'[]')}catch{return []}})();const user=us.find(u=>u.email.toLowerCase()===email.toLowerCase());if(user){user.status='Aprovada';user.role=role;localStorage.setItem('logistock_demo_users',JSON.stringify(us))}addLog('Conta aprovada',`${email} — perfil: ${role}`);renderAccounts();notify('Conta aprovada. O usuário já pode fazer login.');});
 document.querySelectorAll('[data-reject]').forEach(btn=>btn.onclick=()=>{const email=btn.dataset.reject;if(!confirm(`Recusar o cadastro de ${email}?`))return;const list=readModule(MODULE_KEYS.accounts);const account=list.find(a=>a.email.toLowerCase()===email.toLowerCase());if(account)account.status='Rejeitada';saveModule(MODULE_KEYS.accounts,list);const us=(()=>{try{return JSON.parse(localStorage.getItem('logistock_demo_users')||'[]')}catch{return []}})();const user=us.find(u=>u.email.toLowerCase()===email.toLowerCase());if(user)user.status='Rejeitada';localStorage.setItem('logistock_demo_users',JSON.stringify(us));addLog('Conta recusada',email);renderAccounts();notify('Solicitação recusada.');});
 document.querySelectorAll('[data-delete-account]').forEach(btn=>btn.onclick=()=>{
   const email=btn.dataset.deleteAccount;
   if(email==='admin@logistock.local')return notify('A conta administrativa principal não pode ser excluída.');
   if(!confirm(`Excluir permanentemente a conta ${email} deste navegador?`))return;
   const accountsNow=readModule(MODULE_KEYS.accounts).filter(a=>a.email.toLowerCase()!==email.toLowerCase());saveModule(MODULE_KEYS.accounts,accountsNow);
   const usersNow=(()=>{try{return JSON.parse(localStorage.getItem('logistock_demo_users')||'[]')}catch{return []}})().filter(u=>u.email.toLowerCase()!==email.toLowerCase());localStorage.setItem('logistock_demo_users',JSON.stringify(usersNow));
   addLog('Conta excluída',email);renderAccounts();notify('Conta excluída deste navegador.');
 });
}
function renderLogs(){const items=readModule(MODULE_KEYS.logs),period=document.getElementById('periodFilter')?.value||'monthly',filtered=periodFilter(items,period);moduleShell('Logs do sistema','Registro de atividades recentes do LogiStock',`<div class="module-toolbar"><div class="module-filters"><label>Período <select id="periodFilter"><option value="daily">Diário</option><option value="weekly">Semanal</option><option value="monthly" selected>Mensal</option><option value="all">Todo o período</option></select></label></div></div><div class="module-panel"><table class="module-table"><thead><tr><th>Data e hora</th><th>Usuário</th><th>Ação</th><th>Detalhes</th></tr></thead><tbody>${filtered.map(x=>`<tr><td>${new Date(x.date).toLocaleString('pt-BR')}</td><td>${escapeHtml(x.user||'Sistema')}</td><td>${escapeHtml(x.action)}</td><td>${escapeHtml(x.details||'—')}</td></tr>`).join('')||'<tr><td colspan="4" class="module-empty">Nenhum evento neste período.</td></tr>'}</tbody></table></div>`);document.getElementById('periodFilter').value=period;document.getElementById('periodFilter').onchange=renderLogs;}
function navigateModule(page){document.querySelectorAll('.nav button').forEach(item=>item.classList.toggle('active',item.dataset.page===page));if(page==='Dashboard'){restoreDashboard();return}if(page==='Financeiro')renderFinance();else if(page==='Controle de contas')renderAccounts();else if(page==='Logs do sistema')renderLogs();else moduleShell(page,'Preferências e opções do sistema','<div class="module-panel">As configurações gerais estarão disponíveis em uma próxima etapa.</div>')}

document.querySelector('.brand-mini').addEventListener('click', () => sidebar.classList.toggle('expanded'));
document.querySelectorAll('.nav button, .sidebar-bottom button').forEach(button => {
 button.addEventListener('click',()=>{const page=button.dataset.page;if(page==='Sair'){localStorage.removeItem('logistock_demo_session');window.location.href='login.html';return}navigateModule(page)});
});

const seedProducts = [
  {
    "id": "CX-KFT-001",
    "name": "Caixa de Papelão Kraft 40x30x20",
    "category": "Embalagem",
    "qty": 240,
    "cost": 2.5,
    "price": 4.2,
    "icon": "📦",
    "image": "https://images.unsplash.com/photo-1607166452427-7e4477079c0e?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "FT-ADH-048",
    "name": "Fita Adesiva Transparente 48mm",
    "category": "Embalagem",
    "qty": 85,
    "cost": 5.9,
    "price": 9.5,
    "icon": "🧻",
    "image": "https://images.unsplash.com/photo-1607166452427-7e4477079c0e?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "PL-MAD-100",
    "name": "Palete de Madeira PBR 100x120",
    "category": "Transporte",
    "qty": 32,
    "cost": 45,
    "price": 68,
    "icon": "🪵",
    "image": "https://images.unsplash.com/photo-1586528116025-7d7c3e4f4f2f?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "SC-RFA-060",
    "name": "Saco de Ráfia 60x90cm",
    "category": "Embalagem",
    "qty": 8,
    "cost": 3.2,
    "price": 5.8,
    "icon": "🧺",
    "image": "https://images.unsplash.com/photo-1607166452427-7e4477079c0e?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "ET-TER-1015",
    "name": "Etiqueta Térmica 10x15cm (Rolo)",
    "category": "Identificação",
    "qty": 56,
    "cost": 18,
    "price": 29,
    "icon": "🏷️",
    "image": "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "CR-PLT-300",
    "name": "Carrinho Plataforma 300kg",
    "category": "Transporte",
    "qty": 12,
    "cost": 320,
    "price": 450,
    "icon": "🛒",
    "image": "https://images.unsplash.com/photo-1586528116025-7d7c3e4f4f2f?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "FL-STR-500",
    "name": "Filme Stretch 500mm",
    "category": "Embalagem",
    "qty": 138,
    "cost": 32,
    "price": 48,
    "icon": "🎞️",
    "image": "https://images.unsplash.com/photo-1607166452427-7e4477079c0e?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LV-PRO-010",
    "name": "Luva de Proteção Tamanho G",
    "category": "Segurança",
    "qty": 0,
    "cost": 8,
    "price": 14,
    "icon": "🧤",
    "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-009",
    "name": "Bobina de Plástico Bolha 1,2m",
    "category": "Embalagem",
    "qty": 22,
    "cost": 48,
    "price": 72,
    "icon": "🫧",
    "image": "https://images.unsplash.com/photo-1607166452427-7e4477079c0e?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-010",
    "name": "Envelope de Segurança 26x36cm",
    "category": "Embalagem",
    "qty": 90,
    "cost": 0.75,
    "price": 1.4,
    "icon": "✉️",
    "image": "https://images.unsplash.com/photo-1607166452427-7e4477079c0e?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-011",
    "name": "Caixa para E-commerce P",
    "category": "Embalagem",
    "qty": 180,
    "cost": 1.4,
    "price": 2.6,
    "icon": "📦",
    "image": "https://images.unsplash.com/photo-1607166452427-7e4477079c0e?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-012",
    "name": "Caixa para E-commerce M",
    "category": "Embalagem",
    "qty": 145,
    "cost": 2.1,
    "price": 3.8,
    "icon": "📦",
    "image": "https://images.unsplash.com/photo-1607166452427-7e4477079c0e?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-013",
    "name": "Caixa para E-commerce G",
    "category": "Embalagem",
    "qty": 96,
    "cost": 3.5,
    "price": 6.2,
    "icon": "📦",
    "image": "https://images.unsplash.com/photo-1607166452427-7e4477079c0e?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-014",
    "name": "Fita Gomada Reforçada",
    "category": "Embalagem",
    "qty": 42,
    "cost": 12,
    "price": 19,
    "icon": "🧻",
    "image": "https://images.unsplash.com/photo-1607166452427-7e4477079c0e?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-015",
    "name": "Dispensador de Fita Manual",
    "category": "Ferramentas",
    "qty": 14,
    "cost": 28,
    "price": 42,
    "icon": "🛠️",
    "image": "https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-016",
    "name": "Estilete Profissional",
    "category": "Ferramentas",
    "qty": 26,
    "cost": 9.5,
    "price": 16,
    "icon": "🔪",
    "image": "https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-017",
    "name": "Lâmina para Estilete (10 un.)",
    "category": "Ferramentas",
    "qty": 34,
    "cost": 6,
    "price": 10,
    "icon": "🛠️",
    "image": "https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-018",
    "name": "Marcador Permanente Preto",
    "category": "Escritório",
    "qty": 65,
    "cost": 2.8,
    "price": 5,
    "icon": "🖊️",
    "image": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-019",
    "name": "Caneta Esferográfica Azul",
    "category": "Escritório",
    "qty": 120,
    "cost": 0.9,
    "price": 1.8,
    "icon": "🖊️",
    "image": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-020",
    "name": "Papel A4 500 folhas",
    "category": "Escritório",
    "qty": 44,
    "cost": 24,
    "price": 35,
    "icon": "📄",
    "image": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-021",
    "name": "Prancheta A4",
    "category": "Escritório",
    "qty": 18,
    "cost": 8,
    "price": 14,
    "icon": "📋",
    "image": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-022",
    "name": "Calculadora de Mesa 12 dígitos",
    "category": "Escritório",
    "qty": 9,
    "cost": 38,
    "price": 59,
    "icon": "🧮",
    "image": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-023",
    "name": "Leitor de Código de Barras USB",
    "category": "Tecnologia",
    "qty": 7,
    "cost": 145,
    "price": 219,
    "icon": "📟",
    "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-024",
    "name": "Impressora de Etiquetas Térmica",
    "category": "Tecnologia",
    "qty": 4,
    "cost": 580,
    "price": 799,
    "icon": "🖨️",
    "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-025",
    "name": "Rolo Etiqueta Térmica 100x150",
    "category": "Identificação",
    "qty": 38,
    "cost": 22,
    "price": 34,
    "icon": "🏷️",
    "image": "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-026",
    "name": "Ribbon Cera 110x74mm",
    "category": "Identificação",
    "qty": 24,
    "cost": 18,
    "price": 29,
    "icon": "🎞️",
    "image": "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-027",
    "name": "Balança Digital 30kg",
    "category": "Equipamentos",
    "qty": 5,
    "cost": 190,
    "price": 279,
    "icon": "⚖️",
    "image": "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-028",
    "name": "Balança de Bancada 100kg",
    "category": "Equipamentos",
    "qty": 3,
    "cost": 480,
    "price": 699,
    "icon": "⚖️",
    "image": "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-029",
    "name": "Transpaleteira Manual 2,5t",
    "category": "Transporte",
    "qty": 2,
    "cost": 1450,
    "price": 1890,
    "icon": "🛒",
    "image": "https://images.unsplash.com/photo-1586528116025-7d7c3e4f4f2f?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-030",
    "name": "Cinta de Amarração 5t",
    "category": "Transporte",
    "qty": 17,
    "cost": 32,
    "price": 49,
    "icon": "🪢",
    "image": "https://images.unsplash.com/photo-1586528116025-7d7c3e4f4f2f?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-031",
    "name": "Corda Polipropileno 10mm (20m)",
    "category": "Transporte",
    "qty": 21,
    "cost": 28,
    "price": 43,
    "icon": "🪢",
    "image": "https://images.unsplash.com/photo-1586528116025-7d7c3e4f4f2f?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-032",
    "name": "Filme Stretch Mini 100mm",
    "category": "Embalagem",
    "qty": 57,
    "cost": 8,
    "price": 13,
    "icon": "🎞️",
    "image": "https://images.unsplash.com/photo-1607166452427-7e4477079c0e?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-033",
    "name": "Cantoneira de Papelão 1m",
    "category": "Embalagem",
    "qty": 110,
    "cost": 1.2,
    "price": 2.2,
    "icon": "📐",
    "image": "https://images.unsplash.com/photo-1607166452427-7e4477079c0e?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-034",
    "name": "Separador de Papelão",
    "category": "Embalagem",
    "qty": 250,
    "cost": 0.35,
    "price": 0.8,
    "icon": "📄",
    "image": "https://images.unsplash.com/photo-1607166452427-7e4477079c0e?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-035",
    "name": "Saco Zip 20x30cm (100 un.)",
    "category": "Embalagem",
    "qty": 31,
    "cost": 19,
    "price": 29,
    "icon": "🛍️",
    "image": "https://images.unsplash.com/photo-1607166452427-7e4477079c0e?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-036",
    "name": "Saco Plástico 40x60cm (100 un.)",
    "category": "Embalagem",
    "qty": 28,
    "cost": 25,
    "price": 38,
    "icon": "🛍️",
    "image": "https://images.unsplash.com/photo-1607166452427-7e4477079c0e?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-037",
    "name": "Lacre de Segurança Numerado",
    "category": "Segurança",
    "qty": 76,
    "cost": 0.65,
    "price": 1.2,
    "icon": "🔒",
    "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-038",
    "name": "Cadeado Latão 40mm",
    "category": "Segurança",
    "qty": 16,
    "cost": 18,
    "price": 29,
    "icon": "🔒",
    "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-039",
    "name": "Colete Refletivo G",
    "category": "Segurança",
    "qty": 22,
    "cost": 14,
    "price": 24,
    "icon": "🦺",
    "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-040",
    "name": "Capacete de Segurança Branco",
    "category": "Segurança",
    "qty": 19,
    "cost": 22,
    "price": 35,
    "icon": "⛑️",
    "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-041",
    "name": "Óculos de Proteção Incolor",
    "category": "Segurança",
    "qty": 33,
    "cost": 5.5,
    "price": 9.9,
    "icon": "🥽",
    "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-042",
    "name": "Protetor Auricular Plug (par)",
    "category": "Segurança",
    "qty": 80,
    "cost": 1.1,
    "price": 2.5,
    "icon": "🎧",
    "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-043",
    "name": "Botina de Segurança nº 40",
    "category": "Segurança",
    "qty": 11,
    "cost": 68,
    "price": 99,
    "icon": "🥾",
    "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-044",
    "name": "Luva Nitrílica Caixa 100 un.",
    "category": "Segurança",
    "qty": 15,
    "cost": 28,
    "price": 42,
    "icon": "🧤",
    "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-045",
    "name": "Máscara PFF2 (un.)",
    "category": "Segurança",
    "qty": 100,
    "cost": 1.8,
    "price": 3.5,
    "icon": "😷",
    "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-046",
    "name": "Extintor ABC 6kg",
    "category": "Segurança",
    "qty": 3,
    "cost": 210,
    "price": 299,
    "icon": "🧯",
    "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-047",
    "name": "Kit Primeiros Socorros",
    "category": "Segurança",
    "qty": 6,
    "cost": 75,
    "price": 119,
    "icon": "🩹",
    "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-048",
    "name": "Lanterna LED Recarregável",
    "category": "Equipamentos",
    "qty": 13,
    "cost": 35,
    "price": 59,
    "icon": "🔦",
    "image": "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-049",
    "name": "Extensão Elétrica 10m",
    "category": "Equipamentos",
    "qty": 10,
    "cost": 42,
    "price": 65,
    "icon": "🔌",
    "image": "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-050",
    "name": "Filtro de Linha 6 tomadas",
    "category": "Tecnologia",
    "qty": 17,
    "cost": 29,
    "price": 45,
    "icon": "🔌",
    "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-051",
    "name": "Roteador Wi-Fi Dual Band",
    "category": "Tecnologia",
    "qty": 4,
    "cost": 210,
    "price": 329,
    "icon": "📶",
    "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-052",
    "name": "Cabo USB-C 1m",
    "category": "Tecnologia",
    "qty": 40,
    "cost": 12,
    "price": 22,
    "icon": "🔌",
    "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-053",
    "name": "Mouse USB Óptico",
    "category": "Tecnologia",
    "qty": 23,
    "cost": 18,
    "price": 32,
    "icon": "🖱️",
    "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-054",
    "name": "Teclado USB ABNT2",
    "category": "Tecnologia",
    "qty": 12,
    "cost": 48,
    "price": 75,
    "icon": "⌨️",
    "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-055",
    "name": "Monitor LED 24 polegadas",
    "category": "Tecnologia",
    "qty": 5,
    "cost": 620,
    "price": 899,
    "icon": "🖥️",
    "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-056",
    "name": "Notebook Corporativo i5",
    "category": "Tecnologia",
    "qty": 2,
    "cost": 2800,
    "price": 3590,
    "icon": "💻",
    "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-057",
    "name": "Headset USB com Microfone",
    "category": "Tecnologia",
    "qty": 8,
    "cost": 95,
    "price": 149,
    "icon": "🎧",
    "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-058",
    "name": "Webcam Full HD",
    "category": "Tecnologia",
    "qty": 6,
    "cost": 135,
    "price": 199,
    "icon": "📷",
    "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-059",
    "name": "Suporte para Monitor",
    "category": "Escritório",
    "qty": 14,
    "cost": 75,
    "price": 119,
    "icon": "🖥️",
    "image": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-060",
    "name": "Cadeira Ergonômica",
    "category": "Mobiliário",
    "qty": 7,
    "cost": 690,
    "price": 990,
    "icon": "🪑",
    "image": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-061",
    "name": "Mesa de Escritório 120cm",
    "category": "Mobiliário",
    "qty": 3,
    "cost": 420,
    "price": 620,
    "icon": "🪑",
    "image": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-062",
    "name": "Estante Metálica 5 Prateleiras",
    "category": "Mobiliário",
    "qty": 6,
    "cost": 310,
    "price": 459,
    "icon": "🗄️",
    "image": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-063",
    "name": "Armário de Aço 2 Portas",
    "category": "Mobiliário",
    "qty": 2,
    "cost": 780,
    "price": 1090,
    "icon": "🗄️",
    "image": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-064",
    "name": "Caixa Organizadora 30L",
    "category": "Armazenagem",
    "qty": 45,
    "cost": 24,
    "price": 39,
    "icon": "🧰",
    "image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-065",
    "name": "Caixa Plástica Vazado 50L",
    "category": "Armazenagem",
    "qty": 32,
    "cost": 39,
    "price": 59,
    "icon": "🧺",
    "image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-066",
    "name": "Contentor Plástico 120L",
    "category": "Armazenagem",
    "qty": 10,
    "cost": 185,
    "price": 269,
    "icon": "🗑️",
    "image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-067",
    "name": "Contentor com Rodas 240L",
    "category": "Armazenagem",
    "qty": 4,
    "cost": 390,
    "price": 549,
    "icon": "🗑️",
    "image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-068",
    "name": "Prateleira Plástica 4 níveis",
    "category": "Armazenagem",
    "qty": 9,
    "cost": 120,
    "price": 179,
    "icon": "🗄️",
    "image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-069",
    "name": "Gaveteiro Organizador 24 gavetas",
    "category": "Armazenagem",
    "qty": 8,
    "cost": 95,
    "price": 149,
    "icon": "🗄️",
    "image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-070",
    "name": "Saco de Lixo Reforçado 100L (100 un.)",
    "category": "Limpeza",
    "qty": 22,
    "cost": 42,
    "price": 65,
    "icon": "🗑️",
    "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-071",
    "name": "Detergente Neutro 5L",
    "category": "Limpeza",
    "qty": 16,
    "cost": 18,
    "price": 29,
    "icon": "🧴",
    "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-072",
    "name": "Desinfetante 5L",
    "category": "Limpeza",
    "qty": 12,
    "cost": 21,
    "price": 34,
    "icon": "🧴",
    "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-073",
    "name": "Álcool 70% 1L",
    "category": "Limpeza",
    "qty": 30,
    "cost": 7,
    "price": 12,
    "icon": "🧴",
    "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-074",
    "name": "Pano de Microfibra (kit 5)",
    "category": "Limpeza",
    "qty": 28,
    "cost": 12,
    "price": 19,
    "icon": "🧽",
    "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-075",
    "name": "Vassoura Industrial",
    "category": "Limpeza",
    "qty": 10,
    "cost": 25,
    "price": 39,
    "icon": "🧹",
    "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-076",
    "name": "Rodo 60cm",
    "category": "Limpeza",
    "qty": 14,
    "cost": 18,
    "price": 29,
    "icon": "🧹",
    "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-077",
    "name": "Balde Plástico 20L",
    "category": "Limpeza",
    "qty": 11,
    "cost": 16,
    "price": 25,
    "icon": "🪣",
    "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-078",
    "name": "Papel Toalha Interfolhado (1000 fls.)",
    "category": "Limpeza",
    "qty": 35,
    "cost": 14,
    "price": 23,
    "icon": "🧻",
    "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-079",
    "name": "Sabonete Líquido 5L",
    "category": "Limpeza",
    "qty": 8,
    "cost": 32,
    "price": 49,
    "icon": "🧴",
    "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-080",
    "name": "Copo Descartável 200ml (100 un.)",
    "category": "Copa",
    "qty": 55,
    "cost": 5,
    "price": 8.5,
    "icon": "🥤",
    "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-081",
    "name": "Água Mineral 500ml (fardo 12)",
    "category": "Copa",
    "qty": 19,
    "cost": 18,
    "price": 27,
    "icon": "💧",
    "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-082",
    "name": "Café Torrado 500g",
    "category": "Copa",
    "qty": 24,
    "cost": 16,
    "price": 25,
    "icon": "☕",
    "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-083",
    "name": "Açúcar Refinado 5kg",
    "category": "Copa",
    "qty": 12,
    "cost": 19,
    "price": 29,
    "icon": "🧂",
    "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-084",
    "name": "Filtro de Café nº 103",
    "category": "Copa",
    "qty": 20,
    "cost": 4.5,
    "price": 7.5,
    "icon": "☕",
    "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-085",
    "name": "Garrafa Térmica 1L",
    "category": "Copa",
    "qty": 7,
    "cost": 48,
    "price": 75,
    "icon": "☕",
    "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-086",
    "name": "Kit Ferramentas 100 peças",
    "category": "Ferramentas",
    "qty": 5,
    "cost": 180,
    "price": 269,
    "icon": "🧰",
    "image": "https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-087",
    "name": "Furadeira de Impacto 650W",
    "category": "Ferramentas",
    "qty": 3,
    "cost": 240,
    "price": 359,
    "icon": "🛠️",
    "image": "https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-088",
    "name": "Parafusadeira a Bateria",
    "category": "Ferramentas",
    "qty": 4,
    "cost": 310,
    "price": 449,
    "icon": "🛠️",
    "image": "https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-089",
    "name": "Trena 5m",
    "category": "Ferramentas",
    "qty": 20,
    "cost": 12,
    "price": 19,
    "icon": "📏",
    "image": "https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-090",
    "name": "Alicate Universal 8 pol.",
    "category": "Ferramentas",
    "qty": 12,
    "cost": 22,
    "price": 35,
    "icon": "🛠️",
    "image": "https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-091",
    "name": "Chave de Fenda Kit 6 peças",
    "category": "Ferramentas",
    "qty": 17,
    "cost": 28,
    "price": 42,
    "icon": "🪛",
    "image": "https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-092",
    "name": "Martelo Unha 25mm",
    "category": "Ferramentas",
    "qty": 9,
    "cost": 26,
    "price": 39,
    "icon": "🔨",
    "image": "https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-093",
    "name": "Abraçadeira Nylon 200mm (100 un.)",
    "category": "Ferramentas",
    "qty": 42,
    "cost": 8,
    "price": 13,
    "icon": "🔗",
    "image": "https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-094",
    "name": "Parafuso Sextavado M8 (100 un.)",
    "category": "Ferragens",
    "qty": 25,
    "cost": 18,
    "price": 29,
    "icon": "🔩",
    "image": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-095",
    "name": "Porca M8 (100 un.)",
    "category": "Ferragens",
    "qty": 21,
    "cost": 9,
    "price": 15,
    "icon": "🔩",
    "image": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-096",
    "name": "Arruela Lisa M8 (100 un.)",
    "category": "Ferragens",
    "qty": 18,
    "cost": 6,
    "price": 11,
    "icon": "🔩",
    "image": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-097",
    "name": "Fita Isolante 20m",
    "category": "Ferragens",
    "qty": 34,
    "cost": 5,
    "price": 8.5,
    "icon": "🧻",
    "image": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-098",
    "name": "Silicone Acético 280g",
    "category": "Ferragens",
    "qty": 13,
    "cost": 17,
    "price": 27,
    "icon": "🧴",
    "image": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-099",
    "name": "Cola Instantânea 20g",
    "category": "Ferragens",
    "qty": 26,
    "cost": 7,
    "price": 12,
    "icon": "🧴",
    "image": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=320&q=80"
  },
  {
    "id": "LS-100",
    "name": "Pilha AA Alcalina (4 un.)",
    "category": "Elétrica",
    "qty": 35,
    "cost": 9,
    "price": 15,
    "icon": "🔋",
    "image": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=320&q=80"
  }
];

// Dados fictícios de movimentações e logs para demonstração inicial (100 de cada).
function seedDemoModules(){
  const now=new Date();
  if(!localStorage.getItem(MODULE_KEYS.finance)){
    const demo=Array.from({length:100},(_,i)=>{const p=seedProducts[i%seedProducts.length],d=new Date(now);d.setDate(d.getDate()-((i*13)%90));d.setHours((i*7)%24,(i*17)%60,0,0);return{id:'MOV-'+String(i+1).padStart(3,'0'),date:d.toISOString().slice(0,10),type:i%3===0?'Saída':'Entrada',description:(i%3===0?'Baixa por venda — ':'Reposição — ')+p.name,amount:Number((p.cost*(1+(i%5)*.1)*Math.max(1,(i%12)+1)).toFixed(2))};});
    saveModule(MODULE_KEYS.finance,demo);
  }
  if(!localStorage.getItem(MODULE_KEYS.logs)){
    const demo=Array.from({length:100},(_,i)=>{const p=seedProducts[i%seedProducts.length],d=new Date(now);d.setDate(d.getDate()-((i*13)%90));d.setHours((i*7)%24,(i*17)%60,0,0);return{id:'LOG-'+String(i+1).padStart(3,'0'),date:d.toISOString(),user:['João da Silva','Mariana Costa','Carlos Souza','Sistema'][i%4],action:['Estoque atualizado','Produto cadastrado','Lançamento financeiro','Inventário conferido','Relatório consultado'][i%5],details:p.id+' — '+p.name+' | evento demonstrativo #'+(i+1)};});
    saveModule(MODULE_KEYS.logs,demo);
  }
}

const STORAGE_KEY = 'logistock_products_v1';
let products;
try { products = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { products = null; }
if (!Array.isArray(products)) products = seedProducts.map(p => ({...p}));
else {
  // Migração sem apagar os produtos existentes: complementa a base até 100 e acrescenta fotos ausentes.
  const known = new Map(products.map((p,i) => [String(p.id).toLowerCase(),i]));
  seedProducts.forEach(p => {
    const key=p.id.toLowerCase();
    if (!known.has(key)) { products.push({...p}); known.set(key,products.length-1); }
    else { const current=products[known.get(key)]; if(!current.image) current.image=p.image; if(!current.icon)current.icon=p.icon; }
  });
}
seedDemoModules();
localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
const productsEl = document.getElementById('products');
// Os produtos são mantidos localmente no navegador; os controles de importação/exportação foram removidos da interface.
const productSearch = document.getElementById('productSearch');
const globalSearch = productSearch;
const modal = document.getElementById('productModal');
const form = document.getElementById('productForm');
const stockActions = document.getElementById('stockActions');
let activeProductId = null;
function persistProducts() { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); }
function downloadProductsJSON(){
  const blob=new Blob([JSON.stringify({app:'LogiStock',version:2,exportedAt:new Date().toISOString(),products},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='logistock-produtos.json';a.click();URL.revokeObjectURL(url);
}
function importProductsJSON(file){
  const reader=new FileReader();
  reader.onload=()=>{try{const parsed=JSON.parse(reader.result);const incoming=Array.isArray(parsed)?parsed:parsed.products;if(!Array.isArray(incoming)||incoming.some(p=>!p.id||!p.name||!Number.isFinite(Number(p.qty))))throw new Error('Formato inválido');
    const ids=new Set();for(const p of incoming){const id=String(p.id).toLowerCase();if(ids.has(id))throw new Error('IDs duplicados');ids.add(id);p.qty=Number(p.qty);p.cost=Number(p.cost||0);p.price=Number(p.price||0);}
    if(!confirm('Importar '+incoming.length+' produtos? Isso substituirá a lista atual deste navegador.'))return;
    products=incoming;persistProducts();renderProducts();addLog('Importação de produtos',`${products.length} produtos importados via JSON`);notify('Produtos importados com sucesso.');
  }catch(err){notify('Arquivo JSON inválido ou com produtos incompletos.');}};
  reader.readAsText(file);
}
function money(value) { return Number(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function renderProducts() {
  const query = (productSearch.value || globalSearch.value || '').trim().toLocaleLowerCase('pt-BR');
  const filtered = products.filter(p => `${p.name} ${p.id} ${p.category}`.toLocaleLowerCase('pt-BR').includes(query));
  productsEl.innerHTML = filtered.map(p => {
    const profit = p.cost > 0 ? ((p.price-p.cost)/p.cost*100) : 0;
    const stockClass = p.qty === 0 ? 'stock stock-zero' : p.qty <= 10 ? 'stock stock-low' : 'stock';
    return `<article class="product ${p.qty===0?'product-empty':''}">
      <div class="product-top"><div class="product-image">${p.image?`<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('image-fallback');this.parentElement.innerHTML='<span class="product-no-photo"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><circle cx="9" cy="10" r="1.5"></circle><path d="m4 17 5-5 3 3 3-4 5 6"></path></svg></span>'">`:`<span class="product-no-photo" aria-label="Sem foto"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><circle cx="9" cy="10" r="1.5"></circle><path d="m4 17 5-5 3 3 3-4 5 6"></path></svg></span>`}</div><div class="product-info"><div class="product-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</div><div class="product-meta"><span>${escapeHtml(p.id)}</span><span>◇ ${escapeHtml(p.category)}</span></div></div></div>
      <div class="product-status-row"><span class="${stockClass}">${p.qty===0?'⚠ Sem estoque':'⬡ '+p.qty+' un.'}</span>${p.qty===0?'<span class="zero-note">Produto mantido na lista</span>':''}</div>
      <div class="product-divider"></div><div class="prices"><div><small>Compra</small><strong>${money(p.cost)}</strong></div><div><small>Venda</small><strong>${money(p.price)}</strong></div><div><small>Lucro</small><strong class="${profit>=0?'profit':'negative'}">${profit.toLocaleString('pt-BR',{maximumFractionDigits:1})}%</strong></div></div>
      <div class="product-card-footer"><span class="product-ref">${escapeHtml(p.id)}</span><button class="edit-product" type="button" data-edit="${escapeHtml(p.id)}" aria-label="Editar ${escapeHtml(p.name)}" title="Editar produto">✎</button></div>
    </article>`;
  }).join('');
  document.getElementById('resultCount').textContent = `${filtered.length} ${filtered.length===1?'item encontrado':'itens encontrados'}`;
  document.getElementById('itemCount').textContent = products.length;
  document.getElementById('unitCount').textContent = products.reduce((sum,p)=>sum+Number(p.qty||0),0).toLocaleString('pt-BR');
  const low = products.filter(p=>p.qty<=10).length;
  const lowStat = document.querySelector('.stat .stat-value.negative');
  if (lowStat) lowStat.textContent = low;
}
function openModal(product=null) {
  activeProductId = product ? product.id : null;
  form.reset();
  document.getElementById('modalError').hidden = true;
  document.getElementById('modalTitle').textContent = product ? 'Gerenciar produto' : 'Adicionar produto';
  document.getElementById('editingId').value = product ? product.id : '';
  document.getElementById('productNameInput').value = product?.name || '';
  document.getElementById('productIdInput').value = product?.id || '';
  document.getElementById('productCategoryInput').value = product?.category || '';
  document.getElementById('productQtyInput').value = product ? product.qty : 0;
  document.getElementById('productCostInput').value = product ? product.cost : 0;
  document.getElementById('productPriceInput').value = product ? product.price : 0;
  document.getElementById('productPhotoInput').value = '';
  const photoPreview=document.getElementById('productPhotoPreview');
  photoPreview.hidden=!product?.image;
  photoPreview.innerHTML=product?.image?`<img src="${escapeHtml(product.image)}" alt="Foto atual do produto">`:'';
  document.getElementById('productIdInput').readOnly = !!product;
  document.getElementById('saveProductButton').textContent = product ? 'Salvar alterações' : 'Salvar produto';
  stockActions.hidden = !product;
  modal.hidden = false;
  document.body.classList.add('modal-open');
  document.getElementById('productNameInput').focus();
}
function closeModal() { modal.hidden = true; document.body.classList.remove('modal-open'); activeProductId = null; }
document.getElementById('addProductFab').addEventListener('click',()=>openModal());
document.getElementById('closeModal').addEventListener('click',closeModal);
document.getElementById('cancelModal').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeModal();});
productsEl.addEventListener('click',e=>{const btn=e.target.closest('[data-edit]');if(!btn)return;const product=products.find(p=>p.id===btn.dataset.edit);if(product)openModal(product);});
document.getElementById('productPhotoInput').addEventListener('change',e=>{
  const file=e.target.files[0],preview=document.getElementById('productPhotoPreview');
  if(!file){preview.hidden=true;preview.innerHTML='';return;}
  if(!file.type.startsWith('image/')){notify('Selecione um arquivo de imagem válido.');e.target.value='';return;}
  const reader=new FileReader();reader.onload=()=>{preview.hidden=false;preview.innerHTML=`<img src="${String(reader.result)}" alt="Prévia da foto">`;};reader.readAsDataURL(file);
});
form.addEventListener('submit',e=>{
  e.preventDefault();
  const id=document.getElementById('productIdInput').value.trim();
  const name=document.getElementById('productNameInput').value.trim();
  const category=document.getElementById('productCategoryInput').value.trim();
  const qty=Number(document.getElementById('productQtyInput').value);
  const cost=Number(document.getElementById('productCostInput').value);
  const price=Number(document.getElementById('productPriceInput').value);
  const error=document.getElementById('modalError');
  if(!id||!name||!category||!Number.isInteger(qty)||qty<0||cost<0||price<0){error.textContent='Confira os campos. A quantidade deve ser um número inteiro igual ou maior que zero.';error.hidden=false;return;}
  if(!activeProductId&&products.some(p=>p.id.toLowerCase()===id.toLowerCase())){error.textContent='Já existe um produto com esse ID. Escolha um código único.';error.hidden=false;return;}
  const previous=products.find(p=>p.id===activeProductId);
  const photoFile=document.getElementById('productPhotoInput').files[0];
  const saveProduct=(photoData)=>{
    const product={id,name,category,qty,cost,price,image:photoData===undefined?(previous?.image||''):(photoData||'')};
    if(activeProductId){const index=products.findIndex(p=>p.id===activeProductId);const oldQty=Number(products[index].qty)||0;products[index]=product;if(qty!==oldQty){const delta=qty-oldQty;addStockFinanceMovement(product,delta>0?1:-1,Math.abs(delta));addLog('Ajuste de quantidade',`${product.name}: ${oldQty} → ${qty}`);}notify('Detalhes do produto atualizados.');}
    else {products.unshift(product);notify('Produto adicionado ao estoque.');}
    persistProducts();renderProducts();addLog(activeProductId?'Produto atualizado':'Produto cadastrado',`${name} (${id})`);closeModal();
  };
  if(photoFile){
    if(!photoFile.type.startsWith('image/')){error.textContent='Selecione um arquivo de imagem válido.';error.hidden=false;return;}
    if(photoFile.size>3*1024*1024){error.textContent='A foto deve ter no máximo 3 MB.';error.hidden=false;return;}
    const reader=new FileReader();reader.onload=()=>saveProduct(String(reader.result));reader.onerror=()=>{error.textContent='Não foi possível ler a foto.';error.hidden=false;};reader.readAsDataURL(photoFile);
  } else saveProduct();
});
function addStockFinanceMovement(product,direction,amount){
 const unitValue=Number(direction>0?product.cost:product.price)||0;
 const total=Math.round(unitValue*amount*100)/100;
 if(total<=0)return;
 const list=readModule(MODULE_KEYS.finance);
 list.unshift({id:'STK-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),date:new Date().toISOString(),type:direction>0?'Saída':'Entrada',description:`${direction>0?'Reposição de estoque':'Baixa de estoque'} — ${product.name} (${amount} un.)`,amount:total,source:'stock'});
 saveModule(MODULE_KEYS.finance,list);
}
function moveStock(direction){
  const amount=Number(document.getElementById('movementQty').value);
  const product=products.find(p=>p.id===activeProductId);
  if(!product)return;
  if(!Number.isInteger(amount)||amount<1){notify('Informe uma quantidade inteira maior que zero.');return;}
  if(direction<0&&amount>product.qty){notify('Não é possível remover mais unidades do que há no estoque.');return;}
  product.qty+=direction*amount;
  persistProducts();addStockFinanceMovement(product,direction,amount);renderProducts();addLog(direction>0?'Estoque adicionado':'Estoque removido',`${product.name}: ${amount} unidade(s)`);
  document.getElementById('productQtyInput').value=product.qty;
  notify(direction>0?`${amount} unidade(s) adicionada(s).`:`${amount} unidade(s) removida(s).`);
}
document.getElementById('addStockButton').addEventListener('click',()=>moveStock(1));
document.getElementById('removeStockButton').addEventListener('click',()=>moveStock(-1));
function filterProducts(value){globalSearch.value=value;productSearch.value=value;renderProducts();}
productSearch.addEventListener('input',e=>filterProducts(e.target.value));
document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();productSearch.focus();}if(event.key==='Escape'&&modal.hidden){filterProducts('');}});
renderProducts();

const requestedPage=new URLSearchParams(window.location.search).get('pagina');if(requestedPage==='financeiro')navigateModule('Financeiro');else if(requestedPage==='contas')navigateModule('Controle de contas');else if(requestedPage==='logs')navigateModule('Logs do sistema');


// Notificações do app e perfil personalizável — dados guardados apenas neste navegador.
(function setupHeaderFeatures(){
  const $ = id => document.getElementById(id);
  const profileKey='logistock_local_profile_v1';
  const readProfile=()=>{try{return JSON.parse(localStorage.getItem(profileKey)||'{}')}catch{return {}}};
  let profile=readProfile();
  const initials=name=>String(name||'U').trim().split(/\s+/).map(part=>part[0]).join('').slice(0,2).toUpperCase();
  function applyProfile(){
    const session=(()=>{try{return JSON.parse(localStorage.getItem('logistock_demo_session')||'{}')}catch{return {}}})();
    const name=profile.name||session.name||'Usuário';
    $('profileName').textContent=name;
    $('profileNameInput').value=name;
    const avatar=$('profileAvatar'), modalAvatar=$('profileModalAvatar');
    [avatar,modalAvatar].forEach(node=>{
      if(profile.photo){node.textContent='';node.style.backgroundImage=`url("${profile.photo}")`;node.style.backgroundSize='cover';node.style.backgroundPosition='center';}
      else {node.style.backgroundImage='';node.textContent=initials(name);}
    });
  }
  applyProfile();
  const profileTrigger=$('profileTrigger'), profileMenuTrigger=$('profileMenuTrigger'), profileMenu=$('profileMenu'), profileModalBackdrop=$('profileModalBackdrop');
  profileTrigger.addEventListener('click',()=>{
    profileMenu.hidden=true; profileMenuTrigger.setAttribute('aria-expanded','false');
    $('notificationPanel').hidden=true; $('notificationButton').setAttribute('aria-expanded','false');
    profileModalBackdrop.hidden=false;
    $('profileNameInput').focus();
  });
  profileMenuTrigger.addEventListener('click',()=>{
    const opening=profileMenu.hidden; profileMenu.hidden=!opening;
    profileMenuTrigger.setAttribute('aria-expanded',String(opening));
    $('notificationPanel').hidden=true; $('notificationButton').setAttribute('aria-expanded','false');
  });
  const closeProfileModal=()=>{profileModalBackdrop.hidden=true;};
  $('closeProfileModal').addEventListener('click',closeProfileModal);
  profileModalBackdrop.addEventListener('click',e=>{if(e.target===profileModalBackdrop)closeProfileModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeProfileModal();profileMenu.hidden=true;profileMenuTrigger.setAttribute('aria-expanded','false');}});
  const themeKey='logistock_theme_v1';
  function applyTheme(theme){document.documentElement.dataset.theme=theme;localStorage.setItem(themeKey,theme);$('themeToggle').innerHTML=theme==='dark'?'<span aria-hidden="true">☼</span> Mudar para tema claro':'<span aria-hidden="true">☾</span> Mudar para tema escuro';}
  applyTheme(localStorage.getItem(themeKey)||'dark');
  $('themeToggle').addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';applyTheme(next);profileMenu.hidden=true;profileMenuTrigger.setAttribute('aria-expanded','false');notify(`Tema ${next==='light'?'claro':'escuro'} ativado.`);});
  $('logoutButton').addEventListener('click',()=>{localStorage.removeItem('logistock_demo_session');window.location.href='login.html';});
  $('profilePhotoInput').addEventListener('change',e=>{
    const file=e.target.files?.[0]; if(!file)return;
    if(!file.type.startsWith('image/')){notify('Escolha um arquivo de imagem.');return;}
    if(file.size>2*1024*1024){notify('A foto deve ter no máximo 2 MB.');e.target.value='';return;}
    const reader=new FileReader();
    reader.onload=()=>{profile.photo=reader.result;applyProfile();};
    reader.readAsDataURL(file);
  });
  $('saveProfile').addEventListener('click',()=>{
    const name=$('profileNameInput').value.trim();
    if(!name){notify('Digite um nome para o perfil.');return;}
    profile.name=name;
    localStorage.setItem(profileKey,JSON.stringify(profile));
    applyProfile(); profileModalBackdrop.hidden=true;
    addLog('Perfil personalizado','Nome de exibição atualizado neste navegador');notify('Perfil salvo neste navegador.');
  });
  $('removeProfilePhoto').addEventListener('click',()=>{profile.photo='';localStorage.setItem(profileKey,JSON.stringify(profile));applyProfile();$('profilePhotoInput').value='';notify('Foto de perfil removida.');});
  const notificationPanel=$('notificationPanel'), notificationButton=$('notificationButton');
  function getAlerts(){
    let list=[];
    try{
      const ps=JSON.parse(localStorage.getItem('logistock_products_v1')||'[]');
      ps.forEach(p=>{
        if(Number(p.qty)===0) list.push({id:'zero-'+p.id,level:'danger',title:'Produto sem estoque',detail:`${p.name} (${p.id}) está com quantidade 0.`});
        else if(Number(p.qty)<=10) list.push({id:'low-'+p.id,level:'warning',title:'Estoque baixo',detail:`${p.name}: restam ${p.qty} unidade(s).`});
        const last=p.lastMovedAt||p.updatedAt;
        if(last && Date.now()-new Date(last).getTime()>7*86400000)
          list.push({id:'stale-'+p.id,level:'warning',title:'Item sem movimentação há mais de 7 dias',detail:`${p.name} não tem movimentação recente registrada.`});
      });
    }catch{}
    try{
      const logs=JSON.parse(localStorage.getItem('logistock_logs_v1')||'[]');
      const today=new Date().toDateString();
      const errors=logs.filter(x=>/erro|falha|inválid/i.test(`${x.action} ${x.details}`)&&new Date(x.date).toDateString()===today);
      if(errors.length)list.unshift({id:'errors-today',level:'warning',title:'Atividades que precisam de atenção',detail:`${errors.length} registro(s) com erro/falha hoje.`});
    }catch{}
    return list;
  }
  function renderAlerts(){
    const alerts=getAlerts(), dismissed=(()=>{try{return JSON.parse(localStorage.getItem('logistock_dismissed_alerts_v1')||'[]')}catch{return []}})();
    const unread=alerts.filter(a=>!dismissed.includes(a.id));
    $('notificationCount').hidden=unread.length===0;
    $('notificationCount').textContent=unread.length>99?'99+':String(unread.length);
    $('notificationList').innerHTML=alerts.length?alerts.slice(0,30).map(a=>`<article class="notification-item ${a.level}"><span class="notification-dot"></span><div><strong>${escapeHtml(a.title)}</strong><p>${escapeHtml(a.detail)}</p></div></article>`).join(''):'<p class="notification-empty">Tudo certo! Nenhum alerta de estoque no momento.</p>';
  }
  notificationButton.addEventListener('click',()=>{
    const opening=notificationPanel.hidden;notificationPanel.hidden=!opening;
    notificationButton.setAttribute('aria-expanded',String(opening));
    profileMenu.hidden=true;profileMenuTrigger.setAttribute('aria-expanded','false');
    if(opening)renderAlerts();
  });
  $('markNotificationsRead').addEventListener('click',()=>{
    const ids=getAlerts().map(a=>a.id);localStorage.setItem('logistock_dismissed_alerts_v1',JSON.stringify(ids));renderAlerts();notify('Alertas atuais marcados como lidos.');
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest('.profile')){profileMenu.hidden=true;notificationPanel.hidden=true;profileMenuTrigger.setAttribute('aria-expanded','false');notificationButton.setAttribute('aria-expanded','false');}
  });
  renderAlerts();
  window.addEventListener('storage',renderAlerts);
})();
