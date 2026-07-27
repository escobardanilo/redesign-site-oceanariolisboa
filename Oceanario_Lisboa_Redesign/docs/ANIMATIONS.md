# Catálogo de Animações — `ANIMATIONS.md`

Tokens partilhados (`js/gsap-config.js`, espelhados em `css/variables.css`):

```js
EASE = { standard: 'power3.out', soft: 'power2.out', expo: 'expo.out', inOutSoft: 'sine.inOut', back: 'back.out(1.6)' }
DURATION = { instant: 0.15, fast: 0.3, base: 0.8, slow: 1.2, cinematic: 1.8 }
```

O ritmo varia por contexto de propósito: revelações de entrada usam
`expo.out` (chegada rápida, assentamento suave); microinterações usam
`power2.out`/`power3.out` (mais neutras); nada usa a mesma
duração/easing em todo o site — ver a tabela abaixo.

## Contrato de `prefers-reduced-motion`

Aplicado em três camadas independentes (nenhuma depende só das outras):

1. **CSS** (`animations.css`): `@media (prefers-reduced-motion: reduce)`
   força `animation-duration`/`transition-duration` a `0.01ms` global e
   remove o `transform` estático do hero.
2. **Classe no `<html>`** (`js/gsap-config.js`): observa a media query e
   alterna `html.reduced-motion`, para o CSS reagir mesmo que o JS de
   animação ainda não tenha corrido, e para os módulos JS lerem
   `isReducedMotion()` a qualquer momento.
3. **JS/GSAP**: cada timeline neste catálogo tem um ramo explícito para
   `isReducedMotion() === true` — nunca assume que a camada CSS chega a
   tempo de anular uma timeline já iniciada.

Quando ativo: smooth scroll (Lenis) não arranca, pinning é substituído por
scroll nativo, parallax e zoom são desativados, e todas as entradas
passam a um fade rápido (`DURATION.fast` ou menos) sem deslocamento.

## Catálogo

| Nome | Elemento(s) | Trigger | Duração | Easing | Mobile | Reduced motion |
|---|---|---|---|---|---|---|
| Preloader progress | `[data-preloader-fill]`, `[data-preloader-count]` | Boot (`main.js` → `runPreloader`) | ~1.5s simulado + até `window.load`/timeout 2.4s | `power1.inOut` | Igual | Timeout reduzido a 0.35s, sem tween percetível |
| Preloader exit | `[data-preloader]` | Fim do progress | `DURATION.cinematic * 0.5` (0.8s) | `expo.out` | Igual | Fade simples 0.3s (sem clip-path) |
| Header drop-in | `[data-site-header]` | Fim do preloader | `DURATION.base` (0.8s) | `expo.out` | Igual | Sem animação (estado final imediato) |
| Hero media settle-zoom | `img/video` dentro de `[data-hero-media]` | Fim do preloader | `DURATION.cinematic` (1.8s) | `power2.out` | Igual (não estático — ver nota) | Desativado |
| Hero title line reveal | `[data-hero-line] > span` | Fim do preloader | `DURATION.slow` (1.2s), stagger 0.12s | `expo.out` | Igual | Estado final imediato |
| Hero stagger (subtítulo/CTA/factos) | `[data-hero-animate]` | Fim do preloader | `DURATION.base`, stagger 0.08s | `expo.out` | Igual | Estado final imediato |
| Scroll cue pulse | `.hero__scroll-cue` | CSS-only, contínuo | 2.4s loop | `sine.inOut` | Igual | Removido (`animation: none`) |
| Header scroll state | `[data-site-header]` | `ScrollTrigger` (`top -80`) | Transição CSS 0.6s | `standard` (cubic-bezier) | Igual | Igual (é uma toggleClass, não movimento) |
| Hero parallax | `[data-hero-media]` | Scroll dentro do hero, `scrub: true` | Ligado ao scroll | linear (`ease:none`, é scrub) | Ativo (subtil) | Desativado |
| Divisor "quick-info" | `.divider` | `ScrollTrigger` (`top 80%`, once) | 1s | `expo.out` | Igual | `scaleX` final imediato (regra CSS global reduz duração) |
| Reveal genérico `[data-reveal]` | Cards de destaques, experiências, notícias | `ScrollTrigger.batch` (`top 85%`, once) | `DURATION.base`, stagger 0.1s | `standard` | Igual | Duração cortada para `DURATION.fast`, sem deslocamento Y, sem stagger |
| Exposições — pin horizontal | `[data-exhibitions-pin]` + `[data-exhibitions-track]` | `ScrollTrigger` pin+scrub (`gsap.matchMedia`, ≥900px) | Ligado ao scroll (`scrub: 0.8`) | linear | **Substituído** por slider nativo com scroll-snap (`<900px` ou reduced motion) | Cai automaticamente no modo slider |
| Conservação — título/texto | `[data-conservation-title]`, parágrafos | `ScrollTrigger` (`top 70%`, once) | 0.9s / 0.7s stagger 0.12s | `expo.out` | Igual | 0.3s/0.2s, sem deslocamento |
| Conservação — imagem clip-path | `[data-conservation-media]` | Mesmo trigger, timeline conjunta | 1.3s | `expo.out` | Igual | 0.3s, sem clip inicial |
| Conservação — contador | `[data-count-to]` | `ScrollTrigger` (`top 85%`, once) por stat | `DURATION.cinematic` (1.8s) | `power2.out` | Igual | 0.4s |
| Espécies — sticky scroll (desktop) | `[data-species-pin]`, `.species-card` | `ScrollTrigger` pin+scrub (`gsap.matchMedia`, ≥900px, motion ativo) | Ligado ao scroll (`scrub: 0.6`), ~500px de scroll por espécie | linear (scrub) + `closeness³` para o nome/latim | **Substituído** pelo modo drag nativo (`<900px`) | Cai automaticamente no modo drag nativo |
| Espécies — galeria (drag/estado ativo) | `.species-card` | Pointer drag, scroll nativo, teclado | Transições CSS 0.6s (opacidade/escala) | `expo.out` (CSS) | Modo por omissão (swipe nativo + botões prev/next) | `scrollTo` usa `behavior:'auto'`, sem swipe momentum extra |
| Reconhecimento — slider | `.milestone` | Clique/dots/autoplay 7s | Transição CSS (`display` toggle, sem tween) | — | Igual | Autoplay desativado |
| Menu — máscara de entrada | `[data-menu]` (clip-path) | Clique no `[data-menu-toggle]` | `DURATION.slow` (1.2s) | `expo.out` | Igual | `clip-path` final imediato |
| Menu — stagger dos itens | `[data-menu-link]` | Mesma timeline, offset `-=0.55` | `DURATION.base`, stagger 0.055s | `expo.out` | Igual | Sem deslocamento |
| Menu — rodapé | `[data-menu-footer-anim]` | Mesma timeline, offset `-=0.35` | `DURATION.fast` | `expo.out` | Igual | Sem deslocamento |
| Botões magnéticos | `[data-magnetic]` | `mousemove`/`mouseleave` | `gsap.quickTo`, 0.6s | `power2.out` | Desativado (requer `hover:hover` e `pointer:fine`) | Desativado |
| Cursor contextual | `.cursor-dot` | `pointermove` + `[data-cursor-explore]` | `gsap.quickTo`, 0.45s | `power2.out` | Desativado (mesmo motivo) | Desativado |
| Cookie banner — saída | `[data-cookie-banner]` | Clique em aceitar/recusar | `DURATION.fast` | GSAP `to` (default) | Igual | Instantâneo, sem deslocamento (curta o suficiente para não necessitar de ramo próprio) |

