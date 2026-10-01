# AI-Analizer — Auditoria de Atendimentos WhatsApp com IA Generativa

A aplicação recebe o histórico de conversas do WhatsApp (via arquivo `.txt` ou texto colado) e realiza uma auditoria completa através de um Modelo de Linguagem Grande (LLM via OpenRouter), gerando diagnóstico com nota de 0 a 10, análise de sentimento, pontos fortes, oportunidades de melhoria e plano de ação executivo.

---

## 📌 Categoria do Projeto
* **Categoria:** **Classificação / Análise** (com geração estruturada de diagnóstico e plano de ação).

---

## 📊 Sistema de Avaliação e Status

O modelo de Inteligência Artificial audita a transcrição do atendimento e atribui uma nota de **0 a 10** baseada em critérios rigorosos de qualidade, como:
- **Resolução do problema:** O cliente teve sua demanda atendida de forma direta e efetiva?
- **Tempo e clareza:** O atendente foi ágil e evitou jargões que confundem o cliente?
- **Tom de voz e empatia:** Houve cordialidade, profissionalismo e paciência?
- **Aderência a processos:** O atendente seguiu os protocolos de segurança e conformidade exigidos?

Com base na nota gerada pela IA, a aplicação classifica a interação automaticamente em **4 níveis de status** visuais:

* 🟢 **EXCELENTE (Nota 9 a 10):** Atendimento impecável. O problema foi resolvido de forma rápida, empática e sem gerar fricção.
* 🟡 **BOM (Nota 7 a 8):** Atendimento satisfatório. O problema foi resolvido, mas houve pequenas falhas de comunicação, lentidão ou falta de proatividade.
* 🟠 **ALERTA (Nota 5 a 6):** Atendimento fraco. A resolução foi parcial, gerou confusão ou exigiu esforço desnecessário por parte do cliente.
* 🔴 **CRÍTICO (Nota 0 a 4):** Falha grave. O problema não foi resolvido, houve quebra de protocolo, desrespeito ou atrito direto com o cliente. Exige intervenção de supervisão.

---

## 🛠️ Tecnologias Utilizadas
* **Backend:** Node.js, TypeScript, Express, `dotenv`, `cors`, `tsx`.
* **Frontend:** React, Vite, CSS puro (tipografia e estética minimalista estilo Consolas/Terminal).
* **IA / Provedor:** OpenRouter API (`openai/gpt-4o-mini`, `meta-llama/llama-3.3-70b-instruct` ou equivalente) com contrato estrito de saída em JSON.

---

## 📂 Estrutura do Repositório

```text
ai-analizer/
├── backend/
│   ├── src/
│   │   ├── ia.ts            # Integração OpenRouter, prompt do auditor e parser JSON seguro
│   │   └── servidor.ts      # Servidor Express, middlewares, validações e rotas HTTP
│   ├── .env.example         # Template de variáveis de ambiente
│   ├── .gitignore           # Bloqueia vazamento de chaves .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Interface minimalista (upload .txt, feedback e resultados)
│   │   ├── index.css        # Estilo Consolas monocromático
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md                # Documentação e roteiro da apresentação
```

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos
* Node.js v18 ou superior instalado.
* Chave de API da OpenRouter (obtenha gratuitamente ou recarregue em [openrouter.ai/keys](https://openrouter.ai/keys)).

---

### 2. Configurando e Rodando o Backend

1. Abra o terminal na pasta `backend`:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie o arquivo `.env` com base no `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Edite o arquivo `.env` e insira sua chave da OpenRouter:
   ```env
   PORT=3001
   OPENROUTER_API_KEY=sk-or-v1-sua-chave-aqui
   OPENROUTER_MODEL=openai/gpt-4o-mini
   ```
5. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
   *O backend estará rodando em `http://localhost:3001`.*

---

### 3. Configurando e Rodando o Frontend

1. Abra outro terminal na pasta `frontend`:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor Vite:
   ```bash
   npm run dev
   ```
4. Abra o navegador no endereço exibido (geralmente `http://localhost:3000`).

---

## 📡 Rotas da API

### `GET /status`
Verifica se a API está online e operante.
* **Resposta (200 OK):**
  ```json
  {
    "status": "online",
    "servico": "ai-analizer-backend",
    "horario": "2026-10-01T18:00:00.000Z"
  }
  ```

---

### `POST /analisar`
Recebe o texto da conversa e devolve a auditoria feita pela IA.
* **Headers:** `Content-Type: application/json`
* **Body:**
  ```json
  {
    "conversa": "[14:00, 01/10/2026] Cliente: Olá, preciso de ajuda com minha fatura..."
  }
  ```

* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "sucesso": true,
    "dados": {
      "nota": 8.5,
      "sentimento_cliente": "positivo",
      "resumo": "O cliente solicitou auxílio com a liberação de acesso e o atendente resolveu com liberação manual em 10 minutos.",
      "pontos_fortes": [
        "Atendimento educado e acolhedor",
        "Resolução efetiva do problema sem transferir para outro setor"
      ],
      "pontos_a_melhorar": [
        "Houve um intervalo de 13 minutos sem comunicação durante a verificação"
      ],
      "plano_de_acao": [
        "Avisar o cliente previamente quando a validação for demorar mais de 5 minutos",
        "Implementar mensagem de status intermediária"
      ]
    }
  }
  ```

* **Respostas de Erro:**
  * `400 Bad Request`: Conversa ausente, menor que 20 caracteres ou maior que 40.000 caracteres.
  * `401 Unauthorized`: Chave de API da OpenRouter incorreta ou não informada.
  * `429 Too Many Requests`: Limite de requisições do provedor de IA atingido.
  * `504 Gateway Timeout`: IA demorou mais de 40 segundos para responder (controlado via `AbortController`).
  * `502 / 500`: Falha de conexão ou resposta inválida da IA.

---

## 🧠 Engenharia de Prompt e Segurança

1. **Persona & Delimitação de Papel:** O modelo é instruído estritamente como um *auditor sênior de atendimento ao cliente via WhatsApp*, avaliando cordialidade, clareza, tempo aparente e resolução.
2. **Formato JSON Garantido:** O prompt utiliza `response_format: { type: "json_object" }` e inclui uma camada de *fallback* regex no backend (`parsearResultadoJson`), evitando que a aplicação quebre se o modelo envolver o JSON em markdown.
3. **Temperatura Baixa (0.2):** Garante respostas consistentes, determinísticas e sem divagações criativas desnecessárias.
4. **Proteção de Chaves:** As credenciais nunca são expostas ao cliente frontend nem comitadas no Git (`.env` explicitamente listado no `.gitignore`).
