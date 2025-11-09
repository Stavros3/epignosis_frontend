import { VacationStatusEnum } from '../enums/vacation-status.enum';

export interface Vacation {
  id: number;
  user_id: number;
  date_from: string;
  date_to: string;
  reason: string;
  status_id: VacationStatusEnum;
  status_name: string;
  created_at: string;
  updated_at: string;
}
