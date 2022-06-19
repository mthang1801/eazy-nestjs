export interface ITracker {
  tableName?: string;
  method?: string;
  oldData?: object;
  condition?: number | string;
}
