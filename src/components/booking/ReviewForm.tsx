"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RatingInput } from "@/components/ui/RatingStars";
import { Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function ReviewForm({ bookingId, targetName }: { bookingId: string; targetName: string }) {
  const router = useRouter();
  const { show } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      show("Thanks for your review!");
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Couldn't submit review", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
      <h3 className="text-sm font-semibold">Rate your experience with {targetName}</h3>
      <div className="mt-3">
        <RatingInput value={rating} onChange={setRating} />
      </div>
      <Textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share details about your rental experience..."
        className="mt-3"
      />
      <Button onClick={submit} loading={loading} className="mt-3">
        Submit review
      </Button>
    </div>
  );
}
