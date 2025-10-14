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
         » v1.7 «
```

**GMD** هو برنامج حر ومفتوح المصدر لتحميل وتحويل الوسائط من الإنترنت بسهولة ومرونة وبواجهة عربية وإنجليزية، ويعمل بسطر الأوامر أو واجهة رسومية خفيفة.

<img width="256" height="256" alt="image" src="https://github.com/user-attachments/assets/fd767e1f-3185-4b5d-bb90-afe63a8df49b" />


## المميزات
- تحميل الفيديوهات والصوتيات من مواقع كثيرة (YouTube، SoundCloud، وغيرها).
- اختيار جودة الفيديو والصوت والصيغة قبل التحميل.
- تحويل ملفات الوسائط بين الصيغ المختلفة (mp3, mp4, ogg, mkv, webm...).
- دعم ترميزات حديثة لضغط الحجم (HEVC/x265، Opus...).
- حفظ الملفات بأسماء واضحة تشمل العنوان وID المقطع.
- تثبيت واختصار سطح مكتب تلقائي.
- دعم اللغة العربية والإنجليزية.
- واجهة استخدام سهلة وأيقونات جميلة.
- إدارة التبعيات تلقائياً وتحديث ذاتي.


##🚀 النسخة الجديدة v1.7 - التثبيت الفوري من المستودع!

**GMD** الآن أسهل في التثبيت والاستخدام مع ميزات جديدة محسنة. أدوات تنزيل وتحويل الوسائط على غنو/لينكس بواجهة تفاعلية أنيقة.

---

## ⚡ التثبيت الفوري (طريقة جديدة)

### الطريقة 1: التشغيل المباشر (بدون تثبيت)
```bash
bash <(curl -sL "https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/GMD%20APPIAMGE%20BIULD/GMD.AppDir/usr/bin/gmd")
```

### الطريقة 2: التثبيت الدائم
```bash
curl -sL "https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/GMD%20APPIAMGE%20BIULD/GMD.AppDir/usr/bin/gmd" | bash -s -- --install
```

أو
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

## خطوات إلغاء التثبيت

1. شغّل البرنامج واختَر "إلغاء التثبيت" من القائمة الرئيسية.
2. أكّد العملية عند سؤالك.
3. يمكنك اختيار ما إذا كنت تريد إزالة yt-dlp أيضاً أو الاحتفاظ بها.
4. سيتم إعلامك بكل خطوة أثناء عملية الإزالة.

أو يمكنك تنفيذ السكربت مباشرة:
```bash
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/uninstall)
```
---

## 🆕 ما الجديد في v1.7؟

### ✨ واجهة مستخدم محسنة
- **أيقونات تعبيرية** لكل وظيفة لتجربة استخدام أفضل
- **قوائم عمودية** منظمة بدل الأفقي
- **تنسيق جمالي** محسن مع فواصل واضحة

### 🔄 تحديث تلقائي ذكي
- **اكتشاف التحديثات** تلقائيًا مرة أسبوعيًا
- **تحديث بدون إعادة تثبيت** - البرنامج يحدث نفسه
- **مقارنة ذكية** - لا يحدث إلا إذا كان هناك فرق حقيقي
✅ يكتشف وجود yt-dlp من مستودعات النظام ويخير المستخدم

✅ يعطي خيار إزالة نسخة النظام أو الاحتفاظ بها

✅ يخير المستخدم عند إلغاء التثبيت إذا كان يريد إزالة yt-dlp

✅ يدعم صيغ تحويل جديدة مثل OGG, AVI, MOV

✅ يوفر توصيات للمستخدم حول أفضل الصيغ لكل استخدام

### 🏗️ ميزات تثبيت متقدمة
- **تثبيت اختصار سطح المكتب** من داخل البرنامج
- **إلغاء التثبيت** الكامل بنقرة واحدة
- **إدارة التبعيات** تلقائية

### 🌍 تحسينات متعددة
- **دعم لغوي** محسن (عربي/إنجليزي)
- **معالجة أخطاء** أفضل
- **أوامر تثبيت** مبسطة

---

## 📥 نسخة AppImage (الطريقة التقليدية)

![GMD Logo](https://github.com/SalehGNUTUX/GMD/blob/main/GMD%20APPIAMGE%20BIULD/GMD.AppDir/usr/share/icons/hicolor/256x256/apps/gmd-icon.png?raw=true)

### تنزيل AppImage جاهز

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

---

## 🎯 الميزات الرئيسية

- ✅ **تحميل الفيديوهات** من منصات متعددة (YouTube, Vimeo, etc.)
- 🔄 **تحويل الوسائط** إلى صيغ متعددة (MP4, MP3, MKV, WebM, etc.)
- 🎨 **واجهة تفاعلية** أنيقة وسهلة الاستخدام
- ⚙️ **خيارات متقدمة** للمستخدمين المحترفين
- 🌐 **دعم القوائم التشغيل** الكاملة
- 💾 **حفظ تفضيلات** المستخدم

---

## 📋 المتطلبات

- نظام Linux (توزيعات حديثة)
- yt-dlp (يتم تثبيته تلقائيًا)
- ffmpeg (يتم التحقق منه تلقائيًا)
- zenity (للواجهات الرسومية)
- curl أو wget (للتثبيت والتحميل)

---

## 🎮 كيفية الاستخدام

1. **تشغيل البرنامج** باستخدام أحد أوامر التثبيت أعلاه
2. **اختيار العملية** من القائمة الرئيسية:
   - 📥 تحميل فيديو/صوت
   - 🔄 تحويل ملف وسائط
   - ⚙️ تثبيت اختصار سطح المكتب
   - 🗑️ إلغاء التثبيت

3. **اتباع التعليمات** التفاعلية لكل عملية

---

## 🛠️ بناء من المصدر (للمطورين)

```bash
git clone https://github.com/SalehGNUTUX/GMD.git
cd GMD
# استخدم سكربت البناء لإنشاء AppImage
```

---

## 🤝 المساهمة

نرحب بمساهماتكم! يمكنك:
- فتح [Issue](https://github.com/SalehGNUTUX/GMD/issues) للإبلاغ عن مشاكل
- إرسال [Pull Request](https://github.com/SalehGNUTUX/GMD/pulls) للتحسينات
- مشاركة التغذية الراجعة والتجارب

---

## 📄 الترخيص

GMD مرخص تحت رخصة GPL V2.0. راجع ملف [LICENSE](https://github.com/SalehGNUTUX/GMD/blob/main/LICENSE) للمزيد.

---

## 📞 التواصل

- المستودع على GitHub: [https://github.com/SalehGNUTUX/GMD](https://github.com/SalehGNUTUX/GMD)
- صفحة الإصدارات: [https://github.com/SalehGNUTUX/GMD/releases/tag/Gnu_Media_downloader](https://github.com/SalehGNUTUX/GMD/releases/tag/Gnu_Media_downloader)

---

**شكرًا لاستخدامك GMD - GNU Media Downloader!** 🎉


# GMD

أداة تنزيل الوسائط و تحويلها على غنو/لينكس
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
          » v1.7 «
```


