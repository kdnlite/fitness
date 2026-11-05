package com.kdnfitness.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/** KDN home screen widget: today's score, steps and water. Tapping it opens the app. */
public class KdnWidgetProvider extends AppWidgetProvider {
    static final String PREFS = "kdn_widget";

    @Override
    public void onUpdate(Context ctx, AppWidgetManager m, int[] ids) {
        for (int id : ids) draw(ctx, m, id);
    }

    static void draw(Context ctx, AppWidgetManager m, int id) {
        SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
        boolean fresh = today.equals(p.getString("day", ""));
        int steps = fresh ? p.getInt("steps", 0) : 0, goal = Math.max(1, p.getInt("goal", 8000));
        int water = fresh ? p.getInt("water", 0) : 0, wgoal = Math.max(1, p.getInt("wgoal", 8));
        int score = fresh ? p.getInt("score", 0) : 0, streak = p.getInt("streak", 0);
        NumberFormat nf = NumberFormat.getIntegerInstance(new Locale("en", "IN"));

        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.kdn_widget);
        v.setTextViewText(R.id.kw_score, String.valueOf(score));
        v.setTextViewText(R.id.kw_streak, streak > 0 ? streak + "-day streak" : "Today's score");
        v.setTextViewText(R.id.kw_steps, nf.format(steps) + " / " + nf.format(goal));
        v.setProgressBar(R.id.kw_steps_bar, 100, Math.min(100, steps * 100 / goal), false);
        v.setTextViewText(R.id.kw_water, water + " / " + wgoal + " glasses");
        v.setProgressBar(R.id.kw_water_bar, 100, Math.min(100, water * 100 / wgoal), false);
        String next = fresh ? p.getString("next", "") : "Open KDN to start your day";
        v.setTextViewText(R.id.kw_next, next);

        Intent open = ctx.getPackageManager().getLaunchIntentForPackage(ctx.getPackageName());
        if (open != null) {
            open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent pi = PendingIntent.getActivity(ctx, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            v.setOnClickPendingIntent(R.id.kw_root, pi);
        }
        m.updateAppWidget(id, v);
    }
}
