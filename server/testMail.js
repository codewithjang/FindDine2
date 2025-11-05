require("dotenv").config();
const { sendMail } = require("./utils/mailer");

async function test() {
  try {
    await sendMail({
      to: "asmanasman971@gmail.com",
      subject: "🔔 ทดสอบการส่งอีเมลจาก FindDine",
      html: "<h3>ระบบส่งอีเมลทำงานได้แล้ว!</h3>",
    });
    console.log("✅ ส่งอีเมลสำเร็จ");
  } catch (err) {
    console.error("❌ ส่งอีเมลล้มเหลว:", err);
  }
}

test();
