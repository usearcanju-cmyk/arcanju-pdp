/* ==========================================================================
   Use Arcanju — Melhorias da página de produto (PDP)  |  v2
   Prefixo de classe: apdp-  (não colide com o widget "Compartilhe seu look")
   ========================================================================== */
(function () {
  'use strict';

  if (window.__ARCANJU_PDP_V2__) return;
  window.__ARCANJU_PDP_V2__ = true;

  /* =========================================================================
     CONFIGURAÇÃO
     ========================================================================= */
  var CFG = {
    nota: '4,8',
    totalAvaliacoes: '743',
    pessoas: '+10.000 pessoas já vestem com a Use Arcanju',
    bullets: [
      '100% algodão penteado',
      'Modelagem unissex',
      'Estampa que não racha'
    ],
    corteHora: 16,          // horário limite para sair no mesmo dia útil
    corteMinuto: 0,
    removerBreadcrumb: true,
    espaco: 14,             // espaçamento vertical uniforme (px)
    promo: {
      meta: 2,
      textoVazio: 'Leve 2 camisetas e ganhe frete grátis, capelinha, sacolinha e R$ 29 de desconto',
      textoFalta1: 'Falta 1 camiseta para liberar frete grátis, capelinha, sacolinha e R$ 29 de desconto',
      textoCompleto: 'Benefícios liberados: frete grátis, capelinha, sacolinha e R$ 29 de desconto',
      freteGratis: 'Você ganhou frete grátis na promoção de 2 camisetas'
    },
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

  /* Tabela de frete: UF -> [preço, dias úteis mínimo, dias úteis máximo] */
  var FRETE = {
    AC: [29.9, 18, 19], AL: [17.9, 17, 20], AP: [25.9, 17, 20], AM: [29.9, 15, 20],
    BA: [15.9, 13, 15], CE: [15.9, 13, 17], DF: [16.9, 5, 9],   ES: [17.9, 9, 14],
    GO: [19.9, 9, 15],  MA: [18.9, 13, 15], MT: [25.9, 10, 16], MS: [19.9, 12, 16],
    MG: [15.9, 5, 9],   PA: [36.9, 16, 20], PB: [36.9, 15, 21], PR: [16.9, 7, 12],
    PE: [17.9, 13, 17], PI: [18.9, 13, 17], RJ: [14.9, 6, 9],   RN: [16.9, 10, 15],
    RS: [16.9, 6, 11],  RO: [36.9, 12, 16], RR: [26.9, 23, 27], SC: [17.9, 7, 13],
    SP: [14.9, 5, 9],   SE: [15.9, 9, 15],  TO: [19.9, 7, 15]
  };
  var FRETE_PADRAO = [17.9, 9, 15];

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
    for (var i = 0; i < list.length; i++) {
      var f = $(list[i]);
      if (f) return f;
    }
    return null;
  }

  function byText(selector, regex) {
    var re = new RegExp(regex, 'i');
    return $$(selector).filter(function (n) {
      return re.test((n.textContent || '').trim());
    })[0] || null;
  }

  function brl(v) {
    return 'R$ ' + v.toFixed(2).replace('.', ',');
  }

  function diasUteis(n) {
    var d = new Date();
    var contados = 0;
    while (contados < n) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) contados++;
    }
    return d;
  }

  var MESES = ['janeiro','fevereiro','março','abril','maio','junho',
               'julho','agosto','setembro','outubro','novembro','dezembro'];

  function dataCurta(d) { return d.getDate() + ' de ' + MESES[d.getMonth()]; }

  /* =========================================================================
     CSS
     ========================================================================= */
  function injetarCSS() {
    if ($('#apdp-css')) return;
    var c = CFG.cores, gap = CFG.espaco;
    var css = `
    .apdp { font-family: inherit; box-sizing: border-box; }
    .apdp + .apdp { margin-top: ${gap}px; }
    #apdp-rating { margin: ${gap}px 0 6px; }
    #apdp-social { margin: 0 0 ${gap}px; }

    .apdp-rating {
      display:flex; align-items:center; gap:8px; flex-wrap:wrap;
      text-decoration:none; cursor:pointer;
    }
    .apdp-rating:hover .apdp-rating__link { text-decoration:underline; }
    .apdp-rating__stars { color:${c.vinho}; letter-spacing:1px; font-size:15px; line-height:1; }
    .apdp-rating__nota { font-weight:700; color:${c.texto}; font-size:14px; }
    .apdp-rating__link { color:${c.cinza}; font-size:14px; }

    .apdp-social {
      display:flex; align-items:center; gap:6px;
      font-size:13px; color:${c.texto};
    }
    .apdp-social b { font-weight:600; }

    .apdp-bullets { list-style:none; padding:0; display:grid; gap:9px; }
    .apdp-bullets li {
      display:flex; align-items:flex-start; gap:9px;
      font-size:14px; color:${c.texto}; line-height:1.35;
    }
    .apdp-bullets li::before {
      content:''; flex:0 0 16px; height:16px; margin-top:1px; border-radius:50%;
      background:${c.verdeFundo}; box-shadow:inset 0 0 0 1.5px ${c.verde};
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231E8E4E' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
      background-size:10px 10px; background-repeat:no-repeat; background-position:center;
    }

    .apdp-card {
      border:1px solid ${c.borda}; border-radius:10px;
      padding:12px 14px; background:${c.creme};
      display:flex; gap:10px; align-items:flex-start;
    }
    .apdp-card__ico { flex:0 0 20px; margin-top:1px; line-height:0; }
    .apdp-card__corpo { flex:1 1 auto; min-width:0; }
    .apdp-card__txt { font-size:14px; line-height:1.5; color:${c.texto}; }
    .apdp-card__txt b { font-weight:700; }
    .apdp-frase-verde { color:${c.verde}; font-weight:600; }
    .apdp-timer { color:${c.vinho}; font-weight:700; font-variant-numeric:tabular-nums; }
    .apdp-card__sub {
      display:block; margin-top:5px; font-size:13px; color:${c.cinza}; line-height:1.4;
    }

    .apdp-promo { border-color:${c.vinho}; display:block; }
    .apdp-promo__topo { display:flex; gap:10px; align-items:flex-start; }
    .apdp-promo__txt { font-size:14px; line-height:1.45; color:${c.texto}; }
    .apdp-promo__txt b { color:${c.vinho}; font-weight:700; }
    .apdp-promo__barra {
      margin-top:10px; height:8px; border-radius:99px; background:#EDE4E5; overflow:hidden;
    }
    .apdp-promo__fill {
      height:100%; width:0%; border-radius:99px;
      background:linear-gradient(90deg, ${c.vinhoClaro}, ${c.vinho});
      transition:width .45s cubic-bezier(.4,0,.2,1);
    }
    .apdp-promo--ok { border-color:${c.verde}; background:${c.verdeFundo}; }
    .apdp-promo--ok .apdp-promo__fill { background:${c.verde}; }
    .apdp-promo--ok .apdp-promo__txt b { color:${c.verde}; }
    .apdp-frete--ok { border-color:${c.verde}; background:${c.verdeFundo}; }

    .apdp-selos {
      display:flex; align-items:center; justify-content:center;
      gap:8px; flex-wrap:wrap; font-size:13px; color:${c.cinza};
    }
    .apdp-selos__txt { display:inline-flex; align-items:center; gap:6px; }
    .apdp-selos__bandeiras { display:inline-flex; gap:4px; align-items:center; }
    .apdp-selos__bandeiras img {
      height:17px; width:auto; display:block; border-radius:2px;
    }
    @media (prefers-reduced-motion: reduce) {
      .apdp-promo__fill { transition:none; }
    }
    `;
    document.head.appendChild(el('style', { id: 'apdp-css' }, css));
  }

  /* =========================================================================
     Estado compartilhado (geo + carrinho)
     ========================================================================= */
  var GEO = { cidade: null, uf: null, pronto: false };

  function carregarGeo(cb) {
    fetch('https://ipapi.co/json/')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.country_code === 'BR') {
          GEO.cidade = d.city || null;
          GEO.uf = (d.region_code || '').toUpperCase() || null;
        }
        GEO.pronto = true;
        cb && cb();
      })
      .catch(function () { GEO.pronto = true; cb && cb(); });
  }

  function qtdNoCarrinho() {
    try {
      if (window.LS && LS.cart && Array.isArray(LS.cart.items)) {
        return LS.cart.items.reduce(function (s, i) { return s + (i.quantity || 0); }, 0);
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
     1 · Nota + avaliações   2 · Prova social
     ========================================================================= */
  function acharSecaoAvaliacoes() {
    return firstOf([
      '#apdp-avaliacoes', '[id*="avaliac"]', '[class*="reviews"]',
      '[data-store*="reviews"]', '#product-reviews'
    ]) || byText('h2, h3, .accordion-title, [class*="title"]', 'avalia');
  }

  function montarRating() {
    var a = el('a', { href: '#avaliacoes', class: 'apdp apdp-rating', id: 'apdp-rating' },
      '<span class="apdp-rating__stars">★★★★★</span>' +
      '<span class="apdp-rating__nota">' + CFG.nota + '</span>' +
      '<span class="apdp-rating__link">' + CFG.totalAvaliacoes + ' avaliações</span>'
    );
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var alvo = acharSecaoAvaliacoes();
      if (!alvo) return;
      var clicavel = alvo.closest('[data-toggle], .accordion-header, summary') || alvo;
      try { clicavel.click(); } catch (err) {}
      window.scrollTo({
        top: alvo.getBoundingClientRect().top + window.pageYOffset - 80,
        behavior: 'smooth'
      });
    });
    return a;
  }

  function montarProvaSocial() {
    return el('div', { class: 'apdp apdp-social', id: 'apdp-social' },
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="' + CFG.cores.cinza + '" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' +
      '<span><b>' + CFG.pessoas + '</b></span>'
    );
  }

  /* =========================================================================
     3 · Bullets
     ========================================================================= */
  function montarBullets() {
    var ul = el('ul', { class: 'apdp apdp-bullets', id: 'apdp-bullets' });
    CFG.bullets.forEach(function (b) { ul.appendChild(el('li', null, b)); });
    return ul;
  }

  /* =========================================================================
     4 · Frete real por estado + timer com segundos
     ========================================================================= */
  function proximoCorte() {
    var agora = new Date();
    var corte = new Date(agora);
    corte.setHours(CFG.corteHora, CFG.corteMinuto, 0, 0);
    if (corte <= agora) corte.setDate(corte.getDate() + 1);
    while (corte.getDay() === 0 || corte.getDay() === 6) {
      corte.setDate(corte.getDate() + 1);
      corte.setHours(CFG.corteHora, CFG.corteMinuto, 0, 0);
    }
    return corte;
  }

  function formatarRestante(ms) {
    var t = Math.max(0, Math.floor(ms / 1000));
    var h = Math.floor(t / 3600);
    var m = Math.floor((t % 3600) / 60);
    var s = t % 60;
    if (h > 0) return h + 'h ' + String(m).padStart(2, '0') + 'min ' + String(s).padStart(2, '0') + 's';
    return m + 'min ' + String(s).padStart(2, '0') + 's';
  }

  function montarFrete() {
    var c = CFG.cores;
    var box = el('div', { class: 'apdp apdp-card apdp-frete', id: 'apdp-frete' },
      '<span class="apdp-card__ico" id="apdp-frete-ico">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + c.vinho + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>' +
      '</span>' +
      '<span class="apdp-card__corpo">' +
      '<span class="apdp-card__txt" id="apdp-frete-txt"></span>' +
      '<span class="apdp-card__sub" id="apdp-frete-sub"></span>' +
      '</span>'
    );

    var alvo = proximoCorte();

    function dadosFrete() {
      return (GEO.uf && FRETE[GEO.uf]) ? FRETE[GEO.uf] : FRETE_PADRAO;
    }

    function localTexto() {
      if (GEO.cidade && GEO.uf) return GEO.cidade + ', ' + GEO.uf + ' e região';
      if (GEO.cidade) return GEO.cidade + ' e região';
      if (GEO.uf) return GEO.uf + ' e região';
      return 'sua região';
    }

    function render() {
      var txt = $('#apdp-frete-txt');
      var sub = $('#apdp-frete-sub');
      var ico = $('#apdp-frete-ico');
      if (!txt) return;

      var gratis = qtdNoCarrinho() >= CFG.promo.meta;
      var d = dadosFrete();

      var restante = alvo - new Date();
      if (restante <= 0) { alvo = proximoCorte(); restante = alvo - new Date(); }

      if (gratis) {
        box.classList.add('apdp-frete--ok');
        ico.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + c.verde + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';
        txt.innerHTML = '<b class="apdp-frase-verde">' + CFG.promo.freteGratis + '</b> — enviamos para ' +
          '<span class="apdp-frase-verde">' + localTexto() + '</span>';
      } else {
        box.classList.remove('apdp-frete--ok');
        ico.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + c.vinho + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';
        txt.innerHTML =
          'Frete de <b>' + brl(d[0]) + '</b> comprando em ' +
          '<span class="apdp-timer" id="apdp-timer">' + formatarRestante(restante) + '</span> para ' +
          '<span class="apdp-frase-verde">' + localTexto() + '</span>';
      }

      if (sub) {
        sub.textContent = 'Chegará entre ' + dataCurta(diasUteis(d[1])) +
          ' e ' + dataCurta(diasUteis(d[2])) + '*';
      }
    }

    function tickTimer() {
      var t = $('#apdp-timer');
      if (!t) return;
      var restante = alvo - new Date();
      if (restante <= 0) { alvo = proximoCorte(); restante = alvo - new Date(); }
      t.textContent = formatarRestante(restante);
    }

    setTimeout(function () {
      render();
      setInterval(tickTimer, 1000);   // segundos correndo
      setInterval(render, 1500);      // reage a mudança de carrinho
      if (!GEO.pronto) carregarGeo(render); else render();
    }, 0);

    return box;
  }

  /* =========================================================================
     5 · Barra da promoção de 2 camisetas
     ========================================================================= */
  function montarPromo() {
    var box = el('div', { class: 'apdp apdp-card apdp-promo', id: 'apdp-promo' },
      '<div class="apdp-promo__topo">' +
      '<span class="apdp-card__ico">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + CFG.cores.vinho + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>' +
      '</span>' +
      '<span class="apdp-promo__txt" id="apdp-promo-txt"></span>' +
      '</div>' +
      '<div class="apdp-promo__barra"><div class="apdp-promo__fill" id="apdp-promo-fill"></div></div>'
    );

    function atualizar() {
      var q = qtdNoCarrinho();
      var txt = $('#apdp-promo-txt'), fill = $('#apdp-promo-fill');
      if (!txt || !fill) return;
      fill.style.width = Math.min(100, (q / CFG.promo.meta) * 100) + '%';
      if (q >= CFG.promo.meta) {
        box.classList.add('apdp-promo--ok');
        txt.innerHTML = '<b>' + CFG.promo.textoCompleto + '</b>';
      } else {
        box.classList.remove('apdp-promo--ok');
        var base = (q === CFG.promo.meta - 1) ? CFG.promo.textoFalta1 : CFG.promo.textoVazio;
        txt.innerHTML = base.replace(/(frete grátis.*)$/, '<b>$1</b>');
      }
    }

    setTimeout(function () {
      atualizar();
      setInterval(atualizar, 1500);
      document.addEventListener('click', function () { setTimeout(atualizar, 900); });
    }, 0);

    return box;
  }

  /* =========================================================================
     6 · Selos de segurança + bandeiras na mesma linha
     ========================================================================= */
  function montarSelos() {
    var c = CFG.cores;
    var base = 'https://d26lpennugtm8s.cloudfront.net/assets/common/img/payment-icons/';
    var bandeiras = [
      ['Visa', 'visa.svg'], ['Mastercard', 'mastercard.svg'], ['Elo', 'elo.svg'],
      ['American Express', 'amex.svg'], ['Pix', 'pix.svg'], ['Boleto', 'boleto.svg']
    ];
    var imgs = bandeiras.map(function (b) {
      return '<img src="' + base + b[1] + '" alt="' + b[0] + '" loading="lazy" ' +
             'onerror="this.style.display=\'none\'">';
    }).join('');

    return el('div', { class: 'apdp apdp-selos', id: 'apdp-selos' },
      '<span class="apdp-selos__txt">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + c.verde + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
      'Compra segura · Seus dados protegidos' +
      '</span>' +
      '<span class="apdp-selos__bandeiras">' + imgs + '</span>'
    );
  }

  /* =========================================================================
     7 · Remover breadcrumb
     ========================================================================= */
  function removerBreadcrumb() {
    if (!CFG.removerBreadcrumb) return;
    var bc = firstOf([
      '.breadcrumbs', '.breadcrumb', '[class*="breadcrumb"]',
      '[data-store="breadcrumb"]', 'nav[aria-label*="readcrumb"]'
    ]);
    if (bc) bc.style.display = 'none';
  }

  /* =========================================================================
     Pontos de inserção
     ========================================================================= */
  function acharTitulo() {
    return firstOf([
      '[data-store="product-name"]', '.js-product-name', '.product-name',
      '.product-detail h1', 'h1'
    ]);
  }

  function acharSeletorTamanho() {
    // Aceita "Tamanho", "Tamanho (Baby Look)", "Cor", etc.
    var porTexto = byText('label, .form-label, .variation-label, p, span, strong', '^\\s*tamanho');
    if (porTexto) {
      return porTexto.closest(
        '.js-product-variants, [data-component="product-variants"], .form-group, .product-variants'
      ) || porTexto;
    }
    return firstOf([
      '.js-product-variants', '[data-component="product-variants"]',
      '.product-variants', '.js-product-variants-container'
    ]);
  }

  function acharBotaoComprar() {
    return firstOf([
      '.js-addtocart', '[data-store="product-buy-button"]',
      'input[name="add_to_cart"]', '.js-prod-submit-form button[type="submit"]',
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

  /* =========================================================================
     Montagem
     ========================================================================= */
  function montar() {
    var titulo = acharTitulo();
    if (!titulo) return false;

    injetarCSS();
    removerBreadcrumb();

    if (!$('#apdp-rating')) inserirDepois(montarRating(), titulo);
    if (!$('#apdp-social')) inserirDepois(montarProvaSocial(), $('#apdp-rating') || titulo);

    var tamanho = acharSeletorTamanho();
    if (tamanho) {
      if (!$('#apdp-bullets')) inserirAntes(montarBullets(), tamanho);
      if (!$('#apdp-frete'))   inserirAntes(montarFrete(), tamanho);
      if (!$('#apdp-promo'))   inserirAntes(montarPromo(), tamanho);
    }

    var botao = acharBotaoComprar();
    if (botao && !$('#apdp-selos')) {
      var alvo = botao.closest('.js-prod-submit-form, .product-buy, form') || botao;
      inserirDepois(montarSelos(), alvo);
    }

    return !!$('#apdp-rating');
  }

  /* =========================================================================
     Boot
     ========================================================================= */
  function iniciar() {
    var ehProduto = !!firstOf([
      '.js-product-detail', '[data-store="product-detail"]',
      '.js-addtocart', '[data-store="product-buy-button"]'
    ]);
    if (!ehProduto) return;

    carregarGeo();
    montar();

    var n = 0;
    var t = setInterval(function () {
      n++;
      montar();
      if (n > 20) clearInterval(t);
    }, 500);

    new MutationObserver(function () {
      if (!$('#apdp-rating')) montar();
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
