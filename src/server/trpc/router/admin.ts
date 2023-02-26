import { router, adminProcedure } from "../trpc";
import { z } from "zod";
import { env } from "../../../env/server.mjs";

import XML2JS from "xml2js";

const MembershipAPISchema = z.object({
  MembershipAPI: z.object({
    Member: z.array(
      z.object({
        EmailAddress: z.array(z.string()).length(1),
        FirstName: z.array(z.string()).length(1),
        LastName: z.array(z.string()).length(1),
        UniqueID: z.array(z.string()).length(1),
      })
    ),
  }),
});

export const adminRouter = router({
  memberCount: adminProcedure.query(async ({ ctx }) => {
    const count = await ctx.prisma.user.count({
      where: {
        groups: {
          some: {
            name: "Member",
          },
        },
      },
    });

    return count;
  }),

  updateMembership: adminProcedure.mutation(async ({ ctx, input }) => {
    // Fetch from the SU API the current user's (we get their name, email and ID)
    const res = await fetch(
      `https://www.warwicksu.com/membershipapi/listmembers/${env.WARWICK_SU_API_KEY}`
    );

    // If the response is not 200, throw an error
    if (res.status !== 200) {
      throw new Error("Error fetching from SU API");
    }

    const text = await res.text();

    // Get the XML from the response
    const data = await XML2JS.parseStringPromise(text);

    // Validate the XML
    const validatedData = MembershipAPISchema.parse(data);

    // Get the members from the XML, and unpack single element arrays
    const members = validatedData.MembershipAPI.Member.map((member) => ({
      email: member.EmailAddress[0]!,
      firstName: member.FirstName[0],
      lastName: member.LastName[0],
      id: member.UniqueID[0]!,
    }));

    // For each user, add the UniID to the user if they are in the DB
    for (const member of members) {
      // Check the user exists
      const user = await ctx.prisma.user.findUnique({
        where: {
          email: member.email,
        },
      });

      if (!user) continue;

      await ctx.prisma.user.update({
        where: {
          email: member.email,
        },
        data: {
          UniID: member.id,
          name: `${member.firstName} ${member.lastName}`,
        },
      });

      //   Also add the user to the Member group
      const group = await ctx.prisma.group.findUniqueOrThrow({
        where: {
          name: "Member",
        },
      });

      await ctx.prisma.group.update({
        where: {
          id: group.id,
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
  }),
  updateVotingEligibility: adminProcedure
    .input(z.object({ tableCopy: z.string(), fromDate: z.date() }))
    .mutation(async ({ ctx, input }) => {
      const { tableCopy, fromDate } = input;

      // Get the Eligible to Vote group
      const eligibleToVoteGroup = await ctx.prisma.group.findUniqueOrThrow({
        where: {
          name: "Eligible to Vote",
        },
      });

      // Clear the Eligible to Vote group
      await ctx.prisma.group.update({
        where: {
          id: eligibleToVoteGroup.id,
        },
        data: {
          users: {
            set: [],
          },
        },
      });

      // tableCopy is a string where each line is a member, with attributes name, id, member from, and member to (all separated by tabs)
      // We split the string into lines, and then split each line into attributes
      const lines = tableCopy.split("\n").map((line) => line.split("\t"));

      //   Set from date back 2 weeks
      fromDate.setDate(fromDate.getDate() - 14);

      // For each line, update the user's voting eligibility
      for (const line of lines) {
        // Make sure the line has 4 elements
        if (line.length !== 4) continue;

        // Get the user using the UniID
        const user = await ctx.prisma.user.findUnique({
          where: {
            UniID: line[1],
          },
        });

        // If the user doesn't exist, skip
        if (!user) continue;

        const dateStringSplit = line[2]!.split(" ");
        const dateSplit = dateStringSplit[0]!.split("/");
        const timeSplit = dateStringSplit[1]!.split(":");
        const userJoinedDate = new Date(
          parseInt(dateSplit[2]!, 10),
          parseInt(dateSplit[1]!, 10) - 1,
          parseInt(dateSplit[0]!, 10),
          parseInt(timeSplit[0]!, 10),
          parseInt(timeSplit[1]!, 10)
        );

        // If the user is a member, their member from date is 2 weeks before the fromDate then they are eligible to vote
        const eligibleToVote = userJoinedDate < fromDate;

        console.log("User", user.email, "is eligible to vote:", eligibleToVote);

        // If the user is eligible to vote, add them to the Eligible to Vote group
        if (eligibleToVote) {
          await ctx.prisma.group.update({
            where: {
              id: eligibleToVoteGroup.id,
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
    }),
  addRONUser: adminProcedure.mutation(async ({ ctx }) => {
    // Check the user doesn't already exist
    const user = await ctx.prisma.user.findUnique({
      where: {
        email: "RON@RON",
      },
    });

    if (user) {
      throw new Error("User already exists");
    }

    // Create the user
    await ctx.prisma.user.create({
      data: {
        email: "RON@RON",
        name: "RON (Re-open Nominations)",
        groups: {
          connect: {
            name: "Member",
          },
        },
      },
    });
  }),
});
