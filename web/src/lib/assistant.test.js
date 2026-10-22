import { describe, expect, it } from 'vitest';
import { answerLocally } from './assistant.js';

const places = [
  { id: '1', category: 'auto' },
  { id: '2', category: 'auto' },
  { id: '3', category: 'auto' },
  { id: '4', category: 'gas' },
];

describe('answerLocally', () => {
  it('answers greetings and thanks', () => {
    expect(answerLocally('Salom', places).text).toMatch(/^Vaalaykum assalom/);
    expect(answerLocally('Assalomu alaykum! Qandaysiz?', places).text).toMatch(
      /^Vaalaykum assalom/,
    );
    expect(answerLocally('katta rahmat', places).text).toMatch(/^Marhamat/);
  });
  it('maps keywords to categories with at most two suggestions', () => {
    const answer = answerLocally('Matorim buzildi, usta kerak', places);
    expect(answer.kind).toBe('places');
    expect(answer.places.map((p) => p.id)).toEqual(['1', '2']);
  });
  it('matches short tokens only as whole words', () => {
    expect(answerLocally('EV zaryad', places).places[0].id).toBe('4');
    expect(answerLocally('qayerda', places).kind).toBe('text');
  });
  it('asks for clarification otherwise', () => {
    expect(answerLocally('nimadir', places).text).toMatch(/^Aniqroq yozing/);
  });
});
