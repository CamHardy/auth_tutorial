<template>
  <div class="home text-center">
    <div class="jumbotron">
      <h1 class="display-3">Authentication Tutorial</h1>
      <p class="lead">
        I am learning authentication don't judge me OK.
      </p>
      <hr class="my-4">
      <p>
        You can learn all kinds of things sometimes.
      </p>
      <p class="lead">
      <router-link
        class="btn btn-primary btn-lg"
        :to="{name: 'signup'}"
        role="button">Sign Up</router-link>
      </p>
    </div>
  </div>
</template>

<script>

export default {
  name: 'home',
  components: {
  },
};
</script>
