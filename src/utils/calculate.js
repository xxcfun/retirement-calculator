const MAX_MONTHS = 1200
const MONEY_FIELDS = ['retirementTarget', 'currentAssets', 'totalDebt', 'monthlySalary', 'annualBonus', 'sideIncome', 'monthlyExpense', 'annualExpense', 'monthlyDebtPayment']

function money(value) { return Math.round(value) }
function unreachable(reason, extra = {}) { return { success: false, reachable: false, reason, totalMonths: MAX_MONTHS, debtMonths: 0, wealthMonths: 0, retirementDate: '', currentNetAsset: 0, finalAssets: 0, finalDebt: 0, finalNetAsset: 0, finalTarget: 0, totalPrincipal: 0, totalContributedCapital: 0, totalInvestmentIncome: 0, timeline: [], ...extra } }

export function validateConfig(config) {
  const errors = {}
  for (const field of MONEY_FIELDS) if (!Number.isFinite(config[field]) || config[field] < 0) errors[field] = '请输入不小于 0 的有效金额'
  for (const [field, min, max] of [['annualReturnRate', -0.2, 0.3], ['inflationRate', -0.2, 0.3], ['salaryGrowthRate', -0.2, 0.3]]) {
    if (!Number.isFinite(config[field]) || config[field] < min || config[field] > max) errors[field] = `请输入 ${min * 100}% 到 ${max * 100}%`
  }
  return { valid: Object.keys(errors).length === 0, errors }
}

export function calculateMonthlyRate(annualRate = 0) { return Math.pow(1 + annualRate, 1 / 12) - 1 }
export function calculateInflationRate(annualRate = 0) { return calculateMonthlyRate(annualRate) }
export function calculateNetAsset(assets = 0, debt = 0) { return money(assets - debt) }
export function calculateMonthlyCashFlow(config) { return money(config.monthlySalary + config.sideIncome - config.monthlyExpense) }
export function calculateInflationTarget(target, monthlyRate) { return money(target * (1 + monthlyRate)) }
export function calculateProgress(netAsset, target) { return target <= 0 ? 100 : Math.max(0, Math.min(100, Number(((netAsset / target) * 100).toFixed(2)))) }
export function formatDuration(months) {
  if (!Number.isFinite(months) || months < 0) return '暂时无法达到'
  if (months === 0) return '已达成'
  const years = Math.floor(months / 12); const rest = months % 12
  return [years ? `${years}年` : '', rest ? `${rest}个月` : ''].filter(Boolean).join('')
}
export function calculateRetirementDate(months, from = new Date()) {
  if (!Number.isFinite(months) || months < 0) return ''
  const year = from.getFullYear(); const monthIndex = from.getMonth() + months
  return `${year + Math.floor(monthIndex / 12)}-${String((monthIndex % 12) + 1).padStart(2, '0')}`
}

export function calculateDebtClearTime(config) {
  const check = validateConfig(config); if (!check.valid) return unreachable('invalid-config', { errors: check.errors })
  if (config.totalDebt <= 0) return { success: true, reachable: true, months: 0, remainingDebt: 0 }
  if (config.monthlyDebtPayment <= 0) return { success: false, reachable: false, months: MAX_MONTHS, remainingDebt: config.totalDebt, reason: 'no-payment-plan' }
  let debt = money(config.totalDebt); let salary = money(config.monthlySalary)
  for (let month = 1; month <= MAX_MONTHS; month++) {
    let available = Math.max(0, salary + config.sideIncome - config.monthlyExpense)
    if (month % 12 === 0) available = Math.max(0, available + config.annualBonus - config.annualExpense)
    const payment = Math.min(config.monthlyDebtPayment, debt, available); debt = money(debt - payment)
    if (debt <= 0) return { success: true, reachable: true, months: month, remainingDebt: 0 }
    if (month % 12 === 0) salary = money(salary * (1 + config.salaryGrowthRate))
  }
  return { success: false, reachable: false, months: MAX_MONTHS, remainingDebt: debt, reason: 'debt-not-cleared' }
}

export function calculateStaticRetirement(config, from = new Date()) {
  const check = validateConfig(config); if (!check.valid) return unreachable('invalid-config', { errors: check.errors })
  const initialNet = calculateNetAsset(config.currentAssets, config.totalDebt)
  if (initialNet >= config.retirementTarget) return completedResult(config, initialNet, from)
  const base = config.monthlySalary + config.sideIncome - config.monthlyExpense + (config.annualBonus - config.annualExpense) / 12
  let debtMonths = 0; let debt = config.totalDebt
  if (debt > 0) {
    const available = Math.max(0, base)
    const payment = Math.min(config.monthlyDebtPayment, available)
    if (payment <= 0) return unreachable('debt-not-cleared', { currentNetAsset: initialNet, finalAssets: config.currentAssets, finalDebt: debt, finalNetAsset: initialNet, finalTarget: config.retirementTarget })
    debtMonths = Math.ceil(debt / payment)
    if (debtMonths > MAX_MONTHS) return unreachable('max-months', { debtMonths: MAX_MONTHS, currentNetAsset: initialNet })
    debt = 0
  }
  if (base <= 0) return unreachable('non-positive-cash-flow', { debtMonths, currentNetAsset: initialNet, finalAssets: config.currentAssets, finalTarget: config.retirementTarget })
  const wealthMonths = Math.max(0, Math.ceil((config.retirementTarget - initialNet) / base))
  const totalMonths = debtMonths + wealthMonths
  if (totalMonths > MAX_MONTHS) return unreachable('max-months', { debtMonths, wealthMonths: MAX_MONTHS - debtMonths, currentNetAsset: initialNet, finalTarget: config.retirementTarget })
  return { success: true, reachable: true, totalMonths, debtMonths, wealthMonths, retirementDate: calculateRetirementDate(totalMonths, from), currentNetAsset: initialNet, finalAssets: money(config.currentAssets + totalMonths * base), finalDebt: debt, finalNetAsset: money(initialNet + totalMonths * base), finalTarget: config.retirementTarget, totalPrincipal: money(totalMonths * base), totalContributedCapital: money(config.currentAssets + totalMonths * base), totalInvestmentIncome: 0, timeline: [] }
}

