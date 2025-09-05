# Speedy Van AI Agent Components

## نظرة عامة

هذا المجلد يحتوي على جميع مكونات Speedy Van AI Agent، وهو نظام مساعد ذكي متقدم يجمع بين خدمة العملاء وأدوات التطوير.

## المكونات المتاحة

### 1. AIAgentChatInterface
**الملف**: `AIAgentChatInterface.tsx`
**الوصف**: واجهة المحادثة الرئيسية للـ AI Agent
**الميزات**:
- دعم متعدد اللغات (العربية والإنجليزية)
- اكتشاف تلقائي للوضع (العملاء/المطورين)
- تسجيل صوتي (محاكاة)
- إعدادات متقدمة
- تصدير المحادثات
- نسخ الرسائل

**الاستخدام**:
```tsx
import { AIAgentChatInterface } from '@/components/AIAgent';

<AIAgentChatInterface 
  mode="auto" 
  initialContext={{ userId: 'user123' }}
  onModeChange={(mode) => console.log('Mode changed to:', mode)}
/>
```

### 2. AIAgentDashboard
**الملف**: `AIAgentDashboard.tsx`
**الوصف**: لوحة تحكم شاملة لعرض إحصائيات وأداء AI Agent
**الميزات**:
- إحصائيات في الوقت الفعلي
- رسوم بيانية تفاعلية
- تبويبات متعددة (نظرة عامة، النشاط، الأداء، الأدوات)
- مراقبة الأداء
- تحليل الاستخدام

**الاستخدام**:
```tsx
import { AIAgentDashboard } from '@/components/AIAgent';

<AIAgentDashboard />
```

### 3. AIAgentStats
**الملف**: `AIAgentStats.tsx`
**الوصف**: عرض الإحصائيات السريعة والمؤشرات الرئيسية
**الميزات**:
- مؤشرات الأداء الرئيسية
- معدل النجاح
- تحليل وقت الاستجابة
- توزيع الاستخدام
- صحة النظام

**الاستخدام**:
```tsx
import { AIAgentStats } from '@/components/AIAgent';

<AIAgentStats />
```

### 4. AIAgentQuickActions
**الملف**: `AIAgentQuickActions.tsx`
**الوصف**: إجراءات سريعة للوصول السريع للميزات
**الميزات**:
- إجراءات مجمعة حسب الفئة
- تنفيذ فوري
- إجراءات مخصصة
- دعم متعدد اللغات
- تقدم التنفيذ

**الاستخدام**:
```tsx
import { AIAgentStats } from '@/components/AIAgent';

<AIAgentQuickActions />
```

### 5. AIAgentSettings
**الملف**: `AIAgentSettings.tsx`
**الوصف**: إعدادات شاملة ومتقدمة للـ AI Agent
**الميزات**:
- إعدادات عامة
- إعدادات نموذج الذكاء الاصطناعي
- إعدادات الأداء
- إعدادات الأمان
- إعدادات RAG
- إعدادات الأدوات
- إعدادات المراقبة
- إعدادات التكامل
- إعدادات التخصيص

**الاستخدام**:
```tsx
import { AIAgentSettings } from '@/components/AIAgent';

<AIAgentSettings />
```

## الصفحات المتاحة

### 1. الصفحة الرئيسية
**المسار**: `/ai-agent`
**الوصف**: صفحة رئيسية تعرض جميع الميزات

### 2. صفحة المحادثة
**المسار**: `/ai-agent/chat`
**الوصف**: واجهة المحادثة الكاملة

### 3. صفحة لوحة التحكم
**المسار**: `/ai-agent/dashboard`
**الوصف**: لوحة التحكم الشاملة

### 4. صفحة الإحصائيات
**المسار**: `/ai-agent/stats`
**الوصف**: الإحصائيات السريعة

### 5. صفحة الإجراءات السريعة
**المسار**: `/ai-agent/quick-actions`
**الوصف**: الإجراءات السريعة

