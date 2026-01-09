/**
 * 🔥 Electric Safai - CLI Interface
 * Command-line interface for Elasticsearch queries
 */

import { Command } from 'commander';
import { createLogger, setLogLevel, Logger } from './logger';
import {
  queryData,
  scrollFetch,
  deleteDocuments,
} from './elasticsearch';
import { QueryOptions, ElasticsearchHit } from './types';
import chalk from 'chalk';

const VERSION = '1.0.0';

/**
 * 🎨 Display banner
 */
function displayBanner(): void {
  console.log(chalk.cyan(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║   ⚡ ${chalk.yellow('ELECTRIC SAFAI')} ⚡                                      ║
  ║   ${chalk.gray('ES Search - Elasticsearch CLI Tool')}                        ║
  ║                                                               ║
  ║   🔥 ${chalk.red('Saf')} (Certain Arsenic Fire) + ${chalk.blue('AI')} (Artificial Intelligence)   ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
  `));
}

/**
 * 🚀 Main CLI entry point
 */
export async function main(): Promise<void> {
  const program = new Command();
  const logger = createLogger('es-search');

  program
    .name('es-search')
    .description('🔥 Electric Safai - Powerful Elasticsearch CLI Tool')
    .version(VERSION)
    .option('-d, --database <url>', 'Elasticsearch endpoint URL (must end with /_search)')
    .option('-q, --query <json>', 'Query in JSON format, e.g., {"field": "value"}')
    .option('-f, --from [index]', 'Starting index for pagination (disabled with --scroll)')
    .option('-s, --size [number]', 'Number of results per batch (default: 10)')
    .option('--source [fields]', 'Comma-separated list of fields to return (_source)')
    .option('--sort [field:order]', 'Sort by field (e.g., timestamp:desc)')
    .option('--scroll', 'Use scroll API for large result sets')
    .option('--delete [yes/Y]', 'Delete all matching documents')
    .option('--extend [json]', 'Merge additional JSON into request body')
    .option('--q2', 'Use ES 2.x/5.x+ query syntax (default is 1.x)')
    .option('--aggs-terms [field]', 'Perform terms aggregation on specified field')
    .option('--verbose', 'Enable verbose/debug output')
    .option('--no-banner', 'Disable banner display')
    .action(async (options) => {
      if (options.banner !== false) {
        displayBanner();
      }

      if (options.verbose) {
        setLogLevel('debug');
      }

      await runSearch(options, logger);
    });

  await program.parseAsync(process.argv);
}

/**
 * 🔍 Execute search operation
 */
async function runSearch(options: Record<string, unknown>, logger: Logger): Promise<void> {
  // Validate required options
  if (!options.query || !options.database) {
    console.log(chalk.red('❌ Error: --database and --query are required'));
    console.log(chalk.gray('Use --help for usage information'));
    process.exit(1);
  }

  const database = options.database as string;
  if (!database.endsWith('/_search')) {
    logger.warn('--database value should end with /_search');
    console.log(chalk.yellow('⚠️  Warning: --database value should end with /_search'));
  }

  const queryOptions: QueryOptions = {
    database,
    query: options.query as string,
    from: options.from !== undefined ? parseInt(options.from as string, 10) : undefined,
    size: options.size !== undefined ? parseInt(options.size as string, 10) : 10,
    source: options.source as string | undefined,
    sort: options.sort as string | undefined,
    scroll: options.scroll as boolean | undefined,
    delete: options.delete as string | undefined,
    extend: options.extend as string | undefined,
    q2: options.q2 as boolean | undefined,
    aggsTerms: options.aggsTerms as string | undefined,
  };

  try {
    console.log(chalk.cyan('🔍 Executing search...'));
    const results = await queryData(queryOptions, logger);

    if (queryOptions.scroll) {
      // Scroll mode: output to stderr
      const writeResult = (hit: ElasticsearchHit): void => {
        console.error(JSON.stringify(hit));
      };

      await scrollFetch(database, !!queryOptions.q2, writeResult, logger);
      logger.info('🎉 Scroll complete!');
    } else if (queryOptions.delete === 'yes' || queryOptions.delete === 'Y') {
      // Delete mode
      console.log(chalk.yellow(`🗑️  Deleting ${results.length} documents...`));
      await deleteDocuments(database, results, logger);
      console.log(chalk.green('✅ Deletion complete!'));
    } else {
      // Normal mode: output results
      console.log(chalk.green(`\n📊 Found ${results.length} results:\n`));
      for (const hit of results) {
        logger.debug('%j', hit);
        console.log(chalk.gray('─'.repeat(50)));
        console.log(chalk.cyan(`ID: ${hit._id}`));
        console.log(chalk.gray(`Index: ${hit._index} | Type: ${hit._type}`));
        if (hit._source) {
          console.log(chalk.white(JSON.stringify(hit._source, null, 2)));
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(chalk.red(`❌ Error: ${message}`));
    logger.error('Search failed: %s', message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}
