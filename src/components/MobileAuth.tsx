import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, ArrowRight, RefreshCw, ChevronLeft } from 'lucide-react';
import { OTPInput } from './OTPInput';

interface MobileAuthProps {
  onSuccess: (user: any) => void;
}

export const MobileAuth: React.FC<MobileAuthProps> = ({ onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid mobile number.");
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate OTP sending
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setTimer(30);
    }, 1500);
  };

  const handleVerifyOTP = async (otp: string) => {
    setLoading(true);
    setError(null);

    // Simulate OTP verification
    setTimeout(() => {
      setLoading(false);
      if (otp === "123456") {
        onSuccess({
          uid: `mobile_${Date.now()}`,
          displayName: `User ${phoneNumber.slice(-4)}`,
          phoneNumber: `${countryCode}${phoneNumber}`,
          role: 'user'
        });
      } else {
        setError("Invalid OTP. Please try again.");
      }
    }, 1500);
  };

  const handleResendOTP = () => {
    if (timer === 0) {
      setTimer(30);
      // Simulate resending
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === "input" ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 ml-1">Mobile Number</label>
              <div className="flex gap-3">
                <select 
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-4 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                </select>
                <div className="relative flex-1">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-rose-500 text-sm font-medium ml-1">{error}</p>}

            <button
              onClick={handleSendOTP}
              disabled={loading || !phoneNumber}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <>
                  Send OTP
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setStep("input")}
                className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h3 className="text-lg font-bold text-white">Verify OTP</h3>
                <p className="text-sm text-slate-400">Sent to {countryCode} {phoneNumber}</p>
              </div>
            </div>

            <div className="space-y-6">
              <OTPInput length={6} onComplete={handleVerifyOTP} />
              
              <div className="flex justify-between items-center px-1">
                <p className="text-sm text-slate-500 font-medium">
                  Didn't receive OTP?
                </p>
                <button
                  onClick={handleResendOTP}
                  disabled={timer > 0}
                  className={`text-sm font-bold transition-all ${timer > 0 ? 'text-slate-600' : 'text-indigo-500 hover:text-indigo-400'}`}
                >
                  {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                </button>
              </div>
            </div>

            {error && <p className="text-rose-500 text-sm font-medium text-center">{error}</p>}

            {loading && (
              <div className="flex justify-center">
                <RefreshCw className="animate-spin text-indigo-500" size={24} />
              </div>
            )}
            
            <p className="text-center text-xs text-slate-600">
              Tip: Use <span className="text-slate-400 font-bold">123456</span> for demo verification
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
