var myPlayList;	
window.lastTime = 0;
window.songs;
window.currentPlaylist = 0;
window.playlists = new Array();
var timer;
var mainMessage = '';

function song(id, link, amount){
	this.id = id;
	this.title = "";
	this.link = link;
	this.amount = amount;
	this.download = true;

	this.setTitle = function(title){
		this.title = title;
	}

	this.setDownload = function(download){
		this.download = download;
	}

	this.setLink = function(link){
		this.link = link;
	}

	this.getId = function(){
		return this.id;
	}

	this.getLink = function(){
		return this.link;
	}

	this.getAmount = function(){
		return this.amount;
	}

	this.getTitle = function(){
		return this.title;
	}

	this.getDownload = function(){
		return this.download;
	}
}

function songList(){
	this.songs = new Array();
	this.length = 0;

	this.add = function(song){
		this.songs.push(song);
		this.length++;
	};

	this.getSongOnLink = function(link){
		for(var i = 0; i < this.length; i++){
			if(this.songs[i].getLink() == link){
				return this.songs[i];
			}
		}
		return new song(0, '', 0);
	}

	this.getSongOnId = function(id){
		for(var i = 0; i < this.length; i++){
			if(this.songs[i].getId() == id){
				return this.songs[i];
			}
		}
		return new song(0, '', 0);
	}

	this.setTitle = function(id, title){
		var s = this.getSongOnId(id);
		if(s.getLink() == ''){
			s = new song(id, '', 0);
			this.add(s);
		}

		s.setTitle(title);
	}

	this.setDownload = function(id, download){
		this.getSongOnId(id).setDownload(download);

	}

	this.setLink = function(id, link){
		this.getSongOnId(id).setLink(link);

	}

	this.getPlayed = function(id){
		return this.getSongOnId(id).getAmount();
	}

	this.getId = function(link){
		return this.getSongOnLink(link).getId();
	}

	this.sortAmount = function(){
		this.songs.sort(function(a, b) {
			return b.getAmount() - a.getAmount();
		});
	}

	this.sortRandom = function(){
		this.songs.sort(function(a, b) {
			return 0.5 - Math.random();
		});
	}

	this.cleanUp = function(){
		for(var i = 0; i < this.length; i++){
			if(this.songs[i].getTitle() == ''){
				this.songs.splice(i, 1);
				this.length--;
			}
		}
	}

	this.slice = function(a){
		var r = new Array();

		if(a > this.length)
			a = this.length;		

		for(var i = 0; i < a; i++){
			if(this.songs[i].getTitle() == '')
				a++;
			else
				r.push(this.songs[i]);
		}		

		return r;
	}
}

$(document).ready(function(){
	myPlayList = new jPlayerPlaylist({
		jPlayer: "#jquery_jplayer_2",
		cssSelectorAncestor: "#left"
	}, [], {
		playlistOptions: {
			autoPlay: true, 
			enableRemoveControls: true
		},
		swfPath: "js",
		supplied: "mp3",
		wmode: "window"
	});
		
	loadSongs();
	//setMessage('Bedankt voor het enthousiasme voor Radio Phoenix, binnen 2 maanden zijn er al 100.000 nummers beluisterd! Blijf vooral nieuwe nummers sturen!');
  setMessage("Door problemen met het systeem is de teller voor alle nummers opnieuw begonnen. Excuses voor het ongemak.");

	$('#zoeken').keyup(function() {
		searchSong($(this).val());
	});

	$("#jquery_jplayer_2").bind($.jPlayer.event.timeupdate, function (event) {	
		if(parseInt(event.jPlayer.status.currentPercentAbsolute) > (window.lastTime + 70)) {
			$.post("played.php",{src: $('#jquery_jplayer_2').data().jPlayer.status.src});
			window.lastTime = parseInt(event.jPlayer.status.currentPercentAbsolute);
		}
		if(parseInt(event.jPlayer.status.currentPercentAbsolute) < window.lastTime)
			window.lastTime = parseInt(event.jPlayer.status.currentPercentAbsolute);
	});

	$(window).bind('hashchange', function() {
		checkPlaylist();
	});
	
	showMainMessage();

});

function setMainMessage(text){
  mainMessage = text;
}

function showMainMessage(){
  if(mainMessage != ""){
    $('#fMainMessage').html(mainMessage);
    $('#fMainMessage').show();
  }
}

function setCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function setMessage(mes){
	if(mes == '' && $('#messageBox').css('display') != 'none'){
		$('#messageBox').text('');
		$('#messageBox').hide(500);
	}else{
		$('#messageBox').text(mes);
		$('#messageBox').show();
		setTimeout("setMessage('')", 15000);
	}
}

function addPlaylist(sTitle, sLink, sFree, autoList){
	myPlayList.add({
		title: sTitle,
		mp3: 'http://radiophoenix.corps.nl/'+sLink,
		free: sFree
	});

	if(myPlayList.playlist.length == 1){
		myPlayList.play();
		$('#saveList').show();
	}

	if(!autoList){
		window.currentPlaylist = 0;
		$('#playlistMessage').hide(300);
	}
}

