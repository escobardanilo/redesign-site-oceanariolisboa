# Fontes de Media — `ASSET_SOURCES.md`

Este documento regista, para cada media usado (ou pendente) neste redesign
conceptual, a origem, o tipo, a secção onde é usado e o estado de autorização.

## Porque é que não há fotografias nem vídeos reais neste repositório

O briefing deste projeto pede explicitamente para **não gerar imagens com IA**
e para **não usar fotografias/vídeos do Georgia Aquarium**, mas também define
um procedimento claro para quando um ficheiro oficial "não possa ser
utilizado legalmente ou descarregado": usar um *placeholder* neutro,
comentar claramente qual o media oficial em falta, e registar a pendência
aqui. É exatamente esse o caminho seguido em todo o projeto:

- As fotografias e vídeos publicados em oceanario.pt são propriedade do
  Oceanário de Lisboa / Fundação Oceano Azul. Fazer scraping em massa desses
  ficheiros e redistribuí-los dentro de um repositório de um redesign
  **não-oficial** não tem autorização documentada, mesmo tratando-se de um
  exercício conceptual — por isso não foram descarregados.
- O logótipo oficial do Oceanário é uma marca registada; recriá-lo ou
  imitá-lo num redesign não-oficial seria enganoso. Por isso este projeto usa
  apenas um **wordmark tipográfico** ("Oceanário de Lisboa" no tipo de
  letra de display) em vez de qualquer logótipo.
- Em vez disso, todas as imagens usam um **SVG placeholder original**
  (`assets/svg/media-placeholder.svg`), criado de raiz para este projeto —
  um padrão abstrato de linhas onduladas, não uma fotografia nem uma imagem
  gerada por IA — com `alt` real e um atributo `data-pending-asset` que
  indica exatamente que ficheiro deve substituir cada placeholder.

## Como substituir um placeholder por media real

1. Obtenha autorização para o ficheiro em causa (fotografia própria, ou
   fotografia oficial do Oceanário de Lisboa / Fundação Oceano Azul com
   permissão).
2. Guarde o ficheiro em `assets/images/<secção>/` ou `assets/videos/<secção>/`
   com **exatamente** o nome de ficheiro indicado na coluna "Ficheiro
   previsto" abaixo — `js/content.js` procura automaticamente esse caminho
   e usa-o em vez do placeholder assim que existir (`npm run dev`/`build`
   outra vez). Só é preciso editar `data/*.json` se quiser usar um nome de
   ficheiro diferente do sugerido — ver README.md → "Como adicionar imagens".
3. Atualize esta tabela: mude "Pendente" para "Autorizado" e adicione o
   crédito exigido pelo detentor dos direitos.

## Registo de pendências

### Hero

| Ficheiro previsto | Tipo | Secção | Página de origem | Estado |
|---|---|---|---|---|
| `assets/videos/hero/tanque-central.mp4` (ou imagem estática de fallback) | Vídeo/Imagem | Hero | oceanario.pt (homepage) | Pendente — formato real (vídeo vs. fotografia) não confirmado; ver nota de pesquisa abaixo |

### Exposições

| Ficheiro previsto | Secção | Página de origem | Estado |
|---|---|---|---|
| `assets/images/exhibitions/um-planeta-um-oceano.jpg` | Exposições (permanente) | oceanario.pt/en/exhibitions/aquarium/ | Pendente |
| `assets/images/exhibitions/monstros-marinhos.jpg` | Exposições / Destaques | oceanario.pt/exposicoes/monstros-marinhos/ | Pendente |
| `assets/images/exhibitions/universo-submerso.jpg` | Exposições / Destaques | oceanario.pt/universo-submerso-nova-exposicao/ | Pendente |

### Experiências

| Ficheiro previsto | Página de origem | Estado |
|---|---|---|
| `assets/images/experiences/dormir-com-tuboroes.jpg` | oceanario.pt/en/activities/sleeping-with-sharks/ | Pendente |
| `assets/images/experiences/visitas-guiadas.jpg` | oceanario.pt/visitas-guiadas/ | Pendente |
| `assets/images/experiences/oceano-60-minutos.jpg` | oceanario.pt/experiencias/familias/oceano-em-60-minutos/ | Pendente |
| `assets/images/experiences/telecabine.jpg` | oceanario.pt/en/buy-tickets/combined-ticket/ | Pendente |
| `assets/images/experiences/visitas-escolares.jpg` | oceanario.pt/programas/escolas/visitas-de-estudo/programas-no-oceanario/ | Pendente |
| `assets/images/experiences/aniversarios.jpg` | oceanario.pt (secção de programas) | Pendente |

