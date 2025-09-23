# Speedy Van - Render Deployment Guide

## نظرة عامة
هذا دليل النشر على منصة Render لمشروع Speedy Van - منصة التوصيل المتقدمة.

## المتطلبات الأساسية

### 1. متغيرات البيئة المطلوبة
يجب إضافة المتغيرات التالية في لوحة تحكم Render:

#### متغيرات قاعدة البيانات
- `DATABASE_URL` - رابط قاعدة البيانات PostgreSQL

#### متغيرات المصادقة
- `NEXTAUTH_SECRET` - مفتاح سري لـ NextAuth
- `NEXTAUTH_URL` - رابط التطبيق (https://speedy-van.co.uk)
- `JWT_SECRET` - مفتاح JWT

#### متغيرات Stripe
- `STRIPE_SECRET_KEY` - المفتاح السري لـ Stripe
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - المفتاح العام لـ Stripe
- `STRIPE_WEBHOOK_SECRET` - مفتاح webhook لـ Stripe

#### متغيرات الخرائط
- `NEXT_PUBLIC_MAPBOX_TOKEN` - مفتاح Mapbox

#### متغيرات الرسائل النصية
- `THESMSWORKS_KEY` - مفتاح The SMS Works
- `THESMSWORKS_SECRET` - السر لـ The SMS Works
- `THESMSWORKS_JWT` - JWT لـ The SMS Works

#### متغيرات البريد الإلكتروني
- `SENDGRID_API_KEY` - مفتاح SendGrid
- `ZEPTO_API_KEY` - مفتاح ZeptoMail
- `ZEPTO_API_URL` - رابط ZeptoMail API
- `MAIL_FROM` - عنوان البريد الإلكتروني المرسل

#### متغيرات Pusher
- `PUSHER_APP_ID` - معرف تطبيق Pusher
- `PUSHER_KEY` - مفتاح Pusher
- `PUSHER_SECRET` - سر Pusher
- `PUSHER_CLUSTER` - مجموعة Pusher (eu)
- `NEXT_PUBLIC_PUSHER_KEY` - المفتاح العام لـ Pusher
- `NEXT_PUBLIC_PUSHER_CLUSTER` - المجموعة العامة لـ Pusher

#### متغيرات التطبيق
- `NEXT_PUBLIC_API_URL` - رابط API (https://api.speedy-van.co.uk)
- `NEXT_PUBLIC_BASE_URL` - رابط التطبيق الأساسي (https://speedy-van.co.uk)
- `NEXT_PUBLIC_COMPANY_NAME` - اسم الشركة (Speedy Van)
- `NEXT_PUBLIC_COMPANY_ADDRESS` - عنوان الشركة
- `NEXT_PUBLIC_COMPANY_PHONE` - هاتف الشركة (+44 7901846297)
- `NEXT_PUBLIC_COMPANY_EMAIL` - بريد الشركة (support@speedy-van.co.uk)
- `CUSTOM_KEY` - مفتاح مخصص
- `LOG_LEVEL` - مستوى السجلات (info)
- `NEXT_PUBLIC_WEATHER_API_KEY` - مفتاح API الطقس
- `OPENAI_API_KEY` - مفتاح OpenAI

### 2. إعداد قاعدة البيانات
1. إنشاء قاعدة بيانات PostgreSQL في Render
2. نسخ رابط الاتصال إلى متغير `DATABASE_URL`
3. تشغيل migrations:
   ```bash
   pnpm run prisma:migrate
   ```

### 3. إعداد النطاق
1. ربط النطاق `speedy-van.co.uk` مع خدمة Render
2. إعداد SSL certificate
3. التأكد من أن `NEXTAUTH_URL` يشير إلى النطاق الصحيح

## خطوات النشر

### 1. رفع الكود إلى GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. إنشاء خدمة جديدة في Render
1. تسجيل الدخول إلى Render Dashboard
2. النقر على "New +" ثم "Web Service"
3. ربط المستودع من GitHub
4. اختيار الفرع `main`

### 3. إعداد الخدمة
- **Name**: speedy-van-web
- **Environment**: Node
- **Plan**: Starter (أو أعلى حسب الحاجة)
- **Build Command**: 
  ```bash
  corepack enable
  pnpm install
  pnpm run prisma:generate
  pnpm run build
  ```
- **Start Command**: 
  ```bash
  pnpm start --filter=@speedy-van/app
  ```

### 4. إضافة متغيرات البيئة
إضافة جميع المتغيرات المذكورة أعلاه في قسم Environment Variables

### 5. إعداد قاعدة البيانات
1. إنشاء PostgreSQL database
2. نسخ connection string إلى `DATABASE_URL`
3. تشغيل migrations بعد النشر

## التحقق من النشر

### 1. فحص السجلات
- مراجعة build logs للتأكد من نجاح البناء
- فحص runtime logs للتأكد من عدم وجود أخطاء

### 2. اختبار الوظائف الأساسية
- تسجيل الدخول
- إنشاء طلب توصيل
- معالجة الدفع
- تتبع الطلب

### 3. اختبار الأداء
- فحص سرعة التحميل
- اختبار الاستجابة على الأجهزة المختلفة
- مراقبة استخدام الموارد

## استكشاف الأخطاء

### مشاكل شائعة
1. **فشل البناء**: التحقق من متغيرات البيئة المطلوبة
2. **أخطاء قاعدة البيانات**: التأكد من صحة `DATABASE_URL`
3. **مشاكل Stripe**: التحقق من مفاتيح Stripe
4. **مشاكل Pusher**: التأكد من إعدادات Pusher

### نصائح الأداء
1. استخدام خطة أعلى إذا كان التطبيق بطيئاً
2. تفعيل CDN لتحسين الأداء
3. مراقبة استخدام الذاكرة والمعالج

## الصيانة

### تحديثات دورية
1. تحديث dependencies
2. مراجعة السجلات
3. اختبار الوظائف بعد التحديثات

### النسخ الاحتياطي
1. نسخ احتياطي دوري لقاعدة البيانات
2. حفظ نسخ من متغيرات البيئة
3. توثيق التغييرات

## الدعم
للحصول على الدعم، يرجى التواصل على:
- البريد الإلكتروني: support@speedy-van.co.uk
- الهاتف: +44 7901846297