function emptyPlaylist(){
	myPlayList.remove();
	$('#saveList').hide();
}

function savePlaylist(){
	$('#saveListPopup').show();
}

function savePlaylistName(){
	if($('#saveListPopupName').val() == ''){
		$('#saveListPopupWarn').text('Vul een naam in.');
	}else if(myPlayList.playlist.length == 0){
		$('#saveListPopupWarn').text('Er staan geen nummers in de playlist.');
	}else{
		var nameList = $('#saveListPopupName').val();
		var songList = new Array();

		for(var i = 0; i < myPlayList.playlist.length; i++){
			songList.push(window.songs.getId(myPlayList.playlist[i].mp3));
		}

		$.post("playlist.php", {name: nameList, songs: songList.join(',')}, function(data){
			addOtherPlaylist(data, $('#saveListPopupName').val());
			addPlaylistCookie(data, $('#saveListPopupName').val());
			setPlaylistMessage("Eigen afspeellijst: " + $('#saveListPopupName').val());
			setPlaylistHash(data);

			$('#saveListPopup .results').children().remove();
			$('#saveListPopup .results').append($('<div></div>').text('Je kunt je afspeellijst doorsturen door de volgende link te kopiëren of deze uit de adres balk te halen:'));
			$('#saveListPopup .results').append($('<div></div<').text('radiophoenix.corps.nl/#list' + data));
			$('#saveListPopup .results').append($('<a href="javascript:;"></a>').text('Sluit venster.').click(function() {
				$('#saveListPopup .content').show();
				$('#saveListPopup .results').hide();
				$('#saveListPopup').hide();
			}));
			$('#saveListPopup .content').hide();
			$('#saveListPopup .results').show();
		});

	}
}

function checkPlaylist(){
	var loc = window.location.hash.indexOf('#list');
	if(loc >= 0){
		loadPlaylist(window.location.hash.substr(loc + 5));
	}
}

function loadPlaylist(id){
	emptyPlaylist();
	$.ajax({
		type: "GET",
	    	url: "playlist.php?id=" + id,
		dataType: "xml",
	  	success: parsePlaylist
	});
}

function setPlaylistMessage(text){
	if(text == '')
		$('#playlistMessage').hide();
	else{
		$('#playlistMessage').text(text);
		$('#playlistMessage').show();
	}
}

function setPlaylistHash(id){
	window.location.hash = "#list" + id;
}

function parsePlaylist(xml){
	if($(xml).find('ERROR').text() == ""){
		$(xml).find('SONG').each(function() {
			var s = window.songs.getSongOnId($(this).text());
			addPlaylist(s.getTitle(), s.getLink(), s.getDownload(), true);
		});
		window.currentPlaylist = $(xml).find('ID').text();
		addOtherPlaylist(window.currentPlaylist, $(xml).find('NAME').text());
		addPlaylistCookie(window.currentPlaylist, $(xml).find('NAME').text());
		setPlaylistHash(window.currentPlaylist);
		setPlaylistMessage("Afspeellijst: " + $(xml).find('NAME').text());
		setTimeout("myPlayList.select(0); myPlayList.play(0);", 1000);
	}else{
		setPlaylistMessage($(xml).find('ERROR').text());
	}
}

function addOtherPlaylists(){
	var span = $('#otherPlaylists');
	var lists = readCookie('playlists');
	
	setPlaylistMessage('');

	if(lists != null && lists != ''){
		lists = lists.split(",");
		for(var i = 0; i < lists.length; i++){
			var list = lists[i].split(":");
			addOtherPlaylist(list[0], list[1]);
		}
	}else
		span.append($('<i></i>').text('Geen gevonden..'));
}

function addPlaylistCookie(id, name){
	var lists = readCookie('playlists');

	if(lists == null || lists == '')
		var lists = '';
	else
		lists += ','

	lists += id + ':' + name;
	setCookie('playlists', lists, 100);
}

function addOtherPlaylist(id, name){
	if($.inArray(id, window.playlists) < 0){
		if(window.playlists.length == 0)
			$('#otherPlaylists').children().remove();
		else
			$('#otherPlaylists').append($('<span></span>').text(' | '));

		window.playlists.push(id);
		$('#otherPlaylists').append($('<a href="javascript:;"></a>').text(name).click(function() {
			loadPlaylist(id);
		}));
	}
}

function addSlideFunction(rootList){
	$(rootList + ' ul>li>div.handleBar').next().hide();	
	$(rootList + ' ul>li>div.handleBar').click(function() {
		if($(this).next().css('display') == 'none'){
			$(this).html($(this).html().substr(0, $(this).html().length-1) + '&#9660');
			$(this).next().show();
		}else{
			$(this).html($(this).html().substr(0, $(this).html().length-1) + '&#9658');
			$(this).next().hide();
		}
	});
}

function addAddedFunction(rootList){
	$(rootList + ' a').click(function() {
		$(this).parent().addClass('songInPlaylist');
	});
}

