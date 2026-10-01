import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { analisarConversa } from "./ia.js";

const app = express();
const porta = process.env.PORT || 3001;

// Configuração de middlewares
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Rota de verificação de integridade (Health Check)
app.get("/status", (_req: Request, res: Response) => {
  res.json({
    status: "online",
    servico: "ai-analizer-backend",
    horario: new Date().toISOString()
  });
});

// Rota principal: Analisar histórico do WhatsApp
app.post("/analisar", async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversa } = req.body;

    // 1. Validação de presença e tipo
    if (!conversa || typeof conversa !== "string") {
      res.status(400).json({
        erro: "Requisição inválida",
        mensagem: "O campo 'conversa' é obrigatório e deve ser um texto."
      });
      return;
    }

    const textoLimpo = conversa.trim();

    // 2. Validação de tamanho mínimo
    if (textoLimpo.length < 20) {
      res.status(400).json({
        erro: "Conteúdo insuficiente",
        mensagem: "O histórico da conversa é muito curto. Envie pelo menos 20 caracteres."
      });
      return;
    }

    // 3. Validação de tamanho máximo (proteção contra payloads abusivos / estouro de contexto)
    if (textoLimpo.length > 40000) {
      res.status(400).json({
        erro: "Tamanho excedido",
        mensagem: "O texto da conversa excede o limite máximo permitido de 40.000 caracteres."
      });
      return;
    }

    // 4. Execução da análise via IA Generativa
    const resultado = await analisarConversa(textoLimpo);

    res.status(200).json({
      sucesso: true,
      dados: resultado
    });
  } catch (erro: any) {
    const statusHttp = erro.status || 500;
    const mensagemErro = erro.message || "Erro interno ao processar a análise da conversa.";

    console.error(`[ERRO ${statusHttp}]:`, mensagemErro, erro.detalhes || "");

    res.status(statusHttp).json({
      erro: "Falha na análise",
      mensagem: mensagemErro,
      codigo_status: statusHttp
    });
  }
});

// Inicialização do servidor
app.listen(porta, () => {
  console.log(`[AI-ANALIZER] Servidor rodando com sucesso em http://localhost:${porta}`);
  console.log(`[AI-ANALIZER] Rota de análise pronta: POST http://localhost:${porta}/analisar`);
});
