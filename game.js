// 音效管理
const gameSounds = {
  enabled: true,
  // 生成简单音效
  play(type) {
    if (!this.enabled) return

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      switch(type) {
        case 'score': // 得分音效
          oscillator.type = 'sine'
          oscillator.frequency.value = 800
          gainNode.gain.value = 0.1
          oscillator.start()
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)
          oscillator.stop(audioContext.currentTime + 0.1)
          break
        case 'gameOver': // 游戏结束音效
          oscillator.type = 'sawtooth'
          oscillator.frequency.value = 300
          gainNode.gain.value = 0.1
          oscillator.start()
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5)
          oscillator.stop(audioContext.currentTime + 0.5)
          break
        case 'start': // 游戏开始音效
          oscillator.type = 'sine'
          oscillator.frequency.value = 500
          gainNode.gain.value = 0.1
          oscillator.start()
          oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2)
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)
          oscillator.stop(audioContext.currentTime + 0.2)
          break
        case 'click': // 按钮点击音效
          oscillator.type = 'square'
          oscillator.frequency.value = 600
          gainNode.gain.value = 0.05
          oscillator.start()
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05)
          oscillator.stop(audioContext.currentTime + 0.05)
          break
      }
    } catch (e) {
      // 忽略音频错误
    }
  }
}

// 游戏全局状态
const gameState = {
  currentGame: 'snake',
  isRunning: false,
  isPaused: false,
  score: 0,
  highScore: localStorage.getItem('gameHighScore') || 0,
  timer: null,
  speed: 150,
  canvas: null,
  ctx: null,
  gridSize: 20,

  // 贪吃蛇数据
  snake: [],
  direction: 'right',
  food: {},
  
  // 飞机大战数据
  plane: { x: 180, y: 450, width: 40, height: 40 },
  bullets: [],
  enemies: [],
  
  // 俄罗斯方块数据
  tetrisBoard: [],
  tetrisPiece: null,
  tetrisNextPiece: null,
  tetrisSpeed: 1000,
  tetrisLines: 0
}

// 游戏初始化
function initGame() {
  gameState.canvas = document.getElementById('gameCanvas')
  gameState.ctx = gameState.canvas.getContext('2d')
  
  // 加载最高记录
  updateHighScoreUI()
  
  // 绑定键盘事件
  window.addEventListener('keydown', handleKeyPress)
  
  // 初始化当前游戏
  initCurrentGame()
}

// 初始化当前选择的游戏
function initCurrentGame() {
  stopGame()
  
  switch(gameState.currentGame) {
    case 'snake':
      initSnake()
      document.getElementById('gameControlsDesc').textContent = '贪吃蛇操作：方向键 ↑ ↓ ← → 控制方向'
      break
    case 'plane':
      initPlane()
      document.getElementById('gameControlsDesc').textContent = '飞机大战操作：方向键 ← → 移动，空格键发射子弹'
      break
    case 'tetris':
      initTetris()
      document.getElementById('gameControlsDesc').textContent = '俄罗斯方块操作：方向键 ← → 移动，↑ 旋转，↓ 加速下落'
      break
  }
  
  updateGameStatus('准备开始')
  updateScoreUI()
}

// 切换游戏
function switchGame(gameName) {
  if (gameState.currentGame === gameName) return
  
  // 更新按钮状态
  document.querySelectorAll('.game-btn').forEach(btn => {
    btn.classList.remove('active')
  })
  document.querySelector(`[data-game="${gameName}"]`).classList.add('active')
  
  gameState.currentGame = gameName
  initCurrentGame()
}

// 开始游戏
function startGame() {
  if (gameState.isRunning && !gameState.isPaused) return

  gameSounds.play('start')

  if (gameState.isPaused) {
    gameState.isPaused = false
    updateGameStatus('游戏中')
    document.getElementById('gameStartBtn').style.display = 'none'
    document.getElementById('gamePauseBtn').style.display = 'inline-block'
    runGameLoop()
    return
  }

  gameState.isRunning = true
  gameState.isPaused = false
  gameState.score = 0
  updateScoreUI()
  updateGameStatus('游戏中')

  document.getElementById('gameStartBtn').style.display = 'none'
  document.getElementById('gamePauseBtn').style.display = 'inline-block'

  runGameLoop()
}

