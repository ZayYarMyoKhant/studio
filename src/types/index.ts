export interface ListItem {
  id: string;
  name: string;
  quantity: string;
  description: string;
  completed: boolean;
  createdAt: number;
}

export interface List {
  id: string;
  title: string;
  category: string;
  color: string;
  items: ListItem[];
  createdAt: number;
}

export interface Debt {
  id: string;
  personName: string;
  amount: number;
  type: 'owe' | 'lent'; // 'owe' = we owe them, 'lent' = they owe us
  note: string;
  date: number;
  completed: boolean;
}

export const CATEGORIES = [
  { name: 'Shopping', color: '#4560A1' },
  { name: 'Travel', color: '#298BA3' },
  { name: 'Work', color: '#3B5998' },
  { name: 'Personal', color: '#556B2F' },
  { name: 'Home', color: '#708090' },
];
