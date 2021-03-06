<template>
  <b-table
    responsive
    striped
    hover
    show-empty
    :dark="darkMode"
    :outlined="outlined"
    :items="filteredItems"
    :fields="mergedFields">

    <template slot="actions" slot-scope="row">
      <b-btn
        v-if="showDetails"
        variant="info"
        size="sm"
        @click.stop="row.toggleDetails">
        {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
      </b-btn>
      <slot name="action" :item="row.item"></slot>
    </template>

    <template slot="row-details" slot-scope="row">
      <b-card
        :bg-variant="darkMode ? 'dark' : null"
        :text-variant="darkMode ? 'white' : null">

        <h5>Project Details</h5>
        <ul class="list-unstyled">
          <li
            v-for="(key, index) in getProjectKeys(row.item)"
            :class="getHighlightCls(row.item, key)"
            :key="index">
            <strong>{{ key }}:</strong>
            {{ row.item[key] }}
          </li>
        </ul>

        <h5 class="mt-3">Task Details</h5>
        <ul class="list-unstyled" v-if="row.item.task">
          <li
            v-for="(key, index) in Object.keys(row.item.task)"
            :class="getHighlightCls(row.item, key, 'task')"
            :key="index">
            <strong>{{ key }}:</strong>
            <template v-if="key === 'fields_schema'">
              <ul>
                <li
                  v-for="(field, index) in row.item.task[key]"
                  :key="index">
                  <strong>{{ field.model }}:</strong>
                  <ul>
                    <li
                      v-for="(fieldKey, index) in Object.keys(field)"
                      :key="index">
                      <strong>{{ fieldKey }}:</strong>
                      {{ field[fieldKey] }}
                    </li>
                  </ul>
                </li>
              </ul>
            </template>
            <template v-else-if="key === 'institutions'">
              <ul>
                <li
                  v-for="code in row.item.task[key]"
                  :key="code">
                  {{ code }}
                </li>
              </ul>
            </template>
            <template v-else>
              {{ row.item.task[key] }}
            </template>
          </li>
        </ul>
        <p v-else>None</p>

        <h5 class="mt-3">Analysis Rules</h5>
        <ul class="list-unstyled" v-if="row.item.rules">
          <li
            v-for="(key, index) in Object.keys(row.item.rules)"
            :class="getHighlightCls(row.item, key, 'rules')"
            :key="index">
            <strong>{{ key }}:</strong>
            {{ row.item.rules[key] }}
          </li>
        </ul>
        <p v-else>None</p>
        <h5 class="mt-3">Tutorial</h5>
        <div
          v-if="row.item.tutorial"
          :class="getHighlightCls(row.item, 'tutorial')"
          v-html="marked(row.item.tutorial)">
        </div>
        <p v-else>None</p>

      </b-card>
    </template>
  </b-table>
</template>

<script>
import isEqual from 'lodash/isEqual'
import marked from 'marked'

export default {
  props: {
    templates: {
      type: Array,
      required: true
    },
    fields: {
      type: Object,
      default: () => {
        return {
          name: {
            label: 'Name',
            sortable: true
          }
        }
      }
    },
    showDetails: {
      type: Boolean,
      default: false
    },
    outlined: {
      type: Boolean,
      default: false
    },
    filter: {
      type: String,
      default: null
    },
    filterBy: {
      type: String,
      default: null
    },
    collectionId: {
      type: Number,
      default: null
    }
  },

  computed: {
    mergedFields () {
      const fieldsCopy = JSON.parse(JSON.stringify(this.fields))
      if (this.showDetails || this.$scopedSlots.action) {
        fieldsCopy.actions = {
          label: 'Actions',
          class: 'text-center'
        }
      }
      return fieldsCopy
    },

    filteredItems () {
      let items = this.templates

      if (this.collectionId) {
        items = items.filter(item => {
          return item.category_id === this.collectionId
        })
      }

      if (!this.filter || !this.filterBy) {
        return items
      }

      return items.filter(item => {
        const value = this.filter.toUpperCase()
        const cell = item[this.filterBy]
        return JSON.stringify(cell).toUpperCase().indexOf(value) > -1
      })
    }
  },

  methods: {
    /**
     * Return core project keys.
     * @param {Object} tmpl
     *   The template.
     */
    getProjectKeys (tmpl) {
      const hiddenKeys = [
        'task',
        'rules',
        'tutorial',
        '_original',
        '_showDetails'
      ]
      return Object.keys(tmpl).filter(key => hiddenKeys.indexOf(key) < 0)
    },

    /**
     * Highlight text if the value has changed.
     * @param {Object} tmpl
     *   The template.
     * @param {String} key
     *   The key to check against the original.
     * @param {String} baseKey
     *   The context for checking the key.
     */
    getHighlightCls (tmpl, key, baseKey = null) {
      let changed = false
      if (
        typeof tmpl._original !== 'undefined'
      ) {
        changed = baseKey
          ? !isEqual(tmpl[baseKey][key], tmpl._original[baseKey][key])
          : !isEqual(tmpl[key], tmpl._original[key])
      }
      return {
        'text-success': changed
      }
    },

    /**
     * Markdown processor.
     */
    marked
  }
}
</script>
