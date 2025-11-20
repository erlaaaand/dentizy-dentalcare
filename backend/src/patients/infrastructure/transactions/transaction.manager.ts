import { Injectable, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionManager {
    private readonly logger = new Logger(TransactionManager.name);
    private readonly MAX_RETRY_ATTEMPTS = 5;

    constructor(private readonly dataSource: DataSource) { }

    /**
     * Execute operation dengan transaction dan retry mechanism
     */
    async executeWithRetry<T>(
        operation: (queryRunner: any) => Promise<T>
    ): Promise<T> {
        let attempts = 0;
        let lastError: Error = new Error('Unknown error occurred');

        while (attempts < this.MAX_RETRY_ATTEMPTS) {
            attempts++;
            const queryRunner = this.dataSource.createQueryRunner();

            try {
                await queryRunner.connect();
                await queryRunner.startTransaction();

                const result = await operation(queryRunner);

                await queryRunner.commitTransaction();
                return result;

            } catch (error) {
                await queryRunner.rollbackTransaction();
                lastError = error;

                // Don't retry on validation errors
                if (error instanceof ConflictException || error instanceof BadRequestException) {
                    throw error;
                }

                // PERBAIKAN LOGIC DISINI:
                if (this.isRetryableError(error)) {
                    // Jika masih ada sisa percobaan -> Retry
                    if (attempts < this.MAX_RETRY_ATTEMPTS) {
                        const backoffTime = Math.min(100 * Math.pow(2, attempts - 1), 1000);
                        this.logger.warn(`⚠️ Retry attempt ${attempts}/${this.MAX_RETRY_ATTEMPTS} after ${backoffTime}ms`);
                        await new Promise(resolve => setTimeout(resolve, backoffTime));
                        continue; // Ulangi loop
                    } else {
                        // Jika percobaan habis tapi error retryable -> Break loop
                        // Ini akan membiarkan kode mengeksekusi throw di luar loop
                        break;
                    }
                }

                // Jika error TIDAK retryable (misal syntax error), lempar error generic langsung
                this.logger.error('❌ Transaction error:', error);
                throw new BadRequestException('Operasi gagal dilakukan');
            } finally {
                await queryRunner.release();
            }
        }

        // Kode ini sekarang bisa dijangkau jika loop di-break karena limit habis
        this.logger.error(`❌ Failed after ${this.MAX_RETRY_ATTEMPTS} attempts:`, lastError);
        throw new BadRequestException('Operasi gagal setelah beberapa percobaan');
    }

    private isRetryableError(error: any): boolean {
        const retryableCodes = [
            'ER_LOCK_DEADLOCK',
            'ER_LOCK_WAIT_TIMEOUT',
            '40001', // Serialization failure
            '40P01', // Deadlock detected (PostgreSQL)
        ];

        return retryableCodes.some(code =>
            error.code === code || error.message?.includes(code)
        );
    }
}