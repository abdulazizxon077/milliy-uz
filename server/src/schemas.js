import { CATEGORY_IDS, REGION_IDS } from '../../shared/catalog.js';

const text = (maxLength, minLength = 0) => ({ type: 'string', minLength, maxLength });
const time = { type: 'string', pattern: '^(([01]\\d|2[0-3]):[0-5]\\d|24:00)$' };
const phone = { type: 'string', pattern: '^[+0-9 ()-]{2,32}$' };

const placeProperties = {
  name: text(160, 2),
  category: { type: 'string', enum: CATEGORY_IDS },
  categoryName: text(80, 1),
  subCategory: text(300),
  region: { type: 'string', enum: REGION_IDS },
  rating: { type: 'number', minimum: 0, maximum: 5 },
  reviewsCount: { type: 'integer', minimum: 0, maximum: 10_000_000 },
  experienceYears: { type: 'integer', minimum: 0, maximum: 200 },
  experienceText: text(160),
  chiefSpecialist: text(200),
  phone,
  secondaryPhone: { anyOf: [phone, { type: 'string', maxLength: 0 }] },
  // Uzbekistan bounding box with a small margin.
  lat: { type: 'number', minimum: 37, maximum: 46 },
  lng: { type: 'number', minimum: 55, maximum: 74 },
  openTime: time,
  closeTime: time,
  is247: { type: 'boolean' },
  address: text(300),
  landmark: text(200),
  priceRange: text(120),
  pricingDetails: {
    type: 'array',
    maxItems: 30,
    items: {
      type: 'object',
      additionalProperties: false,
      required: ['service', 'price'],
      properties: { service: text(200, 1), price: text(80, 1) },
    },
  },
  features: { type: 'array', maxItems: 30, items: text(160, 1) },
  workDays: text(160),
  image: {
    anyOf: [
      { type: 'string', maxLength: 0 },
      { type: 'string', maxLength: 500, pattern: '^https://' },
    ],
  },
};

const placeId = { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{0,79}$' };

export const placeCreateSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'category', 'region', 'phone', 'lat', 'lng'],
  properties: placeProperties,
};

export const placeUpdateSchema = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  properties: placeProperties,
};

export const reviewCreateSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['author', 'rating', 'comment'],
  properties: {
    author: text(60, 2),
    rating: { type: 'integer', minimum: 1, maximum: 5 },
    comment: text(1000, 3),
  },
};

export const placesImportSchema = {
  type: 'array',
  minItems: 1,
  maxItems: 5000,
  items: {
    type: 'object',
    additionalProperties: false,
    required: placeCreateSchema.required,
    properties: {
      ...placeProperties,
      id: placeId,
      reviews: {
        type: 'array',
        maxItems: 500,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['author', 'rating', 'comment'],
          properties: {
            id: text(80),
            author: text(60, 1),
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: text(1000, 1),
            date: { type: ['string', 'null'], maxLength: 60 },
            createdAt: { type: 'string', maxLength: 40 },
            status: { type: 'string', enum: ['published', 'hidden'] },
          },
        },
      },
    },
  },
};

export const idParams = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', minLength: 1, maxLength: 80 } },
};
