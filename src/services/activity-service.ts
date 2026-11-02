import { prisma } from "../config/prisma";

type CreateActivityParams = {
  userId?: string;
  action: string;
  title: string;
  description?: string;
  entityId?: string;
  entityType?: string;
};

export const createActivity = async ({
  userId,
  action,
  title,
  description,
  entityId,
  entityType,
}: CreateActivityParams) => {
  try {
    let validUserId: string | null = null;
    if (userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (userExists) {
        validUserId = userId;
      }
    }

    const activity = await prisma.activityLog.create({
      data: {
        userId: validUserId,
        action,
        title,
        description: description || null,
        entityId: entityId || null,
        entityType: entityType || null,
      },
    });

    return activity;
  } catch (error) {
    console.error("CREATE ACTIVITY ERROR:", error);
    return null;
  }
};
