import { IsBoolean, IsDateString, IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    firstname: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    lastname: string;

    @IsEmail()
    @IsNotEmpty()
    @MaxLength(64)
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1024)
    password: string;

    @IsDateString()
    @IsNotEmpty()
    date_of_birth: Date;

    @IsBoolean()
    @IsNotEmpty()
    gender: Boolean;
}
