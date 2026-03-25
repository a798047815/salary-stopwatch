// 计算游戏收益
function calculateGameEarnings(seconds) {
  // 从全局配置读取日薪
  const dailySalary = window.config ? window.config.dailySalary || 300 : 300
  const workHoursPerDay = 8 // 每天工作8小时
  const earningsPerSecond = dailySalary / (workHoursPerDay * 3600)
  return seconds * earningsPerSecond
}

// 游戏全局状态
const gameState = {
  // 状态枚举: 'idle'(开始界面), 'playing'(游戏中), 'paused'(暂停), 'gameover'(结束)
  status: 'idle',
  score: 0, // 游戏时长（秒）
  highScore: localStorage.getItem('gameHighScore') || 0,
  timer: null,
  speed: 4, // 初始速度降低，更易上手
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
  obstacleSpawnRate: 2000, // 初始生成频率降低，更易上手
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
    { emoji: '☕', name: '咖啡', width: 25, height: 30, effect: 'earn+10' }, // 额外赚10块
    { emoji: '🍗', name: '鸡腿', width: 30, height: 30, effect: 'invincible' }, // 无敌
    { emoji: '💰', name: '奖金', width: 30, height: 30, effect: 'earn+50' } // 额外赚50块
  ],

  // 特效
  invincible: false,
  invincibleTime: 0,
  groundY: 380,

  // 跳跃优化
  isJumpingPressed: false,
  maxJumpHoldTime: 300, // 最长按住跳跃时间
  jumpHoldTime: 0, // 当前按住时间

  // 背景滚动
  backgroundOffset: 0,

  // 统计数据
  obstaclesJumped: 0,
  itemsCollected: 0
}

// 触摸状态
const touchState = {
  isTouched: false,
  touchStartTime: 0
}

// 粒子效果
const particles = []

// 游戏初始化
function initGame() {
  gameState.canvas = document.getElementById('gameCanvas')
  gameState.ctx = gameState.canvas.getContext('2d')
  gameState.canvas.width = 400
  gameState.canvas.height = 500

  // 加载最高记录
  updateHighScoreUI()

  // 绑定键盘事件
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)

  // 绑定触摸事件
  gameState.canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
  gameState.canvas.addEventListener('touchend', handleTouchEnd, { passive: false })

  // 初始化游戏
  initCurrentGame()
}

// 初始化当前游戏
function initCurrentGame() {
  stopGame()
  gameState.status = 'idle' // 重置为开始界面状态

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
  gameState.backgroundOffset = 0
  gameState.obstaclesJumped = 0
  gameState.itemsCollected = 0
  gameState.isJumpingPressed = false
  gameState.jumpHoldTime = 0
  particles.length = 0 // 清空粒子

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

  // 背景网格
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)'
  ctx.lineWidth = 1
  const offset = arguments[0] === true ? gameState.backgroundOffset : 0
  for (let i = -offset; i < gameState.canvas.width; i += 40) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, gameState.groundY)
    ctx.stroke()
  }

  // 画玩家
  drawPlayer(gameState.player.x, gameState.player.y, false)

  // 画像素风格标题
  ctx.fillStyle = '#0f0'
  ctx.font = 'bold 20px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('🏃‍♂️ 摸鱼赚钱', gameState.canvas.width / 2, 100)

  ctx.fillStyle = '#0f0'
  ctx.font = '14px monospace'
  ctx.fillText('跳过工作障碍，摸鱼也能算工资！', gameState.canvas.width / 2, 140)
  ctx.fillText('按空格/点击屏幕开始', gameState.canvas.width / 2, 170)

  // 画几个预览的障碍物
  drawObstacle({ x: 70, y: gameState.groundY - 35, type: { name: '需求文档' } })
  drawObstacle({ x: 180, y: gameState.groundY - 30, type: { name: 'Bug' } })
  drawItem({ x: 290, y: gameState.groundY - 30, type: { name: '咖啡' } })

  ctx.textAlign = 'left'
}

// 开始游戏
function startGame() {
  if (gameState.status === 'playing') return

  if (gameState.status === 'paused') {
    gameState.status = 'playing'
    updateGameStatus('游戏中')
    document.getElementById('gameStartBtn').style.display = 'none'
    document.getElementById('gamePauseBtn').style.display = 'inline-block'
    runGameLoop()
    return
  }

  gameState.status = 'playing'
  gameState.score = 0
  updateScoreUI()
  updateGameStatus('游戏中')

  document.getElementById('gameStartBtn').style.display = 'none'
  document.getElementById('gamePauseBtn').style.display = 'inline-block'

  runGameLoop()
}

