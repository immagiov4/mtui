const localstorage_key = "user-selected-theme";

function getTheme() {
    let theme = localStorage.getItem(localstorage_key);
    if (!theme) {
        // fallback to system selected theme
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return theme;
}

const store = Vue.reactive({
    theme: getTheme()
});

function setTheme(theme) {
    store.theme = theme;
    localStorage.setItem(localstorage_key, theme);
    document.getElementsByTagName("html")[0].setAttribute("data-bs-theme", theme);
}

// init
setTheme(store.theme);

export default {
    data: () => store,
    methods: {
        setTheme,
        toggle: function() {
            if (this.theme == "light") {
                setTheme("dark");
            } else {
                setTheme("light");
            }
        }
    },
    template: /*html*/`
    <button type="button" class="btn btn-outline-secondary" v-on:click="toggle" title="Toggle dark/light theme" aria-label="Toggle dark/light theme">
        <i class="fa fa-sun"
            v-if="theme == 'light'">
        </i>
        <i class="fa fa-moon"
            v-if="theme == 'dark'">
        </i>
    </button>
    `
};
