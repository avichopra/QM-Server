import { notifyGroupsOnSocket, executeService } from './sockets';

const sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
const helper = require('sendgrid').mail;

const sendEmail = async ({ to, from = 'developer@quickmedic.com', subject = '', body }) =>
  new Promise((resolve, reject) => {
    const fromEmail = new helper.Email(from);
    const toEmail = new helper.Email(to);
    const content = new helper.Content('text/html', body);

    const mail = new helper.Mail(fromEmail, subject, toEmail, content);
    const request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON()
    });
    sg.API(request, (error, response) => {
      if (error) {
        console.log('Error response received', JSON.stringify(error));
        return reject(error);
      }
      return resolve(response);
    });
  });
module.exports = {
  notifyGroupsOnSocket,
  executeService,
  sendEmail
};
