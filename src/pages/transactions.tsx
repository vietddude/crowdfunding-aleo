import React, { useState, FormEvent, useEffect } from 'react';
import type { NextPageWithLayout } from '@/types';
import { NextSeo } from 'next-seo';
import DashboardLayout from '@/layouts/dashboard/_dashboard';
import Base from '@/components/ui/base';
import { Check } from '@/components/icons/check';
import Button from '@/components/ui/button';
import { getTxn, Transaction } from '@/api/projects';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';

const TransactionElement: React.FC<Transaction> = (
  transaction: Transaction
) => {
  return (
    <div className="m-4 rounded border border-gray-300 p-4">
      <a
        href={`https://explorer.aleo.org/transaction/${transaction.txn_id}`}
        target="_blank"
        rel="noreferrer"
      >
        <p>
          <strong>Transaction ID:</strong> {transaction.txn_id}
        </p>
        <p>
          <strong>Project Name:</strong> {transaction.project_name}
        </p>
        <p>
          <strong>Amount:</strong> {transaction.amount} ALEO
        </p>
      </a>
    </div>
  );
};

const InvestPage: NextPageWithLayout = () => {
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);

  useEffect(() => {
    // Call the getTxn function to fetch the data
    if (publicKey) {
      getTxn(publicKey).then((data) => {
        setTransactions(data);
        setFilteredTransactions(data);
      });
    }
  }, [publicKey]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const filteredTransactions = transactions.filter((transaction) => {
      return transaction.project_name
        .toLowerCase()
        .includes(searchInput.toLowerCase());
    });
    setFilteredTransactions(filteredTransactions);
  };

  return (
    <>
      <NextSeo title="My Transactions" description="My Transactions" />
      <Base>
        <h1 className="mb-4 text-center text-4xl font-bold">
          Transactions History
        </h1>

        <form
          className="relative flex w-full rounded-full md:w-auto"
          noValidate
          role="search"
          onSubmit={handleSearch}
        >
          <label className="flex w-full items-center">
            <input
              className="h-11 w-full appearance-none rounded-lg border-2 border-gray-200 bg-transparent py-1 text-sm tracking-tighter text-gray-900 outline-none transition-all placeholder:text-gray-600 focus:border-gray-900 ltr:pr-5 ltr:pl-10 rtl:pr-10 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500"
              placeholder="Search Project Name"
              autoComplete="off"
              value={searchInput}
              onChange={(event: FormEvent<HTMLInputElement>) =>
                setSearchInput(event.currentTarget.value)
              }
            />
            <span className="hover-text-gray-900 ltr-left-0 ltr-pl-2 rtl-right-0 rtl-pr-2 dark-text-gray-500 sm-ltr-pl-3 sm-rtl-pr-3 pointer-events-none absolute flex h-full w-8 cursor-pointer items-center justify-center text-gray-600">
              <Check className="h-4 w-4" />
            </span>
            <Button
              type="submit"
              className="md-h-10 md-px-5 xl-h-12 xl-px-7 ml-4 shadow-card dark:bg-gray-700"
            >
              {'Search'}
            </Button>
          </label>
        </form>

        <div className="mt-10 h-[600px] overflow-y-auto">
          <div className="flex flex-col space-y-4">
            {filteredTransactions.map((transaction, index) => (
              <TransactionElement key={index} {...transaction} />
            ))}
          </div>
        </div>
      </Base>
    </>
  );
};

InvestPage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default InvestPage;
