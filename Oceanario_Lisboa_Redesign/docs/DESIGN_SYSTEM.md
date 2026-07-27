# Sistema de Design — `DESIGN_SYSTEM.md`

Fonte de verdade: `css/variables.css`. Este documento anota o *porquê* de
cada decisão; os valores exatos vivem no CSS para evitar duas fontes de
verdade a divergir.

## Cores

```css
--color-background: #f1f1f1;   /* base clara — quase todas as secções "light" */
--color-navy:        #002056;  /* secções de impacto, texto, navegação, fundos escuros */

--color-lime:  #dafd6a;  /* acento primário — CTAs, eyebrows, hover states */
--color-pink:  #ff017f;  /* acento de alerta/foco — usado com moderação */
--color-green: #0dfc95; /* acento "fresco" — conservação, indicadores de sucesso */
```

**Regras aplicadas neste projeto:**

- `#f1f1f1` é a base de todas as secções "light" (`.section--light`,
  quick-info, experiências, espécies, novidades, planear visita).
- `#002056` é a base de todas as secções "dark" (hero, menu lateral,
  exposições, conservação, newsletter, footer, preloader).
- As três cores de acento **nunca aparecem todas na mesma secção**. Cada
  secção escura usa no máximo um acento dominante: `--color-lime` no hero
  e exposições, `--color-green` na conservação. `--color-pink` está
  reservado ao anel de foco de teclado (`--color-focus-ring`) e a estados
  de erro de formulário — é a cor menos usada visualmente, mais funcional.
- Não há gradientes decorativos genéricos. O único "gradiente" visual é o
  scrim de legibilidade sobre imagens (`linear-gradient` de navy
  transparente para opaco), que é funcional, não estético.
- Todas as combinações texto/fundo usadas cumprem AA do WCAG 2.1 (texto
  `#f1f1f1` sobre `#002056` ≈ 15.8:1; `#002056` sobre `#f1f1f1` é o mesmo
  rácio; `--color-lime` sobre `#002056` ≈ 13.9:1).

## Tipografia

- **Uma só família, dois papéis**: Poppins para tudo — títulos e corpo de
  texto partilham a mesma família, diferenciados por peso, não por
  tipo de letra.
  - **Títulos** (`h1`–`h6`, `.text-display-*`, wordmark, valores de
    destaque): Poppins **Extra Bold** (`--fw-extrabold`, 800). É o peso
    mais usado nos elementos que precisam de presença — incluindo
    números/valores de destaque (`.conservation__stat-value`,
    `.quick-info__value`) e o próprio logótipo tipográfico.
  - **Corpo/UI**: Poppins **Regular** (400) em parágrafos, **Medium**
    (500) em citações/itálicos (`.milestone__statement`), **Semibold**
    (600) em botões e etiquetas em caixa alta.
  - `h1`–`h6` sobrepõem o `overflow-wrap: break-word` defensivo do
    `reset.css` para `normal` + `word-break: keep-all` — combinado com
    `text-wrap: balance`, o peso Extra Bold tornou palavras longas
    (ex.: "compreendido") largas o suficiente para o algoritmo de
    balanceamento as partir a meio, o que lia mal; títulos são sempre
    prosa normal, nunca strings não-quebráveis, por isso quebrar só em
    limites de palavra é a opção mais segura aqui.
- Escala fluida via `clamp()` em `--fs-display-2xl` … `--fs-label` — nunca
  tamanhos fixos. Ver `css/variables.css` para os valores min/preferred/max
  de cada nível.
- `--measure: 62ch` limita a largura de leitura dos parágrafos longos.

## Espaçamento

Escala em `rem` de `--space-3xs` (0.25rem) a `--space-3xl` (9rem), mais
dois tokens fluidos (`--space-section`, `--space-container`) que crescem
com `clamp()` consoante o viewport — usados para o ritmo vertical entre
secções e o padding lateral do `.container`.

## Breakpoints

| Token conceptual | Largura | Ficheiro/bloco |
|---|---|---|
| Desktop grande | ≥1440px | Base (mobile-first cascade completa) |
| Desktop | ≤1280px | `responsive.css` primeiro bloco |
| Laptop | ≤1024px | `responsive.css` segundo bloco |
| Tablet | ≤768px | `responsive.css` terceiro bloco |
| Mobile (390/320) | ≤480px | `responsive.css` quarto bloco |

