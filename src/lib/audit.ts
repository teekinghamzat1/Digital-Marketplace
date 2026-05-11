import { prisma } from "@/lib/prisma";

interface AuditLogParams {
  adminId?: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
}

export async function logAction({
  adminId,
  userId,
  action,
  entity,
  entityId,
  details,
  ipAddress
}: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        userId,
        action,
        entity,
        entityId,
        details: details || {},
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to save audit log:", error);
  }
}
