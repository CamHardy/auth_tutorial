<template>
  <div>
    <h1>Dashboard</h1>
    <h2 v-if="user">Hello, {{ user.username }}!</h2>
    <button @click="logout()" class="btn btn-primary">Logout</button>
    <button @click="showForm=!showForm" class="btn btn-info">Toggle Form</button>
    <br>
    <br>
    <form v-if="showForm" @submit.prevent="addNote()">
      <div class="form-group">
        <label for="title">Title</label>
        <input
          v-model="newNote.title"
          type="text"
          class="form-control"
          id="title"
          aria-describedby="titleHelp"
          placeholder="Enter a title"
          required>
        <small
          id="titleHelp"
          class="form-text text-muted">
          Enter a descriptive title for your note
        </small>
      </div>
      <div class="form-group">
        <label for="desciption">Note</label>
        <textarea
          v-model="newNote.note"
          class="form-control"
          id="note"
          rows="3"
          placeholder="Enter your note"
          required>
        </textarea>
      </div>
      <button type="submit" class="btn btn-success">Add Note</button>
    </form>
  </div>
</template>

<script>
const API_URL = 'http://localhost:5000/';

export default {
  data: () => ({
    showForm: false,
    user: null,
    newNote: {
      title: '',
      note: '',
    },
    notes: [],
  }),
  mounted() {
    fetch(API_URL, {
      headers: {
        authorization: `Bearer ${localStorage.token}`,
      },
    }).then(res => res.json())
      .then((result) => {
        if (result.user) {
          this.user = result.user;
        } else {
          this.logout();
        }
      });
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    },
    addNote() {
      fetch(`${API_URL}api/v1/notes`, {
        method: 'POST',
        body: JSON.stringify(this.newNote),
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${localStorage.token}`,
        },
      }).then(res => res.json())
        .then((note) => {
          this.notes.push(note);
          this.newNote = {
            title: '',
            note: '',
          };
          this.showForm = false;
        });
    },
  },
};
</script>

<style>

</style>
