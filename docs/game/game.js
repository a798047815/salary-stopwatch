const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const statusElement = document.getElementById('status');
const controlTextElement = document.getElementById('controlText');
const gameButtons = document.querySelectorAll('.game-btn');

let currentGame = 'pong';
let gameRunning = false;
let gamePaused = false;
let animationId = null;

// Pong 游戏变量
let leftPaddle = { x: 20, y: canvas.height / 2 - 50, width: 15, height: 100, speed: 8, score: 0 };
let rightPaddle = { x: canvas.width - 35, y: canvas.height / 2 - 50, width: 15, height: 100, speed: 8, score: 0 };
let ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 8, speedX: 5, speedY: 5 };

// Breakout 游戏变量
let bricks = [];
let paddle = { x: canvas.width / 2 - 60, y: canvas.height - 30, width: 120, height: 15, speed: 8 };
let breakoutBall = { x: canvas.width / 2, y: canvas.height - 50, radius: 8, speedX: 4, speedY: -4 };
let breakoutScore = 0;
let lives = 3;

// 键盘状态
const keys = {};
// 触摸状态
let touchLeft = false;
let touchRight = false;
let touchUp = false;
let touchDown = false;

// 事件监听 - 键盘
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === ' ') {
    e.preventDefault();
    if (gameRunning) {
      gamePaused = !gamePaused;
      statusElement.textContent = gamePaused ? '已暂停' : '游戏中';
    }
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// 事件监听 - 触摸（手机端）
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  // 计算缩放比例，适配canvas在手机上的缩放显示
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (touch.clientX - rect.left) * scaleX;
  const y = (touch.clientY - rect.top) * scaleY;
  
  // Pong触摸控制：触摸位置就是对应侧板子的位置
  if (currentGame === 'pong') {
    if (x < canvas.width / 2) {
      // 左半屏控制左边板子，直接跳转到触摸位置
      leftPaddle.y = y - leftPaddle.height / 2;
    } else {
      // 右半屏控制右边板子，直接跳转到触摸位置
      rightPaddle.y = y - rightPaddle.height / 2;
    }
  } 
  // Breakout触摸控制：点击位置就是板子位置
  else if (currentGame === 'breakout') {
    paddle.x = x - paddle.width / 2;
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x > canvas.width - paddle.width) paddle.x = canvas.width - paddle.width;
  }
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const x = (touch.clientX - rect.left) * scaleX;
  
  if (currentGame === 'pong') {
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    if (x < canvas.width / 2) {
      leftPaddle.y = y - leftPaddle.height / 2;
    } else {
      rightPaddle.y = y - rightPaddle.height / 2;
    }
    // 边界限制
    if (leftPaddle.y < 0) leftPaddle.y = 0;
    if (leftPaddle.y > canvas.height - leftPaddle.height) leftPaddle.y = canvas.height - leftPaddle.height;
    if (rightPaddle.y < 0) rightPaddle.y = 0;
    if (rightPaddle.y > canvas.height - rightPaddle.height) rightPaddle.y = canvas.height - rightPaddle.height;
  } else if (currentGame === 'breakout') {
    paddle.x = x - paddle.width / 2;
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x > canvas.width - paddle.width) paddle.x = canvas.width - paddle.width;
  }
});

canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  touchUp = false;
  touchDown = false;
});

// 切换游戏
function switchGame(game) {
  currentGame = game;
  gameRunning = false;
  gamePaused = false;
  
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  // 更新按钮状态
  gameButtons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  if (game === 'pong') {
    controlTextElement.textContent = 'Pong操作：W/S 移动左边板子，↑/↓ 移动右边板子';
    initPong();
  } else if (game === 'breakout') {
    controlTextElement.textContent = 'Breakout操作：←/→ 移动板子，空格键暂停';
    initBreakout();
  }

  statusElement.textContent = '准备开始';
  updateScore();
}

