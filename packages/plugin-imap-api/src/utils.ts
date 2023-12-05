import * as Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import { IModels, generateModels } from './connectionResolver';
import { sendContactsMessage, sendInboxMessage } from './messageBroker';
import { IIntegrationDocument } from './models';

export const toUpper = thing => {
  return thing && thing.toUpperCase ? thing.toUpperCase() : thing;
};

export const findAttachmentParts = (struct, attachments?) => {
  attachments = attachments || [];

  for (let i = 0, len = struct.length, _r: any; i < len; ++i) {
    if (Array.isArray(struct[i])) {
      findAttachmentParts(struct[i], attachments);
    } else {
      if (
        struct[i].disposition &&
        ['INLINE', 'ATTACHMENT'].indexOf(toUpper(struct[i].disposition.type)) >
          -1
      ) {
        attachments.push(struct[i]);
      }
    }
  }
  return attachments;
};

export const createImap = (integration: IIntegrationDocument) => {
  return new Imap({
    user: integration.mainUser || integration.user,
    password: integration.password,
    host: integration.host,
    keepalive: { forceNoop: true },
    port: 993,
    tls: true
  });
};

const searchMessages = (imap, criteria) => {
  return new Promise((resolve, reject) => {
    const messages: any = [];

    imap.search(criteria, (err, results) => {
      if (err) {
        throw err;
      }

      let f;

      try {
        f = imap.fetch(results, { bodies: '', struct: true });
      } catch (e) {
        if (e.message.includes('Nothing to fetch')) {
          return resolve([]);
        }
        throw e;
      }

      f.on('message', msg => {
        msg.on('body', async stream => {
          let buffer = '';

          stream.on('data', chunk => {
            buffer += chunk.toString('utf8');
          });

          stream.once('end', async () => {
            messages.push(buffer);
          });
        });
      });

      f.once('error', (error: any) => {
        reject(error);
      });

      f.once('end', async () => {
        const data: any = [];

        for (const buffer of messages) {
          const parsed = await simpleParser(buffer);
          data.push(parsed);
        }

        resolve(data);
      });
    });
  });
};

const saveMessages = async (
  subdomain: string,
  imap,
  integration: IIntegrationDocument,
  criteria,
  models: IModels
) => {
  const msgs: any = await searchMessages(imap, criteria);

  console.log(`======== found ${msgs.length} messages`);

  for (const msg of msgs) {
    if (
      msg.to &&
      msg.to.value &&
      msg.to.value[0] &&
      msg.to.value[0].address !== integration.user
    ) {
      continue;
    }

    const message = await models.Messages.findOne({
      messageId: msg.messageId
    });

    if (message) {
      continue;
    }

    const from = msg.from.value[0].address;
    const prev = await models.Customers.findOne({ email: from });

    let customerId;

    if (!prev) {
      const customer = await sendContactsMessage({
        subdomain,
        action: 'customers.findOne',
        data: {
          customerPrimaryEmail: from
        },
        isRPC: true
      });

      if (customer) {
        customerId = customer._id;
      } else {
        const apiCustomerResponse = await sendContactsMessage({
          subdomain,
          action: 'customers.createCustomer',
          data: {
            integrationId: integration.inboxId,
            primaryEmail: from
          },
          isRPC: true
        });

        customerId = apiCustomerResponse._id;
      }

      await models.Customers.create({
        inboxIntegrationId: integration.inboxId,
        contactsId: customerId,
        email: from
      });
    } else {
      customerId = prev.contactsId;
    }

    let conversationId;

    const $or: any[] = [
      { references: { $in: [msg.messageId] } },
      { messageId: { $in: msg.references || [] } }
    ];

    if (msg.inReplyTo) {
      $or.push({ messageId: msg.inReplyTo });
      $or.push({ references: { $in: [msg.inReplyTo] } });
    }

    const relatedMessage = await models.Messages.findOne({
      $or
    });

    if (relatedMessage) {
      conversationId = relatedMessage.inboxConversationId;
    } else {
      const { _id } = await sendInboxMessage({
        subdomain,
        action: 'integrations.receive',
        data: {
          action: 'create-or-update-conversation',
          payload: JSON.stringify({
            integrationId: integration.inboxId,
            customerId,
            createdAt: msg.date,
            content: msg.subject
          })
        },
        isRPC: true
      });

      conversationId = _id;
    }

    await models.Messages.create({
      inboxIntegrationId: integration.inboxId,
      inboxConversationId: conversationId,
      createdAt: msg.date,
      messageId: msg.messageId,
      inReplyTo: msg.inReplyTo,
      references: msg.references,
      subject: msg.subject,
      body: msg.html,
      to: msg.to && msg.to.value,
      cc: msg.cc && msg.cc.value,
      bcc: msg.bcc && msg.bcc.value,
      from: msg.from && msg.from.value,
      attachments: msg.attachments.map(({ filename, contentType, size }) => ({
        filename,
        type: contentType,
        size
      })),
      type: 'INBOX'
    });

    await sendInboxMessage({
      subdomain,
      action: 'conversationClientMessageInserted',
      data: {
        content: msg.html,
        conversationId
      }
    });
  }
};

