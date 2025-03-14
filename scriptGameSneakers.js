var time = new Date();
var deltaTime = 0;

if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(Init, 1);
} else {
    document.addEventListener("DOMContentLoaded", Init);
}

function Init() {
    time = new Date();
    Start();
}

function Loop() {
    deltaTime = (new Date() - time) / 1000;
    time = new Date();
    Update();
    requestAnimationFrame(Loop);
}

//****** GAME LOGIC ********//

var sueloY = 22;
var velY = 0;
var impulso = 900;
var gravedad = 2500;

var dinoPosX = 42;
var dinoPosY = sueloY;

var sueloX = 0;
var velEscenario = 1280 / 3; // Reducir este valor para disminuir la velocidad de los obstáculos
var gameVel = 1;
var score = 0;

var parado = false;
var saltando = false;

var tiempoHastaObstaculo = 2;
var tiempoObstaculoMin = 0.7;
var tiempoObstaculoMax = 1.8;
var obstaculoPosY = 16;
var obstaculos = [];

var tiempoHastaNube = 0.5;
var tiempoNubeMin = 0.7;
var tiempoNubeMax = 2.7;
var maxNubeY = 270;
var minNubeY = 100;
var nubes = [];
var velNube = 0.5;

var contenedor;
var dino;
var textoScore;
var suelo;
var gameOver;
var ganaste;

var mensajeGanasteMostrado = false; // Variable para rastrear si el mensaje de "Ganaste" ya se mostró
var jugadorMuerto = false; // Variable para rastrear si el jugador ha muerto

function Start() {
    ganaste = document.querySelector(".ganaste-juego");
    gameOver = document.querySelector(".game-over");
    suelo = document.querySelector(".suelo");
    contenedor = document.querySelector(".contenedor");
    textoScore = document.querySelector(".score");
    dino = document.querySelector(".dino");
    document.addEventListener("keydown", HandleKeyDownSpace);
    document.addEventListener("click", HandleJump);
    document.addEventListener("touchstart", HandleJump);
    var btnIniciar = document.getElementById("btn-iniciar");
    btnIniciar.addEventListener("click", HandleIniciar);
}
function HandleIniciar() {
    var btnIniciar = document.getElementById("btn-iniciar");
    btnIniciar.style.display = "none";
    document.getElementById("mensaje-inicial").style.display = "none";
    document.getElementById("btn-reiniciar").style.display = "none"; // Asegurar que el botón de reinicio esté oculto
    parado = false;
    Loop();
}


// Función para manejar cuando el jugador pierde
function JuegoTerminado() {
    parado = true;
    document.getElementById("btn-reiniciar").style.display = "block"; // Mostrar botón de reinicio
}

// Función para reiniciar el juego
function reiniciarJuego() {
    // Ocultar el botón de reinicio y el texto de Game Over
    document.getElementById("btn-reiniciar").style.display = "none";
    gameOver.style.display = "none";

    // Ocultar el overlay del modal (fondo oscuro)
    const modal = document.getElementById("modal-ganaste");
    modal.style.display = "none";

    // Si quieres vaciar su contenido para empezar “limpio”
    document.getElementById("contenido-ganaste").innerHTML = "";

    // Reactivar el juego:
    parado = false;
    score = 0;
    textoScore.innerText = score;
    dino.classList.remove("dino-estrellado");
    dino.classList.add("dino-corriendo");

    // Limpiar obstáculos
    obstaculos.forEach(obstaculo => obstaculo.remove());
    obstaculos = [];

    Loop(); // Reiniciar el bucle del juego
}



function Update() {
    if (parado) return;

    MoverDinosaurio();
    MoverSuelo();
    DecidirCrearObstaculos();
    DecidirCrearNubes();
    MoverObstaculos();
    MoverNubes();
    DetectarColision();

    velY -= gravedad * deltaTime;

if (score >= 2 && score <= 3 && parado) {
    Mostrarganaste("juegoenvio", "Envío gratis en tu próxima compra");
} else if(score >=4 && score <=5 && parado) {
    Mostrarganaste("juego10", "10% dto en camisetas y gorras de precio full");
} else if(score >= 6 && parado) {
    Mostrarganaste("juego15", "15% dto en buzos y chaquetas de precio full");
}
    
    else if (score <= 1 && parado) {
        MostrarMensaje("❌ ¡GAME OVER! ❌");
        jugadorMuerto = true;
    }
}


function HandleKeyDownSpace(ev) {
    if (ev.keyCode === 32) {
        ev.preventDefault();
        Saltar();
    }
}

function HandleJump() {
    Saltar();
}

function Saltar() {
    if (dinoPosY === sueloY) {
        saltando = true;
        velY = impulso;
        dino.classList.remove("dino-corriendo");
    }
}


function MostrarMensaje(mensaje) {
    gameOver.style.display = "block";
    gameOver.innerHTML = mensaje; 
}

