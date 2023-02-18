// src/server/db/client.ts
import { PrismaClient } from "@prisma/client";
import { env } from "../../env/server.mjs";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// make sure admin and exec roles are added to the database
// on startup, adding user edward.upton@warwick.ac.uk to both
const setUpGroups = async () => {
  console.log("Adding admin and exec roles to database");

  let adminGroup = await prisma.group.findFirst({
    where: {
      name: "Admin",
    },
  });

  if (!adminGroup) {
    adminGroup = await prisma.group.create({
      data: {
        name: "Admin",
      },
    });
  }

  let execGroup = await prisma.group.findFirst({
    where: {
      name: "Exec",
    },
  });

  if (!execGroup) {
    execGroup = await prisma.group.create({
      data: {
        name: "Exec",
      },
    });
  }

  let allGroup = await prisma.group.findFirst({
    where: {
      name: "All",
    },
  });

  if (!allGroup) {
    allGroup = await prisma.group.create({
      data: {
        name: "All",
      },
    });
  }

  // Loop through all Admin User Emails
  const adminUserEmails = env.ADMIN_USERS_EMAILS.split(",");

  console.log("Adding admin users to admin group")
  console.log(adminUserEmails)

  for (const email of adminUserEmails) {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      console.log(`Could not find user ${email}`);
    } else {
      await prisma.group.update({
        where: {
          id: adminGroup.id,
        },
        data: {
          users: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    }
  }
};

setUpGroups();
