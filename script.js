// ==============================================================================
// VERIFICAÇÃO DE INTEGRIDADE E DIREITOS AUTORAIS (ENCRIPTADO INTERNAMENTE)
// ==============================================================================
(function verificarDireitosAutorais() {
  // Assinatura encriptada em Base64: "criador@inacio.top.TI@Bandidi"
  const _key = "Y3JpYWRvckBpbmFjaW8udG9wLlRJQEJhbmRpZGk=";
  
  function validarAssinatura() {
    try {
      const declaracao = atob(_key);
      if (!declaracao || declaracao !== "criador@inacio.top.TI@Bandidi") {
        throw new Error();
      }
    } catch (e) {
      document.body.innerHTML = `
        <div style="background-color: #111; color: #ff4d4d; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h1 style="font-size: 1.8rem; margin-bottom: 10px;">⚠️ ERRO DE INTEGRIDADE DO CÓDIGO</h1>
          <p style="font-size: 1rem; color: #ccc; max-width: 480px;">A chave de validação de direitos autorais foi alterada ou removida. O sistema foi bloqueado.</p>
        </div>
      `;
      throw new Error("Execução interrompida: Assinatura de direitos autorais ausente ou inválida.");
    }
  }

  validarAssinatura();
  setInterval(validarAssinatura, 1000);
})();

// ==============================================================================
// ESTRUTURA DE DADOS
// ==============================================================================
let chapas = {
  "11": { nome: "Chapa 1 - Renovação Estudantil", lider: "Lucas Silva (3º A)" },
  "22": { nome: "Chapa 2 - Voz dos Alunos", lider: "Mariana Souza (2º B)" }
};

const SENHA_ADMIN = "9999";
let votos = {};
let numeroDigitado = "";
let votoBranco = false;
let chapaSelecionadaTabela = null;

// ==============================================================================
// ÁUDIO E SINTETIZADOR NATIVO WEB AUDIO API
// ==============================================================================
function tocarBeepTecla() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(1050, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch (e) {}
}

function tocarSomConfirma() {
  const audioEl = document.getElementById("somConfirma");
  if (audioEl) {
    audioEl.currentTime = 0;
    audioEl.play().catch(() => {
      sintetizarPililili();
    });
  } else {
    sintetizarPililili();
  }
}

function sintetizarPililili() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notas = [1250, 1250, 1250, 1250, 1250, 1750];
    const duracoes = [0.07, 0.07, 0.07, 0.07, 0.07, 0.25];
    let tempo = ctx.currentTime;

    notas.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, tempo);
      gain.gain.setValueAtTime(0.15, tempo);
      gain.gain.exponentialRampToValueAtTime(0.01, tempo + duracoes[idx]);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(tempo);
      osc.stop(tempo + duracoes[idx]);
      tempo += duracoes[idx];
    });
  } catch (e) {}
}

// ==============================================================================
// GESTÃO DE CHAPAS E TABELA
// ==============================================================================
function inicializarVotos() {
  votos = {};
  Object.keys(chapas).forEach(num => votos[num] = 0);
  votos["BRANCO"] = 0;
  votos["NULO"] = 0;
}

