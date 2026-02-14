# Sistema de Design - Sandra Café & Cozinha

## Direção e Feel

**Tema:** "Caderno digital com carimbo de tinta"

O sistema visual evoca a familiaridade do caderno de papel tradicional usado em cantinas, com cores quentes de papel envelhecido, café e madeira. Feedback tátil nas interações (animação "carimbo"), densidade balanceada para uso mobile rápido.

## Paleta de Cores

### Cores Base
- **Surface Base:** `#F7F5F0` (off-white papel envelhecido)
- **Surface Raised:** `#E8E1D4` (bege creme para cards)
- **Surface Overlay:** `#FFFFFF` (modais e drawers)

### Textos
- **Primary:** `#5A3E2B` (marrom café - textos principais)
- **Secondary:** `#6B7B4F` (verde oliva - textos secundários)
- **Tertiary:** `#8B9B6F` (verde claro - metadados)
- **Muted:** `#A0A89B` (cinza esverdeado - disabled)

### Brand
- **Primary:** `#6B7B4F` (verde oliva - botões, header)
- **Hover:** `#4E5B36` (verde escuro - estados hover)
- **Active:** `#3E4A28` (verde mais escuro - estados active)

### Semânticas
- **Success:** `#2F7D32` (verde - entrada de dinheiro, confirmações)
- **Warning:** `#C8A951` (amarelo - fiado, avisos)
- **Error:** `#B24A3A` (vermelho suave - erros, saídas)
- **Info:** `#3E6B73` (azul neutro - informações)

## Estratégia de Profundidade

**Abordagem:** Bordas sutis + leve sombra em elementos importantes

- Bordas usam rgba com baixa opacidade para blend suave
- Shadows sutis simulam papel empilhado
- Cards usam surface-raised + border-soft + shadow-card
- Modals/Drawers usam surface-overlay + shadow-overlay

**Progressão de Bordas:**
- Soft: `rgba(91, 62, 43, 0.12)` - separação básica
- Standard: `rgba(91, 62, 43, 0.20)` - separação normal
- Emphasis: `rgba(78, 91, 54, 0.40)` - ênfase, focus rings

**Shadows:**
- Card: `0 1px 3px rgba(91, 62, 43, 0.08)`
- Overlay: `0 4px 12px rgba(91, 62, 43, 0.12)`

## Tipografia

**Fonte:** Inter (weights 400, 500, 600, 700)

Humanizada, legível em movimento, com calor sem ser casual demais.

**Hierarquia:**
- Headlines: font-bold, tracking tight
- Body: font-normal, leading-normal
- Labels: font-medium, funciona em tamanhos menores
- Data/números: font-semibold para destaque

## Spacing

**Base:** 4px

**Escala:**
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px
- 3xl: 48px

## Border Radius

- Small: 4px (inputs, badges)
- Medium: 8px (botões, cards)
- Large: 12px (modais)

## Componentes Reutilizáveis

### Button
**Variantes:** primary, secondary, ghost, danger
**Tamanhos:** sm (min-h 36px), md (min-h 44px), lg (min-h 52px)
**Estados:** default, hover, active, disabled
**Touch:** active:scale-95 para feedback tátil

### Input
**Background:** `#EDE7DB` (levemente mais escuro que surface-base - efeito inset)
**Border:** border-soft no default, border-emphasis no focus
**Estados:** focus ring com brand-emphasis, error com erro semântico

### Card
**Surface:** surface-raised
**Border:** border-soft
**Shadow:** shadow-card
**Uso:** Containers de conteúdo, métricas, itens de lista

### Badge
**Variantes:** success, warning, error, info, neutral
**Uso:** Status de comandas, saldo de fiado, categorias

### Modal/Drawer
**Mobile:** Drawer (bottom-sheet) para seleção de produtos, formulários
**Desktop:** Modal centered
**Background:** surface-overlay com backdrop blur
**Handle:** Drawer tem handle visual (barra arredondada no topo)

## Padrões de Layout

### Mobile Navigation
Bottom bar com 4 ações principais:
- Resumo (home)
- Comandas
- Lançar Venda
- Fiado

Ícones grandes + labels, active state em brand-primary

### Header
Background brand-primary, logo + nome da unidade + data

### Comandas
Cards visuais (não tabela) - representam mesas/clientes como "lugares"
Badge de status, valor destacado em brand-primary

### Produtos
Grid 2 colunas no mobile, cards com hover border em brand-primary
Preço destacado, categoria como metadado

### Fiado
Lista ordenada por saldo (maior primeiro)
Badge colorido por faixa de valor (verde ok, amarelo moderado, vermelho alto)

## Animações

**Stamp (carimbo):** Itens adicionados à comanda
```css
@keyframes stamp {
  0% { transform: scale(0.8) rotate(-5deg); opacity: 0; }
  50% { transform: scale(1.05) rotate(2deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
```

**FadeIn:** Entrada de listas e conteúdo
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**Duração:** ≤200ms para micro-interações, suave e rápida

## Estados Especiais

### Loading
Spinner circular com border em brand-primary
Componente LoadingSpinner (sm/md/lg)

### Empty
EmptyState component com ícone grande, título, descrição opcional, ação opcional
Não usar apenas texto cinza - criar momento visual

### Error
Usar cor error semântica, mensagens claras e acionáveis

## Mobile-First

- Touch targets ≥ 44px
- Bottom navigation para acesso rápido
- Drawers (bottom sheet) ao invés de modais quando possível
- Grid responsivo (1 col mobile, 2+ desktop)
- Fontes legíveis sem zoom

## Assinatura do Produto

**Elemento único:** Animação "carimbo" ao adicionar itens
Simula marcar uma fichinha de papel - instantâneo, satisfatório, conecta ao território da cantina tradicional

## Tokens CSS

Todos os valores vivem em `app/tokens.css` como CSS variables.
Componentes referenciam tokens, nunca valores diretos.

Exemplo:
```css
background: var(--surface-raised);
color: var(--text-primary);
border: 1px solid var(--border-soft);
```

## Consistência

- Sempre usar tokens, nunca valores hardcoded
- Manter hierarquia visual clara (4 níveis de texto)
- Espaçamento na escala definida
- Animações consistentes em velocidade/easing
- Estados interativos em todos os elementos clicáveis
