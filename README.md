# GMD - GNU Media Downloader v1.92

## 🆕 الإصدار 1.92 - نسختان: طرفية (CLI) ورسومية (GUI) + AppImage

```
   ____   __  __   ____  
  / ___| |  \/  | |  _ \ 
 | |  _  | |\/| | | | | |
 | |_| | | |  | | | |_| |
  \____| |_|  |_| |____/ 
-------------------------
   GNU MEDIA DOWNLOADER
-------------------------
       » BY GNUTUX «
         » v1.92 «
```

**GMD v1.92** يأتي بإصدارين منفصلين:
- **🖥️ النسخة الطرفية (CLI)** - للأوامر والسكريبتات
- **🎨 النسخة الرسومية (GUI)** - واجهة مستخدم رسومية تعتمد على Zenity

<img width="256" height="256" alt="GMD Icon" src="https://github.com/SalehGNUTUX/GMD/blob/main/GMD%20APPIAMGE%20BIULD/gmd-icon.png?raw=true" />

---

## 📸 لقطات الشاشة

### النسخة الرسومية (GMD-GUI)

| العربية | English |
|---------|---------|
| ![القائمة الرئيسية - عربي](https://github.com/SalehGNUTUX/GMD/blob/main/screenshot/gmd-gui-main-menu-ar.png) | ![Main Menu - English](https://github.com/SalehGNUTUX/GMD/blob/main/screenshot/gmd-gui-main-menu-en.png) |

---

## 📦 تحميل AppImage (شغّل فوراً بدون تثبيت)

### النسخة الرسومية (GUI) - موصى بها للمستخدمين العاديين

**تحميل وتشغيل مباشر**
```bash
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
chmod +x GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
./GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
```

### النسخة الطرفية (CLI) - للمطورين والمستخدمين المتقدمين

**تحميل وتشغيل مباشر**
```bash
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD_CLI_Media_Downloader-x86_64.AppImage
chmod +x GMD_CLI_Media_Downloader-x86_64.AppImage
./GMD_CLI_Media_Downloader-x86_64.AppImage
```

---

## ✨ مميزات الإصدار 1.92

### 🖥️ **نسختان منفصلتان**
- **GMD-CLI**: النسخة الطرفية الكلاسيكية (تعمل في أي طرفية)
- **GMD-GUI**: نسخة رسومية حديثة بواجهة Zenity (أسهل للمستخدمين العاديين)

### 📦 **حزم AppImage**
- **شغّل فوراً** بدون تثبيت
- **متوافقة مع جميع توزيعات Linux**
- **حجم صغير** وسهلة النقل

### 🚀 **تشغيل فوري بعد التثبيت (للنسخة الطرفية)**
- لا حاجة لإدخال أي أمر يدوي بعد التثبيت
- يُشغَّل تلقائياً مباشرة بعد اكتمال التثبيت

### 🔙 **خيار الإلغاء والعودة في كل مرحلة**
- كل قائمة فرعية تحتوي على خيار `0` للعودة الفورية
- دعم ثنائي اللغة عربي وإنجليزي

### ✂️ **قص الفيديو والصوت**
- قص مباشر من رابط دون تحميل الملف كاملاً
- قص ملف موجود على الجهاز

### 📋 **معلومات الوسائط**
- عرض تفاصيل الفيديو قبل التنزيل (العنوان، المدة، الجودة، المشاهدات)

---

## 🚀 طرق التثبيت والتشغيل

### الطريقة 1: استخدام AppImage (أسهل وأسرع)

**للنسخة الرسومية (GUI)**
```bash
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
chmod +x GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
./GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
```

**للنسخة الطرفية (CLI)**
```bash
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD_CLI_Media_Downloader-x86_64.AppImage
chmod +x GMD_CLI_Media_Downloader-x86_64.AppImage
./GMD_CLI_Media_Downloader-x86_64.AppImage
```

### الطريقة 2: إضافة GMD إلى قائمة التطبيقات باستخدام GEARLEVER

**Gearlever** هو تطبيق Flatpak رائع يسمح لك بدمج تطبيقات AppImage في قائمة التطبيقات الخاصة بنظامك.

#### الخطوة 1: تثبيت Gearlever
```bash
flatpak install flathub it.mijorus.gearlever
```

#### الخطوة 2: تشغيل Gearlever
```bash
flatpak run it.mijorus.gearlever
```
أو ابحث عن "Gearlever" في قائمة التطبيقات وشغّله.

#### الخطوة 3: إضافة GMD إلى Gearlever

**الطريقة (أ) - السحب والإفلات (الأسهل):**
1. **افتح Gearlever**
2. **اسحب ملف AppImage** (GMD-GUI أو GMD-CLI) وأفلته في نافذة Gearlever
3. **اضغط على "Integrate"** لدمج التطبيق في النظام

**الطريقة (ب) - عبر زر "Add AppImage":**
1. **افتح Gearlever**
2. **اضغط على زر "Add AppImage"** (➕)
3. **اختر ملف AppImage** الذي تريد إضافته
4. **اضغط "Integrate"**

#### الخطوة 4: استمتع!
بعد الإضافة، ستجد GMD في قائمة التطبيقات الخاصة بنظامك:
- 📱 **GNOME**: اضغط على Super (Windows) وابحث عن "GMD"
- 🐧 **KDE**: ابحث في قائمة التطبيقات
- 🖥️ **XFCE**: ستجده في قائمة التطبيقات → Utilities

### الطريقة 3: التثبيت الكامل للنسخة الطرفية (CLI)
```bash
bash <(curl -sL "https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd") --install-desktop
```

### الطريقة 4: تجربة مباشرة دون تثبيت

**للنسخة الطرفية**
```bash
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd)
```

**للنسخة الرسومية (يجب أن يكون Zenity مثبتاً)**
```bash
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd-gui.sh)
```

---

## 📋 القوائم الرئيسية

### النسخة الطرفية (CLI)
```
┌─────────────────────────────────────┐
│          GMD - v1.92 (CLI)         │
│    منزل وسائط جنو - طرفية           │
├─────────────────────────────────────┤
│  ⬇️  1) تنزيل فيديو               │
│  🎵  2) تنزيل صوت                  │
│  🧠  3) تنزيل وتحويل مباشر        │
│  🔄  4) تحويل وسائط               │
│  ⚡  5) خيارات تنزيل أخرى          │
│  ✂️  6) قص الفيديو/الصوت          │
│  📋  7) معلومات الوسائط           │
│  ⚙️  8) إعدادات                   │
├─────────────────────────────────────┤
│  🚪  0) خروج من البرنامج           │
└─────────────────────────────────────┘
```

### النسخة الرسومية (GUI)
![القائمة الرئيسية - GUI](https://github.com/SalehGNUTUX/GMD/blob/main/screenshot/gmd-gui-main-menu-ar.png)

---

## 🛠️ الأوامر المتاحة (للنسخة الطرفية)

| الأمر | الوصف |
|-------|-------|
| `gmd` | تشغيل البرنامج |
| `gmd --install` | تثبيت وتشغيل فوري |
| `gmd --install-desktop` | تثبيت مع أيقونة سطح المكتب |
| `gmd --update` | تحديث البرنامج |
| `gmd --clean-uninstall` | إلغاء تثبيت كامل |

---

## 📦 روابط التحميل المباشرة

| الإصدار | الرابط |
|---------|--------|
| **جميع الإصدارات** | [صفحة الإصدارات](https://github.com/SalehGNUTUX/GMD/releases/tag/GMD_1.92_Media_Downloader) |
| **GMD-GUI (رسومية)** | [تحميل AppImage](https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD-GUI_GNU_Media_Downloader-x86_64.AppImage) |
| **GMD-CLI (طرفية)** | [تحميل AppImage](https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD_CLI_Media_Downloader-x86_64.AppImage) |

---

## 💡 متى تستخدم أي نسخة؟

### استخدم النسخة الرسومية (GMD-GUI) إذا:
- أنت مستخدم عادي تفضل الواجهات الرسومية
- لا تريد التعامل مع سطر الأوامر
- تفضل النوافذ والقوائم المنبثقة

### استخدم النسخة الطرفية (GMD-CLI) إذا:
- أنت مطور أو مستخدم متقدم
- تريد دمج البرنامج في سكريبتات
- تعمل على خوادم بدون واجهة رسومية
- تفضل السرعة والمرونة

---

## 📁 هيكل الملفات (بعد التثبيت)

```
~/.local/bin/gmd                              # النسخة الطرفية
~/.local/bin/gmd-gui                           # النسخة الرسومية (إذا ثبتت)
~/.local/bin/yt-dlp                           # أداة التنزيل
~/.local/share/applications/gmd.desktop       # اختصار النسخة الطرفية
~/.local/share/applications/gmd-gui.desktop   # اختصار النسخة الرسومية
~/.local/share/icons/hicolor/.../gmd-icon.png # الأيقونة
```

---

## 🎯 ملخص الإصدار 1.92

| الميزة | GMD-CLI (طرفية) | GMD-GUI (رسومية) |
|--------|-----------------|-------------------|
| واجهة المستخدم | نصية (طرفية) | رسومية (Zenity) |
| يعمل بدون X11 | ✅ نعم | ❌ لا (يحتاج واجهة رسومية) |
| مناسب للخوادم | ✅ نعم | ❌ لا |
| سهل للمبتدئين | ⚠ متوسط | ✅ سهل جداً |
| AppImage متوفر | ✅ نعم | ✅ نعم |
| قص الوسائط | ✅ نعم | ✅ نعم |
| معلومات الوسائط | ✅ نعم | ✅ نعم |
| تنزيل وتحويل | ✅ نعم | ✅ نعم |

---

## 🌟 جربه الآن!

### للنسخة الرسومية (موصى بها للمستخدمين الجدد):
```bash
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
chmod +x GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
./GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
```

### للنسخة الطرفية (للمستخدمين المتقدمين):
```bash
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD_CLI_Media_Downloader-x86_64.AppImage
chmod +x GMD_CLI_Media_Downloader-x86_64.AppImage
./GMD_CLI_Media_Downloader-x86_64.AppImage
```

---

## 📞 معلومات التواصل

- **المستودع**: [github.com/SalehGNUTUX/GMD](https://github.com/SalehGNUTUX/GMD)
- **الإصدارات**: [Releases Page](https://github.com/SalehGNUTUX/GMD/releases)
- **موقع غنوتوكس**: [salehgnutux.github.io/gnutux/](https://salehgnutux.github.io/gnutux/)

**الإصدار 1.92 - نسختان: طرفية للمحترفين ورسومية للجميع!** ✨

---

## 🆕 Version 1.92 - Two Editions: CLI & GUI + AppImage

```
   ____   __  __   ____  
  / ___| |  \/  | |  _ \ 
 | |  _  | |\/| | | | | |
 | |_| | | |  | | | |_| |
  \____| |_|  |_| |____/ 
-------------------------
   GNU MEDIA DOWNLOADER
-------------------------
       » BY GNUTUX «
         » v1.92 «
```

**GMD v1.92** comes in two separate editions:
- **🖥️ CLI Edition** - for commands and scripts
- **🎨 GUI Edition** - graphical user interface based on Zenity

<img width="256" height="256" alt="GMD Icon" src="https://github.com/SalehGNUTUX/GMD/blob/main/GMD%20APPIAMGE%20BIULD/gmd-icon.png?raw=true" />

---

## 📸 Screenshots

### Graphical Edition (GMD-GUI)

| العربية | English |
|---------|---------|
| ![القائمة الرئيسية - عربي](https://github.com/SalehGNUTUX/GMD/blob/main/screenshot/gmd-gui-main-menu-ar.png) | ![Main Menu - English](https://github.com/SalehGNUTUX/GMD/blob/main/screenshot/gmd-gui-main-menu-en.png) |

---

## 📦 Download AppImage (Run instantly without installation)

### GUI Edition - Recommended for regular users

**Direct download and run**
```bash
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
chmod +x GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
./GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
```

### CLI Edition - For developers and advanced users

**Direct download and run**
```bash
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD_CLI_Media_Downloader-x86_64.AppImage
chmod +x GMD_CLI_Media_Downloader-x86_64.AppImage
./GMD_CLI_Media_Downloader-x86_64.AppImage
```

---

## ✨ Features of v1.92

### 🖥️ **Two Separate Editions**
- **GMD-CLI**: Classic terminal edition (works in any terminal)
- **GMD-GUI**: Modern graphical edition with Zenity interface (easier for regular users)

### 📦 **AppImage Packages**
- **Run instantly** without installation
- **Compatible with all Linux distributions**
- **Small size** and portable

### 🚀 **Instant Launch After Installation (CLI Edition)**
- No manual commands needed after installation
- Launches automatically right after installation

### 🔙 **Cancel & Back Option at Every Step**
- Every submenu has option `0` for immediate return
- Bilingual support (Arabic/English)

### ✂️ **Trim Video & Audio**
- Trim directly from URL without downloading the full file
- Trim existing local files

### 📋 **Media Info**
- View video details before downloading (title, duration, quality, views)

---

## 🚀 Installation & Running Methods

### Method 1: Using AppImage (Easiest & Fastest)

**For GUI Edition**
```bash
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
chmod +x GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
./GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
```

**For CLI Edition**
```bash
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD_CLI_Media_Downloader-x86_64.AppImage
chmod +x GMD_CLI_Media_Downloader-x86_64.AppImage
./GMD_CLI_Media_Downloader-x86_64.AppImage
```

### Method 2: Adding GMD to Application Menu Using GEARLEVER

**Gearlever** is a great Flatpak application that allows you to integrate AppImage applications into your system's application menu.

#### Step 1: Install Gearlever
```bash
flatpak install flathub it.mijorus.gearlever
```

#### Step 2: Run Gearlever
```bash
flatpak run it.mijorus.gearlever
```
Or search for "Gearlever" in your application menu and run it.

#### Step 3: Add GMD to Gearlever

**Method (A) - Drag and Drop (Easiest):**
1. **Open Gearlever**
2. **Drag the AppImage file** (GMD-GUI or GMD-CLI) and drop it into the Gearlever window
3. **Click "Integrate"** to integrate the application into your system

**Method (B) - Via "Add AppImage" Button:**
1. **Open Gearlever**
2. **Click the "Add AppImage" button** (➕)
3. **Select the AppImage file** you want to add
4. **Click "Integrate"**

#### Step 4: Enjoy!
After integration, you'll find GMD in your system's application menu:
- 📱 **GNOME**: Press Super (Windows) key and search for "GMD"
- 🐧 **KDE**: Search in the application menu
- 🖥️ **XFCE**: You'll find it in Applications → Utilities

### Method 3: Full Installation for CLI Edition
```bash
bash <(curl -sL "https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd") --install-desktop
```

### Method 4: Try Directly Without Installation

**For CLI Edition**
```bash
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd)
```

**For GUI Edition (Zenity must be installed)**
```bash
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd-gui.sh)
```

---

## 📋 Main Menus

### CLI Edition
```
┌─────────────────────────────────────┐
│       GMD - v1.92 (CLI)            │
│    GNU MEDIA DOWNLOADER             │
├─────────────────────────────────────┤
│  ⬇️  1) Download Video              │
│  🎵  2) Download Audio              │
│  🧠  3) Download & Convert Direct   │
│  🔄  4) Convert Media               │
│  ⚡  5) Extra Download Options      │
│  ✂️  6) Trim Video/Audio            │
│  📋  7) Media Info                  │
│  ⚙️  8) Settings                    │
├─────────────────────────────────────┤
│  🚪  0) Exit Program                │
└─────────────────────────────────────┘
```

### GUI Edition
![Main Menu - GUI](https://github.com/SalehGNUTUX/GMD/blob/main/screenshot/gmd-gui-main-menu-en.png)

---

## 🛠️ Available Commands (For CLI Edition)

| Command | Description |
|---------|-------------|
| `gmd` | Run the program |
| `gmd --install` | Install and launch instantly |
| `gmd --install-desktop` | Install with desktop icon |
| `gmd --update` | Update the program |
| `gmd --clean-uninstall` | Complete uninstall |

---

## 📦 Direct Download Links

| Edition | Link |
|---------|------|
| **All Releases** | [Releases Page](https://github.com/SalehGNUTUX/GMD/releases/tag/GMD_1.92_Media_Downloader) |
| **GMD-GUI (Graphical)** | [Download AppImage](https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD-GUI_GNU_Media_Downloader-x86_64.AppImage) |
| **GMD-CLI (Terminal)** | [Download AppImage](https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD_CLI_Media_Downloader-x86_64.AppImage) |

---

## 💡 When to Use Which Edition?

### Use the Graphical Edition (GMD-GUI) if:
- You're a regular user who prefers graphical interfaces
- You don't want to deal with the command line
- You prefer windows and popup menus

### Use the Terminal Edition (GMD-CLI) if:
- You're a developer or advanced user
- You want to integrate the program into scripts
- You work on servers without a graphical interface
- You prefer speed and flexibility

---

## 📁 File Structure (After Installation)

```
~/.local/bin/gmd                              # CLI edition
~/.local/bin/gmd-gui                           # GUI edition (if installed)
~/.local/bin/yt-dlp                           # Download tool
~/.local/share/applications/gmd.desktop       # CLI edition shortcut
~/.local/share/applications/gmd-gui.desktop   # GUI edition shortcut
~/.local/share/icons/hicolor/.../gmd-icon.png # Icon
```

---

## 🎯 v1.92 Summary

| Feature | GMD-CLI (Terminal) | GMD-GUI (Graphical) |
|--------|-----------------|-------------------|
| User Interface | Terminal-based | Graphical (Zenity) |
| Works without X11 | ✅ Yes | ❌ No (needs GUI) |
| Suitable for servers | ✅ Yes | ❌ No |
| Beginner friendly | ⚠ Medium | ✅ Very easy |
| AppImage available | ✅ Yes | ✅ Yes |
| Trim media | ✅ Yes | ✅ Yes |
| Media info | ✅ Yes | ✅ Yes |
| Download & convert | ✅ Yes | ✅ Yes |

---

## 🌟 Try It Now!

### For GUI Edition (Recommended for new users):
```bash
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
chmod +x GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
./GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
```

### For CLI Edition (For advanced users):
```bash
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD_CLI_Media_Downloader-x86_64.AppImage
chmod +x GMD_CLI_Media_Downloader-x86_64.AppImage
./GMD_CLI_Media_Downloader-x86_64.AppImage
```

---

## 📞 Contact Information

- **Repository**: [github.com/SalehGNUTUX/GMD](https://github.com/SalehGNUTUX/GMD)
- **Releases**: [Releases Page](https://github.com/SalehGNUTUX/GMD/releases)
- **Gnutux Site**: [salehgnutux.github.io/gnutux/](https://salehgnutux.github.io/gnutux/)

**Version 1.92 - Two editions: CLI for pros, GUI for everyone!** ✨
