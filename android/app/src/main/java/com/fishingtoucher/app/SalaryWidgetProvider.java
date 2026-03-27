package com.fishingtoucher.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.util.Log;

public class SalaryWidgetProvider extends AppWidgetProvider {
    private static final String TAG = "SalaryWidgetProvider";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        try {
            // 获取共享数据
            SharedPreferences preferences = context.getSharedPreferences("salaryConfig", Context.MODE_PRIVATE);
            double dailySalary = preferences.getFloat("dailySalary", 300);

            // 更新Widget视图
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout);
            views.setTextViewText(R.id.widgetEarnings, String.format("¥%.2f", calculateCurrentEarnings()));

            appWidgetManager.updateAppWidget(appWidgetId, views);
        } catch (Exception e) {
            Log.e(TAG, "Error updating widget: " + e.getMessage());
        }
    }

    private static double calculateCurrentEarnings() {
        // 简化的收入计算逻辑
        return 0.0;
    }
}
