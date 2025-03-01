// Configuración del juego
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [StartScene], // Solo la escena de inicio
    parent: 'game-container' // Contenedor para Phaser
};

var game = new Phaser.Game(config);

// Escena de inicio
var StartScene = new Phaser.Scene('Start');

// Cargar los recursos antes de iniciar la escena
StartScene.preload = function() {
    // Cargar recursos para la pantalla de inicio
    this.load.image('startBg', 'img/ImgHero.jpg'); // Fondo de inicio
    this.load.image('playButton', 'assets/btn.png'); // Botón para jugar
};

// Crear la escena después de que se carguen los recursos
StartScene.create = function() {
    // Verificar si las imágenes se cargaron correctamente
    if (!this.textures.exists('startBg') || !this.textures.exists('playButton')) {
        console.error('Las imágenes no se cargaron correctamente.');
        return;
    }

    // Fondo de la pantalla de inicio
    this.add.image(400, 300, 'startBg');

    // Botón para empezar el juego
    var playButton = this.add.image(400, 450, 'playButton').setInteractive();

    // Acción del botón
    playButton.on('pointerdown', function() {
        console.log('¡Botón clickeado!'); // Mensaje en la consola
    });
};

// Para manejar errores en la carga de imágenes
StartScene.loadError = function (file) {
    console.error('Error al cargar el archivo: ' + file.key);
};
