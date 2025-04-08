import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gaming.css';

const Arena = () => {
    const [playerHealth, setPlayerHealth] = useState(100);
    const [opponentHealth, setOpponentHealth] = useState(100);
    const [gameStatus, setGameStatus] = useState('waiting');
    const [round, setRound] = useState(1);
    const [timer, setTimer] = useState(3);
    const [opponentName, setOpponentName] = useState('');
    const navigate = useNavigate();

    // Simulate finding opponent
    useEffect(() => {
        if (gameStatus === 'waiting') {
            const names = ['ShadowBoxer', 'IronFist', 'TheDestroyer', 'KnockoutKing'];
            setOpponentName(names[Math.floor(Math.random() * names.length)]);
            
            const timeout = setTimeout(() => {
                setGameStatus('ready');
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [gameStatus]);

    // Countdown timer
    useEffect(() => {
        if (gameStatus === 'ready' && timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else if (timer === 0) {
            setGameStatus('playing');
        }
    }, [gameStatus, timer]);

    const handlePunch = () => {
        if (gameStatus !== 'playing') return;
        
        // Player attack
        const playerDamage = Math.floor(Math.random() * 20) + 5;
        setOpponentHealth(prev => Math.max(0, prev - playerDamage));
        
        // Opponent counter attack
        setTimeout(() => {
            const opponentDamage = Math.floor(Math.random() * 15) + 5;
            setPlayerHealth(prev => Math.max(0, prev - opponentDamage));
        }, 500);
    };

    useEffect(() => {
        if (opponentHealth <= 0) {
            setGameStatus('won');
        } else if (playerHealth <= 0) {
            setGameStatus('lost');
        }
    }, [playerHealth, opponentHealth]);

    const startMatch = () => {
        setPlayerHealth(100);
        setOpponentHealth(100);
        setGameStatus('ready');
        setTimer(3);
        setRound(prev => prev + 1);
    };

    return (
        <div className="game-container">
            <h1>Boxing Arena</h1>
            <p>Competitive Multiplayer Mode</p>
            
            {gameStatus === 'waiting' && (
                <div className="waiting">
                    <h2>Finding Opponent...</h2>
                    <div className="loader"></div>
                </div>
            )}
            
            {gameStatus === 'ready' && (
                <div className="countdown">
                    <h2>Match Starts In:</h2>
                    <h1>{timer}</h1>
                    <p>Opponent: {opponentName}</p>
                </div>
            )}

            {(gameStatus === 'playing' || gameStatus === 'won' || gameStatus === 'lost') && (
                <>
                    <div className="game-status">
                        <p>Round: {round}</p>
                        <p>Opponent: {opponentName}</p>
                        <p>Status: {gameStatus.toUpperCase()}</p>
                    </div>
                    
                    <div className="health-bars">
                        <div>
                            <h3>YOU: {playerHealth}%</h3>
                            <div className="health-bar player" style={{width: `${playerHealth}%`}}></div>
                        </div>
                        <div>
                            <h3>{opponentName}: {opponentHealth}%</h3>
                            <div className="health-bar ai" style={{width: `${opponentHealth}%`}}></div>
                        </div>
                    </div>
                </>
            )}

            {gameStatus === 'playing' && (
                <button className="game-btn punch" onClick={handlePunch}>PUNCH!</button>
            )}
            
            {(gameStatus === 'won' || gameStatus === 'lost') && (
                <div className="result">
                    <h2>You {gameStatus.toUpperCase()}!</h2>
                    <button className="game-btn" onClick={startMatch}>Rematch</button>
                    <button className="game-btn" onClick={() => navigate('/gaming')}>
                        Back to Training
                    </button>
                </div>
            )}
        </div>
    );
};

export default Arena;
