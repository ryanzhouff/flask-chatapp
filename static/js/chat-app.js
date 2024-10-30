const socket = io();
const sendButton = document.querySelector('#send-button');
const updateUsernameButton = document.querySelector('#update-username-button');
const messageInput = document.querySelector('#message-input');
const currentUsernameSpan = document.querySelector('#current-username');
const usernameInput = document.querySelector('#username-input');
const chatMessagesElement = document.querySelector('#chat-messages');


let currentUsername = '';

socket.on('set_username', data => {
    currentUsername = data.username;
    currentUsernameSpan.textContent = currentUsername;
});

socket.on('user_joined', data => {
    addMessage(`${data.username} 加入聊天`, 'system');
});

socket.on('user_left', data => {
    addMessage(`${data.username} 离开聊天`, 'system');
});

socket.on('new_message', data => {
    addMessage(data.message, "user", data.username, data.avatar);
});

socket.on('username_updated', data => {
    addMessage(`${data.old_username} 修改名称为 ${data.new_username}`, 'system');

    if (data.old_username === currentUsername) {
        currentUsername = data.new_username;
        currentUsernameSpan.textContent = `你的名字是: ${currentUsername}`;
    }
});

// 更新用户名
updateUsernameButton.addEventListener('click', updateUsername);

function updateUsername() {
    const newUsername = usernameInput.value.trim();

    if (newUsername && newUsername !== currentUsername) {
        socket.emit('update_username', {username: newUsername});
        usernameInput.value = '';
    }
}

// 发送消息
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = messageInput.value.trim();

    if (message) {
        socket.emit('send_message', {message});
        messageInput.value = '';
    }
}

/**
 * 创建消息
 *
 * @param message {string} 输入的消息
 * @param type {string} 消息类型，user-用户信息 system-系统信息
 * @param username 用户名
 * @param avatar 头像
 */
function addMessage(message, type, username = '', avatar = '') {
    let messageElement = document.createElement('div');
    messageElement.className = 'message';
    // console.log(messageElement)

    if (type === 'user') {
        const isSentMessage = currentUsername === username;

        if (isSentMessage) {
            console.log(messageElement)
            messageElement.classList.add('sent');
        }

        // 创建头像
        const avatarElement = document.createElement('img');
        avatarElement.src = avatar;
        messageElement.appendChild(avatarElement);

        const contentElement = document.createElement('div');
        contentElement.classList.add('message-content');

        const usernameElement = document.createElement('div');
        usernameElement.classList.add('message-username');
        usernameElement.textContent = username;
        contentElement.appendChild(usernameElement);

        // 消息
        const textElement = document.createElement('div');
        textElement.textContent = message;
        contentElement.appendChild(textElement);

        messageElement.appendChild(contentElement);
    } else {
        messageElement.classList.add('system-message');
        messageElement.textContent = message;
    }

    chatMessagesElement.appendChild(messageElement);
    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
}