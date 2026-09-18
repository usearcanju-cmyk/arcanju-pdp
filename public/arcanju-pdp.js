/* ==========================================================================
   Use Arcanju — Melhorias da página de produto (PDP)
   Injeta: nota + avaliações, bullets, entrega com timer, barra da promoção
   de 2 camisetas, selos de segurança e prova social.
   Hospedado na Vercel, carregado via <script> no tema da Nuvemshop.
   ========================================================================== */
(function () {
  'use strict';

  if (window.__ARCANJU_PDP__) return;
  window.__ARCANJU_PDP__ = true;

  /* ---------------------------------------------------------------------
     CONFIGURAÇÃO — mude só aqui
     --------------------------------------------------------------------- */
  var CFG = {
    nota: '4,8',
    totalAvaliacoes: '743',
    pessoas: '+10.000 pessoas já vestem a Arcanju',
    bullets: [
      '100% algodão penteado',
      'Modelagem unissex',
      'Estampa que não racha'
    ],
    // Horário limite para o pedido sair no mesmo dia útil (24h)
    corteHora: 16,
    corteMinuto: 0,
    fretePromo: 'R$ 9,90',
    cidadePadrao: 'sua cidade',
    // Promoção de 2 camisetas
    promo: {
      meta: 2,
      textoVazio: 'Leve 2 camisetas e ganhe frete grátis, capelinha, sacolinha e R$ 29 de desconto',
      textoFalta1: 'Falta 1 camiseta para liberar frete grátis, capelinha, sacolinha e R$ 29 de desconto',
      textoCompleto: 'Benefícios liberados: frete grátis, capelinha, sacolinha e R$ 29 de desconto'
    },
    cores: {
      vinho: '#6B1B22',
      vinhoClaro: '#8C2A33',
      verde: '#1E8E4E',
      verdeFundo: '#EAF6EE',
      texto: '#2B2B2B',
      cinza: '#6F6F6F',
      borda: '#E3E3E3',
      creme: '#FBF8F3'
    }
  };

  /* ---------------------------------------------------------------------
     Helpers
     --------------------------------------------------------------------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (html != null) n.innerHTML = html;
    return n;
  }

  // Acha o primeiro seletor que existir na página
  function firstOf(list) {
    for (var i = 0; i < list.length; i++) {
      var found = $(list[i]);
      if (found) return found;
    }
    return null;
  }

  // Acha um elemento pelo texto que ele contém
  function byText(selector, text) {
    var re = new RegExp(text, 'i');
    return $$(selector).filter(function (n) {
      return re.test((n.textContent || '').trim());
    })[0] || null;
  }

  /* ---------------------------------------------------------------------
     CSS
     --------------------------------------------------------------------- */
  function injetarCSS() {
    if ($('#arcanju-pdp-css')) return;
    var c = CFG.cores;
    var css = `
    .arc-block { font-family: inherit; }
    .arc-rating {
      display:flex; align-items:center; gap:8px; flex-wrap:wrap;
      margin:6px 0 14px; text-decoration:none; cursor:pointer;
    }
    .arc-rating:hover .arc-rating__link { text-decoration:underline; }
    .arc-rating__stars { color:${c.vinho}; letter-spacing:1px; font-size:15px; line-height:1; }
    .arc-rating__nota { font-weight:700; color:${c.texto}; font-size:14px; }
    .arc-rating__link { color:${c.cinza}; font-size:14px; }
    .arc-social {
      display:inline-flex; align-items:center; gap:6px;
      font-size:13px; color:${c.cinza}; margin:0 0 14px;
    }
    .arc-social b { color:${c.texto}; font-weight:600; }

    .arc-bullets { list-style:none; margin:16px 0; padding:0; display:grid; gap:8px; }
    .arc-bullets li {
      display:flex; align-items:flex-start; gap:8px;
      font-size:14px; color:${c.texto}; line-height:1.35;
    }
    .arc-bullets li::before {
      content:''; flex:0 0 16px; height:16px; margin-top:1px;
      background:${c.verdeFundo}; border-radius:50%;
      box-shadow:inset 0 0 0 1.5px ${c.verde};
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231E8E4E' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
      background-size:10px 10px; background-repeat:no-repeat; background-position:center;
    }

    .arc-card {
      border:1px solid ${c.borda}; border-radius:10px;
      padding:12px 14px; margin:14px 0; background:#fff;
    }
    .arc-entrega { display:flex; gap:10px; align-items:flex-start; }
    .arc-entrega__ico { flex:0 0 20px; margin-top:2px; }
    .arc-entrega__txt { font-size:14px; line-height:1.45; color:${c.texto}; }
    .arc-entrega__txt b { font-weight:700; }
    .arc-entrega__timer { color:${c.vinho}; font-weight:700; font-variant-numeric:tabular-nums; }
    .arc-entrega__cidade { color:${c.verde}; font-weight:700; }
    .arc-entrega__sub { display:block; margin-top:4px; font-size:13px; color:${c.cinza}; }

    .arc-promo { border-color:${c.vinho}; background:${c.creme}; }
    .arc-promo__topo { display:flex; gap:8px; align-items:flex-start; }
    .arc-promo__ico { flex:0 0 18px; margin-top:2px; }
    .arc-promo__txt { font-size:14px; line-height:1.4; color:${c.texto}; }
    .arc-promo__txt b { color:${c.vinho}; }
    .arc-promo__barra {
      margin-top:10px; height:8px; border-radius:99px;
      background:#EDE4E5; overflow:hidden;
    }
    .arc-promo__fill {
      height:100%; width:0%; border-radius:99px;
      background:linear-gradient(90deg, ${c.vinhoClaro}, ${c.vinho});
      transition:width .45s cubic-bezier(.4,0,.2,1);
    }
    .arc-promo--ok { border-color:${c.verde}; background:${c.verdeFundo}; }
    .arc-promo--ok .arc-promo__fill { background:${c.verde}; }
    .arc-promo--ok .arc-promo__txt b { color:${c.verde}; }
    .arc-promo__cta {
      display:inline-block; margin-top:10px; font-size:13px; font-weight:600;
      color:${c.vinho}; text-decoration:underline; cursor:pointer; background:none;
      border:0; padding:0; font-family:inherit;
    }

    .arc-selos { margin:14px 0 4px; }
    .arc-selos__linha {
      display:flex; align-items:center; justify-content:center; gap:6px;
      font-size:13px; color:${c.cinza}; margin-bottom:8px;
    }
    .arc-selos__bandeiras {
      display:flex; flex-wrap:wrap; gap:6px; justify-content:center; align-items:center;
    }
    .arc-selos__bandeiras img { height:22px; width:auto; display:block; }
    @media (prefers-reduced-motion: reduce) {
      .arc-promo__fill { transition:none; }
    }
    `;
    document.head.appendChild(el('style', { id: 'arcanju-pdp-css' }, css));
  }

  /* ---------------------------------------------------------------------
     1. Nota + avaliações abaixo do título  |  2. Prova social
     --------------------------------------------------------------------- */
  function acharSecaoAvaliacoes() {
    var alvo =
      firstOf([
        '#arcanju-avaliacoes',
        '[id*="avaliac"]',
        '[class*="reviews"]',
        '[data-store*="reviews"]',
        '#product-reviews'
      ]) || byText('h2, h3, .accordion-title, [class*="title"]', 'avalia');
    return alvo;
  }

  function scrollParaAvaliacoes(e) {
    e.preventDefault();
    var alvo = acharSecaoAvaliacoes();
    if (!alvo) return;
    // Se estiver dentro de um accordion fechado, tenta abrir
    var clicavel = alvo.closest('[data-toggle], .accordion-header, summary') || alvo;
    try { clicavel.click(); } catch (err) {}
    var y = alvo.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  function montarRating() {
    var a = el('a', { href: '#avaliacoes', class: 'arc-block arc-rating', id: 'arc-rating' },
      '<span class="arc-rating__stars">★★★★★</span>' +
      '<span class="arc-rating__nota">' + CFG.nota + '</span>' +
      '<span class="arc-rating__link">' + CFG.totalAvaliacoes + ' avaliações</span>'
    );
    a.addEventListener('click', scrollParaAvaliacoes);
    return a;
  }

  function montarProvaSocial() {
    return el('div', { class: 'arc-block arc-social', id: 'arc-social' },
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="' + CFG.cores.cinza + '" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' +
      '<span><b>' + CFG.pessoas + '</b></span>'
    );
  }

  /* ---------------------------------------------------------------------
     3. Bullets
     --------------------------------------------------------------------- */
  function montarBullets() {
    var ul = el('ul', { class: 'arc-block arc-bullets', id: 'arc-bullets' });
    CFG.bullets.forEach(function (b) { ul.appendChild(el('li', null, b)); });
    return ul;
  }

  /* ---------------------------------------------------------------------
     4. Entrega rápida com cidade + timer
     --------------------------------------------------------------------- */
  function proximoCorte() {
    var agora = new Date();
    var corte = new Date(agora);
    corte.setHours(CFG.corteHora, CFG.corteMinuto, 0, 0);
    if (corte <= agora) corte.setDate(corte.getDate() + 1);
    // Pula fim de semana
    while (corte.getDay() === 0 || corte.getDay() === 6) corte.setDate(corte.getDate() + 1);
    return corte;
  }

  function formatarRestante(ms) {
    var totalMin = Math.max(0, Math.floor(ms / 60000));
    var h = Math.floor(totalMin / 60);
    var m = totalMin % 60;
    if (h >= 24) return h + 'h';
    return h + 'h' + String(m).padStart(2, '0') + 'min';
  }

  function montarEntrega() {
    var box = el('div', { class: 'arc-block arc-card arc-entrega', id: 'arc-entrega' },
      '<span class="arc-entrega__ico">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + CFG.cores.vinho + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>' +
      '</span>' +
      '<span class="arc-entrega__txt">' +
      'Frete de <b>' + CFG.fretePromo + '</b> comprando em <span class="arc-entrega__timer" id="arc-timer">--</span> ' +
      'para <span class="arc-entrega__cidade" id="arc-cidade">' + CFG.cidadePadrao + '</span> e região' +
      '<span class="arc-entrega__sub" id="arc-entrega-sub"></span>' +
      '</span>'
    );

    setTimeout(function () {
      var alvo = proximoCorte();
      var timerEl = $('#arc-timer');
      function tick() {
        if (!document.body.contains(timerEl)) return;
        var restante = alvo - new Date();
        if (restante <= 0) { alvo = proximoCorte(); restante = alvo - new Date(); }
        timerEl.textContent = formatarRestante(restante);
      }
      tick();
      setInterval(tick, 30000);

      // Janela estimada de chegada
      var sub = $('#arc-entrega-sub');
      if (sub) {
        var meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
        function maisDias(d) {
          var dt = new Date(); dt.setDate(dt.getDate() + d);
          return dt.getDate() + ' de ' + meses[dt.getMonth()];
        }
        sub.textContent = 'Chegará entre ' + maisDias(7) + ' e ' + maisDias(12) + '*';
      }

      // Cidade real por IP
      fetch('https://ipapi.co/json/')
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.city) {
            var c = $('#arc-cidade');
            if (c) c.textContent = d.city;
          }
        })
        .catch(function () { /* mantém o padrão */ });
    }, 0);

    return box;
  }

  /* ---------------------------------------------------------------------
     5. Barra da promoção de 2 camisetas
     --------------------------------------------------------------------- */
  function qtdNoCarrinho() {
    try {
      if (window.LS && LS.cart && Array.isArray(LS.cart.items)) {
        return LS.cart.items.reduce(function (s, i) { return s + (i.quantity || 0); }, 0);
      }
    } catch (e) {}
    // Fallback: badge de quantidade do cabeçalho
    var badge = firstOf(['.js-cart-widget-amount', '[data-component="cart-amount"]', '.cart-amount']);
    if (badge) {
      var n = parseInt((badge.textContent || '').replace(/\D/g, ''), 10);
      if (!isNaN(n)) return n;
    }
    return 0;
  }

  function montarPromo() {
    var box = el('div', { class: 'arc-block arc-card arc-promo', id: 'arc-promo' },
      '<div class="arc-promo__topo">' +
      '<span class="arc-promo__ico">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="' + CFG.cores.vinho + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>' +
      '</span>' +
      '<span class="arc-promo__txt" id="arc-promo-txt"></span>' +
      '</div>' +
      '<div class="arc-promo__barra"><div class="arc-promo__fill" id="arc-promo-fill"></div></div>'
    );

    function atualizar() {
      var q = qtdNoCarrinho();
      var txt = $('#arc-promo-txt');
      var fill = $('#arc-promo-fill');
      if (!txt || !fill) return;
      var pct = Math.min(100, (q / CFG.promo.meta) * 100);
      fill.style.width = pct + '%';
      if (q >= CFG.promo.meta) {
        box.classList.add('arc-promo--ok');
        txt.innerHTML = '<b>' + CFG.promo.textoCompleto + '</b>';
      } else {
        box.classList.remove('arc-promo--ok');
        var base = q === CFG.promo.meta - 1 ? CFG.promo.textoFalta1 : CFG.promo.textoVazio;
        txt.innerHTML = base.replace(/(frete grátis[^]*)$/, '<b>$1</b>');
      }
    }

    setTimeout(function () {
      atualizar();
      setInterval(atualizar, 1500);
      document.addEventListener('click', function () { setTimeout(atualizar, 900); });
    }, 0);

    return box;
  }

  /* ---------------------------------------------------------------------
     6. Selos de segurança perto do botão
     --------------------------------------------------------------------- */
  function montarSelos() {
    var c = CFG.cores;
    var bandeiras = [
      ['Visa', 'https://d26lpennugtm8s.cloudfront.net/assets/common/img/payment-icons/visa.svg'],
      ['Mastercard', 'https://d26lpennugtm8s.cloudfront.net/assets/common/img/payment-icons/mastercard.svg'],
      ['Elo', 'https://d26lpennugtm8s.cloudfront.net/assets/common/img/payment-icons/elo.svg'],
      ['Pix', 'https://d26lpennugtm8s.cloudfront.net/assets/common/img/payment-icons/pix.svg'],
      ['American Express', 'https://d26lpennugtm8s.cloudfront.net/assets/common/img/payment-icons/amex.svg'],
      ['Hipercard', 'https://d26lpennugtm8s.cloudfront.net/assets/common/img/payment-icons/hipercard.svg']
    ];
    var imgs = bandeiras.map(function (b) {
      return '<img src="' + b[1] + '" alt="' + b[0] + '" loading="lazy" onerror="this.style.display=\'none\'">';
    }).join('');

    return el('div', { class: 'arc-block arc-selos', id: 'arc-selos' },
      '<div class="arc-selos__linha">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + c.verde + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
      '<span>Compra 100% segura · Seus dados protegidos</span>' +
      '</div>' +
      '<div class="arc-selos__bandeiras">' + imgs + '</div>'
    );
  }

  /* ---------------------------------------------------------------------
     Pontos de inserção
     --------------------------------------------------------------------- */
  function acharTitulo() {
    return firstOf([
      '[data-store="product-name"]',
      '.js-product-name',
      '.product-name',
      '.product-detail h1',
      'h1'
    ]);
  }

  function acharSeletorTamanho() {
    var porTexto = byText('label, .form-label, .variation-label, p, span, strong', '^tamanho');
    if (porTexto) {
      return porTexto.closest('.js-product-variants, [data-component="product-variants"], .form-group, .product-variants') || porTexto;
    }
    return firstOf([
      '.js-product-variants',
      '[data-component="product-variants"]',
      '.product-variants',
      '.js-product-variants-container'
    ]);
  }

  function acharBotaoComprar() {
    return firstOf([
      '.js-addtocart',
      '[data-store="product-buy-button"]',
      'input[name="add_to_cart"]',
      '.js-prod-submit-form button[type="submit"]',
      '.product-buy button'
    ]);
  }

  function inserirAntes(novo, ref) {
    if (!ref || !ref.parentNode || document.getElementById(novo.id)) return false;
    ref.parentNode.insertBefore(novo, ref);
    return true;
  }

  function inserirDepois(novo, ref) {
    if (!ref || !ref.parentNode || document.getElementById(novo.id)) return false;
    ref.parentNode.insertBefore(novo, ref.nextSibling);
    return true;
  }

  /* ---------------------------------------------------------------------
     Montagem
     --------------------------------------------------------------------- */
  function montar() {
    var titulo = acharTitulo();
    var tamanho = acharSeletorTamanho();
    var botao = acharBotaoComprar();
    if (!titulo) return false;

    injetarCSS();

    // Abaixo do título: nota + prova social
    if (!$('#arc-rating')) inserirDepois(montarRating(), titulo);
    if (!$('#arc-social')) inserirDepois(montarProvaSocial(), $('#arc-rating') || titulo);

    // Antes do seletor de tamanho: bullets + entrega + promoção
    if (tamanho) {
      if (!$('#arc-bullets')) inserirAntes(montarBullets(), tamanho);
      if (!$('#arc-entrega')) inserirAntes(montarEntrega(), tamanho);
      if (!$('#arc-promo')) inserirAntes(montarPromo(), tamanho);
    }

    // Depois do botão: selos
    if (botao && !$('#arc-selos')) {
      var alvoBotao = botao.closest('.js-prod-submit-form, .product-buy, form') || botao;
      inserirDepois(montarSelos(), alvoBotao);
    }

    return !!($('#arc-rating') && (!tamanho || $('#arc-bullets')));
  }

  /* ---------------------------------------------------------------------
     Boot — espera o tema renderizar e reinsere se o DOM mudar
     --------------------------------------------------------------------- */
  function iniciar() {
    // Só roda em página de produto
    var ehProduto = !!firstOf(['.js-product-detail', '[data-store="product-detail"]', '.js-addtocart', '[data-store="product-buy-button"]']);
    if (!ehProduto) return;

    montar();

    var tentativas = 0;
    var t = setInterval(function () {
      tentativas++;
      montar();
      if (tentativas > 20) clearInterval(t);
    }, 500);

    var obs = new MutationObserver(function () {
      if (!$('#arc-rating')) montar();
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
