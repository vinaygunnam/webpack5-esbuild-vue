import Vue from "vue";

export function render(ComponentDefinition, props, mountNode) {
  const Component = Vue.extend(ComponentDefinition);
  new Component().$mount(mountNode);
}
