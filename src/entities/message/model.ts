export interface Message {
  id: string;
  text: string;
  direction: 'incoming' | 'outgoing';
  createdAt: number;
  status?: 'sending' | 'sent' | 'error';
}
