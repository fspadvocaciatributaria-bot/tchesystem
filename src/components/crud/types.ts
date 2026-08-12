export type FieldType =
  | 'text'
  | 'number'
  | 'currency'
  | 'percent'
  | 'textarea'
  | 'checkbox'
  | 'select';

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[]; // para type=select
  defaultValue?: unknown;
  help?: string;
  // largura em colunas do grid (1 ou 2); default 2 (linha inteira)
  span?: 1 | 2;
}

export interface ColumnConfig<T> {
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}
