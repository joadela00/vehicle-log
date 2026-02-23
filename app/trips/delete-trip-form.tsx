"use client";

import type React from "react";
import { useCallback } from "react";

export default function DeleteTripForm({
  id,
  returnTo,
  className,
  button,
}: {
  id: string;
  returnTo: string;
  className?: string;
  button: React.ReactNode;
}) {
  const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const pw = window.prompt("삭제 비밀번호");
    if (!pw) return;

    const form = e.currentTarget;

    let input = form.querySelector<HTMLInputElement>(
      'input[name="deletePassword"]'
    );

    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = "deletePassword";
      form.appendChild(input);
    }

    input.value = pw;

    form.submit();
  }, []);

  return (
    <form
      method="POST"
      action="/api/trips/delete"
      onSubmit={onSubmit}
      className={className}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="deletePassword" value="" />
      {button}
    </form>
  );
}
