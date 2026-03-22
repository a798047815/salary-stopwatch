// 游戏全局状态
const gameState = {
  isRunning: false,
  isPaused: false,
  score: 0,
  highScore: localStorage.getItem('gameHighScore') || 0,
  timer: null,
  speed: 6,
  canvas: null,
  ctx: null,
  gravity: 0.5,
  jumpForce: -12,

  // 玩家（社畜）
  player: {
    x: 50,
    y: 350,
    width: 30,
    height: 40,
    velY: 0,
    isJumping: false
  },

  // 障碍物
  obstacles: [],
  obstacleSpawnRate: 1500, // 毫秒生成一个
  lastObstacleSpawn: 0,

  // 道具
  items: [],
  itemSpawnRate: 8000,
  lastItemSpawn: 0,

  // 障碍物类型
  obstacleTypes: [
    { emoji: '💼', name: '需求文档', width: 35, height: 35, score: 10 },
    { emoji: '🐛', name: 'Bug', width: 30, height: 30, score: 20 },
    { emoji: '🚨', name: '加班通知', width: 35, height: 35, score: 15 },
    { emoji: '📱', name: '老板来电', width: 25, height: 35, score: 25 }
  ],

  // 道具类型
  itemTypes: [
    { emoji: '☕', name: '咖啡', width: 25, height: 30, effect: 'score+50' },
    { emoji: '🍗', name: '鸡腿', width: 30, height: 30, effect: 'invincible' },
    { emoji: '💰', name: '工资', width: 30, height: 30, effect: 'score+100' }
  ],

  // 特效
  invincible: false,
  invincibleTime: 0,
  groundY: 380
}

// 触摸状态
const touchState = {
  isTouched: false
}

// 游戏初始化
function initGame() {
  gameState.canvas = document.getElementById('gameCanvas')
  gameState.ctx = gameState.canvas.getContext('2d')
  gameState.canvas.width = 400
  gameState.canvas.height = 500

  // 加载最高记录
  updateHighScoreUI()

  // 绑定键盘事件
  window.addEventListener('keydown', handleKeyPress)

  // 绑定触摸事件
  gameState.canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
  gameState.canvas.addEventListener('touchend', handleTouchEnd, { passive: false })

  // 初始化游戏
  initCurrentGame()
}

// 初始化当前游戏
function initCurrentGame() {
  stopGame()

  // 重置状态
  gameState.player = {
    x: 50,
    y: gameState.groundY - 40,
    width: 30,
    height: 40,
    velY: 0,
    isJumping: false
  }
  gameState.obstacles = []
  gameState.items = []
  gameState.score = 0
  gameState.speed = 6
  gameState.invincible = false
  gameState.invincibleTime = 0
  gameState.lastObstacleSpawn = 0
  gameState.lastItemSpawn = 0

  // 绘制初始画面
  drawStartScreen()

  updateGameStatus('点击屏幕或按空格开始')
  updateScoreUI()
}

// 绘制开始画面
function drawStartScreen() {
  const ctx = gameState.ctx
  ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height)

  // 画地面
  ctx.fillStyle = '#0f0'
  ctx.fillRect(0, gameState.groundY, gameState.canvas.width, 2)

  // 画玩家
  ctx.font = '30px monospace'
  ctx.fillText('👨‍💻', gameState.player.x, gameState.player.y + 35)

  // 画提示文字
  ctx.fillStyle = '#0f0'
  ctx.font = '18px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('🏃‍♂️ 社畜跑酷', gameState.canvas.width / 2, 100)
  ctx.font = '14px monospace'
  ctx.fillText('跳过工作障碍，坚持越久赚得越多！', gameState.canvas.width / 2, 140)
  ctx.fillText('按空格/点击屏幕跳跃', gameState.canvas.width / 2, 170)
  ctx.textAlign = 'left'
}

// 开始游戏
function startGame() {
  if (gameState.isRunning && !gameState.isPaused) return

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
  updateGameStatus(`游戏结束！得分：${gameState.score}`)

  // 保存最高记录
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score
    localStorage.setItem('gameHighScore', gameState.highScore)
    updateHighScoreUI()
    alert(`🎉 恭喜创造新记录！你坚持了 ${gameState.score} 秒，太牛了！`)
  } else {
    alert(`游戏结束！你坚持了 ${gameState.score} 秒，再接再厉！`)
  }

  // 重新初始化
  setTimeout(() => {
    initCurrentGame()
  }, 1000)
}

// 游戏主循环
function runGameLoop() {
  if (gameState.timer) {
    clearInterval(gameState.timer)
  }

  gameState.timer = setInterval(() => {
    if (!gameState.isRunning || gameState.isPaused) return

    updateGame()
    drawGame()

    // 每秒分数+1
    gameState.score += 1/60
    updateScoreUI()

    // 每隔10秒加速
    if (Math.floor(gameState.score) % 10 === 0 && Math.floor(gameState.score) > 0) {
      gameState.speed = Math.min(15, 6 + Math.floor(gameState.score / 10))
    }

    // 无敌时间倒计时
    if (gameState.invincible) {
      gameState.invincibleTime -= 16.67 // 16.67ms per frame
      if (gameState.invincibleTime <= 0) {
        gameState.invincible = false
      }
    }
  }, 16.67) // 60fps
}

