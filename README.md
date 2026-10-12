# KDTech — institucional e portfólio

Site em português com React, TypeScript e Vite, página principal e páginas individuais dos projetos.

## Executar

```bash
npm ci
npm run dev
npm run build
npm run preview
```

O build de produção fica em `dist/`. O comando de preview permite conferir essa versão localmente.

## Trabalhar em equipe

Repositório privado: [DiegoAndreAfonso/kdtech-portfolio](https://github.com/DiegoAndreAfonso/kdtech-portfolio). O acesso de colegas é concedido por convite nas configurações do repositório.

```bash
git clone git@github.com:DiegoAndreAfonso/kdtech-portfolio.git
cd kdtech-portfolio
```

A branch principal é `main`. Depois de clonar o repositório, execute `npm ci` para instalar as versões registradas no lockfile.

Crie uma branch com um nome relacionado ao trabalho, como `feat/conteudo-projetos` ou `fix/menu-mobile`. Antes de enviar alterações, execute `npm run build` e abra um pull request para `main`. O repositório verifica o build automaticamente em pushes e pull requests.

Não versione `node_modules/`, `dist/`, arquivos `.env` ou credenciais. Preserve o arquivo técnico de configuração da hospedagem para manter a associação com a versão existente.

## Editar conteúdo

- Textos, projetos, participantes e créditos: `src/data.ts`.
- Cores, tipografia, espaçamento e demais tokens visuais: `src/styles.css`.
- Imagens reais: adicione arquivos otimizados em `public/` e configure os campos opcionais `src`, `alt` e `caption` no projeto correspondente. As prévias atuais são ilustrações de interface, identificadas como tal; substitua-as por capturas reais quando disponíveis.
- Contatos: preencha apenas os canais confirmados em `contactConfig`, em `src/data.ts`: `whatsapp`, `email`, `github` e `linkedin`. Configure `siteUrl` quando houver domínio definitivo. Campos ausentes são omitidos.

A KDTech ainda não dispõe de canais públicos de contato. Não há serviço de envio de mensagens. A seção de contato apresenta essa situação sem simular envio. Dados opcionais vazios, como biografias, fotos e links, não geram seções públicas.

O JusExplica é apresentado com base nos dois materiais do hackathon: uma proposta para explicar e acompanhar processos em linguagem simples, com notificações pelo WhatsApp e um chat complementar, por texto e áudio. A página reúne problema, solução, fluxo, recursos previstos, público, modelo B2G com perspectiva de B2B e créditos dos seis participantes. A prévia de conversa é ilustrativa. Faster-Whisper, modelo de linguagem, Piper e integração com Eproc compõem a arquitetura proposta; os materiais não confirmam sua operação em produção.

## Publicação

As páginas individuais são `/projetos/gestao-juridica`, `/projetos/pela-ordem`, `/projetos/lousa`, `/projetos/gestorize-mobile` e `/projetos/jusexplica`. O build gera entradas estáticas por rota para suportar o acesso direto e a atualização das páginas. Em hospedagens que exigem fallback para aplicações de página única, configure o redirecionamento das rotas para `index.html`.

## Informações pendentes

- Canais de contato reais e domínio definitivo.
- Confirmação do estágio de implementação e das integrações do JusExplica.
- Nomes dos demais integrantes do Pela Ordem.
- Links reais de demonstrações e repositórios, além de capturas dos projetos.
- Biografias curtas, fotos e links profissionais opcionais de Diego e Kennedy.

Os créditos seguem as informações fornecidas. O Lousa é apresentado como protótipo de frontend em React, TypeScript e Vite com persistência local: autenticação, e-mail, assinatura e aplicativo são simulados; backend e compartilhamento de dados entre dispositivos são etapas futuras. O controle nativo do computador durante avaliações não está implementado.

## GestorizeMobile

Projeto em coautoria de Diego André Afonso e Kennedy Pinheiro, com aplicativo React Native/Expo e API Laravel. A página `/projetos/gestorize-mobile` destaca clientes, produtos, consulta de CEP, acesso e preferências de interface presentes no código. Fornecedores, funcionários, orçamentos e relatórios são apresentados como fluxos mobile em desenvolvimento. O link direciona ao repositório público original; a prévia é ilustrativa, sem demonstração hospedada do aplicativo.
