// Tomar la referencia al elemento de audio que ya tienes en tu HTML
let music = document.getElementById("backgroundMusic");

// Control de pausa/reproducción de música
const musicBtn = document.getElementById("toggleMusicBtn");
musicBtn.addEventListener("click", function () {
    // Si está pausada, la reproducimos; si está reproduciéndose, la pausamos
    if (music.paused) {
        music.play();
    } else {
        music.pause();
    }
});


// Pausar/Reanudar el juego
let isGamePaused = false;
const pauseBtn = document.getElementById("pauseGameBtn");
pauseBtn.addEventListener("click", function () {
    // Obtener la escena actual que desees pausar (ej: "GameScene")
    let currentScene = game.scene.getScene("GameScene");

    if (!isGamePaused) {
        currentScene.physics.pause(); // Pausa la física
        // Opcionalmente, podrías pausar las animaciones si quieres
        // currentScene.scene.pause();
        isGamePaused = true;
    } else {
        currentScene.physics.resume(); // Reanuda la física
        // currentScene.scene.resume(); // si pausaste la escena completa
        isGamePaused = false;
    }
});


// Salir al menú
const exitBtn = document.getElementById("exitGameBtn");
exitBtn.addEventListener("click", function () {
    // Llevar al jugador al menú principal
    // Suponiendo que tu menú se llama "MenuScene"
    game.scene.start("MenuScene");
});