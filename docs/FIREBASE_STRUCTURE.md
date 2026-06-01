# Firebase Structure - MESINKU

Dokumen ini mencatat struktur Firebase Realtime Database yang digunakan oleh MESINKU.

Struktur ini wajib dijaga selama proses porting ke Flutter/Dart agar data lama tetap kompatibel.

---

## Firebase Service

Project saat ini menggunakan:

```text
Firebase Auth
Firebase Realtime Database
```

Project saat ini tidak memakai Firestore sebagai database utama.

---

## Path Utama

Path utama yang sudah terdeteksi:

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

---

## users_online

Digunakan untuk presence / status user online.

Path:

```text
users_online/{uid}
```

Contoh data:

```json
{
  "uid": "USER_UID",
  "name": "Nama User",
  "role": "crew",
  "gedung": "A",
  "last_seen": 1710000000000
}
```

Field:

| Field | Tipe | Keterangan |
|---|---|---|
| `uid` | string | UID user |
| `name` | string | Nama user |
| `role` | string | Role user: crew/admin/superadmin |
| `gedung` | string | Gedung user |
| `last_seen` | number | Timestamp terakhir aktif |

Flutter target:

```text
PresenceService
```

---

## machines

Digunakan untuk menyimpan data mesin utama.

Path:

```text
machines/{machineCode}
```

Contoh data:

```json
{
  "code": "AS-A",
  "type": "AS",
  "group": "A",
  "name": "Automatic Scrubber",
  "status": "available",
  "currentUser": null,
  "currentSessionId": null,
  "inUseSince": null,
  "updatedAt": 1710000000000,
  "isActive": true,
  "lockedByKendala": false
}
```

Field:

| Field | Tipe | Keterangan |
|---|---|---|
| `code` | string | Kode mesin |
| `type` | string | Jenis mesin |
| `group` | string | Area/gedung/group |
| `name` | string | Nama mesin |
| `status` | string | `available` atau `in_use` |
| `currentUser` | string/null | User yang sedang memakai |
| `currentSessionId` | string/null | ID sesi aktif, saat ini memakai UID user |
| `inUseSince` | number/null | Timestamp mulai digunakan |
| `updatedAt` | number | Timestamp update terakhir |
| `isActive` | boolean | Status aktif/nonaktif mesin |
| `lockedByKendala` | boolean | Mesin dikunci karena kendala berat |

Flutter target:

```text
MachineModel
MachineService
```

---

## machines_list

Digunakan sebagai daftar ringkas mesin untuk lookup nama mesin pada history.

Path:

```text
machines_list/{machineCode}
```

Contoh data:

```json
{
  "code": "AS-A",
  "name": "Automatic Scrubber",
  "group": "A",
  "updatedAt": 1710000000000
}
```

Catatan:

- Path ini bisa disinkronkan dari `machines`.
- Jangan dihapus saat porting karena history lama masih mengandalkan lookup ini.

Flutter target:

```text
MachineService.syncMachinesList()
```

---

## active_sessions

Digunakan untuk menyimpan sesi aktif user.

Path:

```text
active_sessions/{uid}
```

Contoh data:

```json
{
  "uid": "USER_UID",
  "username": "Nama User",
  "gedung": "A",
  "machine_id": "AS-A",
  "machine_name": "Automatic Scrubber",
  "tujuan": "Membersihkan area",
  "lokasiTujuan": "Lobby",
  "dariMana": "Gudang",
  "catatan": "-",
  "startAt": 1710000000000
}
```

Field:

| Field | Tipe | Keterangan |
|---|---|---|
| `uid` | string | UID user |
| `username` | string | Nama user |
| `gedung` | string | Gedung user |
| `machine_id` | string | Kode mesin |
| `machine_name` | string | Nama mesin |
| `tujuan` | string | Tujuan pemakaian |
| `lokasiTujuan` | string | Lokasi tujuan mesin dipakai |
| `dariMana` | string | Lokasi asal mesin |
| `catatan` | string | Catatan tambahan |
| `startAt` | number | Timestamp mulai sesi |

