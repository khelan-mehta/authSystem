import { Controller, Get, Query } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // Fetch paginated transactions
  @Get()
  async getTransactions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.transactionService.getTransactions(Number(page), Number(limit));
  }

  // Fetch laundering transactions
  @Get('laundering')
  async getLaunderingTransactions() {
    return this.transactionService.getLaunderingTransactions();
  }

  // Categorize laundering transactions
  @Get('laundering/categories')
  async getCategorizedLaunderingTransactions() {
    return this.transactionService.categorizeLaunderingTransactions();
  }

  @Get('flagged-users')
  async getFlaggedUsers() {
    return this.transactionService.getFlaggedUsers();
  }

  // Search transactions with filters
  @Get('search')
  async searchTransactions(
    @Query('transactionId') transactionId?: string,
    @Query('date') date?: string,
    @Query('senderAccount') senderAccount?: number,
    @Query('receiverAccount') receiverAccount?: number,
    @Query('amountMin') amountMin?: number,
    @Query('amountMax') amountMax?: number,
    @Query('paymentType') paymentType?: string,
    @Query('isLaundering') isLaundering?: number
  ) {
    return this.transactionService.searchTransactions({
      transactionId,
      date,
      senderAccount: Number(senderAccount),
      receiverAccount: Number(receiverAccount),
      amountMin: Number(amountMin),
      amountMax: Number(amountMax),
      paymentType,
      isLaundering: Number(isLaundering),
    });
  }
}
