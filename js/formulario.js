const estados = document.getElementById('estados')


estados.addEventListener('change', async function () {
   const uf = this.value;

   const cidades = document.getElementById('cidades')

   cidades.innerHTML = '<option>Carregando...</option>'
   cidades.disabled = true;

   try {

      const response = await fetch(`https://api-growth.agilize.com.br/v1/outside/cities/uf/${uf}`)
      const dados = await response.json();

      cidades.innerHTML = '<option value = ""> Selecione a sua cidade </option>'

      dados.payload.forEach(cidade => {
         const option = document.createElement('option')
         option.value = cidade.id;
         option.textContent = cidade.name;
         cidades.appendChild(option)
      });


      cidades.disabled = false


   } catch (erro) {
      console.error("Error ao buscar dados: ", erro)
      cidade.innerHTML = '<option>Erro ao carregar </option>'
   }



})


async function salvar() {

   const overlay = document.getElementById('loading-overlay');

   try {
      const nome = document.getElementById('nome').value;
      const email = document.getElementById('email').value;
      const estado = document.getElementById('estados').value;
      const cidade = document.getElementById('cidades').value;

      if (!validar(nome, email, estado, cidade)) return;

      const recaptchaResponse = grecaptcha.getResponse();

      if (recaptchaResponse.length === 0) {
         alert("Por favor, prove que você não é um robô clicando no reCAPTCHA.");
         return
      }



      overlay.style.display = 'flex';

      const usuario = {
         nome: nome,
         email: email,
         estado: estado,
         cidade: cidade
      }




      const response = await fetch('http://localhost:8080/usuario', {
         method: 'POST',
         headers: { 'Content-type': 'application/json' },
         body: JSON.stringify(usuario)
      });



      document.querySelector('form').reset();
      grecaptcha.reset();


      if (response.status === 409) {
         const input = document.getElementById('email');
         input.classList.add('input-erro');

         const msg = document.createElement('span');
         msg.className = 'msg-erro';
         msg.textContent = ' JÁ EXISTE UM USUARIO CADASTRADO COM ESTE E-MAIL ';
         input.insertAdjacentElement('afterend', msg);

         return;
      }

      if (!response.ok) throw new Error(`Erro: ${response.status}`);

      const data = await response.json();


      const protocolo = document.getElementById('protocolo')


      const msgProtocolo = document.createElement('button');
      msgProtocolo.id = 'mgsProtocolo';
      msgProtocolo.classList.add('show-view');
      msgProtocolo.textContent = `Cadastro realizado! Protocolo: ${data.protocolo}`

      protocolo.appendChild(msgProtocolo);

   } catch (erro) {
      console.error("Error ao enviar formulario: ", erro)


   } finally {
      overlay.style.display = 'none';
   }

}

function validar(nome, email, estado, cidade) {

   document.querySelectorAll('.msg-erro').forEach(e => e.remove());
   document.querySelectorAll('.input-erro').forEach(e => e.classList.remove('input-erro'));

   const campos = [
      { id: 'nome', valor: nome, mensagem: 'O CAMPO NOME É OBRIGATORIO ' },
      { id: 'email', valor: email, mensagem: 'O CAMPO EMAIL É OBRIGATORIO' },
      { id: 'estados', valor: estado, mensagem: 'O CAMPO ESTADO É OBRIGATORIO ' },
      { id: 'cidades', valor: cidade, mensagem: 'O CAMPO CIDADE É OBRIGATORIO ' },
   ];

   let valido = true;

   campos.forEach(campo => {
      if (!campo.valor || campo.valor.trim() === '') {
         valido = false;

         const input = document.getElementById(campo.id);
         input.classList.add('input-erro');

         const msg = document.createElement('span');
         msg.className = 'msg-erro';
         msg.textContent = ` ${campo.mensagem}`;
         input.insertAdjacentElement('afterend', msg);
      }
   });

   if (email && !email.includes('@')) {
      valido = false;

      const input = document.getElementById('email');
      input.classList.add('input-erro');

      const msg = document.createElement('span');
      msg.className = 'msg-erro';
      msg.textContent = ' Email inválido';
      input.insertAdjacentElement('afterend', msg);
   }

   return valido;
}


document.querySelectorAll('input, select').forEach(input => {
   input.addEventListener('input', () => {
      input.classList.remove('input-erro');
      const msg = input.nextElementSibling;
      if (msg?.classList.contains('msg-erro')) msg.remove();
   });
});
