import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faKey } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function App() {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInput, setModalInput] = useState('');

    const sendMessage = async () => {
        if (userInput.trim() !== '') {
            addMessage(userInput, 'user');
            setUserInput('');
            showTyping();

            const requestBody = {
                token: localStorage.getItem('token'),
                content: {
                    user: 'user',
                    message: userInput
                }
            };

            try {
                const response = await fetch('https://api.raihanpratama.xyz/gemini', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                const data = await response.json();
                setTimeout(() => {
                    hideTyping();
                    if (data.response) {
                        let botResponse = data.response;
                        addMessage(botResponse, 'bot');
                    } else {
                        addMessage("Maaf, terjadi kesalahan. Mohon coba lagi nanti.", 'bot');
                    }
                }, 1000);
            } catch (error) {
                console.error('Error:', error);
                hideTyping();
                addMessage("Maaf, terjadi kesalahan dalam memproses permintaan Anda. Silakan coba lagi nanti.", 'bot');
            }
        }
    };

    const addMessage = (text, sender) => {
        setMessages(prevMessages => [...prevMessages, { text, sender }]);
    };

    const showTyping = () => {
        setMessages(prevMessages => [...prevMessages, { text: 'Bot sedang mengetik...', sender: 'typing' }]);
    };

    const hideTyping = () => {
        setMessages(prevMessages => prevMessages.filter(message => message.sender !== 'typing'));
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleModalInputChange = (event) => {
        setModalInput(event.target.value);
    };

    const handleModalSubmit = (event) => {
        event.preventDefault();
        localStorage.setItem('token', modalInput);
        toggleModal();
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsModalOpen(false);
            }
        };

        if (isModalOpen) {
            window.addEventListener('keydown', handleKeyDown);
        } else {
            window.removeEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isModalOpen]);

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-teal-400'>
            <button
                id="toggle-theme"
                className="fixed top-5 right-5 bg-white bg-opacity-20 rounded-full w-12 h-12 text-white flex items-center justify-center transition-transform transform hover:rotate-180"
                onClick={toggleModal}
            >
                <FontAwesomeIcon icon={faKey} />
            </button>
            <div className="container mx-auto max-w-3xl w-11/12 bg-white bg-opacity-90 shadow-lg rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-center py-5">
                    <h3 className="text-xl font-bold">Chat Bot</h3>
                    <p>Powered by Google Gemini</p>
                </div>
                <div className="chat-box h-96 overflow-y-auto p-5 bg-gray-100 bg-opacity-80">
                    {messages.map((message, index) => (
                        <div key={index} className={`message flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                            <div className={`message-text max-w-xs py-3 px-4 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                {message.text}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="input-group p-5 bg-gray-100 bg-opacity-80 border-t border-gray-200 flex">
                    <input
                        type="text"
                        id="user-input"
                        className="form-control flex-1 rounded-full p-3 border-2 border-blue-500"
                        placeholder="Ketik pesan Anda di sini..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
                    />
                    <button className="btn ml-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-full flex items-center justify-center transition-transform transform hover:scale-105"
                            onClick={sendMessage}>
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-out">
                    <div className="modal-content bg-white p-8 rounded-lg shadow-lg w-1/3 transition-transform duration-300 ease-out transform">
                        <form onSubmit={handleModalSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="modal-input">
                                    Your token: {localStorage.getItem('token') === null ? "Undefined" : localStorage.getItem('token') }
                                </label>
                                <input
                                    id="modal-input"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    type="text"
                                    onChange={handleModalInputChange}
                                    autoComplete="off"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    type="button"
                                    onClick={toggleModal}
                                >
                                    Close
                                </button>
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    type="submit"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