export const listenIntegration = async (
  subdomain: string,
  integration: IIntegrationDocument,
  models: IModels
) => {
  let lastFetchDate = integration.lastFetchDate
    ? new Date(integration.lastFetchDate)
    : undefined;
  let dbLastFetchDate = integration.lastFetchDate
    ? new Date(integration.lastFetchDate)
    : undefined;

  async function listen() {
    return new Promise<void>((resolve, reject) => {
      let reconnect = true;

      const imap = createImap(integration);

      imap.once('ready', _response => {
        imap.openBox('INBOX', true, async (_err, _box) => {
          console.log('openBox: success');
          try {
            const criteria: any[] = ['UNSEEN'];
            if (lastFetchDate) {
              criteria.push(['SINCE', lastFetchDate.toISOString()]);
            }
            const nextLastFetchDate = new Date();
            await saveMessages(subdomain, imap, integration, criteria, models);
            await models.Integrations.updateOne(
              { _id: integration._id },
              { $set: { lastFetchDate: nextLastFetchDate } }
            );
            lastFetchDate = nextLastFetchDate;
            dbLastFetchDate = new Date(nextLastFetchDate);
          } catch (e) {
            await models.Logs.createLog({
              type: 'error',
              message: e.message + ' 3 ',
              errorStack: e.stack
            });
            console.log('listen integration error ============', e);
          }
        });
      });

      imap.on('mail', async response => {
        console.log('new messages ========', response);

        const updatedIntegration = await models.Integrations.findOne({
          _id: integration._id,
          healthStatus: 'healthy'
        });

        if (!updatedIntegration) {
          console.log(`ending ${integration.user} imap`);
          reconnect = false;
          try {
            imap.end();
          } catch (e) {
            return reject(e);
          }
          return;
        }

        try {
          const criteria: any = ['UNSEEN'];
          if (lastFetchDate) {
            criteria.push(['SINCE', lastFetchDate.toISOString()]);
          }
          const nextLastFetchDate = new Date();
          await saveMessages(subdomain, imap, integration, criteria, models);
          lastFetchDate = nextLastFetchDate;

          if (
            !dbLastFetchDate ||
            lastFetchDate.getTime() - dbLastFetchDate.getTime() > 60 * 1000
          ) {
            await models.Integrations.updateOne(
              { _id: integration._id },
              { $set: { lastFetchDate } }
            );
            dbLastFetchDate = new Date(lastFetchDate);
          }
        } catch (e) {
          await models.Logs.createLog({
            type: 'error',
            message: e.message + ' 1 ',
            errorStack: e.stack
          });
          console.log('save message error ============', e);

          return reject(e);
        }
      });

      imap.once('error', async e => {
        await models.Logs.createLog({
          type: 'error',
          message: e.message + ' 2 ',
          errorStack: e.stack
        });

        console.log('on imap.once =============', e);

        if (e.message.includes('Invalid credentials')) {
          await models.Integrations.updateOne(
            { _id: integration._id },
            {
              $set: {
                healthStatus: 'unHealthy',
                error: `${e.message}`
              }
            }
          );

          // We shouldn't try to reconnect, since it's impossible to connect when the credentials are wrong.
          reconnect = false;

          try {
            imap.end();
          } catch (e) {
            return reject(e);
          }
        } else {
          try {
            imap.end();
          } catch (e) {
            return resolve(e);
          }
        }
      });

      imap.once('end', e => {
        if (reconnect) {
          console.log(
            `Integration= ${integration._id}. Imap connection ended. Reconnecting...`,
            e
          );
          return resolve(e);
        } else {
          console.log(
            `Integration=${integration._id}. Imap connection ended.`,
            e
          );
          return reject(e);
        }
      });

      imap.connect();
    });
  }

  while (true) {
    try {
      await listen();
    } catch (e) {
      break;
    }
  }
};

const listen = async (subdomain: string) => {
  const models = await generateModels(subdomain);

  await models.Logs.createLog({
    type: 'info',
    message: `Started syncing integrations`
  });

  const integrations = await models.Integrations.find({
    healthStatus: 'healthy'
  });

  for (const integration of integrations) {
    // Don't use await, ideally, listening to imap integration should never finish
    listenIntegration(subdomain, integration, models);
  }
};

export default listen;
