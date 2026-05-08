shuni chiroyli qilib korsata olsanmi bu readmd file uchun
# 🇯🇵 MinnaUz

**MinnaUz** — bu Yapon tilini online o‘rgatishga mo‘ljallangan platforma.  
Loyiha web va mobile ilovadan tashkil topgan.

## 📦 Loyihalar

### 1. Minna Web
- Framework: Next.js
- To‘liq web platforma
- Frontend qismi qanday ishga tushiraman
 - 1 Qadam papkaga kiramiz
  ```bash
   cd minna-web
  ```
 - 2 Qadam pakage larni install qilish
  ```bash
   npm i
  ```
 - 3 Qadam ishga tushirish
  ```bash
   npm run dev
  ```

  - .env file ni ham qo'yishni unutmang

### 2. MinnaUz Backend PHP
- Framework: Laravel
 - 1 Qadam paplaga kiramiz
  ```bash
    cd minn-api
  ```
 - 3 Qadam pakage install qilamiz
  ```bash
   composer i
  ```
 - 3 Qadam database ga sqlite file yaratish
  ```bash
    php artisan migrate:fresh
  ```
 - 4 Qadam
  ```bash
    php artisan serve
  ```
  - .env file ni qo'yishni unutmang

### 3. MinnaUz Mobile App
- Framework: React Native (Expo)
- Android va iOS qurilmalari uchun mobile ilova

---
