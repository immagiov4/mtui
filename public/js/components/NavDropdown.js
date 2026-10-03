
export default {
    props: ["icon", "name"],
    data: function() {
        return {
            open: false
        };
    },
    computed: {
        icon_classes: function() {
            return {
                fa: true,
                [`fa-${this.icon}`]: true
            };
        }
    },
    watch: {
        "$route": function() {
            this.open = false;
        }
    },
    template: /*html*/`
    <li class="nav-item dropdown" v-on:mouseleave="open = false">
        <button type="button" class="nav-link dropdown-toggle" :aria-expanded="open" v-on:click="open = true" v-on:mouseover="open = true" v-on:keydown.esc="open = false">
            <i v-bind:class="icon_classes" v-if="icon"></i>
            {{name}}
        </button>
        <ul class="dropdown-menu" v-bind:class="{'show': open}">
            <slot></slot>
        </ul>
    </li>
    `
};
