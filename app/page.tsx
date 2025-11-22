'use client';

import React, { useState } from 'react';
import axios from 'axios';
import '@/app/globals.css'; // Will be updated for dark/pop theme

// ---------------------------
// TYPESCRIPT INTERFACE
// ---------------------------
interface LoveResult {
    yourName: string;
    yourAge: number;
    crushName: string;
    calculatedPercentage: number;
}

// ---------------------------
// LOVE CALCULATION LOGIC (The Fun Algorithm)
// ---------------------------
const calculateLove = (name1: string, name2: string): number => {
    const combinedNames = (name1.toLowerCase() + name2.toLowerCase()).replace(/\s/g, '');
    const counts: { [key: string]: number } = {};
    for (const char of combinedNames) {
        counts[char] = (counts[char] || 0) + 1;
    }

    let numbers = Object.values(counts);

    // Iterative summation and modulus
    while (numbers.length > 2) {
        const newNumbers: number[] = [];
        for (let i = 0; i < Math.ceil(numbers.length / 2); i++) {
            const sum = numbers[i] + (numbers[numbers.length - 1 - i] || 0);
            newNumbers.push(sum % 10);
            if (numbers.length - 1 - i === i) break;
        }
        numbers = newNumbers;
    }

    let percentage = parseInt(numbers.join(''));
    
    // Normalization and fun adjustments
    if (percentage > 100) percentage = percentage % 100;
    if (percentage < 10) percentage = percentage * 10;
    if (percentage < 30) percentage += 15;

    return Math.min(100, percentage);
};

// ---------------------------
// MAIN COMPONENT
// ---------------------------
export default function LoveCalculator() {
    const [yourName, setYourName] = useState<string>('');
    const [yourAge, setYourAge] = useState<string>('');
    const [crushName, setCrushName] = useState<string>('');
    const [result, setResult] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        if (!yourName || !yourAge || !crushName || isNaN(parseInt(yourAge))) {
            setError('Please provide valid details for all fields.');
            setLoading(false);
            return;
        }

        // 1. Calculate Love Percentage
        const calculatedPercentage: number = calculateLove(yourName, crushName);
        
        // 2. Display Result
        setResult(calculatedPercentage);

        // 3. Attempt to save data to database (API call)
        try {
            const dataToSave: LoveResult = {
                yourName,
                yourAge: parseInt(yourAge),
                crushName,
                calculatedPercentage,
            };

            await axios.post('/api/calculate', dataToSave);
            console.log('Data saved successfully to MongoDB!');

        } catch (err: any) {
            console.error('API request failed:', err.response?.data?.errorDetail || err.message);
            // Show result even if DB fails
            setError(`DB Save Error: ${err.response?.data?.errorDetail || 'Connection Failed'}. Showing result.`);
        } finally {
            setLoading(false);
        }
    };

    // Determine Emojis and Message based on score
    const getResultContent = (score: number) => {
        if (score >= 80) {
            return {
                emoji: '💖✨',
                message: 'A perfect cosmic match! Your destinies are intertwined.',
                theme: 'high',
                giftText: 'Download your exclusive **"Soulmate Success Guide"**!',
            };
        }
        if (score >= 50) {
            return {
                emoji: '💕😊',
                message: 'A great connection with high potential. Keep the spark alive!',
                theme: 'medium',
                giftText: 'Download your **"Relationship Booster PDF"** now!',
            };
        }
        return {
            emoji: '💔😢',
            message: "Hmm... maybe you're better off as friends. Don't be sad, there's always someone new!",
            theme: 'low',
            giftText: 'Download your **"Moving On & Glow-Up Guide"**!',
        };
    };

    return (
        <main className="main-container">
            <h1 className="title">💘 Neo-Love Calculator 💖</h1>
            <p className="subtitle">Discover your destiny in the digital age.</p>
            
            <form onSubmit={handleSubmit} className="form-card">
                <div className="input-group">
                    <label>Your Name:</label>
                    <input type="text" value={yourName} onChange={(e) => setYourName(e.target.value)} required placeholder="Enter your name" />
                </div>
                <div className="input-group">
                    <label>Your Age:</label>
                    <input type="number" value={yourAge} onChange={(e) => setYourAge(e.target.value)} min="16" required placeholder="Age must be 16+" />
                </div>
                <div className="input-group">
                    <label>Crush's Name:</label>
                    <input type="text" value={crushName} onChange={(e) => setCrushName(e.target.value)} required placeholder="Enter crush's name" />
                </div>

                <button type="submit" disabled={loading} className="calculate-button">
                    {loading ? 'Calculating Destiny...' : '✨ Calculate Love Score ✨'}
                </button>
            </form>

            {error && <p className="error-message">🚨 {error}</p>}

            {result !== null && (
                <div className={`result-box ${getResultContent(result).theme}`}>
                    <h2>{getResultContent(result).emoji} Match Result {getResultContent(result).emoji}</h2>
                    <div className="percentage-circle">
                        <span className="percentage-number">{result}%</span>
                    </div>
                    <p className="message">
                        **{yourName}** and **{crushName}** have a **{result}%** love match!
                        <br /><span className="score-message">{getResultContent(result).message}</span>
                    </p>

                    <div className="gift-section">
                        <h3>🎁 Exclusive Gift for You</h3>
                        <p>{getResultContent(result).giftText}</p>
                        <a 
                            href="https://example.com/gift-pdf-link" // Replace with your actual PDF link
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="gift-button"
                        >
                            Download PDF Now!
                        </a>
                    </div>
                    <p className="note">*(Ai MAN)</p>
                </div>
            )}
        </main>
    );
}