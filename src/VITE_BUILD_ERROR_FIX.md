# 🔧 حل خطأ Vite Build: "Rollup failed to resolve import"

## 🎯 ملخص سريع:

```
الخطأ: error during build:
      [vite]: Rollup failed to resolve import "/src/main.jsx"
      
السبب:   ملف main.jsx غير موجود أو في مسار خاطئ
الحل:    تنظيم المجلدات والملفات بشكل صحيح
```

---

## 🚨 المشكلة:

```
الخطأ الكامل:
[vite]: Rollup failed to resolve import "/src/main.jsx" from "/vercel/path0/index.html".

معناه:  Vite يبحث عن ملف src/main.jsx
         لكنه لم يجده!
```

---

## ✅ الحل الصحيح:

### المشكلة الأساسية:

```
هيكل المشروع غير صحيح!
يجب أن يكون:

osraaccounting/
├── src/
│   ├── main.jsx          ← مهم جداً!
│   └── App.jsx
├── index.html
├── package.json
├── vite.config.js
└── إلخ...
```

---

## 📋 الخطوات لإصلاح:

### الخطوة 1: تحقق من هيكل المشروع

على جهازك المحلي، يجب أن يكون لديك:

```
osraaccounting/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   └── index.css (اختياري)
├── public/
│   └── vite.svg (اختياري)
├── index.html
├── package.json
├── vite.config.js
├── clinic-manager.jsx
├── README.md
└── .gitignore
```

---

### الخطوة 2: تأكد من محتوى src/main.jsx

الملف يجب أن يكون كالتالي:

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

### الخطوة 3: تأكد من محتوى src/App.jsx

```javascript
import ClinicManager from '../clinic-manager.jsx'

export default function App() {
  return <ClinicManager />
}
```

---

### الخطوة 4: تأكد من محتوى index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>osraaccounting</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

---

### الخطوة 5: تأكد من package.json

```json
{
  "name": "osraaccounting",
  "private": true,
  "version": "1.2.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "latest",
    "recharts": "^2.15.4"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

### الخطوة 6: تأكد من vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
```

---

## 🔄 الحل الكامل:

### على جهازك المحلي:

```bash
# 1. احذف node_modules و package-lock.json
rm -rf node_modules package-lock.json

# أو على Windows:
rmdir /s node_modules
del package-lock.json

# 2. ثبت المكتبات مرة أخرى
npm install

# 3. اختبر محلياً
npm run dev

# 4. تحقق من عدم وجود أخطاء
# يجب أن يعمل بنجاح على http://localhost:5173
```

---

### ثم أرسل إلى GitHub:

```bash
# 1. أضف التغييرات
git add .

# 2. احفظ
git commit -m "Fix: Correct project structure for Vite"

# 3. أرسل
git push
```

---

### Vercel سيبني من جديد:

```
1. Vercel سيلاحظ التحديث
2. سيثبت المكتبات
3. سيبني البرنامج
4. سيُنشر الموقع

الانتظار: 2-5 دقائق
```

---

## 🚨 أخطاء شائعة:

### ❌ خطأ: مجلد src غير موجود

```
osraaccounting/
├── clinic-manager.jsx  ← في الجذر
├── index.html
└── ...
```

**✅ الحل:** أنشئ مجلد src:

```bash
mkdir src
mv clinic-manager.jsx src/
# أو انقل يدوياً
```

---

### ❌ خطأ: main.jsx في مكان خاطئ

```
osraaccounting/
├── main.jsx  ← في الجذر (خطأ!)
├── src/
└── ...
```

**✅ الحل:** انقل إلى src:

```bash
mv main.jsx src/
```

---

### ❌ خطأ: index.html يشير لمسار خاطئ

```html
<!-- خطأ -->
<script src="main.jsx"></script>

<!-- صحيح -->
<script type="module" src="/src/main.jsx"></script>
```

---

## 📊 البنية الصحيحة (النهائية):

```
osraaccounting/
│
├── src/                      ← مهم!
│   ├── main.jsx              ← entry point
│   ├── App.jsx
│   └── index.css (اختياري)
│
├── public/                   (اختياري)
│   └── vite.svg
│
├── index.html                ← root HTML
├── vite.config.js            ← config
├── package.json              ← dependencies
├── clinic-manager.jsx        ← component
├── vercel.json               ← deploy config
├── .gitignore
└── README.md
```

---

## ✅ قائمة التحقق:

```
[ ] مجلد src موجود
[ ] src/main.jsx موجود
[ ] src/App.jsx موجود
[ ] index.html موجود
[ ] index.html يشير لـ /src/main.jsx
[ ] package.json موجود
[ ] vite.config.js موجود
[ ] npm install تم تشغيله
[ ] npm run dev يعمل محلياً
[ ] لا أخطاء في console
[ ] git push تم بنجاح
```

---

## 🚀 الخطوات النهائية:

```bash
# 1. تأكد من البنية
ls -la

# 2. اختبر محلياً
npm run dev

# 3. في متصفح آخر
# اذهب إلى http://localhost:5173
# يجب أن يعمل بنجاح

# 4. إذا كل شيء تمام
git add .
git commit -m "Fix: Correct Vite project structure"
git push

# 5. انتظر Vercel (2-5 دقائق)
# ستظهر رسالة "Deployment successful"
```

---

## 🎯 إذا استمرت المشكلة:

### تحقق من الـ Build Log على Vercel:

```
1. اذهب إلى Vercel
2. اختر المشروع
3. اضغط "Deployments"
4. افتح آخر deployment
5. اضغط "Logs"
6. ابحث عن رسالة الخطأ بالضبط
```

---

## 💡 نصائح مهمة:

```
✅ استخدم Vite (ليس Create React App)
✅ البنية الصحيحة مهمة جداً
✅ src/main.jsx يجب أن يكون موجوداً
✅ اختبر محلياً قبل الرفع
✅ اقرأ Vercel logs للأخطاء
```

---

## 📝 المثال الكامل:

### أنشئ البنية من الصفر:

```bash
# 1. أنشئ مجلد
mkdir osraaccounting
cd osraaccounting

# 2. أنشئ مجلد src
mkdir src
mkdir public

# 3. أنسخ الملفات:
# - clinic-manager.jsx → src/
# - package.json → جذر
# - vite.config.js → جذر
# - index.html → جذر

# 4. أنشئ main.jsx في src/
cat > src/main.jsx << 'END'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
END

# 5. أنشئ App.jsx في src/
cat > src/App.jsx << 'END'
import ClinicManager from '../clinic-manager.jsx'

export default function App() {
  return <ClinicManager />
}
END

# 6. ثبت
npm install

# 7. اختبر
npm run dev
```

---

**آخر تحديث**: أغسطس 2, 2026

🎉 **الآن يجب أن يعمل بنجاح!**

