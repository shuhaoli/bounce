var posts = ["s"];
var post_index = 0;
var post_count = 0;
var map;  // Google map object (global variable)

function left_card() {
  post_index = (post_index + post_count - 1) % post_count;
  console.log(post_index);
  retrieve_comments();
  retrieve_map();
}

function right_card() {
  post_index = (post_index + post_count + 1) % post_count;  
  console.log(post_index);
  if(post_index == post_count - 3) {
    retrieve_posts();
  }
  retrieve_comments();
  retrieve_map();
}

function retrieve_map() {
  $.get("http://bounce9833.azurewebsites.net/api/post_bounces", {post_id: posts[post_index]._id}, function(bounces) {
    // Create a Google coordinate object for where to center the map
    var latlngDC = new google.maps.LatLng( bounces[0].loc[0], bounces[0].loc[1] ); // Coordinates of Washington, DC (area centroid)
    
    // Map options for how to display the Google map
    var mapOptions = { zoom: 12, center: latlngDC  };

    // Show the Google map in the div with the attribute id 'map-canvas'.
    map = new google.maps.Map(document.getElementById(posts[post_index]._id + 'right'), mapOptions);

    console.log(bounces);

    for(var i = 0; i < bounces.length; i++) {
      var latlng = {lat: bounces[i].loc[1], lng: bounces[i].loc[0]};
      var marker = new google.maps.Marker({
        position: latlng,
        map: map,
      });
    }
  });
}

function retrieve_comments() {
  $.get("http://bounce9833.azurewebsites.net/api/comment", {post_id: posts[post_index]._id}, function(comments) {
    console.log($('#' + posts[post_index]._id + 'left'));
    var commentString = "";
    for (var i=0; i<comments.length; i++) {
      commentString += '<hr>' + comments[i].text + '<br>';
    }
    commentString += "<hr><input type='text' id='" + posts[post_index]._id + "comment' placeholder='Comment'></input> <a class='btn btn-primary' onclick='add_comment()'>Send</a>";
    $('#' + posts[post_index]._id + 'left').html(commentString);
    return comments;
  });
}

function retrieve_posts() {
  $.get("http://bounce9833.azurewebsites.net/api/post", {lat: 1, lng: 2, offset: post_count}, function(new_posts) {
    console.log(new_posts);
    posts = posts.concat(new_posts); 
    post_count = posts.length;
    for(var i = 0; i < new_posts.length; i++) {
      $("#card-view").append("<div class='item'>" +
                               "<div class='flex-container'>" +
                                "<div class='flex-container large-item flex-vertical'>" +
                                  "<div class='small-item card-left main-text' id='"+ new_posts[i]._id + "text'>" + new_posts[i].text + "</div>" +
                                  "<div class='small-item card-left' id='"+ new_posts[i]._id + "left'>Left</div>" +
                                "</div>" +
                                "<div id='" + new_posts[i]._id + "right' class='small-item card-right'>Right</div>" +
                              "</div>" +
                            "</div>");
    }
  });
}

function new_text_post() {
  var text = document.getElementById('text').value;
  new_post(text, "41sacxa", 1, 2); // Hard coded
}

function new_post(text, uid, lat, lng) {
  $.post("http://bounce9833.azurewebsites.net/api/post", {text: text, user_id: uid, lat: lat, lng: lng}, function(message) {
    console.log(message);
  });
}

function add_comment() {
  var text = document.getElementById(posts[post_index]._id + 'comment').value;
  $.post("http://bounce9833.azurewebsites.net/api/comment", {post_id: posts[post_index]._id, user_id: document.cookie, text: text}, function(message) {
    console.log(message);
  })
  retrieve_comments();
}

function bounce() {
  $.post("http://bounce9833.azurewebsites.net/api/bounce", {})
}

$(document).ready(function() {
  retrieve_posts();
})