// 暂停游戏
function pauseGame() {
  if (!gameState.isRunning || gameState.isPaused) return
  
  gameState.isPaused = true
  updateGameStatus('已暂停')
  
  document.getElementById('gameStartBtn').style.display = 'inline-block'
  document.getElementById('gamePauseBtn').style.display = 'none'
  
  if (gameState.timer) {
    clearInterval(gameState.timer)
    gameState.timer = null
  }
}

// 停止游戏
function stopGame() {
  gameState.isRunning = false
  gameState.isPaused = false
  
  if (gameState.timer) {
    clearInterval(gameState.timer)
    gameState.timer = null
  }
  
  document.getElementById('gameStartBtn').style.display = 'inline-block'
  document.getElementById('gamePauseBtn').style.display = 'none'
  
  // 保存最高记录
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score
    localStorage.setItem('gameHighScore', gameState.highScore)
    updateHighScoreUI()
  }
}

// 游戏结束
function gameOver() {
  stopGame()
  gameSounds.play('gameOver')
  updateGameStatus(`游戏结束！得分：${gameState.score}`)

  // 保存最高记录
  const isNewRecord = gameState.score > gameState.highScore
  if (isNewRecord) {
    gameState.highScore = gameState.score
    localStorage.setItem('gameHighScore', gameState.highScore)
    updateHighScoreUI()
  }

  // 显示结算界面
  showGameOverModal(isNewRecord)
}

// 显示游戏结算界面
function showGameOverModal(isNewRecord) {
  const modal = document.getElementById('gameOverModal')
  document.getElementById('finalScore').textContent = gameState.score
  document.getElementById('finalHighScore').textContent = gameState.highScore

  if (isNewRecord) {
    document.getElementById('newRecordBadge').style.display = 'block'
  } else {
    document.getElementById('newRecordBadge').style.display = 'none'
  }

  modal.style.display = 'flex'
}

// 关闭结算界面
function closeGameOverModal() {
  const modal = document.getElementById('gameOverModal')
  modal.style.display = 'none'
}

// 重新开始游戏
function restartGame() {
  closeGameOverModal()
  initCurrentGame()
  startGame()
}

// 游戏主循环
function runGameLoop() {
  if (gameState.timer) {
    clearInterval(gameState.timer)
  }
  
  let speed = gameState.speed
  if (gameState.currentGame === 'tetris') {
    speed = gameState.tetrisSpeed
  }
  
  gameState.timer = setInterval(() => {
    if (!gameState.isRunning || gameState.isPaused) return
    
    gameState.ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height)
    
    switch(gameState.currentGame) {
      case 'snake':
        updateSnake()
        drawSnake()
        break
      case 'plane':
        updatePlane()
        drawPlane()
        break
      case 'tetris':
        updateTetris()
        drawTetris()
        break
    }
  }, speed)
}

// 键盘事件处理
function handleKeyPress(e) {
  if (!gameState.isRunning || gameState.isPaused) {
    if (e.key === ' ') {
      e.preventDefault()
      startGame()
    }
    return
  }
  
  switch(gameState.currentGame) {
    case 'snake':
      handleSnakeKeyPress(e)
      break
    case 'plane':
      handlePlaneKeyPress(e)
      break
    case 'tetris':
      handleTetrisKeyPress(e)
      break
  }
}

// ------------------------------
// 贪吃蛇实现
// ------------------------------
function initSnake() {
  gameState.snake = [
    { x: 10 * gameState.gridSize, y: 10 * gameState.gridSize },
    { x: 9 * gameState.gridSize, y: 10 * gameState.gridSize },
    { x: 8 * gameState.gridSize, y: 10 * gameState.gridSize }
  ]
  gameState.direction = 'right'
  generateFood()
  drawSnake()
}

