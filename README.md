# GMD - GNU Media Downloader

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
         » v1.9 «
```

**GMD** هو برنامج حر ومفتوح المصدر لتحميل وتحويل الوسائط من الإنترنت بسهولة ومرونة وبواجهة عربية وإنجليزية، ويعمل بسطر الأوامر أو واجهة رسومية خفيفة.

<img width="256" height="256" alt="GMD Icon" src="https://github.com/SalehGNUTUX/GMD/blob/main/GMD%20APPIAMGE%20BIULD/GMD.AppDir/usr/share/icons/hicolor/256x256/apps/gmd-icon.png?raw=true" />

## 🎨 المميزات الرئيسية

### 📥 تحميل متقدم
- تحميل الفيديوهات والصوتيات من +1000 موقع (YouTube، SoundCloud، Vimeo، وغيرها)
- اختيار جودة الفيديو والصوت والصيغة قبل التحميل
- دعم القوائم التشغيل الكاملة والمقاطع من القنوات
- حفظ الملفات بأسماء واضحة تشمل العنوان وID المقطع

### 🔄 تحويل ذكي
- تحويل ملفات الوسائط بين الصيغ المختلفة (mp3, mp4, ogg, mkv, webm, wav, flac...)
- دعم ترميزات حديثة لضغط الحجم (HEVC/x265، Opus، VP9...)
- تحسين حجم الملفات مع الحفاظ على الجودة

### 🎯 واجهة مستخدم محسنة
- **واجهة تفاعلية** مع أيقونات تعبيرية واضحة
- **قوائم منظمة** بتصميم مربعات أنيق
- دعم **اللغة العربية والإنجليزية** بشكل كامل
- تدفق عمل تسلسلي منطقي وسهل

### ⚡ أداء متكامل
- تثبيت واختصار سطح مكتب تلقائي
- إدارة التبعيات تلقائياً وتحديث ذاتي
- اكتشاف ذكي للأدوات المثبتة مسبقاً
- معالجة أخطاء محسنة

## 🚀 التثبيت الفوري

### الطريقة 1: التشغيل المباشر (بدون تثبيت)
```bash
bash <(curl -sL "https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/GMD%20APPIAMGE%20BIULD/GMD.AppDir/usr/bin/gmd")
```

### الطريقة 2: التثبيت الدائم
```bash
curl -sL "https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/GMD%20APPIAMGE%20BIULD/GMD.AppDir/usr/bin/gmd" | bash -s -- --install
```

أو باستخدام wget:
```bash
wget -O - https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/GMD%20APPIAMGE%20BIULD/GMD.AppDir/usr/bin/gmd | bash -s -- --install
```

### بعد التثبيت:
```bash
gmd
```

### للتحديث:
```bash
gmd --update
```

## 🆕 ما الجديد في v1.9؟

### ✨ واجهة مستخدم محسنة تماماً
- **تصميم جديد** للقوائم باستخدام مربعات منظمة
- **محاذاة مثالية** للنصوص العربية والإنجليزية
- **أيقونات معبرة** لكل خيار مع تخطيط متسق

### 🎯 القائمة الرئيسية الجديدة
```
┌─────────────────────────────────────┐
│          GMD - v1.9                 │
│    منزل وسائط جنو                  │
├─────────────────────────────────────┤
│  ⬇️  1) تنزيل فيديو             │
│  🎵  2) تنزيل صوت                 │
│  🔄  3) تحويل وسائط             │
│  ⚡  4) خيارات تنزيل أخرى        │
│  ⚙️  5) إعدادات                 │
│  📁  6) تثبيت اختصار سطح المكتب│
│  🚪  0) خروج                     │
└─────────────────────────────────────┘
```

### 🔄 تدفق عمل محسن
- **عملية تسلسلية منطقية** لكل مهمة
- **تقليل عدد الخطوات** للعمليات الأساسية
- **واجهات رسومية** محسنة مع zenity
- **خيارات متقدمة** منظمة في قوائم فرعية

### 🌍 ميزات جديدة
- **خيارات تنزيل متقدمة**: قوائم تشغيل، قنوات، ترجمات، صور مصغرة
- **إعدادات شاملة**: تحديث، لغة، إلغاء تثبيت
- **دعم موسع** للصيغ والجودة

## 📖 كيفية الاستخدام

### 1. 🎬 تشغيل البرنامج
```bash
gmd
```

### 2. ⬇️ تحميل الفيديوهات
- اختر الخيار `1` من القائمة الرئيسية
- أدخل رابط الفيديو (تلقائي عبر واجهة رسومية إن أمكن)
- اختر الجودة المناسبة (عالية، متوسطة، منخفضة)
- اختر مجلد الحفظ
- اترك البرنامج يقوم بالباقي!

### 3. 🎵 تحميل الصوتيات
- اختر الخيار `2` من القائمة الرئيسية  
- أدخل رابط الصوت
- اختر صيغة الصوت (mp3, m4a, ogg, etc.)
- اختر مجلد الحفظ
- احصل على ملفك الصوتي

### 4. 🔄 تحويل الوسائط
- اختر الخيار `3` من القائمة الرئيسية
- حدد الملف المراد تحويله (تلقائي عبر واجهة رسومية)
- اختر الصيغة المطلوبة (MP3, MP4, WebM, etc.)
- اختر مجلد الحفظ
- احصل على ملفك المحول بجودة عالية

### 5. ⚡ خيارات تنزيل أخرى
- تنزيل قوائم التشغيل الكاملة
- تنزيل مقاطع من القنوات
- تنزيل الترجمات فقط
- تنزيل الصور المصغرة فقط

### 6. 🌐 تغيير اللغة
- اختر الخيار `5` ثم `1` للتبديل بين العربية والإنجليزية
- التغيير فوري دون الحاجة لإعادة التشغيل

## 🗑️ إلغاء التثبيت

### الطريقة 1: من خلال البرنامج
1. شغّل البرنامج واختر `5` ثم `4` للإعدادات وإلغاء التثبيت
2. أكّد العملية عند سؤالك
3. اختر ما إذا كنت تريد إزالة yt-dlp أو الاحتفاظ بها

### الطريقة 2: سكربت مباشر
```bash
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/uninstall)
```

## 📦 نسخة AppImage (الطريقة التقليدية)

### تنزيل وتشغيل AppImage
1. انتقل إلى صفحة [الإصدارات](https://github.com/SalehGNUTUX/GMD/releases/tag/Gnu_Media_downloader)
2. حمّل ملف AppImage المناسب
3. اجعل الملف قابلاً للتنفيذ:
```bash
chmod +x GMD*.AppImage
```
4. شغّل البرنامج:
```bash
./GMD*.AppImage
```

## 🛠️ المتطلبات

- نظام Linux (توزيعات حديثة)
- yt-dlp (يتم تثبيته تلقائيًا)
- ffmpeg (يتم التحقق منه تلقائيًا)
- zenity (للواجهات الرسومية)
- curl أو wget (للتثبيت والتحميل)

## 🤝 المساهمة

نرحب بمساهماتكم! يمكنك:
- فتح [Issue](https://github.com/SalehGNUTUX/GMD/issues) للإبلاغ عن مشاكل
- إرسال [Pull Request](https://github.com/SalehGNUTUX/GMD/pulls) للتحسينات
- مشاركة التغذية الراجعة والتجارب
- دعم المشروع بـ ⭐ على GitHub

## 🌟 مشاريع غنوتوكس أخرى

**اكتشف المزيد من مشاريع غنوتوكس المميزة:**  
📂 [https://salehgnutux.github.io/gnutux/](https://salehgnutux.github.io/gnutux/)

## 📄 الترخيص

GMD مرخص تحت رخصة GPL V2.0. راجع ملف [LICENSE](https://github.com/SalehGNUTUX/GMD/blob/main/LICENSE) للمزيد.

## 📞 التواصل

- المستودع على GitHub: [https://github.com/SalehGNUTUX/GMD](https://github.com/SalehGNUTUX/GMD)
- صفحة الإصدارات: [https://github.com/SalehGNUTUX/GMD/releases/tag/Gnu_Media_downloader](https://github.com/SalehGNUTUX/GMD/releases/tag/Gnu_Media_downloader)
- موقع مشاريع غنوتوكس: [https://salehgnutux.github.io/gnutux/](https://salehgnutux.github.io/gnutux/)

---

## 🎉 ابدأ الآن!

```bash
# جرب الإصدار الجديد الآن!
bash <(curl -sL "https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/GMD%20APPIAMGE%20BIULD/GMD.AppDir/usr/bin/gmd")
```

**GMD v1.9 - تجربة مستخدم استثنائية مع تدفق عمل محسن!** 🚀

---
# GMD - GNU Media Downloader

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
         » v1.9 «
```

