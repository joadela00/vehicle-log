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

            // ✅ 문구를 딱 이렇게만
            const password = prompt("삭제 비밀번호");
            if (!password) return;

            // ✅ 서버로 보내는 필드명도 deletePassword 로 통일
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
