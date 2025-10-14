#!/bin/bash

clear
echo "
   ____   __  __   ____
  / ___| |  \/  | |  _ \\
 | |  _  | |\/| | | | | |
 | |_| | | |  | | | |_| |
  \\____| |_|  |_| |____/
-------------------------
   GNU MEDIA DOWNLOADER
-------------------------
       » BY GNUTUX «
         » v1.2 (Improved) «
"

# ✅ التبعيات المطلوبة
REQUIRED_CMDS=(ffmpeg yt-dlp zenity)
missing=()

for cmd in "${REQUIRED_CMDS[@]}"; do
    if ! command -v "$cmd" &>/dev/null; then
        missing+=("$cmd")
    fi
done

install_deps() {
  if [ "${#missing[@]}" -eq 0 ]; then return; fi
  echo "🔄 محاولة تثبيت التبعيات المطلوبة تلقائيًا:"
  if command -v apt &>/dev/null; then
    sudo apt update
    for m in "${missing[@]}"; do
      sudo apt install -y "$m"
    done
  elif command -v dnf &>/dev/null; then
    sudo dnf install -y "${missing[@]}"
  elif command -v pacman &>/dev/null; then
    sudo pacman -Sy --noconfirm "${missing[@]}"
  else
    echo "❌ غير قادر على اكتشاف مدير الحزم تلقائيًا. يرجى تثبيت هذه الحزم يدويًا: ${missing[*]}"
    exit 1
  fi
}

if (( ${#missing[@]} > 0 )); then
    echo "❌ التبعيات التالية غير متوفرة: ${missing[*]}"
    read -p "هل ترغب بمحاولة تثبيتها تلقائيًا؟ [y/N]: " try_install
    if [[ "$try_install" =~ ^[Yy]$ ]]; then
        install_deps
        # تحقق مرة أخرى بعد محاولة التثبيت
        for cmd in "${REQUIRED_CMDS[@]}"; do
            if ! command -v "$cmd" &>/dev/null; then
                echo "❌ $cmd لم يتم تثبيته بنجاح. يرجى تثبيته يدويًا."
                exit 1
            fi
        done
    else
        exit 1
    fi
fi

# ✅ إعداد اللغة
LANGUAGE=$(locale | grep LANG= | cut -d= -f2 | cut -d_ -f1)
if [[ "$LANGUAGE" == "ar" ]]; then
  L=ar
else
  L=en
fi

# ✅ أدوات النظام
YTDLP=$(command -v yt-dlp || command -v youtube-dl)
FFMPEG=$(command -v ffmpeg)
FILE_MANAGER=$(command -v xdg-open || command -v nemo || command -v nautilus)
SAVE_PATH=""

if [[ -z "$YTDLP" || -z "$FFMPEG" ]]; then
  echo "❌ Please install yt-dlp (or youtube-dl) and ffmpeg first." && exit 1
fi

# ✅ اختيار مجلد الحفظ عبر واجهة رسومية
choose_save_path() {
  if command -v zenity &>/dev/null; then
    if [[ "$L" == "ar" ]]; then
      SAVE_PATH=$(zenity --file-selection --directory --title="اختر مجلد الحفظ")
    else
      SAVE_PATH=$(zenity --file-selection --directory --title="Choose download folder")
    fi
  else
    echo "❌ أداة zenity غير مثبتة، ولا يمكن اختيار المجلد عبر واجهة رسومية."
    exit 1
  fi
  if [[ -z "$SAVE_PATH" || ! -d "$SAVE_PATH" ]]; then
    echo "❌ مسار غير صالح / Invalid directory."
    exit 1
  fi
}

# ✅ اختيار الملف للتحويل عبر واجهة رسومية
choose_file_path() {
  if command -v zenity &>/dev/null; then
    if [[ "$L" == "ar" ]]; then
      FILE=$(zenity --file-selection --title="اختر ملف التحويل")
    else
      FILE=$(zenity --file-selection --title="Choose file to convert")
    fi
  else
    echo "❌ أداة zenity غير مثبتة، ولا يمكن اختيار الملف عبر واجهة رسومية."
    return 1
  fi
  if [[ -z "$FILE" || ! -f "$FILE" ]]; then
    echo "❌ ملف غير صالح / Invalid file."
    return 1
  fi
  return 0
}

# ✅ تحسين اختيار جودة الفيديو مع mp4
choose_mp4_quality() {
  if [[ "$L" == "ar" ]]; then
    echo "🎞️ اختر جودة فيديو mp4:"
    echo "1) عالية (1080p)"
    echo "2) متوسطة (720p)"
    echo "3) منخفضة (480p)"
  else
    echo "🎞️ Select mp4 video quality:"
    echo "1) High (1080p)"
    echo "2) Medium (720p)"
    echo "3) Low (480p)"
  fi
  read -p "➤ " mp4_quality
  case $mp4_quality in
    1) FORMAT="bv*[ext=mp4][height<=1080]+ba[ext=m4a]/best[ext=mp4][height<=1080]"; EXT_OPT="--merge-output-format mp4";;
    2) FORMAT="bv*[ext=mp4][height<=720]+ba[ext=m4a]/best[ext=mp4][height<=720]"; EXT_OPT="--merge-output-format mp4";;
    3) FORMAT="bv*[ext=mp4][height<=480]+ba[ext=m4a]/best[ext=mp4][height<=480]"; EXT_OPT="--merge-output-format mp4";;
    *) echo "❌ خيار غير صالح / Invalid choice."; return 1;;
  esac
  return 0
}

