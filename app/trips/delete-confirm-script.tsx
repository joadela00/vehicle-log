"use client";

import { useEffect } from "react";

export default function DeleteConfirmScript() {
  useEffect(() => {
    const forms = Array.from(document.querySelectorAll<HTMLFormElement>('form[data-confirm-delete="1"]'));

    const onSubmit = (event: Event) => {
      const ok = window.confirm("정말 삭제하시겠습니까?");
      if (!ok) {
        event.preventDefault();
      }
    };

    forms.forEach((form) => {
      form.addEventListener("submit", onSubmit);
    });

    return () => {
      forms.forEach((form) => {
        form.removeEventListener("submit", onSubmit);
      });
    };
  }, []);

  return null;
}
