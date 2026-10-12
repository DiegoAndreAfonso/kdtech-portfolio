# Hospedagem no servidor pessoal

Servidor: server@192.168.15.133, Ubuntu 24.04. O Nginx, PHP 8.4, MySQL e conector Cloudflare já existem. O Tunnel advogadosmca.com.br é administrado pelo painel; sua rota da raiz permanece em http://127.0.0.1:80.

As cinco rotas abaixo foram publicadas em 10/10/2026. Foram conferidos o DNS público, os certificados HTTPS e as páginas. Os recursos CSS/JavaScript dos quatro serviços iniciais, o login e logout do Atendimento e a importação e exportação XLSX do Pela Ordem com dados fictícios também foram validados. A configuração e a versão da aplicação na raiz foram preservadas.

Os scripts de hospedagem estão na branch `feat/hospedagem-servidor` deste repositório. As próximas releases reutilizam as rotas existentes no Tunnel.

| Projeto | Endereço público | Serviço no servidor |
| --- | --- | --- |
| KDTech | [kdtech.advogadosmca.com.br](https://kdtech.advogadosmca.com.br/) | http://127.0.0.1:8111 |
| Lousa | [lousa.advogadosmca.com.br](https://lousa.advogadosmca.com.br/) | http://127.0.0.1:8112 |
| Gestão Jurídica | [gestao.advogadosmca.com.br](https://gestao.advogadosmca.com.br/login) | http://127.0.0.1:8080 |
| Pela Ordem | [pelaordem.advogadosmca.com.br](https://pelaordem.advogadosmca.com.br/) | http://127.0.0.1:8113 |
| Central de Atendimento Emergencial | [atendimento.advogadosmca.com.br](https://atendimento.advogadosmca.com.br/login.php) | http://127.0.0.1:8114 |

Os listeners novos aceitam apenas conexões locais. O Tunnel fornece o acesso HTTPS público. Gestão Jurídica e Atendimento mantêm seus próprios logins e permissões para acesso aos dados.

## Preparar uma release

Para atualizar somente o portfólio já instalado, registrar as alterações da fonte, compilar para o domínio próprio e gerar um pacote exclusivo:

~~~bash
SITE_ORIGIN=https://kdtech.advogadosmca.com.br npm run build
python3 deploy/pack.py --only kdtech --output /tmp/kdtech-update
bash deploy/install-static.sh --validate-only --only kdtech /tmp/kdtech-update
scp -r /tmp/kdtech-update server@192.168.15.133:~/deploy/
~~~

No terminal SSH do administrador:

~~~bash
sudo bash /home/server/deploy/kdtech-update/install-static.sh --only kdtech /home/server/deploy/kdtech-update
~~~

Esse modo exige uma instalação existente, cria uma release completa e troca somente o link `/srv/kdtech/current`. A configuração Nginx e os outros serviços são preservados. A conferência compara as páginas e os arquivos JavaScript/CSS com a release; uma falha restaura o link anterior. Os dados da Gestão Jurídica e do Atendimento não fazem parte do pacote. A proposta de hub da raiz é uma publicação independente.

Compilar o portfólio com o endereço final:

~~~bash
npm ci
SITE_ORIGIN=https://kdtech.advogadosmca.com.br npm run build
~~~

Compilar o Lousa no seu repositório com npm ci e npm run build. No Atendimento, executar npm ci, npm run build:css e npm test. Node é usado para compilação; os sites estáticos e o Atendimento não precisam dele em execução.

Com os repositórios e builds sincronizados, gerar o pacote em uma pasta nova:

~~~bash
python3 deploy/pack.py \
  --lousa /caminho/para/Lousa \
  --atendimento /caminho/para/hackathon_opt \
  --output /tmp/releases-sites
~~~

O pacote contém builds estáticos, uma lista restrita de fontes PHP, scripts de instalação, manifesto de commits e checksums. Exclui Git, dependências de compilação, credenciais locais e o SQL antigo com contas de demonstração. O Atendimento usa apenas seu schema de instalação sem dados de exemplo.

Enviar a pasta ao servidor e conferir os checksums:

~~~bash
ssh server@192.168.15.133 'mkdir -p ~/deploy'
scp -r /tmp/releases-sites server@192.168.15.133:~/deploy/
ssh server@192.168.15.133
cd ~/deploy/releases-sites
sha256sum --check --strict SHA256SUMS
sudo bash install.sh
~~~

A senha de sudo deve ser digitada no terminal do administrador. Os instaladores também aceitam --validate-only /caminho/do/pacote para validar arquivos sem instalar serviços ou acessar o banco.

## Instalação e reversão

install-static.sh instala KDTech e Lousa em releases próprias sob /srv/kdtech/ e /srv/lousa/. Cada current aponta para a versão ativa. O vhost separado kdtech-static usa as portas 8111 e 8112 e faz fallback das rotas React. A release anterior permanece disponível.

install-atendimento.sh prepara /srv/atendimento/, um usuário de serviço, pool PHP-FPM, sessões separadas e vhost na porta 8114. Cria exclusivamente o banco atendimento_app e seu usuário MySQL. A configuração externa fica em /etc/atendimento/config.json, restrita a root e ao usuário do serviço; não é servida por HTTP ou versionada.

O administrador inicial é admin@atendimento.advogadosmca.com.br, usado como identificador de login. Sua senha aleatória é gerada no servidor e salva em /home/server/acesso-atendimento.json, com permissão 0600. O arquivo deve ser consultado apenas pelo administrador no próprio terminal. Uma execução posterior não redefine a senha ou apaga dados.

Os instaladores guardam backups de configurações e links. Validam Nginx e PHP-FPM antes de recarregar e conferem respostas HTTP locais. Em caso de falha, restauram as configurações e releases anteriores. O banco próprio do Atendimento é preservado mesmo se a instalação não terminar. Cada projeto é instalado separadamente; uma falha do Atendimento não remove os sites estáticos já instalados.

verify-server.py registra os hashes dos vhosts da raiz e a versão do sistema jurídico antes da instalação. A conferência posterior verifica sua preservação e as respostas locais das aplicações. inspect-server.sh oferece um inventário complementar sem ler credenciais ou argumentos dos processos.

## Rotas no Cloudflare Tunnel

No painel da conta que administra o domínio, abrir **Networking → Tunnels → advogadosmca.com.br → Routes**. As cinco rotas dos projetos do tipo **Published application** já estão cadastradas conforme a tabela acima, além da rota existente da raiz. Em uma atualização dos projetos, manter essas rotas; somente uma mudança das portas locais exige alterar os destinos. Preservar a rota existente da raiz e as configurações do Tunnel. Não é necessário rotacionar o token, reiniciar o conector ou alterar o arquivo local antigo de cloudflared.

O painel cria os registros DNS correspondentes. Conferir que não existe registro conflitante antes de salvar. Após ativar, verificar HTTPS, recursos CSS/JavaScript, rotas internas e login por cada endereço. Não usar o fragmento YAML neste servidor: cloudflare/ingress.fragment.yml é apenas um exemplo para conectores administrados por configuração local.

Resolvedores e roteadores podem guardar respostas negativas feitas antes da criação dos registros. Se um endereço novo ainda não resolver em uma rede, conferir o DNS público e aguardar o vencimento desse cache. Isso não exige recriar a rota ou o registro DNS.

## Comportamento dos projetos

O Lousa é uma demonstração. Login, e-mail, pagamento e integração com aplicativo são simulados. Avaliações, resultados e arquivos permanecem no navegador; um link compartilhado não transfere esses dados a outro computador. Mudar o domínio também muda a origem do armazenamento.

gestao.advogadosmca.com.br é outro endereço da aplicação já instalada em /var/www/advocacia-gestao, com o mesmo banco e arquivos do site da raiz. A versão encontrada na inspeção foi af648ba21d9dc65768381c45c74c9eb7482aeb86, branch main. A instalação destes sites não atualiza essa aplicação, não executa suas migrações e não substitui sua versão pela branch lixeira-auditoria. Links gerados pelo backend podem continuar usando advogadosmca.com.br. O login do navegador precisa ser feito no novo endereço, pois seu armazenamento é separado por origem.

O Atendimento agora usa CSRF nos formulários, sessões com cookies seguros e autorização das solicitações pelo ID do usuário. Não divulga contas de teste ou erros internos. Uma nova instalação começa sem solicitações. A migração de uma base antiga é uma operação separada: os registros sem proprietário identificado ficam disponíveis apenas ao administrador; não há associação por nomes.

## Pela Ordem

O repositório correto é `gabrielportodev/hackthon`, distinto do Atendimento em PHP. A [hospedagem do Pela Ordem](pela-ordem/README.md) está instalada com o commit `ce0539f1e7ea0077b5cfeb62e7216a4ff1ee1deb` da branch `feat/hospedagem-sem-persistencia`, sincronizada com o repositório privado. Usa um serviço Node.js próprio e a porta local 8113, com acesso público sem login e sem persistência de planilhas ou processos. Os resultados ficam na aba aberta e são descartados ao recarregar ou fechar; devem ser exportados antes disso. Sua instalação e publicação no Tunnel preservaram os serviços atuais.

A atualização instalada em 10/10/2026 mantém as audiências de cada advogado em um bloco de horários consecutivos de 15 minutos, no mesmo dia e período, com até 12 audiências. Quando não há espaço, tenta mover o bloco inteiro para um período disponível; se isso não for possível, sinaliza conflito em todas as audiências do bloco e não atribui horários. Importar novos processos ou salvar impedimentos invalida a pauta anterior, que precisa ser gerada novamente antes da exportação. A versão instalada foi conferida por HTTP local e HTTPS público, incluindo a rejeição de exportações com processos novos ou em conflito e a preservação dos outros serviços e da raiz.

## Hub na raiz: prévia

O diretório [hub](../hub/README.md) contém a prévia da central de projetos da KDTech para a página inicial de advogadosmca.com.br. Os quatro cards direcionam para Gestão Jurídica, Lousa, Pela Ordem e o portfólio. O Atendimento permanece instalado separadamente. O vhost proposto em nginx/projects-hub.conf atende somente a página inicial e seus recursos; os demais caminhos seguem para a aplicação jurídica existente na porta 8080.

Essa proposta ainda não está instalada ou publicada. Sua revisão local é independente dos sites já publicados. A instalação e a alteração do destino da rota raiz no Tunnel serão etapas posteriores à definição da nova página inicial.

## Referências

- [Cloudflare Tunnel e aplicações publicadas](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)
- [Configuração local e validação de ingress](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/configuration-file/)
- [Nginx: resolução de arquivos e fallback](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)
- [PHP-FPM: configuração de pools](https://www.php.net/manual/en/install.fpm.configuration.php)