// 暂停游戏
function pauseGame() {
  if (gameState.status !== 'playing') return

  gameState.status = 'paused'
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
  if (gameState.status === 'gameover') return // 避免重复触发

  stopGame()
  gameState.status = 'gameover' // 标记游戏结束

  // 碰撞爆炸特效
  for (let i = 0; i < 15; i++) {
    particles.push({
      x: gameState.player.x + 15,
      y: gameState.player.y + 20,
      velX: (Math.random() - 0.5) * 8,
      velY: (Math.random() - 0.5) * 8,
      life: 40,
      maxLife: 40,
      color: '#ff4444'
    })
  }

  // 强制更新最终收益UI，立刻显示赚了多少钱
  updateScoreUI()

  // 保存最高记录
  const earnings = calculateGameEarnings(gameState.score)
  const currency = window.config ? window.config.currency || '¥' : '¥'
  let message = ''
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score
    localStorage.setItem('gameHighScore', gameState.highScore)
    updateHighScoreUI()
    message = `🎉 新记录！摸鱼赚了 ${currency}${earnings.toFixed(2)}，太牛了！`
  } else {
    message = `游戏结束！赚了 ${currency}${earnings.toFixed(2)}，再接再厉！`
  }

  updateGameStatus(message)

  // 立刻渲染游戏结束画面
  const ctx = gameState.ctx
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
  ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height)

  ctx.fillStyle = '#ff4444'
  ctx.font = 'bold 28px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('GAME OVER', gameState.canvas.width / 2, 150)

  ctx.fillStyle = '#0f0'
  ctx.font = '16px monospace'
  ctx.fillText(message, gameState.canvas.width / 2, 200)

  // 详细统计
  ctx.fillStyle = '#fff'
  ctx.font = '14px monospace'
  ctx.fillText(`跳过障碍: ${gameState.obstaclesJumped} 个`, gameState.canvas.width / 2, 240)
  ctx.fillText(`收集道具: ${gameState.itemsCollected} 个`, gameState.canvas.width / 2, 265)
  ctx.fillText(`游戏时长: ${Math.floor(gameState.score)} 秒`, gameState.canvas.width / 2, 290)

  ctx.fillStyle = '#0f0'
  ctx.font = '14px monospace'
  ctx.fillText('点击屏幕或按空格回到开始界面', gameState.canvas.width / 2, 330)
  ctx.textAlign = 'left'

  // 不需要自动重置，等待用户手动点击
}

// 游戏主循环
function runGameLoop() {
  if (gameState.timer) {
    clearInterval(gameState.timer)
  }

  gameState.timer = setInterval(() => {
    if (gameState.status !== 'playing') return

    updateGame()

    // 检查updateGame后是否还是playing状态，避免碰撞后覆盖结算界面
    if (gameState.status === 'playing') {
      drawGame()

      // 每秒分数+1
      gameState.score += 1/60
      updateScoreUI()

      // 每隔15秒加速，难度提升更平缓
      if (Math.floor(gameState.score) % 15 === 0 && Math.floor(gameState.score) > 0) {
        gameState.speed = Math.min(12, 4 + Math.floor(gameState.score / 15))
      }

      // 无敌时间倒计时
      if (gameState.invincible) {
        gameState.invincibleTime -= 16.67 // 16.67ms per frame
        if (gameState.invincibleTime <= 0) {
          gameState.invincible = false
        }
      }
    }
  }, 16.67) // 60fps
}

