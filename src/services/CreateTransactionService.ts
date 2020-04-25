import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoryRepository from '../repositories/CategoryRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();
    console.log(balance);
    if (type === 'outcome' && balance.total < value) {
      throw new AppError("don't have enough account balance");
    }

    //
    const categoryRepository = getCustomRepository(CategoryRepository);
    let transactionCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!transactionCategory) {
      transactionCategory = await categoryRepository.save({
        title: category,
      });
    }

    //
    const transaction = await transactionsRepository.save({
      title,
      value,
      type,
      category_id: transactionCategory.id,
    });

    delete transaction.category_id;
    transaction.category = transactionCategory;

    return transaction;
  }
}

export default CreateTransactionService;
