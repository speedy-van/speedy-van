import { handleAgentQuery } from '@/agent/router';
import { toolPricing } from '@/agent/tools/pricing';

describe('AI Agent', () => {
  it('answers from RAG without crashing', async () => {
    const out = await handleAgentQuery({ message: 'ما هي مناطق الخدمة؟' });
    expect(out.text).toBeTruthy();
  });

  it('executes pricing tool with valid input', async () => {
    const input = {
      items: [{ id: 'sofa', qty: 2 }],
      distanceKm: 10,
      serviceType: 'standard',
    };
    const out = await toolPricing(input);
    expect(out.ok).toBe(true);
    expect(out.data).toHaveProperty('total');
  });
});

