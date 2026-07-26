export interface StoryPage {
  imageFrame?: 'square' | 'wide';
  imagePath?: string;
  lines: string[];
}

export function storyPages(): StoryPage[] {
  return [
    {
      imageFrame: 'wide',
      imagePath: 'images/story/war_page1.png',
      lines: [
        '서기 20000년, 병원체들이 지성을 얻었다.',
        '그들은 스스로를 패시몬이라 부르며 연합을 이뤘고,',
        '그동안 자신들을 괴롭힌 인류를 향해 총 공격을 감행했다.',
      ],
    },
    {
      imagePath: 'images/story/inha-logo.png',
      lines: [
        '인류는 패시몬들의 공격에 속절없이 물러나야만 했다.',
        '인류의 역사가 무너지기 직전,',
        '인하대학교 의과대학의 한 인물이 반격의 신호탄을 쏘아올렸다.',
      ],
    },
    {
      imagePath: 'images/capsules/universal.png',
      lines: [
        '패시몬 캡슐.',
        '모든 패시몬을 포획할 수 있는 캡슐을 무기로 인류는 반격을 시작했고,',
        '마침내 패시몬을 몰아낼 수 있었다.',
      ],
    },
  ];
}
