# Feature Map - MESINKU

Dokumen ini memetakan fitur MESINKU versi HTML/JavaScript ke struktur Flutter/Dart target.

Gunakan dokumen ini sebagai checklist agar porting tidak keluar jalur.

---

## Ringkasan Mapping

| Fitur | Web Saat Ini | Flutter Target | Prioritas |
|---|---|---|---|
| Login | `login.html` | `LoginPage` | Tinggi |
| Logout | `logout()` di `firebase.js` | `AuthService.logout()` | Tinggi |
| Dashboard | `index.html` | `DashboardPage` | Tinggi |
| Navbar | `navbar()` di `app.js` | `AppNavbar` / route layout | Tinggi |
| Status mesin | `renderMachineListCompact()` | `LiveMachinesPage`, `MachineService` | Tinggi |
| Mulai sesi | `start_session.html` | `StartSessionPage`, `SessionService.startSession()` | Sangat tinggi |
| Sesi saya | `my_session.html` | `MySessionPage`, `SessionService.watchMySession()` | Sangat tinggi |
| Riwayat | `renderHistoryCompact()` | `HistoryPage`, `HistoryService` | Tinggi |
| Broadcast | `renderBroadcastPanel()` | `BroadcastWidget`, `BroadcastService` | Sedang |
| Running text | `initPesanMarquee()`, `renderRunningTextHome()` | `RunningTextWidget` | Sedang |
| Presence online | `setOnlinePresence()` | `PresenceService` | Tinggi |
| Admin mesin | `initManageMachines()` | `ManageMachinesPage` | Sedang |
| Badge navbar | `nav_badge.js` | `NavbarBadgeController` | Rendah-sedang |
| Kendala | `kendala.html` | `KendalaPage` | Sedang |
| Chat broadcast | `notifikasi.html` / `user_messages` | `NotificationPage` | Sedang |
| Anggota online | `status_anggota.html` | `StatusAnggotaPage` | Sedang |

---

## 1. Auth / Login

### Web Saat Ini

File terkait:

```text
login.html
assets/js/firebase.js
```

Function terkait:

```text
getUser()
setUser()
clearUser()
requireLogin()
logout()
```

Data lokal:

```text
localStorage key: mesinku_user
```

### Flutter Target

File target:

```text
lib/features/auth/login_page.dart
lib/data/services/auth_service.dart
lib/data/services/local_user_service.dart
lib/data/models/app_user.dart
```

Function target:

```text
AuthService.login()
AuthService.logout()
LocalUserService.saveUser()
LocalUserService.getUser()
LocalUserService.clearUser()
```

Storage Flutter:

```text
shared_preferences
```

Checklist:

```text
[ ] Login berhasil
[ ] User tersimpan lokal
[ ] Role user terbaca
[ ] Gedung user terbaca
[ ] Logout menghapus user lokal
[ ] Route guard bekerja
```

---

## 2. Dashboard

### Web Saat Ini

File:

```text
index.html
assets/js/app.js
assets/js/firebase.js
assets/js/feature_loader.js
assets/js/nav_badge.js
```

Function dipanggil:

```text
requireLogin()
setOnlinePresence()
navbar()
renderHistoryCompact()
renderBroadcastPanel()
initPesanMarquee()
```

### Flutter Target

File target:

```text
lib/features/dashboard/dashboard_page.dart
lib/core/widgets/app_navbar.dart
lib/core/widgets/app_card.dart
lib/core/widgets/status_badge.dart
```

Isi dashboard:

```text
- Header app
- Pesan penting / broadcast
- Riwayat pemakaian compact
- Tombol Pakai Mesin
- Tombol Selesai Pakai Mesin
- Navbar / menu utama
```

Checklist:

```text
[ ] Dashboard hanya bisa dibuka setelah login
[ ] Broadcast tampil
[ ] Riwayat compact tampil
[ ] Tombol Pakai Mesin route ke StartSessionPage
[ ] Tombol Selesai Pakai Mesin route ke MySessionPage
[ ] Presence aktif saat dashboard dibuka
```

---

## 3. Status Mesin

### Web Saat Ini

Function:

```text
renderMachineListCompact(containerId)
```

Firebase path:

```text
machines
```

Filter:

```text
isActive !== false
status available / in_use
```

### Flutter Target

File target:

