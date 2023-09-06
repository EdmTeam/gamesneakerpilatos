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

var mensajeGanasteMostrado = false; // Variable para rastrear si el mensaje de "Ganaste" ya se mostró
var jugadorMuerto = false; // Variable para rastrear si el jugador ha muerto

function Start() {
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
    btnIniciar.style.display = "none"; // Ocultar el botón de inicio
    parado = false; // Iniciar el juego
    Loop(); // Iniciar el bucle de actualización
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
        let cuponUno = "sneakers15";
        let porcentajeDescuento = "15%";
        MostrarMensaje(`¡Ganaste! <span class="cupon">${porcentajeDescuento} de descuento</span>. <br>Puedes redimir tu descuento hoy mismo en <span class="cupon-link"> <a href="https://www.pilatos.com/productos-top" target="_blank"> productos de línea </a>  </span> con el código: <span class="cupon">${cuponUno}</span>`);
        jugadorMuerto = true;
        mensajeGanasteMostrado = true;
    } else if(score >=4 && score <=5 && parado){
        let cuponDos = "sneakers20"
        let porcentajeDescuento = "20%";
        MostrarMensaje(`¡Ganaste! <span class="cupon">${porcentajeDescuento} de descuento</span>. <br>Puedes redimir tu descuento hoy mismo en <span class="cupon-link"> <a href="https://www.pilatos.com/productos-top" target="_blank"> productos de línea </a>  </span> con el código: <span class="cupon">${cuponDos}</span>`);
        jugadorMuerto = true;
        mensajeGanasteMostrado = true;
    } else if(score >= 6 && parado){
        let cuponTres = "sneakers25";
        let porcentajeDescuento = "25%";
        MostrarMensaje(`¡Ganaste! <span class="cupon">${porcentajeDescuento} de descuento</span>. <br>Puedes redimir tu descuento hoy mismo en <span class="cupon-link"> <a href="https://www.pilatos.com/productos-top" target="_blank"> productos de línea </a>  </span> con el código: <span class="cupon">${cuponTres}</span>`);
        jugadorMuerto = true;
        mensajeGanasteMostrado = true;
    } 
    
    else if (score <= 1 && parado) {
        MostrarMensaje("¡Perdiste!");
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
    gameOver.innerHTML = mensaje; // Usa innerHTML en lugar de innerText
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
    Estrellarse();
    gameOver.style.display = "block";
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