# GMD - GNU Media Downloader

![GMD Logo](https://github.com/SalehGNUTUX/GMD/blob/main/GMD%20APPIAMGE%20BIULD/GMD.AppDir/usr/share/icons/hicolor/256x256/apps/gmd-icon.png?raw=true)

**GMD** هو أداة سهلة وقوية لتحميل وتحويل الفيديوهات والصوتيات من مصادر متعددة باستخدام `yt-dlp` و `ffmpeg`. يقدم واجهة تفاعلية مبسطة تتيح لك تنزيل وتحويل الوسائط بسهولة مع خيارات جاهزة أو مخصصة.

---

## الميزات

- دعم تحميل الفيديوهات من منصات عديدة عبر yt-dlp (YouTube، Vimeo، وغيرها)
- تحويل الوسائط باستخدام ffmpeg إلى صيغ متعددة (MP4, MP3, MKV وغيرها)
- واجهة نصية تفاعلية سهلة الاستخدام في الطرفية
- دعم خيارات مسبقة جاهزة وأخرى مخصصة للمستخدم المتقدم
- دعم تحميل قوائم تشغيل كاملة
- دعم حفظ إعدادات المستخدم

---

## المتطلبات

- نظام Linux (يفضل توزيعات حديثة)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) مثبت ومحدث
- [ffmpeg](https://ffmpeg.org/) مثبت ومحدث
- Bash 4.0 أو أحدث

---

## التثبيت

يمكنك تحميل نسخة AppImage الجاهزة من صفحة الإصدارات أو بناء البرنامج من المصدر.

### تنزيل AppImage جاهز

1. انتقل إلى صفحة [الإصدارات](https://github.com/SalehGNUTUX/GMD/releases/tag/Gnu_Media_downloader)
2. حمّل ملف AppImage المناسب
3. اجعل الملف قابلاً للتنفيذ:
```bash
   chmod +x GMD*.AppImage
````

4. شغّل البرنامج:

   ```bash
   ./GMD*.AppImage
   ```

### بناء من المصدر

1. استنسخ المستودع:

   ```bash
   git clone https://github.com/SalehGNUTUX/GMD.git
   cd GMD
   ```
2. تأكد من تثبيت yt-dlp و ffmpeg
3. شغّل السكربت مباشرة أو استخدم سكربت البناء لبناء AppImage.

---

## الاستخدام

شغل البرنامج وستظهر لك واجهة تفاعلية لاختيار العملية التي تريدها:

* تحميل فيديو أو صوت من رابط
* تحويل الملفات إلى صيغ متعددة
* إعدادات متقدمة

---

## المساهمة

نرحب بمساهماتكم! يمكنك فتح [Issue](https://github.com/SalehGNUTUX/GMD/issues) للإبلاغ عن مشاكل أو اقتراحات، أو إرسال [Pull Request](https://github.com/SalehGNUTUX/GMD/pulls) لتحسين البرنامج.

---

## الترخيص

GMD مرخص تحت رخصة GPL V2.0. راجع ملف [LICENSE](https://github.com/SalehGNUTUX/GMD/blob/main/LICENSE) للمزيد.

---

## التواصل

* المستودع على GitHub: [https://github.com/SalehGNUTUX/GMD](https://github.com/SalehGNUTUX/GMD)
* صفحة الإصدارات: [https://github.com/SalehGNUTUX/GMD/releases/tag/Gnu\_Media\_downloader](https://github.com/SalehGNUTUX/GMD/releases/tag/Gnu_Media_downloader)

---

شكرًا لاستخدامك GMD - GNU Media Downloader!



---
