

// Captura a referência aos elementos de resultado
const resultado = document.getElementById('resultado')
const resultado2 = document.querySelector('#resultado2')

// Cria as variáveis de longitude e latitude a nível global
let latitude = 0;
let longitude = 0;

// Verifica se há uma última localização salva no localStorage ao carregar a página
window.onload = function() {
    if(localStorage.getItem("latitude") && localStorage.getItem("longitude")) {
        latitude = parseFloat(localStorage.getItem("latitude"));
        longitude = parseFloat(localStorage.getItem("longitude"));
        
        // Exibe a localização salva com uma mensagem explicativa
        resultado.innerHTML = `
            <h5>🗺️ Sua última localização salva:</h5>
            Latitude: ${latitude}<br>
            Longitude: ${longitude}<br>
            <a href="https://www.google.com.br/maps/@${latitude},${longitude},20z?entry=ttu" target='_blank'>
                <h4> Ver no Google Maps</h4>
            </a>
        `;
        atualizaMapa(latitude, longitude);
    }
}



// Função que pega a localização
function pegarLocalizacao(){
    // Verifica se o navegador suporta o recurso de geolocalização
    if(navigator.geolocation){
        // Se suportar, tenta obter a posição atual do usuário
        // O método getCurrentPosition recebe duas funções:
        // - A primeira (mostrarPosicao) é chamada se a localização for obtida com sucesso
        // - A segunda (mostrarErro) é chamada se a localização der erro
        // - A terceira (opcional) permite personalizações

        navigator.geolocation.getCurrentPosition(mostrarPosicao, mostrarErro,{
            enableHighAccuracy: true, // Pede mais precisão
            timeout: 10000, //Espera até 10 segundos para obter a localização
            maximumAge: 0 // Garante que a posição não seja uma antiga, salva no cache
        })

    }else{
        resultado.innerText = 'Geolocalização não é suportada por este navegador'
    }
}

function mostrarErro(error){
    switch(error.code){
        case error.PERMISSION_DENIED:
            resultado.innerText = '🚫 O usuário negou o acesso a localização.';
            break;
        case error.POSITION_UNAVAILABLE:
            resultado.innerText = '❌ A localização não está disponível.';
            break;
        case error.TIMEOUT:
            resultado.innerText = '⏳ A solicitação expirou.';
            break;
        default:
            resultado.innerText = '⚠ Erro desconhecido.';
    }
}

function mostrarPosicao(posicao){
    console.log(posicao);
    latitude = posicao.coords.latitude;
    console.log(latitude);
    longitude = posicao.coords.longitude;
    console.log(longitude);
    resultado.innerHTML = `
    Latitude: ${latitude}<br>
    Longitude: ${longitude}<br>
    <a href="https://www.google.com.br/maps/@${latitude},${longitude},20z?entry=ttu" target='_blank'><h4> Ver no Google Maps</h4></a>
    `

    atualizaMapa(latitude,longitude)
}

// Função ao clicar no botão "📌 Buscar Endereço" para buscar o endereço usando a API do OpenStreetMap
async function buscarEndereco() {

    // Verifica se as coordenadas foram obtidas
    if (latitude === null || longitude === null) {
        resultado2.innerHTML = "⚠️ Primeiro obtenha as coordenadas!";
        return;
    }

    // Faz a requisição à API
    try {
        // Monta a URL com as coordenadas obtidas
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pt-br`;

        // Chama a API e espera pela resposta
        const resposta = await fetch(url);

        // Transforma a resposta em JSON
        const dados = await resposta.json();
        console.log(dados);

        // Extrai as informações de endereço para a variável endereco
        const endereco = dados.address;
        console.log(endereco);

        // Exibe o endereço formatado
        resultado2.innerHTML = `
    <h3>📍 Detalhes do endereço:</h3>
    País: ${endereco.country || "N/A"}<br>
    Estado: ${endereco.state || "N/A"}<br>
    Cidade: ${endereco.city || endereco.town || endereco.village || "N/A"}<br>
    Bairro: ${endereco.suburb || "N/A"}<br>
    Rua: ${endereco.road || "N/A"}<br>
    CEP: ${endereco.postcode || "N/A"}<br>
    <a href="https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}" target="_blank">
        <h4>🌍 Ver no OpenStreetMap</h4>
    </a>
`;


    } catch (erro) {
        resultado2.innerHTML = "❌ Erro ao buscar o endereço!";
        console.error("Erro ao buscar dados:", erro);
    };
}


let mapa = L.map('mapa').setView([-23.9828992, -48.8669184], 10);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mapa);



function atualizaMapa(latitude,longitude){
    mapa.setView([latitude,longitude],19)
    L.maker([latitude,longitude])
    .addTo(mapa)
    .bindPopup("📍 Você está aqui")
    .openPopup();
}




async function clima() {
    // Obtém as coordenadas (certifique-se de definir essas variáveis antes)
    if (typeof latitude === "undefined" || typeof longitude === "undefined") {
        document.getElementById("resultado3").innerHTML = "⚠️ Primeiro obtenha as coordenadas!";
        return;
    }

    try {
        // Monta a URL da API
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

        // Faz a requisição à API
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error("Erro ao buscar dados do clima.");

        // Transforma a resposta em JSON
        const dados = await resposta.json();
        console.log(dados);

        // Obtém a temperatura corretamente
        const temperatura = dados.current_weather?.temperature || "N/A";

        // Exibe a temperatura
        document.getElementById("resultado3").innerHTML = `
            <h3>🌡Temprearura:</h3>
            Temperatura: ${temperatura}°C<br>
        `;

    } catch (erro) {
        console.error("Erro ao obter o clima:", erro);
        document.getElementById("resultado3").innerHTML = "❌ Erro ao obter a temperatura.";
    }
}


