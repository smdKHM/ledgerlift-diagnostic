<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LedgerLift Studio - Financial Health Check</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #0F1F3D 0%, #1a3a5c 50%, #0F1F3D 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        #root { width: 100%; max-width: 800px; }
        .chatbot-container {
            background: #fff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            display: flex;
            flex-direction: column;
            height: 90vh;
            max-height: 820px;
        }
        .chatbot-header {
            background: #0F1F3D;
            color: #fff;
            padding: 22px 25px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px solid #C9A84C;
        }
        .header-left { display: flex; align-items: center; gap: 14px; }
        .header-icon {
            width: 46px; height: 46px;
            background: #C9A84C;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 22px; font-weight: 700; color: #0F1F3D;
        }
        .header-text h1 { font-size: 1.25em; margin-bottom: 2px; letter-spacing: 0.3px; }
        .header-text p { font-size: 0.82em; opacity: 0.75; font-weight: 400; }
        .back-button {
            background: rgba(201,168,76,0.15);
            border: 1px solid rgba(201,168,76,0.4);
            color: #C9A84C;
            padding: 9px 18px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.85em;
            font-weight: 500;
            transition: all 0.2s;
            text-decoration: none;
        }
        .back-button:hover { background: rgba(201,168,76,0.25); }
        .chatbot-body {
            flex: 1;
            background: #f8f9fb;
            padding: 24px;
            overflow-y: auto;
        }
        .chatbot-body::-webkit-scrollbar { width: 6px; }
        .chatbot-body::-webkit-scrollbar-thumb { background: #C9A84C; border-radius: 3px; }
        .message { margin-bottom: 18px; display: flex; animation: fadeIn 0.3s ease-in; }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .message.bot { justify-content: flex-start; }
        .message.user { justify-content: flex-end; }
        .message-bubble {
            padding: 16px 20px;
            border-radius: 16px;
            max-width: 85%;
            font-size: 0.93em;
            line-height: 1.65;
        }
        .message.bot .message-bubble {
            background: #fff;
            color: #1a2a3a;
            border: 1px solid #e4e8ed;
            box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .message.user .message-bubble {
            background: #0F1F3D;
            color: #fff;
        }
        .pain-buttons { display: grid; gap: 10px; margin-top: 18px; }
        .pain-button {
            background: #fff;
            border: 2px solid #e4e8ed;
            border-radius: 12px;
            padding: 16px;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .pain-button:hover {
            border-color: #C9A84C;
            background: #fffcf5;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(201,168,76,0.12);
        }
        .pain-icon { font-size: 26px; min-width: 34px; text-align: center; }
        .pain-text strong { display: block; color: #1a2a3a; margin-bottom: 2px; font-size: 0.95em; }
        .pain-text small { color: #6b7a8d; font-size: 0.82em; line-height: 1.4; }
        .followup-buttons { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
        .followup-btn {
            background: #fff;
            border: 2px solid #0F1F3D;
            color: #0F1F3D;
            padding: 12px 16px;
            border-radius: 10px;
            font-size: 0.9em;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
            font-weight: 500;
        }
        .followup-btn:hover {
            background: #0F1F3D;
            color: #fff;
            transform: translateX(4px);
        }
        .cta-buttons { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
        .cta-btn {
            padding: 12px 20px;
            border-radius: 10px;
            font-size: 0.88em;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
        }
        .cta-btn.primary { background: #C9A84C; color: #0F1F3D; }
        .cta-btn.secondary { background: #fff; color: #0F1F3D; border: 2px solid #0F1F3D; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,0.15); }
        .email-capture {
            margin-top: 18px; padding: 18px;
            background: #fffcf5;
            border-radius: 12px;
            border: 2px solid #C9A84C;
        }
        .email-capture h3 { color: #1a2a3a; font-size: 0.95em; margin-bottom: 12px; }
        .email-capture-form { display: flex; gap: 10px; }
        .email-capture input {
            flex: 1; padding: 12px 14px;
            border: 2px solid #e4e8ed;
            border-radius: 8px; font-size: 0.9em; outline: none;
        }
        .email-capture input:focus { border-color: #C9A84C; }
        .email-capture button {
            padding: 12px 22px;
            background: #C9A84C; color: #0F1F3D;
            border: none; border-radius: 8px;
            font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .email-capture button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(201,168,76,0.3); }
        .email-capture button:disabled { opacity: 0.5; cursor: not-allowed; }
        .email-capture .success-msg { color: #2d8659; font-weight: 600; text-align: center; padding: 12px; }
        .restart-link {
            display: inline-block; margin-top: 14px;
            color: #C9A84C; font-weight: 500; font-size: 0.88em;
            cursor: pointer; text-decoration: underline;
        }
        .restart-link:hover { color: #0F1F3D; }
        .typing-indicator { display: flex; gap: 5px; padding: 4px 0; }
        .typing-dot {
            width: 7px; height: 7px;
            background: #C9A84C; border-radius: 50%;
            animation: typing 1.4s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-8px); }
        }
        .chatbot-input {
            background: #fff; padding: 18px 20px;
            border-top: 1px solid #e4e8ed;
            display: flex; gap: 10px;
        }
        .chatbot-input input {
            flex: 1; padding: 14px 18px;
            border: 2px solid #e4e8ed;
            border-radius: 25px; font-size: 0.93em; outline: none;
        }
        .chatbot-input input:focus { border-color: #C9A84C; }
        .chatbot-input button {
            padding: 14px 26px;
            background: #0F1F3D; color: #fff;
            border: none; border-radius: 25px;
            font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .chatbot-input button:hover:not(:disabled) {
            background: #1a3a5c;
            box-shadow: 0 4px 12px rgba(15,31,61,0.3);
        }
        .chatbot-input button:disabled { opacity: 0.4; cursor: not-allowed; }
        @media (max-width: 600px) {
            body { padding: 0; }
            .chatbot-container { height: 100vh; max-height: none; border-radius: 0; }
            .chatbot-header { padding: 18px; }
            .header-text h1 { font-size: 1.1em; }
            .message-bubble { max-width: 92%; }
            .email-capture-form { flex-direction: column; }
            .cta-buttons { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect, useRef } = React;

        // Kit form "Chatbot" — receives the email box only (Oct 26, 2026).
        // Replaced the Make webhook: its scenario was off, so emails went nowhere.
        // Pain point is stored in the Kit custom field "Chatbot pain point".
        const KIT_FORM_ID = '10098630';
        const KIT_SUBSCRIBE_URL = `https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`;

        // ─── PAIN POINT CONVERSATION DATA ───
        // Mapped from Reddit research (Perplexity Aug 2026)
        // Products: current verified line only

        const PAIN_POINTS = {
            receipts: {
                icon: '📑',
                title: 'My receipts and records are scattered everywhere',
                subtitle: 'Email, photos, Dropbox, wallet — no single system',
                empathy: "That's the most common thing I see in founder books. Receipts in email, photos on your phone, statements in a folder somewhere, and none of it connected to actual transactions. The problem isn't that you don't have proof — it's that you can't find it or connect it when you need it.",
                followup: "How are you tracking your finances right now?",
                options: [
                    {
                        label: "Spreadsheet, shoebox, or basically nothing",
                        response: "If you're starting from scratch or running on a spreadsheet, the first step isn't software — it's figuring out where you actually stand.\n\nThe free diagnostic takes about 2 minutes and scores your bookkeeping maturity. It tells you exactly what stage you're at and what the right next step is — no guessing, no sales pitch.",
                        ctas: [
                            { text: 'Take the Free Diagnostic', url: 'https://diagnostic.ledgerliftstudio.com', primary: true }
                        ],
                        level: 'Foundation'
                    },
                    {
                        label: "I have software but it's a disorganized mess",
                        response: "You've got the raw material — it's just not structured. What you need is a system where every transaction is linked to its evidence, every category maps to your actual tax filing, and anything unresolved is flagged instead of buried.\n\nLedgerDesk Solo ($197) is an Airtable-based financial system I built from real client data. You own it — it runs in your own Airtable account. Transactions, categories, evidence links, monthly close tracking, and a dashboard that shows you what's settled and what still needs your attention.",
                        ctas: [
                            { text: 'See LedgerDesk Solo — $197', url: 'https://blog.ledgerliftstudio.com/buy/solo', primary: true },
                            { text: 'View all products', url: 'https://blog.ledgerliftstudio.com/shop', primary: false }
                        ],
                        level: 'Systemized'
                    }
                ]
            },
            behind: {
                icon: '📅',
                title: "My books are behind and I need to catch up",
                subtitle: "Months of unreconciled records piling up",
                empathy: "This is more common than you think — and the worst thing you can do is wait until tax season to deal with it. The longer it sits, the harder it is to reconstruct what happened and the more expensive cleanup gets.",
                followup: "How far behind are you?",
                options: [
                    {
                        label: "A few months to most of this year",
                        response: "If you have your bank and card statements in digital form (CSV or spreadsheet exports), the Historical Summary Load is built for exactly this.\n\nI take the months you're behind, categorize every transaction using a standard list that maps to Schedule C, break it out month by month, and load it as your opening position — so when you start running your system going forward, your year-to-date numbers are already correct.\n\nFlat price: $297. Four conditions: complete months, digital exports, one business entity, everything delivered at once. Meet those four and that's the price, start to finish.",
                        ctas: [
                            { text: 'Start my catch-up — $297', url: 'https://blog.ledgerliftstudio.com/buy/hsl', primary: true }
                        ],
                        level: 'Catch-Up'
                    },
                    {
                        label: "I honestly don't know where to start",
                        response: "When it's been a while and you're not sure what you even have, the first step is figuring out where you stand — not jumping into software.\n\nThe free diagnostic is built for exactly this moment. Two minutes, and it scores your bookkeeping maturity — what stage you're at and what actually needs to happen next. Once you see the result, the right next step becomes obvious.",
                        ctas: [
                            { text: 'Take the Free Diagnostic', url: 'https://diagnostic.ledgerliftstudio.com', primary: true }
                        ],
                        level: 'Foundation'
                    }
                ]
            },
            categories: {
                icon: '🏷️',
                title: "I'm not sure my categories are right",
                subtitle: "Guessing at classifications, worried about mistakes",
                empathy: "This is one of the most expensive mistakes I see — not because a wrong category costs you money directly, but because uncertain categories mean you can't trust your P&L, your tax filing has risk in it, and you're making business decisions on numbers that might not be real.\n\nThe fix isn't guessing harder. It's having a standard category list that maps directly to how you'll file.",
                followup: "What's your current setup?",
                options: [
                    {
                        label: "Making it up as I go",
                        response: "You need to know where you stand before picking a system. The free diagnostic scores your bookkeeping maturity in about 2 minutes — it identifies whether your category problem is a framework issue or a software issue, and routes you to the right fix.\n\nNo guessing, no generic advice. Just a clear read on what stage you're at.",
                        ctas: [
                            { text: 'Take the Free Diagnostic', url: 'https://diagnostic.ledgerliftstudio.com', primary: true }
                        ],
                        level: 'Foundation'
                    },
                    {
                        label: "I use QuickBooks/Xero but I'm not confident",
                        response: "The software isn't the problem — it's that you don't have a locked category standard to check against. LedgerDesk Solo ($197) uses a standard category list locked against Schedule C. Every transaction gets a category, a status (settled, needs review, needs receipt), and an audit trail.\n\nYou can run it alongside QuickBooks as your financial command center — the system that makes sure your books are complete and explainable before you hand them off.",
                        ctas: [
                            { text: 'See LedgerDesk Solo — $197', url: 'https://blog.ledgerliftstudio.com/buy/solo', primary: true }
                        ],
                        level: 'Systemized'
                    }
                ]
            },
            system: {
                icon: '🔧',
                title: "I need a system but QuickBooks feels like overkill",
                subtitle: "Too much software, too complex, too expensive for where I am",
                empathy: "This comes up constantly. QuickBooks is accounting software — it's designed for accountants. What most founders actually need at the $0–$500K stage is something different: a financial command center that tracks what's happening, shows what it means, and holds up when your CPA asks questions.\n\nThat's what I build.",
                followup: "What's your approximate monthly transaction volume?",
                options: [
                    {
                        label: "Under 100 transactions/month",
                        response: "At that volume, you don't need a full accounting platform. LedgerDesk Solo ($197) runs on Airtable's free plan at that transaction level — no subscription needed. It's a 15-table financial system I built from real client data: transactions, categories, invoices, tax prep view, P&L trend, and a monthly close tracker.\n\nYou own it. It runs in your own Airtable account. I hand it over and you run your business on it. (If you grow past roughly 100 transactions a month, Airtable's own paid tier — about $20/mo — is worth adding; the system itself doesn't change.)",
                        ctas: [
                            { text: 'See LedgerDesk Solo — $197', url: 'https://blog.ledgerliftstudio.com/buy/solo', primary: true }
                        ],
                        level: 'Systemized'
                    },
                    {
                        label: "I'm not sure / I haven't been tracking",
                        response: "Before picking a system, you need to know what you're working with. The free diagnostic is the starting point — it scores your bookkeeping maturity and tells you what level of system you actually need.\n\nTwo minutes, no cost. No point buying software until you know the size of the problem.",
                        ctas: [
                            { text: 'Take the Free Diagnostic', url: 'https://diagnostic.ledgerliftstudio.com', primary: true }
                        ],
                        level: 'Foundation'
                    }
                ]
            },
            profitable: {
                icon: '💰',
                title: "I can't actually tell if I'm profitable",
                subtitle: "Checking the bank balance isn't a strategy",
                empathy: "If your monthly financial review is 'check the bank balance and hope,' you're not alone — but you are flying blind. Profit isn't what's in the account. It's what you can prove with organized records, proper categories, and a monthly close that you've actually reviewed.",
                followup: "What does your monthly review process look like?",
                options: [
                    {
                        label: "I don't have one",
                        response: "Start here. The free diagnostic takes about 2 minutes and tells you exactly where your books stand — what stage you're at and what the right next step is. It's the same assessment process I use before building any client system.\n\nOnce you can see the picture clearly, you'll know exactly what needs to happen next.",
                        ctas: [
                            { text: 'Take the Free Diagnostic', url: 'https://diagnostic.ledgerliftstudio.com', primary: true }
                        ],
                        level: 'Foundation'
                    },
                    {
                        label: "I look at reports but don't trust the numbers",
                        response: "Reports are only as good as the data feeding them. If your categories are inconsistent, transactions are uncoded, or you haven't reconciled in months, the P&L is fiction.\n\nLedgerDesk Solo ($197) fixes this at the source — every transaction gets a category, a status, and a review trail. The dashboard shows cash position, spend by category, uncoded transactions, and missing receipts. When you close a month, it stays closed.",
                        ctas: [
                            { text: 'See LedgerDesk Solo — $197', url: 'https://blog.ledgerliftstudio.com/buy/solo', primary: true },
                            { text: 'View all products', url: 'https://blog.ledgerliftstudio.com/shop', primary: false }
                        ],
                        level: 'Systemized'
                    }
                ]
            }
        };

        // ─── MAIN CHATBOT ───
        function Chatbot() {
            const [messages, setMessages] = useState([{
                type: 'bot',
                content: "I'm Renée — I build financial database systems for founders.\n\nBefore I can point you to the right thing, I need to know what's going on. Which of these sounds like where you are right now?",
                showPainPoints: true
            }]);
            const [inputValue, setInputValue] = useState('');
            const [isTyping, setIsTyping] = useState(false);
            const [emailCaptured, setEmailCaptured] = useState(false);
            const [showedEmailCapture, setShowedEmailCapture] = useState(false);
            const [conversationData, setConversationData] = useState({
                painPoint: null,
                followupAnswer: null,
                estimatedLevel: null,
                questionsAsked: [],
                ctasClicked: [],
                startTime: new Date().toISOString()
            });
            const messagesEndRef = useRef(null);

            useEffect(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, [messages]);

            // Only the email box is sent anywhere; clicks and choices stay in the browser.
            const sendEvent = async (data) => {
                if (data.type !== 'email_captured') return;
                const painPoint = [data.painPoint, data.followupAnswer].filter(Boolean).join(' | ') || 'none selected';
                const body = new URLSearchParams({
                    email_address: data.email,
                    'fields[chatbot_pain_point]': painPoint
                });
                try {
                    await fetch(KIT_SUBSCRIBE_URL, { method: 'POST', mode: 'no-cors', body });
                } catch (e) { console.error('Kit signup error:', e); }
            };

            const addMessage = (type, content, options = {}) => {
                setMessages(prev => [...prev, { type, content, ...options }]);
            };

            const handlePainPointClick = (key) => {
                const pp = PAIN_POINTS[key];
                addMessage('user', pp.title);

                setConversationData(prev => ({
                    ...prev,
                    painPoint: key,
                    questionsAsked: [...prev.questionsAsked, pp.title]
                }));

                sendEvent({
                    type: 'pain_point_selected',
                    painPoint: key,
                    painPointTitle: pp.title,
                    timestamp: new Date().toISOString()
                });

                setIsTyping(true);
                setTimeout(() => {
                    setIsTyping(false);
                    addMessage('bot', pp.empathy + '\n\n' + pp.followup, {
                        followups: pp.options,
                        painPointKey: key
                    });
                }, 900);
            };

            const handleFollowupClick = (option, painPointKey) => {
                addMessage('user', option.label);

                setConversationData(prev => ({
                    ...prev,
                    followupAnswer: option.label,
                    estimatedLevel: option.level,
                    questionsAsked: [...prev.questionsAsked, option.label]
                }));

                sendEvent({
                    type: 'followup_answered',
                    painPoint: painPointKey,
                    answer: option.label,
                    estimatedLevel: option.level,
                    timestamp: new Date().toISOString()
                });

                setIsTyping(true);
                setTimeout(() => {
                    setIsTyping(false);
                    addMessage('bot', option.response, {
                        ctas: option.ctas,
                        showRestart: true
                    });

                    // Show email capture after the product recommendation
                    if (!showedEmailCapture && !emailCaptured) {
                        setShowedEmailCapture(true);
                        setTimeout(() => {
                            addMessage('bot', "Want me to follow up with the specific next step for your situation?", {
                                showEmailCapture: true
                            });
                        }, 1800);
                    }
                }, 1100);
            };

            const handleCTAClick = (cta) => {
                setConversationData(prev => ({
                    ...prev,
                    ctasClicked: [...prev.ctasClicked, cta.text]
                }));
                sendEvent({
                    type: 'cta_clicked',
                    ctaText: cta.text,
                    ctaUrl: cta.url,
                    painPoint: conversationData.painPoint,
                    estimatedLevel: conversationData.estimatedLevel,
                    timestamp: new Date().toISOString()
                });
                window.open(cta.url, '_blank');
            };

            const handleEmailSubmit = async (email) => {
                setEmailCaptured(true);
                await sendEvent({
                    type: 'email_captured',
                    email,
                    painPoint: conversationData.painPoint,
                    followupAnswer: conversationData.followupAnswer,
                    estimatedLevel: conversationData.estimatedLevel,
                    questionsAsked: conversationData.questionsAsked,
                    ctasClicked: conversationData.ctasClicked,
                    timestamp: new Date().toISOString()
                });
                addMessage('bot', "Got it — I'll follow up personally. In the meantime, feel free to explore anything else here, or head to the store to see what's available.", {
                    showPainPoints: true
                });
            };

            const handleRestart = () => {
                addMessage('bot', "What else is going on with your books?", {
                    showPainPoints: true
                });
            };

            const handleUserInput = () => {
                if (!inputValue.trim()) return;
                const q = inputValue.trim();
                addMessage('user', q);
                setInputValue('');

                setConversationData(prev => ({
                    ...prev,
                    questionsAsked: [...prev.questionsAsked, q]
                }));

                sendEvent({
                    type: 'free_text',
                    question: q,
                    painPoint: conversationData.painPoint,
                    timestamp: new Date().toISOString()
                });

                setIsTyping(true);
                setTimeout(() => {
                    setIsTyping(false);
                    // Simple keyword routing
                    const lower = q.toLowerCase();
                    if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
                        addMessage('bot', "Here's the current product line — every price is fixed, no hidden fees:\n\nFree Diagnostic — 2-minute bookkeeping maturity assessment (start here)\nLedgerDesk Access — Microsoft Access version, coming soon (waitlist open)\nLedgerDesk Solo — $197 (Airtable system — the main product)\nHistorical Summary Load — $297 (catch up on behind books)\n\nEverything is a one-time purchase. LedgerDesk Solo runs on Airtable's free plan for most users — Airtable's paid tier (~$20/mo) only comes into play if you're past roughly 100 transactions a month.\n\nNot sure where to start? The free diagnostic figures that out for you.", {
                            ctas: [
                                { text: 'Take the Free Diagnostic', url: 'https://diagnostic.ledgerliftstudio.com', primary: true },
                                { text: 'View all products', url: 'https://blog.ledgerliftstudio.com/shop', primary: false }
                            ],
                            showRestart: true
                        });
                    } else if (lower.includes('ledgerdesk') || lower.includes('airtable') || lower.includes('solo')) {
                        addMessage('bot', "LedgerDesk Solo ($197) is the main system. It's a 15-table Airtable base — transactions, categories, invoices, tax prep, P&L trend, monthly close tracker. You copy it into your own Airtable account and own it outright.\n\nLedgerDesk Access is the same concept built in Microsoft Access — for founders who want it on their desktop, not in the cloud. A new version is in the works; join the waitlist and you'll hear when it's ready.", {
                            ctas: [
                                { text: 'See LedgerDesk Solo — $197', url: 'https://blog.ledgerliftstudio.com/buy/solo', primary: true },
                                { text: 'Join the LedgerDesk Access waitlist', url: 'https://blog.ledgerliftstudio.com/buy/access', primary: false }
                            ],
                            showRestart: true
                        });
                    } else if (lower.includes('start') || lower.includes('begin') || lower.includes('diagnostic') || lower.includes('where do i')) {
                        addMessage('bot', "The best starting point is the free diagnostic — it takes about 2 minutes and scores your bookkeeping maturity. It tells you exactly what stage you're at and what the right next step is.\n\nIt's the same assessment process I use before building any system. Once you see your score, the right next step becomes obvious.", {
                            ctas: [
                                { text: 'Take the Free Diagnostic', url: 'https://diagnostic.ledgerliftstudio.com', primary: true }
                            ],
                            showRestart: true
                        });
                    } else if (lower.includes('catch up') || lower.includes('behind') || lower.includes('cleanup') || lower.includes('summary load')) {
                        addMessage('bot', "The Historical Summary Load ($297) is the catch-up service. I take your bank/card exports, categorize everything against Schedule C, break it out month by month, and load it as your opening position.\n\nFlat price, four conditions: complete months, digital exports (CSV/spreadsheet), one business entity, everything delivered at once.", {
                            ctas: [
                                { text: 'Start my catch-up — $297', url: 'https://blog.ledgerliftstudio.com/buy/hsl', primary: true }
                            ],
                            showRestart: true
                        });
                    } else {
                        addMessage('bot', "I don't have a pre-built answer for that one — but I'd like to help.\n\nEmail me directly at renee@ledgerliftstudio.com and I'll get back to you within 24 hours. Or pick one of the situations below and I can walk you through it.", {
                            showPainPoints: true
                        });
                    }
                }, 1000);
            };

            return (
                <div className="chatbot-container">
                    <div className="chatbot-header">
                        <div className="header-left">
                            <div className="header-icon">LL</div>
                            <div className="header-text">
                                <h1>LedgerLift Studio</h1>
                                <p>Real numbers. Real systems. Built from real books.</p>
                            </div>
                        </div>
                        <a className="back-button" href="https://blog.ledgerliftstudio.com/shop" target="_blank" rel="noopener">
                            View Store
                        </a>
                    </div>

                    <div className="chatbot-body">
                        {messages.map((msg, i) => (
                            <div key={i} className={`message ${msg.type}`}>
                                <div className="message-bubble">
                                    {msg.content.split('\n').map((line, j) => (
                                        <React.Fragment key={j}>
                                            {line.startsWith('**') && line.endsWith('**')
                                                ? <strong>{line.replace(/\*\*/g, '')}</strong>
                                                : line.includes('**')
                                                    ? line.split(/(\*\*.*?\*\*)/).map((part, k) =>
                                                        part.startsWith('**') ? <strong key={k}>{part.replace(/\*\*/g, '')}</strong> : part
                                                      )
                                                    : line
                                            }
                                            {j < msg.content.split('\n').length - 1 && <br />}
                                        </React.Fragment>
                                    ))}

                                    {msg.showPainPoints && (
                                        <div className="pain-buttons">
                                            {Object.entries(PAIN_POINTS).map(([key, pp]) => (
                                                <div key={key} className="pain-button" onClick={() => handlePainPointClick(key)}>
                                                    <span className="pain-icon">{pp.icon}</span>
                                                    <div className="pain-text">
                                                        <strong>{pp.title}</strong>
                                                        <small>{pp.subtitle}</small>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {msg.followups && (
                                        <div className="followup-buttons">
                                            {msg.followups.map((opt, j) => (
                                                <button key={j} className="followup-btn"
                                                    onClick={() => handleFollowupClick(opt, msg.painPointKey)}>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {msg.ctas && msg.ctas.length > 0 && (
                                        <div className="cta-buttons">
                                            {msg.ctas.map((cta, j) => (
                                                <button key={j}
                                                    className={`cta-btn ${cta.primary ? 'primary' : 'secondary'}`}
                                                    onClick={() => handleCTAClick(cta)}>
                                                    {cta.text}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {msg.showEmailCapture && !emailCaptured && (
                                        <EmailCapture onSubmit={handleEmailSubmit} />
                                    )}

                                    {msg.showRestart && (
                                        <span className="restart-link" onClick={handleRestart}>
                                            ← Explore another topic
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="message bot">
                                <div className="message-bubble">
                                    <div className="typing-indicator">
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input">
                        <input type="text" placeholder="Or type your question..."
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleUserInput()} />
                        <button onClick={handleUserInput} disabled={!inputValue.trim()}>Send</button>
                    </div>
                </div>
            );
        }

        // ─── EMAIL CAPTURE ───
        function EmailCapture({ onSubmit }) {
            const [email, setEmail] = useState('');
            const [done, setDone] = useState(false);
            const submit = (e) => {
                e.preventDefault();
                if (email && email.includes('@') && email.includes('.')) {
                    setDone(true);
                    onSubmit(email);
                }
            };
            if (done) return (
                <div className="email-capture">
                    <div className="success-msg">Got it — I'll be in touch.</div>
                </div>
            );
            return (
                <div className="email-capture">
                    <h3>Drop your email and I'll follow up with your next step:</h3>
                    <form className="email-capture-form" onSubmit={submit}>
                        <input type="email" placeholder="you@yourbusiness.com"
                            value={email} onChange={e => setEmail(e.target.value)} required />
                        <button type="submit" disabled={!email.includes('@')}>Send</button>
                    </form>
                </div>
            );
        }

        ReactDOM.createRoot(document.getElementById('root')).render(<Chatbot />);
    </script>
</body>
</html>