# ✅ خيارات جودة الفيديو العامة
choose_quality() {
  if [[ "$L" == "ar" ]]; then
    echo "🎞️ اختر جودة الفيديو:"
    echo "1) عالية"
    echo "2) متوسطة"
    echo "3) منخفضة"
    echo "4) mp4 (مع اختيار الجودة)"
  else
    echo "🎞️ Select video quality:"
    echo "1) High"
    echo "2) Medium"
    echo "3) Low"
    echo "4) mp4 (choose quality)"
  fi
  read -p "➤ " quality
  case $quality in
    1) FORMAT="bestvideo+bestaudio/best"; EXT_OPT="";;
    2) FORMAT="bv[height<=720]+ba/best[height<=720]"; EXT_OPT="";;
    3) FORMAT="bv[height<=480]+ba/best[height<=480]"; EXT_OPT="";;
    4) choose_mp4_quality || return 1;;
    *) echo "❌ خيار غير صالح / Invalid choice."; return 1;;
  esac
  return 0
}

# ✅ خيارات تحويل الصوت مع خيار ogg أولاً
choose_audio_format() {
  if [[ "$L" == "ar" ]]; then
    echo "🔊 تغيير صيغة الصوت (أول خيار):"
    echo "1) ogg (حجم صغير)"
    echo "2) mp3"
    echo "3) m4a"
    echo "4) opus"
    echo "5) flac"
    echo "6) wav"
  else
    echo "🔊 Change audio format (first option):"
    echo "1) ogg (small size)"
    echo "2) mp3"
    echo "3) m4a"
    echo "4) opus"
    echo "5) flac"
    echo "6) wav"
  fi
  read -p "➤ " audio_format
  case $audio_format in
    1) AUDIO_OPTS="--extract-audio --audio-format vorbis";;
    2) AUDIO_OPTS="--extract-audio --audio-format mp3";;
    3) AUDIO_OPTS="--extract-audio --audio-format m4a";;
    4) AUDIO_OPTS="--extract-audio --audio-format opus";;
    5) AUDIO_OPTS="--extract-audio --audio-format flac";;
    6) AUDIO_OPTS="--extract-audio --audio-format wav";;
    *) AUDIO_OPTS="";;
  esac
}

