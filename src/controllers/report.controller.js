const Imap = require('imap');
const { simpleParser } = require('mailparser');

const getEmailReport = async (req, res) => {
  try {
    const imapConfig = {
      user: 'no-reply@gnf-japan.com',
      password: 'Fkgkhiyou-66-hjhghj',
      host: 'imap4.muumuu-mail.com'
    };
    const imap = new Imap(imapConfig);

    const imapConfigHieu = {
        user: 'hieu@gnf-japan.com',
        password: 'Rongden123',
        host: 'imap4.muumuu-mail.com'
      };
    const imapHieu = new Imap(imapConfigHieu);

    imapHieu.once('ready', function () {
        imapHieu.openBox('INBOX', true, (err, box) => {
          if (err) {
            res.status(500).send('Cannot open inbox');
            return;
          }
  
          imapHieu.search(['ALL'], (err, results) => {
            if (err || !results.length) {
              res.status(500).send('No emails found');
              return;
            }
  
            const fetchPerBatch = 100; // Số email mỗi lần fetch
            let batchStart = 0;
            let emails = [];
  
            let currentLeak = 0;
  
            const fetchNextBatch = () => {
              let batchEnd = Math.min(batchStart + fetchPerBatch, results.length);
              let batch = results.slice(batchStart, batchEnd);
  
              currentLeak += 100;
              console.log('Leak xong', currentLeak);
  
              const f = imapHieu.fetch(batch, { bodies: '' });
  
              f.on('message', (msg, seqno) => {
                msg.on('body', (stream) => {
                  simpleParser(stream, (err, parsed) => {
                    if (err) {
                      console.error('Failed to parse email', err);
                      return;
                    }
                    emails.push(parsed);
                  });
                });
              });
  
              f.once('error', (err) => {
                console.error('Fetch error: ', err.message);
              });
  
              f.once('end', () => {
                if (batchEnd < results.length) {
                  batchStart += fetchPerBatch;
                  fetchNextBatch();
                } else {
                    imapHieu.end();
  
                  const totalMail = emails.length;
                  let failedMail = 0;
                  let replyMail = 0;
                  let muumuuAlert = 0;
  
                  const failedKeywords = [
                    'Undelivered Mail Returned to Sender',
                    'Delivery Status Notification',
                    'Delivery Failure',
                    'Undeliverable',
                    'Mail delivery failed',
                    'Returned mail: see transcript for details',
                    'Rejected:',
                    'Returned email:',
                    'Email address not available',
                    'Delayed message:',
                    'Notification:'
                  ];
  
                  const replyKeywork = [
                      'RE:',
                      'Re:',
                      'Reply:'
                  ]
  
                  for (let i = 0; i < emails.length; i++) {
                    const email = emails[i];
  
                    if (failedKeywords.some(keyword => email.subject.includes(keyword))) {
                      failedMail++;
                    } else if (replyKeywork.some(keyword => email.subject.includes(keyword))) {
                      replyMail++;
                    } else if (email.subject.includes('ムームードメイン')) {
                      muumuuAlert++;
                    } else {
                      console.log(email.subject);
                    }
                  }
  
                  res.status(200).send({
                    totalMail,
                    failedMail,
                    replyMail,
                    muumuuAlert,
                    remain: totalMail - (failedMail + replyMail + muumuuAlert)
                  });
                }
              });
            };
  
            fetchNextBatch();
          });
        });
      });

    /* 
    imap.once('ready', function () {
      imap.openBox('INBOX', true, (err, box) => {
        if (err) {
          res.status(500).send('Cannot open inbox');
          return;
        }

        imap.search(['ALL'], (err, results) => {
          if (err || !results.length) {
            res.status(500).send('No emails found');
            return;
          }

          const fetchPerBatch = 100; // Số email mỗi lần fetch
          let batchStart = 0;
          let emails = [];

          let currentLeak = 0;

          const fetchNextBatch = () => {
            let batchEnd = Math.min(batchStart + fetchPerBatch, results.length);
            let batch = results.slice(batchStart, batchEnd);

            currentLeak += 100;
            console.log('Leak xong', currentLeak);

            const f = imap.fetch(batch, { bodies: '' });

            f.on('message', (msg, seqno) => {
              msg.on('body', (stream) => {
                simpleParser(stream, (err, parsed) => {
                  if (err) {
                    console.error('Failed to parse email', err);
                    return;
                  }
                  emails.push(parsed);
                });
              });
            });

            f.once('error', (err) => {
              console.error('Fetch error: ', err.message);
            });

            f.once('end', () => {
              if (batchEnd < results.length) {
                batchStart += fetchPerBatch;
                fetchNextBatch();
              } else {
                imap.end();

                const totalMail = emails.length;
                let failedMail = 0;
                let replyMail = 0;
                let muumuuAlert = 0;

                const failedKeywords = [
                  'Undelivered Mail Returned to Sender',
                  'Delivery Status Notification',
                  'Delivery Failure',
                  'Undeliverable',
                  'Mail delivery failed',
                  'Returned mail: see transcript for details',
                  'Rejected:',
                  'Returned email:',
                  'Email address not available',
                  'Delayed message:',
                  'Notification:'
                ];

                const replyKeywork = [
                    'RE:',
                    'Re:',
                    'Reply:'
                ]

                for (let i = 0; i < emails.length; i++) {
                  const email = emails[i];

                  if (failedKeywords.some(keyword => email.subject.includes(keyword))) {
                    failedMail++;
                  } else if (replyKeywork.some(keyword => email.subject.includes(keyword))) {
                    replyMail++;
                  } else if (email.subject.includes('ムームードメイン')) {
                    muumuuAlert++;
                  } else {
                    console.log(email.subject);
                  }
                }

                res.status(200).send({
                  totalMail,
                  failedMail,
                  replyMail,
                  muumuuAlert,
                  remain: totalMail - (failedMail + replyMail + muumuuAlert)
                });
              }
            });
          };

          fetchNextBatch();
        });
      });
    });
    */

    imap.once('error', (err) => {
      res.status(500).send('Connection error: ' + err.message);
    });

    imap.connect();
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  getEmailReport
};