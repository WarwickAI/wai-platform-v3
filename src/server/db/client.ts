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

  const edward = await prisma.user.findFirst({
    where: {
      email: "edward.upton@warwick.ac.uk",
    },
  });

  if (!edward) {
    console.log("Could not find user edward");
  } else {
    await prisma.group.update({
      where: {
        id: adminGroup.id,
      },
      data: {
        users: {
          connect: {
            id: edward.id,
          },
        },
      },
    });
    await prisma.group.update({
      where: {
        id: execGroup.id,
      },
      data: {
        users: {
          connect: {
            id: edward.id,
          },
        },
      },
    });
  }
};

setUpGroups();
