# Oceanário de Lisboa — Redesign Conceptual

> ⚠️ **Aviso**: este é um redesign conceptual e **não-oficial** do website
> do Oceanário de Lisboa, criado como exercício de storytelling digital e
> engenharia front-end. Não representa nem substitui o website oficial —
> para informação real e atualizada (horários, preços, bilhetes), visite
> **[oceanario.pt](https://www.oceanario.pt/)**.

## Visão geral

Uma landing page de página única que reinterpreta a experiência digital do
Oceanário de Lisboa com uma linguagem editorial cinematográfica: hero a
ecrã inteiro, uma narrativa horizontal fixada para as exposições, uma
galeria de espécies com drag/swipe, e microinterações construídas em GSAP.
O conteúdo institucional (exposições, experiências, espécies, conservação,
contactos) é real, reconstruído a partir de pesquisa sobre o website
oficial — ver `docs/ASSET_SOURCES.md` para a metodologia e as limitações
dessa pesquisa.

## Objetivo do redesign

Demonstrar como a informação real e a missão do Oceanário podem ser
apresentadas numa experiência mais imersiva e editorial do que um website
institucional convencional — usando o **comportamento** de interação de
sites como o do Georgia Aquarium como referência de ritmo e movimento,
nunca o seu conteúdo, código ou identidade visual (ver `docs/CREDITS.md`).

## Tecnologias

- HTML5 semântico, com um sistema de *includes* em build-time (ver
  `vite.config.js`) para manter `html/components/` e `html/sections/`
  como ficheiros reais e separados, apesar de o Vite servir um único
  `index.html`.
- CSS3 moderno: variáveis nativas, `clamp()`, CSS Grid/Flexbox, sem
  pré-processador.
- JavaScript ES6+ modular (sem framework).
- [GSAP](https://gsap.com/) + ScrollTrigger + `gsap.matchMedia()` para
  todas as animações.
- [Lenis](https://github.com/darkroomengineering/lenis) para smooth
  scroll, sincronizado com `gsap.ticker` e desativado automaticamente em
  `prefers-reduced-motion` ou em dispositivos sem ponteiro fino.
- [Vite](https://vite.dev/) para desenvolvimento e build.
- Tipografia auto-hospedada via `@fontsource` (sem hotlinking).

## Estrutura de pastas

```text
Oceanario_Lisboa_Redesign/
├── index.html              # único ponto de entrada do Vite
├── vite.config.js          # inclui o sistema de includes de HTML
├── package.json
├── css/                     # reset, variables, typography, global, layout,
│                             # components, animations, responsive, accessibility
│                             # + main.css, que os importa por esta ordem
├── js/                       # um módulo por responsabilidade — ver abaixo
├── html/
│   ├── components/           # preloader, header, menu, footer, cookie-banner
│   └── sections/              # hero, visit-info, highlights, exhibitions,
│                               # experiences, conservation, species,
│                               # recognition, news, plan-visit, newsletter
├── data/                      # content.json, exhibitions.json,
│                               # experiences.json, species.json, news.json
├── assets/
│   ├── images/, videos/       # vazios por agora — ver docs/ASSET_SOURCES.md
│   ├── svg/                   # favicon.svg e media-placeholder.svg (originais)
│   ├── logos/                 # vazio — ver docs/ASSET_SOURCES.md
│   └── fonts/                 # não usado: os tipos de letra vêm de node_modules
│                               # via @fontsource (ver docs/CREDITS.md)
└── docs/
    ├── DESIGN_SYSTEM.md, ANIMATIONS.md, ASSET_SOURCES.md, CREDITS.md
```

### Porque é que `data/*.json` existe a par de `html/sections/*.html`

Os ficheiros `html/sections/*.html` e `html/components/*.html` contêm a
**estrutura** de cada secção (semântica, hooks de animação, fallback
`<noscript>`). O **conteúdo** (textos, listas de exposições/experiências/
espécies/notícias, links de navegação e rodapé) vive só em `data/*.json` e
é injetado pelo `js/content.js` no arranque, antes de qualquer animação
correr. Isto evita ter o mesmo texto escrito em dois sítios: editar
conteúdo é sempre editar o JSON, nunca o HTML (ver secção seguinte).

## Como instalar

```bash
cd Oceanario_Lisboa_Redesign
npm install
```

## Como iniciar (desenvolvimento)

```bash
npm run dev
```

Abre em `http://localhost:5173/`.

## Como criar build de produção

```bash
npm run build     # gera dist/
npm run preview   # serve dist/ localmente para verificar o build
```

## Como substituir conteúdos

Todo o conteúdo editorial vem de `data/*.json`:

| Ficheiro | Conteúdo |
|---|---|
| `data/content.json` | Navegação, hero, quick-info, destaques, conservação, reconhecimento, planear visita, newsletter, contactos, redes sociais, rodapé |
| `data/exhibitions.json` | Painéis da narrativa horizontal de exposições |
| `data/experiences.json` | Cards de experiências |
| `data/species.json` | Cards da galeria de espécies |
| `data/news.json` | Cards de novidades |

Edite o campo relevante e corra `npm run dev`/`npm run build` — o
`js/content.js` volta a renderizar tudo a partir do JSON no arranque.
**Não** edite texto diretamente nos ficheiros `.html` de `html/sections/`;
esses ficheiros só têm elementos-contentor vazios (`data-*` hooks) para o
`content.js` preencher.

## Como adicionar imagens

**Sim, pode inserir as suas próprias imagens diretamente — não precisa de
pedir nem de tocar em código.** `js/content.js` procura, em build-time
(`import.meta.glob`), qualquer ficheiro real dentro de `assets/images/**`;
se encontrar um caminho que corresponda ao campo `image`/`media` de
`data/*.json`, usa-o automaticamente em vez do placeholder — sem precisar
de editar nenhum ficheiro `.js`.

1. Guarde o ficheiro em `assets/images/<secção>/`, com **exatamente** o
   nome já referido em `data/*.json` (e listado em
   `docs/ASSET_SOURCES.md`) — por exemplo, `assets/images/species/peixe-lua.jpg`
   para corresponder a `"image": "assets/images/species/peixe-lua.jpg"`
   em `data/species.json`. Formatos aceites: `.jpg`, `.jpeg`, `.png`,
   `.webp`, `.avif`.
2. Corra `npm run dev` (ou `npm run build`) outra vez. Pronto — assim que o
   Vite vir o ficheiro, esse cartão/painel passa a mostrar a imagem real; o
   atributo `data-pending-asset` desaparece automaticamente desse elemento.
3. Se preferir usar um nome de ficheiro diferente do sugerido, também pode
   — só precisa de atualizar o campo `image`/`media` correspondente em
   `data/*.json` para o caminho novo.
4. **Importante**: use apenas imagens sobre as quais tem direitos (suas
   próprias, ou fotografia oficial do Oceanário com autorização — ver
   `docs/ASSET_SOURCES.md` sobre porque é que este repositório não inclui
   fotografias reais por defeito).
5. Para vídeo de fundo no hero, `js/media.js` já tem a lógica pronta
   (`initVideoVisibility`, `initLazyVideoSources`) à espera de um
   `<video data-auto-pause data-lazy-src="…">` — só é preciso trocar o
   `<img>` estático em `html/sections/hero.html` por esse `<video>` (este
   caso, por ser único e não uma coleção repetida, não passa pelo mesmo
   mecanismo automático dos outros cartões).

## Como editar animações

- Tokens de duração/easing: `js/gsap-config.js` (`DURATION`, `EASE`).
- Timelines reutilizáveis (preloader, hero, cursor, magnético):
  `js/animations.js`.
- Tudo o que depende de `ScrollTrigger`/`matchMedia`: `js/scroll-effects.js`.
- Catálogo completo (trigger, duração, easing, comportamento mobile e
  reduced-motion de cada animação): `docs/ANIMATIONS.md`.

## Como desativar o smooth scroll

O Lenis só arranca quando `initSmoothScroll()` (`js/gsap-config.js`) é
chamado a partir de `js/main.js`. Para o desligar globalmente, remova essa
chamada em `boot()` — o `ScrollTrigger` continua a funcionar normalmente
com scroll nativo. O Lenis já se desativa sozinho quando
`prefers-reduced-motion: reduce` está ativo ou quando o dispositivo não
tem `(hover: hover) and (pointer: fine)` (a maioria dos táteis).

## Como testar responsividade

`npm run dev` e usar as ferramentas de dispositivo do browser nos
breakpoints documentados em `docs/DESIGN_SYSTEM.md`: 1440, 1280, 1024,
768, 390 e 320px. A narrativa horizontal de exposições muda de pin+scrub
para slider nativo com scroll-snap abaixo dos 900px (`gsap.matchMedia()`
em `js/scroll-effects.js`).

## Como testar redução de movimento

Ative "Reduzir movimento" nas preferências do sistema operativo (ou emule
`prefers-reduced-motion: reduce` nas DevTools do browser) antes de
carregar a página. Ver o contrato completo em `docs/ANIMATIONS.md`.

## Dependências

Ver `package.json`. Runtime: `gsap`, `lenis`,
`@fontsource/instrument-serif`, `@fontsource-variable/inter`.
Desenvolvimento: `vite`.

## Limitações conhecidas

- **Sem fotografia/vídeo real**: todas as imagens usam um placeholder
  vetorial local até existir autorização para usar media oficial — ver
  `docs/ASSET_SOURCES.md`.
- **Sem logótipo oficial**: o cabeçalho/rodapé usam um wordmark
  tipográfico, não o logótipo real do Oceanário.
- **Preços de bilhetes não incluídos**: os valores encontrados durante a
  pesquisa eram inconsistentes entre si e incluíam promoções sazonais já
  expiradas; a secção de bilhetes remete sempre para
  [tickets.oceanario.pt](https://tickets.oceanario.pt/) em vez de mostrar
  um número que podia estar errado.
- **Newsletter demonstrativa**: o formulário valida e mostra um estado de
  sucesso, mas não envia dados a nenhum servidor (sem backend) — ver o
  aviso no próprio formulário e `js/main.js` → `initNewsletterForm`.
- **Seletor de idioma**: a opção "EN" liga para a versão inglesa do
  website oficial (`oceanario.pt/en/`), já que este redesign existe apenas
  em português.
- Alguns detalhes não puderam ser confirmados durante a pesquisa (ex.:
  horário sazonal exato, cacifos/fraldário, o handle oficial de
  Instagram) — ver a lista completa em `docs/ASSET_SOURCES.md`.

## Créditos e fontes

Ver `docs/CREDITS.md` para tipografia, bibliotecas, e a distinção entre
conteúdo real (Oceanário de Lisboa) e referência de comportamento
(Georgia Aquarium).
