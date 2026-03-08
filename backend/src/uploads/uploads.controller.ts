import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';

@UseGuards(AuthGuard('jwt'))
@Controller('uploads')
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async upload(@UploadedFile() file: any) {
        return this.uploadsService.saveFile(file);
    }
}
