import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import type { DiscordGuild, DiscordGuildChannel } from "@/types";

export const discordRouter = router({
  createDiscordGuild: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        discordId: z.string(),
        communityId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const guild = await ctx.prisma.discordGuild.create({
        data: {
          name: input.name,
          discordId: input.discordId,
          community: {
            connect: {
              id: input.communityId,
            },
          },
        },
      });
      return guild;
    }),

  getDiscordGuildTextChannels: protectedProcedure
    .input(
      z.object({
        accessToken: z.string().nullable().optional(),
        tokenType: z.string().nullable().optional(),
        guildId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      if (!input.accessToken || !input.tokenType) {
        console.log('No Access Token or Token Type');
        return [];
      } 
      if (!input.guildId) {
        console.log('No Guild ID');
        return [];
      } else {
        const response = await fetch(
          `https://discord.com/api/guilds/${input.guildId}/channels`,
          {
            headers: {
              authorization: `Bot ${process.env.DISCORD_CLIENT_TOKEN}`,
            },
          }
        );
        const channels = await response.json();

        if (channels ) {
          const textChannels = channels.filter(
            (channel: DiscordGuildChannel) => channel.type === 0
          );
          return textChannels;
        } else {
          console.log("No Channels Found");
        }
      }
    }),

  getDiscordOwnedGuilds: protectedProcedure
    .input(
      z.object({
        accessToken: z.string().nullable().optional(),
        tokenType: z.string().nullable().optional(),
      })
    )
    .query(async ({ input }) => {
      if (!input.accessToken || !input.tokenType) {
        return [];
      } else {
        const response = await fetch(
          "https://discord.com/api/users/@me/guilds",
          {
            headers: {
              authorization: `${input.tokenType} ${input.accessToken}`,
            },
          }
        );

        const guilds = await response.json();

        if (guilds) {
          const ownedGuilds = guilds.filter(
            (guild: DiscordGuild) => guild.owner
          );
          return ownedGuilds;
        }
        console.log("No Guilds Found");
      }
    }),

  getDiscordBySlug: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const community = await ctx.prisma.community.findUnique({
        where: {
          slug: input.slug,
        },
        include: {
          discordGuild: true,
        },
      });
      return community;
    }),

  updateDiscordWelcomeChannelId: protectedProcedure
    .input(
      z.object({
        discordId: z.string(),
        welcomeChannelId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const guild = await ctx.prisma.discordGuild.update({
        where: {
          discordId: input.discordId,
        },
        data: {
          welcomeChannelId: input.welcomeChannelId,
        },
      });
      return guild;
    }),
});
