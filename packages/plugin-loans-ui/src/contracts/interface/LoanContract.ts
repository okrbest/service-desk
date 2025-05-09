export type LoanContract = {
  contractDate: Date;
  loanPurpose: string;
  loanDestination: string;
  contractTypeId: string;
  status: string;
  description: string;
  marginAmount: number;
  leaseAmount: number;
  feeAmount: number;
  tenor: number;
  interestRate: number;
  interestMonth: number;
  skipInterestCalcMonth: number;
  repayment: string;
  startDate: Date;
  firstPayDate: Date;
  scheduleDays: number[];
  stepRules: any[];
  customerId: string;
  customerType: string;
  branchId: string;
  lossPercent: number;
  lossCalcType: string;
  currency: string;
  debt: number;
  debtTenor: number;
  debtLimit: number;
  skipAmountCalcMonth: number;
  relationExpertId: string;
  leasingExpertId: string;
  riskExpertId: string;
  useDebt: boolean;
  useMargin: boolean;
  useSkipInterest: boolean;
  leaseType: string;
  weekends: number[];
  relContractId?: string;
  isPayFirstMonth?: boolean;
  isBarter?: boolean;
  downPayment?: number;
  customPayment?: number;
  customInterest?: number;
  useManualNumbering: boolean;
  useFee: boolean;
  commitmentInterest: number;
  savingContractId: string;
  endDate: Date;
  holidayType: string;
};

export type LoanSchedule = {
  order: number;
  payment: number;
  balance: number;
  diffDay: number;

  contractId?: string;
  version?: string;
  createdAt?: Date;
  status?: string;
  payDate: Date;

  loss?: number;
  interestEve?: number;
  interestNonce?: number;
  insurance?: number;
  debt?: number;
  total: number;

  didLoss?: number;
  didInterestEve?: number;
  didInterestNonce?: number;
  didPayment?: number;
  didInsurance?: number;
  didDebt?: number;
  didTotal?: number;
  surplus?: number;

  scheduleDidPayment?: number;
  scheduleDidInterest?: number;
  scheduleDidStatus?: 'done' | 'less' | 'pending';

  transactionIds?: string[];
  isDefault?: boolean;
};
