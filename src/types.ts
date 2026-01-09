/**
 * 🔥 Electric Safai - ES Search Types
 * Type definitions for Elasticsearch CLI operations
 */

export interface ElasticsearchHit {
  _index: string;
  _type: string;
  _id: string;
  _score?: number;
  _source?: Record<string, unknown>;
}

export interface ElasticsearchResponse {
  took?: number;
  timed_out?: boolean;
  _scroll_id?: string;
  hits: {
    total: number | { value: number; relation: string };
    max_score?: number;
    hits: ElasticsearchHit[];
  };
  aggregations?: Record<string, AggregationResult>;
  error?: ElasticsearchError;
}

export interface AggregationResult {
  buckets: AggregationBucket[];
}

export interface AggregationBucket {
  key: string | number;
  doc_count: number;
}

export interface ElasticsearchError {
  type: string;
  reason: string;
  status?: number;
}

export interface QueryOptions {
  database: string;
  query: string;
  from?: number;
  size?: number;
  source?: string;
  sort?: string;
  scroll?: boolean;
  delete?: string;
  extend?: string;
  q2?: boolean;
  aggsTerms?: string;
}

export interface RequestParams {
  uri: string;
  method: 'GET' | 'POST' | 'DELETE';
  qs?: Record<string, unknown>;
  json?: Record<string, unknown> | boolean;
}

export interface ScrollState {
  scrollId: string;
  count: number;
  results: ElasticsearchHit[];
}

export interface FetchResult {
  hits: ElasticsearchHit[];
  scrollId?: string;
}

export interface SearchConfig {
  endpoint: string;
  scrollTimeout: string;
  concurrencyLimit: number;
}

export const DEFAULT_CONFIG: SearchConfig = {
  endpoint: '',
  scrollTimeout: '1m',
  concurrencyLimit: 10,
};
