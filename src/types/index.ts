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

export const CATEGORIES = [
  { name: 'Shopping', color: '#4560A1' },
  { name: 'Travel', color: '#298BA3' },
  { name: 'Work', color: '#3B5998' },
  { name: 'Personal', color: '#556B2F' },
  { name: 'Home', color: '#708090' },
];