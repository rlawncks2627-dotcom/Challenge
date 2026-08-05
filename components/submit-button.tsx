"use client";

import { useFormStatus } from "react-dom";

import { BUTTON_PRIMARY } from "@/components/form-styles";

export function SubmitButton({
  children,
  pendingLabel,
}: {
  children: React.ReactNode;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={`w-full ${BUTTON_PRIMARY}`}>
      {pending ? pendingLabel : children}
    </button>
  );
}
