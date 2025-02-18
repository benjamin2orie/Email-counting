// const dotenv = require('dotenv');
// const nodemailer = require('nodemailer');
// const Imap = require('imap');
// const { format } = require('date-fns');

// dotenv.config();

// // Email credentials
// const emailUser = process.env.EMAIL_USER;
// const emailPass = process.env.EMAIL_PASS;
// const emailHost = process.env.EMAIL_HOST;
// const emailPort = process.env.EMAIL_PORT;

// // IMAP configuration
// const imapConfig = {
//   user: emailUser,
//   password: emailPass,
//   host: emailHost,
//   port: emailPort,
//   tls: true,
//   tlsOptions: { rejectUnauthorized: false },
// };

// // Function to count emails received today
// function countEmailsToday() {
//   return new Promise((resolve, reject) => {
//     const imap = new Imap(imapConfig);

//     imap.once('ready', () => {
//       imap.openBox('INBOX', true, (err, box) => {
//         if (err) return reject(err);

//         const today = new Date();
//         const formattedDate = format(today, 'dd-MMM-yyyy'); // Convert to DD-MMM-YYYY format

//         const searchCriteria = [['ON', formattedDate]];
//         imap.search(searchCriteria, (err, results) => {
//           if (err) return reject(err);

//           resolve(results.length);
//           imap.end();
//         });
//       });
//     });

//     imap.once('error', (err) => {
//       reject(err);
//     });

//     imap.connect();
//   });
// }

// // Function to send email
// async function sendEmail(count) {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: emailUser,
//       pass: emailPass,
//     },
//   });

//   const mailOptions = {
//     from: emailUser,
//     to: emailUser,
//     subject: 'Daily Email Count',
//     text: `You received ${count} emails today.`,
//   };

//   await transporter.sendMail(mailOptions);
// }

// // Main function
// async function main() {
//   try {
//     const count = await countEmailsToday();
//     console.log(`You received ${count} emails today.`);
//     await sendEmail(count);
//   } catch (error) {
//     console.log("Error occurred");
//     console.error('Error:', error);
//   }
// }

// main();




const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const Imap = require('imap');
const { format } = require('date-fns');
const cron = require('node-cron');

dotenv.config();

// Email credentials
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailHost = process.env.EMAIL_HOST;
const emailPort = process.env.EMAIL_PORT;

// IMAP configuration
const imapConfig = {
  user: emailUser,
  password: emailPass,
  host: emailHost,
  port: emailPort,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
};

// Function to count emails received today
function countEmailsToday() {
  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig);

    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err, box) => {
        if (err) return reject(err);

        const today = new Date();
        const formattedDate = format(today, 'dd-MMM-yyyy'); // Convert to DD-MMM-YYYY format

        const searchCriteria = [['ON', formattedDate]];
        imap.search(searchCriteria, (err, results) => {
          if (err) return reject(err);

          resolve(results.length);
          imap.end();
        });
      });
    });

    imap.once('error', (err) => {
      reject(err);
    });

    imap.connect();
  });
}

// Function to send email
async function sendEmail(subject, text) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: emailUser,
    to: emailUser,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
}

// Function to count emails and send daily summary at 8 PM
function scheduleDailyEmailCount() {
  cron.schedule('0 17 * * *', async () => {
    try {
      const count = await countEmailsToday();
      console.log(`You received ${count} emails today.`);
      await sendEmail('Daily Email Count', `You received ${count} emails today.`);
    } catch (error) {
      console.log("Error occurred");
      console.error('Error:', error);
    }
  }, {
    timezone: "Africa/Lagos"
  });
}

// Schedule the daily email count
scheduleDailyEmailCount();






