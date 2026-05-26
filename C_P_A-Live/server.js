const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    maxHttpBufferSize: 2e8 // پشتیبانی از آپلود فایل تا ۲۰۰ مگابایت
});

app.use(express.static(path.join(__dirname, 'public')));

// مدیریت ارتباطات سوکت
io.on('connection', (socket) => {
    console.log('یک کاربر متصل شد: ' + socket.id);

    // ورود به اتاق گفتگو
    socket.on('join-room', (roomId, username) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', socket.id, username);

        // ارسال پیام چت
        socket.on('chat-message', (message) => {
            io.to(roomId).emit('message-received', { username, message });
        });

        // انتقال فایل
        socket.on('file-share', (fileData) => {
            socket.to(roomId).emit('file-received', { username, fileName: fileData.name, fileBuffer: fileData.buffer, fileType: fileData.type });
        });

        // سیگنالینگ WebRTC برای تماس تصویری
        socket.on('webrtc-signal', (data) => {
            io.to(data.to).emit('webrtc-signal', {
                from: socket.id,
                signal: data.signal
            });
        });

        // قطع اتصال کاربر
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', socket.id);
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});