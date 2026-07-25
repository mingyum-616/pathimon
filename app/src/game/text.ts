function finalConsonantIndex(text: string): number {
  const trimmed = text.trim();
  for (let index = trimmed.length - 1; index >= 0; index -= 1) {
    const code = trimmed.charCodeAt(index);
    if (code >= 0xac00 && code <= 0xd7a3) {
      return (code - 0xac00) % 28;
    }
  }
  return 0;
}

// 이름 뒤에 받침에 맞는 조사를 붙인다. 전투 로그 문자열을 손으로 이어 붙일 때 쓴다.
export function withParticle(name: string, particle: string): string {
  return `${name}${particleFor(name, particle)}`;
}

function particleFor(name: string, particle: string): string {
  const finalConsonant = finalConsonantIndex(name);
  const hasBatchim = finalConsonant > 0;
  if (particle === '이' || particle === '가') return hasBatchim ? '이' : '가';
  if (particle === '은' || particle === '는') return hasBatchim ? '은' : '는';
  if (particle === '을' || particle === '를') return hasBatchim ? '을' : '를';
  if (particle === '과' || particle === '와') return hasBatchim ? '과' : '와';
  if (particle === '으로' || particle === '로') return hasBatchim && finalConsonant !== 8 ? '으로' : '로';
  return particle;
}

export function interpolatePathimonName(text: string, name: string): string {
  return text
    .replace(/\{name\}\(으\)로/g, () => `${name}${particleFor(name, '으로')}`)
    .replace(/\{name\}(으로|로|[이가은는을를과와])/g, (_, particle: string) => `${name}${particleFor(name, particle)}`)
    .replace(/\{name\}/g, name);
}
