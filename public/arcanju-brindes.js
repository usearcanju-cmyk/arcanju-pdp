/* ==========================================================================
   Use Arcanju — Brindes da promoção de 2 camisetas  |  v1
   Botão flutuante + modal + barra do topo + blocos no carrinho
   Prefixo: abr-
   ========================================================================== */
(function () {
  'use strict';

  if (window.__ARCANJU_BRINDES__) return;
  window.__ARCANJU_BRINDES__ = true;

  /* =========================================================================
     CONFIGURAÇÃO — preencha as imagens aqui
     ========================================================================= */
  var CFG = {
    meta: 2,
    debug: true,   // true = escreve no console o que está acontecendo

    titulo: 'Leve 2 camisetas e ganhe uma sacolinha e uma capelinha de brinde!',
    subtitulo: 'Além de R$ 29 de desconto e frete grátis.',
    rodapeModal: 'Uma destas capelinhas vai na sua sacola — a escolha é uma surpresa nossa.',

    // Imagens servidas pela Vercel, a partir da pasta public/img/
    baseImg: 'https://arcanju-pdp.vercel.app/',

    capelinhas: [
      { nome: 'São Miguel Arcanjo',        img: 'capela-sao-miguel-arcanjo.jpg' },
      { nome: 'Mãe Rainha',                img: 'capela-mae-rainha.jpg' },
      { nome: 'Divina Misericórdia',       img: 'capela-divina-misericordia.jpg' },
      { nome: 'São José',                  img: 'capela-sao-jose.jpg' },
      { nome: 'Nossa Senhora Aparecida',   img: 'capela-nossa-senhora-aparecida.jpg' },
      { nome: 'Santa Teresinha',           img: 'capela-santa-terezinha.jpg' },
      { nome: 'Carlo Acutis',              img: 'capela-carlo-acutis.jpg' },
      { nome: 'São Francisco de Assis',    img: 'capela-sao-francisco.jpg' }
    ],
    sacolinha: {
      nome: 'Sacolinha de tecido 100% algodão',
      img: 'sacolinha.jpg'
    },

    // Valores mostrados como referência (riscados) nos brindes do carrinho
    valorCapelinha: 40,
    valorSacolinha: 25,

    // Barra do topo desativada (a loja já tem a sua própria)
    mostrarBarraTopo: false,
    barraTopo: [
      'Adicione 2 camisetas ao carrinho e ganhe capelinha + sacolinha de brinde',
      '2 camisetas por R$ 249,90 e ganhe uma capelinha + sacolinha de brinde',
      'Leve 2 camisetas. O frete grátis é por nossa conta.'
    ],
    barraIntervalo: 5000,

    // "Complemente seu pedido" no carrinho — preencha com seus produtos
    complementos: [
      // { nome: '', preco: '', precoDe: '', img: '', url: '' }
    ],
    complementosTitulo: 'Complemente seu pedido pra ganhar desconto!',

    cores: {
      vinho: '#6B1B22',
      vinhoClaro: '#8C2A33',
      verde: '#1E8E4E',
      verdeFundo: '#EAF6EE',
      texto: '#2B2B2B',
      cinza: '#6F6F6F',
      borda: '#E6E1DC',
      creme: '#FBF8F3'
    }
  };

  /* =========================================================================
     Helpers
     ========================================================================= */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (html != null) n.innerHTML = html;
    return n;
  }

  function firstOf(list) {
    for (var i = 0; i < list.length; i++) { var f = $(list[i]); if (f) return f; }
    return null;
  }

  function brl(v) { return 'R$ ' + v.toFixed(2).replace('.', ','); }

  // Aceita nome de arquivo (usa baseImg) ou URL completa
  function urlImg(nome) {
    if (!nome) return '';
    if (/^https?:\/\//.test(nome) || nome.charAt(0) === '/') return nome;
    return CFG.baseImg + nome;
  }

  function qtdCamisetas() {
    // 1) Campos de quantidade dentro do carrinho aberto
    var cart = acharCarrinho();
    if (cart && cart.offsetParent !== null) {
      var campos = $$('input', cart).filter(function (i) {
        var nome = (i.name || '') + ' ' + (i.className || '');
        return /quant|qty/i.test(nome) || i.type === 'number';
      });
      if (campos.length) {
        var soma = campos.reduce(function (s, i) {
          var v = parseInt(i.value, 10);
          return s + (isNaN(v) ? 0 : v);
        }, 0);
        if (soma > 0) return soma;
      }
    }

    // 2) Objeto da loja
    try {
      if (window.LS && LS.cart && Array.isArray(LS.cart.items)) {
        var t = LS.cart.items.reduce(function (s, i) { return s + (i.quantity || 0); }, 0);
        if (t > 0) return t;
      }
    } catch (e) {}
    var badge = firstOf(['.js-cart-widget-amount', '[data-component="cart-amount"]', '.cart-amount']);
    if (badge) {
      var n = parseInt((badge.textContent || '').replace(/\D/g, ''), 10);
      if (!isNaN(n)) return n;
    }
    return 0;
  }

  /* =========================================================================
     CSS
     ========================================================================= */
  function injetarCSS() {
    if ($('#abr-css')) return;
    var c = CFG.cores;
    var css = `
    .abr, .abr * { box-sizing:border-box; font-family:inherit; }

    /* Barra do topo */
    #abr-barra {
      position:relative; z-index:9; width:100%; background:${c.vinhoClaro}; color:#fff;
      font-size:13px; line-height:1.3; text-align:center; padding:9px 34px;
      display:flex; align-items:center; justify-content:center; min-height:36px;
    }
    #abr-barra span { display:block; animation:abrFade .5s ease; }
    @keyframes abrFade { from { opacity:0; transform:translateY(3px); } to { opacity:1; transform:none; } }

    /* Botão flutuante */
    #abr-botao {
      position:fixed; left:16px; bottom:16px; z-index:9998;
      width:56px; height:56px; border-radius:50%; border:0; cursor:pointer;
      background:${c.vinho}; color:#fff; display:flex; align-items:center; justify-content:center;
      box-shadow:0 4px 16px rgba(0,0,0,.28);
      transition:bottom .25s ease;
    }
    /* sobe quando a barra fixa de compra aparece */
    body.apdp-sticky-ativa #abr-botao { bottom:86px; }
    #abr-botao:active { transform:scale(.95); }
    #abr-botao .abr-ping {
      position:absolute; top:6px; right:6px; width:10px; height:10px; border-radius:50%;
      background:#E23B3B; box-shadow:0 0 0 0 rgba(226,59,59,.6); animation:abrPing 2s infinite;
    }
    @keyframes abrPing {
      0% { box-shadow:0 0 0 0 rgba(226,59,59,.6); }
      70% { box-shadow:0 0 0 9px rgba(226,59,59,0); }
      100% { box-shadow:0 0 0 0 rgba(226,59,59,0); }
    }

    /* Modal */
    #abr-overlay {
      position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,.55);
      display:flex; align-items:center; justify-content:center; padding:18px;
      opacity:0; pointer-events:none; transition:opacity .2s ease;
    }
    #abr-overlay.abr-aberto { opacity:1; pointer-events:auto; }
    .abr-modal {
      background:#fff; border-radius:16px; width:100%; max-width:420px;
      max-height:82vh; display:flex; flex-direction:column; overflow:hidden;
      box-shadow:0 12px 40px rgba(0,0,0,.3);
      transform:translateY(12px); transition:transform .2s ease;
    }
    #abr-overlay.abr-aberto .abr-modal { transform:none; }
    .abr-modal__topo { padding:18px 18px 12px; position:relative; }
    .abr-modal__titulo { font-size:16px; font-weight:700; color:${c.texto}; line-height:1.3;
      margin:0 26px 6px 0; }
    .abr-modal__sub { font-size:13px; color:${c.cinza}; margin:0; line-height:1.4; }
    .abr-modal__fechar {
      position:absolute; top:14px; right:14px; width:28px; height:28px; border:0; padding:0;
      background:none; cursor:pointer; color:${c.texto}; font-size:22px; line-height:1;
    }
    .abr-modal__corpo { overflow-y:auto; padding:4px 18px 8px; }
    .abr-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .abr-item {
      border:1px solid ${c.borda}; border-radius:12px; overflow:hidden; background:#fff;
      display:flex; flex-direction:column;
    }
    .abr-item__foto { aspect-ratio:1/1; background:${c.creme}; display:block; width:100%;
      object-fit:cover; }
    .abr-item__vazio {
      aspect-ratio:1/1; background:${c.creme}; display:flex; align-items:center;
      justify-content:center; color:${c.cinza}; font-size:11px; text-align:center; padding:8px;
    }
    .abr-item__nome { font-size:11.5px; line-height:1.3; color:${c.texto}; text-align:center;
      padding:8px 6px; font-weight:600; }
    .abr-destaque { grid-column:1/-1; border-color:${c.vinho}; }
    .abr-destaque .abr-item__nome { color:${c.vinho}; }
    .abr-modal__rodape {
      padding:12px 18px 16px; border-top:1px solid ${c.borda}; background:${c.creme};
      font-size:12.5px; color:${c.texto}; text-align:center; line-height:1.4;
    }
    .abr-modal__rodape b { color:${c.vinho}; }

    /* Blocos do carrinho */
    #abr-cart-wrap { width:100%; max-width:100%; overflow:hidden; }
    .abr-cart-promo {
      border:1px solid ${c.vinho}; border-radius:10px; padding:12px 14px; margin:12px 0;
      background:${c.creme}; width:100%; max-width:100%;
    }
    .abr-cart-promo__txt { font-size:13.5px; line-height:1.45; color:${c.texto}; }
    .abr-cart-promo__txt b { color:${c.vinho}; font-weight:700; }
    .abr-cart-promo__barra { margin-top:9px; height:8px; border-radius:99px;
      background:#EDE4E5; overflow:hidden; }
    .abr-cart-promo__fill { height:100%; width:0%; border-radius:99px;
      background:linear-gradient(90deg, ${c.vinhoClaro}, ${c.vinho}); transition:width .45s ease; }
    .abr-cart-promo--ok { border-color:${c.verde}; background:${c.verdeFundo}; }
    .abr-cart-promo--ok .abr-cart-promo__fill { background:${c.verde}; }
    .abr-cart-promo--ok .abr-cart-promo__txt b { color:${c.verde}; }

    .abr-brindes { margin:12px 0; display:grid; gap:10px; }
    .abr-brinde { display:flex; gap:10px; align-items:center; }
    .abr-brinde__foto {
      width:52px; height:52px; border-radius:8px; object-fit:cover; background:${c.creme};
      flex:0 0 52px; border:1px solid ${c.borda};
    }
    .abr-brinde__info { flex:1 1 auto; min-width:0; }
    .abr-brinde__nome { font-size:13px; color:${c.texto}; line-height:1.3; }
    .abr-brinde__tag { font-size:11px; color:${c.verde}; font-weight:700; }
    .abr-brinde__preco { text-align:right; font-size:13px; white-space:nowrap; }
    .abr-brinde__de { color:${c.cinza}; text-decoration:line-through; font-size:12px; display:block; }
    .abr-brinde__gratis { color:${c.verde}; font-weight:700; }

    .abr-comp { margin:16px 0 8px; }
    .abr-comp__titulo { font-size:12px; font-weight:700; letter-spacing:.3px;
      color:${c.texto}; margin-bottom:10px; }
    .abr-comp__lista { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .abr-comp__card { border:1px solid ${c.borda}; border-radius:10px; overflow:hidden;
      background:#fff; text-decoration:none; display:block; }
    .abr-comp__card img { width:100%; aspect-ratio:1/1; object-fit:cover; display:block; }
    .abr-comp__nome { font-size:12px; color:${c.texto}; padding:8px 8px 2px; line-height:1.3; }
    .abr-comp__preco { font-size:12.5px; font-weight:700; color:${c.texto}; padding:0 8px 10px; }
    .abr-comp__preco s { color:${c.cinza}; font-weight:400; font-size:11.5px; margin-left:4px; }

    @media (prefers-reduced-motion: reduce) {
      #abr-botao .abr-ping { animation:none; }
      .abr-cart-promo__fill { transition:none; }
    }
    `;
    document.head.appendChild(el('style', { id: 'abr-css' }, css));
  }

  /* =========================================================================
     Barra do topo
     ========================================================================= */
  function montarBarra() {
    if (!CFG.mostrarBarraTopo || $('#abr-barra')) return;
    var barra = el('div', { class: 'abr', id: 'abr-barra' },
      '<span id="abr-barra-txt">' + CFG.barraTopo[0] + '</span>');
    document.body.insertBefore(barra, document.body.firstChild);

    if (CFG.barraTopo.length > 1) {
      var i = 0;
      setInterval(function () {
        i = (i + 1) % CFG.barraTopo.length;
        var alvo = $('#abr-barra-txt');
        if (!alvo) return;
        var novo = el('span', { id: 'abr-barra-txt' }, CFG.barraTopo[i]);
        alvo.parentNode.replaceChild(novo, alvo);
      }, CFG.barraIntervalo);
    }
  }

  /* =========================================================================
     Modal
     ========================================================================= */
  function cardItem(item, destaque) {
    var src = urlImg(item.img);
    var foto = src
      ? '<img class="abr-item__foto" src="' + src + '" alt="' + item.nome + '" loading="lazy">'
      : '<div class="abr-item__vazio">Imagem não configurada</div>';
    return '<div class="abr-item' + (destaque ? ' abr-destaque' : '') + '">' + foto +
      '<div class="abr-item__nome">' + item.nome + '</div></div>';
  }

  function montarModal() {
    if ($('#abr-overlay')) return;

    var capelas = CFG.capelinhas.map(function (c) { return cardItem(c, false); }).join('');
    var sacola = cardItem(CFG.sacolinha, true);

    var overlay = el('div', { class: 'abr', id: 'abr-overlay' },
      '<div class="abr-modal" role="dialog" aria-modal="true" aria-label="Brindes da promoção">' +
      '<div class="abr-modal__topo">' +
      '<button class="abr-modal__fechar" id="abr-fechar" aria-label="Fechar">&times;</button>' +
      '<h2 class="abr-modal__titulo">' + CFG.titulo + '</h2>' +
      '<p class="abr-modal__sub">' + CFG.subtitulo + '</p>' +
      '</div>' +
      '<div class="abr-modal__corpo">' +
      '<div class="abr-grid">' + capelas + sacola + '</div>' +
      '</div>' +
      '<div class="abr-modal__rodape">' + CFG.rodapeModal + '</div>' +
      '</div>'
    );
    document.body.appendChild(overlay);

    function fechar() {
      overlay.classList.remove('abr-aberto');
      document.body.style.overflow = '';
    }
    $('#abr-fechar').addEventListener('click', fechar);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) fechar(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fechar();
    });
  }

  function abrirModal() {
    montarModal();
    var o = $('#abr-overlay');
    if (!o) return;
    o.classList.add('abr-aberto');
    document.body.style.overflow = 'hidden';
  }

  function montarBotao() {
    if ($('#abr-botao')) return;
    var b = el('button', { class: 'abr', id: 'abr-botao', type: 'button', 'aria-label': 'Ver os brindes da promoção' },
      '<span class="abr-ping"></span>' +
      '<svg width="27" height="27" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M11.35 2.1h1.3v1.35H14v1.3h-1.35v2.06c2.4.62 4.15 2.8 4.15 5.37v7.5h1.6v1.32H4.6v-1.32h1.6v-7.5c0-2.57 1.75-4.75 4.15-5.37V4.75H9v-1.3h1.35V2.1zM12 8.05c-2.32 0-4.2 1.9-4.2 4.23v7.4h8.4v-7.4c0-2.33-1.88-4.23-4.2-4.23z"/>' +
      '</svg>'
    );
    b.addEventListener('click', abrirModal);
    document.body.appendChild(b);
  }

  /* =========================================================================
     Carrinho
     ========================================================================= */
  function pareceDrawer(n) {
    if (!n) return false;
    if (n.offsetParent === null) return false;          // invisível
    if (n.closest('header, nav, .js-head, #header')) return false; // cabeçalho
    if (n.offsetHeight < 320) return false;             // pequeno demais
    var t = (n.textContent || '');
    var temResumo = /subtotal|total/i.test(t);
    var temBotao = /iniciar compra|finalizar/i.test(t);
    return temResumo || temBotao;
  }

  function acharCarrinho() {
    var candidatos = [];
    ['.js-cart-widget', '#ajax-cart', '[data-component="cart"]', '.cart-widget',
     '.js-modal-cart', '#cart', '.js-cart', '[class*="cart-drawer"]',
     '[class*="modal-cart"]'].forEach(function (sel) {
      $$(sel).forEach(function (n) { if (candidatos.indexOf(n) === -1) candidatos.push(n); });
    });

    var validos = candidatos.filter(pareceDrawer);
    if (!validos.length) return null;

    // menor container válido (evita pegar a página inteira)
    validos.sort(function (a, b) { return a.offsetHeight - b.offsetHeight; });
    return validos[0];
  }

  function acharAncoraTotal(cart) {
    // 1) elementos de total/subtotal conhecidos
    var direto = firstOf([
      '.js-cart-total', '[data-component="cart-total"]', '.cart-total',
      '.js-cart-subtotal', '.js-cart-summary'
    ]);
    if (direto && cart.contains(direto)) return direto;

    // 2) por texto conhecido do drawer, na ordem de preferência
    var alvos = ['subtotal', 'iniciar compra', 'total', 'meios de envio'];
    for (var a = 0; a < alvos.length; a++) {
      var re = new RegExp(alvos[a], 'i');
      var achado = $$('*', cart).filter(function (n) {
        return n.children.length === 0 &&
               re.test((n.textContent || '').trim()) &&
               n.offsetParent !== null;
      })[0];
      if (achado) {
        var linha = achado;
        // sobe até um bloco de largura relevante
        for (var i = 0; i < 4 && linha.parentNode && linha.parentNode !== cart; i++) {
          if (linha.offsetWidth > cart.offsetWidth * 0.6) break;
          linha = linha.parentNode;
        }
        if (CFG.debug) console.log('[ABR] âncora por texto:', alvos[a], linha);
        return linha;
      }
    }

    // 3) antes do botão de finalizar
    var botao = $$('a, button', cart).filter(function (n) {
      return /iniciar compra|finalizar|checkout/i.test(n.textContent || '');
    })[0];
    if (botao) return botao.closest('div, li') || botao;

    return null;
  }

  function blocoPromo(q) {
    var ok = q >= CFG.meta;
    var txt = ok
      ? '<b>Você ganhou capelinha, sacolinha, frete grátis e R$ 29 de desconto</b>'
      : (q === CFG.meta - 1
          ? 'Falta 1 camiseta para ganhar <b>capelinha, sacolinha, frete grátis e R$ 29 de desconto</b>'
          : 'Leve 2 camisetas e ganhe <b>capelinha, sacolinha, frete grátis e R$ 29 de desconto</b>');
    return '<div class="abr abr-cart-promo' + (ok ? ' abr-cart-promo--ok' : '') + '" id="abr-cart-promo">' +
      '<div class="abr-cart-promo__txt">' + txt + '</div>' +
      '<div class="abr-cart-promo__barra"><div class="abr-cart-promo__fill" style="width:' +
      Math.min(100, (q / CFG.meta) * 100) + '%"></div></div>' +
      '</div>';
  }

  function linhaBrinde(item, valor) {
    var src = urlImg(item.img);
    var foto = src
      ? '<img class="abr-brinde__foto" src="' + src + '" alt="" loading="lazy">'
      : '<div class="abr-brinde__foto"></div>';
    return '<div class="abr-brinde">' + foto +
      '<div class="abr-brinde__info">' +
      '<div class="abr-brinde__nome">' + item.nome + '</div>' +
      '<div class="abr-brinde__tag">BRINDE DA PROMOÇÃO</div>' +
      '</div>' +
      '<div class="abr-brinde__preco">' +
      '<s class="abr-brinde__de">' + brl(valor) + '</s>' +
      '<span class="abr-brinde__gratis">Grátis</span>' +
      '</div></div>';
  }

  function blocoBrindes() {
    var capela = { nome: 'Capelinha surpresa', img: (CFG.capelinhas[0] || {}).img || '' };
    return '<div class="abr abr-brindes" id="abr-brindes">' +
      linhaBrinde(capela, CFG.valorCapelinha) +
      linhaBrinde(CFG.sacolinha, CFG.valorSacolinha) +
      '</div>';
  }

  function blocoComplementos() {
    if (!CFG.complementos.length) return '';
    var cards = CFG.complementos.map(function (p) {
      return '<a class="abr-comp__card" href="' + (p.url || '#') + '">' +
        (p.img ? '<img src="' + urlImg(p.img) + '" alt="" loading="lazy">' : '') +
        '<div class="abr-comp__nome">' + p.nome + '</div>' +
        '<div class="abr-comp__preco">' + p.preco +
        (p.precoDe ? '<s>' + p.precoDe + '</s>' : '') + '</div></a>';
    }).join('');
    return '<div class="abr abr-comp" id="abr-comp">' +
      '<div class="abr-comp__titulo">' + CFG.complementosTitulo + '</div>' +
      '<div class="abr-comp__lista">' + cards + '</div></div>';
  }

  var ultimoCarrinho = '';
  var observandoCarrinho = false;

  function limparForaDoLugar(cart) {
    $$('#abr-cart-wrap').forEach(function (n) {
      if (!cart || !cart.contains(n)) {
        if (n.parentNode) n.parentNode.removeChild(n);
      }
    });
  }

  function atualizarCarrinho() {
    var cart = acharCarrinho();
    limparForaDoLugar(cart);
    if (!cart || cart.offsetParent === null) { ultimoCarrinho = ''; return; }

    var q = qtdCamisetas();
    var presente = !!(document.getElementById('abr-cart-wrap') &&
                      document.body.contains(document.getElementById('abr-cart-wrap')));
    var chave = String(q);

    // Só pula se nada mudou E os blocos continuam no DOM
    if (presente && chave === ultimoCarrinho) return;

    var antigo = document.getElementById('abr-cart-wrap');
    if (antigo && antigo.parentNode) antigo.parentNode.removeChild(antigo);

    var html = (q >= CFG.meta ? blocoBrindes() : '') + blocoPromo(q) + blocoComplementos();
    var wrap = el('div', { class: 'abr', id: 'abr-cart-wrap' }, html);

    var ancora = acharAncoraTotal(cart);
    if (ancora && ancora.parentNode) {
      ancora.parentNode.insertBefore(wrap, ancora);
      if (CFG.debug) console.log('[ABR] inserido antes de', ancora);
    } else {
      // Último recurso: joga no fim do container visível do carrinho
      var destino = $$('div, section, aside', cart).filter(function (n) {
        return n.offsetParent !== null && n.offsetHeight > 120;
      }).pop() || cart;
      destino.appendChild(wrap);
      if (CFG.debug) console.log('[ABR] âncora não encontrada, anexado em', destino);
    }
    ultimoCarrinho = chave;

  }

  // Observa o documento inteiro: o tema pode trocar o drawer por um nó novo
  function observarDocumento() {
    if (observandoCarrinho) return;
    observandoCarrinho = true;
    var agendado = false;
    new MutationObserver(function () {
      if (agendado) return;
      agendado = true;
      setTimeout(function () {
        agendado = false;
        try { atualizarCarrinho(); } catch (e) {}
      }, 120);
    }).observe(document.body, { childList: true, subtree: true });
  }

  // Diagnóstico: rode ABR_DEBUG() no console com o carrinho aberto
  window.ABR_DEBUG = function () {
    var cart = acharCarrinho();
    return {
      carrinhoEncontrado: !!cart,
      carrinhoVisivel: !!(cart && cart.offsetParent !== null),
      ancoraEncontrada: !!(cart && acharAncoraTotal(cart)),
      quantidade: qtdCamisetas(),
      blocosNoDOM: !!document.getElementById('abr-cart-wrap'),
      baseImagens: CFG.baseImg
    };
  };

  /* =========================================================================
     Boot
     ========================================================================= */
  function iniciar() {
    injetarCSS();
    montarBarra();
    montarBotao();

    setInterval(function () { try { atualizarCarrinho(); } catch (e) {} }, 500);
    observarDocumento();
    document.addEventListener('click', function () { setTimeout(atualizarCarrinho, 800); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
