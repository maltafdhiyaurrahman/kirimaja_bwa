import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';
import { ProfileResponse } from './response/profile.response';
import { BaseResponse } from 'src/common/interface/base-interface.response';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async findOne(@Req() req: Request & {user?: any}): Promise<BaseResponse<ProfileResponse>> {
    return {
      message: 'Profile fetched successfully',
      data: await this.profileService.findOne(req.user.id),
    }
  }

  @Patch()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './public/uploads/photos',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        }
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        } cb(null, true); 
      }
    })
  )
  async update(
    @Req() req: Request & {user?: any}, 
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() avatar: Express.Multer.File | undefined
  ): Promise<BaseResponse<ProfileResponse>> {
    return {
      message: 'Profile updated successfully',
      data: await this.profileService.update(
        req.user.id,
        updateProfileDto,
        avatar ? avatar.filename : null,
      ) 
    }
  }
}
