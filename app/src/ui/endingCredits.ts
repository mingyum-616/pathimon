export interface EndingCreditEntry {
  role: string;
  names: string;
}

export const ENDING_CREDITS_DURATION_MS = 15_000;

export const ENDING_CREDITS: EndingCreditEntry[] = [
  { role: '총괄 제작', names: '박민겸' },
  { role: '기획 · 세계관 · 게임 디자인', names: '박민겸' },
  { role: '스토리 · 연출', names: '박민겸' },
  { role: '의학 학습 설계 · 자료 정리', names: '박민겸 · Claude · GPT/Codex' },
  { role: '패시몬 설정 · 캐릭터 디자인', names: '박민겸 · Claude · GPT/Codex' },
  { role: '조언', names: '박헌구 · 오지운' },
  { role: 'UI · UX 디자인', names: '박민겸 · GPT/Codex' },
  { role: '코드 · 전투 시스템 구현', names: '박민겸 · GPT/Codex · Claude' },
  { role: '비주얼 제작 협업', names: '박민겸 · GPT/Codex · Gemini' },
  { role: 'QA · 밸런스 · 플레이테스트', names: '박민겸 · Claude · GPT/Codex' },
  { role: '음악 선곡 · 사운드 연출', names: '박민겸' },
  { role: 'BGM', names: '포켓로그' },
  { role: '끝까지 등반한 사람', names: '박민겸' },
];

export const ENDING_FINAL_COPY = {
  lead: '주인공',
  hero: '감염과 면역을 수강한 여러분',
  cheer: '수고하셨습니다. 화이팅!',
} as const;
