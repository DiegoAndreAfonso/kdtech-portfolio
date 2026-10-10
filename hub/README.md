# Central de projetos da KDTech

Prévia da página inicial proposta para https://advogadosmca.com.br/. Reúne acessos aos quatro endereços públicos já instalados. Gestão Jurídica e Atendimento continuam exigindo seus próprios logins; o Lousa está identificado como demonstração.

A página é estática, sem dependências ou serviços externos. Seus arquivos usam exclusivamente o prefixo `/hub-static/`, evitando conflitos com os recursos do sistema jurídico.

## Conferir a prévia

Na raiz deste repositório:

```bash
python3 -m http.server 8120 --bind 127.0.0.1 --directory hub
```

Abrir http://127.0.0.1:8120/. A prévia local apresenta somente o hub; seus cards levam aos projetos públicos. Os caminhos antigos do sistema jurídico dependem do proxy de produção.

## Proposta de publicação

O exemplo `deploy/nginx/projects-hub.conf` cria um listener separado em `127.0.0.1:8110`. O caminho exato `/` serve o hub, `/hub-static/` serve seus recursos e todos os demais caminhos seguem para a aplicação jurídica existente em `127.0.0.1:8080`.

Esse destino usa a configuração HTTPS existente e mantém uploads e encaminhamento das rotas `/login`, `/api`, `/storage`, `/_next`, `/posts/anexos`, `/up` e demais caminhos da aplicação. Os vhosts atuais das portas 80 e 8080 permanecem independentes do novo listener.

Após instalar e validar o vhost, a publicação consiste em alterar apenas o destino da rota da raiz no Tunnel para `http://127.0.0.1:8110`. Os subdomínios continuam com os serviços atuais. A reversão consiste em retornar a rota da raiz ao destino anterior `http://127.0.0.1:80`.

O vhost é uma proposta, ainda sem instalação. Antes de publicar, conferir sintaxe Nginx, página e arquivos do hub, login, API, recursos da aplicação jurídica e preservação dos quatro subdomínios. A prévia não substitui a página pública atual.
