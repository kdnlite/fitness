#!/usr/bin/env python3
"""Adds KDN's own Android pieces to the generated Capacitor project (run by build.sh after cap sync):
- home screen widget (provider, plugin, layout) and MainActivity that registers the plugin
- Health Connect: only READ_STEPS is kept; every other health permission a plugin brings is removed
- strings: widget description and the privacy policy link Health Connect shows
- minSdk 26 (Health Connect needs Android 8.0+)"""
import os, re, shutil, glob, sys
A = 'android/app/src/main'
NATIVE = 'native'
# Java sources
dst = os.path.join(A, 'java/com/kdnfitness/app'); os.makedirs(dst, exist_ok=True)
for f in glob.glob(os.path.join(NATIVE, 'java/*.java')): shutil.copy(f, dst)
# resources
for d in ('layout', 'xml', 'drawable'):
    os.makedirs(os.path.join(A, 'res', d), exist_ok=True)
    for f in glob.glob(os.path.join(NATIVE, 'res', d, '*.xml')): shutil.copy(f, os.path.join(A, 'res', d))
# strings
sp = os.path.join(A, 'res/values/strings.xml'); s = open(sp).read()
add = ''
if 'kdn_widget_desc' not in s: add += '    <string name="kdn_widget_desc">Score, steps and water for today</string>\n'
if 'health_connect_privacy_policy_url' not in s: add += '    <string name="health_connect_privacy_policy_url">https://kdnfitness.com/privacy.html</string>\n'
s = s.replace('</resources>', add + '</resources>'); open(sp, 'w').write(s)
# manifest
mp = os.path.join(A, 'AndroidManifest.xml'); m = open(mp).read()
if 'xmlns:tools' not in m: m = m.replace('<manifest ', '<manifest xmlns:tools="http://schemas.android.com/tools" ', 1)
if 'KdnWidgetProvider' not in m:
    m = m.replace('</application>', '''        <receiver android:name=".KdnWidgetProvider" android:exported="false" android:label="KDN Fitness">
            <intent-filter><action android:name="android.appwidget.action.APPWIDGET_UPDATE" /></intent-filter>
            <meta-data android:name="android.appwidget.provider" android:resource="@xml/kdn_widget_info" />
        </receiver>
    </application>''', 1)
# health permissions from every plugin manifest, except reading steps
perms = set()
for f in glob.glob('node_modules/**/android/src/main/AndroidManifest.xml', recursive=True):
    perms |= set(re.findall(r'android\.permission\.health\.[A-Z0-9_]+', open(f).read()))
keep = {'android.permission.health.READ_STEPS'}
rm = sorted(perms - keep)
lines = ''.join('    <uses-permission android:name="%s" tools:node="remove" />\n' % p for p in rm if p not in m)
if 'android.permission.health.READ_STEPS' not in m: lines += '    <uses-permission android:name="android.permission.health.READ_STEPS" />\n'
m = m.replace('</manifest>', lines + '</manifest>', 1)
open(mp, 'w').write(m)
# min SDK 26
vp = 'android/variables.gradle'; v = open(vp).read()
v = re.sub(r'minSdkVersion = \d+', 'minSdkVersion = 26', v); open(vp, 'w').write(v)
print('KDN native: widget added, health permissions removed:', len(rm), 'kept: READ_STEPS')
