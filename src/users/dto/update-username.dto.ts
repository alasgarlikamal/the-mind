import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateUsernameDto {
    
    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    username!: string;
}