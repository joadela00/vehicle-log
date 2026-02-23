"use client";

import type React from "react";
import { useCallback, useRef, useState } from "react";

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
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState("");

  const openDialog = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPassword("");
    setIsDialogOpen(true);
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setPassword("");
  }, []);

  const submitDelete = useCallback(() => {
    if (!password.trim()) return;

    const form = formRef.current;
    if (!form) return;

    let input = form.querySelector<HTMLInputElement>('input[name="deletePassword"]');

    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = "deletePassword";
      form.appendChild(input);
    }

    input.value = password;
    closeDialog();
    form.submit();
  }, [closeDialog, password]);

  return (
    <>
      <form
        ref={formRef}
        method="POST"
        action="/api/trips/delete"
        onSubmit={openDialog}
        className={className}
      >
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="deletePassword" value="" />
        {button}
      </form>

      {isDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-dialog-title-${id}`}
          onClick={closeDialog}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-red-100 bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id={`delete-dialog-title-${id}`} className="text-lg font-bold tracking-tight text-gray-900">
              삭제 비밀번호 입력
            </h3>
            <p className="mt-2 text-sm text-gray-600">운행일지를 삭제하려면 비밀번호를 입력해 주세요.</p>

            <label className="mt-4 block text-sm font-semibold text-gray-800">
              비밀번호
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitDelete();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    closeDialog();
                  }
                }}
                className="mt-1 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm outline-none ring-red-300 transition focus:border-red-400 focus:ring-2"
                placeholder="삭제 비밀번호"
              />
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDialog}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={submitDelete}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!password.trim()}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
