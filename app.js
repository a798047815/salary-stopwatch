// ==================== 节假日处理功能 ====================

function isWeekend(date = new Date()) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// 2024-2026年中国法定节假日
const holidays = {
  2024: [
    { date: '2024-01-01', name: '元旦' },
    { date: '2024-02-10', name: '春节' },
    { date: '2024-02-11', name: '春节' },
    { date: '2024-02-12', name: '春节' },
    { date: '2024-02-13', name: '春节' },
    { date: '2024-02-14', name: '春节' },
    { date: '2024-04-04', name: '清明节' },
    { date: '2024-05-01', name: '劳动节' },
    { date: '2024-06-10', name: '端午节' },
    { date: '2024-09-15', name: '中秋节' },
    { date: '2024-10-01', name: '国庆节' },
    { date: '2024-10-02', name: '国庆节' },
    { date: '2024-10-03', name: '国庆节' },
    { date: '2024-10-04', name: '国庆节' },
    { date: '2024-10-05', name: '国庆节' },
    { date: '2024-10-06', name: '国庆节' },
    { date: '2024-10-07', name: '国庆节' }
  ],
  2025: [
    { date: '2025-01-01', name: '元旦' },
    { date: '2025-01-29', name: '春节' },
    { date: '2025-01-30', name: '春节' },
    { date: '2025-01-31', name: '春节' },
    { date: '2025-02-01', name: '春节' },
    { date: '2025-02-02', name: '春节' },
    { date: '2025-04-04', name: '清明节' },
    { date: '2025-05-01', name: '劳动节' },
    { date: '2025-05-31', name: '端午节' },
    { date: '2025-10-06', name: '中秋节' },
    { date: '2025-10-01', name: '国庆节' },
    { date: '2025-10-02', name: '国庆节' },
    { date: '2025-10-03', name: '国庆节' },
    { date: '2025-10-04', name: '国庆节' },
    { date: '2025-10-05', name: '国庆节' },
    { date: '2025-10-06', name: '国庆节' },
    { date: '2025-10-07', name: '国庆节' },
    { date: '2025-10-08', name: '国庆节' }
  ],
  2026: [
    { date: '2026-01-01', name: '元旦' },
    { date: '2026-02-17', name: '春节' },
    { date: '2026-02-18', name: '春节' },
    { date: '2026-02-19', name: '春节' },
    { date: '2026-02-20', name: '春节' },
    { date: '2026-02-21', name: '春节' },
    { date: '2026-04-05', name: '清明节' },
    { date: '2026-05-01', name: '劳动节' },
    { date: '2026-06-19', name: '端午节' },
    { date: '2026-09-25', name: '中秋节' },
    { date: '2026-10-01', name: '国庆节' },
    { date: '2026-10-02', name: '国庆节' },
    { date: '2026-10-03', name: '国庆节' },
    { date: '2026-10-04', name: '国庆节' },
    { date: '2026-10-05', name: '国庆节' },
    { date: '2026-10-06', name: '国庆节' },
    { date: '2026-10-07', name: '国庆节' }
  ]
};

function isHoliday(date = new Date()) {
  const year = date.getFullYear();
  const dateStr = formatDate(date);
  const yearHolidays = holidays[year] || [];
  return yearHolidays.some(holiday => holiday.date === dateStr);
}

