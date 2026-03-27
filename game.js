/* =========================
   BOOT SCENE (Carga de recursos)
========================= */
class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Muestra texto de carga
    const loadingText = this.add.text(512, 768, 'LOADING...', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Opcional: barra de progreso
    const progressBar = this.add.graphics();
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(262, 820, 500 * value, 20);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      loadingText.destroy();
      // Después de la carga de recursos, pasamos a la TitleScene
      this.scene.start('Title');
    });

    // Cargar recursos necesarios
    this.load.image('cover', 'assets/ui/cover.png'); // Imagen de inicio
    this.load.image('playBtn', 'assets/ui/play.png'); // Botón de Play
    this.load.image('startScreen', 'assets/ui/startScreen.png'); // Imagen de inicio
    this.load.image('level1', 'assets/ui/level1.png');
    this.load.image('level2', 'assets/ui/level2.png');
    this.load.image('level3', 'assets/ui/level3.png');
    this.load.image('bgEasy', 'assets/backgrounds/easy.png');
    this.load.image('bgMedium', 'assets/backgrounds/medium.jpg');
    this.load.image('bgHard', 'assets/backgrounds/hard.jpg');
    this.load.image('frog', 'assets/game/frog.png');
    this.load.image('leaf', 'assets/game/leaf.png');
    this.load.image('questionFrame', 'assets/ui/questionFrame.png');
    this.load.image('heart', 'assets/game/lives.png');
    this.load.image('gameOverImage', 'assets/game/gameovergame.png');
    this.load.audio('sfx_jump', 'sounds/jump.mp3');
    this.load.audio('sfx_correct', 'sounds/correct.mp3');
    this.load.audio('sfx_wrong', 'sounds/wrong.mp3');
    this.load.audio('music_outro', 'sounds/outro.mp3');
    this.load.json('questions', 'assets/data/6529_froggy_quiz_final.json');
  }

  create() {
    // La transición ya se maneja en `this.load.on('complete')`, por lo que esta parte se maneja automáticamente.
  }
}

/* =========================
   TITLE SCENE (Pantalla de inicio)
========================= */
class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  preload() {
    this.load.image('startScreen', 'assets/ui/startScreen.png'); // Cargar imagen de inicio
    this.load.image('playBtn', 'assets/ui/play.png'); // Cargar botón Play
  }

  create() {
    // Mostrar imagen de inicio
    this.add.image(512, 768, 'startScreen').setOrigin(0.5);

    // Crear el botón "Play"
    const play = this.add.image(512, 1230, 'playBtn')
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScale(1);

    play.on('pointerdown', () => {
      this.scene.switch('Level1Scene'); // Al hacer clic en "Play", pasa al nivel 1
    });
  }
}

/* =========================
   LEVEL 1 SCENE (Pantalla de nivel 1 con cuenta regresiva)
========================= */
class Level1Scene extends Phaser.Scene {
  constructor() {
    super('Level1Scene');
  }

  preload() {
    this.load.image('level1', 'assets/ui/level1.png'); // Cargar imagen del nivel 1
    this.load.image('bgEasy', 'assets/backgrounds/easy.png'); // Fondo de nivel 1
  }

