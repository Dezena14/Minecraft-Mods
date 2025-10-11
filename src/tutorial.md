---
layout: layouts/base.njk
title: Tutorial de Instalação de Mods
---

# Como Instalar Mods no Minecraft (Windows)

Instalar mods com o **Fabric** pode parecer um bicho de sete cabeças, mas garantimos que é um processo bem direto. Este guia foi feito para te levar do zero até o seu Minecraft modificado, passo a passo. Vamos lá!

### Antes de Começar: O Essencial

Antes de baixar qualquer coisa, verifique dois pontos importantes:

1.  **Tenha o Minecraft Java Edition instalado** e logado na sua conta.
2.  **Execute a versão que você quer modificar:** Se você quer instalar mods para a versão `1.21`, por exemplo, abra o launcher do Minecraft, selecione a versão `1.21` e jogue pelo menos uma vez até chegar ao menu principal. Isso cria os arquivos necessários para a instalação.

---

## Passo a Passo para a Instalação

### Passo 1: Baixar e Instalar o Fabric Loader

O Fabric é a "base" que permite que os mods funcionem.

1.  Acesse o site oficial e baixe o **[Instalador do Fabric](https://fabricmc.net/use/installer/)**. Clique no botão "Download for Windows" ou baixe o "Universal JAR".
2.  Encontre o arquivo que você baixou (geralmente na pasta "Downloads") e dê um duplo-clique para executá-lo.
3.  Uma pequena janela vai abrir. Verifique se:
    * A aba **"Cliente"** (Client) está selecionada.
    * A **"Versão do Minecraft"** é a correta (a que você quer jogar).
4.  Não precisa mudar mais nada. Apenas clique em **"Instalar"**. Uma mensagem de sucesso aparecerá em poucos segundos. Pode fechar a janela.

### Passo 2: Preparar o Launcher e a Pasta `mods`

Agora vamos fazer o Minecraft reconhecer o Fabric.

1.  Abra o **Launcher do Minecraft**.
2.  Ao lado do botão "JOGAR", você verá que um novo perfil chamado **`fabric-loader-{versão}`** foi criado. Selecione-o.
3.  Clique em **JOGAR**. O jogo vai abrir. Espere ele chegar no menu principal e então pode fechá-lo. Este passo é muito importante, pois ele cria automaticamente a pasta `mods` para nós.

### Passo 3: Encontrar a Pasta `.minecraft`

É aqui que a mágica acontece. A pasta `mods` fica dentro da pasta principal do jogo.

> **O jeito mais fácil de chegar lá:**
> 1. Pressione as teclas **Windows + R** no seu teclado ao mesmo tempo.
> 2. Na pequena janela "Executar" que apareceu, digite exatamente: `%appdata%`
> 3. Aperte Enter.
> 4. Uma pasta se abrirá. Procure e abra a pasta chamada **`.minecraft`**.

### Passo 4: Instalar os Mods (e a Fabric API!)

Agora que você está na pasta `.minecraft`, o processo é simples:

1.  Encontre e abra a pasta `mods`. Se ela não existir, pode criá-la com este nome.
2.  **Copie** todos os arquivos de mods que você baixou (os arquivos que terminam em `.jar`).
3.  **Cole** esses arquivos dentro da pasta `mods`.
4.  **MUITO IMPORTANTE:** Quase todos os mods hoje em dia precisam da **[Fabric API](https://modrinth.com/mod/fabric-api)** para funcionar. Baixe-a (o arquivo `.jar` da mesma versão do seu Minecraft) e coloque-a dentro da pasta `mods` junto com os outros.

### Passo 5: Jogar!

É isso! Agora é só se divertir.

1.  Abra o Launcher do Minecraft novamente.
2.  Verifique se o perfil **`fabric-loader-{versão}`** está selecionado.
3.  Clique em **JOGAR**.

Você saberá que deu tudo certo se, no menu principal do jogo, aparecer um texto no canto inferior esquerdo dizendo **"Fabric (Modded)"**.

---

## Dicas e Solução de Problemas

-   **O jogo fechou sozinho (crash)?** Isso geralmente significa que um mod é incompatível, que falta alguma dependência (outro mod necessário, como a Fabric API), ou que a versão está errada. Remova os mods da pasta um por um para descobrir qual está causando o problema.
-   **Compatibilidade é tudo:** Sempre baixe a versão do mod que corresponde exatamente à sua versão do Minecraft. Um mod para `1.21` não funcionará no Minecraft `1.20`.
-   **Precisa de mais desempenho?** Para listas de mods maiores, é recomendado alocar mais memória RAM para o jogo. No Launcher, vá em "Instalações", clique no seu perfil do Fabric, "Mais opções" e altere o argumento `-Xmx2G` para `-Xmx4G` (4GB) ou mais, dependendo da sua memória disponível.