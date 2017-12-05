// this is the code which will be injected into a given page...
//added 23/04
//if friends never ignore.
//temporary ignore before server replies.
//name ignore option for repeated username different uuid.
//stop clicking noise.
console.log("inject");
if((window.location.href.indexOf('http://e-chat.co/room/')>=0&&window.location.href.length>22)||(window.location.href.indexOf('http://www.e-chat.co/room/')>=0&&window.location.href.length>26))
{
console.log("new verrsion 23/04/2017");
var manifest = chrome.runtime.getManifest();
var settings;
var lastMessageHistory={};
function Settings(settingsName, callbackReset)
{
    this.get = function (name)
    {
        try
        {
			return JSON.parse(localStorage.getItem(settingsName + '_' + name));
		}
		catch(ex)
		{
			return undefined;
		}
    };
    this.set = function (name, obj)
    {
        try
        {
        localStorage.setItem(settingsName + '_' + name, JSON.stringify(obj));
		}
	   catch(ex)
	   {
		   console.log(ex);
	   }
    };
    this.reset=callbackReset;
    Settings.instances.push(this);
}
Settings.getAll=function(){
    return localStorage;
};
Settings.addRange=function(obj)
{
    for(var key in obj)
    {
        localStorage.setItem(key, JSON.stringify(obj[key]));
    }
};
Settings.instances=[];
Settings.resetAll = function ()
{
    
};
settings = new Settings("all");

	function Timer(funct, delayMs, times)
{
    var self = this;
    var timesCount = 0;
    if (times == undefined)
    {
        times = -1;
    }
    if (delayMs == undefined)
    {
        delayMs = 10;
    }
    function tick()
    {
        if (times >= 0)
        {
            timesCount++;
            if (timesCount >= times)
            {
                self.stop();
            }
        }
        try
        {
            funct();
        }
        catch (ex)
        {
            console.log(ex);
        }
    }
        var interval;
        function setInterval()
        {
            interval = window.setInterval(tick, delayMs);
        }
        function cancelInterval()
        {
            if (interval)
            {
                clearInterval(interval);
            }
        }
        this.stop = function ()
        {
            cancelInterval();
        };
        this.reset = function ()
        {
            timesCount = 0;
            cancelInterval();
            setInterval();
        };
		this.setDelay=function(delay)
		{
			self.stop();
			delayMs = delay;
			self.reset();
		};
    setInterval();
}
; function Task(callback, done)
{
        this.run = function (c)
        {
    setTimeout(function() {
        try
        {
        callback();
        }catch(ex)
        {
         console.log(ex);
        }
                    if(done)
                    {
                        try
                        {
                     done();       
                        }
                        catch(ex)
                        {
         console.log(ex);
                        }
                    }
                    if(c)
                    {
                        try
                        {
                     c();       
                        }
                        catch(ex)
                        {
         console.log(ex);
                        }
                    }
    }, 0);

       };
}
function Iterator(array)
{
    var index=0;
    var length=array.length;
    this.next=function()
    {
        var next=array[index];
        index++;
        return next;
    };
    this.hasNext=function()
    {
      return index<length;
    };
    this.remove=function()
    {
        array.splice(index-1, 1);
        index--;
        length--;
    };
};
window.addEventListener("message", function(event) {
    if (event.source != window)
    return;
interpret(event.data);}, false);
var conversationUserUuid;
var doneFirstRemoveExpiredIgnores=false;
function interpret(message){
	  switch(message.type)
	  {
		  case 'newMessage':
		  if(getOn())
		  {
			seeIfRepeatMessage(message.messageContext);
		  }
		  break;
		  case 'ignoreList':
			_currentIgnoreList= message.list;
		  break;
		  case 'friendList':
			_friendList = message.list;
			var iterator = new Iterator(whenFriendListLoadsCallback);
			while(iterator.hasNext())
			{
				var callback = iterator.next();
				callback(_friendList);
				iterator.remove();
			}
			if(!doneFirstRemoveExpiredIgnores)
			{
			removeExpiredIgnores();
			doneFirstRemoveExpiredIgnores=true;
			}
		  break;
		  case 'userJoined':
		  
			seeIfJoinWasJen(message.info.data);
			seeIfPersistentRejoining(message.info.data);
			informFriendJoined(message.info.data);
		  break;
		  case 'notificationClick':
			var notification = mapNotificationIdToNotification[message.tag];
			if(notification)
				if(notification.onclick)
				{
					notification.onclick();
				}
		  break;
		  case 'notificationError':
			removeNotification(message.tag);
		  break;
		  case 'notificationClose':
			removeNotification(message.tag);
		  break;
		  case 'addFriendToNotifyMeWhenJoin':
			addFriendToNotifyMeWhenJoin(message.userUuid);
		  break;
		  case 'removeFriendToNotifyMeWhenJoin':
			removeFriendToNotifyMeWhenJoin(message.userUuid);
		  break;
		  case 'message':
		  break;
		  case 'notificationAdded':
			alertPm(message.cometdMessage);
		  break;
		  case 'opened':
		conversationUserUuid = message.userUuid;
			closeNotification(message.userUuid);
		  break;
		  case 'focused':
		conversationUserUuid = message.userUuid;
		closeNotification(message.userUuid);
		  break;
		  
	  }
}
var hasFocus = true;
window.addEventListener('focus', function() {
    hasFocus=true;
	closeNotification(conversationUserUuid);
});

window.addEventListener('blur', function() {
    hasFocus=false;
});
function alertPm(message)
{
	getFriendList(function(friendList){
		var userInfo = friendList[message.userUuid];
		if(userInfo)
		{
			if(getFriendMessageNotifications())
			{
				createMessageNotification(message.userUuid, userInfo.username, message.messageBody);
			}
		}
	});
}
var lastJoinedHistory={};
function seeIfPersistentRejoining(userInfo)
{
	if(userInfo.isGuest)
	{
	var oneMinuteAgo = addSeconds(new Date(), -60);
		var history = lastJoinedHistory[userInfo.username];
		if(history)
		{
			var iterator = new Iterator(history.joins);
			var countJoinsLastMinute = 0;
			while(iterator.hasNext())
			{
				var join = iterator.next();
				var date = new Date(parseInt(join.date, 10));
				if(date.getTime()<oneMinuteAgo.getTime())
				{
					iterator.remove();
				}
				else
				{
					countJoinsLastMinute++;
				}
			}
			if(countJoinsLastMinute>2)
			{
				console.log("ignoring"+ userInfo.username+" for keep changing userUuid (probably to troll)");
				addIgnore(userInfo.userUuid, userInfo.username);
			}
			history.joins.push({date:new Date().getTime()});
		}
		else
		{
			lastJoinedHistory[userInfo.username]={joins:[{date:new Date().getTime()}]};
		}
	}
}
var friendsJoinedInfo = {};
function informFriendJoined(userInfo){
	if(getFriendNotificationsOn())
	{
	getFriendList(function(friends){
		if(friends[userInfo.userUuid]!=undefined)
		{
		var friendJoinedInfo = friendsJoinedInfo[userInfo.userUuid];
		if(friendJoinedInfo!=undefined)
		{
			if(friendJoinedInfo.lastJoined)
			{
				var twoMinutesAgo = addSeconds(new Date(), -120);
				if(friendJoinedInfo.lastJoined.getTime()<twoMinutesAgo.getTime())
				{
					friendJoinedInfo.lastJoined = new Date();
					createFriendJoinedNotification(userInfo);
				}
			}
			else{
				friendJoinedInfo.lastJoined = new Date();
				createFriendJoinedNotification(userInfo);
			}
		}
		else{
			friendJoinedInfo ={lastJoined:new Date()};
			friendsJoinedInfo[userInfo.userUuid]=friendJoinedInfo;
			createFriendJoinedNotification(userInfo);
		}
		}
	}
	);
	}
}
function createFriendJoinedNotification(userInfo)
{
	createNotificationForUser(userInfo.userUuid,{icon:"http://e-chat.co/Resources/Website/Users/"+userInfo.userUuid+"/default.png", image:"", title:userInfo.username, body:"has joined e-chat!!!! :)"}, function(){
				openPmWithFriend(userInfo.userUuid);			
			});
}
function openPmWithFriend(userUuid)
{
	window.postMessage({ type: 'openPm', userUuid:userUuid}, "*");
}

var notificationIdCount=0;
var mapNotificationIdToNotification={};
function getNotificationId()
{
	return "notification_"+String(notificationIdCount++);
}
function removeNotification(tag)
{
	var notification = mapNotificationIdToNotification[tag];
	if(notification)
		delete notification;
}
function createNotification(obj, onclick)
{
	var id = getNotificationId();
	mapNotificationIdToNotification[id]={onclick:onclick};
	window.postMessage({ type: 'createNotification', obj:obj, tag:id}, "*");
	return id;
}
var mapUserUuidToNotificationId ={};
function closeNotification(userUuid)
{
		var notificationId = mapUserUuidToNotificationId[userUuid];
		if(notificationId)
	window.postMessage({ type: 'closeNotification', tag:notificationId}, "*");
}
function  createNotificationForUser(userUuid, obj, onclick){
	if(userUuid)
	{
		closeNotification(userUuid);
		mapUserUuidToNotificationId[userUuid]=createNotification(obj, onclick);
	}
}
var mapUserUuidToPreviousMessageInfo ={};
function createMessageNotification(userUuid, username, latestMessage)
{
	
	var str = "";
	var previousMessageInfo = mapUserUuidToPreviousMessageInfo[userUuid];
	if(previousMessageInfo)
	{
	previousMessageInfo.latestMessage=latestMessage;
	if(latestMessage)
		previousMessageInfo.messages.push(latestMessage);
		var lastNotified = previousMessageInfo.lastNotified;
		var _30SecondsAgo = addSeconds(new Date(), -30).getTime();
		if(lastNotified<_30SecondsAgo||lastNotified==undefined)
		{
			var timer=previousMessageInfo.timer;
			if(timer)
			if(timer)
			{
				timer.setDelay(5000);
				timer.reset();
			}
			else{
					timer = new Timer(function(){
						_createMessageNotification(userUuid, username, previousMessageInfo);
					}, 5000, 1);
					previousMessageInfo.timer=timer;
			}
		}
		else{
			var millisecondsToWait = 5000+new Date().getTime()- _30SecondsAgo;
			millisecondsToWait=millisecondsToWait<0?0:millisecondsToWait;
			var timer = previousMessageInfo.timer;
			if(timer)
			{
				timer.setDelay(millisecondsToWait);
				timer.reset();
			}
			else{
					timer = new Timer(function(){
						_createMessageNotification(userUuid, username, previousMessageInfo);
					}, millisecondsToWait, 1);
					previousMessageInfo.timer=timer;
			}
		}
		
	}
	else
	{
					timer = new Timer(function(){
						_createMessageNotification(userUuid, username, previousMessageInfo);
					}, 5000, 1);
		previousMessageInfo={messages:[], timer:timer};
		previousMessageInfo.latestMessage=latestMessage;
		if(latestMessage)
			previousMessageInfo.messages.push(latestMessage);
		mapUserUuidToPreviousMessageInfo[userUuid]=previousMessageInfo;
	}
}
function _createMessageNotification(userUuid, username, previousMessageInfo)
{
	if(getFriendMessageNotifications()&&!hasFocus)
	{
	previousMessageInfo.lastNotified  = new Date().getTime();
	var str = "";
		var count = previousMessageInfo.messages.length;
		var startIndex=count-4>=0?count-4:0;
		var i=startIndex;
		while(i<count)
		{
			var message = previousMessageInfo.messages[i];
			if(message)
				str+=message+"\n";
			i++;
		}
		previousMessageInfo.messages.splice(0, startIndex);
	createNotificationForUser(userUuid, {icon:"http://e-chat.co/Resources/Website/Users/"+userUuid+"/default.png", image:"", title:(!previousMessageInfo.latestMessage?username + " sent you a message!":username+"..."), body:(previousMessageInfo.latestMessage?str:"")}, function(){
				openPmWithFriend(userUuid);			
			});
	}
}
function getIcon()
{
	if(manifest.icons)
	{
		for(var i in manifest.icons)
		{
			return "/"+manifest.icons[i];
		}
	}
}
function seeIfJoinWasJen(data){
	if(data.username.indexOf("Jen")==0||data.username.indexOf("jen")==0||!isNaN(parseFloat(data.username)))
	{
			console.log(   'ignoring '+data.username+" for being a JenXXXXX");
			addIgnore(data.userUuid, data.username);
	}
	var foundCharacter=false;

}
function seeIfRepeatMessage(messageContext)
{
if(!isNaN(parseFloat(messageContext.username))||messageContext.username.indexOf("mike")>=0&&messageContext.username.indexOf("cool")>=0)
	{
			console.log(   'ignoring '+messageContext.username+" for being uncool");
			addIgnore(messageContext.userUuid, messageContext.username);
	}
	if(messageContext.username.indexOf("Jen")==0||messageContext.username.indexOf("jen")==0)
	{
			console.log(   'ignoring '+messageContext.username+" for being a JenXXXXX");
			addIgnore(messageContext.userUuid, messageContext.username);
	}
	else{
	var lastMessage = lastMessageHistory[messageContext.userUuid];
	if(lastMessage!=undefined)
	{
		if(_seeIfRepeatMessageRecent(lastMessage, messageContext.messageBody))
		{
			console.log(   'ignoring '+messageContext.username+" for sending same message too often");
			addIgnore(messageContext.userUuid, messageContext.username);
			lastMessage.count=1;
		}
		else
		{
			if(lastMessage.content==messageContext.messageBody&&(!((messageContext.username.indexOf("Software_Engineer")==0)&&(messageContext.username.length==17))))
			{
				getIsFriend(messageContext.userUuid, function(isFriend){
					if(!isFriend)
					{
					if((getIncludeShortMessages()?true:messageContext.messageBody.length>4)&&lastMessage.count>=getNRepeats())		
				{	
				console.log(   'ignoring '+messageContext.username+" for sending a repeat message");
				addIgnore(messageContext.userUuid, messageContext.username);
				}
				else{
					lastMessage.count++;
				}
					}
					else
					 lastMessage.count=1;
				});
			}
			else
				lastMessage.count=1;
		}
		
	}
	else
	{
		lastMessage = {count:1,recents:{lastMessage:{ats:[new Date().getTime()]}}};
		lastMessageHistory[messageContext.userUuid]=lastMessage;
	}
	lastMessage.content=messageContext.messageBody;
	}
}
function _seeIfRepeatMessageRecent(lastMessage, latestMessage)
{
	var minuteAgo = new Date().getTime()-60000;
	var ignore=false;
	if(latestMessage.length>10)
	{
		var nTimesToIgnore = latestMessage.length>40?3:2;
		var count=0;
		var infos = lastMessage.recents[latestMessage];
		if(infos)
		{
			var iterator = new Iterator(infos.ats);
			while(iterator.hasNext())
			{
				var date = iterator.next();
				if(date > minuteAgo)
				{
					count++;
					if(count>=nTimesToIgnore)
					{
						ignore = true;
					}
				}
				else
					iterator.remove();
			}
			infos.ats.push(new Date().getTime());
		}
		else
			lastMessage.recents[latestMessage]={ats:[new Date().getTime()]};
	}
	return ignore;
};
function addIgnore(userUuid, username)
{
	window.postMessage({ type: 'addIgnore', userUuid:userUuid, username:username }, "*");
	ignoreHistory.add(userUuid, username);
}
function removeIgnore(userUuid)
{
	window.postMessage({ type: 'removeIgnore', userUuid:userUuid }, "*");
}
function getIsFriend(userUuid, callback)
{
	getFriendList(function(friendList){
	callback( friendList[userUuid ]==undefined?false:true);
	});
}
function setOn(value){
	_on=value;
	settings.set("on", {value:value});
}
var _on;
function getOn()
{
	if(_on==undefined)
	{
		var on = settings.get("on");
		if(on)
		{
			_on=on.value;
		}
		else
			return true; 
	}
	return _on;
}
function setFriendMessageNotifications(value){
	_friendMessageNotifications=value;
	settings.set("friendMessageNotifications", {value:value});
}
var _friendMessageNotifications;
function getFriendMessageNotifications()
{
	if(_friendMessageNotifications==undefined)
	{
		var on = settings.get("friendMessageNotifications");
		if(on)
		{
			_friendMessageNotifications=on.value;
		}
		else
			return true; 
	}
	return _friendMessageNotifications;
}
function setBlockSounds(value){
	_blockSounds=value;
	settings.set("blockSounds", value);
		window.postMessage({ type: 'blockSounds', blockSounds:value}, "*");
}
var _blockSounds=settings.get("blockSounds");
if(_blockSounds==undefined)
{
	_blockSounds='none';
}
window.postMessage({ type: 'blockSounds', blockSounds:_blockSounds}, "*");
function getBlockSounds()
{
	return _blockSounds;
}
var _friendsToNotifyMeWhenJoin = settings.get("friendsToNotifyMeWhenJoin");
function addFriendToNotifyMeWhenJoin(userUuid)
{
	if(_friendsToNotifyMeWhenJoin.indexOf(userUuid)<0)
	{
		_friendsToNotifyMeWhenJoin.push(userUuid);
		saveFriendsToNotifyMeWhenJoin();
	}
}
function removeFriendToNotifyMeWhenJoin(userUuid)
{
	var index = _friendsToNotifyMeWhenJoin.indexOf(userUuid);
	if(index>=0)
	{
		_friendsToNotifyMeWhenJoin.splice(index, 1);
		saveFriendsToNotifyMeWhenJoin();
	}
}
function saveFriendsToNotifyMeWhenJoin ()
{
	settings.set("friendsToNotifyMeWhenJoin", _friendsToNotifyMeWhenJoin);
	window.postMessage({ type: 'friendsToNotifyMeWhenJoin', friendsToNotifyMeWhenJoin:_friendsToNotifyMeWhenJoin}, "*");
}
function setFriendNotificationsOn(value){
	_friendNotificationsOn=value;
	settings.set("friendNotificationsOn", {value:value});
}
var _friendNotificationsOn;
function getFriendNotificationsOn()
{
	if(_friendNotificationsOn==undefined)
	{
		var on = settings.get("friendNotificationsOn");
		if(on)
		{
			_friendNotificationsOn=on.value;
		}
		else
			return true;
	}
	return _friendNotificationsOn;
}
var _currentIgnoreList;
function getCurrentIgnoreList(callback)
{
	if(!_currentIgnoreList)
	{
		window.postMessage({ type: 'getIgnoreList'}, "*");
new Task(function(){
	new Task(function(){
		callback(_currentIgnoreList);
	}).run();
}).run();
	} 
else{
callback(_currentIgnoreList);
}
}
var _friendList;
var whenFriendListLoadsCallback=[];
function getFriendList(callback)
{
	if(!_friendList)
	{
		whenFriendListLoadsCallback.push(callback);
	} 
else{
callback(_friendList);
}
}
var ignoreHistory = new (function(){
	var self = this;
	var list;
	var timerSave;
	this.getList = function(){
		if(!list)
		{
			list = settings.get("ignoreHistory");
			if(!list)
			{
				list = {};
			}
		}
		return list;
	};
	this.add=function(userUuid, username)
	{
		var list = self.getList();
		if(list[userUuid]==undefined)
		{
			list[userUuid]={date:new Date().getTime(), username:username};
			save();
		}
	};
	this.remove=function(userUuid)
	{
		var list = self.getList();
		if(list[userUuid]!=undefined)
		{
			delete list[userUuid];
			save();
		}
	}
	function save()
	{
		if(!timerSave)
		{
			timerSave = new Timer(function(){
				settings.set("ignoreHistory", self.getList());
			}, 1000, 1);
		}
		else
			timerSave.reset();
	}
});
function addDays(date, days)
{
	date.setDate(date.getDate() + days);
}
function addSeconds(date, seconds)
{
return new Date(date.getTime() + 1000*seconds);
}
function getExpireThresholdDate()
{
	var date = new Date();
	addDays(date, -3);
	return date;
}
function userHasExpiredByDate(addedDate, expireThresholdDate)
{ if(addedDate==undefined)
 return true;
	return addedDate.getTime()<expireThresholdDate.getTime(); 
}
function userHasPermanentlyExpired(userUuid, info)
{
	if(info)
	{
		if(info.isDeleted)
		{
			return true;
		}
	}
	return false;
}
function continueRemoveIgnored(timer, list)
{
	if(list.length<1)
	{
		timer.stop();
		delete timer;
	}
	else
	{
		var count=((list.length>=2)?2:list.length);
		for(var i=0; i<count; i++)
		{
			var spliced = list.splice(0, 1)[0];
			removeIgnore(spliced.userUuid);
			ignoreHistory.remove(spliced.userUuid);
			console.log("removed user from ignore list: "+spliced.username);
		}
	}
}
function removeExpiredIgnores()
{
		var storedHistory = ignoreHistory.getList();
		var toRemove=[];
		getCurrentIgnoreList(function (currentIgnoreList){
		var expireThresholdDate = getExpireThresholdDate();
		for(var i in storedHistory)
		{
			var userInfo = storedHistory[i];
			if(userHasExpiredByDate(new Date(parseInt(userInfo.date, 10)), expireThresholdDate))
			{
				toRemove.push({userUuid:i, username:userInfo.username});
			}
		}
		for(var i in currentIgnoreList)
		{
			var info = currentIgnoreList[i];
			if(userHasPermanentlyExpired(i,info))
			{
				toRemove.push({userUuid:i, username:info.username});
			}
			else
			{
				
			}
		}
		var timerRemove;
		timerRemove = new Timer(function(){continueRemoveIgnored(timerRemove, toRemove);}, 400, -1);
		});
}
function setNRepeats(value){
	_nRepeats=value;
	settings.set("nRepeats", {value:value});
}
var _nRepeats;
function getNRepeats()
{
	if(_nRepeats==undefined)
	{
		var nRepeats = settings.get("nRepeats");
		if(nRepeats)
		{
			_nRepeats=nRepeats.value;
		}
		else
			return 3;
	}
	return _nRepeats;
}
function setIncludeShortMessages(value){
	_includeShortMessages=value;
	settings.set("includeShortMessages", {value:value});
}
var _includeShortMessages;
function getIncludeShortMessages()
{
	var value = false;
	if(_includeShortMessages==undefined)
	{
		var includeShortMessages = settings.get("includeShortMessages");
		if(includeShortMessages)
		{
			_includeShortMessages=includeShortMessages.value;
		}
		else
			return false;
	}
	return _includeShortMessages;
}
function setTextStored(value){
	settings.set("textStored", {value:value});
}
function getTextStored()
{
	var value = false;
	var textStored = settings.get("textStored");
	if(textStored)
	{
		return textStored.value;
	}
	return "";
}
function createGraphics()
{
	var div = document.createElement('div');
	div.style.position='fixed';
	div.style.width='200px';
	div.style.height='auto';
	div.style.bottom='0px';
	div.style.left='0px';
	div.style.zIndex='1000';
	function OnOffButton(onText, offText, set, get){
		var self = this;
	this.button = document.createElement('button');
	this.button.style.position='relative';
	this.button.style.float='top';
	this.button.addEventListener('click', function(){
		if(get())
		{
			set(false);
			setButtonOnOffImage(false);
		}else{
			set(true);
			setButtonOnOffImage(true);
		}
	});
	function setButtonOnOffImage(isOn)
	{
		if(isOn)
		{
			self.button.textContent=onText;
			self.button.style.borderColor='green';
		}
		else{
			
			self.button.textContent=offText;
			self.button.style.borderColor='red';
		}
	}
	setButtonOnOffImage(get());
	}
	
	var onOffButton = new OnOffButton("Turn Off ig rpt msgs", "Turn On ig rpt msgs", setOn, getOn);
	var onOffButtonNotificationsFriends = new OnOffButton("Turn Off frnd join ntifs", "Turn On frnd join ntifs", setFriendNotificationsOn, getFriendNotificationsOn);
	var onOffButtonFriendMessageNotifications = new OnOffButton("Turn Off frnd msg ntifs", "Turn On frnd msg ntifs", setFriendMessageNotifications, getFriendMessageNotifications);
	var divIncludeShortMessages = document.createElement('div');
	divIncludeShortMessages.style.position='relative';
	divIncludeShortMessages.style.float='top';
	divIncludeShortMessages.style.fontSize='12px';
	divIncludeShortMessages.style.fontWeight='Bold';
	var divIncludeShortMessagesText = document.createElement('div');
	divIncludeShortMessagesText.style.position='relative';
	divIncludeShortMessagesText.style.float='left';
	divIncludeShortMessagesText.textContent="Inc shrt msgs: ";
	divIncludeShortMessagesText.style.fontSize='12px';
	divIncludeShortMessagesText.style.fontWeight='Bold';
	var selectIncludeShortMessages = document.createElement('select');
	selectIncludeShortMessages.style.position='relative';
	selectIncludeShortMessages.style.float='left';
	var optionYes = document.createElement("option");
	optionYes.value="Yes";
	optionYes.textContent="Yes";
	var optionNo= document.createElement("option");
	optionNo.value="No";
	optionNo.textContent="No";
	selectIncludeShortMessages.appendChild(optionNo);
	selectIncludeShortMessages.appendChild(optionYes);
	selectIncludeShortMessages.addEventListener('change', function(){
	});
	selectIncludeShortMessages.value=getIncludeShortMessages()?"Yes":"No";
	
	var divBlockSounds = document.createElement('div');
	divBlockSounds.style.position='relative';
	divBlockSounds.style.float='top';
	divBlockSounds.style.fontSize='12px';
	divBlockSounds.style.fontWeight='Bold';
	var divBlockSoundsText = document.createElement('div');
	divBlockSoundsText.style.position='relative';
	divBlockSoundsText.style.float='left';
	divBlockSoundsText.textContent="Block Sounds";
	divBlockSoundsText.style.fontSize='12px';
	divBlockSoundsText.style.fontWeight='Bold';
	var selectBlockSounds = document.createElement('select');
	selectBlockSounds.style.position='relative';
	selectBlockSounds.style.float='left';
	var optionNone = document.createElement("option");
	optionNone.value="none";
	optionNone.textContent="None";
	var optionAll= document.createElement("option");
	optionAll.value="all";
	optionAll.textContent="All";
	var optionAllowFriends= document.createElement("option");
	optionAllowFriends.value="allowFriends";
	optionAllowFriends.textContent="Allow Friends";
	selectBlockSounds.appendChild(optionNone);
	selectBlockSounds.appendChild(optionAll);
	selectBlockSounds.appendChild(optionAllowFriends);
	selectBlockSounds.addEventListener('change', function(){
			setBlockSounds(selectBlockSounds.value);
	});
	selectBlockSounds.value=getBlockSounds();
	divBlockSounds.appendChild(divBlockSoundsText);
	divBlockSounds.appendChild(selectBlockSounds);
	
	var divNRepeats = document.createElement('div');
	divNRepeats.style.position='relative';
	divNRepeats.style.float='top';
	divNRepeats.style.fontSize='12px';
	divNRepeats.style.fontWeight='Bold';
	var divNRepeatsText = document.createElement('div');
	divNRepeatsText.style.position='relative';
	divNRepeatsText.style.float='left';
	divNRepeatsText.textContent="N rpts = ignore: ";
	divNRepeatsText.style.fontSize='12px';
	divNRepeatsText.style.fontWeight='Bold';
	var selectNRepeats = document.createElement('select');
	selectNRepeats.style.position='relative';
	selectNRepeats.style.float='left';
	for(var i=1; i<4; i++)
	{
		var option = document.createElement("option");
		option.value=i;
		option.textContent=String(i);
		selectNRepeats.appendChild(option);
	}
	selectNRepeats.addEventListener('change', function(){
			setNRepeats(selectNRepeats.value);
	});
	selectNRepeats.value=getNRepeats();
	div.appendChild(onOffButton.button);
	div.appendChild(onOffButtonNotificationsFriends.button);
	div.appendChild(onOffButtonFriendMessageNotifications.button);
	divIncludeShortMessages.appendChild(divIncludeShortMessagesText);
	divIncludeShortMessages.appendChild(selectIncludeShortMessages);
	div.appendChild(divBlockSounds);
	div.appendChild(divIncludeShortMessages);
	divNRepeats.appendChild(divNRepeatsText);
	divNRepeats.appendChild(selectNRepeats);
	div.appendChild(divNRepeats);
	document.documentElement.appendChild(div);
}
var InputTextArea = document.getElementById('InputTextArea');
createGraphics();

	var timerClearExpiredIgnores = new Timer(function(){
		removeExpiredIgnores();
	}, 600000);
var current = document.getElementById('_unistr');
if(current){
    current.parentNode.removeChild(current);
}
var script = document.createElement('script');
script.id = '_unistr';
var str = String(Timer)+String(Task)+String.raw`

window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;

new Timer(function(){
	console.log($.Cometd);
}, 1000, 1);
interpret(event.data);}, false);
var friendsToNotifyMeWhenJoin=[];
var enableFriendJoinedNotificationUrl;
var dissableFriendJoinedNotificationUrl;
var blockSounds = true;
var notifications ={};
  function interpret(message)
  {
	  switch(message.type)
	  {
		  case 'addIgnore':
		  
		$.cometd.publish('/service/ignored/add',
		{
			userUuid : message.userUuid, username:message.username
		});
        userData = com.echat.shared.context.Ignored.populateIgnoredContext({userUuid:message.userUuid, username:message.username});
        com.echat.shared.context.Ignored.IgnoredList[userData.userUuid] = userData;
        com.echat.shared.GlobalUtils.refreshInterface();   
        com.echat.shared.popup.user.Controller.refreshPopupOptions(userData.userUuid);
		  break;
		  case 'removeIgnore':
		$.cometd.publish('/service/ignored/remove',
		{
			userUuid : message.userUuid
		});
		  break;
		  case 'signIn':
			com.echat.shared.authentication.Controller.sendAuthenticationRequest('/authentication/guest', message.message.username);
		  break;
		  case 'setup':
			enableFriendJoinedNotificationUrl= message.obj.enableFriendJoinedNotificationUrl;
			dissableFriendJoinedNotificationUrl=message.obj.dissableFriendJoinedNotificationUrl;
		  break;
		  case 'getIgnoreList':
	window.postMessage({ type: 'ignoreList', list:com.echat.shared.context.Ignored.IgnoredList }, "*");
		  break;
		  case 'getFriendList':
	window.postMessage({ type: 'friendList', list:com.echat.shared.context.Friends.FriendsList }, "*");
		  break;
		  case 'closeNotification':
		  var notification = notifications[message.tag];
		  if(notification)
			notification.close();
		  break;
		  case 'createNotification':	  
if (Notification.permission !== "granted") {
Notification.requestPermission((new(function(title, obj, tag){this.create = function(){ createNotification(title, obj, tag);};})(message.obj.title, message.obj, message.tag)).create);
}
else
{
	createNotification(message.obj.title, message.obj, message.tag);
 }
		  break;
		  case 'friendsToNotifyMeWhenJoin':
			friendsToNotifyMeWhenJoin = message.friendsToNotifyMeWhenJoin;
		  break;
		  case 'openPm':
			com.echat.shared.conversation.Controller.openConversation(message.userUuid);
      window.parent.focus();
      window.focus(); //just in case, older browsers
      this.close();
		  break;
		  case 'blockSounds':
			blockSounds = message.blockSounds;
		  break;
	  }
  }
  function createNotification(title, obj, tag)
  {
	  obj.tag=tag;
var notification = new Notification(title, obj);
	notification.addEventListener("click", function(e){
	window.postMessage({ type: 'notificationClick',tag:e.target.tag}, "*");
	});
	notification.addEventListener("error", function(e){
	window.postMessage({ type: 'notificationError', tag:e.target.tag}, "*");
	});
	notification.addEventListener("close", function(e){
		delete notifications[obj.tag];
	window.postMessage({ type: 'notificationClose', tag:e.target.tag}, "*");
	});
	for(var i in obj)
	{
		notification[i]=obj[i];
	}
	notifications[tag]=notification;
  }
  var oldBeepIncomingMessageSound = com.echat.shared.audio.notification.Controller.beepIncomingMessageSound;
	//com.echat.shared.audio.notification.Controller.beepIncomingMessageSound=function(){
	//	if(!blockSounds)
	//	oldBeepIncomingMessageSound();
	//};
	com.echat.shared.conversation.notifications.Controller.addNotificationDisplayEntry = function(notificationUserContext)
	{
		if (com.echat.widget)
		{
			if (com.echat.widget.full)
			{

			}
			else if (com.echat.widget.column)
			{

			}
		}
		else
		{
			com.echat.website.display.conversation.Notifications.appendNotificationEntry(notificationUserContext);

			var username = notificationUserContext.username;

			com.echat.shared.title.window.Controller.flashBrowserWindowIfBlurred(username);
			switch(blockSounds)
			{
				case 'none':
			com.echat.shared.audio.notification.Controller.beepIncomingMessageSound();
			break;
			case 'allowFriends':
					if(com.echat.shared.context.Friends.FriendsList [notificationUserContext.userUuid])
						com.echat.shared.audio.notification.Controller.beepIncomingMessageSound();
				break;
			}
		}
	};
  com.echat.shared.context.Ignored.isUserIgnored=function (userUuid)
    {
			return com.echat.shared.context.Ignored.IgnoredList[userUuid] ? true : false;
    };
	
	var oldDisplayNewMessage=com.echat.shared.display.Chatroom.displayNewMessage;
	com.echat.shared.display.Chatroom.displayNewMessage=function (messageContext)
    {
		window.postMessage({ type: 'newMessage', messageContext:messageContext }, "*");
		if(!com.echat.shared.context.Ignored.isUserIgnored(messageContext.userUuid))
		{
			oldDisplayNewMessage(messageContext);
		}
    };
		$.cometd.addListener('/service/conversation/notification/added',
		function(cometdMessage){
	window.postMessage({ type: 'notificationAdded', cometdMessage:cometdMessage.data}, "*");});
	$.cometd.addListener('/service/friends/add', function(userInfo){
	window.postMessage({ type: 'friendList', list:com.echat.shared.context.Friends.FriendsList }, "*");
		window.postMessage({ type: 'addFriendToNotifyMeWhenJoin', userUuid:userInfo.data.userUuid}, '*');
	});
	$.cometd.addListener('/service/friends/remove', function(userInfo){
	window.postMessage({ type: 'friendList', list:com.echat.shared.context.Friends.FriendsList }, "*");
	});
	$.cometd.addListener('/chatroom/user/joined/*', function(info){
	window.postMessage({ type: 'userJoined', info:info }, "*");
	});
		$.cometd.addListener('/service/user/context/self/complete', function(obj){
			
					new Task(function(){
	window.postMessage({ type: 'friendList', list:com.echat.shared.context.Friends.FriendsList}, "*");
					}).run();
	});
	$.cometd.addListener('/service/conversation/message',
			function(message){
	window.postMessage({ type: 'message', message:message.data}, "*");
			});
		var oldFocusConversation = com.echat.shared.conversation.Controller.focusConversation;
		com.echat.shared.conversation.Controller.focusConversation=function(conversationUserUuid){
	window.postMessage({ type: 'focused', userUuid:conversationUserUuid}, "*");
			oldFocusConversation(conversationUserUuid);
		};
	var oldGetBasicPopupObject= com.echat.shared.popup.user.Utils.getBasicPopupObject;
	com.echat.shared.popup.user.Utils.getBasicPopupObject = function(){
		var obj = oldGetBasicPopupObject();
		return obj;
	};
	var oldOpenConversation = 	com.echat.shared.conversation.Controller.openConversation;
		com.echat.shared.conversation.Controller.openConversation=function(userUuid)
		{
	window.postMessage({ type: 'opened', userUuid:userUuid}, "*");
			oldOpenConversation(userUuid);
		}
	var oldGetOptionsHtml= com.echat.shared.popup.user.Utils.getOptionsHtml;
	com.echat.shared.popup.user.Utils.getOptionsHtml=function(userUuid){
		var optionsHtml = oldGetOptionsHtml(userUuid);
		if(com.echat.shared.context.Friends.FriendsList[userUuid])
		{
			var isNotif = friendsToNotifyMeWhenJoin.indexOf(userUuid)>=0;
			optionsHtml+="<div class=\"UserPopupOption\" onclick=\""+
			(isNotif?(
			"friendsToNotifyMeWhenJoin.splice(friendsToNotifyMeWhenJoin.indexOf('"+String(userUuid)+"'), 1);window.postMessage({ type: 'removeFriendToNotifyMeWhenJoin', userUuid:'"+String(userUuid)+"'}, '*');"
			):(
			"friendsToNotifyMeWhenJoin.push('"+String(userUuid)+"');window.postMessage({ type: 'addFriendToNotifyMeWhenJoin', userUuid:'"+String(userUuid)+"'}, '*');"
			))+
			"com.echat.shared.popup.user.Controller.refreshPopupOptions('"+String(userUuid)+"');\"><img src=\""
			+(isNotif?
			dissableFriendJoinedNotificationUrl+"\"/><span>Remove Join Notif</span>"
			:
			enableFriendJoinedNotificationUrl+"\"/><span>Add Join Notif</span>")
			+
			"</div>";
		}
		return optionsHtml;
	};
`;

script.innerHTML = str;
document.body.appendChild(script);
window.postMessage({ type: 'setup', obj:{enableFriendJoinedNotificationUrl:chrome.extension.getURL('enableFriendJoinedNotification.png'), dissableFriendJoinedNotificationUrl:chrome.extension.getURL('dissableFriendJoinedNotification.png')}}, "*");
	if(_friendsToNotifyMeWhenJoin)
	{
		window.postMessage({ type: 'friendsToNotifyMeWhenJoin', friendsToNotifyMeWhenJoin:_friendsToNotifyMeWhenJoin}, "*");
	}
	else{
	_friendsToNotifyMeWhenJoin = [];
	getFriendList(function(friends){
		for(var i in friends)
		{
			_friendsToNotifyMeWhenJoin.push(i);
		}
		window.postMessage({ type: 'friendsToNotifyMeWhenJoin', friendsToNotifyMeWhenJoin:_friendsToNotifyMeWhenJoin}, "*");
		saveFriendsToNotifyMeWhenJoin();
		console.log('done initialize');
	});
}

}