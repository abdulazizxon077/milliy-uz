import { beforeEach, describe, expect, it } from 'vitest';
import { migrate, openDatabase } from '../src/db.js';
import { createPlacesRepository } from '../src/repositories/places.js';
import { createReviewsRepository } from '../src/repositories/reviews.js';

describe('reviews repository', () => {
  let places;
  let reviews;

  beforeEach(() => {
    const db = openDatabase(':memory:');
    migrate(db);
    places = createPlacesRepository(db);
    reviews = createReviewsRepository(db);
    places.create({
      id: 'p1',
      name: 'Place',
      category: 'food',
      region: 'tashkent',
      phone: '+998 71 000 00 00',
      lat: 41.3,
      lng: 69.2,
      rating: 4,
      reviewsCount: 1,
    });
  });

  it('keeps a running average as reviews are added', () => {
    reviews.create('p1', { author: 'A', rating: 5, comment: "zo'r" });
    expect(places.get('p1')).toMatchObject({ rating: 4.5, reviewsCount: 2 });
  });

  it('reverts the contribution when a review is hidden or deleted', () => {
    const review = reviews.create('p1', { author: 'A', rating: 1, comment: 'yomon' });
    expect(places.get('p1')).toMatchObject({ rating: 2.5, reviewsCount: 2 });

    reviews.setStatus(review.id, 'hidden');
    expect(places.get('p1')).toMatchObject({ rating: 4, reviewsCount: 1 });

    reviews.setStatus(review.id, 'published');
    reviews.remove(review.id);
    expect(places.get('p1')).toMatchObject({ rating: 4, reviewsCount: 1 });
  });

  it('returns null for unknown places', () => {
    expect(reviews.create('nope', { author: 'A', rating: 5, comment: 'x' })).toBeNull();
  });

  it('applies migrations only once', () => {
    const db = openDatabase(':memory:');
    expect(migrate(db)).toEqual(['001_init.sql', '002_reports.sql', '003_place_sources.sql']);
    expect(migrate(db)).toEqual([]);
  });
});
