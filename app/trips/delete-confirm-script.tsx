import Script from "next/script";

export default function DeleteConfirmScript() {
  return (
    <Script id="trips-delete-confirm" strategy="beforeInteractive">
      {`
        (function () {
          if (window.__TRIPS_DELETE_CONFIRM_BOUND__) return;
          window.__TRIPS_DELETE_CONFIRM_BOUND__ = true;

          document.addEventListener("submit", function (e) {
            var form = e.target;
            if (!form || !form.matches("[data-confirm-delete]")) return;

            e.preventDefault();

            var password = prompt("삭제 비밀번호");
            if (!password) return;

            var input = document.createElement("input");
            input.type = "hidden";
            input.name = "deletePassword";
            input.value = password;
            form.appendChild(input);

            form.submit();
          }, true);
        })();
      `}
    </Script>
  );
}