import { describe, expect, it } from 'vitest';
import { answerLocally } from './assistant.js';

const places = [
  { id: '1', category: 'auto' },
  { id: '2', category: 'auto' },
  { id: '3', category: 'auto' },
  { id: '4', category: 'gas' },
];

describe('answerLocally', () => {
  it('answers greetings and thanks in Uzbek', () => {
    expect(answerLocally('Salom', places).text).toMatch(/^Vaalaykum assalom/);
    expect(answerLocally('Assalomu alaykum! Qandaysiz?', places).text).toMatch(
      /^Vaalaykum assalom/,
    );
    expect(answerLocally('katta rahmat', places).text).toMatch(/^Marhamat/);
  });

  it('answers greetings and thanks in Russian', () => {
    expect(answerLocally('Привет, как дела?', places).text).toMatch(/^Здравствуйте/);
    expect(answerLocally('Большое спасибо', places).text).toMatch(/^Пожалуйста/);
  });

  it('answers greetings and thanks in English', () => {
    expect(answerLocally('Hello, how are you?', places).text).toMatch(/^Hello/);
    expect(answerLocally('Thank you very much', places).text).toMatch(/^You are welcome/);
  });

  it('maps keywords to categories with at most two suggestions', () => {
    const answer = answerLocally('Matorim buzildi, usta kerak', places);
    expect(answer.kind).toBe('places');
    expect(answer.places.map((p) => p.id)).toEqual(['1', '2']);
  });

  it('maps Russian keywords to categories', () => {
    const answer = answerLocally('Нужен срочный ремонт авто', places);
    expect(answer.kind).toBe('places');
    expect(answer.places[0].category).toBe('auto');
    expect(answer.intro).toMatch(/Ближайшие автосервисы/);
  });

  it('maps English keywords to categories', () => {
    const answer = answerLocally('Find nearest car repair workshop', places);
    expect(answer.kind).toBe('places');
    expect(answer.places[0].category).toBe('auto');
    expect(answer.intro).toMatch(/Nearby auto repair/);
  });

  it('matches short tokens only as whole words', () => {
    expect(answerLocally('EV zaryad', places).places[0].id).toBe('4');
    expect(answerLocally('qayerda', places).kind).toBe('text');
  });

  it('asks for clarification otherwise', () => {
    expect(answerLocally('nimadir', places).text).toMatch(/^Aniqroq yozing/);
    expect(answerLocally('что-то непонятное', places).text).toMatch(/^Уточните запрос/);
  });
});
