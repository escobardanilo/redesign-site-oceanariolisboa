# FIZZ — Aula 01: Fundação do arquivo e Wireframe de Baixa Fidelidade

> Projeto: **FIZZ** — assistente de IA conversacional
> Plataformas (fase 1): **iOS e Android**. Web depois.
> Etapa atual: **Wireframe Lo-Fi no Figma**
> Próximas etapas: Wireframe Hi-Fi (cor + tipografia) → Protótipo interativo

---

## 1. Leitura crítica do wireframe do Miro

O que você desenhou (da esquerda pra direita):

| # | Tela | Função aparente |
|---|------|-----------------|
| 1 | Splash com a "blob" (mascote) | Abertura da marca |
| 2 | Login social (apple / google / facebook) + botão circular "I DON'T WANT" | Autenticação |
| 3 | Campo "your name" com voltar e a blob embaixo | Onboarding / personalização |
| 4 | Botão "get started" | Entrada no produto |
| 5 | Chat: header "space hour and transmition", menu hambúrguer, input "Ask Fizz" com `+` e ícone de voz | Tela principal |

### O que já está certo
- **Você começou pelo fluxo, não pela tela bonita.** É exatamente a ordem correta.
- **A tela 5 tem a anatomia certa de um app de IA**: header com histórico, área de conversa, input persistente embaixo com anexo (`+`) e voz. Isso é o padrão consolidado (ChatGPT, Claude, Gemini, Perplexity) — e padrão consolidado em IA conversacional é bom, porque o usuário não deveria gastar energia aprendendo a interface, e sim conversando.
- **Você previu uma saída sem conta** ("I DON'T WANT"). A intenção está certíssima. A execução, não (ver abaixo).

### Os 3 problemas que precisam ser resolvidos AGORA

**Problema 1 — A ordem do fluxo está invertida (o mais grave).**
Hoje: `Splash → Login → Nome → Get Started → Chat`.
Você está pedindo login **antes** de mostrar valor. Isso é o assassino número 1 de ativação em apps de IA. O usuário baixou o app, não sabe o que o Fizz faz, e a primeira coisa que vê é um paywall de identidade.

Ordem recomendada:
```
Splash → Value Prop / Get Started → [Chat com 1ª pergunta grátis] → Login (no momento certo) → Nome → Chat completo
```
ou, versão mais conservadora e ainda muito melhor que a atual:
```
Splash → Value Prop (Get Started) → Login (com "continuar sem conta") → Nome → Chat
```
Regra que eu quero que você memorize: **"mostre valor antes de pedir compromisso"**. Login é compromisso. Nome é compromisso. Ambos vêm depois da promessa.

**Problema 2 — O "I DON'T WANT" é um antipadrão.**
Três defeitos: (a) é um botão circular grande, com peso visual quase igual ao dos botões de login — competição de hierarquia; (b) o texto é negativo e ambíguo ("não quero" o quê?); (c) não comunica a **consequência** de pular.
Correção: vira um **link de texto discreto**, abaixo dos botões, com rótulo positivo e consequência explícita:
> `Continuar sem conta` · *seu histórico não será salvo*

**Problema 3 — Faltam os estados, não só as telas.**
Um wireframe de app de IA que só mostra "a tela do chat" está incompleto. Chat tem no mínimo 4 estados visuais distintos: vazio, digitando/enviado, **respondendo (streaming)**, e erro. Designer júnior desenha telas; designer de produto desenha **estados**. É aqui que você vai se diferenciar.

