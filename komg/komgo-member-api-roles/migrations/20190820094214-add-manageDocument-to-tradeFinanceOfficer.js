module.exports = {
  up(db) {
    db
      .collection('roles')
      .updateOne(
        { 'id': 'tradeFinanceOfficer' },
        {
          $push: {
            permittedActions: {
              'product': {
                'id': 'tradeFinance',
                'label': 'tradeFinance'
              },
              'action': {
                'id': 'manageDocument',
                'label': 'manageDocument'
              },
              'permission': {
                'id': 'crudAndShare',
                'label': 'crudAndShare'
              }
            }
          }
        }
      )
  },

  down(db) {
    db
      .collection('roles')
      .updateOne(
        { 'id': 'tradeFinanceOfficer' },
        { $pull: { permittedActions: { 'action.id': 'manageDocument' } } }
      )
  }
};
