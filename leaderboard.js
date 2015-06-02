if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Meteor.subscribe('thePlayers');

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.leaderboard.helpers({
    player: function(){
      var currentUserId = Meteor.userId();
      return PlayersList.find({}, {sort: {score: -1}})
    },
    selectedClass: function(){
      var playerId = this._id
      var selectedPlayer = Session.get('selectedPlayer')
      if (playerId == selectedPlayer){
        return 'selected'
      }
    },
    showSelectedPlayer: function(){
      var selectedPlayer = Session.get('selectedPlayer')
      return PlayersList.findOne(selectedPlayer)
    }
  });

  PlayersList = new Mongo.Collection('players');

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });

  Template.leaderboard.events({
    'click .player' : function(){
      var playerId = this._id
      Session.set('selectedPlayer', playerId);
    },
    'click .increment' : function(){
      var selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('modifyPlayerScore', selectedPlayer, 5)
    },
    'click .decrement' : function(){
      var selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('modifyPlayerScore', selectedPlayer, -5)
    },
    'click .remove' : function(){
      var selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('removePlayerData', selectedPlayer)
    }
  });

  Template.addPlayerForm.events({
    'submit form' : function(e){
      e.preventDefault();
      var playerName = e.target.playerName.value;
      Meteor.call('insertPlayerData', playerName)

    }
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    PlayersList = new Mongo.Collection('players');
  });
  Meteor.publish('thePlayers', function(){
    var currentUserId = this.userId;
    return PlayersList.find({createdBy: currentUserId})
  });
  Meteor.methods({
    insertPlayerData: function(playerName){
      var currentUserId = Meteor.userId();
      PlayersList.insert({
        name: playerName,
        score: 0,
        createdBy: currentUserId
      })
    },
    removePlayer: function(selectedPlayer){
      var currentUserId = Meteor.userId();
      PlayersList.remove({_id: selectedPlayer, createdBy: currentUserId})
    },
    modifyPlayerScore: function(selectedPlayer, scoreValue){
      var currentUserId = Meteor.userId();
      PlayersList.update({_id: selectedPlayer, createdBy: currentUserId}, {$inc: {score: scoreValue}})
    }
  })
}
