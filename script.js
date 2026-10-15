const sidebar = document.getElementById('sidebar');
    const toast = document.getElementById('toast');
    let toastTimer;
    function notify(message) {
      toast.textContent = message;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
    }

    // Clique no logotipo/área vazia do menu: expande ou retrai a navegação.
    document.querySelector('.brand-mini').addEventListener('click', () => sidebar.classList.toggle('expanded'));
    document.querySelectorAll('.nav button, .sidebar-bottom button').forEach(button => {
      button.addEventListener('click', () => {
        const page = button.dataset.page;
        document.querySelectorAll('.nav button').forEach(item => item.classList.remove('active'));
        if (button.closest('.nav')) button.classList.add('active');
        if (page === 'Sair') {
          notify('Sessão demonstrativa: nenhuma conta foi desconectada.');
          return;
        }
        document.getElementById('pageTitle').textContent = page;
        const subtitles = {
          'Dashboard': 'Visão geral do seu estoque e operações',
          'Controle de contas': 'Gerencie usuários, permissões e acessos',
          'Financeiro': 'Acompanhe compras, vendas e margens',
          'Logs do sistema': 'Histórico de atividades e eventos',
          'Configurações': 'Personalize as preferências do LogiStock'
        };
        document.getElementById('pageSubtitle').textContent = subtitles[page] || '';
        if (page !== 'Dashboard') notify('Visualização demonstrativa: módulo "' + page + '".');
      });
    });

    const globalSearch = document.getElementById('globalSearch');
    const productSearch = document.getElementById('productSearch');
    function filterProducts(value) {
      const query = value.trim().toLocaleLowerCase('pt-BR');
      let visible = 0;
      document.querySelectorAll('.product').forEach(card => {
        const match = card.dataset.search.toLocaleLowerCase('pt-BR').includes(query);
        card.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      document.getElementById('resultCount').textContent = visible + (visible === 1 ? ' item encontrado' : ' itens encontrados');
      if (globalSearch.value !== value) globalSearch.value = value;
      if (productSearch.value !== value) productSearch.value = value;
    }
    globalSearch.addEventListener('input', event => filterProducts(event.target.value));
    productSearch.addEventListener('input', event => filterProducts(event.target.value));
    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        globalSearch.focus();
      }
      if (event.key === 'Escape') {
        globalSearch.value = '';
        productSearch.value = '';
        filterProducts('');
      }
    });