// 游戏逻辑更新
function updateGame() {
  const now = Date.now()

  // 玩家重力
  gameState.player.velY += gameState.gravity

  // 长按跳跃更高
  if (gameState.isJumpingPressed && gameState.jumpHoldTime < gameState.maxJumpHoldTime && gameState.player.velY < 0) {
    gameState.player.velY -= 0.2 // 额外上升力
    gameState.jumpHoldTime += 16.67
  }

  gameState.player.y += gameState.player.velY

  // 地面碰撞
  if (gameState.player.y >= gameState.groundY - gameState.player.height) {
    const wasJumping = gameState.player.isJumping
    gameState.player.y = gameState.groundY - gameState.player.height
    gameState.player.velY = 0
    gameState.player.isJumping = false

    // 落地灰尘特效
    if (wasJumping) {
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: gameState.player.x + 15,
          y: gameState.groundY,
          velX: (Math.random() - 0.5) * 3,
          velY: Math.random() * -2,
          life: 15,
          maxLife: 15,
          color: '#666'
        })
      }
    }
  }

  // 背景滚动
  gameState.backgroundOffset += gameState.speed * 0.5
  if (gameState.backgroundOffset >= 40) {
    gameState.backgroundOffset = 0
  }

  // 生成障碍物
  if (now - gameState.lastObstacleSpawn > gameState.obstacleSpawnRate) {
    spawnObstacle()
    gameState.lastObstacleSpawn = now
    // 随难度调整生成频率，降低更平缓
    gameState.obstacleSpawnRate = Math.max(1000, 2000 - Math.floor(gameState.score / 30) * 100)
  }

  // 生成道具
  if (now - gameState.lastItemSpawn > gameState.itemSpawnRate) {
    spawnItem()
    gameState.lastItemSpawn = now
  }

  // 更新障碍物位置
  gameState.obstacles = gameState.obstacles.filter(obstacle => {
    obstacle.x -= gameState.speed
    // 统计跳过的障碍物
    if (obstacle.x + obstacle.width < gameState.player.x && !obstacle.counted) {
      gameState.obstaclesJumped++
      obstacle.counted = true
    }
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
      gameState.itemsCollected++

      // 吃道具特效
      for (let j = 0; j < 8; j++) {
        particles.push({
          x: item.x + item.width / 2,
          y: item.y + item.height / 2,
          velX: (Math.random() - 0.5) * 6,
          velY: (Math.random() - 0.5) * 6,
          life: 30,
          maxLife: 30,
          color: '#ffd700'
        })
      }

      gameState.items.splice(i, 1)
    }
  }

  // 更新粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.velX
    p.y += p.velY
    p.velY += 0.1 // 重力
    p.life--
    if (p.life <= 0) {
      particles.splice(i, 1)
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
    case 'earn+10':
      // 10块钱相当于多少秒工作时长
      const dailySalary = window.config ? window.config.dailySalary || 300 : 300
      const workHoursPerDay = 8
      const secondsPerYuan = (workHoursPerDay * 3600) / dailySalary
      gameState.score += 10 * secondsPerYuan
      break
    case 'earn+50':
      const dailySalary2 = window.config ? window.config.dailySalary || 300 : 300
      const workHoursPerDay2 = 8
      const secondsPerYuan2 = (workHoursPerDay2 * 3600) / dailySalary2
      gameState.score += 50 * secondsPerYuan2
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
    gameState.isJumpingPressed = true
    gameState.jumpHoldTime = 0

    // 跳跃灰尘特效
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: gameState.player.x + 15,
        y: gameState.groundY,
        velX: (Math.random() - 0.5) * 4,
        velY: Math.random() * -3,
        life: 20,
        maxLife: 20,
        color: '#666'
      })
    }
  }
}

// 跳跃释放
function jumpRelease() {
  gameState.isJumpingPressed = false
  // 松开按键时如果还在上升，提前结束跳跃
  if (gameState.player.velY < 0) {
    gameState.player.velY *= 0.5
  }
}

// 绘制像素玩家
function drawPlayer(x, y, isInvincible) {
  const ctx = gameState.ctx

  if (isInvincible) {
    // 无敌光圈
    ctx.fillStyle = 'rgba(255, 215, 0, 0.6)'
    ctx.beginPath()
    ctx.arc(x + 15, y + 20, 25, 0, Math.PI * 2)
    ctx.fill()
  }

  // 头部
  ctx.fillStyle = '#ffdbac'
  ctx.fillRect(x + 7, y, 16, 16)

  // 头发
  ctx.fillStyle = '#2d2d2d'
  ctx.fillRect(x + 7, y, 16, 6)
  ctx.fillRect(x + 5, y + 4, 4, 4)
  ctx.fillRect(x + 21, y + 4, 4, 4)

  // 眼镜
  ctx.fillStyle = '#333'
  ctx.fillRect(x + 8, y + 6, 5, 3)
  ctx.fillRect(x + 17, y + 6, 5, 3)
  ctx.fillRect(x + 14, y + 7, 2, 1)

  // 身体（格子衫）
  ctx.fillStyle = '#2563eb'
  ctx.fillRect(x + 5, y + 16, 20, 18)
  ctx.fillStyle = '#1e40af'
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x + 5 + i * 5, y + 16, 2, 18)
  }
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x + 5, y + 16 + i * 6, 20, 2)
  }

  // 裤子
  ctx.fillStyle = '#1e3a8a'
  ctx.fillRect(x + 8, y + 34, 6, 6)
  ctx.fillRect(x + 16, y + 34, 6, 6)
}

