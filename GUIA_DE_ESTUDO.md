# 🎓 GUIA DE ESTUDO - MUSEU VIVO

Este guia complementa o README.md com explicações detalhadas para iniciantes.

---

## 📌 CONCEITOS FUNDAMENTAIS

### 1. O que é Next.js?

Next.js é um **framework** (ferramenta) construído em cima do React que facilita criar sites e aplicações web.

**Vantagens do Next.js:**
- ✅ Roteamento automático (baseado em arquivos)
- ✅ Server-side rendering (renderização no servidor)
- ✅ Otimização automática de imagens
- ✅ API routes (criar APIs dentro do projeto)

---

### 2. O que é TypeScript?

TypeScript é JavaScript com **tipos**. Tipos ajudam a prevenir bugs.

**Exemplo:**

```javascript
// JavaScript (sem tipos)
function soma(a, b) {
  return a + b;
}
soma(5, "10"); // Retorna "510" - BUG!
```

```typescript
// TypeScript (com tipos)
function soma(a: number, b: number): number {
  return a + b;
}
soma(5, "10"); // ERRO! TypeScript não deixa compilar
```

---

### 3. O que é um Componente?

Componente é um **pedaço reutilizável** de interface.

**Exemplo:**

```tsx
// Componente de Botão
function Button({ texto }: { texto: string }) {
  return <button>{texto}</button>;
}

// Usar em vários lugares
<Button texto="Salvar" />
<Button texto="Cancelar" />
<Button texto="Enviar" />
```

---

### 4. Server Component vs Client Component

#### **Server Component** (padrão)

```tsx
// Este código roda NO SERVIDOR
export default async function Pagina() {
  const dados = await buscarDoBancoDeDados();
  return <div>{dados}</div>;
}
```

**Vantagens:**
- Mais rápido (menos JavaScript no navegador)
- Pode acessar banco de dados diretamente
- Melhor para SEO

**Limitações:**
- Não pode usar useState, useEffect
- Não pode ter onClick, onChange

---

#### **Client Component** (com 'use client')

```tsx
'use client'; // Esta linha é obrigatória!

export default function Pagina() {
  const [contador, setContador] = useState(0);
  
  return (
    <button onClick={() => setContador(contador + 1)}>
      Cliques: {contador}
    </button>
  );
}
```

**Vantagens:**
- Pode ter interatividade (cliques, formulários)
- Pode usar hooks (useState, useEffect)

**Quando usar:**
- Formulários
- Botões que fazem algo
- Busca em tempo real
- Qualquer interação do usuário

---

### 5. Como funcionam as Rotas?

No Next.js, as rotas são baseadas na **estrutura de pastas**.

```
app/
├─ page.tsx          → http://localhost:3000/
├─ obras/
│  ├─ page.tsx       → http://localhost:3000/obras
│  └─ [id]/page.tsx  → http://localhost:3000/obras/123
└─ museus/
   └─ page.tsx       → http://localhost:3000/museus
```

**Rotas Dinâmicas:** `[id]` aceita qualquer valor

---

### 6. Como funciona uma API REST?

API REST usa requisições HTTP para buscar dados.

**Métodos principais:**
- **GET**: Buscar dados
- **POST**: Enviar dados
- **PUT**: Atualizar dados
- **DELETE**: Deletar dados

**Exemplo de GET:**

```tsx
const response = await fetch('https://api.example.com/obras');
const data = await response.json();
console.log(data); // Array de obras
```

---

## 🔧 PASSO A PASSO DO CÓDIGO

### Fluxo: Listar Obras

1. Usuário acessa `/obras`
2. Next.js carrega `app/obras/page.tsx`
3. Componente monta e executa `useEffect`
4. `useEffect` chama `loadInitialArtworks()`
5. Função chama `getArticArtworks()` do service
6. Service faz `fetch()` para a API
7. API retorna JSON com obras
8. Service converte para nosso formato
9. Service retorna para o componente
10. Componente atualiza estado com `setArtworks()`
11. React re-renderiza mostrando as obras

---

### Fluxo: Buscar Obra

1. Usuário digita "gatos" e clica em Buscar
2. `SearchBar` chama função `onSearch("gatos")`
3. Função `handleSearch()` é executada
4. `handleSearch()` chama as APIs em paralelo
5. APIs retornam resultados
6. Resultados são combinados
7. Estado atualiza com `setArtworks()`
8. Lista mostra obras com "gatos"

---

## 🧩 ESTRUTURA DE UM COMPONENTE