**GMD** is a free and open-source program for downloading and converting media from the internet with ease and flexibility, featuring Arabic and English interfaces, and working via command line or lightweight graphical interface.

<img width="256" height="256" alt="GMD Icon" src="https://github.com/SalehGNUTUX/GMD/blob/main/GMD%20APPIAMGE%20BIULD/GMD.AppDir/usr/share/icons/hicolor/256x256/apps/gmd-icon.png?raw=true" />

## 🎨 Key Features

### 📥 Advanced Downloading
- Download videos and audio from +1000 sites (YouTube, SoundCloud, Vimeo, and more)
- Choose video quality, audio quality, and format before downloading
- Support for complete playlists and channel downloads
- Save files with clear names including title and video ID

### 🔄 Smart Conversion
- Convert media files between different formats (mp3, mp4, ogg, mkv, webm, wav, flac...)
- Support for modern encoding for size compression (HEVC/x265, Opus, VP9...)
- Optimize file sizes while maintaining quality

### 🎯 Enhanced User Interface
- **Interactive interface** with clear emoji icons
- **Organized box-style menus** with beautiful design
- Full support for **Arabic and English** languages
- Logical sequential workflow

### ⚡ Comprehensive Performance
- Automatic installation and desktop shortcut
- Automatic dependency management and self-updating
- Smart detection of pre-installed tools
- Improved error handling

## 🚀 Instant Installation

