"use client";

import { useState } from "react";
import { registerAttendee } from "@/actions/attendence";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        // Store in localStorage for persistence across public pages
        localStorage.setItem(`spotlight_attendee_${webinarId}`, result.attendeeId);
        localStorage.setItem(`spotlight_attendee_name_${webinarId}`, name);
        onSuccess(result.attendeeId);
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-md mx-auto"
    >
      <div className="space-y-2 text-center mb-4">
        <h2 className="text-2xl font-bold text-primary">Reserve Your Spot</h2>
        <p className="text-sm text-muted-foreground">
          Join thousands of others learning from the best.
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground ml-1">
          FULL NAME
        </label>
        <Input
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-secondary/20 border-border h-12"
          disabled={loading}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground ml-1">
          EMAIL ADDRESS
        </label>
        <Input
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-secondary/20 border-border h-12"
          disabled={loading}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 mt-4 text-white font-bold text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-xl shadow-purple-500/20"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Register for Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </>
        )}
      </Button>

      <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-widest">
        Secure & Private • No Credit Card Required
      </p>
    </form>
  );
}
