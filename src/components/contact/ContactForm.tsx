"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Input, Textarea, Select, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { contactSchema } from "@/lib/validators";

const CATEGORIES = [
  "Booking",
  "Vehicle",
  "Payment",
  "Verification",
  "Damage",
  "Technical issue",
  "Partnership",
  "Other",
];

export function ContactForm({
  defaultCategory,
  defaultSubject,
  defaultName,
  defaultEmail,
}: {
  defaultCategory?: string;
  defaultSubject?: string;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const { show } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: defaultName ?? "",
    email: defaultEmail ?? "",
    phone: "",
    category: CATEGORIES.includes(defaultCategory ?? "") ? (defaultCategory as string) : "Booking",
    subject: defaultSubject ?? "",
    message: "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }
      setSubmitted(true);
      show("Your message has been sent — we'll get back to you soon.", "success");
    } catch (err) {
      show(err instanceof Error ? err.message : "Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-[var(--success-bg)] text-[var(--success)]">
          <CheckCircle2 className="size-7" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Message sent</h3>
        <p className="mt-1.5 max-w-sm text-sm text-[var(--muted)]">
          Thanks for reaching out. Our support team typically responds within 24 hours on
          business days.
        </p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => {
            setForm({ name: "", email: "", phone: "", category: "Booking", subject: "", message: "" });
            setSubmitted(false);
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Full name</Label>
          <Input
            id="contact-name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Your name"
            error={errors.name}
          />
        </div>
        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@example.com"
            error={errors.email}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-phone" hint="Optional">
            Phone number
          </Label>
          <Input
            id="contact-phone"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="10-digit mobile number"
            error={errors.phone}
          />
        </div>
        <div>
          <Label htmlFor="contact-category">Category</Label>
          <Select
            id="contact-category"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            error={errors.category}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="contact-subject">Subject</Label>
        <Input
          id="contact-subject"
          value={form.subject}
          onChange={(e) => update("subject", e.target.value)}
          placeholder="What's this about?"
          error={errors.subject}
        />
      </div>

      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          rows={6}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Tell us what's going on — include a booking ID or vehicle name if relevant."
          error={errors.message}
        />
      </div>

      <Button type="submit" size="lg" loading={submitting} icon={<Send className="size-4" />} fullWidth>
        Send message
      </Button>
    </form>
  );
}