### 6. صفحة الإعدادات
**المسار**: `/ai-agent/settings`
**الوصف**: إعدادات متقدمة

## الميزات الرئيسية

### 🧠 ذكاء اصطناعي متقدم
- نموذج GPT-4 مع RAG
- اكتشاف تلقائي للوضع
- معالجة متعددة اللغات

### 👥 خدمة عملاء ذكية
- دعم فني ذكي
- مساعدة في الحجز
- استفسارات الأسعار

### 💻 أدوات تطوير متقدمة
- تحليل الكود
- إدارة قاعدة البيانات
- إدارة الملفات

### 📊 مراقبة شاملة
- إحصائيات في الوقت الفعلي
- تحليل الأداء
- تتبع الأخطاء

### 🔒 أمان متقدم
- تحقق من المدخلات
- تصفية المخرجات
- تسجيل التدقيق

### ⚡ أداء عالي
- تخزين مؤقت
- تحديد معدل الطلبات
- تحسين الأداء

## التكامل

### مع NextAuth
```tsx
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
// استخدام session.user.id للتعرف على المستخدم
```

### مع Prisma
```tsx
import { prisma } from '@/lib/prisma';

// حفظ بيانات المحادثة
await prisma.conversation.create({
  data: {
    userId: session.user.id,
    messages: messages,
    mode: currentMode,
  },
});
```

### مع Stripe
```tsx
// تكامل مع نظام الدفع
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount,
  currency: 'gbp',
});
```

## التخصيص

### إعدادات مخصصة
```tsx
const customSettings = {
  agentName: 'My Custom Agent',
  defaultLanguage: 'ar',
  enableCustomPrompts: true,
  customSystemPrompt: 'أنت مساعد مخصص...',
};
```

### أدوات مخصصة
```tsx
const customTool = {
  name: 'custom_tool',
  description: 'أداة مخصصة',
  parameters: z.object({
    input: z.string(),
  }),
  execute: async (args) => {
    // تنفيذ الأداة
    return { result: 'success' };
  },
};
```

## الأداء

### تحسينات الأداء
- تخزين مؤقت للاستعلامات
- معالجة متوازية
- تحسين قاعدة البيانات
- ضغط البيانات

### المراقبة
- وقت الاستجابة
- استخدام الذاكرة
- معدل النجاح
- تتبع الأخطاء

## الأمان

### حماية المدخلات
- تحقق من نوع البيانات
- تنظيف المدخلات
- حماية من SQL Injection
- حماية من XSS

### حماية المخرجات
- تصفية المحتوى
- تشفير البيانات الحساسة
- تسجيل العمليات
- مراقبة الأنشطة المشبوهة

## الاختبار

### اختبارات الوحدة
```bash
pnpm test:agent --testPathPattern="AIAgentChatInterface"
pnpm test:agent --testPathPattern="AIAgentDashboard"
```

### اختبارات التكامل
```bash
pnpm test:agent:integration
```

### اختبارات الأداء
```bash
pnpm test:agent:performance
```

## النشر

### متطلبات البيئة
```bash
# متغيرات البيئة المطلوبة
DEEPSEEK_API_KEY=your_deepseek_api_key
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_nextauth_secret
```

### بناء المشروع
```bash
pnpm build
pnpm start
```

## الدعم

### التوثيق
- [دليل المستخدم](https://docs.speedy-van.com/ai-agent)
- [دليل المطور](https://docs.speedy-van.com/ai-agent/developer)
- [API Reference](https://docs.speedy-van.com/ai-agent/api)

### المساعدة
- **البريد الإلكتروني**: support@speedy-van.co.uk
- **الهاتف**: +44 7901846297
- **GitHub Issues**: [رابط Issues](https://github.com/speedy-van/web/issues)

## الترخيص

هذا المشروع مملوك لشركة Speedy Van Ltd. جميع الحقوق محفوظة.

---

**تم التطوير بواسطة فريق Speedy Van للتطوير**

*تمكين الشركات بمساعدة ذكية متقدمة للعملاء والمطورين.*