### Nota sobre o "zoom" da hero

A imagem/vídeo de fundo do hero **não** tem uma transformação de escala em
repouso — só a timeline de entrada (`runHeroIntro`) aplica um
`gsap.from(media, { scale: 1.1 → 1 })` transitório que termina em
`scale(1)`. Isto não é só estilístico: um `transform: scale()` estático
sobre esta camada full-bleed foi verificado, durante os testes a 320px, a
fazer `document.documentElement.scrollWidth` exceder o viewport mesmo com
`overflow: hidden` em todos os antecessores — o Chromium continua a
contar os limites visuais pós-transformação para o "scrollable overflow"
neste caso. Ver `css/components.css` (comentário em `.hero__media`).

### Nota sobre o orçamento de altura das exposições

`[data-exhibitions-pin]` fica com `height: 100svh` e `display: flex;
flex-direction: column`, dividido entre o bloco de cabeçalho (`flex: 0 0
auto`, altura natural) e a faixa de painéis (`flex: 1 1 auto`, ocupa o
resto). A imagem de cada painel (`.exhibition-panel__media`) segue
`height: 100%` + `aspect-ratio`, isto é, a altura vem do espaço que
sobra depois do cabeçalho, e a largura é derivada — nunca o inverso.

Isto corrige um bug em que a imagem media ficava quase invisível durante
o scroll pinado: o painel usava `aspect-ratio: 4/5` a partir de uma
largura fixa em `vw`, e o bloco de cabeçalho não tinha orçamento de
altura nenhum (a `.section-header__copy` partilhada tem `max-width:
44ch`, mas herda o `font-size` de 16px do próprio `div`, não do `h2`
lá dentro — a 64px de Poppins Extra Bold isso são ~440px de largura,
o suficiente para partir "Um só oceano, quatro habitats" em quatro
linhas curtas). Título e imagem juntos exigiam mais altura do que
qualquer viewport de portátil tinha para dar, empurrando a imagem quase
inteira para fora do ecrã. A correção teve três partes: `max-width:
none` no título só dentro de `.exhibitions__head` (não no seletor
partilhado, para não afetar outras secções), `.exhibition-panel__title`
a usar `--fs-display-md` em vez de `--fs-display-lg` (era o token
errado — `--fs-display-lg` é para títulos de secção, não de card), e a
imagem a herdar altura do espaço sobrante em vez de a impor a partir da
largura. Testado em alturas de viewport de 768px a 1080px (900px de
largura, o corte do `matchMedia` do modo pin) sem cortar o CTA.

