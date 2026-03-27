package com.salary.stopwatch;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import android.content.SharedPreferences;

public class SalaryWidgetProvider extends AppWidgetProvider {
    public static final String ACTION_WIDGET_TOGGLE = "com.salary.stopwatch.ACTION_WIDGET_TOGGLE";
    public static final String ACTION_WIDGET_UPDATE = "com.salary.stopwatch.ACTION_WIDGET_UPDATE";
    public static final String PREFS_NAME = "SalaryWidgetPrefs";
    public static final String KEY_SALARY = "current_salary";
    public static final String KEY_STATUS = "status_text";
    public static final String KEY_IS_RUNNING = "is_running";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);

        if (ACTION_WIDGET_TOGGLE.equals(intent.getAction())) {
            // 发送广播给主应用，触发切换计时
            Intent toggleIntent = new Intent("com.salary.stopwatch.TOGGLE_TIMER");
            context.sendBroadcast(toggleIntent);
        } else if (ACTION_WIDGET_UPDATE.equals(intent.getAction())) {
            // 更新所有小部件
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(new ComponentName(context, SalaryWidgetProvider.class));
            onUpdate(context, appWidgetManager, appWidgetIds);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String currentSalary = prefs.getString(KEY_SALARY, "¥0.00");
        String statusText = prefs.getString(KEY_STATUS, "未开始");
        boolean isRunning = prefs.getBoolean(KEY_IS_RUNNING, false);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout);

        // 更新文本
        views.setTextViewText(R.id.widget_salary, currentSalary);
        views.setTextViewText(R.id.widget_status, statusText);

        // 更新按钮图标
        if (isRunning) {
            views.setImageViewResource(R.id.widget_toggle_btn, R.drawable.ic_pause);
        } else {
            views.setImageViewResource(R.id.widget_toggle_btn, R.drawable.ic_play);
        }

        // 设置按钮点击事件
        Intent intent = new Intent(context, SalaryWidgetProvider.class);
        intent.setAction(ACTION_WIDGET_TOGGLE);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_toggle_btn, pendingIntent);

        // 点击小部件主区域打开APP
        Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        PendingIntent launchPendingIntent = PendingIntent.getActivity(context, 0, launchIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_salary, launchPendingIntent);
        views.setOnClickPendingIntent(R.id.widget_status, launchPendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}