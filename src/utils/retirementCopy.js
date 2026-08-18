const common = {
  achieved: ['目标已达成，接下来是选择题。','自由不是终点，是生活的起点。','今天起，工作可以只看喜欢。','退休计划已通关。','财富自由进度：完成。','你已经把未来攒在手里。','不上班，也是一种可执行方案。','恭喜进入人生自选模式。','目标完成，时间属于自己。','你比退休计算器更快。'],
  within5Years: ['自由已进入倒计时。','再坚持一下，周一快要失去你了。','退休冲刺圈已经看得见。','工位即将成为回忆。','你的计划正在加速兑现。','五年内，生活会换一种打开方式。','离自由只差最后一段复利。','未来正在向你招手。','这不是远方，是近期计划。','再稳稳走几步，就到了。'],
  within10Years: ['争取十年内，没有职业。','老板拥有你的时间不多了。','十年计划，正在按月兑现。','自由不是梦，是表格里的日期。','复利正在替你打卡。','坚持这套节奏，自由可期。','你已进入十年退休候选区。','每次结余都在购买未来时间。','退休目标已经有了清晰坐标。','下一站：时间自由。'],
  within15Years: ['长期主义正在缩短工位寿命。','稳定前进，也是一种速度。','每个月都离自由近一点。','今天的克制，是未来的选择权。','计划清晰，时间会给答案。','这条路不短，但方向正确。','持续积累，未来自有回响。','复利需要时间，也奖励耐心。','你的自由正在慢慢成形。','稳住节奏，目标会来。'],
  within20Years: ['把大目标拆成每个月的小胜利。','自由很远，但你已经出发。','计划的意义，是让远方有日期。','长期积累，最终会穿越周期。','不必冲刺，持续前进就好。','每一笔结余都算数。','耐心是复利最好的朋友。','今天规划，明天少一点焦虑。','时间很长，方向更重要。','这是一场值得坚持的长跑。'],
  within30Years: ['先让计划跑起来，再让数字变漂亮。','退休很远，调整空间也很大。','长期目标，值得定期校准。','小改变经过时间也会很大。','别急，先守住每月正现金流。','未来可以慢慢被重新安排。','路线很长，参数随时可优化。','每一次复盘都能缩短一点距离。','今天开始，已经比昨天更近。','把焦虑变成可调整的数字。'],
  over30Years: ['计算器很诚实，但参数可以改变。','工位耐力赛，也能中途换路线。','别灰心，先试试少花一点。','结果不是判决，只是当前快照。','长期计划最适合持续微调。','收入、消费和收益都还有空间。','让今天成为优化计划的第一天。','数字很长，改变可以很小。','先改善现金流，再交给时间。','你的未来不止这一组参数。'],
  unreachable: ['当前计划需要一次认真调参。','也许你能比计算器先退休。','先别关页面，试试减少消费。','结果不可达，不代表人生不可达。','提高结余，是最直接的突破口。','计划遇到红灯，换条路线继续。','计算器说不行，是请你调整参数。','从一笔正现金流开始。','先解决负债，再谈自由加速。','这是一份诊断，不是一份判决。'],
}
let last = ''
export function getCopyPool(result) { if (!result.reachable) return common.unreachable; const m = result.totalMonths; if (m === 0) return common.achieved; if (m <= 60) return common.within5Years; if (m <= 120) return common.within10Years; if (m <= 180) return common.within15Years; if (m <= 240) return common.within20Years; if (m <= 360) return common.within30Years; return common.over30Years }
export function getRetirementShareCopy(result) { const pool = getCopyPool(result); const choices = pool.filter(x => x !== last); last = choices[Math.floor(Math.random() * choices.length)] || pool[0]; return last }
export function refreshRetirementCopy(result) { return getRetirementShareCopy(result) }
export function getBadge(result) { if (!result.reachable) return '退休计划待优化'; if (result.totalMonths === 0) return '财富自由选手'; if (result.totalMonths <= 60) return '退休冲刺选手'; if (result.totalMonths <= 120) return '十年内退休选手'; if (result.totalMonths <= 360) return '长期主义选手'; return '工位耐力选手' }
export const QR_CTA_COPY_POOL = ['你什么时候能退休？扫码算算','我算完了，轮到你了。','扫一扫，看看我们俩谁先退休。','测测你的「工位剩余寿命」','看看你的老板还能拥有你多少年']
