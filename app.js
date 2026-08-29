// =====================================
// ..M AutoTrade AI
// Profile / Support Only
// =====================================

const SUPPORT_USERNAME = "@mehdi2410l";


// =====================================
// نمایش صفحه پروفایل
// فقط پشتیبانی
// =====================================

function renderProfile() {

    const app =
        document.getElementById("app");

    if (!app) {
        return;
    }

    app.innerHTML = `

        <div class="page profile-page">

            <div class="page-header">
                <h1>پشتیبانی</h1>
            </div>


            <div class="support-card">

                <div class="support-icon">
                    💬
                </div>

                <h2>
                    پشتیبانی AutoTrade AI
                </h2>

                <p>
                    برای ارتباط با پشتیبانی
                    روی دکمه زیر بزنید.
                </p>

                <div class="support-username">
                    ${SUPPORT_USERNAME}
                </div>

                <button
                    type="button"
                    class="support-button"
                    id="supportButton"
                >
                    ارتباط با پشتیبانی
                </button>

            </div>

        </div>

    `;


    // =====================================
    // دکمه پشتیبانی
    // =====================================

    const supportButton =
        document.getElementById(
            "supportButton"
        );


    if (supportButton) {

        supportButton.onclick =
            function () {

                const username =
                    SUPPORT_USERNAME
                        .replace("@", "");

                const url =
                    `https://t.me/${username}`;


                if (
                    window.Telegram &&
                    window.Telegram.WebApp
                ) {

                    window.Telegram.WebApp
                        .openTelegramLink(url);

                } else {

                    window.open(
                        url,
                        "_blank"
                    );

                }

            };

    }

}