```text
lib/features/machines/live_machines_page.dart
lib/data/models/machine_model.dart
lib/data/services/machine_service.dart
```

Function target:

```text
MachineService.watchMachines()
MachineService.watchActiveMachines()
MachineService.watchAvailableMachines()
```

Checklist:

```text
[ ] Mesin tampil realtime
[ ] Mesin nonaktif tidak ditampilkan pada list user
[ ] Status available tampil benar
[ ] Status in_use tampil benar
[ ] Durasi pemakaian tampil jika sedang dipakai
[ ] Mesin urut berdasarkan kode
```

---

## 4. Start Session / Pakai Mesin

### Web Saat Ini

File:

```text
start_session.html
```

Firebase path:

```text
machines
active_sessions
```

Logic utama:

```text
- Load mesin available
- Cek user masih punya sesi aktif atau tidak
- Cek mesin ada
- Cek mesin aktif
- Cek status mesin available
- Cek lockedByKendala
- Buat session baru
- Update active_sessions/{uid}
- Update machines/{machine_id}/status menjadi in_use
- Update currentUser
- Update currentSessionId
- Update inUseSince
```

### Flutter Target

File target:

```text
lib/features/sessions/start_session_page.dart
lib/data/services/session_service.dart
lib/data/services/machine_service.dart
lib/data/models/session_model.dart
```

Function target:

```text
SessionService.startSession()
MachineService.watchAvailableMachines()
```

Checklist:

```text
[ ] Select mesin available tampil
[ ] Gedung otomatis dari profil user
[ ] Input tujuan tersedia
[ ] Input lokasi tujuan tersedia
[ ] Input dari mana tersedia
[ ] Input catatan tersedia
[ ] User tidak bisa mulai sesi dobel
[ ] Mesin in_use tidak bisa dipilih
[ ] Mesin lockedByKendala tidak bisa dipakai
[ ] Setelah mulai, status mesin berubah in_use
[ ] active_sessions/{uid} terisi
```

---

## 5. My Session / Sesi Saya

### Web Saat Ini

File:

```text
my_session.html
```

Function:

```text
renderMyActiveSession("activeSessionBox")
```

Firebase path:

```text
active_sessions/{uid}
machines/{machine_id}
history
```

### Flutter Target

File target:

```text
lib/features/sessions/my_session_page.dart
lib/data/services/session_service.dart
lib/data/services/history_service.dart
```

Function target:

```text
SessionService.watchMySession()
SessionService.endSession()
```

Checklist:

```text
[ ] Sesi aktif user tampil
[ ] Jika tidak ada sesi, tampil pesan kosong
[ ] Durasi sesi berjalan tampil
[ ] Tombol selesai tersedia
[ ] Saat selesai, active_sessions/{uid} dihapus
[ ] machines/{machine_id} kembali available
[ ] currentUser kosong
[ ] currentSessionId kosong
[ ] history terisi
```

---

## 6. History / Riwayat

### Web Saat Ini

Function:

```text
renderHistoryCompact(containerId)
```

Firebase path:

```text
history
machines_list
```

Logic:

```text
- Sync machines ke machines_list
- Ambil history limitToLast(80)
- Sort berdasarkan endAt/endedAt/startAt/startedAt
- Ambil 20 data terbaru
- Tampilkan nama mesin, user, tujuan, lokasi, waktu, durasi
```

### Flutter Target

File target:

```text
lib/features/history/history_page.dart
lib/data/models/history_model.dart
lib/data/services/history_service.dart
```

Function target:

```text
HistoryService.watchRecentHistory()
MachineService.syncMachinesList()
```

Checklist:

```text
[ ] History tampil realtime
[ ] Data terbaru tampil paling atas
[ ] Nama mesin fallback dari machines_list
[ ] Field lama tetap terbaca
[ ] Durasi dihitung jika durationMinutes kosong
[ ] Tampilan kosong jika belum ada history
```

---

## 7. Broadcast / Pesan Penting

### Web Saat Ini

Function:

```text
renderBroadcastPanel()
```

Firebase path:

```text
broadcast
```

Type pesan:

```text
info
important
urgent
```

### Flutter Target

File target:

```text
lib/data/models/broadcast_model.dart
lib/data/services/broadcast_service.dart
lib/core/widgets/broadcast_card.dart
```

Checklist:

