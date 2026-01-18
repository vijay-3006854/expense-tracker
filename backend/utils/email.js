const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Send budget alert email
const sendBudgetAlert = async (user, budgetUsage, totalExpenses) => {
  const subject = `Budget Alert - ${budgetUsage.toFixed(1)}% Used`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">Budget Alert</h2>
      <p>Hi ${user.name},</p>
      <p>You have used <strong>${budgetUsage.toFixed(1)}%</strong> of your monthly budget.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Current Expenses:</strong> $${totalExpenses.toFixed(2)}</p>
        <p><strong>Monthly Budget:</strong> $${user.budget.toFixed(2)}</p>
        <p><strong>Remaining:</strong> $${Math.max(0, user.budget - totalExpenses).toFixed(2)}</p>
      </div>
      
      ${budgetUsage >= 100 ? 
        '<p style="color: #e74c3c;"><strong>⚠️ You have exceeded your budget!</strong></p>' :
        '<p>Please review your spending to stay within budget.</p>'
      }
      
      <p>Best regards,<br>Expense Tracker Team</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, html });
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Expense Tracker!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #27ae60;">Welcome to Expense Tracker!</h2>
      <p>Hi ${user.name},</p>
      <p>Thank you for joining Expense Tracker. We're excited to help you manage your finances better!</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Getting Started:</h3>
        <ul>
          <li>Set your monthly budget</li>
          <li>Add your first transaction</li>
          <li>Explore the dashboard and charts</li>
          <li>Set up email notifications</li>
        </ul>
      </div>
      
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Happy tracking!<br>Expense Tracker Team</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, html });
};

module.exports = {
  sendEmail,
  sendBudgetAlert,
  sendWelcomeEmail
};