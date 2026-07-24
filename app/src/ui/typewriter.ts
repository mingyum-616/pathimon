export interface TypewriterAdvanceResult {
  action: 'reveal' | 'next' | 'finish';
  lineIndex: number;
  visibleCharacters: number;
}

export function advanceTypewriter(
  lines: string[],
  lineIndex: number,
  visibleCharacters: number,
): TypewriterAdvanceResult {
  const safeIndex = Math.min(Math.max(0, lineIndex), Math.max(0, lines.length - 1));
  const currentLine = lines[safeIndex] ?? '';

  if (visibleCharacters < currentLine.length) {
    return {
      action: 'reveal',
      lineIndex: safeIndex,
      visibleCharacters: currentLine.length,
    };
  }

  if (safeIndex < lines.length - 1) {
    return {
      action: 'next',
      lineIndex: safeIndex + 1,
      visibleCharacters: 0,
    };
  }

  return {
    action: 'finish',
    lineIndex: safeIndex,
    visibleCharacters: currentLine.length,
  };
}
