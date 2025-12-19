# 🎨 Museu Vivo

![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![React](https://img.shields.io/badge/React-19+-61dafb)

**Museu Vivo** é um projeto educacional para exploração de obras de arte de museus ao redor do mundo através de APIs públicas. Desenvolvido com Next.js, React e TypeScript, focado em aprendizado de boas práticas, consumo de APIs, gerenciamento de estados e rotas.


## 📚 **SOBRE O PROJETO**

Este é um **projeto de estudo** para desenvolvedores júnior que querem aprender:


## 🏛️ **APIs INTEGRADAS**

### 1. **Art Institute of Chicago API**
```
https://api.artic.edu/api/v1/artworks
```
- Milhares de obras de arte
- Busca por texto
- Imagens de alta qualidade

### 2. **Metropolitan Museum of Art API**
```
https://collectionapi.metmuseum.org/public/collection/v1/
```
- Coleção completa do MET
- Busca por obras
- Departamentos e categorias

### 3. **Museus do Brasil**
```
http://museus.cultura.gov.br/api/space/find
```
- Museus brasileiros cadastrados
- Dados do Ministério da Cultura

### 4. **LibreTranslate API**
```
https://libretranslate.com/translate
```
- Tradução automática inglês → português
- API gratuita sem necessidade de chave

---

## 📁 **ESTRUTURA DO PROJETO**

```
museu-vivo/
├─ src/
│  ├─ app/                      # Páginas (App Router)
│  │  ├─ page.tsx              # Home - Página inicial
│  │  ├─ layout.tsx            # Layout raiz (Header, Footer)
│  │  ├─ obras/
│  │  │  ├─ page.tsx           # Lista de obras
│  │  │  └─ [id]/page.tsx      # Detalhes de uma obra (rota dinâmica)
│  │  └─ museus/page.tsx       # Lista de museus brasileiros
│  │
│  ├─ components/               # Componentes reutilizáveis
│  │  ├─ Header.tsx            # Cabeçalho com navegação
│  │  ├─ ArtworkCard.tsx       # Card de obra de arte
│  │  ├─ SearchBar.tsx         # Barra de pesquisa
│  │  └─ Loading.tsx           # Indicador de carregamento
│  │
│  ├─ services/                 # Lógica de APIs
│  │  ├─ artInstitute.ts       # API do Art Institute
│  │  ├─ metMuseum.ts          # API do MET
│  │  ├─ museusBr.ts           # API de museus brasileiros
│  │  └─ translate.ts          # API de tradução
│  │
│  └─ types/                    # Tipos TypeScript
│     └─ artwork.ts            # Interfaces de dados
│
├─ public/                      # Arquivos estáticos
├─ package.json
├─ tsconfig.json
└─ next.config.ts
```

---

## 🚀 **COMO RODAR O PROJETO**

### **1. Pré-requisitos**
- Node.js 18+ instalado
- npm, yarn, pnpm ou bun

### **2. Instalar dependências**
```bash
npm install
# ou
yarn install
```

### **3. Rodar o servidor de desenvolvimento**
```bash
npm run dev
# ou
yarn dev
```

### **4. Abrir no navegador**
```
http://localhost:3000
```

O site vai abrir e você pode começar a explorar obras de arte! 🎨

---

## 🧩 **CONCEITOS PRINCIPAIS EXPLICADOS**

### **1. Server Components vs Client Components**

#### **Server Components** (padrão no Next.js 13+)
- Rodam no servidor
- Podem buscar dados diretamente (sem useEffect)
- Não podem usar hooks como useState, useEffect
- Melhor performance e SEO
- **Exemplo:** [src/app/page.tsx](src/app/page.tsx)

```tsx
// Server Component (sem 'use client')
export default async function Page() {
  const data = await fetch('https://api.example.com');
  return <div>{data.title}</div>;
}
```

#### **Client Components** (com 'use client')
- Rodam no navegador
- Podem usar interatividade (onClick, onChange)
- Podem usar hooks (useState, useEffect)
- Necessário para busca, formulários, etc.
- **Exemplo:** [src/app/obras/page.tsx](src/app/obras/page.tsx)

```tsx
'use client'; // Torna o componente cliente

export default function Page() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch('https://api.example.com')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  return <div>{data.title}</div>;
}
```

---

### **2. Rotas no Next.js (App Router)**

| Arquivo | URL | Tipo |
|---------|-----|------|
| `app/page.tsx` | `/` | Página inicial |
| `app/obras/page.tsx` | `/obras` | Lista de obras |
| `app/obras/[id]/page.tsx` | `/obras/123` | Rota dinâmica |
| `app/museus/page.tsx` | `/museus` | Lista de museus |

**Rotas Dinâmicas:**
- `[id]` nos colchetes indica um parâmetro dinâmico
- O valor fica disponível em `params.id`
- **Exemplo:** `/obras/12345` → `params.id = "12345"`

---

### **3. Hooks do React**

#### **useState**
Cria um estado (variável que quando muda, re-renderiza o componente)

```tsx
const [count, setCount] = useState(0);

function increment() {
  setCount(count + 1); // Atualiza o estado
}
```

#### **useEffect**
Executa código após renderização (buscar dados, timers, etc.)

```tsx
useEffect(() => {
  // Código que roda após renderizar
  loadData();
}, []); // [] = roda apenas uma vez
```

---

### **4. TypeScript e Interfaces**

TypeScript adiciona tipos ao JavaScript para prevenir bugs:

```tsx
// Definindo uma interface
interface Artwork {
  id: string;
  title: string;
  artist: string;
}

// Usando a interface
const artwork: Artwork = {
  id: "123",
  title: "Mona Lisa",
  artist: "Leonardo da Vinci"
};
```

**Benefícios:**
- Autocompletar no editor
- Erros aparecem antes de rodar o código
- Documentação automática

---

### **5. Como Funciona a Tradução**

A API LibreTranslate recebe um texto em inglês e retorna em português:

```tsx
// POST para https://libretranslate.com/translate
{
  "q": "The Starry Night",      // Texto a traduzir
  "source": "en",               // Inglês
  "target": "pt",               // Português
  "format": "text"
}

// Resposta:
{
  "translatedText": "A Noite Estrelada"
}
```

**Implementação:** [src/services/translate.ts](src/services/translate.ts)

---

## 🎯 **FUNCIONALIDADES**

✅ **Página inicial** com obras em destaque  
✅ **Listagem de obras** das duas APIs  
✅ **Busca por texto** (artista, título, tema)  
✅ **Filtro por museu** (Art Institute ou MET)  
✅ **Página de detalhes** com informações completas  
✅ **Tradução automática** inglês → português  
✅ **Museus brasileiros** cadastrados no MinC  
✅ **Design responsivo** (funciona em mobile)  
✅ **Loading states** para melhor UX  
✅ **Tratamento de erros**  

---

## 📖 **PRÓXIMOS PASSOS DE APRENDIZADO**

Se você quer expandir o projeto:

1. **Adicionar paginação** na lista de obras
2. **Favoritar obras** (localStorage)
3. **Comparar duas obras** lado a lado
4. **Filtros avançados** (período, técnica, cor)
5. **Modo escuro** (dark mode)
6. **Compartilhar nas redes sociais**
7. **Criar coleções personalizadas**
8. **Adicionar testes** (Jest, Testing Library)

---

## 🐛 **PROBLEMAS COMUNS**

### API não responde
- Algumas APIs podem estar fora do ar temporariamente
- Verifique o console do navegador (F12)
- A API de museus brasileiros pode ser instável

### Imagens não carregam
- Algumas obras não têm imagens disponíveis
- Filtramos obras sem imagem, mas algumas podem falhar

### Erro de CORS
- Todas as APIs usadas permitem requisições do navegador
- Se encontrar erro de CORS, pode ser problema temporário da API

---

## 📚 **RECURSOS DE APRENDIZADO**

- [Documentação Next.js](https://nextjs.org/docs)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [API do Art Institute](https://api.artic.edu/docs/)
- [API do MET](https://metmuseum.github.io/)

---

## 📝 **LICENÇA**

Este é um projeto educacional livre para uso e modificação.

---

## 👨‍💻 **AUTOR**

Projeto criado para fins educacionais - aprendizado de desenvolvimento front-end com Next.js, React e TypeScript.

---

**🎨 Explore, aprenda e divirta-se com arte!**
>>>>>>> a8f09d4 (Reorganiza projeto: Move Next.js para raiz do repositório)
