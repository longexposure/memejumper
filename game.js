class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() { this.scene.start('Title'); }
}

/* =========================
   TITLE
========================= */
class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }

  preload() {
    this.load.image('cover', 'assets/ui/cover.png');
    this.load.image('playBtn', 'assets/ui/play.png');
  }

  create() {
    this.input.once('pointerdown', () => {
      this.sound.unlock();
      this.events.on('shutdown', () => {
        if (this.outroMusic && this.outroMusic.isPlaying) {
          this.outroMusic.stop();
        }
      });
    });

    this.add.image(512, 768, 'cover').setOrigin(0.5);
    const play = this.add.image(512, 1230, 'playBtn')
      .setOrigin(0.5)
      .setScale(1)
      .setInteractive({ useHandCursor: true });

    function arcadeBlink(scene, target) {
      const ON_TIME = 520;   // tiempo visible
      const OFF_TIME = 120;  // tiempo “apagado”
      const cycle = () => {
        target.setAlpha(1);
        scene.time.delayedCall(ON_TIME, () => {
          target.setAlpha(0.15);
          scene.time.delayedCall(OFF_TIME, cycle);
        });
      };
      cycle();
    }

    arcadeBlink(this, play);

    this.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        this.tweens.add({
          targets: play,
          scale: 1.12,
          duration: 120,
          yoyo: true,
          ease: 'Quad.easeOut'
        });
      }
    });

    play.on('pointerover', () => {
      play.visible = true;
      play.setScale(1.08);
      play.setAlpha(1);
    });

    play.on('pointerout', () => {
      play.setScale(1);
    });

    play.on('pointerdown', () => {
      play.visible = true;
      this.tweens.add({
        targets: play,
        scale: 0.85,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          this.scene.start('Game');
        }
      });
    });
  }
}

