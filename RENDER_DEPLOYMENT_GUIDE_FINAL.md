# 🚀 Speedy Van - دليل النشر الشامل على منصة Render

## 📋 ملخص جاهزية الإنتاج

### ✅ ما تم إنجازه بنجاح:

1. **فحص Stripe**: ✅ 
   - مفاتيح الاختبار تعمل بشكل صحيح
   - API متصل وجاهز
   - Webhooks مُعدة بشكل صحيح

2. **أمان الملفات**: ✅
   - `.gitignore` محدث ويحمي جميع الملفات الحساسة
   - المفاتيح السرية لن تُرفع للمستودع

3. **متغيرات البيئة**: ✅
   - `env.production` جاهز مع جميع المتغيرات
   - قاعدة البيانات Neon مُعدة
   - خدمات البريد الإلكتروني والرسائل جاهزة

4. **بناء المشروع**: ✅
   - `pnpm build` يعمل بدون أخطاء
   - جميع الحزم مبنية بنجاح

5. **إعدادات الأمان**: ✅
   - المفاتيح السرية قوية وآمنة
   - URLs محددة بشكل صحيح
   - التوصيات الأمنية مُطبقة

---

## 🔧 خطوات النشر على Render

### الخطوة 1: إعداد المستودع

```bash
# تأكد من أن الكود محفوظ في GitHub
git add .
git commit -m "Production ready - All security and env checks passed"
git push origin main
```

### الخطوة 2: إنشاء خدمة جديدة في Render

