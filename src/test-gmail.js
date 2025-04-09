const sendEmail = require("./utils/sendEmail");
require('dotenv').config();

async function testGmail() {
    try {
        await sendEmail({
            email: 'doanquocviet02810@gmail.com',
            subject: 'Kiểm tra SMTP Gmail',
            message: 'Nếu bạn nhận được email này, Gmail SMTP đã hoạt động!',
            html: '<h1>Kiểm tra SMTP Gmail</h1><p>Nếu bạn nhận được email này, Gmail SMTP đã hoạt động!</p>'
        });
        console.log('Email test đã được gửi thành công!');
    } catch (error) {
        console.error('Lỗi gửi email test:', error);
    }
}

testGmail();