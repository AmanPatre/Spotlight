"use client";

import { useState } from "react";
import { registerAttendee } from "@/actions/attendence";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Props = {
  webinarId: string;
  onSuccess: (attendeeId: string) => void;
};

export default function RegistrationForm({ webinarId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const result = await registerAttendee(webinarId, name, email);
      if (result.success && result.attendeeId) {
        toast.success("Successfully registered!");
        localStorage.setItem(`spotlight_attendee_${webinarId}`, result.attendeeId);
        localStorage.setItem(`spotlight_attendee_name_${webinarId}`, name);
        onSuccess(result.attendeeId);
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8 w-full">
      <div>
        <h2
          className="text-white text-2xl font-semibold tracking-tight mb-1"
          style={{ fontFamily: "Geist, sans-serif" }}
        >
          Reserve your spot
        </h2>
        <p className="text-zinc-500 text-sm" style={{ fontFamily: "Geist, sans-serif" }}>
          Join thousands of developers tuning in live.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-zinc-500 text-[11px] font-mono uppercase tracking-widest">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="w-full bg-black border border-zinc-800 text-white font-mono text-[13px] p-3 focus:outline-none focus:border-white transition-colors placeholder:text-zinc-700 disabled:opacity-50"
          />
        </div>

        {/* Work Email */}
        <div className="space-y-1">
          <label className="text-zinc-500 text-[11px] font-mono uppercase tracking-widest">
            Work Email
          </label>
          <input
            type="email"
            placeholder="jane@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            className="w-full bg-black border border-zinc-800 text-white font-mono text-[13px] p-3 focus:outline-none focus:border-white transition-colors placeholder:text-zinc-700 disabled:opacity-50"
          />
        </div>

        {/* Ticket Type */}
        <div className="flex justify-between items-center py-4 border-b border-zinc-800">
          <span className="text-zinc-400 text-sm" style={{ fontFamily: "Geist, sans-serif" }}>
            Ticket Type
          </span>
          <span className="text-white text-[11px] font-mono uppercase bg-zinc-900 border border-zinc-800 px-2 py-1">
            Free
          </span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-medium py-3 px-4 hover:bg-zinc-200 transition-colors flex items-center justify-center space-x-2 disabled:opacity-60 mt-4"
          style={{ fontFamily: "Geist, sans-serif", fontSize: "14px" }}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Secure Ticket &amp; Register</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