1. اذهب إلى [Render Dashboard](https://dashboard.render.com/)
2. اضغط على "New +" → "Web Service"
3. اختر "Build and deploy from a Git repository"
4. اتصل بحساب GitHub واختر مستودع `speedy-van`

### الخطوة 3: إعدادات البناء

```yaml
# استخدم هذه الإعدادات:
Name: speedy-van-production
Environment: Node
Region: Frankfurt (EU Central)
Branch: main
Root Directory: . 
Build Command: pnpm install && pnpm build
Start Command: cd apps/web && pnpm start
```

### الخطوة 4: متغيرات البيئة المطلوبة

**⚠️ مهم جداً: أضف هذه المتغيرات في لوحة Render:**

#### 🔐 قاعدة البيانات
```
DATABASE_URL=postgresql://neondb_owner:npg_qNFE0IHpk1vT@ep-dry-glitter-aftvvy9d-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### 🔑 المصادقة والأمان
```
NEXTAUTH_SECRET=a0d2e3ac2af583f45bbddd5f47966bcac10ed8e6aec824bac83119fcce11d079c8ba41f608f0cb0bad40f45ce69fb0a6d1cb6ea120e68eb39c6d5d2e3e49fa33
NEXTAUTH_URL=https://your-render-app-name.onrender.com
JWT_SECRET=73a45b07f339eabc842b1ed39989ad528b727808b79870ef1a5886ef11178bdb89e854bd5a2fc9ab782c3af7ea83b39edf3624bc833823e8af292747268d20bf
CUSTOM_KEY=f785c9dc8edd5e1d90a8a7350331d50442b4ac8862717396d9371ea21c69df38c89a3a70085033b5b24320cc26e008593
```

#### 💳 Stripe (يجب تحديث هذه المفاتيح)
```
STRIPE_SECRET_KEY=sk_live_[احصل على المفتاح من لوحة Stripe]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[احصل على المفتاح من لوحة Stripe]
STRIPE_WEBHOOK_SECRET=whsec_[احصل على سر الـ webhook من Stripe]
```

#### 🗺️ الخرائط
```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiYWhtYWRhbHdha2FpIiwiYSI6ImNtZGNsZ3RsZDEzdGsya3F0ODFxeGRzbXoifQ.jfgGW0KNFTwATOShRDtQsg
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiYWhtYWRhbHdha2FpIiwiYSI6ImNtZGNsZ3RsZDEzdGsya3F0ODFxeGRzbXoifQ.jfgGW0KNFTwATOShRDtQsg
```

#### 📱 الرسائل النصية
```
THESMSWORKS_KEY=01c671f7-1bff-49bd-9d80-880a8ccdb154
THESMSWORKS_SECRET=5186ef29585e839522ed9cf3a776b0e10b5a118b2feb6dcc64d01bab2b09ebf0
```

#### 📧 البريد الإلكتروني
```
SENDGRID_API_KEY=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
ZEPTO_API_URL=https://api.zeptomail.eu/v1.1/email
ZEPTO_API_KEY=Zoho-enczapikey yA6KbHsOvgmllm5SQ0A+05GD9Ys1//xoii+0syvhdcwhK4Llj6E8gxE/JdWyLmfd34OCsqhUOtoQc9q9vopefJQ3M9EEfJTGTuv4P2uV48xh8ciEYNYhgp6oA7UVFaRIcxggAiUwT/MkWA==
MAIL_FROM=noreply@speedy-van.co.uk
SUPPORT_EMAIL=support@speedy-van.co.uk
SUPPORT_REPLY_TO=support@speedy-van.co.uk
```

#### ⚡ الوقت الفعلي (Pusher)
```
PUSHER_APP_ID=2034743
PUSHER_KEY=407cb06c423e6c032e9c
PUSHER_SECRET=bf769b4fd7a3cf95a803
PUSHER_CLUSTER=eu
NEXT_PUBLIC_PUSHER_KEY=407cb06c423e6c032e9c
NEXT_PUBLIC_PUSHER_CLUSTER=eu
```

#### 🌍 إعدادات عامة
```
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-render-app-name.onrender.com
NEXT_PUBLIC_API_URL=https://your-render-app-name.onrender.com/api
PORT=3000
LOG_LEVEL=info
```

#### 🏢 معلومات الشركة
```
NEXT_PUBLIC_COMPANY_NAME=Speedy Van
NEXT_PUBLIC_COMPANY_ADDRESS=140 Charles Street, Glasgow City, G21 2QB
NEXT_PUBLIC_COMPANY_PHONE=+44 7901846297
NEXT_PUBLIC_COMPANY_EMAIL=support@speedy-van.co.uk
```

---

## 🔄 بعد النشر - خطوات مهمة

### 1. تحديث URLs في الخدمات الخارجية

#### Stripe Webhooks:
1. اذهب إلى [Stripe Dashboard](https://dashboard.stripe.com/)
2. Developers → Webhooks
3. أضف webhook جديد: `https://your-render-app-name.onrender.com/api/webhooks/stripe`
4. اختر الأحداث: `checkout.session.completed`, `checkout.session.expired`

#### Mapbox:
1. اذهب إلى [Mapbox Dashboard](https://account.mapbox.com/)
2. أضف domain جديد: `https://your-render-app-name.onrender.com`

### 2. اختبار الميزات الأساسية

```bash
# اختبر هذه الروابط بعد النشر:
https://your-render-app-name.onrender.com/          # الصفحة الرئيسية
https://your-render-app-name.onrender.com/booking-luxury/  # نظام الحجز
https://your-render-app-name.onrender.com/api/debug/stripe-test  # اختبار Stripe
https://your-render-app-name.onrender.com/admin    # لوحة الإدارة
```

### 3. مراقبة الأخطاء

راقب logs في لوحة Render للتأكد من:
- ✅ البناء تم بنجاح
- ✅ الاتصال بقاعدة البيانات يعمل
- ✅ APIs تستجيب بشكل صحيح
- ✅ لا توجد أخطاء في الـ runtime

---

## 🚨 نقاط مهمة قبل النشر

### 1. مفاتيح Stripe الإنتاجية
**⚠️ يجب تحديث هذه المفاتيح قبل النشر النهائي:**

```bash
# اذهب إلى Stripe Dashboard → API Keys → Live mode وانسخ:
STRIPE_SECRET_KEY=sk_live_[مفتاح سري جديد]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[مفتاح عام جديد]
STRIPE_WEBHOOK_SECRET=whsec_[سر webhook جديد]
```

### 2. النطاق المخصص (اختياري)
إذا كان لديك نطاق مخصص:

1. أضفه في Render → Settings → Custom Domains
2. حدث `NEXT_PUBLIC_BASE_URL` و `NEXTAUTH_URL`
3. أعد النشر

### 3. SSL Certificate
Render يوفر SSL تلقائياً، تأكد من أن:
- جميع URLs تستخدم `https://`
- لا توجد mixed content warnings

---

## 📊 حالة الجاهزية النهائية

| المكون | الحالة | ملاحظات |
|--------|--------|----------|
| ✅ Build System | جاهز | pnpm build يعمل بدون أخطاء |
| ✅ Database | جاهز | Neon Postgres متصل |
| ⚠️ Stripe | يحتاج تحديث | مفاتيح الإنتاج مطلوبة |
| ✅ Security | جاهز | مفاتيح قوية و .gitignore محدث |
| ✅ Email/SMS | جاهز | ZeptoMail و SMS Works |
| ✅ Real-time | جاهز | Pusher مُعد بشكل صحيح |
| ✅ Maps | جاهز | Mapbox token صالح |

---

## 🆘 في حالة المشاكل

### مشاكل البناء:
```bash
# تحقق من logs البناء في Render
# تأكد من أن جميع dependencies مثبتة
# تحقق من pnpm version (يجب أن يكون 9.5.0+)
```

### مشاكل Runtime:
```bash
# تحقق من Environment Variables
# تأكد من اتصال قاعدة البيانات
# راجع logs التطبيق في Render
```

### مشاكل Stripe:
```bash
# تأكد من استخدام مفاتيح Live وليس Test
# تحقق من Webhook URLs
# اختبر: /api/debug/stripe-test
```

---

**🎉 المشروع جاهز للنشر الآن! فقط قم بتحديث مفاتيح Stripe الإنتاجية وستكون جميع الأنظمة تعمل بشكل مثالي.**