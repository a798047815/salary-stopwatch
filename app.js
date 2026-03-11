// app.js
App({
  onLaunch() {
    // 初始化存储
    const salary = wx.getStorageSync('salaryData') || {};
    if (!salary.dailySalary) {
      salary.dailySalary = 300; // 默认300元/天
      salary.workStartTime = '09:00';
      salary.workEndTime = '18:00';
      salary.breakStartTime = '12:00';
      salary.breakDuration = 60; // 午休60分钟
      salary.currency = '¥';
      salary.achievements = [];
      salary.totalDays = 0;
      wx.setStorageSync('salaryData', salary);
    }
  },
  globalData: {
    timer: null,
    currentEarnings: 0
  }
})