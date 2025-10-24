import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';
import { AuditLogService } from 'src/router/audit-log/audit-log.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  // 2. Crear una instancia del Logger para un registro de errores claro
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly auditService: AuditLogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 👇 Si la ruta es pública, simplemente sigue sin auditar
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Viene del Guard (AccessToken)

    // 3. Salir temprano si no hay un usuario autenticado
    if (!user) {
      return next.handle();
    }

    const { method, originalUrl, body, ip } = request;
    const timestamp = new Date();

    return next.handle().pipe(
      tap(async (responseData) => {
        // 4. Envolver la lógica de auditoría en un bloque try...catch
        try {
          const auditData = {
            userId: user?._id, // Usar _id si ese es tu identificador principal
            userEmail: user?.email,
            // Convertir el array de roles a un string para un log más legible
            role: user?.roles?.map((r) => r.name).join(', '),
            method,
            endpoint: originalUrl,
            ipAddress: ip,
            timestamp,
            body: JSON.stringify(sanitizeBody(body)),
            // 5. Convertir la respuesta a JSON y considerar truncarla para evitar logs masivos
            response: JSON.stringify(responseData)?.substring(0, 1000),
          };

          await this.auditService.create(auditData);
        } catch (error) {
          // 6. Si el guardado del log falla, registrar el error sin afectar la petición del usuario
          this.logger.error('Failed to save audit log', error.stack);
        }
      }),
    );
  }
}

// Esta función auxiliar está perfecta como está.
function sanitizeBody(body: any): any {
  if (!body) {
    return null;
  }
  const sanitized = { ...body };
  const sensitiveKeys = [
    'password',
    'confirmPassword',
    'accessToken',
    'refreshToken',
  ];

  for (const key of sensitiveKeys) {
    if (sanitized[key]) {
      sanitized[key] = '[REDACTED]';
    }
  }
  return sanitized;
}
