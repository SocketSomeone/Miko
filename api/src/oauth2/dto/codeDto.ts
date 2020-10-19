import { IsNotEmpty, IsNumberString, IsUrl } from 'class-validator';

export class codeDto {
  @IsNotEmpty()
  code: string;

  @IsNumberString()
  clientId: string;

  @IsNotEmpty()
  redirectUri: string;
}
