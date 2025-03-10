class NextLevel extends Phaser.Scene {
    constructor() {
        super({ key: 'NextLevel' });
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        // Hacer el nivel mucho más largo
        let levelWidth = this.sys.game.config.width * 4; // 4 veces el ancho de la pantalla
        // Mapear 'player1' y 'player2' a sus respectivas spritesheets

        // Crear fondo infinito con tileSprite
        this.sky = this.add.tileSprite(0, 0, this.sys.game.config.width, this.sys.game.config.height, 'sky')
            .setOrigin(0, 0)
            .setScrollFactor(0) // Hace que se quede fijo en la cámara
            .setDepth(-3); // Detrás de todo

        // Crear montañas de fondo con tileSprite
        this.mountains = this.add.tileSprite(0, this.sys.game.config.height - 200, this.sys.game.config.width, 200, 'mountain')
            .setOrigin(0, 1)
            .setScrollFactor(0.5) // Se mueve más lento que el jugador para efecto de parallax
            .setDepth(-2); // Detrás del jugador, pero delante del cielo

        let characterMap = {
            player1: 'dude',
            player2: 'dude1'
        };

        // Obtener la spritesheet correcta
        let selectedCharacter = localStorage.getItem('selectedCharacter') || 'dude';
        let characterKey = characterMap[selectedCharacter] || 'dude';  // Valor por defecto
        // Obtener el personaje seleccionado desde localStorage



        // Agregar el jugador a la escena con la imagen correcta
        // this.player = this.physics.add.sprite(100, 450, selectedCharacter);
        // this.player.setBounce(0.2);
        // this.player.setCollideWorldBounds(true);

        this.isGameOver = false; // El juego empieza en falso

        this.add.image(400, 300, 'sky');


        // Crear plataformas
        let platforms = this.physics.add.staticGroup();
        platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        platforms.create(800, 568, 'ground').setScale(2).refreshBody();
        platforms.create(1200, 568, 'ground').setScale(2).refreshBody();
        platforms.create(1600, 568, 'ground').setScale(2).refreshBody();
        platforms.create(2000, 568, 'ground').setScale(2).refreshBody();
        platforms.create(2400, 568, 'ground').setScale(2).refreshBody();
        platforms.create(2800, 568, 'ground').setScale(2).refreshBody();
        platforms.create(3200, 568, 'ground').setScale(2).refreshBody();
        platforms.create(3600, 568, 'ground').setScale(2).refreshBody();
        platforms.create(4000, 568, 'ground').setScale(2).refreshBody();
        platforms.create(800, 450, 'ground');
        platforms.create(1200, 350, 'ground');
        platforms.create(1600, 250, 'ground');
        platforms.create(2000, 400, 'ground');
        platforms.create(2500, 500, 'ground');
        platforms.create(2500, 500, 'ground');

        this.specialItemGroup = this.physics.add.group();

        this.player = this.physics.add.sprite(100, 450, characterKey);
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);


        if (!this.player) {
            console.error("Error: this.player no se ha inicializado correctamente");
        }
        // Habilitar la colisión entre el jugador y las plataformas
        this.physics.add.collider(this.player, platforms);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(characterKey, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: characterKey, frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(characterKey, { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        this.bombs = this.physics.add.group();
        this.spawnBombs(3);

        // Vidas
        this.lives = 3;

        // Contenedor en el HTML donde se mostrarán las imágenes de las vidas
        this.livesContainer = document.getElementById("lives-container");

        // Cargar las imágenes de las vidas
        this.updateLivesUI();

        // Grupo de disparos
        this.bullets = this.physics.add.group();

        // Puntuación
        this.score = parseInt(localStorage.getItem('score')) || 0;
        this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, { fontSize: '32px', fill: '#000' });

        this.physics.add.collider(this.player, platforms);
        this.physics.add.collider(this.stars, platforms);
        this.physics.add.collider(this.bombs, platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
        this.physics.add.collider(this.specialItemGroup, platforms);



        // Tecla para disparar
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.physics.add.overlap(this.bullets, this.bombs, this.hitEnemy, null, this);

        // Hacer que la camara siga al jugador
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, levelWidth, this.sys.game.config.height);

        // Asegurar que la cámara cubra todo el nivel
        this.cameras.main.setBounds(0, 0, levelWidth, this.sys.game.config.height);

        // Asegurar que el jugador pueda moverse dentro de los límites del mundo
        this.physics.world.setBounds(0, 0, levelWidth, this.sys.game.config.height);
        this.lastSpawnX = this.player.x; // Inicializar la última posición de spawn
    }

    update() {
        if (!this.player || this.isGameOver) return;


        this.sky.tilePositionX = this.cameras.main.scrollX;
        this.mountains.tilePositionX = this.cameras.main.scrollX * 0.5;


        let distanceThreshold = 500; // Cada cuántos píxeles se generan estrellas y bombas
        let nextSpawnX = this.lastSpawnX + distanceThreshold;

        if (this.player.x > nextSpawnX) {
            this.lastSpawnX = this.player.x;

            // Generar una nueva estrella
            let starX = this.player.x + Phaser.Math.Between(100, 300);
            let starY = Phaser.Math.Between(50, 300);
            let newStar = this.stars.create(starX, starY, 'star');
            newStar.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            console.log("Nueva estrella");

            // Generar una nueva bomba
            let bombX = this.player.x + Phaser.Math.Between(200, 400);
            let bomb = this.bombs.create(bombX, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            console.log("Nueva bomba");
        }

        if (this.score >= 50 && !this.isGameOver) {
            this.showCongratulations();
            return;
        }


        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }

        // Detectar disparo
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.shoot();
        }

        // ---- LÓGICA PARA APARECER EL OBJETO ESPECIAL ---
        if (!this.hasSpawnedSpecialItem && this.player.x >= 500) {
            this.spawnSpecialItem();
            this.hasSpawnedSpecialItem = true;
        }

        this.specialItemGroup.children.iterate(specialItem => {
            if (specialItem.active && specialItem.countdownText) {
                specialItem.countdownText.x = specialItem.x;
                specialItem.countdownText.y = specialItem.y - 50;
            }
        });
    }

    getPlayersFromStorage() {
        let players = localStorage.getItem('players');
        return players ? JSON.parse(players) : [];
    }

    // Función para guardar un jugador en localStorage
    // savePlayer(name, score) {
    //     let players = getPlayersFromStorage();

    //     // Buscar si el jugador ya existe
    //     let existingPlayer = players.find(player => player.name === name);

    //     if (existingPlayer) {
    //         // Solo actualizar la puntuación si es mayor
    //         if (score > existingPlayer.score) {
    //             existingPlayer.score = score;
    //         }
    //     } else {
    //         // Agregar nuevo jugador con la fecha actual
    //         players.push({
    //             name,
    //             score,
    //             date: new Date().toLocaleDateString() // Guardar la fecha de registro
    //         });
    //     }

    //     // Guardar en localStorage
    //     localStorage.setItem('players', JSON.stringify(players));

    //     // Actualizar tabla de puntuaciones
    //     updateScoreTable();
    // }

    // Función para actualizar la tabla de puntuaciones
    // updateScoreTable() {
    //     let players = getPlayersFromStorage();

    //     // Ordenar por puntuación de mayor a menor
    //     players.sort((a, b) => b.score - a.score);

    //     // Seleccionar el contenedor donde se insertará la tabla
    //     let scoreContainer = document.querySelector('.col-lg-4 .box');
    //     scoreContainer.innerHTML = `<h3>Puntuaciones</h3>
    //                     <table class="table table-dark">
    //                         <thead>
    //                             <tr>
    //                                 <th class="fs-2">Nombre</th>
    //                                 <th class="fs-2">Puntuación</th>
    //                                 <th class="fs-2">Fecha de Registro</th> <!-- Nueva columna -->
    //                             </tr>
    //                         </thead>
    //                         <tbody>
    //                         ${players.map(player => `
    //                             <tr class="fs-4">
    //                                 <td>${player.name}</td>
    //                                 <td>${player.score}</td>
    //                                 <td>${player.date || 'N/A'}</td> <!-- Mostrar 'N/A' si no tiene fecha -->
    //                             </tr>`).join('')}
    //                         </tbody>
    //                     </table>`;
    // }

    spawnSpecialItem = function () {
        // Crea el ítem un poco adelante del jugador para que sea visible
        let x = this.player.x + Phaser.Math.Between(200, 400);
        let y = Phaser.Math.Between(50, 300);

        // Crea el sprite y lo añade al grupo
        let specialItem = this.specialItemGroup.create(x, y, 'specialItem');

        // Ajusta físicas
        specialItem.setBounce(0.5);
        specialItem.setCollideWorldBounds(true);
        // Haz que colisione con las plataformas
        this.physics.add.collider(specialItem, this.platforms);

        // Detectar colisión/solapamiento con el jugador
        this.physics.add.overlap(this.player, specialItem, this.collectSpecialItem, null, this);

        // --- CONTADOR SOBRE EL ÍTEM ---
        let timeLeft = 5; // (5 segundos)
        let countdownText = this.add.text(
            specialItem.x,
            specialItem.y - 50,
            timeLeft,
            { fontSize: '20px', fill: '#fff' }
        ).setOrigin(0.5);

        // Guarda la referencia en el propio ítem para manipularlo luego
        specialItem.countdownText = countdownText;
        specialItem.timeLeft = timeLeft;

        // Cada segundo, disminuimos el contador
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                // Si el ítem ya no existe (recogido o destruido), no hacemos nada
                if (!specialItem.active) return;

                specialItem.timeLeft--;
                specialItem.countdownText.setText(specialItem.timeLeft);

                if (specialItem.timeLeft <= 0) {
                    // Se acabó el tiempo: destruir ítem y su texto
                    specialItem.destroy();
                    specialItem.countdownText.destroy();
                    console.log("El objeto especial desapareció por tiempo.");
                }
            },
            repeat: 4 // Repetimos 4 veces. (0 -> 5s totales)
        });
    };

    collectSpecialItem = function (player, specialItem) {
        // Desactivarlo inmediatamente (ya no colisiona)
        specialItem.disableBody(true, true);

        // Destruir el texto si existe
        if (specialItem.countdownText) {
            specialItem.countdownText.destroy();
        }

        // Sumar 100 puntos al marcador
        this.score += 100;
        this.scoreText.setText(`Score: ${this.score}`);

        // (Opcional) Guardar en localStorage
        let playerName = localStorage.getItem('playerName') || "Jugador";
        savePlayer(playerName, this.score);

        console.log("¡Recogiste el objeto especial y ganaste 100 puntos!");
    };

    updateLivesUI = function () {
        // Limpiar el contenedor antes de volver a renderizar las vidas
        this.livesContainer.innerHTML = "";

        // Agregar una imagen por cada vida restante
        for (let i = 0; i < this.lives; i++) {
            let img = document.createElement("img");
            img.src = "assets/bomb.png"; // Ruta correcta de la imagen de vida
            img.classList.add("life-icon"); // Clase CSS para darle estilo
            this.livesContainer.appendChild(img);
        }
    };

    // Función cuando el jugador es golpeado por una bomba
    hitBomb = function (player, bomb) {
        // Reducir vida
        this.lives -= 1;

        // Actualizar la UI de vidas
        this.updateLivesUI();

        // Si las vidas llegan a 0, terminar el juego
        if (this.lives <= 0 && !this.isGameOver) {
            this.gameOver();
            console.log("Game Over");
        }
    };

    //Colision de las balas a los enemigos
    hitEnemy = function (bullet, bomb) {
        console.log("Impacto");

        bullet.destroy(); // Eliminar la bala

        if (bomb.health === undefined) {
            bomb.health = 5; // Asignar vida
        }

        bomb.health -= 1;

        //Cambiar color al recibir daño 
        bomb.setTint(0xff0000);
        setTimeout(() => {
            bomb.clearTint(); // Volver al color normal después de 200ms
        }, 200);

        if (bomb.health <= 0) {
            bomb.destroy();
            this.score += 20;
            this.scoreText.setText(`Score: ${this.score}`);
        }
    };

    // Función para generar bombas en posiciones aleatorias
    spawnBombs = function () {
        for (let i = 0; i < 3; i++) { // Genera 2 bombas cada vez
            let x = Phaser.Math.Between(100, 700);
            let bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.health = 5;
        }
    };
    // Funcion para guardar la puntuación en localStorage
    collectStar = function (player, star) {
        star.disableBody(true, true);
        this.score += 10;

        // Guardar o actualizar la puntuación en localStorage
        let playerName = localStorage.getItem('playerName') || "Jugador";
        savePlayer(playerName, this.score);

        this.scoreText.setText(`Score: ${this.score}`);

        //Generar nuevas estrellas
        if (this.stars.countActive(true) === 0) {
            this.stars.children.iterate(child => { child.enableBody(true, child.x, 0, true, true); });
            this.spawnBombs();
        }
    };

    gameOver = function () {
        if (this.isGameOver) return; // Evita llamadas múltiples
        this.isGameOver = true; // Marcar el estado de game over

        // Pausa el jugador
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.anims.play('turn');

        // Eliminar controles
        this.cursors.left.reset();
        this.cursors.right.reset();
        this.cursors.up.reset();

        // Mostrar el texto de Game Over
        let gameOverText = this.add.text(400, 200, 'GAME OVER', { fontSize: '48px', fill: '#f00' }).setOrigin(0.5);

        // Botón de reinicio
        let restartButton = this.add.text(400, 300, 'Reintentar', { fontSize: '32px', fill: '#0f0' })
            .setInteractive()
            .on('pointerdown', () => {

                this.scene.restart();          // Reiniciar escena
            });


        // Botón de menú
        let menuButton = this.add.text(400, 350, 'Menú Principal', { fontSize: '32px', fill: '#ff0' })
            .setInteractive()
            .setOrigin(0.5)
            .on('pointerdown', () => {
                this.scene.start('MenuScene');
            });
    };

    showCongratulations = function () {
        this.isGameOver = true;  // Bloquear el juego para que no continúe mientras se muestra el mensaje

        // Detener la física y las animaciones
        this.physics.pause();
        this.player.setTint(0x00ff00);  // Puedes cambiar el color del jugador para dar efecto de "felicitación"

        // Mostrar el mensaje de felicitaciones
        let congratulationsText = this.add.text(400, 200, '¡Felicidades! Has alcanzado 1000 puntos.', {
            fontSize: '48px',
            fill: '#fff'
        }).setOrigin(0.5);

        // Botón de siguiente nivel
        let nextLevelButton = this.add.image(400, 300, 'nextLevelButton').setInteractive();
        nextLevelButton.on('pointerdown', () => {
            this.startNextLevel();
        });

        // Botón de volver al menú
        let menuButton = this.add.image(400, 400, 'menuButton').setInteractive();
        menuButton.on('pointerdown', () => {
            this.goToMainMenu();
        });
    };

    startNextLevel = function () {
        this.scene.start('NextLevel');
    };

    goToMainMenu = function () {
    }

}