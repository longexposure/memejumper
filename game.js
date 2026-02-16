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
    this.load.audio('music_intro', 'sounds/intro.mp3');

    
  }

  create() {

    this.input.once('pointerdown', () => {
  this.sound.unlock();
  // 🔊 detener música automáticamente al salir o reiniciar escena
this.events.on('shutdown', () => {
  if (this.outroMusic && this.outroMusic.isPlaying) {
    this.outroMusic.stop();
  }
});

});


    this.introMusic = this.sound.add('music_intro', {
    loop: true,
    volume: 0.6
  });

  this.introMusic.play()



  
  this.add.image(512, 768, 'cover').setOrigin(0.5);

  const play = this.add.image(512, 1230, 'playBtn')
    .setOrigin(0.5)
    .setScale(1)
    .setInteractive({ useHandCursor: true });


  function arcadeBlink(scene, target) {

  const ON_TIME = 520;   // tiempo visible
  const OFF_TIME = 120;  // tiempo “apagado” (regula aquí 👈)

  const cycle = () => {

    target.setAlpha(1);

    scene.time.delayedCall(ON_TIME, () => {

      target.setAlpha(0.15); // no 0 → queda rastro neón

      scene.time.delayedCall(OFF_TIME, cycle);

    });
  };

  cycle();
}

arcadeBlink(this, play);



  // 🎯 micro golpe periódico (sin inflar mucho)
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


  // 🖱️ hover — fuerza visible
  play.on('pointerover', () => {
    play.visible = true;
    play.setScale(1.08);
    play.setAlpha(1);
  });

  play.on('pointerout', () => {
    play.setScale(1);
  });


  // 👇 click impacto
  play.on('pointerdown', () => {
  play.visible = true;

  this.tweens.add({
    targets: play,
    scale: 0.85,
    duration: 100,
    yoyo: true,
    onComplete: () => {

      if (this.introMusic) this.introMusic.stop();

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
    // backgrounds
    this.load.image('bgEasy', 'assets/backgrounds/easy.png');
    this.load.image('bgMedium', 'assets/backgrounds/medium.jpg');
    this.load.image('bgHard', 'assets/backgrounds/hard.jpg');
    this.load.image('resultsBg', 'assets/backgrounds/gameoverbackground.png');


    // gameplay
    this.load.image('leaf', 'assets/game/leaf.png');
    this.load.image('frog', 'assets/game/frog.png');
    this.load.image('frogJump', 'assets/game/frog2.png');
    this.load.image('frogFall', 'assets/game/frogfall.png');

    // sounds

    this.load.audio('sfx_jump', 'sounds/jump.wav');
    this.load.audio('sfx_correct', 'sounds/correct.wav');
    this.load.audio('sfx_wrong', 'sounds/wrong.wav');
    this.load.audio('sfx_loselife', 'sounds/loselife.wav');
    this.load.audio('sfx_shake', 'sounds/shake.wav');
    this.load.audio('sfx_gameover', 'sounds/gameover.wav');
    this.load.audio('sfx_score', 'sounds/score.wav');
    this.load.audio('sfx_finalrun', 'sounds/finalrun.wav');
    this.load.audio('sfx_roundend', 'sounds/roundend.wav');
    this.load.audio('music_outro', 'sounds/outro.wav');










    // UI
    this.load.image('questionFrame', 'assets/ui/questionFrame.png');
    this.load.image('heart', 'assets/game/lives.png');

    // game over screen image (intermedia)
    this.load.image('gameOverImage', 'assets/game/gameovergame.png');

    // JSON
    this.load.json('questions', 'assets/data/6529_froggy_quiz_final.json');

    /* =========================================================
       ✅ RESULTADOS (END) — AJUSTA RUTAS SI TUS ARCHIVOS SE LLAMAN DISTINTO
       (Yo asumo que están en assets/end/ y SIN nombres raros)
       Si tus archivos tienen espacios tipo "play again.png" -> ponlo aquí
    ========================================================= */

    // Fondo Results (si lo tienes; si no, lo dejo en bgEasy)
    // this.load.image('resultsBg', 'assets/end/results_bg.png');

    this.load.image('end_congratulations', 'assets/end/congratulations.png');
    this.load.image('end_perfectrun', 'assets/end/perfectrun.png');

    // Si tu archivo se llama "play again.png", usa exactamente ese:
    this.load.image('end_playagain', 'assets/end/playagain.png');
    // Ejemplo si tiene espacio:
    // this.load.image('end_playagain', 'assets/end/play again.png');

    this.load.image('end_silver', 'assets/end/silverfrog.png');
    this.load.image('end_gold', 'assets/end/goldfrog.png');
    this.load.image('end_legendary', 'assets/end/legendaryfrog.png');

    // Si NO tienes esos nombres, cambia SOLO esas rutas.
  }

  create() {

this.sound.unlock();


    /* =========================
       ESTADO
    ========================= */
    this.isResolving = false;
    this.currentQuestionIndex = 0;

    this.lives = 4;
    this.score = 0;
    this.perfectRun = true;

    this.sfxJump = this.sound.add('sfx_jump', {
  volume: 1.6
});

this.sfxCorrect = this.sound.add('sfx_correct', {
  volume: 0.6
});

this.sfxWrong = this.sound.add('sfx_wrong', {
  volume: 1.6
});

this.sfxLoseLife = this.sound.add('sfx_loselife', {
  volume: 0.9
});

this.sfxShake = this.sound.add('sfx_shake', { volume: 1.0 });
this.sfxGameOver = this.sound.add('sfx_gameover', { volume: 6.0 });
this.sfxScore = this.sound.add('sfx_score', {
  volume: 1.0
  
});

this.sfxFinalRun = this.sound.add('sfx_finalrun', {
  volume: 0.9
});

this.sfxRoundEnd = this.sound.add('sfx_roundend', {
  volume: 0.9
});

this.outroMusic = this.sound.add('music_outro', {
  loop: true,
  volume: 1.2
});







    this.timeLimit = 10000;       // 10s
    this.fastThreshold = 5000;    // 5s

    /* =========================
       PREGUNTAS (7/8/5)
    ========================= */
    const data = this.cache.json.get('questions');

    const pick = (arr, n) => Phaser.Utils.Array.Shuffle([...arr]).slice(0, n);

    const easy = pick(data.easy, 7);
    const medium = pick(data.medium, 8);
    const hard = pick(data.hard, 5);

    this.questions = [...easy, ...medium, ...hard]; // total 20

    /* =========================
       FONDO
    ========================= */
    this.background = this.add.image(512, 768, 'bgEasy')
      .setOrigin(0.5)
      .setDepth(0);

    /* =========================
       POSICIONES HOJAS
    ========================= */
    this.POS1 = [{ x: 210, y: 1186 }, { x: 512, y: 1040 }, { x: 814, y: 1186 }];
    this.POS2 = [{ x: 210, y: 880 },  { x: 512, y: 730 },  { x: 814, y: 880 }];
    this.POS3 = [{ x: 210, y: 580 },  { x: 512, y: 420 },  { x: 814, y: 580 }];

    this.row3 = this.POS3.map(p => this.add.image(p.x, p.y, 'leaf').setOrigin(0.5));
    this.row2 = this.POS2.map(p => this.add.image(p.x, p.y, 'leaf').setOrigin(0.5));
    this.row1 = this.POS1.map(p => this.add.image(p.x, p.y, 'leaf').setOrigin(0.5));
    this.leafStart = this.add.image(512, 1410, 'leaf').setOrigin(0.5);

    /* =========================
       RANA
    ========================= */
    this.frog = this.add.image(512, 1360, 'frog')
      .setOrigin(0.5)
      .setDepth(10);

    /* =========================
       PREGUNTA
    ========================= */
    this.add.image(512, 188, 'questionFrame').setOrigin(0.5);

    this.questionText = this.add.text(512, 200, '', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#000',
      align: 'center',
      wordWrap: { width: 820 }
    }).setOrigin(0.5);

    /* =========================
       VIDAS (ICONO + TEXTO)
    ========================= */
    this.heartIcon = this.add.image(40, 40, 'heart')
      .setOrigin(0.5)
      .setScale(0.6)
      .setDepth(20);

    this.livesText = this.add.text(70, 40, this.lives, {
      fontFamily: 'Arial',
      fontSize: '38px',
      color: '#ffffff'
    }).setOrigin(0, 0.5).setDepth(20);

    /* =========================
       SCORE HUD
    ========================= */
    this.scoreText = this.add.text(980, 20, this.score, {
      
      fontFamily: 'Arial',
      fontSize: '38px',
      color: '#ffffff'
    }).setOrigin(1, 0);

    /* =========================
       TEMPORIZADOR HUD (abajo izq)
       + círculo al lado del número
    ========================= */
    this.timerText = this.add.text(41, 1505, '10', {
      fontFamily: 'Arial',
      fontSize: '34px',
      color: '#ffffff'
    }).setOrigin(0, 1).setDepth(20);

    this.timerCircle = this.add.graphics().setDepth(20);
    this.timerCircleX = 52;
    this.timerCircleY = 1488;
    this.timerCircleRadius = 30;

    /* =========================
       CONTADOR DE PREGUNTA (abajo der)
    ========================= */
    this.questionCounterText = this.add.text(980, 1520, '1 / 20', {
      fontFamily: 'Arial',
      fontSize: '34px',
      color: '#ffffff'
    }).setOrigin(1, 1).setDepth(20);

    /* =========================
       RESPUESTAS (TEXTOS)
    ========================= */
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

  /* =========================
     BACKGROUND POR DIFICULTAD
  ========================= */
  updateBackgroundByDifficulty() {
    if (this.currentQuestionIndex < 7) {
      this.background.setTexture('bgEasy');
    } else if (this.currentQuestionIndex < 15) {
      this.background.setTexture('bgMedium');
    } else {
      this.background.setTexture('bgHard');
    }
  }

  /* =========================
     TIMER HUD (actualiza número + círculo)
  ========================= */
  updateTimerHUD() {
    if (this.isResolving) return;
    if (!this.questionStartTime) return;

    const elapsed = this.time.now - this.questionStartTime;
    const remainingMs = Math.max(0, this.timeLimit - elapsed);
    const remainingSec = Math.ceil(remainingMs / 1000);

this.timerText.setText(String(remainingSec));

// 🔴 últimos 3 segundos en rojo
const isDanger = remainingSec <= 3;
this.timerText.setColor(isDanger ? '#ff3b3b' : '#ffffff');


    // círculo
    const progress = Phaser.Math.Clamp(remainingMs / this.timeLimit, 0, 1);

    this.timerCircle.clear();

    // aro base
    this.timerCircle.lineStyle(4, 0xffffff, 0.25);
    this.timerCircle.beginPath();
    this.timerCircle.arc(this.timerCircleX, this.timerCircleY, this.timerCircleRadius, 0, Math.PI * 2);
    this.timerCircle.strokePath();

    // arco progreso (desde arriba)
    // arco progreso — rojo en últimos 3s
this.timerCircle.lineStyle(4, isDanger ? 0xff3b3b : 0xffffff, 1);

    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * progress);

    this.timerCircle.beginPath();
    this.timerCircle.arc(this.timerCircleX, this.timerCircleY, this.timerCircleRadius, startAngle, endAngle, false);
    this.timerCircle.strokePath();
  }

  /* =========================
     CARGAR PREGUNTA
  ========================= */
  loadQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.questionText.setText('END OF DEMO');
      this.answers.forEach(a => a.setVisible(false));
      return;
    }

    this.updateBackgroundByDifficulty();

    const q = this.questions[this.currentQuestionIndex];

    this.questionCounterText.setText(
      (this.currentQuestionIndex + 1) + ' / ' + this.questions.length
    );

    this.questionText.setText(q.q);

    const pool = q.answers.map((t, i) => ({
      text: t,
      isCorrect: i === q.correct
    }));

    Phaser.Utils.Array.Shuffle(pool);

    pool.forEach((o, i) => {
      this.answers[i].setText(o.text);
      this.answers[i].setPosition(this.row1[i].x, this.row1[i].y - 20);
      this.answers[i].setVisible(true);
      if (o.isCorrect) this.correctIndex = i;
    });

    // Timer pregunta
    this.questionStartTime = this.time.now;

    if (this.questionTimer) this.questionTimer.remove(false);
    this.questionTimer = this.time.delayedCall(this.timeLimit, () => {
      if (!this.isResolving) {
        this.handleAnswer(-1, this.row1[1]); // timeout = fallo hoja central
      }
    });

    this.isResolving = false;

    // forzar HUD inmediato
    this.updateTimerHUD();
  }

  update() {
    this.updateTimerHUD();
  }

  /* =========================
     INTERACCIÓN
  ========================= */
  enableLeaf(leaf, i) {
    leaf.removeAllListeners();
    leaf.setInteractive({ useHandCursor: true });

    leaf.on('pointerover', () => leaf.setScale(1.08));
    leaf.on('pointerout', () => leaf.setScale(1));

    leaf.on('pointerdown', () => {
      if (this.isResolving) return;
      this.handleAnswer(i, leaf);
    });
  }

  enableRow1() {
    this.row1.forEach((l, i) => this.enableLeaf(l, i));
  }

  disableRow1() {
    this.row1.forEach(l => l.disableInteractive());
  }

  handleAnswer(i, leaf) {
    this.isResolving = true;
    this.disableRow1();

    // ocultar respuestas
    this.answers.forEach(a => a.setVisible(false));

    this.jumpToLeaf(leaf, i === this.correctIndex);
  }

  /* =========================
     SALTO
  ========================= */
  jumpToLeaf(leaf, correct) {
    this.frog.setTexture('frogJump').setScale(0.35);
    if (this.sfxJump) this.sfxJump.play();


    this.tweens.add({
      targets: this.frog,
      x: leaf.x,
      y: leaf.y - 50,
      duration: 120,
      ease: 'Power2',
      onComplete: () => {
        this.frog.setTexture('frog').setScale(1);
        correct ? this.handleCorrect() : this.handleWrong(leaf);
      }
    });
  }

  /* =========================
     ACIERTO
  ========================= */
  handleCorrect() {
    if (this.questionTimer) this.questionTimer.remove(false);

    this.time.delayedCall(100, () => {
  if (this.sfxCorrect) this.sfxCorrect.play();
});



   const responseTime = this.time.now - this.questionStartTime;

let points;

if (responseTime <= 3000) {
  points = 4000;          // súper rápida
}
else if (responseTime <= 6000) {
  points = 3000;          // rápida
}
else if (responseTime <= 8000) {
  points = 2000;          // media
}
else {
  points = 1000;          // lenta
}




    this.score += points;
    this.scoreText.setText(this.score);
    

    const floatingPoints = this.add.text(
      this.frog.x,
      this.frog.y - 60,
      '+' + points,
      {
        fontFamily: 'Arial',
        fontSize: '80px',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: floatingPoints,
      y: floatingPoints.y - 60,
      alpha: 0,
      duration: 1300,
      ease: 'Power1',
      onComplete: () => floatingPoints.destroy()
    });

    this.time.delayedCall(500, () => {
      this.moveRowsDown(() => {

        // rana vuelve SIEMPRE a inicio
        this.frog.setPosition(512, 1360);

        // avanzar pregunta
        this.currentQuestionIndex++;

        // fin partida
        if (this.currentQuestionIndex >= this.questions.length) {
          if (this.lives > 0) {
            this.playFinalRun();   // animación final
          } else {
            this.showGameOverScreen();
          }
          return;
        }

        // continuar
        this.time.delayedCall(400, () => {
          this.loadQuestion();
          this.enableRow1();
        });

      });
    });
  }

  /* =========================
     FALLO
  ========================= */
  handleWrong(leaf) {
    if (this.questionTimer) this.questionTimer.remove(false);

    this.time.delayedCall(100, () => {
  if (this.sfxWrong) this.sfxWrong.play();
});


    this.perfectRun = false;

    this.lives--;
    this.updateLivesUI();

    this.time.delayedCall(700, () => {
  if (this.sfxLoseLife) this.sfxLoseLife.play();
});



    const y0 = leaf.y;

    this.tweens.add({
      targets: [this.frog, leaf],
      alpha: 0,
      duration: 80,
      yoyo: true,
      repeat: 3,
      onComplete: () => {

        this.tweens.add({
          targets: [this.frog, leaf],
          y: '+=120',
          alpha: 0,
          duration: 250,
          ease: 'Quad.easeIn',
          onComplete: () => {

            this.frog.setVisible(false);
            leaf.setVisible(false);

            const fall = this.add.image(leaf.x, y0, 'frogFall').setOrigin(0.5);

            this.tweens.add({
              targets: fall,
              alpha: 0,
              duration: 900,
              onComplete: () => {
                fall.destroy();

                leaf.setVisible(true).setAlpha(1).setY(y0);

                this.frog
                  .setVisible(true)
                  .setAlpha(1)
                  .setTexture('frog')
                  .setPosition(512, 1360);

                this.time.delayedCall(550, () => {

                  if (this.lives <= 0) {
                    this.showGameOverScreen(); // ✅ primero pantalla game over
                    return;
                  }

                  this.currentQuestionIndex++;

                  if (this.currentQuestionIndex >= this.questions.length) {
                    // si fallas la última pero te quedan vidas -> results directo
                    this.showResults();
                    return;
                  }

                  this.loadQuestion();
                  this.enableRow1();

                });
              }
            });

          }
        });

      }
    });
  }

  /* =========================
   FINAL RUN (3 SALTOS)
========================= */
playFinalRun() {
  this.disableRow1();
  this.isResolving = true;

  // 🔊 sonido triple salto
  if (this.sfxFinalRun) this.sfxFinalRun.play();

  this.tweens.add({
    targets: this.frog,
    x: this.row2[1].x,
    y: this.row2[1].y - 50,
    duration: 350,
    ease: 'Power2',
    onComplete: () => {

      this.tweens.add({
        targets: this.frog,
        x: this.row3[1].x,
        y: this.row3[1].y - 50,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {

          this.tweens.add({
            targets: this.frog,
            x: 512,
            y: 200,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {

              // 🏆 TACHÁN final
              if (this.sfxRoundEnd) this.sfxRoundEnd.play();

              // esperar a que termine (1.72s)
this.time.delayedCall(1720, () => {

  this.cameras.main.fadeOut(700, 0, 0, 0);

  this.cameras.main.once('camerafadeoutcomplete', () => {

    this.showResults();

    this.cameras.main.fadeIn(400, 0, 0, 0);

    this.cameras.main.once('camerafadeincomplete', () => {

      if (this.outroMusic && !this.outroMusic.isPlaying) {
        this.outroMusic.play();
      }

    });

  });

});


            }
          });

        }
      });

    }
  });
}



  /* =========================
     VIDAS UI
  ========================= */
  updateLivesUI() {
    this.livesText.setText(this.lives);

    this.tweens.add({
      targets: this.heartIcon,
      scale: 0.8,
      duration: 100,
      yoyo: true,
      ease: 'Power1'
    });
  }

  /* =========================
   GAME OVER SCREEN (INTERMEDIA)
========================= */
showGameOverScreen() {
  this.disableRow1();
  this.isResolving = true;

  // 💥 1️⃣ SONIDO SHAKE + cámara
  if (this.sfxShake) this.sfxShake.play();
  this.cameras.main.shake(500, 0.02);

  // esperar a que termine el shake
  this.time.delayedCall(700, () => {

    this.children.removeAll();

    this.add.rectangle(512, 768, 1024, 1536, 0x000000);

    this.add.image(512, 768, 'gameOverImage')
      .setOrigin(0.5)
      .setScale(0.85);

    // 💀 2️⃣ SONIDO GAME OVER (cuando aparece la imagen)
    if (this.sfxGameOver) this.sfxGameOver.play();

    // ⏳ pausa antes del fade
    this.time.delayedCall(4000, () => {

      this.cameras.main.fadeOut(600, 0, 0, 0);

      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.showResults();
        this.cameras.main.fadeIn(400, 0, 0, 0);
      });

    });

  });
}





  /* =========================
     RESULTS
  ========================= */
  showResults() {

    this.sound.unlock();

    // limpiar escena
    this.children.removeAll();
    this.isResolving = true;

    const isGameOver = (this.lives <= 0);

    // Fondo results: si tienes resultsBg úsalo, si no bgEasy
    // this.add.image(512, 768, 'resultsBg').setOrigin(0.5);
    this.add.image(512, 768, 'resultsBg').setOrigin(0.5);

    // CONGRATULATIONS solo si NO game over
    if (!isGameOver) {
      this.add.image(512, 140, 'end_congratulations')
        .setOrigin(0.5)
        .setScale(0.9);
    }

    // PERFECT RUN solo si NO game over y perfectRun=true
    if (!isGameOver && this.perfectRun) {
      this.add.image(512, 310, 'end_perfectrun')
        .setOrigin(0.5)
        
    }

    // Badge según score (ajústalo luego si quieres)
    let badgeKey = 'end_silver';
    if (this.score >= 25000) badgeKey = 'end_legendary';
    else if (this.score >= 15000) badgeKey = 'end_gold';

    this.add.image(512, 800, badgeKey)
      .setOrigin(0.5)
      .setScale(0.95);
      




    // SCORE (animado)
    const BONUS_420 = 420;
const finalScore = this.score + BONUS_420;




this.add.text(512, 1180, 'BONUS +420', {
  fontFamily: 'Arial',
  fontSize: '42px',
  color: '#ffd700',
  stroke: '#000000',
  strokeThickness: 4
}).setOrigin(0.5);



    const scoreText = this.add.text(512, 1275, '0', {
      fontFamily: 'Arial',
      fontSize: '120px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

 const duration = 1050;
const updateInterval = 20;
const totalSteps = Math.round(duration / updateInterval);

let displayed = 0;
let tickCounter = 0;

const step = finalScore / totalSteps;

this.time.addEvent({
  delay: updateInterval,
  repeat: totalSteps - 1,
  callback: () => {

    displayed += step;
    tickCounter++;

    scoreText.setText(String(Math.floor(displayed)));

    if (this.sfxScore && tickCounter % 2 === 0) {
      this.sfxScore.play();
    }

  },
  onComplete: () => {
    scoreText.setText(String(finalScore));
  }
});




   // PLAY AGAIN
const play = this.add.image(512, 1450, 'end_playagain')
  .setOrigin(0.5)
  .setScale(0)
  .setInteractive({ useHandCursor: true });


// 🌈 glow duplicado ADD
const glow = this.add.image(play.x, play.y, 'end_playagain')
  .setOrigin(0.5)
  .setScale(0)
  .setAlpha(0.35)
  .setBlendMode(Phaser.BlendModes.ADD)
  .setDepth(play.depth - 1);


// 🎬 entrada rebote
this.tweens.add({
  targets: [play, glow],
  scale: 0.9,
  duration: 450,
  ease: 'Back.easeOut'
});


// 💓 pulso base botón
this.tweens.add({
  targets: play,
  scale: 0.96,
  duration: 800,
  yoyo: true,
  repeat: -1,
  ease: 'Sine.easeInOut',
  delay: 450
});


// 🌟 glow respiración
this.tweens.add({
  targets: glow,
  scale: 1.18,
  alpha: 0.08,
  duration: 600,
  yoyo: true,
  repeat: -1,
  ease: 'Sine.easeInOut',
  delay: 450
});


// ⚡ parpadeo arcade suave
this.tweens.add({
  targets: play,
  alpha: 0.7,
  duration: 120,
  yoyo: true,
  repeat: -1,
  repeatDelay: 1000
});


// 🌈 ciclo de color neón (arcade real)
const neonColors = [
  0xffff66, // amarillo
  0x66ffff, // cian
  0xff66ff, // magenta
  0x66ff66  // verde
];

let neonIndex = 0;

this.time.addEvent({
  delay: 220,
  loop: true,
  callback: () => {
    glow.setTint(neonColors[neonIndex]);
    neonIndex = (neonIndex + 1) % neonColors.length;
  }
});


// 🖱️ hover
play.on('pointerover', () => play.setScale(1.05));
play.on('pointerout', () => play.setScale(0.9));


// 👇 click bounce
play.on('pointerdown', () => {
  this.tweens.add({
    targets: [play, glow],
    scale: 0.8,
    duration: 100,
    yoyo: true,
    onComplete: () => {

  if (this.outroMusic && this.outroMusic.isPlaying) {
    this.outroMusic.stop();
  }

  this.scene.restart();

}

  });
});





  }

  /* =========================
     AVANCE DEL CAMINO (HOJAS)
  ========================= */
  moveRowsDown(cb) {
    const D = 150;

    // ocultar fila de respuestas
    this.row1.forEach(l => l.setVisible(false));

    // fila2 -> fila1
    this.row2.forEach((l, i) => {
      this.tweens.add({
        targets: l,
        x: this.POS1[i].x,
        y: this.POS1[i].y,
        duration: D
      });
    });

    // fila3 -> fila2
    this.row3.forEach((l, i) => {
      this.tweens.add({
        targets: l,
        x: this.POS2[i].x,
        y: this.POS2[i].y,
        duration: D
      });
    });

    this.time.delayedCall(D, () => {
      // la fila1 vieja sube arriba (POS3) y reaparece
      this.row1.forEach((l, i) => {
        l.setPosition(this.POS3[i].x, this.POS3[i].y).setVisible(true);
      });

      // rotar filas
      [this.row1, this.row2, this.row3] = [this.row2, this.row3, this.row1];

      if (cb) cb();
    });
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
    baseURL: window.location.hostname.includes('github.io')
      ? '/memejumper/'
      : ''
  },

  scene: [BootScene, TitleScene, GameScene]
});