function getHolidayName(date = new Date()) {
  const year = date.getFullYear();
  const dateStr = formatDate(date);
  const yearHolidays = holidays[year] || [];
  const holiday = yearHolidays.find(hol => hol.date === dateStr);
  return holiday ? holiday.name : null;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function updateHolidayUI() {
  const holidayName = getHolidayName();
  let displayName = holidayName || '周末';

  const messages = [
    `🎉 ${displayName}快乐！`,
    `💰 今天不上班，好好休息吧~`,
    `🎊 假期模式已开启！`,
    `🏖️ 享受美好时光！`,
    `😊 今天不用赚钱啦！`
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  // 创建节假日容器（如果不存在）
  let holidayContainer = document.getElementById('holidayContainer');
  if (!holidayContainer) {
    holidayContainer = document.createElement('div');
    holidayContainer.id = 'holidayContainer';
    holidayContainer.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
      <div id="holidayMessage" style="font-size: 18px; font-weight: bold;"></div>
      <button onclick="document.getElementById('holidayContainer').style.display='none'"
        style="margin-top: 20px; padding: 10px 30px; border: none; border-radius: 25px; background: white; color: #667eea; font-size: 16px; cursor: pointer;">
        知道啦
      </button>
    `;
    document.body.appendChild(holidayContainer);
  }

  document.getElementById('holidayMessage').textContent = randomMessage;
  holidayContainer.style.display = 'block';
}

// ==================== 全局配置 ====================
let config = {
  dailySalary: 300,
  workStartTime: '09:00',
  workEndTime: '18:00',
  breakStartTime: '12:00',
  breakDuration: 60,
  currency: '¥',
  city: '北京',
  industry: 'it',
  wakeLockEnabled: false
}

// 攒钱目标配置
let goalConfig = {
  name: '买房',
  amount: 1000000,
  saved: 1000,
  monthlySave: 5000
}

// 全局状态
let state = {
  isRunning: false,
  currentEarnings: 0,
  timer: null,
  lastUpdateTime: null,
  lastDate: null,
  earningsPerSecond: 0,
  milestones: [
    { amount: 10, name: '开工红包', icon: '🧧' },
    { amount: 30, name: '咖啡自由', icon: '☕' },
    { amount: 50, name: '午餐达标', icon: '🍚' },
    { amount: 100, name: '下午茶', icon: '🍰' },
    { amount: 200, name: '下班自由', icon: '🎉' },
    { amount: 500, name: '日入五百', icon: '💪' },
    { amount: 1000, name: '日入千薪', icon: '🏆' }
  ],
  currentPage: 'home'
}

// 页面切换功能 - 修复版
function switchPage(pageName) {
  if (state.currentPage === pageName) return

  // 隐藏所有页面
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active')
  })

  // 显示目标页面
  const targetPage = document.getElementById(`${pageName}-page`)
  if (targetPage) {
    targetPage.classList.add('active')
  }

  // 更新底部导航状态
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active')
  })
  const navIndex = ['home', 'game', 'jobs', 'health'].indexOf(pageName)
  if (navIndex !== -1) {
    document.querySelectorAll('.nav-item')[navIndex].classList.add('active')
  }

  // 页面切换后的回调
  if (pageName === 'jobs') {
    loadFullJobs()
  } else if (pageName === 'game') {
    initGame()
  }

  state.currentPage = pageName
}

// 初始化
function init() {
  loadConfig()
  loadGoalConfig()
  calculateEarningsPerSecond()
  updateGoalUI()
  loadJobs()
  
  // 只有在工作时间内才自动启动计时器
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const startMinutes = config.workStartTime.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)
  const endMinutes = config.workEndTime.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)
  const breakStartMinTotal = config.breakStartTime.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)
  const breakEndMinTotal = breakStartMinTotal + config.breakDuration
  
  const inWorkTime = currentMinutes >= startMinutes && currentMinutes < endMinutes
  const inBreakTime = currentMinutes >= breakStartMinTotal && currentMinutes < breakEndMinTotal
  
  if (inWorkTime && !inBreakTime) {
    startTimer()
  } else {
    stopTimer() // 非工作时间默认暂停
  }
  
  // 启动计时器后再更新收入，确保已工作时长被正确计算
  updateEarnings() // 立即计算并更新一次收入
}

// 加载配置
function loadConfig() {
  const saved = localStorage.getItem('salaryConfig')
  if (saved) {
    config = { ...config, ...JSON.parse(saved) }
  }
  
  // 更新设置表单
  document.getElementById('dailySalary').value = config.dailySalary
  document.getElementById('workStartTime').value = config.workStartTime
  document.getElementById('workEndTime').value = config.workEndTime
  document.getElementById('breakStartTime').value = config.breakStartTime
  document.getElementById('breakDuration').value = config.breakDuration
  document.getElementById('currency').value = config.currency
  document.getElementById('city').value = config.city
  document.getElementById('industry').value = config.industry
  document.getElementById('wakeLockToggle').classList.toggle('active', config.wakeLockEnabled)

  // 更新显示
  document.getElementById('currencySymbol').textContent = config.currency
  document.getElementById('workTimeValue').textContent = `${config.workStartTime} - ${config.workEndTime}`
  document.getElementById('goalCurrency').textContent = config.currency
  document.getElementById('goalCurrencySaved').textContent = config.currency
  document.getElementById('goalCurrencyMonth').textContent = config.currency

  // 初始化屏幕常亮
  if (config.wakeLockEnabled) {
    enableWakeLock()
  }
}

// 加载目标配置
function loadGoalConfig() {
  const saved = localStorage.getItem('goalConfig')
  if (saved) {
    goalConfig = { ...goalConfig, ...JSON.parse(saved) }
  }
  
  document.getElementById('goalNameInput').value = goalConfig.name
  document.getElementById('goalAmount').value = goalConfig.amount
  document.getElementById('goalSaved').value = goalConfig.saved
  document.getElementById('goalMonthlySave').value = goalConfig.monthlySave
}

// 保存配置
function saveConfig() {
  localStorage.setItem('salaryConfig', JSON.stringify(config))
}

// 保存目标配置
function saveGoalConfig() {
  localStorage.setItem('goalConfig', JSON.stringify(goalConfig))
}

// 计算每秒收入
function calculateEarningsPerSecond() {
  const [startHour, startMin] = config.workStartTime.split(':').map(Number)
  const [endHour, endMin] = config.workEndTime.split(':').map(Number)
  
  let workSeconds = (endHour * 60 + endMin) - (startHour * 60 + startMin)
  workSeconds -= config.breakDuration || 0
  workSeconds *= 60
  
  if (workSeconds > 0) {
    state.earningsPerSecond = config.dailySalary / workSeconds
  }
}

// 启动计时器
function startTimer() {
  if (state.timer) return
  
  state.isRunning = true
  document.getElementById('toggleBtn').textContent = '⏸ 暂停'
  document.getElementById('toggleBtn').className = 'toggle-btn stop'
  
  state.timer = setInterval(() => {
    updateEarnings()
  }, 100) // 每100毫秒更新一次，让数字跳动更流畅
}

// 停止计时器
function stopTimer() {
  if (state.timer) {
    clearInterval(state.timer)
    state.timer = null
  }
  
  state.isRunning = false
  document.getElementById('toggleBtn').textContent = '▶️ 开始赚钱'
  document.getElementById('toggleBtn').className = 'toggle-btn start'
}

// 切换计时器
function toggleTimer() {
  if (state.isRunning) {
    stopTimer()
  } else {
    startTimer()
  }
}

// ==================== 原updateEarnings函数 ====================
function originalUpdateEarnings() {
  const now = new Date()
  const currentTime = now.getTime()
  const today = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  
  // 新的一天，重置收入
  if (!state.lastDate || state.lastDate !== today) {
    state.currentEarnings = 0
  }
  
  const currentHour = now.getHours()
  const currentMin = now.getMinutes()
  const currentSec = now.getSeconds()
  const currentMinutes = currentHour * 60 + currentMin
  const startMinutes = config.workStartTime.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)
  const endMinutes = config.workEndTime.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)
  
  // 午休时间
  const breakStartMinTotal = config.breakStartTime.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)
  const breakEndMinTotal = breakStartMinTotal + config.breakDuration
  
  const inWorkTime = currentMinutes >= startMinutes && currentMinutes < endMinutes
  const inBreakTime = currentMinutes >= breakStartMinTotal && currentMinutes < breakEndMinTotal
  
  // 增加收入
  if (inWorkTime && !inBreakTime && state.isRunning) {
    if (state.lastUpdateTime) {
      const secondsPassed = (currentTime - state.lastUpdateTime) / 1000 // 精确到毫秒
      state.currentEarnings += state.earningsPerSecond * secondsPassed
    } else {
      // 计算今天已经工作的时间
      let secondsWorked = (currentMinutes - startMinutes) * 60 + currentSec + currentSec / 1000
      if (currentMinutes > breakStartMinTotal) {
        secondsWorked -= config.breakDuration * 60
      }
      if (secondsWorked < 0) secondsWorked = 0
      state.currentEarnings = state.earningsPerSecond * secondsWorked
    }
  } else if (!inWorkTime && state.isRunning) {
    // 下班后，薪资固定为当日日薪，不再增长
    const workDurationMinutes = (endMinutes - startMinutes) - config.breakDuration
    const dailySalary = state.earningsPerSecond * workDurationMinutes * 60
    state.currentEarnings = dailySalary
    stopTimer() // 自动停止计时器
  }
  
  // 更新UI
  updateUI()
  
  state.lastUpdateTime = currentTime
  state.lastDate = today
}

// 更新UI
function updateUI() {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMin = now.getMinutes()
  const currentSec = now.getSeconds()
  const currentMinutes = currentHour * 60 + currentMin
  
  const startMinutes = config.workStartTime.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)
  const endMinutes = config.workEndTime.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)
  const breakStartMinTotal = config.breakStartTime.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)
  const breakEndMinTotal = breakStartMinTotal + config.breakDuration
  
  // 计算进度
  let progressPercent = 0
  if (currentMinutes >= endMinutes) {
    progressPercent = 100
  } else {
    let totalWorkSeconds = (endMinutes - startMinutes) * 60 - config.breakDuration * 60
    let secondsWorked = (currentMinutes - startMinutes) * 60 + currentSec
    if (currentMinutes > breakStartMinTotal) {
      secondsWorked -= config.breakDuration * 60
    }
    if (secondsWorked > 0) {
      progressPercent = Math.min(100, (secondsWorked / totalWorkSeconds) * 100)
    }
  }
  
  // 距下班时间
  let remainingTime = ''
  let expectedEarnings = ''
  if (currentMinutes < endMinutes) {
    let remainingMinutes = endMinutes - currentMinutes
    if (currentMinutes < breakEndMinTotal && currentMinutes >= breakStartMinTotal) {
      remainingMinutes -= (breakEndMinTotal - currentMinutes)
    } else if (currentMinutes < breakStartMinTotal) {
      remainingMinutes -= config.breakDuration
    }
    remainingMinutes = Math.max(0, remainingMinutes)
    
    const hours = Math.floor(remainingMinutes / 60)
    const mins = Math.floor(remainingMinutes % 60)
    remainingTime = `距下班 ${hours}小时${mins}分钟`
    
    // 预计收入
    const workHoursTotal = (endMinutes - startMinutes - config.breakDuration) / 60
    expectedEarnings = ((remainingMinutes / 60) * config.dailySalary / workHoursTotal).toFixed(0)
  } else {
    remainingTime = '已下班'
  }
  
  // 工作时长
  let workSeconds = 0
  const inWorkTime = currentMinutes >= startMinutes && currentMinutes < endMinutes
  const inBreakTime = currentMinutes >= breakStartMinTotal && currentMinutes < breakEndMinTotal
  
  if (inWorkTime && !inBreakTime) {
    let totalWorkSeconds = (endMinutes - startMinutes) * 60 - config.breakDuration * 60
    let secondsWorked = (currentMinutes - startMinutes) * 60 + currentSec
    if (currentMinutes > breakStartMinTotal) {
      secondsWorked -= config.breakDuration * 60
    }
    workSeconds = Math.max(0, secondsWorked)
  }
  
  const workHours = Math.floor(workSeconds / 3600)
  const workMins = Math.floor((workSeconds % 3600) / 60)
  const workSecs = workSeconds % 60
  
  // 下一个里程碑
  let nextMilestone = state.milestones.find(m => m.amount > state.currentEarnings)
  if (!nextMilestone) nextMilestone = { amount: '-', name: '已满级', icon: '🌟' }
  
  // 更新DOM
  document.getElementById('currentEarnings').textContent = state.currentEarnings.toFixed(2)
  document.getElementById('workTime').textContent = `${String(workHours).padStart(2, '0')}:${String(workMins).padStart(2, '0')}:${String(workSecs).padStart(2, '0')}`
  document.getElementById('remainingTime').textContent = remainingTime
  document.getElementById('expectedEarnings').textContent = expectedEarnings ? `预计赚 ${config.currency}${expectedEarnings}` : ''
  document.getElementById('progressBar').style.width = `${progressPercent.toFixed(0)}%`
  document.getElementById('progressText').textContent = `${progressPercent.toFixed(0)}%`
  document.getElementById('milestoneIcon').textContent = nextMilestone.icon
  document.getElementById('milestoneAmount').textContent = `${config.currency}${nextMilestone.amount}`
  document.getElementById('milestoneName').textContent = nextMilestone.name
}

// 更新收入 - 带节假日检测
function updateEarnings() {
  const now = new Date()

  // 检查是否是周末或节假日
  if (isWeekend(now) || isHoliday(now)) {
    // 停止计时器
    if (state.isRunning) {
      stopTimer()
    }
    // 显示节假日信息
    updateHolidayUI()
    return
  }

  // 正常工作时间计算
  return originalUpdateEarnings.apply(this, arguments)
}

// 更新目标UI
function updateGoalUI() {
  const percent = (goalConfig.saved / goalConfig.amount) * 100
  const remaining = goalConfig.amount - goalConfig.saved
  const monthsNeeded = remaining / goalConfig.monthlySave
  const years = Math.floor(monthsNeeded / 12)
  const months = Math.ceil(monthsNeeded % 12)
  
  let timeText = ''
  if (years > 0) {
    timeText += `${years}年`
  }
  if (months > 0) {
    timeText += `${months}个月`
  }
  if (years === 0 && months < 1) {
    timeText = '恭喜！目标即将达成'
  }
  
  document.getElementById('goalName').textContent = `${goalConfig.name} (${config.currency}${goalConfig.amount.toLocaleString()})`
  document.getElementById('goalPercent').textContent = `${percent.toFixed(2)}%`
  document.getElementById('goalBar').style.width = `${Math.min(100, percent)}%`
  document.getElementById('goalTime').textContent = `还需要 ${timeText}`
}

// 加载首页工作推荐
async function loadJobs() {
  const jobsList = document.getElementById('jobsList')
  jobsList.innerHTML = '<div class="job-item"><div class="job-title">🔍 正在加载岗位...</div></div>'
  
  try {
    const jobs = getMockJobs(config.city, config.industry)
    let html = ''
    jobs.slice(0, 3).forEach(job => {
      html += `
        <div class="job-item" style="padding: 15px 0; border-bottom: 1px solid #f0f0f0;">
          <div class="job-title" style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 5px;">${job.title}</div>
          <div class="job-company" style="font-size: 14px; color: #666; margin-bottom: 5px;">${job.company}</div>
          <div class="job-salary" style="font-size: 16px; color: #ff6b6b; font-weight: bold; margin-bottom: 5px;">${job.salary}</div>
          <div style="font-size: 12px; color: #999; display: flex; gap: 10px;">
            <span>${job.location}</span>
            <span>${job.experience}</span>
          </div>
        </div>
      `
    })
    jobsList.innerHTML = html
  } catch (e) {
    console.error('岗位加载失败:', e)
  }
}

// 加载全量岗位列表
async function loadFullJobs() {
  const jobsList = document.getElementById('fullJobsList')
  jobsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">🔍 正在加载最新岗位...</div>'
  
  try {
    const jobs = getMockJobs(config.city, config.industry)
    let html = ''
    jobs.forEach(job => {
      html += `
        <div class="job-card">
          <div class="job-title">${job.title}</div>
          <div class="job-company">${job.company}</div>
          <div class="job-salary">${job.salary}</div>
          <div class="job-location">${job.location}</div>
          <div class="job-desc">${job.desc || '要求3年以上相关工作经验，熟悉对应技术栈，具备良好的沟通能力和团队协作精神。'}</div>
        </div>
      `
    })
    jobsList.innerHTML = html
  } catch (e) {
    console.error('全量岗位加载失败:', e)
    jobsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">加载失败，请稍后重试</div>'
  }
}

// 模拟招聘数据
function getMockJobs(city, industry) {
  const cityJobs = {
    '北京': [
      { title: '高级前端开发工程师', company: '字节跳动', salary: '30K-60K·14薪', location: '北京 海淀区', experience: '3-5年 | 本科', desc: '负责字节系产品前端开发，React/Vue技术栈，要求3年以上前端开发经验，熟悉移动端适配。' },
      { title: 'Java开发工程师', company: '阿里巴巴', salary: '25K-50K·16薪', location: '北京 朝阳区', experience: '3-5年 | 本科', desc: '负责阿里电商平台后端开发，Java+SpringBoot技术栈，有高并发系统设计经验优先。' },
      { title: '产品经理', company: '腾讯', salary: '35K-70K·16薪', location: '北京 海淀区', experience: '5-10年 | 本科', desc: '负责微信生态产品规划，需要有C端产品经验，良好的用户思维和数据分析能力。' },
      { title: 'UI设计师', company: '美团', salary: '20K-40K·14薪', location: '北京 朝阳区', experience: '3-5年 | 本科', desc: '负责美团外卖产品UI设计，需要有移动端设计经验，熟悉Figma等设计工具。' },
      { title: '测试工程师', company: '拼多多', salary: '20K-35K·18薪', location: '北京 海淀区', experience: '3-5年 | 本科', desc: '负责电商平台功能测试和自动化测试，需要有测试用例设计经验，熟悉Python/Java。' },
      { title: '算法工程师', company: '百度', salary: '40K-80K·16薪', location: '北京 海淀区', experience: '3-5年 | 硕士', desc: '负责AI大模型相关算法开发，需要有机器学习、深度学习相关经验，发表过顶会论文优先。' }
    ],
    '上海': [
      { title: '前端开发工程师', company: '拼多多', salary: '30K-60K·18薪', location: '上海 长宁区', experience: '3-5年 | 本科' },
      { title: '全栈开发工程师', company: '哔哩哔哩', salary: '28K-55K·16薪', location: '上海 杨浦区', experience: '3-5年 | 本科' },
      { title: '算法工程师', company: '小红书', salary: '40K-80K·16薪', location: '上海 黄浦区', experience: '5-10年 | 硕士' },
      { title: '运营经理', company: '字节跳动', salary: '25K-50K·15薪', location: '上海 静安区', experience: '3-5年 | 本科' },
      { title: '产品经理', company: '饿了么', salary: '28K-50K·15薪', location: '上海 普陀区', experience: '3-5年 | 本科' }
    ],
    '广州': [
      { title: '前端开发工程师', company: '微信', salary: '25K-50K·16薪', location: '广州 海珠区', experience: '3-5年 | 本科' },
      { title: '产品经理', company: '唯品会', salary: '20K-40K·14薪', location: '广州 荔湾区', experience: '3-5年 | 本科' },
      { title: 'Java开发工程师', company: '网易游戏', salary: '30K-60K·16薪', location: '广州 天河区', experience: '3-5年 | 本科' }
    ],
    '深圳': [
      { title: '前端开发工程师', company: '腾讯', salary: '30K-65K·16薪', location: '深圳 南山区', experience: '3-5年 | 本科' },
      { title: '硬件工程师', company: '华为', salary: '35K-70K·14薪', location: '深圳 龙岗区', experience: '5-10年 | 本科' },
      { title: '产品经理', company: '大疆', salary: '28K-55K·16薪', location: '深圳 南山区', experience: '3-5年 | 本科' }
    ],
    '杭州': [
      { title: 'Java开发工程师', company: '阿里巴巴', salary: '25K-55K·16薪', location: '杭州 余杭区', experience: '3-5年 | 本科' },
      { title: '前端开发工程师', company: '网易', salary: '22K-45K·16薪', location: '杭州 滨江区', experience: '3-5年 | 本科' },
      { title: '运营专员', company: '抖音电商', salary: '18K-35K·15薪', location: '杭州 余杭区', experience: '1-3年 | 本科' }
    ]
  }
  
  return cityJobs[city] || cityJobs['北京']
}

// 打开设置
function openSettings() {
  document.getElementById('settingsModal').classList.add('show')
}

// 关闭设置
function closeSettings() {
  document.getElementById('settingsModal').classList.remove('show')
}

// 屏幕常亮相关
let wakeLock = null

async function enableWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen')
      console.log('屏幕常亮已开启')
    }
  } catch (err) {
    console.log('屏幕常亮开启失败:', err)
  }
}

function disableWakeLock() {
  if (wakeLock) {
    wakeLock.release()
    wakeLock = null
    console.log('屏幕常亮已关闭')
  }
}

// 监听页面可见性变化，重新激活常亮
document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible' && config.wakeLockEnabled) {
    wakeLock = await navigator.wakeLock.request('screen')
  }
})

// 切换常亮开关
document.addEventListener('click', (e) => {
  if (e.target.id === 'wakeLockToggle' || e.target.parentElement.id === 'wakeLockToggle') {
    const toggle = document.getElementById('wakeLockToggle')
    toggle.classList.toggle('active')
  }
})

// 保存设置
function saveSettings() {
  config.dailySalary = parseFloat(document.getElementById('dailySalary').value) || 0
  config.workStartTime = document.getElementById('workStartTime').value
  config.workEndTime = document.getElementById('workEndTime').value
  config.breakStartTime = document.getElementById('breakStartTime').value
  config.breakDuration = parseInt(document.getElementById('breakDuration').value) || 0
  config.currency = document.getElementById('currency').value
  config.city = document.getElementById('city').value
  config.industry = document.getElementById('industry').value
  config.wakeLockEnabled = document.getElementById('wakeLockToggle').classList.contains('active')

  saveConfig()
  calculateEarningsPerSecond()

  // 处理屏幕常亮
  if (config.wakeLockEnabled) {
    enableWakeLock()
  } else {
    disableWakeLock()
  }
  
  // 更新显示
  document.getElementById('currencySymbol').textContent = config.currency
  document.getElementById('workTimeValue').textContent = `${config.workStartTime} - ${config.workEndTime}`
  document.getElementById('goalCurrency').textContent = config.currency
  document.getElementById('goalCurrencySaved').textContent = config.currency
  document.getElementById('goalCurrencyMonth').textContent = config.currency
  
  closeSettings()
  
  // 重新加载工作
  loadJobs()
  
  // 提示
  alert('设置已保存')
}

// 打开目标设置
function openGoalSettings() {
  document.getElementById('goalModal').classList.add('show')
}

// 关闭目标设置
function closeGoalSettings() {
  document.getElementById('goalModal').classList.remove('show')
}

// 保存目标设置
function saveGoalSettings() {
  goalConfig.name = document.getElementById('goalNameInput').value || '买房'
  goalConfig.amount = parseFloat(document.getElementById('goalAmount').value) || 1000000
  goalConfig.saved = parseFloat(document.getElementById('goalSaved').value) || 0
  goalConfig.monthlySave = parseFloat(document.getElementById('goalMonthlySave').value) || 5000
  
  saveGoalConfig()
  updateGoalUI()
  
  closeGoalSettings()
  alert('目标已保存')
}

// 点击模态框外部关闭
window.onclick = function(event) {
  const settingsModal = document.getElementById('settingsModal')
  const goalModal = document.getElementById('goalModal')
  
  if (event.target == settingsModal) {
    closeSettings()
  }
  if (event.target == goalModal) {
    closeGoalSettings()
  }
}

// ==================== 健康提醒功能 ====================
let healthConfig = {
  reminders: {
    water: { enabled: true, interval: 60, lastTrigger: null, count: 0 },
    stretch: { enabled: true, interval: 60, lastTrigger: null, count: 0 },
    walk: { enabled: true, interval: 90, lastTrigger: null, count: 0 },
    eye: { enabled: true, interval: 30, lastTrigger: null, count: 0 }
  },
  healthTimer: null,
  notificationPermission: false
}

const reminderMessages = {
  water: { title: '💧 喝水时间到啦！', body: '工作再忙也别忘了补充水分哦~ 喝杯水休息一下吧😊' },
  stretch: { title: '🧘 伸懒腰时间到！', body: '坐了太久啦！站起来伸个懒腰，活动一下肩颈和腰椎吧~' },
  walk: { title: '🚶 该活动啦！', body: '起来走两步吧，促进血液循环，对身体更好哦~' },
  eye: { title: '👀 护眼时间到！', body: '眼睛太累啦！看看远处20秒，放松一下你的双眼吧~' }
}

// 初始化健康提醒
function initHealthReminders() {
  // 请求通知权限
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      healthConfig.notificationPermission = permission === 'granted'
    })
  }

  // 加载保存的配置
  loadHealthConfig()

  // 更新UI
  updateHealthUI()

  // 启动健康提醒定时器
  startHealthTimer()
}

// 加载健康配置
function loadHealthConfig() {
  const saved = localStorage.getItem('healthConfig')
  if (saved) {
    const parsed = JSON.parse(saved)
    healthConfig.reminders = { ...healthConfig.reminders, ...parsed.reminders }
  }

  // 初始化日期变更时重置计数
  const today = new Date().toDateString()
  const lastDate = localStorage.getItem('healthLastDate')
  if (lastDate !== today) {
    Object.values(healthConfig.reminders).forEach(r => r.count = 0)
    localStorage.setItem('healthLastDate', today)
    saveHealthConfig()
  }

  // 更新表单值
  Object.keys(healthConfig.reminders).forEach(type => {
    const toggle = document.getElementById(`${type}Toggle`)
    const interval = document.getElementById(`${type}Interval`)
    if (toggle) {
      toggle.classList.toggle('active', healthConfig.reminders[type].enabled)
    }
    if (interval) {
      interval.value = healthConfig.reminders[type].interval
    }
  })
}

// 保存健康配置
function saveHealthConfig() {
  localStorage.setItem('healthConfig', JSON.stringify(healthConfig))
}

// 更新健康UI
function updateHealthUI() {
  // 更新计数
  Object.keys(healthConfig.reminders).forEach(type => {
    const countEl = document.getElementById(`${type}Count`)
    if (countEl) {
      countEl.textContent = healthConfig.reminders[type].count
    }
  })

  // 计算下一个提醒
  updateNextReminder()
}

// 更新下一个提醒时间
function updateNextReminder() {
  const nextEl = document.getElementById('nextReminderText')
  if (!nextEl) return

  const now = Date.now()
  let nextTime = Infinity
  let nextType = null

  Object.entries(healthConfig.reminders).forEach(([type, config]) => {
    if (!config.enabled) return
    const last = config.lastTrigger || now
    const next = last + config.interval * 60 * 1000
    if (next < nextTime) {
      nextTime = next
      nextType = type
    }
  })

  if (!nextType) {
    nextEl.textContent = '当前没有开启的提醒'
    return
  }

  const minutesLeft = Math.ceil((nextTime - now) / (60 * 1000))
  const reminderName = { water: '喝水', stretch: '伸懒腰', walk: '活动', eye: '护眼' }[nextType]

  if (minutesLeft <= 0) {
    nextEl.textContent = `下一个提醒：即将到来 ${reminderName}提醒`
  } else {
    nextEl.textContent = `下一个提醒：${minutesLeft}分钟后 ${reminderName}提醒`
  }
}

// 切换提醒开关
function toggleReminder(type) {
  const config = healthConfig.reminders[type]
  config.enabled = !config.enabled

  const toggle = document.getElementById(`${type}Toggle`)
  toggle.classList.toggle('active', config.enabled)

  // 如果开启了，重置上次触发时间
  if (config.enabled) {
    config.lastTrigger = Date.now()
  }

  saveHealthConfig()
  updateNextReminder()
}

// 切换提醒间隔
document.addEventListener('change', (e) => {
  if (e.target.classList.contains('reminder-interval')) {
    const type = e.target.id.replace('Interval', '')
    healthConfig.reminders[type].interval = parseInt(e.target.value)
    healthConfig.reminders[type].lastTrigger = Date.now()
    saveHealthConfig()
    updateNextReminder()
  }
})

// 启动健康提醒定时器
function startHealthTimer() {
  if (healthConfig.healthTimer) {
    clearInterval(healthConfig.healthTimer)
  }

  healthConfig.healthTimer = setInterval(() => {
    checkReminders()
    updateNextReminder()
  }, 60000) // 每分钟检查一次
}

// 检查是否需要触发提醒
function checkReminders() {
  const now = Date.now()
  Object.entries(healthConfig.reminders).forEach(([type, config]) => {
    if (!config.enabled) return
    const last = config.lastTrigger || now
    const intervalMs = config.interval * 60 * 1000
    if (now - last >= intervalMs) {
      triggerReminder(type)
      config.lastTrigger = now
      config.count++
      saveHealthConfig()
      updateHealthUI()
    }
  })
}

// 触发提醒
function triggerReminder(type) {
  const message = reminderMessages[type]

  // 页面内提醒
  showToast(message.title, message.body)

  // 系统通知
  if (healthConfig.notificationPermission && 'Notification' in window && document.hidden) {
    new Notification(message.title, {
      body: message.body,
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM2NjdFRUEiLz4KPHBhdGggZD0iTTMyIDRMMzYuNDcgMTIuNTNMNDYgMTZMMzYuNDcgMTkuNDdMMzIgMjhMMjcuNTMgMTkuNDdMMTggMTZMMjcuNTMgMTIuNTNMMzIgNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo='
    })
  }

  // 播放提示音
  playNotificationSound()
}

// 测试通知
function testNotification() {
  triggerReminder('water')
}

// 显示toast提醒
function showToast(title, body) {
  // 创建toast元素
  const toast = document.createElement('div')
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 20px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    z-index: 9999999;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `
  toast.innerHTML = `
    <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${title}</div>
    <div style="font-size: 14px; line-height: 1.5;">${body}</div>
  `
  document.body.appendChild(toast)

  // 添加动画
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)

  // 3秒后消失
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out forwards'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}

// 播放提示音
function playNotificationSound() {
  // 使用简单的音频上下文播放提示音
  if ('AudioContext' in window || 'webkitAudioContext' in window) {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    const audioCtx = new AudioContext()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5)

    oscillator.start(audioCtx.currentTime)
    oscillator.stop(audioCtx.currentTime + 0.5)
  }
}

// 在原有init函数末尾加入健康提醒初始化
function initializeApp() {
  init()
  initHealthReminders()
}

// 注册PWA Service Worker
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW注册成功:', registration.scope)
      })
      .catch(err => {
        console.log('SW注册失败:', err)
      })
  })
}

// 初始化
window.onload = initializeApp
