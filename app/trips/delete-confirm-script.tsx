"use client";

import { useEffect } from "react";

export default function DeleteConfirmScript() {
  useEffect(() => {
    const forms = Array.from(document.querySelectorAll<HTMLFormElement>('form[data-confirm-delete="1"]'));

    const onSubmit = (event: Event) => {
      const form = event.currentTarget as HTMLFormElement | null;
      if (!form) return;

      const password = window.prompt("삭제하려면 관리자 비밀번호를 입력하세요.");
      if (password === null) {
        event.preventDefault();
        return;
      }

      const trimmed = password.trim();
      if (!trimmed) {
        window.alert("비밀번호를 입력해야 삭제할 수 있습니다.");
        event.preventDefault();
        return;
      }

      let input = form.querySelector<HTMLInputElement>('input[name="adminPassword"]');
      if (!input) {
        input = document.createElement("input");
        input.type = "hidden";
        input.name = "adminPassword";
        form.appendChild(input);
      }
      input.value = trimmed;
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
