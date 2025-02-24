

// import dotenv from  'dotenv';
// import cors from 'cors'
// import nodemailer from 'nodemailer';
// import  Imap from 'imap';
// import { format } from 'date-fns';
// import cron from 'node-cron';
// import express from 'express';
// import path from 'path';
// import fs from 'fs';

// dotenv.config();

// // setting up express server
// const app = express();
// const PORT = process.env.PORT || 3000;


// app.use(cors({
//   origin: '*',
//   methods: ['GET', 'POST', 'PUT' ]
// }))




// // Email credentials
// // const emailUser = process.env.EMAIL_USER;
// // const emailPass = process.env.EMAIL_PASS;
// // const emailHost = process.env.EMAIL_HOST;
// // const emailPort = process.env.EMAIL_PORT;

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
//         const formattedDate = format(today, 'dd-MMM-yyyy'); 

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
// async function sendEmail(subject, text) {
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
//     subject,
//     text,
//   };

//   await transporter.sendMail(mailOptions);
// }

// // Function to count emails and send daily summary (for testing, run every minute)
// function scheduleDailyEmailCount() {
//   cron.schedule('* * * * *', async () => {
//     console.log("Cron job running..."); // Log to indicate cron job is running
//     try {
//       const count = await countEmailsToday();

//     const url = `https://ping.telex.im/v1/webhooks/${process.env.CHANNEL_ID}`;
//     const data = {
//     "event_name": "Email count",
//     "message": `You receieved ${count} email today`,
//     "status": "success",
//     "username": `${emailUser}`
//     };

//     fetch(url, {
//     method: "POST",
//     headers: {
//       "Accept": "application/json",
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify(data)
//     })
//     .then(response => response.json())
//     .then(console.log)
//     .catch(console.error);



//       // console.log(`You received ${count} emails today.`);
//       await sendEmail('Daily Email Count', `You received ${count} emails today.`);
//     } catch (error) {
//       console.log("Error occurred");
//       console.error('Error:', error);
//     }
//   }, {
//     timezone: "Africa/Lagos"
//   });
// }

// // Schedule the daily email count
// scheduleDailyEmailCount();






// // Serve the JSON file via a GET request
// app.get('/integration.json', (req, res) => {
//     const dataPath = path.join(__dirname, 'telex-integration-config.json');
//     fs.readFile(dataPath, 'utf8', (err, data) => {
//       if (err) {
//         res.status(500).send('Error reading the data file.');
//         return;
//       }
//       res.json(JSON.parse(data));
//     });
// });

// app.post('/target.url', async (req, res) => {
//   const {
//     emailUsers = process.env.EMAIL_USER,
//     emailPasss = process.env.EMAIL_PASS,
//     emailHosts = process.env.EMAIL_HOST,
//     emailPorts = process.env.EMAIL_PORT
//   } = req.body;


//   // console.log('Using emailUser:', emailUsers);
//   // console.log('Using emailPass:', emailPass);
//   // console.log('Using emailHost:', emailHost);
//   // console.log('Using emailPort:', emailPort);

//   try {
//     const count = await countEmailsToday(emailUsers, emailPasss, emailHosts, emailPorts);
//     await sendEmail(emailUser, emailPass, 'Daily Email Count', `You received ${count} emails today.`);
//     res.status(200).send({ message: `You received ${count} emails today.` });
//   } catch (error) {
//     console.log("Error occurred");
//     res.status(500).send({ error: 'Failed to send email' });
//   }
  
 
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
//   console.log('Using emailUser:', emailUser);
// });

// export default app;










import dotenv from 'dotenv';
import cors from 'cors';
import nodemailer from 'nodemailer';
import Imap from 'imap';
import { format } from 'date-fns';
import cron from 'node-cron';
import express from 'express';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Setting up Express server
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT']
}));

app.use(express.json()); // To parse JSON request bodies

// Function to count emails received today
function countEmailsToday(emailUser, emailPass, emailHost, emailPort) {
  const imapConfig = {
    user: emailUser,
    password: emailPass,
    host: emailHost,
    port: emailPort,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  };

  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig);

    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err, box) => {
        if (err) return reject(err);

        const today = new Date();
        const formattedDate = format(today, 'dd-MMM-yyyy');

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
async function sendEmail(emailUser, emailPass, subject, text) {
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

// Function to count emails and send daily summary (for testing, run every minute)
function scheduleDailyEmailCount() {
  cron.schedule('* * * * *', async () => {
    console.log("Cron job running...");
    try {
      const count = await countEmailsToday(process.env.EMAIL_USER, process.env.EMAIL_PASS, process.env.EMAIL_HOST, process.env.EMAIL_PORT);

      const url = `https://ping.telex.im/v1/webhooks/${process.env.CHANNEL_ID}`;
      const data = {
        "event_name": "Email count",
        "message": `You received ${count} emails today`,
        "status": "success",
        "username": `${process.env.EMAIL_USER}`
      };

      fetch(url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(console.log)
      .catch(console.error);

      await sendEmail(process.env.EMAIL_USER, process.env.EMAIL_PASS, 'Daily Email Count', `You received ${count} emails today.`);
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

// Serve the JSON file via a GET request
app.get('/integration.json', (req, res) => {
  const dataPath = path.join(__dirname, 'telex-integration-config.json');
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading the data file.');
      return;
    }
    res.json(JSON.parse(data));
  });
});

// POST endpoint to count emails and send the count
app.post('/target.url', async (req, res) => {
  const {
    emailUser = process.env.EMAIL_USER,
    emailPass = process.env.EMAIL_PASS,
    emailHost = process.env.EMAIL_HOST,
    emailPort = process.env.EMAIL_PORT
  } = req.body;


  try {
    const count = await countEmailsToday(emailUser, emailPass, emailHost, emailPort);
    await sendEmail(emailUser, emailPass, 'Daily Email Count', `You received ${count} emails today.`);
    res.status(200).send({ message: `You received ${count} emails today.` });
  } catch (error) {
    console.error('Error Details:', error);
    res.status(500).send({ error: 'Failed to send email', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Using emailUser:', process.env.EMAIL_USER);
});

export default app;
