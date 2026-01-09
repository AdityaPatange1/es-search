/**
 * 🔥 Electric Safai - Test Setup
 * Global test configuration and utilities
 */

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock console methods to reduce noise during tests
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console output during tests (uncomment if needed)
  // console.log = jest.fn();
  // console.error = jest.fn();
});

afterAll(() => {
  // Restore console
  console.log = originalConsole.log;
  console.error = originalConsole.error;
});

// Global test utilities
export const mockElasticsearchResponse = {
  took: 5,
  timed_out: false,
  _shards: {
    total: 1,
    successful: 1,
    skipped: 0,
    failed: 0,
  },
  hits: {
    total: { value: 100, relation: 'eq' },
    max_score: 1.0,
    hits: [
      {
        _index: 'test-index',
        _type: '_doc',
        _id: '1',
        _score: 1.0,
        _source: {
          title: 'Test Document 1',
          category: 'technology',
        },
      },
      {
        _index: 'test-index',
        _type: '_doc',
        _id: '2',
        _score: 0.9,
        _source: {
          title: 'Test Document 2',
          category: 'science',
        },
      },
    ],
  },
};

export const mockScrollResponse = {
  _scroll_id: 'mock-scroll-id-12345',
  took: 3,
  timed_out: false,
  hits: {
    total: { value: 100, relation: 'eq' },
    hits: [
      {
        _index: 'test-index',
        _type: '_doc',
        _id: '3',
        _score: null,
        _source: {
          title: 'Scroll Document 1',
        },
      },
    ],
  },
};

export const mockAggregationResponse = {
  took: 10,
  timed_out: false,
  hits: {
    total: { value: 500, relation: 'eq' },
    hits: [],
  },
  aggregations: {
    category: {
      buckets: [
        { key: 'technology', doc_count: 150 },
        { key: 'science', doc_count: 120 },
        { key: 'business', doc_count: 100 },
        { key: 'health', doc_count: 80 },
        { key: 'education', doc_count: 50 },
      ],
    },
  },
};
