<template>
  <div>
    <h1>Signup</h1>
    <div v-if="signingUp">
      <img src="../assets/loading.svg"/>
    </div>
    <div v-if="errorMessage" class="alert alert-dismissible alert-danger">
      {{ errorMessage }}
    </div>
    <form v-if="!signingUp" @submit.prevent="signup">
      <div class="form-group">
        <label for="username">Username</label>
        <input
          v-model="user.username"
          type="text"
          class="form-control"
          id="username"
          aria-describedby="usernameHelp"
          placeholder="Enter a username" required>
        <small id="usernameHelp" class="form-text text-muted">
          Username may contain alpha-numeric characters and underscores.
        </small>
      </div>
      <div class="form-row">
        <div class="form-group col-md-6">
          <label for="password">Password</label>
          <input
            v-model="user.password"
            type="password"
            class="form-control"
            id="password"
            aria-describedby="passwordHelp"
            placeholder="Password" required>
          <small id="passwordHelp" class="form-text text-muted">
            Password must be at least 8 characters long.
          </small>
        </div>
        <div class="form-group col-md-6">
          <label for="confirmPassword">Confirm Password</label>
          <input
            v-model="user.confirmPassword"
            type="password"
            class="form-control"
            id="confirmPassword"
            aria-describedby="confirmPasswordHelp"
            placeholder="Confirm Password" required>
          <small id="confirmPasswordHelp" class="form-text text-muted">
            Please confirm your password.
          </small>
        </div>
      </div>
      <button type="submit" class="btn btn-primary">Sign Up</button>
    </form>
  </div>
</template>

<script>
import Joi from 'joi';

const SIGNUP_URL = 'http://localhost:5000/auth/signup';

const schema = Joi.object().keys({
  username: Joi.string().regex(/(^[a-zA-Z0-9_]+$)/).min(1).max(30)
    .required(),
  password: Joi.string().trim().min(8).required(),
  confirmPassword: Joi.string().trim().min(8).required(),
});

export default {
  data: () => ({
    signingUp: false,
    errorMessage: '',
    user: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  }),
  watch: {
    user: {
      handler() {
        this.errorMessage = '';
      },
      deep: true,
    },
  },
  methods: {
    signup() {
      this.errorMessage = '';
      if (this.validUser()) {
        // send data to server
        const body = {
          username: this.user.username,
          password: this.user.password,
        };

        this.signingUp = true;
        fetch(SIGNUP_URL, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(body),
        }).then((response) => {
          if (response.ok) {
            return response.json();
          }
          return response.json().then((error) => {
            throw new Error(error.message);
          });
        }).then((result) => {
          localStorage.token = result.token;
          setTimeout(() => {
            this.signingUp = false;
            this.$router.push('/dashboard');
          }, 1000);
        }).catch((error) => {
          setTimeout(() => {
            this.signingUp = false;
            this.errorMessage = error.message;
          }, 1000);
        });
      }
    },
    validUser() {
      if (this.user.password !== this.user.confirmPassword) {
        this.errorMessage = 'Passwords do not match.';
        return false;
      }

      const result = Joi.validate(this.user, schema);
      if (result.error === null) {
        return true;
      }
      if (result.error.message.includes('username')) {
        this.errorMessage = 'Username is invalid.';
      } else {
        this.errorMessage = 'Password is invalid.';
      }
      return false;
    },
  },
};
</script>

<style>

</style>