// 游戏逻辑更新
function updateGame() {
  const now = Date.now()

  // 玩家重力
  gameState.player.velY += gameState.gravity
  gameState.player.y += gameState.player.velY

  // 地面碰撞
  if (gameState.player.y >= gameState.groundY - gameState.player.height) {
    gameState.player.y = gameState.groundY - gameState.player.height
    gameState.player.velY = 0
    gameState.player.isJumping = false
  }

  // 生成障碍物
  if (now - gameState.lastObstacleSpawn > gameState.obstacleSpawnRate) {
    spawnObstacle()
    gameState.lastObstacleSpawn = now
    // 随难度调整生成频率
    gameState.obstacleSpawnRate = Math.max(800, 1500 - Math.floor(gameState.score / 20) * 100)
  }

  // 生成道具
  if (now - gameState.lastItemSpawn > gameState.itemSpawnRate) {
    spawnItem()
    gameState.lastItemSpawn = now
  }

  // 更新障碍物位置
  gameState.obstacles = gameState.obstacles.filter(obstacle => {
    obstacle.x -= gameState.speed
    return obstacle.x > -obstacle.width
  })

  // 更新道具位置
  gameState.items = gameState.items.filter(item => {
    item.x -= gameState.speed
    return item.x > -item.width
  })

  // 碰撞检测 - 障碍物
  for (let obstacle of gameState.obstacles) {
    if (checkCollision(gameState.player, obstacle)) {
      if (!gameState.invincible) {
        gameOver()
        return
      }
    }
  }

  // 碰撞检测 - 道具
  for (let i = gameState.items.length - 1; i >= 0; i--) {
    const item = gameState.items[i]
    if (checkCollision(gameState.player, item)) {
      applyItemEffect(item)
      gameState.items.splice(i, 1)
    }
  }
}

// 生成障碍物
function spawnObstacle() {
  const typeIndex = Math.floor(Math.random() * gameState.obstacleTypes.length)
  const type = gameState.obstacleTypes[typeIndex]

  const obstacle = {
    x: gameState.canvas.width,
    y: gameState.groundY - type.height,
    width: type.width,
    height: type.height,
    type: type
  }

  gameState.obstacles.push(obstacle)
}

// 生成道具
function spawnItem() {
  const typeIndex = Math.floor(Math.random() * gameState.itemTypes.length)
  const type = gameState.itemTypes[typeIndex]

  // 随机高度：地面或者空中
  const isAir = Math.random() > 0.5
  const y = isAir ? gameState.groundY - 100 - type.height : gameState.groundY - type.height

  const item = {
    x: gameState.canvas.width,
    y: y,
    width: type.width,
    height: type.height,
    type: type
  }

  gameState.items.push(item)
}

// 应用道具效果
function applyItemEffect(item) {
  switch (item.type.effect) {
    case 'score+50':
      gameState.score += 50
      break
    case 'score+100':
      gameState.score += 100
      break
    case 'invincible':
      gameState.invincible = true
      gameState.invincibleTime = 5000 // 5秒无敌
      break
  }
  updateScoreUI()
}

// 碰撞检测
function checkCollision(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y
}

// 跳跃
function jump() {
  if (!gameState.player.isJumping && gameState.player.y === gameState.groundY - gameState.player.height) {
    gameState.player.velY = gameState.jumpForce
    gameState.player.isJumping = true
  }
}

// 绘制游戏画面
function drawGame() {
  const ctx = gameState.ctx

  // 清空画布
  ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height)

  // 画地面
  ctx.fillStyle = '#0f0'
  ctx.fillRect(0, gameState.groundY, gameState.canvas.width, 2)

  // 画无敌效果闪光
  if (gameState.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
    ctx.fillStyle = 'rgba(0, 255, 0, 0.1)'
    ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height)
  }

  // 画障碍物
  ctx.font = '30px monospace'
  gameState.obstacles.forEach(obstacle => {
    ctx.fillText(obstacle.type.emoji, obstacle.x, obstacle.y + obstacle.height)
  })

  // 画道具
  gameState.items.forEach(item => {
    ctx.fillText(item.type.emoji, item.x, item.y + item.height)
  })

  // 画玩家
  const playerEmoji = gameState.invincible ? '🌟' : '👨‍💻'
  ctx.fillText(playerEmoji, gameState.player.x, gameState.player.y + gameState.player.height + 5)

  // 画无敌时间提示
  if (gameState.invincible) {
    ctx.fillStyle = '#0f0'
    ctx.font = '14px monospace'
    ctx.fillText(`无敌：${Math.ceil(gameState.invincibleTime / 1000)}s`, 10, 30)
  }

  // 画速度提示
  ctx.fillStyle = '#0f0'
  ctx.font = '14px monospace'
  ctx.textAlign = 'right'
  ctx.fillText(`速度：${gameState.speed.toFixed(1)}x`, gameState.canvas.width - 10, 30)
  ctx.textAlign = 'left'
}

// 键盘事件处理
function handleKeyPress(e) {
  if (e.key === ' ') {
    e.preventDefault()

    if (!gameState.isRunning || gameState.isPaused) {
      startGame()
    } else {
      jump()
    }
  }
}

// 触摸开始事件
function handleTouchStart(e) {
  e.preventDefault()
  touchState.isTouched = true

  if (!gameState.isRunning || gameState.isPaused) {
    startGame()
  } else {
    jump()
  }
}

// 触摸结束事件
function handleTouchEnd(e) {
  e.preventDefault()
  touchState.isTouched = false
}

// 切换游戏（现在不需要了，保留兼容）
function switchGame(gameName) {
  // 现在只有一个游戏，不需要切换
}

// ------------------------------
// UI更新工具方法
// ------------------------------
function updateScoreUI() {
  document.getElementById('gameScore').textContent = Math.floor(gameState.score)
}

function updateHighScoreUI() {
  document.getElementById('gameHighScore').textContent = Math.floor(gameState.highScore)
}

function updateGameStatus(status) {
  document.getElementById('gameStatus').textContent = status
}