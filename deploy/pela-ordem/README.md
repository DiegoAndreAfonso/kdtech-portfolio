# Hospedagem do Pela Ordem

Código: repositório privado `gabrielportodev/hackthon`. A branch `feat/hospedagem-sem-persistencia` adapta o projeto para acesso público sem login e sem guardar planilhas, processos ou impedimentos. A geração da pauta acontece no navegador; importação e exportação são processadas em memória no servidor.

O resultado fica apenas na aba aberta. Recarregar ou fechar a página descarta os dados. O aplicativo não usa banco, arquivo de estado, cookies de sessão ou armazenamento local do navegador. A consulta de feriados não envia dados dos processos à BrasilAPI.

## Audiências em sequência

A pauta mantém as audiências de cada advogado em um único bloco de horários consecutivos de 15 minutos, no mesmo dia e período (manhã ou tarde), com até 12 audiências. Se o bloco não couber, a aplicação tenta movê-lo inteiro para um período disponível. Se nenhum período comportar o bloco, todas as suas audiências recebem o status de conflito e ficam sem horário.

Importar novos processos ou salvar impedimentos invalida a pauta anterior. É necessário gerar a pauta novamente antes de exportar; a exportação rejeita processos com status novo ou conflito.

## Preparar

No checkout do Pela Ordem, compilar e testar a aplicação. Usar uma cópia limpa da branch revisada:

```bash
npm ci --ignore-scripts
npm run build
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/
HOSTNAME=127.0.0.1 PORT=8130 NODE_ENV=production node .next/standalone/server.js
```

Em outro terminal do mesmo checkout:

```bash
python3 tests/http_smoke.py --base-url http://127.0.0.1:8130 --source-directory .next/standalone
```

Na raiz do portfólio, empacotar em um destino novo:

```bash
python3 deploy/pela-ordem/pack.py /caminho/para/pela-ordem /tmp/pela-ordem-release
python3 deploy/pela-ordem/install.py --validate-only /tmp/pela-ordem-release
scp -r /tmp/pela-ordem-release server@192.168.15.133:~/deploy/
```

No terminal do servidor, com a senha de sudo digitada somente nele:

```bash
sudo python3 /home/server/deploy/pela-ordem-release/install.py /home/server/deploy/pela-ordem-release
```

## Serviço

O instalador cria um usuário de serviço sem login, a release em `/srv/pela-ordem/releases/`, o link `current`, a unidade `pela-ordem.service` e um vhost separado. Node.js atende em `127.0.0.1:3313`; o Nginx atende em `127.0.0.1:8113`. A aplicação não recebe permissão de escrita na release. O proxy limita tamanho e frequência das chamadas de API e desativa gravação temporária de uploads/respostas. O serviço tem limite de memória e reinício automático em caso de falha.

As configurações e releases anteriores são preservadas. O instalador valida checksums, arquivos do pacote, Nginx, systemd e HTTP antes de confirmar a instalação; uma falha restaura os arquivos e o link anteriores. Não altera os serviços KDTech, Lousa, Gestão Jurídica ou Atendimento, nem a rota da raiz.

## Publicação

A aplicação foi instalada e publicada em 10/10/2026, com o commit `e0866e8a253906c0cfdd726cca01a41081f47d9d`. A unidade `pela-ordem.service` está ativa e habilitada para iniciar com o servidor. A rota pública está cadastrada no Tunnel existente:

- Hostname: `pelaordem.advogadosmca.com.br`
- Serviço: `http://127.0.0.1:8113`

DNS público, HTTPS, importação e exportação XLSX foram conferidos usando dados fictícios. As respostas de importação/exportação usam `Cache-Control: no-store`, não criam cookies de sessão e o endpoint antigo de estado compartilhado está ausente. Os testes na versão instalada também conferiram isolamento entre clientes e ausência de arquivo de estado.

A atualização de audiências em sequência foi instalada em 10/10/2026, com o commit ativo `ce0539f1e7ea0077b5cfeb62e7216a4ff1ee1deb` da branch `feat/hospedagem-sem-persistencia`, reutilizando a rota pública. O backup dessa instalação está em `/srv/pela-ordem/deployment-backups/20261011T021730765909Z`. A validação por HTTP local conferiu o fluxo sem estado e a rejeição da exportação de processos novos ou em conflito. O HTTPS público respondeu com a nova interface, e o manifesto do build correspondeu à release instalada. Os serviços existentes e a configuração da raiz permaneceram preservados.

Nas próximas releases, reutilizar a rota existente e repetir a validação antes de confirmar a instalação. A publicação do Pela Ordem é independente da proposta de hub na raiz, que permanece em prévia. O Atendimento continua instalado separadamente, sem aparecer no hub proposto.