function generateFood() {
  gameState.food = {
    x: Math.floor(Math.random() * (gameState.canvas.width / gameState.gridSize)) * gameState.gridSize,
    y: Math.floor(Math.random() * (gameState.canvas.height / gameState.gridSize)) * gameState.gridSize
  }
  
  // 避免食物出现在蛇身上
  for (let segment of gameState.snake) {
    if (segment.x === gameState.food.x && segment.y === gameState.food.y) {
      generateFood()
      break
    }
  }
}

function updateSnake() {
  const head = { ...gameState.snake[0] }
  
  switch(gameState.direction) {
    case 'up':
      head.y -= gameState.gridSize
      break
    case 'down':
      head.y += gameState.gridSize
      break
    case 'left':
      head.x -= gameState.gridSize
      break
    case 'right':
      head.x += gameState.gridSize
      break
  }
  
  // 撞墙检测
  if (head.x < 0 || head.x >= gameState.canvas.width || 
      head.y < 0 || head.y >= gameState.canvas.height) {
    gameOver()
    return
  }
  
  // 撞自己检测
  for (let segment of gameState.snake) {
    if (segment.x === head.x && segment.y === head.y) {
      gameOver()
      return
    }
  }
  
  gameState.snake.unshift(head)
  
  // 吃到食物
  if (head.x === gameState.food.x && head.y === gameState.food.y) {
    gameState.score += 10
    gameSounds.play('score')
    updateScoreUI()
    generateFood()
    
    // 加速
    if (gameState.speed > 50) {
      gameState.speed -= 5
      runGameLoop()
    }
  } else {
    gameState.snake.pop()
  }
}

function drawSnake() {
  // 画食物
  gameState.ctx.fillStyle = '#ff0000'
  gameState.ctx.fillRect(gameState.food.x, gameState.food.y, gameState.gridSize, gameState.gridSize)
  
  // 画蛇
  gameState.ctx.fillStyle = '#0f0'
  gameState.snake.forEach((segment, index) => {
    if (index === 0) {
      gameState.ctx.fillStyle = '#0a0' // 蛇头颜色更深
    }
    gameState.ctx.fillRect(segment.x, segment.y, gameState.gridSize - 1, gameState.gridSize - 1)
    if (index === 0) {
      gameState.ctx.fillStyle = '#0f0'
    }
  })
}

function handleSnakeKeyPress(e) {
  switch(e.key) {
    case 'ArrowUp':
      e.preventDefault()
      if (gameState.direction !== 'down') gameState.direction = 'up'
      break
    case 'ArrowDown':
      e.preventDefault()
      if (gameState.direction !== 'up') gameState.direction = 'down'
      break
    case 'ArrowLeft':
      e.preventDefault()
      if (gameState.direction !== 'right') gameState.direction = 'left'
      break
    case 'ArrowRight':
      e.preventDefault()
      if (gameState.direction !== 'left') gameState.direction = 'right'
      break
  }
}

// ------------------------------
// 飞机大战实现
// ------------------------------
function initPlane() {
  gameState.plane = { x: 180, y: 450, width: 40, height: 40 }
  gameState.bullets = []
  gameState.enemies = []
  gameState.speed = 50
  drawPlane()
}

function updatePlane() {
  // 移动子弹
  gameState.bullets = gameState.bullets.filter(bullet => {
    bullet.y -= 10
    return bullet.y > 0
  })
  
  // 生成敌机
  if (Math.random() < 0.05) {
    gameState.enemies.push({
      x: Math.random() * (gameState.canvas.width - 40),
      y: -40,
      width: 40,
      height: 40,
      speed: 3 + Math.random() * 3
    })
  }
  
  // 移动敌机
  gameState.enemies = gameState.enemies.filter(enemy => {
    enemy.y += enemy.speed
    return enemy.y < gameState.canvas.height
  })
  
  // 碰撞检测 - 子弹打敌机
  for (let i = gameState.bullets.length - 1; i >= 0; i--) {
    const bullet = gameState.bullets[i]
    for (let j = gameState.enemies.length - 1; j >= 0; j--) {
      const enemy = gameState.enemies[j]
      if (bullet.x < enemy.x + enemy.width &&
          bullet.x + 5 > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + 10 > enemy.y) {
        gameState.bullets.splice(i, 1)
        gameState.enemies.splice(j, 1)
        gameState.score += 20
        gameSounds.play('score')
        updateScoreUI()
        break
      }
    }
  }
  
  // 碰撞检测 - 敌机撞飞机
  for (let enemy of gameState.enemies) {
    if (gameState.plane.x < enemy.x + enemy.width &&
        gameState.plane.x + gameState.plane.width > enemy.x &&
        gameState.plane.y < enemy.y + enemy.height &&
        gameState.plane.y + gameState.plane.height > enemy.y) {
      gameOver()
      return
    }
  }
}

