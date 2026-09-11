export interface MockUser {
  id: string;
  username: string;
  displayName: string;
  initials: string;
  accent: string;
  city: string;
  status?: 'pending' | 'joined' | 'declined';
}

export const MOCK_USERS: MockUser[] = [
  { id: 'user-alex', username: '@alex.morgan', displayName: 'Alex Morgan', initials: 'AM', accent: '#2563eb', city: 'Kuala Lumpur' },
  { id: 'user-sarah', username: '@sarah.lee', displayName: 'Sarah Lee', initials: 'SL', accent: '#e11d48', city: 'Singapore' },
  { id: 'user-john', username: '@john.travels', displayName: 'John Tan', initials: 'JT', accent: '#0f766e', city: 'Penang' },
  { id: 'user-mei', username: '@mei.chen', displayName: 'Mei Chen', initials: 'MC', accent: '#b45309', city: 'Johor Bahru' },
  { id: 'user-jason', username: '@jason.explores', displayName: 'Jason Lim', initials: 'JL', accent: '#7c3aed', city: 'Kuala Lumpur' },
  { id: 'user-nadia', username: '@nadia.nomad', displayName: 'Nadia Hassan', initials: 'NH', accent: '#0891b2', city: 'Ipoh' },
];
