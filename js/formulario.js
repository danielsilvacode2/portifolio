
function mostrarOverlay(mensagem) {
  const overlay = document.getElementById('loading-overlay');
  const card = document.getElementById('loading-card');

  const p = document.createElement('p');
  p.id = 'loading-message';
  p.textContent = mensagem;
  card.appendChild(p);

  overlay.style.display = 'flex';
}

function esconderOverlay() {
  const overlay = document.getElementById('loading-overlay');
  const msg = document.getElementById('loading-message');

  overlay.style.display = 'none';
  if (msg) msg.remove();
}



const CAMPOS_OBRIGATORIOS = [
  { id: 'nome',    mensagem: 'O CAMPO NOME É OBRIGATÓRIO'   },
  { id: 'email',   mensagem: 'O CAMPO EMAIL É OBRIGATÓRIO'  },
  { id: 'estados', mensagem: 'O CAMPO ESTADO É OBRIGATÓRIO' },
  { id: 'cidades', mensagem: 'O CAMPO CIDADE É OBRIGATÓRIO' },
];

function marcarErro(inputId, mensagem) {
  const input = document.getElementById(inputId);
  input.classList.add('input-erro');

  const msg = document.createElement('span');
  msg.className = 'msg-erro';
  msg.textContent = mensagem;
  input.insertAdjacentElement('afterend', msg);
}

function limparErros() {
  document.querySelectorAll('.msg-erro').forEach(el => el.remove());
  document.querySelectorAll('.input-erro').forEach(el => el.classList.remove('input-erro'));
}

function validar(nome, email, estado, cidade) {
  limparErros();

  const valores = { nome, email, estados: estado, cidades: cidade };
  let valido = true;

  CAMPOS_OBRIGATORIOS.forEach(({ id, mensagem }) => {
    if (!valores[id]?.trim()) {
      marcarErro(id, mensagem);
      valido = false;
    }
  });

  if (email && !email.includes('@')) {
    marcarErro('email', 'Email inválido');
    valido = false;
  }

  return valido;
}



document.getElementById('estados').addEventListener('change', async function () {
  const uf = this.value;
  const cidades = document.getElementById('cidades');

  cidades.innerHTML = '<option>Carregando...</option>';
  cidades.disabled = true;
  mostrarOverlay('Carregando...');

  try {
    const response = await fetch(`https://api-growth.agilize.com.br/v1/outside/cities/uf/${uf}`);
    const { payload } = await response.json();

    cidades.innerHTML = '<option value="">Selecione a sua cidade</option>';
    payload.forEach(({ id, name }) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = name;
      cidades.appendChild(option);
    });

    cidades.disabled = false;
  } catch (erro) {
    console.error('Erro ao buscar cidades:', erro);
    cidades.innerHTML = '<option>Erro ao carregar</option>';
  } finally {
    esconderOverlay();
  }
});



async function salvar() {
  const nome   = document.getElementById('nome').value;
  const email  = document.getElementById('email').value;
  const estado = document.getElementById('estados').value;
  const cidades = document.getElementById('cidades');


  const cidade = cidades.options[cidades.selectedIndex].text;

  if (!validar(nome, email, estado, cidade)) return;

  if (!grecaptcha.getResponse()) {
    alert('Por favor, prove que você não é um robô clicando no reCAPTCHA.');
    return;
  }

  mostrarOverlay('Enviando os seus dados...');

  try {
    const response = await fetch('http://localhost:8080/usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, estado, cidade }),
    });

    document.querySelector('form').reset();
    grecaptcha.reset();

    if (response.status === 409) {
      marcarErro('email', 'JÁ EXISTE UM USUÁRIO CADASTRADO COM ESTE E-MAIL');
      return;
    }

    if(response.status === 429){
      console.log("abriu o if")
      marcarErro('preenchimento', 'VOCÊ TENTOU MUITAS VEZES AGUARDE UM POUCO')
      return
    }



    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

    const { protocolo } = await response.json();
    exibirProtocolo(protocolo);

  } catch (erro) {
    console.error('Erro ao enviar formulário:', erro);
  } finally {
    esconderOverlay();
  }
}

function exibirProtocolo(protocolo) {
  const btn = document.createElement('button');
  btn.id = 'mgsProtocolo';
  btn.classList.add('show-view');
  btn.textContent = `Cadastro realizado! Protocolo: ${protocolo}`;
  const seletorProtocolo = document.getElementById('protocolo');
  seletorProtocolo.innerHTML = '';
  seletorProtocolo.appendChild(btn);
}

// ─── Limpeza de erros em tempo real ──────────────────────────────────────────

document.querySelectorAll('input, select').forEach(input => {
  input.addEventListener('input', () => {
    input.classList.remove('input-erro');
    const msg = input.nextElementSibling;
    if (msg?.classList.contains('msg-erro')) msg.remove();
  });
});