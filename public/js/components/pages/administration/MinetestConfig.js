import { store, apply_filter, save, unset, update_settings } from '../../../service/mtconfig.js';
import DefaultLayout from '../../layouts/DefaultLayout.js';
import { START, ADMINISTRATION } from '../../Breadcrumb.js';

const SettingRow = {
    props: ["setting"],
    data: function() {
        return {
            old_setting: Object.assign({}, this.setting.current ? this.setting.current : this.setting.default),
            work_setting: Object.assign({}, this.setting.current ? this.setting.current : this.setting.default),
            busy: false,
            is_set: this.setting.is_set
        };
    },
    computed: {
        is_changed: function() {
            const w = this.work_setting;
            const o = this.old_setting;
            switch (this.setting.type) {
                case "string":
                case "int":
                case "float":
                case "bool":
                case "enum":
                    return w.value != o.value;
                case "v3f":
                    return w.x != o.x || w.y != o.y || w.z != o.z;
                // TODO: flags, noise_params_2d, noise_params_3d
                }
        }
    },
    methods: {
        save: function() {
            this.busy = true;
            // ensure that the value field is of type "string"
            if (this.work_setting.value) {
                this.work_setting.value = "" + this.work_setting.value;
            }
            save(this.setting.key, this.work_setting)
            .then(() => {
                this.is_set = true;
                Object.assign(this.old_setting, this.work_setting);
                this.busy = false;
            });
        },
        reset: function() {
            Object.assign(this.work_setting, this.old_setting);
        },
        unset: function() {
            this.busy = true;
            unset(this.setting.key)
            .then(() => {
                this.is_set = false;
                Object.assign(this.old_setting, this.setting.default);
                Object.assign(this.work_setting, this.old_setting);
                this.busy = false;
            });
        }
    },
    template: /*html*/`
    <td class="mtui-setting-name">
        {{setting.key}}
        <i class="fa fa-circle-check text-success" title="this setting is configured/set in the minetest.conf" v-if="is_set"></i>
    </td>
    <td class="mtui-setting-type">
        <span class="badge bg-primary-subtle text-primary-emphasis">{{setting.type}}</span>
    </td>
    <td class="mtui-setting-description">
        <details>
            <summary>{{setting.short_description}}</summary>
            {{setting.long_description}}
        </details>
    </td>
    <td class="mtui-setting-value">
        <span class="mtui-setting-value-label">Value</span>
        <div v-if="setting.type == 'string'">
            <input type="text" class="form-control" v-model="work_setting.value" :aria-label="setting.key"/>
        </div>
        <div v-if="setting.type == 'bool'" class="form-check form-switch">
            <input type="checkbox" class="form-check-input" role="switch" v-model="work_setting.value" true-value="true" false-value="false" :aria-label="setting.key"/>
        </div>
        <div v-if="setting.type == 'int' || setting.type == 'float'">
            <input type="number" class="form-control" v-model="work_setting.value" :min="setting.min" :max="setting.max" :step="setting.type === 'float' ? 'any' : 1" :aria-label="setting.key"/>
        </div>
        <div v-if="setting.type == 'enum'">
            <select class="form-select" v-model="work_setting.value" :aria-label="setting.key">
                <option v-for="choice in setting.choices">{{choice}}</option>
            </select>
        </div>
        <div v-if="setting.type == 'flags'">
            <details>
                <summary>Flags setting</summary>
                <ul>
                    <li v-for="choice in setting.choices">
                        <input type="checkbox" class="form-check-input"/>
                        {{choice}}
                    </li>
                </ul>
            </details>
        </div>
        <div v-if="setting.type == 'v3f'">
            <details>
                <summary>3D Vector setting</summary>
                <label>X</label>
                <input type="text" class="form-control" v-model.number="work_setting.x"/>
                <label>Y</label>
                <input type="text" class="form-control" v-model.number="work_setting.y"/>
                <label>Z</label>
                <input type="text" class="form-control" v-model.number="work_setting.z"/>
            </details>
        </div>
        <div v-if="setting.type == 'noise_params_2d' || setting.type == 'noise_params_3d'">
            <details>
                <summary>Noise parameter setting</summary>
                <label>Offset</label>
                <input type="number" step="any" class="form-control" v-model.number="work_setting.offset"/>
                <label>Scale</label>
                <input type="number" step="any" class="form-control" v-model.number="work_setting.scale"/>
                <label>Spread X</label>
                <input type="number" step="any" class="form-control" v-model.number="work_setting.spread_x"/>
                <label>Spread Y</label>
                <input type="number" step="any" class="form-control" v-model.number="work_setting.spread_y"/>
                <label>Spread Z</label>
                <input type="number" step="any" class="form-control" v-model.number="work_setting.spread_z"/>
                <label>Seed</label>
                <input type="text" class="form-control" v-model="work_setting.seed"/>
                <label>Octaves</label>
                <input type="number" class="form-control" v-model.number="work_setting.octaves"/>
                <label>Persistence</label>
                <input type="number" step="any" class="form-control" v-model.number="work_setting.persistence"/>
                <label>Lacunarity</label>
                <input type="number" step="any" class="form-control" v-model.number="work_setting.lacunarity"/>
            </details>
        </div>
    </td>
    <td class="mtui-setting-actions">
        <i class="fa fa-spinner fa-spin" v-if="busy"></i>
        <div class="mtui-setting-buttons">
            <button type="button" class="btn btn-success" v-on:click="save" :disabled="!is_changed">
                <i class="fa fa-floppy-disk"></i>
                Save
            </button>
            <button type="button" class="btn btn-outline-secondary" v-on:click="reset" :disabled="!is_changed">
                <i class="fa-solid fa-arrow-rotate-left"></i>
                Reset
            </button>
            <button type="button" class="btn btn-outline-danger" v-on:click="unset" :disabled="!is_set">
                <i class="fa fa-trash"></i>
                Unset
            </button>
        </div>
    </td>
    `
};

