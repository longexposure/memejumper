class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  preload() {
    // Cargar las imágenes necesarias
    this.load.image('bgEasy', 'assets/backgrounds/easy.png');
    this.load.image('bgMedium', 'assets/backgrounds/medium.jpg');
    this.load.image('bgHard', 'assets/backgrounds/hard.jpg');
    this.load.image('froglevel1', 'assets/ui/froglevel1.png');
    this.load.image('froglevel2', 'assets/ui/froglevel2.png');
    this.load.image('froglevel3', 'assets/ui/froglevel3.png');
    this.load.image('levelText', 'assets/ui/easytext.png');
    this.load.image('mediumtext', 'assets/ui/mediumtext.png');
    this.load.image('hardtext', 'assets/ui/hardtext.png');
  }

  create() {
    // Definir el estado y las preguntas
    this.isResolving = false;
    this.currentQuestionIndex = 0;
    this.lives = 4;
    this.score = 0;

    // Inicialización de sonidos
    this.sfxJump = this.sound.add('sfx_jump');
    this.sfxCorrect = this.sound.add('sfx_correct');
    this.sfxWrong = this.sound.add('sfx_wrong');

    // Preguntas y dificultad
    this.timeLimit = 10000; // 10 segundos
    this.fastThreshold = 5000; // 5 segundos
    const data = this.cache.json.get('questions');
    const easy = Phaser.Utils.Array.Shuffle(data.easy).slice(0, 7);
    const medium = Phaser.Utils.Array.Shuffle(data.medium).slice(0, 8);
    const hard = Phaser.Utils.Array.Shuffle(data.hard).slice(0, 5);
    this.questions = [...easy, ...medium, ...hard];

    // Fondo y hojas
    this.background = this.add.image(512, 768, 'bgEasy').setOrigin(0.5).setDepth(0);
    this.row1 = [this.add.image(210, 1186, 'leaf'), this.add.image(512, 1040, 'leaf'), this.add.image(814, 1186, 'leaf')];

    // Mostrar las preguntas
    this.loadQuestion();
  }

  loadQuestion() {
    // Cuando se pasa a la siguiente dificultad, mostrar la transición de nivel
    if (this.currentQuestionIndex === 7) {
      this.showLevelTransitionScreen('Level 2'); // Se pasa al nivel 2 después de la pregunta 7
      this.background.setTexture('bgMedium'); // Cambiar fondo a medium
    } else if (this.currentQuestionIndex === 15) {
      this.showLevelTransitionScreen('Level 3'); // Se pasa al nivel 3 después de la pregunta 15
      this.background.setTexture('bgHard'); // Cambiar fondo a hard
    }

    // Actualizar el texto y la pregunta
    const question = this.questions[this.currentQuestionIndex];
    this.add.text(512, 200, question.q, {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  // Función para mostrar la pantalla de transición entre niveles con cuenta regresiva
  showLevelTransitionScreen(level) {
    let frogSprite, levelTextSprite;
    if (level === 'Level 2') {
      frogSprite = 'froglevel2';
      levelTextSprite = 'mediumtext';
    } else if (level === 'Level 3') {
      frogSprite = 'froglevel3';
      levelTextSprite = 'hardtext';
    } else {
      frogSprite = 'froglevel1';
      levelTextSprite = 'levelText';
    }

    const frog = this.add.sprite(512, 700, frogSprite).setScale(0.5);
    const levelText = this.add.sprite(512, 600, levelTextSprite).setAlpha(0);
    const countdownText = this.add.text(512, 690, '3', {
      fontFamily: 'Arial',
      fontSize: '120px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    countdownText.setRotation(Phaser.Math.DegToRad(45));  // Rotar la cuenta regresiva 45 grados

    this.tweens.add({
      targets: frog,
      y: 500,
      scale: 1,
      duration: 1000,
      ease: 'Bounce.easeOut'
    });

    this.tweens.add({
      targets: levelText,
      alpha: 1,
      duration: 1000,
      ease: 'Power2'
    });

    let countdown = 3;
    const countdownTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        countdown--;
        countdownText.setText(countdown);
        if (countdown === 0) {
          this.time.delayedCall(500, () => {
            frog.destroy();
            levelText.destroy();
            countdownText.destroy();
            this.loadQuestion();  // Continuar con la siguiente pregunta
          });
        }
      },
      loop: true
    });
  }

  update() {
    // Actualizar HUD, tiempo y demás...
  }
}