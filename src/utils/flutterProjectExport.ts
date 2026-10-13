import JSZip from 'jszip';
import { FLUTTER_MAIN_DART, FLUTTER_PUBSPEC_YAML } from './flutterCode';

export const CODEMAGIC_YAML = `workflows:
  android-release-workflow:
    name: AuraStock Android Release APK
    max_build_duration: 30
    instance_type: mac_mini_m1
    environment:
      flutter: stable
      java: 17
    scripts:
      - name: Get Flutter dependencies
        script: flutter packages pub get
      - name: Build Android APK
        script: flutter build apk --release
    artifacts:
      - build/**/outputs/**/*.apk
    publishing:
      email:
        recipients:
          - memamagdy1999@gmail.com
        notify:
          success: true
          failure: true
`;

export const ANDROID_MANIFEST_XML = `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.aurastock.inventory">

    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.VIBRATE"/>
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32"/>
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32"/>

    <application
        android:label="AuraStock"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher"
        android:theme="@style/LaunchTheme">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <meta-data
              android:name="io.flutter.embedding.android.NormalTheme"
              android:resource="@style/NormalTheme"
              />
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>
`;

export const ANDROID_APP_BUILD_GRADLE = `def localProperties = new Properties()
def localPropertiesFile = rootProject.file('local.properties')
if (localPropertiesFile.exists()) {
    localPropertiesFile.withReader('UTF-8') { reader ->
        localProperties.load(reader)
    }
}

def flutterVersionCode = localProperties.getProperty('flutter.versionCode')
if (flutterVersionCode == null) {
    flutterVersionCode = '1'
}

def flutterVersionName = localProperties.getProperty('flutter.versionName')
if (flutterVersionName == null) {
    flutterVersionName = '1.0'
}

apply plugin: 'com.android.application'
apply plugin: 'kotlin-android'
apply from: "\$flutterRoot/packages/flutter_tools/gradle/flutter.gradle"

android {
    namespace "com.aurastock.inventory"
    compileSdkVersion 34
    ndkVersion flutter.ndkVersion

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = '17'
    }

    sourceSets {
        main.java.srcDirs += 'src/main/kotlin'
    }

    defaultConfig {
        applicationId "com.aurastock.inventory"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName
        multiDexEnabled true
    }

    buildTypes {
        release {
            signingConfig signingConfigs.debug
            minifyEnabled false
            shrinkResources false
        }
    }
}

flutter {
    source '../..'
}

dependencies {
    implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk8:\$kotlin_version"
}
`;

export const ANDROID_BUILD_GRADLE = `buildscript {
    ext.kotlin_version = '1.9.0'
    repositories {
        google()
        mavenCentral()
    }

    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.0'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:\$kotlin_version"
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.buildDir = '../build'
subprojects {
    project.buildDir = "\${rootProject.buildDir}/\${project.name}"
}
subprojects {
    project.evaluationDependsOn(':app')
}

tasks.register("clean", Delete) {
    delete rootProject.buildDir
}
`;

export const ANDROID_SETTINGS_GRADLE = `include ':app'

def localPropertiesFile = new File(rootProject.projectDir, "local.properties")
def properties = new Properties()

assert localPropertiesFile.exists()
localPropertiesFile.withReader("UTF-8") { reader -> properties.load(reader) }

def flutterSdkPath = properties.getProperty("flutter.sdk")
assert flutterSdkPath != null, "flutter.sdk not set in local.properties"
apply from: "\$flutterSdkPath/packages/flutter_tools/gradle/app_plugin_loader.gradle"
`;

