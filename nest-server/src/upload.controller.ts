import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Param,
  Res,
} from "@nestjs/common";
import { UploadService } from "./upload.service";
import { FileInterceptor } from "@nestjs/platform-express";
@Controller()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  uploadFile(@UploadedFile() file: Express.Multer.File, @Body() data) {
    return this.uploadService.upload(file, data);
  }

  @Post("merge")
  merge(@Body() fileName, @Res() res) {
    console.log(fileName);
    return this.uploadService.merge(fileName);
  }
}
