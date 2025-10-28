import { Bot, Context } from 'grammy';
import { InlineKeyboard } from 'grammy';
import { logger } from '../utils/logger.js';
import { apiClient } from '../services/api-client.js';

export function setupPromoterCommands(bot: Bot) {
  // /promoter command - Promoter dashboard
  bot.command('promoter', async (ctx: Context) => {
    try {
      const userId = ctx.from?.id;
      const username = ctx.from?.username || ctx.from?.first_name || 'Unknown';
      
      const keyboard = new InlineKeyboard()
        .text('➕ Generate Invite Link', 'promoter_generate_link')
        .row()
        .text('👥 My Guests', 'promoter_my_guests')
        .text('📊 My Stats', 'promoter_stats')
        .row()
        .text('📢 Broadcast Message', 'promoter_broadcast')
        .row()
        .text('◀️ Main Menu', 'main_menu');

      await ctx.reply(
        `🎯 *Promoter Dashboard*\n\n` +
        `Welcome, ${username}!\n\n` +
        `*Quick Actions:*\n` +
        `• Generate invite links for guests\n` +
        `• View your guest list\n` +
        `• Check your KPIs\n` +
        `• Send messages to your guests\n\n` +
        `Select an action below 👇`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        }
      );
      
      logger.info(`Promoter dashboard accessed by user ${userId}`);
    } catch (error) {
      logger.error('Error in promoter command:', error);
      await ctx.reply('❌ Error loading promoter dashboard. Please try again.');
    }
  });

  // Generate invite link
  bot.callbackQuery('promoter_generate_link', async (ctx) => {
    try {
      await ctx.answerCallbackQuery();
      
      const userId = ctx.from?.id;
      const username = ctx.from?.username || ctx.from?.first_name || 'Promoter';
      
      // Generate unique promoter code
      const promoterCode = `${username}_${userId}_${Date.now().toString(36)}`;
      const botUsername = bot.botInfo?.username || 'ClubSuiteBot';
      const inviteLink = `https://t.me/${botUsername}?start=promoter_${promoterCode}`;
      
      // TODO: Store promoter code in database via API
      try {
        await apiClient.post('/promoters/codes', {
          promoterId: userId,
          code: promoterCode,
          username: username
        });
      } catch (apiError) {
        logger.error('Error storing promoter code:', apiError);
        // Continue anyway - link generation is still useful
      }
      
      const keyboard = new InlineKeyboard()
        .text('🔗 Share Link', 'promoter_share')
        .row()
        .text('📋 Generate Another', 'promoter_generate_link')
        .row()
        .text('◀️ Back to Dashboard', 'promoter_dashboard');

      await ctx.editMessageText(
        `✅ *Invite Link Generated!*\n\n` +
        `🔗 Your unique invite link:\n` +
        `\`${inviteLink}\`\n\n` +
        `👥 Share this link with guests to track your referrals.\n\n` +
        `*How it works:*\n` +
        `• Share the link with potential guests\n` +
        `• When they click it, they'll be attributed to you\n` +
        `• Track their bookings in your stats\n` +
        `• Earn commissions on their purchases\n\n` +
        `💡 Tip: You can generate multiple links for different events or channels.`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        }
      );
      
      logger.info(`Generated invite link for promoter ${userId}: ${promoterCode}`);
    } catch (error) {
      logger.error('Error generating promoter link:', error);
      await ctx.answerCallbackQuery({ text: '❌ Error generating link', show_alert: true });
    }
  });

  // My guests list
  bot.callbackQuery('promoter_my_guests', async (ctx) => {
    try {
      await ctx.answerCallbackQuery();
      
      const userId = ctx.from?.id;
      
      // Fetch guests from API
      let guests: any[] = [];
      try {
        const response = await apiClient.get(`/promoters/${userId}/guests`);
        guests = response.data || [];
      } catch (apiError) {
        logger.error('Error fetching guests:', apiError);
      }
      
      let message = `👥 *My Guests* (${guests.length})\n\n`;
      
      if (guests.length === 0) {
        message += `No guests yet. Generate an invite link and start inviting! 🎉`;
      } else {
        message += guests.slice(0, 10).map((guest: any, index: number) => 
          `${index + 1}. ${guest.name || guest.username || 'Guest'} - ` +
          `${guest.status || 'Pending'} ${guest.attended ? '✅' : '⏳'}`
        ).join('\n');
        
        if (guests.length > 10) {
          message += `\n\n... and ${guests.length - 10} more guests.`;
        }
      }
      
      const keyboard = new InlineKeyboard()
        .text('🔄 Refresh', 'promoter_my_guests')
        .row()
        .text('◀️ Back to Dashboard', 'promoter_dashboard');

      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
      
    } catch (error) {
      logger.error('Error showing guests:', error);
      await ctx.answerCallbackQuery({ text: '❌ Error loading guests', show_alert: true });
    }
  });

  // My stats/KPIs
  bot.callbackQuery('promoter_stats', async (ctx) => {
    try {
      await ctx.answerCallbackQuery();
      
      const userId = ctx.from?.id;
      
      // Fetch KPIs from API
      let stats: any = {
        totalInvited: 0,
        totalConfirmed: 0,
        totalAttended: 0,
        totalRevenue: 0,
        commission: 0
      };
      
      try {
        const response = await apiClient.get(`/promoters/${userId}/kpi`);
        stats = response.data || stats;
      } catch (apiError) {
        logger.error('Error fetching KPIs:', apiError);
      }
      
      const conversionRate = stats.totalInvited > 0 
        ? ((stats.totalConfirmed / stats.totalInvited) * 100).toFixed(1)
        : 0;
      
      const attendanceRate = stats.totalConfirmed > 0
        ? ((stats.totalAttended / stats.totalConfirmed) * 100).toFixed(1)
        : 0;

      const message = 
        `📊 *Your Performance*\n\n` +
        `*Leads & Conversions:*\n` +
        `👥 Invited: ${stats.totalInvited}\n` +
        `✅ Confirmed: ${stats.totalConfirmed} (${conversionRate}%)\n` +
        `🎉 Attended: ${stats.totalAttended} (${attendanceRate}%)\n\n` +
        `*Revenue Impact:*\n` +
        `💰 Total Revenue: $${(stats.totalRevenue || 0).toFixed(2)}\n` +
        `💵 Your Commission: $${(stats.commission || 0).toFixed(2)}\n\n` +
        `*Tips:*\n` +
        `• Share your links on social media\n` +
        `• Follow up with guests personally\n` +
        `• Higher attendance = better commissions! 🚀`;

      const keyboard = new InlineKeyboard()
        .text('🔄 Refresh', 'promoter_stats')
        .row()
        .text('◀️ Back to Dashboard', 'promoter_dashboard');

      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
      
    } catch (error) {
      logger.error('Error showing stats:', error);
      await ctx.answerCallbackQuery({ text: '❌ Error loading stats', show_alert: true });
    }
  });

  // Broadcast message
  bot.callbackQuery('promoter_broadcast', async (ctx) => {
    try {
      await ctx.answerCallbackQuery();
      
      const keyboard = new InlineKeyboard()
        .text('◀️ Back to Dashboard', 'promoter_dashboard');

      await ctx.editMessageText(
        `📢 *Broadcast Message*\n\n` +
        `To send a message to all your guests, use the command:\n\n` +
        `/broadcast Your message here\n\n` +
        `Example:\n` +
        `/broadcast Hey everyone! Don't miss tonight's party! 🎉\n\n` +
        `*Note:* Messages are sent to all guests who haven't opted out.`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        }
      );
      
    } catch (error) {
      logger.error('Error showing broadcast info:', error);
      await ctx.answerCallbackQuery({ text: '❌ Error', show_alert: true });
    }
  });

  // Broadcast command
  bot.command('broadcast', async (ctx: Context) => {
    try {
      const userId = ctx.from?.id;
      const message = ctx.match as string;
      
      if (!message || message.trim().length === 0) {
        await ctx.reply(
          '📢 *Broadcast Message*\n\n' +
          'Usage: `/broadcast Your message here`\n\n' +
          'This will send your message to all your guests.',
          { parse_mode: 'Markdown' }
        );
        return;
      }
      
      // Send broadcast via API
      try {
        const response = await apiClient.post(`/promoters/${userId}/broadcast`, {
          message: message.trim()
        });
        
        const sentCount = response.data?.sentCount || 0;
        await ctx.reply(
          `✅ Message broadcast successfully!\n\n` +
          `📨 Sent to ${sentCount} guest(s)`,
          { parse_mode: 'Markdown' }
        );
        
        logger.info(`Broadcast sent by promoter ${userId} to ${sentCount} guests`);
      } catch (apiError: any) {
        logger.error('Error sending broadcast:', apiError);
        await ctx.reply(
          '❌ Error sending broadcast. Please try again later.',
          { parse_mode: 'Markdown' }
        );
      }
      
    } catch (error) {
      logger.error('Error in broadcast command:', error);
      await ctx.reply('❌ Error sending broadcast.');
    }
  });

  // Back to promoter dashboard
  bot.callbackQuery('promoter_dashboard', async (ctx) => {
    try {
      await ctx.answerCallbackQuery();
      
      const username = ctx.from?.username || ctx.from?.first_name || 'Unknown';
      
      const keyboard = new InlineKeyboard()
        .text('➕ Generate Invite Link', 'promoter_generate_link')
        .row()
        .text('👥 My Guests', 'promoter_my_guests')
        .text('📊 My Stats', 'promoter_stats')
        .row()
        .text('📢 Broadcast Message', 'promoter_broadcast')
        .row()
        .text('◀️ Main Menu', 'main_menu');

      await ctx.editMessageText(
        `🎯 *Promoter Dashboard*\n\n` +
        `Welcome back, ${username}!\n\n` +
        `*Quick Actions:*\n` +
        `• Generate invite links for guests\n` +
        `• View your guest list\n` +
        `• Check your KPIs\n` +
        `• Send messages to your guests\n\n` +
        `Select an action below 👇`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        }
      );
    } catch (error) {
      logger.error('Error returning to promoter dashboard:', error);
      await ctx.answerCallbackQuery({ text: '❌ Error', show_alert: true });
    }
  });
}