```tsx
// 1. IMPORTS (importações)
import { useState } from 'react';
import './styles.css';

// 2. INTERFACE (tipos)
interface Props {
  titulo: string;
  descricao?: string; // ? = opcional
}

// 3. COMPONENTE
export default function MeuComponente({ titulo, descricao }: Props) {
  // 4. ESTADOS
  const [contador, setContador] = useState(0);
  
  // 5. FUNÇÕES
  function incrementar() {
    setContador(contador + 1);
  }
  
  // 6. RENDER
  return (
    <div>
      <h1>{titulo}</h1>
      {descricao && <p>{descricao}</p>}
      <button onClick={incrementar}>
        Cliques: {contador}
      </button>
    </div>
  );
}
```

---

## 📖 EXPLICAÇÃO DOS ARQUIVOS

### `src/types/artwork.ts`
Define a **estrutura dos dados**. Como um "modelo" ou "blueprint".

### `src/services/artInstitute.ts`
Contém **funções que buscam dados** da API do Art Institute.
Separa a lógica de API dos componentes (boa prática).

### `src/components/ArtworkCard.tsx`
Componente **reutilizável** que mostra uma obra.
Recebe dados via props e exibe na tela.

### `src/app/obras/page.tsx`
**Página** que lista obras.
Client Component porque precisa de busca e interatividade.

### `src/app/obras/[id]/page.tsx`
**Rota dinâmica** para detalhes.
O [id] pode ser qualquer coisa: 123, abc, etc.

---

## 🎯 EXERCÍCIOS PRÁTICOS

### Nível 1: Iniciante

1. **Mudar cores do tema**
   - Edite `src/app/globals.css`
   - Mude `#646cff` para outra cor

2. **Adicionar um emoji no título**
   - Edite `src/app/page.tsx`
   - Mude o emoji 🎨 para outro

3. **Mudar número de obras na home**
   - Em `src/app/page.tsx`, linha 28
   - Mude `6` para `8` ou `10`

---

### Nível 2: Intermediário

1. **Adicionar campo de busca na home**
   - Importe `SearchBar` em `src/app/page.tsx`
   - Adicione `<SearchBar onSearch={...} />`

2. **Criar botão de "Voltar ao topo"**
   - Crie novo componente `BackToTop.tsx`
   - Use `window.scrollTo(0, 0)`

3. **Adicionar contador de obras**
   - Na página de obras, mostre "X obras encontradas"

---

### Nível 3: Avançado

1. **Implementar paginação**
   - Adicionar botões "Próxima" e "Anterior"
   - Controlar página atual com useState

2. **Salvar favoritos no localStorage**
   - Botão de favoritar em cada obra
   - Guardar IDs no localStorage
   - Criar página "/favoritos"

3. **Adicionar filtro por data**
   - Dropdown para selecionar século
   - Filtrar obras por período

---

## 🐛 DEBUGANDO PROBLEMAS

### Console do Navegador

Aperte **F12** para abrir as ferramentas de desenvolvedor.

**Console**: Mostra erros e logs
```tsx
console.log('Valor:', minhaVariavel);
```

**Network**: Mostra requisições para APIs
- Veja quais APIs foram chamadas
- Veja a resposta de cada requisição

---

### Erros Comuns

#### "Cannot read property of undefined"
```tsx
// ERRADO
<div>{obra.titulo}</div> // obra pode ser null

// CERTO
<div>{obra?.titulo}</div> // ? verifica se existe
```

#### "Hook called conditionally"
```tsx
// ERRADO
if (condicao) {
  useState(0); // Hook dentro de if!
}

// CERTO
const [state, setState] = useState(0); // Sempre no topo
if (condicao) {
  setState(1); // Usar o hook depois
}
```

---

## 📚 PRÓXIMOS ESTUDOS

Depois de dominar este projeto, estude:

1. **Context API** - Compartilhar estado entre componentes
2. **React Query** - Gerenciar cache de APIs
3. **Zustand/Redux** - Gerenciamento de estado global
4. **Testing Library** - Testes automatizados
5. **Storybook** - Documentar componentes

---

## 💡 DICAS IMPORTANTES

✅ **Sempre use TypeScript** - Previne muitos bugs

✅ **Separe lógica de UI** - Services para API, Components para visual

✅ **Componentes pequenos** - Cada componente faz uma coisa só

✅ **Nomear bem** - `getUserData()` é melhor que `getData()`

✅ **Comentar código complexo** - Explique o "porquê", não o "o quê"

✅ **Usar Git** - Commit pequenos e frequentes

✅ **Ler documentação** - Next.js e React têm ótimas docs

✅ **Praticar muito** - Código se aprende codando!

---

**Boa sorte nos estudos! 🚀**
