let localStream;
let peers = {};

async function initWebRTC() {
    try {
        // گرفتن دسترسی دوربین و میکروفون
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('local-video').srcObject = localStream;
    } catch (err) {
        console.error("خطا در دسترسی به دوربین و میکروفون: ", err);
    }
}

// قابلیت شیر اسکرین (صفحه نمایش)
document.getElementById('btn-share-screen').addEventListener('click', async () => {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        document.getElementById('local-video').srcObject = screenStream;
        
        // جایگزین کردن ترک ویدیو در تماس برای سایر کاربران
        const videoTrack = screenStream.getVideoTracks()[0];
        for (let peerId in peers) {
            const sender = peers[peerId].getSenders().find(s => s.track.kind === 'video');
            if (sender) sender.replaceTrack(videoTrack);
        }
    } catch (err) {
        console.error("خطا در به اشتراک‌گذاری اسکرین", err);
    }
});

// مدیریت قطع و وصل صدا و دوربین
document.getElementById('btn-toggle-cam').addEventListener('click', () => {
    const videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
});

document.getElementById('btn-toggle-mic').addEventListener('click', () => {
    const audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
});