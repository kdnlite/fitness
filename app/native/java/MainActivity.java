package com.kdnfitness.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // KDN's own plugin: sends today's numbers to the home screen widget
        registerPlugin(KdnWidgetPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
