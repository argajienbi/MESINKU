# MESINKU

MESINKU adalah aplikasi manajemen pemakaian mesin berbasis web yang saat ini dibuat menggunakan **HTML, CSS, JavaScript**, dan **Firebase Realtime Database**.

Repo ini akan menjadi dasar untuk proses porting bertahap ke **Flutter/Dart**, agar aplikasi lebih mudah dikembangkan sebagai aplikasi mobile dan tetap bisa mempertahankan data Firebase yang sudah ada.

---

## Status Project

Status saat ini:

- Aplikasi berjalan sebagai web app HTML/JavaScript.
- Backend menggunakan Firebase Realtime Database.
- Autentikasi menggunakan Firebase Auth.
- Data user lokal masih disimpan melalui `localStorage`.
- Struktur project belum sepenuhnya modular.
- Target berikutnya adalah porting logic JavaScript ke service Dart/Flutter.

---

## Teknologi Saat Ini

```text
HTML
CSS
JavaScript
Firebase Auth
Firebase Realtime Database
Firebase Compat SDK
```

---

## Target Porting

Target utama porting:

```text
HTML + JavaScript + Firebase RTDB
menjadi
Flutter + Dart + Firebase RTDB
```

Porting tidak dilakukan dengan WebView. Logic lama akan diterjemahkan menjadi struktur Flutter/Dart yang lebih rapi.

---

## Fitur Utama

Fitur yang sudah terdeteksi dari project saat ini:

- Login dan logout user
- Dashboard utama
- Status mesin realtime
- Riwayat pemakaian mesin
- Mulai sesi pemakaian mesin
- Selesaikan sesi pemakaian mesin
- Broadcast / pesan penting dari admin
- Running text / pesan berjalan
- Presence user online
- Role user: crew, admin, superadmin
- Manajemen mesin oleh admin
- Badge notifikasi navbar
- Data kendala mesin
- Chat / broadcast user

---

## Struktur Project Saat Ini

Struktur utama project web saat ini:

```text
MESINKU/
├── index.html
├── login.html
├── start_session.html
├── my_session.html
├── live_machines.html
├── history.html
├── status_anggota.html
├── notifikasi.html
├── kendala.html
├── admin_panel.html
└── assets/
    ├── css/
    │   └── style.css
    └── js/
        ├── firebase.js
        ├── app.js
        ├── feature_loader.js
        └── nav_badge.js
```

Catatan: beberapa file di atas adalah struktur target/terdeteksi dari navigasi aplikasi. Pastikan file benar-benar ada di repo sebelum refactor besar dilakukan.

---

## Struktur Firebase Realtime Database

Path Firebase yang perlu dipertahankan saat porting ke Flutter:

```text
broadcast
machines
machines_list
history
active_sessions
users_online
pesan_running
user_messages
patch_gate
```

Struktur ini sebaiknya tidak langsung diganti agar data lama tetap kompatibel.

---

## Mapping Web ke Flutter

| Web Saat Ini | Flutter/Dart Nanti |
|---|---|
| `index.html` | `dashboard_page.dart` |
| `login.html` | `login_page.dart` |
| `start_session.html` | `start_session_page.dart` |
| `my_session.html` | `my_session_page.dart` |
| `live_machines.html` | `live_machines_page.dart` |
| `history.html` | `history_page.dart` |
| `admin_panel.html` | `admin_panel_page.dart` |
| `assets/js/firebase.js` | `auth_service.dart`, `presence_service.dart`, `local_user_service.dart` |
| `assets/js/app.js` | `machine_service.dart`, `session_service.dart`, `history_service.dart`, `broadcast_service.dart` |
| `assets/js/nav_badge.js` | `app_navbar.dart` + Firebase stream |
| CSS | Flutter Theme + reusable widgets |
| `localStorage` | `shared_preferences` / auth state |
| `window.location.href` | `Navigator` / route manager |
| DOM update | `StreamBuilder`, `FutureBuilder`, Provider / state management |

