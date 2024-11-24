import { generateWAMessageFromContent } from '@whiskeysockets/baileys';

let handler = async (m, { conn, command, participants, usedPrefix, text }) => {
  // Developed by Adfay Inc
  if (!text && !m.quoted && !m.quoted?.mediaMessage) {
    return m.reply('Por favor, proporciona el texto o responde a un mensaje con medios.');
  }

  let groups = Object.keys(await conn.groupFetchAllParticipating());

  let quoted = m.quoted ? await m.getQuotedObj() : m;
  let mime = (quoted.msg || quoted).mimetype || '';
  let isMedia = /image|video|sticker|audio/.test(mime);
  let content = text || quoted.text || ''; 
  let users = participants.map(u => conn.decodeJid(u.id));

  // Enviar el mensaje a todos los grupos intervalo de tiempo 
  for (let i = 0; i < groups.length; i++) {
    const id = groups[i];
    const delay = i * 2000; // 4 segundos entre cada mensaje (multiplica x mil cada segundo que quieras tipo 1 x 1000 = 1000 seria 1 sgungo 

    let messageToSend;
    if (isMedia) {
      let mediax = await quoted.download?.();
      if (quoted.mtype === 'imageMessage') {
        messageToSend = { image: mediax, mentions: users, caption: content };
      } else if (quoted.mtype === 'videoMessage') {
        messageToSend = { video: mediax, mentions: users, mimetype: 'video/mp4', caption: content };
      } else if (quoted.mtype === 'audioMessage') {
        messageToSend = { audio: mediax, mentions: users, mimetype: 'audio/mpeg', fileName: 'Hidetag.mp3' };
      } else if (quoted.mtype === 'stickerMessage') {
        messageToSend = { sticker: mediax, mentions: users };
      }
    } else {
      messageToSend = {
        extendedTextMessage: { text: content, contextInfo: { mentionedJid: users } }
      };
    }


    await new Promise(res => setTimeout(res, delay)); 
    if (isMedia) {
      await conn.sendMessage(id, messageToSend);
    } else {
      const msg = generateWAMessageFromContent(id, messageToSend, { userJid: conn.user.id });
      await conn.relayMessage(id, msg.message, { messageId: msg.key.id });
    }
  }

  await m.reply(`Mensaje enviado a ${groups.length} grupos.`);
};

handler.help = ['spam', 'spam1'].map(v => v + ' <teks>');
handler.tags = ['owner'];
handler.command = /^(spam|spam1)$/i;
handler.owner = true;

export default handler;