// 初始化Pong
function initPong() {
  leftPaddle.y = canvas.height / 2 - 50;
  rightPaddle.y = canvas.height / 2 - 50;
  leftPaddle.score = 0;
  rightPaddle.score = 0;
  resetBall();
}

// 初始化Breakout
function initBreakout() {
  bricks = [];
  const rows = 5;
  const cols = 10;
  const brickWidth = (canvas.width - 100) / cols;
  const brickHeight = 20;
  const colors = ['#ff6b6b', '#ffa500', '#ffff00', '#0f0', '#00f'];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      bricks.push({
        x: 50 + col * brickWidth,
        y: 50 + row * (brickHeight + 10),
        width: brickWidth - 5,
        height: brickHeight,
        color: colors[row],
        visible: true
      });
    }
  }

  paddle.x = canvas.width / 2 - 60;
  breakoutBall.x = canvas.width / 2;
  breakoutBall.y = canvas.height - 50;
  breakoutBall.speedX = 4;
  breakoutBall.speedY = -4;
  breakoutScore = 0;
  lives = 3;
}

// 重置球
function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speedX = -ball.speedX;
  ball.speedY = (Math.random() - 0.5) * 8;
}

// 更新得分
function updateScore() {
  if (currentGame === 'pong') {
    scoreElement.textContent = `得分: ${leftPaddle.score} - ${rightPaddle.score}`;
  } else if (currentGame === 'breakout') {
    scoreElement.textContent = `得分: ${breakoutScore} | 生命: ${lives}`;
  }
}

// 绘制Pong
function drawPong() {
  // 清空画布
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制中线
  ctx.strokeStyle = '#0f0';
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // 绘制板子
  ctx.fillStyle = '#0f0';
  ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

  // 绘制球
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#0f0';
  ctx.fill();
  ctx.closePath();
}

