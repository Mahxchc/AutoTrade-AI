// =====================================
// ..M AutoTrade AI
// Glass UI Controller
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initTelegram();

        initNavigation();

        initButtons();

    }
);


// =====================================
// ..M Telegram
// =====================================

function initTelegram() {

    try {

        if (
            window.Telegram &&
            window.Telegram.WebApp
        ) {

            const tg =
                window.Telegram.WebApp;

            tg.ready();

            tg.expand();

            tg.setHeaderColor("#06101d");

            tg.setBackgroundColor("#020812");

        }

    } catch (error) {

        console.log(
            "Telegram WebApp initialization:",
            error
        );

    }

}


// =====================================
// ..M Navigation
// =====================================

function initNavigation() {

    const buttons =
        document.querySelectorAll(
            ".nav-item"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const page =
                        button.dataset.page;

                    if (!page) {
                        return;
                    }

                    showPage(page);

                }
            );

        }
    );

}


// =====================================
// ..M Show Page
// =====================================

function showPage(pageName) {

    const pages =
        document.querySelectorAll(
            ".page"
        );


    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    pages.forEach(
        page => {

            page.classList.remove(
                "active"
            );

        }
    );


    navItems.forEach(
        item => {

            item.classList.remove(
                "active"
            );

        }
    );


    const targetPage =
        document.getElementById(
            `page-${pageName}`
        );


    const targetButton =
        document.querySelector(
            `.nav-item[data-page="${pageName}"]`
        );


    if (targetPage) {

        targetPage.classList.add(
            "active"
        );

    }


    if (targetButton) {

        targetButton.classList.add(
            "active"
        );

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// =====================================
// ..M Buttons
// =====================================

function initButtons() {

    const startButton =
        document.querySelector(
            ".primary-button"
        );


    if (startButton) {

        startButton.addEventListener(
            "click",
            () => {

                showMessage(
                    "سیستم AI Trading آماده است."
                );

            }
        );

    }


    const notification =
        document.getElementById(
            "notificationBtn"
        );


    if (notification) {

        notification.addEventListener(
            "click",
            () => {

                showMessage(
                    "اعلان جدیدی وجود ندارد."
                );

            }
        );

    }


    // =====================================
    // ..M Support
    // =====================================

    const support =
        document.querySelector(
            ".support-card button"
        );


    if (support) {

        // ..M تغییر نوشته دکمه
        support.textContent =
            "پیام به پشتیبانی";


        support.addEventListener(
            "click",
            () => {

                const supportUsername =
                    "mehdi2410l";


                const supportUrl =
                    `https://t.me/${supportUsername}`;


                // ..M باز کردن مستقیم چت پشتیبانی
                if (
                    window.Telegram &&
                    window.Telegram.WebApp
                ) {

                    const tg =
                        window.Telegram.WebApp;


                    if (
                        tg.openTelegramLink
                    ) {

                        tg.openTelegramLink(
                            supportUrl
                        );

                        return;

                    }

                }


                // ..M حالت خارج از Telegram
                window.open(
                    supportUrl,
                    "_blank"
                );

            }
        );

    }

}


// =====================================
// ..M Message
// =====================================

function showMessage(text) {

    const old =
        document.querySelector(
            ".glass-toast"
        );


    if (old) {

        old.remove();

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        "glass-toast";


    toast.textContent =
        text;


    Object.assign(
        toast.style,
        {

            position: "fixed",

            zIndex: "100",

            left: "50%",

            bottom:
                "105px",

            transform:
                "translateX(-50%)",

            width:
                "calc(100% - 40px)",

            maxWidth:
                "500px",

            padding:
                "15px 18px",

            textAlign:
                "center",

            borderRadius:
                "18px",

            color:
                "#eaffff",

            background:
                "rgba(130,220,255,0.12)",

            border:
                "1px solid rgba(210,248,255,0.20)",

            backdropFilter:
                "blur(24px)",

            webkitBackdropFilter:
                "blur(24px)",

            boxShadow:
                "0 20px 50px rgba(0,0,0,.35)",

            fontSize:
                "12px",

            fontWeight:
                "700"

        }
    );


    document.body.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.remove();

        },
        2500
    );

}