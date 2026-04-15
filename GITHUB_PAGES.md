# GitHub Pages для `MrNeBwa.github.io` + домен `nebwa.me`

Этот проект уже подготовлен под ваш кейс:
- `vite.config.ts`: `base: '/'`
- `package.json`: есть скрипт `deploy`
- `public/CNAME`: `nebwa.me`

---

## 🚀 Что сделать на вашей стороне (1 раз)

### 1) Убедиться, что remote правильный

```bash
git remote -v
```

Должно быть:

```text
origin  https://github.com/MrNeBwa/MrNeBwa.github.io.git
```

Если отличается:

```bash
git remote set-url origin https://github.com/MrNeBwa/MrNeBwa.github.io.git
```

---

### 2) Запушить `main`

```bash
git add .
git commit -m "Configure GitHub Pages for nebwa.me"
git push origin main
```

---

### 3) Опубликовать сайт

```bash
npm run deploy
```

Команда соберёт проект и загрузит `dist` в ветку `gh-pages`.

---

### 4) Включить Pages в GitHub

`Repository Settings` → `Pages`:
- Source: `Deploy from a branch`
- Branch: `gh-pages`
- Folder: `/ (root)`

Сохранить.

---

## 🌐 Настройка домена `nebwa.me`

В `Settings` → `Pages` укажите `Custom domain`: `nebwa.me` и включите `Enforce HTTPS`.

### DNS записи у регистратора домена

Для apex-домена `nebwa.me` (A-записи):

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Для `www` (рекомендуется):

```text
CNAME  www  MrNeBwa.github.io
```

---

## ✅ Проверка

После обновления DNS (обычно 5–60 минут, иногда до 24 часов):
- `https://nebwa.me` должен открывать сайт
- `https://www.nebwa.me` (если добавили CNAME) тоже

---

## ⚠️ Если видите белый экран

Проверить:
- в `vite.config.ts` стоит `base: '/'`
- в `public/CNAME` ровно `nebwa.me`
- после изменений выполнен `npm run deploy`
- в браузере сделан hard refresh (`Ctrl+Shift+R`)

---

## Полезные команды

```bash
npm run build
npm run deploy
git branch -a
git remote -v
```
