#!/usr/bin/env bash
# Builds the KDN Fitness Android app on GitHub Actions.
# Output in app/out: KDN-Fitness-<ver>-test.apk (install on a phone) and, when the
# KDN_KEYSTORE_PASSWORD secret exists (it unlocks app/upload-key.jks.enc), KDN-Fitness-<ver>.aab (upload to Google Play).
set -euo pipefail
cd "$(dirname "$0")"
VC="${VERSION_CODE:-1}"
VN="1.0.${VC}"
echo "== KDN Fitness app build: version $VN (code $VC)"

echo "== 1. Copy the website into www (photos stay inside the app)"
rm -rf www out && mkdir -p www out
cp ../index.html ../kdn-live.js www/
cp -r ../assets www/assets

echo "== 2. Install Capacitor"
npm install --no-audit --no-fund
npx cap --version

echo "== 3. Android project"
npx cap add android

echo "== 4. Icons and splash"
npx capacitor-assets generate --android \
  --iconBackgroundColor '#060608' --iconBackgroundColorDark '#060608' \
  --splashBackgroundColor '#060608' --splashBackgroundColorDark '#060608'
cp -r res/drawable-* android/app/src/main/res/

echo "== 5. Sync web files and plugins"
npx cap sync android

echo "== 6. Version, SDK levels, permissions"
G=android/app/build.gradle
sed -i -E "s/versionCode [0-9]+/versionCode ${VC}/; s/versionName \"[^\"]+\"/versionName \"${VN}\"/" "$G"
V=android/variables.gradle
sed -i -E 's/compileSdkVersion = [0-9]+/compileSdkVersion = 36/; s/targetSdkVersion = [0-9]+/targetSdkVersion = 36/' "$V"
M=android/app/src/main/AndroidManifest.xml
# notifications for period reminders (no camera: medical reports are website only)
for P in android.permission.POST_NOTIFICATIONS android.permission.VIBRATE; do
  grep -q "$P" "$M" || sed -i "s#</manifest>#    <uses-permission android:name=\"$P\" />\n</manifest>#" "$M"
done
echo "--- variables.gradle"; cat "$V"
echo "--- manifest"; cat "$M"
grep -E "versionCode|versionName" "$G"

echo "== 7. Build"
cd android
chmod +x gradlew
./gradlew --no-daemon assembleDebug
cp app/build/outputs/apk/debug/app-debug.apk "../out/KDN-Fitness-${VN}-test.apk"
if [ -n "${KEYSTORE_PASSWORD:-}" ]; then
  echo "== Signing password found: building the Play Store bundle"
  openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -in ../upload-key.jks.enc -out "$RUNNER_TEMP/kdn-upload.jks" -pass env:KEYSTORE_PASSWORD
  SIGN="-Pandroid.injected.signing.store.file=$RUNNER_TEMP/kdn-upload.jks -Pandroid.injected.signing.store.password=$KEYSTORE_PASSWORD -Pandroid.injected.signing.key.alias=kdn-upload -Pandroid.injected.signing.key.password=$KEYSTORE_PASSWORD"
  ./gradlew --no-daemon bundleRelease $SIGN
  cp app/build/outputs/bundle/release/app-release.aab "../out/KDN-Fitness-${VN}.aab"
  rm -f "$RUNNER_TEMP/kdn-upload.jks"
else
  echo "== No signing password yet (GitHub secret KDN_KEYSTORE_PASSWORD): only the test APK was built"
fi
ls -la ../out
echo "== BUILD OK $VN"
