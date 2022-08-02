<template>
  <div>
    <div class="container">Example</div>
    <mds-stepper v-model="steps" />
  </div>
</template>
<script>
import MdsStepper from "@mds/stepper";

export default {
  components: {
    MdsStepper,
  },
  data() {
    return {
      steps: [
        { id: 1, title: "Step 1" },
        { id: 2, title: "Step 2", active: true },
        { id: 3, title: "Step 3" },
      ],
    };
  },
};
</script>
<style lang="scss" scoped>
@import "~@mds/typography";
.container {
  color: green;
  @include mds-body-text-m();
}
</style>