A mesma lista de larguras (900px como corte desktop/mobile para as
exposições) é usada em `gsap.matchMedia()` — ver `docs/ANIMATIONS.md`.

## Botões

- `.btn` — base: pill (`border-radius: pill`), `min-height: 44px` (alvo
  táctil mínimo em qualquer variante, incluindo `.btn-sm`), texto pode
  quebrar linha (nunca `white-space: nowrap`, para não forçar overflow
  horizontal com etiquetas longas em ecrãs estreitos — ver nota abaixo).
- `.btn-primary` / `.btn-accent` — preenchido, para a ação principal
  (bilhetes).
- `.btn-outline` — contorno, requer `.btn-on-light` ou `.btn-on-dark` para
  o hover inverter corretamente.
- `.btn-ghost` — sem fundo, para links secundários dentro de cards.
- `.icon-btn` — botão circular só com ícone (setas prev/next da galeria de
  espécies e do slider de reconhecimento); `.icon-btn--on-dark` para uso
  sobre fundo escuro.

> **Nota de robustez**: numa fase inicial de testes a 320px, `white-space:
> nowrap` na base de `.btn` — combinado com uma etiqueta longa
> ("Conhecer o trabalho de conservação") dentro de uma grid de 1 coluna —
> forçava a track da grid a exceder a largura do ecrã, porque o
> dimensionamento `auto` por omissão do CSS Grid não deixa uma track
> encolher abaixo do conteúdo não-quebrável do maior item. A correção foi
> dupla: remover `white-space: nowrap` da base de `.btn`, e adicionar
> `min-width: 0` aos filhos diretos de todos os containers grid/split do
> projeto (ver `css/layout.css`).

## Cards

Todos os cards partilham o mesmo vocabulário visual: `border-radius:
var(--radius-lg)`, imagem em `.media-frame`/`.*-card__media`, scrim de
legibilidade (`linear-gradient`) sobre a imagem, corpo posicionado sobre o
scrim. Variam no aspect-ratio e no que é revelado no hover:

- `.highlight-card` — 760.4:580, duas lado a lado a preencher a secção
  (sem carrossel, sem cabeçalho de secção), título+CTA sempre visíveis.
- `.exhibition-panel` — imagem + texto lado a lado (flex row), dentro da
  narrativa horizontal pinada. A imagem é dimensionada pela altura
  disponível (`height: 100%` + `aspect-ratio`), não pela largura — ver
  nota em `docs/ANIMATIONS.md` sobre o orçamento de altura do pin.
- `.experience-card` — 4:3, um parágrafo extra revela-se no hover/focus
  (desktop) mas está sempre visível em ecrãs sem hover (`@media (hover:
  none)` em `accessibility.css`).
- `.news-card` — 4:3, sem overlay — texto abaixo da imagem, estilo
  editorial simples.
- `.species-card` — 3:4. Dois modos, ver `docs/ANIMATIONS.md`: em ecrãs
  ≥900px com movimento ativo, a secção fica pinada e os cartões cruzam
  em opacidade/escala conforme o progresso do scroll (`.species--sticky`,
  `js/scroll-effects.js`); caso contrário, estado `.is-active`
  (opacidade/escala) controlado por `IntersectionObserver` num carrossel
  de arrastar nativo (`js/sliders.js`).

## Grid

`.container` (max-width 1600px, padding fluido) é a unidade de layout
principal. `.grid-2/3/4/12` e `.split` (duas colunas) cobrem os
layouts mais comuns; `min-width: 0` está garantido em todos os filhos
diretos destes containers (ver nota acima).

## Estados interativos

- **Foco de teclado**: `:focus-visible` com anel de 2px em
  `--color-focus-ring` (rosa) sobre fundo claro, `--color-lime` sobre
  fundo escuro — nunca `outline: none` sem substituto.
- **Hover**: sempre acompanhado de uma transição de
  `--dur-fast`/`--dur-base`, nunca instantâneo.
- **Disabled**: opacidade 0.35–0.5 + `pointer-events: none`.
- **Cursor contextual**: só ativo com `(hover: hover) and (pointer: fine)`
  — nunca em touch.
