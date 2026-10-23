import { describe, expect, it } from 'vitest';
import { parsePlaceRoute, placePath, placeUrl } from './routes.js';

const route = (pathname, hash = '') => parsePlaceRoute({ pathname, hash });

describe('place routes', () => {
  it('builds paths and absolute urls', () => {
    expect(placePath('auto-pro')).toBe('/joy/auto-pro');
    expect(placeUrl('auto-pro', 'https://milliy.uz')).toBe('https://milliy.uz/joy/auto-pro');
  });

  it('parses /joy/<id>', () => {
    expect(route('/joy/auto-pro')).toEqual({ kind: 'place', id: 'auto-pro' });
    expect(route('/joy/auto-pro/')).toEqual({ kind: 'place', id: 'auto-pro' });
  });

  it('flags malformed place paths without throwing', () => {
    expect(route('/joy/%E0%A4%A')).toEqual({ kind: 'place', id: null });
    expect(route('/joy/Bad_Id')).toEqual({ kind: 'place', id: null });
  });

  it('accepts legacy #id links but ignores section anchors', () => {
    expect(route('/', '#auto-pro')).toEqual({ kind: 'legacy', id: 'auto-pro' });
    expect(route('/', '#catalog-section')).toEqual({ kind: 'home', id: null });
    expect(route('/', '')).toEqual({ kind: 'home', id: null });
  });
});
