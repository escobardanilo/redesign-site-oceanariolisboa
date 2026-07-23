# Créditos — `CREDITS.md`

## Estatuto do projeto

Este é um **redesign conceptual e não-oficial** do website do Oceanário de
Lisboa, criado como exercício de front-end/UX. Não é propriedade do
Oceanário de Lisboa nem da Fundação Oceano Azul, não está afiliado a
nenhuma das duas entidades, e não deve ser confundido com o website
oficial: **[oceanario.pt](https://www.oceanario.pt/)**.

## Conteúdo

- Factos institucionais (exposições, experiências, espécies, conservação,
  horário, localização, contactos, redes sociais) foram reconstruídos a
  partir de pesquisa sobre o website oficial do Oceanário de Lisboa e da
  Fundação Oceano Azul — ver `docs/ASSET_SOURCES.md` para a metodologia e
  limitações dessa pesquisa, incluindo os pontos que não puderam ser
  confirmados.
- Todo o texto editorial (títulos, ligações entre secções, descrições) foi
  escrito de raiz para este projeto — não é uma cópia do texto de marketing
  do website oficial.
- A secção "Reconhecimento" (`html/sections/recognition.html`) substitui
  intencionalmente os testemunhos de visitantes pedidos no briefing
  original: não foi possível confirmar nenhum testemunho real através das
  fontes disponíveis, e o briefing pede explicitamente para não inventar
  conteúdo nem alterar o sentido de testemunhos reais. Em vez de os
  inventar, esta secção usa factos institucionais verificados (ver
  `data/content.json` → `recognition`).
- As frases "O oceano começa aqui" e "Há sempre um novo motivo para voltar"
  usadas no hero e na secção de destaques foram fornecidas no briefing
  deste projeto.

## Direção de interação

O ritmo de animação, a navegação e a sensação de profundidade têm como
referência de **comportamento** — não de conteúdo, texto, imagens ou
identidade visual — o website do Georgia Aquarium
([georgiaaquarium.org](https://www.georgiaaquarium.org/)). Nenhum código,
imagem, vídeo, texto ou elemento de marca do Georgia Aquarium foi copiado
ou incluído neste projeto.

## Tipografia

Auto-hospedada via [Fontsource](https://fontsource.org/) (pacotes npm),
sem hotlinking a serviços de terceiros:

- **Poppins** — usado tanto para títulos (peso Extra Bold) como para
  corpo de texto/UI (pesos Regular a Semibold), licença
  [SIL Open Font License 1.1](https://fonts.google.com/specimen/Poppins/about).

## Bibliotecas e ferramentas

| Biblioteca | Uso | Licença |
|---|---|---|
| [GSAP](https://gsap.com/) (+ ScrollTrigger) | Motor de animação | Licença GreenSock (gratuita desde a aquisição pela Webflow) |
| [Lenis](https://github.com/darkroomengineering/lenis) | Smooth scroll | MIT |
| [Vite](https://vite.dev/) | Servidor de desenvolvimento e build | MIT |

## Media visual

Ver `docs/ASSET_SOURCES.md` para o registo completo de fotografias/vídeos
pendentes e para os dois assets vetoriais originais (`favicon.svg`,
`media-placeholder.svg`) criados especificamente para este projeto.

## IA generativa

Nenhuma imagem, vídeo ou fotografia foi gerada por inteligência artificial
neste projeto. O código foi escrito com assistência de um agente de IA
(Claude Code), mas todo o conteúdo visual usa apenas placeholders
vetoriais originais ou (quando adicionado no futuro) fotografia oficial
licenciada — nunca imagens sintéticas.
