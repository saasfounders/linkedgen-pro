export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: Date;
}

export interface ICPProfile {
  id: string;
  user_id: string;
  name: string;
  industries: string[];
  geography: string[];
  created_at: Date;
}

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  company: string;
  industry: string;
  score: number;
  created_at: Date;
}

export interface Message {
  id: string;
  lead_id: string;
  user_id: string;
  content: string;
  message_type: string;
  sent_at: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}
