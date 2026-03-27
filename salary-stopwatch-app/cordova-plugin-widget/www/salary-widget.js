var exec = require('cordova/exec');

var SalaryWidget = {
    updateWidget: function(currentSalary, statusText, isRunning, successCallback, errorCallback) {
        exec(successCallback, errorCallback, 'SalaryWidget', 'updateWidget', [currentSalary, statusText, isRunning]);
    }
};

module.exports = SalaryWidget;