function atualizarTabelaChapas() {
  const tbody = document.querySelector("#tabelaChapas tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  chapaSelecionadaTabela = null;

  Object.keys(chapas).sort().forEach(num => {
    const info = chapas[num];
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${num}</td><td>${info.nome}</td><td>${info.lider}</td>`;
    tr.onclick = () => {
      document.querySelectorAll("#tabelaChapas tr").forEach(r => r.classList.remove("selected"));
      tr.classList.add("selected");
      chapaSelecionadaTabela = num;
    };
    tbody.appendChild(tr);
  });
}

function adicionarChapa() {
  const num = document.getElementById("numChapa").value.trim();
  const nome = document.getElementById("nomeChapa").value.trim();
  const lider = document.getElementById("liderChapa").value.trim();

  if (num.length !== 2 || isNaN(num)) {
    alert("O número da chapa deve ter exatamente 2 dígitos!");
    return;
  }
  if (!nome) {
    alert("Digite o nome da chapa!");
    return;
  }

  chapas[num] = { nome: nome, lider: lider || "Não informado" };
  document.getElementById("numChapa").value = "";
  document.getElementById("nomeChapa").value = "";
  document.getElementById("liderChapa").value = "";
  atualizarTabelaChapas();
}

function removerChapa() {
  if (!chapaSelecionadaTabela) {
    alert("Selecione uma chapa na tabela para remover!");
    return;
  }
  delete chapas[chapaSelecionadaTabela];
  atualizarTabelaChapas();
}

function exportarExcel() {
  if (Object.keys(chapas).length === 0) {
    alert("Não há chapas cadastradas para exportar!");
    return;
  }

  const totalVotos = Object.values(votos).reduce((a, b) => a + b, 0);
  let csvContent = "\uFEFFRELATÓRIO ELEITORAL - GRÊMIO ESTUDANTIL\n\n";
  csvContent += "NÚMERO;NOME DA CHAPA;LÍDER / PRESIDENTE;VOTOS RECEBIDOS;PERCENTUAL\n";

  Object.keys(chapas).sort().forEach(num => {
    const info = chapas[num];
    const qtd = votos[num] || 0;
    const pct = totalVotos > 0 ? ((qtd / totalVotos) * 100).toFixed(1) : "0.0";
    csvContent += `${num};"${info.nome}";"${info.lider}";${qtd};${pct}%\n`;
  });

  csvContent += "\nRESUMO DE VOTAÇÃO\n";
  csvContent += `Votos em Branco;${votos["BRANCO"] || 0}\n`;
  csvContent += `Votos Nulos;${votos["NULO"] || 0}\n`;
  csvContent += `Total Geral de Votantes;${totalVotos}\n`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "relatorio_votacao_gremio.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ==============================================================================
// LÓGICA DA URNA ELETRÓNICA
// ==============================================================================
function iniciarVotacao() {
  if (Object.keys(chapas).length === 0) {
    alert("Cadastre pelo menos uma chapa antes de iniciar a votação!");
    return;
  }
  inicializarVotos();
  document.getElementById("telaCadastro").classList.add("hidden");
  document.getElementById("telaUrna").classList.remove("hidden");
  corrigeVoto();
}

function pressionarNumero(num) {
  if (votoBranco || numeroDigitado.length >= 2) return;
  tocarBeepTecla();
  numeroDigitado += num;
  atualizarVisor();
}

function votarBranco() {
  tocarBeepTecla();
  numeroDigitado = "";
  votoBranco = true;
  document.getElementById("digito1").innerText = "";
  document.getElementById("digito2").innerText = "";
  document.getElementById("nomeChapaVisor").innerText = "";
  document.getElementById("liderChapaVisor").innerText = "";
  document.getElementById("mensagemAlerta").innerText = "VOTO EM BRANCO";
  document.getElementById("mensagemAlerta").style.color = "#0000d0";
}

function corrigeVoto() {
  tocarBeepTecla();
  numeroDigitado = "";
  votoBranco = false;
  document.getElementById("digito1").innerText = "";
  document.getElementById("digito2").innerText = "";
  document.getElementById("nomeChapaVisor").innerText = "";
  document.getElementById("liderChapaVisor").innerText = "";
  document.getElementById("mensagemAlerta").innerText = "";
}

function atualizarVisor() {
  const d1 = document.getElementById("digito1");
  const d2 = document.getElementById("digito2");
  const nomeV = document.getElementById("nomeChapaVisor");
  const liderV = document.getElementById("liderChapaVisor");
  const alertaV = document.getElementById("mensagemAlerta");

  d1.innerText = numeroDigitado.length >= 1 ? numeroDigitado[0] : "";
  d2.innerText = numeroDigitado.length === 2 ? numeroDigitado[1] : "";

  if (numeroDigitado.length === 2) {
    if (chapas[numeroDigitado]) {
      nomeV.innerText = chapas[numeroDigitado].nome;
      liderV.innerText = chapas[numeroDigitado].lider;
      alertaV.innerText = "";
    } else {
      nomeV.innerText = "";
      liderV.innerText = "";
      alertaV.innerText = "VOTO NULO\n(Chapa Inexistente)";
      alertaV.style.color = "#d00000";
    }
  } else {
    nomeV.innerText = "";
    liderV.innerText = "";
    alertaV.innerText = "";
  }
}

function confirmaVoto() {
  if (!votoBranco && numeroDigitado.length < 2) return;

  if (votoBranco) {
    votos["BRANCO"]++;
  } else if (chapas[numeroDigitado]) {
    votos[numeroDigitado]++;
  } else {
    votos["NULO"]++;
  }

  tocarSomConfirma();
  document.getElementById("ecraFim").classList.remove("hidden");

  setTimeout(() => {
    document.getElementById("ecraFim").classList.add("hidden");
    corrigeVoto();
  }, 2300);
}

// ==============================================================================
// PAINEL DO MESÁRIO E MODAIS
// ==============================================================================
function abrirModalSenha() {
  document.getElementById("inputSenhaMesario").value = "";
  document.getElementById("modalSenha").classList.remove("hidden");
}

function fecharModalSenha() {
  document.getElementById("modalSenha").classList.add("hidden");
}

function verificarSenhaMesario() {
  const pwd = document.getElementById("inputSenhaMesario").value;
  if (pwd === SENHA_ADMIN) {
    fecharModalSenha();
    document.getElementById("modalOpcoesMesario").classList.remove("hidden");
  } else {
    alert("Senha incorreta!");
  }
}

function fecharModalOpcoes() {
  document.getElementById("modalOpcoesMesario").classList.add("hidden");
}

function verApuracaoVotos() {
  fecharModalOpcoes();
  const totalVotos = Object.values(votos).reduce((a, b) => a + b, 0);
  let resHtml = `<p><strong>TOTAL DE VOTANTES: ${totalVotos}</strong></p><hr style="margin:10px 0;">`;

  Object.keys(chapas).sort().forEach(num => {
    const qtd = votos[num] || 0;
    const pct = totalVotos > 0 ? ((qtd / totalVotos) * 100).toFixed(1) : "0.0";
    resHtml += `<p style="text-align:left; margin:6px 0;"><strong>${chapas[num].nome}:</strong><br>➜ ${qtd} votos (${pct}%)</p>`;
  });

  resHtml += `<hr style="margin:10px 0;">`;
  resHtml += `<p style="text-align:left;">Votos em Branco: ${votos["BRANCO"] || 0}</p>`;
  resHtml += `<p style="text-align:left;">Votos Nulos: ${votos["NULO"] || 0}</p>`;

  document.getElementById("conteudoApuracao").innerHTML = resHtml;
  document.getElementById("modalApuracao").classList.remove("hidden");
}

function fecharModalApuracao() {
  document.getElementById("modalApuracao").classList.add("hidden");
}

function voltarAoCadastro() {
  fecharModalOpcoes();
  document.getElementById("telaUrna").classList.add("hidden");
  document.getElementById("telaCadastro").classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  atualizarTabelaChapas();
});