

const dotenv = require('dotenv');
const cors = require('cors')
const nodemailer = require('nodemailer');
const Imap = require('imap');
const { format } = require('date-fns');
const cron = require('node-cron');
const express = require('express');
const path = require('path');
const fs = require('fs');

dotenv.config();

// setting up express server
const app = express();
const PORT = process.env.PORT || 3000;




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

// Function to count emails and send daily summary (for testing, run every minute)
function scheduleDailyEmailCount() {
  cron.schedule('* * * * *', async () => {
    console.log("Cron job running..."); // Log to indicate cron job is running
    try {
      const count = await countEmailsToday();

    const url = `https://ping.telex.im/v1/webhooks/${process.env.CHANNEL_ID}`;
    const data = {
    "event_name": "Email count",
    "message": `You receieved ${count} email today`,
    "status": "success",
    "username": `${emailUser}`
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



      // console.log(`You received ${count} emails today.`);
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

app.post('/target.url', async(req, res) =>{

  try {
    const telexReponse =  await sendEmail('Daily Email Count', `You received ${count} emails today.`);
    res.status(200).send(telexReponse);
    
  } catch (error) {
    console.log("Hey Error occured here!");
    res.status(500).send(error)
    
  }
 
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});







