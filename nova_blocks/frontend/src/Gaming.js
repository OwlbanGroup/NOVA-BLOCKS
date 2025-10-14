import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gaming.css';

const Gaming = () => {
    const [playerHealth, setPlayerHealth] = useState(100);
    const [aiHealth, setAiHealth] = useState(100);
    const [gameStatus, setGameStatus] = useState('ready');
    const [round, setRound] = useState(1);
    const [score, setScore] = useState(0);
    const navigate = useNavigate();

    const handlePunch = () => {
        if (gameStatus !== 'playing') return;
        
        // Player attack
        const playerDamage = Math.floor(Math.random() * 15) + 5;
        setAiHealth(prev => Math.max(0, prev - playerDamage));
        
        // AI counter attack
        setTimeout(() => {
            const aiDamage = Math.floor(Math.random() * 10) + 5;
            setPlayerHealth(prev => Math.max(0, prev - aiDamage));
        }, 500);
    };

    useEffect(() => {
        if (aiHealth <= 0) {
            setGameStatus('won');
            setScore(prev => prev + 10);
        } else if (playerHealth <= 0) {
            setGameStatus('lost');
        }
    }, [playerHealth, aiHealth]);

    const startGame = () => {
        setPlayerHealth(100);
        setAiHealth(100);
        setGameStatus('playing');
        setRound(1);
    };

    const nextRound = () => {
        setPlayerHealth(100);
        setAiHealth(100);
        setGameStatus('playing');
        setRound(prev => prev + 1);
    };

    return (
        <div className="game-container">
            <h1>AI Boxing Challenge</h1>
            <div className="game-status">
                <p>Round: {round}</p>
                <p>Score: {score}</p>
                <p>Status: {gameStatus.toUpperCase()}</p>
            </div>
            
            <div className="health-bars">
                <div>
                    <h3>YOU: {playerHealth}%</h3>
                    <div className="health-bar player" style={{width: `${playerHealth}%`}}></div>
                </div>
                <div>
                    <h3>AI OPPONENT: {aiHealth}%</h3>
                    <div className="health-bar ai" style={{width: `${aiHealth}%`}}></div>
                </div>
            </div>

            {gameStatus === 'ready' && (
                <button className="game-btn" onClick={startGame}>Start Match</button>
            )}
            
            {gameStatus === 'playing' && (
                <button className="game-btn punch" onClick={handlePunch}>PUNCH!</button>
            )}
            
            {(gameStatus === 'won' || gameStatus === 'lost') && (
                <div className="result">
                    <h2>You {gameStatus.toUpperCase()}!</h2>
                    {gameStatus === 'won' && (
                        <button className="game-btn" onClick={nextRound}>Next Round</button>
                    )}
                    <button className="game-btn" onClick={startGame}>Play Again</button>
                    <button className="game-btn" onClick={() => navigate('/arena')}>
                        Try Arena Mode
                    </button>
                </div>
            )}
        </div>
    );
};

export default Gaming;
