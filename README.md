# GMD - GNU Media Downloader v1.92

## 🆕 الإصدار 1.92 - تشغيل فوري، تحكم كامل، ميزات جديدة!

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

**GMD v1.92** يأتي بتشغيل فوري بعد التثبيت، خيار العودة في كل مرحلة، ميزة قص الوسائط، وإصلاحات جوهرية في آلية التحديث!

<img width="256" height="256" alt="GMD Icon" src="https://github.com/SalehGNUTUX/GMD/blob/main/GMD%20APPIAMGE%20BIULD/gmd-icon.png?raw=true" />


# ثبت GMD بأمر واحد بسيط وسريع، انسخ والصق في الطرفية.
```bash
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd) --install
```

## ✨ مميزات الإصدار الجديد 1.92

### 🚀 **تشغيل فوري بعد التثبيت**
- **لا حاجة لإدخال أي أمر يدوي** بعد التثبيت
- **يُشغَّل تلقائياً** مباشرة بعد اكتمال التثبيت بـ `exec`
- **إصلاح PATH تلقائي** يضيف `~/.local/bin` لملفات الـ shell
- **تجربة سلسة** من أمر واحد إلى واجهة البرنامج مباشرة

### 🔙 **خيار الإلغاء والعودة في كل مرحلة**
- **كل قائمة فرعية** تحتوي على خيار `0` للعودة الفورية
- **نص واضح ومميز** بفاصل خاص `├───┤` في كل قائمة
- **دعم ثنائي اللغة** عربي وإنجليزي في جميع خيارات الرجوع
- **لا انهيار، لا تعليق** - العودة تعمل في جميع الأوضاع

### ✂️ **قص الفيديو والصوت (جديد)**
- **قص مباشر من رابط** دون تحميل الملف كاملاً أولاً
- **قص ملف موجود** على الجهاز بتحديد وقت البداية والنهاية
- **حفظ القطعة** في أي مجلد تختاره
- **دعم جميع الصيغ** المرئية والصوتية

### 📋 **معلومات الوسائط (جديد)**
- **عرض تفاصيل الفيديو** قبل التنزيل
- **العنوان، المحمّل، المدة، الجودة، الصيغة، عدد المشاهدات**
- **مفيد لمعاينة المحتوى** قبل اتخاذ قرار التنزيل

### 🔄 **إصلاح جوهري لآلية التحديث**
- **تحديث موثوق** من المستودع مباشرة دون انهيار
- **نسخة احتياطية تلقائية** قبل أي تحديث
- **استعادة تلقائية** للنسخة السابقة إن فشل التحديث
- **إعادة تشغيل تلقائية** بعد نجاح التحديث

### 🗑️ **إغلاق تلقائي بعد إلغاء التثبيت**
- **البرنامج يُغلق نفسه** تلقائياً بعد إلغاء التثبيت
- **لا يبقى عالقاً** في الطرفية
- **حذف الملف التنفيذي** في الخلفية بأمان

---

## 📋 القائمة الرئيسية v1.92

```
┌─────────────────────────────────────┐
│          GMD - v1.92               │
│    منزل وسائط جنو                  │
├─────────────────────────────────────┤
│  ⬇️  1) تنزيل فيديو               │
│  🎵  2) تنزيل صوت                  │
│  🧠  3) تنزيل وتحويل مباشر        │
│  🔄  4) تحويل وسائط               │
│  ⚡  5) خيارات تنزيل أخرى          │
│  ✂️  6) قص الفيديو/الصوت          │
│  📋  7) معلومات الوسائط            │
│  ⚙️  8) إعدادات                   │
├─────────────────────────────────────┤
│  🚪  0) ❌ خروج من البرنامج         │
└─────────────────────────────────────┘
```

## 🔙 مثال على خيار الرجوع في القوائم الفرعية

```
┌─────────────────────────────────────┐
│        🎞️  جودة الفيديو            │
├─────────────────────────────────────┤
│  1) عالية (1080p)                   │
│  2) متوسطة (720p)                   │
│  3) منخفضة (480p)                   │
│  4) أفضل جودة متاحة                 │
├─────────────────────────────────────┤
│  🔙 0) ❌ إلغاء والعودة للقائمة     │
└─────────────────────────────────────┘
```