### Espécies

| Ficheiro previsto | Espécie | Estado |
|---|---|---|
| `assets/images/species/peixe-lua.jpg` | Peixe-lua (*Mola mola*) | Pendente |
| `assets/images/species/lontra-marinha.jpg` | Lontra-marinha (*Enhydra lutris*) | Pendente |
| `assets/images/species/tubarao-touro.jpg` | Tubarão-touro (*Carcharias taurus*) | Pendente |
| `assets/images/species/raia-manta.jpg` | Raia-manta (*Mobula* spp.) | Pendente |
| `assets/images/species/enguia-jardim.jpg` | Enguia-jardim (*Heteroconger hassi*) | Pendente |
| `assets/images/species/medusa.jpg` | Medusa | Pendente |
| `assets/images/species/coral.jpg` | Coral | Pendente |

Todas as fontes: oceanario.pt/en/exhibitions/aquarium/species/

### Conservação

| Ficheiro previsto | Página de origem | Estado |
|---|---|---|
| `assets/images/conservation/centro-sobrevivencia-especies.jpg` | oceanario.pt/en/conservation/ | Pendente |

### Novidades

| Ficheiro previsto | Página de origem | Estado |
|---|---|---|
| `assets/images/news/universo-submerso.jpg` | oceanario.pt/universo-submerso-nova-exposicao/ | Pendente |
| `assets/images/news/monstros-marinhos.jpg` | oceanario.pt/exposicoes/monstros-marinhos/ | Pendente |
| `assets/images/news/florestas-submersas.jpg` | oceanario.pt/florestas-submersas/ | Pendente |
| `assets/images/news/rock-in-rio.jpg` | oceanario.pt/oceanario-lisboa-rock-in-rio-lisboa-2026/ | Pendente |
| `assets/images/news/dia-mundial-oceano.jpg` | oceanario.pt/dia-mundial-oceano/ | Pendente |

### Planear visita / Menu

| Ficheiro previsto | Secção | Página de origem | Estado |
|---|---|---|
| `assets/images/visit/mapa-acesso.jpg` | Planear visita (mapa) | oceanario.pt/en/visit/plan-your-visit/how-to-get-there/ | Pendente |
| `assets/images/visit/planeie-a-visita.jpg` | Visual do menu — "Planear Visita" | oceanario.pt/en/plan-your-visit/ | Pendente |

### Logótipo

| Ficheiro previsto | Estado |
|---|---|
| `assets/logos/` (vazio, propositadamente) | Pendente — requer o pacote de marca oficial do Oceanário/Fundação Oceano Azul. Até lá, o cabeçalho e rodapé usam um wordmark tipográfico ("Oceanário de Lisboa"), não uma recriação do logótipo. |

## Assets originais já incluídos (não pendentes)

| Ficheiro | Tipo | Origem | Nota |
|---|---|---|---|
| `assets/svg/media-placeholder.svg` | SVG vetorial original | Criado para este projeto | Padrão abstrato de ondas — usado como `src` de todo o `<img>` até existir a fotografia oficial correspondente |
| `assets/svg/favicon.svg` | SVG vetorial original | Criado para este projeto | Marca abstrata, não uma cópia do logótipo oficial |
| Tipografia (Instrument Serif, Inter) | Tipo de letra | Google Fonts, via pacotes `@fontsource` (licença SIL OFL) | Auto-hospedado através do npm — ver `docs/CREDITS.md` |

## Nota sobre a pesquisa de conteúdos

O acesso automático (`fetch`) a oceanario.pt e a georgiaaquarium.org foi
bloqueado (HTTP 403) durante a investigação para este projeto; todo o
conteúdo textual real foi reconstruído a partir de resultados de pesquisa
(motores de busca), não da leitura direta das páginas — incluindo o formato
exato do media da hero (vídeo vs. fotografia), que **não pôde ser
confirmado**. Preços de bilhetes encontrados nas pesquisas eram
inconsistentes entre si e incluíam promoções sazonais já expiradas à data
de hoje, pelo que **nenhum valor de preço foi incluído neste redesign** — a
secção de bilhetes remete sempre para o canal oficial
(tickets.oceanario.pt). Antes de qualquer publicação real deste projeto,
recomenda-se confirmar manualmente, no site oficial: horário sazonal exato,
preços atuais, e a lista de comodidades (cacifos, fraldário) que não foi
possível verificar.