function drawPlane() {
  // 画飞机
  gameState.ctx.fillStyle = '#00f'
  gameState.ctx.fillRect(gameState.plane.x, gameState.plane.y, gameState.plane.width, gameState.plane.height)
  
  // 画子弹
  gameState.ctx.fillStyle = '#ff0'
  gameState.bullets.forEach(bullet => {
    gameState.ctx.fillRect(bullet.x, bullet.y, 5, 10)
  })
  
  // 画敌机
  gameState.ctx.fillStyle = '#f00'
  gameState.enemies.forEach(enemy => {
    gameState.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height)
  })
}

function handlePlaneKeyPress(e) {
  switch(e.key) {
    case 'ArrowLeft':
      e.preventDefault()
      gameState.plane.x = Math.max(0, gameState.plane.x - 15)
      break
    case 'ArrowRight':
      e.preventDefault()
      gameState.plane.x = Math.min(gameState.canvas.width - gameState.plane.width, gameState.plane.x + 15)
      break
    case ' ':
      e.preventDefault()
      // 发射子弹
      gameState.bullets.push({
        x: gameState.plane.x + gameState.plane.width / 2 - 2.5,
        y: gameState.plane.y - 10
      })
      break
  }
}

// ------------------------------
// 俄罗斯方块实现
// ------------------------------
const TETRIS_SHAPES = [
  [[1,1,1,1]], // I
  [[1,1],[1,1]], // O
  [[1,1,1],[0,1,0]], // T
  [[1,1,1],[1,0,0]], // L
  [[1,1,1],[0,0,1]], // J
  [[1,1,0],[0,1,1]], // S
  [[0,1,1],[1,1,0]]  // Z
]

const TETRIS_COLORS = ['#00f', '#ff0', '#f0f', '#f90', '#00f', '#0f0', '#f00']

function initTetris() {
  // 初始化棋盘 (20行 x 10列)
  gameState.tetrisBoard = Array(20).fill().map(() => Array(10).fill(0))
  gameState.tetrisLines = 0
  gameState.tetrisSpeed = 1000
  generateTetrisPiece()
  generateTetrisNextPiece()
  drawTetris()
}

function generateTetrisPiece() {
  if (gameState.tetrisNextPiece) {
    gameState.tetrisPiece = gameState.tetrisNextPiece
  } else {
    const shapeIndex = Math.floor(Math.random() * TETRIS_SHAPES.length)
    gameState.tetrisPiece = {
      shape: TETRIS_SHAPES[shapeIndex],
      color: TETRIS_COLORS[shapeIndex],
      x: Math.floor(5 - TETRIS_SHAPES[shapeIndex][0].length / 2),
      y: 0
    }
  }
  
  // 游戏结束检测
  if (checkCollision(gameState.tetrisPiece, 0, 0)) {
    gameOver()
  }
}

function generateTetrisNextPiece() {
  const shapeIndex = Math.floor(Math.random() * TETRIS_SHAPES.length)
  gameState.tetrisNextPiece = {
    shape: TETRIS_SHAPES[shapeIndex],
    color: TETRIS_COLORS[shapeIndex],
    x: Math.floor(5 - TETRIS_SHAPES[shapeIndex][0].length / 2),
    y: 0
  }
}