// 绘制障碍物
function drawObstacle(obstacle) {
  const ctx = gameState.ctx
  const x = obstacle.x
  const y = obstacle.y
  const type = obstacle.type.name

  if (type === '需求文档') {
    // 文档
    ctx.fillStyle = '#f472b6'
    ctx.fillRect(x, y + 5, 30, 30)
    ctx.fillStyle = '#f9a8d4'
    ctx.fillRect(x + 3, y + 8, 24, 3)
    ctx.fillRect(x + 3, y + 13, 18, 2)
    ctx.fillRect(x + 3, y + 17, 22, 2)
    ctx.fillRect(x + 3, y + 21, 20, 2)
    // 折角
    ctx.fillStyle = '#db2777'
    ctx.beginPath()
    ctx.moveTo(x + 30, y + 5)
    ctx.lineTo(x + 30, y + 15)
    ctx.lineTo(x + 20, y + 5)
    ctx.fill()
  } else if (type === 'Bug') {
    // 虫子
    ctx.fillStyle = '#16a34a'
    // 身体
    ctx.fillRect(x + 8, y + 10, 14, 14)
    // 头
    ctx.fillRect(x + 13, y + 5, 4, 6)
    // 腿
    ctx.fillRect(x + 4, y + 12, 3, 2)
    ctx.fillRect(x + 4, y + 16, 3, 2)
    ctx.fillRect(x + 4, y + 20, 3, 2)
    ctx.fillRect(x + 23, y + 12, 3, 2)
    ctx.fillRect(x + 23, y + 16, 3, 2)
    ctx.fillRect(x + 23, y + 20, 3, 2)
    // 触角
    ctx.fillRect(x + 14, y, 1, 4)
    ctx.fillRect(x + 15, y + 1, 1, 3)
  } else if (type === '加班通知') {
    // 警报
    ctx.fillStyle = '#dc2626'
    // 灯体
    ctx.fillRect(x + 10, y + 5, 15, 20)
    // 顶
    ctx.fillRect(x + 13, y, 9, 5)
    // 光
    ctx.fillStyle = '#fca5a5'
    ctx.fillRect(x + 13, y + 8, 9, 6)
    // 底座
    ctx.fillStyle = '#991b1b'
    ctx.fillRect(x + 7, y + 25, 21, 3)
  } else if (type === '老板来电') {
    // 手机
    ctx.fillStyle = '#262626'
    ctx.fillRect(x + 5, y + 2, 20, 33)
    // 屏幕
    ctx.fillStyle = '#404040'
    ctx.fillRect(x + 7, y + 4, 16, 25)
    // 来电显示
    ctx.fillStyle = '#ef4444'
    ctx.font = '8px monospace'
    ctx.fillText('BOSS', x + 9, y + 14)
    //  home键
    ctx.fillStyle = '#525252'
    ctx.fillRect(x + 13, y + 30, 4, 2)
  }
}

