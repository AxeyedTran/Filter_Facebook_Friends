var _Friends = new Array();
var _Comments = new Array();
var _Reactions = new Array();
$("#table-friends").on('click', 'tr', function() {
    $(this).toggleClass('active');
});
function getListFriend() {
    _TOKEN = $("#accessToken").val();
	if (!_TOKEN) {
	    alert("Please Enter the Access Token Full Rights!");
		return false;
	}
	$("#result-msg").html('<img src="https://www.drupal.org/files/issues/throbber_13.gif" width="30" height="30" /> Get information. Please wait ...').fadeIn("slow");
	var gender = $("#gender").val();
	if (gender == 'male') {
		var a = 'AND sex != \'female\'';
		var a = 'SELECT friend_count, uid, name FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) AND sex != "female" ORDER BY rand() LIMIT 5000';

	} else if (gender == "female") {
		var a = 'SELECT friend_count, uid, name FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) AND sex != "male" ORDER BY rand() LIMIT 5000';
	} else if (gender == 'die'){
		var a = 'SELECT id, name FROM profile WHERE id IN (SELECT uid2 FROM friend WHERE uid1 = me()) AND name = "Facebook User" ORDER BY rand() LIMIT 5000';
	} else if(gender == '500fr'){
		var a = 'SELECT friend_count, uid, name FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) AND friend_count < 500 ORDER BY rand() LIMIT 5000';
	} else if(gender == 'k'){
		var a = 'SELECT locale, uid, name FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) AND locale != "vi_VN" ORDER BY rand() LIMIT 5000';
	} else if(gender == 'k'){
		var a = 'SELECT locale, uid, name FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) AND locale != "vi_VN" ORDER BY rand() LIMIT 5000';
	} else {
		var a = 'SELECT uid, name FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) ORDER BY rand() LIMIT 5000';
	}
	$.ajax({
		url: "https://graph.facebook.com/fql",
		type: "GET",
		dataType: "JSON",
		data: {
		    access_token: _TOKEN,
		    q: a
		},
		success: (data) => {
		    _Friends = data.data;
		    getStatus();
		}
	})
}

function showFriends(Data) {
	var arrFriends = new Array();
	$.each(Data, (i, item) => {
		arrFriends[i] = [
		    (i + 1),
		    '<img src="https://graph.facebook.com/' + item.uid + '/picture?width=30&height=30" /> <a target="_blank" href="https://fb.com/' + item.uid + '"> ' + item.name + '</a>',
		    item.uid,
		    item.reaction,
		    item.comment,
		    (item.comment * 2 + item.reaction) * 100
		];
	})
	$('#table-friends').DataTable({
		destroy: true,
		data: arrFriends,
		columns: [{
		        title: "NUMBER"
		    },
		    {
		        title: "FACEBOOKNAME "
		    },
		    {
		        title: "FACEBOOK ID"
		    },
		    {
		        title: "REACT"
		    },
		    {
		        title: "COMMENT"
		    },
		    {
		        title: "POINT"
		    },
		],
		"order": [
		    [5, "desc"]
		],
		"language": {
		    "search": "Search",
		    "paginate": {
		        "first": "To The Top",
		        "last": "Towards The End",
		        "next": "Forward",
		        "previous": "Backward"
		    },
		    "info": "Display _START_ to _END_ of _TOTAL_ item",
		    "infoEmpty": "Display 0 to 0 of 0 items",
		    "lengthMenu": "Show _MENU_ item",
		    "loadingRecords": "Loading...",
		    "emptyTable": "Nothing to show",
		}
	});
}

function getStatus() {
	$("#result-msg").empty().html('<img src="https://www.drupal.org/files/issues/throbber_13.gif" width="30" height="30" /> Getting Interactive Information...');
	var limit = $("#total_post").val();
	$.ajax({
		url: "https://graph.facebook.com/me/feed",
		type: "GET",
		dataType: "JSON",
		data: {
		    limit: limit,
		    access_token: _TOKEN,
		    fields: "id"
		},
		success: (data) => {
		    getComments(data.data);
		    getReactions(data.data);
		    setTimeout((e) => {
		        Ranking();
		    }, 10000)
		}
	})
}

function getReactions(Status) {
	var limit = 10000;
	for (var i = 0; i < Status.length; i++) {
		$.ajax({
		    url: "https://graph.facebook.com/" + Status[i].id + "/",
		    type: "GET",
		    dataType: "JSON",
		    data: {
		        access_token: _TOKEN,
		        fields: "reactions.limit(" + limit + ").summary(true)"
		    },
		    success: (data) => {
		        if (data.reactions.data) {
		            exPortReactions(data.reactions.data)
		        }
		    }
		})
	}
}

function exPortReactions(Reactions) {
	for (var i = 0; i < Reactions.length; i++) {
		_Reactions.push(parseInt(Reactions[i].id));
	}
}

function getComments(Status) {
	var limit = 1000;
	for (var i = 0; i < Status.length; i++) {
		$.ajax({
			url: "https://graph.facebook.com/" + Status[i].id + "/",
		    type: "GET",
		    dataType: "JSON",
		    data: {
		        access_token: _TOKEN,
		        fields: "comments.limit(" + limit + ").summary(true)"
		    },
		    success: (data) => {
		        if (data.comments.data) {
		            getComments2(data.comments.data);
		        }
		    }
		})
	}
}

