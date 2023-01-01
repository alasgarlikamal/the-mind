import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class RoomDto {

    @IsUUID(4)
    @IsNotEmpty()
    roomId: string;
}