// 绘制道具
function drawItem(item) {
  const ctx = gameState.ctx
  const x = item.x
  const y = item.y
  const type = item.type.name

  if (type === '咖啡') {
    // 咖啡杯
    ctx.fillStyle = '#78350f'
    ctx.fillRect(x + 4, y + 5, 18, 20)
    // 杯口
    ctx.fillStyle = '#d97706'
    ctx.fillRect(x + 2, y + 3, 22, 3)
    // 把手
    ctx.fillStyle = '#92400e'
    ctx.fillRect(x + 22, y + 8, 5, 10)
    ctx.fillRect(x + 24, y + 10, 3, 6)
    // 热气
    ctx.fillStyle = 'rgba(209, 213, 219, 0.6)'
    ctx.fillRect(x + 7, y, 2, 3)
    ctx.fillRect(x + 12, y - 2, 2, 4)
    ctx.fillRect(x + 17, y, 2, 3)
  } else if (type === '鸡腿') {
    // 鸡腿
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(x + 20, y + 15, 10, 0, Math.PI * 2)
    ctx.fill()
    // 骨头
    ctx.fillStyle = '#f5f5f4'
    ctx.fillRect(x + 5, y + 13, 10, 4)
    ctx.fillRect(x + 3, y + 11, 3, 2)
    ctx.fillRect(x + 3, y + 17, 3, 2)
  } else if (type === '奖金') {
    // 钱袋
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.moveTo(x + 5, y + 8)
    ctx.lineTo(x + 25, y + 8)
    ctx.quadraticCurveTo(x + 28, y + 18, x + 22, y + 28)
    ctx.lineTo(x + 8, y + 28)
    ctx.quadraticCurveTo(x + 2, y + 18, x + 5, y + 8)
    ctx.fill()
    // 袋口
    ctx.fillStyle = '#d97706'
    ctx.fillRect(x + 7, y + 5, 16, 4)
    // 金币符号
    ctx.fillStyle = '#92400e'
    ctx.font = '12px monospace'
    ctx.fillText('$', x + 12, y + 20)
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

  // 背景网格（滚动效果）
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)'
  ctx.lineWidth = 1
  for (let i = -gameState.backgroundOffset; i < gameState.canvas.width; i += 40) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, gameState.groundY)
    ctx.stroke()
  }

  // 画无敌效果闪光
  if (gameState.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)'
    ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height)
  }

  // 画障碍物
  gameState.obstacles.forEach(obstacle => {
    drawObstacle(obstacle)
  })

  // 画道具
  gameState.items.forEach(item => {
    drawItem(item)
  })

  // 画玩家
  drawPlayer(gameState.player.x, gameState.player.y, gameState.invincible)

  // 画无敌时间提示
  if (gameState.invincible) {
    ctx.fillStyle = '#fbbf24'
    ctx.font = '14px monospace'
    ctx.fillText(`✨ 无敌：${Math.ceil(gameState.invincibleTime / 1000)}s`, 10, 30)
  }

  // 画工资进度条
  const dailySalary = window.config ? window.config.dailySalary || 300 : 300
  const currentEarnings = calculateGameEarnings(gameState.score)
  const progressPercent = Math.min(100, (currentEarnings / dailySalary) * 100)

  ctx.fillStyle = 'rgba(0, 255, 0, 0.2)'
  ctx.fillRect(10, 40, gameState.canvas.width - 20, 8)
  ctx.fillStyle = '#0f0'
  ctx.fillRect(10, 40, (gameState.canvas.width - 20) * (progressPercent / 100), 8)

  ctx.fillStyle = '#0f0'
  ctx.font = '12px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`今日工资进度：${progressPercent.toFixed(1)}%`, gameState.canvas.width / 2, 65)
  ctx.textAlign = 'left'

  // 画速度提示
  ctx.fillStyle = '#0f0'
  ctx.font = '14px monospace'
  ctx.textAlign = 'right'
  ctx.fillText(`⚡ 速度：${gameState.speed.toFixed(1)}x`, gameState.canvas.width - 10, 30)
  ctx.textAlign = 'left'

  // 绘制粒子
  particles.forEach(p => {
    ctx.globalAlpha = p.life / p.maxLife
    ctx.fillStyle = p.color
    ctx.fillRect(p.x, p.y, 2, 2)
  })
  ctx.globalAlpha = 1
}

// 键盘按下事件
function handleKeyDown(e) {
  if (e.key === ' ') {
    e.preventDefault()

    switch(gameState.status) {
      case 'gameover':
        // 游戏结束状态，点击回到开始界面
        initCurrentGame()
        break
      case 'idle':
        // 开始界面，点击开始游戏
        startGame()
        break
      case 'paused':
        // 暂停状态，继续游戏
        startGame()
        break
      case 'playing':
        // 游戏中，跳跃
        jump()
        break
    }
  }
}

// 键盘松开事件
function handleKeyUp(e) {
  if (e.key === ' ') {
    e.preventDefault()
    if (gameState.status === 'playing') {
      jumpRelease()
    }
  }
}

// 触摸开始事件
function handleTouchStart(e) {
  e.preventDefault()
  touchState.isTouched = true

  switch(gameState.status) {
    case 'gameover':
      // 游戏结束状态，点击回到开始界面
      initCurrentGame()
      break
    case 'idle':
      // 开始界面，点击开始游戏
      startGame()
      break
    case 'paused':
      // 暂停状态，继续游戏
      startGame()
      break
    case 'playing':
      // 游戏中，跳跃
      jump()
      break
  }
}

// 触摸结束事件
function handleTouchEnd(e) {
  e.preventDefault()
  touchState.isTouched = false
  if (gameState.status === 'playing') {
    jumpRelease()
  }
}

// 切换游戏（现在不需要了，保留兼容）
function switchGame(gameName) {
  // 现在只有一个游戏，不需要切换
}

// ------------------------------
// UI更新工具方法
// ------------------------------
function updateScoreUI() {
  const currency = window.config ? window.config.currency || '¥' : '¥'
  const earnings = calculateGameEarnings(gameState.score)
  document.getElementById('gameScore').textContent = `${currency}${earnings.toFixed(2)}`
}

function updateHighScoreUI() {
  const currency = window.config ? window.config.currency || '¥' : '¥'
  const earnings = calculateGameEarnings(gameState.highScore)
  document.getElementById('gameHighScore').textContent = `${currency}${earnings.toFixed(2)}`
}

function updateGameStatus(status) {
  document.getElementById('gameStatus').textContent = status
}