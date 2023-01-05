
import { Client, Events, PartialGuildMember, PartialUser, Message } from 'discord.js';
import * as intents from './intents'
import * as eventTasks from './eventTasks'
import { User, GuildMember, Guild } from 'discord.js';
import { OnuKafka } from '@onu/kafka';
import { discordBotKafkaOptions } from '@onu/config';
import * as dotenv from 'dotenv';
dotenv.config();

async function start() {
  const c = new Client({ intents: intents.gatewayIntents });

  var k = OnuKafka(discordBotKafkaOptions)

  // Bot startup event
  c.on("ready", function(){
    eventTasks.batch.ProcessCache(c)                            // synchronise the cache with the database on startup of bot
    eventTasks.shard.emitShardReady(k.emitEvent, c)             // emit a message to Kafka that the shard is ready           
  })

  // Message Sent

  c.on(Events.MessageCreate, function(message: Message){
    if (message.author.id != c.user!.id) {eventTasks.message.messageCreate(k.emitEvent, message)}
  })
  
  // Member events
  c.on(Events.GuildMemberAdd, function(member: GuildMember){
    if (member.user.id != c.user!.id) {eventTasks.member.AddOrUpdateMemberAndUser(member)}           // adds/updates the user / member in the database
  })

  c.on(Events.GuildMemberRemove, function(member: GuildMember | PartialGuildMember){
    if (member.user.id != c.user!.id) {eventTasks.member.RemoveMember(member)}                       // removes the member from the database
  })

  // Guild events
  c.on(Events.GuildCreate, function(guild: Guild){
    eventTasks.guild.addGuildOrUpdate(guild)                            // adds the guild to the database when the bot is added to a new guild
  });

  c.on(Events.GuildDelete, function(guild: Guild){
    eventTasks.guild.removeGuild(guild)                         // removes the guild from the database when the bot is removed from a guild
  })

  c.on(Events.UserUpdate, function(_oldUser: User | PartialUser, newUser: User){
    if (newUser.id != c.user!.id) {eventTasks.user.AddOrUpdateUser(newUser)}               // when a user changes their details update the database
  })

  c.on(Events.GuildMemberUpdate, function(_oldMember: GuildMember | PartialGuildMember, newMember: GuildMember){
    if (newMember.user.id != c.user!.id) {eventTasks.member.AddOrUpdateMemberAndUser(newMember)}        // when a member changes their details update the database
  })

  await k.startProducer()

  c.login(process.env["DISCORD_TOKEN"]);
}

start();