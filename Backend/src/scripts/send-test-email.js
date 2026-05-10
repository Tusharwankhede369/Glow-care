require("dotenv").config()
const { sendMail } = require("../utils/mailer")

async function main() {
  const to = process.argv[2] || process.env.SMTP_USER
  if (!to) {
    console.error("Usage: node src/scripts/send-test-email.js <toEmail>")
    process.exit(1)
  }

  const result = await sendMail({
    to,
    subject: "Glow Care SMTP test",
    text: "If you received this email, SMTP is working.",
    html: "<p>If you received this email, <b>SMTP is working</b>.</p>",
  })

  console.log(result)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

