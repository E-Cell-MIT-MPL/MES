'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import Script from 'next/script';
import apiClient from '../lib/api-client';
import { useAuth } from '../lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Ticket as TicketIcon, Calendar, CheckCircle2, Clock, MapPin, ArrowLeft, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';

const ColorBends = dynamic(() => import('@/components/ColorBends'), { ssr: false });

// --- SUCCESS OVERLAY COMPONENT ---
const SuccessOverlay = ({ onClose }: { onClose: () => void }) => (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="relative max-w-sm w-full bg-[#111] border border-emerald-500/30 rounded-[32px] p-8 text-center shadow-[0_0_50px_rgba(16,185,129,0.1)]"
        >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/20 rounded-full blur-[60px]" />
            <div className="relative z-10">
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                    <CheckCircle2 size={40} className="text-white" />
                </motion.div>
                <h2 className="text-3xl font-serif-display italic font-bold text-white mb-2">Ticket Secured!</h2>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                    Your transaction was successful. The digital pass has been added to your dashboard.
                </p>
                <button 
                    onClick={onClose}
                    className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] transition-transform active:scale-95"
                >
                    View My Pass
                </button>
            </div>
        </motion.div>
    </motion.div>
);

interface Ticket {
    _id: string;
    eventName: string;
    paymentStatus: string;
    isUsed: boolean;
    qrData?: string;
}

const CONCLAVES = [
    { id: 'fintech', title: 'FinTech Panel', displayDate: 'Feb 12', venue: 'MV Hall', time: '10:00 AM' },
    { id: 'built-her', title: 'Built By Her', displayDate: 'Feb 13', venue: 'Lib Aud', time: '2:00 PM' },
    { id: 'mindverse', title: 'MindVerse 2026', displayDate: 'Feb 14', venue: 'MSCE', time: '11:00 AM' }
];

const TARGET_EVENT_NAME = "MES Conclave 2026"; 

const calculateTimeLeft = () => {
    const eventDate = new Date('2026-02-12T10:00:00'); 
    const now = new Date();
    const difference = eventDate.getTime() - now.getTime();

    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
    };
};

