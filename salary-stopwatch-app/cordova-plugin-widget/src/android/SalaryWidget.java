package com.salary.stopwatch;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;

public class SalaryWidget extends CordovaPlugin {
    private static final String ACTION_UPDATE_WIDGET = "updateWidget";

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (ACTION_UPDATE_WIDGET.equals(action)) {
            String currentSalary = args.getString(0);
            String statusText = args.getString(1);
            boolean isRunning = args.getBoolean(2);

            updateWidgetData(cordova.getContext(), currentSalary, statusText, isRunning);
            callbackContext.success("Widget updated");
            return true;
        }
        return false;
    }

    private void updateWidgetData(Context context, String currentSalary, String statusText, boolean isRunning) {
        SharedPreferences.Editor editor = context.getSharedPreferences(SalaryWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE).edit();
        editor.putString(SalaryWidgetProvider.KEY_SALARY, currentSalary);
        editor.putString(SalaryWidgetProvider.KEY_STATUS, statusText);
        editor.putBoolean(SalaryWidgetProvider.KEY_IS_RUNNING, isRunning);
        editor.apply();

        // 发送广播更新小部件
        Intent updateIntent = new Intent(context, SalaryWidgetProvider.class);
        updateIntent.setAction(SalaryWidgetProvider.ACTION_WIDGET_UPDATE);
        context.sendBroadcast(updateIntent);
    }
}