const tecnologias = document.querySelectorAll('.tec');
const containerExplicacao = document.querySelector('.explicao-tecnologia');
const textoExplicativo = document.querySelector('#texto-explicativo');

tecnologias.forEach(tec => {
    tec.addEventListener('click', () => {

        const novaDescricao = tec.getAttribute('data-desc');


        textoExplicativo.innerText = novaDescricao;

        if (textoExplicativo.innerText === novaDescricao) {
            containerExplicacao.classList.toggle('show-tec');
        } else {
            textoExplicativo.innerText = novaDescricao;
            containerExplicacao.classList.add('show-tec');
        }
    });
});