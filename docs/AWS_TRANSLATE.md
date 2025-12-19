# Configuração AWS Translate (Opcional)

## ℹ️ O sistema já funciona sem configuração!

Por padrão, termos básicos são traduzidos automaticamente. Se quiser tradução completa de todos os textos, configure AWS Translate:

## 📋 Passo a Passo

1. **Crie conta AWS**: [aws.amazon.com](https://aws.amazon.com)

2. **Configure IAM User**:
   - Acesse: IAM → Users → Add User
   - Nome: `translate-user`
   - Access: Programmatic
   - Permissions: `TranslateReadOnly`

3. **Copie credenciais**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edite `.env.local`:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=sua_key_aqui
   AWS_SECRET_ACCESS_KEY=sua_secret_aqui
   ```

4. **Reinicie o servidor**:
   ```bash
   npm run dev
   ```

## 💰 Custos

- **Free Tier**: 2 milhões caracteres/mês grátis (12 meses)
- **Após**: $15 por 1 milhão de caracteres

[Ver preços](https://aws.amazon.com/translate/pricing/)

## ✅ Vantagens AWS Translate

- Tradução profissional com IA
- Suporta contexto e expressões idiomáticas
- Alta precisão para termos de arte
- Rápido e escalável

Sem AWS configurado, o sistema usa traduções básicas para termos essenciais.
