# 本地存储与数据安全

## 数据位置

- `RETIREMENT_CONFIG`：版本化退休参数与已经同步台账影响的当前资产，LocalStorage。
- `RETIREMENT_SETTINGS`：隐私模式、欢迎状态等，LocalStorage。
- IndexedDB `retirement-calculator/records`：台账主存储。
- `RETIREMENT_RECORDS`：IndexedDB 不可用时的降级台账，LocalStorage。

页面和组件不直接访问 LocalStorage，统一通过 `src/utils/storage.js`；IndexedDB 通过 `src/utils/indexedDb.js`。配置校验通过后防抖保存，写入错误在界面显示。

## 台账一致性

- 新增：根据类型对当前资产应用一次影响。
- 编辑：撤销旧影响，再应用新影响。
- 删除：只撤销该记录的影响。
- 启动：直接读取持久化资产，不遍历台账重算。
- 导入：以备份中的资产为准，不叠加记录。

浏览器没有跨 LocalStorage 与 IndexedDB 的原生事务。实现采用等效原子流程：先持久化台账，再持久化资产；资产写入失败时立即把台账恢复到操作前快照，Store 只在两边成功后提交。完整导入先在内存校验，保存旧快照，再替换所有本地数据；任何失败均尝试恢复旧快照并保持 Store 一致。

## 迁移与恢复

所有数据带版本号。旧版本通过 `migration.js` 补全字段；高于当前应用的数据版本会拒绝导入。备份必须包含合法配置、设置和台账结构。解析、字段验证和迁移全部在覆盖前完成。

本地数据可能因清理浏览器站点数据、隐私浏览结束或设备损坏而消失。建议定期导出完整 JSON 备份，并将备份保存在浏览器之外。