# ✅ خيارات متقدمة
get_advanced_options() {
  if [[ "$L" == "ar" ]]; then
    echo "➕ اختر خيارات متقدمة (يمكن اختيار أكثر من خيار مفصول بفاصلة):"
    echo "1) تغيير الصوت"
    echo "2) تحميل الصورة المصغرة"
    echo "3) تحميل الترجمة التلقائية"
    echo "4) تخطي الأخطاء"
    echo "5) لا شيء"
  else
    echo "➕ Choose advanced options (multiple, comma separated):"
    echo "1) Change audio format"
    echo "2) Download thumbnail"
    echo "3) Download subtitles"
    echo "4) Ignore errors"
    echo "5) None"
  fi

  read -p "➤ " adv_opts
  EXTRA_OPTS=""
  AUDIO_OPTS=""

  IFS=',' read -ra CHOICES <<< "$adv_opts"
  for opt in "${CHOICES[@]}"; do
    case "$opt" in
      1) choose_audio_format;;
      2) EXTRA_OPTS+=" --write-thumbnail";;
      3) EXTRA_OPTS+=" --write-auto-sub";;
      4) EXTRA_OPTS+=" --ignore-errors";;
      5) EXTRA_OPTS+="";;
    esac
  done
}

# ✅ تنزيل فيديو
download_video() {
  read -p "🌐 URL: " URL
  choose_save_path || return
  choose_quality || return
  get_advanced_options

  # حفظ الفيديو مع ضمان اسم فريد حتى لو لم يوجد عنوان
  $YTDLP $EXTRA_OPTS $AUDIO_OPTS $EXT_OPT \
    -f "$FORMAT" \
    -o "$SAVE_PATH/%(title)s_%(id)s.%(ext)s" \
    "$URL"

  echo "✅ Done."
  if [[ -n "$FILE_MANAGER" ]]; then
    $FILE_MANAGER "$SAVE_PATH"
  fi
}

# ✅ خيارات تحويل الوسائط
choose_conversion_format() {
  if [[ "$L" == "ar" ]]; then
    echo "🎧 اختر صيغة الإخراج:"
    echo "1) ogg (حجم صغير)"
    echo "2) mp3"
    echo "3) mp4 (HEVC)"
    echo "4) webm"
    echo "5) mkv"
    echo "6) wav"
    echo "7) flac"
  else
    echo "🎧 Choose output format:"
    echo "1) ogg (small size)"
    echo "2) mp3"
    echo "3) mp4 (HEVC)"
    echo "4) webm"
    echo "5) mkv"
    echo "6) wav"
    echo "7) flac"
  fi
  read -p "➤ " conv_format
  case $conv_format in
    1) EXT="ogg"; CONV_OPTS="-c:a libopus";;
    2) EXT="mp3"; CONV_OPTS="-c:a libmp3lame";;
    3) EXT="mp4"; CONV_OPTS="-c:v libx265 -crf 28 -c:a libopus";;
    4) EXT="webm"; CONV_OPTS="-c:v libvpx-vp9 -c:a libopus";;
    5) EXT="mkv"; CONV_OPTS="-c:v libx265 -crf 28 -c:a libopus";;
    6) EXT="wav"; CONV_OPTS="";;
    7) EXT="flac"; CONV_OPTS="-c:a flac";;
    *) echo "❌ خيار غير صالح / Invalid choice."; return 1;;
  esac
  return 0
}

# ✅ تحويل ملف وسائط
convert_media() {
  choose_file_path || return
  choose_save_path || return
  choose_conversion_format || return
  BASENAME=$(basename "$FILE")
  NAME="${BASENAME%.*}"

  $FFMPEG -i "$FILE" $CONV_OPTS "$SAVE_PATH/${NAME}.${EXT}"
  echo "✅ Conversion done."
  if [[ -n "$FILE_MANAGER" ]]; then
    $FILE_MANAGER "$SAVE_PATH"
  fi
}

# ✅ القائمة الرئيسية
while true; do
  if [[ "$L" == "ar" ]]; then
    echo "🎬 برنامج التحميل والتحويل"
    echo "1) تنزيل فيديو"
    echo "2) تحويل ملف وسائط"
    echo "3) خروج"
  else
    echo "🎬 Download & Convert Tool"
    echo "1) Download Video"
    echo "2) Convert Media File"
    echo "3) Exit"
  fi

  read -p "➤ " option
  case $option in
    1) download_video;;
    2) convert_media;;
    3) echo "👋"; exit 0;;
    *) echo "❌ خيار غير صالح / Invalid choice.";;
  esac
done