Essa gama de teste (768–1080px) escondeu um segundo bug do mesmo
género: abaixo de ~700px de altura, o próprio bloco de copy de cada
painel (índice + eyebrow + título + texto + CTA) passou a exceder a
altura que a imagem lhe deixava, e `.exhibitions__pin` tem
`overflow: hidden`. Com `.exhibition-panel__copy` em `justify-content:
center`, esse excesso partia-se a meio — e a metade de baixo, cortada,
era exatamente o botão CTA. A causa de fundo era outra vez um
`max-width` em `ch` a ignorar o contentor real:
`.exhibition-panel__text` tinha `max-width: 46ch` (~460px) num
contentor de ~700px, obrigando o parágrafo a 4–5 linhas quando cabia em
3–4 na largura disponível. Correção: sem `max-width` em
`.exhibition-panel__text` no modo pin (a coluna já vem limitada pela
largura do painel, tal como o título), `justify-content: flex-end` em
vez de `center` (se ainda faltar altura nalgum extremo, é o
índice/eyebrow a perder espaço, nunca o CTA), e um `max-width: 58ch`
reposto só em `.exhibitions--slider .exhibition-panel__text`, onde o
modo slider empilha media sobre copy sem essa coluna estreita e um
parágrafo a toda a largura do cartão ficaria demasiado comprido para
ler. Testado sem overflow em alturas de 600px a 1080px.

### Nota sobre o sticky scroll das espécies

Em vez de uma timeline com passos de duração fixa, o modo pinado usa
`self.progress` do `ScrollTrigger` para calcular um "índice virtual"
(`progress × (n − 1)`) e define a opacidade de cada cartão como
`clamp(1 − |índice_virtual − i|, 0, 1)` — um crossfade contínuo,
diretamente amarrado à posição de scroll, não a uma animação a decorrer
sozinha. O nome/nome científico usa `closeness³` em vez do valor linear:
dois nomes de espécies parcialmente visíveis ao mesmo tempo leem-se mal
(texto sobreposto), onde duas fotografias parcialmente cruzadas continuam
legíveis — por isso o texto "aparece"/"desaparece" de forma mais abrupta
do que a imagem. Os botões prev/next e as setas do teclado chamam
`ScrollTrigger.scrollTo`-equivalente (via Lenis ou `window.scrollTo`)
para a posição de scroll correspondente ao passo pretendido, lendo
sempre `trigger.progress` ao vivo em vez de guardar um índice à parte,
para nunca dessincronizar de scroll livre.

### Nota sobre o "scatter to grid" das novidades

Os 5 cartões de `.news__grid` arrancam sobrepostos ao centro da grelha —
deslocados, rodados, a 0.8× de escala — e o scroll dispersa-os até à
posição CSS real de cada um (`initNewsScatter`, `scroll-effects.js`),
com `stagger: { each: 0.2, from: 'random' }` para que não cheguem todos
ao mesmo tempo. O deslocamento inicial de cada cartão vem de
`offsetLeft`/`offsetTop` relativos a `.news__grid` (por isso a grelha
precisa de `position: relative` — ver `components.css`), não de
`getBoundingClientRect()`: aqueles refletem só a posição no fluxo do
layout, nunca o transform que o GSAP está a aplicar, pelo que
`invalidateOnRefresh: true` pode voltar a medir a meio do scrub (ex.: um
resize que muda a grelha de 3 para 2 colunas) sem que o novo cálculo
seja contaminado pela posição intermédia em que o scrub já ia.

O intervalo do `ScrollTrigger` (`top 85%` → `bottom 65%`) está amarrado
à altura da própria grelha, não a percentagens fixas do viewport: uma
grelha com duas linhas (5 cartões em 3 colunas) precisa de mais
distância de scroll para revelar a segunda linha do que uma com todos
os cartões numa única linha. Uma primeira tentativa com percentagens
fixas do viewport (`center 80%` → `center 15%`) deixava a segunda linha
ainda a meio caminho muito depois de a grelha já ter saído da zona
confortável do ecrã.

## Limpeza e performance

- `ScrollTrigger.batch` é usado para revelações repetidas em vez de um
  `ScrollTrigger` por elemento.
- `gsap.matchMedia()` devolve funções de cleanup em cada contexto
  (exposições) — chamadas automaticamente pelo GSAP quando a media query
  deixa de corresponder, sem necessidade de as gerir manualmente.
- `ScrollTrigger.refresh()` corre após `document.fonts.ready` e após o
  evento `load`, para recalcular posições depois de tipos de letra/imagens
  assentarem (`scroll-effects.js` → `refreshOnSettle`).
- Nenhuma animação usa propriedades que desencadeiem layout thrashing
  (só `transform`/`opacity`/`clip-path`, exceto o `width` da barra de
  progresso, que é intencionalmente simples e pouco frequente).
