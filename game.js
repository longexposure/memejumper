/* =========================
   TITLE SCENE
========================= */
class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }

  preload() {
    this.load.image('cover', 'assets/ui/cover.png');
    this.load.image('playBtn', 'assets/ui/play.png');
  }

  create() {
    console.log("TitleScene loaded");  // Verificación
    this.add.image(512, 768, 'cover').setOrigin(0.5);

    const play = this.add.image(512, 1230, 'playBtn')
      .setOrigin(0.5)
      .setScale(1)
      .setInteractive({ useHandCursor: true });

    play.on('pointerdown', () => {
      this.scene.start('Game');
    });
  }
}

/* =========================
   GAME SCENE
========================= */
class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  preload() {
    this.load.image('froglevel1', 'assets/ui/froglevel1.png');
    this.load.image('froglevel2', 'assets/ui/froglevel2.png');
    this.load.image('froglevel3', 'assets/ui/froglevel3.png');
    this.load.image('levelText', 'assets/ui/easytext.png');
    this.load.image('mediumtext', 'assets/ui/mediumtext.png');
    this.load.image('hardtext', 'assets/ui/hardtext.png');
    this.load.image('bgEasy', 'assets/backgrounds/easy.png');
    this.load.image('bgMedium', 'assets/backgrounds/medium.jpg');
    this.load.image('bgHard', 'assets/backgrounds/hard.jpg');
  }

  create() {
    this.lives = 4;
    this.score = 0;
    this.currentQuestionIndex = 0;
    this.timeLimit = 10000; // 10 segundos por pregunta

    // Fondo inicial
    this.background = this.add.image(512, 768, 'bgEasy').setOrigin(0.5).setDepth(0).setScale(1);

    this.row1 = [];
    this.row2 = [];
    this.row3 = [];

    // Ranas y letreros de nivel (inicialmente invisibles)
    this.frog = this.add.image(512, 1360, 'froglevel1').setOrigin(0.5).setDepth(10)
    this.levelText = this.add.image(512, 600, 'levelText').setAlpha(0);
    this.countdownText = this.add.text(512, 690, '3', { 
      fontFamily: 'Arial', 
      fontSize: '120px', 
      color: '#ffd700', 
      stroke: '#000000', 
      strokeThickness: 4 
    }).setOrigin(0.5).setAlpha(0);

    // Animación de la pantalla de nivel 1
    this.showLevelScreen(1); // Muestra la pantalla de nivel 1

    // Cargar la siguiente pregunta o continuar el flujo del juego
    this.loadQuestion();
  }

  showLevelScreen(level) {
    let levelText, levelImage;
    if (level === 1) {
      levelText = 'LEVEL 1';
      levelImage = 'froglevel1';
    } else if (level === 2) {
      levelText = 'LEVEL 2';
      levelImage = 'froglevel2';
    } else if (level === 3) {
      levelText = 'LEVEL 3';
      levelImage = 'froglevel3';
    }

    // Fondo dependiendo del nivel
    this.background.setTexture('bgEasy').setScale(1);

    this.frog.setTexture(levelImage).setAlpha(1);
    this.levelText.setTexture(levelText).setAlpha(1);

    // Cuenta regresiva
    let countdown = 3;
    this.countdownText.setAlpha(1).setText(countdown);

    const countdownTimer = this.time.addEvent({
      delay: 1000, // Cada segundo
      callback: () => {
        countdown--;
        this.countdownText.setText(countdown);
        if (countdown === 0) {
          this.countdownText.setAlpha(0);
          this.time.delayedCall(500, () => {
            this.startGame();
          });
        }
      },
      loop: true
    });
  }

  startGame() {
    this.time.delayedCall(500, () => {
      this.scene.start('GamePlay');
    });
  }

  loadQuestion() {
    // Lógica para cargar preguntas y manejar el flujo del juego
    this.updateBackgroundByDifficulty();
  }

  updateBackgroundByDifficulty() {
    if (this.currentQuestionIndex < 7) {
      this.background.setTexture('bgEasy').setScale(1);
    } else if (this.currentQuestionIndex < 15) {
      this.background.setTexture('bgMedium').setScale(1);
    } else {
      this.background.setTexture('bgHard').setScale(1);
    }
  }

  update() {
    // Actualización continua de la escena
  }
}

/* =========================
   CONFIG
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
  loader: {
    baseURL: window.location.hostname.includes('github.io') ? '/memejumper/' : ''
  },
  scene: [TitleScene, GameScene] // Asegúrate de que todas las escenas estén correctamente añadidas
});