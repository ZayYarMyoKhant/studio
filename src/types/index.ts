
export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  createdAt: number;
}

export interface Attendance {
  id: string;
  studentId: string;
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
  weekStartDate: string;
  present: boolean;
}

export const DAYS = [
  { key: 'mon', label: 'တနင်္လာ' },
  { key: 'tue', label: 'အင်္ဂါ' },
  { key: 'wed', label: 'ဗုဒ္ဓဟူး' },
  { key: 'thu', label: 'ကြာသပတေး' },
  { key: 'fri', label: 'သောကြာ' }
] as const;
