import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('enrollment/:enrollmentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  generateCertificate(@Param('enrollmentId') enrollmentId: string) {
    return this.certificatesService.generateCertificate(enrollmentId);
  }

  @Get('my-certificates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  findMyCertificates(@GetUser() user: User) {
    return this.certificatesService.findByStudent(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.certificatesService.findOne(id);
  }

  @Get('number/:certificateNumber')
  findByCertificateNumber(@Param('certificateNumber') certificateNumber: string) {
    return this.certificatesService.findByCertificateNumber(certificateNumber);
  }

  @Get('verify/:certificateNumber')
  verifyCertificate(@Param('certificateNumber') certificateNumber: string) {
    return this.certificatesService.verifyCertificate(certificateNumber);
  }
}
