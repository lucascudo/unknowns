Unknowns = new Mongo.Collection("unknowns");
Errors = new Mongo.Collection("errors");

if (Meteor.isClient) {
  
  var me = {
    "name": "Anon",
    "moron": false,
    "createdAt": new Date()
  };
  me.id = Unknowns.insert(me);
  Meteor.call("getConnection", function(error, result) {
    if (error) {
      Errors.insert(error);
      console.log("ERROR: ");
      console.log(error);
      return error;
    } else {
      me.connection = result;
      Unknowns.update(me.id, { $set: {
        "connection": result,
        "updatedAt": new Date()
      }});
      return result;
    }
  });
  Session.setDefault("Unknown", me);

  Template.unknownsList.helpers({
    "unknowns": function() {
      unknowns = Unknowns.find({}, {sort: {createdAt: -1}});
      unknowns.title = (unknowns.count() === 1)? "unknown" : "unknowns";
      return unknowns;
    }
  });

  Template.moronsCounter.helpers({
    "morons": function() {
        morons = Unknowns.find({"moron": true});
        morons.title = (morons.count() === 1) ? "moron" : "morons";
        return morons;
    }
  });

  Template.unknownChangeName.events({
    "keyup input#username": function(event) {
      // prevent default browser form submit
      event.preventDefault();
      // update unknown name
      var me = Session.get("Unknown");
      if (!Unknowns.findOne(me.id).moron) {
        Unknowns.update(me.id, { $set: {
          "name": event.target.name.value,
          "updatedAt": new Date()
        }});
      }
    }
  });

  Template.moronsCounter.events({
    "click button#moronCatcher": function() {
      // a wild moron appears
      var me = Session.get("Unknown");
      Unknowns.update(me.id, { $set: {
        "moron": true,
        "updatedAt": new Date(),
      }});
      $("button#moronCatcher").remove();
      $("form.update-unknown").html("<p>I told you not to click!</p>");
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {});
  Meteor.methods({
    getConnection: function () {
      return this.connection;
    }
  });
}