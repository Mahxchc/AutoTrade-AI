// =====================================
// ..M AutoTrade AI
// Profile Section
// فقط پروفایل + پشتیبانی
// =====================================

const SUPPORT_USERNAME = "@mehdi2410l";


// =====================================
// Telegram User
// =====================================

function getTelegramUser() {

    try {

        const tg =
            window.Telegram?.WebApp;

        return tg?.initDataUnsafe?.user || {};

    } catch (error) {

        console.error(
            "Telegram User Error:",
            error
        );

        return {};

    }

}


// =====================================
// Persian Number
// =====================================

function toPersianNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "۰";

    }

    return String(value)
        .replace(/\d/g, digit =>
            "۰۱۲۳۴۵۶۷۸۹"[digit]
        );

}


// =====================================
// Open Support
// =====================================

function openSupport() {

    const username =
        SUPPORT_USERNAME.replace("@", "");

    const url =
        `https://t.me/${username}`;

    try {

        if (
            window.Telegram &&
            window.Telegram.WebApp &&
            typeof window.Telegram.WebApp
                .openTelegramLink === "function"
        ) {

            window.Telegram.WebApp
                .openTelegramLink(url);

            return;

        }

    } catch (error) {

        console.error(
            "Telegram Support Error:",
            error
        );

    }

    window.open(
        url,
        "_blank"
    );

}


// =====================================
// Render Profile
// =====================================

function renderProfile() {

    const app =
        document.getElementById("app");

    if (!app) {

        console.error(
            "App container not found"
        );

        return;

    }


    const user =
        getTelegramUser();


    const firstName =
        user.first_name ||
        "کاربر";


    const lastName =
        user.last_name ||
        "";


    const fullName =
        `${firstName} ${lastName}`
            .trim();


    const username =
        user.username
            ? `@${user.username}`
            : "بدون نام کاربری";


    const telegramId =
        user.id
            ? toPersianNumber(user.id)
            : "۰";


    // =====================================
    // Profile UI
    // =====================================

    app.innerHTML = `

        <div class="page profile-page">

            <div class="page-header">

                <h1>
                    پروفایل
                </h1>

            </div>


            <div class="profile-user-card">

                <div class="profile-avatar">

                    ${firstName
                        .charAt(0)
                        .toUpperCase()}

                </div>


                <div class="profile-user-info">

                    <div class="profile-name">

                        ${fullName}

                    </div>


                    <div class="profile-username">

                        ${username}

                    </div>

                </div>

            </div>


            <div class="profile-info-card">

                <div class="profile-row">

                    <span>
                        نام و نام خانوادگی
                    </span>

                    <strong>
                        ${fullName}
                    </strong>

                </div>


                <div class="profile-row">

                    <span>
                        نام کاربری
                    </span>

                    <strong>
                        ${username}
                    </strong>

                </div>


                <div class="profile-row">

                    <span>
                        شناسه تلگرام
                    </span>

                    <strong>
                        ${telegramId}
                    </strong>

                </div>


                <div class="profile-row">

                    <span>
                        نوع حساب
                    </span>

                    <strong>
                        حساب واقعی
                    </strong>

                </div>

            </div>


            <div class="support-card">

                <div class="support-title">

                    💬 پشتیبانی

                </div>


                <div class="support-text">

                    برای ارتباط با پشتیبانی
                    می‌توانید از طریق تلگرام
                    با ما در ارتباط باشید.

                </div>


                <div class="support-username">

                    ${SUPPORT_USERNAME}

                </div>


                <button
                    type="button"
                    class="support-button"
                    onclick="openSupport()"
                >

                    💬 ارتباط با پشتیبانی

                </button>

            </div>

        </div>

    `;

}


// =====================================
// Global Functions
// =====================================

window.renderProfile =
    renderProfile;

window.openSupport =
    openSupport;