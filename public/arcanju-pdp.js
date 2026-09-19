/* ==========================================================================
   Use Arcanju — Melhorias da página de produto (PDP)  |  v4
   Prefixo: apdp-   ·   Frete por CEP (ViaCEP, gratuito e ilimitado)
   ========================================================================== */
(function () {
  'use strict';

  if (window.__ARCANJU_PDP_V4__) return;
  window.__ARCANJU_PDP_V4__ = true;

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
    janelaHoras: 2,          // duração da oferta por visitante
    removerBreadcrumb: true,
    estilizarBotao: true,      // deixa o botão de compra verde e arredondado
    estilizarTamanhos: true,   // deixa o seletor de tamanho em chips
    barraFixa: true,           // botão de comprar fixo no rodapé
    corBotao: '#1FA24A',
    corBotaoHover: '#188B3E',
    espaco: 16,              // espaçamento vertical uniforme (px)
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

  /* UF -> [preço, dias úteis mín, dias úteis máx] */
  var FRETE = {
    AC: [29.9, 18, 19], AL: [17.9, 17, 20], AP: [25.9, 17, 20], AM: [29.9, 15, 20],
    BA: [15.9, 13, 15], CE: [15.9, 13, 17], DF: [16.9, 5, 9],   ES: [17.9, 9, 14],
    GO: [19.9, 9, 15],  MA: [18.9, 13, 15], MT: [25.9, 10, 16], MS: [19.9, 12, 16],
    MG: [15.9, 5, 9],   PA: [36.9, 16, 20], PB: [36.9, 15, 21], PR: [16.9, 7, 12],
    PE: [17.9, 13, 17], PI: [18.9, 13, 17], RJ: [14.9, 6, 9],   RN: [16.9, 10, 15],
    RS: [16.9, 6, 11],  RO: [36.9, 12, 16], RR: [26.9, 23, 27], SC: [17.9, 7, 13],
    SP: [14.9, 5, 9],   SE: [15.9, 9, 15],  TO: [19.9, 7, 15]
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

  function byText(selector, regex) {
    var re = new RegExp(regex, 'i');
    return $$(selector).filter(function (n) {
      return re.test((n.textContent || '').trim());
    })[0] || null;
  }

  function brl(v) { return 'R$ ' + v.toFixed(2).replace('.', ','); }

  function diasUteis(n) {
    var d = new Date(), c = 0;
    while (c < n) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) c++; }
    return d;
  }

  var MESES = ['janeiro','fevereiro','março','abril','maio','junho',
               'julho','agosto','setembro','outubro','novembro','dezembro'];
  function dataCurta(d) { return d.getDate() + ' de ' + MESES[d.getMonth()]; }

  function ls(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      localStorage.setItem(k, v);
    } catch (e) { return null; }
  }

  /* =========================================================================
     CSS
     ========================================================================= */
  function injetarCSS() {
    if ($('#apdp-css')) return;
    var c = CFG.cores, gap = CFG.espaco;
    var css = `
    .apdp { font-family:inherit; box-sizing:border-box; }
    .apdp, .apdp * { box-sizing:border-box; }

    /* Espaçamento uniforme — sobrescreve as margens do tema */
    #apdp-rating  { margin:${gap}px 0 6px !important; }
    #apdp-social  { margin:0 0 ${gap}px !important; }
    #apdp-bullets { margin:${gap}px 0 !important; }
    #apdp-frete   { margin:${gap}px 0 !important; }
    #apdp-promo   { margin:${gap}px 0 ${gap}px !important; }
    #apdp-selos   { margin:12px 0 ${gap}px !important; }

    .apdp-rating { display:flex; align-items:center; gap:8px; flex-wrap:wrap;
      text-decoration:none; cursor:pointer; }
    .apdp-rating:hover .apdp-rating__link { text-decoration:underline; }
    .apdp-rating__stars { color:${c.vinho}; letter-spacing:1px; font-size:15px; line-height:1; }
    .apdp-rating__nota { font-weight:700; color:${c.texto}; font-size:14px; }
    .apdp-rating__link { color:${c.cinza}; font-size:14px; }

    .apdp-social { display:flex; align-items:center; gap:6px; font-size:13px; color:${c.texto}; }
    .apdp-social b { font-weight:600; }

    .apdp-bullets { list-style:none; padding:0; display:grid; gap:9px; }
    .apdp-bullets li { display:flex; align-items:flex-start; gap:9px;
      font-size:14px; color:${c.texto}; line-height:1.35; }
    .apdp-bullets li::before {
      content:''; flex:0 0 16px; height:16px; margin-top:1px; border-radius:50%;
      background:${c.verdeFundo}; box-shadow:inset 0 0 0 1.5px ${c.verde};
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231E8E4E' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
      background-size:10px 10px; background-repeat:no-repeat; background-position:center;
    }

    .apdp-card { border:1px solid ${c.borda}; border-radius:10px; padding:12px 14px;
      background:${c.creme}; display:flex; gap:10px; align-items:flex-start; }
    .apdp-card__ico { flex:0 0 20px; margin-top:1px; line-height:0; }
    .apdp-card__corpo { flex:1 1 auto; min-width:0; }
    .apdp-card__txt { font-size:14px; line-height:1.5; color:${c.texto}; display:block; }
    .apdp-card__txt b { font-weight:700; }
    .apdp-verde { color:${c.verde}; font-weight:600; }
    .apdp-timer { color:${c.vinho}; font-weight:700; font-variant-numeric:tabular-nums; }
    .apdp-card__sub { display:block; margin-top:5px; font-size:13px; color:${c.cinza}; line-height:1.4; }

    /* CEP */
    .apdp-cep { display:flex; gap:6px; margin-top:8px; flex-wrap:wrap; align-items:center; }
    .apdp-cep input {
      flex:1 1 130px; min-width:110px; max-width:170px; height:36px; padding:0 10px;
      border:1px solid ${c.borda}; border-radius:7px; font-size:14px; font-family:inherit;
      color:${c.texto}; background:#fff; outline:none;
    }
    .apdp-cep input:focus { border-color:${c.vinho}; box-shadow:0 0 0 2px rgba(107,27,34,.12); }
    .apdp-cep button {
      height:36px; padding:0 14px; border:0; border-radius:7px; cursor:pointer;
      background:${c.vinho}; color:#fff; font-size:13px; font-weight:600; font-family:inherit;
    }
    .apdp-cep button:disabled { opacity:.6; cursor:default; }
    .apdp-cep__erro { flex:1 1 100%; font-size:12.5px; color:#B3261E; }
    .apdp-trocar {
      background:none; border:0; padding:0; margin-top:6px; cursor:pointer;
      font-family:inherit; font-size:12.5px; color:${c.cinza}; text-decoration:underline;
    }

    .apdp-promo { border-color:${c.vinho}; display:block; }
    .apdp-promo__topo { display:flex; gap:10px; align-items:flex-start; }
    .apdp-promo__txt { font-size:14px; line-height:1.45; color:${c.texto}; }
    .apdp-promo__txt b { color:${c.vinho}; font-weight:700; }
    .apdp-promo__barra { margin-top:10px; height:8px; border-radius:99px;
      background:#EDE4E5; overflow:hidden; }
    .apdp-promo__fill { height:100%; width:0%; border-radius:99px;
      background:linear-gradient(90deg, ${c.vinhoClaro}, ${c.vinho});
      transition:width .45s cubic-bezier(.4,0,.2,1); }
    .apdp-promo--ok { border-color:${c.verde}; background:${c.verdeFundo}; }
    .apdp-promo--ok .apdp-promo__fill { background:${c.verde}; }
    .apdp-promo--ok .apdp-promo__txt b { color:${c.verde}; }
    .apdp-frete--ok { border-color:${c.verde}; background:${c.verdeFundo}; }

    /* Selos — bloco inteiro, centralizado abaixo do botão */
    .apdp-selos {
      width:100% !important; flex:0 0 100% !important; display:flex !important;
      flex-direction:column; align-items:center; gap:8px; text-align:center;
    }
    .apdp-selos__txt { display:inline-flex; align-items:center; gap:6px;
      font-size:13px; color:${c.cinza}; }
    .apdp-selos__bandeiras { display:flex; gap:5px; align-items:center;
      justify-content:center; flex-wrap:wrap; }
    .apdp-selos__bandeiras svg { display:block; border-radius:3px; }

    /* Botão de compra do tema, apenas repaginado */
    .apdp-btn-bonito {
      background:${CFG.corBotao} !important; border-color:${CFG.corBotao} !important;
      color:#fff !important; border-radius:10px !important; font-weight:700 !important;
      letter-spacing:.4px !important; text-transform:uppercase !important;
      min-height:52px !important; font-size:14px !important;
      box-shadow:0 2px 10px rgba(31,162,74,.28) !important; transition:background .15s ease;
    }
    .apdp-btn-bonito:hover { background:${CFG.corBotaoHover} !important; }
    .apdp-btn-bonito:active { transform:translateY(1px); }
    /* mantém o visual durante o estado de carregando do tema */
    .apdp-btn-bonito[disabled],
    .apdp-btn-bonito.loading,
    .apdp-btn-bonito.is-loading,
    .apdp-btn-bonito[data-loading],
    .apdp-btn-bonito.disabled {
      background:${CFG.corBotao} !important; border-color:${CFG.corBotao} !important;
      color:#fff !important; opacity:1 !important; cursor:wait !important;
    }

    /* Seletor de tamanho em chips */
    .apdp-chip {
      border:1.5px solid ${c.borda} !important; border-radius:10px !important;
      min-width:48px !important; min-height:44px !important;
      display:inline-flex !important; align-items:center !important; justify-content:center !important;
      font-size:14px !important; color:${c.texto} !important; background:#fff !important;
      transition:border-color .15s ease, box-shadow .15s ease;
    }
    .apdp-chip:hover { border-color:${c.texto} !important; }
    .apdp-chip-ativo {
      border-color:#111 !important; border-width:2px !important;
      box-shadow:0 0 0 1px #111 inset !important; font-weight:700 !important;
    }

    /* Barra fixa de compra */
    #apdp-sticky {
      position:fixed; left:0; right:0; bottom:0; z-index:9985;
      background:rgba(255,255,255,.97); backdrop-filter:blur(8px);
      border-top:1px solid ${c.borda}; padding:10px 14px;
      display:flex; align-items:center; gap:10px;
      transform:translateY(120%); transition:transform .25s ease;
      box-shadow:0 -4px 18px rgba(0,0,0,.08);
      padding-bottom:calc(10px + env(safe-area-inset-bottom));
    }
    #apdp-sticky.apdp-sticky--on { transform:none; }
    .apdp-sticky__info { flex:1 1 auto; min-width:0; }
    .apdp-sticky__nome {
      font-size:11px; color:${c.cinza}; line-height:1.2;
      display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;
      overflow:hidden; text-transform:none;
    }
    .apdp-sticky__preco { font-size:14.5px; font-weight:700; color:${c.texto}; line-height:1.3;
      display:block; margin-top:1px; }
    .apdp-sticky__btn {
      flex:0 0 auto; border:0; cursor:pointer; padding:0 18px; min-height:46px;
      border-radius:10px; background:${CFG.corBotao}; color:#fff;
      font-family:inherit; font-size:14px; font-weight:700; letter-spacing:.4px;
      text-transform:uppercase;
    }
    .apdp-sticky__btn:hover { background:${CFG.corBotaoHover}; }

    /* Seletor de quantidade: sem moldura externa */
    .apdp-qty {
      border:0 !important; background:transparent !important;
      box-shadow:none !important; padding:0 !important;
    }
    .apdp-btn-bonito { margin-left:10px !important; }

    @media (prefers-reduced-motion: reduce) {
      .apdp-promo__fill, #apdp-sticky { transition:none; }
      #apdp-sticky { transition:none; }
    }
    `;
    document.head.appendChild(el('style', { id: 'apdp-css' }, css));
  }

  /* =========================================================================
     Carrinho
     ========================================================================= */
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
     Destino salvo (CEP)
     ========================================================================= */
  var DESTINO = null;   // { cep, cidade, uf }

  function carregarDestino() {
    try {
      var raw = ls('apdp_destino');
      if (raw) DESTINO = JSON.parse(raw);
    } catch (e) { DESTINO = null; }
  }

  function salvarDestino(d) {
    DESTINO = d;
    ls('apdp_destino', JSON.stringify(d));
  }

  function buscarCEP(cep) {
    return fetch('https://viacep.com.br/ws/' + cep + '/json/')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || d.erro || !d.uf) throw new Error('cep');
        return { cep: cep, cidade: d.localidade, uf: d.uf };
      });
  }

  /* =========================================================================
     Timer de 2h por visitante
     ========================================================================= */
  function fimDaJanela() {
    var agora = Date.now();
    var salvo = parseInt(ls('apdp_deadline') || '0', 10);
    if (!salvo || salvo <= agora) {
      salvo = agora + CFG.janelaHoras * 3600 * 1000;
      ls('apdp_deadline', String(salvo));
    }
    return salvo;
  }

  function formatarRestante(ms) {
    var t = Math.max(0, Math.floor(ms / 1000));
    var h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    if (h > 0) return h + 'h ' + String(m).padStart(2, '0') + 'min ' + String(s).padStart(2, '0') + 's';
    return m + 'min ' + String(s).padStart(2, '0') + 's';
  }

  /* =========================================================================
     Bandeiras em SVG (não dependem de CDN)
     ========================================================================= */
  function bandeiras() {
    var W = 30, H = 19;
    function base(inner, bg) {
      return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 30 19" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="30" height="19" rx="3" fill="' + (bg || '#FFFFFF') + '" stroke="#DCD7D2"/>' +
        inner + '</svg>';
    }
    var visa = base('<text x="15" y="13.5" font-family="Helvetica,Arial,sans-serif" font-size="8.5" font-weight="700" font-style="italic" fill="#1A1F71" text-anchor="middle">VISA</text>');
    var master = base('<circle cx="12.5" cy="9.5" r="5.2" fill="#EB001B"/><circle cx="17.5" cy="9.5" r="5.2" fill="#F79E1B" fill-opacity=".9"/>');
    var elo = base('<circle cx="10" cy="9.5" r="3" fill="#FFCB05"/><circle cx="15" cy="9.5" r="3" fill="#EF4123"/><circle cx="20" cy="9.5" r="3" fill="#00A4E0"/>');
    var amex = base('<rect x="1" y="1" width="28" height="17" rx="2.5" fill="#1F72CD"/><text x="15" y="12.5" font-family="Helvetica,Arial,sans-serif" font-size="6" font-weight="700" fill="#fff" text-anchor="middle">AMEX</text>');
    var hiper = base('<rect x="1" y="1" width="28" height="17" rx="2.5" fill="#B3131B"/><text x="15" y="12.5" font-family="Helvetica,Arial,sans-serif" font-size="5.6" font-weight="700" fill="#fff" text-anchor="middle">HIPER</text>');
    var pix = base('<path d="M15 4.6l3.2 3.2a2 2 0 0 0 1.4.6h.6l-3.4 3.4a2.5 2.5 0 0 1-3.6 0L9.8 8.4h.6a2 2 0 0 0 1.4-.6L15 4.6zm0 9.8l-3.2-3.2a2 2 0 0 0-1.4-.6h-.6l3.4-3.4a2.5 2.5 0 0 1 3.6 0l3.4 3.4h-.6a2 2 0 0 0-1.4.6L15 14.4z" fill="#32BCAD"/>');
    var boleto = base('<g fill="#2B2B2B"><rect x="6" y="5" width="1.2" height="9"/><rect x="8.4" y="5" width="2" height="9"/><rect x="11.6" y="5" width="1" height="9"/><rect x="13.8" y="5" width="2.2" height="9"/><rect x="17.2" y="5" width="1" height="9"/><rect x="19.4" y="5" width="1.8" height="9"/><rect x="22.4" y="5" width="1.2" height="9"/></g>');
    return [visa, master, elo, amex, hiper, pix, boleto].join('');
  }

  /* =========================================================================
     1 · Nota   2 · Prova social   3 · Bullets
     ========================================================================= */
  function acharSecaoAvaliacoes() {
    return firstOf(['[id*="avaliac"]', '[class*="reviews"]', '[data-store*="reviews"]', '#product-reviews'])
      || byText('h2, h3, .accordion-title, [class*="title"]', 'avalia');
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
      var cl = alvo.closest('[data-toggle], .accordion-header, summary') || alvo;
      try { cl.click(); } catch (err) {}
      window.scrollTo({ top: alvo.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
    });
    return a;
  }

  function montarProvaSocial() {
    return el('div', { class: 'apdp apdp-social', id: 'apdp-social' },
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="' + CFG.cores.cinza + '" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' +
      '<span><b>' + CFG.pessoas + '</b></span>'
    );
  }

  function montarBullets() {
    var ul = el('ul', { class: 'apdp apdp-bullets', id: 'apdp-bullets' });
    CFG.bullets.forEach(function (b) { ul.appendChild(el('li', null, b)); });
    return ul;
  }

  /* =========================================================================
     4 · Frete por CEP
     ========================================================================= */
  function montarFrete() {
    var c = CFG.cores;
    var deadline = fimDaJanela();

    var box = el('div', { class: 'apdp apdp-card apdp-frete', id: 'apdp-frete' },
      '<span class="apdp-card__ico" id="apdp-frete-ico"></span>' +
      '<span class="apdp-card__corpo" id="apdp-frete-corpo"></span>'
    );

    function iconeCaminhao(cor) {
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + cor +
        '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';
    }

    function viewFormulario(erro) {
      $('#apdp-frete-ico').innerHTML = iconeCaminhao(c.vinho);
      $('#apdp-frete-corpo').innerHTML =
        '<span class="apdp-card__txt">Calcule o frete e o prazo para o seu endereço</span>' +
        '<span class="apdp-cep">' +
        '<input type="tel" inputmode="numeric" maxlength="9" placeholder="Seu CEP" id="apdp-cep-input">' +
        '<button type="button" id="apdp-cep-btn">Calcular</button>' +
        (erro ? '<span class="apdp-cep__erro">' + erro + '</span>' : '') +
        '</span>';

      var input = $('#apdp-cep-input');
      var btn = $('#apdp-cep-btn');

      input.addEventListener('input', function () {
        var v = input.value.replace(/\D/g, '').slice(0, 8);
        input.value = v.length > 5 ? v.slice(0, 5) + '-' + v.slice(5) : v;
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); enviar(); }
      });
      btn.addEventListener('click', enviar);

      function enviar() {
        var cep = input.value.replace(/\D/g, '');
        if (cep.length !== 8) { viewFormulario('Digite os 8 números do CEP'); return; }
        btn.disabled = true;
        btn.textContent = '...';
        buscarCEP(cep)
          .then(function (d) {
            if (!FRETE[d.uf]) throw new Error('uf');
            salvarDestino(d);
            render();
          })
          .catch(function () { viewFormulario('Não encontramos esse CEP. Confira e tente de novo.'); });
      }
    }

    function viewResultado() {
      var d = FRETE[DESTINO.uf];
      var gratis = qtdNoCarrinho() >= CFG.promo.meta;
      var local = DESTINO.cidade + ', ' + DESTINO.uf + ' e região';
      var restante = deadline - Date.now();
      if (restante <= 0) { deadline = fimDaJanela(); restante = deadline - Date.now(); }

      $('#apdp-frete-ico').innerHTML = iconeCaminhao(gratis ? c.verde : c.vinho);
      box.classList.toggle('apdp-frete--ok', gratis);

      var principal = gratis
        ? '<b class="apdp-verde">' + CFG.promo.freteGratis + '</b> — enviamos para ' +
          '<span class="apdp-verde">' + local + '</span>'
        : 'Frete de <b>' + brl(d[0]) + '</b> comprando em ' +
          '<span class="apdp-timer" id="apdp-timer">' + formatarRestante(restante) + '</span> para ' +
          '<span class="apdp-verde">' + local + '</span>';

      $('#apdp-frete-corpo').innerHTML =
        '<span class="apdp-card__txt">' + principal + '</span>' +
        '<span class="apdp-card__sub">Chegará entre ' + dataCurta(diasUteis(d[1])) +
        ' e ' + dataCurta(diasUteis(d[2])) + '*</span>' +
        '<button type="button" class="apdp-trocar" id="apdp-trocar">Trocar CEP</button>';

      $('#apdp-trocar').addEventListener('click', function () {
        DESTINO = null;
        try { localStorage.removeItem('apdp_destino'); } catch (e) {}
        viewFormulario();
      });
    }

    var ultimoEstado = '';
    function render() {
      if (!DESTINO || !FRETE[DESTINO.uf]) {
        if (ultimoEstado !== 'form') { ultimoEstado = 'form'; viewFormulario(); }
        return;
      }
      var chave = DESTINO.cep + '|' + (qtdNoCarrinho() >= CFG.promo.meta);
      if (chave !== ultimoEstado) { ultimoEstado = chave; viewResultado(); }
    }

    setTimeout(function () {
      render();
      setInterval(function () {
        var t = $('#apdp-timer');
        if (t) {
          var r = deadline - Date.now();
          if (r <= 0) { deadline = fimDaJanela(); r = deadline - Date.now(); }
          t.textContent = formatarRestante(r);
        }
      }, 1000);
      setInterval(render, 1500);
    }, 0);

    return box;
  }

  /* =========================================================================
     5 · Promoção de 2 camisetas
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
     6 · Selos centralizados abaixo do botão
     ========================================================================= */
  function montarSelos() {
    return el('div', { class: 'apdp apdp-selos', id: 'apdp-selos' },
      '<span class="apdp-selos__txt">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + CFG.cores.verde + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
      'Compra segura · Seus dados protegidos' +
      '</span>' +
      '<span class="apdp-selos__bandeiras">' + bandeiras() + '</span>'
    );
  }

  /* =========================================================================
     7 · Breadcrumb
     ========================================================================= */
  function removerBreadcrumb() {
    if (!CFG.removerBreadcrumb) return;
    var bc = firstOf(['.breadcrumbs', '.breadcrumb', '[class*="breadcrumb"]',
                      '[data-store="breadcrumb"]', 'nav[aria-label*="readcrumb"]']);
    if (bc) bc.style.display = 'none';
  }


  /* =========================================================================
     8 · Repaginar botão de compra e seletor de tamanho (sem trocar o elemento,
          para não perder Pixel / API de Conversões do Meta)
     ========================================================================= */
  function estilizarBotao() {
    if (!CFG.estilizarBotao) return;
    var b = acharBotaoComprar();
    if (b) {
      if (!b.classList.contains('apdp-btn-bonito')) b.classList.add('apdp-btn-bonito');
      // O tema troca o texto para "Incluindo..." ao adicionar; deixamos legível
      var alvoTxt = b.querySelector('span, .js-addtocart-text') || b;
      var txt = (alvoTxt.textContent || '').trim();
      if (/^incluindo\.*$/i.test(txt)) alvoTxt.textContent = 'INCLUINDO NO CARRINHO';
    }

    // Seletor de quantidade no mesmo desenho
    var qtd = firstOf(['.js-quantity-input', 'input[name="quantity"]', '.js-prod-qty']);
    if (qtd) {
      var caixa = qtd.closest('.js-quantity-wrapper, .item-quantity, .quantity, div');
      if (caixa && !caixa.classList.contains('apdp-qty')) caixa.classList.add('apdp-qty');
    }
  }

  var RE_TAMANHO = /^(PP|P|M|G|GG|XG|XGG|XXG|U|ÚNICO|UNICO|\d{1,2})$/i;

  function estilizarTamanhos() {
    if (!CFG.estilizarTamanhos) return;

    var escopo = firstOf(['.js-product-detail', '[data-store="product-detail"]',
                          '.product-detail', 'form']) || document;

    // Qualquer elemento "folha" cujo texto seja um tamanho
    var opcoes = $$('label, button, a, span, div, li', escopo).filter(function (n) {
      if (n.children.length > 1) return false;
      var t = (n.textContent || '').trim();
      if (!RE_TAMANHO.test(t)) return false;
      var r = n.getBoundingClientRect();
      return r.width > 20 && r.width < 140 && r.height > 20;
    });

    opcoes.forEach(function (o) {
      if (!o.classList.contains('apdp-chip')) o.classList.add('apdp-chip');
      var input = o.querySelector('input') ||
                  (o.htmlFor ? document.getElementById(o.htmlFor) : null);
      var ativo = (input && input.checked) ||
                  o.classList.contains('active') ||
                  o.getAttribute('aria-checked') === 'true' ||
                  o.getAttribute('aria-selected') === 'true';
      o.classList.toggle('apdp-chip-ativo', !!ativo);
    });
  }

  /* =========================================================================
     9 · Barra fixa de compra
     ========================================================================= */
  function montarSticky() {
    if (!CFG.barraFixa || $('#apdp-sticky')) return;

    var botao = acharBotaoComprar();
    if (!botao) return;

    var nomeEl = acharTitulo();
    var nome = nomeEl ? (nomeEl.textContent || '').trim() : '';

    var precoEl = firstOf(['[data-store="product-price"]', '.js-price-display',
                           '.product-price', '.js-product-price']);
    var preco = precoEl ? (precoEl.textContent || '').trim() : '';

    var barra = el('div', { class: 'apdp', id: 'apdp-sticky' },
      '<span class="apdp-sticky__info">' +
      '<span class="apdp-sticky__nome" id="apdp-sticky-nome">' + nome + '</span>' +
      '<span class="apdp-sticky__preco" id="apdp-sticky-preco">' + preco + '</span>' +
      '</span>' +
      '<button type="button" class="apdp-sticky__btn" id="apdp-sticky-btn">Comprar</button>'
    );
    document.body.appendChild(barra);
    if (!$('#apdp-sticky-space')) {
      document.body.appendChild(el('div', { id: 'apdp-sticky-space',
        style: 'height:0;transition:height .25s ease' }));
    }

    // Aciona o botão real do tema: o Pixel e a API de Conversões seguem intactos
    $('#apdp-sticky-btn').addEventListener('click', function () {
      var alvo = acharBotaoComprar();
      if (!alvo) return;

      // Dispara o botão real do tema (Pixel e API de Conversões intactos).
      // Alguns temas só reagem a uma sequência completa de eventos.
      try {
        ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(function (tipo) {
          alvo.dispatchEvent(new MouseEvent(tipo, {
            bubbles: true, cancelable: true, view: window
          }));
        });
      } catch (e) {
        alvo.click();
      }

      // Se nada acontecer, leva a pessoa até o botão original
      setTimeout(function () {
        alvo.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 600);
    });

    // Some quando o botão original está visível na tela
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          var mostrar = !e.isIntersecting;
          barra.classList.toggle('apdp-sticky--on', mostrar);
          document.body.classList.toggle('apdp-sticky-ativa', mostrar);
        });
      }, { threshold: 0.35 }).observe(botao);
    } else {
      window.addEventListener('scroll', function () {
        var r = botao.getBoundingClientRect();
        var visivel = r.top < window.innerHeight && r.bottom > 0;
        barra.classList.toggle('apdp-sticky--on', !visivel);
        document.body.classList.toggle('apdp-sticky-ativa', !visivel);
      });
    }

    // Mantém o preço em dia quando a pessoa troca a variação
    setInterval(function () {
      var pe = firstOf(['[data-store="product-price"]', '.js-price-display',
                        '.product-price', '.js-product-price']);
      var alvo = $('#apdp-sticky-preco');
      if (pe && alvo) {
        var novo = (pe.textContent || '').trim();
        if (novo && novo !== alvo.textContent) alvo.textContent = novo;
      }
    }, 1000);
  }

  /* =========================================================================
     Inserção
     ========================================================================= */
  function acharTitulo() {
    return firstOf(['[data-store="product-name"]', '.js-product-name', '.product-name',
                    '.product-detail h1', 'h1']);
  }

  function acharSeletorTamanho() {
    var t = byText('label, .form-label, .variation-label, p, span, strong', '^\\s*tamanho');
    if (t) {
      return t.closest('.js-product-variants, [data-component="product-variants"], .form-group, .product-variants') || t;
    }
    return firstOf(['.js-product-variants', '[data-component="product-variants"]',
                    '.product-variants', '.js-product-variants-container']);
  }

  function acharBotaoComprar() {
    return firstOf(['.js-addtocart', '[data-store="product-buy-button"]',
                    'input[name="add_to_cart"]', '.js-prod-submit-form button[type="submit"]',
                    '.product-buy button']);
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

  /* Sobe até achar um contêiner que ocupe a largura toda,
     para os selos ficarem centralizados abaixo do botão e do seletor de quantidade */
  function containerDaCompra(botao) {
    var n = botao;
    for (var i = 0; i < 5 && n && n.parentNode; i++) {
      var pai = n.parentNode;
      var estilo = window.getComputedStyle(pai);
      if (estilo.display === 'flex' || estilo.display === 'grid') { n = pai; continue; }
      if (pai.offsetWidth >= botao.offsetWidth * 1.4) return n;
      n = pai;
    }
    return botao.closest('.js-prod-submit-form, .product-buy, form') || botao;
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
      inserirDepois(montarSelos(), containerDaCompra(botao));
    }

    estilizarBotao();
    estilizarTamanhos();
    montarSticky();

    return !!$('#apdp-rating');
  }

  /* =========================================================================
     Boot
     ========================================================================= */
  function iniciar() {
    var ehProduto = !!firstOf(['.js-product-detail', '[data-store="product-detail"]',
                               '.js-addtocart', '[data-store="product-buy-button"]']);
    if (!ehProduto) return;

    carregarDestino();
    montar();

    var n = 0;
    var t = setInterval(function () { n++; montar(); if (n > 20) clearInterval(t); }, 500);

    document.addEventListener('click', function () {
      [40, 120, 300, 700].forEach(function (ms) {
        setTimeout(function () { try { estilizarTamanhos(); estilizarBotao(); } catch (e) {} }, ms);
      });
    });
    setInterval(function () { try { estilizarBotao(); } catch (e) {} }, 300);

    new MutationObserver(function () {
      if (!$('#apdp-rating')) montar();
      try { estilizarBotao(); estilizarTamanhos(); } catch (e) {}
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
