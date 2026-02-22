"use client";

export default function DeleteConfirmScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener("submit", function (e) {
            const form = e.target;
            if (!form || !form.matches("[data-confirm-delete]")) return;

            e.preventDefault();

            const password = prompt("삭제 비밀번호");

            if (!password) return;

            const input = document.createElement("input");
            input.type = "hidden";
            input.name = "deletePassword";
            input.value = password;

            form.appendChild(input);
            form.submit();
          });
        `,
      }}
    />
  );
}
