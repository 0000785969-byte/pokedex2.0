let estadoPokedex = {
    digitando: false,
    idAtual: null,
    isShiny: false,
    dadosAtuais: null
}

let numPokemon = '';

const key1 = document.querySelector('#key-1');
const key2 = document.querySelector('#key-2');
const key3 = document.querySelector('#key-3');
const key4 = document.querySelector('#key-4');
const key5 = document.querySelector('#key-5');
const key6 = document.querySelector('#key-6');
const key7 = document.querySelector('#key-7');
const key8 = document.querySelector('#key-8');
const key9 = document.querySelector('#key-9');
const key10 = document.querySelector('#key-10');
const btnWhiteLeft = document.querySelector('#btn-white-left');
const btnWhiteRight = document.querySelector('#btn-white-right');
const infoScreen = document.querySelector('#info-screen');
const mainScreen = document.querySelector('#main-screen');
const numberDisplay = document.querySelector('#number-display');
const ledYellow = document.querySelector('#led-yellow');

const btnUp = document.querySelector('#btn-up');
const btnDown = document.querySelector('#btn-down');
const btnLeft = document.querySelector('#btn-left');
const btnRight = document.querySelector('#btn-right');

key1.addEventListener('click', () => leituraTeclado('1'));
key2.addEventListener('click', () => leituraTeclado('2'));
key3.addEventListener('click', () => leituraTeclado('3'));
key4.addEventListener('click', () => leituraTeclado('4'));
key5.addEventListener('click', () => leituraTeclado('5'));
key6.addEventListener('click', () => leituraTeclado('6'));
key7.addEventListener('click', () => leituraTeclado('7'));
key8.addEventListener('click', () => leituraTeclado('8'));
key9.addEventListener('click', () => leituraTeclado('9'));
key10.addEventListener('click', () => leituraTeclado('0'));
btnWhiteLeft.addEventListener('click', buscarPokemon);
btnWhiteRight.addEventListener('click', apagar);
ledYellow.addEventListener('click', toggleShiny);

btnLeft.addEventListener('click', () => navegarPokemon(-1)); 
btnRight.addEventListener('click', () => navegarPokemon(1)); 
btnUp.addEventListener('click', () => navegarPokemon(10)); 
btnDown.addEventListener('click', () => navegarPokemon(-10)); 

function leituraTeclado(tecla)
{
    if(!estadoPokedex.digitando)
    {
        infoScreen.textContent = '';
        estadoPokedex.digitando = true;
        numPokemon = '';
    }
    
    if(numPokemon.length < 4)
    {
        numPokemon += tecla;
        infoScreen.textContent = numPokemon;
    }
}

function apagar()
{
    if(estadoPokedex.digitando)
    {
        numPokemon = numPokemon.slice(0, -1);
        if(numPokemon.length < 1)
        {
            estadoPokedex.digitando = false;
            infoScreen.textContent = 'Aguardando dados…';
        }
        else
        {
            infoScreen.textContent = numPokemon;
        }
    }
}

function navegarPokemon(salto) {
    if (!estadoPokedex.idAtual) return; 
    
    let novoId = estadoPokedex.idAtual + salto;
    
    if (novoId < 1) novoId = 1;
    if (novoId > 1025) novoId = 1025;

    numPokemon = novoId.toString();
    estadoPokedex.digitando = false; 
    consultarApi(numPokemon);
}

async function consultarApi(msg)
{
    try
    {
        mainScreen.textContent = 'Carregando...';
        
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${msg}`);
        
        if (!response.ok) {
            throw new Error("Pokémon não encontrado");
        }
        
        const data = await response.json();
        
        estadoPokedex.dadosAtuais = data;
        estadoPokedex.idAtual = data.id;
        estadoPokedex.isShiny = false; 
        ledYellow.setAttribute('aria-pressed', 'false');
        ledYellow.style.filter = 'brightness(1)';

        atualizarNumero(data.id);
        exibirSprite(data);
        await exibirDadosComRegiao(data);
        
    }
    catch(erro)
    {
        console.error(erro);
        mainScreen.textContent = 'Erro!';
        infoScreen.textContent = 'Pokémon não encontrado. Tente outro ID.';
        numeroDisplay.textContent = '#000';
        estadoPokedex.idAtual = null;
    }
}

function buscarPokemon()
{
    if(estadoPokedex.digitando) consultarApi(numPokemon);
}

function exibirSprite(data)
{
    mainScreen.textContent = '';
    const img = document.createElement('img');
    
    const urlImage = estadoPokedex.isShiny 
        ? (data.sprites.front_shiny || data.sprites.front_default) 
        : data.sprites.front_default;
        
    img.src = urlImage;
    img.alt = data.name;
    
    if (window.innerWidth < 600)
    {
        img.style.width = '75px';
    }
    else
    {
        img.style.width = '190px';
        img.style.transform = 'translate(0, -12px)';
    }
    mainScreen.appendChild(img);
}

function atualizarNumero(id)
{

    let idString = id.toString();
    while(idString.length < 4) idString = '0' + idString;
    idString = '#' + idString;
    numberDisplay.textContent = idString;

}

async function exibirDadosComRegiao(data)
{
    infoScreen.textContent = 'Buscando região...'; 
    
    const nome = document.createElement('p');
    nome.textContent = capitalizar(data.name);
    nome.style.fontSize = '1.5rem';
    nome.style.fontWeight = 'bold';
    
    const tipos = data.types.map(t => capitalizar(t.type.name)).join(' / ');
    const tipo = document.createElement('p');
    tipo.textContent = 'Tipo: ' + tipos;
    
    const pesoKg = (data.weight / 10).toFixed(1);
    const alturaM = (data.height / 10).toFixed(1);
    
    const pesoAltura = document.createElement('p');
    pesoAltura.textContent = `Peso: ${pesoKg}kg | Altura: ${alturaM}m`;

    let nomeRegiao = 'Desconhecida';

    try {
        const resSpecies = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${data.id}/`);
        if (resSpecies.ok) {
            const dataSpecies = await resSpecies.json();
            if (dataSpecies.generation) {
                const resGen = await fetch(dataSpecies.generation.url);
                const dataGen = await resGen.json();
                nomeRegiao = capitalizar(dataGen.main_region.name);
            }
        }
    } catch (e) {
        console.log("Não foi possível carregar a região.");
    }

    const regiao = document.createElement('p');
    regiao.textContent = 'Região: ' + nomeRegiao;

    infoScreen.textContent = '';
    infoScreen.append(nome, tipo, pesoAltura, regiao);
}

function capitalizar(texto) {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function toggleShiny() {
    if (!estadoPokedex.dadosAtuais) return; 
    
    estadoPokedex.isShiny = !estadoPokedex.isShiny;
    
    if (estadoPokedex.isShiny) {
        ledYellow.setAttribute('aria-pressed', 'true');
        ledYellow.style.filter = 'brightness(1.5) drop-shadow(0 0 5px yellow)'; 
    } else {
        ledYellow.setAttribute('aria-pressed', 'false');
        ledYellow.style.filter = 'brightness(1)'; 
    }
    
    exibirSprite(estadoPokedex.dadosAtuais);
}
    