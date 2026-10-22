import { describe, expect, it } from 'vitest';
import { loadBookmarks, saveBookmarks, toggleId } from './bookmarks.js';

describe('bookmarks', () => {
  it('round-trips through storage and ignores corrupt data', () => {
    saveBookmarks(['a', 'b'], localStorage);
    expect(loadBookmarks(localStorage)).toEqual(['a', 'b']);
    localStorage.setItem('milliy_bookmarks', '{oops');
    expect(loadBookmarks(localStorage)).toEqual([]);
    localStorage.setItem('milliy_bookmarks', '[1,"x",null]');
    expect(loadBookmarks(localStorage)).toEqual(['x']);
  });
  it('toggles ids immutably', () => {
    const ids = ['a'];
    expect(toggleId(ids, 'b')).toEqual(['a', 'b']);
    expect(toggleId(ids, 'a')).toEqual([]);
    expect(ids).toEqual(['a']);
  });
});
