/**
 * 🔥 Electric Safai - Types Unit Tests
 */

import {
  ElasticsearchHit,
  ElasticsearchResponse,
  QueryOptions,
  DEFAULT_CONFIG,
  SearchConfig,
} from '../../src/types';

describe('Types', () => {
  describe('ElasticsearchHit', () => {
    it('should have required properties', () => {
      const hit: ElasticsearchHit = {
        _index: 'test-index',
        _type: '_doc',
        _id: '123',
      };

      expect(hit._index).toBe('test-index');
      expect(hit._type).toBe('_doc');
      expect(hit._id).toBe('123');
    });

    it('should support optional properties', () => {
      const hit: ElasticsearchHit = {
        _index: 'test-index',
        _type: '_doc',
        _id: '123',
        _score: 1.5,
        _source: { field: 'value' },
      };

      expect(hit._score).toBe(1.5);
      expect(hit._source).toEqual({ field: 'value' });
    });
  });

  describe('ElasticsearchResponse', () => {
    it('should have required hits property', () => {
      const response: ElasticsearchResponse = {
        hits: {
          total: 100,
          hits: [],
        },
      };

      expect(response.hits.total).toBe(100);
      expect(response.hits.hits).toEqual([]);
    });

    it('should support optional properties', () => {
      const response: ElasticsearchResponse = {
        took: 5,
        timed_out: false,
        _scroll_id: 'scroll-123',
        hits: {
          total: { value: 100, relation: 'eq' },
          max_score: 1.0,
          hits: [],
        },
      };

      expect(response.took).toBe(5);
      expect(response.timed_out).toBe(false);
      expect(response._scroll_id).toBe('scroll-123');
    });
  });

  describe('QueryOptions', () => {
    it('should have required properties', () => {
      const options: QueryOptions = {
        database: 'http://localhost:9200/index/_search',
        query: '{"match_all": {}}',
      };

      expect(options.database).toBe('http://localhost:9200/index/_search');
      expect(options.query).toBe('{"match_all": {}}');
    });

    it('should support all optional properties', () => {
      const options: QueryOptions = {
        database: 'http://localhost:9200/index/_search',
        query: '{"term": {"status": "active"}}',
        from: 0,
        size: 50,
        source: 'title,description',
        sort: 'timestamp:desc',
        scroll: true,
        delete: 'yes',
        extend: '{"script_fields": {}}',
        q2: true,
        aggsTerms: 'category',
      };

      expect(options.from).toBe(0);
      expect(options.size).toBe(50);
      expect(options.source).toBe('title,description');
      expect(options.sort).toBe('timestamp:desc');
      expect(options.scroll).toBe(true);
      expect(options.delete).toBe('yes');
      expect(options.extend).toBe('{"script_fields": {}}');
      expect(options.q2).toBe(true);
      expect(options.aggsTerms).toBe('category');
    });
  });

  describe('DEFAULT_CONFIG', () => {
    it('should have expected default values', () => {
      expect(DEFAULT_CONFIG.endpoint).toBe('');
      expect(DEFAULT_CONFIG.scrollTimeout).toBe('1m');
      expect(DEFAULT_CONFIG.concurrencyLimit).toBe(10);
    });

    it('should be a valid SearchConfig', () => {
      const config: SearchConfig = DEFAULT_CONFIG;
      expect(config).toBeDefined();
    });
  });
});
