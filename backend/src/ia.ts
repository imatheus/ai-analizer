export interface ResultadoAnalise {
  nota: number; // 0 a 10
  sentimento_cliente: "positivo" | "neutro" | "insatisfeito" | "irritado";
  resumo: string;
  pontos_fortes: string[];
  pontos_a_melhorar: string[];
  plano_de_acao: string[];
}

const PROMPT_SISTEMA = `
Você é um auditor sênior de qualidade de atendimento ao cliente via WhatsApp.
Sua função é analisar o histórico de conversa fornecido e avaliar a performance do atendente/empresa.

Critérios de avaliação:
1. Cordialidade e empatia com o cliente.
2. Clareza e objetividade nas respostas.
3. Eficiência na resolução do problema ou encaminhamento.
4. Postura profissional e ausência de atritos desnecessários.

REGRAS DE RESPOSTA:
- Retorne OBRIGATORIAMENTE um único objeto JSON válido (sem textos antes ou depois).
- O formato deve seguir estritamente este esquema:
{
  "nota": number (de 0 a 10 com base na qualidade do atendimento prestado),
  "sentimento_cliente": "positivo" | "neutro" | "insatisfeito" | "irritado",
  "resumo": "Breve resumo do que aconteceu no atendimento (máximo 3 frases)",
  "pontos_fortes": ["Ponto forte 1", "Ponto forte 2"],
  "pontos_a_melhorar": ["Ponto a melhorar 1", "Ponto a melhorar 2"],
  "plano_de_acao": ["Ação prática recomendada para o atendente/gestor 1", "Ação 2"]
}
`;

export async function analisarConversa(textoConversa: string): Promise<ResultadoAnalise> {
  const chaveApi = process.env.OPENROUTER_API_KEY;
  const modelo = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

  if (!chaveApi || chaveApi.trim() === "" || chaveApi === "sua_chave_aqui") {
    const erro: any = new Error("Chave da API OpenRouter não configurada. Defina OPENROUTER_API_KEY no arquivo .env");
    erro.status = 500;
    throw erro;
  }

  // Timeout de 40 segundos para evitar travamento da requisição
  const controlador = new AbortController();
  const timer = setTimeout(() => controlador.abort(), 40000);

  try {
    const resposta = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${chaveApi}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI-Analizer WhatsApp"
      },
      signal: controlador.signal,
      body: JSON.stringify({
        model: modelo,
        temperature: 0.2, // Baixa temperatura para respostas consistentes e analíticas
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: PROMPT_SISTEMA },
          { role: "user", content: `Analise a seguinte conversa de WhatsApp:\n\n${textoConversa}` }
        ]
      })
    });

    clearTimeout(timer);

    if (!resposta.ok) {
      const textoErro = await resposta.text().catch(() => "");
      const erro: any = new Error(`Falha no provedor de IA (OpenRouter): ${resposta.statusText}`);
      erro.status = resposta.status === 429 ? 429 : resposta.status === 401 ? 401 : 502;
      erro.detalhes = textoErro;
      throw erro;
    }

    const dados = await resposta.json();
    const conteudo = dados?.choices?.[0]?.message?.content;

    if (!conteudo) {
      const erro: any = new Error("O modelo de IA não retornou conteúdo.");
      erro.status = 502;
      throw erro;
    }

    return parsearResultadoJson(conteudo);
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      const erroTimeout: any = new Error("Tempo limite esgotado: o modelo de IA demorou mais de 40 segundos para responder.");
      erroTimeout.status = 504;
      throw erroTimeout;
    }
    throw err;
  }
}

// Extrai e valida o JSON gerado pelo modelo com fallback seguro
function parsearResultadoJson(texto: string): ResultadoAnalise {
  try {
    return JSON.parse(texto.trim());
  } catch {
    // Fallback: se o modelo colocou blocos de markdown ```json ... ```
    const match = texto.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // Segue para o erro
      }
    }
    const erro: any = new Error("Não foi possível interpretar a resposta da IA como JSON válido.");
    erro.status = 502;
    throw erro;
  }
}
