const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ChannelType, 
    PermissionFlagsBits 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ]
});

// --- AYARLARIN (FIXED) ---
const config = {
    token: 'MTQ2NTg3MzU1MzAwOTE1MjAzNA.G1_9sy.WUNeGljeRChH-EjsiQ1-7BwpCGEgrn3cDYQqWw',
    categoryId: '1465857842056790108',
    logChannelId: '1465877904700473497',
    adminRoleId: '1465857831663042635', // BURAYI DOLDURMAYI UNUTMA
    bannerUrl: 'https://cdn.discordapp.com/attachments/1465857884440236083/1465875456510394420/logom.jpg'
};

client.once('ready', () => {
    console.log(`😈 ${client.user.tag} Aktif!`);
});

// --- KURULUM KOMUTU ---
client.on('messageCreate', async (message) => {
    if (message.content === '!kurulum' && message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const embed = new EmbedBuilder()
            .setTitle('Lucifer Destek Sistemi')
            .setDescription('**Gerçekten arzuladığın şey nedir?**\n\nLütfen aşağıdan bir kategori seç.')
            .setImage(config.bannerUrl)
            .setColor('#660000');

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('lucifer_select')
                .setPlaceholder('Bir seçim yap...')
                .addOptions([
                    { label: 'Cars Satın Alım', value: 'alım', emoji: '💰' },
                    { label: 'Scripts Satın Alım', value: 'alım', emoji: '💰' },
                    { label: 'Maps Satın Alım', value: 'alım', emoji: '💰' }
                ])
        );

        await message.channel.send({ embeds: [embed], components: [menu] });
    }
});

// --- ANA ETKİLEŞİM YÖNETİCİSİ ---
client.on('interactionCreate', async (interaction) => {
    
    // 1. KANAL AÇMA SİSTEMİ
    if (interaction.isStringSelectMenu() && interaction.customId === 'lucifer_select') {
        const userName = interaction.user.username.toLowerCase();
        
        const existing = interaction.guild.channels.cache.find(c => c.name === `hell-${userName}`);
        if (existing) return interaction.reply({ content: 'Zaten bir talebin var!', ephemeral: true });

        const channel = await interaction.guild.channels.create({
            name: `hell-${userName}`,
            type: ChannelType.GuildText,
            parent: config.categoryId,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                { id: config.adminRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_now').setLabel('Kilitle').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
            new ButtonBuilder().setCustomId('claim_now').setLabel('Üstlen').setStyle(ButtonStyle.Success).setEmoji('🙋‍♂️')
        );

        await channel.send({ 
            content: `Hoşgeldin ${interaction.user}, yetkililer @everyone burada olacak.`,
            components: [row] 
        });

        await interaction.reply({ content: `Kanal açıldı: ${channel}`, ephemeral: true });
    }

    // 2. BUTON SİSTEMİ (KAPATMA VE ÜSTLENME)
    if (interaction.isButton()) {
        // TICKET KAPATMA
        if (interaction.customId === 'close_now') {
            await interaction.reply('Dosya arşive gönderiliyor, kanal 5 saniye içinde silinecek... 🕯️');
            
            // Log Kanalına Mesaj At
            const logChan = interaction.guild.channels.cache.get(config.logChannelId);
            if (logChan) {
                logChan.send({ content: `🔒 **Ticket Kapatıldı:** \`${interaction.channel.name}\` | **Kapatan:** \`${interaction.user.tag}\`` });
            }

            // Silme İşlemi (Gecikmeli)
            setTimeout(() => {
                interaction.channel.delete().catch(e => console.log("Kanal zaten silinmiş veya yetki yok."));
            }, 5000);
        }

        // TICKET ÜSTLENME
        if (interaction.customId === 'claim_now') {
            if (!interaction.member.roles.cache.has(config.adminRoleId)) {
                return interaction.reply({ content: 'Buna yetkin yok dostum.', ephemeral: true });
            }

            const closedRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('close_now').setLabel('Kilitle').setStyle(ButtonStyle.Danger).setEmoji('🔒')
            );

            await interaction.message.edit({ components: [closedRow] });
            await interaction.reply({ content: `Bu vakayla artık **${interaction.user.username}** ilgileniyor.` });
        }
    }
});

client.login(config.token);