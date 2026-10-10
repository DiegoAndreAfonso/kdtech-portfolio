# Hospedagem no servidor pessoal

Servidor: server@192.168.15.133, Ubuntu 24.04. O Nginx, PHP 8.4, MySQL e conector Cloudflare já existem. O Tunnel advogadosmca.com.br é administrado pelo painel; sua rota da raiz permanece em http://127.0.0.1:80.

| Projeto | Endereço público | Serviço no servidor |
| --- | --- | --- |
| KDTech | kdtech.advogadosmca.com.br | http://127.0.0.1:8111 |
| Lousa | lousa.advogadosmca.com.br | http://127.0.0.1:8112 |
| Gestão Jurídica | gestao.advogadosmca.com.br | http://127.0.0.1:8080 |
| Central de Atendimento Emergencial | atendimento.advogadosmca.com.br | http://127.0.0.1:8114 |

Os listeners novos aceitam apenas conexões locais. O Tunnel fornece o acesso HTTPS público. As sessões e permissões próprias das aplicações continuam necessárias para acessar seus dados.

## Preparar uma release

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

No painel da conta que administra o domínio, abrir **Networking → Tunnels → advogadosmca.com.br → Routes**. Adicionar quatro rotas do tipo **Published application**, usando a tabela acima. Preservar a rota existente da raiz e as configurações do Tunnel. Não é necessário rotacionar o token, reiniciar o conector ou alterar o arquivo local antigo de cloudflared.

O painel cria os registros DNS correspondentes. Conferir que não existe registro conflitante antes de salvar. Após ativar, verificar HTTPS, recursos CSS/JavaScript, rotas internas e login por cada endereço. Não usar o fragmento YAML neste servidor: cloudflare/ingress.fragment.yml é apenas um exemplo para conectores administrados por configuração local.

## Comportamento dos projetos

O Lousa é uma demonstração. Login, e-mail, pagamento e integração com aplicativo são simulados. Avaliações, resultados e arquivos permanecem no navegador; um link compartilhado não transfere esses dados a outro computador. Mudar o domínio também muda a origem do armazenamento.

gestao.advogadosmca.com.br é outro endereço da aplicação já instalada em /var/www/advocacia-gestao, com o mesmo banco e arquivos do site da raiz. A versão encontrada na inspeção foi af648ba21d9dc65768381c45c74c9eb7482aeb86, branch main. A instalação destes sites não atualiza essa aplicação, não executa suas migrações e não substitui sua versão pela branch lixeira-auditoria. Links gerados pelo backend podem continuar usando advogadosmca.com.br. O login do navegador precisa ser feito no novo endereço, pois seu armazenamento é separado por origem.

O Atendimento agora usa CSRF nos formulários, sessões com cookies seguros e autorização das solicitações pelo ID do usuário. Não divulga contas de teste ou erros internos. Uma nova instalação começa sem solicitações. A migração de uma base antiga é uma operação separada: os registros sem proprietário identificado ficam disponíveis apenas ao administrador; não há associação por nomes.

## Referências

- [Cloudflare Tunnel e aplicações publicadas](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)
- [Configuração local e validação de ingress](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/configuration-file/)
- [Nginx: resolução de arquivos e fallback](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)
- [PHP-FPM: configuração de pools](https://www.php.net/manual/en/install.fpm.configuration.php)
