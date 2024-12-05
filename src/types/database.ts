export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          password: string;
          role: 'admin' | 'nurse';
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          password: string;
          role: 'admin' | 'nurse';
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password?: string;
          role?: 'admin' | 'nurse';
          created_at?: string;
        };
      };
      nurses: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      schedules: {
        Row: {
          key: string;
          schedule: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          schedule: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          schedule?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}