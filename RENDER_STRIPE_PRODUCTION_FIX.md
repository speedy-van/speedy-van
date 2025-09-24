# 🚨 URGENT: Stripe Production Configuration Fix

## المشكلة
Stripe لا يزال في وضع الاختبار في booking-luxury step 2، مما يعني أن المدفوعات لا تعمل في الإنتاج.

## الحل السريع

### 1. اذهب إلى Render Dashboard
1. افتح مشروعك في Render
2. اذهب إلى **Environment** tab
3. تأكد من وجود هذه المتغيرات:

### 2. متغيرات Stripe المطلوبة (الإنتاج)
```
STRIPE_SECRET_KEY=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

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51Rp06mBpmFIwZiSMBP8AYxDhTznhg6vBscxblxthVbk52ilyB4zlnKrC2IcnvVyXF2dv0mvOd2whaTXCZIsEonFo00izEP3DhS

STRIPE_WEBHOOK_SECRET=whsec_1fe8d3923c5aad30a4df3fe785c2db5b13c1ccbb4d3c333b311b5b3f5e366b72
```

### 3. متغيرات أخرى مطلوبة
```
DATABASE_URL=postgresql://neondb_owner:npg_qNFE0IHpk1vT@ep-dry-glitter-aftvvy9d-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NEXTAUTH_SECRET=ZV6xh/oJhYk9wwrjX5RA5JgjC9uCSuWZHpIprjYs2LA=
NEXTAUTH_URL=https://speedy-van.co.uk

JWT_SECRET=b8a0e10574e514dfa383b30da00de05d

NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiYWhtYWRhbHdha2FpIiwiYSI6ImNtZGNsZ3RsZDEzdGsya3F0ODFxeGRzbXoifQ.jfgGW0KNFTwATOShRDtQsg

THESMSWORKS_KEY=3a68c7e9-7159-4326-b886-bb853df9ba8a
THESMSWORKS_SECRET=a0a85d1a5d275ccc0e7d30a3d8b359803fccde8a9c03442464395b43c97e3720
THESMSWORKS_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiIzYTY4YzdlOS03MTU5LTQzMjYtYjg4Ni1iYjg1M2RmOWJhOGEiLCJzZWNyZXQiOiJhMGE4NWQxYTVkMjc1Y2NjMGU3ZDMwYTNkOGIzNTk4MDNmY2NkZThhOWMwMzQ0MjQ2NDM5NWI0M2M5N2UzNzIwIiwiaWF0IjoxNzU2MzY4MTA0LCJleHAiOjI1NDQ3NjgxMDR9.tm3DX2_BZbgra_eEHpudL8GJI_RizeluKg7ujj-sik8

SENDGRID_API_KEY=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

ZEPTO_API_URL=https://api.zeptomail.eu/v1.1/email
ZEPTO_API_KEY=Zoho-enczapikey yA6KbHsOvgmllm5SQ0A+05GD9Ys1//xoii+0syvhdcwhK4Llj6E8gxE/JdWyLmfd34OCsqhUOtoQc9q9vopefJQ3M9EEfJTGTuv4P2uV48xh8ciEYNYhgp6oA7UVFaRIcxggAiUwT/MkWA==
MAIL_FROM=noreply@speedy-van.co.uk

PUSHER_APP_ID=2034743
PUSHER_KEY=407cb06c423e6c032e9c
PUSHER_SECRET=bf769b4fd7a3cf95a803
PUSHER_CLUSTER=eu
NEXT_PUBLIC_PUSHER_KEY=407cb06c423e6c032e9c
NEXT_PUBLIC_PUSHER_CLUSTER=eu

OPENAI_API_KEY=sk-proj-f0OFp|4R6bbWZj9cgild

NEXT_PUBLIC_WEATHER_API_KEY=711e7ee2cc824e107d9a9a3bec4cfd0a

NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://speedy-van.co.uk
NEXT_PUBLIC_API_URL=https://api.speedy-van.co.uk
NEXT_PUBLIC_COMPANY_NAME=Speedy Van
NEXT_PUBLIC_COMPANY_ADDRESS=140 Charles Street, Glasgow City, G21 2QB
NEXT_PUBLIC_COMPANY_PHONE=+44 7901846297
NEXT_PUBLIC_COMPANY_EMAIL=support@speedy-van.co.uk

CUSTOM_KEY=b2ff6df77f3bea2aedeaa5a1f6bd9907ca68c36e21503ca696a82785f816db0d

LOG_LEVEL=info
```

### 4. بعد إضافة المتغيرات
1. احفظ التغييرات
2. أعد تشغيل الخدمة (Manual Deploy)
3. تأكد من أن المدفوعات تعمل

## التحقق من الإعداد
بعد إعادة التشغيل، تحقق من:
1. أن المدفوعات تعمل في booking-luxury
2. أن Stripe يستخدم المفاتيح الحقيقية (sk_live_...)
3. أن webhook يعمل بشكل صحيح

## ملاحظة مهمة
تأكد من أن `STRIPE_SECRET_KEY` يحتوي على `sk_live_` وليس `sk_test_`!
