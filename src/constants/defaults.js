import { DATA_VERSION } from './storageKeys'

export const DEFAULT_CONFIG = Object.freeze({
  version: DATA_VERSION,
  retirementTarget: 3000000,
  currentAssets: 100000,
  totalDebt: 50000,
  monthlySalary: 15000,
  annualBonus: 30000,
  sideIncome: 1000,
  monthlyExpense: 7000,
  annualExpense: 12000,
  monthlyDebtPayment: 3000,
  annualReturnRate: 0.02,
  inflationEnabled: true,
  inflationRate: 0.02,
  salaryGrowthRate: 0.03,
  isDemo: true,
})

export const EMPTY_CONFIG = Object.freeze({ ...DEFAULT_CONFIG, retirementTarget: 0, currentAssets: 0, totalDebt: 0, monthlySalary: 0, annualBonus: 0, sideIncome: 0, monthlyExpense: 0, annualExpense: 0, monthlyDebtPayment: 0, isDemo: false })
export const DEFAULT_SETTINGS = Object.freeze({ version: DATA_VERSION, privacyMode: false, welcomed: false })

export const RECORD_CATEGORIES = Object.freeze({
  income: ['工资', '副业', '奖金', '红包', '投资分红', '其他收入'],
  expense: ['住房', '餐饮', '交通', '购物', '娱乐', '医疗', '教育', '其他支出'],
  adjustment: ['资产增加', '资产减少'],
})