export const README_CODEMAGIC_MD = `# AuraStock - Android APK Build Guide (Codemagic CI/CD)
# دليل بناء ملف الـ APK لتطبيق أندرويد عبر منصة Codemagic

هذا المشروع مهيأ ومعد خصيصاً ليتم تجميعه كملف **APK** حقيقي للأندرويد عبر منصة **Codemagic**.

---

### طريقة تجميع الـ APK في 3 خطوات بسيطة على Codemagic:

1. **ارفع هذا المجلد إلى GitHub أو GitLab أو Bitbucket**:
   - قم بفك الضغط عن ملف \`aurastock_codemagic_project.zip\`.
   - ارفع الملفات إلى مستودع جديد على GitHub (New Repository).

2. **سجل دخولك إلى منصة Codemagic (codemagic.io)**:
   - سجل دخولك باستخدام حسابك على GitHub.
   - اضغط على **"Add application"** واختر المستودع الذي رفعته.
   - اختر نوع المشروع: **Flutter App**.

3. **بدء عملية التجميع (Start Build)**:
   - سيتعرف كود ماجيك تلقائياً على ملف \`codemagic.yaml\` المرفق داخل المشروع.
   - اضغط على **"Start new build"**.
   - خلال دقيقتين إلى 3 دقائق، ستنتهي المنصة من تجميع التطبيق وتنتج ملف:
     \`app-release.apk\`
   - يمكنك تحميل الـ APK مباشرة وتثبيته على هاتفك الأندرويد، أو استلامه عبر البريد الإلكتروني!

---

### الميزات المضمنة في التطبيق:
1. لوحة معلومات Dashboard تعرض إجمالي القيمة المالية للمخزون بالكامل في الوقت الفعلي.
2. قائمة المنتجات توضح الاسم، الكمية، وسعر الوحدة.
3. أزرار لزيادة ونقصان الكمية (+/-) وحقل لتعديل الكميات بالجملة (Bulk Adjust).
4. تحول لون الصف إلى الأحمر تلقائياً عند انخفاض الكمية عن 5 مع إشعارات تنبيهية.
5. ميزة البحث بالاسم أو الباركود.
6. تصدير التقارير بصيغة CSV و PDF.
7. زر لإضافة التصنيفات الجديدة (+ Add Category).
8. نظام تنبيهات أندرويد محلي عند انخفاض المخزون (Heads-Up Notifications).
9. أولوية الترتيب الأبجدي بالحروف من A إلى Z.
10. مظهر داكن فاخر بلمسات ذهبية وبرتقالية.
`;

export async function generateCodemagicProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root files
  zip.file('codemagic.yaml', CODEMAGIC_YAML);
  zip.file('pubspec.yaml', FLUTTER_PUBSPEC_YAML);
  zip.file('README.md', README_CODEMAGIC_MD);
  zip.file('.gitignore', `
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
build/
.pub-cache/
.pub/
android/.gradle
android/local.properties
`);

  // Flutter lib source
  const libDir = zip.folder('lib');
  if (libDir) {
    libDir.file('main.dart', FLUTTER_MAIN_DART);
  }

  // Android Native project setup
  const androidDir = zip.folder('android');
  if (androidDir) {
    androidDir.file('build.gradle', ANDROID_BUILD_GRADLE);
    androidDir.file('settings.gradle', ANDROID_SETTINGS_GRADLE);

    const appDir = androidDir.folder('app');
    if (appDir) {
      appDir.file('build.gradle', ANDROID_APP_BUILD_GRADLE);

      const srcDir = appDir.folder('src');
      if (srcDir) {
        const mainDir = srcDir.folder('main');
        if (mainDir) {
          mainDir.file('AndroidManifest.xml', ANDROID_MANIFEST_XML);

          const kotlinDir = mainDir.folder('kotlin/com/aurastock/inventory');
          if (kotlinDir) {
            kotlinDir.file(
              'MainActivity.kt',
              `package com.aurastock.inventory

import io.flutter.embedding.android.FlutterActivity

class MainActivity: FlutterActivity() {
}
`
            );
          }
        }
      }
    }
  }

  // Generate blob and download
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aurastock_codemagic_flutter_apk_project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
