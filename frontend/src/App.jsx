import React, { useState, useEffect } from 'react';
import './index.css';

// --- SISTEMA DE ÁUDIO NATIVO (WEB AUDIO API) ---
let audioCtx = null;
let processingInterval = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

const playProcessingSound = () => {
  initAudio();
  if (!audioCtx) return;

  // Som fofo e gostoso (como pequenas gotas de água ou xilofone de ninar)
  const notes = [523.25, 587.33, 659.25, 783.99, 880.00]; // Escala pentatônica maior (muito agradável)

  const playSoftBubble = () => {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    // Escolhe uma nota aleatória da escala para criar um som orgânico
    const freq = notes[Math.floor(Math.random() * notes.length)];
    
    osc.type = 'sine'; // Onda senoidal é a mais suave e arredondada
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    // Curva de volume: ataque rápido, decaimento suave (estilo gota/xilofone)
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.03); 
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  };

  playSoftBubble();
  // Toca uma nova bolha suave a cada 350ms
  processingInterval = setInterval(playSoftBubble, 350);
};

const stopProcessingSound = () => {
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = null;
  }
};

const playSuccessSound = () => {
  initAudio();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  // Acorde feliz/conclusão tech
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
  osc.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.1); // C#5
  osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2); // E5
  osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.3); // A5
  
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.8);
};

const playErrorSound = () => {
  initAudio();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  // Som de erro grave (buzz)
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
  
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
};
// -----------------------------------------------


const CONVERSA_EXEMPLO = `[14:02, 01/10/2026] Cliente: Boa tarde, fiz o pagamento do plano trimestral mas ainda não liberou meu acesso. Pode me ajudar?
[14:05, 01/10/2026] Atendente: Olá! Boa tarde. Seja bem-vindo ao suporte.
[14:06, 01/10/2026] Atendente: Poderia me informar o e-mail cadastrado e o comprovante do pagamento, por favor?
[14:07, 01/10/2026] Cliente: O e-mail é cliente@empresa.com. Segue o comprovante em anexo.
[14:15, 01/10/2026] Atendente: Só um instante.
[14:28, 01/10/2026] Cliente: Conseguiu verificar? Estou precisando usar o sistema agora.
[14:35, 01/10/2026] Atendente: Verifiquei aqui. O banco demorou para compensar o PIX, mas já aprovei manualmente. Tente logar novamente.
[14:37, 01/10/2026] Cliente: Deu certo agora, obrigado pela ajuda!
[14:38, 01/10/2026] Atendente: De nada. Algo mais?
[14:39, 01/10/2026] Cliente: Só isso mesmo.
[14:39, 01/10/2026] Atendente: Tenha uma boa tarde.`;

