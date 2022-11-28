import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateConfirmMailDto {
    @IsNotEmpty({ message: 'token is missing' })
    @Type(() => String)
    @IsUUID(4, { message: 'token must be string' })
    token: string;

    @IsNotEmpty({ message: 'fistName is missing' })
    @Type(() => String)
    @IsString({ message: 'firstName must be a string' })
    firstName: string;

    @IsNotEmpty({ message: 'email is missing' })
    @Type(() => String)
    @IsEmail({}, { message: 'email must be a string' })
    email: string;
}