function checkCollision(piece, offsetX, offsetY) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = piece.x + x + offsetX
        const newY = piece.y + y + offsetY
        
        if (newX < 0 || newX >= 10 || newY >= 20) {
          return true
        }
        
        if (newY >= 0 && gameState.tetrisBoard[newY][newX]) {
          return true
        }
      }
    }
  }
  return false
}

function mergePiece() {
  for (let y = 0; y < gameState.tetrisPiece.shape.length; y++) {
    for (let x = 0; x < gameState.tetrisPiece.shape[y].length; x++) {
      if (gameState.tetrisPiece.shape[y][x]) {
        gameState.tetrisBoard[gameState.tetrisPiece.y + y][gameState.tetrisPiece.x + x] = gameState.tetrisPiece.color
      }
    }
  }
  
  // 消除行
  let linesCleared = 0
  for (let y = 19; y >= 0; y--) {
    if (gameState.tetrisBoard[y].every(cell => cell !== 0)) {
      gameState.tetrisBoard.splice(y, 1)
      gameState.tetrisBoard.unshift(Array(10).fill(0))
      linesCleared++
      y++ // 重新检查当前行
    }
  }
  
  if (linesCleared > 0) {
    gameState.score += linesCleared * 100
    gameState.tetrisLines += linesCleared
    updateScoreUI()
    
    // 加速
    if (gameState.tetrisSpeed > 200) {
      gameState.tetrisSpeed -= 50
      runGameLoop()
    }
  }
}

function rotatePiece() {
  const rotated = gameState.tetrisPiece.shape[0].map((_, index) =>
    gameState.tetrisPiece.shape.map(row => row[index]).reverse()
  )
  
  const originalShape = gameState.tetrisPiece.shape
  gameState.tetrisPiece.shape = rotated
  
  // 旋转后碰撞则回滚
  if (checkCollision(gameState.tetrisPiece, 0, 0)) {
    gameState.tetrisPiece.shape = originalShape
  }
}

function updateTetris() {
  if (!checkCollision(gameState.tetrisPiece, 0, 1)) {
    gameState.tetrisPiece.y += 1
  } else {
    mergePiece()
    generateTetrisPiece()
    generateTetrisNextPiece()
  }
}

function drawTetris() {
  const blockSize = 25
  const offsetX = 75
  const offsetY = 0
  
  // 画棋盘背景
  gameState.ctx.fillStyle = '#333'
  gameState.ctx.fillRect(offsetX, offsetY, 10 * blockSize, 20 * blockSize)
  
  // 画网格
  gameState.ctx.strokeStyle = '#444'
  gameState.ctx.lineWidth = 1
  for (let i = 0; i <= 10; i++) {
    gameState.ctx.beginPath()
    gameState.ctx.moveTo(offsetX + i * blockSize, offsetY)
    gameState.ctx.lineTo(offsetX + i * blockSize, offsetY + 20 * blockSize)
    gameState.ctx.stroke()
  }
  for (let i = 0; i <= 20; i++) {
    gameState.ctx.beginPath()
    gameState.ctx.moveTo(offsetX, offsetY + i * blockSize)
    gameState.ctx.lineTo(offsetX + 10 * blockSize, offsetY + i * blockSize)
    gameState.ctx.stroke()
  }
  
  // 画已落下的方块
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 10; x++) {
      if (gameState.tetrisBoard[y][x]) {
        gameState.ctx.fillStyle = gameState.tetrisBoard[y][x]
        gameState.ctx.fillRect(
          offsetX + x * blockSize + 1,
          offsetY + y * blockSize + 1,
          blockSize - 2,
          blockSize - 2
        )
      }
    }
  }
  
  // 画当前方块
  gameState.ctx.fillStyle = gameState.tetrisPiece.color
  for (let y = 0; y < gameState.tetrisPiece.shape.length; y++) {
    for (let x = 0; x < gameState.tetrisPiece.shape[y].length; x++) {
      if (gameState.tetrisPiece.shape[y][x]) {
        gameState.ctx.fillRect(
          offsetX + (gameState.tetrisPiece.x + x) * blockSize + 1,
          offsetY + (gameState.tetrisPiece.y + y) * blockSize + 1,
          blockSize - 2,
          blockSize - 2
        )
      }
    }
  }
}