export default function App() {
  const [conversa, setConversa] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [tema, setTema] = useState('light');

  // Aplicar tema no documento HTML
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
  }, [tema]);

  const toggleTema = () => {
    setTema(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Trava 1: Tipo do arquivo
    if (!file.name.toLowerCase().endsWith('.txt') && file.type !== 'text/plain') {
      setErro('ARQUIVO INVÁLIDO. APENAS FORMATO .TXT É PERMITIDO.');
      playErrorSound();
      e.target.value = '';
      return;
    }

    // Trava 2: Maior que 1GB (1024 * 1024 * 1024 bytes)
    const umGigabyte = 1024 * 1024 * 1024;
    if (file.size > umGigabyte) {
      setErro('ARQUIVO MUITO GRANDE (> 1GB). OPERAÇÃO DE LEITURA BLOQUEADA.');
      playErrorSound();
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      let conteudo = event.target.result || '';
      
      // Bloqueio Hard/Truncamento: Mais de 40.000 caracteres
      if (conteudo.length > 40000) {
        setErro(`AVISO DE LIMITAÇÃO: O arquivo possuía ${conteudo.length.toLocaleString()} caracteres. Para evitar quebra de modelo, o texto foi cortado no limite cravado de 40.000 caracteres.`);
        playErrorSound();
        conteudo = conteudo.slice(0, 40000);
      } else {
        setErro(null);
      }
      
      setConversa(conteudo);
      setResultado(null);
    };
    
    // Ler o arquivo
    reader.readAsText(file);
    
    // Limpa o input para permitir upload do mesmo arquivo novamente se necessário
    e.target.value = '';
  };

  const handleCarregarExemplo = () => {
    setConversa(CONVERSA_EXEMPLO);
    setErro(null);
    setResultado(null);
  };

  const handleLimpar = () => {
    setConversa('');
    setErro(null);
    setResultado(null);
  };

  const handleAnalisar = async () => {
    const textoLimpo = conversa.trim();
    if (!textoLimpo) {
      setErro('INSIRA DADOS ANTES DE CONTINUAR.');
      return;
    }

    if (textoLimpo.length < 20) {
      setErro('DADOS INSUFICIENTES. MÍNIMO DE 20 CARACTERES.');
      return;
    }

    setCarregando(true);
    setErro(null);
    setResultado(null);
    playProcessingSound();

    try {
      const response = await fetch('http://localhost:3333/analisar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conversa: textoLimpo })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || `Erro ${response.status}: Falha na análise.`);
      }

      setResultado(data.dados);
      playSuccessSound();
    } catch (err) {
      setErro(err.message || 'FALHA DE CONEXÃO COM O SERVIDOR (PORTA 3333).');
      playErrorSound();
    } finally {
      setCarregando(false);
      stopProcessingSound();
    }
  };

  // Garante que o som pare se o componente for desmontado
  useEffect(() => {
    return () => stopProcessingSound();
  }, []);

  const getStatusInfo = (nota) => {
    if (nota >= 9) return { texto: 'EXCELENTE', cor: '#d1fae5', textCor: '#065f46' }; // Pastel Green
    if (nota >= 7) return { texto: 'BOM', cor: '#fef3c7', textCor: '#92400e' }; // Pastel Yellow
    if (nota >= 5) return { texto: 'ALERTA', cor: '#ffedd5', textCor: '#9a3412' }; // Pastel Orange
    return { texto: 'CRÍTICO', cor: '#ffe4e6', textCor: '#be123c' }; // Pastel Red
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <img 
            src="https://img.icons8.com/led/32/octopus.png" 
            alt="Octopus Logo" 
            style={{ 
              width: '30px', 
              height: '30px', 
              filter: tema === 'light' ? 'invert(1)' : 'invert(0)' 
            }} 
          />
          ai.Analizer
        </div>

        <button onClick={toggleTema} className="theme-toggle" title="Alternar Modo">
          {tema === 'light' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </button>
      </header>

      {/* Main Content */}
      <div className="main-content">
        <div className="interaction-panel">
          {!resultado ? (
            <>
              <div className="interaction-intro">
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <strong>AUDITORIA DE ATENDIMENTO</strong>
                </div>
                Utilizamos modelos de IA Generativa para analisar transcrições e históricos de conversa de WhatsApp. Nosso sistema decodifica interações reais, extraindo o sentimento do cliente, avaliando a resolução de problemas e mapeando padrões de comunicação.
                <br/><br/>
                O resultado não é apenas uma nota: é um diagnóstico profundo com pontos de fricção e um protocolo de ação validado.
              </div>

              {erro && (
                <div style={{ border: '1px solid var(--text-color)', padding: '12px', marginBottom: '24px', background: 'var(--text-color)', color: 'var(--bg-color)', fontSize: '13px' }}>
                  [FALHA DE SISTEMA]: {erro}
                </div>
              )}

              <div className="form-group">
                <textarea
                  className="textarea-brutalist"
                  placeholder="COLE O HISTÓRICO DA CONVERSA AQUI PARA INICIAR A SIMULAÇÃO..."
                  value={conversa}
                  onChange={(e) => setConversa(e.target.value)}
                  disabled={carregando}
                  maxLength={40000}
                />
                <div className="action-links">
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={handleCarregarExemplo} className="action-link" disabled={carregando}>[carregar.exemplo]</button>
                    <label className="action-link" style={{ cursor: 'pointer' }}>
                      [upload.txt]
                      <input type="file" accept=".txt" onChange={handleFileUpload} style={{ display: 'none' }} disabled={carregando} />
                    </label>
                    {conversa && <button onClick={handleLimpar} className="action-link" disabled={carregando}>[limpar.buffer]</button>}
                  </div>
                  <span>{conversa.length} / 40000</span>
                </div>
              </div>

              <button className="btn-brutalist" onClick={handleAnalisar} disabled={carregando || !conversa.trim()}>
                {carregando ? <div className="loader-square"></div> : 'Analisar'}
              </button>
            </>
          ) : (
            <div className="result-container">
              <button onClick={() => setResultado(null)} className="action-link" style={{ marginBottom: '30px' }}>
                [ &lt; NOVA SIMULAÇÃO ]
              </button>

              <div className="result-header">
                <div>
                  <div style={{ fontSize: '12px', marginBottom: '8px', color: '#555' }}>ÍNDICE DE DESEMPENHO</div>
                  <div className="score-huge">{resultado.nota}/10</div>
                </div>
                <div 
                  className="sentiment" 
                  style={{ 
                    backgroundColor: getStatusInfo(resultado.nota).cor, 
                    color: getStatusInfo(resultado.nota).textCor,
                    borderColor: getStatusInfo(resultado.nota).textCor
                  }}
                >
                  {getStatusInfo(resultado.nota).texto}
                </div>
              </div>

              <div className="result-section">
                <div className="result-title">SÍNTESE DA INTERAÇÃO</div>
                <div>{resultado.resumo}</div>
              </div>

              <div className="result-section">
                <div className="result-title">VETORES POSITIVOS</div>
                <ul className="result-list">
                  {resultado.pontos_fortes.map((p, i) => <li key={i}><div>{p}</div></li>)}
                </ul>
              </div>

              <div className="result-section">
                <div className="result-title">PONTOS DE FRICÇÃO</div>
                <ul className="result-list">
                  {resultado.pontos_a_melhorar.map((p, i) => <li key={i}><div>{p}</div></li>)}
                </ul>
              </div>

              <div className="result-section">
                <div className="result-title">PROTOCOLO DE AÇÃO</div>
                <ul className="result-list">
                  {resultado.plano_de_acao.map((p, i) => <li key={i}><div>{p}</div></li>)}
                </ul>
              </div>

            </div>
          )}
        </div>
      </div>

      <div className="bottom-right-text">
        Simulamos cenários.<br/>
        Antecipamos comportamentos.<br/>
        Reduzimos incertezas.
      </div>
    </div>
  );
}
