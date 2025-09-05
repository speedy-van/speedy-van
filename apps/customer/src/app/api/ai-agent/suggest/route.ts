import { NextRequest, NextResponse } from 'next/server';
import { handleAgentQuery } from '@/agent/router';
import { AgentQuery, AgentContext } from '@/agent/types';

export async function POST(request: NextRequest) {
  try {
    const { message, context = 'general' } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // إعداد سياق AI Agent للاقتراحات
    const agentContext: AgentContext = {
      userId: 'guest',
      sessionId: `suggestion_${Date.now()}`,
      mode: 'customer',
      permissions: ['read'],
      context: context,
      metadata: {
        source: 'ai_suggestion',
        timestamp: new Date().toISOString(),
        type: 'suggestion',
      },
    };

    // إعداد استعلام AI Agent
    const agentQuery: AgentQuery = {
      message: message.trim(),
      language: 'ar', // اللغة العربية للعملاء
      context: agentContext,
    };

    // معالجة الرسالة مع AI Agent
    const response = await handleAgentQuery(agentQuery);

    // استخراج الاقتراح من الرد
    let suggestion = response.response;
    
    // إذا كان السياق هو اقتراح كلمة مرور، حاول استخراج كلمة المرور فقط
    if (context === 'password_suggestion') {
      // البحث عن كلمة مرور في النص
      const passwordMatch = suggestion.match(/[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}/);
      if (passwordMatch) {
        suggestion = passwordMatch[0];
      }
      
      // إذا لم يتم العثور على كلمة مرور مناسبة، أنشئ واحدة
      if (!passwordMatch || suggestion.length < 8) {
        suggestion = generateStrongPassword();
      }
    }

    return NextResponse.json({
      success: true,
      suggestion: suggestion,
      metadata: {
        toolUsed: response.toolUsed,
        confidence: response.metadata?.confidence || 0.9,
        processingTime: response.metadata?.processingTime || 0,
        context: context,
      },
    });

  } catch (error) {
    console.error('AI Agent Suggestion Error:', error);
    
    // في حالة الخطأ، أنشئ اقتراحاً بسيطاً
    let fallbackSuggestion = '';
    const { context } = await request.json();
    
    if (context === 'password_suggestion') {
      fallbackSuggestion = generateStrongPassword();
    } else {
      fallbackSuggestion = 'عذراً، لا يمكنني تقديم اقتراح في الوقت الحالي.';
    }
    
    return NextResponse.json({
      success: true,
      suggestion: fallbackSuggestion,
      metadata: {
        toolUsed: 'fallback',
        confidence: 0.5,
        processingTime: 0,
        context: context,
        error: 'Used fallback suggestion',
      },
    });
  }
}

// دالة إنشاء كلمة مرور قوية
function generateStrongPassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let password = '';
  
  // إضافة حرف كبير واحد على الأقل
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  
  // إضافة حرف صغير واحد على الأقل
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  
  // إضافة رقم واحد على الأقل
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  // إضافة رمز واحد على الأقل
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // إضافة 4 أحرف عشوائية إضافية
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = 0; i < 4; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // خلط الأحرف
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
