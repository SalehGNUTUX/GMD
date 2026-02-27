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

## 📦 تحميل AppImage (شغّل فوراً بدون تثبيت)

### النسخة الرسومية (GUI) - موصى بها للمستخدمين العاديين

# تحميل وتشغيل مباشر

```bash
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
```
```
chmod +x GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
```
```
./GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
```

### النسخة الطرفية (CLI) - للمطورين والمستخدمين المتقدمين

# تحميل وتشغيل مباشر
```bash
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD_CLI_Media_Downloader-x86_64.AppImage
```
```
chmod +x GMD_CLI_Media_Downloader-x86_64.AppImage
```
```
./GMD_CLI_Media_Downloader-x86_64.AppImage
```

---

## 📸 لقطات الشاشة

### النسخة الرسومية (GMD-GUI)

| العربية | English |
|---------|---------|
| ![القائمة الرئيسية - عربي](https://github.com/SalehGNUTUX/GMD/blob/main/screenshot/gmd-gui-main-menu-ar.png) | ![Main Menu - English](https://github.com/SalehGNUTUX/GMD/blob/main/screenshot/gmd-gui-main-menu-en.png) |

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

# للنسخة الرسومية (GUI)
```
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
```
```
chmod +x GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
```
```
./GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
```

# للنسخة الطرفية (CLI)
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD_CLI_Media_Downloader-x86_64.AppImage
chmod +x GMD_CLI_Media_Downloader-x86_64.AppImage
./GMD_CLI_Media_Downloader-x86_64.AppImage
```

### الطريقة 2: التثبيت عبر Gearlever (Flatpak)
إذا كنت تستخدم **Gearlever** (متوفر عبر Flatpak)، يمكنك إضافة AppImage بسهولة:

1. ثبت Gearlever من Flatpak:
   ```bash
   flatpak install flathub it.mijorus.gearlever
   ```

2. شغل Gearlever واسحب ملف AppImage إليه

3. اختر "Integrate" لإضافة التطبيق إلى قائمة التطبيقات

### الطريقة 3: التثبيت الكامل للنسخة الطرفية (CLI)
```bash
bash <(curl -sL "https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd") --install-desktop
```

### الطريقة 4: تجربة مباشرة دون تثبيت

# للنسخة الطرفية
```
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd)
```
# للنسخة الرسومية (يجب أن يكون Zenity مثبتاً)
```
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
```
```
chmod +x GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
```
```
./GMD-GUI_GNU_Media_Downloader-x86_64.AppImage
```

### للنسخة الطرفية (للمستخدمين المتقدمين):
```bash
wget https://github.com/SalehGNUTUX/GMD/releases/download/GMD_1.92_Media_Downloader/GMD_CLI_Media_Downloader-x86_64.AppImage
```
```
chmod +x GMD_CLI_Media_Downloader-x86_64.AppImage
```
```
./GMD_CLI_Media_Downloader-x86_64.AppImage
```

---

## 📞 معلومات التواصل

- **المستودع**: [github.com/SalehGNUTUX/GMD](https://github.com/SalehGNUTUX/GMD)
- **الإصدارات**: [Releases Page](https://github.com/SalehGNUTUX/GMD/releases)
- **موقع غنوتوكس**: [salehgnutux.github.io/gnutux/](https://salehgnutux.github.io/gnutux/)

**الإصدار 1.92 - نسختان: طرفية للمحترفين ورسومية للجميع!** ✨
