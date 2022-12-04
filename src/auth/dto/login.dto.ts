import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto {
    @ApiProperty({example: "john@gmail.com", description: "User email address"})
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({example: "12345678910", description: "User password"})
    @IsNotEmpty()
    password: string;
}