/**
 * 🔥 Electric Safai - Elasticsearch Client
 * Core Elasticsearch operations for the CLI
 */

import axios, { AxiosRequestConfig } from 'axios';
import {
  ElasticsearchHit,
  ElasticsearchResponse,
  QueryOptions,
  RequestParams,
  FetchResult,
  DEFAULT_CONFIG,
} from './types';
import { Logger } from './logger';

let SCROLL_ID = '';

/**
 * 🔍 Execute initial Elasticsearch query
 */
export async function queryData(
  options: QueryOptions,
  logger: Logger
): Promise<ElasticsearchHit[]> {
  const size = options.size || 10;
  const params: Record<string, unknown> = {
    size,
  };

  if (options.from !== undefined) {
    params.from = options.from;
  }
  if (options.source) {
    params._source = options.source;
  }
  if (options.sort) {
    params.sort = options.sort;
  }

  // Parse and convert query
  let queryBody: Record<string, unknown>;
  try {
    const parsedQuery = JSON.parse(options.query);
    // Simple query conversion (mimicking mqes.convQuery behavior)
    queryBody = convertQuery(parsedQuery, options.q2);
  } catch (error) {
    throw new Error(`Invalid query JSON: ${options.query}`);
  }

  // Handle scroll mode
  if (options.scroll) {
    params.scroll = DEFAULT_CONFIG.scrollTimeout;
    if (!options.q2) {
      params.search_type = 'scan';
    }
  }

  // Handle aggregations
  if (options.aggsTerms) {
    queryBody.aggs = {
      [options.aggsTerms]: {
        terms: { field: options.aggsTerms },
      },
    };
  }

  // Merge extended options
  if (options.extend) {
    try {
      const extendObj = JSON.parse(options.extend);
      Object.assign(queryBody, extendObj);
    } catch (error) {
      throw new Error(`Invalid extend JSON: ${options.extend}`);
    }
  }

  const requestConfig: AxiosRequestConfig = {
    method: 'POST',
    url: options.database,
    params,
    data: queryBody,
  };

  logger.debug('Request: %j', requestConfig);

  try {
    const response = await axios(requestConfig);
    const body: ElasticsearchResponse = response.data;

    if (body.error) {
      throw new Error(`Elasticsearch error: ${JSON.stringify(body.error)}`);
    }

    // Store scroll ID for pagination
    if (body._scroll_id) {
      SCROLL_ID = body._scroll_id;
    }

    // Handle aggregations output
    if (body.aggregations && options.aggsTerms) {
      const aggResult = body.aggregations[options.aggsTerms];
      if (aggResult?.buckets) {
        for (const bucket of aggResult.buckets) {
          console.log(bucket);
        }
      }
    }

    const hits = body.hits.hits;
    const total = typeof body.hits.total === 'number'
      ? body.hits.total
      : body.hits.total.value;

    logger.info('total %d / %d', hits.length, total);
    return hits;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`HTTP Error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * 📜 Fetch next batch using scroll API
 */
export async function fetch(
  database: string,
  q2: boolean,
  logger: Logger
): Promise<FetchResult> {
  const urlParts = database.split('/');
  const protocol = urlParts[0];
  const domain = urlParts[2];
  const scrollUri = `${protocol}//${domain}/_search/scroll`;

  const scrollParams = {
    scroll_id: SCROLL_ID,
    scroll: DEFAULT_CONFIG.scrollTimeout,
  };

  const requestConfig: AxiosRequestConfig = {
    method: 'POST',
    url: scrollUri,
  };

  if (q2) {
    requestConfig.data = scrollParams;
  } else {
    requestConfig.params = scrollParams;
    requestConfig.data = {};
  }

  try {
    const response = await axios(requestConfig);
    const body: ElasticsearchResponse = response.data;

    if (!body || !body.hits) {
      return { hits: [] };
    }

    if (body._scroll_id) {
      SCROLL_ID = body._scroll_id;
    }

    return {
      hits: body.hits.hits,
      scrollId: body._scroll_id,
    };
  } catch (error) {
    return { hits: [] };
  }
}

/**
 * 🔄 Scroll through all results
 */
export async function scrollFetch(
  database: string,
  q2: boolean,
  iterator: (hit: ElasticsearchHit) => void,
  logger: Logger
): Promise<void> {
  let fetchCount = 0;
  let hasMore = true;

  while (hasMore) {
    const result = await fetch(database, q2, logger);

    for (const hit of result.hits) {
      iterator(hit);
    }

    logger.info('fetch %d get %d fin!', fetchCount++, result.hits.length);
    hasMore = result.hits.length > 0;
  }
}

/**
 * 🗑️ Delete a single document
 */
export async function deleteDocument(
  database: string,
  hit: ElasticsearchHit,
  logger: Logger
): Promise<void> {
  const urlParts = database.split('/');
  const protocol = urlParts[0];
  const domain = urlParts[2];
  const deleteUri = `${protocol}//${domain}/${hit._index}/${hit._type}/${hit._id}`;

  try {
    const response = await axios({
      method: 'DELETE',
      url: deleteUri,
    });
    logger.debug('%j', response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error('Delete failed: %s', error.message);
    }
  }
}

/**
 * 🗑️ Delete multiple documents with concurrency limit
 */
export async function deleteDocuments(
  database: string,
  hits: ElasticsearchHit[],
  logger: Logger,
  concurrency: number = DEFAULT_CONFIG.concurrencyLimit
): Promise<void> {
  const chunks: ElasticsearchHit[][] = [];
  for (let i = 0; i < hits.length; i += concurrency) {
    chunks.push(hits.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    await Promise.all(
      chunk.map((hit) => deleteDocument(database, hit, logger))
    );
  }
}

/**
 * 🔄 Convert simplified query to Elasticsearch query DSL
 */
function convertQuery(
  query: Record<string, unknown>,
  useV2Syntax: boolean = false
): Record<string, unknown> {
  // Simple conversion: wrap in query.filtered.filter for v1 or query.bool.filter for v2
  if (useV2Syntax) {
    return {
      query: {
        bool: {
          filter: query,
        },
      },
    };
  }

  return {
    query: {
      filtered: {
        filter: query,
      },
    },
  };
}

/**
 * 🔍 Get current scroll ID
 */
export function getScrollId(): string {
  return SCROLL_ID;
}

/**
 * 🔄 Reset scroll ID
 */
export function resetScrollId(): void {
  SCROLL_ID = '';
}
