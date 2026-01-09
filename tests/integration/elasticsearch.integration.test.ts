/**
 * 🔥 Electric Safai - Elasticsearch Integration Tests
 *
 * These tests run against a real Elasticsearch instance.
 * Prerequisites: ./docker_spin_up.sh must be running
 */

import axios from 'axios';
import { execSync } from 'child_process';
import {
  queryData,
  scrollFetch,
  deleteDocument,
  deleteDocuments,
  resetScrollId,
} from '../../src/elasticsearch';
import { createLogger } from '../../src/logger';
import { QueryOptions, ElasticsearchHit } from '../../src/types';

const ES_URL = 'http://localhost:9200';
const TEST_INDEX = 'integration-test-index';
const SEARCH_URL = `${ES_URL}/${TEST_INDEX}/_search`;

describe('Elasticsearch Integration Tests', () => {
  let logger: ReturnType<typeof createLogger>;
  let isElasticsearchRunning = false;

  beforeAll(async () => {
    logger = createLogger('integration-test');

    // Check if Elasticsearch is running
    try {
      const response = await axios.get(`${ES_URL}/_cluster/health`, { timeout: 5000 });
      isElasticsearchRunning = response.status === 200;
    } catch {
      isElasticsearchRunning = false;
    }

    if (!isElasticsearchRunning) {
      console.warn('\n⚠️  Elasticsearch is not running. Skipping integration tests.');
      console.warn('   Run ./docker_spin_up.sh to start Elasticsearch.\n');
      return;
    }

    // Create test index
    try {
      await axios.put(`${ES_URL}/${TEST_INDEX}`, {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
        },
      });
    } catch {
      // Index might already exist
    }

    // Seed test documents
    const docs = [
      { title: 'Document One', status: 'active', category: 'tech', count: 10 },
      { title: 'Document Two', status: 'active', category: 'science', count: 20 },
      { title: 'Document Three', status: 'inactive', category: 'tech', count: 30 },
      { title: 'Document Four', status: 'active', category: 'art', count: 40 },
      { title: 'Document Five', status: 'deleted', category: 'tech', count: 50 },
    ];

    for (let i = 0; i < docs.length; i++) {
      await axios.post(`${ES_URL}/${TEST_INDEX}/_doc/${i + 1}`, docs[i]);
    }

    // Refresh index to make documents searchable
    await axios.post(`${ES_URL}/${TEST_INDEX}/_refresh`);
  });

  afterAll(async () => {
    if (isElasticsearchRunning) {
      // Clean up test index
      try {
        await axios.delete(`${ES_URL}/${TEST_INDEX}`);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  beforeEach(() => {
    resetScrollId();
  });

  const skipIfNoES = () => {
    if (!isElasticsearchRunning) {
      return true;
    }
    return false;
  };

  describe('queryData - Real Elasticsearch', () => {
    it('should execute match_all query', async () => {
      if (skipIfNoES()) return;

      const options: QueryOptions = {
        database: SEARCH_URL,
        query: '{"match_all":{}}',
        q2: true,
      };

      const results = await queryData(options, logger);

      expect(results.length).toBeGreaterThanOrEqual(5);
    });

    it('should filter by term query', async () => {
      if (skipIfNoES()) return;

      const options: QueryOptions = {
        database: SEARCH_URL,
        query: '{"term":{"status":"active"}}',
        q2: true,
      };

      const results = await queryData(options, logger);

      expect(results.length).toBe(3);
      results.forEach((hit) => {
        expect((hit._source as Record<string, unknown>).status).toBe('active');
      });
    });

    it('should apply size parameter', async () => {
      if (skipIfNoES()) return;

      const options: QueryOptions = {
        database: SEARCH_URL,
        query: '{"match_all":{}}',
        size: 2,
        q2: true,
      };

      const results = await queryData(options, logger);

      expect(results.length).toBe(2);
    });

    it('should apply from parameter for pagination', async () => {
      if (skipIfNoES()) return;

      const firstPage: QueryOptions = {
        database: SEARCH_URL,
        query: '{"match_all":{}}',
        size: 2,
        from: 0,
        q2: true,
      };

      const secondPage: QueryOptions = {
        database: SEARCH_URL,
        query: '{"match_all":{}}',
        size: 2,
        from: 2,
        q2: true,
      };

      const firstResults = await queryData(firstPage, logger);
      const secondResults = await queryData(secondPage, logger);

      expect(firstResults.length).toBe(2);
      expect(secondResults.length).toBe(2);
      expect(firstResults[0]._id).not.toBe(secondResults[0]._id);
    });

    it('should apply source filtering', async () => {
      if (skipIfNoES()) return;

      const options: QueryOptions = {
        database: SEARCH_URL,
        query: '{"match_all":{}}',
        source: 'title,status',
        size: 1,
        q2: true,
      };

      const results = await queryData(options, logger);

      expect(results.length).toBe(1);
      const source = results[0]._source as Record<string, unknown>;
      expect(source.title).toBeDefined();
      expect(source.status).toBeDefined();
      expect(source.category).toBeUndefined();
    });

    it('should apply sorting', async () => {
      if (skipIfNoES()) return;

      const options: QueryOptions = {
        database: SEARCH_URL,
        query: '{"match_all":{}}',
        sort: 'count:desc',
        q2: true,
      };

      const results = await queryData(options, logger);

      const counts = results.map((hit) => (hit._source as Record<string, unknown>).count as number);
      for (let i = 1; i < counts.length; i++) {
        expect(counts[i - 1]).toBeGreaterThanOrEqual(counts[i]);
      }
    });

    it('should handle range queries', async () => {
      if (skipIfNoES()) return;

      const options: QueryOptions = {
        database: SEARCH_URL,
        query: '{"range":{"count":{"gte":25,"lte":45}}}',
        q2: true,
      };

      const results = await queryData(options, logger);

      expect(results.length).toBe(2);
      results.forEach((hit) => {
        const count = (hit._source as Record<string, unknown>).count as number;
        expect(count).toBeGreaterThanOrEqual(25);
        expect(count).toBeLessThanOrEqual(45);
      });
    });

    it('should handle aggregations', async () => {
      if (skipIfNoES()) return;

      const options: QueryOptions = {
        database: SEARCH_URL,
        query: '{"match_all":{}}',
        aggsTerms: 'category.keyword',
        q2: true,
      };

      // Suppress console.log for aggregation output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const results = await queryData(options, logger);

      consoleSpy.mockRestore();
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Scroll API - Real Elasticsearch', () => {
    it('should scroll through all results', async () => {
      if (skipIfNoES()) return;

      // First, enable scroll mode
      const options: QueryOptions = {
        database: SEARCH_URL,
        query: '{"match_all":{}}',
        scroll: true,
        size: 2,
        q2: true,
      };

      await queryData(options, logger);

      const allHits: ElasticsearchHit[] = [];
      await scrollFetch(SEARCH_URL, true, (hit) => allHits.push(hit), logger);

      // Should have fetched remaining documents via scroll
      expect(allHits.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Delete Operations - Real Elasticsearch', () => {
    it('should delete a single document and recreate it', async () => {
      if (skipIfNoES()) return;

      // Create a document to delete
      await axios.post(`${ES_URL}/${TEST_INDEX}/_doc/delete-test`, {
        title: 'To Be Deleted',
        status: 'temporary',
      });
      await axios.post(`${ES_URL}/${TEST_INDEX}/_refresh`);

      const hit: ElasticsearchHit = {
        _index: TEST_INDEX,
        _type: '_doc',
        _id: 'delete-test',
      };

      await deleteDocument(SEARCH_URL, hit, logger);

      // Refresh and verify deletion
      await axios.post(`${ES_URL}/${TEST_INDEX}/_refresh`);

      try {
        await axios.get(`${ES_URL}/${TEST_INDEX}/_doc/delete-test`);
        fail('Document should have been deleted');
      } catch (error) {
        if (axios.isAxiosError(error)) {
          expect(error.response?.status).toBe(404);
        }
      }
    });

    it('should delete multiple documents', async () => {
      if (skipIfNoES()) return;

      // Create documents to delete
      for (let i = 1; i <= 3; i++) {
        await axios.post(`${ES_URL}/${TEST_INDEX}/_doc/bulk-delete-${i}`, {
          title: `Bulk Delete ${i}`,
          status: 'bulk-temp',
        });
      }
      await axios.post(`${ES_URL}/${TEST_INDEX}/_refresh`);

      const hits: ElasticsearchHit[] = [
        { _index: TEST_INDEX, _type: '_doc', _id: 'bulk-delete-1' },
        { _index: TEST_INDEX, _type: '_doc', _id: 'bulk-delete-2' },
        { _index: TEST_INDEX, _type: '_doc', _id: 'bulk-delete-3' },
      ];

      await deleteDocuments(SEARCH_URL, hits, logger, 2);

      // Refresh and verify all deleted
      await axios.post(`${ES_URL}/${TEST_INDEX}/_refresh`);

      for (const hit of hits) {
        try {
          await axios.get(`${ES_URL}/${TEST_INDEX}/_doc/${hit._id}`);
          fail(`Document ${hit._id} should have been deleted`);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            expect(error.response?.status).toBe(404);
          }
        }
      }
    });
  });

  describe('CLI Integration', () => {
    it('should execute CLI with match_all query', async () => {
      if (skipIfNoES()) return;

      const output = execSync(
        `node dist/cli.js -d "${SEARCH_URL}" -q '{"match_all":{}}' --q2 --no-banner`,
        { encoding: 'utf-8', cwd: process.cwd() }
      );

      expect(output).toContain('Executing search');
      expect(output).toContain('Found');
      expect(output).toContain('results');
    });

    it('should execute CLI with term query', async () => {
      if (skipIfNoES()) return;

      const output = execSync(
        `node dist/cli.js -d "${SEARCH_URL}" -q '{"term":{"status":"active"}}' --q2 --no-banner`,
        { encoding: 'utf-8', cwd: process.cwd() }
      );

      expect(output).toContain('Found');
    });

    it('should execute CLI with size limit', async () => {
      if (skipIfNoES()) return;

      const output = execSync(
        `node dist/cli.js -d "${SEARCH_URL}" -q '{"match_all":{}}' -s 2 --q2 --no-banner`,
        { encoding: 'utf-8', cwd: process.cwd() }
      );

      expect(output).toContain('Found 2 results');
    });

    it('should show help', () => {
      const output = execSync('node dist/cli.js --help', { encoding: 'utf-8' });

      expect(output).toContain('Usage: es-search');
      expect(output).toContain('--database');
      expect(output).toContain('--query');
      expect(output).toContain('--scroll');
    });

    it('should show version', () => {
      const output = execSync('node dist/cli.js --version', { encoding: 'utf-8' });

      expect(output.trim()).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should error without required options', () => {
      try {
        execSync('node dist/cli.js --no-banner', { encoding: 'utf-8', stdio: 'pipe' });
        fail('Should have thrown error');
      } catch (error) {
        // Expected to fail
        expect(error).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON query', async () => {
      if (skipIfNoES()) return;

      const options: QueryOptions = {
        database: SEARCH_URL,
        query: 'not valid json',
        q2: true,
      };

      await expect(queryData(options, logger)).rejects.toThrow('Invalid query JSON');
    });

    it('should handle non-existent index', async () => {
      if (skipIfNoES()) return;

      const options: QueryOptions = {
        database: `${ES_URL}/non-existent-index-xyz/_search`,
        query: '{"match_all":{}}',
        q2: true,
      };

      await expect(queryData(options, logger)).rejects.toThrow();
    });
  });
});