function Mostrarganaste(codigo, textoPromocion) {
    // Seleccionamos el overlay y el contenedor interno
    const modal = document.getElementById("modal-ganaste");
    const contenidoGanaste = document.getElementById("contenido-ganaste");

    // Mostramos el overlay
    modal.style.display = "block";

    // HTML dentro del modal
    contenidoGanaste.innerHTML = `
        <h1>¡Ganaste!</h1>
        <p>${textoPromocion}</p>
        <p><strong>Código:</strong> 
           <span style="color: red; font-weight: bold;">${codigo}</span>
        </p>
        <p style="font-size: 14px;">
          IMPORTANTE: Haz captura de pantalla o guarda este código
        </p>
        <button id="btn-comprar" 
            style="background: #06b900; color: #fff; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer;">
          ¡Compra ahora con tu código!
        </button>
        <br><br>
        <button id="btn-volver-jugar" 
            style="background: #ccc; color: #000; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer;">
          ¡Volver a jugar!
        </button>
    `;

    // Agregamos eventos a los botones dentro del modal
    const btnComprar = document.getElementById("btn-comprar");
    btnComprar.addEventListener("click", () => {
        // Lógica para "comprar con el código" (abrir enlace, etc.)
        window.open("https://www.pilatos.com/productos-top", "_blank");
    });

    const btnVolverJugar = document.getElementById("btn-volver-jugar");
    btnVolverJugar.addEventListener("click", () => {
        // Cerramos modal y reiniciamos juego
        modal.style.display = "none";
        reiniciarJuego();
    });
}


function MoverDinosaurio() {
    dinoPosY += velY * deltaTime;
    if(dinoPosY < sueloY){
        
        TocarSuelo();
    }
    dino.style.bottom = dinoPosY+"px";
}

function TocarSuelo() {
    dinoPosY = sueloY;
    velY = 0;
    if(saltando){
        dino.classList.add("dino-corriendo");
    }
    saltando = false;
}

function MoverSuelo() {
    sueloX += CalcularDesplazamiento();
    suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}

function CalcularDesplazamiento() {
    return velEscenario * deltaTime * gameVel;
}

function Estrellarse() {
    dino.classList.remove("dino-corriendo");
    dino.classList.add("dino-estrellado");
    parado = true;
}

function DecidirCrearObstaculos() {
    tiempoHastaObstaculo -= deltaTime;
    if(tiempoHastaObstaculo <= 0) {
        CrearObstaculo();
    }
}

function DecidirCrearNubes() {
    tiempoHastaNube -= deltaTime;
    if(tiempoHastaNube <= 0) {
        CrearNube();
    }
}

function CrearObstaculo() {
    var obstaculo = document.createElement("div");
    contenedor.appendChild(obstaculo);
    obstaculo.classList.add("cactus");
    if(Math.random() > 0.5) obstaculo.classList.add("cactus2");
    obstaculo.posX = contenedor.clientWidth;
    obstaculo.style.left = contenedor.clientWidth+"px";

    obstaculos.push(obstaculo);
    tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax-tiempoObstaculoMin) / gameVel;
}

function CrearNube() {
    var nube = document.createElement("div");
    contenedor.appendChild(nube);
    nube.classList.add("nube");
    nube.posX = contenedor.clientWidth;
    nube.style.left = contenedor.clientWidth+"px";
    nube.style.bottom = minNubeY + Math.random() * (maxNubeY-minNubeY)+"px";
    
    nubes.push(nube);
    tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax-tiempoNubeMin) / gameVel;
}

function MoverObstaculos() {
    for (var i = obstaculos.length - 1; i >= 0; i--) {
        if(obstaculos[i].posX < -obstaculos[i].clientWidth) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
            obstaculos.splice(i, 1);
            GanarPuntos();
        }else{
            obstaculos[i].posX -= CalcularDesplazamiento();
            obstaculos[i].style.left = obstaculos[i].posX+"px";
        }
    }
}

function MoverNubes() {
    for (var i = nubes.length - 1; i >= 0; i--) {
        if(nubes[i].posX < -nubes[i].clientWidth) {
            nubes[i].parentNode.removeChild(nubes[i]);
            nubes.splice(i, 1);
        }else{
            nubes[i].posX -= CalcularDesplazamiento() * velNube;
            nubes[i].style.left = nubes[i].posX+"px";
        }
    }
}

function GanarPuntos() {
    score++;
    textoScore.innerText = score;
    if(score == 5){
        gameVel = 1.5;
        contenedor.classList.add("mediodia");
    }else if(score == 10) {
        gameVel = 2;
        contenedor.classList.add("tarde");
    } else if(score == 20) {
        gameVel = 3;
        contenedor.classList.add("noche");
    }
    suelo.style.animationDuration = (3/gameVel)+"s";
}

function GameOver() {
    Estrellarse();  // dino-estrellado, parado = true


    if (score >= 2 && score <= 3) {
        Mostrarganaste("juegoenvio", "Envío gratis en tu próxima compra");
        document.getElementById("btn-reiniciar").style.display = "none";
    }
    else if (score >= 4 && score <= 5) {
        Mostrarganaste("juego10", "10% dto en camisetas y gorras de precio full");
        document.getElementById("btn-reiniciar").style.display = "none";
    }
    else if (score >= 6) {
        Mostrarganaste("juego15", "15% dto en buzos y chaquetas de precio full");
        document.getElementById("btn-reiniciar").style.display = "none";
    }
    else {
        // Si no llega ni a 2 puntos, es "Game Over"
        MostrarMensaje("❌ ¡GAME OVER! ❌");
        // Aquí sí muestras el botón para reiniciar
        document.getElementById("btn-reiniciar").style.display = "block";
    }
}

function DetectarColision() {
    for (var i = 0; i < obstaculos.length; i++) {
        if(obstaculos[i].posX > dinoPosX + dino.clientWidth) {
            //EVADE
            break; //al estar en orden, no puede chocar con más
        }else{
            if(IsCollision(dino, obstaculos[i], 10, 30, 15, 20)) {
                GameOver();
            }
        }
    }
}

function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
        (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
        (aRect.left + paddingLeft > (bRect.left + bRect.width))
    );
}
