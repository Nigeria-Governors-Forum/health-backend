import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // 👇 Log entire request basics
    // console.log('--- Incoming Request ---');
    // console.log('Headers:', request.headers);
    // console.log('User (from JwtAuthGuard):', request.user);
    // console.log('Body:', request.body);
    // console.log('Params:', request.params);
    // console.log('Query:', request.query);
    // console.log('------------------------');

    const user = request.user;

    if (!user || !user.role) {
      console.warn('⚠️ No user or role found on request');
      return false;
    }

    // console.log('Required roles:', roles);
    // console.log('User role:', user.role);

    return roles.includes(user.role);
  }
}