### Ajustes menores (anote, mas não trave)
- **Tela 2:** o divisor "Continue" no topo está órfão. O padrão é ficar **entre** o método primário (e-mail/telefone) e os sociais, com o rótulo `ou continue com`. E você não tem e-mail/telefone — decida se o Fizz é social-only (aceitável) ou não.
- **Tela 3:** campo sem label, sem botão de avanço visível, sem indicador de progresso. Um input solto no meio da tela deixa o usuário sem saber quantos passos faltam.
- **Tela 3 vs. 2:** o `<-` só existe na tela 3. Consistência de navegação é contrato — se uma tela de onboarding tem voltar, todas têm.
- **Tela 5:** `"space hour and transmition"` como título — defina o que esse header é: título da conversa ativa? Então precisa de hierarquia clara: **menu (esquerda) · título (centro) · nova conversa (direita)**.
- **A blob (mascote):** decida o papel dela antes do Hi-Fi. Ela é (a) logo, (b) mascote com personalidade, ou (c) **indicador de estado** (pensando / ouvindo / falando)? A opção (c) é a mais poderosa para IA e é o que daria identidade real ao Fizz. Aparece na 1 e na 3 — não pode ser decorativa.

---

## 2. Antes do pixel: defina o produto em 3 linhas

Não abra o Figma sem responder isto. Escreva no próprio arquivo (página `00 Cover`).

1. **Frase de posicionamento:** "Fizz é um(a) _______ para _______ que precisa _______, diferente de _______ porque _______."
2. **Job to be done principal:** qual é a UMA tarefa que o usuário abre o Fizz para fazer? (Se a resposta for "tudo", você não tem produto — tem uma caixa de texto.)
3. **Diferencial de interface:** o que o Fizz faz na tela que o ChatGPT não faz? (voz-first? memória visível? personalidade? nichado em algum domínio?)

O item 3 é o que vai justificar o mascote, a paleta e o hi-fi depois. Sem ele, o Hi-Fi vira "ChatGPT com outra cor".

---

## 3. Especificações técnicas (decorar / consultar sempre)

### Frames (artboards)
| Plataforma | Tamanho base | Observação |
|---|---|---|
| **iOS** | **393 × 852** (iPhone 16 / 15 / 14 Pro) | Desenhe **aqui primeiro** |
| iOS grande | 402 × 874 (iPhone 16 Pro) | só para checar respiro |
| **Android** | **360 × 800** dp (base) | Pixel 9 = 412 × 916 |

Desenhe em **iOS 393×852** e depois adapte para Android. Adaptar iOS→Android é mais fácil que o contrário (Android tem mais largura útil e menos safe area).

### Safe areas (não coloque nada clicável aqui)
- iOS: **59 pt** no topo (status bar + Dynamic Island), **34 pt** embaixo (home indicator).
- Android: **24 dp** status bar, **24 dp** barra de gestos (ou 48 dp se botões).

### Toque e espaçamento
- Alvo mínimo de toque: **44 × 44 pt** (iOS HIG) / **48 × 48 dp** (Material 3). Use **48** como regra única para os dois — resolve os dois.
- **Grid de 8 pt** para tudo. 4 pt só para ajustes finos (ícone/label).
- Margem lateral do conteúdo: **16 px** (padrão) ou **20/24 px** (mais respirado, boa escolha para um app de IA calmo).
- Tamanho mínimo de texto de corpo: **16 px**. Nunca menos que 12 px em nada.

### Layout grid no Figma (aplicar em todo frame mobile)
- Columns: **4**, margin **16**, gutter **16**, stretch.
- Rows (opcional): height **8**, count auto.

---

## 4. Estrutura do arquivo Figma

Nome do arquivo: **`FIZZ — Mobile (iOS/Android)`**

Páginas (crie exatamente nesta ordem — o `0X` mantém ordenado):

```
00 · Cover              → capa + posicionamento + status do projeto
01 · Research & Refs    → prints de ChatGPT, Claude, Gemini, Perplexity, Character.ai
02 · User Flow          → o mapa do fluxo (setas + caixas)
03 · Wireframes Lo-Fi   → ONDE VOCÊ TRABALHA AGORA
04 · Wireframes Hi-Fi   → depois
05 · Design System      → cores, tipografia, componentes (depois)
06 · Prototype          → ligações interativas (depois)
07 · Archive            → o que morreu, mas você não quer apagar
```

