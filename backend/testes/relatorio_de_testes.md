# Relatório de Atividades Pendentes — Testes Unitários

## 1. Introdução

Este relatório apresenta as atividades que ainda serão realizadas no projeto para a implementação dos testes unitários. O objetivo é organizar as próximas etapas do desenvolvimento, garantindo que as principais funcionalidades do sistema sejam testadas corretamente e que possíveis erros sejam identificados antes da entrega final.

---

## 2. Atividades que ainda serão realizadas

### 2.1 Analisar a estrutura atual do projeto

A primeira etapa será analisar a organização dos arquivos do projeto, identificando onde estão localizados os controllers, routes, middlewares, arquivos de configuração e conexão com o banco de dados.

Essa análise será importante para definir quais partes do sistema devem ser testadas primeiro e como os testes serão organizados.

---

### 2.2 Configurar o ambiente de testes

Será feita a configuração do ambiente de testes utilizando o Jest. Para isso, será necessário instalar a biblioteca no projeto e adicionar o comando de execução dos testes no arquivo `package.json`.

Também será criada uma pasta específica para armazenar os arquivos de teste, mantendo o projeto mais organizado.

---

### 2.3 Criar testes para os controllers

Depois da configuração, serão criados testes unitários para os controllers do sistema, principalmente aqueles responsáveis pelas funcionalidades principais, como criação, listagem, edição e exclusão de eventos.

Esses testes irão verificar se as funções respondem corretamente quando recebem dados válidos e inválidos.

---

### 2.4 Simular requisições e respostas

Como os controllers normalmente usam objetos `req` e `res` do Express, será necessário criar simulações desses objetos nos testes.

Dessa forma, será possível testar o comportamento das funções sem precisar iniciar o servidor ou acessar o sistema pelo navegador.

---

### 2.5 Criar mocks para dependências externas

Caso alguma função dependa do banco de dados ou de outros arquivos externos, serão utilizados mocks para simular essas dependências.

Isso é importante porque o teste unitário deve testar uma parte específica do sistema de forma isolada, sem depender diretamente do banco de dados real.

---

### 2.6 Testar cenários de sucesso

Serão criados testes para verificar os casos em que o sistema deve funcionar corretamente, como:

* Criar um evento com dados válidos;
* Listar eventos cadastrados;
* Editar informações de um evento;
* Excluir um evento existente;
* Realizar logout do usuário corretamente.

---

### 2.7 Testar cenários de erro

Também serão criados testes para situações em que o sistema deve retornar erro, como:

* Tentar criar evento com campos vazios;
* Enviar dados em formato inválido;
* Tentar excluir um evento inexistente;
* Simular erro na conexão com o banco;
* Tentar acessar funcionalidades sem autenticação.

---

### 2.8 Executar os testes

Após a criação dos testes, eles serão executados pelo terminal utilizando o comando:

```bash
npm test
```

Com isso, será possível verificar quais testes passaram e quais apresentaram falhas.

---

### 2.9 Corrigir possíveis erros encontrados

Caso algum teste falhe, será feita a análise do erro para identificar se o problema está no teste ou no próprio código do sistema.

Depois disso, as correções necessárias serão aplicadas para garantir que a funcionalidade esteja funcionando corretamente.

---

### 2.10 Documentar os resultados

Por fim, será elaborado um relatório final com os testes realizados, os resultados obtidos e a conclusão sobre a qualidade das funcionalidades testadas.

Esse relatório servirá como registro do processo de validação do sistema.

---

## 3. Cronograma das próximas etapas

| Etapa | Atividade                           | Status   |
| ----- | ----------------------------------- | -------- |
| 1     | Analisar a estrutura do projeto     | Pendente |
| 2     | Instalar e configurar o Jest        | Pendente |
| 3     | Criar pasta de testes               | Pendente |
| 4     | Criar testes dos controllers        | Pendente |
| 5     | Criar mocks do banco de dados       | Pendente |
| 6     | Testar cenários de sucesso          | Pendente |
| 7     | Testar cenários de erro             | Pendente |
| 8     | Executar os testes                  | Pendente |
| 9     | Corrigir erros encontrados          | Pendente |
| 10    | Elaborar relatório final dos testes | Pendente |

---

## 4. Conclusão

As próximas etapas do projeto serão voltadas para a criação e execução dos testes unitários. Esses testes serão importantes para verificar se as principais funcionalidades do sistema estão funcionando corretamente de forma isolada.

Com a implementação dos testes, o projeto ficará mais seguro, organizado e confiável, facilitando futuras alterações no código e diminuindo a chance de erros durante o desenvolvimento.