Flutter target:

```text
SessionModel
SessionService.startSession()
SessionService.watchMySession()
```

---

## history

Digunakan untuk menyimpan riwayat sesi mesin.

Path:

```text
history/{historyId}
```

Contoh data:

```json
{
  "uid": "USER_UID",
  "username": "Nama User",
  "gedung": "A",
  "machine_id": "AS-A",
  "machine_name": "Automatic Scrubber",
  "tujuan": "Membersihkan area",
  "lokasiTujuan": "Lobby",
  "dariMana": "Gudang",
  "catatan": "-",
  "startAt": 1710000000000,
  "endAt": 1710003600000,
  "durationMinutes": 60,
  "endedByName": "Nama User"
}
```

Field lama yang perlu ditoleransi:

```text
machine_id
machineId
machine_name
machineName
startAt
startedAt
endAt
endedAt
username
userName
createdByName
endedByName
```

Flutter model harus toleran terhadap variasi field lama ini.

Flutter target:

```text
HistoryModel
HistoryService
```

---

## broadcast

Digunakan untuk pesan penting dari admin.

Path:

```text
broadcast
```

Contoh data:

```json
{
  "active": true,
  "type": "info",
  "title": "Informasi",
  "message": "Pesan penting",
  "updatedAt": 1710000000000,
  "updatedByName": "Admin"
}
```

Field:

| Field | Tipe | Keterangan |
|---|---|---|
| `active` | boolean | Status aktif pesan |
| `type` | string | `info`, `important`, `urgent` |
| `title` | string | Judul pesan |
| `message` | string | Isi pesan |
| `updatedAt` | number | Timestamp update |
| `updatedByName` | string | Nama admin pengubah |

Flutter target:

```text
BroadcastModel
BroadcastService
```

---

## pesan_running

Digunakan untuk running text / pesan berjalan.

Path:

```text
pesan_running
```

Contoh data:

```json
{
  "active": true,
  "text": "Pesan berjalan",
  "size": 16,
  "speed": 16,
  "color": "#4aa3ff",
  "bg": "rgba(255,255,255,0.04)",
  "dir": "left",
  "blink": false
}
```

Flutter target:

```text
RunningTextModel
RunningTextService
RunningTextWidget
```

Catatan:

- Properti CSS seperti `rgba()` perlu dikonversi ke Color Flutter.
- Animasi running text perlu dibuat ulang dengan widget Flutter.

---

## user_messages

Digunakan untuk chat / broadcast user dan badge notifikasi.

Path:

```text
user_messages/{messageId}
```

Contoh data umum:

```json
{
  "message": "Isi pesan",
  "createdBy": "USER_UID",
  "createdByName": "Nama User",
  "createdAt": 1710000000000
}
```

Flutter target:

```text
NotificationService
ChatBroadcastPage
NavbarBadgeController
```

---

## patch_gate

Digunakan untuk penanda patch/update tertentu pada navbar badge.

Path:

```text
patch_gate
```

Contoh data:

```json
{
  "enabled": true
}
```

Flutter target:

```text
PatchGateService
NavbarBadgeController
```

---

## Catatan Kompatibilitas

Saat porting, hindari mengganti nama field berikut secara langsung:

```text
machine_id
machine_name
startAt
endAt
active_sessions
machines
history
```

Jika ingin merapikan nama field, lakukan setelah Flutter stabil dan gunakan migration script terpisah.

---

## Checklist Firebase Flutter

```text
[ ] Firebase Core aktif
[ ] Firebase Auth aktif
[ ] Firebase Database aktif
[ ] Rules database dicek
[ ] User bisa login
[ ] User local tersimpan
[ ] Presence menulis ke users_online
[ ] Machine stream membaca machines
[ ] Start session update active_sessions dan machines
[ ] End session update history dan machines
[ ] Broadcast stream membaca broadcast
```
