# Relatório de Testes Unitários — EventHub

## 1. Introdução

Este relatório apresenta os testes unitários implementados no backend do EventHub, cobrindo os controllers de autenticação (`authController`) e de eventos (`eventosController`). Os testes foram escritos com Jest, utilizando mocks da camada de banco de dados (`conexaoDB`) para isolar a lógica de negócio, sem depender de uma conexão real ao MySQL.

## 2. Ambiente de testes

- **Framework:** Jest 30.4.2
- **Estratégia:** mock do módulo `conexaoDB` via `jest.mock`, simulando retornos do banco de dados
- **Local dos testes:** `backend/testes/`
- **Comando de execução:**
```bash
  cd backend
  npm test
```

## 3. Testes implementados

### 3.1 `authController.test.js`

| Teste | Cenário | Resultado esperado | Resultado obtido |
|---|---|---|---|
| Cadastro com campos vazios | Erro de validação | 400 | ✅ Passou |
| Cadastro com e-mail já existente | Conflito | 409 | ✅ Passou |
| Cadastro com dados válidos | Sucesso | 201 | ✅ Passou |
| Login com e-mail inexistente | Erro de autenticação | 401 | ✅ Passou |

### 3.2 `eventosController.test.js`

| Teste | Cenário | Resultado esperado | Resultado obtido |
|---|---|---|---|
| Criação de evento sem campos obrigatórios | Erro de validação | 400 | ✅ Passou |
| Criação de evento com dados válidos | Sucesso | 201 | ✅ Passou |
| Falha simulada de banco ao criar evento | Erro interno | 500 | ✅ Passou |
| Busca de eventos de um usuário específico | Sucesso | Lista de eventos retornada | ✅ Passou |
| Exclusão de evento existente | Sucesso | Confirmação de exclusão | ✅ Passou |

## 4. Resultado da execução

Test Suites: 2 passed, 2 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        ~2s

## 5. Cobertura de cenários

Os testes cobrem, para cada controller:

- **Validação de entrada** — campos obrigatórios ausentes ou inválidos
- **Fluxo de sucesso** — operação concluída com os dados corretos
- **Conflito de regra de negócio** — e-mail duplicado no cadastro
- **Falha de infraestrutura** — erro simulado de conexão com o banco de dados
- **Consulta e exclusão de dados** — leitura e remoção de registros existentes

## 6. Conclusão

Os testes unitários implementados validam os principais fluxos de sucesso e erro dos controllers de autenticação e de eventos do EventHub. Todos os 9 testes passaram na execução mais recente, confirmando que as regras de negócio — validação de dados, tratamento de conflitos, respostas de erro e operações de CRUD sobre eventos — se comportam conforme o esperado. Os mocks da camada de banco de dados garantiram que os testes fossem executados de forma isolada e reprodutível, sem depender de um ambiente MySQL ativo.