// 绘制Breakout
function drawBreakout() {
  // 清空画布
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制砖块
  bricks.forEach(brick => {
    if (brick.visible) {
      ctx.fillStyle = brick.color;
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    }
  });

  // 绘制板子
  ctx.fillStyle = '#0f0';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  // 绘制球
  ctx.beginPath();
  ctx.arc(breakoutBall.x, breakoutBall.y, breakoutBall.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.closePath();
}

// 更新Pong逻辑
function updatePong() {
  // 移动板子 - 键盘控制
  if (keys['w'] && leftPaddle.y > 0) leftPaddle.y -= leftPaddle.speed;
  if (keys['s'] && leftPaddle.y < canvas.height - leftPaddle.height) leftPaddle.y += leftPaddle.speed;
  if (keys['ArrowUp'] && rightPaddle.y > 0) rightPaddle.y -= rightPaddle.speed;
  if (keys['ArrowDown'] && rightPaddle.y < canvas.height - rightPaddle.height) rightPaddle.y += rightPaddle.speed;

  // 移动板子 - 触摸控制（手机端）
  if (touchUp) {
    leftPaddle.y -= leftPaddle.speed;
    rightPaddle.y -= rightPaddle.speed;
  }
  if (touchDown) {
    leftPaddle.y += leftPaddle.speed;
    rightPaddle.y += rightPaddle.speed;
  }

  // 边界限制
  if (leftPaddle.y < 0) leftPaddle.y = 0;
  if (leftPaddle.y > canvas.height - leftPaddle.height) leftPaddle.y = canvas.height - leftPaddle.height;
  if (rightPaddle.y < 0) rightPaddle.y = 0;
  if (rightPaddle.y > canvas.height - rightPaddle.height) rightPaddle.y = canvas.height - rightPaddle.height;

  // 移动球
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // 上下边界碰撞
  if (ball.y < ball.radius || ball.y > canvas.height - ball.radius) {
    ball.speedY = -ball.speedY;
  }

  // 左边板子碰撞
  if (ball.x < leftPaddle.x + leftPaddle.width + ball.radius &&
      ball.y > leftPaddle.y && ball.y < leftPaddle.y + leftPaddle.height) {
    ball.speedX = -ball.speedX;
    // 增加速度
    ball.speedX *= 1.05;
    ball.speedY *= 1.05;
  }

  // 右边板子碰撞
  if (ball.x > rightPaddle.x - ball.radius &&
      ball.y > rightPaddle.y && ball.y < rightPaddle.y + rightPaddle.height) {
    ball.speedX = -ball.speedX;
    // 增加速度
    ball.speedX *= 1.05;
    ball.speedY *= 1.05;
  }

  // 得分
  if (ball.x < 0) {
    rightPaddle.score++;
    updateScore();
    resetBall();
  }
  if (ball.x > canvas.width) {
    leftPaddle.score++;
    updateScore();
    resetBall();
  }
}

// 更新Breakout逻辑
function updateBreakout() {
  // 移动板子
  if (keys['ArrowLeft'] && paddle.x > 0) paddle.x -= paddle.speed;
  if (keys['ArrowRight'] && paddle.x < canvas.width - paddle.width) paddle.x += paddle.speed;

  // 移动球
  breakoutBall.x += breakoutBall.speedX;
  breakoutBall.y += breakoutBall.speedY;

  // 左右边界碰撞
  if (breakoutBall.x < breakoutBall.radius || breakoutBall.x > canvas.width - breakoutBall.radius) {
    breakoutBall.speedX = -breakoutBall.speedX;
  }

  // 上边界碰撞
  if (breakoutBall.y < breakoutBall.radius) {
    breakoutBall.speedY = -breakoutBall.speedY;
  }

  // 板子碰撞
  if (breakoutBall.y > paddle.y - breakoutBall.radius &&
      breakoutBall.x > paddle.x && breakoutBall.x < paddle.x + paddle.width) {
    breakoutBall.speedY = -breakoutBall.speedY;
    // 调整水平速度
    const hitPos = (breakoutBall.x - paddle.x) / paddle.width;
    breakoutBall.speedX = (hitPos - 0.5) * 8;
  }

  // 砖块碰撞
  bricks.forEach(brick => {
    if (brick.visible &&
        breakoutBall.x > brick.x && breakoutBall.x < brick.x + brick.width &&
        breakoutBall.y > brick.y && breakoutBall.y < brick.y + brick.height) {
      breakoutBall.speedY = -breakoutBall.speedY;
      brick.visible = false;
      breakoutScore += 10;
      updateScore();
    }
  });

  // 掉球
  if (breakoutBall.y > canvas.height) {
    lives--;
    updateScore();
    if (lives <= 0) {
      gameRunning = false;
      statusElement.textContent = `游戏结束！最终得分: ${breakoutScore}`;
      cancelAnimationFrame(animationId);
    } else {
      // 重置球
      breakoutBall.x = canvas.width / 2;
      breakoutBall.y = canvas.height - 50;
      breakoutBall.speedX = 4;
      breakoutBall.speedY = -4;
    }
  }

  // 检查是否所有砖块都被打破
  const allBricksBroken = bricks.every(brick => !brick.visible);
  if (allBricksBroken) {
    gameRunning = false;
    statusElement.textContent = `恭喜通关！得分: ${breakoutScore}`;
    cancelAnimationFrame(animationId);
  }
}

// 游戏循环
function gameLoop() {
  if (!gameRunning || gamePaused) return;

  if (currentGame === 'pong') {
    updatePong();
    drawPong();
  } else if (currentGame === 'breakout') {
    updateBreakout();
    drawBreakout();
  }

  animationId = requestAnimationFrame(gameLoop);
}

// 开始游戏
function startGame() {
  if (gameRunning) return;
  
  gameRunning = true;
  gamePaused = false;
  statusElement.textContent = '游戏中';
  
  if (currentGame === 'pong') {
    initPong();
    drawPong();
  } else if (currentGame === 'breakout') {
    initBreakout();
    drawBreakout();
  }
  
  updateScore();
  gameLoop();
}

// 初始化
initPong();
drawPong();
updateScore();
