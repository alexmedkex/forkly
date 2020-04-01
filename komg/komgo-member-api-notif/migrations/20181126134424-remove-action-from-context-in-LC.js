module.exports = {
  up(db) {
    return db.collection('tasks').update(
      { "context.type": "LC" },
      {
        $unset: {
          "context.action": true
        }
      },
      {
        multi: true
      }
    )
  },

  down(db) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // return db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