---

## 🚀 التثبيت الفوري

### الطريقة المفضلة: تثبيت كامل مع أيقونة سطح المكتب
```bash
bash <(curl -sL "https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd") --install-desktop
```

### أو تثبيت بدون أيقونة:
```bash
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd) --install
```

> ✅ بعد التثبيت يُشغَّل البرنامج **تلقائياً** دون الحاجة لكتابة `gmd`

### تجربة مباشرة دون تثبيت:
```bash
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd)
```

> ⚠️ التجربة المباشرة تُثبّت `yt-dlp` وأيقونة سطح المكتب — وهي ملفات دائمة تبقى بعد إعادة التشغيل. لإزالة كل شيء استخدم خيار إلغاء التثبيت من داخل البرنامج.

---

## 🛠️ الأوامر المتاحة

| الأمر | الوصف |
|-------|-------|
| `gmd` | تشغيل البرنامج |
| `gmd --install` | تثبيت وتشغيل فوري |
| `gmd --install-desktop` | تثبيت مع أيقونة سطح المكتب وتشغيل فوري |
| `gmd --update` | تحديث البرنامج وإعادة التشغيل |
| `gmd --clean-uninstall` | إلغاء تثبيت كامل (يزيل كل شيء) |
| `gmd --fix-desktop` | إصلاح اختصار سطح المكتب |

---

## 📖 كيفية استخدام الميزات

### 1. 🧠 **تنزيل وتحويل مباشر**
```
1. اختر الخيار "3" من القائمة الرئيسية
2. أدخل رابط الفيديو أو الصوت (أو 0 للرجوع)
3. اختر الصيغة المطلوبة (MP4, MP3, WebM, etc.)
4. البرنامج يتحقق تلقائياً من الصيغة الأصلية
5. إذا كانت مطابقة → التنزيل مباشرة ✓
6. إذا كانت مختلفة → التنزيل ثم التحويل الذكي ✓
```

### 2. ✂️ **قص الفيديو/الصوت**
```
1. اختر الخيار "6" من القائمة الرئيسية
2. اختر: قص من رابط أو قص ملف موجود
3. أدخل وقت البداية (مثال: 00:01:30)
4. أدخل وقت النهاية (مثال: 00:03:00)
5. اختر مجلد الحفظ
6. يُحفظ المقطع المقصوص تلقائياً ✓
```

### 3. 📋 **معلومات الوسائط**
```
1. اختر الخيار "7" من القائمة الرئيسية
2. أدخل رابط الفيديو
3. يعرض: العنوان، المحمّل، المدة، الجودة، الصيغة، المشاهدات
```

### 4. 📦 **تنزيل شامل**
```
1. اختر "5" ثم "5" من القوائم
2. أدخل رابط الفيديو
3. اختر مجلد الحفظ
4. البرنامج يُنشئ مجلداً منظماً يحتوي:
   • الفيديو بأعلى جودة
   • الصور المصغرة
   • جميع الترجمات المتاحة
   • الوصف والمعلومات (JSON)
```

### 5. ⚙️ **الإعدادات**
```
⚙️  الإعدادات في v1.92:
   1) تغيير اللغة (عربي / English)
   2) تحديث yt-dlp
   3) تحديث GMD (مع إعادة تشغيل تلقائي)
   4) إصلاح اختصار سطح المكتب
   5) إلغاء التثبيت الكامل (يُغلق البرنامج تلقائياً)
   ─────────────────────────────
   0) ❌ إلغاء والعودة للقائمة
```

---

## 🔄 الترقية من v1.91 إلى v1.92

### خيار 1: تحديث مباشر من داخل البرنامج
```
الإعدادات ← خيار 3 (تحديث GMD)
```
> يُحدَّث البرنامج ويُعاد تشغيله تلقائياً

### خيار 2: تحديث من الطرفية
```bash
gmd --update
```