### Regras de disciplina para o Lo-Fi (isto separa amador de profissional)
1. **Zero cor.** Só preto, branco e 3 tons de cinza. Cor no lo-fi é o jeito mais rápido de discutir a coisa errada.
2. **Uma fonte só, sem estilizar.** Inter ou Roboto, regular/medium. Sem sombra, sem gradiente, sem raio de canto artístico.
3. **Auto Layout desde já.** Todo botão, todo campo, toda lista. Sim, dá trabalho agora; economiza dias depois.
4. **Componentize cedo:** `Status Bar`, `Top Bar`, `Button / Primary`, `Input Field`, `Message Bubble`, `Home Indicator`. Se você vai repetir 3×, vira componente.
5. **Nomeie os frames com prefixo numérico:** `01 Splash`, `02 Value Prop`, `03 Auth`… O Figma ordena sozinho e o protótipo fica legível.
6. **Texto real, nunca lorem ipsum.** Escreva a pergunta que o usuário faria de verdade. Copy ruim esconde fluxo ruim.

---

## 5. As telas do Lo-Fi — as 5 suas + as que faltam

### Fluxo recomendado (desenhe isto na página `02 · User Flow`)

```
                     ┌──────────────┐
                     │ 01 Splash    │
                     └──────┬───────┘
                            ▼
                     ┌──────────────┐
                     │ 02 Value Prop│  ("get started")
                     └──────┬───────┘
                            ▼
                     ┌──────────────┐      "continuar sem conta"
                     │ 03 Auth      │──────────────────┐
                     └──────┬───────┘                  │
                            ▼                          │
                     ┌──────────────┐                  │
                     │ 04 Seu nome  │                  │
                     └──────┬───────┘                  │
                            ▼                          ▼
                     ┌─────────────────────────────────────┐
                     │ 05 Chat — estado VAZIO              │
                     └──────┬──────────────────────────────┘
                            ▼
              ┌─────────────┼─────────────┬──────────────┐
              ▼             ▼             ▼              ▼
      ┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
      │06 Chat ativo │ │07 Sidebar│ │08 Voz    │ │09 Anexo (+)  │
      │  (streaming) │ │ histórico│ │  modo    │ │  bottom sheet│
      └──────────────┘ └──────────┘ └──────────┘ └──────────────┘
```

### Telas a construir (8 obrigatórias + 1 bônus)

**01 · Splash** — mascote centralizado, wordmark FIZZ. Sem botão. Duração mental: 1,5 s.

**02 · Value Prop / Get Started** — *(sua tela 4, promovida para o 2º lugar)*
Precisa de: headline curta (o que o Fizz é), 1 linha de subtexto, mascote, botão primário `Começar` no rodapé (largura total, 56 px de altura), e link secundário `Já tenho conta`. Hoje sua tela só tem uma caixa "get started" no meio — sem promessa, o botão não convence ninguém.

**03 · Auth** — *(sua tela 2, corrigida)*
Título + subtítulo → botões sociais empilhados (Apple, Google, Facebook), 48–56 px de altura, gap 12 → divisor `ou` → `Continuar com e-mail` (se aplicável) → link discreto `Continuar sem conta · histórico não será salvo` → microcópia legal (Termos/Privacidade) no rodapé. **iOS exige "Sign in with Apple" se você oferece login social de terceiros** — Apple no topo, sempre.

**04 · Seu nome** — *(sua tela 3, corrigida)*
Voltar (esq.) + indicador de progresso (ex.: `2 de 2` ou barrinha) → pergunta como headline ("Como devo te chamar?") → campo com label e placeholder → botão `Continuar` (desabilitado até ter 1 caractere) → link `Pular`. Mascote embaixo, pequeno. **Um campo por tela** é a regra de ouro do onboarding mobile.