export default {
    components: {
        "setting-row": SettingRow,
        "default-layout": DefaultLayout
    },
    created: function() {
        update_settings();
    },
    data: function() {
        return {
            store: store,
            search: "",
            only_configured: true,
            breadcrumb: [START, ADMINISTRATION, {
                name: "Minetest config",
                icon: "cog",
                link: "/minetest-config"
            }]
        };
    },
    methods: {
        apply_filter: function() {
            apply_filter({
                search: this.search,
                only_configured: this.only_configured
            });
        }
    },
    watch: {
        "search": "apply_filter",
        "only_configured": "apply_filter"
    },
    template: /*html*/`
        <default-layout icon="cog" title="Minetest config" :breadcrumb="breadcrumb">
            <section class="mtui-config">
                <div class="row g-3 align-items-center mtui-config-toolbar">
                    <div class="col-12 col-lg-6">
                        <div class="input-group">
                            <span class="input-group-text"><i class="fa fa-magnifying-glass" aria-hidden="true"></i></span>
                            <input type="search" class="form-control" v-model="search" placeholder="Search settings" aria-label="Search settings"/>
                        </div>
                    </div>
                    <div class="col-12 col-sm-8 col-lg-4">
                        <div class="form-check mb-0">
                            <input id="mtui-only-configured" type="checkbox" class="form-check-input" v-model="only_configured"/>
                            <label for="mtui-only-configured" class="form-check-label">Show only configured settings</label>
                        </div>
                    </div>
                    <div class="col-12 col-sm-4 col-lg-2 mtui-config-count">
                        Found <span class="badge bg-success-subtle text-success-emphasis">{{store.filtered_count}}</span> settings
                    </div>
                </div>
                <section class="card mtui-config-group" v-for="topic in store.filtered_topics" :key="topic">
                    <h2 class="card-header"><i class="fa fa-sliders" aria-hidden="true"></i> {{topic.split('/').join(' / ')}}</h2>
                    <div class="mtui-config-table-container">
                        <table class="table mtui-config-table">
                            <colgroup>
                                <col class="mtui-config-name-column"/>
                                <col class="mtui-config-type-column"/>
                                <col class="mtui-config-description-column"/>
                                <col/>
                                <col class="mtui-config-actions-column"/>
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Description</th>
                                    <th scope="col">Value</th>
                                    <th scope="col" class="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="setting in store.filtered_settings[topic]" :key="setting.key">
                                    <setting-row :setting="setting"/>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </section>
        </default-layout>
    `
};