### Method 1: Direct Run (Without Installation)
```bash
bash <(curl -sL "https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/GMD%20APPIAMGE%20BIULD/GMD.AppDir/usr/bin/gmd")
```

### Method 2: Permanent Installation
```bash
curl -sL "https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/GMD%20APPIAMGE%20BIULD/GMD.AppDir/usr/bin/gmd" | bash -s -- --install
```

Or using wget:
```bash
wget -O - https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/GMD%20APPIAMGE%20BIULD/GMD.AppDir/usr/bin/gmd | bash -s -- --install
```

### After Installation:
```bash
gmd
```

### For Updates:
```bash
gmd --update
```

## 🆕 What's New in v1.9?

### ✨ Completely Enhanced User Interface
- **New design** with organized box-style menus
- **Perfect alignment** for Arabic and English texts
- **Expressive icons** for each option with consistent layout

### 🎯 New Main Menu
```
┌─────────────────────────────────────┐
│          GMD - v1.9                 │
│    GNU MEDIA DOWNLOADER             │
├─────────────────────────────────────┤
│  ⬇️  1) Download Video         │
│  🎵  2) Download Audio           │
│  🔄  3) Convert Media          │
│  ⚡  4) Extra Download Options   │
│  ⚙️  5) Settings              │
│  📁  6) Install Desktop Shortcut│
│  🚪  0) Exit                     │
└─────────────────────────────────────┘
```

### 🔄 Improved Workflow
- **Logical sequential process** for each task
- **Reduced number of steps** for basic operations
- **Enhanced graphical interfaces** with zenity
- **Advanced options** organized in sub-menus

### 🌍 New Features
- **Advanced download options**: playlists, channels, subtitles, thumbnails
- **Comprehensive settings**: updates, language, uninstallation
- **Extended support** for formats and quality

## 📖 How to Use

### 1. 🎬 Run the Program
```bash
gmd
```

### 2. ⬇️ Download Videos
- Select option `1` from main menu
- Enter video URL (automatically via GUI if available)
- Choose suitable quality (high, medium, low)
- Choose save folder
- Let the program do the rest!

### 3. 🎵 Download Audio
- Select option `2` from main menu
- Enter audio URL
- Choose audio format (mp3, m4a, ogg, etc.)
- Choose save folder
- Get your audio file

### 4. 🔄 Convert Media
- Select option `3` from main menu
- Choose file to convert (automatically via GUI)
- Select desired format (MP3, MP4, WebM, etc.)
- Choose save folder
- Get your converted file with high quality

### 5. ⚡ Extra Download Options
- Download complete playlists
- Download videos from channels
- Download subtitles only
- Download thumbnails only

### 6. 🌐 Change Language
- Select option `5` then `1` to switch between Arabic and English
- Change is instant without needing to restart

## 🗑️ Uninstallation

### Method 1: Through the Program
1. Run the program and select `5` then `4` for settings and uninstall
2. Confirm the operation when prompted
3. Choose whether to remove yt-dlp or keep it

### Method 2: Direct Script
```bash
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/uninstall)
```

## 📦 AppImage Version (Traditional Method)

### Download and Run AppImage
1. Go to [Releases page](https://github.com/SalehGNUTUX/GMD/releases/tag/Gnu_Media_downloader)
2. Download suitable AppImage file
3. Make the file executable:
```bash
chmod +x GMD*.AppImage
```
4. Run the program:
```bash
./GMD*.AppImage
```

## 🛠️ Requirements

- Linux system (modern distributions)
- yt-dlp (installed automatically)
- ffmpeg (checked automatically)
- zenity (for graphical interfaces)
- curl or wget (for installation and download)

## 🤝 Contributing

We welcome your contributions! You can:
- Open an [Issue](https://github.com/SalehGNUTUX/GMD/issues) to report problems
- Submit a [Pull Request](https://github.com/SalehGNUTUX/GMD/pulls) for improvements
- Share feedback and experiences
- Support the project with ⭐ on GitHub

## 🌟 Other Gnutux Projects

**Discover more amazing Gnutux projects:**  
📂 [https://salehgnutux.github.io/gnutux/](https://salehgnutux.github.io/gnutux/)

## 📄 License

GMD is licensed under GPL V2.0 license. See [LICENSE](https://github.com/SalehGNUTUX/GMD/blob/main/LICENSE) file for more.

## 📞 Contact

- GitHub Repository: [https://github.com/SalehGNUTUX/GMD](https://github.com/SalehGNUTUX/GMD)
- Releases Page: [https://github.com/SalehGNUTUX/GMD/releases/tag/Gnu_Media_downloader](https://github.com/SalehGNUTUX/GMD/releases/tag/Gnu_Media_downloader)
- Gnutux Projects Site: [https://salehgnutux.github.io/gnutux/](https://salehgnutux.github.io/gnutux/)

---

## 🎉 Get Started Now!

```bash
# Try the new version now!
bash <(curl -sL "https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/GMD%20APPIAMGE%20BIULD/GMD.AppDir/usr/bin/gmd")
```

**GMD v1.9 - Exceptional user experience with improved workflow!** 🚀
