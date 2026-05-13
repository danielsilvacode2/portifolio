const estados = document.getElementById('estados')


estados.addEventListener('change', async function(){
const uf = this.value; 

const cidades = document.getElementById('cidades')

cidades.innerHTML = '<option>Carregando...</option>'
cidades.disabled = true;

 try{

    const response = await fetch(`https://api-growth.agilize.com.br/v1/outside/cities/uf/${uf}`)
    const dados = await response.json();

    cidades.innerHTML = '<option> Selecione a sua cidade </option>'

    dados.payload.forEach(cidade => {
        const option = document.createElement('option')
        option.value = cidade.id;
        option.textContent = cidade.name;
        cidades.appendChild(option)
    });


   cidades.disabled = false


 }catch(erro){
    console.error("Error ao buscar dados: ", erro)
    cidade.innerHTML = '<option>Erro ao carregar </option>'
 }



})