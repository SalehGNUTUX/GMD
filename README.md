<div dir="rtl">

# GMD — منزّل وسائط غنو

**GNU Media Downloader** — واجهة رسومية حديثة لتنزيل وتحويل الوسائط على غنو/لينكس.  
مبنية بـ **Electron 28 + React 18 + Tailwind CSS 3** مع دعم كامل للعربية والإنجليزية.

<div align="center">

![الإصدار](https://img.shields.io/badge/إصدار-26.05.0-red)
![الترخيص](https://img.shields.io/badge/ترخيص-GPL%20v3-blue)
![المنصة](https://img.shields.io/badge/منصة-غنو%2Fلينكس-green)
![المطور](https://img.shields.io/badge/المطور-GNUTUX-orange)

</div>

---

## 📑 جدول المحتويات

- [📸 لقطات الشاشة](#-لقطات-الشاشة)
- [✨ المميزات](#-المميزات)
- [📦 متطلبات النظام](#-متطلبات-النظام)
- [🚀 التشغيل والتطوير](#-التشغيل-والتطوير)
- [🏗️ البناء والتحزيم](#️-البناء-والتحزيم)
- [📥 تنزيل الحزم الجاهزة](#-تنزيل-الحزم-الجاهزة)
- [🏛️ البنية التقنية](#️-البنية-التقنية)
- [⌨️ الاختصارات والتقنيات](#️-الاختصارات-والتقنيات)
- [📄 الترخيص](#-الترخيص)

---

## 📸 لقطات الشاشة

### النسخة الحديثة (GMD-GUI v26.05 — React)

| العربية | English |
|---------|---------|
| ![القائمة الرئيسية - عربي](screenshots-26.05/القائمة%20الرئيسية-العربية.png) | ![Main Menu - English](screenshots-26.05/القائمة%20الرئيسية-الإنجليزية.png) |

### النسخة القديمة (GMD v1.92 — Zenity)

| العربية | English |
|---------|---------|
| ![القائمة الرئيسية - عربي](https://github.com/SalehGNUTUX/GMD/blob/main/screenshot/gmd-gui-main-menu-ar.png) | ![Main Menu - English](https://github.com/SalehGNUTUX/GMD/blob/main/screenshot/gmd-gui-main-menu-en.png) |

---

## ✨ المميزات

### تنزيل الوسائط
| الميزة | التفاصيل |
|--------|-----------|
| 📹 **تنزيل فيديو** | اختيار الجودة: أفضل متاحة، 1080p، 720p، 480p |
| 🎵 **تنزيل صوت** | صيغ: MP3، M4A، OGG، OPUS، FLAC، WAV |
| 🧠 **تنزيل وتحويل** | تنزيل وتحويل مباشر إلى أي صيغة |
| ⚡ **خيارات إضافية** | قوائم تشغيل · قنوات · ترجمات · صور مصغرة · تنزيل شامل · روابط مباشرة بـ wget/aria2c |

### معالجة الملفات المحلية
| الميزة | التفاصيل |
|--------|-----------|
| 🔄 **تحويل ملفات** | فيديو · صوت · صور (JPG، PNG، WebP، GIF، BMP) — دفعة واحدة أو عدة ملفات |
| ✂️ **قص وسائط** | تقطيع دقيق من رابط أو ملف محلي مع معاينة فيديو/صوت ومؤقت تفاعلي |
| 📋 **معلومات الوسائط** | عرض تفاصيل الفيديو قبل التنزيل (العنوان، المدة، الجودة، الصيغة) |

### الإعدادات والتخصيص
- 🌐 تبديل اللغة: عربي (RTL) ↔ إنجليزي (LTR)
- 🔤 اختيار الخط: **Noto Sans Arabic** أو **Ubuntu Arabic** مع معاينة فورية
- 📁 مجلدات حفظ افتراضية لكل نوع (فيديو، صوت، مستندات، تنزيلات)
- ⚙️ ترميزات متقدمة عند تحويل الملفات
- 🔧 إدارة الاعتماديات: تثبيت wget/aria2c، تحديث yt-dlp مع عرض رقم الإصدار
- 🖥️ إصلاح أيقونة سطح المكتب، إلغاء التثبيت الكامل

### واجهة المستخدم
- 🎨 ثيم داكن مع تأثيرات زجاجية ورسوم متحركة سلسة (framer-motion)
- 🖱️ تحكم مخصص بنافذة التطبيق (Frame-less window)
- 📊 شريط تقدم مباشر أثناء التنزيل مع إمكانية الإلغاء

---

## 📦 متطلبات النظام

| المتطلب | الحد الأدنى | الملاحظة |
|---------|------------|---------|
| **Node.js** | 18+ | للتطوير والبناء |
| **yt-dlp** | آخر إصدار | `~/.local/bin/yt-dlp` — يُثبَّت من الإعدادات |
| **ffmpeg** | أي إصدار | مطلوب للتحويل والقص |
| **wget** أو **aria2c** | اختياري | للتنزيل المباشر من روابط |

---

## 🚀 التشغيل والتطوير

```bash
# تثبيت التبعيات
npm install

# تشغيل وضع التطوير (Vite فقط)
npm run dev

# تشغيل مع Electron
npm run electron:dev

# بناء الإنتاج
npm run build
```

---

## 🏗️ البناء والتحزيم

### باستخدام npm

```bash
# بناء جميع الحزم (AppImage + DEB + RPM)
npm run electron:build

# بناء هدف محدد
npx electron-builder --linux AppImage
npx electron-builder --linux deb
npx electron-builder --linux rpm
```

### باستخدام سكريبتات البناء

```bash
# بناء شامل (AppImage + DEB + RPM)
./build-scripts/build.sh

# بناء AppImage فقط
./build-scripts/build-appimage.sh

# بناء DEB فقط
./build-scripts/build-deb.sh

# بناء RPM (يتراجع لـ alien تلقائياً على Debian/Ubuntu)
./build-scripts/build-rpm.sh
```

> **ملاحظة RPM**: على أنظمة Debian/Ubuntu يلزم تثبيت `alien rpm` مسبقاً:
> ```bash
> sudo apt install alien rpm
> ```

### مخرجات البناء

الحزم تُوضع في مجلد `dist-electron/`:
```
dist-electron/
├── GMD-26.5.0.AppImage
├── gmd_26.5.0_amd64.deb
└── gmd-26.5.0.x86_64.rpm
```

---

## 📥 تنزيل الحزم الجاهزة

### الإصدار 26.05.0 (النسخة الحديثة)

| الحزمة | الرابط | الحجم | SHA256 |
|--------|--------|-------|--------|
| 🐧 **AppImage** | [GMD-26.5.0.AppImage](https://github.com/SalehGNUTUX/GMD/releases/download/GMD-26.05/GMD-26.5.0.AppImage) | 105 MB | `bfb8386cb3bca6a547a092c2d11de3bc6f5e8a526b59a52e0a83ff5f18b0cd2c` |
| 🐧 **DEB** | [GMD-26.5.0.deb](https://github.com/SalehGNUTUX/GMD/releases/download/GMD-26.05/GMD-26.5.0.deb) | 71.1 MB | `f0d586deac8257aba29badea1ada61de973cd53c4c65b0e3d1e7d91219a197ab` |
| 🐧 **RPM** | [GMD-26.5.0.rpm](https://github.com/SalehGNUTUX/GMD/releases/download/GMD-26.05/GMD-26.5.0.rpm) | 103 MB | `8c637b0848d427099188b60fc96fa0cc391f2aea96d8b514b203571c5c41a68d` |

### الإصدار 1.92 (النسخة القديمة — Zenity)

| الإصدار | الرابط |
|---------|--------|
| **GMD-GUI (النسخة الرسومية)** | [تحميل AppImage](https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD-GUI_GNU_Media_Downloader-x86_64.AppImage) |
| **GMD-CLI (النسخة الطرفية)** | [تحميل AppImage](https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD_CLI_Media_Downloader-x86_64.AppImage) |

#### طرق تثبيت وتشغيل النسخة القديمة (v1.92)

**الطريقة 1: استخدام AppImage (التشغيل المباشر)**

```bash
# للنسخة الرسومية (GUI)
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
chmod +x GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
./GMD-GUI_GNU_Media_Downloader-x86_64.AppImage

# للنسخة الطرفية (CLI)
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD_CLI_Media_Downloader-x86_64.AppImage
chmod +x GMD_CLI_Media_Downloader-x86_64.AppImage
./GMD_CLI_Media_Downloader-x86_64.AppImage
```

**الطريقة 2: إضافة GMD إلى قائمة التطبيقات باستخدام Gearlever**

```bash
# تثبيت Gearlever
flatpak install flathub it.mijorus.gearlever

# تشغيل Gearlever
flatpak run it.mijorus.gearlever
```
ثم اسحب ملف AppImage وأفلته في نافذة Gearlever واضغط "Integrate".

**الطريقة 3: التثبيت الكامل للنسخة الطرفية (CLI)**

```bash
bash <(curl -sL "https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd") --install-desktop
```

**الطريقة 4: تجربة مباشرة دون تثبيت**

```bash
# للنسخة الطرفية
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd)

# للنسخة الرسومية (يجب أن يكون Zenity مثبتاً)
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd-gui.sh)
```

#### متى تستخدم أي نسخة قديمة؟

| استخدم GMD-GUI (الرسومية) إذا: | استخدم GMD-CLI (الطرفية) إذا: |
|-------------------------------|------------------------------|
| تفضل الواجهات الرسومية | أنت مطور أو مستخدم متقدم |
| لا تريد التعامل مع سطر الأوامر | تريد دمج البرنامج في سكريبتات |
| تفضل النوافذ والقوائم المنبثقة | تعمل على خوادم بدون واجهة رسومية |

---

## 🏛️ البنية التقنية

```
gmd-gui-react-v26.05/
├── electron/
│   ├── main.js          # العملية الرئيسية — كل عمليات النظام
│   └── preload.js       # جسر IPC بين Electron وReact
├── src/
│   ├── App.jsx          # جذر التطبيق، التوجيه بين الشاشات
│   ├── components/
│   │   ├── MainMenu.jsx       # القائمة الرئيسية
│   │   ├── DownloadVideo.jsx  # تنزيل فيديو
│   │   ├── DownloadAudio.jsx  # تنزيل صوت
│   │   ├── DownloadConvert.jsx # تنزيل وتحويل
│   │   ├── ConvertLocal.jsx   # تحويل ملفات محلية
│   │   ├── ExtraOptions.jsx   # خيارات إضافية
│   │   ├── ClipMedia.jsx      # قص وسائط
│   │   ├── MediaInfo.jsx      # معلومات الوسائط
│   │   └── Settings.jsx       # الإعدادات
│   ├── locales/
│   │   ├── ar.json      # الترجمة العربية (الافتراضية)
│   │   └── en.json      # الترجمة الإنجليزية
│   └── index.css        # التنسيقات العامة والخطوط
├── fonts/               # خطوط مدمجة
│   ├── NotoSansArabic-Regular.ttf
│   ├── NotoSansArabic.ttf
│   ├── Ubuntu Arabic Regular.otf
│   └── Ubuntu Arabic Bold.ttf
├── build-scripts/       # سكريبتات البناء
└── public/
    └── gmd-icon.png     # أيقونة التطبيق
```

### بروتوكولات مخصصة (في التطبيق المحزَّم)
- **`app://localhost/`** — يخدم ملفات `dist/` بديلاً عن `file://` المحظور في Electron v28
- **`media://`** — يخدم ملفات الوسائط المحلية للمعاينة داخل التطبيق

### تدفق البيانات
- **أوامر الصدفة** (yt-dlp, ffmpeg): `App.jsx` → IPC `run-command` → `spawn('bash')` في `main.js`، المخرجات تُبثّ عبر `command-output`/`command-done`
- **نوافذ الحوار**: تمر عبر `showDialog()` في `main.js` مع `moveTop()` + `focus()` لضمان ظهورها
- **الإعدادات**: محفوظة في `localStorage` تحت المفتاح `gmd-settings`

---

## ⌨️ الاختصارات والتقنيات

| التقنية | الاستخدام |
|---------|-----------|
| **Electron 28** | إطار التطبيق المكتبي |
| **React 18** | واجهة المستخدم |
| **Vite 5** | أداة البناء |
| **Tailwind CSS 3** | التنسيق |
| **framer-motion** | الرسوم المتحركة |
| **i18next** | الترجمة متعددة اللغات |
| **yt-dlp** | تنزيل الوسائط |
| **ffmpeg / ffprobe** | تحويل الوسائط والمعلومات |

---

## 📄 الترخيص

**GNU General Public License v3.0**

هذا البرنامج برنامج حر ومفتوح المصدر. يمكنك إعادة توزيعه و/أو تعديله وفق شروط رخصة GNU العمومية الإصدار الثالث أو أي إصدار لاحق.

---

<div align="center">

صُنع بـ ❤️ بواسطة **[GNUTUX](https://github.com/SalehGNUTUX)** · 2026  
[مستودع المشروع](https://github.com/SalehGNUTUX/GMD) · [الموقع الإلكتروني](https://salehgnutux.github.io/GMD)

</div>

</div>
```
