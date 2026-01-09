/**
 * 🔥 Electric Safai - Elasticsearch Unit Tests
 */

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  queryData,
  fetch,
  scrollFetch,
  deleteDocument,
  deleteDocuments,
  getScrollId,
  resetScrollId,
} from '../../src/elasticsearch';
import { createLogger } from '../../src/logger';
import { QueryOptions, ElasticsearchHit } from '../../src/types';
import {
  mockElasticsearchResponse,
  mockScrollResponse,
  mockAggregationResponse,
} from '../setup';

describe('Elasticsearch Client', () => {
  let mock: MockAdapter;
  let logger: ReturnType<typeof createLogger>;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    logger = createLogger('test');
    // Mock console to reduce noise
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    resetScrollId();
  });

  afterEach(() => {
    mock.restore();
    jest.restoreAllMocks();
  });

  describe('queryData', () => {
    const baseOptions: QueryOptions = {
      database: 'http://localhost:9200/test-index/_search',
      query: '{"match_all": {}}',
    };

    it('should execute a basic query', async () => {
      mock.onPost('http://localhost:9200/test-index/_search').reply(200, mockElasticsearchResponse);

      const results = await queryData(baseOptions, logger);

      expect(results).toHaveLength(2);
      expect(results[0]._id).toBe('1');
      expect(results[1]._id).toBe('2');
    });

    it('should apply size parameter', async () => {
      const options: QueryOptions = {
        ...baseOptions,
        size: 50,
      };

      mock.onPost('http://localhost:9200/test-index/_search').reply((config) => {
        expect(config.params?.size).toBe(50);
        return [200, mockElasticsearchResponse];
      });

      await queryData(options, logger);
    });

    it('should apply from parameter', async () => {
      const options: QueryOptions = {
        ...baseOptions,
        from: 10,
      };

      mock.onPost('http://localhost:9200/test-index/_search').reply((config) => {
        expect(config.params?.from).toBe(10);
        return [200, mockElasticsearchResponse];
      });

      await queryData(options, logger);
    });

    it('should apply source parameter', async () => {
      const options: QueryOptions = {
        ...baseOptions,
        source: 'title,description',
      };

      mock.onPost('http://localhost:9200/test-index/_search').reply((config) => {
        expect(config.params?._source).toBe('title,description');
        return [200, mockElasticsearchResponse];
      });

      await queryData(options, logger);
    });

    it('should apply sort parameter', async () => {
      const options: QueryOptions = {
        ...baseOptions,
        sort: 'timestamp:desc',
      };

      mock.onPost('http://localhost:9200/test-index/_search').reply((config) => {
        expect(config.params?.sort).toBe('timestamp:desc');
        return [200, mockElasticsearchResponse];
      });

      await queryData(options, logger);
    });

    it('should enable scroll mode', async () => {
      const options: QueryOptions = {
        ...baseOptions,
        scroll: true,
      };

      mock.onPost('http://localhost:9200/test-index/_search').reply((config) => {
        expect(config.params?.scroll).toBe('1m');
        return [200, { ...mockElasticsearchResponse, _scroll_id: 'scroll-123' }];
      });

      await queryData(options, logger);
      expect(getScrollId()).toBe('scroll-123');
    });

    it('should use ES 2.x query syntax when q2 is true', async () => {
      const options: QueryOptions = {
        ...baseOptions,
        q2: true,
      };

      mock.onPost('http://localhost:9200/test-index/_search').reply((config) => {
        const body = JSON.parse(config.data);
        expect(body.query.bool).toBeDefined();
        return [200, mockElasticsearchResponse];
      });

      await queryData(options, logger);
    });

    it('should add aggregations when aggsTerms is specified', async () => {
      const options: QueryOptions = {
        ...baseOptions,
        aggsTerms: 'category',
      };

      mock.onPost('http://localhost:9200/test-index/_search').reply((config) => {
        const body = JSON.parse(config.data);
        expect(body.aggs.category.terms.field).toBe('category');
        return [200, mockAggregationResponse];
      });

      await queryData(options, logger);
    });

    it('should merge extend options', async () => {
      const options: QueryOptions = {
        ...baseOptions,
        extend: '{"custom_field": "custom_value"}',
      };

      mock.onPost('http://localhost:9200/test-index/_search').reply((config) => {
        const body = JSON.parse(config.data);
        expect(body.custom_field).toBe('custom_value');
        return [200, mockElasticsearchResponse];
      });

      await queryData(options, logger);
    });

    it('should throw error for invalid query JSON', async () => {
      const options: QueryOptions = {
        ...baseOptions,
        query: 'invalid json',
      };

      await expect(queryData(options, logger)).rejects.toThrow('Invalid query JSON');
    });

    it('should throw error for invalid extend JSON', async () => {
      const options: QueryOptions = {
        ...baseOptions,
        extend: 'invalid json',
      };

      mock.onPost('http://localhost:9200/test-index/_search').reply(200, mockElasticsearchResponse);

      await expect(queryData(options, logger)).rejects.toThrow('Invalid extend JSON');
    });

    it('should throw error on Elasticsearch error response', async () => {
      mock.onPost('http://localhost:9200/test-index/_search').reply(200, {
        error: { type: 'search_phase_execution_exception', reason: 'all shards failed' },
      });

      await expect(queryData(baseOptions, logger)).rejects.toThrow('Elasticsearch error');
    });

    it('should throw error on HTTP failure', async () => {
      mock.onPost('http://localhost:9200/test-index/_search').networkError();

      await expect(queryData(baseOptions, logger)).rejects.toThrow('HTTP Error');
    });
  });

  describe('fetch', () => {
    beforeEach(() => {
      // Set a scroll ID first
      mock.onPost('http://localhost:9200/test-index/_search').reply(200, {
        ...mockElasticsearchResponse,
        _scroll_id: 'scroll-abc',
      });
    });

    it('should fetch next batch using scroll API', async () => {
      // Initialize scroll
      await queryData(
        { database: 'http://localhost:9200/test-index/_search', query: '{}', scroll: true },
        logger
      );

      mock.onPost('http://localhost:9200/_search/scroll').reply(200, mockScrollResponse);

      const result = await fetch('http://localhost:9200/test-index/_search', false, logger);

      expect(result.hits).toHaveLength(1);
      expect(result.scrollId).toBe('mock-scroll-id-12345');
    });

    it('should return empty array on failure', async () => {
      await queryData(
        { database: 'http://localhost:9200/test-index/_search', query: '{}', scroll: true },
        logger
      );

      mock.onPost('http://localhost:9200/_search/scroll').networkError();

      const result = await fetch('http://localhost:9200/test-index/_search', false, logger);

      expect(result.hits).toEqual([]);
    });
  });

  describe('scrollFetch', () => {
    it('should iterate through all results', async () => {
      // Initialize scroll
      mock.onPost('http://localhost:9200/test-index/_search').reply(200, {
        ...mockElasticsearchResponse,
        _scroll_id: 'scroll-xyz',
      });

      await queryData(
        { database: 'http://localhost:9200/test-index/_search', query: '{}', scroll: true },
        logger
      );

      // First scroll returns results, second returns empty
      let scrollCount = 0;
      mock.onPost('http://localhost:9200/_search/scroll').reply(() => {
        scrollCount++;
        if (scrollCount === 1) {
          return [200, mockScrollResponse];
        }
        return [200, { hits: { hits: [] } }];
      });

      const results: ElasticsearchHit[] = [];
      await scrollFetch(
        'http://localhost:9200/test-index/_search',
        false,
        (hit) => results.push(hit),
        logger
      );

      expect(results).toHaveLength(1);
    });
  });

  describe('deleteDocument', () => {
    it('should delete a single document', async () => {
      const hit: ElasticsearchHit = {
        _index: 'test-index',
        _type: '_doc',
        _id: '123',
      };

      mock.onDelete('http://localhost:9200/test-index/_doc/123').reply(200, { result: 'deleted' });

      await expect(
        deleteDocument('http://localhost:9200/test-index/_search', hit, logger)
      ).resolves.not.toThrow();
    });

    it('should handle delete errors gracefully', async () => {
      const hit: ElasticsearchHit = {
        _index: 'test-index',
        _type: '_doc',
        _id: '123',
      };

      mock.onDelete('http://localhost:9200/test-index/_doc/123').networkError();

      await expect(
        deleteDocument('http://localhost:9200/test-index/_search', hit, logger)
      ).resolves.not.toThrow();
    });
  });

  describe('deleteDocuments', () => {
    it('should delete multiple documents with concurrency limit', async () => {
      const hits: ElasticsearchHit[] = [
        { _index: 'test-index', _type: '_doc', _id: '1' },
        { _index: 'test-index', _type: '_doc', _id: '2' },
        { _index: 'test-index', _type: '_doc', _id: '3' },
      ];

      mock.onDelete(/.*/).reply(200, { result: 'deleted' });

      await expect(
        deleteDocuments('http://localhost:9200/test-index/_search', hits, logger, 2)
      ).resolves.not.toThrow();
    });
  });

  describe('getScrollId / resetScrollId', () => {
    it('should manage scroll ID state', async () => {
      expect(getScrollId()).toBe('');

      mock.onPost('http://localhost:9200/test-index/_search').reply(200, {
        ...mockElasticsearchResponse,
        _scroll_id: 'new-scroll-id',
      });

      await queryData(
        { database: 'http://localhost:9200/test-index/_search', query: '{}', scroll: true },
        logger
      );

      expect(getScrollId()).toBe('new-scroll-id');

      resetScrollId();
      expect(getScrollId()).toBe('');
    });
  });
});
