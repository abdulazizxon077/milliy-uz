import { describe, expect, it } from 'vitest';
import {
  CATEGORIES_I18N,
  DEFAULT_LANGUAGE,
  getInitialLanguage,
  LANGUAGES,
  REGIONS_I18N,
  saveLanguage,
  t,
} from './i18n.js';
import { CATEGORY_IDS, REGION_IDS } from '../../../shared/catalog.js';

describe('i18n module', () => {
  it('defines 3 supported languages', () => {
    expect(LANGUAGES.map((l) => l.code)).toEqual(['uz', 'ru', 'en']);
    expect(DEFAULT_LANGUAGE).toBe('uz');
  });

  it('translates keys across all 3 languages', () => {
    expect(t('navHome', 'uz')).toBe('Asosiy');
    expect(t('navHome', 'ru')).toBe('Главная');
    expect(t('navHome', 'en')).toBe('Home');

    expect(t('heroBadge', 'uz')).toBe("O'ZBEKISTON MILLIY PLATFORMASI");
    expect(t('heroBadge', 'ru')).toBe('НАЦИОНАЛЬНАЯ ПЛАТФОРМА УЗБЕКИСТАНА');
    expect(t('heroBadge', 'en')).toBe('UZBEKISTAN NATIONAL PLATFORM');
  });

  it('interpolates parameters correctly', () => {
    expect(t('resultsFound', 'uz', { count: 42 })).toBe('42 ta natija topildi');
    expect(t('resultsFound', 'ru', { count: 42 })).toBe('Найдено объектов: 42');
    expect(t('resultsFound', 'en', { count: 42 })).toBe('42 places found');
  });

  it('falls back gracefully to uzbek when key is missing in another language', () => {
    expect(t('navHome', 'de')).toBe('Asosiy');
  });

  it('provides translations for all 10 categories', () => {
    for (const cat of CATEGORY_IDS) {
      expect(CATEGORIES_I18N[cat]).toBeDefined();
      expect(CATEGORIES_I18N[cat].uz.name).toBeTruthy();
      expect(CATEGORIES_I18N[cat].ru.name).toBeTruthy();
      expect(CATEGORIES_I18N[cat].en.name).toBeTruthy();
    }
  });

  it('provides translations for all 13 regions plus all_uz', () => {
    expect(REGIONS_I18N.all_uz).toBeDefined();
    for (const reg of REGION_IDS) {
      expect(REGIONS_I18N[reg]).toBeDefined();
      expect(REGIONS_I18N[reg].uz).toBeTruthy();
      expect(REGIONS_I18N[reg].ru).toBeTruthy();
      expect(REGIONS_I18N[reg].en).toBeTruthy();
    }
  });

  it('handles getInitialLanguage and saveLanguage', () => {
    saveLanguage('ru');
    expect(getInitialLanguage()).toBe('ru');
    saveLanguage('en');
    expect(getInitialLanguage()).toBe('en');
    saveLanguage('uz');
    expect(getInitialLanguage()).toBe('uz');
  });
});
