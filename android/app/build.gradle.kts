plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.candijago.ar"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.candijago.ar"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
}

dependencies {
    implementation("io.github.sceneview:arsceneview:0.10.0")
    implementation("com.google.ar:core:1.40.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")
}

tasks.register("downloadMarkerImage") {
    doLast {
        val url = "https://travelspromo.com/wp-content/uploads/2024/08/Bangunan-Candi-Jago-Chris-Arsen.jpg"
        val dest = file("src/main/assets/candi_jago_marker.jpg")
        dest.parentFile.mkdirs()
        ant.withGroovyBuilder {
            "get"("src" to url, "dest" to dest)
        }
    }
}
tasks.named("preBuild") { dependsOn("downloadMarkerImage") }
