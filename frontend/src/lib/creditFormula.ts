export function estimateCredits(inputText: string, plan: string, modelMultiplier: number): number {
  const inputTokens = inputText.split(' ').length * 1.3;
  const outputTokens = plan === 'PRO' ? 200 : 80;
  const raw = (inputTokens * 0.000001 + outputTokens * 0.000002) * modelMultiplier * 1000;
  return Math.max(0.5, Math.round(raw * 10) / 10);
}
