# Flutter Branch Workflow

Dokumen ini menjelaskan cara kerja branch untuk proses porting MESINKU ke Flutter/Dart.

---

## Branch Utama

```text
main
```

Branch `main` digunakan untuk menyimpan versi project HTML/CSS/JavaScript yang sudah berjalan saat ini.

Jangan gunakan `main` untuk eksperimen porting besar agar project lama tetap aman.

---

## Branch Porting

Branch yang digunakan untuk porting:

```text
flutter-port
```

Branch ini digunakan untuk:

- Membuat project Flutter baru.
- Memindahkan logic JavaScript ke Dart.
- Membuat model, service, dan screen Flutter.
- Testing APK/AAB.
- Menjaga agar versi HTML/JavaScript tidak rusak.

---

## Alur Kerja

```bash
git checkout main
git pull origin main
git checkout -b flutter-port
```

Jika branch sudah ada:

```bash
git checkout flutter-port
git pull origin flutter-port
```

---

## Aturan Commit

Gunakan commit kecil dan jelas.

Contoh:

```text
Add Flutter project scaffold
Add Firebase dependencies
Add user model
Add machine model
Add session service
Add dashboard page
```

Hindari commit besar seperti:

```text
update all
fix
new app
```

---

## Urutan Commit Awal yang Disarankan

```text
1. Add Flutter scaffold
2. Add Firebase setup
3. Add core constants and widgets
4. Add data models
5. Add Firebase services
6. Add auth pages
7. Add dashboard page
8. Add session pages
```

---

## Catatan

- Jangan hapus file HTML/JavaScript lama sebelum Flutter stabil.
- Jangan ubah path Firebase utama saat tahap awal porting.
- Gunakan dokumentasi di folder `docs/` sebagai panduan kerja.
