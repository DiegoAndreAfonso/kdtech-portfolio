# KDTech — institucional e portfólio

Site em português com React, TypeScript e Vite, página principal e páginas individuais dos projetos.

## Executar

```bash
npm install
npm run dev
npm run build
npm run preview
```

O build de produção fica em `dist/`. O comando de preview permite conferir essa versão localmente.

## Editar conteúdo

- Textos, projetos, participantes e créditos: `src/data.ts`.
- Cores, tipografia, espaçamento e demais tokens visuais: `src/styles.css`.
- Imagens reais: adicione arquivos otimizados em `public/` e configure os campos opcionais `src`, `alt` e `caption` no projeto correspondente. As prévias atuais são ilustrações de interface, identificadas como tal; substitua-as por capturas reais quando disponíveis.
- Contatos: preencha apenas os canais confirmados em `contactConfig`, em `src/data.ts`: `whatsapp`, `email`, `github` e `linkedin`. Configure `siteUrl` quando houver domínio definitivo. Campos ausentes são omitidos.

A KDTech ainda não dispõe de canais públicos de contato. Não há serviço de envio de mensagens. A seção de contato apresenta essa situação sem simular envio. Dados opcionais vazios, como biografias, fotos, links e detalhes do JusExplica, não geram seções públicas.

## Publicação

As páginas individuais são `/projetos/gestao-juridica`, `/projetos/pela-ordem`, `/projetos/lousa` e `/projetos/jusexplica`. O build gera entradas estáticas por rota para suportar o acesso direto e a atualização das páginas. Em hospedagens que exigem fallback para aplicações de página única, configure o redirecionamento das rotas para `index.html`.

## Informações pendentes

- Canais de contato reais e domínio definitivo.
- Descrição funcional, problema, solução e recursos confirmados do JusExplica.
- Nomes dos demais integrantes do Pela Ordem e eventuais colaboradores adicionais do JusExplica.
- Links reais de demonstrações e repositórios, além de capturas dos projetos.
- Biografias curtas, fotos e links profissionais opcionais de Diego e Kennedy.

Os créditos seguem as informações fornecidas. O Lousa é apresentado como protótipo de frontend em React, TypeScript e Vite com persistência local: autenticação, e-mail, assinatura e aplicativo são simulados; backend e compartilhamento de dados entre dispositivos são etapas futuras. O controle nativo do computador durante avaliações não está implementado.