### خيار 3: إعادة تثبيت نظيف
```bash
gmd --clean-uninstall
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd) --install-desktop
```

---

## 🐛 إصلاح المشاكل الشائعة

| المشكلة | الحل |
|---------|------|
| الأيقونة لا تظهر بعد التحديث | `gmd --fix-desktop` |
| أمر `gmd` غير معروف في الطرفية | أعد فتح الطرفية أو `source ~/.bashrc` |
| التحديث يُنهي البرنامج فجأة | ثبّت النسخة الجديدة من المستودع مباشرة |
| البرنامج يبقى مفتوحاً بعد إلغاء التثبيت | هذا مُصلح في v1.92، يُغلق تلقائياً |
| yt-dlp لا يتحدّث | استخدم خيار تحديث yt-dlp في الإعدادات |
| البرنامج لا يعمل من قائمة التطبيقات | `gmd --fix-desktop` ثم أعد تشغيل النظام |

---

## 🎯 ما الجديد في v1.92 مقارنة بـ v1.91

| الميزة | v1.91 | v1.92 |
|--------|-------|-------|
| تشغيل فوري بعد التثبيت | ❌ يدوي | ✅ تلقائي |
| خيار الرجوع في القوائم | ⚠ موجود لكن غير واضح | ✅ واضح ومميز |
| قص الفيديو/الصوت | ❌ غير متوفر | ✅ جديد |
| معلومات الوسائط | ❌ غير متوفر | ✅ جديد |
| إصلاح PATH تلقائي | ❌ لا | ✅ يضاف لـ .bashrc |
| التحديث من الإعدادات | ⚠ ينهار أحياناً | ✅ موثوق مع نسخ احتياطي |
| إغلاق بعد إلغاء التثبيت | ❌ يبقى مفتوحاً | ✅ يُغلق تلقائياً |
| استعادة عند فشل التحديث | ❌ لا | ✅ تلقائي |

---

## 📁 هيكل الملفات

```
~/.local/bin/gmd                              # الملف التنفيذي
~/.local/bin/yt-dlp                           # أداة التنزيل
~/.local/share/applications/gmd.desktop       # اختصار قائمة البرامج
~/.local/share/icons/hicolor/48x48/apps/gmd-icon.png  # الأيقونة
~/.config/gmd_desktop_installed               # علامة تثبيت الأيقونة
~/.config/gmd_last_update                     # علامة آخر تحديث
```

## 🌟 لماذا v1.92 أفضل؟

1. **أسرع** - يعمل فوراً بعد التثبيت دون خطوات إضافية
2. **أكثر تحكماً** - خيار الرجوع واضح في كل مكان
3. **أكثر إمكانيات** - قص الوسائط ومعلومات الفيديو
4. **أكثر استقراراً** - التحديث لا ينهار، ويستعيد النسخة عند الفشل
5. **أكثر أناقة** - يُغلق نفسه بعد إلغاء التثبيت دون بقاء عالقاً

---

## 🎉 جربه الآن!

```bash
# تثبيت وتشغيل فوري مع أيقونة
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd) --install-desktop
```

```bash
# أو تجربة مباشرة دون تثبيت
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd)
```

**GMD v1.92 - تشغيل فوري، تحكم كامل، ميزات أقوى!** 🚀

---

## 📞 معلومات التواصل

