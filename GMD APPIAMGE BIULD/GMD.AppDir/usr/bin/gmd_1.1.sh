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
         » v1.1 «

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

# ✅ اختيار الجودة والصيغة
choose_quality() {
  if [[ "$L" == "ar" ]]; then
    echo "🎞️ اختر جودة الفيديو:"
    echo "1) عالية"
    echo "2) متوسطة"
    echo "3) منخفضة"
    echo "4) mp4 (تحويل مباشر)"
  else
    echo "🎞️ Select video quality:"
    echo "1) High"
    echo "2) Medium"
    echo "3) Low"
    echo "4) mp4 (direct convert)"
  fi
  read -p "➤ " quality

  case $quality in
    1) FORMAT="bestvideo+bestaudio/best"; EXT_OPT="";;
    2) FORMAT="bv[height<=720]+ba/best[height<=720]"; EXT_OPT="";;
    3) FORMAT="bv[height<=480]+ba/best[height<=480]"; EXT_OPT="";;
    4) FORMAT="bestvideo+bestaudio/best"; EXT_OPT="--recode-video mp4";;
    *) echo "❌ خيار غير صالح / Invalid choice."; return 1;;
  esac
  return 0
}

# ✅ اختيار صيغة التحويل
choose_conversion_format() {
  if [[ "$L" == "ar" ]]; then
    echo "🎧 اختر صيغة الإخراج:"
    echo "1) mp3"
    echo "2) mp4"
    echo "3) webm"
    echo "4) mkv"
    echo "5) wav"
    echo "6) flac"
  else
    echo "🎧 Choose output format:"
    echo "1) mp3"
    echo "2) mp4"
    echo "3) webm"
    echo "4) mkv"
    echo "5) wav"
    echo "6) flac"
  fi
  read -p "➤ " conv_format

  case $conv_format in
    1) EXT="mp3";;
    2) EXT="mp4";;
    3) EXT="webm";;
    4) EXT="mkv";;
    5) EXT="wav";;
    6) EXT="flac";;
    *) echo "❌ خيار غير صالح / Invalid choice."; return 1;;
  esac
  return 0
}

# ✅ اختيار صيغة الصوت عند اختيار التحميل كصوت
choose_audio_format() {
  if [[ "$L" == "ar" ]]; then
    echo "🔊 اختر صيغة الصوت:"
    echo "1) mp3"
    echo "2) m4a"
    echo "3) opus"
    echo "4) flac"
    echo "5) wav"
  else
    echo "🔊 Choose audio format:"
    echo "1) mp3"
    echo "2) m4a"
    echo "3) opus"
    echo "4) flac"
    echo "5) wav"
  fi
  read -p "➤ " audio_format
  case $audio_format in
    1) AUDIO_OPTS="--extract-audio --audio-format mp3";;
    2) AUDIO_OPTS="--extract-audio --audio-format m4a";;
    3) AUDIO_OPTS="--extract-audio --audio-format opus";;
    4) AUDIO_OPTS="--extract-audio --audio-format flac";;
    5) AUDIO_OPTS="--extract-audio --audio-format wav";;
    *) AUDIO_OPTS="";;
  esac
}

# ✅ خيارات متقدمة عبر أرقام
get_advanced_options() {
  if [[ "$L" == "ar" ]]; then
    echo "➕ اختر خيارات متقدمة (يمكن اختيار أكثر من خيار مفصول بفاصلة):"
    echo "1) تحميل الصورة المصغرة"
    echo "2) تحميل الترجمة التلقائية"
    echo "3) تخطي الأخطاء"
    echo "4) تحميل كصوت"
    echo "5) لا شيء"
  else
    echo "➕ Choose advanced options (you can select multiple, e.g., 1,2):"
    echo "1) Download thumbnail"
    echo "2) Download subtitles"
    echo "3) Ignore errors"
    echo "4) Download as audio"
    echo "5) None"
  fi

  read -p "➤ " adv_opts
  EXTRA_OPTS=""
  AUDIO_OPTS=""

  IFS=',' read -ra CHOICES <<< "$adv_opts"
  for opt in "${CHOICES[@]}"; do
    case "$opt" in
      1) EXTRA_OPTS+=" --write-thumbnail";;
      2) EXTRA_OPTS+=" --write-auto-sub";;
      3) EXTRA_OPTS+=" --ignore-errors";;
      4) choose_audio_format;;
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

  $YTDLP $EXTRA_OPTS $AUDIO_OPTS $EXT_OPT -f "$FORMAT" -o "$SAVE_PATH/%(title)s.%(ext)s" "$URL"
  echo "✅ Done."
  if [[ -n "$FILE_MANAGER" ]]; then
    $FILE_MANAGER "$SAVE_PATH"
  fi
}

# ✅ تحويل ملف
convert_media() {
  choose_file_path || return
  choose_save_path || return
  choose_conversion_format || return
  BASENAME=$(basename "$FILE")
  NAME="${BASENAME%.*}"

  $FFMPEG -i "$FILE" "$SAVE_PATH/${NAME}.${EXT}"
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
