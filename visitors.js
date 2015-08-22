Visitors = new Mongo.Collection("visitors");
Errors = new Mongo.Collection("errors");

if (Meteor.isClient) {
  
  var me = {
    "name": "Anon",
    "moron": false,
    "createdAt": new Date()
  };
  me.id = Visitors.insert(me);
  Meteor.call("getConnection", function(error, result) {
    if (error) {
      Errors.insert(error);
      console.log("ERROR: ");
      console.log(error);
      return error;
    } else {
      me.connection = result;
      Visitors.update(me.id, { $set: {
        "connection": result,
        "updatedAt": new Date()
      }});
      return result;
    }
  });
  Session.setDefault("Visitor", me);

  Template.home.helpers({

    "morons": {
      "counter": function() {
        return Visitors.find({"moron": true}).count();
      },
      "title": function() {
        return (Visitors.find({"moron": true}).count() == 1) ? "moron" : "morons";
      }
    },
    "visitors": function() {
      return Visitors.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.home.events({
    "click button#moronCatcher": function() {
      // a wild moron appears
      var me = Session.get("Visitor");
      Visitors.update(me.id, { $set: {
        "moron": true,
        "updatedAt": new Date(),
      }});
      $("form.update-visitor").html("<p>I told you not to click!</p>");
    },
    "keyup input.update-visitor-field": function(event) {
      $("form.update-visitor").submit();
    },
    "submit form.update-visitor": function(event) {
      // prevent default browser form submit
      event.preventDefault();
      // update visitor name
      var me = Session.get("Visitor");
      if (!Visitors.findOne(me.id).moron) {
        Visitors.update(me.id, { $set: {
          "name": event.target.name.value,
          "updatedAt": new Date()
        }});
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Meteor.methods({
      getConnection: function () {
        return this.connection;
      }
    });
  });
}