/* =========================
   GAME
========================= */
class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  preload() {
    const loadingText = this.add.text(512, 768, 'LOADING...', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const progressBar = this.add.graphics();

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(262, 820, 500 * value, 20);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      loadingText.destroy();
    });

    // Cargar imágenes para los niveles y la cuenta regresiva
    this.load.image('bgEasy', 'assets/backgrounds/easy.png');
    this.load.image('bgMedium', 'assets/backgrounds/medium.jpg');
    this.load.image('bgHard', 'assets/backgrounds/hard.jpg');
    this.load.image('resultsBg', 'assets/backgrounds/gameoverbackground.png');
    
    // Cargar imágenes de la rana y del letrero de niveles
    this.load.image('froglevel1', 'assets/ui/froglevel1.png');
    this.load.image('froglevel2', 'assets/ui/froglevel2.png'); // Nueva imagen para Level 2
    this.load.image('froglevel3', 'assets/ui/froglevel3.png'); // Nueva imagen para Level 3
    this.load.image('levelText', 'assets/ui/easytext.png');  // Cambiar la ruta si es necesario
    this.load.image('mediumtext', 'assets/ui/mediumtext.png'); // Nueva imagen de texto para Level 2
    this.load.image('hardtext', 'assets/ui/hardtext.png'); // Nueva imagen de texto para Level 3

    // Cargar otros recursos
    this.load.image('leaf', 'assets/game/leaf.png');
    this.load.image('frog', 'assets/game/frog.png');
    this.load.image('frogJump', 'assets/game/frog2.png');
    this.load.image('frogFall', 'assets/game/frogfall.png');
    this.load.audio('sfx_jump', 'sounds/jump.mp3');
    this.load.audio('sfx_correct', 'sounds/correct.mp3');
    this.load.audio('sfx_wrong', 'sounds/wrong.mp3');
    this.load.audio('sfx_loselife', 'sounds/loselife.mp3');
    this.load.audio('sfx_shake', 'sounds/shake.mp3');
    this.load.audio('sfx_gameover', 'sounds/gameover.mp3');
    this.load.audio('sfx_score', 'sounds/score.mp3');
    this.load.audio('sfx_finalrun', 'sounds/finalrun.mp3');
    this.load.audio('sfx_roundend', 'sounds/roundend.mp3');
    this.load.audio('music_outro', 'sounds/outro.mp3');
    this.load.image('questionFrame', 'assets/ui/questionFrame.png');
    this.load.image('heart', 'assets/game/lives.png');
    this.load.image('gameOverImage', 'assets/game/gameovergame.png');
    this.load.json('questions', 'assets/data/6529_froggy_quiz_final.json');
    this.load.image('end_congratulations', 'assets/end/congratulations.png');
    this.load.image('end_perfectrun', 'assets/end/perfectrun.png');
    this.load.image('end_playagain', 'assets/end/playagain.png');
    this.load.image('end_silver', 'assets/end/silverfrog.png');
    this.load.image('end_gold', 'assets/end/goldfrog.png');
    this.load.image('end_legendary', 'assets/end/legendaryfrog.png');
  }

  create() {
    this.sound.unlock();
    this.isResolving = false;
    this.currentQuestionIndex = 0;
    this.lives = 4;
    this.score = 0;
    this.perfectRun = true;

    // Inicializar sonidos
    this.sfxJump = this.sound.add('sfx_jump', { volume: 1.6 });
    this.sfxCorrect = this.sound.add('sfx_correct', { volume: 0.6 });
    this.sfxWrong = this.sound.add('sfx_wrong', { volume: 1.6 });
    this.sfxLoseLife = this.sound.add('sfx_loselife', { volume: 0.9 });
    this.sfxShake = this.sound.add('sfx_shake', { volume: 1.0 });
    this.sfxGameOver = this.sound.add('sfx_gameover', { volume: 6.0 });
    this.sfxScore = this.sound.add('sfx_score', { volume: 1.0 });
    this.sfxFinalRun = this.sound.add('sfx_finalrun', { volume: 0.9 });
    this.sfxRoundEnd = this.sound.add('sfx_roundend', { volume: 0.9 });
    this.outroMusic = this.sound.add('music_outro', { loop: true, volume: 1.2 });

    // Establecer límites de tiempo
    this.timeLimit = 10000;       // 10s
    this.fastThreshold = 5000;    // 5s

    // Cargar preguntas
    const data = this.cache.json.get('questions');
    const pick = (arr, n) => Phaser.Utils.Array.Shuffle([...arr]).slice(0, n);
    const easy = pick(data.easy, 7);
    const medium = pick(data.medium, 8);
    const hard = pick(data.hard, 5);
    this.questions = [...easy, ...medium, ...hard]; // total 20

    // Inicializar fondo
    this.background = this.add.image(512, 768, 'bgEasy').setOrigin(0.5).setDepth(0);

    // Posiciones y configuración de las hojas
    this.POS1 = [{ x: 210, y: 1186 }, { x: 512, y: 1040 }, { x: 814, y: 1186 }];
    this.POS2 = [{ x: 210, y: 880 }, { x: 512, y: 730 }, { x: 814, y: 880 }];
    this.POS3 = [{ x: 210, y: 580 }, { x: 512, y: 420 }, { x: 814, y: 580 }];
    this.row3 = this.POS3.map(p => this.add.image(p.x, p.y, 'leaf').setOrigin(0.5));
    this.row2 = this.POS2.map(p => this.add.image(p.x, p.y, 'leaf').setOrigin(0.5));
    this.row1 = this.POS1.map(p => this.add.image(p.x, p.y, 'leaf').setOrigin(0.5));
    this.leafStart = this.add.image(512, 1410, 'leaf').setOrigin(0.5);

    // RANA
    this.frog = this.add.image(512, 1360, 'frog').setOrigin(0.5).setDepth(10);
    this.add.image(512, 188, 'questionFrame').setOrigin(0.5);
    this.questionText = this.add.text(512, 200, '', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#000',
      align: 'center',
      wordWrap: { width: 820 }
    }).setOrigin(0.5);

    this.heartIcon = this.add.image(40, 40, 'heart').setOrigin(0.5).setScale(0.6).setDepth(20);
    this.livesText = this.add.text(70, 40, this.lives, {
      fontFamily: 'Arial',
      fontSize: '38px',
      color: '#ffffff'
    }).setOrigin(0, 0.5).setDepth(20);

    this.scoreText = this.add.text(980, 20, this.score, {
      fontFamily: 'Arial',
      fontSize: '38px',
      color: '#ffffff'
    }).setOrigin(1, 0);

    this.timerText = this.add.text(41, 1505, '10', {
      fontFamily: 'Arial',
      fontSize: '34px',
      color: '#ffffff'
    }).setOrigin(0, 1).setDepth(20);

    this.timerCircle = this.add.graphics().setDepth(20);
    this.timerCircleX = 52;
    this.timerCircleY = 1488;
    this.timerCircleRadius = 30;

    this.questionCounterText = this.add.text(980, 1520, '1 / 20', {
      fontFamily: 'Arial',
      fontSize: '34px',
      color: '#ffffff'
    }).setOrigin(1, 1).setDepth(20);

    this.answers = this.row1.map(l =>
      this.add.text(l.x, l.y - 20, '', {
        fontFamily: 'Arial',
        fontSize: '46px',
        color: '#0b2a5a',
        align: 'center',
        wordWrap: { width: 220 }
      })
        .setOrigin(0.5)
        .setDepth(5)
        .setShadow(3, 3, '#fff', 3, true, true)
    );

    this.enableRow1();
    this.loadQuestion();
  }

  // Actualización de fondo
  updateBackgroundByDifficulty() {
    if (this.currentQuestionIndex < 7) {
      this.background.setTexture('bgEasy');
    } else if (this.currentQuestionIndex < 15) {
      this.showLevelTransitionScreen('Level 2');
      this.background.setTexture('bgMedium');
    } else {
      this.showLevelTransitionScreen('Level 3');
      this.background.setTexture('bgHard');
    }
  }

  // Función para mostrar la transición de nivel
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
            this.loadQuestion();
            this.enableRow1();
          });
        }
      },
      loop: true
    });
  }
}

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
  scene: [BootScene, TitleScene, GameScene]
});