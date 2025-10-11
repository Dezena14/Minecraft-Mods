# Site de Curadoria de Mods para Minecraft

Este é um site estático pessoal, construído com [Eleventy](https://www.11ty.dev/), para exibir uma lista curada de mods de Minecraft. O site busca dados da [API do Modrinth](https://docs.modrinth.com/) para enriquecer as informações e é projetado para ser rápido, leve e fácil de manter.

O principal diferencial deste projeto é uma **ferramenta de linha de comando** personalizada que auxilia na curadoria, automatizando a busca por novas versões de mods e facilitando a adição de novos itens à lista.

---

## 🚀 Demo ao Vivo

**[Clique aqui para ver o site no ar!](https://SEU-USUARIO.github.io/SEU-REPOSITORIO/)**

> [!NOTE]
> Lembre-se de substituir o link acima pela URL real do seu GitHub Pages.

---

## ✨ Funcionalidades

-   **Conteúdo Dinâmico:** Busca e exibe nomes, ícones, descrições e categorias de mods diretamente da API do Modrinth.
-   **Filtragem por Categoria:** Sistema de filtro dinâmico no lado do cliente para que os usuários possam encontrar mods por categoria.
-   **Páginas por Versão:** Geração automática de páginas para cada versão do Minecraft, mostrando apenas os mods relevantes.
-   **Navegação Inteligente:** Menu de navegação aninhado para as versões do jogo e um design responsivo com menu "hambúrguer".
-   **Temas:** Tema claro e escuro com detecção automática da preferência do sistema do usuário e botão para troca manual.
-   **Ferramenta de Curadoria:** Um script interativo em Node.js para gerenciar a lista de mods sem precisar editar o arquivo `mods.json` manualmente.

---

## 🛠️ Tecnologias Utilizadas

-   **Gerador de Site Estático:** [Eleventy (11ty)](https://www.11ty.dev/)
-   **Linguagem de Template:** [Nunjucks](https://mozilla.github.io/nunjucks/)
-   **JavaScript:** Vanilla JS (cliente) e Node.js (script de automação)
-   **Estilização:** CSS com variáveis para temas.
-   **Dependências:** `node-fetch`, `@11ty/eleventy-img`, `readline-sync`.

---

## 🚀 Instalação e Uso

### Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)

### Configuração Local

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git](https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git)
    ```
2.  **Navegue até a pasta do projeto:**
    ```bash
    cd SEU-REPOSITORIO
    ```
3.  **Instale as dependências:**
    ```bash
    npm install
    ```

### Comandos Principais

#### Para Desenvolvimento Local

Para iniciar o servidor de desenvolvimento com hot-reload:
```bash
npm start
```
O site estará disponível em `http://localhost:8080`.

#### Para Gerenciar a Curadoria de Mods

Este é o comando mais importante para a manutenção do site. Ele abre uma ferramenta interativa no terminal.
```bash
npm run update-versions
```
Você terá duas opções:
1.  **Atualizar versões dos mods existentes:** O script verifica todos os mods do seu `mods.json`, encontra novas versões compatíveis na API e pergunta, uma por uma, se você deseja adicioná-las à sua lista.
2.  **Adicionar um novo mod:** O script pede o "slug" do mod (ex: `sodium`), confirma se é o mod correto e te guia na seleção inicial das versões que você deseja curar.

#### Para Gerar o Site para Produção

Para gerar a versão final e otimizada do site na pasta `_site/`:
```bash
npm run build
```

---

## 🌐 Deploy (Publicação com GitHub Pages)

Este projeto está configurado para ser publicado facilmente no **GitHub Pages**.

O comando `npm run build` foi criado especificamente para isso. Ele usa a opção `--pathprefix` do Eleventy para garantir que todos os links (para CSS, JS, e outras páginas) funcionem corretamente quando o site está em um subdiretório (como `usuario.github.io/nome-do-repo`).

O deploy é tipicamente automatizado com **GitHub Actions**. Um fluxo de trabalho comum para isso seria:

1.  Fazer um `push` para a branch `main`.
2.  A Action é acionada, instala as dependências (`npm install`) e executa o script de build (`npm run build`).
3.  A Action então pega o conteúdo da pasta `_site/` e o publica no ambiente do GitHub Pages.

Para configurar isso no seu repositório, vá em **Settings > Pages** e configure a fonte de deploy ("Source") como "GitHub Actions".

---

## 📂 Estrutura do Projeto

```
/
├── scripts/
│   └── update-versions.js  # A ferramenta de curadoria
├── src/
│   ├── _includes/          # Layouts e Módulos (partials)
│   ├── css/                # Arquivos de estilo
│   ├── js/                 # Arquivos JavaScript do cliente
│   ├── mods.njk            # Template da página "Todos os Mods"
│   └── ... (outras páginas e pastas)
├── .eleventy.js            # O cérebro do site, onde a mágica acontece
└── mods.json               # A fonte da verdade! O arquivo central da sua curadoria
```

---

## 📄 Licença

Distribuído sob a licença MIT.