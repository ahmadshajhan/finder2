'use client';

import React, { useState } from 'react';
import axios from 'axios';
import '@/app/globals.css';

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
// ലവ് കാൽക്കുലേഷൻ ലോജിക് (ഫൺ അൽഗോരിതം)
// ---------------------------
const calculateLove = (name1: string, name2: string): number => {
    // പേരുകൾ ചെറുതാക്കി കോമ്പിനേഷനായി എടുക്കുന്നു
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
    if (percentage < 30) percentage += 15; // A little boost for fun!

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
            setError('എല്ലാ വിവരങ്ങളും ശരിയായി നൽകുക.');
            setLoading(false);
            return;
        }

        // 1. ലവ് പെർസന്റേജ് കാൽക്കുലേറ്റ് ചെയ്യുന്നു
        const calculatedPercentage: number = calculateLove(yourName, crushName);
        
        // 2. റിസൾട്ട് കാണിക്കുന്നു
        setResult(calculatedPercentage);

        // 3. ഡാറ്റാബേസിലേക്ക് ഡാറ്റ സേവ് ചെയ്യുന്നു (API call)
        try {
            const dataToSave: LoveResult = {
                yourName,
                yourAge: parseInt(yourAge),
                crushName,
                calculatedPercentage,
            };

            // API കോൾ
            await axios.post('/api/calculate', dataToSave);
            console.log('Data saved successfully to MongoDB!');

        } catch (err: any) {
            console.error('API request failed:', err.response?.data?.errorDetail || err.message);
            // 500 എറർ വന്നാൽ പോലും റിസൾട്ട് കാണിക്കണം
            setError(`ഡാറ്റാബേസിലേക്ക് സേവ് ചെയ്യുന്നതിൽ പിഴവ്. കാരണം: ${err.response?.data?.errorDetail || 'കണക്ഷൻ എറർ'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="main-container">
            <h1 className="title">💖 ലവ് കാൽക്കുലേറ്റർ 💘</h1>
            
            <form onSubmit={handleSubmit} className="form-card">
                <div className="input-group">
                    <label>നിങ്ങളുടെ പേര്:</label>
                    <input type="text" value={yourName} onChange={(e) => setYourName(e.target.value)} required />
                </div>
                <div className="input-group">
                    <label>നിങ്ങളുടെ വയസ്സ്:</label>
                    <input type="number" value={yourAge} onChange={(e) => setYourAge(e.target.value)} min="16" required />
                </div>
                <div className="input-group">
                    <label>ക്രഷിന്റെ പേര്:</label>
                    <input type="text" value={crushName} onChange={(e) => setCrushName(e.target.value)} required />
                </div>

                <button type="submit" disabled={loading} className="calculate-button">
                    {loading ? 'കാൽക്കുലേറ്റിംഗ്...' : '✨ ലവ് കാൽക്കുലേറ്റ് ചെയ്യുക ✨'}
                </button>
            </form>

            {error && <p className="error-message">🚨 {error}</p>}

            {result !== null && (
                <div className="result-box">
                    <h2>💞 മാച്ച് റിസൾട്ട് 💞</h2>
                    <div className="percentage-circle">
                        <span className="percentage-number">{result}%</span>
                    </div>
                    <p className="message">
                        {yourName} ഉം {crushName} ഉം തമ്മിലുള്ള ലവ് മാച്ച് **{result}%** ആണ്!
                    </p>
                    <p className="note">*(നിങ്ങളുടെ വിവരങ്ങൾ ഡാറ്റാബേസിൽ സ്റ്റോർ ചെയ്യാൻ ശ്രമിച്ചു.)</p>
                </div>
            )}
        </main>
    );
}