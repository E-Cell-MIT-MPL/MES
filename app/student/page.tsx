'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface Profile {
    name: string;
    regNo: string;
    email: string;
    department: string;
    year: string;
}

const initialConclaves = [
    {
        id: 1,
        title: 'FinTech Panel – Coining the Future',
        desc: 'A focused panel on transition from traditional finance to digital-first systems.',
        date: '2026-02-12',
        displayDate: 'Thu Feb 12 2026',
        time: '17:30',
        venue: 'MV Seminar Hall',
        campus: 'MIT'
    },
    {
        id: 2,
        title: 'Built By Her – Stories of Vision, Leadership and Enterprise',
        desc: 'Panel discussion on women entrepreneurship, leadership journeys and strategies.',
        date: '2026-02-13',
        displayDate: 'Fri Feb 13 2026',
        time: '18:30',
        venue: 'Library Auditorium',
        campus: 'MIT'
    },
    {
        id: 3,
        title: 'MindVerse 2026',
        desc: 'AI, MR, society and future human–technology interaction conclave.',
        date: '2026-02-14',
        displayDate: 'Sat Feb 14 2026',
        time: '10:00',
        venue: 'MSCE Campus',
        campus: 'MSCE'
    }
];

export default function StudentDashboard() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [hasTicket, setHasTicket] = useState(false);

    useEffect(() => {
        fetch('/api/student/me')
            .then((r) => r.json())
            .then(setProfile);

        setHasTicket(localStorage.getItem('hasTicket') === 'true');
    }, []);

    useEffect(() => {
        if (!profile) return;

        const payload = JSON.stringify({
            student: profile.name,
            regNo: profile.regNo,
            event: 'MES Conclave Pass'
        });

        QRCode.toDataURL(payload, { width: 240 }).then(setQrUrl);
    }, [profile]);

    const buyTicket = () => {
        localStorage.setItem('hasTicket', 'true');
        setHasTicket(true);
        window.location.href = 'https://payment.example.com';
    };

    if (!profile) {
        return <div className="p-10 text-center text-slate-300">Loading dashboard…</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#05070c] via-[#070b16] to-black text-slate-200 px-4 py-6 md:px-10">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-2xl font-bold tracking-wide">Student Dashboard</h1>
                    <button
                        onClick={buyTicket}
                        className="px-6 py-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold shadow-lg hover:scale-105 transition"
                    >
                        Buy Ticket
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
                    {/* Profile & QR */}
                    <div className="relative rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl shadow-2xl">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center text-4xl font-bold text-black shadow-xl">
                                {profile.name[0]}
                            </div>

                            <h2 className="mt-4 text-lg font-semibold">{profile.name}</h2>
                            <p className="text-sm opacity-70">{profile.regNo}</p>

                            <div className="mt-6 relative group">
                                {qrUrl && (
                                    <div className="relative">
                                        <img
                                            src={qrUrl}
                                            alt="QR"
                                            className={`w-44 h-44 rounded-xl border border-white/20 shadow-lg transition duration-500 ${hasTicket ? 'blur-0' : 'blur-md'
                                                }`}
                                        />

                                        {!hasTicket && (
                                            <>
                                                <div className="absolute inset-0 bg-black/40 rounded-xl" />
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition text-xs bg-black px-3 py-1 rounded-full border border-white/20 shadow">
                                                    Buy pass first!
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                <p className="mt-2 text-xs opacity-60 text-center">
                                    {hasTicket ? 'Entry QR' : 'Locked'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Conclaves Timeline</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {initialConclaves.map((e) => (
                                <div
                                    key={e.id}
                                    className="group relative rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 p-4 hover:border-cyan-400/50 hover:shadow-cyan-500/20 hover:shadow-xl transition"
                                >
                                    <p className="text-sm text-cyan-300">{e.displayDate}</p>
                                    <h3 className="font-semibold mt-1 group-hover:text-cyan-300 transition">{e.title}</h3>
                                    <p className="text-xs opacity-60 mt-1">{e.campus}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
