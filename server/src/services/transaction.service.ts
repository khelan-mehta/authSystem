import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from '../schemas/transaction.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  // Fetch transactions with sorting & pagination
  async getTransactions(page: number, limit: number) {
    const transactions = await this.transactionModel
      .find()
      .sort({ Date: -1, Time: -1 }) // Sorting by latest transactions
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.transactionModel.countDocuments();

    return { transactions, total };
  }

  // Get only transactions flagged as laundering
  async getLaunderingTransactions() {
    return await this.transactionModel.find({ Is_laundering: 1 }).exec();
  }

  // Categorize transactions based on Laundering_type
  async categorizeLaunderingTransactions() {
    const launderingTransactions = await this.getLaunderingTransactions();
    //console.log(launderingTransactions);

    const categories = launderingTransactions.reduce((acc, txn) => {
      const category = txn.Laundering_type;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(txn);
      return acc;
    }, {});

    return categories;
  }

  async searchTransactions(filters: any) {
    const query: any = {};

    if (filters.transactionId) query.Transaction_ID = filters.transactionId;
    if (filters.date) query.Date = filters.date;
    if (filters.senderAccount) query.Sender_account = filters.senderAccount;
    if (filters.receiverAccount)
      query.Receiver_account = filters.receiverAccount;
    if (filters.amountMin) query.Amount = { $gte: filters.amountMin };
    if (filters.amountMax)
      query.Amount = { ...query.Amount, $lte: filters.amountMax };
    if (filters.paymentType) query.Payment_type = filters.paymentType;
    if (filters.isLaundering !== undefined)
      query.Is_laundering = filters.isLaundering;

    return await this.transactionModel.find(query).exec();
  }

  async getFlaggedUsers() {
    const launderingTransactions = await this.getLaunderingTransactions();

    const userMap = new Map<number, TransactionDocument[]>();

    launderingTransactions.forEach((txn) => {
      if (!userMap.has(txn.Sender_account)) {
        userMap.set(txn.Sender_account, []);
      }
      userMap.get(txn.Sender_account)?.push(txn);
    });

    return Array.from(userMap.entries()).map(([user, transactions]) => ({
      user,
      transactions,
      riskLevel: this.calculateRiskLevel(transactions.length),
    }));
  }

  private calculateRiskLevel(count: number) {
    if (count > 5) return 'High';
    if (count > 2) return 'Medium';
    return 'Low';
  }
}
