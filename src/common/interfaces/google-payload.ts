import { Role } from '../enums/role.enum';

export default interface GooglePayload {
  email: string;
  googleId: string;
  name: string;
  userId: string | null;
  role: Role;
}