- **المستودع**: [github.com/SalehGNUTUX/GMD](https://github.com/SalehGNUTUX/GMD)
- **الإصدارات**: [Releases Page](https://github.com/SalehGNUTUX/GMD/releases)
- **موقع غنوتوكس**: [salehgnutux.github.io/gnutux/](https://salehgnutux.github.io/gnutux/)
- **ملف README**: [README.md](https://github.com/SalehGNUTUX/GMD/blob/main/README.md)

**الإصدار 1.92 - تجربة مستخدم محسنة وميزات جديدة!** ✨

---

---

# GMD - GNU Media Downloader v1.92

## 🆕 Version 1.92 - Instant Launch, Full Control, New Features!

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

**GMD v1.92** brings instant launch after installation, a back option at every step, media trimming, and critical update engine fixes!

<img width="256" height="256" alt="GMD Icon" src="https://github.com/SalehGNUTUX/GMD/blob/main/GMD%20APPIAMGE%20BIULD/gmd-icon.png?raw=true" />

## ✨ New Features in v1.92

### 🚀 **Instant Launch After Installation**
- **No manual commands needed** after install
- **Launches automatically** right after installation via `exec`
- **Auto PATH fix** adds `~/.local/bin` to shell config files
- **Seamless experience** from one command to the program interface

### 🔙 **Cancel & Back Option at Every Step**
- **Every submenu** has option `0` for immediate return
- **Clear, distinct label** separated by `├───┤` border in every menu
- **Bilingual support** Arabic and English in all back options
- **No crashes, no hanging** — back option works in all modes

### ✂️ **Trim Video & Audio (New)**
- **Trim directly from URL** without downloading the full file first
- **Trim existing local files** with custom start and end times
- **Save the clip** to any folder you choose
- **Supports all formats** video and audio

### 📋 **Media Info (New)**
- **View video details** before downloading
- **Title, uploader, duration, quality, format, view count**
- **Useful for previewing content** before deciding to download

### 🔄 **Critical Update Engine Fix**
- **Reliable update** from repository without crashing
- **Automatic backup** before any update
- **Auto-restore** of previous version if update fails
- **Auto-restart** after successful update

### 🗑️ **Auto-Close After Uninstall**
- **Program closes itself** automatically after uninstall
- **No hanging in terminal** after removal
- **Executable deleted safely** in background

---

## 📋 Main Menu v1.92

```
┌─────────────────────────────────────┐
│          GMD - v1.92                │
│    GNU MEDIA DOWNLOADER             │
├─────────────────────────────────────┤
│  ⬇️  1) Download Video              │
│  🎵  2) Download Audio              │
│  🧠  3) Download & Convert Direct   │
│  🔄  4) Convert Media               │
│  ⚡  5) Extra Download Options      │
│  ✂️  6) Trim Video/Audio            │
│  📋  7) Media Info                  │
│  ⚙️  8) Settings                   │
├─────────────────────────────────────┤
│  🚪  0) ❌ Exit Program              │
└─────────────────────────────────────┘
```

## 🔙 Back Option Example in Submenus

```
┌─────────────────────────────────────┐
│        🎞️  Video Quality            │
├─────────────────────────────────────┤
│  1) High (1080p)                    │
│  2) Medium (720p)                   │
│  3) Low (480p)                      │
│  4) Best available                  │
├─────────────────────────────────────┤
│  🔙 0) ❌ Cancel & Back to Menu      │
└─────────────────────────────────────┘
```

---

## 🚀 Instant Installation

### Preferred Method: Full installation with desktop icon
```bash
bash <(curl -sL "https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd") --install-desktop
```

### Or without desktop icon:
```bash
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd) --install
```

> ✅ After installation, the program **launches automatically** — no need to type `gmd`

### Try without installing:
```bash
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd)
```

> ⚠️ Running without install still installs `yt-dlp` and a desktop icon — these are permanent files that survive reboots. To remove everything, use the complete uninstall option from inside the program.

---

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `gmd` | Run the program |
| `gmd --install` | Install and launch instantly |
| `gmd --install-desktop` | Install with desktop icon and launch instantly |
| `gmd --update` | Update program and restart |
| `gmd --clean-uninstall` | Complete uninstall (removes everything) |
| `gmd --fix-desktop` | Fix desktop shortcut |

---

## 📖 How to Use Features

### 1. 🧠 **Smart Download & Convert**
```
1. Select option "3" from main menu
2. Enter video or audio URL (or 0 to go back)
3. Choose desired format (MP4, MP3, WebM, etc.)
4. Program automatically checks original format
5. If matches → Direct download ✓
6. If different → Download then smart conversion ✓
```

### 2. ✂️ **Trim Video/Audio**
```
1. Select option "6" from main menu
2. Choose: trim from URL or trim existing file
3. Enter start time (e.g. 00:01:30)
4. Enter end time (e.g. 00:03:00)
5. Choose save folder
6. Trimmed clip is saved automatically ✓
```

### 3. 📋 **Media Info**
```
1. Select option "7" from main menu
2. Enter video URL
3. Displays: title, uploader, duration, quality, format, views
```

### 4. 📦 **Complete Package Download**
```
1. Select "5" then "5" from menus
2. Enter video URL
3. Choose save folder
4. Program creates an organized folder containing:
   • Video in highest quality
   • Thumbnails
   • All available subtitles
   • Description & info (JSON)
```

### 5. ⚙️ **Settings**
```
⚙️  Settings in v1.92:
   1) Change language (Arabic / English)
   2) Update yt-dlp
   3) Update GMD (with auto-restart)
   4) Fix desktop shortcut
   5) Complete uninstall (auto-closes program)
   ─────────────────────────────
   0) ❌ Cancel & Back to Menu
```

---

## 🔄 Upgrade from v1.91 to v1.92

### Option 1: Update from inside the program
```
Settings → Option 3 (Update GMD)
```
> Program updates and restarts automatically

### Option 2: Update from terminal
```bash
gmd --update
```

### Option 3: Clean reinstall
```bash
gmd --clean-uninstall
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd) --install-desktop
```

---

## 🐛 Fix Common Problems

| Problem | Solution |
|---------|----------|
| Icon doesn't appear after update | `gmd --fix-desktop` |
| `gmd` command not found in terminal | Reopen terminal or `source ~/.bashrc` |
| Update crashes the program | Reinstall directly from repository |
| Program stays open after uninstall | Fixed in v1.92 — now closes automatically |
| yt-dlp won't update | Use yt-dlp update option in Settings |
| Program doesn't work from app menu | `gmd --fix-desktop` then restart system |

---

## 🎯 What's New in v1.92 vs v1.91

| Feature | v1.91 | v1.92 |
|---------|-------|-------|
| Instant launch after install | ❌ Manual | ✅ Automatic |
| Back option in menus | ⚠ Present but unclear | ✅ Clear & distinct |
| Trim video/audio | ❌ Not available | ✅ New |
| Media info viewer | ❌ Not available | ✅ New |
| Auto PATH fix | ❌ No | ✅ Added to .bashrc |
| Update from settings | ⚠ Sometimes crashes | ✅ Reliable with backup |
| Auto-close after uninstall | ❌ Stays open | ✅ Closes automatically |
| Restore on failed update | ❌ No | ✅ Automatic |

---

## 📁 File Structure

```
~/.local/bin/gmd                              # Executable file
~/.local/bin/yt-dlp                           # Download engine
~/.local/share/applications/gmd.desktop       # App menu shortcut
~/.local/share/icons/hicolor/48x48/apps/gmd-icon.png  # Icon
~/.config/gmd_desktop_installed               # Icon install marker
~/.config/gmd_last_update                     # Last update marker
```

## 🌟 Why v1.92 is Better?

1. **Faster** — runs immediately after installation with no extra steps
2. **More control** — back option clearly visible everywhere
3. **More capable** — trim media and view video info before downloading
4. **More stable** — updates don't crash, auto-restore on failure
5. **Cleaner** — closes itself after uninstall with no leftover processes

---

## 🎉 Try It Now!

```bash
# Install with icon and launch instantly
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd) --install-desktop
```

```bash
# Or try directly without installing
bash <(curl -sL https://raw.githubusercontent.com/SalehGNUTUX/GMD/main/gmd)
```

**GMD v1.92 - Instant launch, full control, more powerful!** 🚀

---

## 📞 Contact Information

- **Repository**: [github.com/SalehGNUTUX/GMD](https://github.com/SalehGNUTUX/GMD)
- **Releases**: [Releases Page](https://github.com/SalehGNUTUX/GMD/releases)
- **Gnutux Site**: [salehgnutux.github.io/gnutux/](https://salehgnutux.github.io/gnutux/)
- **README File**: [README.md](https://github.com/SalehGNUTUX/GMD/blob/main/README.md)

**Version 1.92 - Enhanced user experience and powerful new features!** ✨
