import "./App.css";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import useClipboard from "react-use-clipboard";
import { useEffect, useState, useCallback } from "react";
import { debounce } from "lodash";
import { useSpeech } from "react-text-to-speech";

const App = () => {
    const [textToCopy, setTextToCopy] = useState("");
    const [isCopied, setCopied] = useClipboard(textToCopy, { successDuration: 1000 });
    const { transcript, browserSupportsSpeechRecognition, interimTranscript, resetTranscript } = useSpeechRecognition();
    const [userChat, setUserChat] = useState([]);
    const [agentResponse, setAgentResponse] = useState("");
    
    const speech = useSpeech({
        text: agentResponse,
        pitch: 1,
        rate: 1,
        volume: 1,
        lang: "en-GB",
        voiceURI: "Google UK English Female",
        autoPlay: false,
        highlightText: false,
        showOnlyHighlightedText: false,
        highlightMode: "word"
    });

    const debouncedSetUserChat = useCallback(debounce((finalTranscript) => {
        if (finalTranscript.trim()) {
            setUserChat(prev => [...prev, { user: finalTranscript }]);
            sendToAgent(finalTranscript);
            resetTranscript(); // Clear transcript after sending
        }
    }, 1500), []);

    useEffect(() => {
        if (transcript) {
            debouncedSetUserChat(transcript);
        }
    }, [transcript, debouncedSetUserChat]);

    const startListening = () => {
        SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    };

    const sendToAgent = (message) => {
        setTimeout(() => {
            const hardcodedResponse = "I am a super agent, Currently offline. I cant response on your Query - " + message;
            setUserChat(prev => [...prev, { agent: hardcodedResponse }]);
            setAgentResponse(hardcodedResponse);
        }, 2000); // Simulating response delay
    };

    useEffect(() => {
        if (agentResponse) {
            speech.start();
        }
    }, [agentResponse]);

    if (!browserSupportsSpeechRecognition) {
        return <p>Your browser doesn't support speech recognition.</p>;
    }

    return (
        <div className="container">
            <h2>Speech to Chat</h2>
            <p>Speak and interact with an AI agent in real-time.</p>

            <div className="main-content" onClick={() => setTextToCopy(transcript)}>
                {userChat.map((chat, index) => (
                    <div key={index} className={chat.user ? "user-message" : "agent-message"}>
                        {chat.user ? `User: ${chat.user}` : `Agent: ${chat.agent}`}
                    </div>
                ))}
            </div>

            <div className="btn-style">
                <button onClick={setCopied}>{isCopied ? 'Copied!' : 'Copy to clipboard'}</button>
                <button onClick={startListening}>Start Listening</button>
                <button onClick={SpeechRecognition.stopListening}>Stop Listening</button>
            </div>
        </div>
    );
};

export default App;