---

## Struktur Flutter Target

Saat porting dimulai, struktur Flutter yang disarankan:

```text
lib/
├── main.dart
├── app.dart
├── firebase_options.dart
│
├── core/
│   ├── constants/
│   │   ├── app_colors.dart
│   │   ├── app_routes.dart
│   │   └── firebase_paths.dart
│   ├── helpers/
│   │   ├── date_helper.dart
│   │   └── duration_helper.dart
│   └── widgets/
│       ├── app_card.dart
│       ├── app_button.dart
│       ├── app_navbar.dart
│       └── status_badge.dart
│
├── data/
│   ├── models/
│   │   ├── app_user.dart
│   │   ├── machine_model.dart
│   │   ├── session_model.dart
│   │   ├── history_model.dart
│   │   └── broadcast_model.dart
│   └── services/
│       ├── auth_service.dart
│       ├── local_user_service.dart
│       ├── presence_service.dart
│       ├── machine_service.dart
│       ├── session_service.dart
│       ├── history_service.dart
│       └── broadcast_service.dart
│
└── features/
    ├── auth/
    │   ├── login_page.dart
    │   └── register_page.dart
    ├── dashboard/
    │   └── dashboard_page.dart
    ├── machines/
    │   ├── live_machines_page.dart
    │   └── manage_machines_page.dart
    ├── sessions/
    │   ├── start_session_page.dart
    │   └── my_session_page.dart
    ├── history/
    │   └── history_page.dart
    ├── admin/
    │   └── admin_panel_page.dart
    ├── notification/
    │   └── notification_page.dart
    ├── kendala/
    │   └── kendala_page.dart
    └── anggota/
        └── status_anggota_page.dart
```

---

## Urutan Porting yang Disarankan

Porting sebaiknya dilakukan bertahap agar logic tidak rusak.

```text
1. Buat branch baru: flutter-port
2. Buat project Flutter baru
3. Setup Firebase untuk Flutter
4. Port model data utama
5. Port service Firebase
6. Port Login
7. Port Dashboard
8. Port Start Session
9. Port My Session
10. Port History
11. Port Live Machines
12. Port Admin Panel
13. Port Broadcast / Notifikasi
14. Port Kendala
15. Testing APK / AAB
```

---

## Dependency Flutter yang Disarankan

Saat project Flutter dibuat, dependency awal yang disarankan:

```yaml
dependencies:
  flutter:
    sdk: flutter

  firebase_core: ^3.15.0
  firebase_auth: ^5.6.0
  firebase_database: ^11.3.8
  shared_preferences: ^2.5.3
  provider: ^6.1.5
  intl: ^0.20.2
```

Catatan: versi dependency bisa berubah. Selalu cek ulang versi terbaru sebelum implementasi final.

---

## Catatan Penting untuk Developer

- Jangan hapus versi HTML/JavaScript sebelum versi Flutter stabil.
- Jangan ubah path Firebase lama sebelum semua fitur berhasil dipindahkan.
- Jangan langsung mengganti semua file dalam satu commit besar.
- Utamakan porting logic inti terlebih dahulu: login, dashboard, sesi, mesin, dan riwayat.
- Simpan struktur database lama agar data existing tetap bisa digunakan.
- Hindari porting menggunakan WebView karena tujuan utama adalah migrasi ke Dart native.

---

## Rencana Refactor Repo

Tahap awal perapihan repo:

```text
[done] Tambahkan README.md
[plan] Tambahkan docs/PORTING_PLAN.md
[plan] Tambahkan docs/FIREBASE_STRUCTURE.md
[plan] Tambahkan docs/FEATURE_MAP.md
[plan] Tambahkan .gitignore
[plan] Buat branch flutter-port
[plan] Generate Flutter project
```

---

## Lisensi

Belum ditentukan.
