import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateConfirmMailDto {
    @ApiProperty({example: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p", description: "Random UUID"})
    @IsNotEmpty({ message: 'token is missing' })
    @Type(() => String)
    @IsUUID(4, { message: 'token must be string' })
    token: string;

    @ApiProperty({example: "John", description: "User name"})
    @IsNotEmpty({ message: 'fistName is missing' })
    @Type(() => String)
    @IsString({ message: 'firstName must be a string' })
    firstName: string;

    @ApiProperty({example: "john@gmail.com", description: "User email address"})
    @IsNotEmpty({ message: 'email is missing' })
    @Type(() => String)
    @IsEmail({}, { message: 'email must be a string' })
    email: string;
}