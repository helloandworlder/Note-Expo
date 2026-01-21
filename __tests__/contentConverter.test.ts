import {
  stripHtml,
  plainToHtml,
  markdownToPlain,
  getPlainText,
} from '../src/utils/contentConverter';

declare const describe: any;
declare const it: any;
declare const expect: any;

describe('contentConverter', () => {
  it('strips html tags and entities', () => {
    expect(stripHtml('<p>Hello&nbsp;<strong>World</strong></p>')).toBe(
      'Hello World'
    );
  });

  it('converts plain text to html', () => {
    expect(plainToHtml('Line1\nLine2')).toBe('<p>Line1<br>Line2</p>');
  });

  it('converts markdown to plain text', () => {
    expect(markdownToPlain('## Title **Bold**')).toBe('Title Bold');
  });

  it('returns plain text based on format type', () => {
    expect(getPlainText('Plain', '<p>Rich</p>', 'rtf')).toBe('Rich');
    expect(getPlainText('**Bold**', undefined, 'markdown')).toBe('Bold');
    expect(getPlainText('Plain', undefined, 'plain')).toBe('Plain');
  });
});
