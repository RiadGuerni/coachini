import { Role } from '../enums/role.enum';

export default interface DiscordPayload {
  email: string;
  discordId: string;
  name: string;
  userId: string | null;
  role: Role;
}
