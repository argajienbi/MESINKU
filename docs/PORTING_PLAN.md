# MESINKU Porting Plan

Dokumen ini berisi rencana porting MESINKU dari project **HTML/CSS/JavaScript** menjadi project **Flutter/Dart**.

Porting dilakukan bertahap agar logic lama tetap aman dan data Firebase yang sudah ada tidak rusak.

---

## Tujuan Porting

Tujuan utama:

```text
HTML + JavaScript + Firebase RTDB
menjadi
Flutter + Dart + Firebase RTDB
```

Target hasil akhir:

- Aplikasi mobile Android berbasis Flutter.
- Logic utama tidak lagi bergantung pada JavaScript DOM.
- Firebase Realtime Database tetap digunakan agar data lama tetap kompatibel.
- Struktur kode lebih modular dan mudah dikembangkan.
- Aplikasi siap dikembangkan ke APK/AAB untuk Play Store.

---

## Prinsip Porting

- Jangan menggunakan WebView sebagai solusi utama.
- Jangan menghapus project HTML/JavaScript sebelum Flutter stabil.
- Jangan mengganti struktur Firebase secara mendadak.
- Porting dilakukan per fitur, bukan semua sekaligus.
- Setiap fitur harus dites sebelum lanjut ke fitur berikutnya.
- Logic JavaScript dipindahkan menjadi service Dart.
- Tampilan HTML/CSS dipindahkan menjadi widget Flutter.

---

## Tahap 0 - Persiapan Repo

Status:

```text
[done] Tambahkan README.md
[done] Tambahkan .gitignore
[done] Tambahkan docs/PORTING_PLAN.md
[plan] Tambahkan docs/FIREBASE_STRUCTURE.md
[plan] Tambahkan docs/FEATURE_MAP.md
[plan] Buat branch flutter-port
```

Tujuan tahap ini:

- Repo lebih mudah dipahami.
- Struktur porting terdokumentasi.
- Developer tidak kehilangan arah saat migrasi.

---

## Tahap 1 - Buat Branch Flutter

Branch yang disarankan:

```bash
git checkout -b flutter-port
```

Alasan:

- Versi HTML/JavaScript tetap aman di branch utama.
- Flutter bisa dikembangkan tanpa merusak app lama.
- Jika terjadi error, bisa kembali ke versi web lama.

---

## Tahap 2 - Generate Project Flutter

Perintah awal:

```bash
flutter create --org com.argajienbi mesinku
```

Atau jika ingin membuat Flutter langsung di repo yang sama:

```bash
flutter create .
```

Rekomendasi awal:

```text
Gunakan folder/branch terpisah dulu sampai struktur Flutter stabil.
```

Package name yang disarankan:

```text
com.argajienbi.mesinku
```

---

## Tahap 3 - Setup Dependency Flutter

Dependency awal:

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

Catatan:

- Versi dependency harus dicek ulang saat implementasi.
- Firebase wajib dikonfigurasi dengan FlutterFire CLI.

---

## Tahap 4 - Setup Firebase Flutter

Perintah umum:

```bash
dart pub global activate flutterfire_cli
flutterfire configure
```

Output yang diharapkan:

```text
lib/firebase_options.dart
```

Firebase yang digunakan:

```text
Firebase Auth
Firebase Realtime Database
```

---

## Tahap 5 - Port Model Data

Model yang harus dibuat lebih dulu:

```text
AppUser
MachineModel
SessionModel
HistoryModel
BroadcastModel
RunningTextModel
KendalaModel
```

Lokasi target:

```text
lib/data/models/
```

Setiap model wajib punya:

```text
fromMap()
toMap()
copyWith() jika dibutuhkan
```

---

## Tahap 6 - Port Service Firebase

Service yang harus dibuat:

```text
AuthService
LocalUserService
PresenceService
MachineService
SessionService
HistoryService
BroadcastService
RunningTextService
KendalaService
```

Lokasi target:

```text
lib/data/services/
```

Mapping logic:

| JavaScript Lama | Dart Service Baru |
|---|---|
| `getUser()` | `LocalUserService.getUser()` |
| `setUser()` | `LocalUserService.saveUser()` |
| `clearUser()` | `LocalUserService.clearUser()` |
| `requireLogin()` | Auth guard / route check |
| `setOnlinePresence()` | `PresenceService.setOnline()` |
| `logout()` | `AuthService.logout()` |
| `renderMachineListCompact()` | `MachineService.watchMachines()` |
| `renderHistoryCompact()` | `HistoryService.watchHistory()` |
| `renderBroadcastPanel()` | `BroadcastService.watchBroadcast()` |
| start session logic | `SessionService.startSession()` |
| end session logic | `SessionService.endSession()` |

---

## Tahap 7 - Port Halaman Inti

Urutan porting halaman:

```text
1. LoginPage
2. DashboardPage
3. StartSessionPage
4. MySessionPage
5. HistoryPage
6. LiveMachinesPage
```

Alasan urutan ini:

- Login dibutuhkan untuk semua fitur.
- Dashboard menjadi pusat navigasi.
- Start session dan my session adalah logic utama aplikasi.
- History dan live machines menjadi validasi data realtime.

---

## Tahap 8 - Port Admin

Halaman admin yang perlu dipindahkan setelah fitur user stabil:

```text
AdminPanelPage
ManageMachinesPage
BroadcastAdminPage
RunningTextAdminPage
KendalaAdminPage
```

Role check:

```text
admin
superadmin
```

Role check di Flutter harus dibuat sebagai helper/service agar tidak duplikatif.

---

## Tahap 9 - Port Notifikasi dan Badge

Fitur yang dipindahkan:

```text
Chat broadcast
User messages
Nav badge
Patch gate badge
Running text
```

Di Flutter, badge sebaiknya menggunakan:

```text
StreamBuilder
BottomNavigationBar badge
AppBar action badge
```

---

## Tahap 10 - Testing

Checklist testing:

```text
[ ] Login berhasil
[ ] Logout berhasil
[ ] User local tersimpan
[ ] Presence online aktif
[ ] Mesin available tampil
[ ] Mesin in_use tampil
[ ] Start session berhasil
[ ] User tidak bisa start session dobel
[ ] Mesin terkunci tidak bisa dipakai
[ ] My session tampil
[ ] End session berhasil
[ ] History tersimpan
[ ] Broadcast tampil
[ ] Role admin dikenali
[ ] Admin bisa manage mesin
```

---

## Tahap 11 - Build APK/AAB

Build debug:

```bash
flutter build apk --debug
```

Build release APK:

```bash
flutter build apk --release
```

Build AAB untuk Play Store:

```bash
flutter build appbundle --release
```

---

## Risiko Porting

Risiko utama:

```text
- Struktur data Firebase tidak konsisten.
- Data lama memakai field campuran, misalnya machine_id dan machineId.
- localStorage lama tidak otomatis terbaca oleh Flutter.
- Logic start/end session harus aman dari double update.
- Role user harus dipastikan sama dengan data lama.
```

Solusi:

```text
- Buat model yang toleran terhadap field lama.
- Jangan langsung rename path Firebase.
- Test setiap fitur dengan data asli.
- Gunakan update multi-path Firebase untuk session.
```

---

## Definisi Selesai

Porting dianggap selesai jika:

```text
[ ] User bisa login
[ ] User bisa melihat dashboard
[ ] User bisa mulai pakai mesin
[ ] User bisa selesai pakai mesin
[ ] Status mesin berubah realtime
[ ] Riwayat tercatat
[ ] Admin bisa mengelola mesin
[ ] Broadcast tampil
[ ] Build APK berhasil
[ ] Build AAB berhasil
```