**05 · Chat — estado VAZIO** — *(sua tela 5)*
Top bar: `☰` menu (esq.) · título/logo (centro) · `✎` nova conversa (dir.).
Miolo: mascote + saudação usando o nome ("Oi, Danilo. No que posso ajudar?") + **3 a 4 chips de sugestão de prompt**. Esses chips são o que ensina o usuário a usar o produto — não são decoração, são onboarding disfarçado.
Rodapé: input `Ask Fizz` com `+` (anexo) à esquerda e ícone de voz à direita, acima do home indicator.

**06 · Chat — conversa ativa (NOVA)**
Bolha do usuário (alinhada à direita, fundo cinza claro, cantos arredondados) · resposta do Fizz (alinhada à esquerda, sem bolha ou com fundo transparente — texto longo em bolha vira parede) · **estado de "pensando"** (é aqui que o mascote brilha) · ações sob a resposta: copiar, refazer, 👍/👎. O input vira `Parar` durante o streaming.

**07 · Sidebar / Histórico (NOVA)**
Hoje o `☰` da sua tela 5 não leva a lugar nenhum. Precisa de: busca no topo, botão `Nova conversa`, lista de conversas agrupada por data (Hoje / Ontem / 7 dias), e no rodapé o avatar + nome + acesso a Configurações.

**08 · Modo Voz (NOVA)**
Você já colocou o ícone de voz no input — então essa tela existe por consequência. Tela cheia: mascote grande animado reagindo à voz, estado (`Ouvindo…` / `Respondendo…`), botão de encerrar e botão de mudo. É a tela onde o Fizz ganha personalidade.

**09 · Anexo — bottom sheet (bônus)**
O `+` abre um sheet: Câmera · Fotos · Arquivo. Simples, mas fecha o loop de uma affordance que você já desenhou.

---

## 6. Tarefa desta aula (faça nesta ordem, ~90 min)

- [ ] **1.** Responder as 3 perguntas da seção 2 e escrever na página `00 Cover`.
- [ ] **2.** Criar o arquivo `FIZZ — Mobile (iOS/Android)` com as 8 páginas da seção 4.
- [ ] **3.** Na página `01 Research`, colar prints de **3 apps de IA** e anotar 1 coisa boa e 1 ruim de cada.
- [ ] **4.** Na página `02 User Flow`, desenhar o fluxo da seção 5 (retângulos + setas; FigJam também serve).
- [ ] **5.** Na página `03 Wireframes Lo-Fi`, criar **9 frames iPhone 16 (393 × 852)**, nomeados `01 Splash` … `09 Anexo`, com layout grid de 4 colunas / margem 16.
- [ ] **6.** Criar os componentes base antes de desenhar as telas: `Status Bar`, `Home Indicator`, `Top Bar`, `Button/Primary`, `Button/Secondary`, `Input/Text`, `Chip`, `Message/User`, `Message/Fizz`.
- [ ] **7.** Montar as 9 telas usando **Auto Layout** e **só cinza**.
- [ ] **8.** Escrever copy real em todos os textos (nada de "lorem", nada de "texto aqui").

**Entrega:** me manda o print (ou o link do Figma) das 9 telas. Eu faço a crítica tela por tela — hierarquia, espaçamento, copy, consistência — e só depois abrimos a Aula 02.

---

## 7. O que vem depois (para você saber onde estamos indo)

- **Aula 02 —** Crítica do Lo-Fi + adaptação Android (Material 3 vs. HIG: onde os dois divergem de verdade).
- **Aula 03 —** Design System: escala tipográfica, paleta com tokens, dark mode (obrigatório em app de IA), acessibilidade (contraste AA 4.5:1).
- **Aula 04 —** Hi-Fi das 9 telas + identidade do mascote.
- **Aula 05 —** Protótipo: Smart Animate, variants para os estados do chat, microinterações.
- **Aula 06 —** Handoff e teste de usabilidade com 5 pessoas.

---

*Documento de apoio da mentoria FIZZ — Aula 01.*