function getComments2(Comments) {
	var limit = 2000
	for (var i = 0; i < Comments.length; i++) {
		_Comments.push(parseInt(Comments[i].from.id));
		$.ajax({
		    url: "https://graph.facebook.com/" + Comments[i].id + "/",
		    type: "GET",
		    dataType: "JSON",
		    data: {
		        access_token: _TOKEN,
		        fields: "comments.limit(" + limit + ").summary(true)"
		    },
		    success: (data) => {
		        if (data.comments) {
		            exPortComments(data.comments.data);
		        }
		    }
		})
	}
}

function exPortComments(Comments) {
	for (var i = 0; i < Comments.length; i++) {
		_Comments.push(parseInt(Comments[i].from.id));
	}
}

function Ranking() {
	$("#result-msg").empty().html('<img src="https://www.drupal.org/files/issues/throbber_13.gif" width="30" height="30" /> Calculating Rankings...');
	for (var i = 0; i < _Friends.length; i++) {
		_Friends[i].reaction = countItems(_Reactions, _Friends[i].uid);
		_Friends[i].comment = countItems(_Comments, _Friends[i].uid);
	}
	$("#ds-friends").fadeIn("slow");
	setTimeout((e) => {
		$("#result-msg").empty().html('<img src="http://uxotucung.org/wp-content/uploads/2016/03/tick-1-500x500.png" width="30" height="30" /> Successful!');
		show();
	}, 5000)
}

function show() {
	showFriends(_Friends);
}

function arrayCountValues(arr) {
	var v, freqs = {};
	for (var i = arr.length; i--;) {
		v = arr[i];
		if (freqs[v]) freqs[v] += 1;
		else freqs[v] = 1;
	}
	return freqs;
}

function countItems(arr, what) {
	var count = 0,
		i;
	while ((i = arr.indexOf(what, i)) != -1) {
		++count;
		++i;
	}
	return count;
}
$("Del_0_Point").html('<img src="https://www.drupal.org/files/issues/throbber_13.gif" width="30" height="30" /> Getting Information. Please wait...').fadeIn("slow");

function Del_0_Point() {
	$.each(_Friends, (i, item) => {
		if ((item.reaction + item.comment) === 0) {
		    removeFriend(i, item);
		}
	})
}

function Del_Selected() {
	var Data = $("#table-friends").DataTable().rows('.active').data();
	for (var i = 0; i < Data.length; i++) {
		removeFriend2(i, Data[i][2], Data[i][1].match(/"> (.*)</)[1]);
	}
}

function removeFriend2(i, FBID, NAME) {
	! function(i, FBID, NAME) {
		setTimeout(function() {
		    $.ajax({
		        url: 'https://graph.facebook.com/me/friends/' + FBID,
		        type: "GET",
		        dataType: "JSON",
		        data: {
		            access_token: _TOKEN,
		            method: "delete",
		        }
		    }).done((e) => {
		        $("#result-msg").fadeOut("slow", function() {
		            $("#result-msg").empty().html('<img src="https://www.ochealthiertogether.org/content/global/application/indicators/gauges/target-met.png" width="20" height="20" /> Deleted: <img src="https://graph.facebook.com/' + FBID + '/picture?width=30&height=30" /> ' + NAME + '(' + FBID + ')').fadeIn("slow");
		        })
		    }).error((e) => {
		        $("#result-msg").fadeOut("slow", function() {
		            $("#result-msg").empty().html('<img src="https://cdn.pixabay.com/photo/2017/02/12/21/29/false-2061132_960_720.png" width="20" height="20" /> Deleted: <img src="https://graph.facebook.com/' + FBID + '/picture?width=30&height=30" /> ' + NAME + '(' + FBID + ')').fadeIn("slow");
		        })
		    })
		}, i * 500)
	}
	(i, FBID, NAME)
}

function removeFriend(i, USER) {
	! function(i, USER) {
		setTimeout(function() {
		    $.ajax({
		        url: 'https://graph.facebook.com/me/friends/' + USER.uid,
		        type: "GET",
		        dataType: "JSON",
		        data: {
		            access_token: _TOKEN,
		            method: "delete",
		        }
		    }).done((e) => {
		        $("#result-msg").fadeOut("slow", function() {
		            $("#result-msg").empty().html('<img src="https://www.ochealthiertogether.org/content/global/application/indicators/gauges/target-met.png" width="20" height="20" /> Deleted: <img src="https://graph.facebook.com/' + item.uid + '/picture?width=30&height=30" /> ' + USER.name + '(' + USER.uid + ')').fadeIn("slow");
		        })
		    }).error((e) => {
		        $("#result-msg").fadeOut("slow", function() {
		            $("#result-msg").empty().html('<img src="https://cdn.pixabay.com/photo/2017/02/12/21/29/false-2061132_960_720.png" width="20" height="20" /> Deleted: <img src="https://graph.facebook.com/' + item.uid + '/picture?width=30&height=30" /> ' + USER.name + '(' + USER.uid + ')').fadeIn("slow");
		        })
		    })
		}, i * 300)
	}
	(i, USER)
}
