import { Injectable, Logger } from '@nestjs/common';
import { QueryRunner } from 'typeorm';

/**
 * Transaction manager untuk handle database transactions
 * Reusable transaction wrapper dengan proper error handling
 */
@Injectable()
export class TransactionManager {
  private readonly logger = new Logger(TransactionManager.name);

  /**
   * Execute operation dalam transaction
   * Auto rollback jika error, auto release connection
   */
  async executeInTransaction<T>(
    queryRunner: QueryRunner,
    operation: (qr: QueryRunner) => Promise<T>,
    operationName: string = 'transaction',
  ): Promise<T> {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.debug(`🔄 Starting transaction: ${operationName}`);

      const result = await operation(queryRunner);

      await queryRunner.commitTransaction();
      this.logger.debug(`✅ Transaction committed: ${operationName}`);

      return result;
    } catch (error) {
      try {
        await queryRunner.rollbackTransaction();
        this.logger.error(
          `❌ Transaction rolled back: ${operationName}`,
          error.stack,
        );
      } catch (rollbackError) {
        this.logger.error(
          `⚠️ CRITICAL: Rollback failed for transaction: ${operationName}`,
          rollbackError.stack,
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
      this.logger.debug(`🔌 Connection released: ${operationName}`);
    }
  }

  /**
   * Execute multiple operations dalam single transaction
   */
  async executeMultiple<T>(
    queryRunner: QueryRunner,
    operations: Array<(qr: QueryRunner) => Promise<any>>,
    operationName: string = 'multiple-operations',
  ): Promise<T[]> {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.debug(`🔄 Starting multiple operations: ${operationName}`);

      const results: T[] = [];
      for (const operation of operations) {
        const result = await operation(queryRunner);
        results.push(result);
      }

      await queryRunner.commitTransaction();
      this.logger.debug(`✅ All operations committed: ${operationName}`);

      return results;
    } catch (error) {
      try {
        await queryRunner.rollbackTransaction();
        this.logger.error(`❌ Transaction rolled back: ${operationName}`);
      } catch (rollbackError) {
        // rollback gagal, tapi jangan ganti error asli
        this.logger.error(
          `⚠️ Rollback failed for transaction: ${operationName}`,
          rollbackError.stack,
        );
      }
      // lempar error asli agar caller tahu terjadi kegagalan
      throw error;
    } finally {
      await queryRunner.release();
      this.logger.debug(`🔌 Connection released: ${operationName}`);
    }
  }

  /**
   * Execute dengan retry mechanism (untuk deadlock handling)
   */
  async executeWithRetry<T>(
    queryRunner: QueryRunner,
    operation: (qr: QueryRunner) => Promise<T>,
    maxRetries: number = 3,
    operationName: string = 'transaction-with-retry',
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(
          `🔄 Attempt ${attempt}/${maxRetries}: ${operationName}`,
        );
        return await this.executeInTransaction(
          queryRunner,
          operation,
          operationName,
        );
      } catch (error) {
        lastError = error;

        // Check if error is deadlock related
        const isDeadlock =
          error.message?.includes('deadlock') ||
          error.code === 'ER_LOCK_DEADLOCK';

        if (isDeadlock && attempt < maxRetries) {
          this.logger.warn(
            `⚠️ Deadlock detected, retrying... (${attempt}/${maxRetries})`,
          );
          // Wait before retry (exponential backoff)
          await this.sleep(Math.pow(2, attempt) * 100);
          continue;
        }

        throw error;
      }
    }

    throw lastError!;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