export default function StudentDashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    
    const fetchDashboardData = useCallback(async () => {
        try {
            const res = await apiClient.get('/tickets/my-tickets');
            const ticketData = res.data.success ? res.data.data : res.data;
            setTickets(Array.isArray(ticketData) ? ticketData : []);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const status = searchParams.get('status');
        if (status === 'success') {
            setShowSuccess(true);
            fetchDashboardData();
            router.replace('/student');
        } else if (status === 'failed') {
            alert("❌ Payment Failed. Please try again.");
            router.replace('/student');
        }
    }, [searchParams, fetchDashboardData, router]);

    useEffect(() => {
        if (!authLoading) {
            if (user) {
                fetchDashboardData();
            } else {
                setLoading(false);
                router.push('/login');
            }
        }
    }, [user, authLoading, fetchDashboardData, router]);

    const activeTicket = tickets.find(t => 
        t.eventName === TARGET_EVENT_NAME && 
        (t.paymentStatus === 'SUCCESS' || t.paymentStatus === 'PAID')
    );
    const hasPaidTicket = !!activeTicket;

    useEffect(() => {
        if (activeTicket && user) {
            if (activeTicket.qrData && activeTicket.qrData !== "VALIDATED") {
                QRCode.toDataURL(activeTicket.qrData, { 
                    width: 300, 
                    margin: 2,
                    color: { dark: '#FFFFFF', light: '#00000000' }
                }).then(setQrUrl);
            } 
            else {
                const payload = JSON.stringify({
                    username: user.name,
                    regNo: user.regNumber,
                    ticketId: activeTicket._id,
                    timestamp: new Date().toISOString()
                });

                QRCode.toDataURL(payload, { 
                    width: 300, 
                    margin: 2,
                    color: { dark: '#FFFFFF', light: '#00000000' }
                }).then(setQrUrl);
            }
        } else {
            setQrUrl(null);
        }
    }, [activeTicket, user]);

    const openAtomPay = (token: string, merchId: string) => {
        const options = {
            atomTokenId: token,
            merchId: merchId,
            custEmail: user?.personalEmail || "test@example.com",
            custMobile: user?.phone || "9999999999",
            returnUrl: `http://localhost:8080/payment/callback`,
        };

        try {
            // @ts-ignore
            if (typeof AtomPaynetz === 'undefined') {
                alert("Payment Gateway is still loading. Please try again.");
                return;
            }
            // @ts-ignore
            const atom = new AtomPaynetz(options, 'uat'); 
        } catch (error) {
            console.error("Atom SDK Error:", error);
        }
    };

    const handleBuyTicket = async () => {
        setPaymentLoading(true);
        try {
            const res = await apiClient.post('/payment/initiate', {
                eventName: TARGET_EVENT_NAME,
                amount: 1, 
            });

            const responseData = res.data.data || res.data;
            if (responseData.atomTokenId) {
                openAtomPay(responseData.atomTokenId, responseData.merchId);
            }
        } catch (error: any) {
            alert(`Payment Error: ${error.message}`);
        } finally {
            setPaymentLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex items-center justify-center min-h-screen w-full bg-[#050505] font-sans p-2 md:p-4 selection:bg-purple-500/30 text-white">
            
            <Script 
                src={process.env.NEXT_PUBLIC_ATOM_CDN_URL} 
                strategy="lazyOnload" 
            />

            <AnimatePresence>
                {showSuccess && <SuccessOverlay onClose={() => setShowSuccess(false)} />}
            </AnimatePresence>

            <div className="relative w-[96vw] max-w-[1600px] h-[92vh] bg-[#0a0a0a] rounded-[30px] overflow-hidden flex shadow-2xl border border-white/5">
                
                {/* --- LEFT SIDE: VISUALS + QR --- */}
                <div className="hidden lg:block w-[35%] h-full relative overflow-hidden bg-black border-r border-white/5">
                    <Link 
                        href="/"
                        className="absolute top-8 left-8 z-30 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white transition-all duration-300 group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Home
                    </Link>

                    <div className="absolute inset-0 opacity-80">
                        <ColorBends colors={['#7e22ce', '#3b82f6', '#000000']} speed={0.15} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="w-full max-w-sm"
                        >
                            <div className="relative overflow-hidden rounded-[24px] bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl p-1">
                                <div className="relative rounded-[20px] bg-black/40 p-8 flex flex-col items-center text-center overflow-hidden">
                                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-purple-500/30 to-blue-500/30 rounded-full blur-[60px] transition-all duration-700 ${hasPaidTicket ? 'opacity-100' : 'opacity-0'}`} />

                                    <div className="relative z-10 mb-6">
                                        <div className={`w-56 h-56 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center p-3 transition-all duration-500 ${!hasPaidTicket ? 'shadow-none' : 'shadow-[0_0_40px_rgba(124,58,237,0.15)]'}`}>
                                            {qrUrl ? (
                                                <img src={qrUrl} alt="Ticket QR" className="w-full h-full object-contain rounded-lg" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-4 w-full h-full justify-center">
                                                    <div className="p-4 rounded-full bg-white/5 border border-white/10">
                                                        <TicketIcon size={24} className="text-gray-400" />
                                                    </div>
                                                    <button 
                                                        onClick={handleBuyTicket}
                                                        disabled={paymentLoading}
                                                        className="group flex items-center gap-2 px-5 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
                                                    >
                                                        {paymentLoading ? <Loader2 size={12} className="animate-spin"/> : <Plus size={12} strokeWidth={4} />}
                                                        {paymentLoading ? 'Processing...' : 'Get Pass'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-xl shadow-lg flex items-center gap-2 whitespace-nowrap ${
                                                hasPaidTicket 
                                                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                                                : 'bg-white/10 border-white/20 text-gray-400'
                                            }`}>
                                                {hasPaidTicket ? <CheckCircle2 size={12} /> : <div className="w-2 h-2 rounded-full bg-gray-500" />}
                                                {hasPaidTicket ? 'Access Granted' : 'No Active Pass'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="relative z-10 w-full pt-4 border-t border-white/10">
                                        <h3 className="text-2xl font-bold text-white mb-1">{user.name}</h3>
                                        <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mb-4">{user.regNumber || 'GUEST USER'}</p>
                                        
                                        {hasPaidTicket && (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">ID</p>
                                                <p className="text-xs font-mono text-purple-300">#{activeTicket?._id.slice(-6).toUpperCase()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* --- RIGHT SIDE: DASHBOARD --- */}
                <div className="w-full lg:w-[65%] h-full bg-[#0E0E0E] flex flex-col relative overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
                    <div className="p-8 md:p-12 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-gray-400">
                                    Dashboard
                                </span>
                                {user.userType === 'MIT' && (
                                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                        MIT Student
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif-display italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500">
                                Welcome, {user.name.split(' ')[0]}
                            </h1>
                        </div>

                        {!hasPaidTicket && (
                            <button
                                onClick={handleBuyTicket}
                                disabled={paymentLoading}
                                className="group relative px-6 py-2.5 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {paymentLoading ? 'Loading...' : 'Get Pass'}
                            </button>
                        )}
                    </div>

                    <div className="p-8 md:p-12 space-y-8">
                        {/* 1. Quick Stats */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            {/* Countdown Card */}
                            <div className="p-6 rounded-2xl bg-[#151515] border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                                <div className="absolute -right-4 -top-4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all" />
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-purple-500">
                                    <Calendar size={80} />
                                </div>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Event Countdown</p>
                                <h3 className="text-3xl font-serif-display italic text-white">
                                    {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                                </h3>
                                <p className="text-[10px] text-purple-400 mt-2 font-mono uppercase tracking-tighter">Starts Feb 12, 10:00 AM</p>
                            </div>

                            {/* Venue Card with Link */}
                            <a 
    href="https://www.google.com/maps/search/?api=1&query=Academic+Block+5+MIT+Manipal" 
    target="_blank" 
    rel="noopener noreferrer"
    className="p-6 rounded-2xl bg-[#151515] border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-colors"
>
<div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-blue-500">
                                    <MapPin size={80} />
                                </div>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Venue</p>
                                <h3 className="text-2xl font-serif-display italic text-white underline decoration-blue-500/30 underline-offset-4">MIT Manipal</h3>
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                    AB5 & Library Auditorium <Plus size={10} className="text-blue-500" />
                                </p>
                            </a>
                        </motion.div>

                        {/* 2. Timeline */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Clock size={16} className="text-purple-400" />
                                    Upcoming Sessions
                                </h3>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Feb 2026</span>
                            </div>

                            <div className="space-y-4 mt-6">
    {CONCLAVES.map((event, index) => {
        const getArtAsset = (id: string) => {
            if (id === 'fintech') return '/images/ev1-removebg-preview.png';   
            if (id === 'built-her') return '/images/ev2-removebg-preview.png'; 
            return '/images/ev3-removebg-preview.png';                        
        };

        // Determine if this is the first artwork to apply specific sizing
        const isFinTech = event.id === 'fintech';

        return (
            <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2, scale: 1.005 }}
                className="group relative flex items-center h-28 rounded-[24px] bg-[#121212] border border-white/5 overflow-hidden transition-all duration-300 shadow-xl"
            >
                {/* --- ARTWORK CONTAINER --- */}
                <div className="absolute right-0 top-0 h-full w-full pointer-events-none select-none overflow-hidden">
                    <motion.img 
                        src={getArtAsset(event.id)} 
                        alt="Event Art" 
                        className={`absolute right-0 bottom-[-10%] object-contain object-right opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500
                            ${isFinTech ? 'h-[120%] ' : 'h-[120%]'}`} // 👈 Increased height and pulled right for FinTech
                    />
                    
                    {/* FADE MASK: Adjusted to ensure button area (right side) is clear */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/40 to-transparent w-[70%] z-10" />
                </div>

                {/* --- CARD CONTENT --- */}
                <div className="relative z-20 flex items-center w-full px-6">
                    
                    {/* Date Badge */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center shadow-lg">
                        <span className="text-[8px] font-black uppercase text-gray-500 tracking-tighter">
                            {event.displayDate.split(' ')[0]}
                        </span>
                        <span className="text-lg font-bold text-white leading-none">
                            {event.displayDate.split(' ')[1]}
                        </span>
                    </div>

                    {/* Text Details */}
                    <div className="ml-5 flex-grow">
                        <h4 className="text-lg font-bold text-white tracking-tight">
                            {event.title}
                        </h4>
                        <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                <Clock size={12} className="text-purple-500/80" />
                                {event.time}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                <MapPin size={12} className="text-blue-500/80" />
                                {event.venue}
                            </div>
                        </div>
                    </div>

                    {/* --- ACCESS BUTTON: Increased visibility with solid background and higher Z-index --- */}
                    <div className="ml-auto relative z-30"> {/* 👈 High z-index to stay above artwork */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[9px] font-black uppercase tracking-[0.15em] text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                        >
                            Access
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        );
    })}
</div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}