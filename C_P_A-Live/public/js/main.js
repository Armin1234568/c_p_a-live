const socket = io();
let username = "";
const roomId = "main-galaxy-room"; // اتاق پیش‌فرض برای تست

document.getElementById('btn-login').addEventListener('click', () => {
    const input = document.getElementById('username-input').value.trim();
    if (input) {
        username = input;
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        
        // اتصال به اتاق در سرور
        socket.emit('join-room', roomId, username);
        initWebRTC(); // فعالسازی دوربین و صدا
    }
});

// ارسال متن چت
document.getElementById('btn-send').addEventListener('click', sendTextMessage);
document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendTextMessage();
});

function sendTextMessage() {
    const input = document.getElementById('chat-input');
    if (input.value.trim() !== "") {
        socket.emit('chat-message', input.value);
        input.value = "";
    }
}

// دریافت چت
socket.on('message-received', (data) => {
    const msgDiv = document.createElement('div');
    msgDiv.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
    document.getElementById('chat-box').appendChild(msgDiv);
});

// ارسال و اشتراک‌گذاری فایل (صدا، ویدیو، PDF تا حجم ۲۰۰ مگابایت)
document.getElementById('file-input').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    
    if (file.size > 200 * 1024 * 1024) {
        alert("حجم فایل نباید بیشتر از ۲۰۰ مگابایت باشد!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        socket.emit('file-share', {
            name: file.name,
            type: file.type,
            buffer: e.target.result
        });
    };
    reader.readAsArrayBuffer(file);
});

// دریافت فایل و رندر خودکار آن (صدا یا PDF)
socket.on('file-received', (data) => {
    const blob = new Blob([data.fileBuffer], { type: data.fileType });
    const url = URL.createObjectURL(blob);
    const chatBox = document.getElementById('chat-box');

    let elementHtml = `<p>📁 <b>${data.username}</b> یک فایل فرستاد: <a href="${url}" download="${data.fileName}">${data.fileName}</a></p>`;
    
    // اگر فایل صوتی بود، مستقیماً پلیر صوتی بساز
    if (data.fileType.startsWith('audio/')) {
        elementHtml += `<audio controls src="${url}"></audio>`;
    }
    // اگر فایل PDF بود
    else if (data.fileType === 'application/pdf') {
        elementHtml += `<iframe src="${url}" width="100%" height="200px"></iframe>`;
    }

    const wrapper = document.createElement('div');
    wrapper.innerHTML = elementHtml;
    chatBox.appendChild(wrapper);
});