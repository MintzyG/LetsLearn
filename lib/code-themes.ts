// Syntax colors from the Mint language spec, plus a softer light variant.
interface Palette {
  background: string;
  foreground: string;
  keyword: string;
  type: string;
  string: string;
  comment: string;
  func: string;
  number: string;
}

function mintTheme(name: string, type: 'light' | 'dark', p: Palette) {
  return {
    name,
    type,
    colors: { 'editor.background': p.background, 'editor.foreground': p.foreground },
    settings: [
      { settings: { foreground: p.foreground, background: p.background } },
      { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: p.comment, fontStyle: 'italic' } },
      { scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.new'], settings: { foreground: p.keyword, fontStyle: 'bold' } },
      { scope: ['entity.name.type', 'support.type', 'support.class', 'entity.name.class', 'storage.type.primitive'], settings: { foreground: p.type } },
      { scope: ['string', 'string.quoted', 'punctuation.definition.string'], settings: { foreground: p.string } },
      { scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: p.func } },
      { scope: ['constant.numeric', 'constant.language', 'constant.character'], settings: { foreground: p.number } },
    ],
  };
}

export const mintDark = mintTheme('mint-dark', 'dark', {
  background: '#131614',
  foreground: '#d4ddd6',
  keyword: '#4ade9a',
  type: '#7dd3fc',
  string: '#fbbf24',
  comment: '#62786a',
  func: '#c084fc',
  number: '#fb923c',
});

export const mintLight = mintTheme('mint-light', 'light', {
  background: '#e5ece6',
  foreground: '#1f2a24',
  keyword: '#0f6b3f',
  type: '#0369a1',
  string: '#9a5b00',
  comment: '#5f7567',
  func: '#7e22ce',
  number: '#b03a0a',
});
