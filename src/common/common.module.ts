import { Module, Global } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthorizationGuard } from './guards/jwt-authorization.guard';

@Global()
@Module({
  providers: [
    JwtAuthGuard,
    RolesGuard,
    AuthorizationGuard
  ],
  exports: [
    JwtAuthGuard,
    RolesGuard,
    AuthorizationGuard
  ],
})
export class CommonModule {}