function handleTetrisKeyPress(e) {
  switch(e.key) {
    case 'ArrowLeft':
      e.preventDefault()
      if (!checkCollision(gameState.tetrisPiece, -1, 0)) {
        gameState.tetrisPiece.x -= 1
      }
      break
    case 'ArrowRight':
      e.preventDefault()
      if (!checkCollision(gameState.tetrisPiece, 1, 0)) {
        gameState.tetrisPiece.x += 1
      }
      break
    case 'ArrowDown':
      e.preventDefault()
      if (!checkCollision(gameState.tetrisPiece, 0, 1)) {
        gameState.tetrisPiece.y += 1
        gameState.score += 1 // 手动下落加分
        updateScoreUI()
      }
      break
    case 'ArrowUp':
      e.preventDefault()
      rotatePiece()
      break
    case ' ':
      e.preventDefault()
      // 快速下落
      while (!checkCollision(gameState.tetrisPiece, 0, 1)) {
        gameState.tetrisPiece.y += 1
        gameState.score += 2
      }
      updateScoreUI()
      mergePiece()
      generateTetrisPiece()
      generateTetrisNextPiece()
      break
  }
}

// ------------------------------
// UI更新工具方法
// ------------------------------
function updateScoreUI() {
  document.getElementById('gameScore').textContent = gameState.score
}

function updateHighScoreUI() {
  document.getElementById('gameHighScore').textContent = gameState.highScore
}

function updateGameStatus(status) {
  document.getElementById('gameStatus').textContent = status
}

// 切换音效开关
function toggleSound() {
  gameSounds.enabled = !gameSounds.enabled
  const btn = document.getElementById('soundToggleBtn')
  if (gameSounds.enabled) {
    btn.textContent = '🔊 音效开启'
    gameSounds.play('click')
  } else {
    btn.textContent = '🔇 音效关闭'
  }
}

// 处理触摸滑动
let touchStartX = 0
let touchStartY = 0

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

function handleTouchEnd(e) {
  if (!gameState.isRunning || gameState.isPaused) return

  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY

  const deltaX = touchEndX - touchStartX
  const deltaY = touchEndY - touchStartY

  // 判断滑动方向
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // 水平滑动
    if (deltaX > 20) {
      // 右滑
      if (gameState.currentGame === 'snake' && gameState.direction !== 'left') {
        gameState.direction = 'right'
      } else if (gameState.currentGame === 'plane') {
        gameState.plane.x = Math.min(360, gameState.plane.x + 20)
      } else if (gameState.currentGame === 'tetris') {
        if (typeof moveTetrisPiece === 'function') moveTetrisPiece(1, 0)
      }
    } else if (deltaX < -20) {
      // 左滑
      if (gameState.currentGame === 'snake' && gameState.direction !== 'right') {
        gameState.direction = 'left'
      } else if (gameState.currentGame === 'plane') {
        gameState.plane.x = Math.max(0, gameState.plane.x - 20)
      } else if (gameState.currentGame === 'tetris') {
        if (typeof moveTetrisPiece === 'function') moveTetrisPiece(-1, 0)
      }
    }
  } else {
    // 垂直滑动
    if (deltaY > 20) {
      // 下滑
      if (gameState.currentGame === 'snake' && gameState.direction !== 'up') {
        gameState.direction = 'down'
      } else if (gameState.currentGame === 'tetris') {
        if (typeof moveTetrisPiece === 'function') moveTetrisPiece(0, 1)
      }
    } else if (deltaY < -20) {
      // 上滑
      if (gameState.currentGame === 'snake' && gameState.direction !== 'down') {
        gameState.direction = 'up'
      } else if (gameState.currentGame === 'tetris') {
        if (typeof rotateTetrisPiece === 'function') rotateTetrisPiece()
      }
    }
  }
}

// 页面加载完成初始化触摸事件
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas')
  if (canvas) {
    canvas.addEventListener('touchstart', handleTouchStart, false)
    canvas.addEventListener('touchend', handleTouchEnd, false)
  }
})
