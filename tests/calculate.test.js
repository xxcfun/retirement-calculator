import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from '../src/constants/defaults'
import { calculateDynamicRetirement, calculateMonthlyRate, calculateNetAsset, calculateStaticRetirement, calculateTenYearForecast, formatDuration, hasInvalidResult } from '../src/utils/calculate'

const config = patch => ({ ...DEFAULT_CONFIG, isDemo: false, ...patch })
describe('核心退休计算', () => {
  it('初始净资产达标返回 0 个月', () => { const r = calculateDynamicRetirement(config({ currentAssets: 3500000, totalDebt: 200000 })); expect(r.totalMonths).toBe(0); expect(r.reachable).toBe(true) })
  it('资产与负债同时存在时使用净资产', () => expect(calculateNetAsset(100000, 50000)).toBe(50000))
  it('还款不会重复降低净资产', () => { const r = calculateDynamicRetirement(config({ currentAssets: 100000, totalDebt: 5000, monthlySalary: 10000, sideIncome: 0, monthlyExpense: 5000, monthlyDebtPayment: 3000, annualBonus: 0, annualExpense: 0, annualReturnRate: 0, inflationEnabled: false, salaryGrowthRate: 0, retirementTarget: 99999999 })); expect(r.timeline[0].assets).toBe(102000); expect(r.timeline[0].debt).toBe(2000); expect(r.timeline[0].netAsset).toBe(100000) })
  it('最后一期还款不超过剩余负债', () => { const r = calculateDynamicRetirement(config({ currentAssets: 10000, totalDebt: 3500, monthlySalary: 5000, sideIncome: 0, monthlyExpense: 0, monthlyDebtPayment: 3000, annualBonus: 0, annualExpense: 0, annualReturnRate: 0, inflationEnabled: false, salaryGrowthRate: 0, retirementTarget: 9999999 })); expect(r.timeline[1].payment).toBe(500); expect(r.timeline[1].debt).toBe(0) })
  it('计划还款为 0 时结构化不可达且负债不变', () => { const r = calculateDynamicRetirement(config({ totalDebt: 1000, monthlyDebtPayment: 0, monthlySalary: 0, sideIncome: 0, monthlyExpense: 0, annualBonus: 0, annualExpense: 0, retirementTarget: 999999 })); expect(r.reachable).toBe(false); expect(r.finalDebt).toBe(1000) })
  it('长期无还款现金时不动用初始资产还债', () => { const r = calculateDynamicRetirement(config({ currentAssets: 100000, totalDebt: 50000, monthlySalary: 1000, sideIncome: 0, monthlyExpense: 2000, monthlyDebtPayment: 3000, annualBonus: 0, annualExpense: 0, annualReturnRate: 0, inflationEnabled: false, salaryGrowthRate: 0, retirementTarget: 3000000 })); expect(r.timeline[0].payment).toBe(0); expect(r.finalDebt).toBe(50000) })
  it('财富阶段非正结余返回不可达', () => expect(calculateStaticRetirement(config({ totalDebt: 0, monthlySalary: 1000, sideIncome: 0, monthlyExpense: 1000, annualBonus: 0, annualExpense: 0 })).reachable).toBe(false))
  it('支持负投资收益率且不产生非法数值', () => { const r = calculateDynamicRetirement(config({ annualReturnRate: -0.2 })); expect(r.timeline[0].investmentIncome).toBeLessThan(0); expect(hasInvalidResult(r)).toBe(false) })
  it('支持负工资增长率', () => { const r = calculateDynamicRetirement(config({ salaryGrowthRate: -0.2, retirementTarget: 99999999 })); expect(r.timeline[12].salary).toBe(Math.round(r.timeline[11].salary * 0.8)) })
  it('关闭通胀后目标保持不变', () => { const r = calculateDynamicRetirement(config({ inflationEnabled: false, retirementTarget: 99999999 })); expect(new Set(r.timeline.map(x => x.target)).size).toBe(1) })
  it('年度事件只在第 12 与 24 月发生', () => { const r = calculateDynamicRetirement(config({ monthlySalary: 0, sideIncome: 0, monthlyExpense: 0, annualBonus: 12000, annualExpense: 2000, totalDebt: 0, annualReturnRate: 0, inflationEnabled: false, salaryGrowthRate: 0, retirementTarget: 99999999 })); expect(r.timeline[10].operatingFlow).toBe(0); expect(r.timeline[11].operatingFlow).toBe(10000); expect(r.timeline[23].operatingFlow).toBe(10000) })
  it('最多模拟 1200 个月并返回不可达', () => { const r = calculateDynamicRetirement(config({ currentAssets: 0, totalDebt: 0, monthlySalary: 0, sideIncome: 0, monthlyExpense: 0, annualBonus: 0, annualExpense: 0, annualReturnRate: 0, inflationEnabled: false, salaryGrowthRate: 0, retirementTarget: 1 })); expect(r.timeline).toHaveLength(1200); expect(r.reason).toBe('max-months') })
  it('月收益率采用真实月复利', () => expect(calculateMonthlyRate(0.12)).toBeCloseTo(Math.pow(1.12, 1 / 12) - 1))
  it('十年预测有十个年度节点', () => expect(calculateTenYearForecast(config({ retirementTarget: 99999999 }))).toHaveLength(10))
  it('时长格式化稳定', () => { expect(formatDuration(0)).toBe('已达成'); expect(formatDuration(14)).toBe('1年2个月') })
})