function addPlaylistLinks(){
	$('#emptyList').click(function() {
		emptyPlaylist();
	});

	$('#saveList').click(function() {
		savePlaylist();
	}).hide();
	$('#saveListPopupSave').click(function() {
		savePlaylistName();
	});
	$('#saveListPopupClose').click(function() {
		$('#saveListPopup').hide();
	});

	$('#listTop20').click(function() {
		loadPopulairPlaylist(20);
	});

	$('#listRandom20').click(function() {
		loadRandomPlaylist(20);
	});
}

function searchSong(needle){
	var total = 0;
	var hide = 0;

	$('#songlist').find('a').each(function() {
		total++;
		if($(this).text().toLowerCase().indexOf(needle.toLowerCase()) == -1){
			if($(this).parent().css('display') != 'none'){				
				$(this).parent().hide();
				$(this).parent().addClass('hiddenSearch');
			}
			hide++;
		}else{
			if($(this).parent().css('display') == 'none'){
				$(this).parent().show();
				$(this).parent().removeClass('hiddenSearch');
			}
			hide--;
		}
	});

	$('#songlist>i').remove();
	if(total == hide)
		$('#songlist').append($('<i></i>').text('Helaas, geen nummer gevonden..'));	

	$('#songlist ul>li>div.handleBar').each(function() {
		if($(this).next().css('display') == 'none'){
			$(this).html($(this).html().substr(0, $(this).html().length-1) + '&#9660');
			$(this).next().show();
		}
	});

	$('#songlist>ul ul').each(function() {
		if($(this).find('.hiddenSearch').length == $(this).find('li>a').length){
			$(this).parent().parent().hide();
		}else{
			$(this).parent().parent().show();
		}
	});

	if(needle.length == 0){
		$('#songlist ul>li>div.handleBar').each(function() {
			if($(this).next().css('display') != 'none'){
				$(this).html($(this).html().substr(0, $(this).html().length-1) + '&#9658');
				$(this).next().hide();
			}
		});
	}

}

function loadPopulairPlaylist(amount){
	emptyPlaylist();

	window.songs.sortAmount();
	$.each(window.songs.slice(amount), function(key, song){
		addPlaylist(song.getTitle(), song.getLink(), song.getDownload());
	});

	$('a.jp-shuffle').click();
}

function loadRandomPlaylist(amount){
	emptyPlaylist();

	window.songs.sortRandom();
	$.each(window.songs.slice(amount), function(key, song){
		addPlaylist(song.getTitle(), song.getLink(), song.getDownload());
	});

	$('a.jp-shuffle').click();
}

function loadSongs(){
	$.ajax({
		type: "GET",
	    	url: "data/played.xml",
		dataType: "xml",
	  	success: parsePlayed
	});
}

function parsePlayed(xml){
	var tot = 0;
	window.songs = new songList();
	$(xml).find('DATA>PLAYED').each(function() {
		window.songs.add(new song($(this).find('ID').text(), $(this).find('LINK').text(), $(this).find('AMOUNT').text()));
		tot += parseInt($(this).find('AMOUNT').text());
	});

	$('#totalViews').text('Totaal beluisterd: ' + tot + 'x');

	$.ajax({
		type: "GET",
	    	url: "data/songs.xml",
		dataType: "xml",
	  	success: parseSongs
	});
}

function buildSongList(xml){
	var r = $('<ul></ul>');
	var li;
	var i = 0;
	
	xml.each(function() {
		li = $('<li></li>');
		if($(this).is('FOLDER')){
			li.append($('<div></div>').addClass('handleBar').html($(this).children('NAME').text() + ' &#9658'));
			li.append($('<div></div>').append(buildSongList($(this).children('SONGS').children())));
		}else{
			i++;
			li.append($('<a></a>').
				attr('href', 'javascript:;').
				click({title: $(this).children('TITLE').text(), link: $(this).children('LINK').text(), download: $(this).children('DOWNLOAD').text()}, function(event) {
					addPlaylist(event.data.title, event.data.link, event.data.download);
				}).
				text($(this).children('TITLE').text()));

			var amount = window.songs.getPlayed($(this).children('ID').text());
			if(amount > 0)
				li.append($('<span></span>').addClass('playedAmount').text('(' + amount + 'x)'));

			window.songs.setTitle($(this).children('ID').text(), $(this).children('TITLE').text());
			window.songs.setLink($(this).children('ID').text(), $(this).children('LINK').text());
			window.songs.setDownload($(this).children('ID').text(), $(this).children('DOWNLOAD').text());
		}
		r.append(li);
	});
	r.data('inList', i);
	return r;
}

function parseSongs(xml){
	$('#songlist').append(buildSongList($(xml).find('DATA>SONGS').children()));

	//window.songs.cleanUp();

	addSlideFunction('#songlist');
	addAddedFunction('#songlist');
	addPlaylistLinks();
	addOtherPlaylists();

	checkPlaylist();

}