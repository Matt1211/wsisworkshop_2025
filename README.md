Bem-vindo ao repositório oficial do minicurso "**Desenvolvimento de API com .NET 8, Google Vision e USDA API**", parte do Workshop de Sistemas de Informação (WSIS) da Universidade Federal de Viçosa - Campus Rio Paranaíba.

Este projeto é uma aplicação completa que consiste em uma API Mínima em .NET 8 (backend) e um cliente web simples (frontend) para criar um planejador de refeições inteligente. A aplicação permite que os usuários criem refeições, adicionem alimentos a partir de fotos e vejam as informações nutricionais detalhadas de cada item.

## ✨ Funcionalidades Principais

  * **Backend com .NET 8 Minimal API**: Uma API leve, rápida e moderna para gerenciar os dados das refeições.
  * **Identificação de Alimentos com IA**: Utilize o poder do **Google Cloud Vision API** para identificar alimentos a partir de imagens enviadas pelos usuários.
  * **Busca de Dados Nutricionais**: Integre-se com a API **FoodData Central do USDA** para obter informações nutricionais detalhadas, como calorias, proteínas, gorduras e carboidratos.
  * **Frontend Interativo**: Um cliente web simples, construído com HTML, CSS e JavaScript puros, para interagir com a API, criar refeições, fazer upload de imagens e visualizar os dados.
  * **Persistência de Dados**: As refeições criadas são salvas localmente em um arquivo `refeicoes.json`, simplificando o setup do projeto.

## 🛠️ Tecnologias Utilizadas

  * **Backend**:
      * .NET 8
      * ASP.NET Core Minimal APIs
      * Google.Cloud.Vision.V1 (SDK do Google Cloud)
  * **Frontend**:
      * HTML5
      * CSS3
      * JavaScript (com Fetch API)
  * **APIs Externas**:
      * Google Cloud Vision API
      * USDA FoodData Central API

## 🚀 Setup e Configuração

Para rodar este projeto em sua máquina local, siga os passos abaixo.

### Pré-requisitos

1.  **.NET 8 SDK**: [Faça o download e instale a versão mais recente](https://dotnet.microsoft.com/download/dotnet/8.0).
2.  **Um Editor de Código**: Visual Studio Code, Visual Studio 2022 ou JetBrains Rider.
3.  **Live Server (Extensão do VS Code)**: Se for usar o VS Code, a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) é recomendada para servir o frontend.

### 🔑 Chaves de API (Essencial\!)

Para que a aplicação funcione, você precisará de credenciais para as APIs do Google Cloud e da USDA.

1.  **Google Cloud Vision API**:

      * Você precisa ter um projeto no Google Cloud com a API do Vision habilitada.
      * Crie uma **Conta de Serviço** (Service Account) e baixe o arquivo de credenciais JSON.
      * **Instruções detalhadas**: [Guia de Autenticação do Google Cloud](https://cloud.google.com/docs/authentication/getting-started).

2.  **USDA FoodData Central API**:

      * Acesse o site da [FoodData Central API](https://www.google.com/search?q=https://fdc.nal.usda.gov/api-key.html).
      * Preencha o formulário para receber sua chave de API gratuitamente.

### Configurando o Projeto

1.  **Clone o Repositório**:

    ```bash
    git clone https://github.com/seu-usuario/wsisworkshop_2025.git
    cd wsisworkshop_2025
    ```

2.  **Configure a API da USDA**:

      * No diretório `back/`, crie um arquivo chamado `appsettings.Development.json`.
      * Adicione sua chave da USDA API a este arquivo, como no exemplo abaixo:
        ```json
        {
          "Logging": {
            "LogLevel": {
              "Default": "Information",
              "Microsoft.AspNetCore": "Warning"
            }
          },
          "UsdaApiKey": "SUA_CHAVE_DA_USDA_API_VAI_AQUI"
        }
        ```

3.  **Configure a API do Google Cloud Vision**:

      * **Opção 1 (Recomendado)**: Defina uma variável de ambiente `GOOGLE_APPLICATION_CREDENTIALS` que aponte para o caminho do seu arquivo JSON de credenciais do Google Cloud.
        ```bash
        # Exemplo no Windows (PowerShell)
        $env:GOOGLE_APPLICATION_CREDENTIALS="C:\caminho\para\seu-arquivo.json"

        # Exemplo no Linux/macOS
        export GOOGLE_APPLICATION_CREDENTIALS="/caminho/para/seu-arquivo.json"
        ```
      * **Opção 2**: Coloque seu arquivo de credenciais JSON dentro de uma pasta chamada `gl_app_crd` na raiz do diretório `back/`. O `.gitignore` já está configurado para ignorar esta pasta, garantindo que suas credenciais não sejam enviadas para o repositório.

## 🏃‍♀️ Como Executar a Aplicação

1.  **Execute o Backend**:

      * Abra um terminal e navegue até a pasta `back`:
        ```bash
        cd back
        ```
      * Execute o comando para iniciar a API:
        ```bash
        dotnet run
        ```
      * A API estará rodando em `http://localhost:5204` (ou outra porta, verifique o output do terminal).

2.  **Execute o Frontend**:

      * Abra a pasta do projeto no VS Code.
      * Navegue até o arquivo `frontend/index.html`.
      * Clique com o botão direito no arquivo e selecione "Open with Live Server".
      * O seu navegador abrirá a aplicação em um endereço como `http://127.0.0.1:5500`.

Agora você pode interagir com a aplicação, criar refeições e analisar imagens de alimentos\!

## 📚 Tutorial Detalhado

Para um guia passo a passo, com explicações mais aprofundadas sobre o código, os conceitos de Minimal APIs, e como configurar as APIs externas em detalhes, acesse o tutorial completo no Notion:

➡️ **https://www.notion.so/Central-do-Minicurso-2722c1a082988064a969f02c61e8cfdd**

-----
