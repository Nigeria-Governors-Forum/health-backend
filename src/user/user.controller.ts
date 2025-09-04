import { Body, Controller, Get, Post, Param, UseGuards, Put, Delete, ParseIntPipe, BadRequestException, HttpStatus, UploadedFile, UseInterceptors, Sse } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';
import { LoginDto } from './login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';
import { Express } from 'express';
import { interval, map, Observable, take } from 'rxjs';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':email')
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Post('register')
  create(@Body() data: CreateUserDto) {
    return this.userService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: CreateUserDto) {
    return this.userService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.userService.validateUser(loginDto.email, loginDto.password);
    return this.userService.login(user);
  }


  @Post('data/:year')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('Admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDataForYear(
    @Param('year', ParseIntPipe) year: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      // Validate year
      if (year < 2000) {
        throw new BadRequestException(
          'Year must be 2000 or higher',
        );
      }

      if (!file) {
        throw new BadRequestException('Excel file is required');
      }

      if (!file.originalname.match(/\.(xlsx|xls)$/)) {
        throw new BadRequestException(
          'Only Excel files (.xlsx, .xls) are allowed',
        );
      }

      // Read Excel file directly from memory
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });

      // Call service and pass workbook directly
      const result = await this.userService.uploadFromWorkbook1(
        workbook,
      );

      return {
        statusCode: HttpStatus.OK,
        message: result.message,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Upload failed for year ${year}`,
        error: error.message,
      };
    }
  }


  @Sse('progress/details')
  progress(): Observable<any> {
    return this.userService.getProgressStream().pipe(
      map((event: any) => ({
        data: event,
      })),
    );
  }

}
