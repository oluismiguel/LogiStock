(() => {
 const $ = id => document.getElementById(id);
 const USERS_KEY='logistock_demo_users', ACCOUNTS_KEY='logistock_accounts_v1';
 const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
 const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;
 const readUsers = () => { try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; } };
 const saveUsers = users => localStorage.setItem(USERS_KEY, JSON.stringify(users));
 const readAccounts = () => { try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]'); } catch { return []; } };
 const saveAccounts = list => localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
 const message = text => { const el = $('message'); if (el) el.textContent = text; };
 // Conta inicial de demonstração para administrar aprovações neste navegador.
 let users=readUsers();
 // Migra contas antigas criadas antes do fluxo de aprovação, sem afetar novos cadastros pendentes.
 let migrated=false; users=users.map(u=>{if(!u.status){migrated=true;return {...u,status:'Aprovada',role:u.role||'Operador',date:u.date||new Date().toISOString()}}return u}); if(migrated)saveUsers(users);
 if(!users.some(u=>u.email==='admin@logistock.local')){
   users.push({id:'admin-demo',name:'Administrador',email:'admin@logistock.local',password:'Admin123!',role:'Administrador',status:'Aprovada',date:new Date().toISOString()}); saveUsers(users);
 }
 let accounts=readAccounts();
 const adminUser=users.find(u=>u.email==='admin@logistock.local');
 if(!accounts.some(a=>a.email==='admin@logistock.local')){accounts.unshift({id:'admin-demo',name:'Administrador',email:'admin@logistock.local',role:'Administrador',status:'Aprovada',date:adminUser?.date||new Date().toISOString()});saveAccounts(accounts);}
 document.querySelectorAll('[data-toggle]').forEach(btn => btn.addEventListener('click', () => { const input = $(btn.dataset.toggle); if (!input) return; input.type = input.type === 'password' ? 'text' : 'password'; btn.setAttribute('aria-label', input.type === 'password' ? 'Mostrar senha' : 'Ocultar senha'); }));
 const pass = $('password'), strength = $('strength');
 if (pass && strength && $('registerForm')) pass.addEventListener('input', () => { const ok = strongPassword.test(pass.value); strength.textContent = ok ? 'Senha forte: todos os requisitos foram atendidos.' : 'Use 8+ caracteres, com maiúscula, minúscula, número e caractere especial.'; strength.classList.toggle('good', ok); });
 const login = $('loginForm');
 if (login) login.addEventListener('submit', e => { e.preventDefault(); message(''); const email = $('email').value.trim().toLowerCase(), password = $('password').value; if (!emailPattern.test(email)) return message('Informe um endereço de e-mail válido.'); if (!password) return message('Informe sua senha.'); const user = readUsers().find(u => u.email === email && u.password === password); if (!user) return message('E-mail ou senha incorretos. Se ainda não tem conta, registre-se primeiro.'); if(user.status!=='Aprovada' && user.email!=='admin@logistock.local') return message(user.status==='Rejeitada'?'Sua solicitação de conta foi recusada. Fale com o administrador.':'Sua conta está aguardando aprovação de um administrador.'); localStorage.setItem('logistock_demo_session', JSON.stringify({name:user.name,email:user.email,role:user.role||'Operador'})); window.location.href = 'index.html'; });
 const register = $('registerForm');
 if (register) register.addEventListener('submit', e => { e.preventDefault(); message(''); const name = $('name').value.trim(), email = $('email').value.trim().toLowerCase(), password = $('password').value, confirm = $('confirmPassword').value; if (name.length < 2) return message('Informe seu nome completo.'); if (!emailPattern.test(email)) return message('Informe um endereço de e-mail válido.'); if (!strongPassword.test(password)) return message('A senha não atende aos requisitos de segurança.'); if (password !== confirm) return message('As senhas não coincidem.'); const list = readUsers(); if (list.some(u => u.email === email)) return message('Já existe uma conta com esse e-mail neste navegador.'); const date=new Date().toISOString(); list.push({id:Date.now(),name,email,password,role:'Operador',status:'Pendente',date}); saveUsers(list); const accountList=readAccounts(); accountList.unshift({id:Date.now(),name,email,role:'A definir',status:'Pendente',date}); saveAccounts(accountList); message('Cadastro recebido! Sua conta aguarda aprovação do administrador. Você poderá entrar após a aprovação.'); register.reset(); const strengthEl=$('strength');if(strengthEl)strengthEl.textContent=''; });
 const google = $('googleBtn'); if (google) google.addEventListener('click', () => message('Login Google ainda não configurado. Ele exige integração OAuth com um serviço de autenticação.'));
})();
