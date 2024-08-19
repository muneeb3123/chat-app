// Ensure that Socket.IO is correctly included in the HTML file
const socket = io('http://localhost:3000');

let audio = new Audio('ringtone.mp3')

// Get references to the HTML elements
const form = document.getElementById('send-container');
const messageInput = document.getElementById('input-text');
const container = document.querySelector('.container'); // Use querySelector for a single element
const userContainer = document.querySelector('.all-users');

// Function to append messages to the chat container
const appendChat = (name, message, position) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-container', position);

    const nameSpan = document.createElement('span');
    nameSpan.textContent = `${name}:`;
    
    const messageText = document.createTextNode(` ${message}`);
    
    messageElement.appendChild(nameSpan);
    messageElement.appendChild(messageText);
    
    container.append(messageElement);

    if (position === 'left') {
        audio.play();
    }
};

let userArray = [];
let currentUserId = null;

const appendUser = (users) => {
    Object.keys(users).forEach(userKey => {
        if (userKey !== currentUserId && !userArray.includes(userKey)) {
            userArray.push(userKey);
                const userDiv = document.createElement('div');
            userDiv.dataset.id = userKey;
            userDiv.classList.add('user');

            const userIcon = document.createElement('i');
            userIcon.classList.add('fa-solid', 'fa-user');
            userIcon.style.color = '#FFD43B';
            userDiv.appendChild(userIcon);

            const userInfo = document.createElement('div');
            userInfo.classList.add('user-info');

            const userName = document.createElement('p');
            userName.textContent = `${users[userKey]}`;

            const lastMsg = document.createElement('p');
            lastMsg.textContent = "Your last msg here";

            userInfo.appendChild(userName);
            userInfo.appendChild(lastMsg);

            userDiv.appendChild(userInfo);

            userDiv.addEventListener('click', () => {
                socket.emit('personal', userKey);
                form.dataset.id = userKey;
            });

            userContainer.append(userDiv);
            
        }
    });
}

// Prompt for the user's name
const name = prompt('Enter your name to join');

// Emit the 'new-user-joined' event to the server with the user's name
socket.emit('new-user-joined', name);

// Listen for the 'user-joined' event from the server and append the message
socket.on('user-joined', (name, users, userId) => {
  
    if (!currentUserId) {
        currentUserId = userId; 
    }

    if (currentUserId !== userId) {
        appendChat(name, 'joined the chat', 'left');
    }

    appendUser(users);
});

// Listen for the 'send' event from the form and emit the message to the server
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    appendChat('You', message, 'right');
    room = form.dataset.id
    socket.emit('send', message, room);
    messageInput.value = '';
});

// Listen for the 'receive' event from the server and append the message
socket.on('receive', data => {
    appendChat(data.name, data.message, 'left');
});

// Listen for the 'left' event from the server and append the message
socket.on('left', name => {
    appendChat(name, 'left the chat', 'left');
});

socket.on('previous-users', users => {
    appendUser(users);
});