  create() {
    this.add.image(512, 768, 'bgEasy').setOrigin(0.5); // Fondo de la escena
    this.add.image(512, 768, 'level1').setOrigin(0.5); // Mostrar imagen de nivel 1

    const countdownText = this.add.text(512, 690, '3', {
      fontFamily: 'Arial',
      fontSize: '120px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Cuenta regresiva de 3 segundos
    let countdown = 3;
    this.time.addEvent({
      delay: 1000, // Cada segundo
      callback: () => {
        countdown--;
        countdownText.setText(countdown);
        if (countdown === 0) {
          countdownText.setAlpha(0);
          this.time.delayedCall(500, () => {
            this.scene.switch('GameScene1'); // Iniciar el juego del nivel 1
          });
        }
      },
      loop: true
    });
  }
}

/* =========================
   GAME SCENE 1 (Juego de nivel 1)
========================= */
class GameScene1 extends Phaser.Scene {
  constructor() {
    super('GameScene1');
  }

  create() {
    console.log('Juego de nivel 1 iniciado');

    // Aquí se inicia la lógica del juego para el nivel 1...
    // Cuando termine, pasar al siguiente nivel (Level2Scene)
    this.time.delayedCall(3000, () => {
      this.scene.switch('Level2Scene'); // Cambiar a la pantalla de nivel 2
    });
  }
}

/* =========================
   LEVEL 2 SCENE (Pantalla de nivel 2 con cuenta regresiva)
========================= */
class Level2Scene extends Phaser.Scene {
  constructor() {
    super('Level2Scene');
  }

  preload() {
    this.load.image('level2', 'assets/ui/level2.png'); // Cargar imagen del nivel 2
    this.load.image('bgMedium', 'assets/backgrounds/medium.jpg'); // Fondo de nivel 2
  }

  create() {
    this.add.image(512, 768, 'bgMedium').setOrigin(0.5); // Fondo de la escena
    this.add.image(512, 768, 'level2').setOrigin(0.5); // Mostrar imagen de nivel 2

    const countdownText = this.add.text(512, 690, '3', {
      fontFamily: 'Arial',
      fontSize: '120px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Cuenta regresiva de 3 segundos
    let countdown = 3;
    this.time.addEvent({
      delay: 1000, // Cada segundo
      callback: () => {
        countdown--;
        countdownText.setText(countdown);
        if (countdown === 0) {
          countdownText.setAlpha(0);
          this.time.delayedCall(500, () => {
            this.scene.switch('GameScene2'); // Iniciar el juego del nivel 2
          });
        }
      },
      loop: true
    });
  }
}

/* =========================
   GAME SCENE 2 (Juego de nivel 2)
========================= */
class GameScene2 extends Phaser.Scene {
  constructor() {
    super('GameScene2');
  }

  create() {
    console.log('Juego de nivel 2 iniciado');

    // Aquí se inicia la lógica del juego para el nivel 2...
    // Cuando termine, pasar al siguiente nivel (Level3Scene)
    this.time.delayedCall(3000, () => {
      this.scene.switch('Level3Scene'); // Cambiar a la pantalla de nivel 3
    });
  }
}

/* =========================
   LEVEL 3 SCENE (Pantalla de nivel 3 con cuenta regresiva)
========================= */
class Level3Scene extends Phaser.Scene {
  constructor() {
    super('Level3Scene');
  }

  preload() {
    this.load.image('level3', 'assets/ui/level3.png'); // Cargar imagen del nivel 3
    this.load.image('bgHard', 'assets/backgrounds/hard.jpg'); // Fondo de nivel 3
  }

  create() {
    this.add.image(512, 768, 'bgHard').setOrigin(0.5); // Fondo de la escena
    this.add.image(512, 768, 'level3').setOrigin(0.5); // Mostrar imagen de nivel 3

    const countdownText = this.add.text(512, 690, '3', {
      fontFamily: 'Arial',
      fontSize: '120px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Cuenta regresiva de 3 segundos
    let countdown = 3;
    this.time.addEvent({
      delay: 1000, // Cada segundo
      callback: () => {
        countdown--;
        countdownText.setText(countdown);
        if (countdown === 0) {
          countdownText.setAlpha(0);
          this.time.delayedCall(500, () => {
            this.scene.switch('GameScene3'); // Iniciar el juego del nivel 3
          });
        }
      },
      loop: true
    });
  }
}

/* =========================
   GAME SCENE 3 (Juego de nivel 3)
========================= */
class GameScene3 extends Phaser.Scene {
  constructor() {
    super('GameScene3');
  }

  create() {
    console.log('Juego de nivel 3 iniciado');

    // Aquí se inicia la lógica del juego para el nivel 3...
    // Después de terminar, se puede finalizar el juego o mostrar un mensaje final
    this.time.delayedCall(3000, () => {
      console.log('Juego completado');
      // Aquí puedes finalizar el juego o mostrar una pantalla de resultados.
    });
  }
}

/* =========================
   CONFIGURACIÓN GENERAL
========================= */
new Phaser.Game({
  type: Phaser.AUTO,
  width: 1024,
  height: 1536,
  parent: 'game',
  backgroundColor: '#000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [
    BootScene, 
    TitleScene, 
    Level1Scene, 
    GameScene1, 
    Level2Scene, 
    GameScene2, 
    Level3Scene, 
    GameScene3
  ] // Escenas ordenadas
});