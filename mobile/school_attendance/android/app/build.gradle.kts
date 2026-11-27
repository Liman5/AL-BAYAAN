import java.io.FileInputStream
import java.util.Properties

plugins {
    id("com.android.application")
    id("dev.flutter.flutter-gradle-plugin")
}

// Signature de production : facultative.
// Créez android/key.properties (non versionné) avec :
//   storeFile=chemin/vers/keystore.jks
//   storePassword=...
//   keyAlias=...
//   keyPassword=...
// Sans ce fichier, le build release est signé avec la clé de debug
// (installable pour tester, non publiable sur le Play Store).
val keystorePropertiesFile = rootProject.file("key.properties")
val keystoreProperties = Properties()
if (keystorePropertiesFile.exists()) {
    FileInputStream(keystorePropertiesFile).use { keystoreProperties.load(it) }
}

android {
    namespace = "com.albayaan.schoolattendance"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        applicationId = "com.albayaan.schoolattendance"
        // mobile_scanner, drift/sqlite3 et flutter_secure_storage nécessitent 23+
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    signingConfigs {
        if (keystorePropertiesFile.exists()) {
            create("release") {
                keyAlias = keystoreProperties["keyAlias"] as String
                keyPassword = keystoreProperties["keyPassword"] as String
                storeFile = file(keystoreProperties["storeFile"] as String)
                storePassword = keystoreProperties["storePassword"] as String
            }
        }
    }

    buildTypes {
        release {
            signingConfig = if (keystorePropertiesFile.exists()) {
                signingConfigs.getByName("release")
            } else {
                signingConfigs.getByName("debug")
            }
            isMinifyEnabled = false
            isShrinkResources = false
        }
    }

    lint {
        // L'application est distribuée par APK interne (dépôt manuel sur le
        // terminal), pas via le Play Store : l'analyse `lintVital` n'apporte
        // rien ici et son cache entre en conflit avec les autres processus
        // Gradle du poste de build (« fichier utilisé par un autre
        // processus »). La qualité statique Dart reste garantie par
        // `flutter analyze` et `flutter test`.
        checkReleaseBuilds = false
        abortOnError = false
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}

