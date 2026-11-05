package com.kdnfitness.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Saves today's steps, water and score for the home screen widget, then redraws it. */
@CapacitorPlugin(name = "KdnWidget")
public class KdnWidgetPlugin extends Plugin {
    @PluginMethod
    public void update(PluginCall call) {
        Context ctx = getContext();
        SharedPreferences.Editor e = ctx.getSharedPreferences(KdnWidgetProvider.PREFS, Context.MODE_PRIVATE).edit();
        e.putInt("steps", call.getInt("steps", 0));
        e.putInt("goal", call.getInt("goal", 8000));
        e.putInt("water", call.getInt("water", 0));
        e.putInt("wgoal", call.getInt("wgoal", 8));
        e.putInt("score", call.getInt("score", 0));
        e.putInt("streak", call.getInt("streak", 0));
        e.putString("day", call.getString("day", ""));
        e.putString("next", call.getString("next", ""));
        e.apply();
        AppWidgetManager m = AppWidgetManager.getInstance(ctx);
        int[] ids = m.getAppWidgetIds(new ComponentName(ctx, KdnWidgetProvider.class));
        for (int id : ids) KdnWidgetProvider.draw(ctx, m, id);
        JSObject r = new JSObject();
        r.put("widgets", ids.length);
        call.resolve(r);
    }
}
