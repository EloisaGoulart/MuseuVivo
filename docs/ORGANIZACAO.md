# Organização e Boas Práticas

## Estrutura de Pastas
- Centralize imagens em `public/museums/br/`.
- Separe componentes reutilizáveis em `src/components`.
- Serviços de API em `src/services`.
- Tipos TypeScript em `src/types`.

## Padrões de Código
- Use nomes de arquivos e variáveis em inglês e minúsculo, separados por hífen ou camelCase.
- Evite espaços e caracteres especiais em nomes de arquivos.
- Prefira funções puras e componentes funcionais.

## Scripts Úteis
- `npm run lint` — verifica padrões de código.
- `npm run build` — gera build de produção.
- `npm run dev` — ambiente de desenvolvimento.

## Sugestões de Otimização
- Utilize React.memo em componentes que recebem muitas props e mudam pouco.
- Use hooks personalizados para lógica compartilhada.
- Remova logs de console em produção.
- Considere lazy loading para páginas e imagens pesadas.

## Testes
- Adicione Jest e React Testing Library para testes automatizados.
- Crie uma pasta `__tests__` para centralizar os testes.

## Variáveis de Ambiente
- Use `.env.local` para chaves e URLs sensíveis.

---

Mantenha o projeto limpo, documentado e com dependências atualizadas!