function completedResult(config, initialNet, from) { return { success: true, reachable: true, totalMonths: 0, debtMonths: 0, wealthMonths: 0, retirementDate: calculateRetirementDate(0, from), currentNetAsset: initialNet, finalAssets: config.currentAssets, finalDebt: config.totalDebt, finalNetAsset: initialNet, finalTarget: config.retirementTarget, totalPrincipal: 0, totalContributedCapital: config.currentAssets, totalInvestmentIncome: 0, timeline: [] } }

export function calculateDynamicRetirement(config, from = new Date()) {
  const check = validateConfig(config); if (!check.valid) return unreachable('invalid-config', { errors: check.errors })
  let assets = money(config.currentAssets); let debt = money(config.totalDebt); let target = money(config.retirementTarget); let salary = money(config.monthlySalary)
  const initialNet = calculateNetAsset(assets, debt); if (initialNet >= target) return completedResult(config, initialNet, from)
  const monthlyRate = calculateMonthlyRate(config.annualReturnRate); const inflationRate = config.inflationEnabled ? calculateInflationRate(config.inflationRate) : 0
  let debtMonths = 0; let totalPrincipal = 0; let totalInvestmentIncome = 0; const timeline = []
  for (let month = 1; month <= MAX_MONTHS; month++) {
    const annualEvent = month % 12 === 0 ? config.annualBonus - config.annualExpense : 0
    const operatingFlow = money(salary + config.sideIncome - config.monthlyExpense + annualEvent)
    assets = money(assets + operatingFlow); totalPrincipal = money(totalPrincipal + operatingFlow)
    let payment = 0
    if (debt > 0) {
      debtMonths = month
      const availableFunds = Math.max(0, Math.min(assets, operatingFlow))
      payment = money(Math.min(config.monthlyDebtPayment, debt, availableFunds))
      assets = money(assets - payment); debt = money(debt - payment)
    }
    const preInterestNetAsset = calculateNetAsset(assets, debt)
    const investmentIncome = money(Math.max(preInterestNetAsset, 0) * monthlyRate)
    assets = money(assets + investmentIncome); totalInvestmentIncome = money(totalInvestmentIncome + investmentIncome)
    if (inflationRate) target = calculateInflationTarget(target, inflationRate)
    const netAsset = calculateNetAsset(assets, debt)
    timeline.push({ month, assets, debt, netAsset, target, salary, operatingFlow, payment, investmentIncome, totalPrincipal, totalInvestmentIncome })
    if (netAsset >= target) return { success: true, reachable: true, totalMonths: month, debtMonths, wealthMonths: Math.max(0, month - debtMonths), retirementDate: calculateRetirementDate(month, from), currentNetAsset: initialNet, finalAssets: assets, finalDebt: debt, finalNetAsset: netAsset, finalTarget: target, totalPrincipal, totalContributedCapital: money(config.currentAssets + totalPrincipal), totalInvestmentIncome, timeline }
    if (month % 12 === 0) salary = money(salary * (1 + config.salaryGrowthRate))
  }
  const last = timeline.at(-1)
  return unreachable(debt > 0 ? 'debt-not-cleared' : 'max-months', { debtMonths, wealthMonths: Math.max(0, MAX_MONTHS - debtMonths), currentNetAsset: initialNet, finalAssets: last.assets, finalDebt: last.debt, finalNetAsset: last.netAsset, finalTarget: last.target, totalPrincipal, totalContributedCapital: money(config.currentAssets + totalPrincipal), totalInvestmentIncome, timeline })
}

export function calculateFutureAssets(config) { return calculateDynamicRetirement(config).timeline }
export function calculateTenYearForecast(config) {
  const timeline = calculateDynamicRetirement({ ...config, retirementTarget: Number.MAX_SAFE_INTEGER }).timeline
  return Array.from({ length: 10 }, (_, i) => timeline[Math.min((i + 1) * 12 - 1, timeline.length - 1)]).filter(Boolean).map((item, index) => ({ year: index + 1, ...item }))
}
export function calculateScenarios(config, baseResult = calculateDynamicRetirement(config)) {
  const cases = [
    { key: 'save1000', label: '每月多存 ¥1,000', config: { ...config, monthlyExpense: Math.max(0, config.monthlyExpense - 1000) } },
    { key: 'return1', label: '投资收益提高 1%', config: { ...config, annualReturnRate: Math.min(0.3, config.annualReturnRate + 0.01) } },
    { key: 'expense10', label: '消费减少 10%', config: { ...config, monthlyExpense: money(config.monthlyExpense * 0.9) } },
  ]
  return cases.map(item => { const result = calculateDynamicRetirement(item.config); return { ...item, result, monthsEarlier: baseResult.reachable && result.reachable ? Math.max(0, baseResult.totalMonths - result.totalMonths) : 0 } })
}

export function hasInvalidResult(value) {
  if (typeof value === 'number') return !Number.isFinite(value)
  if (Array.isArray(value)) return value.some(hasInvalidResult)
  if (value && typeof value === 'object') return Object.values(value).some(hasInvalidResult)
  return value === undefined
}
