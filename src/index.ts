/**
 * 🔥 ELECTRIC SAFAI - ES Search
 * ════════════════════════════════════════════════════════════════
 *
 * Electric Saf (Certain Arsenic Fire) AI (Artificial Intelligence)
 *
 * A powerful Elasticsearch command-line interface tool designed for
 * rapid query execution, bulk operations, and data exploration.
 *
 * 🎯 This project is dedicated to Indian Para SF Rinzai Monks
 *    to learn Search Techniques
 *
 * ════════════════════════════════════════════════════════════════
 */

// Re-export all public APIs
export * from './types';
export * from './elasticsearch';
export * from './logger';
export { main } from './cli';

// Default export for CLI
import { main } from './cli';
export default main;