```text
[ ] Broadcast tampil jika active true
[ ] Jika kosong, tampil "Belum ada broadcast"
[ ] Type info tampil normal
[ ] Type important tampil sebagai peringatan
[ ] Type urgent tampil sebagai darurat
[ ] updatedAt dan updatedByName tampil
```

---

## 8. Running Text

### Web Saat Ini

Function terkait:

```text
renderRunningTextHome()
initPesanMarquee()
```

Firebase path:

```text
pesan_running
```

### Flutter Target

File target:

```text
lib/data/models/running_text_model.dart
lib/data/services/running_text_service.dart
lib/core/widgets/running_text_widget.dart
```

Checklist:

```text
[ ] Running text tampil jika active true
[ ] Text kosong tidak tampil
[ ] Arah kiri/kanan didukung
[ ] Blink didukung jika diperlukan
[ ] Size/color/background dikonversi aman ke Flutter
```

---

## 9. Admin Manage Machines

### Web Saat Ini

Function:

```text
initManageMachines()
```

Role:

```text
admin
superadmin
```

Fitur:

```text
- Lihat semua mesin
- Filter status
- Filter group
- Search mesin
- Aktifkan/nonaktifkan mesin
- Force available
- Heal mesin
```

### Flutter Target

File target:

```text
lib/features/machines/manage_machines_page.dart
lib/data/services/machine_service.dart
```

Checklist:

```text
[ ] Hanya admin/superadmin bisa akses
[ ] List semua mesin tampil
[ ] Search bekerja
[ ] Filter status bekerja
[ ] Filter group bekerja
[ ] Toggle aktif/nonaktif bekerja
[ ] Force available bekerja
[ ] Heal mesin bekerja
```

---

## 10. Navbar dan Badge

### Web Saat Ini

File:

```text
assets/js/nav_badge.js
```

Firebase path:

```text
user_messages
patch_gate
```

### Flutter Target

File target:

```text
lib/core/widgets/app_navbar.dart
lib/data/services/notification_service.dart
lib/data/services/patch_gate_service.dart
```

Checklist:

```text
[ ] Navbar tampil berdasarkan role
[ ] Admin menu hanya tampil untuk admin/superadmin
[ ] Badge chat muncul saat ada pesan baru
[ ] Badge patch muncul jika patch_gate enabled
[ ] Badge hilang setelah halaman dibuka
```

---

## 11. Kendala

### Web Saat Ini

File terkait:

```text
kendala.html
```

Data kemungkinan terkait:

```text
machines/{id}/lockedByKendala
kendala
```

### Flutter Target

File target:

```text
lib/features/kendala/kendala_page.dart
lib/data/models/kendala_model.dart
lib/data/services/kendala_service.dart
```

Checklist:

```text
[ ] User bisa lapor kendala
[ ] Kendala ringan/sedang/berat terbaca
[ ] Kendala berat bisa mengunci mesin
[ ] Admin bisa melihat kendala
[ ] Admin bisa menyelesaikan kendala
[ ] Mesin bisa unlock setelah kendala selesai
```

---

## 12. Status Anggota

### Web Saat Ini

File terkait:

```text
status_anggota.html
```

Firebase path:

```text
users_online
```

### Flutter Target

File target:

```text
lib/features/anggota/status_anggota_page.dart
lib/data/services/presence_service.dart
```

Checklist:

```text
[ ] List user online tampil
[ ] last_seen terbaca
[ ] User offline bisa dideteksi dari selisih waktu
[ ] Role dan gedung tampil
```

---

## Prioritas Pengerjaan

Urutan final yang disarankan:

```text
1. Auth / Login
2. Dashboard
3. Machine Service
4. Start Session
5. My Session
6. History
7. Live Machines
8. Presence
9. Broadcast
10. Admin Manage Machines
11. Kendala
12. Notification / Chat
13. Badge Navbar
14. Running Text
```

---

## Catatan Penting

- Jangan port fitur admin sebelum fitur user stabil.
- Jangan ubah nama path Firebase saat porting awal.
- Gunakan model yang toleran terhadap field lama.
- Setiap fitur harus punya service sendiri.
- Hindari logic Firebase langsung ditaruh di widget terlalu banyak.
- Gunakan `StreamBuilder` untuk data realtime.
- Gunakan `FutureBuilder` untuk data sekali ambil.
