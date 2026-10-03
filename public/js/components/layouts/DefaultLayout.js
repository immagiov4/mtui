import Breadcrumb from "../Breadcrumb.js";

export default {
    props: ["title", "icon", "breadcrumb"],
    components: {
        "bread-crumb": Breadcrumb
    },
    mounted: function() {
        this.label_tables();
        this.table_observer = new MutationObserver(() => this.label_tables());
        this.table_observer.observe(this.$refs.content, { childList: true, subtree: true });
    },
    beforeUnmount: function() {
        this.table_observer.disconnect();
    },
    methods: {
        label_tables: function() {
            this.$refs.content.querySelectorAll("table.table:not(.mtui-config-table):not(.mtui-table-interactive)").forEach(table => {
                if (!table.tHead || !table.tHead.rows.length) {
                    return;
                }
                const headings = Array.from(table.tHead.rows[0].cells, cell => cell.textContent.replace(/\s+/g, " ").trim());
                table.classList.add("mtui-responsive-table");
                Array.from(table.tBodies).forEach(body => Array.from(body.rows).forEach(row => {
                    const cells = Array.from(row.cells);
                    // Section headings span multiple columns and keep their own layout.
                    if (cells.length != headings.length || cells.some(cell => cell.colSpan > 1)) {
                        return;
                    }
                    row.classList.add("mtui-data-row");
                    cells.forEach((cell, index) => {
                        if (cell.dataset.mtuiLabel != headings[index]) {
                            cell.dataset.mtuiLabel = headings[index];
                        }
                    });
                }));
            });
        }
    },
	template: /*html*/`
        <bread-crumb :items="breadcrumb" v-if="breadcrumb"/>
        <div ref="content">
            <slot></slot>
        </div>
	`
};
